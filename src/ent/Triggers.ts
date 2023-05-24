import type { Flatten } from "../helpers/misc";
import { join } from "../helpers/misc";
import type {
  InsertInput,
  Row,
  RowWithID,
  Table,
  UpdateInput,
  Value,
} from "../types";
import type { VC } from "./VC";

/**
 * Table -> trigger's before- and after-insert input. Below, we use InsertInput
 * and not Row, because before and even after some INSERT, we may still not know
 * some values of the row (they can be filled by the DB in e.g. autoInsert
 * clause). InsertInput is almost a subset of Row, but it has stricter symbol
 * keys: e.g. if some symbol key is non-optional in INSERT (aka doesn't have
 * autoInsert), it will always be required in InsertInput too.
 */
export type TriggerInsertInput<TTable extends Table> = Flatten<
  InsertInput<TTable> & RowWithID
>;

/**
 * Table -> trigger's before- and after-update NEW row.
 */
export type TriggerUpdateNewRow<TTable extends Table> = Flatten<
  Readonly<
    Row<TTable> & {
      [K in keyof TTable & symbol]?: Value<TTable[K]> | undefined;
    }
  >
>;

/**
 * Table -> trigger's before- and after-update (or delete) OLD row.
 */
export type TriggerUpdateOrDeleteOldRow<TTable extends Table> = Flatten<
  Readonly<Row<TTable>>
>;

/**
 * Table -> trigger's after-mutation row. We don't know if it's called after
 * INSERT, UPDATE or DELETE, so use the most narrow list of fields.
 */
export type TriggerAfterMutationNewOrOldRow<TTable extends Table> =
  | Readonly<TriggerInsertInput<TTable>> // on insert
  | TriggerUpdateNewRow<TTable>; // on update or delete

/**
 * Triggers could be used to simulate "transactional best-effort behavior" in a
 * non-transactional combination of some services. Imagine we have an SQL
 * database and a queue service; each time we change something in SQL, we want
 * to schedule the ID to the queue. Queue service is faulty: if a queueing
 * operation fails, we don't want the data to be stored to SQL DB afterwards.
 * SQL operations are faulty too, but it's okay for us to have something added
 * to the queue even if the corresponding SQL operation failed after it (a queue
 * worker will just do a no-op since it anyway rechecks the source of truth in
 * SQL DB). Queue service is like a write-ahead log for SQL DB which always has
 * not-less records than SQL DB. In this case, we have the following set of
 * triggers:
 *
 * 1. beforeInsert: schedules ID to the queue (ID is known, see below why)
 * 2. beforeUpdate: schedules ID to the queue
 * 3. afterDelete: optionally schedule ID removal to the queue (notice "after")
 *
 * Notice that ID is always known in all cases, even in insertBefore triggers,
 * because we split an INSERT operation into gen_id+insert parts, and the
 * triggers are executed in between.
 *
 * Triggers are invoked sequentially. Any exception thrown in a before-trigger
 * is propagated to the caller, and the DB operation is skipped.
 *
 * Triggers for beforeInsert and beforeUpdate can change their input parameter,
 * the change will apply to the database.
 *
 * Naming convention for trigger arguments:
 * 1. input: whatever is passed to the operation. Notice that due to us having
 *    autoInsert/autoUpdate fields, the set of fields can be incomplete here!
 * 1. oldRow: the entire row in the DB which was there before the operation. All
 *    the fields will be presented there.
 * 2. newRow: a row in the DB as it will looks like after the operation. Notice
 *    that it can be non precise, because we don't always reload the updated row
 *    from the database! What we do is just field by field application of input
 *    properties to oldRow.
 */

export type InsertTrigger<TTable extends Table> = (
  vc: VC,
  args: { input: TriggerInsertInput<TTable> } // always knows ID even in beforeInsert
) => Promise<unknown>;

export type BeforeUpdateTrigger<TTable extends Table> = (
  vc: VC,
  args: {
    newRow: TriggerUpdateNewRow<TTable>;
    oldRow: TriggerUpdateOrDeleteOldRow<TTable>;
    input: Flatten<UpdateInput<TTable>>;
  }
) => Promise<unknown>;

export type AfterUpdateTrigger<TTable extends Table> = (
  vc: VC,
  args: {
    newRow: TriggerUpdateNewRow<TTable>;
    oldRow: TriggerUpdateOrDeleteOldRow<TTable>;
  }
) => Promise<unknown>;

export type DeleteTrigger<TTable extends Table> = (
  vc: VC,
  args: {
    oldRow: TriggerUpdateOrDeleteOldRow<TTable>;
  }
) => Promise<unknown>;

export type AfterMutationTrigger<TTable extends Table> = (
  vc: VC,
  args: {
    newOrOldRow: TriggerAfterMutationNewOrOldRow<TTable>;
    op: "INSERT" | "UPDATE" | "DELETE";
  }
) => Promise<unknown>;

export type DepsBuilder<TTable extends Table> = (
  vc: VC,
  row: Flatten<Readonly<Row<TTable>>>
) => string | Promise<string>;

