[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / CanReadOutgoingEdge

# Class: CanReadOutgoingEdge\<TField\>

Checks that an ent which a field is pointing to is readable:

EntOur[company_id] ---> EntCompany[id]

This predicate delegates the readability permission check for the current ent
to another ent with ID equals to the value of our ent's field.

- field = user_id in the above example
- toEntClass = EntCompany in the above example

## Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`Record`\<`TField`, `string` \| ``null``\>\>

## Constructors

### constructor

• **new CanReadOutgoingEdge**\<`TField`\>(`field`, `toEntClass`): [`CanReadOutgoingEdge`](CanReadOutgoingEdge.md)\<`TField`\>

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

[`CanReadOutgoingEdge`](CanReadOutgoingEdge.md)\<`TField`\>

#### Defined in

[src/ent/predicates/CanReadOutgoingEdge.ts:23](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanReadOutgoingEdge.ts#L23)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/CanReadOutgoingEdge.ts:21](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanReadOutgoingEdge.ts#L21)

___

### field

• `Readonly` **field**: `TField`

#### Defined in

[src/ent/predicates/CanReadOutgoingEdge.ts:24](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanReadOutgoingEdge.ts#L24)

___

### toEntClass

• `Readonly` **toEntClass**: [`EntClass`](../modules.md#entclass)

#### Defined in

[src/ent/predicates/CanReadOutgoingEdge.ts:25](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanReadOutgoingEdge.ts#L25)

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

[src/ent/predicates/CanReadOutgoingEdge.ts:30](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanReadOutgoingEdge.ts#L30)
