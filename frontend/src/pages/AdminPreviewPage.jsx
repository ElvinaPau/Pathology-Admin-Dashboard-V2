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

  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  // -----------------------------
  // FETCH CATEGORIES (Main Page)
  // -----------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/categories");
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

  // -----------------------------
  // FETCH FORMS
  // -----------------------------
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/forms");
        setForms(res.data);
      } catch (err) {
        console.error("Error fetching forms:", err.message);
      }
    };
    fetchForms();
  }, []);

  // -----------------------------
  // CLICK CATEGORY: LOAD TESTS
  // -----------------------------
  const openCategory = async (category) => {
    if (category.id === "fixed-form") {
      // FORM SPECIAL CATEGORY
      setSelectedCategory(category);
      setView("form-table");
      return;
    }

    setLoading(true);
    setSelectedCategory(category);
    setView("tests");

    try {
      const res = await axios.get(
        `http://localhost:5001/api/tests?category_id=${category.id}`
      );
      setTests(res.data);
    } catch (err) {
      console.error("Error fetching tests:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // CLICK TEST: LOAD TEST INFO
  // -----------------------------
  const openTest = async (test) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5001/api/tests/${test.id}?includeinfos=true`
      );
      setSelectedTest(res.data);
      setView("info");
    } catch (err) {
      console.error("Error fetching test info:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // BACK BUTTON LOGIC
  // -----------------------------
  const goBack = () => {
    if (view === "info") {
      setView("tests");
      setSelectedTest(null);
    } else if (view === "tests") {
      setView("categories");
      setSelectedCategory(null);
    } else if (view === "form-table") {
      setView("categories");
      setSelectedCategory(null);
    }
  };

  // -----------------------------
  // COMBINED CATEGORIES (with FORM)
  // -----------------------------
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

  // Filter tests
  const filteredTests = tests.filter((t) =>
    t.name.toLowerCase().includes(mobileSearchTerm.toLowerCase())
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

  // -----------------------------
  // PAGE RENDERING
  // -----------------------------
  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />
      <div className="home-title">Preview</div>

      {/* ======================================
            VIEW 1: CATEGORY LIST
          ====================================== */}
      {view === "categories" && (
        <div className="prev-categories-list">
          <div className="mobile-app-header">
            <h1 className="mobile-app-title">HTAA LAB HANDBOOK</h1>
          </div>

          {/* Search */}
          <input
            type="text"
            className="mobile-search-bar"
            placeholder="Search for categories..."
            value={mobileSearchTerm}
            onChange={(e) => setMobileSearchTerm(e.target.value)}
          />

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
              <div className="prev-category-card" style={{ opacity: 0.6 }}>
                <h4>No categories found</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================
            VIEW 2: TEST LIST IN CATEGORY
          ====================================== */}
      {view === "tests" && (
        <div className="prev-categories-list">
          <div className="mobile-app-header">
            <button className="prev-back-btn" onClick={goBack}>
              <IoIosArrowBack />
            </button>
            <h1 className="mobile-app-title">{selectedCategory?.name}</h1>
          </div>

          <input
            type="text"
            className="mobile-search-bar"
            placeholder="Search for tests..."
            value={mobileSearchTerm}
            onChange={(e) => setMobileSearchTerm(e.target.value)}
          />

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
              <div className="prev-category-card" style={{ opacity: 0.6 }}>
                <h4>No tests found</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================
            VIEW 3: FORM TABLE
          ====================================== */}
      {view === "form-table" && (
        <div className="prev-categories-list">
          <div className="mobile-app-header">
            <button className="prev-back-btn" onClick={goBack}>
              <IoIosArrowBack />
            </button>
            <h1 className="mobile-app-title">FORM</h1>
          </div>

          <input
            type="text"
            className="mobile-search-bar"
            placeholder="Search form..."
            value={mobileSearchTerm}
            onChange={(e) => setMobileSearchTerm(e.target.value)}
          />

          <div className="mobile-content" style={{ padding: '16px', overflowX: 'auto' }}>
            <table className="form-table" style={{ width: '100%', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ width: '1px', padding: '5px' }}>No</th>
                  <th style={{ width: '30%' }}>Field</th>
                  <th style={{ width: '40%' }}>Form Title</th>
                  <th style={{ width: '30%' }}>Form</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length > 0 ? (
                  filteredForms.map((form, index) => (
                    <tr key={form.id}>
                      <td style={{ textAlign: 'center' , padding: '0px' }}>{index + 1}</td>
                      <td style={{ wordBreak: 'break-word' }}>{form.field}</td>
                      <td style={{ wordBreak: 'break-word' }}>{form.title}</td>
                      <td style={{ wordBreak: 'break-word' }}>
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
      )}

      {/* ======================================
            VIEW 4: TEST INFO (Separate Cards)
          ====================================== */}
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

          {/* Test Info Cards */}
          <div className="mobile-content" style={{ padding: '16px' }}>
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
                    {d.title && <h2 className="info-card-title">{sanitizeData(d.title)}</h2>}

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