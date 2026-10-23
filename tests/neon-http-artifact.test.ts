import test from "ava";
import { CompiledQuery, Kysely } from "kysely";
import { NeonHTTPDialect } from "../dist/index.mjs";

test.serial(
  "built HTTP dialect sends parameterized SQL through the installed Neon client",
  async (t) => {
    const previousFetch = globalThis.fetch;
    const requests: unknown[] = [];
    globalThis.fetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
      requests.push(JSON.parse(init?.body as string));
      return new Response(
        JSON.stringify({
          command: "SELECT",
          rowCount: 1,
          fields: [{ name: "answer", dataTypeID: 23 }],
          rows: [["42"]],
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    };
    const db = new Kysely<{}>({
      dialect: new NeonHTTPDialect({
        connectionString: "postgresql://test:test@ep-synthetic.us-east-1.aws.neon.tech/db",
      }),
    });
    try {
      const result = await db.executeQuery<{ answer: number }>(
        CompiledQuery.raw("select $1::int as answer", [42]),
      );
      t.deepEqual(result.rows, [{ answer: 42 }]);
      t.deepEqual(requests, [{ query: "select $1::int as answer", params: ["42"] }]);
    } finally {
      await db.destroy();
      globalThis.fetch = previousFetch;
    }
  },
);
