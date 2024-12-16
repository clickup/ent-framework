/**
 * The upper bound of Date.now() is Number.MAX_SAFE_INTEGER which is 2^53 - 1,
 * so we have only 10 bits from BigInt (2^63 - 1) left to represent the random
 * part of the trace value.
 */
const RANDOM_BITS = 10;
const RANDOM_BITS_MASK = Math.pow(2, RANDOM_BITS) - 1;

/**
 * A "trace" objects which allows to group database related stuff while logging
 * it. Traces are inherited during VC derivation, similar to flavors, but
 * they're a part of VC core interface to allow faster access.
 */
export class VCTrace {
  readonly trace: string;

  constructor(trace?: string) {
    this.trace = trace ?? this.createRandomTrace();
  }

  /**
   * In case the trace was created by this tool, tries to extract the date of
   * its creation. As a sanity check, verifies that this date is not too far
   * away from the present time.
   */
  tryExtractCreationDate(): Date | null {
    try {
      const ts = BigInt(this.trace) >> BigInt(RANDOM_BITS);
      const minTs = Date.now() - 1000 * 3600 * 24 * 365;
      const maxTs = Date.now() + 1000 * 3600 * 24;
      return BigInt(minTs) < ts && ts < BigInt(maxTs)
        ? new Date(Number(ts))
        : null;
    } catch {
      return null;
    }
  }

  /**
   * Returns a stringified uint63 (0 - 9223372036854775807).
   */
  private createRandomTrace(): string {
    return (
      (BigInt(Date.now()) << BigInt(RANDOM_BITS)) |
      BigInt(Math.trunc(Math.random() * RANDOM_BITS_MASK) & RANDOM_BITS_MASK)
    ).toString();
  }
}
