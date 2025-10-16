import React, { useState, useEffect } from "react";
import HomePageHeader from "../assets/HomePageHeader";
import CatCard from "../assets/CatCard";
import ProfileCard from "../assets/ProfileCard";
import StatCard from "../assets/StatCard";
import NewCatInput from "../assets/NewCatInput";
import { GrDocumentTest, GrTest } from "react-icons/gr";
import { FaUsers } from "react-icons/fa";
import "../css/AdminHomePage.css";
import { useNavigation } from "../context/NavigationContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function AdminHomePage() {
  const { isNavExpanded } = useNavigation();
  const navigate = useNavigate();

  const [showInput, setShowInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [adminCount, setAdminCount] = useState(0);
  const [categories, setCategories] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/categories");
        // Sort by position if available
        const sorted = res.data.sort(
          (a, b) => (a.position ?? a.id) - (b.position ?? b.id)
        );
        setCategories(sorted);
      } catch (err) {
        console.error("Error fetching categories:", err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch admin count
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

  // Add category
  const handleSubmit = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await axios.post("http://localhost:5001/api/categories", {
        name: newCategoryName,
      });

      const newCat = {
      ...res.data,
      testCount: 0,
      lastUpdated: new Date().toLocaleDateString(),
      };

      setCategories([...categories, newCat]);
      setNewCategoryName("");
      setShowInput(false);
    } catch (err) {
      console.error("Error adding category:", err.message);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      await axios.delete(`http://localhost:5001/api/categories/${id}`);
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err.message);
    }
  };

  // Drag-and-drop reorder
  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const newCategories = Array.from(categories);
    const [moved] = newCategories.splice(source.index, 1);
    newCategories.splice(destination.index, 0, moved);

    setCategories(newCategories);

    const updates = newCategories.map((cat, index) => ({
      id: cat.id,
      position: index,
    }));

    try {
      await axios.put("http://localhost:5001/api/categories/reorder", {
        updates,
      });
    } catch (err) {
      console.error("Error reordering categories:", err.message);
    }
  };

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />

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
      <div className="home-title">Categories</div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided) => (
            <div
              className="categories-section"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {categories.map((cat, index) => (
                <Draggable
                  key={cat.id}
                  draggableId={cat.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.5 : 1,
                        cursor: "grab",
                      }}
                    >
                      <CatCard
                        id={cat.id}
                        title={cat.name}
                        count={cat.testCount}
                        icon={<GrTest />}
                        lastUpdated={cat.lastUpdated || "N/A"}
                        onClick={() => navigate(`/categories/${cat.id}`)}
                        onDelete={() => handleDeleteCategory(cat.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}

              {/* Add New Category */}
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
                <button
                  className="create-btn"
                  onClick={() => setShowInput(true)}
                >
                  + Create New
                </button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default AdminHomePage;
