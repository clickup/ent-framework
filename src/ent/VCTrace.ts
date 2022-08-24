import { randomBytes } from "crypto";
/**
 * A "trace" objects which allows to group database related stuff while logging
 * it. Traces are inherited during VC derivation.
 */
export class VCTrace {
  readonly trace: string;

  constructor(
    /** stringified uint64 (0 - 18446744073709551615) */
    readonly rawTrace?: string,
    readonly prefix = ""
  ) {
    // rawTrace will be missing if DD is logging disabled or there is no "root" span.
    // We don't need to fake it if it is not provided.
    this.trace =
      (prefix ? prefix + "-" : "") + this.rawTrace || createRandomRawTrace();
  }
}

function createRandomRawTrace() {
  const buf = randomBytes(8);
  return (
    BigInt(buf.readUInt32BE(0)) +
    (BigInt(buf.readUInt32BE(4)) << BigInt(32))
  ).toString();
}
