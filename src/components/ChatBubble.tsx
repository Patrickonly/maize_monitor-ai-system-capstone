import { ChatMessage } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Edit2, Leaf, Share2, User, X } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatBubbleProps {
  message: ChatMessage;
  // onEdit now accepts an optional newImage: string | null.
  onEdit?: (messageId: string, newContent: string, newImage?: string | null) => void;
  onDelete?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export const ChatBubble = ({ message, onEdit, onDelete, onRegenerate }: ChatBubbleProps) => {
  const isUser = message.role === "user";
  const isError = message.tone === "error";
  const isStreaming = message.isStreaming;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedText, setEditedText] = useState(message.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  // editedImage: undefined = no change (keep original), string = new image dataURL, null = remove image
  const [editedImage, setEditedImage] = useState<string | null | undefined>(undefined);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditedImage(reader.result as string);
    reader.readAsDataURL(file);
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          e.preventDefault();
          handleFile(blob);
        }
        return;
      }
    }
    // otherwise allow normal paste
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };
  const handleSaveEdit = () => {
    if (isSaving) return; // prevent double-submit
    if (editedText.trim() && onEdit) {
      try {
        setIsSaving(true);
        // Determine whether to pass a newImage param or not
        const passImage = editedImage !== undefined;
        const maybePromise: any = (onEdit as any)(
          message.id,
          editedText,
          passImage ? editedImage : undefined
        );
        // If onEdit returns a promise, wait for it to settle before proceeding
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise
            .then(() => {
              setShowEditModal(false);
              if (onRegenerate) setTimeout(() => onRegenerate(message.id), 300);
            })
            .catch(() => {
              // swallow - leave modal open so user can retry
            })
            .finally(() => setIsSaving(false));
        } else {
          // synchronous
          setShowEditModal(false);
          if (onRegenerate) setTimeout(() => onRegenerate(message.id), 300);
          // keep disabled for a short moment to avoid accidental double calls
          setTimeout(() => setIsSaving(false), 700);
        }
      } catch (err) {
        setIsSaving(false);
        throw err;
      }
    }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const generateShareLink = () => {
    const shareId = crypto.randomUUID().slice(0, 8);
    const baseUrl = window.location.origin;
    return `${baseUrl}/chat/${shareId}`;
  };

  const shareLink = generateShareLink();

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex gap-3 px-4 py-3", isUser ? "justify-end" : "justify-start")}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {!isUser && (
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-1">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
        )}

        <div className={cn("max-w-[75%] space-y-2", isUser && "flex flex-col items-end")}>
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
                  : isError
                  ? "bg-red-500/10 text-red-700 dark:text-red-300 rounded-bl-md border border-red-500/30"
                  : "bg-chat-ai text-chat-ai-foreground rounded-bl-md border border-border"
              )}
            >
              {isStreaming ? (
                <div className="space-y-1">
                  {message.content.split("\n").map((line, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      {line || "\n"}
                    </motion.div>
                  ))}
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block w-1 h-4 bg-current ml-1"
                  />
                </div>
              ) : (
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
              )}
            </div>
          )}

          {/* Action Buttons */}
          <AnimatePresence>
            {showActions && !showEditModal && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex gap-1.5"
              >
                {isUser && onEdit && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title="Edit and regenerate"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
                  {/* For a cleaner, ChatGPT-like layout: show copy/share on the user's question only.
                      Remove copy/share from AI responses and remove the delete icon entirely. */}
                  {isUser && (
                    <>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Copy question"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>

                      <button
                        onClick={() => setShowShareModal(true)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Share this question"
                      >
                        <Share2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    </>
                  )}
              </motion.div>
            )}
          </AnimatePresence>

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

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                <h3 className="font-semibold text-foreground">Edit & Regenerate</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Your Question
                  </label>

                  {/* Image preview / replace controls */}
                  {(editedImage !== undefined ? editedImage : message.image) && (
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={(editedImage !== undefined ? editedImage : message.image) as string}
                          alt="Preview"
                          className="max-h-28 rounded-md object-cover border border-border"
                        />
                        <button
                          onClick={() => setEditedImage(null)}
                          title="Remove image"
                          className="absolute bottom-1 right-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium text-white hover:bg-black/80"
                        >
                          Remove image
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-muted-foreground">Image attached</label>
                        <div className="flex gap-2">
                          <input
                            id={`file-${message.id}`}
                            type="file"
                            accept="image/*"
                            title="Replace image"
                            aria-label="Replace image"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              handleFile(file);
                            }}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      onPaste={handlePaste}
                      className="w-full p-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                      rows={6}
                      placeholder="Edit your question and AI will regenerate the response... (paste or drag images here)"
                      title="Edit message"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Tip: When you save, AI will regenerate a new response based on your edited question.
                </p>
              </div>

              <div className="flex gap-3 border-t border-border/50 px-6 py-4 justify-end">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editedText.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save & Regenerate"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                <h3 className="font-semibold text-foreground">Share Analysis</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share this analysis with a unique link:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 p-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none"
                    placeholder="Share link"
                    title="Share link"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className="px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Share ID:</span> {shareLink.split('/').pop()}
                  </p>
                </div>
              </div>

              <div className="border-t border-border/50 px-6 py-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
