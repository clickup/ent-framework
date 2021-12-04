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

// Even when pos is expired, we still continue to serialize it for some time for
// better debugging. Having this gap allows the system trigger
// "replica-bc-pos-expired" reason of a replica choice longer.
const SERIALIZE_EXPIRATION_GAP_MS = 600 * 1000;

/**
 * Tracks replication timeline position at master per "user" and Ent.
 * - serialization format: "pos:expiresAt"
 * - wipes expired records (expiration is calculated at assignment moment)
 */
export class Timeline {
  constructor(
    private state: "unknown" | { pos: bigint; expiresAt: number } = "unknown"
  ) {}

  static deserialize(
    data: string | undefined,
    prevTimeline: Timeline | null
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
      pos ? { pos, expiresAt: parseInt(parts[1] || "0") } : "unknown"
    );
  }

  serialize(): string | undefined {
    return this.state === "unknown" ||
      Date.now() >= this.state.expiresAt + SERIALIZE_EXPIRATION_GAP_MS
      ? undefined
      : this.state.pos.toString() + SEP + this.state.expiresAt;
  }

  setPos(pos: bigint, maxLagMs: number) {
    if (this.state !== "unknown" && this.state.pos >= pos) {
      // We already hold a "more recent" pos, so don't need to update it.
      return;
    }

    this.state = { pos, expiresAt: Date.now() + maxLagMs };
  }

  isCaughtUp(replicaPos: bigint): TimelineCaughtUpReason {
    return this.state === "unknown"
      ? "replica-bc-master-state-unknown" // don't know anything about master; assume the replica is caught up
      : replicaPos >= this.state.pos
      ? "replica-bc-caught-up"
      : Date.now() >= this.state.expiresAt
      ? "replica-bc-pos-expired"
      : false;
  }

  reset() {
    this.state = "unknown";
  }
}
