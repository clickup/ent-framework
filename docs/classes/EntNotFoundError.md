[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntNotFoundError

# Class: EntNotFoundError

Error: non-existing ID in the database.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntNotFoundError()

> **new EntNotFoundError**(`entName`, `where`, `cause`): [`EntNotFoundError`](EntNotFoundError.md)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `entName` | `string` | `undefined` |
| `where` | `Record`\<`string`, `unknown`\> | `undefined` |
| `cause` | `unknown` | `null` |

#### Returns

[`EntNotFoundError`](EntNotFoundError.md)

#### Overrides

[`EntAccessError`](EntAccessError.md).[`constructor`](EntAccessError.md#constructors)

#### Defined in

[src/ent/errors/EntNotFoundError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotFoundError.ts#L8)

## Properties

| Property | Type |
| ------ | ------ |
| `cause` | `null` \| `string` \| `Error` |
| `entName` | `string` |
| `where` | `Record`\<`string`, `unknown`\> |
