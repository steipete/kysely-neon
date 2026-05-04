import { DatabaseIntrospector, Dialect, Driver, Kysely, PostgresAdapter, QueryCompiler } from "kysely";
import { ClientConfig, NeonConfig } from "@neondatabase/serverless";
type NeonDialectConfig = ClientConfig & Partial<NeonConfig>;
export declare class NeonDialect implements Dialect {
    #private;
    constructor(config: NeonDialectConfig);
    createAdapter(): PostgresAdapter;
    createDriver(): Driver;
    createQueryCompiler(): QueryCompiler;
    createIntrospector(db: Kysely<any>): DatabaseIntrospector;
}
export {};
