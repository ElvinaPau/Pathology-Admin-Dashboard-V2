import React, { useState } from "react";
import "../css/AdminLogin.css";
import { Link, useNavigate } from "react-router-dom";
import HtaaQLogo from "../assets/HtaaQ-logo.png";
import axios from "axios";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { MdOutlineVisibility } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5001/api/admins/login",
        formData,
        { withCredentials: true }
      );

      login(res.data.token);

      // redirect to dashboard
      navigate("/home");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-htaaq-logo-image-container">
        <img src={HtaaQLogo} alt="HTAA Logo" className="htaaq-logo-image" />
      </div>

      <div className="admin-login-divider"></div>

      <div className="admin-login-form-container">
        <div className="admin-login-bg">
          <h2>Admin Login</h2>

          <div className="login-des">
            <p>
              Doesn’t have an account yet?{" "}
              <Link to="/admin-signup" style={{ color: "blue" }}>
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-form-text">
              <label htmlFor="email" className="required">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                className="input-textbox"
                type="email"
                placeholder="abc@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-form-text">
              <label htmlFor="password" className="required">
                Password
              </label>
              <div className="password-container">
                <input
                  id="password"
                  name="password"
                  className="input-textbox"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter 8 characters or more"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <MdOutlineVisibility className="eye-icon" />
                  ) : (
                    <AiOutlineEyeInvisible className="eye-icon" />
                  )}
                </span>
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}

            <div style={{ marginTop: "10px" }}>
              <Link to="/admin-forgot-password" style={{ color: "blue" }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
