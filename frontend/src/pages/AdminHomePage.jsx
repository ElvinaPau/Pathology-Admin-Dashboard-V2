import React, { useState, useRef, useEffect } from "react";
import HomePageHeader from "../assets/HomePageHeader";
import CatCard from "../assets/CatCard";
import ProfileCard from "../assets/ProfileCard";
import { GrDocumentTest } from "react-icons/gr";
import { FaUsers } from "react-icons/fa";
import { GrTest } from "react-icons/gr";
import "../css/AdminHomePage.css";
import StatCard from "../assets/StatCard";
import NewCatInput from "../assets/NewCatInput";
import TestTable from "../assets/TestTable";
import { AiOutlineEdit } from "react-icons/ai";
import { useNavigation } from "../context/NavigationContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminHomePage() {
  const { isNavExpanded } = useNavigation();
  const navigate = useNavigate();
  const [showInput, setShowInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const inputRef = useRef(null);
  const [adminCount, setAdminCount] = useState(0);

  const [categories, setCategories] = useState([
    "Tests (Inhouse)",
    "Test (Outsource)",
    "CHEMICAL PATHOLOGY",
    "HEMATOLOGY",
    "MICROBIOLOGY",
    "HISTOPATHOLOGY",
    "CYTOLOGY",
    "SPECIMEN CONTAINER",
    "FORM",
  ]);

  const handleAddClick = () => setShowInput(true);

  const handleSubmit = () => {
    if (newCategoryName.trim() !== "") {
      setCategories([...categories, newCategoryName]); // add new category
      setNewCategoryName(""); // reset input
      setShowInput(false); // hide input
    }
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setEditedTitle(selectedCategory);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() !== "") {
      // update the categories array
      setCategories(
        categories.map((cat) => (cat === selectedCategory ? editedTitle : cat))
      );
      setSelectedCategory(editedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isEditingTitle &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        handleSaveTitle();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditingTitle, editedTitle]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/admins/count");
        setAdminCount(res.data.total);
      } catch (err) {
        console.error("Error fetching admin count:", err.message);
      }
    };

    fetchCount();
  }, []);

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />

      {/* If category is selected, show table */}
      {selectedCategory ? (
        <>
          <button
            className="back-btn"
            onClick={() => setSelectedCategory(null)}
          >
            ← Back
          </button>
          <div className="table-title">
            {isEditingTitle ? (
              <div className="edit-title" ref={inputRef}>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  style={{ width: `${editedTitle.length + 2}ch` }} // auto size
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") handleCancelTitle();
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <div className="title-display">
                <div onClick={handleTitleClick}>{selectedCategory}</div>
                <AiOutlineEdit
                  className="edit-icon"
                  onClick={() => handleTitleClick()}
                />
              </div>
            )}
          </div>

          <TestTable />
        </>
      ) : (
        <>
          {/* Overview */}
          <div className="home-title">Overview</div>
          <div className="overview-section">
            <StatCard
              title="Total Tests"
              count={128}
              icon={<GrDocumentTest />}
              lastUpdated="1 Jan 2025"
            />
            <StatCard
              title="Total Admin"
              count={adminCount}
              icon={<FaUsers />}
              lastUpdated={new Date().toLocaleDateString()}
              onClick={() => navigate("/admin-requests")}
            />
            <ProfileCard />
          </div>

          {/* Categories */}
          <div className="categories-section">
            {categories.map((cat, index) => (
              <CatCard
                key={index}
                title={cat}
                count={128}
                icon={<GrTest />}
                lastUpdated="1 Jan 2025"
                onClick={() => setSelectedCategory(cat)}
              />
            ))}

            {/* Add New Category Card */}
            {showInput && (
              <NewCatInput
                title="Add New Category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onSubmit={handleSubmit}
                onCancel={() => setShowInput(false)}
                placeholder="Enter category name"
              />
            )}

            <div className="cat-card add-category">
              <h4>Add New Category</h4>
              <button className="create-btn" onClick={handleAddClick}>
                + Create New
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminHomePage;
