import type { VC } from "../VC";
import type { VCFlavor } from "../VCFlavor";
import type { Predicate } from "./Predicate";

/**
 * Checks that the VC has some flavor.
 */
export class VCHasFlavor implements Predicate<never> {
  readonly name;

  constructor(private Flavor: new (...args: never[]) => VCFlavor) {
    this.name = this.constructor.name + ":" + this.Flavor.name;
  }

  async check(vc: VC): Promise<boolean> {
    return !!vc.flavor(this.Flavor);
  }
}
