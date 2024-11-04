import { PropsWithChildren, useEffect, useRef } from "react";
import { useEditorContext } from "../editor/EditorContext";

export type SizeInfo = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export function ResizeElement({
  sizeInfo,
  setSizeInfo,
  selected,
  id,
  children,
}: PropsWithChildren<{
  sizeInfo: SizeInfo;
  setSizeInfo: (sizeInfo: SizeInfo) => void;
  selected: boolean;
  id: string;
}>) {
  const { removeElement } = useEditorContext();
  const boxRef = useRef<HTMLDivElement>(null);

  const topLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);

  const resizeTopLeftRef = useRef<HTMLDivElement>(null);
  const resizeTopRightRef = useRef<HTMLDivElement>(null);
  const resizeBottomLeftRef = useRef<HTMLDivElement>(null);
  const resizeBottomRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) {
      return;
    }

    const box = boxRef.current!;
    const topLine = topLineRef.current;
    const rightLine = rightLineRef.current;
    const bottomLine = bottomLineRef.current;
    const leftLine = leftLineRef.current;

    const resizeTopLeft = resizeTopLeftRef.current;
    const resizeTopRight = resizeTopRightRef.current;
    const resizeBottomLeft = resizeBottomLeftRef.current;
    const resizeBottomRight = resizeBottomRightRef.current;

    const elements = [
      box,
      topLine,
      rightLine,
      bottomLine,
      leftLine,
      resizeTopLeft,
      resizeTopRight,
      resizeBottomLeft,
      resizeBottomRight,
    ];

    let mouseX = NaN;
    let mouseY = NaN;

    let { x, y, width, height } = sizeInfo;

    function set() {
      setSizeInfo({
        x,
        y,
        width,
        height,
      });
    }

    let activeElement: HTMLDivElement | null = box;

    function onMouseDown(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      mouseX = e.clientX;
      mouseY = e.clientY;

      activeElement = e.target as HTMLDivElement;
    }

    function onMouseUp() {
      activeElement = null;
    }

    function onMouseMove(e: MouseEvent) {
      if (isNaN(mouseX) || isNaN(mouseY)) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        return;
      }
      const dx = e.clientX - mouseX;
      const dy = e.clientY - mouseY;
      switch (activeElement) {
        case null: {
          break;
        }
        case topLine:
          y += dy;
          height -= dy;
          if (height < 0) {
            y += height;
            height *= -1;
            activeElement = bottomLine;
          }
          set();
          break;
        case bottomLine:
          height += dy;
          if (height < 0) {
            y += height;
            height *= -1;
            activeElement = topLine;
          }
          set();
          break;
        case rightLine:
          width += dx;
          if (width < 0) {
            x += width;
            width *= -1;
            activeElement = leftLine;
          }
          set();
          break;
        case leftLine:
          x += dx;
          width -= dx;
          if (width < 0) {
            x += width;
            width *= -1;
            activeElement = rightLine;
          }
          set();
          break;
        case resizeTopLeft:
          x += dx;
          y += dy;
          width -= dx;
          height -= dy;
          if (width < 0) {
            x += width;
            width *= -1;
            activeElement = resizeTopRight;
          }
          if (height < 0) {
            y += height;
            height *= -1;
            activeElement = resizeBottomLeft;
          }
          set();
          break;
        case resizeTopRight:
          y += dy;
          width += dx;
          height -= dy;
          if (height < 0) {
            y += height;
            height *= -1;
            activeElement = resizeBottomRight;
          }
          if (width < 0) {
            x += width;
            width *= -1;
            activeElement = resizeTopLeft;
          }
          set();
          break;
        case resizeBottomLeft:
          x += dx;
          width -= dx;
          height += dy;
          if (width < 0) {
            x += width;
            width *= -1;
            activeElement = resizeBottomRight;
          }
          if (height < 0) {
            y += height;
            height *= -1;
            activeElement = resizeTopLeft;
          }
          set();
          break;
        case resizeBottomRight:
          width += dx;
          height += dy;
          if (width < 0) {
            x += width;
            width *= -1;
            activeElement = resizeBottomLeft;
          }
          if (height < 0) {
            y += height;
            height *= -1;
            activeElement = resizeTopRight;
          }
          set();
          break;
        default:
          x += dx;
          y += dy;
          set();
          break;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Delete":
        case "Backspace":
          removeElement(id);
          break;
        case "ArrowUp":
          if (e.shiftKey) {
            height -= 1;
          } else {
            y -= 1;
          }
          set();
          break;
        case "ArrowRight":
          if (e.shiftKey) {
            width += 1;
          } else {
            x += 1;
          }
          set();
          break;
        case "ArrowDown":
          if (e.shiftKey) {
            height += 1;
          } else {
            y += 1;
          }
          set();
          break;
        case "ArrowLeft":
          if (e.shiftKey) {
            width -= 1;
          } else {
            x -= 1;
          }
          set();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    elements.forEach((element) =>
      element?.addEventListener("mousedown", onMouseDown)
    );

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      elements.forEach((element) =>
        element?.removeEventListener("mousedown", onMouseDown)
      );
    };
  }, [selected, setSizeInfo]);

  return (
    <div
      ref={boxRef}
      className="absolute box-border"
      style={{
        pointerEvents: selected ? "auto" : "none",
        top: sizeInfo.y,
        left: sizeInfo.x,
        width: sizeInfo.width,
        height: sizeInfo.height,
        cursor: selected ? "move" : "default",
      }}
    >
      {children}
      {selected && (
        <>
          <div className="absolute -inset-4 pointer-events-none border-dashed border-2" />
          <div
            ref={topLineRef}
            className="absolute -top-8 -left-8 -right-8 h-8 cursor-ns-resize"
          />
          <div
            ref={rightLineRef}
            className="absolute -top-8 -bottom-8 -right-8 w-8 cursor-ew-resize"
          />
          <div
            ref={bottomLineRef}
            className="absolute -left-8 -bottom-8 -right-8 h-8 cursor-ns-resize"
          />
          <div
            ref={leftLineRef}
            className="absolute -top-8 -bottom-8 -left-8 w-8 cursor-ew-resize"
          />
          <div
            ref={resizeTopLeftRef}
            className="absolute -top-8 -left-8 w-8 h-8 cursor-nwse-resize"
          >
            <div className="absolute inset-2 border pointer-events-none" />
          </div>
          <div
            ref={resizeTopRightRef}
            className="absolute -top-8 -right-8 w-8 h-8 cursor-nesw-resize"
          >
            <div className="absolute inset-2 border pointer-events-none" />
          </div>
          <div
            ref={resizeBottomLeftRef}
            className="absolute -bottom-8 -left-8 w-8 h-8 cursor-nesw-resize"
          >
            <div className="absolute inset-2 border pointer-events-none" />
          </div>
          <div
            ref={resizeBottomRightRef}
            className="absolute -bottom-8 -right-8 w-8 h-8 cursor-nwse-resize"
          >
            <div className="absolute inset-2 border pointer-events-none" />
          </div>
        </>
      )}
    </div>
  );
}
