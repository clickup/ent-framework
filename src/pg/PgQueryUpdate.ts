import uniq from "lodash/uniq";
import type { Query } from "../abstract/Query";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import type { Schema } from "../abstract/Schema";
import { stringHash } from "../internal/misc";
import type { Field, Table, UpdateInput } from "../types";
import { ID } from "../types";
import type { PgClient } from "./PgClient";
import { PgRunner } from "./PgRunner";

export class PgQueryUpdate<TTable extends Table> implements Query<boolean> {
  private readonly allFields;
  readonly input: UpdateInput<TTable> & { [ID]: string };
  readonly IS_WRITE = true;

  constructor(
    public readonly schema: Schema<TTable>,
    id: string,
    input: UpdateInput<TTable>,
  ) {
    // A little hack to merge the updating row with its ID.
    this.input = { ...input, [ID]: id };
    this.allFields = Object.keys(this.schema.table);
  }

  async run(client: PgClient, annotation: QueryAnnotation): Promise<boolean> {
    // Treat undefined as an absent key. This will hopefully be JITed very
    // efficiently, but could still be that it won't since we enumerate object
    // keys and use [] to access the values.
    const fields = this.allFields.filter(
      (field) => field !== ID && this.input[field] !== undefined,
    );
    const casFields = this.input.$cas
      ? this.allFields.filter(
          (field) => field !== ID && this.input.$cas![field] !== undefined,
        )
      : [];

    // If there are no known fields to update, skip the entire operation. We
    // return true since we don't know whether the row is in the DB or not, so
    // we assume it is.
    if (fields.length === 0 && !this.input.$literal) {
      return true;
    }

    // An UPDATE with $literal is a little hacky: we disable batching for it,
    // because we can't guarantee that the SET clause in  "WITH ... VALUES ...
    // UPDATE ... SET ... FROM rows" batched query will be identical for all
    // input rows.
    const disableBatching = !!this.input.$literal;

    // Since UPDATE has partial list of fields, we have to cache runners per
    // updating fields list. Else we'd not be able to do a partial batched update.
    return client
      .batcher(
        this.constructor,
        this.schema,
        fields.join(":") + ":" + casFields.join(":") + ":" + disableBatching,
        () =>
          // This is run only once per every unique combination of field names,
          // not per every row updated, so it's cheap to do whatever we want.
          new PgRunnerUpdate<TTable>(
            this.schema,
            client,
            fields,
            casFields,
            disableBatching,
          ),
      )
      .run(this.input, annotation);
  }
}

class PgRunnerUpdate<TTable extends Table> extends PgRunner<
  TTable,
  UpdateInput<TTable> & { [ID]: string },
  boolean
> {
  static override readonly IS_WRITE = true;
  private singleBuilder;
  private batchBuilder;

  readonly op = "UPDATE";
  readonly maxBatchSize = 100;
  readonly default = false; // If nothing is updated, we return false.

  constructor(
    schema: Schema<TTable>,
    client: PgClient,
    fieldsIn: Array<Field<TTable>>,
    casFieldsIn: Array<Field<TTable>>,
    private disableBatching: boolean,
  ) {
    super(schema, client);

    if (this.disableBatching) {
      this.runBatch = undefined;
    }

    // Always include all autoUpdate fields.
    const fields = uniq([
      ...fieldsIn,
      ...Object.keys(this.schema.table).filter(
        (field) => this.schema.table[field].autoUpdate !== undefined,
      ),
    ]);
    const casFields = casFieldsIn.map((field) => ({
      field,
      alias: `$cas.${field}`,
    }));

    this.singleBuilder = {
      prefix: this.fmt("UPDATE %T SET "),
      func1: this.createUpdateKVsBuilder(fields),
      midfix: this.fmt(" WHERE %PK="),
      func2: (input: { [ID]: string }) => this.escapeValue(ID, input[ID]),
      cas:
        casFields.length > 0
          ? this.createValuesBuilder({
              prefix: this.fmt(" AND ROW(%FIELDS) IS NOT DISTINCT FROM ROW", {
                fields: casFields.map(({ field }) => field),
                normalize: true,
              }),
              indent: "",
              fields: casFields,
              suffix: "",
            })
          : null,
      suffix: this.fmt(` RETURNING %PK AS ${ID}`),
    };

    // There can be several updates for same id (due to batching), so returning
    // all keys here.
    this.batchBuilder = this.createWithBuilder({
      fields: [...this.addPK(fields, "prepend"), ...casFields],
      suffix:
        this.fmt(
          "UPDATE %T SET %UPDATE_FIELD_VALUE_PAIRS(rows)\n" +
            "FROM rows WHERE %PK(%T)=%PK(rows)",
          { fields },
        ) +
        (casFields.length > 0
          ? " AND " +
            this.fmt("ROW(%FIELDS(%T))", {
              fields: casFields.map(({ field }) => field),
              normalize: true,
            }) +
            " IS NOT DISTINCT FROM " +
            this.fmt("ROW(%FIELDS(rows))", { fields: casFields })
          : "") +
        this.fmt(" RETURNING rows._key"),
    });
  }

  override key(input: UpdateInput<TTable> & { [ID]: string }): string {
    return this.runBatch
      ? input[ID] +
          (input.$cas ? ":" + stringHash(JSON.stringify(input.$cas)) : "")
      : super.key(input);
  }

  async runSingle(
    input: UpdateInput<TTable> & { [ID]: string },
    annotations: QueryAnnotation[],
  ): Promise<boolean> {
    const literal = input.$literal;
    const sql =
      this.singleBuilder.prefix +
      this.singleBuilder.func1(input, literal) +
      this.singleBuilder.midfix +
      this.singleBuilder.func2(input) +
      (this.singleBuilder.cas?.prefix ?? "") +
      (this.singleBuilder.cas?.func?.([["", input]]) ?? "") +
      (this.singleBuilder.cas?.suffix ?? "") +
      this.singleBuilder.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(sql, annotations, 1);
    return rows.length > 0 ? true : false;
  }

  async runBatch?(
    inputs: Map<string, UpdateInput<TTable> & { [ID]: string }>,
    annotations: QueryAnnotation[],
  ): Promise<Map<string, boolean>> {
    const sql =
      this.batchBuilder.prefix +
      this.batchBuilder.func(inputs) +
      this.batchBuilder.suffix;
    const rows = await this.clientQuery<{ _key: string; [ID]: string }>(
      sql,
      annotations,
      inputs.size,
    );
    const outputs = new Map<string, boolean>();
    for (const row of rows) {
      outputs.set(row._key, true);
    }

    return outputs;
  }
}
