import { PropsWithChildren, useCallback, useEffect, useRef } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { SizeInfo } from "./SizeInfo";

export function ResizeElement({
  sizeInfo,
  setSizeInfo,
  selected,
  id,
  outerRef,
  editing,
  alwaysSelectable,
  startResizing,
  children,
}: PropsWithChildren<{
  sizeInfo: SizeInfo;
  setSizeInfo: (sizeInfo: SizeInfo) => void;
  selected: boolean;
  outerRef?: React.MutableRefObject<HTMLDivElement | null>;
  editing?: boolean;
  alwaysSelectable?: boolean;
  startResizing?: boolean;
  id: string;
}>) {
  const { removeElement } = useEditorContext();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const resizing = useRef<boolean>(startResizing ?? false);

  const setBoxRefs = useCallback(
    (element: HTMLDivElement) => {
      if (outerRef) {
        outerRef.current = element;
      }
      boxRef.current = element;
    },
    [outerRef]
  );

  const rotateRef = useRef<HTMLDivElement>(null);

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

    const rotate = rotateRef.current;

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
      rotate,
    ];

    let mouseX = NaN;
    let mouseY = NaN;

    let { x, y, width, height, rotation } = sizeInfo;

    function set() {
      setSizeInfo({
        x,
        y,
        width,
        height,
        rotation,
      });
    }

    let activeElement: HTMLDivElement | null = resizing.current
      ? resizeBottomRight
      : editing
      ? null
      : box;

    function onMouseDown(e: MouseEvent) {
      if (editing) {
        return;
      }
      resizing.current = false;
      e.preventDefault();
      e.stopPropagation();
      mouseX = e.clientX;
      mouseY = e.clientY;

      activeElement = e.target as HTMLDivElement;
    }

    function onMouseUp() {
      console.log("Mouse up");
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

      const sin = Math.sin(rotation);
      const cos = Math.cos(rotation);

      function pos(w: number, h: number) {
        return {
          x: w * cos - h * sin + x,
          y: w * sin + h * cos + y,
        };
      }

      const tl = pos(-width / 2, -height / 2);
      const tr = pos(width / 2, -height / 2);
      const br = pos(width / 2, height / 2);
      const bl = pos(-width / 2, height / 2);

      const distX = dx * cos + dy * sin;
      const distY = dy * cos - dx * sin;

      let flippedX = false;
      let flippedY = false;

      function resize({
        top = 0,
        right = 0,
        bottom = 0,
        left = 0,
      }: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      }) {
        tl.y += top * cos + left * sin;
        tl.x += -top * sin + left * cos;
        bl.y += bottom * cos + left * sin;
        bl.x += -bottom * sin + left * cos;
        tr.y += top * cos + right * sin;
        tr.x += -top * sin + right * cos;
        br.y += bottom * cos + right * sin;
        br.x += -bottom * sin + right * cos;

        // Unrotate the edges
        const l = tl.x * cos + tl.y * sin;
        const t = -tl.x * sin + tl.y * cos;
        const r = tr.x * cos + tr.y * sin;
        const b = -bl.x * sin + bl.y * cos;

        // Check if the element has flipped
        flippedX = l > r;
        flippedY = t > b;

        // Set the new position and size
        x = (tl.x + tr.x + br.x + bl.x) / 4;
        y = (tl.y + tr.y + br.y + bl.y) / 4;
        width = Math.hypot(tr.x - tl.x, tr.y - tl.y);
        height = Math.hypot(tr.x - br.x, tr.y - br.y);
      }

      switch (activeElement) {
        case null: {
          break;
        }
        case topLine: {
          resize({ top: distY });
          if (flippedY) {
            activeElement = bottomLine;
          }
          break;
        }
        case bottomLine: {
          resize({ bottom: distY });
          if (flippedY) {
            activeElement = topLine;
          }
          break;
        }
        case leftLine: {
          resize({ left: distX });
          if (flippedX) {
            activeElement = rightLine;
          }
          break;
        }
        case rightLine: {
          resize({ right: distX });
          if (flippedX) {
            activeElement = leftLine;
          }
          break;
        }
        case resizeTopLeft: {
          resize({ top: distY, left: distX });
          if (flippedX) {
            activeElement = resizeTopRight;
          }
          if (flippedY) {
            activeElement = resizeBottomLeft;
          }
          break;
        }
        case resizeTopRight: {
          resize({ top: distY, right: distX });
          if (flippedX) {
            activeElement = resizeTopLeft;
          }
          if (flippedY) {
            activeElement = resizeBottomRight;
          }
          break;
        }
        case resizeBottomLeft: {
          resize({ bottom: distY, left: distX });
          if (flippedX) {
            activeElement = resizeBottomRight;
          }
          if (flippedY) {
            activeElement = resizeTopLeft;
          }
          break;
        }
        case resizeBottomRight: {
          resize({ bottom: distY, right: distX });
          if (flippedX) {
            activeElement = resizeBottomLeft;
          }
          if (flippedY) {
            activeElement = resizeTopRight;
          }
          break;
        }
        case rotate: {
          let angle = Math.atan2(e.clientY - y, e.clientX - x) + Math.PI / 2;
          if (e.shiftKey) {
            const step = Math.PI / 8;
            angle = Math.round(angle / step) * step;
          }
          rotation = angle;
          break;
        }
        default:
          x += dx;
          y += dy;
          break;
      }
      // Check if the element has flipped
      const flipped = width < 0 || height < 0;
      if (flipped) {
        console.log("Element has flipped");
      }
      set();
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (editing) {
        return;
      }
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
  }, [editing, id, removeElement, selected]);

  return (
    <>
      <div
        ref={setBoxRefs}
        className={`absolute box-border cursor-move ${
          (selected || alwaysSelectable) && !editing
            ? ""
            : "pointer-events-none"
        }`}
        style={{
          top: sizeInfo.y,
          left: sizeInfo.x,
          width: sizeInfo.width,
          height: sizeInfo.height,
          transform: `translate(-50%, -50%) rotate(${
            (sizeInfo.rotation * 180) / Math.PI
          }deg)`,
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
            <div
              ref={rotateRef}
              className="absolute -top-16 left-[calc(50%-1rem)] w-8 h-8 cursor-move"
            >
              <div className="absolute inset-2 rounded-full border pointer-events-none" />
            </div>
          </>
        )}
      </div>
    </>
  );
}
