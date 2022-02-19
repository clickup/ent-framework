[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLRunnerUpdate

# Class: SQLRunnerUpdate<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`SQLRunner`](SQLRunner.md)<`TTable`, [`UpdateInput`](../modules.md#updateinput)<`TTable`\> & { `id`: `string`  }, `boolean`\>

  ↳ **`SQLRunnerUpdate`**

## Constructors

### constructor

• **new SQLRunnerUpdate**<`TTable`\>(`schema`, `client`, `specs`, `disableBatching`)

Parameter `name` is typically a table name.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `client` | [`SQLClient`](../interfaces/SQLClient.md) |
| `specs` | `TTable` |
| `disableBatching` | `boolean` |

#### Overrides

[SQLRunner](SQLRunner.md).[constructor](SQLRunner.md#constructor)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:87](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L87)

## Properties

### constructor

• **constructor**: typeof [`SQLRunner`](SQLRunner.md)

#### Inherited from

SQLRunner.constructor

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:46](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L46)

___

### default

• `Readonly` **default**: ``false``

In case undefined is returned from batching, this value will be returned
instead.

#### Overrides

[SQLRunner](SQLRunner.md).[default](SQLRunner.md#default)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:106](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L106)

___

### isMaster

• `Readonly` **isMaster**: `boolean`

Is it a master or a replica connection.

#### Inherited from

[SQLRunner](SQLRunner.md).[isMaster](SQLRunner.md#ismaster)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L51)

___

### maxBatchSize

• `Readonly` **maxBatchSize**: `number` = `DEFAULT_MAX_BATCH_SIZE`

Maximum batch size for this type of operations.

#### Inherited from

[SQLRunner](SQLRunner.md).[maxBatchSize](SQLRunner.md#maxbatchsize)

#### Defined in

[packages/ent-framework/src/abstract/Batcher.ts:26](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Batcher.ts#L26)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[SQLRunner](SQLRunner.md).[name](SQLRunner.md#name)

___

### op

• `Readonly` **op**: ``"UPDATE"``

#### Overrides

[SQLRunner](SQLRunner.md).[op](SQLRunner.md#op)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:79](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L79)

___

### runBatch

• **runBatch**: `undefined` \| (`inputs`: `Map`<`string`, { [K in string \| number \| symbol]?: Value<TTable[K]\> } & { `$literal?`: [`Literal`](../modules.md#literal)  } & { `id`: `string`  }\>, `annotations`: [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[]) => `Promise`<`Map`<`string`, `boolean`\>\>

#### Overrides

[SQLRunner](SQLRunner.md).[runBatch](SQLRunner.md#runbatch)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:128](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L128)

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

#### Inherited from

[SQLRunner](SQLRunner.md).[schema](SQLRunner.md#schema)

___

### shardName

• `Readonly` **shardName**: `string`

Name of the shard for this runner.

#### Inherited from

[SQLRunner](SQLRunner.md).[shardName](SQLRunner.md#shardname)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:50](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L50)

___

### IS\_WRITE

▪ `Static` `Readonly` **IS\_WRITE**: ``true``

If true, it's a write operation.

#### Overrides

[SQLRunner](SQLRunner.md).[IS_WRITE](SQLRunner.md#is_write)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:78](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L78)

## Methods

### buildFieldBinOp

▸ `Protected` **buildFieldBinOp**(`field`, `binOp`, `value`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | keyof `TTable` |
| `binOp` | `string` |
| `value` | `NonNullable`<[`Value`](../modules.md#value)<`TTable`[keyof `TTable`]\>\> |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[buildFieldBinOp](SQLRunner.md#buildfieldbinop)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:414](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L414)

___

### buildFieldEq

▸ `Protected` **buildFieldEq**(`field`, `value`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | keyof `TTable` |
| `value` | [`Where`](../modules.md#where)<`TTable`\>[keyof `TTable`] |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[buildFieldEq](SQLRunner.md#buildfieldeq)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:450](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L450)

___

### buildLiteral

▸ `Protected` **buildLiteral**(`literal`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `literal` | [`Literal`](../modules.md#literal) |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[buildLiteral](SQLRunner.md#buildliteral)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:494](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L494)

___

### buildLogical

▸ `Protected` **buildLogical**(`specs`, `op`, `items`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `specs` | `TTable` |
| `op` | ``"OR"`` \| ``"AND"`` |
| `items` | [`Where`](../modules.md#where)<`TTable`\>[] |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[buildLogical](SQLRunner.md#buildlogical)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:476](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L476)

___

### buildNot

▸ `Protected` **buildNot**(`specs`, `where`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `specs` | `TTable` |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[buildNot](SQLRunner.md#buildnot)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:490](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L490)

___

### buildOptionalWhere

▸ `Protected` **buildOptionalWhere**(`specs`, `where`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `specs` | `TTable` |
| `where` | `undefined` \| [`Where`](../modules.md#where)<`TTable`\> |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[buildOptionalWhere](SQLRunner.md#buildoptionalwhere)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:313](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L313)

___

### buildWhere

▸ `Protected` **buildWhere**(`specs`, `where`, `isTopLevel?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `specs` | `TTable` | `undefined` |
| `where` | [`Where`](../modules.md#where)<`TTable`\> | `undefined` |
| `isTopLevel` | `boolean` | `false` |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[buildWhere](SQLRunner.md#buildwhere)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:324](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L324)

___

### clientQuery

▸ `Protected` **clientQuery**<`TOutput`\>(`sql`, `annotations`, `batchFactor`): `Promise`<`TOutput`[]\>

#### Type parameters

| Name |
| :------ |
| `TOutput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| `batchFactor` | `number` |

#### Returns

`Promise`<`TOutput`[]\>

#### Inherited from

[SQLRunner](SQLRunner.md).[clientQuery](SQLRunner.md#clientquery)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:100](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L100)

___

### createInBuilder

▸ `Protected` **createInBuilder**(`field`, `fieldCode?`): (`values`: `Iterable`<`any`\>) => `string`

Returns a newly created JS function which, when called with an array
of values, returns one of following SQL clause:

- $field IN('aaa', 'bbb', 'ccc')
- ($field IN('aaa', 'bbb') OR $field IS NULL)
- $field IS NULL
- false

If $subField is passed, then $f is "$subField.$field"

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `field` | keyof `TTable` | `undefined` |
| `fieldCode` | `string` | `"value"` |

#### Returns

`fn`

▸ (`values`): `string`

Returns a newly created JS function which, when called with an array
of values, returns one of following SQL clause:

- $field IN('aaa', 'bbb', 'ccc')
- ($field IN('aaa', 'bbb') OR $field IS NULL)
- $field IS NULL
- false

If $subField is passed, then $f is "$subField.$field"

##### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `Iterable`<`any`\> |

##### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[createInBuilder](SQLRunner.md#createinbuilder)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:282](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L282)

___

### createUpdateKVsBuilder

▸ `Protected` **createUpdateKVsBuilder**<`TInput`\>(`specs`): (`input`: `TInput`) => `string`

Returns a newly created JS function which, when called with an object,
returns the following SQL clause:

id='123', a='xyz', b='nnn'

The set of columns is passed in specs, all other columns are ignored.

#### Type parameters

| Name |
| :------ |
| `TInput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `specs` | `Partial`<[`Table`](../modules.md#table)\> |

#### Returns

`fn`

▸ (`input`): `string`

Returns a newly created JS function which, when called with an object,
returns the following SQL clause:

id='123', a='xyz', b='nnn'

The set of columns is passed in specs, all other columns are ignored.

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `TInput` |

##### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[createUpdateKVsBuilder](SQLRunner.md#createupdatekvsbuilder)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:255](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L255)

___

### createValuesBuilder

▸ `Protected` **createValuesBuilder**<`TRow`\>(`specs`, `noKey?`): `Object`

Returns a newly created JS function which, when called with a row set,
returns the following SQL clause:

WITH rows(id, a, b, _key) AS (VALUES
  ((NULL::tbl).id, (NULL::tbl).a, (NULL::tbl).b, 'k0'),
  ('123',          'xyz',         'nn',          'kSome'),
  ('456',          'abc',         'nn',          'kOther'),
  ...
)

The set of columns is passed in specs; if noKey is false, then no _key
field is emitted in the end.

#### Type parameters

| Name |
| :------ |
| `TRow` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `specs` | [`Table`](../modules.md#table) | `undefined` |
| `noKey` | `boolean` | `false` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `prefix` | `string` |
| `suffix` | `string` |
| `func` | (`$key`: `string`, `$input`: `TRow`) => `string` |

#### Inherited from

[SQLRunner](SQLRunner.md).[createValuesBuilder](SQLRunner.md#createvaluesbuilder)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:203](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L203)

___

### delayForSingleQueryRetryOnError

▸ **delayForSingleQueryRetryOnError**(`e`): `number` \| ``"immediate_retry"`` \| ``"no_retry"``

If the single query's error needs to be retried (e.g. it's a deadlock
error), returns the number of milliseconds to wait before retrying.

#### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `any` |

#### Returns

`number` \| ``"immediate_retry"`` \| ``"no_retry"``

#### Inherited from

[SQLRunner](SQLRunner.md).[delayForSingleQueryRetryOnError](SQLRunner.md#delayforsinglequeryretryonerror)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:79](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L79)

___

### escape

▸ `Protected` **escape**(`field`, `value`): `string`

Does escaping at runtime using the codegen above. We use escapers table for
the following reasons:
1. We want to be sure that we know in advance, how to escape all table
   fields (and not fail in run-time).
2. We want to make createEscapeCode() the single source of truth about
   fields escaping.

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | keyof `TTable` |
| `value` | `any` |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[escape](SQLRunner.md#escape)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:175](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L175)

___

### fmt

▸ `Protected` **fmt**(`template`, `args?`): `string`

Formats the prefixes/suffixes of various compound SQL clauses.
Don't use on performance-critical path!

#### Parameters

| Name | Type |
| :------ | :------ |
| `template` | `string` |
| `args` | `Object` |
| `args.specs?` | `Partial`<[`Table`](../modules.md#table)\> |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[fmt](SQLRunner.md#fmt)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:136](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L136)

___

### key

▸ **key**(`input`): `string`

Returns a batch-dedupping key for the input. By default, no dedupping is
performed (i.e. all inputs are processed individually and not collapsed
into one input; e.g. this is needed for inserts).

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | { [K in string \| number \| symbol]?: Value<TTable[K]\> } & { `$literal?`: [`Literal`](../modules.md#literal)  } & { `id`: `string`  } |

#### Returns

`string`

#### Overrides

[SQLRunner](SQLRunner.md).[key](SQLRunner.md#key)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:108](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L108)

___

### runSingle

▸ **runSingle**(`input`, `annotations`): `Promise`<`boolean`\>

Method runSingle is to e.g. produce simple SQL requests when we have only
one input to process, not many.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | { [K in string \| number \| symbol]?: Value<TTable[K]\> } & { `$literal?`: [`Literal`](../modules.md#literal)  } & { `id`: `string`  } |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`<`boolean`\>

#### Overrides

[SQLRunner](SQLRunner.md).[runSingle](SQLRunner.md#runsingle)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:112](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L112)

___

### shouldDebatchOnError

▸ **shouldDebatchOnError**(`e`): `boolean`

If this method returns true for an error object, the batch is split back
into sub-queries, they are executed individually, and then the response of
each query is delivered to each caller individually. Used mostly for e.g.
batch-deadlock errors or for FK constraint errors when it makes sense to
retry other members of the batch and not fail it entirely hurting other
innocent queries.

We can do this, because we know that if some transaction is aborted, it's
always safe to retry it. (If we're not sure about the transaction, e.g. the
client doesn't support transactions at all, then the method should return
false.)

#### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `any` |

#### Returns

`boolean`

#### Inherited from

[SQLRunner](SQLRunner.md).[shouldDebatchOnError](SQLRunner.md#shoulddebatchonerror)

#### Defined in

[packages/ent-framework/src/sql/SQLRunner.ts:90](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLRunner.ts#L90)
