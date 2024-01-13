/**
 * See PgClient#withShard() for reasons of having this class.
 */
export class Ref<T> {
  constructor(public current: T) {}
}
