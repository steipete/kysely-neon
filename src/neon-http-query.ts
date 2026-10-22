export type NeonHTTPClient = ((
  query: string,
  parameters: readonly unknown[],
) => Promise<unknown>) & {
  query?: (query: string, parameters: readonly unknown[]) => Promise<unknown>;
};

export function neonHTTPQuery(sql: NeonHTTPClient) {
  if (typeof sql.query === "function") {
    return sql.query.bind(sql);
  }
  return (query: string, parameters: readonly unknown[]) => sql(query, parameters);
}
