import React, { useRef, useEffect } from "react";
import "../css/NewCatInput.css";

function NewCatInput({
  title,
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div
      className="input-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="input-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        <span>Category Name:</span>
        <input
          ref={inputRef}
          className="input-text"
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          placeholder={placeholder}
        />
        <div className="input-card-buttons">
          <button onClick={onSubmit}>Add</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default NewCatInput;
