import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useChat } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Bell, Check, Eye, EyeOff, Moon, Palette, Shield, Sun, User, X } from "lucide-react";
import { useEffect, useState } from "react";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { isGuest } = useChat();
  const { openLogin } = useAuthModal();
  const { user, updateProfile, changePassword } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
  }, [user]);

  const handleProfileSave = () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      setProfileMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    updateProfile(profileName, profileEmail);
    setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    setEditingProfile(false);
    setTimeout(() => setProfileMessage(null), 3000);
  };

  const handlePasswordChange = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill in all password fields" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    const success = changePassword(oldPassword, newPassword);
    if (success) {
      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
      setTimeout(() => setPasswordMessage(null), 3000);
    } else {
      setPasswordMessage({ type: "error", text: "Invalid old password" });
    }
  };

  return (
    <AppLayout>
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Palette className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Appearance</h3>
                <p className="text-xs text-muted-foreground">Switch between light and dark workspace modes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => theme === "dark" && toggleTheme()}
                className={`flex-1 rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                onClick={() => theme === "light" && toggleTheme()}
                className={`flex-1 rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <User className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Profile</h3>
                <p className="text-xs text-muted-foreground">Manage your account details</p>
              </div>
              {isGuest ? (
                <button onClick={openLogin} className="text-xs font-medium text-primary hover:underline">
                  Sign in
                </button>
              ) : !editingProfile ? (
                <button onClick={() => setEditingProfile(true)} className="text-xs font-medium text-primary hover:underline">
                  Edit
                </button>
              ) : null}
            </div>

            {isGuest ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Your profile details are available after signing in.</p>
              </div>
            ) : editingProfile ? (
              <div className="space-y-3">
                {profileMessage && (
                  <div
                    className={`rounded-lg px-3 py-2 text-xs ${
                      profileMessage.type === "success"
                        ? "bg-green-500/20 text-green-700 dark:text-green-300"
                        : "bg-red-500/20 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleProfileSave}
                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" /> Save
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileName(user?.name || "");
                      setProfileEmail(user?.email || "");
                    }}
                    className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <X className="h-4 w-4" /> Cancel
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-medium">{user?.email}</span>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Bell className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Notifications</h3>
                <p className="text-xs text-muted-foreground">Configure alert preferences</p>
              </div>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Shield className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Privacy & Security</h3>
                <p className="text-xs text-muted-foreground">Change your password</p>
              </div>
              {isGuest ? (
                <button onClick={openLogin} className="text-xs font-medium text-primary hover:underline">
                  Sign in
                </button>
              ) : !changingPassword ? (
                <button onClick={() => setChangingPassword(true)} className="text-xs font-medium text-primary hover:underline">
                  Change Password
                </button>
              ) : null}
            </div>

            {isGuest ? (
              <div className="text-sm text-muted-foreground">Password changes are available after signing in.</div>
            ) : changingPassword ? (
              <div className="space-y-3">
                {passwordMessage && (
                  <div
                    className={`rounded-lg px-3 py-2 text-xs ${
                      passwordMessage.type === "success"
                        ? "bg-green-500/20 text-green-700 dark:text-green-300"
                        : "bg-red-500/20 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.old ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handlePasswordChange}
                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" /> Update Password
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setChangingPassword(false);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordMessage(null);
                    }}
                    className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <X className="h-4 w-4" /> Cancel
                    </span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </AppLayout>
  );
};

export default SettingsPage;
