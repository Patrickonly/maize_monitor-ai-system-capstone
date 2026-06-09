import { SmartInput } from "@/components/SmartInput";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AnalysingFormPanelProps {
  onSubmit: (text: string, image?: string) => void;
  loading?: boolean;
  showHeader?: boolean;
  title?: string;
  description?: string;
  className?: string;
  inputVariant?: "default" | "chatgpt";
  helperText?: string;
  placeholder?: string;
}

export const AnalysingFormPanel = ({
  onSubmit,
  loading,
  showHeader = true,
  title = "New Analysis",
  description = "Upload a crop image and describe the symptoms to begin the analysis.",
  className,
  inputVariant = "default",
  helperText,
  placeholder,
}: AnalysingFormPanelProps) => {
  return (
    <section className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> New Session
          </div>
          <h2 className="font-display text-xl font-bold md:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      )}
      <SmartInput
        onSubmit={onSubmit}
        loading={loading}
        variant={inputVariant}
        helperText={helperText}
        placeholder={placeholder}
      />
    </section>
  );
};
