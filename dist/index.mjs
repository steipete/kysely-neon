// src/neon-dialect.ts
import {
  CompiledQuery,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler
} from "kysely";
import {
  Pool,
  neonConfig
} from "@neondatabase/serverless";

// src/neon-connection.ts
var PRIVATE_RELEASE_METHOD = Symbol("release");
var NeonConnection = class {
  #client;
  constructor(client) {
    this.#client = client;
  }
  async executeQuery(compiledQuery) {
    const result = await this.#client.query(compiledQuery.sql, [
      ...compiledQuery.parameters
    ]);
    if (result.command === "INSERT" || result.command === "UPDATE" || result.command === "DELETE") {
      const numAffectedRows = BigInt(result.rowCount);
      return {
        numAffectedRows,
        rows: result.rows ?? []
      };
    }
    return {
      rows: result.rows ?? []
    };
  }
  async *streamQuery(_compiledQuery, _chunkSize) {
    throw new Error("Neon Driver does not support streaming");
  }
  [PRIVATE_RELEASE_METHOD]() {
    this.#client.release?.();
  }
};

// src/neon-dialect.ts
var NeonDialect = class {
  #config;
  constructor(config) {
    this.#config = config;
  }
  createAdapter() {
    return new PostgresAdapter();
  }
  createDriver() {
    return new NeonDriver(this.#config);
  }
  createQueryCompiler() {
    return new PostgresQueryCompiler();
  }
  createIntrospector(db) {
    return new PostgresIntrospector(db);
  }
};
var NeonDriver = class {
  #config;
  #connections = /* @__PURE__ */ new WeakMap();
  #pool;
  constructor(config) {
    this.#config = config;
  }
  async init() {
    Object.assign(neonConfig, this.#config);
    this.#pool = new Pool(this.#config);
  }
  async acquireConnection() {
    const client = await this.#pool.connect();
    let connection = this.#connections.get(client);
    if (!connection) {
      connection = new NeonConnection(client);
      this.#connections.set(client, connection);
    }
    return connection;
  }
  async beginTransaction(conn, settings) {
    if (settings.isolationLevel) {
      await conn.executeQuery(
        CompiledQuery.raw(
          `start transaction isolation level ${settings.isolationLevel}`
        )
      );
    } else {
      await conn.executeQuery(CompiledQuery.raw("begin"));
    }
  }
  async commitTransaction(conn) {
    await conn.executeQuery(CompiledQuery.raw("commit"));
  }
  async rollbackTransaction(conn) {
    await conn.executeQuery(CompiledQuery.raw("rollback"));
  }
  async releaseConnection(connection) {
    connection[PRIVATE_RELEASE_METHOD]();
  }
  async destroy() {
    if (this.#pool) {
      const pool = this.#pool;
      this.#pool = void 0;
      await pool.end();
    }
  }
};

// src/neon-http-dialect.ts
import {
  PostgresAdapter as PostgresAdapter2,
  PostgresIntrospector as PostgresIntrospector2,
  PostgresQueryCompiler as PostgresQueryCompiler2
} from "kysely";
import { neon } from "@neondatabase/serverless";
var NeonHTTPDialect = class {
  #config;
  constructor(config) {
    this.#config = config;
  }
  createAdapter() {
    return new PostgresAdapter2();
  }
  createDriver() {
    return new NeonHTTPDriver(this.#config);
  }
  createQueryCompiler() {
    return new PostgresQueryCompiler2();
  }
  createIntrospector(db) {
    return new PostgresIntrospector2(db);
  }
};
var NeonHTTPDriver = class {
  #config;
  #connection;
  constructor(config) {
    this.#config = config;
    this.#connection = new NeonConnection({
      query: neon(this.#config.connectionString, { fullResults: true })
    });
  }
  async init() {
  }
  async acquireConnection() {
    return this.#connection;
  }
  async beginTransaction(_, __) {
    throw new Error("Transactions are not supported with Neon HTTP connections");
  }
  async commitTransaction(_) {
    throw new Error("Transactions are not supported with Neon HTTP connections");
  }
  async rollbackTransaction(_) {
    throw new Error("Transactions are not supported with Neon HTTP connections");
  }
  async releaseConnection(_) {
  }
  async destroy() {
  }
};
export {
  NeonDialect,
  NeonHTTPDialect
};
