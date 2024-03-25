[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgRunner

# Class: PgRunner\<TTable, TInput, TOutput\>

A convenient pile of helper methods usable by most of PgQuery* classes. In
some sense it's an anti-pattern, but still reduces the boilerplate.

PgRunner is also responsible for stringifying the values passed to the
queries and parsing values returned from the DB according to the field types
specs.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TInput` | `TInput` |
| `TOutput` | `TOutput` |

## Hierarchy

- [`Runner`](Runner.md)\<`TInput`, `TOutput`\>

  ↳ **`PgRunner`**

## Constructors

### constructor

• **new PgRunner**\<`TTable`, `TInput`, `TOutput`\>(`schema`, `client`): [`PgRunner`](PgRunner.md)\<`TTable`, `TInput`, `TOutput`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TInput` | `TInput` |
| `TOutput` | `TOutput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\> |
| `client` | [`PgClient`](PgClient.md) |

#### Returns

[`PgRunner`](PgRunner.md)\<`TTable`, `TInput`, `TOutput`\>

#### Overrides

[Runner](Runner.md).[constructor](Runner.md#constructor)

#### Defined in

[src/pg/PgRunner.ts:499](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L499)

## Properties

### IS\_WRITE

▪ `Static` `Readonly` **IS\_WRITE**: `boolean`

If true, it's a write operation.

#### Inherited from

[Runner](Runner.md).[IS_WRITE](Runner.md#is_write)

#### Defined in

[src/abstract/Runner.ts:11](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L11)

___

### op

• `Readonly` `Abstract` **op**: `string`

Operation name for logging purposes.

#### Inherited from

[Runner](Runner.md).[op](Runner.md#op)

#### Defined in

[src/abstract/Runner.ts:17](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L17)

___

### maxBatchSize

• `Readonly` `Abstract` **maxBatchSize**: `number`

Maximum batch size for this type of operations.

#### Inherited from

[Runner](Runner.md).[maxBatchSize](Runner.md#maxbatchsize)

#### Defined in

[src/abstract/Runner.ts:20](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L20)

___

### default

• `Readonly` `Abstract` **default**: `TOutput`

In case undefined is returned from batching, this value will be returned
instead.

#### Inherited from

[Runner](Runner.md).[default](Runner.md#default)

#### Defined in

[src/abstract/Runner.ts:24](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L24)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[Runner](Runner.md).[name](Runner.md#name)

#### Defined in

[src/abstract/Runner.ts:69](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L69)

___

### constructor

• **constructor**: typeof [`PgRunner`](PgRunner.md)

#### Defined in

[src/pg/PgRunner.ts:59](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L59)

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\>

#### Defined in

[src/pg/PgRunner.ts:500](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L500)

## Methods

### runSingle

▸ **runSingle**(`input`, `annotations`): `Promise`\<`undefined` \| `TOutput`\>

Method runSingle is to e.g. produce simple DB requests when we have only
one input to process, not many.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `TInput` |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`\<`undefined` \| `TOutput`\>

#### Inherited from

[Runner](Runner.md).[runSingle](Runner.md#runsingle)

#### Defined in

[src/abstract/Runner.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L30)

___

### runBatch

▸ **runBatch**(`inputs`, `annotations`): `Promise`\<`Map`\<`string`, `TOutput`\>\>

Typically issues complex queries with magic.

#### Parameters

| Name | Type |
| :------ | :------ |
| `inputs` | `Map`\<`string`, `TInput`\> |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`\<`Map`\<`string`, `TOutput`\>\>

#### Inherited from

[Runner](Runner.md).[runBatch](Runner.md#runbatch)

#### Defined in

[src/abstract/Runner.ts:38](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L38)

___

### key

▸ **key**(`_input`): `string`

Returns a batch-dedupping key for the input. By default, no dedupping is
performed (i.e. all inputs are processed individually and not collapsed
into one input; e.g. this is needed for inserts).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_input` | `TInput` |

#### Returns

`string`

#### Inherited from

[Runner](Runner.md).[key](Runner.md#key)

#### Defined in

[src/abstract/Runner.ts:76](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L76)

___

### clientQuery

▸ **clientQuery**\<`TOutput`\>(`sql`, `annotations`, `batchFactor`, `hints?`): `Promise`\<`TOutput`[]\>

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
| `hints?` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<`TOutput`[]\>

#### Defined in

[src/pg/PgRunner.ts:61](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L61)

___

### fmt

▸ **fmt**(`template`, `args?`): `string`

Formats prefixes/suffixes of various compound SQL clauses. Don't use on
performance-critical path!

#### Parameters

| Name | Type |
| :------ | :------ |
| `template` | `string` |
| `args` | `Object` |
| `args.fields?` | [`FieldAliased`](../modules.md#fieldaliased)\<`TTable`\>[] |
| `args.normalize?` | `boolean` |

#### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:100](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L100)

___

### escapeValue

▸ **escapeValue**(`field`, `value`): `string`

Escapes a value at runtime using the codegen functions created above. We
use escapers table and the codegen for the following reasons:
1. We want to be sure that we know in advance, how to escape all table
   fields (and not fail at runtime).
2. We want to make createEscapeCode() the single source of truth about
   fields escaping, even at runtime.

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | [`Field`](../modules.md#field)\<`TTable`\> |
| `value` | `unknown` |

#### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:166](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L166)

___

### escapeField

▸ **escapeField**(`info`, `«destructured»?`): `string`

Escapes field name identifier.
- In case it's a composite primary key, returns its `ROW(f1,f2,...)`
  representation.
- A field may be aliased, e.g. if `{ field: "abc", alias: "$cas.abc" }` is
  passed, then the returned value will be `"$cas.abc"`. Basically, `field`
  name is used only to verify that such field is presented in the schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `info` | [`FieldAliased`](../modules.md#fieldaliased)\<`TTable`\> |
| `«destructured»` | `Object` |
| › `withTable?` | `string` |
| › `normalize?` | `boolean` |

#### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:179](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L179)

___

### createWithBuilder

▸ **createWithBuilder**(`«destructured»`): `Object`

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
| › `fields` | readonly [`FieldAliased`](../modules.md#fieldaliased)\<`TTable`\>[] |
| › `suffix` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `prefix` | `string` |
| `func` | (`entries`: `Iterable`\<[key: string, input: object]\>) => `string` |
| `suffix` | `string` |

#### Defined in

[src/pg/PgRunner.ts:217](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L217)

___

### createValuesBuilder

▸ **createValuesBuilder**\<`TInput`\>(`«destructured»`): `Object`

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
| › `fields` | readonly [`FieldAliased`](../modules.md#fieldaliased)\<`TTable`\>[] |
| › `withKey?` | `boolean` |
| › `skipSorting?` | `boolean` |
| › `suffix` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `prefix` | `string` |
| `func` | (`entries`: `Iterable`\<[key: string, input: TInput]\>) => `string` |
| `suffix` | `string` |

#### Defined in

[src/pg/PgRunner.ts:285](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L285)

___

### createUpdateKVsBuilder

▸ **createUpdateKVsBuilder**(`fields`): (`input`: `object`, `literal?`: [`Literal`](../modules.md#literal)) => `string`

Returns a newly created JS function which, when called with an object,
returns the following SQL clause:

id='123', a='xyz', b='nnn' [, {literal}]

The set of columns is passed in specs, all other columns are ignored.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fields` | [`Field`](../modules.md#field)\<`TTable`\>[] |

#### Returns

`fn`

▸ (`input`, `literal?`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `object` |
| `literal?` | [`Literal`](../modules.md#literal) |

##### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:356](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L356)

___

### createOneOfBuilder

▸ **createOneOfBuilder**(`field`, `fieldValCode?`): (`values`: `Iterable`\<`unknown`\>) => `string`

Prefers to do utilize createAnyBuilder() if it can (i.e. build
a=ANY('{...}') clause). Otherwise, builds an IN(...) clause.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `field` | [`Field`](../modules.md#field)\<`TTable`\> | `undefined` |
| `fieldValCode` | `string` | `"$value"` |

#### Returns

`fn`

▸ (`values`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `Iterable`\<`unknown`\> |

##### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:384](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L384)

___

### createWhereBuildersFieldsEq

▸ **createWhereBuildersFieldsEq**\<`TInput`\>(`args`): `Object`

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
| `args.fields` | readonly [`Field`](../modules.md#field)\<`TTable`\>[] |
| `args.suffix` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `plain` | \{ `prefix`: `string` ; `func`: (`inputs`: `Iterable`\<[key: string, input: TInput]\>) => `string` ; `suffix`: `string`  } |
| `plain.prefix` | `string` |
| `plain.func` | (`inputs`: `Iterable`\<[key: string, input: TInput]\>) => `string` |
| `plain.suffix` | `string` |
| `optimized` | \{ `prefix`: `string` ; `func`: (`inputs`: `Iterable`\<[key: string, input: TInput]\>) => `string` ; `suffix`: `string`  } |
| `optimized.prefix` | `string` |
| `optimized.func` | (`inputs`: `Iterable`\<[key: string, input: TInput]\>) => `string` |
| `optimized.suffix` | `string` |

#### Defined in

[src/pg/PgRunner.ts:418](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L418)

___

### createWhereBuilder

▸ **createWhereBuilder**(`«destructured»`): `Object`

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
| `func` | (`where`: [`Where`](../modules.md#where)\<`TTable`\>) => `string` |
| `suffix` | `string` |

#### Defined in

[src/pg/PgRunner.ts:453](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L453)

___

### addPK

▸ **addPK**(`fields`, `mode`): `string`[]

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
| `fields` | readonly [`Field`](../modules.md#field)\<`TTable`\>[] |
| `mode` | ``"prepend"`` \| ``"append"`` |

#### Returns

`string`[]

#### Defined in

[src/pg/PgRunner.ts:488](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L488)

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

#### Overrides

[Runner](Runner.md).[delayForSingleQueryRetryOnError](Runner.md#delayforsinglequeryretryonerror)

#### Defined in

[src/pg/PgRunner.ts:521](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L521)

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

#### Overrides

[Runner](Runner.md).[shouldDebatchOnError](Runner.md#shoulddebatchonerror)

#### Defined in

[src/pg/PgRunner.ts:534](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L534)
