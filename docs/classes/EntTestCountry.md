[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / EntTestCountry

# Class: EntTestCountry

## Hierarchy

- [`HelpersInstance`](../interfaces/HelpersInstance.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }, `this`\> & [`RowWithID`](../modules.md#rowwithid) & { `id`: `string` ; `name`: ``null`` \| `string`  }

  ↳ **`EntTestCountry`**

## Constructors

### constructor

• **new EntTestCountry**(...`args`)

TS requires us to have a public constructor to infer instance types in
various places. We make this constructor throw if it's called.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).constructor

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:109](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L109)

## Properties

### id

• `Readonly` **id**: `string`

For simplicity, every Ent has an ID field name hardcoded to "id".

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).id

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:36](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L36)

___

### name

• **name**: ``null`` \| `string`

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).name

___

### vc

• `Readonly` **vc**: [`VC`](VC.md)

VC of this Ent.

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).vc

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L31)

___

### CLUSTER

▪ `Static` `Readonly` **CLUSTER**: [`Cluster`](Cluster.md)<[`TestSQLClient`](TestSQLClient.md)\>

A cluster where this Ent lives.

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).CLUSTER

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:41](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L41)

___

### Configuration

▪ `Static` `Readonly` **Configuration**: (`cfg`: [`Configuration`](Configuration.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\>) => [`Configuration`](Configuration.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\>

#### Type declaration

• **new EntTestCountry**(`cfg`)

A helper class to work-around TS weakness in return value type inference:
https://github.com/Microsoft/TypeScript/issues/31273. It could've been just
a function, but having a class is a little more natural.

##### Parameters

| Name | Type |
| :------ | :------ |
| `cfg` | [`Configuration`](Configuration.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\> |

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).Configuration

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:34](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L34)

___

### INVERSES

▪ `Static` `Readonly` **INVERSES**: [`Inverse`](Inverse.md)<[`TestSQLClient`](TestSQLClient.md), { `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\>[]

Inverse assoc managers for fields.

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).INVERSES

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:71](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L71)

___

### SCHEMA

▪ `Static` `Readonly` **SCHEMA**: [`Schema`](Schema.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }, ``"name"``[]\>

A schema which represents this Ent.

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).SCHEMA

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:46](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L46)

___

### SHARD\_AFFINITY

▪ `Static` `Readonly` **SHARD\_AFFINITY**: [`ShardAffinity`](../modules.md#shardaffinity)<`never`\>

Defines how to find the right shard during Ent insertion.

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).SHARD\_AFFINITY

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L51)

___

### SHARD\_LOCATOR

▪ `Static` `Readonly` **SHARD\_LOCATOR**: [`ShardLocator`](ShardLocator.md)<[`TestSQLClient`](TestSQLClient.md), `never`\>

Shard locator for this Ent, responsible for resolving IDs into Shard objects.

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).SHARD\_LOCATOR

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:56](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L56)

___

### TRIGGERS

▪ `Static` `Readonly` **TRIGGERS**: [`Triggers`](Triggers.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\>

Triggers for this Ent class.

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).TRIGGERS

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:66](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L66)

___

### TRIGGER\_CALLS

▪ `Static` **TRIGGER\_CALLS**: { `input?`: `any` ; `new?`: `any` ; `old?`: `any` ; `type`: `string`  }[] = `[]`

#### Defined in

[packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts:294](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts#L294)

___

### VALIDATION

▪ `Static` `Readonly` **VALIDATION**: [`Validation`](Validation.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\>

Privacy rules for this Ent class.

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).VALIDATION

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:61](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L61)

## Methods

### deleteOriginal

▸ **deleteOriginal**(): `Promise`<`boolean`\>

Deletes the object in the DB. Returns true if the object was found. Keeps
the current object untouched (since it's immutable).

#### Returns

`Promise`<`boolean`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).deleteOriginal

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:48](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L48)

___

### updateChanged

▸ **updateChanged**(`input`): `Promise`<`boolean`\>

Same as updateOriginal(), but updates only the fields which are different
in input and in the current object. If nothing is different, returns
false.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateInput`](../modules.md#updateinput)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\> |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).updateChanged

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:25](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L25)

___

### updateOriginal

▸ **updateOriginal**(`input`): `Promise`<`boolean`\>

Updates the object in the DB, but doesn't update the Ent itself (since it's
immutable). Returns true if the object was found.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateInput`](../modules.md#updateinput)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\> |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).updateOriginal

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L42)

___

### updateReturningNullable

▸ **updateReturningNullable**<`TEnt`\>(`input`): `Promise`<``null`` \| `TEnt`\>

Same as updateOriginal(), but returns the updated Ent (or null of there
was no such Ent in the database).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](../interfaces/HelpersInstance.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateInput`](../modules.md#updateinput)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\> |

#### Returns

`Promise`<``null`` \| `TEnt`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).updateReturningNullable

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L31)

___

### updateReturningX

▸ **updateReturningX**<`TEnt`\>(`input`): `Promise`<`TEnt`\>

Same as updateOriginal(), but throws if the object wasn't updated or
doesn't exist after the update.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](../interfaces/HelpersInstance.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateInput`](../modules.md#updateinput)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\> |

#### Returns

`Promise`<`TEnt`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).updateReturningX

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:40](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L40)

___

### configure

