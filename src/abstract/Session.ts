/**
 * Tracks replica staleness per "user".
 */
export class Session {
  private pos: bigint = BigInt(0);

  static deserialize(data?: string): Session {
    const session = new this();
    session.setPos(BigInt(data ?? 0));
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
