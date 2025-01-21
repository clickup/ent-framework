[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / HelpersClass

# Interface: HelpersClass\<TTable, TUniqueKey, TClient\>

Defined in: [src/ent/mixins/HelpersMixin.ts:67](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/HelpersMixin.ts#L67)

## Extends

- `OmitNew`\<[`PrimitiveClass`](../type-aliases/PrimitiveClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |
| `TClient` *extends* [`Client`](../classes/Client.md) |

## Constructors

### new HelpersClass()

> **new HelpersClass**(): [`HelpersInstance`](HelpersInstance.md)\<`TTable`\> & [`RowWithID`](../type-aliases/RowWithID.md) & `{ [K in string]: Value<TTable[K]> }`

Defined in: [src/ent/mixins/HelpersMixin.ts:130](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/HelpersMixin.ts#L130)

TS requires us to have a public constructor to infer instance types in
various places. We make this constructor throw if it's called.

#### Returns

[`HelpersInstance`](HelpersInstance.md)\<`TTable`\> & [`RowWithID`](../type-aliases/RowWithID.md) & `{ [K in string]: Value<TTable[K]> }`

#### Inherited from

`OmitNew<PrimitiveClass<TTable, TUniqueKey, TClient>>.constructor`

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="configuration"></a> `Configuration` | (`cfg`: [`Configuration`](../classes/Configuration.md)\<`TTable`\>) => [`Configuration`](../classes/Configuration.md)\<`TTable`\> | A helper class to work-around TS weakness in return value type inference: https://github.com/Microsoft/TypeScript/issues/31273. It could've been just a function, but having a class is a little more natural. |
| <a id="cluster"></a> `CLUSTER` | [`Cluster`](../classes/Cluster.md)\<`TClient`, `any`\> | A Cluster where this Ent lives. |
| <a id="schema"></a> `SCHEMA` | [`Schema`](../classes/Schema.md)\<`TTable`, `TUniqueKey`\> | A schema which represents this Ent. |
| <a id="shard_affinity"></a> `SHARD_AFFINITY` | [`ShardAffinity`](../type-aliases/ShardAffinity.md)\<[`FieldOfIDType`](../type-aliases/FieldOfIDType.md)\<`TTable`\>\> | Defines how to find the right Shard during Ent insertion. |
| <a id="shard_locator"></a> `SHARD_LOCATOR` | [`ShardLocator`](../classes/ShardLocator.md)\<`TClient`, `TTable`, [`FieldOfIDType`](../type-aliases/FieldOfIDType.md)\<`TTable`\>\> | Shard locator for this Ent, responsible for resolving IDs into Shard objects. |
| <a id="validation"></a> `VALIDATION` | [`Validation`](../classes/Validation.md)\<`TTable`\> | Privacy rules for this Ent class. |
| <a id="triggers"></a> `TRIGGERS` | [`Triggers`](../classes/Triggers.md)\<`TTable`\> | Triggers for this Ent class. |
| <a id="inverses"></a> `INVERSES` | [`Inverse`](../classes/Inverse.md)\<`TClient`, `TTable`\>[] | Inverse assoc managers for fields. |
| <a id="insert"></a> `insert` | (`vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>) => `Promise`\<`string`\> | Same as insertIfNotExists(), but throws if the Ent violates unique key constraints. |
| <a id="insertreturning"></a> `insertReturning` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>) => `Promise`\<`TEnt`\> | Same as insert(), but returns the created Ent. |
| <a id="upsertreturning"></a> `upsertReturning` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>) => `Promise`\<`TEnt`\> | Same, but returns the created/updated Ent. |
| <a id="loadifreadablenullable"></a> `loadIfReadableNullable` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `id`: `string`) => `Promise`\<`null` \| `TEnt`\> | Same as loadNullable(), but if no permissions to read, returns null and doesn't throw. It's more a convenience function rather than a concept. |
| <a id="loadx"></a> `loadX` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `id`: `string`) => `Promise`\<`TEnt`\> | Loads an Ent by its ID. Throws if no such Ent is found. This method is used VERY often. |
| <a id="loadbyx"></a> `loadByX` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`LoadByInput`](../type-aliases/LoadByInput.md)\<`TTable`, `TUniqueKey`\>) => `Promise`\<`TEnt`\> | Loads an Ent by its ID. Throws if no such Ent is found. This method is used VERY often. |
| <a id="insertifnotexists"></a> `insertIfNotExists` | (`vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>) => `Promise`\<`null` \| `string`\> | Runs INSERT mutation for the Ent. - The Shard is inferred from the input fields using SHARD_AFFINITY. - Returns ID of the newly inserted row. - Returns null if the Ent violates unique key constraints. - If the Ent has some triggers set up, this will be translated into two schema operations: idGen() and insert(), and before-triggers will run in between having the ID known in advance. |
| <a id="upsert"></a> `upsert` | (`vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>) => `Promise`\<`string`\> | Inserts an Ent or updates an existing one if unique key matches. - Don't use upsert() too often, because upsert may still delete IDs even if the object was updated, not inserted (there is no good ways to solve this in some DB engines like relational DBs so far). - Upsert can't work if some triggers are defined for the Ent, because we don't know Ent ID in advance (whether the upsert succeeds or skips on duplication). |
| <a id="loadnullable"></a> `loadNullable` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `id`: `string`) => `Promise`\<`null` \| `TEnt`\> | Loads an Ent by its ID. Returns null if no such Ent exists. Try to use loadX() instead as much as you can. |
| <a id="loadbynullable"></a> `loadByNullable` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`LoadByInput`](../type-aliases/LoadByInput.md)\<`TTable`, `TUniqueKey`\>) => `Promise`\<`null` \| `TEnt`\> | Loads an Ent by its unique key. Returns null if no such Ent exists. Notice that the key must be REALLY unique, otherwise the database may return multiple items, and the API will break. Don't try to use this method with non-unique keys! |
| <a id="selectby"></a> `selectBy` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`LoadByInput`](../type-aliases/LoadByInput.md)\<`TTable`, `TuplePrefixes`\<`TUniqueKey`\>\>) => `Promise`\<`TEnt`[]\> | Selects the list of Ents by their unique key prefix. The query can span multiple Shards if their locations can be inferred from inverses related to the fields mentioned in the query. Ordering of the results is not guaranteed. |
| <a id="select"></a> `select` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `where`: [`Where`](../type-aliases/Where.md)\<`TTable`\>, `limit`: `number`, `order`?: [`Order`](../type-aliases/Order.md)\<`TTable`\>, `custom`?: `object`) => `Promise`\<`TEnt`[]\> | Selects the list of Ents by some predicate. - The query can span multiple Shards if their locations can be inferred from inverses related to the fields mentioned in the query. - In multi-Shard case, ordering of results is not guaranteed. - In multi-Shard case, it may return more results than requested by limit (basically, limit is applied to each Shard individually). The caller has then freedom to reorder & slice the results as they wish. |
| <a id="selectchunked"></a> `selectChunked` | \<`TEnt`\>(`this`: () => `TEnt`, `vc`: [`VC`](../classes/VC.md), `where`: [`Where`](../type-aliases/Where.md)\<`TTable`\>, `chunkSize`: `number`, `limit`: `number`, `custom`?: `object`) => `AsyncIterableIterator`\<`TEnt`[], `any`, `any`\> | Same as select(), but returns data in chunks. - Uses multiple select() queries under the hood. - The query can span multiple Shards if their locations can be inferred from inverses related to the fields mentioned in the query. - Ents in each chunk always belong to the same Shard and are ordered by ID (there is no support for custom ordering). Make sure you have the right index in the database. |
| <a id="count"></a> `count` | (`vc`: [`VC`](../classes/VC.md), `where`: [`CountInput`](../type-aliases/CountInput.md)\<`TTable`\>) => `Promise`\<`number`\> | Returns count of Ents matching a predicate. The query can span multiple Shards if their locations can be inferred from inverses related to the fields mentioned in the query. |
| <a id="exists"></a> `exists` | (`vc`: [`VC`](../classes/VC.md), `where`: [`ExistsInput`](../type-aliases/ExistsInput.md)\<`TTable`\>) => `Promise`\<`boolean`\> | A more optimal approach than count() when we basically just need to know whether we have "0 or not 0" rows. |

## Methods

### configure()

> **configure**(): [`Configuration`](../classes/Configuration.md)\<`TTable`\>

Defined in: [src/ent/mixins/ConfigMixin.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L29)

Some Ent parameters need to be configured lazily, on the 1st access,
because there could be cyclic references between Ent classes (e.g. in their
privacy rules). So configure() is called on some later stage, at the moment
of actual Ent operations (like loading, creation etc.). There is no static
abstract methods in TS yet, so making it non-abstract.

#### Returns

[`Configuration`](../classes/Configuration.md)\<`TTable`\>

#### Inherited from

`OmitNew.configure`
