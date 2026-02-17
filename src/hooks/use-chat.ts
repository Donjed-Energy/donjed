import { useState, useCallback, FormEvent } from "react";

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setInput("");
  }, []);

  const handleSubmit = useCallback(
    async (
      e: FormEvent<HTMLFormElement>,
      options?: { force?: boolean; message?: string }
    ) => {
      e.preventDefault();

      // Use provided message or fall back to input state
      const messageToSend = options?.message ?? input;

      if (!messageToSend.trim() && !options?.force) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageToSend,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      const botMessageId = (Date.now() + 1).toString();
      // Add a placeholder for the bot's response
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, role: "bot", content: "" },
      ]);

      try {
        // Get current messages for context (need to use callback to get latest state)
        let currentMessages: Message[] = [];
        setMessages((prev) => {
          currentMessages = prev;
          return prev;
        });

        // Use mock API with conversation history for context retention
        const { mockChatAPI } = await import("@/lib/mock-api");
        const conversationHistory = currentMessages
          .filter((m) => m.id !== botMessageId) // Exclude the empty placeholder
          .map((m) => ({
            role: m.role as "user" | "bot",
            content: m.content,
          }));

        const responseBody = await mockChatAPI(
          messageToSend,
          conversationHistory
        );

        if (responseBody) {
          const reader = responseBody.getReader();
          const decoder = new TextDecoder();
          let streamingText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            streamingText += decoder.decode(value, { stream: true });

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, content: streamingText }
                  : msg
              )
            );
          }
        }
      } catch (error) {
        console.error("Chat API error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  content: "Sorry, something went wrong. Please try again.",
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input]
  );

  return {
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    setInput,
    resetChat,
  };
}
