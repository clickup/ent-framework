[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLQueryCount

# Class: SQLQueryCount<TTable\>

A convenient base class for most (but not all) of the queries, where the
Runner instance is the same for different query input shapes. If the query
doesn't fit the QueryBase framework (like SQLQueryUpdate for instance where
we have separate Runner instances for separate set of updated fields), a
Query is used directly instead.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`QueryBase`](QueryBase.md)<`TTable`, [`CountInput`](../modules.md#countinput)<`TTable`\>, `number`, [`SQLClient`](SQLClient.md)\>

  ↳ **`SQLQueryCount`**

## Constructors

### constructor

• **new SQLQueryCount**<`TTable`\>(`schema`, `input`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `input` | [`CountInput`](../modules.md#countinput)<`TTable`\> |

#### Inherited from

[QueryBase](QueryBase.md).[constructor](QueryBase.md#constructor)

#### Defined in

[src/abstract/QueryBase.ts:27](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L27)

## Properties

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

#### Inherited from

[QueryBase](QueryBase.md).[schema](QueryBase.md#schema)

#### Defined in

[src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

___

### input

• `Readonly` **input**: [`CountInput`](../modules.md#countinput)<`TTable`\>

#### Inherited from

[QueryBase](QueryBase.md).[input](QueryBase.md#input)

#### Defined in

[src/abstract/QueryBase.ts:29](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L29)

___

### RUNNER\_CLASS

• `Protected` `Readonly` **RUNNER\_CLASS**: typeof [`SQLRunnerCount`](SQLRunnerCount.md) = `SQLRunnerCount`

#### Overrides

[QueryBase](QueryBase.md).[RUNNER_CLASS](QueryBase.md#runner_class)

#### Defined in

[src/sql/SQLQueryCount.ts:14](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLQueryCount.ts#L14)

## Accessors

### IS\_WRITE

• `get` **IS_WRITE**(): `boolean`

#### Returns

`boolean`

#### Inherited from

QueryBase.IS\_WRITE

#### Defined in

[src/abstract/QueryBase.ts:32](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L32)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`SQLClient`](SQLClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`<`number`\>

#### Inherited from

[QueryBase](QueryBase.md).[run](QueryBase.md#run)

#### Defined in

[src/abstract/QueryBase.ts:36](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L36)
