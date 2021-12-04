/**
 * Tracks replica staleness per "user".
 */
export class Timeline {
  private pos: bigint = BigInt(0);

  static deserialize(
    data: string | undefined,
    prevTimeline: Timeline | null
  ): Timeline {
    const pos = BigInt(data || 0);
    if (prevTimeline && prevTimeline.pos >= pos) {
      // The previous timeline holds a more recent WAL position than the one
      // we're deserializing, so we should respect it better.
      return prevTimeline;
    }

    const timeline = new this();
    timeline.setPos(pos);
    return timeline;
  }

  serialize(): string | undefined {
    return this.pos !== BigInt(0) ? this.pos.toString() : undefined;
  }

  setPos(pos: bigint) {
    this.pos = pos;
  }

  isCaughtUp(replicaPos: bigint): boolean {
    return replicaPos >= this.pos;
  }

  reset() {
    this.pos = BigInt(0);
  }
}
