[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / EntNotInsertableError

# Class: EntNotInsertableError

Error: thrown when an Ent cannot be inserted due to privacy reasons.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntNotInsertableError()

> **new EntNotInsertableError**(`entName`, `vc`, `row`, `cause`): [`EntNotInsertableError`](EntNotInsertableError.md)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `entName` | `string` | `undefined` |
| `vc` | `string` | `undefined` |
| `row` | `object` | `undefined` |
| `cause` | `unknown` | `null` |

#### Returns

[`EntNotInsertableError`](EntNotInsertableError.md)

#### Overrides

[`EntAccessError`](EntAccessError.md).[`constructor`](EntAccessError.md#constructors)

#### Defined in

[src/ent/errors/EntNotInsertableError.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotInsertableError.ts#L7)

## Properties

| Property | Type |
| ------ | ------ |
| `cause` | `null` \| `string` \| `Error` |
| `entName` | `string` |
| `vc` | `string` |
| `row` | `object` |
