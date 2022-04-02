import delay from "delay";
import range from "lodash/range";
import { Pool } from "pg";
import { master } from "../__tests__/helpers/TestSQLClient";

const MAX_TIME_MS = 20000;

const TBL = "batched_bench";

const COMMON_HEADER = "SET search_path TO public";

const TEMPLATE_BATCHED = [
  `WITH rows(name, url_name, some_flag, json_text_field, json_strongly_typed_field, jsonb_field, encrypted_field, created_at, updated_at, parent_id, id, _key) AS (VALUES\n` +
    `((NULL::${TBL}).name, (NULL::${TBL}).url_name, (NULL::${TBL}).some_flag, (NULL::${TBL}).json_text_field, (NULL::${TBL}).json_strongly_typed_field, (NULL::${TBL}).jsonb_field, (NULL::${TBL}).encrypted_field, (NULL::${TBL}).created_at, (NULL::${TBL}).updated_at, (NULL::${TBL}).parent_id, (NULL::${TBL}).id, ''),`,
  ` ('abc%s', 'aaa', true, '{"a":10,"b":{"c":20},"m":"%m"}', '{"a":42}', '{"a":"%m","b%m":"10"}', 'encrypted:ufyu', now(), now(), NULL, nextval('${TBL}_id_seq'), %k)`,
  `)\n` +
    `INSERT INTO ${TBL} (name, url_name, some_flag, json_text_field, json_strongly_typed_field, jsonb_field, encrypted_field, created_at, updated_at, parent_id, id)\n` +
    `SELECT name, url_name, some_flag, json_text_field, json_strongly_typed_field, jsonb_field, encrypted_field, created_at, updated_at, parent_id, id FROM rows OFFSET 1\n` +
    `ON CONFLICT DO NOTHING RETURNING (SELECT _key FROM rows WHERE rows.id=${TBL}.id), id`,
];

const TEMPLATE_MULTI =
  `INSERT INTO ${TBL} (name, url_name, some_flag, json_text_field, json_strongly_typed_field, jsonb_field, encrypted_field, created_at, updated_at, parent_id, id) VALUES\n` +
  `('abc%s', 'aaa', true, '{"a":10,"b":{"c":20},"m":"%m"}', '{"a":42}', '{"a":"%m","b%m":"10"}', 'encrypted:ufyu', now(), now(), NULL, nextval('${TBL}_id_seq')) ON CONFLICT DO NOTHING RETURNING id`;

let seq = 0;
let seqKey = 0;

export default async function* () {
  const pool = new Pool({
    ...master.dest.config,
    min: 1,
    max: 1,
    idleTimeoutMillis: 30000,
  });

  yield {
    name: "beforeEach",
    func: async () => {
      seq = 0;
      await pool.query(`
        ${COMMON_HEADER};
        DROP TABLE IF EXISTS ${TBL};
        CREATE TABLE ${TBL}(
          id bigserial NOT NULL PRIMARY KEY,
          name text NOT NULL,
          url_name text,
          some_flag boolean,
          json_text_field text,
          json_strongly_typed_field text,
          jsonb_field jsonb,
          encrypted_field text,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          parent_id bigint,
          UNIQUE (name)
        );
        CREATE INDEX ${TBL}_json_text_field ON ${TBL}(json_text_field);
        CREATE INDEX ${TBL}_jsonb_field ON ${TBL} USING gin (jsonb_field);
      `);
      await pool.query(`CHECKPOINT`);
      await delay(2000);
    },
  };

  for (const batchSize of [2, 10, 20, 50, 100, 200, 400]) {
    const RANGE = range(0, batchSize);

    for (let i = 0; i < 1; i++) {
      yield {
        name: `each request = 1 batched query (${batchSize} rows each)`,
        maxTimeMs: MAX_TIME_MS,
        func: async () => {
          const query =
            `${COMMON_HEADER};\n` +
            `${TEMPLATE_BATCHED[0]}\n` +
            RANGE.map(() => replace(TEMPLATE_BATCHED[1])).join(",\n") +
            `\n${TEMPLATE_BATCHED[2]}`;
          await pool.query(query);
        },
      };
    }

    for (let i = 0; i < 1; i++) {
      yield {
        name: `each request = ${batchSize} queries ("multi-query")`,
        maxTimeMs: MAX_TIME_MS,
        func: async () => {
          const query =
            `${COMMON_HEADER};\n` +
            RANGE.map(() => replace(TEMPLATE_MULTI)).join(";\n");
          await pool.query(query);
        },
      };
    }
  }
}

function replace(template: string) {
  return template
    .replace(/%s/g, `${seq++}`)
    .replace(/%m/g, `${seq++ % 10}`)
    .replace(/%k/g, `'${seqKey++}'`);
}
