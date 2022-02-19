[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Schema

# Class: Schema<TTable, TUniqueKey\>

Schema is like a "table" in some database (sharded, but it's beyond the scope
of Schema). It is also a factory of Query: it knows how to build runnable
Query objects. This 2nd role is database engine specific (e.g. there might be
SQLSchema, RedisSchema etc.): such composition simplifies the code and lowers
the number of abstractions.

The set of supported Queries is opinionated and is crafted carefully to
support the minimal possible list of primitives, but at the same time, be not
too limited in the queries the DB engine can execute.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> = [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |

## Hierarchy

- **`Schema`**

  ↳ [`SQLSchema`](SQLSchema.md)

## Constructors

### constructor

• **new Schema**<`TTable`, `TUniqueKey`\>(`name`, `table`, `uniqueKey?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends readonly { [K in string \| number \| symbol]: TTable[K] extends Object ? K : never }[keyof `TTable`][] = [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `table` | `TTable` |
| `uniqueKey` | `TUniqueKey` |

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L42)

## Properties

### constructor

• **constructor**: [`SchemaClass`](../interfaces/SchemaClass.md)

Used in e.g. inverses. This casts this.constructor to SchemaClass with all
static methods and `new` semantic (TS doesn't do it by default; for TS,
x.constructor is Function).

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:97](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L97)

___

### hash

• `Readonly` **hash**: `string`

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:40](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L40)

___

### name

• `Readonly` **name**: `string`

___

### table

• `Readonly` **table**: `TTable`

___

### uniqueKey

• `Readonly` **uniqueKey**: `TUniqueKey`

## Methods

### count

▸ `Abstract` **count**(`input`): [`Query`](../interfaces/Query.md)<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`CountInput`](../modules.md#countinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`number`\>

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:90](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L90)

___

### delete

▸ `Abstract` **delete**(`id`): [`Query`](../interfaces/Query.md)<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)<`boolean`\>

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:83](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L83)

___

### idGen

▸ `Abstract` **idGen**(): [`Query`](../interfaces/Query.md)<`string`\>

#### Returns

[`Query`](../interfaces/Query.md)<`string`\>

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:80](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L80)

___

### insert

▸ `Abstract` **insert**(`input`): [`Query`](../interfaces/Query.md)<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<``null`` \| `string`\>

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:81](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L81)

___

### load

▸ `Abstract` **load**(`id`): [`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:84](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L84)

___

### loadBy

▸ `Abstract` **loadBy**(`input`): [`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

#### Returns

[`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:85](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L85)

___

### select

▸ `Abstract` **select**(`input`): [`Query`](../interfaces/Query.md)<[`Row`](../modules.md#row)<`TTable`\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`SelectInput`](../modules.md#selectinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<[`Row`](../modules.md#row)<`TTable`\>[]\>

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:89](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L89)

___

### update

▸ `Abstract` **update**(`id`, `input`): [`Query`](../interfaces/Query.md)<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`boolean`\>

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:88](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L88)

___

### upsert

▸ `Abstract` **upsert**(`input`): [`Query`](../interfaces/Query.md)<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`string`\>

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:82](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L82)
