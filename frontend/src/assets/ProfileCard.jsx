import React from "react";
import "../css/ProfileCard.css";
import { FaUser } from 'react-icons/fa';

function ProfileCard({ name, department, email }) {
  return (
    <div className="profile-card">
      <h3 className="profile-title">Profile</h3>
      <div className="profile-content">
        <div className="profile-avatar">
          <FaUser />
        </div>
        <div className="profile-details">
          <div className="profile-item">
            <span className="profile-label">Name:</span>
            {/* <span className="profile-value">{profileData.name}</span> */}
          </div>
          <div className="profile-item">
            <span className="profile-label">Department:</span>
            {/* <span className="profile-value">{profileData.department}</span> */}
          </div>
          <div className="profile-item">
            <span className="profile-label">Email Address:</span>
            {/* <span className="profile-value">{profileData.email}</span> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
