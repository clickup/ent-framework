[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / ClientError

# Class: ClientError

Encapsulates the error thrown when running a Client query. The object also
carries suggestions, what to do next.

## Extends

- `Error`

## Extended by

- [`PgError`](PgError.md)

## Constructors

### new ClientError()

> **new ClientError**(`cause`, `where`, `postAction`, `kind`, `abbreviation`, `comment`?): [`ClientError`](ClientError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `cause` | `MaybeError` |
| `where` | `string` |
| `postAction` | [`ClientErrorPostAction`](../type-aliases/ClientErrorPostAction.md) |
| `kind` | [`ClientErrorKind`](../type-aliases/ClientErrorKind.md) |
| `abbreviation` | `string` |
| `comment`? | `string` |

#### Returns

[`ClientError`](ClientError.md)

#### Overrides

`Error.constructor`

#### Defined in

[src/abstract/ClientError.ts:44](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L44)

## Properties

| Property | Type |
| ------ | ------ |
| `cause` | `MaybeError` |
| `postAction` | [`ClientErrorPostAction`](../type-aliases/ClientErrorPostAction.md) |
| `kind` | [`ClientErrorKind`](../type-aliases/ClientErrorKind.md) |
| `abbreviation` | `string` |
| `comment?` | `string` |
