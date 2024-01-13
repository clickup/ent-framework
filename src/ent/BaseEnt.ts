import type { Client } from "../abstract/Client";
import type { Cluster } from "../abstract/Cluster";
import type { Schema } from "../abstract/Schema";
import type { Table, UniqueKey } from "../types";
import { CacheMixin } from "./mixins/CacheMixin";
import { ConfigMixin } from "./mixins/ConfigMixin";
import type { HelpersClass } from "./mixins/HelpersMixin";
import { HelpersMixin } from "./mixins/HelpersMixin";
import { PrimitiveMixin } from "./mixins/PrimitiveMixin";

/**
 * This is a helper function to create new Ent classes. Run once per each
 * Ent+Cluster on app boot. See examples in __tests__/TestObjects.ts and
 * EntTest.ts.
 *
 * Since all Ent objects are immutable (following the modern practices),
 * 1. Ent is not a DataMapper pattern;
 * 2. Ent is not an ActiveRecord;
 * 3. At last, Ent is not quite a DAO pattern too.
 *
 * We assume that Ents are very simple (we don't need triggers or multi-ent
 * touching mutations), because we anyway have a GraphQL layer on top of it.
 *
 * Finally, a naming decision has been made: we translate database field names
 * directly to Ent field names, no camelCase. This has proven its simplicity
 * benefits in the past: the less translation layers we have, the easier it is
 * to debug and develop.
 */
export function BaseEnt<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client,
>(
  cluster: Cluster<TClient>,
  schema: Schema<TTable, TUniqueKey>,
): HelpersClass<TTable, TUniqueKey, TClient> {
  return HelpersMixin(
    CacheMixin(PrimitiveMixin(ConfigMixin(class {}, cluster, schema))),
  );
}
