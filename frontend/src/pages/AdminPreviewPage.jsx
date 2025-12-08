import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoIosArrowBack } from "react-icons/io";
import HomePageHeader from "../assets/HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
import "../css/AdminPreviewPage.css";
import "../css/PrevTestInfoPage.css";

// Helper to strip HTML tags
function stripHtml(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Recursive sanitation for all fields
function sanitizeData(data) {
  if (typeof data === "string") return stripHtml(data);
  if (Array.isArray(data)) return data.map(sanitizeData);
  if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitizeData(value)])
    );
  }
  return data;
}

function PreviewPage() {
  const { isNavExpanded } = useNavigation();

  // 3 VIEW STATES:
  const [view, setView] = useState("categories"); // categories | tests | info

  const [categories, setCategories] = useState([]);
  const [forms, setForms] = useState([]);
  const [tests, setTests] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(""); // For forms
  const [mobileSearchTerm, setMobileSearchTerm] = useState(""); // For categories/tests

  // Focus states for search bars
  const [isCategorySearchFocused, setIsCategorySearchFocused] = useState(false);
  const [isTestSearchFocused, setIsTestSearchFocused] = useState(false);
  const [isFormSearchFocused, setIsFormSearchFocused] = useState(false);

  // Separate search history
  const [categorySearchHistory, setCategorySearchHistory] = useState([]);
  const [testSearchHistory, setTestSearchHistory] = useState([]);
  const [formSearchHistory, setFormSearchHistory] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  // History expiry time (in milliseconds) - 7 days
  const HISTORY_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

  // HELPER TO DELETE FROM HISTORY
  // HELPER TO FILTER EXPIRED ITEMS
  const filterExpiredHistory = (history) => {
    const now = Date.now();
    return history.filter((item) => {
      if (!item.timestamp) return true; // Keep old items without timestamp
      return now - item.timestamp < HISTORY_EXPIRY_TIME;
    });
  };

  // LOAD SEARCH HISTORY FROM LOCALSTORAGE
  useEffect(() => {
    const categoryHistory = JSON.parse(
      localStorage.getItem("categorySearchHistory") || "[]"
    );
    const testHistory = JSON.parse(
      localStorage.getItem("testSearchHistory") || "[]"
    );
    const formHistory = JSON.parse(
      localStorage.getItem("formSearchHistory") || "[]"
    );

    // Filter out expired items
    const filteredCategoryHistory = filterExpiredHistory(categoryHistory);
    const filteredTestHistory = filterExpiredHistory(testHistory);
    const filteredFormHistory = filterExpiredHistory(formHistory);

    // Update state
    setCategorySearchHistory(filteredCategoryHistory);
    setTestSearchHistory(filteredTestHistory);
    setFormSearchHistory(filteredFormHistory);

    // Update localStorage if any items were removed
    if (filteredCategoryHistory.length !== categoryHistory.length) {
      localStorage.setItem(
        "categorySearchHistory",
        JSON.stringify(filteredCategoryHistory)
      );
    }
    if (filteredTestHistory.length !== testHistory.length) {
      localStorage.setItem(
        "testSearchHistory",
        JSON.stringify(filteredTestHistory)
      );
    }
    if (filteredFormHistory.length !== formHistory.length) {
      localStorage.setItem(
        "formSearchHistory",
        JSON.stringify(filteredFormHistory)
      );
    }
  }, []);

  // HELPER TO ADD TO HISTORY
  const addToHistory = (item, type) => {
    // Add timestamp to the item
    const itemWithTimestamp = {
      ...item,
      timestamp: Date.now(),
    };

    let updated;
    switch (type) {
      case "category":
        // Store category object with timestamp
        updated = [
          itemWithTimestamp,
          ...categorySearchHistory.filter((h) => h.id !== item.id),
        ].slice(0, 10);
        setCategorySearchHistory(updated);
        localStorage.setItem("categorySearchHistory", JSON.stringify(updated));
        break;
      case "test":
        // Store test object with timestamp
        updated = [
          itemWithTimestamp,
          ...testSearchHistory.filter((h) => h.id !== item.id),
        ].slice(0, 10);
        setTestSearchHistory(updated);
        localStorage.setItem("testSearchHistory", JSON.stringify(updated));
        break;
      case "form":
        // Store form object with timestamp
        updated = [
          itemWithTimestamp,
          ...formSearchHistory.filter((h) => h.id !== item.id),
        ].slice(0, 10);
        setFormSearchHistory(updated);
        localStorage.setItem("formSearchHistory", JSON.stringify(updated));
        break;
      default:
        break;
    }
  };

  // HELPER TO FORMAT TIME AGO
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return `${days}d ago`;
  };

  const deleteFromHistory = (itemId, type, e) => {
    e.stopPropagation(); // Prevent triggering the item click
    let updated;
    switch (type) {
      case "category":
        updated = categorySearchHistory.filter((h) => h.id !== itemId);
        setCategorySearchHistory(updated);
        localStorage.setItem("categorySearchHistory", JSON.stringify(updated));
        break;
      case "test":
        updated = testSearchHistory.filter((h) => h.id !== itemId);
        setTestSearchHistory(updated);
        localStorage.setItem("testSearchHistory", JSON.stringify(updated));
        break;
      case "form":
        updated = formSearchHistory.filter((h) => h.id !== itemId);
        setFormSearchHistory(updated);
        localStorage.setItem("formSearchHistory", JSON.stringify(updated));
        break;
      default:
        break;
    }
  };

  // HELPER TO CLEAR ALL HISTORY
  const clearAllHistory = (type, e) => {
    e.stopPropagation();
    switch (type) {
      case "category":
        setCategorySearchHistory([]);
        localStorage.removeItem("categorySearchHistory");
        break;
      case "test":
        setTestSearchHistory([]);
        localStorage.removeItem("testSearchHistory");
        break;
      case "form":
        setFormSearchHistory([]);
        localStorage.removeItem("formSearchHistory");
        break;
      default:
        break;
    }
  };

  // Fetch categories (Main Page)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/categories`);
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

  // Fetch forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/forms`);
        setForms(res.data);
      } catch (err) {
        console.error("Error fetching forms:", err.message);
      }
    };
    fetchForms();
  }, []);

  // Click Category: load tests
  const openCategory = async (category) => {
    // Add to history
    addToHistory(category, "category");

    if (category.id === "fixed-form") {
      // FORM SPECIAL CATEGORY
      setSelectedCategory(category);
      setView("form-table");
      setMobileSearchTerm(""); // Clear search
      setSearchTerm(""); // Clear search
      return;
    }

    setLoading(true);
    setSelectedCategory(category);
    setView("tests");
    setMobileSearchTerm(""); // Clear search when opening category

    try {
      const res = await axios.get(
        `${API_BASE}/api/tests?category_id=${category.id}`
      );
      setTests(res.data);
    } catch (err) {
      console.error("Error fetching tests:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Click Test: Load Test Info
  const openTest = async (test) => {
    // Add to history
    addToHistory(test, "test");

    setLoading(true);
    setMobileSearchTerm(""); // Clear search when opening test
    try {
      const res = await axios.get(
        `${API_BASE}/api/tests/${test.id}?includeinfos=true`
      );
      setSelectedTest(res.data);
      setView("info");
    } catch (err) {
      console.error("Error fetching test info:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Back button
  const goBack = () => {
    if (view === "info") {
      setView("tests");
      setSelectedTest(null);
      setMobileSearchTerm(""); // Clear search
    } else if (view === "tests") {
      setView("categories");
      setSelectedCategory(null);
      setMobileSearchTerm(""); // Clear search
    } else if (view === "form-table") {
      setView("categories");
      setSelectedCategory(null);
      setSearchTerm(""); // Clear search
      setMobileSearchTerm(""); // Clear search
    }
  };

  // Combined categories (with FORM)
  const allCategories = [
    ...categories,
    {
      id: "fixed-form",
      name: "FORM",
      testCount: forms.length,
      fixed: true,
    },
  ];

  // Filter category cards (mobile search)
  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(mobileSearchTerm.toLowerCase())
  );

  // Filter category search history based on input
  const filteredCategoryHistory = categorySearchHistory.filter((item) =>
    item.name.toLowerCase().includes(mobileSearchTerm.toLowerCase())
  );

  // Filter tests
  const filteredTests = tests.filter((t) =>
    t.name.toLowerCase().includes(mobileSearchTerm.toLowerCase())
  );

  const filteredTestHistory = testSearchHistory.filter((item) =>
    item.name.toLowerCase().includes(mobileSearchTerm.toLowerCase())
  );

  // Filter forms
  const filteredForms = forms.filter((form) => {
    const term = searchTerm.toLowerCase();
    return (
      form.field?.toLowerCase().includes(term) ||
      form.title?.toLowerCase().includes(term) ||
      form.link_text?.toLowerCase().includes(term)
    );
  });

  const filteredFormHistory = formSearchHistory.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.field && item.field.toLowerCase().includes(term)) ||
      (item.title && item.title.toLowerCase().includes(term))
    );
  });

  // PAGE RENDERING

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />
      <div className="home-title">Preview</div>

      {/* VIEW 1: CATEGORY LIST */}
      {view === "categories" && (
        <div className="prev-categories-list">
          <div className="mobile-app-header">
            <h1 className="mobile-app-title">HTAA LAB HANDBOOK</h1>
          </div>

          {/* Search */}
          <input
            type="text"
            className={`mobile-search-bar ${
              isCategorySearchFocused && filteredCategoryHistory.length > 0
                ? "has-history"
                : ""
            }`}
            placeholder="Search for categories..."
            value={mobileSearchTerm}
            onChange={(e) => setMobileSearchTerm(e.target.value)}
            onFocus={() => setIsCategorySearchFocused(true)}
            onBlur={() =>
              setTimeout(() => setIsCategorySearchFocused(false), 200)
            }
          />
          {/* History */}
          {isCategorySearchFocused && filteredCategoryHistory.length > 0 && (
            <div className="search-history-box">
              <div className="search-history-header">
                <div className="search-history-title">Recent Searches</div>
                <button
                  className="clear-history-btn"
                  onClick={(e) => clearAllHistory("category", e)}
                  title="Clear all"
                >
                  Clear All
                </button>
              </div>
              {filteredCategoryHistory.map((item, i) => (
                <div
                  key={i}
                  className="search-history-item"
                  onClick={() => {
                    openCategory(item);
                    setIsCategorySearchFocused(false);
                  }}
                >
                  <span className="history-item-text">{item.name}</span>
                  <button
                    className="delete-history-btn"
                    onClick={(e) => deleteFromHistory(item.id, "category", e)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Cards */}
          <div className="mobile-content">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((item) => (
                <div
                  key={item.id}
                  className="prev-category-card"
                  onClick={() => openCategory(item)}
                >
                  <h4 className="prev-category-title">{item.name}</h4>
                </div>
              ))
            ) : (
              <h4 className="no-category-title">No categories found</h4>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: TEST LIST IN CATEGORY */}
      {view === "tests" && (
        <div className="prev-categories-list">
          <div className="mobile-app-header">
            <button className="prev-back-btn" onClick={goBack}>
              <IoIosArrowBack />
            </button>
            <h1 className="mobile-app-title">{selectedCategory?.name}</h1>
          </div>

          {/* Search */}
          <input
            type="text"
            className={`mobile-search-bar ${
              isTestSearchFocused && filteredTestHistory.length > 0
                ? "has-history"
                : ""
            }`}
            placeholder="Search for tests..."
            value={mobileSearchTerm}
            onChange={(e) => setMobileSearchTerm(e.target.value)}
            onFocus={() => setIsTestSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsTestSearchFocused(false), 200)}
          />
          {/* History */}
          {isTestSearchFocused && filteredTestHistory.length > 0 && (
            <div className="search-history-box">
              <div className="search-history-header">
                <div className="search-history-title">Recent Searches</div>
                <button
                  className="clear-history-btn"
                  onClick={(e) => clearAllHistory("test", e)}
                  title="Clear all"
                >
                  Clear All
                </button>
              </div>
              {filteredTestHistory.map((item, i) => (
                <div
                  key={i}
                  className="search-history-item"
                  onClick={() => {
                    openTest(item);
                    setIsTestSearchFocused(false);
                  }}
                >
                  <span className="history-item-text">{item.name}</span>
                  <button
                    className="delete-history-btn"
                    onClick={(e) => deleteFromHistory(item.id, "test", e)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mobile-content">
            {loading ? (
              <p>Loading...</p>
            ) : filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="prev-category-card"
                  onClick={() => openTest(test)}
                >
                  <h4 className="prev-category-title">{test.name}</h4>
                </div>
              ))
            ) : (
              <h4 className="no-category-title">No tests found</h4>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: FORM TABLE */}
      {view === "form-table" && (
        <div className="prev-categories-list">
          <div className="mobile-app-header">
            <button className="prev-back-btn" onClick={goBack}>
              <IoIosArrowBack />
            </button>
            <h1 className="mobile-app-title">FORM</h1>
          </div>

          {/* Search */}
          <input
            type="text"
            className={`mobile-search-bar ${
              isFormSearchFocused && filteredFormHistory.length > 0
                ? "has-history"
                : ""
            }`}
            placeholder="Search form..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFormSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsFormSearchFocused(false), 200)}
          />
          {/* History */}
          {isFormSearchFocused && filteredFormHistory.length > 0 && (
            <div className="search-history-box">
              <div className="search-history-header">
                <div className="search-history-title">Recent Searches</div>
                <button
                  className="clear-history-btn"
                  onClick={(e) => clearAllHistory("form", e)}
                  title="Clear all"
                >
                  Clear All
                </button>
              </div>
              {filteredFormHistory.map((item, i) => (
                <div
                  key={i}
                  className="search-history-item"
                  onClick={() => {
                    setSearchTerm(item.field || item.title || "");
                    setIsFormSearchFocused(false);
                  }}
                >
                  <span className="history-item-text">
                    {item.field || item.title}
                  </span>
                  <button
                    className="delete-history-btn"
                    onClick={(e) => deleteFromHistory(item.id, "form", e)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className="mobile-content"
            style={{ padding: "16px", overflowX: "auto" }}
          >
            <table
              className="form-table"
              style={{ width: "100%", fontSize: "14px" }}
            >
              <thead>
                <tr>
                  <th style={{ width: "1px", padding: "5px" }}>No</th>
                  <th style={{ width: "30%" }}>Field</th>
                  <th style={{ width: "40%" }}>Form Title</th>
                  <th style={{ width: "30%" }}>Form</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length > 0 ? (
                  filteredForms.map((form, index) => (
                    <tr key={form.id}>
                      <td style={{ textAlign: "center", padding: "0px" }}>
                        {index + 1}
                      </td>
                      <td style={{ wordBreak: "break-word" }}>{form.field}</td>
                      <td style={{ wordBreak: "break-word" }}>{form.title}</td>
                      <td style={{ wordBreak: "break-word" }}>
                        <a
                          href={form.form_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => addToHistory(form, "form")}
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
      )}

      {/* VIEW 4: TEST INFO */}
      {view === "info" && selectedTest && (
        <div className="prev-categories-list">
          <div className="mobile-app-header">
            <button className="prev-back-btn" onClick={goBack}>
              <IoIosArrowBack />
            </button>
            <h1 className="mobile-app-title">
              {selectedTest.name || "Untitled Test"}
            </h1>
          </div>

          <div className="mobile-content" style={{ padding: "16px" }}>
            {loading ? (
              <p>Loading...</p>
            ) : selectedTest.infos && selectedTest.infos.length > 0 ? (
              selectedTest.infos.map((info) => {
                const d = info.extraData || {};
                let imageSrc = null;

                if (d.image) {
                  if (typeof d.image === "string") {
                    imageSrc = d.image.startsWith("http")
                      ? d.image
                      : `${API_BASE}${d.image}`;
                  } else if (d.image.url) {
                    imageSrc = d.image.url.startsWith("http")
                      ? d.image.url
                      : `${API_BASE}${d.image.url}`;
                  }
                }

                return (
                  <div key={info.id} className="test-info-card">
                    {d.title && (
                      <h2 className="info-card-title">
                        {sanitizeData(d.title)}
                      </h2>
                    )}
                    {d.labInCharge && (
                      <div className="info-card-section">
                        <strong>Lab In-Charge:</strong>
                        <br />
                        {sanitizeData(d.labInCharge)}
                      </div>
                    )}
                    {(d.specimenType || d.otherSpecimen) && (
                      <div className="info-card-section">
                        <strong>Specimen Type:</strong>
                        <br />
                        {[
                          ...(Array.isArray(d.specimenType)
                            ? d.specimenType.filter(
                                (type) => type !== "Others..."
                              )
                            : [d.specimenType].filter(
                                (type) => type && type !== "Others..."
                              )),
                          d.otherSpecimen,
                        ]
                          .filter(Boolean)
                          .map((type, i) => (
                            <React.Fragment key={i}>
                              {typeof type === "string" ? (
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: sanitizeData(type).replace(
                                      /\n/g,
                                      "<br />"
                                    ),
                                  }}
                                />
                              ) : (
                                sanitizeData(type)
                              )}
                              <br />
                            </React.Fragment>
                          ))}
                      </div>
                    )}
                    {d.form && (d.form.text || d.form.url) && (
                      <div className="info-card-section">
                        <strong>Form:</strong> <br />
                        {d.form.url ? (
                          <a
                            href={sanitizeData(d.form.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {sanitizeData(d.form.text || d.form.url)}
                          </a>
                        ) : (
                          sanitizeData(d.form.text)
                        )}
                      </div>
                    )}
                    {d.TAT && (
                      <div className="info-card-section">
                        <strong>TAT:</strong>
                        <br />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: sanitizeData(d.TAT).replace(
                              /\n/g,
                              "<br />"
                            ),
                          }}
                        />
                      </div>
                    )}
                    {imageSrc && (
                      <div className="info-card-section">
                        <strong>Container:</strong>
                        <br />
                        <img
                          src={imageSrc}
                          alt={d.containerLabel || "Container"}
                          className="info-card-image"
                        />
                      </div>
                    )}
                    {d.containerLabel && (
                      <div className="info-card-section">
                        {sanitizeData(d.containerLabel)}
                      </div>
                    )}
                    {d.sampleVolume && (
                      <div className="info-card-section">
                        <strong>Sample Volume:</strong>
                        <br />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: sanitizeData(d.sampleVolume).replace(
                              /\n/g,
                              "<br />"
                            ),
                          }}
                        />
                      </div>
                    )}
                    {d.description && (
                      <div
                        className="info-card-section rich-text-content"
                        dangerouslySetInnerHTML={{ __html: d.description }}
                      />
                    )}
                    {d.remark && (
                      <div className="info-card-section">
                        <strong>Remark:</strong>
                        <div dangerouslySetInnerHTML={{ __html: d.remark }} />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="prev-category-card" style={{ opacity: 0.6 }}>
                <h4>No test infos available</h4>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviewPage;
