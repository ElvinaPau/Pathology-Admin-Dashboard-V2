import React, { useState } from "react";
import "../css/AdminLogin.css";
import { Link } from "react-router-dom";
import HtaaQLogo from "../assets/HtaaQ-logo.png";

function AdminSignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    email: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // TODO: add API call here
  };

  return (
    <div className="admin-login-container">
      <div className="admin-htaaq-logo-image-container">
        <div className="left-container">
          <img src={HtaaQLogo} alt="HTAA Logo" className="htaaq-logo-image" />
          <div className="admin-note">
            ⚠️ <strong>Note:</strong>
            <ul>
              <li>
                Your request will be reviewed by an existing admin before
                approval.
              </li>
              <li>
                Please use your real and recognizable name so admins can
                identify and approve you easily.
              </li>
              <li>
                You will receive an email notification once your account is
                approved.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="admin-login-divider"></div>

      <div className="admin-login-form-container">
        <div className="admin-login-bg">
          <div className="login-text">
            <h2>Admin Sign Up</h2>

            <div className="login-des">
              <p>
                Sign up to continue or{" "}
                <Link to="/" style={{ color: "blue" }}>
                  Login
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="login-form-text">
                <label htmlFor="fullName">
                  Full Name (include title, e.g., Dr./Mr./Ms.)
                </label>
                <input
                  id="fullName"
                  className="input-textbox"
                  type="text"
                  placeholder="Dr. John Smith"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              {/* Department */}
              <div className="login-form-text">
                <label htmlFor="department">Department</label>
                <div>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    required
                  >
                    <option value="">Select</option>
                    <option value="blood">Blood</option>
                    <option value="urine">Urine</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div className="login-form-text">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  className="input-textbox"
                  type="email"
                  placeholder="abc@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* Notes */}
              <div className="login-form-text">
                <label htmlFor="notes">Notes</label>
                <div>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={2}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              <button type="submit" className="login-btn">
                SIGN UP
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignUp;
