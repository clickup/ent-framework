export class DefaultMap<K, V> extends Map<K, V> {
  getOrAdd(k: K, DefConstructor: new () => V): V {
    if (!this.has(k)) {
      const def = new DefConstructor();
      this.set(k, def);
      return def;
    }

    return this.get(k)!;
  }
}
