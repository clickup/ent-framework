import type { QueryAnnotation } from "./QueryAnnotation";

export interface Loggers {
  /** Logs actual queries to the database (e.g. raw SQL queries, after
   * batching). */
  clientQueryLogger?: (props: ClientQueryLoggerProps) => void;
  /** Logs errors which did not throw through (typically recoverable). */
  swallowedErrorLogger: (props: SwallowedErrorLoggerProps) => void;
}

export interface ClientQueryLoggerProps {
  annotations: QueryAnnotation[];
  connID: string;
  op: string;
  shard: string;
  table: string;
  batchFactor: number;
  msg: string;
  output: any;
  elapsed: number;
  error: string | undefined;
  isMaster: boolean;
  backend: string;
}

export interface SwallowedErrorLoggerProps {
  where: string;
  error: unknown;
  elapsed: number | null;
}
