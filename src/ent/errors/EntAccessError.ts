/**
 * A base class for errors which trigger the validation framework to process
 * them as a DENY/SKIP.
 */
export abstract class EntAccessError extends Error {
  abstract readonly entName: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name; // https://javascript.info/custom-errors#further-inheritance
  }
}
