[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / HelpersClass

# Interface: HelpersClass<TTable, TUniqueKey, TClient\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |
| `TClient` | extends [`Client`](../classes/Client.md) |

## Hierarchy

- [`OmitNew`](../modules.md#omitnew)<[`PrimitiveClass`](../modules.md#primitiveclass)<`TTable`, `TUniqueKey`, `TClient`\>\>

  ↳ **`HelpersClass`**

## Constructors

### constructor

• **new HelpersClass**(...`args`)

TS requires us to have a public constructor to infer instance types in
various places. We make this constructor throw if it's called.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Inherited from

OmitNew<PrimitiveClass<TTable, TUniqueKey, TClient\>\>.constructor

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:109](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L109)

## Properties

### CLUSTER

• `Readonly` **CLUSTER**: [`Cluster`](../classes/Cluster.md)<`TClient`\>

A cluster where this Ent lives.

#### Inherited from

OmitNew.CLUSTER

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:41](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L41)

___

### Configuration

• `Readonly` **Configuration**: (`cfg`: [`Configuration`](../classes/Configuration.md)<`TTable`\>) => [`Configuration`](../classes/Configuration.md)<`TTable`\>

#### Type declaration

• **new HelpersClass**(`cfg`)

A helper class to work-around TS weakness in return value type inference:
https://github.com/Microsoft/TypeScript/issues/31273. It could've been just
a function, but having a class is a little more natural.

##### Parameters

| Name | Type |
| :------ | :------ |
| `cfg` | [`Configuration`](../classes/Configuration.md)<`TTable`\> |

#### Inherited from

OmitNew.Configuration

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:34](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L34)

___

### INVERSES

• `Readonly` **INVERSES**: [`Inverse`](../classes/Inverse.md)<`TClient`, `TTable`\>[]

Inverse assoc managers for fields.

#### Inherited from

OmitNew.INVERSES

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:71](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L71)

___

### SCHEMA

• `Readonly` **SCHEMA**: [`Schema`](../classes/Schema.md)<`TTable`, `TUniqueKey`\>

A schema which represents this Ent.

#### Inherited from

OmitNew.SCHEMA

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:46](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L46)

___

### SHARD\_AFFINITY

• `Readonly` **SHARD\_AFFINITY**: [`ShardAffinity`](../modules.md#shardaffinity)<[`IDFields`](../modules.md#idfields)<`TTable`\>\>

Defines how to find the right shard during Ent insertion.

#### Inherited from

OmitNew.SHARD\_AFFINITY

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L51)

___

### SHARD\_LOCATOR

• `Readonly` **SHARD\_LOCATOR**: [`ShardLocator`](../classes/ShardLocator.md)<`TClient`, [`IDFields`](../modules.md#idfields)<`TTable`\>\>

Shard locator for this Ent, responsible for resolving IDs into Shard objects.

#### Inherited from

OmitNew.SHARD\_LOCATOR

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:56](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L56)

___

### TRIGGERS

• `Readonly` **TRIGGERS**: [`Triggers`](../classes/Triggers.md)<`TTable`\>

Triggers for this Ent class.

#### Inherited from

OmitNew.TRIGGERS

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:66](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L66)

___

### VALIDATION

• `Readonly` **VALIDATION**: [`Validation`](../classes/Validation.md)<`TTable`\>

Privacy rules for this Ent class.

#### Inherited from

OmitNew.VALIDATION

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:61](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L61)

## Methods

### configure

▸ **configure**(): [`Configuration`](../classes/Configuration.md)<`TTable`\>

Some Ent parameters need to be configured lazily, on the 1st access,
because there could be cyclic references between Ent classes (e.g. in their
privacy rules). So configure() is called on some later stage, at the moment
of actual Ent operations (like loading, creation etc.). There is no static
abstract methods in TS yet, so making it non-abstract.

#### Returns

[`Configuration`](../classes/Configuration.md)<`TTable`\>

#### Inherited from

OmitNew.configure

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:27](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L27)

___

### count

▸ **count**(`vc`, `where`): `Promise`<`number`\>

Returns count of Ents matching a predicate. The query can span multiple
shards if their locations can be inferred from inverses related to the
fields mentioned in the query.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`CountInput`](../modules.md#countinput)<`TTable`\> |

#### Returns

`Promise`<`number`\>

#### Inherited from

OmitNew.count

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:138](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L138)

