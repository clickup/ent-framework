[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ValidationRules

# Type Alias: ValidationRules\<TTable\>

> **ValidationRules**\<`TTable`\>: `object`

Defined in: [src/ent/Validation.ts:59](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L59)

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Type declaration

### tenantPrincipalField?

> `readonly` `optional` **tenantPrincipalField**: [`InsertFieldsRequired`](InsertFieldsRequired.md)\<`TTable`\> & `string`

### inferPrincipal()

> `readonly` **inferPrincipal**: (`vc`, `row`) => `Promise`\<[`VC`](../classes/VC.md)\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `row` | [`Row`](Row.md)\<`TTable`\> |

#### Returns

`Promise`\<[`VC`](../classes/VC.md)\>

### load

> `readonly` **load**: [`Validation`](../classes/Validation.md)\<`TTable`\>\[`"load"`\]

### insert

> `readonly` **insert**: [`Validation`](../classes/Validation.md)\<`TTable`\>\[`"insert"`\]

### update?

> `readonly` `optional` **update**: [`Validation`](../classes/Validation.md)\<`TTable`\>\[`"update"`\]

### delete?

> `readonly` `optional` **delete**: [`Validation`](../classes/Validation.md)\<`TTable`\>\[`"delete"`\]

### validate?

> `readonly` `optional` **validate**: [`AbstractIs`](../interfaces/AbstractIs.md)\<[`InsertInput`](InsertInput.md)\<`TTable`\>\>[]
