[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ShardError

# Class: ShardError

This non-retriable error is thrown when the system cannot detect the target
shard to work with (e.g. a null ID or a missing field or something else).

## Hierarchy

- `Error`

  ↳ **`ShardError`**

## Constructors

### constructor

• **new ShardError**(`message`, `where?`): [`ShardError`](ShardError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `where?` | `string` |

#### Returns

[`ShardError`](ShardError.md)

#### Overrides

Error.constructor

#### Defined in

[src/abstract/ShardError.ts:6](https://github.com/clickup/ent-framework/blob/master/src/abstract/ShardError.ts#L6)
