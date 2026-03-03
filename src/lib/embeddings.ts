// Embedding utility — generates OpenAI embeddings for events and users.
// Falls back gracefully when OPENAI_API_KEY is not configured.

import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (openaiClient) return openaiClient;
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === "<your-openai-api-key>") return null;
  openaiClient = new OpenAI({ apiKey: key });
  return openaiClient;
}

/**
 * Generate an embedding vector for the given text.
 * Returns null if the OpenAI API key is not configured.
 */
export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000), // stay well within token limits
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("[Embeddings] Failed to generate embedding:", error);
    return null;
  }
}

/**
 * Build a text string from event fields for embedding.
 */
export function buildEventEmbeddingText(event: {
  title: string;
  description?: string | null;
  category: string;
}): string {
  const parts = [
    event.title,
    event.category.toLowerCase(),
    event.description ?? "",
  ];
  return parts.filter(Boolean).join(". ");
}

/**
 * Build a text string from user interests for embedding.
 */
export function buildUserInterestsText(interests: string[]): string {
  if (!interests.length) return "";
  return `I am interested in: ${interests.map((i) => i.toLowerCase()).join(", ")}`;
}
