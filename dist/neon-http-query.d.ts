export type NeonHTTPClient = ((query: string, parameters: readonly unknown[]) => Promise<unknown>) & {
    query?: (query: string, parameters: readonly unknown[]) => Promise<unknown>;
};
export declare function neonHTTPQuery(sql: NeonHTTPClient): (query: string, parameters: readonly unknown[]) => Promise<unknown>;
