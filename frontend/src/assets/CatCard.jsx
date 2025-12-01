import React, { useState, useRef, useEffect } from "react";
import { IoMdMore } from "react-icons/io";
import { MdDelete, MdAddCircleOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "../css/CatCard.css";

function CatCard({
  id,
  title,
  count,
  icon,
  onClick,
  onDelete,
  lastUpdated,
  className = "",
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    <div
      className={`cat-card ${isHovered ? "hovered" : ""} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="cat-card-bg"></div>

      {/* Shine effect on hover */}
      <div className="cat-card-shine"></div>

      <div className="cat-card-content">
        <div className="icon-wrapper">
          <div className="icon">{icon}</div>
        </div>

        <div className="details">
          <p className="category-title">{title}</p>
          <h3 className="category-count">{count}</h3>
          {lastUpdated && (
            <span className="last-updated">Last updated: {lastUpdated}</span>
          )}
        </div>
      </div>

      <div
        className="more-icon"
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
      >
        <IoMdMore
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="more-btn"
        />

        {dropdownOpen && (
          <div className="dropdown-menu">
            <div
              className="dropdown-item add-item"
              onClick={() => {
                setDropdownOpen(false);
                navigate(`/categories/${id}/add`);
              }}
            >
              <MdAddCircleOutline className="dropdown-icon" />
              <span>Add New Test</span>
            </div>

            <div
              className="dropdown-item delete-item"
              onClick={() => {
                setDropdownOpen(false);
                onDelete?.();
              }}
            >
              <MdDelete className="dropdown-icon" />
              <span>Delete</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CatCard;
