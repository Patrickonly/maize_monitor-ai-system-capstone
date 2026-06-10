import { useAuth } from "@/contexts/AuthContext";
import { analysisService } from "@/services/api";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  tone?: "default" | "error";
  isStreaming?: boolean;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  backendId?: number;
  lastMessage?: string;
  messageCount?: number;
  pinned?: boolean;
  tag?: string;
  isSaved?: boolean;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isGuest: boolean;
  setActiveChat: (chat: Chat | null) => void;
  createChat: () => Chat;
  addMessage: (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => string;
  removeMessage: (chatId: string, messageId: string) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  togglePin: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  setIsGuest: (isGuest: boolean) => void;
  setChatBackendId: (chatId: string, backendId: number) => void;
  loadChatMessages: (chatId: string) => Promise<void>;
  refreshChats: () => Promise<void>;
  renameChat: (chatId: string, newTitle: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  const normalizeBackendDate = (value?: string) =>
    value ? new Date(value) : new Date();

  const refreshChats = async () => {
    if (!isLoggedIn) return;

    try {
      const data = await analysisService.getChatSessions();
      const sessions = (data?.sessions || []) as Array<{
        id: number;
        sessionName: string | null;
        createdAt: string;
        updatedAt: string;
        messageCount: number;
        lastMessage: string | null;
      }>;

      const normalized = sessions.map((session) => {
        const createdAt = normalizeBackendDate(session.createdAt);
        const updatedAt = normalizeBackendDate(session.updatedAt || session.createdAt);
        return {
          id: `session-${session.id}`,
          backendId: session.id,
          title: session.sessionName || `Analysis ${createdAt.toLocaleDateString()}`,
          messages: [],
          createdAt,
          updatedAt,
          messageCount: session.messageCount ?? 0,
          lastMessage: session.lastMessage || undefined,
        } satisfies Chat;
      });

      setChats(normalized);
      setActiveChat((current) => {
        if (!current) return normalized[0] || null;
        const match = normalized.find((chat) => chat.backendId === current.backendId);
        return match || current;
      });
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshChats();
      return;
    }

    setChats([]);
    setActiveChat(null);
  }, [isLoggedIn]);

  useEffect(() => {
    setIsGuest(!isLoggedIn);
  }, [isLoggedIn]);

  const createChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: "New Analysis",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
    return newChat;
  };

  const addMessage = (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setChats((prev) => {
      const updatedChats = prev.map((c) => {
        if (c.id !== chatId) return c;
        const trimmedText = message.content.trim();
        const firstTypedText = trimmedText.slice(0, 40);
        const fallbackTitle = message.image ? "Image analysis" : c.title;
        const resolvedTitle = firstTypedText || fallbackTitle;
        const resolvedLastMessage = trimmedText || (message.image ? "Image uploaded for analysis" : "");
        const updatedMessages = [...c.messages, newMsg];
        const updated = {
          ...c,
          messages: updatedMessages,
          updatedAt: new Date(),
          messageCount: updatedMessages.length,
          lastMessage: resolvedLastMessage,
          title:
            c.messages.length === 0 && message.role === "user"
              ? resolvedTitle
              : c.title,
        };
        if (activeChat?.id === chatId || !activeChat) setActiveChat(updated);
        return updated;
      });

      const targetChat = updatedChats.find((c) => c.id === chatId);
      if (!targetChat) return updatedChats;

      return [targetChat, ...updatedChats.filter((c) => c.id !== chatId)];
    });

    return newMsg.id;
  };

  const removeMessage = (chatId: string, messageId: string) => {
    setChats((prev) => {
      const updatedChats = prev.map((chat) => {
        if (chat.id !== chatId) return chat;

        const updatedMessages = chat.messages.filter((message) => message.id !== messageId);
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        const updated = {
          ...chat,
          messages: updatedMessages,
          updatedAt: new Date(),
          messageCount: updatedMessages.length,
          lastMessage: lastMessage?.content,
        };

        if (activeChat?.id === chatId) setActiveChat(updated);
        return updated;
      });

      const targetChat = updatedChats.find((chat) => chat.id === chatId);
      if (!targetChat) return updatedChats;

      return [targetChat, ...updatedChats.filter((chat) => chat.id !== chatId)];
    });
  };

  const togglePin = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChat?.id === chatId) setActiveChat(null);
  };

  const setChatBackendId = (chatId: string, backendId: number) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, backendId }
          : chat
      )
    );
    setActiveChat((current) =>
      current?.id === chatId
        ? { ...current, backendId }
        : current
    );
  };

  const updateMessage = (chatId: string, messageId: string, updates: Partial<ChatMessage>) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        };
      })
    );
    setActiveChat((current) => {
      if (current?.id !== chatId) return current;
      return {
        ...current,
        messages: current.messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      };
    });
  };

  const loadChatMessages = async (chatId: string) => {
    const target = chats.find((chat) => chat.id === chatId);
    if (!target?.backendId) return;

    try {
      const data = await analysisService.getChatMessages(target.backendId);
      const messages = (data?.messages || []) as Array<{
        id: number;
        role: "user" | "assistant";
        content: string;
        imageUrl?: string | null;
        createdAt: string;
      }>;

      const normalized = messages.map((msg) => ({
        id: String(msg.id),
        role: msg.role,
        content: msg.content,
        image: msg.imageUrl || undefined,
        timestamp: normalizeBackendDate(msg.createdAt),
      }));

      const lastMessage = normalized[normalized.length - 1];
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: normalized,
                messageCount: normalized.length,
                lastMessage: lastMessage?.content || chat.lastMessage,
                updatedAt: lastMessage?.timestamp || chat.updatedAt,
              }
            : chat
        )
      );

      setActiveChat((current) =>
        current?.id === chatId
          ? {
              ...current,
              messages: normalized,
              messageCount: normalized.length,
              lastMessage: lastMessage?.content || current.lastMessage,
              updatedAt: lastMessage?.timestamp || current.updatedAt,
            }
          : current
      );
    } catch (error) {
      console.error("Failed to load chat messages:", error);
    }
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    const target = chats.find((c) => c.id === chatId);
    if (!target) return;

    // Optimistic update
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c)));
    setActiveChat((current) => (current?.id === chatId ? { ...current, title: newTitle } : current));

    if (target.backendId) {
      try {
        await analysisService.renameChatSession(target.backendId, newTitle);
      } catch (error) {
        console.error("Failed to rename chat on backend:", error);
        // Revert on failure
        setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title: target.title } : c)));
        setActiveChat((current) => (current?.id === chatId ? { ...current, title: target.title } : current));
      }
    }
  };

  return (
    <ChatContext.Provider value={{ chats, activeChat, isGuest, setActiveChat, createChat, addMessage, removeMessage, updateMessage, togglePin, deleteChat, setIsGuest, setChatBackendId, loadChatMessages, refreshChats, renameChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
