import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useEditorContext } from "../editor/EditorContext";
import { mod, } from "../utils";
import { SizeInfo } from "./resizeElementTypes";

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
  setSizeInfo: Dispatch<SetStateAction<SizeInfo>>;
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

  const topRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);

  const topLeftRef = useRef<HTMLDivElement>(null);
  const topRightRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);

  type Cursors =
    | "cursor-ns-resize"
    | "cursor-ew-resize"
    | "cursor-nwse-resize"
    | "cursor-nesw-resize";

  const [tbCursor, setTbCursor] = useState<Cursors>("cursor-ns-resize");
  const [lrCursor, setLrCursor] = useState<Cursors>("cursor-ew-resize");
  const [tlbrCursor, setTlbrCursor] = useState<Cursors>("cursor-nwse-resize");
  const [trblCursor, setTrblCursor] = useState<Cursors>("cursor-nesw-resize");

  useEffect(() => {
    if (!selected) {
      return;
    }

    const box = boxRef.current!;
    const top = topRef.current;
    const right = rightRef.current;
    const bottom = bottomRef.current;
    const left = leftLineRef.current;

    const topLeft = topLeftRef.current;
    const topRight = topRightRef.current;
    const bottomLeft = bottomLeftRef.current;
    const bottomRight = bottomRightRef.current;

    const rotate = rotateRef.current;

    const elements = [
      box,
      top,
      right,
      bottom,
      left,
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
      rotate,
    ];

    let mouseX = NaN;
    let mouseY = NaN;

    let { x, y, width, height, rotation } = sizeInfo;
    let aspectRatio = height === 0 ? 1 : width / height;

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
      ? bottomRight
      : editing
      ? null
      : box;

    function onMouseDown(e: MouseEvent) {
      resizing.current = false;
      if (editing) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      mouseX = e.clientX;
      mouseY = e.clientY;
      aspectRatio = height === 0 ? 1 : width / height;

      activeElement = e.target as HTMLDivElement;
    }

    function onMouseUp() {
      resizing.current = false;
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

      let mouseStateX = 0;
      let mouseStateY = 0;

      const preserveAspectRatio = e.shiftKey;
      const fromCenter = e.altKey;

      function resize({
        top,
        right,
        bottom,
        left,
      }: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      }) {
        if (preserveAspectRatio) {
          if (fromCenter) {
            let distX = right ?? -left!;
            let distY = bottom ?? -top!;

            if (distX > distY) {
              distY = distX / aspectRatio;
            } else {
              distX = distY * aspectRatio;
            }

            top = -distY;
            right = distX;
            bottom = distY;
            left = -distX;
          } else if (
            (top !== undefined || bottom !== undefined) &&
            left === undefined &&
            right === undefined
          ) {
            const distY = top ?? -bottom!;
            const distX = aspectRatio * (height + distY) - width;
            left = -distX / 2;
            right = distX / 2;
          } else if (
            (left !== undefined || right !== undefined) &&
            top === undefined &&
            bottom === undefined
          ) {
            const distX = left ?? -right!;
            const distY = (width + distX) / aspectRatio - height;
            top = -distY / 2;
            bottom = distY / 2;
          } else {
            let distX = right ?? -left!;
            let distY = bottom ?? -top!;

            if (distX > distY) {
              distY = (width + distX) / aspectRatio - height;

              if (top !== undefined) {
                top = -distY;
              } else {
                bottom = distY;
              }
            } else {
              distX = aspectRatio * (height + distY) - width;

              if (left !== undefined) {
                left = -distX;
              } else {
                right = distX;
              }
            }
          }
        }

        top = top ?? 0;
        right = right ?? 0;
        bottom = bottom ?? 0;
        left = left ?? 0;

        if (fromCenter && !preserveAspectRatio) {
          [top, bottom] = [top - bottom, bottom - top];
          [left, right] = [left - right, right - left];
        }

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

        // Check where the mouse is
        // -1 means left/top, 0 means center, 1 means right/bottom
        const [mouseX, mouseY] = mouseDiff({ x, y });
        if (mouseX < -width / 2) {
          mouseStateX = -1;
        } else if (mouseX > width / 2) {
          mouseStateX = 1;
        }

        if (mouseY < -height / 2) {
          mouseStateY = -1;
        } else if (mouseY > height / 2) {
          mouseStateY = 1;
        }
      }

      function mouseDiff(pos: { x: number; y: number }) {
        const diffX = e.clientX - pos.x;
        const diffY = e.clientY - pos.y;
        return [diffX * cos + diffY * sin, -diffX * sin + diffY * cos];
      }

      switch (activeElement) {
        case null: {
          break;
        }
        case top: {
          resize({ top: distY });
          if (flippedY) {
            activeElement = bottom;
          }
          break;
        }
        case bottom: {
          resize({ bottom: distY });
          if (flippedY) {
            activeElement = top;
          }
          break;
        }
        case left: {
          resize({ left: distX });
          if (flippedX) {
            activeElement = right;
          }
          break;
        }
        case right: {
          resize({ right: distX });
          if (flippedX) {
            activeElement = left;
          }
          break;
        }
        case topLeft: {
          const [diffX, diffY] = mouseDiff(tl);
          resize({ top: diffY, left: diffX });
          if (flippedX || mouseStateX === 1) {
            activeElement = topRight;
          }
          if (flippedY || mouseStateY === 1) {
            activeElement = bottomLeft;
          }
          break;
        }
        case topRight: {
          const [diffX, diffY] = mouseDiff(tr);
          resize({ top: diffY, right: diffX });
          if (flippedX || mouseStateX === -1) {
            activeElement = topLeft;
          }
          if (flippedY || mouseStateY === 1) {
            activeElement = bottomRight;
          }
          break;
        }
        case bottomLeft: {
          const [diffX, diffY] = mouseDiff(bl);
          resize({ bottom: diffY, left: diffX });
          if (flippedX || mouseStateX === 1) {
            activeElement = bottomRight;
          }
          if (flippedY || mouseStateY === -1) {
            activeElement = topLeft;
          }
          break;
        }
        case bottomRight: {
          const [diffX, diffY] = mouseDiff(br);
          resize({ bottom: diffY, right: diffX });
          if (flippedX || mouseStateX === -1) {
            activeElement = bottomLeft;
          }
          if (flippedY || mouseStateY === -1) {
            activeElement = topRight;
          }
          break;
        }
        case rotate: {
          let angle = Math.atan2(e.clientY - y, e.clientX - x) + Math.PI / 2;
          if (e.shiftKey) {
            const snapAngle = 15;
            const step = (Math.PI / 180) * snapAngle;
            angle = Math.round(angle / step) * step;
          }
          rotation = angle;
          // Set cursors
          const cursors: Cursors[] = [
            "cursor-ns-resize",
            "cursor-nesw-resize",
            "cursor-ew-resize",
            "cursor-nwse-resize",
          ];

          const index = mod(Math.round(angle / (Math.PI / 4)), 4);
          setTbCursor(cursors[index]);
          setTrblCursor(cursors[(index + 1) % 4]);
          setLrCursor(cursors[(index + 2) % 4]);
          setTlbrCursor(cursors[(index + 3) % 4]);
          break;
        }
        default:
          x += dx;
          y += dy;
          break;
      }
      set();
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (editing) {
        return;
      }
      const amount = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case "Delete":
        case "Backspace":
          removeElement(id);
          e.preventDefault();
          break;
        case "ArrowUp":
          y -= amount;
          set();
          e.preventDefault();
          break;
        case "ArrowRight":
          x += amount;
          set();
          e.preventDefault();
          break;
        case "ArrowDown":
          y += amount;
          set();
          e.preventDefault();
          break;
        case "ArrowLeft":
          x -= amount;
          set();
          e.preventDefault();
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
  }, [editing, id, selected]);

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
              ref={topRef}
              className={`absolute -top-8 -left-8 -right-8 h-8 ${tbCursor}`}
            />
            <div
              ref={rightRef}
              className={`absolute -top-8 -right-8 -bottom-8 w-8 ${lrCursor}`}
            />
            <div
              ref={bottomRef}
              className={`absolute -right-8 -bottom-8 -left-8 h-8 ${tbCursor}`}
            />
            <div
              ref={leftLineRef}
              className={`absolute -bottom-8 -left-8 -top-8 w-8 ${lrCursor}`}
            />
            <div
              ref={topLeftRef}
              className={`absolute -top-8 -left-8 w-8 h-8 ${tlbrCursor}`}
            >
              <div className="absolute inset-2 border pointer-events-none" />
            </div>
            <div
              ref={topRightRef}
              className={`absolute -top-8 -right-8 w-8 h-8 ${trblCursor}`}
            >
              <div className="absolute inset-2 border pointer-events-none" />
            </div>
            <div
              ref={bottomLeftRef}
              className={`absolute -bottom-8 -left-8 w-8 h-8 ${trblCursor}`}
            >
              <div className="absolute inset-2 border pointer-events-none" />
            </div>
            <div
              ref={bottomRightRef}
              className={`absolute -bottom-8 -right-8 w-8 h-8 ${tlbrCursor}`}
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
