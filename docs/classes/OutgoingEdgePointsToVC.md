[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / OutgoingEdgePointsToVC

# Class: OutgoingEdgePointsToVC<TField\>

Checks that the field's value is the same as VC's userID:

EntOur[user_id] ---> vc.userID

## Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)<`Record`<`TField`, `string` \| ``null``\>\>

## Constructors

### constructor

• **new OutgoingEdgePointsToVC**<`TField`\>(`field`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `TField` |

#### Defined in

[packages/ent-framework/src/ent/predicates/OutgoingEdgePointsToVC.ts:14](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/OutgoingEdgePointsToVC.ts#L14)

## Properties

### field

• `Readonly` **field**: `TField`

___

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[packages/ent-framework/src/ent/predicates/OutgoingEdgePointsToVC.ts:12](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/OutgoingEdgePointsToVC.ts#L12)

## Methods

### check

▸ **check**(`vc`, `row`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | `Record`<`TField`, ``null`` \| `string`\> |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[packages/ent-framework/src/ent/predicates/OutgoingEdgePointsToVC.ts:16](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/OutgoingEdgePointsToVC.ts#L16)
