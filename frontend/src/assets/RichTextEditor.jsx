import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import ResizableImage from "../extensions/ResizableImage";
import CustomOrderedList from "../extensions/CustomOrderedList";
import LinkModal from "./LinkModal";
import MenuBar from "./MenuBar";
import "../css/RichTextEditor.css";

function RichTextEditor() {
  const [linkPosition, setLinkPosition] = useState({ left: 0, top: 0 });
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [defaultLinkText, setDefaultLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: false, // disable default ordered list
      }),
      CustomOrderedList,       // custom ordered list supporting a,b,c / i,ii,iii
      ResizableImage,
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ["paragraph", "heading", "listItem"] }),
      Underline,
    ],
    editorProps: {
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let item of items) {
          if (item.type.includes("image")) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = () => {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.resizableImage.create({
                    src: reader.result,
                    width: 300,
                  })
                )
              );
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

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
