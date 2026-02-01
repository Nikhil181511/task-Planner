import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener...");

    const unsubscribe = authService.onAuthStateChanged((user) => {
      console.log(
        "Auth state changed:",
        user ? `User: ${user.email || user.uid}` : "No user",
      );
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const register = async (email: string, password: string) => {
    await authService.register(email, password);
  };

  const loginAnonymously = async () => {
    await authService.loginAnonymously();
  };

  const logout = async () => {
    await authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginAnonymously, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
