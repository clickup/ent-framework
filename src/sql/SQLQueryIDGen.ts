import { QueryBase } from "../abstract/Query";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { nullthrows } from "../helpers/misc";
import type { Table } from "../types";
import { ID } from "../types";
import type { SQLClient } from "./SQLClient";
import { escapeIdent } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryIDGen<TTable extends Table> extends QueryBase<
  TTable,
  void, // input
  string, // output
  SQLClient
> {
  protected readonly RUNNER_CLASS = SQLRunnerIDGen;
}

export class SQLRunnerIDGen<TTable extends Table> extends SQLRunner<
  TTable,
  void,
  string
> {
  static override readonly IS_WRITE = true;
  private readonly idAutoInsert = nullthrows(
    this.schema.table[ID].autoInsert,
    `Schema for ${this.name}.${ID} must have autoInsert attribute defined`
  );
  readonly op = "ID_GEN";
  readonly default = "never_happens"; // abstract property implementation

  async runSingle(
    _input: void,
    annotations: QueryAnnotation[]
  ): Promise<string | undefined> {
    const sql = "SELECT " + this.idAutoInsert;
    const rows = await this.clientQuery<{ [k: string]: string }>(
      sql,
      annotations,
      1
    );
    return Object.values(rows[0])[0];
  }

  async runBatch(
    inputs: Map<string, void>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, string>> {
    const parts = [];
    for (const key of inputs.keys()) {
      parts.push(this.idAutoInsert + " AS " + escapeIdent(key));
    }

    const sql = "SELECT " + parts.join(", ");
    const rows = await this.clientQuery<{ [k: string]: string }>(
      sql,
      annotations,
      inputs.size
    );
    const outputs = new Map<string, string>();
    for (const [key, id] of Object.entries(rows[0])) {
      outputs.set(key, id);
    }

    return outputs;
  }
}
