[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ClientError

# Class: ClientError

Encapsulates the error thrown when running a Client query. The object also
carries suggestions, what to do next.

## Hierarchy

- `Error`

  ↳ **`ClientError`**

  ↳↳ [`PgError`](PgError.md)

## Constructors

### constructor

• **new ClientError**(`cause`, `where`, `postAction`, `kind`, `abbreviation`, `comment?`): [`ClientError`](ClientError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `cause` | `MaybeError` |
| `where` | `string` |
| `postAction` | [`ClientErrorPostAction`](../modules.md#clienterrorpostaction) |
| `kind` | [`ClientErrorKind`](../modules.md#clienterrorkind) |
| `abbreviation` | `string` |
| `comment?` | `string` |

#### Returns

[`ClientError`](ClientError.md)

#### Overrides

Error.constructor

#### Defined in

[src/abstract/ClientError.ts:44](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L44)

## Properties

### cause

• `Readonly` **cause**: `MaybeError`

#### Defined in

[src/abstract/ClientError.ts:45](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L45)

___

### postAction

• `Readonly` **postAction**: [`ClientErrorPostAction`](../modules.md#clienterrorpostaction)

#### Defined in

[src/abstract/ClientError.ts:47](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L47)

___

### kind

• `Readonly` **kind**: [`ClientErrorKind`](../modules.md#clienterrorkind)

#### Defined in

[src/abstract/ClientError.ts:48](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L48)

___

### abbreviation

• `Readonly` **abbreviation**: `string`

#### Defined in

[src/abstract/ClientError.ts:49](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L49)

___

### comment

• `Optional` `Readonly` **comment**: `string`

#### Defined in

[src/abstract/ClientError.ts:50](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L50)
