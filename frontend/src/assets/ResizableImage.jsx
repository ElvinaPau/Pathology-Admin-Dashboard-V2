import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "../css/ResizableImage.css";

const ResizableImage = ({ node, updateAttributes }) => {
  const { src, width = 200, height = 200, x = 0, y = 0 } = node.attrs;
  const imgRef = useRef(null);
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });

  const handleDragStop = (e, data) => {
    setPosition({ x: data.x, y: data.y });
    updateAttributes({ x: data.x, y: data.y });
  };

  const handleResize = (event, { size }) => {
    setSize(size);
    updateAttributes({ width: size.width, height: size.height });
  };

  return (
    <Draggable nodeRef={imgRef} position={position} onStop={handleDragStop}>
      <div ref={imgRef} style={{ display: "inline-block" }}>
        <ResizableBox
          width={size.width}
          height={size.height}
          onResizeStop={handleResize}
          minConstraints={[50, 50]}
          maxConstraints={[800, 800]}
        >
          <img
            src={src}
            alt="draggable"
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default ResizableImage;
