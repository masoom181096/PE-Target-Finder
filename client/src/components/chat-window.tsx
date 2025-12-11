import { useEffect, useRef } from "react";
import { Bot, User, Send } from "lucide-react";
import type { ChatMessage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage?: (message: string) => void;
  isProcessing?: boolean;
  inputDisabled?: boolean;
  inputPlaceholder?: string;
  className?: string;
  children?: React.ReactNode;
  aboveInputPanel?: React.ReactNode;
}

export function ChatWindow({
  messages,
  onSendMessage,
  isProcessing = false,
  inputDisabled = false,
  inputPlaceholder = "Type a message...",
  className,
  children,
  aboveInputPanel,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, children]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (value && onSendMessage) {
      onSendMessage(value);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)} data-testid="chat-window">
      <ScrollArea ref={scrollRef} className="flex-1 p-6">
        <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          {isProcessing && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
      </ScrollArea>

      {aboveInputPanel && (
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="max-w-3xl mx-auto">
            {aboveInputPanel}
          </div>
        </div>
      )}

      {onSendMessage && (
        <div className="sticky bottom-0 p-4 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={inputRef}
                placeholder={inputPlaceholder}
                className="min-h-[56px] max-h-[200px] pr-14 resize-none rounded-xl border-2 text-base focus-visible:ring-1"
                onKeyDown={handleKeyDown}
                disabled={inputDisabled || isProcessing}
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 bottom-2"
                disabled={inputDisabled || isProcessing}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse"
      )}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-secondary" : "bg-primary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-secondary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-xl",
          isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted text-foreground"
        )}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
      </div>
    </div>
  );
}
