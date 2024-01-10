[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / DefaultMap

# Class: DefaultMap<K, V\>

## Type parameters

| Name |
| :------ |
| `K` |
| `V` |

## Hierarchy

- `Map`<`K`, `V`\>

  ↳ **`DefaultMap`**

## Constructors

### constructor

• **new DefaultMap**<`K`, `V`\>(`entries?`)

#### Type parameters

| Name |
| :------ |
| `K` |
| `V` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entries?` | ``null`` \| readonly readonly [`K`, `V`][] |

#### Inherited from

Map<K, V\>.constructor

#### Defined in

../../node_modules/typescript/lib/lib.es2015.collection.d.ts:51

• **new DefaultMap**<`K`, `V`\>(`iterable?`)

#### Type parameters

| Name |
| :------ |
| `K` |
| `V` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `iterable?` | ``null`` \| `Iterable`<readonly [`K`, `V`]\> |

#### Inherited from

Map<K, V\>.constructor

#### Defined in

../../node_modules/typescript/lib/lib.es2015.iterable.d.ts:159

## Methods

### getOrAdd

▸ **getOrAdd**(`k`, `DefConstructor`): `V`

#### Parameters

| Name | Type |
| :------ | :------ |
| `k` | `K` |
| `DefConstructor` | () => `V` |

#### Returns

`V`

#### Defined in

[src/helpers/DefaultMap.ts:2](https://github.com/clickup/ent-framework/blob/master/src/helpers/DefaultMap.ts#L2)
