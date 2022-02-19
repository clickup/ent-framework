[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SchemaClass

# Interface: SchemaClass

## Constructors

### constructor

• **new SchemaClass**<`TTable`, `TUniqueKey`\>(`name`, `table`, `uniqueKey?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends readonly { [K in string \| number \| symbol]: TTable[K] extends Object ? K : never }[keyof `TTable`][] = [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `table` | `TTable` |
| `uniqueKey?` | `TUniqueKey` |

#### Defined in

[packages/ent-framework/src/abstract/Schema.ts:15](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Schema.ts#L15)
