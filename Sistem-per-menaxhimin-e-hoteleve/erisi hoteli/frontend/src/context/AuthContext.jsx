import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMyProfile, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService';
import { clearAuthTokens, hasAccessToken } from '../services/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    if (!hasAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getMyProfile();
      setUser(profile);
    } catch {
      clearAuthTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    const onLogout = () => {
      clearAuthTokens();
      setUser(null);
    };

    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (payload) => {
    const data = await loginRequest(payload);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    return registerRequest(payload);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  };

  const hasRole = (roleName) => {
    if (!user?.roles) {
      return false;
    }
    const normalized = String(roleName).toLowerCase();
    return user.roles.some((role) => role.normalized_name === normalized);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshProfile: loadProfile,
      hasRole,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}

