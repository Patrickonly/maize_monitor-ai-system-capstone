import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export const LoginModal = ({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);
      setIsGuest(false);
      toast({
        title: "Success",
        description: "Login successful! Welcome back.",
        variant: "default",
      });
      onClose();
      
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
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-sm rounded-3xl p-6 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          aria-label="Close login modal"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

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
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <button type="button" onClick={onSwitchToSignup} className="text-primary font-medium hover:underline">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};
