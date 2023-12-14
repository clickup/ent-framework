import { Memoize } from "fast-typescript-memoize";
import defaults from "lodash/defaults";
import type { MaybeCallable } from "../helpers/misc";
import type { Runner } from "./Batcher";
import { Batcher } from "./Batcher";
import type { Loggers } from "./Loggers";
import type { Schema } from "./Schema";
import type { TimelineManager } from "./TimelineManager";

/**
 * Options for Client constructor.
 */
export interface ClientOptions {
  /** Name of the Client; used for logging. */
  name: string;
  /** Loggers to be called at different stages. */
  loggers: Loggers;
  /** If passed, there will be an artificial queries accumulation delay while
   * batching the requests. Default is 0 (turned off). Passed to
   * Batcher#batchDelayMs. */
  batchDelayMs?: MaybeCallable<number>;
}

/**
 * Client is a Shard name aware abstraction which sends an actual query and
 * tracks the master/replica timeline. The concrete query sending implementation
 * (including required arguments) is up to the derived classes.
 */
export abstract class Client {
  /** Client configuration options. */
  readonly options: Required<ClientOptions>;

  /** Each Client may be bound to some Shard, so the queries executed via it
   * will be namespaced to this Shard. E.g. in PostgreSQL, Shard name is schema
   * name (or "public" if the Client wasn't created by withShard() method). */
  abstract readonly shardName: string;

  /** Tracks the master/replica replication timeline position. Shared across all
   * the Clients within the same Island. */
  abstract readonly timelineManager: TimelineManager;

  /**
   * Closes the connections to let the caller destroy the Client. By default,
   * the pending queries are awaited to finish before returning, but if you pass
   * forceDisconnect, all of the connections will be closed immediately.
   */
  abstract end(forceDisconnect?: boolean): Promise<void>;

  /**
   * Returns all Shard numbers discoverable via the connection to the Client's
   * database.
   */
  abstract shardNos(): Promise<readonly number[]>;

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
   * Returns true if, after the last query, the Client reported being a master
   * node. Master and replica roles may switch online unpredictably, without
   * reconnecting, so we only know the role after a query.
   */
  abstract isMaster(): boolean;

  /**
   * Initializes an instance of Client.
   */
  constructor(options: ClientOptions) {
    this.options = defaults({}, options, {
      batchDelayMs: 0,
    });
  }

  /**
   * Batcher is per-Client per-query-type per-table-name-and-shape:
   * - Per-Client means that batchers are removed as soon as the Client is
   *   removed, i.e. the Client owns all the batchers for all tables.
   * - Per-query-type means that the batcher for a SELECT query is different
   *   from the batcher for an INSERT query (obviously).
   * - Per-table-name-and-shape means that each table has its own set of
   *   batchers (obviously). Also, some queries may be complex (like UPDATE), so
   *   the batcher also depends on the "shape" - the list of fields we're
   *   updating.
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
    (QueryClass: Function, schema: Schema<any, any>, additionalShape: string) =>
      QueryClass.name + ":" + schema.hash + ":" + additionalShape
  )
  batcher<TInput, TOutput>(
    _QueryClass: Function,
    _schema: Schema<any, any>,
    _additionalShape: string,
    runnerCreator: () => Runner<TInput, TOutput>
  ): Batcher<TInput, TOutput> {
    // At the moment, Runner doesn't depend on the Client. So theoretically we
    // could share the same Runner across multiple Batchers (and multiple
    // Clients) to save memory (and inject the Client via Runner.run*()
    // methods). But we don't do all that right now.
    const runner = runnerCreator();
    return new Batcher<TInput, TOutput>(
      runner,
      runner.maxBatchSize,
      this.options.batchDelayMs
    );
  }

  /**
   * Calls swallowedErrorLogger() doing some preliminary amendment.
   */
  logSwallowedError(
    where: string,
    error: unknown,
    elapsed: number | null
  ): void {
    this.options.loggers.swallowedErrorLogger({
      where: `${this.constructor.name}(${this.options.name}): ${where}`,
      error,
      elapsed,
    });
  }

  /**
   * A convenience method to put connections prewarming logic to. The idea is to
   * keep the needed number of open connections and also, in each connection,
   * minimize the time which the very 1st query will take (e.g. pre-cache
   * full-text dictionaries).
   */
  prewarm(): void {}
}
