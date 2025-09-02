import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { ResizableBox } from "react-resizable";
import { useEffect, useRef, useState } from "react";
import "react-resizable/css/styles.css";
import "../css/ResizableImage.css";

const ResizableImageComponent = ({ node, updateAttributes, selected }) => {
  const { src, width = 300, alignment } = node.attrs;
  const wrapperRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState({ width: 300, height: 200 });
  const [aspectRatio, setAspectRatio] = useState(1.5);
  const [maxWidth, setMaxWidth] = useState(500);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setAspectRatio(ratio);

      const containerWidth =
        wrapperRef.current?.parentElement?.offsetWidth || 500;
      const finalWidth = Math.min(img.naturalWidth, containerWidth);
      setMaxWidth(containerWidth);
      updateAttributes({
        width: finalWidth,
        height: finalWidth / ratio,
      });
    };
  }, [src, updateAttributes]);

  const displayWidth = Math.min(width, maxWidth);
  const displayHeight = aspectRatio
    ? displayWidth / aspectRatio
    : naturalSize.height;

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
        height={displayWidth / aspectRatio}
        lockAspectRatio={true}
        minConstraints={[50, 50]}
        maxConstraints={[maxWidth, maxWidth / aspectRatio]}
        onResizeStop={(e, data) =>
          updateAttributes({
            width: data.size.width,
            height: data.size.height,
          })
        }
        handleSize={[0, 0]} // prevents extra padding for the handle
      >
        <div
          className="resizable-image-container"
          style={{
            width: "100%",
            height: "98%",
            outline: selected ? "2px solid #87cefb" : "none",
            boxSizing: "border-box",
            position: "relative", // for absolute handle
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
      alignment: {
        default: "center",
        renderHTML: (attrs) => ({ class: `image-align-${attrs.alignment}` }),
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
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        "data-type": "resizableImage",
        width: HTMLAttributes.width,
        height: HTMLAttributes.height,
        class: `image-align-${HTMLAttributes.alignment}`,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;
