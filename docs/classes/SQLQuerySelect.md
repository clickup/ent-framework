[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLQuerySelect

# Class: SQLQuerySelect<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`QueryBase`](QueryBase.md)<`TTable`, [`SelectInput`](../modules.md#selectinput)<`TTable`\>, [`Row`](../modules.md#row)<`TTable`\>[], [`SQLClient`](../interfaces/SQLClient.md)\>

  ↳ **`SQLQuerySelect`**

## Constructors

### constructor

• **new SQLQuerySelect**<`TTable`\>(`schema`, `input`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `input` | [`SelectInput`](../modules.md#selectinput)<`TTable`\> |

#### Inherited from

[QueryBase](QueryBase.md).[constructor](QueryBase.md#constructor)

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:28](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L28)

## Properties

### RUNNER\_CLASS

• `Protected` `Readonly` **RUNNER\_CLASS**: typeof [`SQLRunnerSelect`](SQLRunnerSelect.md) = `SQLRunnerSelect`

#### Overrides

[QueryBase](QueryBase.md).[RUNNER_CLASS](QueryBase.md#runner_class)

#### Defined in

[packages/ent-framework/src/sql/SQLQuerySelect.ts:15](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQuerySelect.ts#L15)

___

### input

• `Readonly` **input**: [`SelectInput`](../modules.md#selectinput)<`TTable`\>

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

▸ **run**(`client`, `annotation`): `Promise`<[`Row`](../modules.md#row)<`TTable`\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`SQLClient`](../interfaces/SQLClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`<[`Row`](../modules.md#row)<`TTable`\>[]\>

#### Inherited from

[QueryBase](QueryBase.md).[run](QueryBase.md#run)

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L42)
