import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setIsGuest } = useChat();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      const loggedInUser = await login(email, password);
      setIsGuest(false);
      toast({
        title: "Success",
        description: "Login successful! Welcome back.",
      });
      
      if (loggedInUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Login failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-card w-full max-w-sm rounded-3xl p-6">
        <div className="text-center mb-8">
          <img src="/maize-logo.svg" alt="Smart Maize Health Monitor logo" className="mx-auto mb-4 h-12 w-12 rounded-2xl border border-primary/25 bg-primary/10 p-1" />
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to Smart Maize Health Monitor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="farmer@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? Use the Create Account option from the home page.
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
