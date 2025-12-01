import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HomePageHeader from "../assets/HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
import { IoIosArrowBack } from "react-icons/io";
import { FaSearch, FaBookmark, FaPhone, FaUser } from "react-icons/fa";
import axios from "axios";
import "../css/AdminPreviewPage.css";

function PrevTestsPage() {
  const { id } = useParams();
  const { isNavExpanded } = useNavigation();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [tests, setTests] = useState([]);
  const [forms, setForms] = useState([]);
  const [isFormCategory, setIsFormCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");

  // Fetch category info for title
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (id === "fixed-form") {
          setCategoryName("FORM");
          setIsFormCategory(true);
          return;
        }

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

  // Fetch tests or forms
  useEffect(() => {
    const fetchTestsOrForms = async () => {
      try {
        if (id === "fixed-form") {
          const res = await axios.get("http://localhost:5001/api/forms");
          setForms(res.data);
          return;
        }

        const res = await axios.get(
          `http://localhost:5001/api/tests?category_id=${id}`
        );
        setTests(res.data);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };
    fetchTestsOrForms();
  }, [id]);

  // Filter forms by search term
  const filteredForms = forms.filter((form) => {
    const term = searchTerm.toLowerCase();
    return (
      form.field?.toLowerCase().includes(term) ||
      form.title?.toLowerCase().includes(term) ||
      form.link_text?.toLowerCase().includes(term)
    );
  });

  // Filter tests by mobile search term
  const filteredTests = tests.filter((test) => {
    const term = mobileSearchTerm.toLowerCase();
    return test.name?.toLowerCase().includes(term);
  });

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />

      <div className="prev-header">

        {isFormCategory ? (
          <div className="form-info-container">
            <div>
              {/* Search bar */}
              <input
                type="text"
                className="form-search-input"
                placeholder="Search by field, title, or form..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <table className="form-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Field</th>
                    <th>Form Title</th>
                    <th>Form</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.length > 0 ? (
                    filteredForms.map((form, index) => (
                      <tr key={form.id}>
                        <td>{index + 1}</td>
                        <td>{form.field}</td>
                        <td>{form.title}</td>
                        <td>
                          <a
                            href={form.form_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {form.link_text || "Open Form"}
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{ textAlign: "center", color: "#888" }}
                      >
                        No matching forms found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="prev-categories-list">
            {/* Mobile App Header */}
            <div className="mobile-app-header">
              <div className="mobile-header-content">
                 <button
            className="prev-back-btn"
            onClick={() => navigate("/preview")}
          >
            <IoIosArrowBack />
          </button>
                <h1 className="mobile-app-title">{categoryName}</h1>
                <FaUser className="mobile-user-icon" />
              </div>
            </div>

            {/* Mobile Search Bar */}
            <input
              type="text"
              className="mobile-search-bar"
              placeholder="Search for categories..."
              value={mobileSearchTerm}
              onChange={(e) => setMobileSearchTerm(e.target.value)}
            />

            {/* Test Cards */}
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="prev-category-card"
                  onClick={() => navigate(`/testinfos/${test.id}`)}
                >
                  <h4 className="prev-category-title">{test.name}</h4>
                </div>
              ))
            ) : (
              <div
                className="prev-category-card"
                style={{ cursor: "default", opacity: 0.6 }}
              >
                <h4 className="prev-category-title">No tests found</h4>
              </div>
            )}

            {/* Mobile Bottom Navigation */}
            <div className="mobile-bottom-nav">
              <FaBookmark className="mobile-nav-icon" />
              <div className="mobile-fab-button">
                <FaSearch />
              </div>
              <FaPhone className="mobile-nav-icon" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrevTestsPage;
