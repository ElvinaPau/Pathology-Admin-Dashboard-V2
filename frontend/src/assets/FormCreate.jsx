import React, { useState, useEffect } from "react";
import Select from "react-select";
import "../css/FormCreate.css";
import axios from "axios";

function FormCreate({ onClose, onSuccess, formToEdit }) {
  const [formData, setFormData] = useState({
    field: [],
    title: "",
    form_url: "",
    link_text: "",
    otherField: "",
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  // Pre-fill when editing
  useEffect(() => {
    if (formToEdit) {
      const existingFields = formToEdit.field
        ? formToEdit.field.split(",").map((f) => f.trim())
        : [];
      setFormData({
        field: existingFields,
        title: formToEdit.title || "",
        form_url: formToEdit.form_url || "",
        link_text: formToEdit.link_text || "",
        otherField: "",
      });
    }
  }, [formToEdit]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let combinedFields = [...formData.field];

      // If "Others..." is selected, add otherField text
      if (formData.field.includes("Others...") && formData.otherField.trim()) {
        combinedFields = combinedFields
          .filter((f) => f !== "Others...")
          .concat(formData.otherField.split(",").map((v) => v.trim()));
      }

      const payload = {
        ...formData,
        field: combinedFields.join(", "),
      };

      if (formToEdit) {
        // EDIT mode
        await axios.put(`${API_BASE}/api/forms/${formToEdit.id}`, payload);
      } else {
        // CREATE mode
        await axios.post(`${API_BASE}/api/forms`, payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error saving form:", err);
      alert("Failed to save form.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>{formToEdit ? "Edit Form" : "Add New Form"}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Field(s)</label>
            <Select
              isMulti
              options={[
                { value: "General form", label: "General form" },
                { value: "Chemical Pathology", label: "Chemical Pathology" },
                { value: "IMR", label: "IMR" },
                { value: "Histopathology", label: "Histopathology" },
                { value: "Cytology", label: "Cytology" },
                { value: "Cytopathology", label: "Cytopathology" },
                { value: "MKAK", label: "MKAK" },
                { value: "Molecular", label: "Molecular" },
                { value: "Hematology", label: "Hematology" },
                { value: "Serology", label: "Serology" },
                {
                  value:
                    "Clinical Haematology Referral Laboratory, Ampang",
                  label:
                    "Clinical Haematology Referral Laboratory, Ampang",
                },
                {
                  value: "Hospital Tunku Azizah",
                  label: "Hospital Tunku Azizah",
                },
                { value: "Bacteriology", label: "Bacteriology" },
                { value: "Others...", label: "Others..." },
              ]}
              value={formData.field.map((val) => ({
                value: val,
                label: val,
              }))}
              onChange={(selected) => {
                const values = selected.map((s) => s.value);
                handleChange("field", values);
              }}
              classNamePrefix="react-select"
              placeholder="Select"
              
            />

            {/* Show textarea if Others selected */}
            {formData.field.includes("Others...") && (
              <textarea
                value={formData.otherField}
                onChange={(e) => handleChange("otherField", e.target.value)}
                placeholder="Please specify other field(s)..."
                rows={3}
                style={{
                  resize: "vertical",
                  marginTop: "8px",
                  width: "100%",
                }}
              />
            )}
          </div>

          <label>
            Form Title
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </label>

          <label>
            Form URL
            <input
              type="url"
              value={formData.form_url}
              onChange={(e) => handleChange("form_url", e.target.value)}
              required
            />
          </label>

          <label>
            Link Text To Display
            <input
              type="text"
              value={formData.link_text}
              onChange={(e) => handleChange("link_text", e.target.value)}
              placeholder="e.g. Borang A"
            />
          </label>

          <div className="button-row">
            <button type="submit">{formToEdit ? "Update" : "Save"}</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormCreate;
