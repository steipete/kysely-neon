import test from "ava";
import { neonHTTPQuery } from "../src/neon-http-query.ts";

test("uses sql.query when that method exists", async (t) => {
  const calls: string[] = [];
  const sql = Object.assign(
    (_query: string, _parameters: readonly unknown[]) => {
      calls.push("call");
      return Promise.resolve({ rows: [] });
    },
    {
      query(query: string, parameters: readonly unknown[]) {
        calls.push(`query:${query}:${parameters.join(",")}`);
        return Promise.resolve({ rows: [{ ok: true }] });
      },
    },
  );

  const run = neonHTTPQuery(sql);
  const result = await run("select 1", [1]);

  t.deepEqual(calls, ["query:select 1:1"]);
  t.deepEqual(result, { rows: [{ ok: true }] });
});

test("calls the function when sql.query is missing", async (t) => {
  const calls: string[] = [];
  const sql = (query: string, parameters: readonly unknown[]) => {
    calls.push(`${query}:${parameters.join(",")}`);
    return Promise.resolve({ rows: [{ ok: true }] });
  };

  const run = neonHTTPQuery(sql);
  const result = await run("select 1", [2]);

  t.deepEqual(calls, ["select 1:2"]);
  t.deepEqual(result, { rows: [{ ok: true }] });
});
