import uniqid from "uniqid";

/**
 * A "trace" objects which allows to group database related stuff while logging
 * it. Traces are inherited during VC derivation.
 */
export class VCTrace {
  readonly trace: string;

  constructor(readonly prefix = "") {
    this.trace = (prefix ? prefix + "-" : "") + uniqid();
  }
}
