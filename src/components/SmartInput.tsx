import { useState, useRef } from "react";
import { Camera, Upload, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SmartInputProps {
  onSubmit: (text: string, image?: string) => void;
  loading?: boolean;
}

export const SmartInput = ({ onSubmit, loading }: SmartInputProps) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = () => {
    if (!text.trim() && !image) return;
    onSubmit(text, image || undefined);
    setText("");
    setImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="glass-card rounded-2xl p-3 glow-green">
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
              onClick={() => cameraRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
              title="Take photo"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
              title="Upload image"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask or describe your maize problem..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm py-2.5 max-h-32 overflow-y-auto"
            style={{ minHeight: "40px" }}
          />

          <button
            onClick={handleSubmit}
            disabled={loading || (!text.trim() && !image)}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              text.trim() || image
                ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Upload an image of your maize plant and describe the symptoms for AI-powered diagnosis
      </p>
    </div>
  );
};
