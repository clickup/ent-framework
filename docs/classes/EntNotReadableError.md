[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntNotReadableError

# Class: EntNotReadableError

Error: thrown when an Ent cannot be read due to privacy reasons.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntNotReadableError()

> **new EntNotReadableError**(`entName`, `vc`, `row`, `cause`): [`EntNotReadableError`](EntNotReadableError.md)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `entName` | `string` | `undefined` |
| `vc` | `string` | `undefined` |
| `row` | [`RowWithID`](../type-aliases/RowWithID.md) | `undefined` |
| `cause` | `unknown` | `null` |

#### Returns

[`EntNotReadableError`](EntNotReadableError.md)

#### Overrides

[`EntAccessError`](EntAccessError.md).[`constructor`](EntAccessError.md#constructors)

#### Defined in

[src/ent/errors/EntNotReadableError.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotReadableError.ts#L9)

## Properties

| Property | Type |
| ------ | ------ |
| `cause` | `null` \| `string` \| `Error` |
| `entName` | `string` |
| `vc` | `string` |
| `row` | [`RowWithID`](../type-aliases/RowWithID.md) |
