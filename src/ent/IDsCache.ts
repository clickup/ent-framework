import QuickLRU from "quick-lru";

export abstract class IDsCache {
  private ids = new QuickLRU<string, boolean>({ maxSize: 2000 });

  has(id: string): boolean {
    return this.ids.has(id);
  }

  add(id: string, value: boolean = true): void {
    this.ids.set(id, value);
  }

  get(id: string): boolean | undefined {
    return this.ids.get(id);
  }
}
