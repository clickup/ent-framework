import type {
  ClientErrorKind,
  ClientErrorPostAction,
} from "../../abstract/ClientError";

/**
 * Some errors affect the logic of choosing another Client when a query retry is
 * requested (controlled via ClientError). Mostly, those are the situation when
 * a PG node goes down.
 *
 * Notice that, if a master goes down, we always need to find another master
 * (and retry hard hoping is a switchover, and it will appear on another node).
 */
export const CLIENT_ERROR_PREDICATES: Array<
  (error: { code: string; message: string }) =>
    | false
    | {
        abbreviation: string;
        postAction: {
          ifMaster: ClientErrorPostAction;
          ifReplica: ClientErrorPostAction;
          reportConnectionIssue: boolean;
        };
        kind: ClientErrorKind;
        comment: string;
      }
> = [
  ({ code }) =>
    code === "42P01" && {
      abbreviation: "undefined_table",
      postAction: {
        ifMaster: "rediscover-cluster",
        ifReplica: "rediscover-cluster",
        reportConnectionIssue: false,
      },
      kind: "data-on-server-is-unchanged",
      comment:
        "For single-queries: table doesn't exist or disappeared (e.g. the Shard was relocated to another Island).",
    },
  ({ code }) =>
    code === "42704" && {
      abbreviation: "undefined_object",
      postAction: {
        ifMaster: "rediscover-cluster",
        ifReplica: "rediscover-cluster",
        reportConnectionIssue: false,
      },
      kind: "data-on-server-is-unchanged",
      comment:
        "For batched queries: table doesn't exist or disappeared (e.g. the Shard was relocated to another Island).",
    },
  ({ code }) =>
    code === "25006" && {
      abbreviation: "read_only_sql_transaction",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "rediscover-island",
        reportConnectionIssue: false,
      },
      kind: "data-on-server-is-unchanged",
      comment:
        "A write happened in a read-only Client (probably the Client's role was changed from master to replica due to a failover/switchover).",
    },
  ({ code }) =>
    code === "57P01" && {
      abbreviation: "admin_shutdown",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "choose-another-client",
        reportConnectionIssue: true,
      },
      kind: "data-on-server-is-unchanged",
      comment: "The database is shutting down by an administrator.",
    },
  ({ code }) =>
    code === "57P02" && {
      abbreviation: "crash_shutdown",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "choose-another-client",
        reportConnectionIssue: true,
      },
      kind: "data-on-server-is-unchanged",
      comment: "The database is crashed and is shutting down.",
    },
  ({ message }) =>
    message === "Connection terminated unexpectedly" && {
      abbreviation: "connection_terminated",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "choose-another-client",
        reportConnectionIssue: true,
      },
      kind: "unknown-server-state", // !!!
      comment:
        "Node-postgres connection terminated unexpectedly (from client.js).",
    },
  ({ code }) =>
    code === "ECONNREFUSED" && {
      abbreviation: "ECONNREFUSED",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "choose-another-client",
        reportConnectionIssue: true,
      },
      kind: "data-on-server-is-unchanged",
      comment: "Node TCP library connect error.",
    },
  ({ code, message }) =>
    code === "08P01" && // protocol_violation
    message.includes("server conn crashed") && {
      abbreviation: "server_conn_crashed",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "choose-another-client",
        reportConnectionIssue: true,
      },
      kind: "unknown-server-state",
      comment: "PG is terminated cruelly (e.g. by SIGKILL or SIGSEGV).",
    },
  ({ code, message }) =>
    code === "08P01" && // protocol_violation
    message === "query_wait_timeout" && {
      abbreviation: "query_wait_timeout",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "choose-another-client",
        reportConnectionIssue: true,
      },
      kind: "data-on-server-is-unchanged",
      comment:
        "PG went down a few seconds ago, but a PgBouncer connection is still open, so the query sent to it times out waiting. After some time, PgBouncer will stop emitting this error and start emitting server_login_retry on new connections instead.",
    },
  ({ code, message }) =>
    code === "08P01" && // protocol_violation
    message.includes("server_login_retry") && {
      abbreviation: "server_login_retry",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "choose-another-client",
        reportConnectionIssue: true,
      },
      kind: "data-on-server-is-unchanged",
      comment:
        "PG has been down for quite some, so PgBouncer emits this error on each new connection immediately. Or, PG server has just been shut down, and PgBouncer's server pool is empty (fast-fail use case).",
    },
  ({ code, message }) =>
    code === "08P01" && // protocol_violation
    message === "pgbouncer cannot connect to server" && {
      abbreviation: "cannot_connect_to_server",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "choose-another-client",
        reportConnectionIssue: true,
      },
      kind: "data-on-server-is-unchanged",
      comment:
        "Older PgBouncer versions emit this error instead of server_login_retry.",
    },
  ({ code }) =>
    code === "08P01" && {
      // protocol_violation
      abbreviation: "protocol_violation_catch_all",
      postAction: {
        ifMaster: "rediscover-island",
        ifReplica: "choose-another-client",
        reportConnectionIssue: true,
      },
      kind: "data-on-server-is-unchanged",
      comment:
        'Sometimes PgBouncer emit unrelated error codes when PG server crashes (e.g. "invalid server parameter").',
    },
];
