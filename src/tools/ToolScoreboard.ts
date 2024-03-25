import chalk from "chalk";
import delay from "delay";
import compact from "lodash/compact";
import defaults from "lodash/defaults";
import first from "lodash/first";
import range from "lodash/range";
import sortBy from "lodash/sortBy";
import takeWhile from "lodash/takeWhile";
import uniqBy from "lodash/uniqBy";
import pDefer from "p-defer";
import { table } from "table";
import type { ClientPingInput } from "../abstract/Client";
import { Client } from "../abstract/Client";
import type { Cluster } from "../abstract/Cluster";
import { OP_SHARD_NOS } from "../abstract/internal/misc";
import type { ClientQueryLoggerProps } from "../abstract/Loggers";
import { QueryPing } from "../abstract/QueryPing";
import { MASTER, STALE_REPLICA } from "../abstract/Shard";
import { Timeline } from "../abstract/Timeline";
import { DefaultMap } from "../internal/DefaultMap";
import {
  firstLine,
  indent,
  join,
  mapJoin,
  nullthrows,
  runInVoid,
} from "../internal/misc";
import type { MaybeError, PickPartial } from "../internal/misc";
import { formatTimeWithMs } from "./internal/formatTimeWithMs";

/**
 * Scoreboard tool constructor options.
 */
export interface ToolScoreboardOptions {
  cluster: Cluster<Client>;
  refreshMs?: number;
  pingExecTimeMs?: number;
  pingParallelism?: number;
  pingPollMs?: number;
  tickMs?: number;
  maxQueries?: number;
  maxErrors?: number;
}

type ClientIdent = number | "master" | "replica";

interface ToolScoreboardQuery {
  timestamp: number;
  elapsed: number | null;
  op: "tick" | "discovery" | "query";
  error: string | null;
}

interface ToolScoreboardSwallowedError {
  timestamp: number;
  elapsed: number | null;
  message: string;
}

interface ToolScoreboardQueryError {
  timestamp: number;
  elapsed: number | null;
  message: string;
  clientIdent: ClientIdent;
}

const ROTATING_CHARS = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
const FACES = ["▲", "⏺", "◼"];

/**
 * A tool which plays the role of Linux `top` command, but for the Cluster.
 * Tracks the state of the Cluster and Clients health.
 */
export class ToolScoreboard {
  /** Default values for the constructor options. */
  static readonly DEFAULT_OPTIONS: Required<
    PickPartial<ToolScoreboardOptions>
  > = {
    refreshMs: 100,
    pingExecTimeMs: 0,
    pingParallelism: 1,
    pingPollMs: 200,
    tickMs: 0,
    maxQueries: 30,
    maxErrors: 6,
  };

  private launchedPollers: Set<string> = new Set();
  private renderCallCount = 0;
  private queryPollDefers: Array<pDefer.DeferredPromise<void>> = [];

  /** Options of this tool. */
  readonly options: Required<ToolScoreboardOptions>;

  /** Registry of all Islands with Clients. */
  islands: Map<
    number,
    {
      shards: number;
      clients: Map<ClientIdent, Client>;
    }
  > = new Map();

  /** Log of queries sent (ping, discovery, tick). */
  queries = new DefaultMap<
    number,
    DefaultMap<ClientIdent, ToolScoreboardQuery[]>
  >();

  /** Pool stats of Clients. */
  poolStats = new DefaultMap<
    number,
    Map<ClientIdent, ClientQueryLoggerProps["poolStats"]>
  >();

  /** Registry of the recent swallowed errors (pings-independent). */
  swallowedErrors: ToolScoreboardSwallowedError[] = [];

  /** Errors extracted from the queries log. */
  queryErrors: ToolScoreboardQueryError[] = [];

  /**
   * Initializes the instance.
   */
  constructor(options: ToolScoreboardOptions) {
    this.options = defaults({}, options, ToolScoreboard.DEFAULT_OPTIONS);
  }

