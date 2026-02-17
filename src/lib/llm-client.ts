import OpenAI from "openai";

// Load environment variables
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
const BASE_URL =
  import.meta.env.VITE_OPENAI_BASE_URL ||
  "https://generativelanguage.googleapis.com/v1beta/openai/";
const MODEL_NAME = "gemini-2.5-flash";

if (!API_KEY || API_KEY === "YOUR_GOOGLE_AI_API_KEY") {
  console.warn(
    "⚠️ Google/Gemini API key not found or default. LLM features will be limited.",
  );
} else {
  console.log("✅ Google/Gemini API key loaded");
  console.log(`🔌 Connected to: ${BASE_URL}`);
  console.log(`🤖 Model: ${MODEL_NAME}`);
}

// Initialize OpenAI client
// Note: We use 'dangerouslyAllowBrowser: true' because this is a client-side app.
// In a production app, you should proxy requests through a backend to protect your API key.
const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
  dangerouslyAllowBrowser: true,
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Sleep utility for delays
 */

/**
 * Generate embeddings for text using OpenAI compatible endpoint
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!API_KEY || API_KEY === "YOUR_GOOGLE_AI_API_KEY") return [];

    const response = await openai.embeddings.create({
      model: "text-embedding-004", // Google's embedding model
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}

/**
 * Build the system message for the DonJed assistant
 */
