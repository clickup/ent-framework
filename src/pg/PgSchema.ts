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
import { PgQueryCount } from "./PgQueryCount";
import { PgQueryDelete } from "./PgQueryDelete";
import { PgQueryExists } from "./PgQueryExists";
import { PgQueryIDGen } from "./PgQueryIDGen";
import { PgQueryInsert } from "./PgQueryInsert";
import { PgQueryLoad } from "./PgQueryLoad";
import { PgQueryLoadBy } from "./PgQueryLoadBy";
import { PgQuerySelect } from "./PgQuerySelect";
import { PgQuerySelectBy } from "./PgQuerySelectBy";
import { PgQueryUpdate } from "./PgQueryUpdate";
import { PgQueryUpsert } from "./PgQueryUpsert";

export class PgSchema<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
> extends Schema<TTable, TUniqueKey> {
  idGen(): Query<string> {
    return new PgQueryIDGen(this);
  }

  insert(input: InsertInput<TTable>): Query<string | null> {
    return new PgQueryInsert(this, input);
  }

  upsert(input: InsertInput<TTable>): Query<string> {
    return new PgQueryUpsert(this, input);
  }

  update(id: string, input: UpdateInput<TTable>): Query<boolean> {
    return new PgQueryUpdate(this, id, input);
  }

  delete(id: string): Query<boolean> {
    return new PgQueryDelete(this, id);
  }

  load(id: string): Query<Row<TTable> | null> {
    return new PgQueryLoad(this, id);
  }

  loadBy(input: LoadByInput<TTable, TUniqueKey>): Query<Row<TTable> | null> {
    return new PgQueryLoadBy(this, input);
  }

  selectBy(
    input: SelectByInput<TTable, TUniqueKey>,
  ): Query<Array<Row<TTable>>> {
    return new PgQuerySelectBy(this, input);
  }

  select(input: SelectInput<TTable>): Query<Array<Row<TTable>>> {
    return new PgQuerySelect(this, input);
  }

  count(input: CountInput<TTable>): Query<number> {
    return new PgQueryCount(this, input);
  }

  exists(input: ExistsInput<TTable>): Query<boolean> {
    return new PgQueryExists(this, input);
  }
}
