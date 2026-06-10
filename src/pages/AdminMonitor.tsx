import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/api";
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

interface SystemStats {
  totalAnalyses: number;
  diseaseAlerts: number;
  healthyScans: number;
  totalActiveUsers: number;
  diseaseBreakdown: {
    blight: number;
    spot: number;
    rust: number;
    virus: number;
  };
}

const AdminMonitor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    } else {
      fetchStats();
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSystemMonitorStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load system monitor stats");
    } finally {
      setLoading(false);
    }
  };

  const diseaseDistribution = stats ? [
    { name: "Leaf Blight", value: stats.diseaseBreakdown.blight },
    { name: "Leaf Spot", value: stats.diseaseBreakdown.spot },
    { name: "Rust", value: stats.diseaseBreakdown.rust },
    { name: "Virus/Other", value: stats.diseaseBreakdown.virus },
  ].filter(d => d.value > 0) : [];

  const outcomeData = stats ? [
    { name: "Healthy", value: stats.healthyScans },
    { name: "Disease/Risk", value: stats.diseaseAlerts },
  ] : [];

  const PIE_COLORS = ["#facc15", "#84cc16", "#f97316", "#ef4444"];
  const PIE_DOT_CLASSES = ["bg-yellow-400", "bg-lime-500", "bg-orange-500", "bg-red-500"];
  const OUTCOME_COLORS = ["#22c55e", "#f59e0b"];

  const statCards = [
    { label: "Active Users", value: stats?.totalActiveUsers || 0, icon: Users, hint: "System-wide farmers" },
    { label: "Total Scans", value: stats?.totalAnalyses || 0, icon: Activity, hint: "All platform analyses" },
    { label: "Healthy Crops", value: stats?.healthyScans || 0, icon: CheckCircle2, hint: "No major diseases found" },
    { label: "Disease Risks", value: stats?.diseaseAlerts || 0, icon: AlertTriangle, hint: "AI flagged anomalies" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">System Monitor</h1>
            <p className="text-sm text-muted-foreground mt-1">Global overview of crop health and risks</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Top Metric Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat, i) => (
            <article key={stat.label} className="glass-card rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                  i === 0 ? "bg-blue-500/10 text-blue-500" :
                  i === 1 ? "bg-purple-500/10 text-purple-500" :
                  i === 2 ? "bg-emerald-500/10 text-emerald-500" :
                  "bg-amber-500/10 text-amber-500"
                }`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">Live</span>
              </div>
              <p className="text-3xl font-bold">{loading ? "-" : stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            </article>
          ))}
        </section>

        {/* Charts Section */}
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Healthy vs Disease Split */}
          <article className="glass-card rounded-2xl p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">Global Health Outcomes</h3>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : outcomeData.every(d => d.value === 0) ? (
                 <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={outcomeData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                      {outcomeData.map((_, index) => (
                        <Cell key={`outcome-slice-${index}`} fill={OUTCOME_COLORS[index % OUTCOME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--background))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 text-sm mt-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Healthy Scans</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Disease/Risks</span>
              </div>
            </div>
          </article>

          {/* Disease Breakdown */}
          <article className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 font-display text-lg font-semibold">Disease Problem Breakdown</h2>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : diseaseDistribution.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-muted-foreground">No diseases detected yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diseaseDistribution} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--background))",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {diseaseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
        </section>
      </div>
    </AppLayout>
  );
};

export default AdminMonitor;
