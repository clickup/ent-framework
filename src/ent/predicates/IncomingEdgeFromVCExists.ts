import { localUniqueInt, nullthrows } from "../../helpers";
import { ID, Row, RowWithID, Table, Where } from "../../types";
import { EntClass } from "../types";
import { VC } from "../VC";
import { IDsCacheCanReadIncomingEdge, Predicate } from "./Predicate";

/**
 * An ent may represent not necessarily a node in the graph, but also an edge
 * between two nodes. Consider EntMember in the below example:
 *
 * vc.principal <--- EntMember[user_id, company_id] ---> EntCompany
 *
 * This predicate verifies that for a e.g. given EntCompany row and a given VC,
 * an EntMember row exists (and optionally matches some criterion) in the
 * database.
 *
 * - entEdgeVCField = user_id in the above example
 * - entEdgeFKField = company_id in the above example
 * - if an EntMember object exists, it must also match entEdgeFilter()
 */
export class IncomingEdgeFromVCExists<TEdgeTable extends Table>
  implements Predicate<RowWithID>
{
  private readonly instanceID = localUniqueInt();
  readonly name =
    this.constructor.name +
    "(" +
    this.EntEdge.name +
    "[" +
    this.entEdgeVCField +
    "=vc, " +
    this.entEdgeFKField +
    "=row.id]" +
    ")";

  constructor(
    public readonly EntEdge: EntClass<TEdgeTable>,
    public readonly entEdgeVCField: keyof Row<TEdgeTable>,
    public readonly entEdgeFKField: keyof Row<TEdgeTable>,
    public readonly entEdgeFilter?: (ent: Row<TEdgeTable>) => boolean
  ) {}

  async check(vc: VC, row: RowWithID): Promise<boolean> {
    const cache = vc.cache(IDsCacheCanReadIncomingEdge);
    const cacheKey = nullthrows(row[ID]) + ":" + this.instanceID;
    if (cache.has(cacheKey)) {
      return true;
    }

    const where = {
      [this.entEdgeFKField]: row[ID],
      [this.entEdgeVCField]: vc.principal,
    } as Where<TEdgeTable>;

    let allow: boolean;
    if (this.entEdgeFilter) {
      // We use an omni VC here to avoid cyclic references where the edge ent
      // delegates permission checks to the row ent, and row ent loads the edge
      // ent to run the edgeEntFilter function. It's safe, because:
      // 1. Omni VC is always demoted to the current user's VC (which is vc
      //    since we filter by vc.principal above) or to a guest VC if it cannot
      //    find a user_id field in the edge ent (which also never happens).
      // 2. The edgeEntFilter function is synchronous, so it can't physically
      //    access the database anyway.
      const ents = await this.EntEdge.select(vc.toOmniDangerous(), where, 1);
      const filtered = ents.filter((ent) => this.entEdgeFilter!(ent as any));
      allow = filtered.length > 0;
    } else {
      // Count is not privacy-checked (it doesn't fetch any row to be checked).
      const entEdgeCount = await this.EntEdge.count(vc, where);
      allow = !!entEdgeCount;
    }

    if (allow) {
      cache.add(cacheKey);
      return true;
    }

    return false;
  }
}
