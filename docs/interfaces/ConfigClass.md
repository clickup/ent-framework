[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / ConfigClass

# Interface: ConfigClass<TTable, TUniqueKey, TClient\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |
| `TClient` | extends [`Client`](../classes/Client.md) |

## Constructors

### constructor

• **new ConfigClass**(...`args`)

TS requires us to have a public constructor to infer instance types in
various places. We make this constructor throw if it's called.

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:77](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L77)

## Properties

### CLUSTER

• `Readonly` **CLUSTER**: [`Cluster`](../classes/Cluster.md)<`TClient`\>

A cluster where this Ent lives.

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:41](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L41)

___

### Configuration

• `Readonly` **Configuration**: (`cfg`: [`Configuration`](../classes/Configuration.md)<`TTable`\>) => [`Configuration`](../classes/Configuration.md)<`TTable`\>

#### Type declaration

• **new ConfigClass**(`cfg`)

A helper class to work-around TS weakness in return value type inference:
https://github.com/Microsoft/TypeScript/issues/31273. It could've been just
a function, but having a class is a little more natural.

##### Parameters

| Name | Type |
| :------ | :------ |
| `cfg` | [`Configuration`](../classes/Configuration.md)<`TTable`\> |

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:34](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L34)

___

### INVERSES

• `Readonly` **INVERSES**: [`Inverse`](../classes/Inverse.md)<`TClient`, `TTable`\>[]

Inverse assoc managers for fields.

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:71](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L71)

___

### SCHEMA

• `Readonly` **SCHEMA**: [`Schema`](../classes/Schema.md)<`TTable`, `TUniqueKey`\>

A schema which represents this Ent.

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:46](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L46)

___

### SHARD\_AFFINITY

• `Readonly` **SHARD\_AFFINITY**: [`ShardAffinity`](../modules.md#shardaffinity)<[`IDFields`](../modules.md#idfields)<`TTable`\>\>

Defines how to find the right shard during Ent insertion.

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L51)

___

### SHARD\_LOCATOR

• `Readonly` **SHARD\_LOCATOR**: [`ShardLocator`](../classes/ShardLocator.md)<`TClient`, [`IDFields`](../modules.md#idfields)<`TTable`\>\>

Shard locator for this Ent, responsible for resolving IDs into Shard objects.

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:56](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L56)

___

### TRIGGERS

• `Readonly` **TRIGGERS**: [`Triggers`](../classes/Triggers.md)<`TTable`\>

Triggers for this Ent class.

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:66](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L66)

___

### VALIDATION

• `Readonly` **VALIDATION**: [`Validation`](../classes/Validation.md)<`TTable`\>

Privacy rules for this Ent class.

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:61](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L61)

## Methods

### configure

▸ **configure**(): [`Configuration`](../classes/Configuration.md)<`TTable`\>

Some Ent parameters need to be configured lazily, on the 1st access,
because there could be cyclic references between Ent classes (e.g. in their
privacy rules). So configure() is called on some later stage, at the moment
of actual Ent operations (like loading, creation etc.). There is no static
abstract methods in TS yet, so making it non-abstract.

#### Returns

[`Configuration`](../classes/Configuration.md)<`TTable`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:27](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L27)
