import { useState, useEffect } from "react";
import "../css/LinkModal.css";

function LinkModal({ isOpen, onClose, onInsert, position, defaultText, defaultUrl }) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setText(defaultText || "");
      setUrl(defaultUrl || "");
    }
  }, [isOpen, defaultText, defaultUrl]);

  const handleInsert = () => {
    if (url) {
      onInsert(text || url, url);
      onClose();
    }
  };

  // Handle Enter key press inside inputs
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent form submit or newline
      handleInsert();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="link-modal"
      style={{ left: position?.left || 0, top: position?.top || 0 }}
    >
      <h4>Insert Link</h4>
      <input
        type="text"
        placeholder="Text to display"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}  // listen for Enter
      />
      <input
        type="url"
        placeholder="Link URL (https://...)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}  // listen for Enter
      />
      <div className="buttons">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleInsert} disabled={!url}>
          Insert
        </button>
      </div>
    </div>
  );
}

export default LinkModal;
