import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface SmartInputProps {
  onSubmit: (text: string, image?: string) => void;
  loading?: boolean;
  variant?: "default" | "chatgpt";
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export const SmartInput = ({
  onSubmit,
  loading,
  variant = "default",
  placeholder = "Ask or describe your maize problem...",
  helperText,
  className,
}: SmartInputProps) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = () => {
    if (loading || (!text.trim() && !image)) return;
    onSubmit(text, image || undefined);
    setText("");
    setImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (loading) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isChatGptStyle = variant === "chatgpt";

  return (
    <div className={cn("w-full", isChatGptStyle ? "max-w-4xl mx-auto" : "max-w-3xl mx-auto px-4", className)}>
      <div
        className={cn(
          "rounded-2xl p-3",
          isChatGptStyle
            ? "border border-border/70 bg-card/90 shadow-xl backdrop-blur-xl"
            : "glass-card glow-green"
        )}
      >
        {/* Image Preview */}
        <AnimatePresence>
          {image && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="relative inline-block">
                <img src={image} alt="Preview" className="h-24 rounded-xl object-cover border border-border" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Row */}
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className={cn(
                "p-2.5 rounded-xl text-muted-foreground transition-colors",
                loading
                  ? "cursor-not-allowed opacity-50"
                  : isChatGptStyle
                  ? "hover:bg-muted/80 hover:text-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              title="Upload image"
              aria-label="Upload image"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={loading}
            className={cn(
              "min-h-10 max-h-32 flex-1 resize-none overflow-y-auto bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground",
              isChatGptStyle && "text-base",
              loading && "cursor-not-allowed opacity-60"
            )}
            aria-label="Describe your maize issue"
          />

          <button
            onClick={handleSubmit}
            disabled={loading || (!text.trim() && !image)}
            className={cn(
              "p-2.5 transition-all",
              isChatGptStyle ? "rounded-full" : "rounded-xl",
              text.trim() || image
                ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            aria-label="Send analysis request"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" multiple={false} disabled={loading} className="hidden" onChange={handleFile} title="Upload image" aria-label="Upload image" />
      </div>
      {helperText ? <p className="text-xs text-muted-foreground text-center mt-2">{helperText}</p> : null}
    </div>
  );
};
