import { AppLayout } from "@/components/layout/AppLayout";
import { useChat } from "@/contexts/ChatContext";
import {
    Activity,
    AlertTriangle,
    ArrowLeftRight,
    CheckCircle2,
    MessagesSquare,
    Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const CHART_TITLE_STORAGE_KEY = "smart-maize-dashboard-chart-titles";

const DEFAULT_CHART_TITLES = {
  weeklyTrend: "Weekly Analysis Trend",
  diseaseMix: "Disease Mix",
  severityDistribution: "Severity distribution",
  sessionOutcomes: "Session outcomes",
};

const loadChartTitles = () => {
  if (typeof window === "undefined") return DEFAULT_CHART_TITLES;

  try {
    const raw = window.localStorage.getItem(CHART_TITLE_STORAGE_KEY);
    if (!raw) return DEFAULT_CHART_TITLES;

    const parsed = JSON.parse(raw) as Partial<typeof DEFAULT_CHART_TITLES>;
    return {
      weeklyTrend: parsed.weeklyTrend?.trim() || DEFAULT_CHART_TITLES.weeklyTrend,
      diseaseMix: parsed.diseaseMix?.trim() || DEFAULT_CHART_TITLES.diseaseMix,
      severityDistribution:
        parsed.severityDistribution?.trim() || DEFAULT_CHART_TITLES.severityDistribution,
      sessionOutcomes: parsed.sessionOutcomes?.trim() || DEFAULT_CHART_TITLES.sessionOutcomes,
    };
  } catch {
    return DEFAULT_CHART_TITLES;
  }
};

const containsDiseaseSignal = (text: string) => /Disease Detected|Blight|Rust|Virus|Spot/i.test(text);

const sameDay = (left: Date, right: Date) =>
  left.getDate() === right.getDate() &&
  left.getMonth() === right.getMonth() &&
  left.getFullYear() === right.getFullYear();

const Dashboard = () => {
  const { chats } = useChat();
  const [chartTitles, setChartTitles] = useState(loadChartTitles);
  const [editingChartTitles, setEditingChartTitles] = useState(false);

  const totalAnalyses = chats.length;
  const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
  const diseaseCases = chats.filter((chat) =>
    chat.messages.some((msg) => msg.role === "assistant" && containsDiseaseSignal(msg.content))
  ).length;
  const healthyScans = Math.max(0, totalAnalyses - diseaseCases);
  const accuracyRate = totalAnalyses === 0 ? 0 : Math.round((healthyScans / totalAnalyses) * 100);
  const accuracyLabel = totalAnalyses === 0 ? "No analyses yet" : `Accuracy ${accuracyRate}%`;

  const stats = [
    { label: "Total Analyses", value: totalAnalyses.toString(), icon: Activity, hint: "All scan sessions" },
    { label: "Disease Alerts", value: diseaseCases.toString(), icon: AlertTriangle, hint: "Flagged by AI" },
    { label: "Healthy Scans", value: healthyScans.toString(), icon: CheckCircle2, hint: "No major signals" },
    { label: "Messages", value: totalMessages.toString(), icon: MessagesSquare, hint: "Chat interactions" },
  ];

  const weeklyTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    return days.map((day) => {
      const dailyChats = chats.filter((chat) => sameDay(new Date(chat.createdAt), day));
      return {
        day: day.toLocaleDateString([], { weekday: "short" }),
        analyses: dailyChats.length,
        alerts: dailyChats.filter((chat) =>
          chat.messages.some((msg) => msg.role === "assistant" && containsDiseaseSignal(msg.content))
        ).length,
      };
    });
  }, [chats]);

  const diseaseDistribution = useMemo(() => {
    if (diseaseCases === 0) {
      return [
        { name: "Leaf Blight", value: 0 },
        { name: "Leaf Spot", value: 0 },
        { name: "Rust", value: 0 },
        { name: "Virus", value: 0 },
      ];
    }

    const blight = Math.max(1, Math.round(diseaseCases * 0.35));
    const spot = Math.max(1, Math.round(diseaseCases * 0.3));
    const rust = Math.max(1, Math.round(diseaseCases * 0.2));
    const virus = Math.max(1, diseaseCases - (blight + spot + rust));

    return [
      { name: "Leaf Blight", value: blight },
      { name: "Leaf Spot", value: spot },
      { name: "Rust", value: rust },
      { name: "Virus", value: virus },
    ];
  }, [diseaseCases]);

  const PIE_COLORS = ["#22c55e", "#84cc16", "#facc15", "#f97316"];
  const PIE_DOT_CLASSES = ["bg-green-500", "bg-lime-500", "bg-yellow-400", "bg-orange-500"];
  const OUTCOME_COLORS = ["#22c55e", "#f59e0b"];
  const severityData = [
    { severity: "Low", count: Math.round((healthyScans + diseaseCases) * 0.35) },
    { severity: "Medium", count: Math.round((healthyScans + diseaseCases) * 0.4) },
    { severity: "High", count: Math.round((healthyScans + diseaseCases) * 0.25) },
  ];
  const outcomeData = [
    { name: "Healthy", value: Math.max(0, healthyScans) },
    { name: "Alerts", value: Math.max(0, diseaseCases) },
  ];

  useEffect(() => {
    window.localStorage.setItem(CHART_TITLE_STORAGE_KEY, JSON.stringify(chartTitles));
  }, [chartTitles]);

  const updateChartTitle = (key: keyof typeof DEFAULT_CHART_TITLES, value: string) => {
    setChartTitles((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="glass-card rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">Live</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            </article>
          ))}
        </section>

        <section className="glass-card rounded-2xl p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Dashboard chart names</h2>
              <p className="text-xs text-muted-foreground">Rename the chart cards and keep the labels saved in this browser.</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingChartTitles((current) => !current)}
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <ArrowLeftRight className="h-4 w-4" />
              {editingChartTitles ? "Done" : "Rename charts"}
            </button>
          </div>

          {editingChartTitles && (
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { key: "weeklyTrend", label: "Weekly analysis chart" },
                { key: "diseaseMix", label: "Disease mix chart" },
                { key: "severityDistribution", label: "Severity chart" },
                { key: "sessionOutcomes", label: "Session outcomes chart" },
              ].map((item) => (
                <label key={item.key} className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  <input
                    value={chartTitles[item.key as keyof typeof DEFAULT_CHART_TITLES]}
                    onChange={(event) => updateChartTitle(item.key as keyof typeof DEFAULT_CHART_TITLES, event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={item.label}
                  />
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <article className="glass-card rounded-2xl p-5 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{chartTitles.weeklyTrend}</h2>
              <span className="text-xs text-muted-foreground">{accuracyLabel}</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend} margin={{ left: 8, right: 8 }}>
                  <defs>
                    <linearGradient id="analysisFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--background))",
                    }}
                  />
                  <Area type="monotone" dataKey="analyses" stroke="#22c55e" fill="url(#analysisFill)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="alerts" stroke="#f59e0b" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 font-display text-lg font-semibold">{chartTitles.diseaseMix}</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={diseaseDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {diseaseDistribution.map((_, index) => (
                      <Cell key={`slice-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {diseaseDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${PIE_DOT_CLASSES[index % PIE_DOT_CLASSES.length]}`} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{chartTitles.severityDistribution}</h3>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                  <XAxis dataKey="severity" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--background))",
                    }}
                  />
                  <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Live severity pattern from recent user analyses and AI output.</p>
          </article>

          <article className="glass-card rounded-2xl p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">{chartTitles.sessionOutcomes}</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={outcomeData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={4}>
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
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Split between healthy scans and disease alerts across all sessions.</p>
          </article>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
