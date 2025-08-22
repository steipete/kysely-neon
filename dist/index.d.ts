import { Dialect, PostgresAdapter, Driver, QueryCompiler, Kysely, DatabaseIntrospector } from 'kysely';
import { ClientConfig, NeonConfig } from '@neondatabase/serverless';

type NeonDialectConfig = ClientConfig & Partial<NeonConfig>;
declare class NeonDialect implements Dialect {
    #private;
    constructor(config: NeonDialectConfig);
    createAdapter(): PostgresAdapter;
    createDriver(): Driver;
    createQueryCompiler(): QueryCompiler;
    createIntrospector(db: Kysely<any>): DatabaseIntrospector;
}

interface NeonHTTPDialectConfig {
    connectionString: string;
}
declare class NeonHTTPDialect implements Dialect {
    #private;
    constructor(config: NeonHTTPDialectConfig);
    createAdapter(): PostgresAdapter;
    createDriver(): Driver;
    createQueryCompiler(): QueryCompiler;
    createIntrospector(db: Kysely<any>): DatabaseIntrospector;
}

export { NeonDialect, NeonHTTPDialect };
