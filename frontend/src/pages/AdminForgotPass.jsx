import React, { useState } from "react";
import "../css/AdminForgotPass.css";
import { Link } from "react-router-dom";
import HtaaQLogo from "../assets/HtaaQ-logo.png";
import axios from "axios";

function AdminForgotPassword() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setLoading(true);

    try {
      // Check if email exists
      const checkRes = await axios.get(
        `${API_BASE}/api/admins/check?email=${email}`
      );
      if (!checkRes.data.exists) {
        setStatusMessage("This email is not registered.");
        setLoading(false);
        return;
      }

      if (checkRes.data.status === "pending") {
        setStatusMessage("Your account has not been approved yet.");
        setLoading(false);
        return;
      }

      if (checkRes.data.status === "rejected") {
        setStatusMessage("Your account request was rejected.");
        setLoading(false);
        return;
      }

      // If valid, request reset link
      const res = await axios.post("/api/admins/forgot-password", { email });
      setStatusMessage(
        res.data.message ||
          "If your email exists, you’ll receive a reset link shortly."
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
      setStatusMessage(
        err.response?.data?.error || "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-forgotpass-container">
      <div className="admin-htaaq-logo-image-container">
        <img src={HtaaQLogo} alt="HTAA Logo" className="htaaq-logo-image" />
      </div>

      <div className="admin-forgotpass-divider"></div>

      <div className="admin-forgotpass-form-container">
        <div className="admin-forgotpass-bg">
          <h2>Forgot Password</h2>

          <p style={{ marginBottom: "15px" }}>
            Enter your registered email address and we’ll send you a link to
            reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="forgotpass-form-text">
              <label htmlFor="email" className="required">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                className="input-textbox"
                type="email"
                placeholder="abc@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {statusMessage && <p className="error-text" style={{ color: "red" }}>{statusMessage}</p>}

            <button type="submit" className="forgotpass-btn" disabled={loading}>
              {loading ? "Sending..." : "SEND RESET LINK"}
            </button>
            <Link className="forgotpass-link" to="/">
              Back to login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminForgotPassword;
