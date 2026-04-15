import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Camera, MessageSquare, BarChart3, ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">Smart Maize</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> AI-Powered Maize Disease Detection
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
            Protect Your Maize Crop
            <br />
            <span className="text-primary">With AI Intelligence</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Simply upload a photo of your maize plant and describe the symptoms. Our AI instantly identifies diseases, 
            assesses severity, and recommends treatments — all in one smart interface.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl text-base font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
            >
              Start Analyzing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="bg-secondary text-secondary-foreground px-8 py-3 rounded-2xl text-base font-semibold hover:opacity-80 transition-opacity"
            >
              Log In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Camera, title: "Smart Image Analysis", desc: "Upload or capture photos of affected maize leaves for instant AI diagnosis" },
            { icon: MessageSquare, title: "Combined Input", desc: "Describe symptoms alongside images for more accurate disease identification" },
            { icon: BarChart3, title: "Detailed Reports", desc: "Get severity assessments, treatment plans, and track your crop health over time" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
          {[
            { icon: Shield, label: "Secure & Private" },
            { icon: Zap, label: "Instant Results" },
            { icon: Globe, label: "Works Anywhere" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-sm">
              <t.icon className="w-4 h-4 text-primary" /> {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Smart Maize Health Monitor. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
