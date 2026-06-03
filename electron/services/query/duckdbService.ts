export interface QueryRequest {
  readonly sql: string
  readonly parameters?: unknown[]
  readonly limit?: number
}

export interface QueryResult {
  readonly columns: string[]
  readonly rows: Array<Record<string, unknown>>
  readonly rowCount: number
}

export class DuckDbService {
  async runQuery(request: QueryRequest): Promise<QueryResult> {
    const sql = request.sql.trim()

    if (!sql) {
      throw new Error('Query SQL is required')
    }

    return {
      columns: [],
      rows: [],
      rowCount: 0,
    }
  }
}

export const duckDbService = new DuckDbService()
