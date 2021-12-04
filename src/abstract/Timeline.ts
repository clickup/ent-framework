const SEP = ":";

/**
 * Tracks replication timeline position at master per "user" and Ent.
 * - serialization format: "pos:expiresAt"
 * - wipes expired records (expiration is calculated at assignment moment)
 */
export class Timeline {
  constructor(
    private state: "unknown" | { pos: BigInt; expiresAt: number } = "unknown"
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
    return this.state === "unknown" || Date.now() >= this.state.expiresAt
      ? undefined
      : this.state.pos.toString() + SEP + this.state.expiresAt;
  }

  setPos(pos: bigint, maxLagMs: number) {
    this.state = { pos, expiresAt: Date.now() + maxLagMs };
  }

  isCaughtUp(replicaPos: bigint): false | "unknown" | "caught-up" | "expired" {
    return this.state === "unknown"
      ? "unknown" // don't know anything about master; assume the replica is caught up
      : replicaPos >= this.state.pos
      ? "caught-up"
      : Date.now() >= this.state.expiresAt
      ? "expired"
      : false;
  }

  reset() {
    this.state = "unknown";
  }
}
