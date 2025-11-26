import React from "react";
import "../css/SessionExpiredModal.css";

export default function SessionExpiredModal({ onLogout }) {
  console.log("Rendering SessionExpiredModal"); // Debug

  return (
    <div className="session-overlay">
      <div className="session-modal">
        <div className="session-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="red"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2>Session Expired</h2>
        <p>Your session has expired. Please log in again to continue.</p>
        <button onClick={onLogout}>Return to Login</button>
      </div>
    </div>
  );
}
