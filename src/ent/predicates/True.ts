import type { VC } from "../VC";
import type { Predicate } from "./Predicate";

/**
 * Always passes; used for e.g. globally accessed objects.
 */
export class True implements Predicate<never> {
  readonly name = this.constructor.name;

  async check(_vc: VC): Promise<boolean> {
    return true;
  }
}
