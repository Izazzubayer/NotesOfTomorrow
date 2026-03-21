import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates a 768-dimensional embedding vector for a single piece of text
 * using Google's text-embedding-004 model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values; // 768-dimensional vector
}

/**
 * Generates embeddings for a list of texts in parallel batches of 10.
 * Rate-limited batching avoids Google AI API rate limits.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 10;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const embeddings = await Promise.all(batch.map(generateEmbedding));
    results.push(...embeddings);
  }

  return results;
}
