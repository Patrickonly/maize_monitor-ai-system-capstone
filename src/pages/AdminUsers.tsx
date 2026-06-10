import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/api";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: number | boolean;
  created_at: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, currentRole: string) => {
    if (userId === user?.id) {
      toast.error("You cannot change your own role");
      return;
    }
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Are you sure you want to make this user an ${newRole}?`)) return;

    try {
      setProcessingId(userId);
      await adminService.updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (userId === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (!window.confirm("Are you sure you want to deactivate/delete this user? They will not be able to log in anymore.")) return;

    try {
      setProcessingId(userId);
      await adminService.deactivateUser(userId);
      toast.success("User successfully deactivated");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate user");
    } finally {
      setProcessingId(null);
    }
  };

  const activeUsers = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => u.role === "admin" && u.is_active).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Admin System</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage users and oversee global chat history</p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary">
            <div className="mb-2 flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">Total Users (including deactivated)</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500">
            <div className="mb-2 flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{activeUsers}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">Active Accounts</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500">
            <div className="mb-2 flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{adminCount}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">Administrators</p>
          </div>
        </section>

        {/* User Table */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" /> User Management
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">User</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Joined</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 opacity-50" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-secondary text-secondary-foreground'}`}>
                          {u.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : null}
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center text-xs text-emerald-500 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-destructive font-medium">
                            <span className="w-2 h-2 rounded-full bg-destructive mr-2"></span> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${u.id}/chats`)}
                            className="flex items-center gap-1 rounded bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                          >
                            Chats <ArrowRight className="h-3 w-3" />
                          </button>
                          {u.is_active && u.id !== user?.id && (
                            <button
                              disabled={processingId === u.id}
                              onClick={() => handleRoleChange(u.id, u.role)}
                              className="rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                            >
                              Toggle Role
                            </button>
                          )}
                          {u.is_active && u.id !== user?.id && (
                            <button
                              disabled={processingId === u.id}
                              onClick={() => handleDeactivate(u.id)}
                              className="flex items-center rounded bg-destructive/10 px-2 py-1.5 text-destructive hover:bg-destructive/20 disabled:opacity-50"
                              title="Deactivate/Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default AdminUsers;