___

### insert

▸ **insert**(`vc`, `input`): `Promise`<`string`\>

Same as insertIfNotExists(), but throws if the Ent violates unique key
constraints.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:55](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L55)

___

### insertIfNotExists

▸ **insertIfNotExists**(`vc`, `input`): `Promise`<``null`` \| `string`\>

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
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<``null`` \| `string`\>

#### Inherited from

OmitNew.insertIfNotExists

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:65](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L65)

___

### insertReturning

▸ **insertReturning**<`TEnt`\>(`vc`, `input`): `Promise`<`TEnt`\>

Same as insert(), but returns the created Ent.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`TEnt`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:60](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L60)

___

### loadByNullable

▸ **loadByNullable**<`TEnt`\>(`vc`, `input`): `Promise`<``null`` \| `TEnt`\>

Loads an Ent by its unique key. Returns null if no such Ent exists. Notice
that the key must be REALLY unique, otherwise the database may return
multiple items, and the API will break. Don't try to use this method with
non-unique keys!

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

#### Returns

`Promise`<``null`` \| `TEnt`\>

#### Inherited from

OmitNew.loadByNullable

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:97](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L97)

___

### loadByX

▸ **loadByX**<`TEnt`\>(`vc`, `input`): `Promise`<`TEnt`\>

Loads an Ent by its ID. Throws if no such Ent is found.
This method is used VERY often.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

#### Returns

`Promise`<`TEnt`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:99](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L99)

___

### loadIfReadableNullable

▸ **loadIfReadableNullable**<`TEnt`\>(`vc`, `id`): `Promise`<``null`` \| `TEnt`\>

Same as loadNullable(), but if no permissions to read, returns null and
doesn't throw. It's more a convenience function rather than a concept.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| `TEnt`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:79](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L79)

___

### loadNullable

▸ **loadNullable**<`TEnt`\>(`vc`, `id`): `Promise`<``null`` \| `TEnt`\>

Loads an Ent by its ID. Returns null if no such Ent exists. Try to use
loadX() instead as much as you can.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| `TEnt`\>

#### Inherited from

OmitNew.loadNullable

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:85](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L85)

___

### loadX

▸ **loadX**<`TEnt`\>(`vc`, `id`): `Promise`<`TEnt`\>

Loads an Ent by its ID. Throws if no such Ent is found.
This method is used VERY often.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`<`TEnt`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:89](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L89)

___

### select

▸ **select**<`TEnt`\>(`vc`, `where`, `limit`, `order?`, `custom?`): `Promise`<`TEnt`[]\>

Loads the list of Ents by some predicate. The query can span multiple
shards if their locations can be inferred from inverses related to the
fields mentioned in the query. In multi-shard case, ordering of results is
not guaranteed.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |
| `limit` | `number` |
| `order?` | [`Order`](../modules.md#order)<`TTable`\> |
| `custom?` | `Object` |

#### Returns

`Promise`<`TEnt`[]\>

#### Inherited from

OmitNew.select

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:109](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L109)

___

### selectChunked

▸ **selectChunked**<`TEnt`\>(`vc`, `where`, `chunkSize`, `limit`, `custom?`): `AsyncIterableIterator`<`TEnt`[]\>

Same as select(), but returns data in chunks and uses multiple select()
queries under the hood. The returned Ents are always ordered by ID. Also,
it always pulls data from a single shard and throws if this shard cannot be
unambiguously inferred from the input.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |
| `chunkSize` | `number` |
| `limit` | `number` |
| `custom?` | `Object` |

#### Returns

`AsyncIterableIterator`<`TEnt`[]\>

#### Inherited from

OmitNew.selectChunked

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:124](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L124)

___

### upsert

▸ **upsert**(`vc`, `input`): `Promise`<`string`\>

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
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`string`\>

#### Inherited from

OmitNew.upsert

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:79](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L79)

___

### upsertReturning

▸ **upsertReturning**<`TEnt`\>(`vc`, `input`): `Promise`<`TEnt`\>

Same, but returns the created/updated Ent.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`TEnt`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:69](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L69)
