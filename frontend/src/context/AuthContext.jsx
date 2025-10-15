import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Always send cookies with requests
  axios.defaults.withCredentials = true;

  // ========================
  // Axios Request Interceptor - attach token
  // ========================
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // ========================
  // Axios Response Interceptor - handle 401/403 and refresh
  // ========================
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          (error.response?.status === 401 || error.response?.status === 403) &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const res = await axios.post(
                "http://localhost:5001/api/admins/refresh",
                {},
                { withCredentials: true }
              );

              if (res.data.token) {
                const newToken = res.data.token;
                localStorage.setItem("token", newToken);
                setToken(newToken);
                axios.defaults.headers.common[
                  "Authorization"
                ] = `Bearer ${newToken}`;
                onRefreshed(newToken);
              }
            } catch (err) {
              console.warn("Refresh token expired or invalid");
              logout();
              return Promise.reject(err);
            } finally {
              isRefreshing = false;
            }
          }

          return new Promise((resolve) => {
            refreshSubscribers.push((newToken) => {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              resolve(axios(originalRequest));
            });
          });
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // ========================
  // Fetch current admin info
  // ========================
  const fetchCurrentAdmin = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5001/api/admins/me");
      setAdmin(res.data);
    } catch (err) {
      console.error("Error fetching admin:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Manual refresh token (optional periodic refresh)
  // ========================
  const handleTokenRefresh = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/admins/refresh",
        {},
        { withCredentials: true }
      );

      if (res.data.token) {
        const newToken = res.data.token;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
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
    fetchCurrentAdmin();
  };

  // ========================
  // Logout
  // ========================
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/admins/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout error:", err.message);
    }
    localStorage.removeItem("token");
    setToken(null);
    setAdmin(null);
  };

  // ========================
  // Update admin data
  // ========================
  const updateAdmin = (updatedData) => {
    setAdmin((prev) => ({ ...prev, ...updatedData }));
  };

  // ========================
  // Auto refresh every 55 minutes
  // ========================
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      handleTokenRefresh();
    }, 55 * 60 * 1000); // 55 min

    return () => clearInterval(interval);
  }, [token]);

  // ========================
  // Fetch admin on initial mount if token exists
  // ========================
  useEffect(() => {
    if (token) fetchCurrentAdmin();
    else setLoading(false);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        admin,
        currentUser: admin,
        token,
        login,
        logout,
        loading,
        updateAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
