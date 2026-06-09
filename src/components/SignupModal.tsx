import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal = ({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { setIsGuest } = useChat();
  const { toast } = useToast();
  const redirectDelayMs = 1500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      const msg = "Please fill in all fields";
      setError(msg);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match";
      setError(msg);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters";
      setError(msg);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, phone, password, username);
      setIsGuest(true);
      toast({
        title: "Success",
        description: "Account created successfully! Please sign in to continue.",
        variant: "default",
      });
      window.setTimeout(() => {
        onClose();
        onSwitchToLogin();
        navigate("/");
      }, redirectDelayMs);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Signup failed. Please try again.";
      setError(msg);
      toast({
        title: "Signup Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-sm rounded-3xl p-6 relative animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close signup modal"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors sticky"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <img src="/maize-logo.svg" alt="Smart Maize logo" className="mx-auto mb-4 h-12 w-12 rounded-2xl border border-primary/25 bg-primary/10 p-1" />
          <h1 className="font-display text-2xl font-bold">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start protecting your maize crops with confidence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="John Farmer"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
              <label className="text-sm font-medium mb-1.5 block">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="+1234567890"
                required
              />
            </div>
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

          <div>
            <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
};
