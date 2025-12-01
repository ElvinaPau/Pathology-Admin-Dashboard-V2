import React from "react";
import "../css/StatCard.css";

const StatCard = ({ title, count, icon, onClick }) => {
  return (
    <div
      className={`stat-item ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      <div className="stat-row"> 
        <div className="stat-icon">{icon}</div>
        <h3 className="stat-title">{title}</h3>
      </div>
      <div className="stat-count">{count.toLocaleString()}</div>
    </div>
  );
};

export default StatCard;
