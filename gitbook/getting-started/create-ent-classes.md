# Create Ent Classes

Once you have a Cluster instance, you can create Ent classes to access the data.

<pre class="language-typescript" data-title="ents/EntUser.ts"><code class="lang-typescript"><strong>import { PgSchema } from "ent-framework/pg";
</strong>import { ID, BaseEnt, GLOBAL_SHARD, AllowIf, OutgoingEdgePointsToVC } from "ent-framework";
import { cluster } from "../core/ent";

const schema = new PgSchema(
  "users",
  {
    id: { type: ID, autoInsert: "nextval('users_id_seq')" },
    email: { type: String },
  },
  ["email"],
);

export class EntUser extends BaseEnt(cluster, schema) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyInferPrincipal: async (_vc, row) => row.id,
      privacyLoad: [
        new AllowIf(new OutgoingEdgePointsToVC("id")),
      ],
  }
}
</code></pre>

Each Ent may also have one optional "unique key" (possible composite) which is treated by the engine in a specific optimized way. In the above example, it's `email`.

<pre class="language-typescript" data-title="ents/EntTopic.ts"><code class="lang-typescript"><strong>import { PgSchema } from "ent-framework/pg";
</strong>import { ID, BaseEnt, GLOBAL_SHARD, AllowIf, OutgoingEdgePointsToVC } from "ent-framework";
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
</code></pre>

By default, all fields are non-nullable (unless you provide `allowNull` option).

Disregard privacy rules for now, it's a more complicated topic which will be covered later. For now, the code should be obvious enough.

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

Since we have no microshards yet, `shardAffinity` basically does nothing. But if we had some, then it would tell Ent Framework, which microshard should it insert `EntComment` rows to when they are created (in the example above, it will save them to the same microshard as the owner's `EntTopic`).
