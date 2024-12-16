import { deepEqual } from "../internal/deepEqual";
import type { Flatten, Writeable } from "../internal/misc";
import { join } from "../internal/misc";
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
 * Table -> trigger's before-update input.
 */
export type TriggerUpdateInput<TTable extends Table> = Flatten<
  UpdateInput<TTable>
>;

/**
 * Table -> trigger's before- and after-update NEW row. Ephemeral (symbol)
 * fields may or may not be passed depending on what the user passes to the
 * update method.
 */
export type TriggerUpdateNewRow<TTable extends Table> = Flatten<
  Readonly<
    Row<TTable> & {
      [K in keyof TTable & symbol]?: Value<TTable[K]> | undefined;
    }
  >
>;

/**
 * Table -> trigger's before- and after-update (or delete) OLD row. Ephemeral
 * (symbol) fields are marked as always presented, but "never" typed, so they
 * will be available for dereferencing in newOrOldRow of before/after mutation
 * triggers without guard-checking of op value.
 */
export type TriggerUpdateOrDeleteOldRow<TTable extends Table> = Flatten<
  Readonly<Row<TTable> & Record<keyof TTable & symbol, never>>
>;

/**
 * Triggers could be used to simulate "transactional best-effort behavior" in a
 * non-transactional combination of some services. Imagine we have a relational
 * database and a queue service; each time we change something in the query, we
 * want to schedule the ID to the queue. Queue service is faulty: if a queueing
 * operation fails, we don't want the data to be stored to the DB afterwards.
 * Queries are faulty too, but it's okay for us to have something added to the
 * queue even if the corresponding query failed after it (a queue worker will
 * just do a no-op since it anyway rechecks the source of truth in relational
 * DBs). Queue service is like a write-ahead log for DB which always has
 * not-less records than the DB. In this case, we have the following set of
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
  args: { input: TriggerInsertInput<TTable> }, // always knows ID even in beforeInsert
) => Promise<unknown>;

export type BeforeUpdateTrigger<TTable extends Table> = (
  vc: VC,
  args: {
    newRow: TriggerUpdateNewRow<TTable>;
    oldRow: TriggerUpdateOrDeleteOldRow<TTable>;
    input: TriggerUpdateInput<TTable>;
  },
) => Promise<unknown>;

export type AfterUpdateTrigger<TTable extends Table> = (
  vc: VC,
  args: {
    newRow: TriggerUpdateNewRow<TTable>;
    oldRow: TriggerUpdateOrDeleteOldRow<TTable>;
  },
) => Promise<unknown>;

export type DeleteTrigger<TTable extends Table> = (
  vc: VC,
  args: {
    oldRow: TriggerUpdateOrDeleteOldRow<TTable>;
  },
) => Promise<unknown>;

export type BeforeMutationTrigger<TTable extends Table> = (
  vc: VC,
  args:
    | {
        op: "INSERT";
        newOrOldRow: Readonly<TriggerInsertInput<TTable>>;
        input: TriggerInsertInput<TTable>;
      }
    | {
        op: "UPDATE";
        newOrOldRow: TriggerUpdateNewRow<TTable>;
        input: TriggerUpdateInput<TTable>;
      }
    | {
        op: "DELETE";
        newOrOldRow: TriggerUpdateOrDeleteOldRow<TTable>;
        /** We allow people to modify input of a DELETE operation, although it
         * will be a no-op. This is for convenience: if we remained it
         * read-only, then people would need to check `if (op !== "DELETE") ...`
         * in their beforeMutation triggers, which is a boilerplate. */
        input: Writeable<TriggerUpdateOrDeleteOldRow<TTable>>;
      },
) => Promise<unknown>;

export type AfterMutationTrigger<TTable extends Table> = (
  vc: VC,
  args:
    | {
        op: "INSERT";
        newOrOldRow: Readonly<TriggerInsertInput<TTable>>;
      }
    | {
        op: "UPDATE";
        newOrOldRow: TriggerUpdateNewRow<TTable>;
      }
    | {
        op: "DELETE";
        newOrOldRow: TriggerUpdateOrDeleteOldRow<TTable>;
      },
) => Promise<unknown>;

export type DepsBuilder<TTable extends Table> = (
  vc: VC,
  row: Flatten<Readonly<Row<TTable>>>,
) => unknown[] | Promise<unknown[]>;

export class Triggers<TTable extends Table> {
  constructor(
    private beforeInsert: Array<InsertTrigger<TTable>>,
    private beforeUpdate: Array<
      [DepsBuilder<TTable> | null, BeforeUpdateTrigger<TTable>]
    >,
    private beforeDelete: Array<DeleteTrigger<TTable>>,
    private beforeMutation: Array<
      [DepsBuilder<TTable> | null, BeforeMutationTrigger<TTable>]
    >,
    private afterInsert: Array<InsertTrigger<TTable>>,
    private afterUpdate: Array<
      [DepsBuilder<TTable> | null, AfterUpdateTrigger<TTable>]
    >,
    private afterDelete: Array<DeleteTrigger<TTable>>,
    private afterMutation: Array<
      [DepsBuilder<TTable> | null, AfterMutationTrigger<TTable>]
    >,
  ) {}

  hasInsertTriggers(): boolean {
    return (
      this.beforeInsert.length > 0 ||
      this.beforeMutation.length > 0 ||
      this.afterInsert.length > 0 ||
      this.afterMutation.length > 0
    );
  }

