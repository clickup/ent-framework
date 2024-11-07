[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / Inverse

# Class: Inverse\<TClient, TTable\>

Represents an Inverse assoc manager which knows how to modify/query Inverses.
Parameter `name` is the Inverse's schema name (in relational databases, most
likely a table name), and `type` holds both the name of the "parent" entity
and the field name of the child (e.g. "org2users" when a field "org_id" in
EntUser refers an EntOrg row).

## Type Parameters

| Type Parameter |
| ------ |
| `TClient` *extends* [`Client`](Client.md) |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Constructors

### new Inverse()

> **new Inverse**\<`TClient`, `TTable`\>(`__namedParameters`): [`Inverse`](Inverse.md)\<`TClient`, `TTable`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `object` |
| `__namedParameters.cluster` | [`Cluster`](Cluster.md)\<`TClient`, `any`\> |
| `__namedParameters.shardAffinity` | [`ShardAffinity`](../type-aliases/ShardAffinity.md)\<`string`\> |
| `__namedParameters.id2Schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `__namedParameters.id2Field` | [`FieldOfIDTypeRequired`](../type-aliases/FieldOfIDTypeRequired.md)\<`TTable`\> |
| `__namedParameters.name` | `string` |
| `__namedParameters.type` | `string` |

#### Returns

[`Inverse`](Inverse.md)\<`TClient`, `TTable`\>

#### Defined in

[src/ent/Inverse.ts:37](https://github.com/clickup/ent-framework/blob/master/src/ent/Inverse.ts#L37)

## Properties

| Property | Type |
| ------ | ------ |
| `id2Field` | [`FieldOfIDTypeRequired`](../type-aliases/FieldOfIDTypeRequired.md)\<`TTable`\> |
| `type` | `string` |

## Methods

### beforeInsert()

> **beforeInsert**(`vc`, `id1`, `id2`): `Promise`\<`boolean`\>

Runs before a row with a pre-generated id2 was inserted to the main schema.
Returns true if the Inverse row was actually inserted in the DB.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `id1` | `null` \| `string` |
| `id2` | `string` |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/Inverse.ts:64](https://github.com/clickup/ent-framework/blob/master/src/ent/Inverse.ts#L64)

***

### afterUpdate()

> **afterUpdate**(`vc`, `id1`, `id2`, `oldID1`): `Promise`\<`void`\>

Runs after a row was updated in the main schema.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `id1` | `null` \| `string` |
| `id2` | `string` |
| `oldID1` | `null` \| `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/ent/Inverse.ts:88](https://github.com/clickup/ent-framework/blob/master/src/ent/Inverse.ts#L88)

***

### afterDelete()

> **afterDelete**(`vc`, `id1`, `id2`): `Promise`\<`void`\>

Runs after a row was deleted in the main schema.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `id1` | `null` \| `string` |
| `id2` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/ent/Inverse.ts:107](https://github.com/clickup/ent-framework/blob/master/src/ent/Inverse.ts#L107)

***

### id2s()

> **id2s**(`vc`, `id1`): `Promise`\<`string`[]\>

Returns all id2s by a particular (id1, type) pair. The number of resulting
rows is limited to not overload the database.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `id1` | `null` \| `string` |

#### Returns

`Promise`\<`string`[]\>

#### Defined in

[src/ent/Inverse.ts:130](https://github.com/clickup/ent-framework/blob/master/src/ent/Inverse.ts#L130)
