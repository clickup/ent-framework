import { Readable } from "stream";
import chalk from "chalk";
import delay from "delay";
import compact from "lodash/compact";
import defaults from "lodash/defaults";
import first from "lodash/first";
import type { Client } from "../abstract/Client";
import type { Cluster } from "../abstract/Cluster";
import { OP_PING, OP_SHARD_NOS } from "../abstract/internal/misc";
import { QueryPing } from "../abstract/QueryPing";
import type { Shard } from "../abstract/Shard";
import { Timeline } from "../abstract/Timeline";
import { indent, nullthrows } from "../internal/misc";
import type { MaybeError, PickPartial } from "../internal/misc";
import { formatTimeWithMs } from "./internal/formatTimeWithMs";
import { highlightIf } from "./internal/highlightIf";

/**
 * Ping tool constructor options.
 */
export interface ToolPingOptions {
  cluster: Cluster<Client>;
  shard?: number;
  pingExecTimeMs?: number;
  pingPollMs?: number;
  pingIsWrite?: boolean;
}

/**
 * A tool which plays the role of Linux `ping` command, but for master() or
 * replica() Client of a Shard. Allows to verify that there is no downtime
 * happening when a PG node goes down or experiences a failover/switchover.
 */
export class ToolPing {
  /** Default values for the constructor options. */
  static readonly DEFAULT_OPTIONS: Required<PickPartial<ToolPingOptions>> = {
    shard: 0,
    pingExecTimeMs: 0,
    pingPollMs: 500,
    pingIsWrite: false,
  };

  /** Options of this tool. */
  readonly options: Required<ToolPingOptions>;

  /**
   * Initializes the instance.
   */
  constructor(options: ToolPingOptions) {
    this.options = defaults({}, options, ToolPing.DEFAULT_OPTIONS);
  }

  /**
   * Runs an endless loop that pings a master() or replica() Client of the
   * passed Island. Yields the colored output line by line.
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<string> {
    const cluster = this.options.cluster;
    const stream = new Readable({ objectMode: true, read() {} });

    const oldLoggers = { ...cluster.options.loggers };

    cluster.options.loggers.clientQueryLogger = ({
      annotations,
      op,
      elapsed,
      error,
      backend,
      role,
      connStats,
    }) => {
      const annotation = first(annotations);
      if (op === OP_PING || op === OP_SHARD_NOS) {
        stream.push(
          chalk[
            error
              ? op === OP_PING
                ? "yellowBright"
                : "yellow"
              : op === OP_PING
                ? "whiteBright"
                : "white"
          ](
            compact([
              `[${formatTimeWithMs(new Date(), true)}]`,
              "clientQueryLogger",
              op,
              `backend=${backend}`,
              highlightIf(
                `elapsed=${Math.round(elapsed.total).toString().padEnd(2)}`,
                "bgBlue",
                () => elapsed.total > 3000,
              ),
              `role=${role}`,
              `conn.id=${connStats.id}`,
              `conn.queriesSent=${connStats.queriesSent}`,
              ...(annotation
                ? [
                    highlightIf(
                      `attempt=${annotation.attempt}`,
                      "bgGrey",
                      () => annotation.attempt > 0,
                    ),
                    `whyClient=${annotation.whyClient}`,
                    `|| ${error ?? "ok"}`,
                  ]
                : [`|| ${error?.replace(/\s*\[\S+\]$/s, "") ?? "ok"}`]),
            ]).join(" "),
          ),
        );
      }
    };

    cluster.options.loggers.swallowedErrorLogger = (props) => {
      if (props.importance === "low") {
        return;
      }

      stream.push(
        chalk.gray(
          [
            `[${formatTimeWithMs(new Date(), true)}]`,
            "swallowedErrorLogger",
            highlightIf(
              `elapsed=${Math.round(props.elapsed ?? 0)
                .toString()
                .padEnd(2)}`,
              "bgBlue",
              () => (props.elapsed ?? 0) > 3000,
            ),
            `where="${props.where}"`,
            "||",
            (props.error as MaybeError)?.message?.replace(/\n.*/s, ""),
          ].join(" "),
        ),
      );
    };

    let stop = false;
    const promise = (async () => {
      let shard: Shard<Client> | undefined = undefined;
      try {
        const shards = [
          cluster.globalShard(),
          ...(await cluster.nonGlobalShards()),
        ];
        shard = nullthrows(
          shards.find((s) => s.no === this.options.shard),
          "No such Shard",
        );
      } catch (e: unknown) {
        stream.push(indent(chalk.redBright(`Shard selection threw ${e}`)));
        return;
      }

      while (!stop) {
        try {
          const startTime = performance.now();
          await shard!.run(
            new QueryPing({
              execTimeMs: this.options.pingExecTimeMs,
              isWrite: this.options.pingIsWrite,
            }),
            {
              trace: "ping-trace",
              vc: "ping-vc",
              debugStack: "",
              whyClient: undefined,
              attempt: 0,
            },
            new Timeline(),
            null,
          );
          const duration = Math.round(performance.now() - startTime);
          stream.push(
            indent(chalk.green(`ping() succeeded in ${duration} ms`)),
          );
        } catch (e: unknown) {
          stream.push(indent(chalk.redBright(`ping() threw ${e}`)));
        }

        await delay(this.options.pingPollMs);
      }
    })();

    try {
      for await (const item of stream) {
        yield item;
      }
    } finally {
      stop = true;
      await promise;
      Object.assign(cluster.options.loggers, oldLoggers);
    }
  }
}
