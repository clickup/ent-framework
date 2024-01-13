const SEP = ":";

/**
 * The reason why the decision that this replica timeline is "good enough" has
 * been made.
 */
export type TimelineCaughtUpReason =
  | false
  | "replica-bc-master-state-unknown"
  | "replica-bc-caught-up"
  | "replica-bc-pos-expired";

/**
 * Even when pos is expired, we still continue to serialize it for some time for
 * better debugging. Having this gap allows the system trigger
 * "replica-bc-pos-expired" reason of a replica choice longer.
 */
const SERIALIZE_EXPIRATION_GAP_MS = 600 * 1000;

/**
 * Tracks replication lag timeline position at master per "user" and Ent.
 * - serialization format: "pos:expiresAt"
 * - wipes expired records (expiration is calculated at assignment moment)
 *
 * How replication lag (timeline) tracking works: for each
 * microshard+Ent+"user", we know the “last write-ahead log write position”
 * which that user (typically, VC#principal) made recently. This info can be
 * propagated through e.g. user's session and push notifications/subscriptions
 * channels automatically (“serialized timeline” and “timelines merging”). So
 * the next time the same user tries to read the data from the same Ent on the
 * same microshard, Ent Framework makes a choice, whether the replica is “good
 * enough” for this already; if not, it falls back to master read. I.e. the data
 * is not granular to individual Ent ID, it’s granular to the
 * user+Ent+microshard, and thus it is decoupled from IDs.
 */
export class Timeline {
  constructor(
    private state:
      | "unknown"
      | { readonly pos: bigint; readonly expiresAt: number } = "unknown",
  ) {}

  static deserialize(
    data: string | undefined,
    prevTimeline: Timeline | null,
  ): Timeline {
    const parts = data ? data.split(SEP) : [];
    const pos = BigInt(parts[0] || "0");

    if (
      prevTimeline &&
      prevTimeline.state !== "unknown" &&
      prevTimeline.state.pos >= pos
    ) {
      // The previous timeline holds a more recent WAL position than the one
      // we're deserializing, so we should respect it better.
      return prevTimeline;
    }

    return new this(
      pos ? { pos, expiresAt: parseInt(parts[1] || "0") } : "unknown",
    );
  }

  static cloneMap(
    timelines: ReadonlyMap<string, Timeline>,
  ): Map<string, Timeline> {
    const copy = new Map<string, Timeline>();
    for (const [key, timeline] of timelines.entries()) {
      if (timeline.state !== "unknown") {
        copy.set(key, new Timeline(timeline.state));
      }
    }

    return copy;
  }

  serialize(): string | undefined {
    return this.state === "unknown" ||
      Date.now() >= this.state.expiresAt + SERIALIZE_EXPIRATION_GAP_MS
      ? undefined
      : this.state.pos.toString() + SEP + this.state.expiresAt;
  }

  setPos(pos: bigint, maxLagMs: number): void {
    if (this.state !== "unknown" && this.state.pos >= pos) {
      // We already hold a "more recent" pos, so don't need to update it.
      return;
    }

    this.state = { pos, expiresAt: Date.now() + maxLagMs };
  }

  isCaughtUp(replicaPos: bigint): TimelineCaughtUpReason {
    return this.state === "unknown"
      ? "replica-bc-master-state-unknown"
      : replicaPos >= this.state.pos
        ? "replica-bc-caught-up"
        : Date.now() >= this.state.expiresAt
          ? "replica-bc-pos-expired"
          : false;
  }

  reset(): void {
    this.state = "unknown";
  }
}
