[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / True

# Class: True

Always passes; used for e.g. globally accessed objects.

## Implements

- [`Predicate`](../interfaces/Predicate.md)<`never`\>

## Constructors

### constructor

• **new True**()

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/True.ts:8](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/True.ts#L8)

## Methods

### check

▸ **check**(`_vc`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `_vc` | [`VC`](VC.md) |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/True.ts:10](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/True.ts#L10)
