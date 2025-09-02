import React, { useState, useRef, useEffect } from "react";
import "../css/CatCard.css";
import { IoMdMore } from "react-icons/io";

function CatCard({ title, count, icon, lastUpdated, onClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="cat-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div>
        <div className="icon">{icon}</div>
        <div className="details">
          <h4>{title}</h4>
          <h2>{count}</h2>
          <p className="card-subtitle">Last updated on {lastUpdated}</p>
        </div>
      </div>

      <div
        className="more-icon"
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()} // prevent triggering card click
      >
        <IoMdMore
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ cursor: "pointer" }}
        />
        {dropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item">Edit</div>
            <div className="dropdown-item">Add New Test/ Tab</div>
            <div className="dropdown-item">Delete</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CatCard;
