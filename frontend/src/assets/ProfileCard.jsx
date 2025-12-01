import React, { useEffect, useState } from "react";
import "../css/ProfileCard.css";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaBuilding, FaEdit } from "react-icons/fa";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5001";

function ProfileCard() {
  const { admin, token, updateAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    department: "",
    email: "",
  });

  useEffect(() => {
    if (admin) setFormData(admin);
  }, [admin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:5001/api/admins/${admin.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateAdmin(formData);
      setShowModal(false);
    } catch (err) {
      console.error("Error updating admin:", err);
    }
  };

  if (!admin) return <p>Loading...</p>;

  return (
    <>
      <div className="profile-card">
        {/* Edit Icon */}
        <button
          className="profile-edit-icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
        >
          <FaEdit />
        </button>

        <div className="profile-gradient-bg">
          <div className="profile-content-wrapper">
            <div className="profile-header-text">
              <span className="profile-greeting">Good Day,</span>
              <h2 className="profile-name">{admin.full_name}</h2>
            </div>

            <div className="profile-stats-grid">
              <div className="profile-stat-item">
                <div className="stat-icon-box">
                  <FaBuilding />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Department</span>
                  <span className="stat-value">{admin.department}</span>
                </div>
              </div>

              <div className="profile-stat-item">
                <div className="stat-icon-box">
                  <FaEnvelope />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Email Address</span>
                  <span className="stat-value">{admin.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-decoration">
            <svg
              className="deco-element"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)" />
              <circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.08)" />
              <circle cx="100" cy="100" r="40" fill="rgba(255,255,255,0.06)" />
            </svg>

            <svg
              className="deco-lines"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20,50 Q100,30 180,50"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M20,100 Q100,80 180,100"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M20,150 Q100,130 180,150"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            <div className="deco-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="profile-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="profile-item">
                <span className="profile-label">Name:</span>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-item">
                <span className="profile-label">Department:</span>
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
                  <option value="Chemical Pathology">Chemical Pathology</option>
                  <option value="Haematology">Haematology</option>
                </select>
              </div>

              <div className="profile-item">
                <span className="profile-label">Email Address:</span>
                <span className="profile-value">{formData.email}</span>
              </div>

              <div className="profile-actions">
                <button type="submit">Save</button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(admin);
                    setShowModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileCard;
