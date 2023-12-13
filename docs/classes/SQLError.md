[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLError

# Class: SQLError

Encapsulates the error message passed from the DB server. Notice that in case
of e.g. connection reset errors or network timeouts, this error is NOT thrown
(because we actually don't know whether the server applied the query or not);
instead, some other exception (lower level) is raised.

## Hierarchy

- [`ServerError`](ServerError.md)

  ↳ **`SQLError`**

## Constructors

### constructor

• **new SQLError**(`origError`, `destName`, `sql`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `origError` | `any` |
| `destName` | `string` |
| `sql` | `string` |

#### Overrides

[ServerError](ServerError.md).[constructor](ServerError.md#constructor)

#### Defined in

[src/sql/SQLError.ts:4](https://github.com/clickup/rest-client/blob/master/src/sql/SQLError.ts#L4)

## Properties

### origError

• `Readonly` **origError**: `any`

#### Inherited from

[ServerError](ServerError.md).[origError](ServerError.md#origerror)

#### Defined in

[src/abstract/ServerError.ts:10](https://github.com/clickup/rest-client/blob/master/src/abstract/ServerError.ts#L10)

___

### sql

• `Readonly` **sql**: `string`

#### Defined in

[src/sql/SQLError.ts:4](https://github.com/clickup/rest-client/blob/master/src/sql/SQLError.ts#L4)

## Methods

### isFKError

▸ **isFKError**(`fkName?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fkName?` | `string` |

#### Returns

`boolean`

#### Defined in

[src/sql/SQLError.ts:16](https://github.com/clickup/rest-client/blob/master/src/sql/SQLError.ts#L16)