  /**
   * Runs an endless loop that updates the Scoreboard with the current state of
   * the Cluster and yields back on every refreshMs tick.
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<this> {
    const cluster = this.options.cluster;

    const oldLoggers = { ...cluster.options.loggers };

    cluster.options.loggers.clientQueryLogger = (props) => {
      for (const { islandNo, clientIdent } of this.findClients(props.address)) {
        this.poolStats
          .getOrAdd(islandNo, Map)
          .set(clientIdent, props.poolStats);
        if (props.op === OP_SHARD_NOS) {
          this.addQuery(islandNo, clientIdent, {
            timestamp: Date.now(),
            elapsed: props.elapsed.total,
            op: "discovery",
            error: props.error ? `clientQueryLogger: ${props.error}` : null,
          });
        }
      }
    };

    cluster.options.loggers.swallowedErrorLogger = ({ error, elapsed }) =>
      this.addSwallowedError({
        timestamp: Date.now(),
        elapsed,
        message: `swallowedErrorLogger: ${error}`,
      });

    const tickInterval = this.options.tickMs
      ? setInterval(() => {
          for (const [islandNo, { clients }] of this.islands) {
            for (const clientIdent of clients.keys()) {
              this.addQuery(islandNo, clientIdent, {
                timestamp: Date.now(),
                elapsed: null,
                op: "tick",
                error: null,
              });
            }
          }
        }, this.options.tickMs)
      : undefined;

    const queryPollTimeouts: NodeJS.Timeout[] = [];
    for (const i of range(this.options.pingParallelism)) {
      this.queryPollDefers[i] = pDefer();
      queryPollTimeouts.push(
        setTimeout(
          () =>
            queryPollTimeouts.push(
              setInterval(() => {
                nullthrows(this.queryPollDefers.at(i)).resolve();
                this.queryPollDefers[i] = pDefer();
              }, this.options.pingPollMs),
            ),
          i * (this.options.pingPollMs / this.options.pingParallelism),
        ),
      );
    }

    try {
      while (true) {
        this.islands = new Map(
          await mapJoin(cluster.islands(), async (island) => {
            const res = await join({
              islandNo: island.no,
              shards: island.shards().length,
              clients: join([
                island.clients,
                island.master(),
                island.replica(),
              ] as const).then(
                ([clients, master, replica]) =>
                  new Map<ClientIdent, Client>([
                    ["master", master],
                    ["replica", replica],
                    ...clients.entries(),
                  ]),
              ),
            });
            for (const clientIdent of res.clients.keys()) {
              for (const i of range(this.options.pingParallelism)) {
                const key = `${island.no}:${clientIdent}:${i}`;
                if (!this.launchedPollers.has(key)) {
                  this.launchedPollers.add(key);
                  runInVoid(
                    this.pollerLoop(island.no, clientIdent, i).finally(() =>
                      this.launchedPollers.delete(key),
                    ),
                  );
                }
              }
            }

            return [island.no, res];
          }),
        );

        for (const [islandNo, statsByClientIdent] of this.poolStats.entries()) {
          for (const clientIdent of statsByClientIdent.keys()) {
            if (!this.islands.get(islandNo)?.clients.has(clientIdent)) {
              statsByClientIdent.delete(clientIdent);
            }
          }

          if (statsByClientIdent.size === 0) {
            this.poolStats.delete(islandNo);
          }
        }

        this.swallowedErrors = this.swallowedErrors.filter(
          (e) =>
            e.timestamp >
            Date.now() - this.options.pingPollMs * this.options.maxQueries,
        );

        this.queryErrors = [];

        for (const [islandNo, queriesByClientIdent] of this.queries.entries()) {
          for (const [clientIdent, queries] of queriesByClientIdent.entries()) {
            if (this.islands.get(islandNo)?.clients.has(clientIdent)) {
              for (const { timestamp, elapsed, error } of queries) {
                if (error) {
                  this.queryErrors.push({
                    timestamp,
                    elapsed,
                    message: error,
                    clientIdent,
                  });
                }
              }
            } else {
              queriesByClientIdent.delete(clientIdent);
            }
          }

          if (queriesByClientIdent.size === 0) {
            this.queries.delete(islandNo);
          }
        }

        this.queryErrors = uniqBy(
          sortBy(
            this.queryErrors,
            ({ clientIdent }) => (typeof clientIdent === "string" ? 0 : 1),
            ({ message }) => message,
          ),
          ({ message, clientIdent }) => message + clientIdent,
        ).slice(0, this.options.maxErrors);

        yield this;

        await delay(this.options.refreshMs);
      }
    } finally {
      this.queryPollDefers.forEach((defer) => defer.resolve());
      this.islands.clear();
      this.queries.clear();
      this.swallowedErrors = [];
      this.queryErrors = [];
      Object.assign(cluster.options.loggers, oldLoggers);
      queryPollTimeouts.forEach((interval) => clearTimeout(interval));
      clearInterval(tickInterval);
    }
  }

  /**
   * Renders the current state of the Scoreboard as a string.
   */
  render(): string {
    this.renderCallCount++;
    const queriesWidth = this.options.maxQueries * 2;

    const rows: string[][] = [];
    rows.push([
      "Island",
      "#",
      "Client",
      "Role",
      "Pool Conns",
      `Queries (ms or ${FACES[0]} - pings; D - discovery; red - error)`,
      "Health",
    ]);
    for (const [islandNo, { clients }] of this.islands) {
      let i = 0;
      for (const [clientIdent, client] of clients.entries()) {
        let curQueriesWidth = 0;
        const primaryColor = typeof clientIdent !== "string" ? "gray" : "white";
        const connectionIssue = client.connectionIssue();
        const queries = this.queries.get(islandNo)?.get(clientIdent) ?? [];
        const poolStats = this.poolStats.get(islandNo)?.get(clientIdent);
        rows.push([
          // Island
          i === 0 ? `${islandNo}` : "",
          // #
          chalk[primaryColor](
            typeof clientIdent !== "string"
              ? `#${clientIdent}`
              : `${clientIdent}()`,
          ),
          // Client
          chalk[primaryColor](client.options.name),
          // Role
          chalk[primaryColor](client.role()),
          // Pool Conns
          typeof clientIdent !== "string" && poolStats
            ? chalk[primaryColor](
                `${poolStats.totalConns} (${poolStats.totalConns - poolStats.idleConns} busy)`.padEnd(
                  13,
                  " ",
                ),
              )
            : "",
          // Queries
          takeWhile(
            compact(
              queries.map((query) => this.renderQuery(clientIdent, query)),
            ),
            ([str]) => {
              if (curQueriesWidth + str.length < queriesWidth) {
                curQueriesWidth += str.length + 1;
                return true;
              } else {
                return false;
              }
            },
          )
            .map(([str, color]) => chalk[color](str))
            .join(" ") + " ".repeat(queriesWidth - curQueriesWidth),
          // Health
          connectionIssue
            ? chalk[clientIdentErrorColor(clientIdent)](
                "UNHEALTHY: " +
                  firstLine((connectionIssue.cause as MaybeError)?.message),
              )
            : chalk.green("healthy") +
              (clientIdent === "replica" && client.role() === "master"
                ? " (but fallback to master)"
                : ""),
        ]);
        i++;
      }
    }

    const lines: string[] = [];

    lines.push(`[${formatTimeWithMs(new Date())}]`);

    lines.push(
      table(rows, {
        drawHorizontalLine: (i, rowCount) =>
          i === 0 || i === 1 || i === rowCount,
        spanningCells: [],
      }),
    );

    lines.push(
      ...[
        ...this.queryErrors,
        ...this.swallowedErrors.map((e) => ({ ...e, clientIdent: null })),
      ].map(({ timestamp, message, clientIdent }) =>
        chalk[clientIdentErrorColor(clientIdent)](
          indent(
            "- " +
              (clientIdent === null
                ? ""
                : typeof clientIdent !== "string"
                  ? `[pinging client ${clientIdent}] `
                  : `[pinging ${clientIdent}()] `) +
              firstLine(message) +
              ` [${formatTimeWithMs(new Date(timestamp))}] `,
          ).substring(2),
        ),
      ),
    );

    return lines.join("\n");
  }

