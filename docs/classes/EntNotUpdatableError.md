[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntNotUpdatableError

# Class: EntNotUpdatableError

Error: thrown when an Ent cannot be updated or deleted due to privacy reasons.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntNotUpdatableError()

> **new EntNotUpdatableError**(`entName`, `vc`, `row`, `cause`): [`EntNotUpdatableError`](EntNotUpdatableError.md)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `entName` | `string` | `undefined` |
| `vc` | `string` | `undefined` |
| `row` | [`RowWithID`](../type-aliases/RowWithID.md) | `undefined` |
| `cause` | `unknown` | `null` |

#### Returns

[`EntNotUpdatableError`](EntNotUpdatableError.md)

#### Overrides

[`EntAccessError`](EntAccessError.md).[`constructor`](EntAccessError.md#constructors)

#### Defined in

[src/ent/errors/EntNotUpdatableError.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotUpdatableError.ts#L9)

## Properties

| Property | Type |
| ------ | ------ |
| `cause` | `null` \| `string` \| `Error` |
| `entName` | `string` |
| `vc` | `string` |
| `row` | [`RowWithID`](../type-aliases/RowWithID.md) |
