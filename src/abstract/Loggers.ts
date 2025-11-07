import type { DesperateAny } from "../internal/misc";
import type { Client, ClientRole } from "./Client";
import type { QueryAnnotation } from "./QueryAnnotation";

/**
 * Loggers are called at different stages of the query lifecycle. We do not use
 * EventEmitter for several reasons:
 * 1. It is not friendly to mocking in Jest.
 * 2. The built-in EventEmitter is not strongly typed.
 */
export interface Loggers<TNode = DesperateAny> {
  /** Logs actual queries to the database (after batching). */
  clientQueryLogger?: (props: ClientQueryLoggerProps) => void;
  /** Logs errors which did not throw through (typically recoverable). */
  swallowedErrorLogger: (props: SwallowedErrorLoggerProps) => void;
  /** Called when Island-from-Shard location fails (e.g. no such Shard), or when
   * a query on a particular Shard fails due to any reason (like transport
   * error). Mostly used in unit tests, since it's called for every retry. */
  runOnShardErrorLogger?: (props: RunOnShardErrorLoggerProps) => void;
  /** Called when a Client gets ended due to dynamic Islands reconfiguration.
   * Allows to debug flaky Island reconfiguration. */
  clientEndLogger?: (props: ClientEndLoggerProps<TNode>) => void;
}

export interface ClientQueryLoggerProps {
  annotations: QueryAnnotation[];
  op: string;
  shard: string;
  table: string;
  batchFactor: number;
  msg: string;
  output: unknown;
  elapsed: {
    total: number;
    acquire: number;
  };
  connStats: {
    /** The stats related to the used connection. */
    id: string;
    /** The number of queries sent to the connection. */
    queriesSent: number;
  };
  poolStats: {
    /** Total number of connections in the pool. */
    totalConns: number;
    /** Connections not busy running a query. */
    idleConns: number;
    /** Once all idle connections are over, requests are queued waiting for a
     * new available connection. This is the number of such queued requests. */
    queuedReqs: number;
  };
  error: string | undefined;
  role: ClientRole;
  backend: string;
  address: string;
}

export interface SwallowedErrorLoggerProps {
  where: string;
  error: unknown;
  elapsed: number | null;
  importance: "low" | "normal";
}

export interface RunOnShardErrorLoggerProps {
  error: unknown;
  attempt: number;
}

export interface ClientEndLoggerProps<TNode> {
  client: Client;
  key: string;
  node: TNode;
}
