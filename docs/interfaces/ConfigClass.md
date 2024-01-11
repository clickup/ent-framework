[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ConfigClass

# Interface: ConfigClass<TTable, TUniqueKey, TClient\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |
| `TClient` | extends [`Client`](../classes/Client.md) |

## Constructors

### constructor

• **new ConfigClass**()

TS requires us to have a public constructor to infer instance types in
various places. We make this constructor throw if it's called.

#### Defined in

[src/ent/mixins/ConfigMixin.ts:79](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L79)

## Properties

### Configuration

• `Readonly` **Configuration**: (`cfg`: [`Configuration`](../classes/Configuration.md)<`TTable`\>) => [`Configuration`](../classes/Configuration.md)<`TTable`\>

#### Type declaration

• **new Configuration**(`cfg`)

A helper class to work-around TS weakness in return value type inference:
https://github.com/Microsoft/TypeScript/issues/31273. It could've been just
a function, but having a class is a little more natural.

##### Parameters

| Name | Type |
| :------ | :------ |
| `cfg` | [`Configuration`](../classes/Configuration.md)<`TTable`\> |

#### Defined in

[src/ent/mixins/ConfigMixin.ts:36](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L36)

___

### CLUSTER

• `Readonly` **CLUSTER**: [`Cluster`](../classes/Cluster.md)<`TClient`, `any`\>

A Cluster where this Ent lives.

#### Defined in

[src/ent/mixins/ConfigMixin.ts:43](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L43)

___

### SCHEMA

• `Readonly` **SCHEMA**: [`Schema`](../classes/Schema.md)<`TTable`, `TUniqueKey`\>

A schema which represents this Ent.

#### Defined in

[src/ent/mixins/ConfigMixin.ts:48](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L48)

___

### SHARD\_AFFINITY

• `Readonly` **SHARD\_AFFINITY**: [`ShardAffinity`](../modules.md#shardaffinity)<[`FieldOfIDType`](../modules.md#fieldofidtype)<`TTable`\>\>

Defines how to find the right Shard during Ent insertion.

#### Defined in

[src/ent/mixins/ConfigMixin.ts:53](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L53)

___

### SHARD\_LOCATOR

• `Readonly` **SHARD\_LOCATOR**: [`ShardLocator`](../classes/ShardLocator.md)<`TClient`, `TTable`, [`FieldOfIDType`](../modules.md#fieldofidtype)<`TTable`\>\>

Shard locator for this Ent, responsible for resolving IDs into Shard objects.

#### Defined in

[src/ent/mixins/ConfigMixin.ts:58](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L58)

___

### VALIDATION

• `Readonly` **VALIDATION**: [`Validation`](../classes/Validation.md)<`TTable`\>

Privacy rules for this Ent class.

#### Defined in

[src/ent/mixins/ConfigMixin.ts:63](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L63)

___

### TRIGGERS

• `Readonly` **TRIGGERS**: [`Triggers`](../classes/Triggers.md)<`TTable`\>

Triggers for this Ent class.

#### Defined in

[src/ent/mixins/ConfigMixin.ts:68](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L68)

___

### INVERSES

• `Readonly` **INVERSES**: [`Inverse`](../classes/Inverse.md)<`TClient`, `TTable`\>[]

Inverse assoc managers for fields.

#### Defined in

[src/ent/mixins/ConfigMixin.ts:73](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L73)

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

[src/ent/mixins/ConfigMixin.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L29)
