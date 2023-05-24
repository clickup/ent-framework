interface Target {
  onTick(tickNo: number, tickMs: number): "keep" | "unschedule";
}

/**
 * A perf efficient approximate scheduler which doesn't retain the scheduled
 * objects in memory, so they remain subject for GC.
 */
export class WeakTicker {
  private slots = new Map<
    number,
    {
      refs: Set<WeakRef<Target>>;
      nextTickNos: WeakMap<Target, number>;
      interval: NodeJS.Timeout;
    }
  >();

  /**
   * Schedules a call to target.onTick() to be called periodically, every tickMs
   * approximately.
   * - The target scheduled will NOT be retained from GC. This is the main
   *   difference with setInterval() and the reason why we accept an object, not
   *   a closure.
   * - The 1st call to target.onTick() will happen between 0 and tickMs from
   *   now: this is the second difference from setInterval(). Then, next calls
   *   will follow. The current tick number is passed to onTick().
   * - If the same target is scheduled again, its tick number will be reset to
   *   0, as if it's scheduled the very 1st time. The 2nd scheduling is cheap
   *   (just 2 map lookups), so an object can be rescheduled-over as many times
   *   as needed.
   * - If target.onTick() returns "unschedule", the target will be unscheduled.
   */
  schedule(target: Target, tickMs: number): void {
    // We DO NOT use any closures here! Otherwise, target would be retained in
    // that closures, and it won't be garbage collected.
    let slot = this.slots.get(tickMs);
    if (!slot) {
      slot = {
        refs: new Set(),
        nextTickNos: new WeakMap(),
        interval: setInterval(this.onTick.bind(this, tickMs), tickMs).unref(),
      };
      this.slots.set(tickMs, slot);
    }

    if (!slot.nextTickNos.has(target)) {
      const ref = new WeakRef(target);
      slot.refs.add(ref);
    }

    slot.nextTickNos.set(target, 0);
  }

  /**
   * Returns true if there are no targets scheduled at the moment.
   */
  isEmpty(): boolean {
    return this.slots.size === 0;
  }

  /**
   * Called by internal setInterval().
   */
  private onTick(tickMs: number): void {
    const slot = this.slots.get(tickMs)!;
    for (const ref of slot.refs) {
      const target = ref.deref();
      if (target) {
        const nextTickNo = slot.nextTickNos.get(target)!;
        if (target.onTick(nextTickNo, tickMs) === "unschedule") {
          slot.refs.delete(ref);
          slot.nextTickNos.delete(target);
        }

        slot.nextTickNos.set(target, nextTickNo + 1);
      } else {
        slot.refs.delete(ref);
        // Target was garbage collected, which means it is already auto-removed
        // from slot.nextTickNos WeakMap too.
      }
    }

    if (slot.refs.size === 0) {
      clearInterval(slot.interval);
      this.slots.delete(tickMs);
    }
  }
}
