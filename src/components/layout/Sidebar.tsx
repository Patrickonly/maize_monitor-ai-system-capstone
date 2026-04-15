import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, History, BarChart3, Settings,
  Plus, Pin, Trash2, PanelLeftClose, PanelLeft, Leaf
} from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: History, label: "Recent Chats", path: "/recent" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { chats, activeChat, setActiveChat, createChat } = useChat();

  const pinnedChats = chats.filter((c) => c.pinned);
  const recentChats = chats.filter((c) => !c.pinned).slice(0, 5);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ duration: 0.2 }}
      className="h-screen flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm text-sidebar-foreground truncate">
              Smart Maize
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground hover:text-foreground transition-colors">
          {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <button
          onClick={() => createChat()}
          className={cn(
            "w-full flex items-center gap-2 rounded-xl border border-dashed border-primary/40 text-primary hover:bg-accent transition-colors",
            collapsed ? "justify-center p-2" : "px-4 py-2.5"
          )}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span className="text-sm font-medium">New Analysis</span>}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Chat Lists */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-3 mt-4 space-y-4">
          {pinnedChats.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground px-3 mb-1 flex items-center gap-1">
                <Pin className="w-3 h-3" /> Pinned
              </p>
              {pinnedChats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} active={activeChat?.id === chat.id} onClick={() => setActiveChat(chat)} />
              ))}
            </div>
          )}
          {recentChats.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground px-3 mb-1">Recent</p>
              {recentChats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} active={activeChat?.id === chat.id} onClick={() => setActiveChat(chat)} />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.aside>
  );
};

const ChatItem = ({ chat, active, onClick }: { chat: any; active: boolean; onClick: () => void }) => {
  const { togglePin, deleteChat } = useChat();
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm group transition-colors",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-50" />
      <span className="truncate flex-1">{chat.title}</span>
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button onClick={(e) => { e.stopPropagation(); togglePin(chat.id); }} className="p-1 hover:text-primary">
          <Pin className="w-3 h-3" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className="p-1 hover:text-destructive">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </button>
  );
};
