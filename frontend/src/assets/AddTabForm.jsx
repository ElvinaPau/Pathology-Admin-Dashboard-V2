import React, { useState, useEffect, useRef } from "react";
import "../css/AddTabForm.css";
import BasicForm from "./BasicForm";
import LabTestForm from "./LabTestForm";
import HomePageHeader from "../assets/HomePageHeader";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams, useNavigate } from "react-router-dom";
import { useNavigation } from "../context/NavigationContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
  Math.random().toString(36).slice(2, 9);

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function getFormComponent(type) {
  switch (type) {
    case "Basic":
      return BasicForm;
    case "Lab Test":
      return LabTestForm;
    default:
      return BasicForm;
  }
}

function AddTabForm() {
  const { currentUser } = useAuth();
  const { id, testId } = useParams();
  const navigate = useNavigate();
  const { isNavExpanded } = useNavigation();
  const lastFormRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    infoType: "",
    infos: [{ id: uid(), type: "", fields: [] }],
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  // Fetch category name
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/categories/${id}`);
        setFormData((prev) => ({ ...prev, category: res.data.name }));
      } catch (err) {
        console.error("Error fetching category:", err);
      }
    };
    fetchCategory();
  }, [id]);

  // Fetch test data if editing
  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/tests/${testId}?includeinfos=true`
        );
        const test = res.data;

        if (!test) {
          alert("Test not found");
          return;
        }

        setFormData((prev) => ({
          ...prev,
          name: test.name,
          category: test.categoryName,
          infoType: test.infoTypes?.[0] || "",
          infos: (test.infos || []).map((info) => {
            const fields = {
              title: info.title || "",
              description: info.description || "",
              image: info.imageUrl || null,
              imageFileName: info.extraData?.imageFileName || null,
              ...info.extraData,
            };
            return {
              id: uid(),
              type: info.type || "",
              fields: fields,
            };
          }),
        }));
      } catch (err) {
        console.error("Error fetching test data:", err);
        alert("Failed to load test for editing");
      }
    };

    fetchTest();
  }, [testId]);

  const addBasicForm = () => {
    if (!formData.infoType) {
      alert("Please select an Info Type first.");
      return;
    }

    const newForm = { id: uid(), type: "Basic", fields: {} };

    setFormData((prev) => ({
      ...prev,
      infos: [...prev.infos, newForm],
    }));

    setTimeout(() => {
      lastFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      if (lastFormRef.current) {
        lastFormRef.current.classList.add("newly-added");
        setTimeout(
          () => lastFormRef.current?.classList.remove("newly-added"),
          1200
        );
      }
    }, 100);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    if (result.source.index === 0 || result.destination.index === 0) return;

    setFormData((prev) => {
      const reordered = reorder(
        prev.infos,
        result.source.index,
        result.destination.index
      );
      return { ...prev, infos: reordered };
    });
  };

  const handleSaveAll = async () => {
    try {
      if (!formData.name.trim()) {
        alert("Please enter a Test / Tab name.");
        return;
      }
      if (!formData.infoType) {
        alert("Please select an Info Type.");
        return;
      }

      // Process infos and upload images
      const processedInfos = await Promise.all(
        formData.infos.map(async (group, index) => {
          const actualType =
            index === 0 ? group.type || formData.infoType : "Basic";

          let title = group.fields?.title || "";
          let description = group.fields?.description || "";
          let imageUrl = null;
          let uploadedUrl = null;
          let originalFileName = null;

          // Image upload handling
          if (group.fields?.image instanceof File) {
            originalFileName = group.fields.image.name;
            const uploadFormData = new FormData();
            uploadFormData.append("image", group.fields.image);
            try {
              const res = await axios.post(
                `${API_BASE}/api/uploads/image`,
                uploadFormData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );
              imageUrl = res.data.url;
              uploadedUrl = res.data.url;
            } catch (err) {
              console.error("Image upload failed:", err);
              imageUrl = null;
            }
          } else if (typeof group.fields?.image === "string") {
            imageUrl = group.fields.image;
            originalFileName = group.fields?.imageFileName || null;
          }

          // Update the fields with uploaded image URL for immediate preview
          const updatedFields = {
            ...group.fields,
            image: imageUrl,
            imageFileName: originalFileName,
          };

          return {
            type: actualType,
            title,
            description,
            image_url: imageUrl,
            extra_data: updatedFields,
            uploadedUrl,
            originalFileName,
            index,
          };
        })
      );

      // Update local formData with uploaded image URLs so preview reflects changes
      setFormData((prev) => ({
        ...prev,
        infos: prev.infos.map((info, index) => ({
          ...info,
          type: index === 0 ? prev.infoType : "Basic",
          fields: processedInfos[index].extra_data,
        })),
      }));

      // Prepare payload for API
      const payload = {
        name: formData.name,
        category_id: id,
        updated_by: currentUser?.username || currentUser?.full_name || "Admin",
        status: "active",
        infos: processedInfos.map(
          ({ uploadedUrl, originalFileName, index, ...info }) => info
        ),
      };

      // Save or update test
      if (testId) {
        await axios.put(`${API_BASE}/api/tests/${testId}`, payload);
        alert("Test updated successfully!");
      } else {
        await axios.post(`${API_BASE}/api/tests`, payload);
        alert("Test created successfully!");
      }

      // Show preview mode
      setIsPreviewMode(true);
    } catch (err) {
      console.error("Error saving test:", err);
      alert("Failed to save test. Check console for details.");
    }
  };

  if (isPreviewMode) {
    return (
      <div
        className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}
      >
        <HomePageHeader />
        <div className="prev-header">
          <div className="prev-header-title">
            <div className="prev-page-title">{formData.name}</div>
          </div>

          {/* Card-based preview */}
          <div className="preview-cards-container">
            {formData.infos.map((info, index) => {
              const d = info.fields || {};
              const imageSrc =
                d.image && typeof d.image === "string"
                  ? d.image.startsWith("http")
                    ? d.image
                    : `${API_BASE}${d.image}`
                  : null;

              return (
                <div key={index} className="preview-info-card">
                  {d.title && <h2 className="preview-card-title">{d.title}</h2>}

                  {d.labInCharge && (
                    <div className="preview-card-section">
                      <strong>Lab In-Charge:</strong>
                      <br />
                      {d.labInCharge}
                    </div>
                  )}

                  {(d.specimenType || d.otherSpecimen) && (
                    <div className="preview-card-section">
                      <strong>Specimen Type:</strong>
                      <br />
                      {[
                        ...(Array.isArray(d.specimenType)
                          ? d.specimenType.filter((t) => t !== "Others...")
                          : [d.specimenType].filter(
                              (t) => t && t !== "Others..."
                            )),
                        d.otherSpecimen,
                      ]
                        .filter(Boolean)
                        .map((type, i) => (
                          <React.Fragment key={i}>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: type.replace(/\n/g, "<br />"),
                              }}
                            />
                            <br />
                          </React.Fragment>
                        ))}
                    </div>
                  )}

                  {d.form && (d.form.text || d.form.url) && (
                    <div className="preview-card-section">
                      <strong>Form:</strong>
                      <br />
                      {d.form.url ? (
                        <a
                          href={d.form.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#007bff",
                            textDecoration: "underline",
                          }}
                        >
                          {d.form.text || d.form.url}
                        </a>
                      ) : (
                        d.form.text
                      )}
                    </div>
                  )}

                  {d.TAT && (
                    <div className="preview-card-section">
                      <strong>TAT:</strong>
                      <br />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: d.TAT.replace(/\n/g, "<br />"),
                        }}
                      />
                    </div>
                  )}

                  {imageSrc && (
                    <div className="preview-card-section">
                      <strong>Container:</strong>
                      <br />
                      <img
                        src={imageSrc}
                        alt={d.containerLabel || "Container"}
                        className="preview-card-image"
                      />
                    </div>
                  )}

                  {d.containerLabel && (
                    <div className="preview-card-section">
                      {d.containerLabel}
                    </div>
                  )}

                  {d.sampleVolume && (
                    <div className="preview-card-section">
                      <strong>Sample Volume:</strong>
                      <br />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: d.sampleVolume.replace(/\n/g, "<br />"),
                        }}
                      />
                    </div>
                  )}

                  {d.description && (
                    <div
                      className="preview-card-section rich-text-content"
                      dangerouslySetInnerHTML={{ __html: d.description }}
                    />
                  )}

                  {d.remark && (
                    <div className="preview-card-section">
                      <strong>Remark:</strong>
                      <div dangerouslySetInnerHTML={{ __html: d.remark }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="add-form-btn"
            onClick={() => setIsPreviewMode(false)}
          >
            Edit Info
          </button>
          <button
            className="save-all-btn"
            onClick={() => navigate(`/categories/${id}`)}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Normal edit mode
  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />
      <div className="form-page-wrapper">
        <button
          className="back-btn"
          onClick={() => navigate(`/categories/${id}`)}
        >
          Back
        </button>
        <div className="table-title">
          <div className="title-display">
            <div className="home-title">
              {testId ? "Edit Test / Tab" : "Add New Test / Tab"}
            </div>
          </div>
        </div>

        <div className="add-form-container">
          <h2>Test / Tab Information</h2>

          <div className="add-form-group">
            <label className="required">Test / Tab Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="side-by-side">
            <div className="add-form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                readOnly
                className="readonly-input"
              />
            </div>

            <div className="add-form-group">
              <label className="required">Info Type</label>
              <select
                value={formData.infoType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    infoType: newType,
                    infos: prev.infos.map((g, idx) =>
                      idx === 0 ? { ...g, type: newType } : g
                    ),
                  }));
                }}
                required
              >
                <option value="">Select</option>
                <option value="Basic">Basic</option>
                <option value="Lab Test">Lab Test</option>
              </select>
            </div>
          </div>
        </div>

        {(formData.infoType === "Basic" ||
          formData.infoType === "Lab Test") && (
          <div className="basic-form-section">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="infos">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {formData.infos.map((group, index) => {
                      const FormComponent =
                        index === 0
                          ? getFormComponent(group.type)
                          : getFormComponent("Basic");

                      if (index === 0) {
                        return (
                          <div
                            key={group.id}
                            className="draggable-form fixed-first"
                          >
                            <FormComponent
                              fields={group.fields}
                              setFields={(updated) => {
                                setFormData((prev) => {
                                  const newinfos = prev.infos.map((b, i) =>
                                    i === index ? { ...b, fields: updated } : b
                                  );
                                  return { ...prev, infos: newinfos };
                                });
                              }}
                              onRemove={null}
                              isFirst={index === 0}
                            />
                          </div>
                        );
                      }

                      return (
                        <Draggable
                          key={group.id}
                          draggableId={String(group.id)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={
                                index === formData.infos.length - 1
                                  ? (el) => {
                                      lastFormRef.current = el;
                                      provided.innerRef(el);
                                    }
                                  : provided.innerRef
                              }
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="draggable-form"
                            >
                              <FormComponent
                                fields={group.fields}
                                setFields={(updated) => {
                                  setFormData((prev) => {
                                    const newinfos = prev.infos.map((b, i) =>
                                      i === index
                                        ? { ...b, fields: updated }
                                        : b
                                    );
                                    return { ...prev, infos: newinfos };
                                  });
                                }}
                                onRemove={() => {
                                  const confirmed = window.confirm(
                                    "Are you sure you want to remove this form?"
                                  );
                                  if (confirmed) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      infos: prev.infos.filter(
                                        (_, i) => i !== index
                                      ),
                                    }));
                                  }
                                }}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button
              type="button"
              className="add-form-btn"
              onClick={addBasicForm}
            >
              + Add Another Basic Form
            </button>
            <button
              type="button"
              className="save-all-btn"
              onClick={handleSaveAll}
            >
              Save & Preview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddTabForm;
