import React from "react";
import "../css/AdminLogin.css";
import { Link } from "react-router-dom";
import HtaaQLogo from "../assets/HtaaQ-logo.png";

function AdminLogin() {
  return (
    <div className="admin-login-container">
      <div className="admin-htaaq-logo-image-container">
        <img src={HtaaQLogo} alt="HTAA Logo" className="htaaq-logo-image" />
      </div>

      <div className="admin-login-divider"></div>

      <div className="admin-login-form-container">
        <div className="admin-login-bg">
          <div className="login-text">
            <h2>Admin Login</h2>

            <div className="login-des">
              <p>
                Doesn’t have an account yet?{" "}
                <Link to="/admin-signup" style={{ color: "blue" }}>
                  Sign up
                </Link>
              </p>
            </div>
            
            <p className="login-form-text">Email address</p>
            <input
              className="input-textbox"
              type="email"
              placeholder="abc@example.com"
            />

            <p className="login-form-text">Password</p>
            <input
              className="input-textbox"
              type="password"
              placeholder="Enter 8 characters or more"
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <Link to="/admin-forgot-password" style={{ color: "blue" }}>
              Forgot Password?
            </Link>
          </div>

          <button className="login-btn">LOGIN</button>

        </div>
      </div>
    </div>
  );
}

export default AdminLogin;