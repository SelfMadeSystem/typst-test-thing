import { useState, useRef, useEffect } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { ElementComponent } from "./Element";
import { ResizeElement } from "./ResizeElement";
import { useCanvasRenderer } from "../useCanvasRenderer";

export const CanvasTypstElement = (({
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
}) => {
  const { selectedElements, setSelectedElements, removeElement } =
    useEditorContext();

  const selected = selectedElements.includes(id);

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState(initialEditing);
  const [sizeInfo, setSizeInfo] = useState({
    x: initialX,
    y: initialY,
    width: initialWidth,
    height: initialHeight,
    rotation: 0,
  });
  const { width, height } = sizeInfo;
  const { pixelPerPt, setPixelPerPt, render } = useCanvasRenderer({
    width,
    height,
    canvas,
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
    setEditing(true);

    requestAnimationFrame(() => {
      const textarea = textRef.current;

      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(text.length, text.length);
    });
  }

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      event.stopPropagation();
      if (editing) return;
      event.preventDefault();
      setSelectedElements([id]);
    }

    function handleDoubleClick(event: MouseEvent) {
      event.stopPropagation();
      startEditing();
    }

    function handleScroll(event: WheelEvent) {
      if (!selected || editing) return;
      event.preventDefault();
      const delta = event.deltaY;
      setPixelPerPt((prev) => prev + delta / 1000);
    }

    const outer = outerRef.current!;

    outer.addEventListener("mousedown", handleMouseDown);
    outer.addEventListener("dblclick", handleDoubleClick);
    outer.addEventListener("wheel", handleScroll);

    return () => {
      outer.removeEventListener("mousedown", handleMouseDown);
      outer.removeEventListener("dblclick", handleDoubleClick);
      outer.removeEventListener("wheel", handleScroll);
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
        case "Enter": {
          startEditing();
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
    <ResizeElement
      sizeInfo={sizeInfo}
      setSizeInfo={setSizeInfo}
      selected={selected}
      editing={editing}
      outerRef={outerRef}
      alwaysSelectable={true}
      id={id}
    >
      {editing && (
        <>
          <textarea
            ref={textRef}
            className="p-1 w-full h-full resize-none bg-gray-800 text-white font-mono pointer-events-auto"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </>
      )}

      <div className={`${editing ? "hidden" : ""}`}>
        <canvas
          ref={setCanvas}
          width={width}
          height={height}
        />
      </div>
    </ResizeElement>
  );
}) satisfies ElementComponent;
