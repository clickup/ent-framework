import { WeakTicker } from "../helpers/WeakTicker";

/**
 * Holds an auto-expiring map of VC caches.
 */
export class VCCaches<TKey, TValue> extends Map<TKey, TValue> {
  constructor(private expirationMs: number) {
    super();
  }

  /**
   * Calls the Map's get() and defers cache clearing to the next WeakTicker
   * tick (i.e. schedules clearing on inactivity).
   */
  override get(key: TKey): TValue | undefined {
    if (this.expirationMs > 0) {
      weakTicker.schedule(this, this.expirationMs);
    }

    return super.get(key);
  }

  /**
   * Called periodically after VC#cache() was called at least once.
   */
  onTick(tickNoSinceScheduling: number): "keep" | "unschedule" {
    if (tickNoSinceScheduling === 0) {
      // Skip the very 1st tick after the most recent scheduling. Starting from
      // the 2nd tick, we can be sure that query cache hasn't been accessed
      // within at least expirationMs.
      return "keep";
    }

    this.clear();
    return "unschedule";
  }
}

// Clears VC caches after some time of inactivity.
const weakTicker = new WeakTicker();
