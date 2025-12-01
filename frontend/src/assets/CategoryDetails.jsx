import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineEdit } from "react-icons/ai";
import "../css/AdminHomePage.css";
import HomePageHeader from "../assets/HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
import TestTable from "../assets/TestTable";

function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isNavExpanded } = useNavigation();

  const [category, setCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const inputRef = useRef(null);

  // Fetch single category
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/categories/${id}`
        );
        setCategory(res.data);
      } catch (err) {
        console.error("Error fetching category:", err.message);
      }
    };
    fetchCategory();
  }, [id]);

  // Edit logic
  const handleEditClick = () => {
    setIsEditing(true);
    setEditedName(category.name);
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5001/api/categories/${id}`,
        { name: editedName }
      );
      setCategory(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating category:", err.message);
    }
  };

  const handleCancel = () => setIsEditing(false);

  // Save when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isEditing &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        handleSave();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, editedName]);

  if (!category) return <div>Loading category...</div>;

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />

      <button className="back-btn" onClick={() => navigate("/home")}>
        Back
      </button>

      <div className="table-title">
        {isEditing ? (
          <div className="title-edit" ref={inputRef}>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
            />
          </div>
        ) : (
          <div className="cat-title-display">
            <div className="home-title" onClick={handleEditClick}>
              {category.name}
            </div>
            <AiOutlineEdit className="edit-icon" onClick={handleEditClick} />
          </div>
        )}
      </div>

      <TestTable categoryId={id} />
    </div>
  );
}

export default CategoryDetails;
