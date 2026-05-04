import { DatabaseIntrospector, Dialect, Driver, Kysely, PostgresAdapter, QueryCompiler } from "kysely";
interface NeonHTTPDialectConfig {
    connectionString: string;
}
export declare class NeonHTTPDialect implements Dialect {
    #private;
    constructor(config: NeonHTTPDialectConfig);
    createAdapter(): PostgresAdapter;
    createDriver(): Driver;
    createQueryCompiler(): QueryCompiler;
    createIntrospector(db: Kysely<any>): DatabaseIntrospector;
}
export {};
