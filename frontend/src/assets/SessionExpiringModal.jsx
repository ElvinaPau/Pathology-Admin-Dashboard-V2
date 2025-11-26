import React from "react";
import "../css/SessionExpiredModal.css";

export default function SessionExpiringModal({ countdown, onStayLoggedIn, onLogout }) {

  return (
    <div className="session-overlay">
      <div className="session-modal">
        <div className="session-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="orange"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2>Session Expiring Soon</h2>
        <p>Your session will expire due to inactivity. Stay logged in?</p>
        <div className="countdown">{countdown}s</div>
        <div className="button-group">
          <button onClick={onLogout}>Logout</button>
          <button onClick={onStayLoggedIn}>Stay Logged In</button>
        </div>
      </div>
    </div>
  );
}
