import { CompiledQuery, DatabaseConnection, QueryResult } from "kysely";
export interface Client {
    query: (sql: string, parameters: any[]) => Promise<any>;
    release?: () => void;
}
export declare const PRIVATE_RELEASE_METHOD: unique symbol;
export declare class NeonConnection implements DatabaseConnection {
    #private;
    constructor(client: Client);
    executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>>;
    streamQuery<O>(_compiledQuery: CompiledQuery, _chunkSize: number): AsyncIterableIterator<QueryResult<O>>;
    [PRIVATE_RELEASE_METHOD](): void;
}
