[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / VCTrace

# Class: VCTrace

A "trace" objects which allows to group database related stuff while logging
it. Traces are inherited during VC derivation, similar to flavors, but
they're a part of VC core interface to allow faster access.

## Constructors

### new VCTrace()

> **new VCTrace**(`trace`?): [`VCTrace`](VCTrace.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `trace`? | `string` |

#### Returns

[`VCTrace`](VCTrace.md)

#### Defined in

[src/ent/VCTrace.ts:17](https://github.com/clickup/ent-framework/blob/master/src/ent/VCTrace.ts#L17)

## Properties

| Property | Type |
| ------ | ------ |
| `trace` | `string` |

## Methods

### tryExtractCreationDate()

> **tryExtractCreationDate**(): `null` \| `Date`

In case the trace was created by this tool, tries to extract the date of
its creation. As a sanity check, verifies that this date is not too far
away from the present time.

#### Returns

`null` \| `Date`

#### Defined in

[src/ent/VCTrace.ts:26](https://github.com/clickup/ent-framework/blob/master/src/ent/VCTrace.ts#L26)
