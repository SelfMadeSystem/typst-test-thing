import { useState, useRef, useEffect } from "react";
import { useSvgRenderer } from "./useSvgRenderer";
import { useEditorContext } from "./editor/EditorContext";

export function SvgThing({
  id,
  x: initialX = 50,
  y: initialY = 50,
  width: initialWidth = 200,
  height: initialHeight = 100,
}: {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const { selectedElement, setSelectedElement, removeElement } =
    useEditorContext();

  const selected = selectedElement === id;

  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState(false);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const { pixelPerPt, setPixelPerPt, render } = useSvgRenderer({
    width,
    height,
    container: containerRef,
  });

  const [text, setText] = useState("");

  useEffect(() => {
    render(text);
  }, [pixelPerPt, width, height]);

  useEffect(() => {
    console.log(text, selected, editing);
    if (selected) return;
    setEditing(false);

    if (text.trim() === "") {
      removeElement(id);
      return;
    }

    if (!editing) return;
    render(text);
  }, [editing, selected]);

  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const isResizing = useRef(false);
  const isDragging = useRef(false);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      event.stopPropagation();
      if (editing) return;
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;
      event.preventDefault();
      setSelectedElement(id);
    }

    function handleDoubleClick(event: MouseEvent) {
      setEditing(true);
      isResizing.current = false;
      isDragging.current = false;
      event.stopPropagation();
      requestAnimationFrame(() => {
        textRef.current?.focus();
      });
    }

    function handleDragMouseDown(event: MouseEvent) {
      handleMouseDown(event);
      if (editing) return;
      isDragging.current = true;
    }

    function handleResizeMouseDown(event: MouseEvent) {
      handleMouseDown(event);
      if (editing) return;
      isResizing.current = true;
    }

    function handleMouseMove(event: MouseEvent) {
      if (isResizing.current) {
        const dx = event.clientX - mouseX.current;
        const dy = event.clientY - mouseY.current;

        setWidth((prev) => prev + dx);
        setHeight((prev) => prev + dy);

        mouseX.current = event.clientX;
        mouseY.current = event.clientY;
      }
      if (isDragging.current) {
        const dx = event.clientX - mouseX.current;
        const dy = event.clientY - mouseY.current;

        setX((prev) => prev + dx);
        setY((prev) => prev + dy);

        mouseX.current = event.clientX;
        mouseY.current = event.clientY;
      }
    }

    function handleMouseUp() {
      isResizing.current = false;
      isDragging.current = false;
    }

    function handleScroll(event: WheelEvent) {
      if (!selected || editing) return;
      event.preventDefault();
      const delta = event.deltaY;
      setPixelPerPt((prev) => prev + delta / 1000);
    }

    const outer = outerRef.current!;
    const resize = resizeRef.current!;

    outer.addEventListener("mousedown", handleDragMouseDown);
    outer.addEventListener("dblclick", handleDoubleClick);
    outer.addEventListener("wheel", handleScroll);
    resize.addEventListener("mousedown", handleResizeMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      outer.removeEventListener("mousedown", handleDragMouseDown);
      outer.removeEventListener("dblclick", handleDoubleClick);
      outer.removeEventListener("wheel", handleScroll);
      resize.removeEventListener("mousedown", handleResizeMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [editing, id, setPixelPerPt, setSelectedElement]);

  useEffect(() => {
    const textarea = textRef.current;
    if (!textarea) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEditing(false);
        render(text);
      }
    }

    textarea.addEventListener("keydown", handleKeyDown);

    return () => {
      textarea.removeEventListener("keydown", handleKeyDown);
    };
  }, [textRef, editing, render]);

  useEffect(() => {
    if (!selected || editing) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Delete" || event.key === "Backspace") {
        removeElement(id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected, editing, id, removeElement]);

  return (
    <div
      className={`absolute overflow-hidden ${
        selected ? `outline-dashed outline-2` : ""
      }`}
      ref={outerRef}
      style={{
        top: y,
        left: x,
        width,
        height,
      }}
    >
      {editing && (
        <>
          <textarea
            ref={textRef}
            className="p-1 w-full h-full resize-none bg-gray-800 text-white font-mono"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </>
      )}

      <div className={`${editing ? "hidden" : ""}`}>
        <div
          ref={containerRef}
          className="overflow-hidden"
          style={{
            transform: `scale(${pixelPerPt})`,
            transformOrigin: "top left",
            scrollbarWidth: "none",
            width: width / pixelPerPt,
            height: height / pixelPerPt,
          }}
        />
        <div
          ref={resizeRef}
          className={`${
            selected ? "" : "hidden"
          } absolute right-0 bottom-0 w-4 h-4 bg-gray-800 cursor-se-resize`}
        />
      </div>
    </div>
  );
}
