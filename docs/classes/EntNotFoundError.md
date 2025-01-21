[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntNotFoundError

# Class: EntNotFoundError

Defined in: [src/ent/errors/EntNotFoundError.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotFoundError.ts#L7)

Error: non-existing ID in the database.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntNotFoundError()

> **new EntNotFoundError**(`entName`, `where`, `cause`): [`EntNotFoundError`](EntNotFoundError.md)

Defined in: [src/ent/errors/EntNotFoundError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotFoundError.ts#L8)

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

## Properties

| Property | Type |
| ------ | ------ |
| <a id="cause-1"></a> `cause` | `null` \| `string` \| `Error` |
| <a id="entname-1"></a> `entName` | `string` |
| <a id="where-1"></a> `where` | `Record`\<`string`, `unknown`\> |
