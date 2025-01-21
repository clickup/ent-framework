[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Configuration

# Class: Configuration\<TTable\>

Defined in: [src/ent/Configuration.ts:37](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L37)

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

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Constructors

### new Configuration()

> **new Configuration**\<`TTable`\>(`cfg`): [`Configuration`](Configuration.md)\<`TTable`\>

Defined in: [src/ent/Configuration.ts:138](https://github.com/clickup/ent-framework/blob/master/src/ent/Configuration.ts#L138)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `cfg` | [`Configuration`](Configuration.md)\<`TTable`\> |

#### Returns

[`Configuration`](Configuration.md)\<`TTable`\>

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="shardaffinity"></a> `shardAffinity` | [`ShardAffinity`](../type-aliases/ShardAffinity.md)\<[`FieldOfIDType`](../type-aliases/FieldOfIDType.md)\<`TTable`\>\> | Defines how to locate a Shard at Ent insert time. See ShardAffinity for more details. 1. GLOBAL_SHARD: places the Ent in the global Shard (0). 2. `[]`: places the Ent in a random Shard. The "randomness" of the "random Shard" is deterministic by the Ent's unique key at the moment of insertion (if it's defined; otherwise completely random). This helps two racy insert operations running concurrently to choose the same Shard for the Ent to be created in, so only one of them will win, instead of both winning and mistakenly creating the Ent duplicates. I.e. having the same value in unique key forces the engine to target the same "random" Shard. 3. `["field1", "field2", ...]`: places the Ent in the Shard that is pointed to by the value in field1 (if it's null, then field2 etc.). A special treatment is applied if a fieldN value in (3) points to the global Shard. In such a case, the Shard for the current Ent is chosen deterministic-randomly at insert time, as if [] is passed. This allows the Ent to refer other "owning" Ents of different types, some of which may be located in the global Shard. Keep in mind that, to locate such an Ent pointing to another Ent in the global Shard, an inverse for fieldN must be defined in most of the cases. |
| <a id="inverses"></a> `inverses?` | `{ [k in string]?: { name: string; type: string } }` | Inverses allow cross-Shard foreign keys & cross-Shard selection. If a field points to an Ent in another Shard, and we're e.g. selecting by a value in this field, inverses allow to locate Shard(s) of the Ent. |
| <a id="privacytenantprincipalfield"></a> `privacyTenantPrincipalField?` | [`InsertFieldsRequired`](../type-aliases/InsertFieldsRequired.md)\<`TTable`\> & `string` | If defined, forces all Ents of this class to have the value of that field equal to VC's principal at load time. This is a very 1st unavoidable check in the privacy rules chain, thus it's bullet-proof. |
| <a id="privacyinferprincipal"></a> `privacyInferPrincipal` | `null` \| `string` \| (`vc`, `row`) => `Promise`\<`null` \| `string` \| [`Ent`](../interfaces/Ent.md)\<\{\}\>\> | An attempt to load this Ent using an omni VC will "lower" that VC to the principal returned. Omni VC is always lowered. 1. If an Ent is returned, the lowered principal will be Ent#vc.principal. It is a way to delegate principal inference to another Ent. 2. If a string is returned, then it's treated as a principal ID. 3. If a null is returned, then a guest principal will be used. 4. Returning an omni principal or VC will result in a run-time error. |
| <a id="privacyload"></a> `privacyLoad` | [`LoadRule`](../type-aliases/LoadRule.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>\>[] | Privacy rules checked on every row loaded from the DB. |
| <a id="privacyinsert"></a> `privacyInsert` | [`WriteRules`](../type-aliases/WriteRules.md)\<[`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>\> | Privacy rules checked before a row is inserted to the DB. - It the list is empty, then only omni VC can insert; it's typically a good option for Ents representing e.g. a user. - If no update/delete rules are defined, then privacyInsert rules are also run on update/delete by default. - Unless empty, the rules must include at least one Require() predicate, they can't entirely consist of AllowIf(). This is because for write rules (privacyInsert, privacyUpdate, privacyDelete) it's important to make sure that ALL rules permit the operation, not only one of them allows it; this is what Require() is exactly for. |
| <a id="privacyupdate"></a> `privacyUpdate?` | [`WriteRules`](../type-aliases/WriteRules.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>\> | Privacy rules checked before a row is updated in the DB. - If not defined, privacyInsert rules are used. - The rules must include at least one Require() predicate. |
| <a id="privacydelete"></a> `privacyDelete?` | [`WriteRules`](../type-aliases/WriteRules.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>\> | Privacy rules checked before a row is deleted in the DB. - If not defined, privacyInsert rules are used. - The rules must include at least one Require() predicate. |
| <a id="validators"></a> `validators?` | [`Predicate`](../interfaces/Predicate.md)\<[`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>\> & [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[] | Custom field values validators run before any insert/update. |
| <a id="beforeinsert"></a> `beforeInsert?` | [`InsertTrigger`](../type-aliases/InsertTrigger.md)\<`TTable`\>[] | Triggers run before every insert. |
| <a id="beforeupdate"></a> `beforeUpdate?` | ([`BeforeUpdateTrigger`](../type-aliases/BeforeUpdateTrigger.md)\<`TTable`\> \| \[[`DepsBuilder`](../type-aliases/DepsBuilder.md)\<`TTable`\>, [`BeforeUpdateTrigger`](../type-aliases/BeforeUpdateTrigger.md)\<`TTable`\>\])[] | Triggers run before every update. |
| <a id="beforedelete"></a> `beforeDelete?` | [`DeleteTrigger`](../type-aliases/DeleteTrigger.md)\<`TTable`\>[] | Triggers run before every delete. |
| <a id="beforemutation"></a> `beforeMutation?` | ([`BeforeMutationTrigger`](../type-aliases/BeforeMutationTrigger.md)\<`TTable`\> \| \[[`DepsBuilder`](../type-aliases/DepsBuilder.md)\<`TTable`\>, [`BeforeMutationTrigger`](../type-aliases/BeforeMutationTrigger.md)\<`TTable`\>\])[] | Triggers run before every insert/update/delete. Each trigger may also be passed as "React useEffect-like" tuple where the callback is executed only if the deps are modified. |
| <a id="afterinsert"></a> `afterInsert?` | [`InsertTrigger`](../type-aliases/InsertTrigger.md)\<`TTable`\>[] | Triggers run after every delete. |
| <a id="afterupdate"></a> `afterUpdate?` | ([`AfterUpdateTrigger`](../type-aliases/AfterUpdateTrigger.md)\<`TTable`\> \| \[[`DepsBuilder`](../type-aliases/DepsBuilder.md)\<`TTable`\>, [`AfterUpdateTrigger`](../type-aliases/AfterUpdateTrigger.md)\<`TTable`\>\])[] | Triggers run after every update. |
| <a id="afterdelete"></a> `afterDelete?` | [`DeleteTrigger`](../type-aliases/DeleteTrigger.md)\<`TTable`\>[] | Triggers run after every delete. |
| <a id="aftermutation"></a> `afterMutation?` | ([`AfterMutationTrigger`](../type-aliases/AfterMutationTrigger.md)\<`TTable`\> \| \[[`DepsBuilder`](../type-aliases/DepsBuilder.md)\<`TTable`\>, [`AfterMutationTrigger`](../type-aliases/AfterMutationTrigger.md)\<`TTable`\>\])[] | Triggers run after every insert/update/delete. Each trigger may also be passed as "React useEffect-like" tuple where the callback is executed only if the deps are modified. |
