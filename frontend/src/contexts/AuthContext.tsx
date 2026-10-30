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
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsedUser: unknown = JSON.parse(storedUser);
        if (typeof parsedUser === "object" && parsedUser !== null && !Array.isArray(parsedUser)) {
          setUser(parsedUser as AuthUser);
          setToken(storedToken);
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

  function login(nextToken: string, nextUser: AuthUser) {
    sessionStorage.setItem("token", nextToken);
    sessionStorage.setItem("user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: token !== null,
    loading,
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
