import type { Query } from "../abstract/Query";
import { Schema } from "../abstract/Schema";
import type {
  CountInput,
  ExistsInput,
  InsertInput,
  LoadByInput,
  Row,
  SelectByInput,
  SelectInput,
  Table,
  UniqueKey,
  UpdateInput,
} from "../types";
import { SQLQueryCount } from "./SQLQueryCount";
import { SQLQueryDelete } from "./SQLQueryDelete";
import { SQLQueryExists } from "./SQLQueryExists";
import { SQLQueryIDGen } from "./SQLQueryIDGen";
import { SQLQueryInsert } from "./SQLQueryInsert";
import { SQLQueryLoad } from "./SQLQueryLoad";
import { SQLQueryLoadBy } from "./SQLQueryLoadBy";
import { SQLQuerySelect } from "./SQLQuerySelect";
import { SQLQuerySelectBy } from "./SQLQuerySelectBy";
import { SQLQueryUpdate } from "./SQLQueryUpdate";
import { SQLQueryUpsert } from "./SQLQueryUpsert";

export class SQLSchema<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>
> extends Schema<TTable, TUniqueKey> {
  idGen(): Query<string> {
    return new SQLQueryIDGen(this);
  }

  insert(input: InsertInput<TTable>): Query<string | null> {
    return new SQLQueryInsert(this, input);
  }

  upsert(input: InsertInput<TTable>): Query<string> {
    return new SQLQueryUpsert(this, input);
  }

  update(id: string, input: UpdateInput<TTable>): Query<boolean> {
    return new SQLQueryUpdate(this, id, input);
  }

  delete(id: string): Query<boolean> {
    return new SQLQueryDelete(this, id);
  }

  load(id: string): Query<Row<TTable> | null> {
    return new SQLQueryLoad(this, id);
  }

  loadBy(input: LoadByInput<TTable, TUniqueKey>): Query<Row<TTable> | null> {
    return new SQLQueryLoadBy(this, input);
  }

  selectBy(
    input: SelectByInput<TTable, TUniqueKey>
  ): Query<Array<Row<TTable>>> {
    return new SQLQuerySelectBy(this, input);
  }

  select(input: SelectInput<TTable>): Query<Array<Row<TTable>>> {
    return new SQLQuerySelect(this, input);
  }

  count(input: CountInput<TTable>): Query<number> {
    return new SQLQueryCount(this, input);
  }

  exists(input: ExistsInput<TTable>): Query<boolean> {
    return new SQLQueryExists(this, input);
  }
}
