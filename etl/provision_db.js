import dotenv from 'dotenv'
import { CosmosClient } from '@azure/cosmos'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(import.meta.dirname, '../.env') })

const endpoint = process.env.COSMOS_ENDPOINT
const key = process.env.COSMOS_KEY
const client = new CosmosClient({ endpoint, key })

async function createDatabaseAndContainer() {
  // Create database if it doesn't exist
  const { database } = await client.databases.createIfNotExists({
    id: 'EmbeddingsDB',
  })
  console.log('Database ready:', database.id)

  // Create container with vector indexing
  const containerDefinition = {
    id: 'Documents',
    partitionKey: { kind: 'Hash', paths: ['/id'] },
    indexingPolicy: {
      automatic: true,
      indexes: [
        {
          kind: 'Range',
          dataType: 'Number',
          precision: -1,
        },
        {
          kind: 'Vector',
          dataType: 'Number',
          path: '/embedding',
          dimensions: 384, // MiniLM embedding size
          metric: 'Cosine', // Cosine similarity
          indexType: 'Flat', // exact search (good for 16k vectors)
        },
      ],
    },
  }

  const { container } = await database.containers.createIfNotExists(
    containerDefinition
  )
  console.log('Container ready with vector indexing:', container.id)
}

createDatabaseAndContainer().catch(console.error)
