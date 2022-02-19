[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLQueryDeleteWhere

# Class: SQLQueryDeleteWhere<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`QueryBase`](QueryBase.md)<`TTable`, [`DeleteWhereInput`](../modules.md#deletewhereinput)<`TTable`\>, `string`[], [`SQLClient`](../interfaces/SQLClient.md)\>

  ↳ **`SQLQueryDeleteWhere`**

## Constructors

### constructor

• **new SQLQueryDeleteWhere**<`TTable`\>(`schema`, `input`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `input` | [`DeleteWhereInput`](../modules.md#deletewhereinput)<`TTable`\> |

#### Inherited from

[QueryBase](QueryBase.md).[constructor](QueryBase.md#constructor)

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:28](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L28)

## Properties

### RUNNER\_CLASS

• `Protected` `Readonly` **RUNNER\_CLASS**: typeof [`SQLRunnerDeleteWhere`](SQLRunnerDeleteWhere.md) = `SQLRunnerDeleteWhere`

#### Overrides

[QueryBase](QueryBase.md).[RUNNER_CLASS](QueryBase.md#runner_class)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryDeleteWhere.ts:14](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryDeleteWhere.ts#L14)

___

### input

• `Readonly` **input**: [`DeleteWhereInput`](../modules.md#deletewhereinput)<`TTable`\>

#### Inherited from

[QueryBase](QueryBase.md).[input](QueryBase.md#input)

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

#### Inherited from

[QueryBase](QueryBase.md).[schema](QueryBase.md#schema)

## Accessors

### IS\_WRITE

• `get` **IS_WRITE**(): `boolean`

#### Returns

`boolean`

#### Inherited from

QueryBase.IS\_WRITE

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:38](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L38)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`<`string`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`SQLClient`](../interfaces/SQLClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`<`string`[]\>

#### Inherited from

[QueryBase](QueryBase.md).[run](QueryBase.md#run)

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L42)
