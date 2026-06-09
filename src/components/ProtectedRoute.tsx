import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useChat } from "@/contexts/ChatContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAuth();
  const { isGuest } = useChat();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    if (isGuest || !isLoggedIn) {
      openLogin();
      navigate("/", { replace: true });
    }
  }, [isGuest, isLoggedIn, navigate, openLogin]);

  if (isGuest || !isLoggedIn) {
    return null;
  }

  return <>{children}</>;
};
