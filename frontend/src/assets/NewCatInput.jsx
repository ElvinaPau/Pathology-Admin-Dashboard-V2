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
      inputRef.current.focus(); // Automatically focus the input
    }
  }, []);

  return (
    <div className="input-overlay">
      <div className="input-card">
        <h3>{title}</h3>
        <input
          ref={inputRef}
          className="input-text"
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder={placeholder}
        />
        <div className="input-card-buttons">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onSubmit}>Add</button>
        </div>
      </div>
    </div>
  );
}

export default NewCatInput;
