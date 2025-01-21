[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ClientError

# Class: ClientError

Defined in: [src/abstract/ClientError.ts:43](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L43)

Encapsulates the error thrown when running a Client query. The object also
carries suggestions, what to do next.

## Extends

- `Error`

## Extended by

- [`PgError`](PgError.md)

## Constructors

### new ClientError()

> **new ClientError**(`cause`, `where`, `postAction`, `kind`, `abbreviation`, `comment`?): [`ClientError`](ClientError.md)

Defined in: [src/abstract/ClientError.ts:44](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L44)

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

## Properties

| Property | Type |
| ------ | ------ |
| <a id="cause-1"></a> `cause` | `MaybeError` |
| <a id="postaction-1"></a> `postAction` | [`ClientErrorPostAction`](../type-aliases/ClientErrorPostAction.md) |
| <a id="kind-1"></a> `kind` | [`ClientErrorKind`](../type-aliases/ClientErrorKind.md) |
| <a id="abbreviation-1"></a> `abbreviation` | `string` |
| <a id="comment-1"></a> `comment?` | `string` |
