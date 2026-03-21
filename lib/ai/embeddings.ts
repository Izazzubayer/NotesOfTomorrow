/**
 * Generates a 768-dimensional embedding using gemini-embedding-001.
 * Automatically retries on 429 rate-limit errors using the delay the API suggests.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");

  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: { parts: [{ text }] },
          outputDimensionality: 768, // keep within Firestore's 2048-dim limit
        }),
      }
    );

    if (res.status === 429) {
      // Parse the suggested retry delay from the response body
      let waitMs = 12_000; // default 12s
      try {
        const body = await res.json();
        const retryInfo = body?.error?.details?.find(
          (d: { "@type": string }) => d["@type"]?.includes("RetryInfo")
        );
        if (retryInfo?.retryDelay) {
          const secs = parseFloat(retryInfo.retryDelay.replace("s", ""));
          waitMs = Math.ceil(secs * 1000) + 500; // add 500ms buffer
        }
      } catch { /* use default */ }

      console.log(`Embedding rate-limited. Waiting ${waitMs}ms before retry (attempt ${attempt + 1}/${MAX_ATTEMPTS})`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Embedding API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.embedding.values as number[];
  }

  throw new Error("Embedding failed after max retries");
}

/**
 * Generates embeddings for a list of texts, 5 at a time with a small delay
 * between batches to stay within the free-tier rate limit (100 req/min).
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 5; // smaller batches = kinder to rate limits
  const BETWEEN_BATCH_DELAY = 3_500; // ~3.5s between batches keeps us under 100/min
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    if (i > 0) {
      await new Promise((r) => setTimeout(r, BETWEEN_BATCH_DELAY));
    }
    const batch = texts.slice(i, i + BATCH_SIZE);
    const embeddings = await Promise.all(batch.map(generateEmbedding));
    results.push(...embeddings);
  }

  return results;
}
