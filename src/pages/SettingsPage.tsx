import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, User, Bell, Shield, Palette } from "lucide-react";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="font-display text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-4">
          {/* Theme */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Palette className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Appearance</h3>
                <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => theme === "dark" && toggleTheme()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  theme === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button
                onClick={() => theme === "light" && toggleTheme()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  theme === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
            </div>
          </div>

          {/* Profile */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <User className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">Profile</h3>
                <p className="text-xs text-muted-foreground">Manage your account details</p>
              </div>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">Notifications</h3>
                <p className="text-xs text-muted-foreground">Configure alert preferences</p>
              </div>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </div>
          </div>

          {/* Privacy */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">Privacy & Security</h3>
                <p className="text-xs text-muted-foreground">Data and security settings</p>
              </div>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
