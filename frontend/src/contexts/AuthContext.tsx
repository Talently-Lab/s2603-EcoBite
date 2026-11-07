import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../services/auth";

export type { AuthUser } from "../services/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  sessionExpired: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "=",
    );
    const parsed: unknown = JSON.parse(atob(paddedBase64));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "exp" in parsed &&
      typeof parsed.exp === "number"
    ) {
      return parsed.exp * 1000;
    }
  } catch {
    return null;
  }
  return null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(() => {
    try {
      const storedToken = sessionStorage.getItem("token");
      const expiresAt = storedToken ? getTokenExpiration(storedToken) : null;
      return expiresAt !== null && expiresAt <= Date.now();
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsedUser: unknown = JSON.parse(storedUser);
        if (typeof parsedUser === "object" && parsedUser !== null && !Array.isArray(parsedUser)) {
          const expiresAt = getTokenExpiration(storedToken);
          if (expiresAt !== null && expiresAt <= Date.now()) {
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
          } else {
            setUser(parsedUser as AuthUser);
            setToken(storedToken);
          }
        } else {
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("token");
        }
      }
    } catch {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    const expiresAt = getTokenExpiration(token);
    if (expiresAt === null) return;

    const timeout = window.setTimeout(() => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setToken(null);
      setUser(null);
      setSessionExpired(true);
    }, Math.max(0, expiresAt - Date.now()));

    return () => window.clearTimeout(timeout);
  }, [token]);

  function login(nextToken: string, nextUser: AuthUser) {
    sessionStorage.setItem("token", nextToken);
    sessionStorage.setItem("user", JSON.stringify(nextUser));
    setSessionExpired(false);
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setSessionExpired(false);
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: token !== null,
    loading,
    sessionExpired,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider.");
  }
  return context;
}
