/**
 * RAG-powered Chat API
 * Uses knowledge base retrieval and LLM for intelligent responses
 */

import { queryRAG } from "./rag-engine";
import { streamChatResponse, ChatMessage } from "./llm-client";

export interface ConversationMessage {
  role: "user" | "bot";
  content: string;
}

/**
 * Convert conversation messages to LLM history format
 */
/**
 * Convert conversation messages to LLM history format
 */
function convertToLLMHistory(messages: ConversationMessage[]): ChatMessage[] {
  return messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }));
}

export async function mockChatAPI(
  message: string,
  conversationHistory: ConversationMessage[] = [],
): Promise<ReadableStream<Uint8Array>> {
  // Query the RAG system - wrapped in try/catch to prevent crashes (Brute Force resilience)
  let context = "";
  try {
    const result = await queryRAG(message);
    context = result.context;
  } catch (error) {
    console.warn("RAG retrieval failed, proceeding without context:", error);
    // Proceed without context (will trigger fallback prompt in llm-client)
  }

  // Convert conversation history to LLM format (exclude the current message and empty bot responses)
  const history = convertToLLMHistory(
    conversationHistory.filter((msg) => msg.content.trim() !== ""),
  );

  // Create a readable stream for the response
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Stream response from LLM with context AND conversation history
        for await (const chunk of streamChatResponse(
          message,
          context,
          history,
        )) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        console.error("Error streaming response:", error);
        const errorMessage =
          "I apologize, but I'm having trouble processing your request right now. Please try again.";
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      }
    },
  });

  return stream;
}
