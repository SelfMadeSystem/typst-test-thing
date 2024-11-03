import { useState, useRef, useEffect } from "react";
import { useSvgRenderer } from "./useSvgRenderer";

export function SvgThing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const { pixelPerPt, setPixelPerPt, render } = useSvgRenderer({
    width,
    height,
    container: containerRef,
  });

  const [text, setText] = useState("");
  const [scale, setScale] = useState(1);

  async function rerender() {
    await render(text);
  }

  useEffect(() => {
    rerender();
  }, [pixelPerPt]);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let isResizing = false;
    let isDragging = false;

    function handleMouseDown(event: MouseEvent) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      event.preventDefault();
    }

    function handleDragMouseDown(event: MouseEvent) {
      handleMouseDown(event);
      isDragging = true;
    }

    function handleResizeMouseDown(event: MouseEvent) {
      handleMouseDown(event);
      isResizing = true;
    }

    function handleMouseMove(event: MouseEvent) {
      if (isResizing) {
        const dx = event.clientX - mouseX;
        const dy = event.clientY - mouseY;

        setWidth((prev) => prev + dx);
        setHeight((prev) => prev + dy);

        mouseX = event.clientX;
        mouseY = event.clientY;
      }
      if (isDragging) {
        const dx = event.clientX - mouseX;
        const dy = event.clientY - mouseY;

        setX((prev) => prev + dx);
        setY((prev) => prev + dy);

        mouseX = event.clientX;
        mouseY = event.clientY;
      }
    }

    function handleMouseUp() {
      isResizing = false;
      isDragging = false;
    }

    const outer = outerRef.current!;
    const resize = resizeRef.current!;

    outer.addEventListener("mousedown", handleDragMouseDown);
    resize.addEventListener("mousedown", handleResizeMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      outer.removeEventListener("mousedown", handleDragMouseDown);
      resize.removeEventListener("mousedown", handleResizeMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex items-center">
        <textarea
          className="p-2 resize bg-gray-800 text-white font-mono"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          className="ml-4 p-1 w-12 bg-gray-800 text-white"
          type="number"
          value={scale}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(e) => {
            const value = Number(e.target.value);
            setScale(value);
            setPixelPerPt(value ** 2 * 2);
          }}
        />
        <button className="ml-4 p-2 bg-gray-800 text-white" onClick={rerender}>
          Render
        </button>
      </div>
      <div
        className="absolute outline-dashed outline-2"
        ref={outerRef}
        style={{
          top: y,
          left: x,
          width,
          height,
        }}
      >
        <div
          ref={containerRef}
          className="overflow-hidden"
          style={{
            transform: `scale(${scale ** 2 * 2})`,
            transformOrigin: "top left",
            scrollbarWidth: "none",
            width: width / pixelPerPt,
            height: height / pixelPerPt,
          }}
        />
        <div
          ref={resizeRef}
          className="absolute right-0 bottom-0 w-4 h-4 bg-gray-800 cursor-se-resize"
        />
      </div>
    </div>
  );
}
