import { AppLayout } from "@/components/layout/AppLayout";
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const stats = [
  { label: "Total Analyses", value: "24", icon: BarChart3, change: "+12%" },
  { label: "Diseases Found", value: "8", icon: AlertTriangle, change: "+3" },
  { label: "Healthy Scans", value: "16", icon: CheckCircle, change: "67%" },
  { label: "Accuracy Rate", value: "94%", icon: TrendingUp, change: "+2%" },
];

const diseases = [
  { name: "Northern Leaf Blight", count: 4, severity: "high" },
  { name: "Gray Leaf Spot", count: 2, severity: "medium" },
  { name: "Common Rust", count: 1, severity: "low" },
  { name: "Maize Streak Virus", count: 1, severity: "high" },
];

const Reports = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="font-display text-2xl font-bold mb-6">Reports & Analytics</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">{s.change}</span>
              </div>
              <p className="font-display text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Disease Breakdown */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Disease Breakdown</h2>
          <div className="space-y-4">
            {diseases.map((d) => (
              <div key={d.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{d.name}</span>
                    <span className="text-xs text-muted-foreground">{d.count} cases</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(d.count / 4) * 100}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    d.severity === "high"
                      ? "bg-destructive/10 text-destructive"
                      : d.severity === "medium"
                      ? "bg-warning/10 text-warning"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {d.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
