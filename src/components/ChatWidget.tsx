import { useRef, useEffect, useState, useCallback } from "react";
import { Send, Bot, Plus, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/use-chat";
import { useTheme } from "@/context/ThemeContext";
import { TypingAnimation } from "./TypingAnimation";
import { ProductCard } from "./ProductCard";

import { EnergyCalculator } from "./EnergyCalculator";
import { MarkdownMessage } from "./MarkdownMessage";
import { SolarQuotationModal } from "./SolarQuotationModal";
import { SolarVsGeneratorModal } from "./SolarVsGeneratorModal";
import { YourKitDropdown } from "./YourKitDropdown";

const suggestionChips = [
  { text: "Show me the price list", short: "Price list" },
  { text: "Compare solar vs gen for savings", short: "Solar vs Gen" },
  { text: "Can solar run my AC?", short: "Solar for AC?" },
];

// Check if browser supports speech recognition
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    : null;

interface ChatInputFormProps {
  input: string;
  isLoading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onResetChat: () => void;
  onOpenCalculator: () => void;
  onOpenSolarQuotation: () => void;
  onOpenSolarVsGenerator: () => void;
  onVoiceInput: (text: string) => void;
  compact?: boolean;
}

const ChatInputForm = ({
  input,
  isLoading,
  handleInputChange,
  handleSubmit,
  onResetChat,
  onOpenCalculator,
  onOpenSolarQuotation,

  onVoiceInput,
  compact = false,
}: ChatInputFormProps) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(!!SpeechRecognition);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Refocus the textarea when the AI finishes replying
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
      // Refocus after submit
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in your browser. Please use Chrome or Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");

      onVoiceInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);

      if (event.error === "not-allowed") {
        alert(
          "Microphone access denied. Please enable microphone permissions.",
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onVoiceInput]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "px-2 sm:px-4 pb-3 sm:pb-4 bg-transparent w-full",
          compact && "pb-2",
        )}
      >
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              handleSubmit(e);
              setTimeout(() => textareaRef.current?.focus(), 0);
            }}
            className={cn(
              "relative flex flex-col w-full bg-card dark:bg-[#1e1e1e] rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 transition-all duration-300 animate-revolving-border-pseudo shadow-sm",
              compact ? "gap-2" : "gap-3",
            )}
          >
            {/* Top Row: Textarea + Send/Mic Action */}
            <div className="flex items-end gap-2 sm:gap-3 w-full">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Ask DonJed..."}
                className={cn(
                  "min-h-[24px] max-h-[120px] sm:max-h-[200px] w-full border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base sm:text-lg text-foreground dark:text-zinc-200 placeholder:text-muted-foreground dark:placeholder:text-zinc-500 p-0 resize-none overflow-hidden",
                  isListening &&
                    "placeholder:text-primary placeholder:animate-pulse",
                )}
                disabled={isLoading}
                autoFocus
                rows={1}
                style={{ height: "auto", minHeight: "24px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />

              <div className="flex-shrink-0 pb-0.5">
                {input.trim() ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        size="icon"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-8 h-8 sm:w-9 sm:h-9 transition-all"
                        disabled={isLoading}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Send message</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleListening}
                        disabled={!speechSupported}
                        className={cn(
                          "rounded-full w-8 h-8 sm:w-9 sm:h-9 transition-all",
                          isListening
                            ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500 animate-pulse"
                            : "text-zinc-400 hover:text-primary hover:bg-primary/10",
                        )}
                      >
                        {isListening ? (
                          <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>
                        {isListening
                          ? "Stop listening"
                          : speechSupported
                            ? "Voice input"
                            : "Voice not supported"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Bottom Row: Tools & Options */}
            <div className="flex items-center justify-between pt-0.5 sm:pt-1">
              {/* Left Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-full w-7 h-7 sm:w-8 sm:h-8 transition-colors"
                      onClick={onResetChat}
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>New chat</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Right Actions - Your Kit Dropdown */}
              <div className="flex items-center gap-1 sm:gap-2">
                <YourKitDropdown
                  onOpenCalculator={onOpenCalculator}
                  onOpenSolarQuotation={onOpenSolarQuotation}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
};

export function ChatInterface() {
  const {
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    resetChat,
    setInput,
  } = useChat();
  const { toggleTheme } = useTheme();

  // 🥚 Easter egg: intercept "change theme" command
  const handleSubmitWithEasterEgg = (
    e: React.FormEvent<HTMLFormElement>,
    options?: { force?: boolean; message?: string },
  ) => {
    const msg = (options?.message ?? input).trim().toLowerCase();
    if (msg === "change theme") {
      e.preventDefault();
      toggleTheme();
      setInput("");
      return;
    }
    handleSubmit(e, options);
  };
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSolarQuotation, setShowSolarQuotation] = useState(false);
  const [showSolarVsGenerator, setShowSolarVsGenerator] = useState(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleFaqClick = (question: string) => {
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;
    handleSubmitWithEasterEgg(syntheticEvent, { message: question });
  };

  const handleVoiceInput = (text: string) => {
    setInput(text);
  };

  const handleSolarVsGeneratorAdvice = (comparisonData: string) => {
    // Submit the comparison data as a message to get AI advice
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;
    handleSubmitWithEasterEgg(syntheticEvent, { message: comparisonData });
  };

  const renderBotMessage = (content: string) => {
    if (
      content.includes("**Product Name:**") &&
      content.includes("**Price Range:**")
    ) {
      return <ProductCard content={content} />;
    }
    return <MarkdownMessage content={content} />;
  };

  const handleChipClick = (chip: { text: string; short: string }) => {
    if (chip.text === "Compare solar vs gen for savings") {
      setShowSolarVsGenerator(true);
      return;
    }
    handleFaqClick(chip.text);
  };

  return (
    <>
      <EnergyCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
      />
      <SolarQuotationModal
        isOpen={showSolarQuotation}
        onClose={() => setShowSolarQuotation(false)}
      />
      <SolarVsGeneratorModal
        isOpen={showSolarVsGenerator}
        onClose={() => setShowSolarVsGenerator(false)}
        onGetAdvice={handleSolarVsGeneratorAdvice}
      />
      <div className="flex flex-col w-full max-w-6xl mx-auto h-full overflow-hidden">
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {messages.length > 0 ? (
            <div
              key="chat-view"
              className="flex flex-col flex-1 overflow-hidden animate-fade-in"
            >
              {/* Message List - Scrollable Area */}
              <div
                className="flex-1 overflow-y-auto min-h-0 px-2 sm:px-4 py-3 sm:py-4 space-y-4 sm:space-y-6 scroll-smooth"
                ref={scrollAreaRef}
              >
                <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-2 sm:gap-3",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      {/* Assistant icon on the left */}
                      {message.role === "bot" && (
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={cn(
                          "max-w-[88%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 leading-relaxed transition-colors",
                          message.role === "user"
                            ? "bg-primary/15 backdrop-blur-md border border-primary/10 text-foreground dark:text-white ml-auto shadow-sm"
                            : "bg-transparent text-foreground",
                        )}
                      >
                        {message.role === "bot" ? (
                          <div className="text-base font-semibold dark:font-normal">
                            {message.content ? (
                              renderBotMessage(message.content)
                            ) : (
                              <TypingAnimation />
                            )}
                          </div>
                        ) : (
                          <p className="text-base whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Invisible element to scroll to */}
                  <div />
                </div>
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="w-full bg-background/80 backdrop-blur-sm pt-1 sm:pt-2 shrink-0">
                <ChatInputForm
                  input={input}
                  isLoading={isLoading}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmitWithEasterEgg}
                  onResetChat={resetChat}
                  onOpenCalculator={() => setShowCalculator(true)}
                  onOpenSolarQuotation={() => setShowSolarQuotation(true)}
                  onOpenSolarVsGenerator={() => setShowSolarVsGenerator(true)}
                  onVoiceInput={handleVoiceInput}
                  compact
                />
              </div>
            </div>
          ) : (
            <div
              key="hero-view"
              className="flex-1 flex flex-col items-center justify-center text-center px-3 sm:px-4 py-4 relative overflow-hidden animate-fade-in"
            >
              <div className="flex flex-col items-center w-full max-w-4xl gap-2 sm:gap-3 relative z-10">
                <h1 className="text-xl sm:text-2xl font-medium text-foreground mb-2 sm:mb-4 px-2">
                  How can DonJed help you today?
                </h1>

                {/* Responsive suggestion chips - horizontal scroll on mobile */}
                <div className="w-full overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:overflow-visible">
                  <div className="flex sm:flex-wrap sm:justify-center items-center gap-2 min-w-max sm:min-w-0">
                    {suggestionChips.map((chip, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={cn(
                          "text-sm px-3 sm:px-4 py-2 whitespace-nowrap animate-sheen transition-all shrink-0 border",
                          chip.text === "Compare solar vs gen for savings"
                            ? "rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 backdrop-blur-md border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm hover:bg-emerald-500/20 hover:shadow-emerald-500/10 active:scale-95"
                            : "rounded-full bg-secondary dark:bg-zinc-900 border-border dark:border-zinc-800 text-foreground dark:text-zinc-300 hover:bg-secondary/80 dark:hover:bg-zinc-800 hover:text-foreground dark:hover:text-zinc-200",
                        )}
                        onClick={() => handleChipClick(chip)}
                      >
                        {/* Show short text on very small screens */}
                        <span className="sm:hidden">{chip.short}</span>
                        <span className="hidden sm:inline">
                          {chip.text.charAt(0).toUpperCase() +
                            chip.text.slice(1)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="w-full pt-2 sm:pt-4">
                  <ChatInputForm
                    input={input}
                    isLoading={isLoading}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmitWithEasterEgg}
                    onResetChat={resetChat}
                    onOpenCalculator={() => setShowCalculator(true)}
                    onOpenSolarQuotation={() => setShowSolarQuotation(true)}
                    onOpenSolarVsGenerator={() => setShowSolarVsGenerator(true)}
                    onVoiceInput={handleVoiceInput}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
