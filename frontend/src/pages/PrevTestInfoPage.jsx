import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HomePageHeader from "../assets/HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
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
          `http://localhost:5001/api/tests/${id}?includeinfos=true`
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

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="prev-page-title">{test.name || "Untitled Test"}</div>

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
                    <strong>Lab In-Charge:</strong>{" "}
                    {sanitizeData(d.labInCharge)}
                  </p>
                )}
                {d.specimenType && (
                  <p>
                    <strong>Specimen Type:</strong>{" "}
                    {sanitizeData(d.specimenType)}
                  </p>
                )}
                {d.form && (
                  <p>
                    <strong>Form:</strong> {sanitizeData(d.form)}
                  </p>
                )}
                {d.TAT && (
                  <p>
                    <strong>TAT:</strong> {sanitizeData(d.TAT)}
                  </p>
                )}
                {d.containerLabel && (
                  <p>
                    <strong>Container Label:</strong>{" "}
                    {sanitizeData(d.containerLabel)}
                  </p>
                )}
                {d.sampleVolume && (
                  <p>
                    <strong>Sample Volume:</strong>{" "}
                    {sanitizeData(d.sampleVolume)}
                  </p>
                )}

                {imageSrc && (
                  <div className="image-section">
                    <img
                      src={imageSrc}
                      alt={d.containerLabel || "Container"}
                      style={{ maxWidth: "250px", margin: "10px 0" }}
                    />
                  </div>
                )}

                {d.description && (
                  <div
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: d.description }}
                  />
                )}

                {d.remark && (
                  <>
                    <h4>Remark:</h4>
                    <div
                      className="rich-text-content"
                      dangerouslySetInnerHTML={{ __html: d.remark }}
                    />
                  </>
                )}
              </div>
            );
          })
        ) : (
          <p>No test infos available</p>
        )}
      </div>
    </div>
  );
}

export default PrevTestInfoPage;
