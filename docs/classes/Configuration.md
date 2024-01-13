[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Configuration

# Class: Configuration\<TTable\>

Strongly typed configuration framework to force TS auto-infer privacy
callbacks arguments types (which are not Ents, but row-like inputs).

Motivation:
1. We MUST resolve privacyXyz rules below lazily, at actual operation;
   otherwise in case of cyclic Ent dependencies between EntA and EntB, one of
   them will be magically undefined.
2. We can’t define these parameter as BaseEnt arguments: privacy rules may
   refer the derived Ent itself and other Ents and thus produce cyclic
   dependencies. TS doesn't allow to work with such cyclic dependencies
   during the class is defining.
3. Configuration can’t be just returned from a virtual method, because in TS,
   type inference in return values is poor:
   https://github.com/Microsoft/TypeScript/issues/31273

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Constructors

### constructor

• **new Configuration**\<`TTable`\>(`cfg`): [`Configuration`](Configuration.md)\<`TTable`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `cfg` | [`Configuration`](Configuration.md)\<`TTable`\> |

#### Returns

[`Configuration`](Configuration.md)\<`TTable`\>

#### Defined in

[src/ent/Configuration.ts:123](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L123)

## Properties

### shardAffinity

• `Readonly` **shardAffinity**: [`ShardAffinity`](../modules.md#shardaffinity)\<[`FieldOfIDType`](../modules.md#fieldofidtype)\<`TTable`\>\>

Defines how to locate a Shard at Ent insert time. See ShardAffinity for
more details.

1. GLOBAL_SHARD: places the Ent in the global Shard (0).
2. []: places the Ent in a random Shard. The "randomness" of the "random
   Shard" is deterministic by the Ent's unique key at the moment of
   insertion (if it's defined; otherwise completely random). This helps two
   racy insert operations running concurrently to choose the same Shard for
   the Ent to be created in, so only one of them will win, instead of both
   winning and mistakenly creating the Ent duplicates. I.e. having the same
   value in unique key forces the engine to target the same "random" Shard.
3. ["field1", "field2", ...]: places the Ent in the Shard that is pointed
   to by the value in field1 (if it's null, then field2 etc.).

A special treatment is applied if a fieldN value in (3) points to the
global Shard. In such a case, the Shard for the current Ent is chosen
deterministic-randomly at insert time, as if [] is passed. This allows the
Ent to refer other "owning" Ents of different types, some of which may be
located in the global Shard. Keep in mind that, to locate such an Ent
pointing to another Ent in the global Shard, an inverse for fieldN must be
defined in most of the cases.

#### Defined in

[src/ent/Configuration.ts:52](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L52)

___

### inverses

• `Optional` `Readonly` **inverses**: \{ [k in string]?: Object }

Inverses allow cross-Shard foreign keys & cross-Shard selection. If a
field points to an Ent in another Shard, and we're e.g. selecting by a
value in this field, inverses allow to locate Shard(s) of the Ent.

#### Defined in

[src/ent/Configuration.ts:56](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L56)

___

### privacyTenantPrincipalField

• `Optional` `Readonly` **privacyTenantPrincipalField**: [`InsertFieldsRequired`](../modules.md#insertfieldsrequired)\<`TTable`\> & `string`

If defined, forces all Ents of this class to have the value of that field
equal to VC's principal at load time. This is a very 1st unavoidable check
in the privacy rules chain, thus it's bullet-proof.

#### Defined in

[src/ent/Configuration.ts:62](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L62)

___

### privacyInferPrincipal

• `Optional` `Readonly` **privacyInferPrincipal**: (`vc`: [`VC`](VC.md), `row`: [`Row`](../modules.md#row)\<`TTable`\>) => `Promise`\<``null`` \| `string`\>

If defined, an attempt to load this Ent using an omni VC will "lower" that
VC to the principal returned by this callback. Omni VC is always lowered,
even if the callback is not set (to a guest VC in such cases).

#### Type declaration

▸ (`vc`, `row`): `Promise`\<``null`` \| `string`\>

If defined, an attempt to load this Ent using an omni VC will "lower" that
VC to the principal returned by this callback. Omni VC is always lowered,
even if the callback is not set (to a guest VC in such cases).

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`Row`](../modules.md#row)\<`TTable`\> |

##### Returns

`Promise`\<``null`` \| `string`\>

#### Defined in

[src/ent/Configuration.ts:66](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L66)

___

### privacyLoad

• `Readonly` **privacyLoad**: [`LoadRule`](../modules.md#loadrule)\<[`Row`](../modules.md#row)\<`TTable`\>\>[]

Privacy rules checked on every row loaded from the DB.

#### Defined in

[src/ent/Configuration.ts:68](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L68)

___

### privacyInsert

• `Readonly` **privacyInsert**: [`WriteRules`](../modules.md#writerules)\<[`InsertInput`](../modules.md#insertinput)\<`TTable`\>\>

Privacy rules checked before a row is inserted to the DB.
- It the list is empty, then only omni VC can insert; it's typically a good
  option for Ents representing e.g. a user.
- If no update/delete rules are defined, then privacyInsert rules are also
  run on update/delete by default.
- Unless empty, the rules must include at least one Require() predicate,
  they can't entirely consist of AllowIf(). This is because for write rules
  (privacyInsert, privacyUpdate, privacyDelete) it's important to make sure
  that ALL rules permit the operation, not only one of them allows it; this
  is what Require() is exactly for.

#### Defined in

[src/ent/Configuration.ts:79](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L79)

___

### privacyUpdate

• `Optional` `Readonly` **privacyUpdate**: [`WriteRules`](../modules.md#writerules)\<[`Row`](../modules.md#row)\<`TTable`\>\>

Privacy rules checked before a row is updated in the DB.
- If not defined, privacyInsert rules are used.
- The rules must include at least one Require() predicate.

#### Defined in

[src/ent/Configuration.ts:83](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L83)

___

### privacyDelete

• `Optional` `Readonly` **privacyDelete**: [`WriteRules`](../modules.md#writerules)\<[`Row`](../modules.md#row)\<`TTable`\>\>

Privacy rules checked before a row is deleted in the DB.
- If not defined, privacyInsert rules are used.
- The rules must include at least one Require() predicate.

#### Defined in

[src/ent/Configuration.ts:87](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L87)

___

### validators

• `Optional` `Readonly` **validators**: [`Predicate`](../interfaces/Predicate.md)\<[`InsertInput`](../modules.md#insertinput)\<`TTable`\>\> & [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[]

Custom field values validators run before any insert/update.

#### Defined in

[src/ent/Configuration.ts:89](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L89)

___

### beforeInsert

• `Optional` `Readonly` **beforeInsert**: [`InsertTrigger`](../modules.md#inserttrigger)\<`TTable`\>[]

Triggers run before every insert.

#### Defined in

[src/ent/Configuration.ts:91](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L91)

___

### beforeUpdate

• `Optional` `Readonly` **beforeUpdate**: ([`BeforeUpdateTrigger`](../modules.md#beforeupdatetrigger)\<`TTable`\> \| [[`DepsBuilder`](../modules.md#depsbuilder)\<`TTable`\>, [`BeforeUpdateTrigger`](../modules.md#beforeupdatetrigger)\<`TTable`\>])[]

Triggers run before every update.

#### Defined in

[src/ent/Configuration.ts:93](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L93)

___

### beforeDelete

• `Optional` `Readonly` **beforeDelete**: [`DeleteTrigger`](../modules.md#deletetrigger)\<`TTable`\>[]

Triggers run before every delete.

#### Defined in

[src/ent/Configuration.ts:98](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L98)

___

### beforeMutation

• `Optional` `Readonly` **beforeMutation**: ([`BeforeMutationTrigger`](../modules.md#beforemutationtrigger)\<`TTable`\> \| [[`DepsBuilder`](../modules.md#depsbuilder)\<`TTable`\>, [`BeforeMutationTrigger`](../modules.md#beforemutationtrigger)\<`TTable`\>])[]

Triggers run before every insert/update/delete. Each trigger may also be
passed as "React useEffect-like" tuple where the callback is executed only
if the deps are modified.

#### Defined in

[src/ent/Configuration.ts:102](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L102)

___

### afterInsert

• `Optional` `Readonly` **afterInsert**: [`InsertTrigger`](../modules.md#inserttrigger)\<`TTable`\>[]

Triggers run after every delete.

#### Defined in

[src/ent/Configuration.ts:107](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L107)

___

### afterUpdate

• `Optional` `Readonly` **afterUpdate**: ([`AfterUpdateTrigger`](../modules.md#afterupdatetrigger)\<`TTable`\> \| [[`DepsBuilder`](../modules.md#depsbuilder)\<`TTable`\>, [`AfterUpdateTrigger`](../modules.md#afterupdatetrigger)\<`TTable`\>])[]

Triggers run after every update.

#### Defined in

[src/ent/Configuration.ts:109](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L109)

___

### afterDelete

• `Optional` `Readonly` **afterDelete**: [`DeleteTrigger`](../modules.md#deletetrigger)\<`TTable`\>[]

Triggers run after every delete.

#### Defined in

[src/ent/Configuration.ts:114](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L114)

___

### afterMutation

• `Optional` `Readonly` **afterMutation**: ([`AfterMutationTrigger`](../modules.md#aftermutationtrigger)\<`TTable`\> \| [[`DepsBuilder`](../modules.md#depsbuilder)\<`TTable`\>, [`AfterMutationTrigger`](../modules.md#aftermutationtrigger)\<`TTable`\>])[]

Triggers run after every insert/update/delete. Each trigger may also be
passed as "React useEffect-like" tuple where the callback is executed only
if the deps are modified.

#### Defined in

[src/ent/Configuration.ts:118](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L118)
