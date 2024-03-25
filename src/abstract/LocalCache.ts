import fs from "fs";
import { dirname } from "path";
import { threadId } from "worker_threads";
import defaults from "lodash/defaults";
import type { Loggers } from "../abstract/Loggers";
import { jitter, type MaybeError, type PickPartial } from "../internal/misc";

export interface LocalCacheOptions {
  /** Directory to store the cache in (auto-created). */
  dir: string;
  /** Loggers for e.g. swallowed errors. */
  loggers: Pick<Loggers, "swallowedErrorLogger">;
  /** Max time (approximately) for an unread key to exist. */
  expirationMs?: number;
  /** Extension of cache files (without dot). */
  ext?: string;
  /** Jitter for cleanup runs. */
  cleanupJitter?: number;
  /** How much time to wait till the very 1st cleanup run. The idea is that Node
   * process may be short-lived, so the next cleanup run configured via
   * cleanupRoundsPerExpiration may never happen, and we also need to cleanup in
   * the very beginning of the object lifetime. */
  cleanupFirstRunDelayMs?: number;
  /** How many times per expirationMs interval should we run the cleanup. */
  cleanupRoundsPerExpiration?: number;
  /** How often to update mtime on read operations. E.g. if this value is 10,
   * then mtime will be updated not more than ~10 times within the expiration
   * period (optimizing filesystem writes). */
  mtimeUpdatesOnReadPerExpiration?: number;
}

/**
 * A simple key-value cache stored on the local machine.
 *
 * - The expectation is that there will be not too many keys stored, since the
 *   background cleanup process running time to time is O(numKeysStored).
 * - Guarantees corruption-free writes to the keys from multiple processes
 *   running concurrently.
 * - The values which are not requested longer than approximately `expirationMs`
 *   are auto-removed.
 * - Each key is stored in an individual file under `dir`. Some temporary files
 *   may also appear in that directory, but eventually, they will be cleaned up,
 *   even if they get stuck for some time.
 */
export class LocalCache<TValue extends {} = never> {
  /** Default values for the constructor options. */
  static readonly DEFAULT_OPTIONS: Required<PickPartial<LocalCacheOptions>> = {
    expirationMs: 1000 * 3600 * 24,
    ext: "json",
    cleanupJitter: 0.2,
    cleanupFirstRunDelayMs: 30000,
    cleanupRoundsPerExpiration: 2,
    mtimeUpdatesOnReadPerExpiration: 10,
  };

  private cleanupTimeout?: NodeJS.Timeout;

  /** LocalCache configuration options. */
  readonly options: Required<LocalCacheOptions>;

  /**
   * Initializes the instance.
   */
  constructor(options: LocalCacheOptions) {
    this.options = defaults({}, options, LocalCache.DEFAULT_OPTIONS);
    this.cleanupTimeout = setTimeout(
      () => this.onCleanupTimer(),
      this.options.cleanupFirstRunDelayMs * jitter(this.options.cleanupJitter),
    );
  }

  /**
   * Ends the instance lifecycle (e.g. garbage recheck interval).
   */
  end(): void {
    clearTimeout(this.cleanupTimeout);
    this.cleanupTimeout = undefined;
  }

  /**
   * Returns the value for the given key, or null if the key does not exist.
   */
  async get(key: string): Promise<TValue | null> {
    const path = this.buildPath(key);

    try {
      if (!fs.existsSync(path)) {
        return null;
      }

      const data = await fs.promises.readFile(path, { encoding: "utf-8" });
      return JSON.parse(data);
    } catch (e: unknown) {
      rethrowExceptFileNotExistsError(e);
      return null;
    }
  }

  /**
   * Sets the value for the given key.
   */
  async set(key: string, value: TValue): Promise<void> {
    const path = this.buildPath(key);

    const data = JSON.stringify(value, undefined, 2);
    try {
      const stat = await fs.promises.stat(path);
      const oldData = await fs.promises.readFile(path, { encoding: "utf-8" });
      if (oldData === data) {
        // Don't write if the data in the file is the same, just update mtime,
        // but not too frequently too.
        const now = Date.now();
        if (
          stat.mtimeMs <
          now -
            this.options.expirationMs /
              this.options.mtimeUpdatesOnReadPerExpiration
        ) {
          await fs.promises.utimes(path, now, now);
        }

        return;
      }
    } catch (e: unknown) {
      rethrowExceptFileNotExistsError(e);
    }

    await fs.promises.mkdir(dirname(path), { recursive: true });
    const tmpPath = this.buildPath(`${key}.${process.pid}-${threadId}.tmp`);
    await fs.promises.writeFile(tmpPath, data);
    await fs.promises.rename(tmpPath, path);
  }

  /**
   * Deletes the values for keys which were not accessed for a long time.
   */
  private async cleanup(): Promise<void> {
    await fs.promises.mkdir(this.options.dir, { recursive: true });
    const files = await fs.promises.readdir(this.options.dir);

    const now = Date.now();
    const dotExt = `.${this.options.ext}`;
    for (const file of files) {
      if (file.endsWith(dotExt)) {
        const path = `${this.options.dir}/${file}`;
        const stats = await fs.promises.stat(path);
        if (now - stats.mtimeMs > this.options.expirationMs) {
          try {
            await fs.promises.unlink(path);
          } catch (e: unknown) {
            rethrowExceptFileNotExistsError(e);
          }
        }
      }
    }
  }

  /**
   * Runs then the instance creates (with initial small jitter) and also
   * periodically.
   */
  private onCleanupTimer(): void {
    this.cleanup().catch((error) =>
      this.options.loggers.swallowedErrorLogger?.({
        where: `${this.constructor.name}.cleanup`,
        error,
        elapsed: null,
        importance: "normal",
      }),
    );
    this.cleanupTimeout = setTimeout(
      () => this.onCleanupTimer(),
      (this.options.expirationMs / this.options.cleanupRoundsPerExpiration) *
        jitter(this.options.cleanupJitter),
    );
  }

  /**
   * Builds the full path to a file for a given key.
   */
  private buildPath(key: string): string {
    const filename = key.replace(/[^a-z0-9.]+/gi, "-");
    return `${this.options.dir}/${filename}.${this.options.ext}`;
  }
}

/**
 * Throws the passed exception if it's a "file not found" error from Node fs
 * module. Otherwise, does nothing.
 */
function rethrowExceptFileNotExistsError(e: unknown): void {
  if ((e as MaybeError)?.code !== "ENOENT") {
    throw e;
  }
}
