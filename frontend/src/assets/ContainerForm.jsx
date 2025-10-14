import React, { useState } from "react";
import "../css/ContainerForm.css";
import RichTextEditor from "./RichTextEditor";
import { IoIosRemoveCircleOutline, IoIosRemoveCircle } from "react-icons/io";
import { ImageUploader } from "./ImageUploader";

function ContainerForm({ index, infos = [], setInfos, onRemove, isFirst }) {
  const [formData, setFormData] = useState({
    title: infos[index]?.fields?.title || "",
    description: infos[index]?.fields?.description || "",
    image: infos[index]?.fields?.image || null,
  });

  const [isHover, setIsHover] = useState(false);

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);

    setInfos((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], fields: updated };
      return copy;
    });
  };

  return (
    <div className="add-form-container">
      <div className="form-header">
        <h2>Container</h2>

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

      <div className="add-form-group">
        <label>Image</label>
        <ImageUploader
          value={formData.image}
          onChange={(val) => handleChange("image", val)}
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

export default ContainerForm;