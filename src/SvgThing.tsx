import { useState, useRef, useEffect } from "react";
import { useSvgRenderer } from "./useSvgRenderer";
import { useEditorContext } from "./editor/EditorContext";

export function SvgThing({
  id,
  x: initialX = 50,
  y: initialY = 50,
  width: initialWidth = 200,
  height: initialHeight = 100,
  editing: initialEditing = true,
}: {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  editing?: boolean;
}) {
  const { selectedElements, setSelectedElements, removeElement } =
    useEditorContext();

  const selected = selectedElements.includes(id);

  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState(initialEditing);
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
    if (!initialEditing) return;
    startEditing();
  }, []);

  useEffect(() => {
    render(text);
  }, [pixelPerPt, width, height]);

  useEffect(() => {
    if (selected) return;
    setEditing(false);

    if (text.trim() === "") {
      removeElement(id);
      return;
    }

    if (!editing) return;
    render(text);
  }, [editing, selected]);

  function startEditing() {
    if (editing || !selected) return;

    setEditing(true);

    requestAnimationFrame(() => {
      const textarea = textRef.current;

      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(text.length, text.length);
    });
  }

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
      setSelectedElements([id]);
    }

    function handleDoubleClick(event: MouseEvent) {
      isResizing.current = false;
      isDragging.current = false;
      event.stopPropagation();
      startEditing();
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
  }, [editing, id, setPixelPerPt, setSelectedElements]);

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
      switch (event.key) {
        case "Backspace":
        case "Delete": {
          removeElement(id);
          break;
        }
        case "Enter": {
          startEditing();
          break;
        }
        case "ArrowUp": {
          setY((prev) => prev - 1);
          break;
        }
        case "ArrowDown": {
          setY((prev) => prev + 1);
          break;
        }
        case "ArrowLeft": {
          setX((prev) => prev - 1);
          break;
        }
        case "ArrowRight": {
          setX((prev) => prev + 1);
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected, editing, id, removeElement]);

  return (
    <div
      className={`absolute overflow-hidden cursor-move ${
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
          } absolute right-0 bottom-0 w-5 h-5 cursor-se-resize`}
        >
          <div className="w-8 h-8 rotate-45 origin-center translate-x-1 translate-y-1 bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
