# Create Ent Classes

Once you have a Cluster instance, you can create EntTopic and EntComment.

{% code title="ents/EntTopic.ts" %}
```typescript
import { PgSchema } from "ent-framework/pg";
import { ID, BaseEnt, GLOBAL_SHARD, AllowIf, OutgoingEdgePointsToVC } from "ent-framework";
import { cluster } from "../core/ent";

const schema = new PgSchema(
  "topics",
  {
    id: { type: ID, autoInsert: "nextval('topics_id_seq')" },
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

Each Ent may also have one optional "unique key" (possible composite) which is treated by the engine in a specific optimized way. In our case, it's "slug".

Disregard privacy rules for now, it's a more complicated topic which will be covered later. For now, the code should be obvious enough (except maybe "VC" which stands for "Viewer Context", or an "acting principal" - some user who runs an Ent Framework query).

Now, creating EntComment.

{% code title="ents/EntComment.ts" %}
```typescript
import { PgSchema } from "ent-framework/pg";
import { ID, BaseEnt, GLOBAL_SHARD, AllowIf, OutgoingEdgePointsToVC } from "ent-framework";
import { cluster } from "../core/ent";
import { EntTopic } from "./EntTopic";

const schema = new PgSchema(
  "comments",
  {
    id: { type: ID, autoInsert: "nextval('comments_id_seq')" },
    topic_id: { type: ID },
    creator_id: { type: ID },
    message: { type: String },
  },
);

export class EntComment extends BaseEnt(cluster, schema) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: ["topic_id"],
      privacyInferPrincipal: async (_vc, row) => row.creator_id,
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("topic_id", EntTopic)),
        new AllowIf(new OutgoingEdgePointsToVC("creator_id")),
      ],
  }
}
```
{% endcode %}

Since we have no microshards yet, shardAffinity basically does nothing. But if we had some, then it would tell Ent Framework, to which microshard should it save EntComment rows (in the example above, it will save them to the same microshard as the owner's EntTopic).
