import React, { useState, useEffect } from "react";
import "../css/LabTestForm.css";
import RichTextEditor from "./RichTextEditor";
import { IoIosRemoveCircleOutline, IoIosRemoveCircle } from "react-icons/io";
import { ImageUploader } from "./ImageUploader";
import Select from "react-select";
import axios from "axios";

function LabTestForm({ fields = {}, setFields, onRemove, isFirst }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const [formData, setFormData] = useState({
    labInCharge: fields.labInCharge || "",
    specimenType: Array.isArray(fields.specimenType)
      ? fields.specimenType
      : fields.specimenType
      ? [fields.specimenType]
      : [],
    otherSpecimen: fields.otherSpecimen || "",
    form: fields.form || { text: "", url: "", isCustom: false },
    TAT: fields.TAT || "",
    containerLabel: fields.containerLabel || "",
    sampleVolume: fields.sampleVolume || "",
    remark: fields.remark || "",
    image: null,
    imageFileName: fields.imageFileName || null,
  });

  const [isHover, setIsHover] = useState(false);
  const [availableForms, setAvailableForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [formsError, setFormsError] = useState(null);

  // Fetch forms from API
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setFormsLoading(true);
        const res = await axios.get(`${API_BASE}/api/forms`);
        setAvailableForms(res.data);
        setFormsError(null);
      } catch (err) {
        console.error("Error fetching forms:", err);
        setFormsError("Failed to load forms");
      } finally {
        setFormsLoading(false);
      }
    };

    fetchForms();
  }, [API_BASE]);

  // Update formData when fields prop changes
  useEffect(() => {
    const imageValue =
      typeof fields.image === "string"
        ? fields.image.startsWith("http")
          ? fields.image
          : `${API_BASE}${fields.image}`
        : fields.image || null;

    setFormData({
      labInCharge: fields.labInCharge || "",
      specimenType: Array.isArray(fields.specimenType)
        ? fields.specimenType
        : fields.specimenType
        ? [fields.specimenType]
        : [],
      otherSpecimen: fields.otherSpecimen || "",
      form: fields.form || { text: "", url: "", isCustom: false },
      TAT: fields.TAT || "",
      containerLabel: fields.containerLabel || "",
      sampleVolume: fields.sampleVolume || "",
      remark: fields.remark || "",
      image: imageValue,
      imageFileName: fields.imageFileName || null,
    });
  }, [fields, API_BASE]);

  const handleChange = (key, value, fileName = null) => {
    const updated = { ...formData, [key]: value };
    if (fileName) updated.imageFileName = fileName;
    setFormData(updated);
    setFields(updated); // Send data to parent
  };

  return (
    <div className="add-form-container">
      <div className="form-header">
        <h2>Lab Test</h2>

        {!isFirst && (
          <button
            onClick={onRemove}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            {isHover ? (
              <IoIosRemoveCircle size={22} />
            ) : (
              <IoIosRemoveCircleOutline size={22} />
            )}
          </button>
        )}
      </div>

      <div className="container">
        <div className="left">
          <div className="side-by-side">
            <div className="add-form-group">
              <label>Lab in-charge</label>
              <select
                value={formData.labInCharge}
                onChange={(e) => handleChange("labInCharge", e.target.value)}
              >
                <option value="">Select</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Histopathology">Histopathology</option>
                <option value="Cytology">Cytology</option>
                <option value="Integrated">Integrated</option>
                <option value="Chemical Pathology">Chemical Pathology</option>
                <option value="Haematology">Haematology</option>
              </select>
            </div>

            <div className="add-form-group">
              <label>Specimen Type(s)</label>
              <Select
                isMulti
                options={[
                  { value: "Blood (plasma)", label: "Blood (plasma)" },
                  { value: "Blood (serum)", label: "Blood (serum)" },
                  { value: "Body fluid", label: "Body fluid" },
                  { value: "CSF", label: "CSF" },
                  { value: "Smear", label: "Smear" },
                  { value: "Stool", label: "Stool" },
                  { value: "Urine, random", label: "Urine, random" },
                  { value: "Urine, 24-hr", label: "Urine, 24-hr" },
                  { value: "Whole blood", label: "Whole blood" },
                  { value: "Others...", label: "Others..." },
                ]}
                value={formData.specimenType.map((val) => ({
                  value: val,
                  label: val,
                }))}
                onChange={(selected) => {
                  const values = selected ? selected.map((s) => s.value) : [];
                  handleChange("specimenType", values);
                }}
                classNamePrefix="react-select"
                placeholder="Select"
              />

              {/* Show textarea only if "Others" is selected */}
              {formData.specimenType.includes("Others...") && (
                <textarea
                  value={formData.otherSpecimen || ""}
                  onChange={(e) =>
                    handleChange("otherSpecimen", e.target.value)
                  }
                  placeholder="Please specify other specimen type(s)..."
                  rows={2}
                  style={{ resize: "vertical", marginTop: "8px" }}
                />
              )}
            </div>
          </div>

          <div className="side-by-side">
            <div className="add-form-group">
              <label>Form</label>

              {formsLoading ? (
                <p style={{ fontSize: "14px", color: "#666", margin: "8px 0" }}>
                  Loading forms...
                </p>
              ) : formsError ? (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#d32f2f",
                    margin: "8px 0",
                  }}
                >
                  {formsError}
                </p>
              ) : (
                <>
                  {/* Dropdown selector */}
                  <select
                    value={
                      formData.form?.isCustom
                        ? "Others..."
                        : formData.form?.text || ""
                    }
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (selectedValue === "Others...") {
                        handleChange("form", {
                          text: "",
                          url: "",
                          isCustom: true,
                        });
                      } else if (selectedValue === "") {
                        handleChange("form", {
                          text: "",
                          url: "",
                          isCustom: false,
                        });
                      } else {
                        const selectedForm = availableForms.find(
                          (f) => f.link_text === selectedValue
                        );
                        if (selectedForm) {
                          handleChange("form", {
                            text: selectedForm.link_text,
                            url: selectedForm.form_url,
                            isCustom: false,
                          });
                        }
                      }
                    }}
                  >
                    <option value="">Select a form</option>
                    {availableForms
                      .filter((f) => f.status !== "deleted")
                      .map((form) => (
                        <option key={form.id} value={form.link_text}>
                          {form.link_text}
                        </option>
                      ))}
                    <option value="Others...">Others...</option>
                  </select>

                  {/* Show manual input only when "Others..." is selected */}
                  {formData.form?.isCustom && (
                    <>
                      <input
                        type="text"
                        placeholder="Text to display"
                        value={formData.form?.text || ""}
                        onChange={(e) => {
                          const newForm = {
                            text: e.target.value,
                            url: formData.form?.url || "",
                            isCustom: true,
                          };
                          handleChange("form", newForm);
                        }}
                        style={{ marginTop: "8px" }}
                      />

                      <input
                        type="url"
                        placeholder="Link URL (https://...)"
                        value={formData.form?.url || ""}
                        onChange={(e) => {
                          const newForm = {
                            text: formData.form?.text || "",
                            url: e.target.value,
                            isCustom: true,
                          };
                          handleChange("form", newForm);
                        }}
                        style={{ marginTop: "8px" }}
                      />
                    </>
                  )}

                  {/* Show link preview */}
                  {formData.form?.url && (
                    <a
                      href={formData.form.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        color: "#007bff",
                        textDecoration: "underline",
                      }}
                    >
                      {formData.form.text || formData.form.url}
                    </a>
                  )}
                </>
              )}
            </div>

            <div className="add-form-group">
              <label>TAT</label>
              <textarea
                value={formData.TAT}
                onChange={(e) => handleChange("TAT", e.target.value)}
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          <div className="add-form-group">
            <label>Container Label</label>
            <input
              type="text"
              value={formData.containerLabel}
              onChange={(e) => handleChange("containerLabel", e.target.value)}
            />
          </div>
        </div>

        <div className="right">
          <div className="add-form-group">
            <label>Sample Volume</label>
            <textarea
              value={formData.sampleVolume}
              onChange={(e) => handleChange("sampleVolume", e.target.value)}
              rows={4}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="add-form-group">
            <label>Container</label>
            <ImageUploader
              value={formData.image}
              fileName={formData.imageFileName}
              onChange={(val, fileName) => handleChange("image", val, fileName)}
            />
          </div>
        </div>
      </div>

      <div>
        <label style={{ fontWeight: 600 }}>Remark</label>
        <RichTextEditor
          value={formData.remark}
          onChange={(val) => handleChange("remark", val)}
        />
      </div>
    </div>
  );
}

export default LabTestForm;
