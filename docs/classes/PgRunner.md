[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / PgRunner

# Class: `abstract` PgRunner\<TTable, TInput, TOutput\>

A convenient pile of helper methods usable by most of PgQuery* classes. In
some sense it's an anti-pattern, but still reduces the boilerplate.

PgRunner is also responsible for stringifying the values passed to the
queries and parsing values returned from the DB according to the field types
specs.

## Extends

- [`Runner`](Runner.md)\<`TInput`, `TOutput`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TInput` |
| `TOutput` |

## Constructors

### new PgRunner()

> **new PgRunner**\<`TTable`, `TInput`, `TOutput`\>(`schema`, `client`): [`PgRunner`](PgRunner.md)\<`TTable`, `TInput`, `TOutput`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `client` | [`PgClient`](PgClient.md) |

#### Returns

[`PgRunner`](PgRunner.md)\<`TTable`, `TInput`, `TOutput`\>

#### Overrides

[`Runner`](Runner.md).[`constructor`](Runner.md#constructors)

#### Defined in

[src/pg/PgRunner.ts:503](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L503)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `IS_WRITE` | `boolean` | If true, it's a write operation. |
| `op` | `string` | Operation name for logging purposes. |
| `maxBatchSize` | `number` | Maximum batch size for this type of operations. |
| `default` | `TOutput` | In case undefined is returned from batching, this value will be returned instead. |
| `name` | `string` | - |
| `constructor` | *typeof* [`PgRunner`](PgRunner.md) | The initial value of Object.prototype.constructor is the standard built-in Object constructor. |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> | - |

## Methods

### runSingle()

> `abstract` **runSingle**(`input`, `annotations`): `Promise`\<`undefined` \| `TOutput`\>

Method runSingle is to e.g. produce simple DB requests when we have only
one input to process, not many.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `TInput` |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`\<`undefined` \| `TOutput`\>

#### Inherited from

[`Runner`](Runner.md).[`runSingle`](Runner.md#runsingle)

#### Defined in

[src/abstract/Runner.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L30)

***

### runBatch()?

> `abstract` `optional` **runBatch**(`inputs`, `annotations`): `Promise`\<`Map`\<`string`, `TOutput`\>\>

Typically issues complex queries with magic.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `inputs` | `Map`\<`string`, `TInput`\> |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`\<`Map`\<`string`, `TOutput`\>\>

#### Inherited from

[`Runner`](Runner.md).[`runBatch`](Runner.md#runbatch)

#### Defined in

[src/abstract/Runner.ts:38](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L38)

***

### key()

> **key**(`_input`): `string`

Returns a batch-dedupping key for the input. By default, no dedupping is
performed (i.e. all inputs are processed individually and not collapsed
into one input; e.g. this is needed for inserts).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_input` | `TInput` |

#### Returns

`string`

#### Inherited from

[`Runner`](Runner.md).[`key`](Runner.md#key)

#### Defined in

[src/abstract/Runner.ts:76](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L76)

***

### clientQuery()

> `protected` **clientQuery**\<`TOutput`\>(`sql`, `annotations`, `batchFactor`, `hints`?): `Promise`\<`TOutput`[]\>

#### Type Parameters

| Type Parameter |
| ------ |
| `TOutput` *extends* `object` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `sql` | `string` |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| `batchFactor` | `number` |
| `hints`? | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<`TOutput`[]\>

#### Defined in

[src/pg/PgRunner.ts:65](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L65)

***

### fmt()

> `protected` **fmt**(`template`, `args`): `string`

Formats prefixes/suffixes of various compound SQL clauses. Don't use on
performance-critical path!

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `template` | `string` |
| `args` | `object` |
| `args.fields`? | [`FieldAliased`](../type-aliases/FieldAliased.md)\<`TTable`\>[] |
| `args.normalize`? | `boolean` |

#### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:104](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L104)

***

### escapeValue()

> `protected` **escapeValue**(`field`, `value`): `string`

Escapes a value at runtime using the codegen functions created above. We
use escapers table and the codegen for the following reasons:
1. We want to be sure that we know in advance, how to escape all table
   fields (and not fail at runtime).
2. We want to make createEscapeCode() the single source of truth about
   fields escaping, even at runtime.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | [`Field`](../type-aliases/Field.md)\<`TTable`\> |
| `value` | `unknown` |

#### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:170](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L170)

***

### escapeField()

> `protected` **escapeField**(`info`, `__namedParameters`): `string`

Escapes field name identifier.
- In case it's a composite primary key, returns its `ROW(f1,f2,...)`
  representation.
- A field may be aliased, e.g. if `{ field: "abc", alias: "$cas.abc" }` is
  passed, then the returned value will be `"$cas.abc"`. Basically, `field`
  name is used only to verify that such field is presented in the schema.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `info` | [`FieldAliased`](../type-aliases/FieldAliased.md)\<`TTable`\> |
| `__namedParameters` | `object` |
| `__namedParameters.withTable`? | `string` |
| `__namedParameters.normalize`? | `boolean` |

#### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:183](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L183)

***

### createWithBuilder()

> `protected` **createWithBuilder**(`__namedParameters`): `object`

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

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `object` |
| `__namedParameters.fields` | readonly [`FieldAliased`](../type-aliases/FieldAliased.md)\<`TTable`\>[] |
| `__namedParameters.suffix` | `string` |

#### Returns

`object`

##### prefix

> **prefix**: `string`

##### func()

> **func**: (`entries`) => `string`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entries` | `Iterable`\<[`string`, `object`], `any`, `any`\> |

###### Returns

`string`

##### suffix

> **suffix**: `string`

#### Defined in

[src/pg/PgRunner.ts:221](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L221)

***

### createValuesBuilder()

> `protected` **createValuesBuilder**\<`TInput`\>(`__namedParameters`): `object`

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

#### Type Parameters

| Type Parameter |
| ------ |
| `TInput` *extends* `object` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `object` |
| `__namedParameters.prefix` | `string` |
| `__namedParameters.indent` | `string` |
| `__namedParameters.fields` | readonly [`FieldAliased`](../type-aliases/FieldAliased.md)\<`TTable`\>[] |
| `__namedParameters.withKey`? | `boolean` |
| `__namedParameters.skipSorting`? | `boolean` |
| `__namedParameters.suffix` | `string` |

#### Returns

`object`

##### prefix

> **prefix**: `string`

##### func()

> **func**: (`entries`) => `string`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entries` | `Iterable`\<[`string`, `TInput`], `any`, `any`\> |

###### Returns

`string`

##### suffix

> **suffix**: `string`

#### Defined in

[src/pg/PgRunner.ts:289](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L289)

***

### createUpdateKVsBuilder()

> `protected` **createUpdateKVsBuilder**(`fields`): (`input`, `literal`?) => `string`

Returns a newly created JS function which, when called with an object,
returns the following SQL clause:

id='123', a='xyz', b='nnn' [, {literal}]

The set of columns is passed in specs, all other columns are ignored.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fields` | [`Field`](../type-aliases/Field.md)\<`TTable`\>[] |

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `object` |
| `literal`? | [`Literal`](../type-aliases/Literal.md) |

##### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:360](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L360)

***

### createOneOfBuilder()

> `protected` **createOneOfBuilder**(`field`, `fieldValCode`): (`values`) => `string`

Prefers to do utilize createAnyBuilder() if it can (i.e. build
a=ANY('{...}') clause). Otherwise, builds an IN(...) clause.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `field` | [`Field`](../type-aliases/Field.md)\<`TTable`\> | `undefined` |
| `fieldValCode` | `string` | `"$value"` |

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `values` | `Iterable`\<`unknown`, `any`, `any`\> |

##### Returns

`string`

#### Defined in

[src/pg/PgRunner.ts:388](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L388)

***

### createWhereBuildersFieldsEq()

> `protected` **createWhereBuildersFieldsEq**\<`TInput`\>(`args`): `object`

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

#### Type Parameters

| Type Parameter |
| ------ |
| `TInput` *extends* `object` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `object` |
| `args.prefix` | `string` |
| `args.fields` | readonly [`Field`](../type-aliases/Field.md)\<`TTable`\>[] |
| `args.suffix` | `string` |

#### Returns

`object`

##### plain

> **plain**: `object`

##### plain.prefix

> **prefix**: `string`

##### plain.func()

> **func**: (`inputs`) => `string`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `inputs` | `Iterable`\<[`string`, `TInput`], `any`, `any`\> |

###### Returns

`string`

##### plain.suffix

> **suffix**: `string`

##### optimized

> **optimized**: `object`

##### optimized.prefix

> **prefix**: `string`

##### optimized.func()

> **func**: (`inputs`) => `string`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `inputs` | `Iterable`\<[`string`, `TInput`], `any`, `any`\> |

###### Returns

`string`

##### optimized.suffix

> **suffix**: `string`

#### Defined in

[src/pg/PgRunner.ts:422](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L422)

***

### createWhereBuilder()

> `protected` **createWhereBuilder**(`__namedParameters`): `object`

Returns a newly created JS function which, when called with a Where object,
returns the generated SQL WHERE clause.

- The building is relatively expensive, since it traverses the Where object
  at run-time and doesn't know the shape beforehand.
- If the Where object is undefined, skips the entire WHERE clause.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `object` |
| `__namedParameters.prefix` | `string` |
| `__namedParameters.suffix` | `string` |

#### Returns

`object`

##### prefix

> **prefix**: `string`

##### func()

> **func**: (`where`) => `string`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `where` | [`Where`](../type-aliases/Where.md)\<`TTable`\> |

###### Returns

`string`

##### suffix

> **suffix**: `string`

#### Defined in

[src/pg/PgRunner.ts:457](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L457)

***

### addPK()

> `protected` **addPK**(`fields`, `mode`): `string`[]

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

| Parameter | Type |
| ------ | ------ |
| `fields` | readonly [`Field`](../type-aliases/Field.md)\<`TTable`\>[] |
| `mode` | `"prepend"` \| `"append"` |

#### Returns

`string`[]

#### Defined in

[src/pg/PgRunner.ts:492](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L492)

***

### delayForSingleQueryRetryOnError()

> **delayForSingleQueryRetryOnError**(`e`): `number` \| `"immediate_retry"` \| `"no_retry"`

If the single query's error needs to be retried (e.g. it's a deadlock
error), returns the number of milliseconds to wait before retrying.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `e` | `unknown` |

#### Returns

`number` \| `"immediate_retry"` \| `"no_retry"`

#### Overrides

[`Runner`](Runner.md).[`delayForSingleQueryRetryOnError`](Runner.md#delayforsinglequeryretryonerror)

#### Defined in

[src/pg/PgRunner.ts:525](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L525)

***

### shouldDebatchOnError()

> **shouldDebatchOnError**(`e`): `boolean`

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

| Parameter | Type |
| ------ | ------ |
| `e` | `unknown` |

#### Returns

`boolean`

#### Overrides

[`Runner`](Runner.md).[`shouldDebatchOnError`](Runner.md#shoulddebatchonerror)

#### Defined in

[src/pg/PgRunner.ts:538](https://github.com/clickup/ent-framework/blob/master/src/pg/PgRunner.ts#L538)
