import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HomePageHeader from "../assets/HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
import { IoIosArrowBack } from "react-icons/io";
import axios from "axios";
import "../css/PrevTestInfoPage.css";

// Helper function to strip HTML tags
function stripHtml(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Recursive helper to strip HTML from all string values in an object
function sanitizeData(data) {
  if (typeof data === "string") return stripHtml(data);
  if (Array.isArray(data)) return data.map(sanitizeData);
  if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitizeData(value)])
    );
  }
  return data; // numbers, booleans, null stay as-is
}

function PrevTestInfoPage() {
  const { id } = useParams();
  const { isNavExpanded } = useNavigation();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/tests/${id}?includeinfos=true`
        );
        setTest(res.data);
      } catch (err) {
        console.error("Error fetching test:", err.message);
        setTest(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!test) return <p>Test not found</p>;

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />

      <div className="prev-header">
        <div className="prev-header-title">
          <button className="prev-back-btn" onClick={() => navigate(-1)}>
            <IoIosArrowBack />
          </button>

          <div className="prev-page-title">{test.name || "Untitled Test"}</div>
        </div>

        <div className="test-info-details">
          {test.infos && test.infos.length > 0 ? (
            test.infos.map((info) => {
              const d = info.extraData || {};

              let imageSrc = null;

              if (d.image) {
                if (typeof d.image === "string") {
                  imageSrc = d.image.startsWith("http")
                    ? d.image
                    : `${API_BASE}${d.image}`;
                } else if (typeof d.image === "object" && d.image.url) {
                  imageSrc = d.image.url.startsWith("http")
                    ? d.image.url
                    : `${API_BASE}${d.image.url}`;
                }
              }

              return (
                <div key={info.id} className="extra-data">
                  {d.title && <h2>{sanitizeData(d.title)}</h2>}

                  {d.labInCharge && (
                    <p>
                      <strong>Lab In-Charge:</strong>
                      <br />
                      {sanitizeData(d.labInCharge)}
                    </p>
                  )}

                  {(d.specimenType || d.otherSpecimen) && (
                    <p>
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
                    </p>
                  )}

                  {d.form && (d.form.text || d.form.url) && (
                    <p>
                      <strong>Form:</strong> <br />
                      {d.form.url ? (
                        <a
                          href={sanitizeData(d.form.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#007bff",
                            textDecoration: "underline",
                          }}
                        >
                          {sanitizeData(d.form.text || d.form.url)}
                        </a>
                      ) : (
                        sanitizeData(d.form.text)
                      )}
                    </p>
                  )}

                  {d.TAT && (
                    <p>
                      <strong>TAT:</strong>
                      <br />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: sanitizeData(d.TAT).replace(/\n/g, "<br />"),
                        }}
                      />
                    </p>
                  )}

                  {imageSrc && (
                    <div
                      className="image-section"
                      style={{ marginBottom: "0px" }}
                    >
                      <p style={{ marginBottom: "2px", lineHeight: "1" }}>
                        <strong>Container:</strong>
                      </p>
                      <img
                        src={imageSrc}
                        alt={d.containerLabel || "Container"}
                        style={{
                          maxWidth: "250px",
                          display: "block",
                          marginBottom: "0px",
                          marginTop: "0px",
                        }}
                      />
                    </div>
                  )}

                  {d.containerLabel && (
                    <p style={{ marginTop: "2px", lineHeight: "1" }}>
                      {sanitizeData(d.containerLabel)}
                    </p>
                  )}

                  {d.sampleVolume && (
                    <p>
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
                    </p>
                  )}

                  {d.description && (
                    <div
                      className="rich-text-content"
                      dangerouslySetInnerHTML={{ __html: d.description }}
                    />
                  )}

                  {d.remark && (
                    <div>
                      <p style={{ marginTop: "5px", marginBottom: "0" }}>
                        <strong>Remark:</strong>
                      </p>
                      <div
                        dangerouslySetInnerHTML={{ __html: d.remark }}
                        style={{ margin: 0, lineHeight: 0 }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No test infos available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrevTestInfoPage;
