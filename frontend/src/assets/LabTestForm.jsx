import React, { useState, useEffect } from "react";
import "../css/LabTestForm.css";
import RichTextEditor from "./RichTextEditor";
import { IoIosRemoveCircleOutline, IoIosRemoveCircle } from "react-icons/io";
import { ImageUploader } from "./ImageUploader";

function LabTestForm({ index, infos = [], setInfos, onRemove, isFirst }) {
  const [formData, setFormData] = useState({
    labInCharge: infos[index]?.fields?.labInCharge || "",
    specimenType: infos[index]?.fields?.specimenType || "",
    form: infos[index]?.fields?.form || "",
    TAT: infos[index]?.fields?.TAT || "",
    containerLabel: infos[index]?.fields?.containerLabel || "",
    sampleVolume: infos[index]?.fields?.sampleVolume || "",
    remark: infos[index]?.fields?.remark || "",
    containerImage: infos[index]?.fields?.containerImage || null,
  });

  const [isHover, setIsHover] = useState(false);

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);

    // Update parent infos array at this index
    setInfos((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], fields: updated };
      return copy;
    });
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

          <div>
            <label style={{ fontWeight: 600 }}>Remark</label>
            <RichTextEditor
              value={formData.remark}
              onChange={(val) => handleChange("remark", val)}
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
              value={formData.containerImage}
              onChange={(val) => handleChange("containerImage", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabTestForm;
