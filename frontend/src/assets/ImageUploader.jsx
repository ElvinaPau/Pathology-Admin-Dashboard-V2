import React, { useEffect, useRef, useState } from "react";
import { UploadCloud, ImagePlus, X } from "lucide-react";
import "../css/ImageUploader.css";

function ImageUploader({
  accept = "image/*",
  maxSizeMB = 10,
  onChange = () => {},
  className = "",
  initiallySelected = null,
  value = null,
  fileName = null,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [item, setItem] = useState(null);
  const currentValueRef = useRef(null);
  const isInternalUpdate = useRef(false);

  const maxBytes = maxSizeMB * 1024 * 1024;

  // Initialize from initiallySelected prop
  useEffect(() => {
    if (initiallySelected) {
      const url = URL.createObjectURL(initiallySelected);
      setItem({ file: initiallySelected, url });
      currentValueRef.current = initiallySelected;
    }
  }, [initiallySelected]);

  // Sync with external value prop (for editing mode)
  useEffect(() => {
    // Skip if this is an internal update (we just called onChange ourselves)
    if (isInternalUpdate.current) {
      // Reset the flag for next time, but AFTER this render cycle
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
      return;
    }

    // Skip if this is the same value we already have
    if (value === currentValueRef.current) {
      return;
    }

    if (!value) {
      // Clear if value is null/undefined
      if (item && item.url && item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      setItem(null);
      currentValueRef.current = null;
      return;
    }

    // Clean up old URL if it's a blob
    if (item && item.url && item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }

    if (value instanceof File) {
      // New file upload from external source
      const url = URL.createObjectURL(value);
      setItem({ file: value, url });
      currentValueRef.current = value;
    } // In the useEffect that syncs with external value prop:
    else if (typeof value === "string") {
      // Existing image URL from database
      // Use original filename if available in parent component
      setItem({
        file: { name: "Image" }, // Will be overridden by parent if filename provided
        url: value,
        isExisting: true,
      });
      currentValueRef.current = value;
    }
  }, [value, item]);

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
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Clean up old URL
    if (item && item.url && item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }

    const url = URL.createObjectURL(file);
    const next = { file, url };

    // Set the flag to prevent useEffect from running
    isInternalUpdate.current = true;
    currentValueRef.current = file;

    setItem(next);
    setError("");
    onChange(file);

    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      addFile(e.dataTransfer.files[0]);
    }
  };

  const onBrowse = () => inputRef.current?.click();

  const removeFile = () => {
    if (item && item.url && item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }

    // Set the flag to prevent useEffect from running
    isInternalUpdate.current = true;
    currentValueRef.current = null;

    setItem(null);
    onChange(null);

    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (item && item.url && item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    };
  }, [item]);

  // Get display name safely
  const getDisplayName = () => {
    if (!item) return "";
    // Use provided fileName prop first
    if (fileName) return fileName;
    if (item.file instanceof File) return item.file.name;
    if (item.file && item.file.name) return item.file.name;
    return "Image";
  };

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
            <p className="title">Click to upload</p>
          </div>
          <div className="browse-wrapper">
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
          <img src={item.url} alt={getDisplayName()} className="preview-img" />
          <div className="preview-info">
            <span className="file-name" title={getDisplayName()}>
              {getDisplayName()}
            </span>
            <button
              type="button"
              aria-label={`Remove ${getDisplayName()}`}
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

export { ImageUploader };
