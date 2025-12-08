import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import ResizableImageComponent from "../assets/ResizableImageComponent";
import CustomOrderedList from "../extensions/CustomOrderedList";
import LinkModal from "./LinkModal";
import MenuBar from "./MenuBar";
import axios from "axios";
import "../css/RichTextEditor.css";

function RichTextEditor({ value = "", onChange }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const [linkPosition, setLinkPosition] = useState({ left: 0, top: 0 });
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [defaultLinkText, setDefaultLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ orderedList: false }),
      CustomOrderedList,
      ResizableImageComponent,
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ["paragraph", "heading", "listItem"] }),
      Underline,
    ],
    content: value,
    editorProps: {
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let item of items) {
          if (item.type.includes("image")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) insertImageWithPreview(file);
            return true;
          }
        }

        return false; // allow normal text/html paste
      },

      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        let handled = false;

        for (let file of files) {
          if (file.type.startsWith("image/")) {
            handled = true;
            event.preventDefault();
            insertImageWithPreview(file);
          }
        }

        return handled;
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Insert image with preview, then replace src after upload
  const insertImageWithPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target.result; // base64 data URL
      const placeholderPos = editor.state.selection.from;

      editor.chain().focus().setResizableImage({ src: previewUrl }).run();

      const formData = new FormData();
      formData.append("image", file);

      axios
        .post(`${API_BASE}/api/uploads/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          const uploadedUrl = res.data.url;
          const node = editor.state.doc.nodeAt(placeholderPos);
          if (node && node.type.name === "resizableImage") {
            const tr = editor.state.tr.setNodeMarkup(
              placeholderPos,
              undefined,
              {
                ...node.attrs,
                src: uploadedUrl,
              }
            );
            editor.view.dispatch(tr);
          }
        })
        .catch(console.error);
    };

    reader.readAsDataURL(file);
  };

  const openLinkModal = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    setDefaultLinkText(selectedText);
    setLinkUrl("");
    const coords = editor.view.coordsAtPos(from);
    setLinkPosition({ left: coords.left, top: coords.bottom + window.scrollY });
    setIsLinkModalOpen(true);
  };

  const insertLink = (text, url) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .deleteSelection()
      .insertContent({
        type: "text",
        text,
        marks: [{ type: "link", attrs: { href: url } }],
      })
      .run();
    setIsLinkModalOpen(false);
  };

  return (
    <div className="editor-wrapper">
      <MenuBar editor={editor} openLinkModal={openLinkModal} />
      <div
        className="editor-container"
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onInsert={insertLink}
        defaultText={defaultLinkText}
        defaultUrl={linkUrl}
        position={linkPosition}
      />
    </div>
  );
}

export default RichTextEditor;
