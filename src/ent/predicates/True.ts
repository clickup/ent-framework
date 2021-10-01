import { VC } from "../VC";
import { Predicate } from "./Predicate";

/**
 * Always passes; used for e.g. globally accessed objects.
 */
export class True implements Predicate<never> {
  readonly name = this.constructor.name;

  async check(_vc: VC, _row: object): Promise<boolean> {
    return true;
  }
}
