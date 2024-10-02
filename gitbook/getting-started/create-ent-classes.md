# Create Ent Classes

Once you have a Cluster instance, you can create EntTopic and EntComment.

{% code title="ents/EntTopic.ts" %}
```typescript
import { cluster } from "../core/ent";
import { PgSchema } from "ent-framework/pg";
import { ID, BaseEnt, GLOBAL_SHARD, AllowIf, OutgoingEdgePointsToVC } from "ent-framework";

const schema = new PgSchema(
  "topics",
  {
    id: { type: ID, autoInsert: "nextval('topic_id_seq')" },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
    slug: { type: String },
    creator_id: { type: ID },
    subject: { type: String, allowNull: true },
  },
  ["slug"],
);

export class EntTopic extends BaseEnt(cluster, schema) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyInferPrincipal: async (_vc, row) => row.creator_id,
      privacyLoad: [
        new AllowIf(new OutgoingEdgePointsToVC("creator_id")),
      ],
  }
}
```
{% endcode %}

By default, all fields are non-nullable (unless you provide allowNull option).

Each Ent may also have one optional "unique key" (possible composite) which is treated by the engine in a specific optimized way.
