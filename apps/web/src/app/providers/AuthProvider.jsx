import { useCallback, useMemo, useState } from "react";
import { authService } from "../../features/auth/services/authService";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const execute = useCallback(async (operation) => {
    setStatus("authenticating");
    setError(null);

    try {
      const result = await operation();
      setSession(result);
      setStatus("authenticated");
      return result;
    } catch (requestError) {
      setStatus("error");
      setError(requestError);
      throw requestError;
    }
  }, []);

  const login = useCallback(
    (credentials, options) => execute(() => authService.login(credentials, options)),
    [execute],
  );

  const register = useCallback(
    (data, options) => execute(() => authService.register(data, options)),
    [execute],
  );

  const refresh = useCallback(async (refreshToken, options) => {
    setStatus("authenticating");
    setError(null);

    try {
      const tokens = await authService.refresh(refreshToken, options);
      setSession((currentSession) => ({
        ...currentSession,
        ...tokens,
      }));
      setStatus("authenticated");
      return tokens;
    } catch (requestError) {
      setStatus("error");
      setError(requestError);
      throw requestError;
    }
  }, []);

  const logout = useCallback(async (options) => {
    if (!session) {
      return;
    }

    try {
      await authService.logout(session.refreshToken, session.accessToken, options);
    } finally {
      setSession(null);
      setStatus("idle");
      setError(null);
    }
  }, [session]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      status,
      error,
      isAuthenticated: Boolean(session?.user && session?.accessToken),
      login,
      register,
      refresh,
      logout,
    }),
    [error, login, logout, refresh, register, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}