[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgError

# Class: PgError

Defined in: [src/pg/PgError.ts:3](https://github.com/clickup/ent-framework/blob/master/src/pg/PgError.ts#L3)

Encapsulates the error thrown when running a Client query. The object also
carries suggestions, what to do next.

## Extends

- [`ClientError`](ClientError.md)

## Constructors

### new PgError()

> **new PgError**(`cause`, `where`, `sql`): [`PgError`](PgError.md)

Defined in: [src/pg/PgError.ts:4](https://github.com/clickup/ent-framework/blob/master/src/pg/PgError.ts#L4)

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

## Properties

| Property | Type |
| ------ | ------ |
| <a id="cause-1"></a> `cause` | `MaybeError` |
| <a id="postaction"></a> `postAction` | [`ClientErrorPostAction`](../type-aliases/ClientErrorPostAction.md) |
| <a id="kind"></a> `kind` | [`ClientErrorKind`](../type-aliases/ClientErrorKind.md) |
| <a id="abbreviation"></a> `abbreviation` | `string` |
| <a id="comment"></a> `comment?` | `string` |
| <a id="sql-1"></a> `sql` | `string` |

## Methods

### isFKError()

> **isFKError**(`fkName`?): `boolean`

Defined in: [src/pg/PgError.ts:20](https://github.com/clickup/ent-framework/blob/master/src/pg/PgError.ts#L20)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fkName`? | `string` |

#### Returns

`boolean`
