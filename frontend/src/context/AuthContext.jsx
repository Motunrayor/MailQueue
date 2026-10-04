import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "mailqueue_token";

const getSafeUser = (user) => {
  if (!user) return null;

  return {
    id: user._id || user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
    account_type: user.account_type,
    phone_no: user.phone_no,
    address: user.address,
    state: user.state,
    country: user.country,
    company_name: user.company_name,
    brand: user.brand,
    socialmedia_url: user.socialmedia_url,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        setUser(getSafeUser(response.user));
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);

    localStorage.setItem(TOKEN_KEY, response.token);

    const safeUser = getSafeUser(response.user);
    setUser(safeUser);

    return response;
  };

  const register = async (userData) => {
    const response = await registerUser(userData);

    localStorage.setItem(TOKEN_KEY, response.token);

    const safeUser = getSafeUser(response.user);
    setUser(safeUser);

    return response;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export default AuthContext;