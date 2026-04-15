import { useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SmartInput } from "@/components/SmartInput";
import { ChatBubble } from "@/components/ChatBubble";
import { useChat } from "@/contexts/ChatContext";
import { Leaf } from "lucide-react";

const mockAIResponse = (userText: string, hasImage: boolean): string => {
  if (hasImage || userText.toLowerCase().includes("leaf") || userText.toLowerCase().includes("spot")) {
    return `### 🔍 Disease Detected: **Northern Leaf Blight**

**Severity:** Moderate (Stage 2/4)

**Symptoms Identified:**
- Elongated gray-green lesions on leaves
- Lesions 2–15 cm long, cigar-shaped
- Lower leaves affected first

### 💊 Recommended Treatment:
1. **Fungicide Application** — Apply azoxystrobin-based fungicide immediately
2. **Remove Affected Leaves** — Prune severely infected lower leaves
3. **Improve Air Circulation** — Increase spacing between plants
4. **Monitor Daily** — Check neighboring plants for spread

### 📋 Prevention:
- Rotate crops with non-host species
- Use resistant hybrid varieties (e.g., Bt maize)
- Avoid overhead irrigation

> ⚠️ *If symptoms worsen within 5 days, consult a local agricultural extension officer.*`;
  }

  return `### 🌽 Maize Health Assistant

I'm here to help you diagnose and treat maize diseases. For the best analysis:

1. **Upload a clear photo** of the affected leaf or plant
2. **Describe what you see** — color changes, spots, wilting, etc.
3. **Mention any details** — when it started, weather conditions, etc.

I can identify diseases like Northern Leaf Blight, Gray Leaf Spot, Common Rust, Maize Streak Virus, and many more.

*How can I help you today?*`;
};

const Dashboard = () => {
  const { activeChat, createChat, addMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleSubmit = (text: string, image?: string) => {
    let chat = activeChat;
    if (!chat) chat = createChat();

    addMessage(chat.id, { role: "user", content: text, image });

    setTimeout(() => {
      addMessage(chat!.id, {
        role: "assistant",
        content: mockAIResponse(text, !!image),
      });
    }, 1200);
  };

  const messages = activeChat?.messages || [];

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Smart Maize Health Monitor</h2>
              <p className="text-muted-foreground max-w-md text-sm">
                Upload a photo of your maize plant and describe the symptoms. Our AI will diagnose diseases and recommend treatments.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 max-w-lg">
                {["🌿 \"My maize leaves have yellow spots\"", "📸 Upload a leaf photo", "🔍 \"What causes leaf curling?\""].map((hint) => (
                  <div key={hint} className="glass-card rounded-xl px-4 py-3 text-xs text-muted-foreground">
                    {hint}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto pt-4">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border/50 bg-background/80 backdrop-blur-lg py-4">
          <SmartInput onSubmit={handleSubmit} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
