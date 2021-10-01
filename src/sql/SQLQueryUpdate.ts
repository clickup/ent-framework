import omit from "lodash/omit";
import pick from "lodash/pick";
import { Query } from "../abstract/Query";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { Schema } from "../abstract/Schema";
import { $literal, ID, Table, UpdateInput } from "../types";
import { escapeID, SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryUpdate<TTable extends Table> implements Query<boolean> {
  readonly input: UpdateInput<TTable> & { [ID]: string };
  readonly IS_WRITE = true;

  constructor(
    public readonly schema: Schema<TTable>,
    id: string,
    input: UpdateInput<TTable>
  ) {
    // A little hack to merge the updating row with its ID.
    this.input = { ...input, [ID]: id };
  }

  async run(client: SQLClient, annotation: QueryAnnotation): Promise<boolean> {
    // Treat undefined as an absent key. This will hopefully be JITed very
    // efficiently, but could still be that it won't since we enumerate object
    // keys and use [] to access the values.
    const fields = Object.keys(this.schema.table).filter(
      (field) => field !== ID && this.input[field] !== undefined
    );

    // If there are no known fields to update, skip the entire operation. We
    // return true since we don't know whether the row is in the DB or not, so
    // we assume it is.
    if (fields.length === 0 && !this.input[$literal]) {
      return true;
    }

    // An UPDATE with $literal is a little hacky: we disable batching for it,
    // because we can't guarantee that the SET clause in  "WITH ... VALUES ...
    // UPDATE ... SET ... FROM rows" batched query will be identical for all
    // input rows.
    const disableBatching = !!this.input[$literal];

    // Since UPDATE has partial list of fields, we have to cache runners per
    // updating fields list. Else we'd not be able to do a partial batched update.
    return client
      .batcher(
        this.constructor,
        this.schema,
        fields.join(":") + ":" + disableBatching,
        () =>
          // This is run only once per every unique combination of field names,
          // not per every row updated, so it's cheap to do whatever we want.
          new SQLRunnerUpdate<TTable>(
            this.schema,
            client,
            pick(
              this.schema.table,
              [ID], // ID must be in the beginning (we re-sort rows for deadlock prevention)
              fields,
              Object.keys(this.schema.table).filter(
                // also add autoUpdate fields
                (field) => this.schema.table[field].autoUpdate !== undefined
              )
            ) as TTable,
            disableBatching
          )
      )
      .run(this.input, annotation);
  }
}

class SQLRunnerUpdate<TTable extends Table> extends SQLRunner<
  TTable,
  UpdateInput<TTable> & { [ID]: string },
  boolean
> {
  static override readonly IS_WRITE = true;
  readonly op = "UPDATE";

  private batchValuesBuilder = this.createValuesBuilder(this.specs);
  private prefixSimple = this.fmt("UPDATE %T SET ");
  private kvsBuilder = this.createUpdateKVsBuilder(omit(this.specs, ID));
  private midfixSimple = this.fmt(" WHERE %ID=");
  private suffixSimple = this.fmt(" RETURNING %ID");

  constructor(
    schema: Schema<TTable>,
    client: SQLClient,
    private specs: TTable,
    private disableBatching: boolean
  ) {
    super(schema, client);

    // We could have many updates for same id (due to batching), so returning
    // all keys.
    this.batchValuesBuilder.suffix += this.fmt(
      "\n" +
        "  UPDATE %T SET %KV(rows)\n" +
        "  FROM rows WHERE %T.%ID=rows.%ID RETURNING (SELECT _key FROM rows WHERE rows.%ID=%T.%ID)",
      { specs: omit(specs, ID) }
    );
  }

  // If nothing is updated, we return false.
  readonly default = false;

  override key(input: UpdateInput<TTable> & { [ID]: string }): string {
    return this.runBatch ? input[ID] : super.key(input);
  }

  async runSingle(
    input: UpdateInput<TTable> & { [ID]: string },
    annotations: Iterable<QueryAnnotation>
  ): Promise<boolean> {
    const literal = input[$literal];
    const sql =
      this.prefixSimple +
      this.kvsBuilder(input) +
      (literal ? ", " + this.buildLiteral(literal) : "") +
      this.midfixSimple +
      escapeID(input[ID]) +
      this.suffixSimple;
    const rows = await this.clientQuery<{ [ID]: string }>(sql, annotations, 1);
    return rows.length > 0 ? true : false;
  }

  runBatch = this.disableBatching
    ? undefined
    : async (
        inputs: Map<string, UpdateInput<TTable> & { [ID]: string }>,
        annotations: Iterable<QueryAnnotation>
      ): Promise<Map<string, boolean>> => {
        const pieces: string[] = [];
        for (const [key, input] of inputs) {
          pieces.push(this.batchValuesBuilder.func(key, input));
        }

        // To eliminate deadlocks in parallel batched updates, we sort rows.
        // This prevents deadlocks when two batched queries are running in
        // different connections and update the same rows in different order.
        // Notice that SQLQueryUpdate.run() puts the rows ID value to the
        // beginning of the string, and thus, we order by ID in practice.
        pieces.sort();

        const sql =
          this.batchValuesBuilder.prefix +
          ",\n  " +
          pieces.join(",\n  ") +
          this.batchValuesBuilder.suffix;

        const rows = await this.clientQuery<{ _key: string; [ID]: string }>(
          sql,
          annotations,
          inputs.size
        );
        const outputs = new Map<string, boolean>();
        for (const row of rows) {
          outputs.set(row._key, true);
        }

        return outputs;
      };
}
