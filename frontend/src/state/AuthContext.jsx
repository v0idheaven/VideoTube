import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await apiRequest("/api/v1/users/current-user");
      setUser(response?.data || null);
      return response?.data || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (payload) => {
    const response = await apiRequest("/api/v1/users/login", {
      method: "POST",
      body: payload,
    });

    setUser(response?.data?.user || null);
    return response;
  };

  const logout = async () => {
    await apiRequest("/api/v1/users/logout", {
      method: "POST",
    });
    setUser(null);
  };

  const register = async (formData) => {
    return apiRequest("/api/v1/users/register", {
      method: "POST",
      body: formData,
    });
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      register,
      refreshUser,
      setUser,
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
};
