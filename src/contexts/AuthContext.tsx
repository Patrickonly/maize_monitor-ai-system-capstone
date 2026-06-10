import { authService } from "@/services/api";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface User {
  id: number;
  email: string;
  phone?: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isGuest: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, phone: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = authService.getToken();
    const savedUser = authService.getUser();
    if (token && savedUser) {
      setUser(savedUser);
      setIsLoggedIn(true);
      setIsGuest(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsLoggedIn(true);
      setIsGuest(false);
      return response.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, phone: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signup(email, phone, password, name);
      authService.logout();
      setUser(null);
      setIsLoggedIn(false);
      setIsGuest(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
    setIsGuest(true);
    setError(null);
  };

  const updateProfile = async (name: string, email: string) => {
    try {
      const res = await authService.updateProfile(name, email);
      if (res.user) setUser(res.user);
    } catch (err) {
      throw err;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(oldPassword, newPassword);
    } catch (err) {
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isGuest,
        user,
        isLoading,
        error,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
