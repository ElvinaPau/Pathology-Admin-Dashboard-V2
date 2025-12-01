import React, { useState, useEffect } from "react";
import "../css/BasicForm.css";
import RichTextEditor from "./RichTextEditor";
import { IoIosRemoveCircleOutline, IoIosRemoveCircle } from "react-icons/io";

function BasicForm({ fields = {}, setFields, onRemove, isFirst }) {
  const [formData, setFormData] = useState({
    title: fields.title || "",
    description: fields.description || "",
  });

  useEffect(() => {
    // sync when parent changes (e.g., when editing existing data)
    setFormData({
      title: fields.title || "",
      description: fields.description || "",
    });
  }, [fields]);

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFields(updated); // send data to parent
  };

  return (
    <div className="add-form-container">
      <div className="form-header">
        <h2>Basic</h2>
        {!isFirst && (
          <button
            onClick={onRemove}
            onMouseEnter={(e) => e.currentTarget.classList.add("hover")}
            onMouseLeave={(e) => e.currentTarget.classList.remove("hover")}
          >
            <IoIosRemoveCircleOutline size={22} />
          </button>
        )}
      </div>

      <div className="add-form-group">
        <label className="form-label">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div>
        <label className="form-label">Description</label>
        <RichTextEditor
          value={formData.description}
          onChange={(val) => handleChange("description", val)}
        />
      </div>
    </div>
  );
}

export default BasicForm;