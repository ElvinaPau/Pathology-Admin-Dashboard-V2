import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/AdminLogin.css";
import HtaaQLogo from "../assets/HtaaQ-logo.png";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { MdOutlineVisibility } from "react-icons/md";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5001";

function AdminSetPassword() {
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    reenter_password: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    reenter_password: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    axios
      .get(`/api/admins/verify-token/${token}`)
      .then((res) => {
        setIsLoading(false);
      })
      .catch((err) => {
        setStatusMessage(
          err.response?.data?.error || "Invalid or expired token"
        );
        setIsLoading(false);
      });
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 8) return "At least 8 characters required";
    if (!/[A-Z]/.test(password)) return "Must include uppercase letter";
    if (!/[a-z]/.test(password)) return "Must include lowercase letter";
    if (!/[0-9]/.test(password)) return "Must include a number";
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(password))
      return "Must include a special character";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: passwordError }));

      if (formData.reenter_password) {
        setErrors((prev) => ({
          ...prev,
          reenter_password:
            value !== formData.reenter_password ? "Passwords do not match" : "",
        }));
      }
    }

    if (name === "reenter_password") {
      setErrors((prev) => ({
        ...prev,
        reenter_password:
          value !== formData.password ? "Passwords do not match" : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (errors.password || errors.reenter_password) {
      alert("Fix errors before submitting");
      return;
    }

    try {
      await axios.post(`/api/admins/set-password/${token}`, {
        password: formData.password,
      });
      alert("Password set successfully!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to set password");
    }
  };

  const isFormValid =
    formData.password &&
    formData.reenter_password &&
    !errors.password &&
    !errors.reenter_password;

  if (isLoading) return <p>Loading...</p>;
  if (statusMessage) return <p>{statusMessage}</p>;

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
            <strong>special character</strong>.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-form-text">
              <label>Password</label>
              <div className="password-container">
                <input
                  className="input-textbox"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter 8 characters or more"
                  value={formData.password}
                  onChange={handleChange}
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

              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            <div className="login-form-text">
              <label>Re-enter Password</label>
              <div className="password-container">
                <input
                  className="input-textbox"
                  type={showPassword ? "text" : "password"}
                  name="reenter_password"
                  placeholder="Re-enter password"
                  value={formData.reenter_password}
                  onChange={handleChange}
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

              {errors.reenter_password && (
                <p className="error-text">{errors.reenter_password}</p>
              )}
            </div>

            <button className="login-btn" type="submit" disabled={!isFormValid}>
              SUBMIT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminSetPassword;
