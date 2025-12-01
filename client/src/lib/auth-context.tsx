import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  photo?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string) => Promise<void>;
  signup: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  checkEmailExists: (email: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user session exists in sessionStorage
    const stored = sessionStorage.getItem("formflow_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const signup = async (email: string) => {
    try {
      setAuthError(null);
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status === 409) {
        const error = await response.json();
        setAuthError(error.error || "Email already registered");
        return;
      }

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      const newUser = await response.json();
      sessionStorage.setItem("formflow_user", JSON.stringify(newUser));
      setUser(newUser);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      setAuthError("Signup failed. Please try again.");
    }
  };

  const login = async (email: string) => {
    try {
      setAuthError(null);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const user = await response.json();
      sessionStorage.setItem("formflow_user", JSON.stringify(user));
      setUser(user);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Login failed. Please try again.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("formflow_user");
    setUser(null);
    setLocation("/auth");
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updated = await response.json();
      sessionStorage.setItem("formflow_user", JSON.stringify(updated));
      setUser(updated);
    } catch (error) {
      console.error("Update user error:", error);
      setAuthError("Failed to update profile");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isLoading, authError, clearAuthError: () => setAuthError(null), checkEmailExists }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
