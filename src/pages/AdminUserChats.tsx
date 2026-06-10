import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/api";
import { ArrowLeft, MessageSquare, Pin, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface ChatSessionSummary {
  id: number;
  sessionName: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string | null;
}

const AdminUserChats = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    
    if (userId) {
      fetchSessions();
    }
  }, [user, userId, navigate]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUserSessions(Number(userId));
      if (res.success) {
        setSessions(res.sessions || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load user chat sessions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Admin Panel
            </Link>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" /> User Chat Sessions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Viewing history for user ID: {userId}</p>
          </div>
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary/50" />
            <p>Loading user sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No chat sessions found</p>
            <p className="mt-1">This user hasn't created any analyses yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div key={session.id} className="glass-card rounded-2xl p-5 hover:shadow-md transition-shadow border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                        {session.sessionName || "Untitled Analysis"}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl bg-secondary/50 p-3 mb-3 h-20 overflow-hidden relative">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {session.lastMessage ? session.lastMessage : "No messages in this session yet."}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-secondary/50 to-transparent pointer-events-none"></div>
                </div>
                
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border border-border/50">
                    <Pin className="w-3 h-3" /> {session.messageCount} Messages
                  </span>
                  <span>
                    Updated: {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminUserChats;
