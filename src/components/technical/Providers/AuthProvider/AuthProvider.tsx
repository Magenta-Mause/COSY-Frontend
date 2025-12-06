import { jwtDecode } from "jwt-decode";
import { createContext, type ReactNode, useCallback, useEffect, useState } from "react";
import { setAuthToken } from "@/api/axiosInstance";
import { fetchToken } from "@/api/generated/backend-api";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";

interface AuthContextType {
  identityToken: string | null;
  authorized: boolean | null;
  tokenExpirationDate: number | null;
  username: string | null;
  refreshIdentityToken: () => void;
  setToken: (token: string) => void;
  logout: () => void;
}

interface DecodedToken {
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  tokenType: "REFRESH_TOKEN" | "IDENTITY_TOKEN";
}

const AuthContext = createContext<AuthContextType>({
  identityToken: null,
  authorized: null,
  tokenExpirationDate: null,
  username: null,
  refreshIdentityToken() {
    console.warn("Called refresh identity token before auth context ready");
  },
  setToken() {
    console.warn("Called setToken before auth context ready");
  },
  logout() {
    console.warn("Called logout before auth context ready");
  },
});

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000;

const AuthProvider = (props: { children: ReactNode }) => {
  const { loadGameServers } = useDataLoading();
  const [username, setUsername] = useState<string | null>(null);
  const [identityToken, setIdentityToken] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState<number | null>(null);

  const parseToken = useCallback((token: string): DecodedToken | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }, []);

  const updateAuthState = useCallback(
    (token: string | null) => {
      if (!token) {
        setIdentityToken(null);
        setAuthorized(false);
        setUsername(null);
        setTokenExpirationDate(null);
        return;
      }

      const decoded = parseToken(token);
      if (!decoded) {
        setIdentityToken(null);
        setAuthorized(false);
        setUsername(null);
        setTokenExpirationDate(null);
        return;
      }

      const expirationMs = decoded.exp * 1000;
      const isExpired = Date.now() >= expirationMs;

      if (isExpired) {
        setIdentityToken(null);
        setAuthorized(false);
        setUsername(null);
        setTokenExpirationDate(null);
        return;
      }

      setIdentityToken(token);
      setAuthorized(true);
      setUsername(decoded.sub);
      setTokenExpirationDate(expirationMs);
    },
    [parseToken],
  );

  const refreshIdentityToken = useCallback(async () => {
    try {
      const token = await fetchToken();

      if (token) {
        updateAuthState(token);
        setAuthToken(token);
        return token;
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      updateAuthState(null);
    }
  }, [updateAuthState]);

  const logout = useCallback(() => {
    updateAuthState(null);
    // await logoutApi();
  }, [updateAuthState]);

  const setToken = useCallback(
    (token: string) => {
      updateAuthState(token);
    },
    [updateAuthState],
  );

  useEffect(() => {
    refreshIdentityToken();
  }, [refreshIdentityToken]);

  useEffect(() => {
    if (!tokenExpirationDate) return;

    const timeUntilRefresh = tokenExpirationDate - Date.now() - TOKEN_REFRESH_BUFFER;

    if (timeUntilRefresh <= 0) {
      refreshIdentityToken();
      return;
    }

    const timerId = setTimeout(() => {
      refreshIdentityToken();
    }, timeUntilRefresh);

    return () => clearTimeout(timerId);
  }, [tokenExpirationDate, refreshIdentityToken]);

  useEffect(() => {
    if (authorized) {
      loadGameServers();
    }
  }, [authorized, loadGameServers]);

  return (
    <AuthContext.Provider
      value={{
        identityToken,
        authorized,
        tokenExpirationDate,
        username,
        refreshIdentityToken,
        setToken,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;
