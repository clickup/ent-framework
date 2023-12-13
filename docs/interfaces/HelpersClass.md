[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / HelpersClass

# Interface: HelpersClass<TTable, TUniqueKey, TClient\>

Removes constructor signature from a type.
https://github.com/microsoft/TypeScript/issues/40110#issuecomment-747142570

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

• **new HelpersClass**(`...args`)

TS requires us to have a public constructor to infer instance types in
various places. We make this constructor throw if it's called.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Inherited from

OmitNew<PrimitiveClass<TTable, TUniqueKey, TClient\>\>.constructor

#### Defined in

[src/ent/mixins/HelpersMixin.ts:130](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L130)

## Properties

### Configuration

• `Readonly` **Configuration**: (`cfg`: [`Configuration`](../classes/Configuration.md)<`TTable`\>) => [`Configuration`](../classes/Configuration.md)<`TTable`\>

#### Type declaration

• **new Configuration**(`cfg`)

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

[src/ent/mixins/ConfigMixin.ts:36](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/ConfigMixin.ts#L36)

___

### CLUSTER

• `Readonly` **CLUSTER**: [`Cluster`](../classes/Cluster.md)<`TClient`, `any`\>

A Cluster where this Ent lives.

#### Inherited from

OmitNew.CLUSTER

#### Defined in

[src/ent/mixins/ConfigMixin.ts:43](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/ConfigMixin.ts#L43)

___

### SCHEMA

• `Readonly` **SCHEMA**: [`Schema`](../classes/Schema.md)<`TTable`, `TUniqueKey`\>

A schema which represents this Ent.

#### Inherited from

OmitNew.SCHEMA

#### Defined in

[src/ent/mixins/ConfigMixin.ts:48](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/ConfigMixin.ts#L48)

___

### SHARD\_AFFINITY

• `Readonly` **SHARD\_AFFINITY**: [`ShardAffinity`](../modules.md#shardaffinity)<[`FieldOfIDType`](../modules.md#fieldofidtype)<`TTable`\>\>

Defines how to find the right Shard during Ent insertion.

#### Inherited from

OmitNew.SHARD\_AFFINITY

#### Defined in

[src/ent/mixins/ConfigMixin.ts:53](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/ConfigMixin.ts#L53)

___

### SHARD\_LOCATOR

• `Readonly` **SHARD\_LOCATOR**: [`ShardLocator`](../classes/ShardLocator.md)<`TClient`, [`FieldOfIDType`](../modules.md#fieldofidtype)<`TTable`\>\>

Shard locator for this Ent, responsible for resolving IDs into Shard objects.

#### Inherited from

OmitNew.SHARD\_LOCATOR

#### Defined in

[src/ent/mixins/ConfigMixin.ts:58](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/ConfigMixin.ts#L58)

___

### VALIDATION

• `Readonly` **VALIDATION**: [`Validation`](../classes/Validation.md)<`TTable`\>

Privacy rules for this Ent class.

#### Inherited from

OmitNew.VALIDATION

#### Defined in

[src/ent/mixins/ConfigMixin.ts:63](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/ConfigMixin.ts#L63)

___

### TRIGGERS

• `Readonly` **TRIGGERS**: [`Triggers`](../classes/Triggers.md)<`TTable`\>

Triggers for this Ent class.

#### Inherited from

OmitNew.TRIGGERS

#### Defined in

[src/ent/mixins/ConfigMixin.ts:68](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/ConfigMixin.ts#L68)

___

### INVERSES

• `Readonly` **INVERSES**: [`Inverse`](../classes/Inverse.md)<`TClient`, `TTable`\>[]

Inverse assoc managers for fields.

#### Inherited from

OmitNew.INVERSES

#### Defined in

[src/ent/mixins/ConfigMixin.ts:73](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/ConfigMixin.ts#L73)

___

### insert

• **insert**: (`vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../modules.md#insertinput)<`TTable`\>) => `Promise`<`string`\>

#### Type declaration

▸ (`vc`, `input`): `Promise`<`string`\>

Same as insertIfNotExists(), but throws if the Ent violates unique key
constraints.

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

##### Returns

`Promise`<`string`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:76](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L76)

___

### insertReturning

• **insertReturning**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../modules.md#insertinput)<`TTable`\>) => `Promise`<`TEnt`\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `input`): `Promise`<`TEnt`\>

Same as insert(), but returns the created Ent.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

##### Returns

`Promise`<`TEnt`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:81](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L81)

___

### upsertReturning

• **upsertReturning**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../modules.md#insertinput)<`TTable`\>) => `Promise`<`TEnt`\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `input`): `Promise`<`TEnt`\>

Same, but returns the created/updated Ent.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

##### Returns

`Promise`<`TEnt`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:90](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L90)

___

### loadIfReadableNullable

• **loadIfReadableNullable**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `id`: `string`) => `Promise`<``null`` \| `TEnt`\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `id`): `Promise`<``null`` \| `TEnt`\>

Same as loadNullable(), but if no permissions to read, returns null and
doesn't throw. It's more a convenience function rather than a concept.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

##### Returns

`Promise`<``null`` \| `TEnt`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:100](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L100)

___

### loadX

• **loadX**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `id`: `string`) => `Promise`<`TEnt`\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `id`): `Promise`<`TEnt`\>

Loads an Ent by its ID. Throws if no such Ent is found.
This method is used VERY often.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

##### Returns

`Promise`<`TEnt`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:110](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L110)

___

### loadByX

• **loadByX**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\>) => `Promise`<`TEnt`\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `input`): `Promise`<`TEnt`\>

Loads an Ent by its ID. Throws if no such Ent is found.
This method is used VERY often.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

##### Returns

`Promise`<`TEnt`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:120](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L120)

___

### insertIfNotExists

• **insertIfNotExists**: (`vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../modules.md#insertinput)<`TTable`\>) => `Promise`<``null`` \| `string`\>

#### Type declaration

▸ (`vc`, `input`): `Promise`<``null`` \| `string`\>

Runs INSERT mutation for the Ent.
- The Shard is inferred from the input fields using SHARD_AFFINITY.
- Returns ID of the newly inserted row.
- Returns null if the Ent violates unique key constraints.
- If the Ent has some triggers set up, this will be translated into two
  schema operations: idGen() and insert(), and before-triggers will run in
  between having the ID known in advance.

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

##### Returns

`Promise`<``null`` \| `string`\>

#### Inherited from

OmitNew.insertIfNotExists

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:81](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L81)

___

### upsert

• **upsert**: (`vc`: [`VC`](../classes/VC.md), `input`: [`InsertInput`](../modules.md#insertinput)<`TTable`\>) => `Promise`<`string`\>

#### Type declaration

▸ (`vc`, `input`): `Promise`<`string`\>

Inserts an Ent or updates an existing one if unique key matches.
- Don't use upsert() too often, because upsert may still delete IDs even
  if the object was updated, not inserted (there is no good ways to solve
  this in some DB engines like SQL so far).
- Upsert can't work if some triggers are defined for the Ent, because we
  don't know Ent ID in advance (whether the upsert succeeds or skips on
  duplication).

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

##### Returns

`Promise`<`string`\>

#### Inherited from

OmitNew.upsert

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:95](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L95)

___

### loadNullable

• **loadNullable**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `id`: `string`) => `Promise`<``null`` \| `TEnt`\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `id`): `Promise`<``null`` \| `TEnt`\>

Loads an Ent by its ID. Returns null if no such Ent exists. Try to use
loadX() instead as much as you can.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

##### Returns

`Promise`<``null`` \| `TEnt`\>

#### Inherited from

OmitNew.loadNullable

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:101](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L101)

___

### loadByNullable

• **loadByNullable**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\>) => `Promise`<``null`` \| `TEnt`\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `input`): `Promise`<``null`` \| `TEnt`\>

Loads an Ent by its unique key. Returns null if no such Ent exists. Notice
that the key must be REALLY unique, otherwise the database may return
multiple items, and the API will break. Don't try to use this method with
non-unique keys!

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

##### Returns

`Promise`<``null`` \| `TEnt`\>

#### Inherited from

OmitNew.loadByNullable

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:113](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L113)

___

### selectBy

• **selectBy**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `input`: [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, [`TuplePrefixes`](../modules.md#tupleprefixes)<`TUniqueKey`\>\>) => `Promise`<`TEnt`[]\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `input`): `Promise`<`TEnt`[]\>

Selects the list of Ents by their unique key prefix. The query can span
multiple Shards if their locations can be inferred from inverses related to
the fields mentioned in the query. Ordering of the results is not
guaranteed.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, [`TuplePrefixes`](../modules.md#tupleprefixes)<`TUniqueKey`\>\> |

##### Returns

`Promise`<`TEnt`[]\>

#### Inherited from

OmitNew.selectBy

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:125](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L125)

___

### select

• **select**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `where`: [`Where`](../modules.md#where)<`TTable`\>, `limit`: `number`, `order?`: [`Order`](../modules.md#order)<`TTable`\>, `custom?`: {}) => `Promise`<`TEnt`[]\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `where`, `limit`, `order?`, `custom?`): `Promise`<`TEnt`[]\>

Selects the list of Ents by some predicate.
- The query can span multiple Shards if their locations can be inferred
  from inverses related to the fields mentioned in the query.
- In multi-Shard case, ordering of results is not guaranteed.
- In multi-Shard case, it may return more results than requested by limit
  (basically, limit is applied to each Shard individually). The caller has
  then freedom to reorder & slice the results as they wish.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |
| `limit` | `number` |
| `order?` | [`Order`](../modules.md#order)<`TTable`\> |
| `custom?` | `Object` |

##### Returns

`Promise`<`TEnt`[]\>

#### Inherited from

OmitNew.select

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:140](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L140)

___

### selectChunked

• **selectChunked**: <TEnt\>(`this`: (...`args`: `any`[]) => `TEnt`, `vc`: [`VC`](../classes/VC.md), `where`: [`Where`](../modules.md#where)<`TTable`\>, `chunkSize`: `number`, `limit`: `number`, `custom?`: {}) => `AsyncIterableIterator`<`TEnt`[]\>

#### Type declaration

▸ <`TEnt`\>(`this`, `vc`, `where`, `chunkSize`, `limit`, `custom?`): `AsyncIterableIterator`<`TEnt`[]\>

Same as select(), but returns data in chunks.
- Uses multiple select() queries under the hood.
- The query can span multiple Shards if their locations can be inferred
  from inverses related to the fields mentioned in the query.
- Ents in each chunk always belong to the same Shard and are ordered by ID
  (there is no support for custom ordering). Make sure you have the right
  index in the database.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | (...`args`: `any`[]) => `TEnt` |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |
| `chunkSize` | `number` |
| `limit` | `number` |
| `custom?` | `Object` |

##### Returns

`AsyncIterableIterator`<`TEnt`[]\>

#### Inherited from

OmitNew.selectChunked

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:158](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L158)

___

### count

• **count**: (`vc`: [`VC`](../classes/VC.md), `where`: [`CountInput`](../modules.md#countinput)<`TTable`\>) => `Promise`<`number`\>

#### Type declaration

▸ (`vc`, `where`): `Promise`<`number`\>

Returns count of Ents matching a predicate. The query can span multiple
Shards if their locations can be inferred from inverses related to the
fields mentioned in the query.

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`CountInput`](../modules.md#countinput)<`TTable`\> |

##### Returns

`Promise`<`number`\>

#### Inherited from

OmitNew.count

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:172](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L172)

___

### exists

• **exists**: (`vc`: [`VC`](../classes/VC.md), `where`: [`ExistsInput`](../modules.md#existsinput)<`TTable`\>) => `Promise`<`boolean`\>

#### Type declaration

▸ (`vc`, `where`): `Promise`<`boolean`\>

A more optimal approach than count() when we basically just need to know
whether we have "0 or not 0" rows.

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`ExistsInput`](../modules.md#existsinput)<`TTable`\> |

##### Returns

`Promise`<`boolean`\>

#### Inherited from

OmitNew.exists

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:178](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L178)

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

[src/ent/mixins/ConfigMixin.ts:29](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/ConfigMixin.ts#L29)
