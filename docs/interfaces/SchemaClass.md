[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SchemaClass

# Interface: SchemaClass

## Constructors

### constructor

• **new SchemaClass**<`TTable`, `TUniqueKey`\>(`name`, `table`, `uniqueKey?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> = [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `table` | `TTable` |
| `uniqueKey?` | `TUniqueKey` |

#### Defined in

[src/abstract/Schema.ts:17](https://github.com/clickup/rest-client/blob/master/src/abstract/Schema.ts#L17)
