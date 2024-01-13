import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { QueryBase } from "../abstract/QueryBase";
import { nullthrows } from "../internal/misc";
import type { Table } from "../types";
import { ID } from "../types";
import { escapeIdent } from "./helpers/escapeIdent";
import type { PgClient } from "./PgClient";
import { PgRunner } from "./PgRunner";

export class PgQueryIDGen<TTable extends Table> extends QueryBase<
  TTable,
  void, // input
  string, // output
  PgClient
> {
  /** @ignore */
  readonly RUNNER_CLASS = PgRunnerIDGen;
}

class PgRunnerIDGen<TTable extends Table> extends PgRunner<
  TTable,
  void,
  string
> {
  static override readonly IS_WRITE = true;
  private readonly idAutoInsert = nullthrows(
    this.schema.table[ID].autoInsert,
    `Schema for ${this.name}.${ID} must have autoInsert attribute defined`,
  );

  readonly op = "ID_GEN";
  readonly maxBatchSize = 100;
  readonly default = "never_happens"; // abstract property implementation

  async runSingle(
    _input: void,
    annotations: QueryAnnotation[],
  ): Promise<string | undefined> {
    const sql = "SELECT " + this.idAutoInsert;
    const rows = await this.clientQuery<{ [k: string]: string }>(
      sql,
      annotations,
      1,
    );
    return Object.values(rows[0])[0];
  }

  async runBatch(
    inputs: Map<string, void>,
    annotations: QueryAnnotation[],
  ): Promise<Map<string, string>> {
    const parts = [];
    for (const key of inputs.keys()) {
      parts.push(this.idAutoInsert + " AS " + escapeIdent(key));
    }

    const sql = "SELECT " + parts.join(", ");
    const rows = await this.clientQuery<{ [k: string]: string }>(
      sql,
      annotations,
      inputs.size,
    );
    const outputs = new Map<string, string>();
    for (const [key, id] of Object.entries(rows[0])) {
      outputs.set(key, id);
    }

    return outputs;
  }
}
