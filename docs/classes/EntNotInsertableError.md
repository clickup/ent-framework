[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntNotInsertableError

# Class: EntNotInsertableError

Defined in: [src/ent/errors/EntNotInsertableError.ts:6](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotInsertableError.ts#L6)

Error: thrown when an Ent cannot be inserted due to privacy reasons.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntNotInsertableError()

> **new EntNotInsertableError**(`entName`, `vc`, `row`, `cause`): [`EntNotInsertableError`](EntNotInsertableError.md)

Defined in: [src/ent/errors/EntNotInsertableError.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotInsertableError.ts#L7)

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

## Properties

| Property | Type |
| ------ | ------ |
| <a id="cause-1"></a> `cause` | `null` \| `string` \| `Error` |
| <a id="entname-1"></a> `entName` | `string` |
| <a id="vc-1"></a> `vc` | `string` |
| <a id="row-1"></a> `row` | `object` |

## Methods

### toStandardSchemaV1()

> **toStandardSchemaV1**(): [`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)

Defined in: [src/ent/errors/EntAccessError.ts:52](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L52)

#### Returns

[`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)

#### Inherited from

[`EntAccessError`](EntAccessError.md).[`toStandardSchemaV1`](EntAccessError.md#tostandardschemav1)
