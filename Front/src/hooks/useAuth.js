import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout,
    isClient: user?.role === 'Client',
    isProvider: user?.role === 'Provider',
    isAdmin: user?.role === 'Admin',
  };
};
