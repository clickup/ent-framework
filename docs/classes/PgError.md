[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgError

# Class: PgError

Encapsulates the error thrown when running a Client query. The object also
carries suggestions, what to do next.

## Hierarchy

- [`ClientError`](ClientError.md)

  ↳ **`PgError`**

## Constructors

### constructor

• **new PgError**(`cause`, `where`, `sql`): [`PgError`](PgError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `cause` | `undefined` \| ``null`` \| {} |
| `where` | `string` |
| `sql` | `string` |

#### Returns

[`PgError`](PgError.md)

#### Overrides

[ClientError](ClientError.md).[constructor](ClientError.md#constructor)

#### Defined in

[src/pg/PgError.ts:4](https://github.com/clickup/ent-framework/blob/master/src/pg/PgError.ts#L4)

## Properties

### cause

• `Readonly` **cause**: `undefined` \| ``null`` \| \{ `message?`: `unknown` ; `stack?`: `unknown`  }

#### Inherited from

[ClientError](ClientError.md).[cause](ClientError.md#cause)

#### Defined in

[src/abstract/ClientError.ts:25](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L25)

___

### postAction

• `Readonly` **postAction**: [`ClientErrorPostAction`](../modules.md#clienterrorpostaction)

#### Inherited from

[ClientError](ClientError.md).[postAction](ClientError.md#postaction)

#### Defined in

[src/abstract/ClientError.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L30)

___

### kind

• `Readonly` **kind**: [`ClientErrorKind`](../modules.md#clienterrorkind)

#### Inherited from

[ClientError](ClientError.md).[kind](ClientError.md#kind)

#### Defined in

[src/abstract/ClientError.ts:31](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L31)

___

### comment

• `Optional` `Readonly` **comment**: `string`

#### Inherited from

[ClientError](ClientError.md).[comment](ClientError.md#comment)

#### Defined in

[src/abstract/ClientError.ts:32](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L32)

___

### sql

• `Readonly` **sql**: `string`

#### Defined in

[src/pg/PgError.ts:7](https://github.com/clickup/ent-framework/blob/master/src/pg/PgError.ts#L7)

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

[src/pg/PgError.ts:20](https://github.com/clickup/ent-framework/blob/master/src/pg/PgError.ts#L20)
