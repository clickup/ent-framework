import type { Query } from "../abstract/Query";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import type { Schema } from "../abstract/Schema";
import type {
  FieldOfPotentialUniqueKey,
  Row,
  SelectByInput,
  Table,
  UniqueKey,
} from "../types";
import type { SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQuerySelectBy<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>
> implements Query<Array<Row<TTable>>>
{
  readonly IS_WRITE = false;

  constructor(
    public readonly schema: Schema<TTable>,
    public readonly input: SelectByInput<TTable, TUniqueKey>
  ) {}

  async run(
    client: SQLClient,
    annotation: QueryAnnotation
  ): Promise<Array<Row<TTable>>> {
    // Treat undefined as an absent key. This will hopefully be JITed very
    // efficiently, but could still be that it won't since we enumerate object
    // keys and use [] to access the values.
    const fields = this.schema.uniqueKey.filter(
      (field) => this.input[field] !== undefined
    );

    // If there are no known fields, skip the entire operation.
    if (fields.length === 0) {
      return [];
    }

    // Since we have a partial list of fields which depends on the query itself,
    // we have to cache runners per updating fields list. Else we'd not be able
    // to do a partial batched update.
    return client
      .batcher(
        this.constructor,
        this.schema,
        fields.join(":"),
        () =>
          // This is run only once per every unique combination of field names,
          // not per every row updated, so it's cheap to do whatever we want.
          new SQLRunnerSelectBy<TTable, TUniqueKey>(this.schema, client, fields)
      )
      .run(this.input, annotation);
  }
}

export class SQLRunnerSelectBy<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>
> extends SQLRunner<
  TTable,
  SelectByInput<TTable, TUniqueKey>,
  Array<Row<TTable>>
> {
  static override readonly IS_WRITE = false;
  private builders;
  readonly op = "SELECT_UNIQ_PFX";
  override readonly maxBatchSize = 1000; // Select by unique key is cheap, so we can have much bigger load batches to accumulate more data from e.g. Shard 0 for the next multi-Shard requests.
  readonly default = []; // If no rows are found, returns [].

  constructor(
    schema: Schema<TTable>,
    client: SQLClient,
    private fields: Array<FieldOfPotentialUniqueKey<TTable>>
  ) {
    super(schema, client);
    this.builders = this.createWhereBuildersFieldsEq<
      SelectByInput<TTable, TUniqueKey>
    >({
      prefix: this.fmt("SELECT %SELECT_FIELDS FROM %T "),
      fields,
      suffix: this.fmt(""),
    });
  }

  override key(input: SelectByInput<TTable, TUniqueKey> | Row<TTable>): string {
    return JSON.stringify(this.fields.map((field) => input[field]));
  }

  async runSingle(
    input: SelectByInput<TTable, TUniqueKey>,
    annotations: QueryAnnotation[]
  ): Promise<Array<Row<TTable>>> {
    const sql =
      this.builders.plain.prefix +
      this.builders.plain.func([["", input]]) +
      this.builders.plain.suffix;
    return this.clientQuery<Row<TTable>>(sql, annotations, 1);
  }

  async runBatch(
    inputs: Map<string, SelectByInput<TTable, TUniqueKey>>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, Array<Row<TTable>>>> {
    const sql =
      this.builders.optimized.prefix +
      this.builders.optimized.func(inputs) +
      this.builders.optimized.suffix;
    const rows = await this.clientQuery<Row<TTable>>(
      sql,
      annotations,
      inputs.size
    );

    const outputs = new Map<string, Array<Row<TTable>>>();
    for (const row of rows) {
      const key = this.key(row);
      let rows = outputs.get(key);
      if (!rows) {
        rows = [];
        outputs.set(key, rows);
      }

      rows.push(row);
    }

    return outputs;
  }
}
