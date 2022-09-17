/**
 * Thrown by the engine when an error is related to sharding.
 */
export default class ShardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name; // https://javascript.info/custom-errors#further-inheritance
  }
}
