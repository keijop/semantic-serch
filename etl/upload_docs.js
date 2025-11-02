import { CosmosClient } from '@azure/cosmos'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(import.meta.dirname, '../.env') })

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
})
const container = client.database('EmbeddingsDB').container('Documents')

async function insertBatch(docs) {
  for (const doc of docs) {
    try {
      await container.items.create(doc)
    } catch (err) {
      console.error('Failed to insert doc id=', doc.id, err.message)
    }
  }
}

async function insertAllDocuments(documents, batchSize = 500) {
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize)
    console.log(`Inserting batch ${i} to ${i + batch.length}...`)
    await insertBatch(batch)
  }
  console.log('All documents inserted!')
}

const rawDocuments = await fs.promises.readFile('embeddings.json', 'utf-8')
const documents = JSON.parse(rawDocuments)
await insertAllDocuments(documents)
