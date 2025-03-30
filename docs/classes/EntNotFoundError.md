[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntNotFoundError

# Class: EntNotFoundError

Defined in: [src/ent/errors/EntNotFoundError.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotFoundError.ts#L9)

Error: non-existing ID in the database (failed loadX() call), or non-existing
Ent (failed loadByX() call). Notice that `where` data is intentionally NOT
considered as private and may be delivered to the client.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntNotFoundError()

> **new EntNotFoundError**(`entName`, `where`, `cause`): [`EntNotFoundError`](EntNotFoundError.md)

Defined in: [src/ent/errors/EntNotFoundError.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotFoundError.ts#L10)

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

## Methods

### toStandardSchemaV1()

> **toStandardSchemaV1**(): [`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)

Defined in: [src/ent/errors/EntAccessError.ts:52](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L52)

#### Returns

[`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)

#### Inherited from

[`EntAccessError`](EntAccessError.md).[`toStandardSchemaV1`](EntAccessError.md#tostandardschemav1)
