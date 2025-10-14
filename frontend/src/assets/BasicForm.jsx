import React, { useState } from "react";
import "../css/BasicForm.css";
import RichTextEditor from "./RichTextEditor";
import { IoIosRemoveCircleOutline, IoIosRemoveCircle } from "react-icons/io";

function BasicForm({ index, infos = [], setInfos, onRemove, isFirst }) {
  const [formData, setFormData] = useState({
    title: infos[index]?.fields?.title || "",
    description: infos[index]?.fields?.description || "",
  });

  const [isHover, setIsHover] = useState(false);

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);

    // Update only this index in the parent infos array
    setInfos((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], fields: updated }; // keep consistent structure
      return copy;
    });
  };

  return (
    <div className="add-form-container">
      <div className="form-header">
        <h2>Basic</h2>

        {/* Remove button (disabled for the first form) */}
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

      <div className="add-form-group">
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div>
        <label>Description</label>
        <RichTextEditor
          value={formData.description}
          onChange={(val) => handleChange("description", val)}
        />
      </div>
    </div>
  );
}

export default BasicForm;
