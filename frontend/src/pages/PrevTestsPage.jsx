import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HomePageHeader from "../assets/HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
import axios from "axios";
import "../css/AdminPreviewPage.css";

function PrevTestsPage() {
  const { id } = useParams();
  const { isNavExpanded } = useNavigation();

  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [tests, setTests] = useState([]);

  // Fetch category info for title
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/categories/${id}`
        );
        setCategoryName(res.data.name);
      } catch (err) {
        console.error("Error fetching category:", err.message);
      }
    };
    fetchCategory();
  }, [id]);

  // Fetch all tests under this category
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/tests?category_id=${id}`
        );
        setTests(res.data);
      } catch (err) {
        console.error("Error fetching tests:", err.message);
      }
    };
    fetchTests();
  }, [id]);

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />

      <div className="prev-page-title">{categoryName}</div>

      <div className="prev-categories-list">
        {tests.map((test) => (
          <div
            key={test.id}
            className="prev-category-card"
            onClick={() => navigate(`/tests/${test.id}`)}
          >
            <h4 className="prev-category-title">{test.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrevTestsPage;