  /**
   * Renders a colorful cell corresponding to one query.
   */
  private renderQuery(
    clientIdent: ClientIdent,
    { timestamp, elapsed, op, error }: ToolScoreboardQuery,
  ): [string, typeof chalk.Color] | null {
    const lag = Math.round(Date.now() - timestamp);
    const rot = ROTATING_CHARS[this.renderCallCount % ROTATING_CHARS.length];
    return op === "tick"
      ? [".", "gray"]
      : op === "discovery"
        ? ["D", error ? clientIdentErrorColor(null) : "white"]
        : elapsed === null && lag < this.options.pingExecTimeMs
          ? null
          : elapsed === null && lag > this.options.pingExecTimeMs + 500
            ? [
                rot + this.renderElapsed(lag) + rot,
                error ? clientIdentErrorColor(clientIdent) : "magentaBright",
              ]
            : [
                this.renderElapsed(elapsed ?? lag),
                error ? clientIdentErrorColor(clientIdent) : "green",
              ];
  }

  /**
   * Renders the text value of a cell corresponding to a query.
   */
  private renderElapsed(elapsed: number): string {
    return elapsed > 1000
      ? `${Math.trunc(elapsed / 1000)}s`
      : elapsed >= 10 * (FACES.length + 1)
        ? Math.trunc(elapsed).toString()
        : elapsed < 10
          ? Math.trunc(elapsed).toString()
          : FACES[Math.min(Math.trunc(elapsed / 10), FACES.length) - 1];
  }

