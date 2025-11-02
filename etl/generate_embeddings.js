import fs from 'fs'
import { parse } from 'fast-csv'
import crypto from 'crypto'
import { pipeline } from '@xenova/transformers'
import path from 'path'

const modelName = 'Xenova/all-MiniLM-L6-v2'
const embedder = await pipeline('feature-extraction', modelName)
const MAX_TOKENS = 512

const readStream = fs.createReadStream(
  path.join(import.meta.dirname, 'data', 'cleaned_movies.csv')
)
const writeStream = fs.createWriteStream(
  path.join(import.meta.dirname, 'data', 'embeddings.json')
)
const errorStream = fs.createWriteStream(
  path.join(import.meta.dirname, 'data', 'embedding_errors.log')
)

// Utility: Sentence splitter
function splitIntoSentences(text) {
  return text.match(/[^\.!\?]+[\.!\?]+/g) || [text]
}

// Utility: Construct embedding input text
function getInput(row) {
  return `Title: ${row['Title']}. Genre: ${row['Genre']}. Plot: ${row['Plot']}`
}

// Main embedding function
async function getEmbedding(text) {
  try {
    const tokenizer = embedder.tokenizer
    const fullTextEncoded = tokenizer.encode(text)

    // Skip chunking if input does not exceed token limit
    if (fullTextEncoded.length <= MAX_TOKENS) {
      const response = await embedder(text, {
        pooling: 'mean',
        normalize: true,
      })
      return response.data
    }

    // Split into sentences and batch into token chunks
    const sentences = splitIntoSentences(text)
    const embeddings = []
    let tokenBatch = []

    for (const sentence of sentences) {
      const encodedSentence = tokenizer.encode(sentence)

      if (tokenBatch.length + encodedSentence.length > MAX_TOKENS) {
        // Embed the current batch
        const batchText = tokenizer.decode(tokenBatch)
        const res = await embedder(batchText, {
          pooling: 'mean',
          normalize: true,
        })
        embeddings.push(res.data)

        // Start a new batch
        tokenBatch = [...encodedSentence]
      } else {
        tokenBatch.push(...encodedSentence)
      }
    }

    // Embed any remaining batch
    if (tokenBatch.length > 0) {
      const batchText = tokenizer.decode(tokenBatch)
      const res = await embedder(batchText, {
        pooling: 'mean',
        normalize: true,
      })
      embeddings.push(res.data)
    }

    // Compute average embedding from chunk embeddings
    const dimensionCount = embeddings[0].length
    const finalEmbedding = Array.from(
      { length: dimensionCount },
      (_, i) =>
        embeddings.reduce((sum, emb) => sum + emb[i], 0) / embeddings.length
    )

    return finalEmbedding
  } catch (error) {
    console.error('Failed to generate embedding: ', error)
    // Return null to signal failure without stopping execution
    return null
  }
}

function getDocument(row, embedding) {
  const id = crypto
    .createHash('sha256')
    .update(JSON.stringify(row))
    .digest('hex')

  return {
    id: id,
    title: row['Title'],
    genre: row['Genre'],
    embedding: embedding,
  }
}

async function processCsv() {
  console.time('processCsv')
  let counter = 0
  let errorCount = 0
  let rowNumber = 0

  writeStream.write('[')

  const stream = readStream.pipe(parse({ headers: true }))

  for await (const row of stream) {
    rowNumber++
    try {
      console.log(`Processing row ${rowNumber}`)
      const embedding = await getEmbedding(getInput(row))

      // Skip rows where embedding failed
      if (embedding === null) {
        const errorMsg = `Row ${rowNumber}: Failed to generate embedding for "${row['Title']}"\n`
        errorStream.write(errorMsg)
        console.warn(errorMsg.trim())
        errorCount++
        continue
      }

      const document = getDocument(row, embedding)

      if (counter !== 0) writeStream.write(',')
      writeStream.write(JSON.stringify(document))
      counter++
    } catch (error) {
      const errorMsg = `Row ${rowNumber}: Unexpected error for "${row['Title']}" - ${error.message}\n`
      errorStream.write(errorMsg)
      console.error(errorMsg.trim())
      errorCount++
      // Continue processing other rows
    }
  }

  writeStream.write(']')
  writeStream.end()
  errorStream.end()

  console.timeEnd('processCsv')
  console.log(`Successfully processed: ${counter} rows`)
  console.log(`Errors: ${errorCount} rows`)
  console.log(`Total rows: ${rowNumber}`)
  console.log(`Check embedding_errors.log for details on failed rows`)
}

await processCsv()
