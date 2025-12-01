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
    // Check local storage for session token
    const token = localStorage.getItem("formflow_token");
    const stored = localStorage.getItem("formflow_user");
    if (token && stored) {
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

  const login = async (email: string) => {
    setAuthError(null);
    try {
      // Try to login first (check if user exists)
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!loginRes.ok) {
        // User doesn't exist, sign up
        const signupRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (signupRes.status === 409) {
          const error = await signupRes.json();
          setAuthError(error.error || "Email already registered");
          return;
        }

        if (!signupRes.ok) {
          throw new Error("Signup failed");
        }

        const newUser = await signupRes.json();
        localStorage.setItem("formflow_token", newUser.id);
        localStorage.setItem("formflow_user", JSON.stringify(newUser));
        setUser(newUser);
        setLocation("/dashboard");
      } else {
        // Login successful
        const user = await loginRes.json();
        localStorage.setItem("formflow_token", user.id);
        localStorage.setItem("formflow_user", JSON.stringify(user));
        setUser(user);
        setLocation("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError("Authentication failed. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("formflow_token");
    localStorage.removeItem("formflow_user");
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
      localStorage.setItem("formflow_user", JSON.stringify(updated));
      setUser(updated);
    } catch (error) {
      console.error("Update user error:", error);
      setAuthError("Failed to update profile");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading, authError, clearAuthError: () => setAuthError(null), checkEmailExists }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
