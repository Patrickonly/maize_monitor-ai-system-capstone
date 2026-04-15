import { createContext, useContext, useState, ReactNode } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
  tag?: string;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  createChat: () => Chat;
  addMessage: (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => void;
  togglePin: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const createChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: "New Analysis",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
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
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const updated = {
          ...c,
          messages: [...c.messages, newMsg],
          updatedAt: new Date(),
          title: c.messages.length === 0 && message.role === "user"
            ? message.content.slice(0, 40) || "Image Analysis"
            : c.title,
        };
        if (activeChat?.id === chatId) setActiveChat(updated);
        return updated;
      })
    );
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

  return (
    <ChatContext.Provider value={{ chats, activeChat, setActiveChat, createChat, addMessage, togglePin, deleteChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
