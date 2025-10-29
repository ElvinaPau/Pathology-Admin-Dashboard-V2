import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { ResizableBox } from "react-resizable";
import { useEffect, useRef, useState } from "react";
import "react-resizable/css/styles.css";
import "../css/ResizableImage.css";

// ----- React Component for the Node -----
const ResizableImageComponent = ({ node, updateAttributes, selected }) => {
  const { src, width = 300, alignment } = node.attrs;
  const wrapperRef = useRef(null);

  const [naturalSize, setNaturalSize] = useState({ width: 300, height: 200 });
  const [aspectRatio, setAspectRatio] = useState(1.5);

  const maxWidth = 300;

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setAspectRatio(ratio);

      // Only set initial dimensions if width/height haven't been explicitly set
      // Check if dimensions are at default values (300x200)
      if (node.attrs.width === 300 && node.attrs.height === 200) {
        // Calculate width constrained by maxWidth
        let finalWidth = Math.min(img.naturalWidth, maxWidth);
        // Height automatically follows width with aspect ratio
        let finalHeight = finalWidth / ratio;

        updateAttributes({
          width: finalWidth,
          height: finalHeight,
        });
      }
    };
  }, [src]);

  const displayWidth = Math.min(width, maxWidth);
  const displayHeight = aspectRatio
    ? displayWidth / aspectRatio
    : naturalSize.height;

  // Calculate max height based on max width and aspect ratio
  const maxHeight = aspectRatio ? maxWidth / aspectRatio : Infinity;

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className={`resizable-image-wrapper image-align-${alignment}`}
      style={{
        display: "flex",
        justifyContent:
          alignment === "left"
            ? "flex-start"
            : alignment === "right"
            ? "flex-end"
            : "center",
        width: "100%",
      }}
    >
      <ResizableBox
        width={displayWidth}
        height={displayHeight}
        lockAspectRatio={true}
        minConstraints={[50, 50]}
        maxConstraints={[maxWidth, maxHeight]}
        onResizeStop={(e, data) =>
          updateAttributes({
            width: data.size.width,
            height: data.size.height,
          })
        }
        handleSize={[0, 0]}
      >
        <div
          className="resizable-image-container"
          style={{
            outline: selected ? "2px solid #87cefb" : "none",
            boxSizing: "border-box",
          }}
        >
          <img
            src={src}
            alt="resizable"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              pointerEvents: "none",
              userSelect: "none",

            }}
          />
          <span className="resize-handle" />
        </div>
      </ResizableBox>
    </NodeViewWrapper>
  );
};

// ----- TipTap Node Definition -----
const ResizableImage = Node.create({
  name: "resizableImage",
  group: "block",
  inline: false,
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: 300 },
      height: { default: 200 },
      alignment: { default: "left" },
    };
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-type="resizableImage"]',
        getAttrs: (dom) => ({
          src: dom.getAttribute("src"),
          width: parseInt(dom.getAttribute("width") || "300", 10),
          height: parseInt(dom.getAttribute("height") || "200", 10),
          alignment: dom.classList.contains("image-align-left")
            ? "left"
            : dom.classList.contains("image-align-right")
            ? "right"
            : "center",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment = "left", width, height, src } = HTMLAttributes;

    // Generate inline styles with proper spacing and formatting for Flutter
    let style = "display: block; ";
    
    if (alignment === "left") {
      style += "margin-left: 0; margin-right: auto;";
    } else if (alignment === "center") {
      style += "margin-left: auto; margin-right: auto;";
    } else if (alignment === "right") {
      style += "margin-left: auto; margin-right: 0;";
    }

    // Add width and height with proper spacing
    if (width) style += ` width: ${width}px;`;
    if (height) style += ` height: ${height}px;`;

    // Add data attributes for easier Flutter parsing
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        "data-type": "resizableImage",
        "data-alignment": alignment, // Explicit alignment attribute
        src,
        width,
        height,
        class: `image-align-${alignment}`,
        style,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;