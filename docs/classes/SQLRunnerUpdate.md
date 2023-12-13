[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLRunnerUpdate

# Class: SQLRunnerUpdate<TTable\>

A convenient pile of helper methods usable by most of SQLQuery* classes. In
some sense it's an anti-pattern, but still reduces the boilerplate.

SQLRunner is also responsible for stringifying the values passed to the
queries and parsing values returned from the DB according to the field types
specs.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`SQLRunner`](SQLRunner.md)<`TTable`, [`UpdateInput`](../modules.md#updateinput)<`TTable`\> & { `id`: `string`  }, `boolean`\>

  ↳ **`SQLRunnerUpdate`**

## Constructors

### constructor

• **new SQLRunnerUpdate**<`TTable`\>(`schema`, `client`, `fieldsIn`, `casFieldsIn`, `disableBatching`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `client` | [`SQLClient`](SQLClient.md) |
| `fieldsIn` | [`Field`](../modules.md#field)<`TTable`\>[] |
| `casFieldsIn` | [`Field`](../modules.md#field)<`TTable`\>[] |
| `disableBatching` | `boolean` |

#### Overrides

[SQLRunner](SQLRunner.md).[constructor](SQLRunner.md#constructor-1)

#### Defined in

[src/sql/SQLQueryUpdate.ts:107](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L107)

## Properties

### maxBatchSize

• `Readonly` **maxBatchSize**: `number` = `DEFAULT_MAX_BATCH_SIZE`

Maximum batch size for this type of operations.

#### Inherited from

[SQLRunner](SQLRunner.md).[maxBatchSize](SQLRunner.md#maxbatchsize)

#### Defined in

[src/abstract/Batcher.ts:27](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L27)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[SQLRunner](SQLRunner.md).[name](SQLRunner.md#name)

#### Defined in

[src/abstract/Batcher.ts:83](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L83)

___

### IS\_WRITE

▪ `Static` `Readonly` **IS\_WRITE**: ``true``

If true, it's a write operation.

#### Overrides

[SQLRunner](SQLRunner.md).[IS_WRITE](SQLRunner.md#is_write)

#### Defined in

[src/sql/SQLQueryUpdate.ts:78](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L78)

___

### op

• `Readonly` **op**: ``"UPDATE"``

#### Overrides

[SQLRunner](SQLRunner.md).[op](SQLRunner.md#op)

#### Defined in

[src/sql/SQLQueryUpdate.ts:81](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L81)

___

### default

• `Readonly` **default**: ``false``

In case undefined is returned from batching, this value will be returned
instead.

#### Overrides

[SQLRunner](SQLRunner.md).[default](SQLRunner.md#default)

#### Defined in

[src/sql/SQLQueryUpdate.ts:82](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L82)

___

### runBatch

• **runBatch**: `undefined` \| (`inputs`: `Map`<`string`, { [K in string \| number \| symbol]?: Value<TTable[K]\> } & { `$literal?`: [`Literal`](../modules.md#literal) ; `$cas?`: { [K in string \| number \| symbol]?: Value<TTable[K]\> }  } & { `id`: `string`  }\>, `annotations`: [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[]) => `Promise`<`Map`<`string`, `boolean`\>\>

#### Overrides

[SQLRunner](SQLRunner.md).[runBatch](SQLRunner.md#runbatch)

#### Defined in

[src/sql/SQLQueryUpdate.ts:84](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L84)

___

### shardName

• `Readonly` **shardName**: `string`

Name of the Shard for this Runner.

#### Inherited from

[SQLRunner](SQLRunner.md).[shardName](SQLRunner.md#shardname)

#### Defined in

[src/sql/SQLRunner.ts:48](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L48)

___

### constructor

• **constructor**: typeof [`SQLRunner`](SQLRunner.md)

#### Inherited from

SQLRunner.constructor

#### Defined in

[src/sql/SQLRunner.ts:50](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L50)

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

#### Inherited from

[SQLRunner](SQLRunner.md).[schema](SQLRunner.md#schema)

#### Defined in

[src/sql/SQLRunner.ts:497](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L497)

## Methods

### key

▸ **key**(`input`): `string`

Returns a batch-dedupping key for the input. By default, no dedupping is
performed (i.e. all inputs are processed individually and not collapsed
into one input; e.g. this is needed for inserts).

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | { [K in string \| number \| symbol]?: Value<TTable[K]\> } & { `$literal?`: [`Literal`](../modules.md#literal) ; `$cas?`: { [K in string \| number \| symbol]?: Value<TTable[K]\> }  } & { `id`: `string`  } |

#### Returns

`string`

#### Overrides

[SQLRunner](SQLRunner.md).[key](SQLRunner.md#key)

#### Defined in

[src/sql/SQLQueryUpdate.ts:171](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L171)

___

### runSingle

▸ **runSingle**(`input`, `annotations`): `Promise`<`boolean`\>

Method runSingle is to e.g. produce simple SQL requests when we have only
one input to process, not many.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | { [K in string \| number \| symbol]?: Value<TTable[K]\> } & { `$literal?`: [`Literal`](../modules.md#literal) ; `$cas?`: { [K in string \| number \| symbol]?: Value<TTable[K]\> }  } & { `id`: `string`  } |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`<`boolean`\>

#### Overrides

[SQLRunner](SQLRunner.md).[runSingle](SQLRunner.md#runsingle)

#### Defined in

[src/sql/SQLQueryUpdate.ts:178](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L178)

___

### clientQuery

▸ `Protected` **clientQuery**<`TOutput`\>(`sql`, `annotations`, `batchFactor`, `hints?`): `Promise`<`TOutput`[]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TOutput` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| `batchFactor` | `number` |
| `hints?` | `Record`<`string`, `string`\> |

#### Returns

`Promise`<`TOutput`[]\>

#### Inherited from

[SQLRunner](SQLRunner.md).[clientQuery](SQLRunner.md#clientquery)

#### Defined in

[src/sql/SQLRunner.ts:54](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L54)

___

### fmt

▸ `Protected` **fmt**(`template`, `args?`): `string`

Formats prefixes/suffixes of various compound SQL clauses. Don't use on
performance-critical path!

#### Parameters

| Name | Type |
| :------ | :------ |
| `template` | `string` |
| `args` | `Object` |
| `args.fields?` | [`FieldAliased`](../modules.md#fieldaliased)<`TTable`\>[] |
| `args.normalize?` | `boolean` |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[fmt](SQLRunner.md#fmt)

#### Defined in

[src/sql/SQLRunner.ts:93](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L93)

___

### escapeValue

▸ `Protected` **escapeValue**(`field`, `value`): `string`

Escapes a value at runtime using the codegen functions created above. We
use escapers table and the codegen for the following reasons:
1. We want to be sure that we know in advance, how to escape all table
   fields (and not fail at runtime).
2. We want to make createEscapeCode() the single source of truth about
   fields escaping, even at runtime.

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | [`Field`](../modules.md#field)<`TTable`\> |
| `value` | `unknown` |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[escapeValue](SQLRunner.md#escapevalue)

#### Defined in

[src/sql/SQLRunner.ts:159](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L159)

___

### escapeField

▸ `Protected` **escapeField**(`info`, `«destructured»?`): `string`

Escapes field name identifier.
- In case it's a composite primary key, returns its `ROW(f1,f2,...)`
  representation.
- A field may be aliased, e.g. if `{ field: "abc", alias: "$cas.abc" }` is
  passed, then the returned value will be `"$cas.abc"`. Basically, `field`
  name is used only to verify that such field is presented in the schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `info` | [`FieldAliased`](../modules.md#fieldaliased)<`TTable`\> |
| `«destructured»` | `Object` |
| › `withTable?` | `string` |
| › `normalize?` | `boolean` |

#### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[escapeField](SQLRunner.md#escapefield)

#### Defined in

[src/sql/SQLRunner.ts:172](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L172)

___

### createWithBuilder

▸ `Protected` **createWithBuilder**(`«destructured»`): `Object`

Returns a newly created JS function which, when called with a row set,
returns the following SQL clause:

```
WITH rows(id, a, b, _key) AS (VALUES
  ((NULL::tbl).id, (NULL::tbl).a, (NULL::tbl).b, 'k0'),
  ('123',          'xyz',         'nn',          'kSome'),
  ('456',          'abc',         'nn',          'kOther'),
  ...
)
{suffix}
```

For composite primary key, its parts (fields) are always prepended. The set
of columns is passed in specs.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `fields` | readonly [`FieldAliased`](../modules.md#fieldaliased)<`TTable`\>[] |
| › `suffix` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `prefix` | `string` |
| `func` | (`entries`: `Iterable`<[key: string, input: object]\>) => `string` |
| `suffix` | `string` |

#### Inherited from

[SQLRunner](SQLRunner.md).[createWithBuilder](SQLRunner.md#createwithbuilder)

#### Defined in

[src/sql/SQLRunner.ts:214](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L214)

___

### createValuesBuilder

▸ `Protected` **createValuesBuilder**<`TInput`\>(`«destructured»`): `Object`

Returns a newly created JS function which, when called with a row set,
returns the following SQL clause (when called with withKey=true):

```
  ('123', 'xyz', 'nn', 'kSome'),
  ('456', 'abc', 'nn', 'kOther'),
  ...
)
```

or (when called without withKey):

```
  ('123', 'xyz', 'nn'),
  ('456', 'abc', 'nn'),
  ...
```

The set of columns is passed in fields.

When the builder func is called, the actual values for some field in a row
is extracted from the same-named prop of the row, but if a `{ field,
rowPath }` object is passed in `fields` array, then the value is extracted
from the `rowPath` sub-prop of the row. This is used to e.g. access
`row.$cas.blah` value for a field named blah (in this case,
`rowPath="$cas"`).

Notice that either a simple primary key or a composite primary key columns
are always prepended to the list of values since it makes no sense to
generate VALUES clause without exact identification of the destination.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `prefix` | `string` |
| › `indent` | `string` |
| › `fields` | readonly [`FieldAliased`](../modules.md#fieldaliased)<`TTable`\>[] |
| › `withKey?` | `boolean` |
| › `skipSorting?` | `boolean` |
| › `suffix` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `prefix` | `string` |
| `func` | (`entries`: `Iterable`<[key: string, input: TInput]\>) => `string` |
| `suffix` | `string` |

#### Inherited from

[SQLRunner](SQLRunner.md).[createValuesBuilder](SQLRunner.md#createvaluesbuilder)

#### Defined in

[src/sql/SQLRunner.ts:282](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L282)

___

### createUpdateKVsBuilder

▸ `Protected` **createUpdateKVsBuilder**(`fields`): (`input`: `object`, `literal?`: [`Literal`](../modules.md#literal)) => `string`

Returns a newly created JS function which, when called with an object,
returns the following SQL clause:

id='123', a='xyz', b='nnn' [, {literal}]

The set of columns is passed in specs, all other columns are ignored.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fields` | [`Field`](../modules.md#field)<`TTable`\>[] |

#### Returns

`fn`

▸ (`input`, `literal?`): `string`

Returns a newly created JS function which, when called with an object,
returns the following SQL clause:

id='123', a='xyz', b='nnn' [, {literal}]

The set of columns is passed in specs, all other columns are ignored.

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `object` |
| `literal?` | [`Literal`](../modules.md#literal) |

##### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[createUpdateKVsBuilder](SQLRunner.md#createupdatekvsbuilder)

#### Defined in

[src/sql/SQLRunner.ts:353](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L353)

___

### createOneOfBuilder

▸ `Protected` **createOneOfBuilder**(`field`, `fieldValCode?`): (`values`: `Iterable`<`unknown`\>) => `string`

Prefers to do utilize createAnyBuilder() if it can (i.e. build
a=ANY('{...}') clause). Otherwise, builds an IN(...) clause.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `field` | [`Field`](../modules.md#field)<`TTable`\> | `undefined` |
| `fieldValCode` | `string` | `"$value"` |

#### Returns

`fn`

▸ (`values`): `string`

Prefers to do utilize createAnyBuilder() if it can (i.e. build
a=ANY('{...}') clause). Otherwise, builds an IN(...) clause.

##### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `Iterable`<`unknown`\> |

##### Returns

`string`

#### Inherited from

[SQLRunner](SQLRunner.md).[createOneOfBuilder](SQLRunner.md#createoneofbuilder)

#### Defined in

[src/sql/SQLRunner.ts:381](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L381)

___

### createWhereBuildersFieldsEq

▸ `Protected` **createWhereBuildersFieldsEq**<`TInput`\>(`args`): `Object`

Given a list of fields, returns two builders:

1. "Optimized": a newly created JS function which, when called with a row
   set, returns one the following SQL clauses:

```
WHERE (field1, field2) IN(VALUES
  ((NULL::tbl).field1, (NULL::tbl).field2),
  ('aa', 'bb'),
  ('cc', 'dd'))

or

WHERE (field1='a' AND field2='b' AND field3 IN('a', 'b', 'c', ...)) OR (...)
       ^^^^^^^^^^prefix^^^^^^^^^               ^^^^^^^^ins^^^^^^^
```

2. "Plain": the last one builder mentioned above (good to always use for
   non-batched queries for instance).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.prefix` | `string` |
| `args.fields` | readonly [`Field`](../modules.md#field)<`TTable`\>[] |
| `args.suffix` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `plain` | { `prefix`: `string` ; `func`: (`inputs`: `Iterable`<[key: string, input: TInput]\>) => `string` ; `suffix`: `string`  } |
| `plain.prefix` | `string` |
| `plain.func` | (`inputs`: `Iterable`<[key: string, input: TInput]\>) => `string` |
| `plain.suffix` | `string` |
| `optimized` | { `prefix`: `string` ; `func`: (`inputs`: `Iterable`<[key: string, input: TInput]\>) => `string` ; `suffix`: `string`  } |
| `optimized.prefix` | `string` |
| `optimized.func` | (`inputs`: `Iterable`<[key: string, input: TInput]\>) => `string` |
| `optimized.suffix` | `string` |

#### Inherited from

[SQLRunner](SQLRunner.md).[createWhereBuildersFieldsEq](SQLRunner.md#createwherebuildersfieldseq)

#### Defined in

[src/sql/SQLRunner.ts:415](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L415)

___

### createWhereBuilder

▸ `Protected` **createWhereBuilder**(`«destructured»`): `Object`

Returns a newly created JS function which, when called with a Where object,
returns the generated SQL WHERE clause.

- The building is relatively expensive, since it traverses the Where object
  at run-time and doesn't know the shape beforehand.
- If the Where object is undefined, skips the entire WHERE clause.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `prefix` | `string` |
| › `suffix` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `prefix` | `string` |
| `func` | (`where`: [`Where`](../modules.md#where)<`TTable`\>) => `string` |
| `suffix` | `string` |

#### Inherited from

[SQLRunner](SQLRunner.md).[createWhereBuilder](SQLRunner.md#createwherebuilder)

#### Defined in

[src/sql/SQLRunner.ts:450](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L450)

___

### addPK

▸ `Protected` **addPK**(`fields`, `mode`): `string`[]

Prepends or appends a primary key to the list of fields. In case the
primary key is plain (i.e. "id" field), it's just added as a field;
otherwise, the unique key fields are added.

For INSERT/UPSERT operations, we want to append the primary key, since it's
often types pre-generated as a random-looking value. In many places, we
sort batched lists of rows before e.g. inserting them, so we order them by
their natural data order which prevents deadlocks on unique key conflict
when multiple concurrent transactions try to insert the same set of rows in
different order ("while inserting index tuple").

For UPDATE operations though, we want to prepend the primary key, to make
sure we run batched updates in the same order in multiple concurrent
transactions. This lowers the chances of deadlocks too.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fields` | readonly [`Field`](../modules.md#field)<`TTable`\>[] |
| `mode` | ``"prepend"`` \| ``"append"`` |

#### Returns

`string`[]

#### Inherited from

[SQLRunner](SQLRunner.md).[addPK](SQLRunner.md#addpk)

#### Defined in

[src/sql/SQLRunner.ts:485](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L485)

___

### delayForSingleQueryRetryOnError

▸ **delayForSingleQueryRetryOnError**(`e`): `number` \| ``"immediate_retry"`` \| ``"no_retry"``

If the single query's error needs to be retried (e.g. it's a deadlock
error), returns the number of milliseconds to wait before retrying.

#### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `unknown` |

#### Returns

`number` \| ``"immediate_retry"`` \| ``"no_retry"``

#### Inherited from

[SQLRunner](SQLRunner.md).[delayForSingleQueryRetryOnError](SQLRunner.md#delayforsinglequeryretryonerror)

#### Defined in

[src/sql/SQLRunner.ts:518](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L518)

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
Client doesn't support transactions at all, then the method should return
false.)

#### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `unknown` |

#### Returns

`boolean`

#### Inherited from

[SQLRunner](SQLRunner.md).[shouldDebatchOnError](SQLRunner.md#shoulddebatchonerror)

#### Defined in

[src/sql/SQLRunner.ts:531](https://github.com/clickup/rest-client/blob/master/src/sql/SQLRunner.ts#L531)
