import React, { useState } from "react";
import "../css/BasicForm.css";
import RichTextEditor from "./RichTextEditor";
import { IoIosRemoveCircleOutline, IoIosRemoveCircle } from "react-icons/io";

function BasicForm({ onRemove, isFirst }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [isHover, setIsHover] = useState(false);

  return (
    <div className="add-form-container">
      <div className="form-header">
        <h2>Basic</h2>

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

      <div className="add-form-group">
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <label>Description</label>
        <RichTextEditor />
      </div>
    </div>
  );
}

export default BasicForm;