export class Triggers<TTable extends Table> {
  constructor(
    private beforeInsert: Array<InsertTrigger<TTable>>,
    private beforeUpdate: Array<BeforeUpdateTrigger<TTable>>,
    private beforeDelete: Array<DeleteTrigger<TTable>>,
    private afterInsert: Array<InsertTrigger<TTable>>,
    private afterUpdate: Array<
      [DepsBuilder<TTable> | null, AfterUpdateTrigger<TTable>]
    >,
    private afterDelete: Array<DeleteTrigger<TTable>>,
    private afterMutation: Array<
      [DepsBuilder<TTable> | null, AfterMutationTrigger<TTable>]
    >
  ) {}

  hasInsertTriggers(): boolean {
    return (
      this.beforeInsert.length > 0 ||
      this.afterInsert.length > 0 ||
      this.afterMutation.length > 0
    );
  }

  hasUpdateTriggers(): boolean {
    return (
      this.beforeUpdate.length > 0 ||
      this.afterUpdate.length > 0 ||
      this.afterMutation.length > 0
    );
  }

  async wrapInsert(
    func: (input: InsertInput<TTable> & RowWithID) => Promise<string | null>,
    vc: VC,
    input: InsertInput<TTable> & RowWithID
  ): Promise<string | null> {
    for (const triggerBeforeInsert of this.beforeInsert) {
      // We clone the input to make different triggers calls independent: if the
      // trigger e.g. stores input somewhere by reference, we don't want the
      // next trigger to affect that place.
      input = { ...input };
      await triggerBeforeInsert(vc, { input });
    }

    const output = await func(input);

    if (!output) {
      // Insert failed (unique key constraint failed); don't run after-triggers.
      return output;
    }

    for (const triggerAfterInsert of this.afterInsert) {
      await triggerAfterInsert(vc, { input });
    }

    for (const [_, triggerAfterMutation] of this.afterMutation) {
      await triggerAfterMutation(vc, { newOrOldRow: input, op: "INSERT" });
    }

    return output;
  }

  async wrapUpdate(
    func: (input: UpdateInput<TTable>) => Promise<boolean>,
    vc: VC,
    oldRow: Row<TTable>,
    input: UpdateInput<TTable>
  ): Promise<boolean> {
    if (!this.beforeUpdate && !this.afterUpdate && !this.afterMutation) {
      return func(input);
    }

    let newRow = buildUpdateNewRow(oldRow, input);
    for (const triggerBeforeUpdate of this.beforeUpdate) {
      await triggerBeforeUpdate(vc, { newRow, oldRow, input });
      // Each call to triggerBefore() may potentially change the input, so we
      // need to rebuild newRow each time to feed it to the next call of
      // triggerBefore() and to the rest of triggerAfter.
      newRow = buildUpdateNewRow(oldRow, input);
    }

    const output = await func(input);

    if (!output) {
      // Update failed (no row with such ID); don't call after-triggers.
      return output;
    }

    for (const [depsBuilder, triggerAfterUpdate] of this.afterUpdate) {
      if (!depsBuilder) {
        await triggerAfterUpdate(vc, { newRow, oldRow });
      } else {
        const [depsOld, depsNew] = await join([
          depsBuilder(vc, oldRow),
          depsBuilder(vc, newRow),
        ]);
        if (depsOld !== depsNew) {
          await triggerAfterUpdate(vc, { newRow, oldRow });
        }
      }
    }

    for (const [depsBuilder, triggerAfterMutation] of this.afterMutation) {
      if (!depsBuilder) {
        await triggerAfterMutation(vc, {
          newOrOldRow: newRow,
          op: "UPDATE",
        });
      } else {
        const [depsOld, depsNew] = await join([
          depsBuilder(vc, oldRow),
          depsBuilder(vc, newRow),
        ]);
        if (depsOld !== depsNew) {
          await triggerAfterMutation(vc, {
            newOrOldRow: newRow,
            op: "UPDATE",
          });
        }
      }
    }

    return output;
  }

  async wrapDelete(
    func: () => Promise<boolean>,
    vc: VC,
    oldRow: Row<TTable>
  ): Promise<boolean> {
    for (const triggerBeforeDelete of this.beforeDelete) {
      await triggerBeforeDelete(vc, { oldRow });
    }

    const output = await func();

    if (!output) {
      // Delete failed (no row with such ID); don't call after-triggers.
      return output;
    }

    for (const triggerAfterDelete of this.afterDelete) {
      await triggerAfterDelete(vc, { oldRow });
    }

    for (const [_, triggerAfterMutation] of this.afterMutation) {
      await triggerAfterMutation(vc, {
        newOrOldRow: oldRow as TriggerAfterMutationNewOrOldRow<TTable>,
        op: "DELETE",
      });
    }

    return output;
  }
}

/**
 * Simulates an update for a row, as if it's applied to the Ent.
 */
export function buildUpdateNewRow<TTable extends Table>(
  oldRow: Row<TTable>,
  input: UpdateInput<TTable>
): TriggerUpdateNewRow<TTable> {
  const newRow = { ...oldRow } as TriggerUpdateNewRow<TTable>;

  for (const k of Object.getOwnPropertyNames(input)) {
    if (input[k] !== undefined) {
      (newRow as any)[k] = input[k];
    }
  }

  for (const k of Object.getOwnPropertySymbols(input)) {
    if ((input as any)[k] !== undefined) {
      (newRow as any)[k] = (input as any)[k];
    }
  }

  return newRow;
}
