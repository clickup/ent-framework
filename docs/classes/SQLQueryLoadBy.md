[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLQueryLoadBy

# Class: SQLQueryLoadBy<TTable, TUniqueKey\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |

## Hierarchy

- [`QueryBase`](QueryBase.md)<`TTable`, [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\>, [`Row`](../modules.md#row)<`TTable`\> \| ``null``, [`SQLClient`](../interfaces/SQLClient.md)\>

  ↳ **`SQLQueryLoadBy`**

## Constructors

### constructor

• **new SQLQueryLoadBy**<`TTable`, `TUniqueKey`\>(`schema`, `input`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends readonly { [K in string \| number \| symbol]: TTable[K] extends Object ? K : never }[keyof `TTable`][] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

#### Inherited from

[QueryBase](QueryBase.md).[constructor](QueryBase.md#constructor)

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:28](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L28)

## Properties

### RUNNER\_CLASS

• `Protected` `Readonly` **RUNNER\_CLASS**: typeof [`SQLRunnerLoadBy`](SQLRunnerLoadBy.md) = `SQLRunnerLoadBy`

#### Overrides

[QueryBase](QueryBase.md).[RUNNER_CLASS](QueryBase.md#runner_class)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryLoadBy.ts:17](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryLoadBy.ts#L17)

___

### input

• `Readonly` **input**: [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\>

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

▸ **run**(`client`, `annotation`): `Promise`<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`SQLClient`](../interfaces/SQLClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Inherited from

[QueryBase](QueryBase.md).[run](QueryBase.md#run)

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L42)
