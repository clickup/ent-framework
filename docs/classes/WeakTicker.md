[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / WeakTicker

# Class: WeakTicker

A perf efficient approximate scheduler which doesn't retain the scheduled
objects in memory, so they remain subject for GC.

## Constructors

### constructor

• **new WeakTicker**()

## Methods

### schedule

▸ **schedule**(`target`, `tickMs`): `void`

Schedules a call to target.onTick() to be called periodically, every tickMs
approximately.
- The target scheduled will NOT be retained from GC. This is the main
  difference with setInterval() and the reason why we accept an object, not
  a closure.
- The 1st call to target.onTick() will happen between 0 and tickMs from
  now: this is the second difference from setInterval(). Then, next calls
  will follow. The current tick number is passed to onTick().
- If the same target is scheduled again, its tick number will be reset to
  0, as if it's scheduled the very 1st time. The 2nd scheduling is cheap
  (just 2 map lookups), so an object can be rescheduled-over as many times
  as needed.
- If target.onTick() returns "unschedule", the target will be unscheduled.

#### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`WeakTickerTarget`](../interfaces/WeakTickerTarget.md) |
| `tickMs` | `number` |

#### Returns

`void`

#### Defined in

[src/helpers/WeakTicker.ts:34](https://github.com/clickup/ent-framework/blob/master/src/helpers/WeakTicker.ts#L34)

___

### isEmpty

▸ **isEmpty**(): `boolean`

Returns true if there are no targets scheduled at the moment.

#### Returns

`boolean`

#### Defined in

[src/helpers/WeakTicker.ts:58](https://github.com/clickup/ent-framework/blob/master/src/helpers/WeakTicker.ts#L58)
