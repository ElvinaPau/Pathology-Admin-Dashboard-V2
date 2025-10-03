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

  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Check if email already exists
      const checkRes = await fetch(
        `http://localhost:5001/api/admins/check?email=${formData.email}`
      );
      const checkData = await checkRes.json();

      if (checkData.exists) {
        if (checkData.status === "pending") {
          alert("⚠️ Your request with this email is already pending approval.");
          return;
        } else if (checkData.status === "approved") {
          alert("✅ This email is already approved. Please log in instead.");
          return;
        }
      }

      // 2. Proceed with new signup request
      const response = await fetch("http://localhost:5001/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form + show success popup
        setFormData({ fullName: "", department: "", email: "", notes: "" });
        setShowPopup(true);
      } else {
        const err = await response.json();
        alert("❌ " + (err.error || "please try again"));
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("⚠️ Server error. Please try again later.");
    }
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
                <label htmlFor="fullName" className="required">
                  Full Name
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
                <label htmlFor="department" className="required">
                  Department
                </label>
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
                    <option value="Microbiology">Microbiology</option>
                    <option value="Histopathology">Histopathology</option>
                    <option value="Cytology">Cytology</option>
                    <option value="Integrated">Integrated</option>
                    <option value="Chemical Pathology">
                      Chemical Pathology
                    </option>
                    <option value="Haematology">Haematology</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div className="login-form-text">
                <label htmlFor="email" className="required">
                  Email Address
                </label>
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
                SEND REQUEST
              </button>
            </form>
            {/* --- Success Popup Modal --- */}
            {showPopup && (
              <div className="popup-overlay">
                <div className="popup-box">
                  <h3>Request Submitted!</h3>
                  <p>
                    Your account is pending approval by an existing admin.
                    <br />
                    You will receive an email notification once your account has
                    been approved.
                  </p>
                  <Link to="/" className="popup-btn">
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignUp;
