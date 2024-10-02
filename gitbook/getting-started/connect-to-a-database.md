# Connect to a Database

To start simple, create a PostgreSQL database and several tables there. You can also use you existing database.

```sql
$ export PGUSER=postgres
$ export PGPASSWORD=postgres
$ createdb mytest

$ psql mytest
% CREATE TABLE topics(
    id bigserial PRIMARY KEY,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    slug varchar(64) NOT NULL UNIQUE,
    creator_id bigint NOT NULL,
    subject text DEFAULT NULL
  );
% CREATE TABLE comments(
    id bigserial PRIMARY KEY,
    topic_id bigint REFERENCES topics,
    creator_id bigint NOT NULL,
    message text NOT NULL
  );  
```

To access that database, create an instance of Cluster:

{% code title="core/ent.ts" fullWidth="false" %}
```typescript
import { Cluster } from "ent-framework";
import { PgClientPool } from "ent-framework/pg";
import type { PoolConfig } from "pg";

export const cluster = new Cluster({
  islands: () => [{
    no: 0,
    nodes: [{
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "postgres",
      database: "mytest",
      min: 5,
      max: 20,
    }]
  }],
  createClient: (node: PoolConfig) => new PgClientPool({ config: node }),
  loggers: {
    clientQueryLogger: (props) => console.debug(props),
    swallowedErrorLogger: (props) => console.log(props),
  },
});

// Pre-open min number of DB connections.
setTimeout(() => cluster.prewarm(), 100);
```
{% endcode %}

Terminology:

1. **Cluster** consists of **Islands**. Each Island has a number (there can be many islands for horizontal scaling of the cluster).
2. Island consists of master + replica **nodes** (in the above example, we only define one master node and no replicas).&#x20;
3. Island also hosts **Microshards** (in the example above, we will have no microshards, aka just one global shard). Microshards may travel from island to island during shards rebalancing process; the engine tracks this automatically ("shards discovery").

Notice that we define the layout of the cluster using a callback. Ent Framework will call it from time to time to refresh the view of the cluster, so in this callback, you can read the data from some centralized configuration database (new nodes may be added, or empty nodes may be removed with no downtime). This is called "dynamic real-time reconfiguration".

[PgClientPool](../../docs/classes/PgClientPool.md) class accepts several options, one of them is the standard [node-postgres PoolConfig](https://node-postgres.com/apis/pool) interface. For simplicity, when we define a cluster shape in `islands`, we can just return a list of such configs.
