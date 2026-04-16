import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "cmdo_token";
const USER_KEY = "cmdo_user";

function readStoredUser() {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || "",
  );
  const [user, setUser] = useState(() => readStoredUser());

  const isAuthenticated = Boolean(token);

  const value = useMemo(() => {
    const applySession = (session) => {
      saveSession(session.token, session.user);
      setToken(session.token);
      setUser(session.user);
      return session;
    };

    return {
      token,
      user,
      isAuthenticated,
      login: async ({ username, password }) => {
        const response = await api.post("auth/login/", { username, password });
        return applySession(response.data);
      },
      signup: async ({ username, password, confirmPassword }) => {
        const response = await api.post("auth/signup/", {
          username,
          password,
          confirm_password: confirmPassword,
        });
        return applySession(response.data);
      },
      logout: async () => {
        try {
          await api.post("auth/logout/");
        } catch (error) {
          console.error(error);
        } finally {
          clearSession();
          setToken("");
          setUser(null);
        }
      },
    };
  }, [isAuthenticated, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
