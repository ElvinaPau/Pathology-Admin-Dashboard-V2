import React, { useEffect, useRef, useState } from "react";
import { UploadCloud, ImagePlus, X } from "lucide-react";
import "../css/ImageUploader.css";

function ImageUploader({
  accept = "image/*",
  maxSizeMB = 10,
  onChange = () => {},
  className = "",
  initiallySelected = null,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [item, setItem] = useState(
    initiallySelected
      ? { file: initiallySelected, url: URL.createObjectURL(initiallySelected) }
      : null
  );

  const maxBytes = maxSizeMB * 1024 * 1024;

  const validate = (file) => {
    if (accept && accept !== "*") {
      const types = accept.split(",").map((t) => t.trim());
      const ok = types.some((t) => {
        if (t.endsWith("/*")) {
          return file.type.startsWith(t.replace("/*", "/"));
        }
        return (
          file.type === t || file.name.toLowerCase().endsWith(t.toLowerCase())
        );
      });
      if (!ok) return `Unsupported type: ${file.type || file.name}`;
    }
    if (file.size > maxBytes) {
      return `Too large: ${(file.size / 1024 / 1024).toFixed(
        1
      )} MB (max ${maxSizeMB} MB)`;
    }
    return "";
  };

  const addFile = (file) => {
    const err = validate(file);
    if (err) {
      setError(err);
      if (inputRef.current) inputRef.current.value = ""; // reset input
      return;
    }
    if (item) URL.revokeObjectURL(item.url);
    const next = { file, url: URL.createObjectURL(file) };
    setItem(next);
    setError("");
    onChange(file);
    if (inputRef.current) inputRef.current.value = ""; // reset input
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      addFile(e.dataTransfer.files[0]);
    }
  };

  const onBrowse = () => inputRef.current?.click();

  const removeFile = () => {
    if (item) URL.revokeObjectURL(item.url);
    setItem(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = ""; // reset input
  };

  useEffect(() => {
    return () => {
      if (item) URL.revokeObjectURL(item.url);
    };
  }, [item]);

  return (
    <div className={`uploader-container ${className}`}>
      {!item ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onBrowse}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onBrowse()}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={onDrop}
          className="dropzone"
        >
          <UploadCloud className="icon" aria-hidden="true" />
          <div>
            <p className="title">Drag & drop an image here</p>
            <p className="subtitle">or</p>
          </div>
          <div className="browse-wrapper">
            <button type="button" onClick={onBrowse} className="browse-btn">
              <ImagePlus className="btn-icon" aria-hidden="true" />
              Browse file
            </button>
            <span className="hint">Max {maxSizeMB} MB</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden-input"
            onChange={(e) => e.target.files && addFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="preview-item">
          <img src={item.url} alt={item.file.name} className="preview-img" />
          <div className="preview-info">
            <span className="file-name" title={item.file.name}>
              {item.file.name}
            </span>
            <button
              type="button"
              aria-label={`Remove ${item.file.name}`}
              onClick={removeFile}
              className="remove-btn"
            >
              <X className="remove-icon" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="error-list">{error}</p>}
    </div>
  );
}

export default function DemoImageUploader() {
  const [file, setFile] = useState(null);

  return (
    <div className="demo-wrapper">
      <h1 className="demo-title">Upload an image</h1>
      <p className="demo-subtitle">
        Drag & drop or click “Browse file”. Replace it after removing.
      </p>

      <ImageUploader
        maxSizeMB={10}
        accept="image/*,.png,.jpg,.jpeg,.gif,.webp"
        onChange={setFile}
      />

      {file && (
        <div className="file-list">
          <p className="list-title">Selected file:</p>
          <ul>
            <li>
              {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export { ImageUploader };
