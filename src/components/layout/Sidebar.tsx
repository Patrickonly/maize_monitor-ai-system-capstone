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
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Chat, useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    History,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Pin,
    Plus,
    Settings,
    Trash2
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const userNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: History, label: "Recent Analyses", path: "/recent" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: "System Monitor", path: "/admin" },
  { icon: Settings, label: "System Settings", path: "/settings" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { chats, activeChat, setActiveChat, createChat, isGuest, loadChatMessages } = useChat();
  const { openLogin, openSignup } = useAuthModal();
  const { user, logout } = useAuth();

  const pinnedChats = chats.filter((c) => c.pinned);
  const recentChats = chats.filter((c) => !c.pinned).slice(0, 5);

  const handleCreateAnalysis = () => {
    createChat();
    navigate("/create-analysing");
    window.requestAnimationFrame(() => {
      document.getElementById("app-main-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleNavLinkClick = () => {
    window.requestAnimationFrame(() => {
      document.getElementById("app-main-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleChatSelect = async (chat: Chat) => {
    setActiveChat(chat);
    if (chat.backendId && chat.messages.length === 0) {
      await loadChatMessages(chat.id);
    }
    navigate("/create-analysing");
    handleNavLinkClick();
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ duration: 0.2 }}
      className="h-screen flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div
        className={cn(
          "flex border-b border-sidebar-border",
          collapsed ? "flex-col items-center gap-2 p-2" : "items-center gap-3 p-4"
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img
              src="/maize-logo.svg"
              alt="Smart Maize logo"
              className="h-8 w-8 rounded-lg border border-primary/25 bg-primary/10 p-1"
            />
            <span className="font-display font-bold text-sm text-sidebar-foreground truncate">
              Smart Maize
            </span>
          </div>
        )}
        {collapsed && (
          <img
            src="/maize-logo.svg"
            alt="Smart Maize logo"
            className="mx-auto h-8 w-8 rounded-lg border border-primary/25 bg-primary/10 p-1"
          />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-sidebar-border/70 bg-sidebar-accent/60 text-sidebar-foreground shadow-sm transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* New Chat */}
      {user?.role !== "admin" && (
        <div className="p-3">
          <button
            onClick={handleCreateAnalysis}
            title="New Analysis"
            aria-label="New Analysis"
            className={cn(
              "w-full flex items-center gap-2 rounded-xl border border-dashed border-primary/40 text-primary hover:bg-accent transition-colors",
              collapsed ? "justify-center p-2" : "px-4 py-2.5"
            )}
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span className="text-sm font-medium">New Analysis</span>}
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="px-3 space-y-1">
        {(user?.role === "admin" ? adminNavItems : userNavItems).map((item) => {
          const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavLinkClick}
              title={item.label}
              aria-label={item.label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <div className={cn("w-5 h-5 flex-shrink-0 flex items-center justify-center rounded", active ? "bg-primary/20 text-primary" : "")}>
                <item.icon className="w-4 h-4" />
              </div>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        
        {/* User Management for Admins */}
        {user?.role === "admin" && (
          <Link
            to="/admin/users"
            onClick={handleNavLinkClick}
            title="User Management"
            aria-label="User Management"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors mt-2",
              location.pathname.startsWith("/admin/users")
                ? "bg-primary/10 text-primary font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <div className={cn("w-5 h-5 flex-shrink-0 flex items-center justify-center rounded", location.pathname.startsWith("/admin/users") ? "bg-primary/20 text-primary" : "")}>
              <span className="font-bold text-xs">U</span>
            </div>
            {!collapsed && <span>User Management</span>}
          </Link>
        )}
      </nav>

      {/* Chat Lists */}
      {!collapsed && user?.role !== "admin" && (
        <div className="flex-1 overflow-y-auto px-3 mt-4 space-y-4">
          {pinnedChats.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground px-3 mb-1 flex items-center gap-1">
                <Pin className="w-3 h-3" /> Pinned
              </p>
              {pinnedChats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} active={activeChat?.id === chat.id} onClick={() => handleChatSelect(chat)} />
              ))}
            </div>
          )}
          {recentChats.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground px-3 mb-1">Recent</p>
              {recentChats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} active={activeChat?.id === chat.id} onClick={() => handleChatSelect(chat)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Spacer for admin since they don't have chat lists */}
      {user?.role === "admin" && <div className="flex-1"></div>}

      {/* Auth Section */}
      <div className="border-t border-sidebar-border p-3 mt-auto">
        {isGuest ? (
          <div className="space-y-2">
            <div className="space-y-2">
              <button
                onClick={openLogin}
                title="Sign In"
                aria-label="Sign In"
                className="w-full flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {!collapsed && "Sign In"}
                {collapsed && "→"}
              </button>
              <button
                onClick={openSignup}
                title="Create Account"
                aria-label="Create Account"
                className="w-full flex items-center justify-center rounded-lg border border-primary text-primary px-3 py-2 text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                {!collapsed && "Create Account"}
                {collapsed && "+"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {!collapsed && (
              <>
                <p className="text-xs text-muted-foreground px-2">Logged in as</p>
                <div className="flex flex-col px-2 mb-1">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mt-0.5">
                    {user?.role === "admin" ? "Admin" : "User"}
                  </p>
                </div>
              </>
            )}
            <button
              onClick={() => setConfirmSignOutOpen(true)}
              title="Sign Out"
              aria-label="Sign Out"
              className="w-full flex items-center gap-2 rounded-lg text-destructive hover:bg-destructive/10 px-3 py-2 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && "Sign Out"}
            </button>
            <AlertDialog open={confirmSignOutOpen} onOpenChange={setConfirmSignOutOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to sign in again to access your saved analyses.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmSignOutOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      logout();
                      setConfirmSignOutOpen(false);
                      navigate("/");
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

const ChatItem = ({ chat, active, onClick }: { chat: Chat; active: boolean; onClick: () => void }) => {
  const { togglePin, deleteChat, isGuest } = useChat();
  const { openLogin } = useAuthModal();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      // Show a notification to login
      alert("Sign in to save your analyses. Your guest data won't be saved on refresh.");
      openLogin();
      return;
    }
    togglePin(chat.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      alert("Sign in to permanently delete analyses. Your guest data won't be saved on refresh.");
      openLogin();
      return;
    }
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteChat(chat.id);
    setConfirmOpen(false);
  };

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
        <div
          role="button"
          tabIndex={0}
          onClick={handlePin}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePin(e as unknown as React.MouseEvent); }}
          className="p-1 hover:text-primary cursor-pointer"
          title={chat.pinned ? "Unpin analysis" : "Pin analysis"}
          aria-label={chat.pinned ? "Unpin analysis" : "Pin analysis"}
        >
          <Pin className="w-3 h-3" />
        </div>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <div
            role="button"
            tabIndex={0}
            onClick={handleDelete}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleDelete(e as unknown as React.MouseEvent); }}
            className="p-1 hover:text-destructive cursor-pointer"
            title="Delete analysis"
            aria-label="Delete analysis"
          >
            <Trash2 className="w-3 h-3" />
          </div>
          <AlertDialogContent onClick={(event) => event.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this analysis?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this analysis and all of its messages. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(event) => event.stopPropagation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.stopPropagation();
                  confirmDelete();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </button>
  );
};
