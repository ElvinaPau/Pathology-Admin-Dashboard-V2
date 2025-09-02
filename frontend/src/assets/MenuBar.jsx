import { useEffect, useState } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaImage,
  FaLink,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from "react-icons/fa";
import "../css/MenuBar.css";

function MenuBar({ editor, openLinkModal }) {
  if (!editor) return null;

  // Force re-render on selection/transaction
  const [, setVersion] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const update = () => setVersion((v) => v + 1);
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  // Alignment handler
  const setAlignment = (alignment) => {
    const { from } = editor.state.selection;
    const node = editor.state.doc.nodeAt(from);
    if (node?.type.name === "resizableImage") {
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.setNodeMarkup(from, undefined, { ...node.attrs, alignment });
          return true;
        })
        .run();
    } else {
      editor.chain().focus().setTextAlign(alignment).run();
    }
  };

  // Active states
  const isBulletList = editor.isActive("bulletList");
  const isOrderedList = editor.isActive("orderedList");

  const { from } = editor.state.selection;
  const node = editor.state.doc.nodeAt(from);

  const isLeft =
    editor.isActive({ textAlign: "left" }, [
      "paragraph",
      "heading",
      "listItem",
    ]) ||
    (node?.type.name === "resizableImage" &&
      (node.attrs.alignment === "left" || !node.attrs.alignment)) ||
    (!editor.isActive({ textAlign: "center" }, [
      "paragraph",
      "heading",
      "listItem",
    ]) &&
      !editor.isActive({ textAlign: "right" }, [
        "paragraph",
        "heading",
        "listItem",
      ]) &&
      !(node?.type.name === "resizableImage" && node.attrs.alignment));

  const isCenter =
    editor.isActive({ textAlign: "center" }, [
      "paragraph",
      "heading",
      "listItem",
    ]) ||
    (node?.type.name === "resizableImage" && node.attrs.alignment === "center");

  const isRight =
    editor.isActive({ textAlign: "right" }, [
      "paragraph",
      "heading",
      "listItem",
    ]) ||
    (node?.type.name === "resizableImage" && node.attrs.alignment === "right");

  // Ordered list styles
  const orderedListStyles = [
    { label: "1. 2. 3.", value: "decimal" },
    { label: "a. b. c.", value: "lower-alpha" },
    { label: "A. B. C.", value: "upper-alpha" },
    { label: "i. ii. iii.", value: "lower-roman" },
    { label: "I. II. III.", value: "upper-roman" },
  ];

  // Get current list style
  const currentListStyle =
    editor.getAttributes("orderedList").listStyleType || "decimal";
  const currentIndex = orderedListStyles.findIndex(
    (s) => s.value === currentListStyle
  );
  const [listStyleIndex, setListStyleIndex] = useState(
    currentIndex >= 0 ? currentIndex : 0
  );

  return (
    <div className="menu-bar">
      {/* Text formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "active" : ""}
        title="Bold"
      >
        <FaBold />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "active" : ""}
        title="Italic"
      >
        <FaItalic />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "active" : ""}
        title="Underline"
      >
        <FaUnderline />
      </button>

      {/* Lists */}
      {/* Bullet list */}
      <button
        onClick={() => {
          editor.chain().focus().toggleBulletList().run();
        }}
        className={isBulletList ? "active" : ""}
        title="Bullet List"
      >
        <FaListUl />
      </button>

      {/* Ordered list */}
      <button
        onClick={() => {
          if (!editor) return;

          if (editor.isActive("orderedList")) {
            // Cycle style
            const nextIndex = (listStyleIndex + 1) % orderedListStyles.length;
            const nextStyle = orderedListStyles[nextIndex].value;
            setListStyleIndex(nextIndex);

            if (nextIndex === 0) {
              // If cycled back to first, remove ordered list
              editor.chain().focus().toggleOrderedList().run();
            } else {
              editor
                .chain()
                .focus()
                .updateAttributes("orderedList", { listStyleType: nextStyle })
                .run();
            }
          } else {
            // Turn on ordered list with current style
            const style = orderedListStyles[listStyleIndex].value;
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .updateAttributes("orderedList", { listStyleType: style })
              .run();
          }
        }}
        className={isOrderedList ? "active" : ""}
        title="Ordered List"
      >
        <FaListOl />
      </button>

      {/* Image upload */}
      <button
        onClick={() => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/*";
          fileInput.onchange = () => {
            const file = fileInput.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                editor
                  .chain()
                  .focus()
                  .insertContent({
                    type: "resizableImage",
                    attrs: { src: reader.result },
                  })
                  .run();
              };
              reader.readAsDataURL(file);
            }
          };
          fileInput.click();
        }}
        title="Upload Image"
      >
        <FaImage />
      </button>

      {/* Alignment */}
      <button
        onClick={() => setAlignment("left")}
        className={isLeft ? "active" : ""}
        title="Align Left"
      >
        <FaAlignLeft />
      </button>
      <button
        onClick={() => setAlignment("center")}
        className={isCenter ? "active" : ""}
        title="Align Center"
      >
        <FaAlignCenter />
      </button>
      <button
        onClick={() => setAlignment("right")}
        className={isRight ? "active" : ""}
        title="Align Right"
      >
        <FaAlignRight />
      </button>

      {/* Link */}
      <button
        onClick={openLinkModal}
        className={editor.isActive("link") ? "active" : ""}
        title="Insert Link"
      >
        <FaLink />
      </button>
    </div>
  );
}

export default MenuBar;
