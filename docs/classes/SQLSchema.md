[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLSchema

# Class: SQLSchema<TTable, TUniqueKey\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> = [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |

## Hierarchy

- [`Schema`](Schema.md)<`TTable`, `TUniqueKey`\>

  ↳ **`SQLSchema`**

## Constructors

### constructor

• **new SQLSchema**<`TTable`, `TUniqueKey`\>(`name`, `table`, `uniqueKey?`)

Used in e.g. inverses. This casts this.constructor to SchemaClass with all
static methods and `new` semantic (TS doesn't do it by default; for TS,
x.constructor is Function).

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

#### Inherited from

[Schema](Schema.md).[constructor](Schema.md#constructor)

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L42)

## Properties

### constructor

• **constructor**: [`SchemaClass`](../interfaces/SchemaClass.md)

Used in e.g. inverses. This casts this.constructor to SchemaClass with all
static methods and `new` semantic (TS doesn't do it by default; for TS,
x.constructor is Function).

#### Inherited from

Schema.constructor

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:97](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L97)

___

### hash

• `Readonly` **hash**: `string`

#### Inherited from

[Schema](Schema.md).[hash](Schema.md#hash)

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:40](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L40)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[Schema](Schema.md).[name](Schema.md#name)

___

### table

• `Readonly` **table**: `TTable`

#### Inherited from

[Schema](Schema.md).[table](Schema.md#table)

___

### uniqueKey

• `Readonly` **uniqueKey**: `TUniqueKey`

#### Inherited from

[Schema](Schema.md).[uniqueKey](Schema.md#uniquekey)

## Methods

### count

▸ **count**(`input`): [`Query`](../interfaces/Query.md)<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`CountInput`](../modules.md#countinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`number`\>

#### Overrides

[Schema](Schema.md).[count](Schema.md#count)

#### Defined in

[packages/ent-framework/src/sql/SQLSchema.ts:59](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLSchema.ts#L59)

___

### delete

▸ **delete**(`id`): [`Query`](../interfaces/Query.md)<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)<`boolean`\>

#### Overrides

[Schema](Schema.md).[delete](Schema.md#delete)

#### Defined in

[packages/ent-framework/src/sql/SQLSchema.ts:39](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLSchema.ts#L39)

___

### idGen

▸ **idGen**(): [`Query`](../interfaces/Query.md)<`string`\>

#### Returns

[`Query`](../interfaces/Query.md)<`string`\>

#### Overrides

[Schema](Schema.md).[idGen](Schema.md#idgen)

#### Defined in

[packages/ent-framework/src/sql/SQLSchema.ts:27](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLSchema.ts#L27)

___

### insert

▸ **insert**(`input`): [`Query`](../interfaces/Query.md)<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<``null`` \| `string`\>

#### Overrides

[Schema](Schema.md).[insert](Schema.md#insert)

#### Defined in

[packages/ent-framework/src/sql/SQLSchema.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLSchema.ts#L31)

___

### load

▸ **load**(`id`): [`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Overrides

[Schema](Schema.md).[load](Schema.md#load)

#### Defined in

[packages/ent-framework/src/sql/SQLSchema.ts:43](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLSchema.ts#L43)

___

### loadBy

▸ **loadBy**(`input`): [`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

#### Returns

[`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Overrides

[Schema](Schema.md).[loadBy](Schema.md#loadby)

#### Defined in

[packages/ent-framework/src/sql/SQLSchema.ts:47](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLSchema.ts#L47)

___

### select

▸ **select**(`input`): [`Query`](../interfaces/Query.md)<[`Row`](../modules.md#row)<`TTable`\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`SelectInput`](../modules.md#selectinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<[`Row`](../modules.md#row)<`TTable`\>[]\>

#### Overrides

[Schema](Schema.md).[select](Schema.md#select)

#### Defined in

[packages/ent-framework/src/sql/SQLSchema.ts:55](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLSchema.ts#L55)

___

### update

▸ **update**(`id`, `input`): [`Query`](../interfaces/Query.md)<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`boolean`\>

#### Overrides

[Schema](Schema.md).[update](Schema.md#update)

#### Defined in

[packages/ent-framework/src/sql/SQLSchema.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLSchema.ts#L51)

___

### upsert

▸ **upsert**(`input`): [`Query`](../interfaces/Query.md)<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`string`\>

#### Overrides

[Schema](Schema.md).[upsert](Schema.md#upsert)

#### Defined in

[packages/ent-framework/src/sql/SQLSchema.ts:35](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLSchema.ts#L35)
