import React, { useState, useEffect } from "react";
import "../css/LabTestForm.css";
import RichTextEditor from "./RichTextEditor";
import { IoIosRemoveCircleOutline, IoIosRemoveCircle } from "react-icons/io";
import { ImageUploader } from "./ImageUploader";

function LabTestForm({ fields = {}, setFields, onRemove, isFirst }) {
  const [formData, setFormData] = useState({
    title: fields.title || "",
    description: fields.description || "",
    labInCharge: fields.labInCharge || "",
    specimenType: fields.specimenType || "",
    form: fields.form || "",
    TAT: fields.TAT || "",
    containerLabel: fields.containerLabel || "",
    sampleVolume: fields.sampleVolume || "",
    remark: fields.remark || "",
    containerImage: fields.containerImage || null,
    containerImageFileName: fields.containerImageFileName || null, // Add this
  });

  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    const API_BASE = "http://localhost:5001";

    setFormData({
      title: fields.title || "",
      description: fields.description || "",
      labInCharge: fields.labInCharge || "",
      specimenType: fields.specimenType || "",
      form: fields.form || "",
      TAT: fields.TAT || "",
      containerLabel: fields.containerLabel || "",
      sampleVolume: fields.sampleVolume || "",
      remark: fields.remark || "",
      containerImage: fields.containerImage
        ? fields.containerImage.startsWith("http")
          ? fields.containerImage
          : `${API_BASE}${fields.containerImage}`
        : null,
      containerImageFileName: fields.containerImageFileName || null,
    });
  }, [fields]);

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
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
          <div className="add-form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="side-by-side">
            <div className="add-form-group">
              <label>Lab in-charge</label>
              <select
                value={formData.labInCharge}
                onChange={(e) => handleChange("labInCharge", e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="blood">Blood</option>
                <option value="urine">Urine</option>
              </select>
            </div>

            <div className="add-form-group">
              <label>Specimen Type</label>
              <textarea
                value={formData.specimenType}
                onChange={(e) => handleChange("specimenType", e.target.value)}
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          <div className="side-by-side">
            <div className="add-form-group">
              <label>Form</label>
              <select
                value={formData.form}
                onChange={(e) => handleChange("form", e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="blood">Blood</option>
                <option value="urine">Urine</option>
              </select>
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
            <select
              value={formData.containerLabel}
              onChange={(e) => handleChange("containerLabel", e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="blood">Blood</option>
              <option value="urine">Urine</option>
            </select>
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
              value={formData.containerImage}
              fileName={formData.containerImageFileName}
              onChange={(val) => {
                if (val instanceof File) {
                  handleChange("containerImage", val);
                  handleChange("containerImageFileName", val.name);
                } else {
                  handleChange("containerImage", val);
                  handleChange("containerImageFileName", null);
                }
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <label style={{ fontWeight: 600 }}>Description</label>
        <RichTextEditor
          value={formData.description}
          onChange={(val) => handleChange("description", val)}
        />
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
