import { createContext, useContext, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SessionExpiringModal from "../assets/SessionExpiringModal";
import SessionExpiredModal from "../assets/SessionExpiredModal";

const AuthContext = createContext();

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [showSessionExpiring, setShowSessionExpiring] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [sessionStart, setSessionStart] = useState(null);
  const navigate = useNavigate();

  const countdownTimerRef = useRef(null);
  const expiryWarningTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const hasExpiredRef = useRef(false);
  const isLoggingOutRef = useRef(false);
  const maxSessionTimerRef = useRef(null);
  const tokenRefreshTimerRef = useRef(null);
  const showSessionExpiringRef = useRef(false);
  const showSessionExpiredRef = useRef(false);

  const IDLE_TIMEOUT = 1 * 60 * 60 * 1000; // 2 minutes (for testing)
  const MAX_SESSION_DURATION = 8 * 60 * 60 * 1000; // 5 minutes (for testing)
  const WARNING_BEFORE_EXPIRY = 60 * 1000; // 1 min warning before idle timeout
  const ACCESS_TOKEN_DURATION = 15 * 60 * 1000; // 70 seconds
  const TOKEN_REFRESH_BUFFER = 1 * 60 * 1000; // Refresh 10s before expiry
  const ACTIVITY_EVENTS = ["keypress", "touchstart", "click", "mousemove"];

  axios.defaults.withCredentials = true;

  // Sync refs with state
  useEffect(() => {
    showSessionExpiringRef.current = showSessionExpiring;
  }, [showSessionExpiring]);

  useEffect(() => {
    showSessionExpiredRef.current = showSessionExpired;
  }, [showSessionExpired]);

  // Timer helpers
  const clearTimers = (
    resetExpiredFlag = true,
    preserveTokenRefresh = false
  ) => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (expiryWarningTimerRef.current) {
      clearTimeout(expiryWarningTimerRef.current);
      expiryWarningTimerRef.current = null;
    }
    if (maxSessionTimerRef.current) {
      clearTimeout(maxSessionTimerRef.current);
      maxSessionTimerRef.current = null;
    }
    if (!preserveTokenRefresh && tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
      tokenRefreshTimerRef.current = null;
    }
    if (resetExpiredFlag) hasExpiredRef.current = false;
  };

  const startExpiryWarning = (expiryTimestamp) => {
    if (hasExpiredRef.current || isLoggingOutRef.current) return;

    setShowSessionExpiring(true);

    let currentCountdown = Math.max(
      Math.floor((expiryTimestamp - Date.now()) / 1000),
      0
    );
    setCountdown(currentCountdown);

    countdownTimerRef.current = setInterval(() => {
      currentCountdown -= 1;
      setCountdown(Math.max(currentCountdown, 0));

      if (currentCountdown <= 0) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;

        if (!hasExpiredRef.current && !isLoggingOutRef.current) {
          hasExpiredRef.current = true;
          handleSessionExpired();
        }
      }
    }, 1000);
  };

  const scheduleIdleTimeout = () => {
    clearTimers(true, true); // Preserve token refresh timer

    const idleExpiry = lastActivityRef.current + IDLE_TIMEOUT;
    const now = Date.now();
    const timeUntilExpiry = idleExpiry - now;
    const timeUntilWarning = Math.max(
      timeUntilExpiry - WARNING_BEFORE_EXPIRY,
      0
    );

    if (timeUntilWarning > 0) {
      expiryWarningTimerRef.current = setTimeout(() => {
        startExpiryWarning(idleExpiry);
      }, timeUntilWarning);
    } else if (timeUntilExpiry > 0) {
      startExpiryWarning(idleExpiry);
    } else {
      handleSessionExpired();
    }
  };

  const scheduleMaxSessionTimeout = () => {
    if (maxSessionTimerRef.current) {
      clearTimeout(maxSessionTimerRef.current);
    }

    if (!sessionStart) return;

    const timeRemaining = MAX_SESSION_DURATION - (Date.now() - sessionStart);

    if (timeRemaining <= 0) {
      logout(true);
      return;
    }

    maxSessionTimerRef.current = setTimeout(() => {
      logout(true);
    }, timeRemaining);
  };

  // Activity Detection
  const checkMaxSessionDuration = () => {
    if (!sessionStart) return false;

    const sessionDuration = Date.now() - sessionStart;
    if (sessionDuration > MAX_SESSION_DURATION) {
      return true;
    }
    return false;
  };

  // Proactive token refresh (refresh before expiry)
  const scheduleTokenRefresh = () => {
    if (tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
    }

    if (!token || hasExpiredRef.current || isLoggingOutRef.current) return;

    // Check if within max session duration
    if (checkMaxSessionDuration()) {
      return;
    }

    // Schedule refresh 10 seconds before token expires
    const refreshIn = ACCESS_TOKEN_DURATION - TOKEN_REFRESH_BUFFER;

    tokenRefreshTimerRef.current = setTimeout(async () => {
      console.log(
        "🔄 Token rotation triggered at",
        new Date().toLocaleTimeString()
      );

      if (hasExpiredRef.current || isLoggingOutRef.current) {
        console.log("Rotation cancelled - session expired or logging out");
        return;
      }

      if (checkMaxSessionDuration()) {
        console.log("Rotation cancelled - max session duration exceeded");
        logout(true);
        return;
      }

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

          // Schedule next refresh
          scheduleTokenRefresh();
        }
      } catch (err) {
        console.error("Token rotation failed:", err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout(true);
        }
      }
    }, refreshIn);
  };

  const handleSessionExpired = () => {
    if (isLoggingOutRef.current) return;

    hasExpiredRef.current = true;
    setShowSessionExpiring(false);
    clearTimers(false);
    logout(true);
  };

  // Activity tracking
  const handleUserActivity = () => {
    // Use refs instead of state values for immediate, accurate checks
    if (showSessionExpiringRef.current || showSessionExpiredRef.current) return;

    if (!token || hasExpiredRef.current || isLoggingOutRef.current) return;

    const now = Date.now();
    lastActivityRef.current = now;

    // Check max session duration
    if (checkMaxSessionDuration()) {
      logout(true);
      return;
    }

    // Reschedule idle timeout (but preserve token refresh)
    scheduleIdleTimeout();
  };

  // Activity Event Listeners
  useEffect(() => {
    if (!token) return;

    // Attach activity listeners (for idle tracking)
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Add scroll listener specifically to document for better detection
    document.addEventListener("scroll", handleUserActivity, {
      passive: true,
      capture: true,
    });

    // Initialize idle timeout
    scheduleIdleTimeout();

    // Schedule max session timeout
    scheduleMaxSessionTimeout();

    // Schedule proactive token refresh
    scheduleTokenRefresh();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener("scroll", handleUserActivity, {
        capture: true,
      });
    };
  }, [token, sessionStart]);

  // Auth functions
  const resetActivity = async () => {
    console.log(
      "🔄 Manual token refresh triggered (Stay Logged In clicked) at",
      new Date().toLocaleTimeString()
    );

    // User clicked "Stay Logged In" in modal
    if (checkMaxSessionDuration()) {
      logout(true);
      return;
    }

    setShowSessionExpiring(false);
    clearTimers();
    hasExpiredRef.current = false;
    lastActivityRef.current = Date.now();

    try {
      // Manual refresh when user clicks "Stay Logged In"
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

        // Reschedule idle timeout
        scheduleIdleTimeout();

        // Reschedule token refresh
        scheduleTokenRefresh();
      }
    } catch (err) {
      console.error("Manual token refresh failed:", err.message);
      logout(true);
    }
  };

  const logout = async (showModal = false) => {
    if (isLoggingOutRef.current) {
      return;
    }

    isLoggingOutRef.current = true;

    clearTimers();

    // Remove activity listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, handleUserActivity);
    });

    localStorage.removeItem("token");
    localStorage.removeItem("sessionStart");
    setToken(null);
    setAdmin(null);
    setShowSessionExpiring(false);
    setSessionStart(null);

    try {
      await axios.post(
        "http://localhost:5001/api/admins/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout error:", err);
    }

    if (showModal && !showSessionExpired) {
      setShowSessionExpired(true);
    } else {
      isLoggingOutRef.current = false;
      navigate("/");
    }
  };

  const handleExpiredModalLogout = () => {
    setShowSessionExpired(false);
    isLoggingOutRef.current = false;
    navigate("/");
  };

  // Axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("token");
        if (currentToken)
          config.headers.Authorization = `Bearer ${currentToken}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => axios.interceptors.request.eject(requestInterceptor);
  }, []);

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't retry refresh/logout endpoints
        if (
          originalRequest.url?.includes("/refresh") ||
          originalRequest.url?.includes("/logout")
        ) {
          return Promise.reject(error);
        }

        // Only refresh mechanism: When API call fails with 401/403
        if (
          (error.response?.status === 401 || error.response?.status === 403) &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          // Check max session before attempting refresh
          if (checkMaxSessionDuration()) {
            logout(true);
            return Promise.reject(error);
          }

          if (!isRefreshing) {
            isRefreshing = true;

            console.log(
              "🔄 Token refresh triggered by failed API request (401/403)"
            );

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
                isRefreshing = false;

                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

                // Reschedule token refresh after successful refresh
                scheduleTokenRefresh();
                return axios(originalRequest);
              }
            } catch (err) {
              console.error("API-triggered token refresh failed:", err.message);
              isRefreshing = false;
              onRefreshed(null);
              logout(true);
              return Promise.reject(err);
            }
          } else {
            // Queue request while refresh is in progress
            return new Promise((resolve, reject) => {
              addRefreshSubscriber((newToken) => {
                if (newToken) {
                  originalRequest.headers[
                    "Authorization"
                  ] = `Bearer ${newToken}`;
                  resolve(axios(originalRequest));
                } else reject(error);
              });
            });
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(responseInterceptor);
  }, [sessionStart]);

  // Admin fetch
  const fetchCurrentAdmin = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5001/api/admins/me");
      setAdmin(res.data);
    } catch (err) {
      console.error("Failed to fetch admin:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData) => {
    const { token, admin: adminData } = loginData;

    hasExpiredRef.current = false;
    isLoggingOutRef.current = false;

    const now = Date.now();
    lastActivityRef.current = now;

    localStorage.setItem("token", token);
    localStorage.setItem("sessionStart", now.toString());

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setToken(token);
    setAdmin(adminData);
    setSessionStart(now);
    setLoading(false);

    // Start idle timeout tracking
    scheduleIdleTimeout();

    // Start max session timeout
    scheduleMaxSessionTimeout();

    // Start proactive token refresh
    scheduleTokenRefresh();
  };

  const updateAdmin = (updatedData) => {
    setAdmin((prev) => ({ ...prev, ...updatedData }));
  };

  // Restore session on reload
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedSessionStart = localStorage.getItem("sessionStart");

    if (storedToken && storedSessionStart) {
      const sessionStartTime = parseInt(storedSessionStart, 10);
      const now = Date.now();
      const sessionAge = now - sessionStartTime;

      // Check if max session duration exceeded
      if (sessionAge > MAX_SESSION_DURATION) {
        localStorage.removeItem("token");
        localStorage.removeItem("sessionStart");
        setLoading(false);
        return;
      }

      // Restore session
      setToken(storedToken);
      setSessionStart(sessionStartTime);
      lastActivityRef.current = now;
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      scheduleIdleTimeout();
      scheduleMaxSessionTimeout();
      scheduleTokenRefresh();
      fetchCurrentAdmin();
    } else {
      setLoading(false);
    }
  }, []);

  // Provider
  return (
    <>
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

      {showSessionExpiring &&
        createPortal(
          <SessionExpiringModal
            countdown={countdown}
            onStayLoggedIn={resetActivity}
            onLogout={() => logout(false)}
          />,
          document.body
        )}

      {showSessionExpired &&
        createPortal(
          <SessionExpiredModal onLogout={handleExpiredModalLogout} />,
          document.body
        )}
    </>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
