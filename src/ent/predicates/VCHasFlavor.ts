import { VC } from "../VC";
import { VCFlavor } from "../VCFlavor";
import { Predicate } from "./Predicate";

/**
 * Checks if the VC has some flavor.
 */
export class VCHasFlavor implements Predicate<never> {
  readonly name = this.constructor.name + ":" + this.Flavor.name;

  constructor(private Flavor: new (...args: any[]) => VCFlavor) {}

  async check(vc: VC, _row: never): Promise<boolean> {
    return !!vc.flavor(this.Flavor);
  }
}
