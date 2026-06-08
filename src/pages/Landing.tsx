import { useAuthModal } from "@/contexts/AuthModalContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Globe2,
  Leaf,
  MessageSquare,
  Moon,
  ShieldCheck,
  Smartphone,
  Star,
  Sun,
  Upload,
  Wifi,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const { openLogin, openSignup } = useAuthModal();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-border/50 bg-background/90 px-6 py-4 backdrop-blur md:px-12">
        <div className="flex items-center gap-2">
          <img src="/maize-logo.svg" alt="Smart Maize logo" className="h-9 w-9 rounded-xl border border-primary/25 bg-primary/10 p-1" />
          <span className="font-display font-bold text-lg">Smart Maize</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={openLogin} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </button>
          <button
            onClick={openSignup}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" /> Maize disease detection
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
            Protect Your Maize Crop
            <br />
            <span className="text-primary">With AI Intelligence</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Upload a photo of your maize plant, describe the symptoms, and get a clear analysis summary with practical next steps.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/create-analysing"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl text-base font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/25"
            >
              Start Analyzing <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={openLogin}
              className="bg-secondary text-secondary-foreground px-8 py-3 rounded-2xl text-base font-semibold hover:opacity-80 transition-opacity"
            >
              Log In
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Upload, title: "Smart Image Analysis", desc: "Upload affected maize leaves for a quick diagnosis summary" },
            { icon: MessageSquare, title: "Combined Input", desc: "Add symptoms with the image for clearer results" },
            { icon: BarChart3, title: "Detailed Reports", desc: "Review severity notes, guidance, and follow-up history" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/60 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-display text-2xl font-bold">How it works</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl bg-secondary/60 p-3"><strong className="text-foreground">1. Upload</strong> a clear image of the maize leaf.</div>
            <div className="rounded-xl bg-secondary/60 p-3"><strong className="text-foreground">2. Explain</strong> symptoms like spots, curling, or yellowing.</div>
            <div className="rounded-xl bg-secondary/60 p-3"><strong className="text-foreground">3. Review</strong> the likely issue and severity.</div>
            <div className="rounded-xl bg-secondary/60 p-3"><strong className="text-foreground">4. Act</strong> using the recommended next steps.</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-display text-2xl font-bold">Why farmers like it</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "Fast AI feedback for field decisions",
              "Green-focused and easy on the eyes UI",
              "Track analysis sessions and pin important cases",
              "Theme toggle and responsive mobile-friendly design",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
          {[
            { icon: ShieldCheck, label: "Secure & Private" },
            { icon: Clock3, label: "Instant Results" },
            { icon: Globe2, label: "Works Anywhere" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-sm">
              <t.icon className="w-4 h-4 text-primary" /> {t.label}
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <BadgeCheck className="h-3.5 w-3.5" /> Ready when you are
          </div>
          <h3 className="font-display text-2xl font-bold">Start your next maize diagnosis in seconds</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Create a new analysis, upload a crop image, and let the assistant guide your treatment decisions with confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <Link
              to="/create-analysing"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try as Guest <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={openSignup}
              className="inline-flex items-center gap-2 rounded-xl border border-primary bg-secondary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Create Account <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Android App Download Section */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 p-8 md:p-12"
        >
          {/* Background decorative blobs */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-16">
            {/* Left: Text & CTA */}
            <div className="flex-1 text-center md:text-left">
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                <Smartphone className="h-3.5 w-3.5" />
                Mobile App — Android
              </div>

              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Take Smart Maize
                <br />
                <span className="text-primary">Everywhere You Farm</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:max-w-md">
                Download the free Android app and diagnose maize diseases right from your field — no laptop needed. Snap a photo, get instant AI insights, offline-ready.
              </p>

              {/* Highlights */}
              <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
                {[
                  { icon: Zap, label: "Instant AI Diagnosis" },
                  { icon: Wifi, label: "Offline Support" },
                  { icon: Star, label: "Free to Download" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Download Button */}
              <a
                href="https://drive.google.com/file/d/1ApFr_KQ93vq69x-g0uGJS3-HOsmlzpHo/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                id="android-download-btn"
                className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-primary px-7 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 hover:opacity-95 active:scale-100"
              >
                {/* Android Robot SVG Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 shrink-0"
                >
                  <path d="M17.523 15.341A5 5 0 0 0 17 13H7a5 5 0 0 0-.523 2.341l-.946 1.892A1 1 0 0 0 6.427 19h11.146a1 1 0 0 0 .896-1.447zM8.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM6.341 8.184l-.97-1.94a.5.5 0 0 1 .894-.448l1.02 2.04A6.978 6.978 0 0 1 12 7c1.585 0 3.048.527 4.215 1.407l1.02-2.04a.5.5 0 1 1 .894.448l-.97 1.94A7 7 0 0 1 19 13H5a7 7 0 0 1 1.341-4.816z" />
                </svg>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-normal opacity-85">Download for</span>
                  <span className="text-base font-extrabold tracking-wide">Android</span>
                </div>
              </a>

              <p className="mt-3 text-xs text-muted-foreground">
                Compatible with Android 8.0 and above &middot; APK file &middot; Free
              </p>
            </div>

            {/* Right: Phone Mockup */}
            <div className="flex shrink-0 flex-col items-center gap-4">
              <div className="relative flex h-64 w-32 flex-col overflow-hidden rounded-[2.5rem] border-4 border-foreground/20 bg-foreground/5 shadow-2xl shadow-primary/20 md:h-72 md:w-36">
                {/* Status bar */}
                <div className="flex h-6 items-center justify-between bg-foreground/10 px-3">
                  <div className="h-1.5 w-8 rounded-full bg-foreground/20" />
                  <div className="h-2 w-2 rounded-full bg-foreground/30" />
                </div>
                {/* Screen content */}
                <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-gradient-to-b from-primary/10 to-emerald-500/10 px-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1 text-center">
                    <div className="h-2 w-20 rounded-full bg-foreground/20" />
                    <div className="h-1.5 w-14 rounded-full bg-foreground/10 mx-auto" />
                  </div>
                  <div className="mt-1 h-16 w-full rounded-xl bg-foreground/10" />
                  <div className="h-7 w-full rounded-xl bg-primary/30" />
                </div>
                {/* Home bar */}
                <div className="flex h-5 items-center justify-center bg-foreground/10">
                  <div className="h-1 w-10 rounded-full bg-foreground/30" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Available Now
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Smart Maize Health Monitor. All rights reserved.
      </footer>
    </div>
  );
};
export default Landing;