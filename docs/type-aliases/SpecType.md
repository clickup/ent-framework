[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / SpecType

# Type Alias: SpecType

> **SpecType**: *typeof* `Boolean` \| *typeof* `Date` \| *typeof* [`ID`](../variables/ID.md) \| *typeof* `Number` \| *typeof* `String` \| \{ `dbValueToJs`: (`dbValue`) => `unknown`; `stringify`: (`jsValue`) => `string`; `parse`: (`str`) => `unknown`; \}

Spec (metadata) of some field.

## Type declaration

*typeof* `Boolean`

*typeof* `Date`

*typeof* [`ID`](../variables/ID.md)

*typeof* `Number`

*typeof* `String`

\{ `dbValueToJs`: (`dbValue`) => `unknown`; `stringify`: (`jsValue`) => `string`; `parse`: (`str`) => `unknown`; \}

### dbValueToJs()

> **dbValueToJs**: (`dbValue`) => `unknown`

Converts a value of some field returned by the low-level DB engine to
its Client representation, which can be reacher (e.g. support
encryption/decryption). Notice that some DB engines already do some
conversions internally: e.g. for node-postgres and an array field,
dbValue returned by the engine is already an array of things, so
dbValueToJs for it will likely do nothing.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dbValue` | `DesperateAny` |

#### Returns

`unknown`

### stringify()

> **stringify**: (`jsValue`) => `string`

Converts a Client value to the internal stringified representation of
the low-level DB engine, which is suitable for injecting it into a
plaintext query (with e.g. ?-placeholders).
- Notice that this is intentionally NOT the opposite to dbValueToJs,
  because it always needs to convert the value to a string, not to the
  DB engine's row field type.
- Example: node-postgres natively understands json/jsonb PG types and
  can unescape them (called "PG type parsers" and mainly lives in
  pg-types module; notice that there are no "PG type stringifiers
  though"). The problem is that the low-level library's facilities for
  escaping data is poor or doesn't exist (we do escaping by ourselves
  for various reasons, like batching queries and better logging). So we
  trust the library on the dbValueToJs path, but must manually
  serialize on stringify path.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `jsValue` | `DesperateAny` |

#### Returns

`string`

### parse()

> **parse**: (`str`) => `unknown`

The opposite to stringify function. Generally, it is not used on the
read path (because the low level engine returns the rows suitable for
dbValueToJs), but it's still here for completeness of the interface.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

`unknown`

## Defined in

[src/types.ts:40](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L40)
