import { AnalysingFormPanel } from "@/components/analysis/AnalysingFormPanel";
import { ChatBubble } from "@/components/ChatBubble";
import { AppLayout } from "@/components/layout/AppLayout";
import { useChat } from "@/contexts/ChatContext";
import { useAnalysisAssistant } from "@/hooks/use-analysis-assistant";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Wheat, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TypingDots = () => (
  <div className="mx-auto flex max-w-4xl gap-3 px-4 py-3">
    <img
      src="/maize-logo.svg"
      alt="AI"
      className="mt-1 h-8 w-8 rounded-xl border border-primary/30 bg-primary/10 p-1"
    />
    <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-chat-ai px-4 py-3 text-chat-ai-foreground">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.15, ease: "easeInOut" }}
          className={cn("h-2.5 w-2.5 rounded-full bg-primary/80")}
        />
      ))}
    </div>
  </div>
);

const CreateAnalysing = () => {
  const navigate = useNavigate();
  const { activeChat, removeMessage, updateMessage } = useChat();
  const { isAnalyzing, submitAnalysis, invalidImageError, setInvalidImageError } = useAnalysisAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeChat?.messages, isAnalyzing]);

  const messages = activeChat?.messages ?? [];

  const handleCreateAnalysing = (text: string, image?: string) => {
    submitAnalysis(text, image);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (activeChat) {
      removeMessage(activeChat.id, messageId);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string, newImage?: string | null) => {
    if (activeChat) {
      const patch: Record<string, any> = { content: newContent };
      // If newImage is provided (string or null), include it in the update. If undefined, keep existing image.
      if (newImage !== undefined) patch.image = newImage;
      updateMessage(activeChat.id, messageId, patch);
    }
  };

  const handleRegenerateResponse = (messageId: string) => {
    if (!activeChat) return;

    // Find the edited user message
    const userMessage = activeChat.messages.find((msg) => msg.id === messageId);
    if (!userMessage || userMessage.role !== "user") return;

    // Find the next AI response and remove it
    const userIndex = activeChat.messages.findIndex((msg) => msg.id === messageId);
    const nextAIMessage = activeChat.messages[userIndex + 1];
    if (nextAIMessage && nextAIMessage.role === "assistant") {
      removeMessage(activeChat.id, nextAIMessage.id);
    }

    // Resubmit the edited question with the original image without creating a duplicate user message
    submitAnalysis(userMessage.content, userMessage.image, { existingUserMessageId: userMessage.id });
  };

  const handleExit = () => {
    navigate("/dashboard");
  };

  return (
    <AppLayout>
      <div className="mx-auto flex min-h-[76vh] w-full max-w-5xl flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <h2 className="font-display text-lg font-semibold md:text-xl">Analysis Assistant</h2>
          </div>
          {messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleExit}
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Exit analysis"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </motion.button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-3xl border border-border/70 bg-gradient-to-b from-card/85 to-card/45 px-2 py-3 shadow-[0_8px_30px_-18px_hsl(var(--foreground)/0.35)] ring-1 ring-border/40 backdrop-blur-xl"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Wheat className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold">Where should we begin?</h3>
              <div className="mt-5 grid w-full max-w-2xl gap-2 sm:grid-cols-3">
                {[
                  "Brown spots on lower leaves",
                  "Yellowing after heavy rain",
                  "Leaf edges drying quickly",
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => handleCreateAnalysing(hint)}
                    className="rounded-xl border border-border/60 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/50 transition-colors text-left"
                    title={`Ask about: ${hint}`}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl">
              {messages.map((msg) => (
                <ChatBubble 
                  key={msg.id} 
                  message={msg} 
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onRegenerate={handleRegenerateResponse}
                />
              ))}
            </div>
          )}

          {isAnalyzing && <TypingDots />}
        </div>

        <div className="sticky bottom-0 mt-4 rounded-2xl border border-border/50 bg-background/70 py-2 backdrop-blur-md">
          <AnalysingFormPanel
            showHeader={false}
            onSubmit={handleCreateAnalysing}
            loading={isAnalyzing}
            className="max-w-4xl mx-auto"
            inputVariant="chatgpt"
            placeholder={messages.length > 0 ? "Track Progression: Upload a new photo of this crop today..." : "Upload an image and describe the symptoms..."}
          />
        </div>
      </div>

      {/* Invalid Image Custom Popup */}
      <AnimatePresence>
        {invalidImageError && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-red-500/50 bg-card shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]"
            >
              <div className="flex items-center justify-between border-b border-red-500/20 bg-red-500/10 px-6 py-4">
                <h3 className="font-semibold text-red-500 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold">!</span>
                  Invalid Image
                </h3>
                <button 
                  onClick={() => setInvalidImageError(null)}
                  className="rounded-full p-1.5 text-red-500/80 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 text-center">
                <img src={invalidImageError.image} alt="Uploaded" className="mx-auto max-h-48 rounded-xl object-cover border border-red-500/20 shadow-md" />
                <p className="text-sm font-medium text-foreground">{invalidImageError.message}</p>
              </div>
              <div className="border-t border-red-500/10 bg-red-500/5 px-6 py-4 flex justify-center">
                <button 
                  onClick={() => setInvalidImageError(null)}
                  className="w-full rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-red-500/20"
                >
                  Double Check & Upload Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default CreateAnalysing;
