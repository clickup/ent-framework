[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Inverse

# Class: Inverse<TClient, TTable\>

Represents an inverse assoc manager which knows how to modify/query/fix
inverses. Parameter `name` is the inverse's schema name (in SQL like
databases, most likely a table name), and `type` defines which schema refers
another schema (e.g. "org2user").

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |
| `TTable` | extends [`Table`](../modules.md#table) |

## Constructors

### constructor

• **new Inverse**<`TClient`, `TTable`\>(`cluster`, `id2Schema`, `id2Field`, `name`, `type`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md)<`TClient`\> |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `cluster` | [`Cluster`](Cluster.md)<`TClient`\> |
| `id2Schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `id2Field` | [`IDFieldsRequired`](../modules.md#idfieldsrequired)<`TTable`\> |
| `name` | `string` |
| `type` | `string` |

#### Defined in

[packages/ent-framework/src/ent/Inverse.ts:27](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Inverse.ts#L27)

## Properties

### cluster

• `Readonly` **cluster**: [`Cluster`](Cluster.md)<`TClient`\>

___

### id2Field

• `Readonly` **id2Field**: [`IDFieldsRequired`](../modules.md#idfieldsrequired)<`TTable`\>

___

### id2Schema

• `Readonly` **id2Schema**: [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

___

### name

• `Readonly` **name**: `string`

___

### type

• `Readonly` **type**: `string`

## Methods

### afterDelete

▸ **afterDelete**(`vc`, `id1`, `id2`): `Promise`<`void`\>

Runs after a row was deleted in the main schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `id1` | ``null`` \| `string` |
| `id2` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/ent/Inverse.ts:68](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Inverse.ts#L68)

___

### afterInsert

▸ **afterInsert**(`vc`, `id1`, `id2`): `Promise`<`void`\>

Runs after a row was inserted to the main schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `id1` | ``null`` \| `string` |
| `id2` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/ent/Inverse.ts:38](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Inverse.ts#L38)

___

### afterUpdate

▸ **afterUpdate**(`vc`, `id1`, `id2`, `oldID1`): `Promise`<`void`\>

Runs after a row was updated in the main schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `id1` | ``null`` \| `string` |
| `id2` | `string` |
| `oldID1` | ``null`` \| `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/ent/Inverse.ts:49](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Inverse.ts#L49)

___

### id2s

▸ **id2s**(`vc`, `id1`): `Promise`<`string`[]\>

Returns all id2s by a particular (id1, type) pair. The number of resulting
rows is limited to not overload the database.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `id1` | ``null`` \| `string` |

#### Returns

`Promise`<`string`[]\>

#### Defined in

[packages/ent-framework/src/ent/Inverse.ts:83](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Inverse.ts#L83)
