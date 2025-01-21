[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntNotUpdatableError

# Class: EntNotUpdatableError

Defined in: [src/ent/errors/EntNotUpdatableError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotUpdatableError.ts#L8)

Error: thrown when an Ent cannot be updated or deleted due to privacy reasons.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntNotUpdatableError()

> **new EntNotUpdatableError**(`entName`, `vc`, `row`, `cause`): [`EntNotUpdatableError`](EntNotUpdatableError.md)

Defined in: [src/ent/errors/EntNotUpdatableError.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotUpdatableError.ts#L9)

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

## Properties

| Property | Type |
| ------ | ------ |
| <a id="cause-1"></a> `cause` | `null` \| `string` \| `Error` |
| <a id="entname-1"></a> `entName` | `string` |
| <a id="vc-1"></a> `vc` | `string` |
| <a id="row-1"></a> `row` | [`RowWithID`](../type-aliases/RowWithID.md) |
