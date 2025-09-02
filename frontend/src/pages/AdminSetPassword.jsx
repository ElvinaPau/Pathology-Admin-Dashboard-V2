import React from "react";
import "../css/AdminLogin.css";
import { Link } from "react-router-dom";
import HtaaQLogo from "../assets/HtaaQ-logo.png";

function AdminSetPassword() {
  return (
    <div className="admin-login-container">
      <div className="admin-htaaq-logo-image-container">
        <img src={HtaaQLogo} alt="HTAA Logo" className="htaaq-logo-image" />
      </div>

      <div className="admin-login-divider"></div>

      <div className="admin-login-form-container">
        <div className="admin-login-bg">
          <h2>Set Password</h2>

          <div style={{ marginTop: "5px" }}>
            You’re one step closer! Set a strong password with at least{" "}
            <strong>8 characters</strong>, including <strong>uppercase</strong>,{" "}
            <strong>lowercase</strong>, <strong>number</strong>, and{" "}
            <strong>symbol</strong>.
          </div>

          <div className="login-form-text">
            <label>Password</label>
            <input
              className="input-textbox"
              type="password"
              placeholder="Enter 8 characters or more"
            />
          </div>

          <div className="login-form-text">
            <label>Re-enter Password</label>
            <input
              className="input-textbox"
              type="password"
              placeholder="Enter 8 characters or more"
            />
          </div>

          <button className="login-btn">LOGIN</button>
        </div>
      </div>
    </div>
  );
}

export default AdminSetPassword;
