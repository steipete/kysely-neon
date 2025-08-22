"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  NeonDialect: () => NeonDialect,
  NeonHTTPDialect: () => NeonHTTPDialect
});
module.exports = __toCommonJS(src_exports);

// src/neon-dialect.ts
var import_kysely = require("kysely");
var import_serverless = require("@neondatabase/serverless");

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
    return new import_kysely.PostgresAdapter();
  }
  createDriver() {
    return new NeonDriver(this.#config);
  }
  createQueryCompiler() {
    return new import_kysely.PostgresQueryCompiler();
  }
  createIntrospector(db) {
    return new import_kysely.PostgresIntrospector(db);
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
    Object.assign(import_serverless.neonConfig, this.#config);
    this.#pool = new import_serverless.Pool(this.#config);
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
        import_kysely.CompiledQuery.raw(
          `start transaction isolation level ${settings.isolationLevel}`
        )
      );
    } else {
      await conn.executeQuery(import_kysely.CompiledQuery.raw("begin"));
    }
  }
  async commitTransaction(conn) {
    await conn.executeQuery(import_kysely.CompiledQuery.raw("commit"));
  }
  async rollbackTransaction(conn) {
    await conn.executeQuery(import_kysely.CompiledQuery.raw("rollback"));
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
var import_kysely2 = require("kysely");
var import_serverless2 = require("@neondatabase/serverless");
var NeonHTTPDialect = class {
  #config;
  constructor(config) {
    this.#config = config;
  }
  createAdapter() {
    return new import_kysely2.PostgresAdapter();
  }
  createDriver() {
    return new NeonHTTPDriver(this.#config);
  }
  createQueryCompiler() {
    return new import_kysely2.PostgresQueryCompiler();
  }
  createIntrospector(db) {
    return new import_kysely2.PostgresIntrospector(db);
  }
};
var NeonHTTPDriver = class {
  #config;
  #connection;
  constructor(config) {
    this.#config = config;
    this.#connection = new NeonConnection({
      query: (0, import_serverless2.neon)(this.#config.connectionString, { fullResults: true })
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NeonDialect,
  NeonHTTPDialect
});
