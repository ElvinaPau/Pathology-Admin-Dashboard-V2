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
  const [testStats, setTestStats] = useState({
    totalTests: 0,
    lastUpdated: "N/A",
  });
  const [forms, setForms] = useState([]);
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/forms`);
        setForms(res.data);
      } catch (err) {
        console.error("Error fetching forms:", err.message);
      }
    };
    fetchForms();
  }, []);

  const lastUpdatedForm = forms
    .map((f) => f.updated_at)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];

  useEffect(() => {
    const fetchTestStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/tests/stats/summary"
        );
        setTestStats({
          totalTests: res.data.totalTests,
          lastUpdated: res.data.lastUpdated
            ? new Date(res.data.lastUpdated).toLocaleDateString()
            : "N/A",
        });
      } catch (err) {
        console.error("Error fetching test stats:", err.message);
      }
    };
    fetchTestStats();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/categories");
        let sorted = res.data.sort(
          (a, b) => (a.position ?? a.id) - (b.position ?? b.id)
        );

        // Ensure FORM stays last
        let formCategory = sorted.find((cat) => cat.name === "FORM");

        const lastUpdated = lastUpdatedForm
          ? new Date(lastUpdatedForm).toLocaleDateString()
          : "N/A";

        if (!formCategory) {
          sorted.push({
            id: "fixed-form",
            name: "FORM",
            testCount: forms.length,
            lastUpdated: lastUpdated,
            fixed: true,
          });
        } else {
          sorted = sorted
            .filter((cat) => cat.name !== "FORM")
            .concat({
              ...formCategory,
              testCount: forms.length,
              lastUpdated: lastUpdated,
            });
        }

        setCategories(sorted);
      } catch (err) {
        console.error("Error fetching categories:", err.message);
      }
    };
    fetchCategories();
  }, [forms]);

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

  // Add new category
  const handleSubmit = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    const exists = categories.some(
      (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      alert("This category already exists!");
      return;
    }

    try {
      await axios.post("http://localhost:5001/api/categories", {
        name: trimmedName,
      });

      // Re-fetch updated list
      const res = await axios.get("http://localhost:5001/api/categories");
      let sorted = res.data.sort(
        (a, b) => (a.position ?? a.id) - (b.position ?? b.id)
      );

      const formCategory = sorted.find((cat) => cat.name === "FORM");
      if (!formCategory) {
        sorted.push({
          id: "fixed-form",
          name: "FORM",
          testCount: 0,
          fixed: true,
        });
      } else {
        sorted = sorted
          .filter((cat) => cat.name !== "FORM")
          .concat(formCategory);
      }

      setCategories(sorted);

      // Highlight the newly added category
      const newCatId = sorted.find((cat) => cat.name === trimmedName)?.id;
      setHighlightId(newCatId);

      // Clear input and hide form after setting highlight
      setNewCategoryName("");
      setShowInput(false);

      // Remove highlight after animation
      setTimeout(() => setHighlightId(null), 1200);
    } catch (err) {
      console.error("Error adding category:", err.message);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id, name) => {
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

    const formCat = categories.find((c) => c.fixed);
    const movable = categories.filter((c) => !c.fixed);

    const [moved] = movable.splice(source.index, 1);
    movable.splice(destination.index, 0, moved);

    const newCategories = [...movable, formCat];
    setCategories(newCategories);

    const updates = movable.map((cat, index) => ({
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
        <div className="profile-container">
          <ProfileCard />
        </div>
        <div className="stats-container">
          <StatCard
            title="Total Tests"
            count={testStats.totalTests}
            icon={<GrDocumentTest />}
          />
          <StatCard
            title="Total Admin"
            count={adminCount}
            icon={<FaUsers />}
            onClick={() => navigate("/admin-requests")}
          />
        </div>
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
              {categories.map((cat, index) =>
                cat.fixed ? (
                  // Fixed “FORM” card (not draggable)
                  <div key={cat.id} style={{ opacity: 0.9 }}>
                    <CatCard
                      id={cat.id}
                      title={cat.name}
                      count={cat.testCount}
                      icon={<GrTest />}
                      lastUpdated={
                        cat.lastUpdated || new Date().toLocaleDateString()
                      }
                      onClick={() => navigate(`/categories/${cat.id}`)}
                      onDelete={() =>
                        alert("The 'FORM' category cannot be deleted.")
                      }
                    />
                  </div>
                ) : (
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
                          lastUpdated={
                            cat.lastUpdated || new Date().toLocaleDateString()
                          }
                          onClick={() => navigate(`/categories/${cat.id}`)}
                          onDelete={() =>
                            handleDeleteCategory(cat.id, cat.name)
                          }
                          className={cat.id === highlightId ? "highlight" : ""}
                        />
                      </div>
                    )}
                  </Draggable>
                )
              )}

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

              <div
                className="cat-card add-category"
                onClick={() => setShowInput(true)}
              >
                <p>Add New Category</p>
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