▸ `Static` **configure**(): [`Configuration`](Configuration.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\>

#### Returns

[`Configuration`](Configuration.md)<{ `id`: { `autoInsert`: `string` = "id\_gen()"; `type`: `StringConstructor` = String } ; `name`: { `allowNull`: ``true`` = true; `autoInsert`: `string` = "NULL"; `type`: `StringConstructor` = String }  }\>

#### Overrides

BaseEnt(testCluster, schemaTestCountry).configure

#### Defined in

[packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts:301](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts#L301)

___

### count

▸ `Static` **count**(`vc`, `where`): `Promise`<`number`\>

Returns count of Ents matching a predicate. The query can span multiple
shards if their locations can be inferred from inverses related to the
fields mentioned in the query.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `where` | [`CountInput`](../modules.md#countinput)<`TTable`\> |

#### Returns

`Promise`<`number`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).count

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:138](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L138)

___

### insert

▸ `Static` **insert**(`vc`, `input`): `Promise`<`string`\>

Same as insertIfNotExists(), but throws if the Ent violates unique key
constraints.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`string`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).insert

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:55](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L55)

___

### insertIfNotExists

▸ `Static` **insertIfNotExists**(`vc`, `input`): `Promise`<``null`` \| `string`\>

Runs INSERT mutation for the Ent.
- The shard is inferred from the input fields using SHARD_AFFINITY.
- Returns ID of the newly inserted row.
- Returns null if the Ent violates unique key constraints.
- If the Ent has some triggers set up, this will be translated into two
  schema operations: idGen() and insert(), and before-triggers will run in
  between having the ID known in advance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<``null`` \| `string`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).insertIfNotExists

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:65](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L65)

___

### insertReturning

▸ `Static` **insertReturning**<`TEnt`\>(`vc`, `input`): `Promise`<`TEnt`\>

Same as insert(), but returns the created Ent.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](../interfaces/HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`TEnt`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).insertReturning

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:60](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L60)

___

### loadByNullable

▸ `Static` **loadByNullable**<`TEnt`\>(`vc`, `input`): `Promise`<``null`` \| `TEnt`\>

Loads an Ent by its unique key. Returns null if no such Ent exists. Notice
that the key must be REALLY unique, otherwise the database may return
multiple items, and the API will break. Don't try to use this method with
non-unique keys!

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](../interfaces/PrimitiveInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

#### Returns

`Promise`<``null`` \| `TEnt`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).loadByNullable

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:97](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L97)

___

### loadByX

▸ `Static` **loadByX**<`TEnt`\>(`vc`, `input`): `Promise`<`TEnt`\>

Loads an Ent by its ID. Throws if no such Ent is found.
This method is used VERY often.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](../interfaces/HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

#### Returns

`Promise`<`TEnt`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).loadByX

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:99](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L99)

___

### loadIfReadableNullable

▸ `Static` **loadIfReadableNullable**<`TEnt`\>(`vc`, `id`): `Promise`<``null`` \| `TEnt`\>

Same as loadNullable(), but if no permissions to read, returns null and
doesn't throw. It's more a convenience function rather than a concept.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](../interfaces/HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| `TEnt`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).loadIfReadableNullable

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:79](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L79)

___

### loadNullable

▸ `Static` **loadNullable**<`TEnt`\>(`vc`, `id`): `Promise`<``null`` \| `TEnt`\>

Loads an Ent by its ID. Returns null if no such Ent exists. Try to use
loadX() instead as much as you can.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](../interfaces/PrimitiveInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| `TEnt`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).loadNullable

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:85](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L85)

___

### loadX

▸ `Static` **loadX**<`TEnt`\>(`vc`, `id`): `Promise`<`TEnt`\>

Loads an Ent by its ID. Throws if no such Ent is found.
This method is used VERY often.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](../interfaces/HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `id` | `string` |

#### Returns

`Promise`<`TEnt`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).loadX

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:89](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L89)

___

### select

▸ `Static` **select**<`TEnt`\>(`vc`, `where`, `limit`, `order?`, `custom?`): `Promise`<`TEnt`[]\>

Loads the list of Ents by some predicate. The query can span multiple
shards if their locations can be inferred from inverses related to the
fields mentioned in the query. In multi-shard case, ordering of results is
not guaranteed.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](../interfaces/PrimitiveInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |
| `limit` | `number` |
| `order?` | [`Order`](../modules.md#order)<`TTable`\> |
| `custom?` | `Object` |

#### Returns

`Promise`<`TEnt`[]\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).select

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:109](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L109)

___

### selectChunked

▸ `Static` **selectChunked**<`TEnt`\>(`vc`, `where`, `chunkSize`, `limit`, `custom?`): `AsyncIterableIterator`<`TEnt`[]\>

Same as select(), but returns data in chunks and uses multiple select()
queries under the hood. The returned Ents are always ordered by ID. Also,
it always pulls data from a single shard and throws if this shard cannot be
unambiguously inferred from the input.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](../interfaces/PrimitiveInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |
| `chunkSize` | `number` |
| `limit` | `number` |
| `custom?` | `Object` |

#### Returns

`AsyncIterableIterator`<`TEnt`[]\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).selectChunked

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:124](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L124)

___

### upsert

▸ `Static` **upsert**(`vc`, `input`): `Promise`<`string`\>

Inserts an Ent or updates an existing one if unique key matches.
- Don't use upsert() too often, because upsert may still delete IDs even
  if the object was updated, not inserted (there is no good ways to solve
  this in some DB engines like SQL so far).
- Upsert can't work if some triggers are defined for the Ent, because we
  don't know Ent ID in advance (whether the upsert succeeds or skips on
  duplication).

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`string`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).upsert

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:79](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L79)

___

### upsertReturning

▸ `Static` **upsertReturning**<`TEnt`\>(`vc`, `input`): `Promise`<`TEnt`\>

Same, but returns the created/updated Ent.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](../interfaces/HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`TEnt`\>

#### Inherited from

BaseEnt(testCluster, schemaTestCountry).upsertReturning

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:69](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L69)
