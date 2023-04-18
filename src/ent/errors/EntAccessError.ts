/**
 * A base class for errors which trigger the validation framework to process
 * them as a DENY/SKIP.
 */
export class EntAccessError extends Error {
  constructor(public readonly entName: string, message: string) {
    super(message);
    this.name = this.constructor.name; // https://javascript.info/custom-errors#further-inheritance
  }
}
