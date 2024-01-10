[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / ClientError

# Class: ClientError

Encapsulates the error thrown when running a Client query. The object also
carries suggestions, what to do next.

## Hierarchy

- `Error`

  ↳ **`ClientError`**

  ↳↳ [`SQLError`](SQLError.md)

## Constructors

### constructor

• **new ClientError**(`cause`, `where`, `postAction`, `kind`, `comment?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `cause` | `undefined` \| ``null`` \| { `message?`: `unknown` ; `stack?`: `unknown`  } |
| `where` | `string` |
| `postAction` | [`ClientErrorPostAction`](../modules.md#clienterrorpostaction) |
| `kind` | [`ClientErrorKind`](../modules.md#clienterrorkind) |
| `comment?` | `string` |

#### Overrides

Error.constructor

#### Defined in

[src/abstract/ClientError.ts:24](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L24)

## Properties

### cause

• `Readonly` **cause**: `undefined` \| ``null`` \| { `message?`: `unknown` ; `stack?`: `unknown`  }

#### Defined in

[src/abstract/ClientError.ts:25](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L25)

___

### postAction

• `Readonly` **postAction**: [`ClientErrorPostAction`](../modules.md#clienterrorpostaction)

#### Defined in

[src/abstract/ClientError.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L30)

___

### kind

• `Readonly` **kind**: [`ClientErrorKind`](../modules.md#clienterrorkind)

#### Defined in

[src/abstract/ClientError.ts:31](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L31)

___

### comment

• `Optional` `Readonly` **comment**: `string`

#### Defined in

[src/abstract/ClientError.ts:32](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L32)
