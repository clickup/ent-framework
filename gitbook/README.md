# Overview

[Ent Framework](https://github.com/clickup/ent-framework) is an open-source opinionated TypeScript data access library with the following major features:

1. **Graph-like representation of entities.** Each Ent is represented as a TypeScipt class with immutable properties. An Ent class instance maps to one row of some table in a relational database (like PostgreSQL). In this sense, it looks similar to ORM, but has several differences explained below.
2. **Row-level security in a graph (privacy layer).** The managed data forms a graph where node is an Ent instance, and edge is a field link (think of foreign keys) to other Ents. To be allowed to read (or update/delete) some Ent, you define a set of explicit rules like "user can read EntA if they can read EntB or EntC". And, consequently, in EntB you define its own set of rules, like "user can read EntB if they can read EntD".
3. **Query batching and coalescing.** Ent Framework holistically solves the "N+1 selects" problem commonly known in ORM world. You still write you code as if you work with individual Ents and individual IDs, and the framework magically takes care of sending batched requests (both read and write) to the underlying relational database.&#x20;
4. **Microsharding and replication lag tracking support out of the box.** You can split your database horizontally, and Ent Framework will take care of routing the requests to the proper shards. This includes batching/coalescing of the queries of course. Also, Ent Framework knows whether a replica is "good enough" for a query and automatically uses the replica when possible.
5. **Can be plugged to an exising relational database.** If your project already uses some ORM or runs raw SQL queries, Ent Framework can be plugged in.

There are other features supported, like cross-microshards foreign keys, triggers etc.

Source code is at [https://github.com/clickup/ent-framework](https://github.com/clickup/ent-framework).

<div align="left">

<figure><img src="https://github.com/clickup/ent-framework/actions/workflows/ci.yml/badge.svg?branch=main" alt="" width="188"><figcaption></figcaption></figure>

</div>

To install in your TypeScript project:

```
npm add @clickup/ent-framework
pnpm add @clickup/ent-framework
yarn add @clickup/ent-framework
```
