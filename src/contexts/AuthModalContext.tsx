import { LoginModal } from "@/components/LoginModal";
import { SignupModal } from "@/components/SignupModal";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface AuthModalContextType {
  activeModal: "login" | "signup" | null;
  openLogin: () => void;
  openSignup: () => void;
  closeAuthModal: () => void;
  switchToLogin: () => void;
  switchToSignup: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({} as AuthModalContextType);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<"login" | "signup" | null>(null);

  const value = useMemo<AuthModalContextType>(
    () => ({
      activeModal,
      openLogin: () => setActiveModal("login"),
      openSignup: () => setActiveModal("signup"),
      closeAuthModal: () => setActiveModal(null),
      switchToLogin: () => setActiveModal("login"),
      switchToSignup: () => setActiveModal("signup"),
    }),
    [activeModal]
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
};

export const useAuthModal = () => useContext(AuthModalContext);

export const AuthModals = () => {
  const { activeModal, closeAuthModal, switchToLogin, switchToSignup } = useAuthModal();

  return (
    <>
      <LoginModal isOpen={activeModal === "login"} onClose={closeAuthModal} onSwitchToSignup={switchToSignup} />
      <SignupModal isOpen={activeModal === "signup"} onClose={closeAuthModal} onSwitchToLogin={switchToLogin} />
    </>
  );
};