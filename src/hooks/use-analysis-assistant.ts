import { useChat } from "@/contexts/ChatContext";
import { analysisService, authService, maizeApiService, MaizePredictResponse } from "@/services/api";
import { useEffect, useRef, useState } from "react";

const defaultFallbackResponse =
  "I am the Maize AI Assistant! I can help you with questions about maize diseases and treatments. Please feel free to ask or upload an image for diagnosis.";

const invalidMaizeImageMessage =
  "This is not a maize image. Use maize image only.";

const extractBase64Data = (value?: string) => {
  if (!value) return undefined;
  const commaIndex = value.indexOf(",");
  return commaIndex >= 0 ? value.slice(commaIndex + 1) : value;
};

const formatPredictResponse = (data: MaizePredictResponse): string => {
  if (data.type === "image") {
    if (data.valid_image === false) {
      return invalidMaizeImageMessage;
    }

    // Show only the report, ignore other metadata
    const report = data.report || data.answer || "Analysis completed, but no detailed report was returned.";
    return report;
  }

  return data.response || defaultFallbackResponse;
};

interface SubmitOptions {
  onSubmitted?: (chatId: string) => void;
  /** If provided, submitAnalysis will NOT create a new user message and will use this existing message id */
  existingUserMessageId?: string;
}

export const useAnalysisAssistant = () => {
  const { activeChat, createChat, addMessage, removeMessage, updateMessage, setChatBackendId } = useChat();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const timerRef = useRef<number | null>(null);
  const backendSessionByChatRef = useRef<Record<string, number>>({});

  const streamResponse = (chatId: string, messageId: string, content: string) => {
    let charIndex = 0;
    const streamInterval = window.setInterval(() => {
      charIndex++;
      const streamedContent = content.slice(0, charIndex);
      updateMessage(chatId, messageId, { content: streamedContent, isStreaming: charIndex < content.length });

      if (charIndex >= content.length) {
        window.clearInterval(streamInterval);
        updateMessage(chatId, messageId, { isStreaming: false });
      }
    }, 15); // 15ms per character for smooth typing effect
  };

  const getOrCreateBackendSession = async (
    chatId: string,
    existingBackendId?: number,
    sessionName?: string
  ) => {
    if (existingBackendId) {
      backendSessionByChatRef.current[chatId] = existingBackendId;
      return existingBackendId;
    }
    const existing = backendSessionByChatRef.current[chatId];
    if (existing) return existing;

    const created = await analysisService.createChatSession(sessionName);
    const sessionId: number | undefined = created?.chatSession?.id;

    if (!sessionId) {
      throw new Error("Failed to create backend analysis session");
    }

    backendSessionByChatRef.current[chatId] = sessionId;
    setChatBackendId(chatId, sessionId);
    return sessionId;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const submitAnalysis = (text: string, image?: string, options?: SubmitOptions) => {
    const trimmedText = text.trim();
    if (isAnalyzing || (!trimmedText && !image)) return false;

    let chat = activeChat;
    if (!chat) chat = createChat();

    // If an existingUserMessageId is provided, do not create a new user message (we're regenerating)
    const existingId = options?.existingUserMessageId;
    const createdUserMessage = existingId ? null : addMessage(chat.id, { role: "user", content: trimmedText, image });
    const userMessageId = existingId ?? createdUserMessage;
    options?.onSubmitted?.(chat.id);

    setIsAnalyzing(true);

    timerRef.current = window.setTimeout(async () => {
      const userMessage = trimmedText || "Image uploaded for analysis";
      const sessionName = trimmedText
        ? trimmedText.slice(0, 40)
        : image
          ? "Image analysis"
          : chat?.title;

      let assistantContent = defaultFallbackResponse;

      try {
        const prediction = await maizeApiService.predict({
          question: trimmedText || undefined,
          message: trimmedText || undefined,
          imageBase64: extractBase64Data(image),
        });
        if (image && prediction.type === "image" && prediction.valid_image === false) {
          // If we created the user message for this submission, remove it on invalid image
          if (!existingId && userMessageId) removeMessage(chat.id, userMessageId);
          assistantContent = invalidMaizeImageMessage;
        } else {
          assistantContent = formatPredictResponse(prediction);
        }
      } catch (predictError) {
        console.error("Prediction request failed:", predictError);

        if (image) {
          if (!existingId && userMessageId) removeMessage(chat.id, userMessageId);
          assistantContent = invalidMaizeImageMessage;
        }

        if (!image && trimmedText) {
          assistantContent = defaultFallbackResponse;
        }
      }

      if (assistantContent) {
        const assistantMessageId = addMessage(chat!.id, {
          role: "assistant",
          content: "",
          tone:
            assistantContent === invalidMaizeImageMessage ? "error" : "default",
          isStreaming: true,
        });

        streamResponse(chat!.id, assistantMessageId, assistantContent);
      }

      const token = authService.getToken();

      if (token) {
        try {
          const backendSessionId = await getOrCreateBackendSession(
            chat!.id,
            chat!.backendId,
            sessionName
          );

          await analysisService.sendMessage(
            backendSessionId,
            "user",
            userMessage,
            image
          );

          if (assistantContent) {
            await analysisService.sendMessage(
              backendSessionId,
              "assistant",
              assistantContent
            );
          }
        } catch (error) {
          console.error("Failed to persist analysis messages:", error);
        }
      }

      setIsAnalyzing(false);
    }, 0);

    return true;
  };

  return {
    isAnalyzing,
    submitAnalysis,
  };
};
