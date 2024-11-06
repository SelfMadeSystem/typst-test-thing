import { useState, useRef, useEffect, PropsWithChildren, Dispatch, SetStateAction } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { ElementProps } from "./Element";
import { ResizeElement } from "./ResizeElement";
import { CanvasValues, getInitialText } from "./canvasTypes";
import { SizeInfo } from "./resizeElementTypes";

export const TypstElement = ({
  id,
  reason,
  render,
  pixelPerPt,
  setPixelPerPt,
  sizeInfo,
  setSizeInfo,
  children,
}: PropsWithChildren<
  ElementProps<CanvasValues> & {
    render: (text: string) => void;
    pixelPerPt: number;
    setPixelPerPt: Dispatch<SetStateAction<number>>;
    sizeInfo: SizeInfo;
    setSizeInfo: Dispatch<SetStateAction<SizeInfo>>;
  }
>) => {
  const { selectedElements, setSelectedElements, removeElement } =
    useEditorContext();

  const selected = selectedElements.includes(id);

  const outerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState(false);
  const { width, height } = sizeInfo;

  const [text, setText] = useState(getInitialText(reason));

  useEffect(() => {
    if (reason.type === "user-place") startEditing();
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

    function focus() {
      const textarea = textRef.current;

      if (!textarea) {
        console.warn("textarea undefined");
        requestAnimationFrame(focus);
        return;
      }
      textarea.focus();
      textarea.setSelectionRange(text.length, text.length);
    }

    requestAnimationFrame(focus);
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

      <div className={`${editing ? "hidden" : ""}`}>{children}</div>
    </ResizeElement>
  );
};
