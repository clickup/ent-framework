import { Memoize } from "fast-typescript-memoize";
import defaults from "lodash/defaults";
import type { MaybeCallable, PickPartial } from "../internal/misc";
import { objectId } from "../internal/objectId";
import type { Table } from "../types";
import { Batcher } from "./Batcher";
import type { ClientErrorKind, ClientErrorPostAction } from "./ClientError";
import type { Loggers, SwallowedErrorLoggerProps } from "./Loggers";
import type { QueryAnnotation } from "./QueryAnnotation";
import type { Runner } from "./Runner";
import type { Schema } from "./Schema";
import type { TimelineManager } from "./TimelineManager";

/**
 * Options for Client constructor.
 */
export interface ClientOptions {
  /** Name of the Client; used for logging. */
  name: string;
  /** Loggers to be called at different stages. */
  loggers?: Loggers | null;
  /** If passed, there will be an artificial queries accumulation delay while
   * batching the requests. Default is 0 (turned off). Passed to
   * Batcher#batchDelayMs. */
  batchDelayMs?: MaybeCallable<number>;
}

/**
 * Role of the Client as reported after the last successful query. If we know
 * for sure that the Client is a master or a replica, the role will be "master"
 * or "replica" correspondingly. If no queries were run by the Client yet (i.e.
 * we don't know the role for sure), the role is assigned to "unknown".
 */
export type ClientRole = "master" | "replica" | "unknown";

/**
 * An information about Client's connection related issue.
 */
export interface ClientConnectionIssue {
  timestamp: Date;
  cause: unknown;
  postAction: ClientErrorPostAction;
  kind: ClientErrorKind;
  comment: string;
}

/**
 * Input for Client#ping().
 */
export interface ClientPingInput {
  execTimeMs: number;
  isWrite: boolean;
  annotation: QueryAnnotation;
}

/**
 * Client is a Shard name aware abstraction which sends an actual query and
 * tracks the master/replica timeline. The concrete query sending implementation
 * (including required arguments) is up to the derived classes.
 */
export abstract class Client {
  /** Default values for the constructor options. */
  static readonly DEFAULT_OPTIONS: Required<PickPartial<ClientOptions>> = {
    loggers: null,
    batchDelayMs: 0,
  };

  /** Client configuration options. */
  readonly options: Required<ClientOptions>;

  /** Each Client may be bound to some Shard, so the queries executed via it
   * will be namespaced to this Shard. E.g. in relational databases, Shard name
   * may be a namespace (or schema) name (or "public" if the Client wasn't
   * created by withShard() method). */
  abstract readonly shardName: string;

  /** Tracks the master/replica replication timeline position. Shared across all
   * the Clients within the same Island. */
  abstract readonly timelineManager: TimelineManager;

  /**
   * Represents the full destination address this Client is working with.
   * Depending on the implementation, it may include hostname, port number,
   * database name, shard name etc. It is required that the address is stable
   * enough to be able to cache some destination database related metadata (e.g.
   * shardNos) based on that address.
   */
  abstract address(): string;

  /**
   * Gracefully closes the connections to let the caller destroy the Client. The
   * pending queries are awaited to finish before returning. The Client becomes
   * unusable after calling this method: you should not send queries to it.
   */
  abstract end(): Promise<void>;

  /**
   * Returns all Shard numbers discoverable via the connection to the Client's
   * database.
   */
  abstract shardNos(): Promise<readonly number[]>;

  /**
   * Sends a read or write test query to the server. Tells the server to sit and
   * wait for at least the provided number of milliseconds.
   */
  abstract ping(input: ClientPingInput): Promise<void>;

  /**
   * Extracts Shard number from an ID.
   */
  abstract shardNoByID(id: string): number;

  /**
   * Creates a new Client which is namespaced to the provided Shard number. The
   * new Client will share the same connection pool with the parent's Client.
   */
  abstract withShard(no: number): this;

  /**
   * Returns true if the Client is ended and can't be used anymore.
   */
  abstract isEnded(): boolean;

  /**
   * Returns the Client's role reported after the last successful query. Master
   * and replica roles may switch online unpredictably, without reconnecting, so
   * we only know the role after a query.
   */
  abstract role(): ClientRole;

  /**
   * Returns a non-nullable value if the Client couldn't connect to the server
   * (or it could, but the load balancer reported the remote server as not
   * working), so it should ideally be removed from the list of active replicas
   * until e.g. the next discovery query to it (or any query) succeeds.
   */
  abstract connectionIssue(): ClientConnectionIssue | null;

  /**
   * Calls swallowedErrorLogger() doing some preliminary amendment.
   */
  protected logSwallowedError(props: SwallowedErrorLoggerProps): void {
    this.options.loggers?.swallowedErrorLogger({
      ...props,
      where: `${this.constructor.name}(${this.options.name}): ${props.where}`,
    });
  }

  /**
   * Initializes an instance of Client.
   */
  constructor(options: ClientOptions) {
    this.options = defaults({}, options, Client.DEFAULT_OPTIONS);
  }

  /**
   * Batcher is per-Client per-query-type
   * per-table-name-and-shape-and-disableBatching:
   *
   * - Per-Client means that batchers are removed as soon as the Client is
   *   removed, i.e. the Client owns all the batchers for all tables.
   * - Per-query-type means that the batcher for a SELECT query is different
   *   from the batcher for an INSERT query (obviously).
   * - Per-table-name-and-shape-and-disableBatching means that each table has
   *   its own set of batchers (obviously). Also, some queries may be complex
   *   (like UPDATE), so the batcher also depends on the "shape" - the list of
   *   fields we're updating. Plus, for some inputs, we want to disable batching
   *   at all - that produces a separate Batcher instance.
   *
   * Also, for every Batcher, there is exactly one Runner (which knows how to
   * build the actual query in the context of the current Client). Batchers are
   * generic (like DataLoader, but more general), and Runners are very custom to
   * the query (and are private to these queries).
   *
   * All that means that in a 1000-Shard 20-table Cluster we'll eventually have
   * 1000x20x8 Batchers/Runners (assuming we have 8 different operations).
   */
  @Memoize(
    (QueryClass, schema, additionalShape, _, disableBatching) =>
      `${objectId(QueryClass)}:${schema.hash}:${additionalShape}:${disableBatching}`,
  )
  batcher<TInput, TOutput, TTable extends Table>(
    _QueryClass: Function,
    _schema: Schema<TTable>,
    _additionalShape: string,
    disableBatching: boolean,
    runnerCreator: () => Runner<TInput, TOutput>,
  ): Batcher<TInput, TOutput> {
    // At the moment, Runner doesn't depend on the Client. So theoretically we
    // could share the same Runner across multiple Batchers (and multiple
    // Clients) to save memory (and inject the Client via Runner.run*()
    // methods). But we don't do all that right now.
    const runner = runnerCreator();
    return new Batcher<TInput, TOutput>(
      runner,
      this.options.batchDelayMs,
      disableBatching,
    );
  }

  /**
   * A convenience method to put connections prewarming logic to. The idea is to
   * keep the needed number of open connections and also, in each connection,
   * minimize the time which the very 1st query will take (e.g. pre-cache
   * full-text dictionaries).
   */
  prewarm(): void {}
}
