import { DataArray, pipeline } from "@xenova/transformers";
import * as path from "path";
import * as dotenv from "dotenv";
import { CosmosClient } from "@azure/cosmos";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});
const container = client.database("EmbeddingsDB").container("Documents");
const topK = 5;

export async function getQueryEmbedding(text: string): Promise<number[]> {
  const modelName = "Xenova/all-MiniLM-L6-v2";
  const embedder = await pipeline("feature-extraction", modelName);
  const queryEmbeddingResponse = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  // Convert DataArray to a plain JS array for Cosmos DB compatibility
  return Array.from(queryEmbeddingResponse.data);
}

export async function queryCosmosDbVector(queryEmbedding: number[]) {
  const embeddingString = `[${queryEmbedding.join(",")}]`;

  const sqlQuery = {
    query: `
      SELECT TOP ${topK} 
        c.id, 
        c.title,
        c.url,
        c.release_year,
        c.genre,
        VectorDistance(c.embedding, ${embeddingString}, true, {'distanceFunction':'cosine', 'dataType':'float32'}) AS score
      FROM c
      ORDER BY VectorDistance(c.embedding, ${embeddingString}, true, {'distanceFunction':'cosine', 'dataType':'float32'})
    `,
  };

  const { resources } = await container.items.query(sqlQuery).fetchAll();
  return resources;
}
