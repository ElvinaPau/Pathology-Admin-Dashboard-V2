import React, { useState } from "react";
import "../css/LabTestForm.css";
import RichTextEditor from "./RichTextEditor";
import { IoIosRemoveCircleOutline, IoIosRemoveCircle } from "react-icons/io";
import { ImageUploader } from "./ImageUploader";

function LabTestForm({ onRemove, isFirst }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [isHover, setIsHover] = useState(false);

  return (
    <div className="add-form-container">
      <div className="form-header">
        <h2>Lab Test</h2>

        {/* ❌ Remove button (disabled for the first form) */}
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
                onChange={(e) =>
                  setFormData({ ...formData, labInCharge: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, specimenType: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, form: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, TAT: e.target.value })
                }
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
          <div className="add-form-group">
            <label>Container Label</label>
            <select
              value={formData.containerLabel}
              onChange={(e) =>
                setFormData({ ...formData, containerLabel: e.target.value })
              }
              required
            >
              <option value="">Select</option>
              <option value="blood">Blood</option>
              <option value="urine">Urine</option>
            </select>
          </div>
          <div>
            <label>Remark</label>
            <RichTextEditor />
          </div>
        </div>

        <div className="right">
          <div className="add-form-group">
            <label>Sample Volume</label>
            <textarea
              value={formData.sampleVolume}
              onChange={(e) =>
                setFormData({ ...formData, sampleVolume: e.target.value })
              }
              rows={2}
              style={{ resize: "vertical" }}
            />
          </div>
          <div className="add-form-group">
            <label>Container</label>
            <ImageUploader />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabTestForm;
