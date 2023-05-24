import compact from "lodash/compact";
import type { Client } from "../../abstract/Client";
import type { Cluster } from "../../abstract/Cluster";
import type { Schema } from "../../abstract/Schema";
import { entries } from "../../helpers/misc";
import type { FieldOfIDType, Table, UniqueKey } from "../../types";
import { ID } from "../../types";
import type { ShardAffinity } from "../Configuration";
import { Configuration, GLOBAL_SHARD } from "../Configuration";
import { Inverse } from "../Inverse";
import { ShardLocator } from "../ShardLocator";
import { Triggers } from "../Triggers";
import { Validation } from "../Validation";

export interface ConfigInstance {}

export interface ConfigClass<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client
> {
  /**
   * Some Ent parameters need to be configured lazily, on the 1st access,
   * because there could be cyclic references between Ent classes (e.g. in their
   * privacy rules). So configure() is called on some later stage, at the moment
   * of actual Ent operations (like loading, creation etc.). There is no static
   * abstract methods in TS yet, so making it non-abstract.
   */
  configure(): Configuration<TTable>;

  /**
   * A helper class to work-around TS weakness in return value type inference:
   * https://github.com/Microsoft/TypeScript/issues/31273. It could've been just
   * a function, but having a class is a little more natural.
   */
  readonly Configuration: new (
    cfg: Configuration<TTable>
  ) => Configuration<TTable>;

  /**
   * A cluster where this Ent lives.
   */
  readonly CLUSTER: Cluster<TClient>;

  /**
   * A schema which represents this Ent.
   */
  readonly SCHEMA: Schema<TTable, TUniqueKey>;

  /**
   * Defines how to find the right shard during Ent insertion.
   */
  readonly SHARD_AFFINITY: ShardAffinity<FieldOfIDType<TTable>>;

  /**
   * Shard locator for this Ent, responsible for resolving IDs into Shard objects.
   */
  readonly SHARD_LOCATOR: ShardLocator<TClient, FieldOfIDType<TTable>>;

  /**
   * Privacy rules for this Ent class.
   */
  readonly VALIDATION: Validation<TTable>;

  /**
   * Triggers for this Ent class.
   */
  readonly TRIGGERS: Triggers<TTable>;

  /**
   * Inverse assoc managers for fields.
   */
  readonly INVERSES: Array<Inverse<TClient, TTable>>;

  /**
   * TS requires us to have a public constructor to infer instance types in
   * various places. We make this constructor throw if it's called.
   */
  new (...args: any[]): ConfigInstance;
}

/**
 * Modifies the passed class adding support for Ent configuration (such as:
 * cluster, table schema, privacy rules, triggers etc.).
 */
export function ConfigMixin<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client
>(
  Base: new (...args: any[]) => {},
  cluster: Cluster<TClient>,
  schema: Schema<TTable, TUniqueKey>
): ConfigClass<TTable, TUniqueKey, TClient> {
  class ConfigMixin extends Base {
    static Configuration: new (
      c: Configuration<TTable>
    ) => Configuration<TTable> = Configuration;

    static readonly CLUSTER = cluster;

    static readonly SCHEMA = schema;

    static get SHARD_AFFINITY(): ShardAffinity<FieldOfIDType<TTable>> {
      Object.defineProperty(this, "SHARD_AFFINITY", {
        value: this.configure().shardAffinity,
        writable: false,
      });
      return this.SHARD_AFFINITY;
    }

    static get SHARD_LOCATOR(): ShardLocator<TClient, FieldOfIDType<TTable>> {
      Object.defineProperty(this, "SHARD_LOCATOR", {
        value: new ShardLocator({
          cluster,
          entName: this.name,
          shardAffinity: this.SHARD_AFFINITY,
          uniqueKey: schema.uniqueKey,
          inverses: this.INVERSES,
        }),
        writable: false,
      });
      return this.SHARD_LOCATOR;
    }

    static get VALIDATION(): Validation<TTable> {
      const cfg = this.configure();
      Object.defineProperty(this, "VALIDATION", {
        value: new Validation(this.name, {
          tenantPrincipalField: cfg.privacyTenantPrincipalField,
          inferPrincipal: cfg.privacyInferPrincipal,
          load: cfg.privacyLoad,
          insert: cfg.privacyInsert,
          update: cfg.privacyUpdate,
          delete: cfg.privacyDelete,
          validate: cfg.validators,
        }),
        writable: false,
      });
      return this.VALIDATION;
    }

    static get TRIGGERS(): Triggers<TTable> {
      const cfg = this.configure();
      Object.defineProperty(this, "TRIGGERS", {
        value: new Triggers(
          cfg.beforeInsert ?? [],
          cfg.beforeUpdate ?? [],
          cfg.beforeDelete ?? [],
          cfg.afterInsert ?? [],
          (cfg.afterUpdate ?? []).map((trigger) =>
            trigger instanceof Array ? trigger : [null, trigger]
          ),
          cfg.afterDelete ?? [],
          (cfg.afterMutation ?? []).map((trigger) =>
            trigger instanceof Array ? trigger : [null, trigger]
          )
        ),
        writable: false,
      });
      return this.TRIGGERS;
    }

    static get INVERSES(): Array<Inverse<TClient, TTable>> {
      const cfg = this.configure();
      Object.defineProperty(this, "INVERSES", {
        value: compact(
          entries(cfg.inverses ?? {}).map(([field, { name, type }]) => {
            if (this.SHARD_AFFINITY === GLOBAL_SHARD) {
              throw Error(
                `It's useless to define a ${field} inverse for GLOBAL_SHARD schemas; use just a DB index`
              );
            }

            const spec = schema.table[field];
            if (
              schema.table[field].type !== ID ||
              spec.autoInsert ||
              spec.autoUpdate
            ) {
              throw Error(
                `To have inverse specified, the '${field}' must be of type ${ID} and have no autoInsert/autoUpdate`
              );
            }

            return new Inverse({
              cluster,
              shardAffinity: this.SHARD_AFFINITY,
              id2Schema: schema,
              id2Field: field,
              name,
              type,
            });
          })
        ),
        writable: false,
      });
      return this.INVERSES;
    }

    override ["constructor"]!: typeof ConfigMixin;

    static configure(): Configuration<TTable> {
      throw Error(`Please define ${this.name}.configure() method`);
    }
  }

  return ConfigMixin;
}
