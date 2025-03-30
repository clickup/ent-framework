[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntNotReadableError

# Class: EntNotReadableError

Defined in: [src/ent/errors/EntNotReadableError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotReadableError.ts#L8)

Error: thrown when an Ent cannot be read due to privacy reasons.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntNotReadableError()

> **new EntNotReadableError**(`entName`, `vc`, `row`, `cause`): [`EntNotReadableError`](EntNotReadableError.md)

Defined in: [src/ent/errors/EntNotReadableError.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotReadableError.ts#L9)

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

## Properties

| Property | Type |
| ------ | ------ |
| <a id="cause-1"></a> `cause` | `null` \| `string` \| `Error` |
| <a id="entname-1"></a> `entName` | `string` |
| <a id="vc-1"></a> `vc` | `string` |
| <a id="row-1"></a> `row` | [`RowWithID`](../type-aliases/RowWithID.md) |

## Methods

### toStandardSchemaV1()

> **toStandardSchemaV1**(): [`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)

Defined in: [src/ent/errors/EntAccessError.ts:52](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L52)

#### Returns

[`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)

#### Inherited from

[`EntAccessError`](EntAccessError.md).[`toStandardSchemaV1`](EntAccessError.md#tostandardschemav1)
