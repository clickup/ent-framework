[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / OutgoingEdgePointsToVC

# Class: OutgoingEdgePointsToVC<TField\>

Checks that the field's value is the same as VC's principal:

EntOur[user_id] ---> vc.principal

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

[src/ent/predicates/OutgoingEdgePointsToVC.ts:14](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/OutgoingEdgePointsToVC.ts#L14)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/OutgoingEdgePointsToVC.ts:12](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/OutgoingEdgePointsToVC.ts#L12)

___

### field

• `Readonly` **field**: `TField`

#### Defined in

[src/ent/predicates/OutgoingEdgePointsToVC.ts:14](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/OutgoingEdgePointsToVC.ts#L14)

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

[src/ent/predicates/OutgoingEdgePointsToVC.ts:16](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/OutgoingEdgePointsToVC.ts#L16)
