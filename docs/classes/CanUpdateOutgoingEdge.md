[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / CanUpdateOutgoingEdge

# Class: CanUpdateOutgoingEdge\<TField\>

Checks that an Ent available via a field is updatable. See
CanReadOutgoingEdge comments for more details.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`Record`\<`TField`, `string` \| ``null``\>\>

## Constructors

### constructor

• **new CanUpdateOutgoingEdge**\<`TField`\>(`field`, `toEntClass`): [`CanUpdateOutgoingEdge`](CanUpdateOutgoingEdge.md)\<`TField`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `TField` |
| `toEntClass` | [`EntClass`](../modules.md#entclass) |

#### Returns

[`CanUpdateOutgoingEdge`](CanUpdateOutgoingEdge.md)\<`TField`\>

#### Defined in

[src/ent/predicates/CanUpdateOutgoingEdge.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanUpdateOutgoingEdge.ts#L15)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/CanUpdateOutgoingEdge.ts:13](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanUpdateOutgoingEdge.ts#L13)

___

### field

• `Readonly` **field**: `TField`

#### Defined in

[src/ent/predicates/CanUpdateOutgoingEdge.ts:16](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanUpdateOutgoingEdge.ts#L16)

___

### toEntClass

• `Readonly` **toEntClass**: [`EntClass`](../modules.md#entclass)

#### Defined in

[src/ent/predicates/CanUpdateOutgoingEdge.ts:17](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanUpdateOutgoingEdge.ts#L17)

## Methods

### check

▸ **check**(`vc`, `row`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | `Record`\<`TField`, ``null`` \| `string`\> |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/CanUpdateOutgoingEdge.ts:22](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanUpdateOutgoingEdge.ts#L22)
