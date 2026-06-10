import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Settings } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure global application parameters</p>
        </div>

        <section className="glass-card rounded-2xl overflow-hidden p-8 text-center text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <h2 className="text-lg font-medium text-foreground mb-2">Global Settings Coming Soon</h2>
          <p className="text-sm max-w-md mx-auto">
            This module will allow you to configure global AI model parameters, database backup schedules, and global alert thresholds.
          </p>
        </section>
      </div>
    </AppLayout>
  );
};

export default AdminSettings;
