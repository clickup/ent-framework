[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Require

# Class: Require<TInput\>

Returns TOLERATE if the predicate succeeds, otherwise DENY.
- Used mostly for write permission checks.
- This rule may still throw an exception if it's a wild one (i.e. not derived
  from EntAccessError).

## Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

## Hierarchy

- [`Rule`](Rule.md)<`TInput`\>

  ↳ **`Require`**

## Constructors

### constructor

• **new Require**<`TInput`\>(`predicate`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | [`Predicate`](../interfaces/Predicate.md)<`TInput`\> \| (`vc`: [`VC`](VC.md), `input`: `TInput`) => `Promise`<`boolean`\> |

#### Inherited from

[Rule](Rule.md).[constructor](Rule.md#constructor)

#### Defined in

[packages/ent-framework/src/ent/rules/Rule.ts:47](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/rules/Rule.ts#L47)

## Properties

### name

• `Readonly` **name**: `string`

#### Inherited from

[Rule](Rule.md).[name](Rule.md#name)

#### Defined in

[packages/ent-framework/src/ent/rules/Rule.ts:45](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/rules/Rule.ts#L45)

___

### predicate

• `Readonly` **predicate**: [`Predicate`](../interfaces/Predicate.md)<`TInput`\>

#### Inherited from

[Rule](Rule.md).[predicate](Rule.md#predicate)

#### Defined in

[packages/ent-framework/src/ent/rules/Rule.ts:44](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/rules/Rule.ts#L44)

## Methods

### evaluate

▸ **evaluate**(`vc`, `input`): `Promise`<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Overrides

[Rule](Rule.md).[evaluate](Rule.md#evaluate)

#### Defined in

[packages/ent-framework/src/ent/rules/Require.ts:11](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/rules/Require.ts#L11)