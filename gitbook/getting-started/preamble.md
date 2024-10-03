# Preamble

Below, we'll show some Ent Framework usage examples.

We will progress from the simplest code snippets to more and more advanced topics, like:

* custom ID schemas
* privacy rules
* triggers
* composite field types
* Viewer Context flavors
* master-replica and automatic replication lag tracking
* microsharding and migrations
* cross-shards foreign keys and inverse indexes
* etc.

The app's code structure will be something like:

* core/
  * ent.ts
  * vcMiddleware.ts
  * app.ts
* ents/
  * EntUser.ts
  * EntComment.ts
  * EntTopic.ts
* entry.ts
