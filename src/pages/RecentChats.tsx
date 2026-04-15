import { AppLayout } from "@/components/layout/AppLayout";
import { useChat } from "@/contexts/ChatContext";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Pin, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const RecentChats = () => {
  const { chats, setActiveChat, togglePin, deleteChat } = useChat();
  const navigate = useNavigate();

  const openChat = (chat: any) => {
    setActiveChat(chat);
    navigate("/dashboard");
  };

  const pinnedChats = chats.filter((c) => c.pinned);
  const otherChats = chats.filter((c) => !c.pinned);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const ChatList = ({ items, label }: { items: typeof chats; label: string }) =>
    items.length > 0 ? (
      <div className="mb-6">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1 flex items-center gap-1">
          {label === "Pinned" && <Pin className="w-3 h-3" />} {label}
        </h3>
        <div className="space-y-2">
          {items.map((chat) => (
            <button
              key={chat.id}
              onClick={() => openChat(chat)}
              className="w-full glass-card rounded-xl p-4 text-left hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{chat.title}</h4>
                    {chat.pinned && <Pin className="w-3 h-3 text-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {chat.messages[chat.messages.length - 1]?.content.slice(0, 80) || "No messages"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(chat.updatedAt)}
                    </span>
                    <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      {chat.messages.length} messages
                    </span>
                  </div>
                </div>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePin(chat.id); }}
                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="font-display text-2xl font-bold mb-6">Recent Chats</h1>
        <ChatList items={pinnedChats} label="Pinned" />
        <ChatList items={otherChats} label="All Chats" />
        {chats.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No conversations yet. Start a new analysis!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RecentChats;
