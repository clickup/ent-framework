[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / SchemaClass

# Interface: SchemaClass

## Constructors

### constructor

• **new SchemaClass**\<`TTable`, `TUniqueKey`\>(`name`, `table`, `uniqueKey?`): [`Schema`](../classes/Schema.md)\<`TTable`, `TUniqueKey`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\> = [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `table` | `TTable` |
| `uniqueKey?` | `TUniqueKey` |

#### Returns

[`Schema`](../classes/Schema.md)\<`TTable`, `TUniqueKey`\>

#### Defined in

[src/abstract/Schema.ts:17](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L17)
