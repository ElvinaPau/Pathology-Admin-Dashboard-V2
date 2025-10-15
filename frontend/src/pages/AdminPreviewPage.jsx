import React, { useEffect, useState } from "react";
import HomePageHeader from "../assets/HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/AdminPreviewPage.css";

function AdminPreviewPage() {
  const { isNavExpanded } = useNavigation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/categories");
        const sorted = res.data.sort((a, b) => (a.position ?? a.id) - (b.position ?? b.id));
        setCategories(sorted);
      } catch (err) {
        console.error("Error fetching categories:", err.message);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />

      <div className="prev-page-title">Preview</div>

      {/* Categories vertical list */}
      <div className="prev-categories-list">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="prev-category-card"
            onClick={() => navigate(`/prevtests/${cat.id}`)}
          >
            <h4 className="prev-category-title">{cat.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPreviewPage;
