import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Always send cookies with requests
  axios.defaults.withCredentials = true;

  // ========================
  // Auto attach token to axios
  // ========================
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchCurrentAdmin();
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // ========================
  // Fetch current admin info
  // ========================
  const fetchCurrentAdmin = async (jwtToken) => {
    try {
      const res = await axios.get("http://localhost:5001/api/admins/me", {
        headers: {
          Authorization: `Bearer ${jwtToken || token}`,
        },
      });
      setAdmin(res.data);
    } catch (err) {
      console.error("Error fetching admin:", err);
      handleTokenRefresh();
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Refresh access token
  // ========================
  const handleTokenRefresh = async () => {
    try {
      const res = await axios.post("http://localhost:5001/api/admins/refresh");
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.token}`;
        fetchCurrentAdmin();
      }
    } catch (err) {
      console.warn("Refresh token expired or invalid");
      logout();
    }
  };

  // ========================
  // Login
  // ========================
  const login = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    fetchCurrentAdmin(jwtToken);
  };

  // ========================
  // Logout
  // ========================
  const logout = async () => {
    try {
      await axios.post("http://localhost:5001/api/admins/logout"); // optional backend cleanup
    } catch (err) {
      console.error("Logout error:", err.message);
    }
    localStorage.removeItem("token");
    setToken(null);
    setAdmin(null);
  };

  // Update global admin data
  const updateAdmin = (updatedData) => {
    setAdmin((prev) => ({ ...prev, ...updatedData }));
  };

  // ========================
  // Auto refresh every 55 minutes (before 1h token expires)
  // ========================
  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(() => {
      handleTokenRefresh();
    }, 55 * 60 * 1000); // every 55 min

    return () => clearInterval(refreshInterval);
  }, [token]);

  // ========================
  // Auto logout after 10 hours
  // ========================
  useEffect(() => {
    if (!token) return;

    const logoutTimer = setTimeout(() => {
      logout();
    }, 10 * 60 * 60 * 1000); // 10 hours

    return () => clearTimeout(logoutTimer);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ admin, token, login, logout, loading, updateAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
