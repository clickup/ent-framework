[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / ServerError

# Class: ServerError

Encapsulates the error message passed from the DB server. Notice that in case
of e.g. connection reset errors or network timeouts, this error is NOT thrown
(because we actually don't know whether the server applied the query or not);
instead, some other exception (lower level) is raised.

## Hierarchy

- `Error`

  ↳ **`ServerError`**

  ↳↳ [`ShardError`](ShardError.md)

  ↳↳ [`SQLError`](SQLError.md)

## Constructors

### constructor

• **new ServerError**(`origError`, `destName`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `origError` | `any` |
| `destName` | `string` |

#### Overrides

Error.constructor

#### Defined in

[src/abstract/ServerError.ts:10](https://github.com/clickup/rest-client/blob/master/src/abstract/ServerError.ts#L10)

## Properties

### origError

• `Readonly` **origError**: `any`

#### Defined in

[src/abstract/ServerError.ts:10](https://github.com/clickup/rest-client/blob/master/src/abstract/ServerError.ts#L10)