function buildSystemMessage(context?: string): string {
  let systemMessage = `You are the AI assistant for DonJed Energy Solutions. You are not a robot; you are a helpful, savvy energy expert.
Your goal is to "wow" the user with insights while keeping the conversation flowing naturally.

# CRITICAL RESPONSE RULES (MUST FOLLOW)

1. **Length**: Keep responses to **3-5 sentences**. Be concise but not clipped.
2. **Tone**: Human, calm, confident. No corporate jargon. Speak like a knowledgeable friend.
3. **Emotional Intelligence**: Start by implicitly acknowledging the user's intent. The user should feel "he gets me."
4. **Wow Factor**: Include one short, non-obvious insight (e.g., about battery chemistry, sun peak hours, or cost traps) that adds value.
5. **Open Loop (MANDATORY)**: End every response with a **curiosity gap**—a hint at something more, a forward-looking thought, or a choice. NEVER use "Would you like to know more?". Make it subtle.

# SPECIAL SKILL: FINANCIAL ADVISOR
- **IF** the user provides generator/fuel spending numbers:
  - You **MUST** perform a financial savings analysis.
  - Compare their fuel waste vs. solar asset accumulation.
  - Be direct about the ROI.

# SPECIAL RULE: GREETINGS
- **IF** the user says "Hi", "Hello", or similar greetings:
  - Respond warmly.
  - **ALWAYS** add "You can reach us on..." followed by this vertical list:
    * X: [donjedenergy](https://x.com/donjedenergy)
    * Instagram: [donjed_energy](https://instagram.com/donjed_energy)
    * Email: [donjedenergy@gmail.com](mailto:donjedenergy@gmail.com)
    * Phone: [+234 707 859 1030](tel:+2347078591030)`;

  if (context) {
    systemMessage += `\n\n# DOCUMENTATION CONTEXT\nUse the following verified information from DonJed's documentation:\n${context}`;
  }

  return systemMessage;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The absolute Google API URL (used for direct fetch when proxy path fails)
 */
const DIRECT_GOOGLE_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/";

/**
 * Fetch with automatic retry on 429 (rate limit) errors.
 * Retries up to `maxRetries` times with exponential backoff.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429 && attempt < maxRetries) {
      // Parse retry delay from the response if available
      let retryDelay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s default

      try {
        const errorJson = await response.clone().json();
        const retryInfo = errorJson?.error?.details?.find((d: any) =>
          d["@type"]?.includes("RetryInfo"),
        );
        if (retryInfo?.retryDelay) {
          const match = retryInfo.retryDelay.match(/(\d+)/);
          if (match) retryDelay = Math.max(parseInt(match[1]) * 1000, 2000);
        }
      } catch {
        // Use default backoff
      }

      console.warn(
        `⏳ [RETRY] 429 rate limited. Waiting ${retryDelay / 1000}s before retry ${attempt + 1}/${maxRetries}...`,
      );
      await sleep(retryDelay);
      continue;
    }

    return response;
  }

  // Should not reach here, but just in case
  return fetch(url, options);
}

/**
 * Generate a chat response with streaming support.
 * BRUTE FORCE: Uses raw fetch() with retry-on-429 and smart fallback.
 */
export async function* streamChatResponse(
  prompt: string,
  context?: string,
  history?: ChatMessage[],
): AsyncGenerator<string, void, unknown> {
  if (!API_KEY || API_KEY === "YOUR_GOOGLE_AI_API_KEY") {
    console.error("❌ Aborting chat request: No API Key found");
    yield "I cannot reply because the Google/Gemini API Key is missing. Please check your configuration.";
    return;
  }

  const systemMessage = buildSystemMessage(context);
  const messages: ChatMessage[] = [{ role: "system", content: systemMessage }];

  if (history && history.length > 0) {
    history.forEach((msg) => {
      messages.push(msg);
    });
  }
  messages.push({ role: "user", content: prompt });

  const requestBody = {
    model: MODEL_NAME,
    messages: messages,
    stream: true,
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 8192,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };

  // Use the configured BASE_URL first, fall back to direct Google URL
  const primaryEndpoint = `${BASE_URL}chat/completions`;
  const directEndpoint = `${DIRECT_GOOGLE_URL}chat/completions`;

  console.log(`🚀 [BRUTE FORCE] Sending request to: ${primaryEndpoint}`);
  console.log(`🤖 [BRUTE FORCE] Model: ${MODEL_NAME}`);

  // ============================================================
  // ATTEMPT 1: Raw fetch() with SSE streaming + retry on 429
  // ============================================================
  try {
    const response = await fetchWithRetry(primaryEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log(`📡 [BRUTE FORCE] Response status: ${response.status}`);

    if (response.status === 429) {
      // If still 429 after all retries, show a friendly message
      yield "Oops! Due to high traffic, I am currently unavailable. Please try again later.";
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ [BRUTE FORCE] Streaming failed (${response.status}):`,
        errorText,
      );
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body reader available");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let yieldedAnything = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6); // Remove "data: " prefix
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || "";
          if (content) {
            yieldedAnything = true;
            yield content;
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }

    if (yieldedAnything) {
      console.log("✅ [BRUTE FORCE] Streaming completed successfully");
      return;
    }

    console.warn(
      "⚠️ [BRUTE FORCE] Streaming yielded no content, trying non-streaming fallback...",
    );
  } catch (streamError: any) {
    console.error(
      "❌ [BRUTE FORCE] Streaming attempt failed:",
      streamError.message,
    );
  }

  // ============================================================
  // ATTEMPT 2: Non-streaming fallback via direct Google URL
  // ============================================================
  try {
    console.log(
      `🔄 [BRUTE FORCE] Attempting non-streaming via direct URL: ${directEndpoint}`,
    );

    const fallbackBody = { ...requestBody, stream: false };
    const fallbackResponse = await fetchWithRetry(directEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(fallbackBody),
    });

    console.log(
      `📡 [BRUTE FORCE] Fallback response status: ${fallbackResponse.status}`,
    );

    if (fallbackResponse.status === 429) {
      yield "Oops! Due to high traffic, I am currently unavailable. Please try again later.";
      return;
    }

    if (!fallbackResponse.ok) {
      const errorText = await fallbackResponse.text();
      console.error(
        `❌ [BRUTE FORCE] Fallback failed (${fallbackResponse.status}):`,
        errorText,
      );
      throw new Error(
        `Fallback API returned ${fallbackResponse.status}: ${errorText}`,
      );
    }

    const json = await fallbackResponse.json();
    const content = json.choices?.[0]?.message?.content || "";

    if (content) {
      console.log("✅ [BRUTE FORCE] Non-streaming fallback succeeded");
      yield content;
      return;
    }

    throw new Error("No content in fallback response");
  } catch (fallbackError: any) {
    console.error(
      "❌ [BRUTE FORCE] Non-streaming fallback also failed:",
      fallbackError.message,
    );
  }

  // All attempts failed
  yield "I'm sorry, I'm having trouble connecting to the AI service right now. Please check the browser console for details and try again.";
}

/**
 * Generate a complete (non-streaming) chat response
 */
export async function generateChatResponse(
  prompt: string,
  context?: string,
  history?: ChatMessage[],
): Promise<string> {
  const chunks: string[] = [];
  for await (const chunk of streamChatResponse(prompt, context, history)) {
    chunks.push(chunk);
  }
  return chunks.join("");
}

/**
 * TEST CONNECTIVITY: Minimal "Hello World" test to verify API endpoint
 */
export async function testAPIConnectivity(): Promise<void> {
  console.log("🧪 Starting Google/Gemini API Connectivity Test...");
  console.log(`🔌 Base URL: ${BASE_URL}`);
  console.log(`🤖 Model: ${MODEL_NAME}`);

  if (!API_KEY || API_KEY === "YOUR_GOOGLE_AI_API_KEY") {
    console.error("❌ CRITICAL: API_KEY is missing or default!");
    return;
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: "user", content: "Say 'Hello World' in one word." }],
    });

    console.log(`✅ SUCCESS: "${response.choices[0].message.content}"`);
  } catch (error: any) {
    console.error("❌ FAILED connectivity test");
    console.error("   Message:", error.message);
  }
}

/**
 * VERIFY AUTHENTICATION: Check if API key environment variable is loaded
 */
export function verifyAPIKeyLoaded(): boolean {
  if (!API_KEY || API_KEY === "YOUR_GOOGLE_AI_API_KEY") {
    console.error("❌ ERROR: VITE_GOOGLE_API_KEY is missing or default");
    return false;
  }
  return true;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
