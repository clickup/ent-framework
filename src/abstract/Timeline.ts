const SEP = ":";

/**
 * Tracks replication timeline position (replica staleness) per "user" and Ent.
 * - serialization format: "pos:expiresAt"
 * - wipes expired records (expiration is calculated at assignment moment)
 */
export class Timeline {
  private pos: bigint = BigInt(0);
  private expiresAt: number = 0;

  static deserialize(
    data: string | undefined,
    prevTimeline: Timeline | null
  ): Timeline {
    const parts = data ? data.split(SEP) : ["0", "0"];
    const pos = BigInt(parts[0]);

    if (prevTimeline && prevTimeline.pos >= pos) {
      // The previous timeline holds a more recent WAL position than the one
      // we're deserializing, so we should respect it better.
      return prevTimeline;
    }

    const timeline = new this();
    timeline.pos = pos;
    timeline.expiresAt = parseInt(parts[1] || Date.now().toString());
    return timeline;
  }

  serialize(): string | undefined {
    return this.pos === BigInt(0) || Date.now() >= this.expiresAt
      ? undefined
      : this.pos.toString() + SEP + this.expiresAt;
  }

  setPos(pos: bigint, maxLagMs: number) {
    this.pos = pos;
    this.expiresAt = Date.now() + maxLagMs;
  }

  isCaughtUp(replicaPos: bigint): boolean | "expired" {
    return replicaPos >= this.pos
      ? true
      : Date.now() >= this.expiresAt
      ? "expired"
      : false;
  }

  reset() {
    this.pos = BigInt(0);
    this.expiresAt = 0;
  }
}
