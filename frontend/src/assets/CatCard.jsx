import React, { useState, useRef, useEffect } from "react";
import "../css/CatCard.css";
import { IoMdMore } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function CatCard({ id, title, count, icon, onClick, onDelete }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="cat-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div>
        <div className="icon">{icon}</div>
        <div className="details">
          <p>{title}</p>
          <h3>{count}</h3>
        </div>
      </div>

      <div
        className="more-icon"
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
      >
        <IoMdMore
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ cursor: "pointer" }}
        />

        {dropdownOpen && (
          <div className="dropdown-menu">
            <div
              className="dropdown-item"
              onClick={() => {
                setDropdownOpen(false);
                navigate(`/categories/${id}/add`);
              }}
            >
              Add New Test/Tab
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                setDropdownOpen(false);
                onDelete?.();
              }}
            >
              Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CatCard;
