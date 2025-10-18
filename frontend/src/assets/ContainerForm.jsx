import React, { useState, useEffect } from "react";
import "../css/ContainerForm.css";
import RichTextEditor from "./RichTextEditor";
import { IoIosRemoveCircleOutline, IoIosRemoveCircle } from "react-icons/io";
import { ImageUploader } from "./ImageUploader";

function ContainerForm({ fields = {}, setFields, onRemove, isFirst }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const [formData, setFormData] = useState({
    title: fields.title || "",
    description: fields.description || "",
    image: null,
    imageFileName: fields.imageFileName || null,
  });

  const [isHover, setIsHover] = useState(false);

  // Safely handle fields update
  useEffect(() => {
    const imageValue =
      typeof fields.image === "string"
        ? fields.image.startsWith("http")
          ? fields.image
          : `${API_BASE}${fields.image}`
        : fields.image || null;

    setFormData({
      title: fields.title || "",
      description: fields.description || "",
      image: imageValue,
      imageFileName: fields.imageFileName || null,
    });
  }, [fields]);

  const handleChange = (key, value, fileName = null) => {
    const updated = { ...formData, [key]: value };
    if (fileName) updated.imageFileName = fileName;
    setFormData(updated);
    setFields(updated);
  };

  return (
    <div className="add-form-container">
      <div className="form-header">
        <h2>Container</h2>

        {!isFirst && (
          <button
            type="button"
            onClick={onRemove}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="remove-button"
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

      <div className="add-form-group">
        <label>Image</label>
        <ImageUploader
          value={formData.image}
          fileName={formData.imageFileName}
          onChange={(val, fileName) => handleChange("image", val, fileName)}
        />
      </div>

      <div className="add-form-group">
        <label>Description</label>
        <RichTextEditor
          value={formData.description}
          onChange={(val) => handleChange("description", val)}
        />
      </div>
    </div>
  );
}

export default ContainerForm;
