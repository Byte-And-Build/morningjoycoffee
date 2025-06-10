"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await api.get("api/users/profile", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error("Failed to load user", error);
        }
      }
      setIsAuthLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("api/users/login", { email, password });
      setToken(response.data.token);
      setUser(response.data);
      localStorage.setItem("token", response.data.token);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post("api/users/register", { name, email, password });
      setToken(response.data.token);
      setUser(response.data);
      localStorage.setItem("token", response.data.token);
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export default AuthProvider;