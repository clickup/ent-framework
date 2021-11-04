/**
 * Tracks replica staleness per "user".
 */
export class Session {
  private pos: bigint = BigInt(0);

  static deserialize(
    data: string | undefined,
    prevSession: Session | null
  ): Session {
    const pos = BigInt(data || 0);
    if (prevSession && prevSession.pos >= pos) {
      // The previous session holds a more recent wal position than the one
      // we're deserializing, so we should respect it better.
      return prevSession;
    }

    const session = new this();
    session.setPos(pos);
    return session;
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
