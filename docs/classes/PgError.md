[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgError

# Class: PgError

Encapsulates the error thrown when running a Client query. The object also
carries suggestions, what to do next.

## Extends

- [`ClientError`](ClientError.md)

## Constructors

### new PgError()

> **new PgError**(`cause`, `where`, `sql`): [`PgError`](PgError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `cause` | `undefined` \| `null` \| \{\} |
| `where` | `string` |
| `sql` | `string` |

#### Returns

[`PgError`](PgError.md)

#### Overrides

[`ClientError`](ClientError.md).[`constructor`](ClientError.md#constructors)

#### Defined in

[src/pg/PgError.ts:4](https://github.com/clickup/ent-framework/blob/master/src/pg/PgError.ts#L4)

## Properties

| Property | Type |
| ------ | ------ |
| `cause` | `MaybeError` |
| `postAction` | [`ClientErrorPostAction`](../type-aliases/ClientErrorPostAction.md) |
| `kind` | [`ClientErrorKind`](../type-aliases/ClientErrorKind.md) |
| `abbreviation` | `string` |
| `comment?` | `string` |
| `sql` | `string` |

## Methods

### isFKError()

> **isFKError**(`fkName`?): `boolean`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fkName`? | `string` |

#### Returns

`boolean`

#### Defined in

[src/pg/PgError.ts:20](https://github.com/clickup/ent-framework/blob/master/src/pg/PgError.ts#L20)
