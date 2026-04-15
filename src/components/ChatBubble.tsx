import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Leaf, User } from "lucide-react";
import { ChatMessage } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";

export const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 px-4 py-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-1">
          <Leaf className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div className={cn("max-w-[75%] space-y-2")}>
        {message.image && (
          <img
            src={message.image}
            alt="Uploaded"
            className="max-h-48 rounded-xl object-cover border border-border"
          />
        )}
        {message.content && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed",
              isUser
                ? "bg-chat-user text-chat-user-foreground rounded-br-md"
                : "bg-chat-ai text-chat-ai-foreground rounded-bl-md border border-border"
            )}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
                h3: ({ children }) => <h3 className="font-semibold text-base mt-3 mb-1">{children}</h3>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
};
