import React from "react";
import "../css/StatCard.css";

const StatCard = ({ title, count, icon, lastUpdated }) => {
  return (
    <div className="stats-card">
      <div className="card-header">
        <div className="stat-icon">{icon}</div>
        <div className="main-number">{count}</div>
      </div>

      <h3 className="card-title">{title}</h3>
      <p className="card-subtitle">Last updated on {lastUpdated}</p>
    </div>
  );
};

export default StatCard;