  hasUpdateTriggers(): boolean {
    return (
      this.beforeUpdate.length > 0 ||
      this.beforeMutation.length > 0 ||
      this.afterUpdate.length > 0 ||
      this.afterMutation.length > 0
    );
  }

  async wrapInsert(
    func: (input: InsertInput<TTable> & RowWithID) => Promise<string | null>,
    vc: VC,
    input: InsertInput<TTable> & RowWithID,
  ): Promise<string | null> {
    if (!this.hasInsertTriggers()) {
      return func(input);
    }

    for (const triggerBeforeInsert of this.beforeInsert) {
      // We clone the input to make different triggers calls independent: if the
      // trigger e.g. stores input somewhere by reference, we don't want the
      // next trigger to affect that place.
      input = { ...input };
      await triggerBeforeInsert(vc, { input });
    }

    for (const [_, triggerBeforeMutation] of this.beforeMutation) {
      input = { ...input };
      await triggerBeforeMutation(vc, {
        op: "INSERT",
        newOrOldRow: input,
        input,
      });
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
      await triggerAfterMutation(vc, { op: "INSERT", newOrOldRow: input });
    }

    return output;
  }

  async wrapUpdate(
    func: (input: UpdateInput<TTable>) => Promise<boolean>,
    vc: VC,
    oldRow: TriggerUpdateOrDeleteOldRow<TTable>,
    input: UpdateInput<TTable>,
  ): Promise<boolean> {
    if (!this.hasUpdateTriggers()) {
      return func(input);
    }

    let newRow = buildUpdateNewRow(oldRow, input);

    for (const [depsBuilder, triggerBeforeUpdate] of this.beforeUpdate) {
      if (await depsBuilderApproves(depsBuilder, vc, oldRow, newRow)) {
        await triggerBeforeUpdate(vc, { newRow, oldRow, input });
        // Each call to triggerBefore() may potentially change the input, so we
        // need to rebuild newRow each time to feed it to the next call of
        // triggerBefore() and to the rest of triggerAfter.
        newRow = buildUpdateNewRow(oldRow, input);
      }
    }

    for (const [depsBuilder, triggerBeforeMutation] of this.beforeMutation) {
      if (await depsBuilderApproves(depsBuilder, vc, oldRow, newRow)) {
        await triggerBeforeMutation(vc, {
          op: "UPDATE",
          newOrOldRow: newRow,
          input,
        });
        newRow = buildUpdateNewRow(oldRow, input);
      }
    }

    const output = await func(input);

    if (!output) {
      // Update failed (no row with such ID); don't call after-triggers.
      return output;
    }

    for (const [depsBuilder, triggerAfterUpdate] of this.afterUpdate) {
      if (await depsBuilderApproves(depsBuilder, vc, oldRow, newRow)) {
        await triggerAfterUpdate(vc, {
          newRow,
          oldRow: oldRow as TriggerUpdateOrDeleteOldRow<TTable>,
        });
      }
    }

    for (const [depsBuilder, triggerAfterMutation] of this.afterMutation) {
      if (await depsBuilderApproves(depsBuilder, vc, oldRow, newRow)) {
        await triggerAfterMutation(vc, {
          op: "UPDATE",
          newOrOldRow: newRow,
        });
      }
    }

    return output;
  }

  async wrapDelete(
    func: () => Promise<boolean>,
    vc: VC,
    oldRow: TriggerUpdateOrDeleteOldRow<TTable>,
  ): Promise<boolean> {
    for (const triggerBeforeDelete of this.beforeDelete) {
      await triggerBeforeDelete(vc, { oldRow });
    }

    for (const [_, triggerBeforeMutation] of this.beforeMutation) {
      await triggerBeforeMutation(vc, {
        op: "DELETE",
        newOrOldRow: oldRow,
        input: oldRow,
      });
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
        op: "DELETE",
        newOrOldRow: oldRow,
      });
    }

    return output;
  }
}

/**
 * Simulates an update for a row, as if it's applied to the Ent.
 * @ignore
 */
export function buildUpdateNewRow<TTable extends Table>(
  oldRow: Row<TTable>,
  input: UpdateInput<TTable>,
): TriggerUpdateNewRow<TTable> {
  const newRow = { ...oldRow } as TriggerUpdateNewRow<TTable>;

  for (const k of Object.getOwnPropertyNames(input)) {
    if (input[k] !== undefined) {
      (newRow as Record<string, unknown>)[k] = input[k];
    }
  }

  for (const k of Object.getOwnPropertySymbols(input)) {
    if (input[k] !== undefined) {
      (newRow as Record<symbol, unknown>)[k] = input[k];
    }
  }

  return newRow;
}

/**
 * Returns true if depsBuilder approves running the trigger (i.e. the deps are
 * changed, or no depsBuilder is presented at all).
 */
async function depsBuilderApproves<TTable extends Table>(
  depsBuilder: DepsBuilder<TTable> | null,
  vc: VC,
  oldRow: Row<TTable>,
  newRow: Row<TTable>,
): Promise<boolean> {
  if (!depsBuilder) {
    return true;
  }

  const [depsOld, depsNew] = await join([
    depsBuilder(vc, oldRow),
    depsBuilder(vc, newRow),
  ]);

  return !deepEqual(depsOld, depsNew);
}
