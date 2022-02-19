[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / CanReadOutgoingEdge

# Class: CanReadOutgoingEdge<TField\>

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

- [`Predicate`](../interfaces/Predicate.md)<`Record`<`TField`, `string` \| ``null``\>\>

## Constructors

### constructor

• **new CanReadOutgoingEdge**<`TField`\>(`field`, `toEntClass`)

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

[packages/ent-framework/src/ent/predicates/CanReadOutgoingEdge.ts:22](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/CanReadOutgoingEdge.ts#L22)

## Properties

### field

• `Readonly` **field**: `TField`

___

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[packages/ent-framework/src/ent/predicates/CanReadOutgoingEdge.ts:20](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/CanReadOutgoingEdge.ts#L20)

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

[packages/ent-framework/src/ent/predicates/CanReadOutgoingEdge.ts:27](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/CanReadOutgoingEdge.ts#L27)
