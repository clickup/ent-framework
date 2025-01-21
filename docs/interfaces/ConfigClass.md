[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ConfigClass

# Interface: ConfigClass\<TTable, TUniqueKey, TClient\>

Defined in: [src/ent/mixins/ConfigMixin.ts:17](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L17)

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |
| `TClient` *extends* [`Client`](../classes/Client.md) |

## Constructors

### new ConfigClass()

> **new ConfigClass**(): [`ConfigInstance`](ConfigInstance.md)

Defined in: [src/ent/mixins/ConfigMixin.ts:79](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L79)

TS requires us to have a public constructor to infer instance types in
various places. We make this constructor throw if it's called.

#### Returns

[`ConfigInstance`](ConfigInstance.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="configuration"></a> `Configuration` | (`cfg`: [`Configuration`](../classes/Configuration.md)\<`TTable`\>) => [`Configuration`](../classes/Configuration.md)\<`TTable`\> | A helper class to work-around TS weakness in return value type inference: https://github.com/Microsoft/TypeScript/issues/31273. It could've been just a function, but having a class is a little more natural. |
| <a id="cluster"></a> `CLUSTER` | [`Cluster`](../classes/Cluster.md)\<`TClient`, `any`\> | A Cluster where this Ent lives. |
| <a id="schema"></a> `SCHEMA` | [`Schema`](../classes/Schema.md)\<`TTable`, `TUniqueKey`\> | A schema which represents this Ent. |
| <a id="shard_affinity"></a> `SHARD_AFFINITY` | [`ShardAffinity`](../type-aliases/ShardAffinity.md)\<[`FieldOfIDType`](../type-aliases/FieldOfIDType.md)\<`TTable`\>\> | Defines how to find the right Shard during Ent insertion. |
| <a id="shard_locator"></a> `SHARD_LOCATOR` | [`ShardLocator`](../classes/ShardLocator.md)\<`TClient`, `TTable`, [`FieldOfIDType`](../type-aliases/FieldOfIDType.md)\<`TTable`\>\> | Shard locator for this Ent, responsible for resolving IDs into Shard objects. |
| <a id="validation"></a> `VALIDATION` | [`Validation`](../classes/Validation.md)\<`TTable`\> | Privacy rules for this Ent class. |
| <a id="triggers"></a> `TRIGGERS` | [`Triggers`](../classes/Triggers.md)\<`TTable`\> | Triggers for this Ent class. |
| <a id="inverses"></a> `INVERSES` | [`Inverse`](../classes/Inverse.md)\<`TClient`, `TTable`\>[] | Inverse assoc managers for fields. |

## Methods

### configure()

> **configure**(): [`Configuration`](../classes/Configuration.md)\<`TTable`\>

Defined in: [src/ent/mixins/ConfigMixin.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L29)

Some Ent parameters need to be configured lazily, on the 1st access,
because there could be cyclic references between Ent classes (e.g. in their
privacy rules). So configure() is called on some later stage, at the moment
of actual Ent operations (like loading, creation etc.). There is no static
abstract methods in TS yet, so making it non-abstract.

#### Returns

[`Configuration`](../classes/Configuration.md)\<`TTable`\>
