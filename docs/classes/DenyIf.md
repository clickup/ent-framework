[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / DenyIf

# Class: DenyIf\<TInput\>

Returns DENY if the predicate succeeds, otherwise SKIP.
- Used mostly to early block some read/write access.
- EntAccessError exception will be treated as a DENY signal (so it will abort
  processing immediately).
- This rule may still throw an exception if the exception is a wild one (not
  derived from EntAccessError).

## Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

## Hierarchy

- [`Rule`](Rule.md)\<`TInput`\>

  ↳ **`DenyIf`**

## Constructors

### constructor

• **new DenyIf**\<`TInput`\>(`predicate`): [`DenyIf`](DenyIf.md)\<`TInput`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | [`Predicate`](../interfaces/Predicate.md)\<`TInput`\> \| (`vc`: [`VC`](VC.md), `input`: `TInput`) => `Promise`\<`boolean`\> |

#### Returns

[`DenyIf`](DenyIf.md)\<`TInput`\>

#### Inherited from

[Rule](Rule.md).[constructor](Rule.md#constructor)

#### Defined in

[src/ent/rules/Rule.ts:48](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L48)

## Properties

### \_TAG

• `Readonly` **\_TAG**: ``"DenyIf"``

#### Defined in

[src/ent/rules/DenyIf.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/DenyIf.ts#L15)

___

### predicate

• `Readonly` **predicate**: [`Predicate`](../interfaces/Predicate.md)\<`TInput`\>

#### Inherited from

[Rule](Rule.md).[predicate](Rule.md#predicate)

#### Defined in

[src/ent/rules/Rule.ts:43](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L43)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[Rule](Rule.md).[name](Rule.md#name)

#### Defined in

[src/ent/rules/Rule.ts:44](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L44)

## Methods

### evaluate

▸ **evaluate**(`vc`, `input`): `Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Overrides

[Rule](Rule.md).[evaluate](Rule.md#evaluate)

#### Defined in

[src/ent/rules/DenyIf.ts:17](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/DenyIf.ts#L17)