  /**
   * Runs an endless polling loop for the provided Client. The loop terminates
   * if the Client disappears from the cluster.
   */
  private async pollerLoop(
    islandNo: number,
    clientIdent: ClientIdent,
    i: number,
  ): Promise<void> {
    const cluster = this.options.cluster;

    while (true) {
      const island = this.islands.get(islandNo);
      if (!island) {
        return;
      }

      const client =
        typeof clientIdent !== "string"
          ? island.clients.get(clientIdent)
          : clientIdent === "master"
            ? MASTER
            : STALE_REPLICA;
      if (!client) {
        return;
      }

      // Sync pings in all pollerLoop() loops among each other.
      await nullthrows(this.queryPollDefers.at(i)).promise;

      const timestamp = Date.now();
      const query = this.addQuery(islandNo, clientIdent, {
        timestamp,
        elapsed: null,
        op: "query",
        error: null,
      });
      const input: ClientPingInput = {
        execTimeMs: this.options.pingExecTimeMs,
        isWrite: clientIdent === "master",
        annotation: {
          trace: "scoreboard-trace",
          vc: "scoreboard-vc",
          debugStack: "",
          whyClient: undefined,
          attempt: 0,
        },
      };

      let error: string | null = null;
      try {
        if (client instanceof Client) {
          await client.ping(input);
        } else {
          const island = await cluster.island(islandNo);
          const shard = first(island.shards());
          if (!shard) {
            throw Error(
              "No Shards on this Island, or Shards discovery never succeeded.",
            );
          }

          // For master() and replica(), we run queries through Shard, to
          // benefit from its zero-downtime retries logic.
          await shard.run(
            new QueryPing(input),
            input.annotation,
            new Timeline(),
            client,
          );
        }
      } catch (e: unknown) {
        error = "thrown: " + e;
      } finally {
        query.elapsed = Date.now() - timestamp;
        query.error = error;
      }
    }
  }

  /**
   * Adds a query (probably running right now) to the Scoreboard.
   */
  private addQuery(
    islandNo: number,
    clientIdent: ClientIdent,
    query: ToolScoreboardQuery,
  ): ToolScoreboardQuery {
    const slot = this.queries
      .getOrAdd(islandNo, DefaultMap)
      .getOrAdd(clientIdent, Array);
    slot.unshift(query);
    slot.splice(this.options.maxQueries);
    return query;
  }

  /**
   * Adds an error to the Scoreboard.
   */
  private addSwallowedError(error: ToolScoreboardSwallowedError): void {
    this.swallowedErrors = [
      error,
      ...this.swallowedErrors.filter((e) => e.message !== error.message),
    ];
    this.swallowedErrors.splice(this.options.maxErrors);
  }

  /**
   * Finds all existing Client by matching their addresses to the passed one.
   */
  private *findClients(
    address: string,
  ): Generator<{ islandNo: number; clientIdent: ClientIdent; client: Client }> {
    for (const [islandNo, { clients }] of this.islands) {
      for (const [clientIdent, client] of clients.entries()) {
        if (client.address() === address) {
          yield { islandNo, clientIdent, client };
        }
      }
    }
  }
}

function clientIdentErrorColor(
  clientIdent: ClientIdent | null,
): typeof chalk.Color {
  return clientIdent === null
    ? "cyan"
    : typeof clientIdent !== "string"
      ? "yellow"
      : "red";
}
