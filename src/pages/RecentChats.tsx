import { AppLayout } from "@/components/layout/AppLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Chat, useChat } from "@/contexts/ChatContext";
import { Clock, MessageSquare, Pin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RecentChats = () => {
  const { chats, setActiveChat, togglePin, deleteChat, createChat, isGuest, loadChatMessages } = useChat();
  const { openLogin } = useAuthModal();
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openChat = async (chat: Chat) => {
    setActiveChat(chat);
    if (chat.backendId && chat.messages.length === 0) {
      await loadChatMessages(chat.id);
    }
    navigate("/create-analysing");
  };

  const startNewAnalysis = () => {
    createChat();
    navigate("/create-analysing");
    window.requestAnimationFrame(() => {
      document.getElementById("app-main-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleTogglePin = (chatId: string) => {
    if (isGuest) {
      alert("Sign in to pin your analyses for quick access.");
      openLogin();
      return;
    }
    togglePin(chatId);
  };

  const requestDeleteChat = (chatId: string) => {
    if (isGuest) {
      alert("Sign in to permanently delete your analyses.");
      openLogin();
      return;
    }
    setConfirmDeleteId(chatId);
  };

  const confirmDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    setConfirmDeleteId(null);
  };

  const pinnedChats = chats.filter((c) => c.pinned);
  const otherChats = chats.filter((c) => !c.pinned);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    return date.toLocaleString();
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
                    {(chat.lastMessage || chat.messages[chat.messages.length - 1]?.content)?.slice(0, 80) || "No messages"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="text-[10px] text-muted-foreground flex items-center gap-1"
                      title={chat.updatedAt.toLocaleString()}
                    >
                      <Clock className="w-3 h-3" /> {formatTime(chat.updatedAt)}
                    </span>
                    <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      {chat.messageCount ?? chat.messages.length} messages
                    </span>
                  </div>
                </div>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTogglePin(chat.id); }}
                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                    title={chat.pinned ? "Unpin analysis" : "Pin analysis"}
                    aria-label={chat.pinned ? "Unpin analysis" : "Pin analysis"}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <AlertDialog
                    open={confirmDeleteId === chat.id}
                    onOpenChange={(open) => setConfirmDeleteId(open ? chat.id : null)}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); requestDeleteChat(chat.id); }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                      title="Delete analysis"
                      aria-label="Delete analysis"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this analysis?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{chat.title}" and all of its messages. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(event) => event.stopPropagation()}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(event) => {
                            event.stopPropagation();
                            confirmDeleteChat(chat.id);
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Sessions</p>
            <p className="mt-2 text-2xl font-bold">{chats.length}</p>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pinned</p>
            <p className="mt-2 text-2xl font-bold">{pinnedChats.length}</p>
          </div>
          <button
            onClick={startNewAnalysis}
            className="glass-card flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 p-4 text-sm font-semibold text-primary transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            Start New Analysis
          </button>
        </div>

        <ChatList items={pinnedChats} label="Pinned" />
        <ChatList items={otherChats} label="All Analyses" />
        {chats.length === 0 && (
          <div className="glass-card rounded-2xl py-16 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No sessions yet. Start a New Analysis to begin.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RecentChats;
