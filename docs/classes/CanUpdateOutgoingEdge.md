[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / CanUpdateOutgoingEdge

# Class: CanUpdateOutgoingEdge<TField\>

Checks that an Ent available via a field is updatable. See
CanReadOutgoingEdge comments for more details.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)<`Record`<`TField`, `string` \| ``null``\>\>

## Constructors

### constructor

• **new CanUpdateOutgoingEdge**<`TField`\>(`field`, `toEntClass`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `TField` |
| `toEntClass` | [`EntClass`](../interfaces/EntClass.md)<`any`\> |

#### Defined in

[packages/ent-framework/src/ent/predicates/CanUpdateOutgoingEdge.ts:14](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/CanUpdateOutgoingEdge.ts#L14)

## Properties

### field

• `Readonly` **field**: `TField`

___

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[packages/ent-framework/src/ent/predicates/CanUpdateOutgoingEdge.ts:12](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/CanUpdateOutgoingEdge.ts#L12)

___

### toEntClass

• `Readonly` **toEntClass**: [`EntClass`](../interfaces/EntClass.md)<`any`\>

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

[packages/ent-framework/src/ent/predicates/CanUpdateOutgoingEdge.ts:19](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/CanUpdateOutgoingEdge.ts#L19)
