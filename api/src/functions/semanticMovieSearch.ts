import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { getQueryEmbedding, queryCosmosDbVector } from '../utils.js'

async function semanticMovieSearch(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`)

  try {
    const payload = (await request.json()) as { searchTerm?: string }
    const searchTerm = payload?.searchTerm
    const queryEmbedding = await getQueryEmbedding(searchTerm)
    const dbQueryResponse = await queryCosmosDbVector(queryEmbedding)
    return { body: JSON.stringify({ results: dbQueryResponse }) }
  } catch (error) {
    context.log('Http function Error querying Cosmos DB:', error)
    return { status: 500, body: 'Internal server error' }
  }
}

app.http('semanticMovieSearch', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: semanticMovieSearch,
})
