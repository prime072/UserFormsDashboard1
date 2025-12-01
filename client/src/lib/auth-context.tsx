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
  login: (email: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check local storage on load
    const stored = localStorage.getItem("formflow_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    const firstName = email.split("@")[0];
    const newUser: User = { 
      id: Math.random().toString(36).substr(2, 9),
      firstName,
      lastName: "",
      email,
      phone: "",
      company: "",
      photo: ""
    };
    localStorage.setItem("formflow_user", JSON.stringify(newUser));
    setUser(newUser);
    setLocation("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("formflow_user");
    setUser(null);
    setLocation("/auth");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      localStorage.setItem("formflow_user", JSON.stringify(updated));
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
