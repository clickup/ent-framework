[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Configuration

# Class: Configuration<TTable\>

Strongly typed configuration framework to force TS auto-infer privacy
callbacks arguments types (which are not Ents, but row-like inputs).
1. We MUST resolve privacyXyz rules below lazily, at actual operation; else
   in case of cyclic Ent dependencies between EntA and EntB, one of them will
   be magically undefined.
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

• **new Configuration**<`TTable`\>(`cfg`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `cfg` | [`Configuration`](Configuration.md)<`TTable`\> |

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:76](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L76)

## Properties

### afterDelete

• `Optional` `Readonly` **afterDelete**: [`DeleteTrigger`](../modules.md#deletetrigger)<`TTable`\>[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:70](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L70)

___

### afterInsert

• `Optional` `Readonly` **afterInsert**: [`InsertTrigger`](../modules.md#inserttrigger)<`TTable`\>[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:65](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L65)

___

### afterMutation

• `Optional` `Readonly` **afterMutation**: ([`AfterMutationTrigger`](../modules.md#aftermutationtrigger)<`TTable`\> \| [[`DepsBuilder`](../modules.md#depsbuilder)<`TTable`\>, [`AfterMutationTrigger`](../modules.md#aftermutationtrigger)<`TTable`\>])[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:71](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L71)

___

### afterUpdate

• `Optional` `Readonly` **afterUpdate**: ([`AfterUpdateTrigger`](../modules.md#afterupdatetrigger)<`TTable`\> \| [[`DepsBuilder`](../modules.md#depsbuilder)<`TTable`\>, [`AfterUpdateTrigger`](../modules.md#afterupdatetrigger)<`TTable`\>])[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:66](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L66)

___

### beforeDelete

• `Optional` `Readonly` **beforeDelete**: [`DeleteTrigger`](../modules.md#deletetrigger)<`TTable`\>[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:64](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L64)

___

### beforeInsert

• `Optional` `Readonly` **beforeInsert**: [`InsertTrigger`](../modules.md#inserttrigger)<`TTable`\>[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:62](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L62)

___

### beforeUpdate

• `Optional` `Readonly` **beforeUpdate**: [`BeforeUpdateTrigger`](../modules.md#beforeupdatetrigger)<`TTable`\>[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:63](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L63)

___

### inverses

• `Optional` `Readonly` **inverses**: { [k in string]?: Object }

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:53](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L53)

___

### privacyDelete

• `Optional` `Readonly` **privacyDelete**: [`Rule`](Rule.md)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:60](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L60)

___

### privacyInsert

• `Readonly` **privacyInsert**: [`Rule`](Rule.md)<[`InsertInput`](../modules.md#insertinput)<`TTable`\>\>[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:58](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L58)

___

### privacyLoad

• `Readonly` **privacyLoad**: [`Rule`](Rule.md)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:57](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L57)

___

### privacyTenantUserIDField

• `Optional` `Readonly` **privacyTenantUserIDField**: [`InsertFieldsRequired`](../modules.md#insertfieldsrequired)<`TTable`\>

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:56](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L56)

___

### privacyUpdate

• `Optional` `Readonly` **privacyUpdate**: [`Rule`](Rule.md)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:59](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L59)

___

### shardAffinity

• `Readonly` **shardAffinity**: [`ShardAffinity`](../modules.md#shardaffinity)<[`IDFields`](../modules.md#idfields)<`TTable`\>\>

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:52](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L52)

___

### validators

• `Optional` `Readonly` **validators**: [`Predicate`](../interfaces/Predicate.md)<[`Row`](../modules.md#row)<`TTable`\>\> & [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[]

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:61](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L61)
