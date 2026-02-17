import knowledgeBase from "./knowledge-base.json";
import { generateEmbedding, cosineSimilarity } from "./llm-client";

export interface DocumentChunk {
  id: string;
  text: string;
  source: string;
  metadata: {
    fileName: string;
    totalPages: number;
    chunkIndex: number;
  };
  embedding?: number[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
}

/**
 * Escape special characters for RegExp
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Simple keyword-based search for quick matching
 */
function keywordSearch(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 3,
): SearchResult[] {
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2);

  const scored = chunks.map((chunk) => {
    const chunkText = chunk.text.toLowerCase();
    let score = 0;

    // Count keyword matches
    for (const term of queryTerms) {
      try {
        const escapedTerm = escapeRegExp(term);
        const matches = (chunkText.match(new RegExp(escapedTerm, "g")) || [])
          .length;
        score += matches;
      } catch (e) {
        // Ignore invalid regex terms
      }
    }

    // Boost score for exact phrase matches
    if (chunkText.includes(query.toLowerCase())) {
      score += 10;
    }

    return { chunk, score };
  });

  return scored
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Semantic search using embeddings (reserved for future use)
 */
// @ts-ignore - Reserved for future semantic search feature
async function _semanticSearch(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 3,
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.warn(
        "Failed to generate query embedding, falling back to keyword search",
      );
      return keywordSearch(query, chunks, topK);
    }

    // Calculate similarity with each chunk
    const scored: SearchResult[] = [];

    for (const chunk of chunks) {
      // Generate embedding for chunk if not cached
      if (!chunk.embedding) {
        chunk.embedding = await generateEmbedding(chunk.text);
      }

      if (chunk.embedding && chunk.embedding.length > 0) {
        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
        scored.push({ chunk, score: similarity });
      }
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  } catch (error) {
    console.error("Error in semantic search:", error);
    return keywordSearch(query, chunks, topK);
  }
}

/**
 * Hybrid search combining keyword and semantic search
 */
export async function searchKnowledgeBase(
  query: string,
  topK: number = 3,
): Promise<SearchResult[]> {
  const chunks = knowledgeBase.documents as DocumentChunk[];

  // For now, use keyword search for speed
  // Semantic search can be enabled by uncommenting the line below
  // return await semanticSearch(query, chunks, topK);

  return keywordSearch(query, chunks, topK);
}

/**
 * Determine if a query is likely to be answered by the knowledge base
 */
export function isDocumentQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Greetings and casual conversation
  const greetings = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "how are you",
  ];
  if (
    greetings.some(
      (greeting) =>
        lowerQuery.trim() === greeting || lowerQuery.startsWith(greeting + " "),
    )
  ) {
    return false;
  }

  // Product/service related keywords
  const productKeywords = [
    "price",
    "cost",
    "system",
    "solar",
    "panel",
    "battery",
    "inverter",
    "installation",
    "warranty",
    "maintenance",
    "product",
    "service",
    "kw",
    "kwh",
    "watt",
    "power",
    "energy",
    "donjed",
    "appliance",
    "ac",
    "air conditioner",
    "refrigerator",
    "rain",
    "weather",
    "cloudy",
  ];

  return productKeywords.some((keyword) => lowerQuery.includes(keyword));
}

/**
 * Build context string from search results
 */
export function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return "";
  }

  return results
    .map((result, index) => {
      return `[Source ${index + 1}: ${result.chunk.source}]\n${
        result.chunk.text
      }`;
    })
    .join("\n\n---\n\n");
}

/**
 * Main RAG query function
 */
export async function queryRAG(
  userQuery: string,
): Promise<{ context: string; hasContext: boolean }> {
  // Check if this is a document-related query
  if (!isDocumentQuery(userQuery)) {
    return { context: "", hasContext: false };
  }

  // Search the knowledge base
  const results = await searchKnowledgeBase(userQuery, 3);

  // Build context from results
  const context = buildContext(results);

  return {
    context,
    hasContext: results.length > 0 && results[0].score > 0,
  };
}
