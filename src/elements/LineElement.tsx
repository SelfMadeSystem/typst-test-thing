import { useState, useRef, useEffect } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { ElementComponent, ElementProps } from "./Element";
import { Vec2 } from "../utils";

export type LineValues = {
  start: Vec2;
  end: Vec2;
};

export const LineElement = (({ id, reason }: ElementProps<LineValues>) => {
  const { selectedElement, setSelectedElements, removeElement } =
    useEditorContext();

  const selected = selectedElement === id;

  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const startRef = useRef<SVGRectElement>(null);
  const endRef = useRef<SVGRectElement>(null);

  const [start, setStart] = useState(
    reason.type === "user-place" ? reason.mouse : reason.values.start
  );
  const [end, setEnd] = useState(
    reason.type === "user-place" ? reason.mouse : reason.values.start
  );
  const [startStart, setStartStart] = useState(start);
  const [startEnd, setStartEnd] = useState(end);
  const [lineWidth] = useState(5);
  const [lineColor] = useState("white");

  const [dragging, setDragging] = useState<false | "start" | "end" | "line">(
    reason.type === "user-place" ? "end" : false
  );
  const [mouseStart, setMouseStart] = useState(
    reason.type === "user-place" ? reason.mouse : { x: 0, y: 0 }
  );

  useEffect(() => {
    if (dragging == false) return;

    function handleMouseMove(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();

      const dx = e.clientX - mouseStart.x;
      const dy = e.clientY - mouseStart.y;

      const isSnapping = e.shiftKey;
      const snapAngle = 15;

      function snap(origin: Vec2, target: Vec2) {
        if (!isSnapping) return target;
        const angle = Math.atan2(target.y - origin.y, target.x - origin.x);
        const snappedAngle =
          Math.round(angle / (snapAngle * (Math.PI / 180))) *
          snapAngle *
          (Math.PI / 180);
        const distance = Math.hypot(target.y - origin.y, target.x - origin.x);
        return {
          x: origin.x + distance * Math.cos(snappedAngle),
          y: origin.y + distance * Math.sin(snappedAngle),
        };
      }

      switch (dragging) {
        case "start":
          setStart(
            snap(startEnd, {
              x: startStart.x + dx,
              y: startStart.y + dy,
            })
          );
          break;
        case "end":
          setEnd(
            snap(startStart, {
              x: startEnd.x + dx,
              y: startEnd.y + dy,
            })
          );
          break;
        case "line": {
          let moveX = dx;
          let moveY = dy;

          if (isSnapping) {
            if (Math.abs(dx) > Math.abs(dy)) {
              moveY = 0;
            } else {
              moveX = 0;
            }
          }
          setStart({
            x: startStart.x + moveX,
            y: startStart.y + moveY,
          });
          setEnd({
            x: startEnd.x + moveX,
            y: startEnd.y + moveY,
          });
          break;
        }
      }
    }

    function handleMouseUp(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, mouseStart, startEnd, startStart]);

  useEffect(() => {
    function startDrag(
      e: MouseEvent | React.MouseEvent,
      type: "start" | "end" | "line"
    ) {
      setSelectedElements([id]);
      e.preventDefault();
      e.stopPropagation();
      setDragging(type);
      setMouseStart({ x: e.clientX, y: e.clientY });
      setStartStart(start);
      setStartEnd(end);
    }

    {
      const line = lineRef.current;
      const start = startRef.current;
      const end = endRef.current;

      const sl = (e: MouseEvent) => startDrag(e, "line");
      const ss = (e: MouseEvent) => startDrag(e, "start");
      const se = (e: MouseEvent) => startDrag(e, "end");

      line?.addEventListener("mousedown", sl);
      start?.addEventListener("mousedown", ss);
      end?.addEventListener("mousedown", se);

      return () => {
        line?.removeEventListener("mousedown", sl);
        start?.removeEventListener("mousedown", ss);
        end?.removeEventListener("mousedown", se);
      };
    }
  }, [id, setSelectedElements, start, end]);

  useEffect(() => {
    if (!selected) return;

    function handleKeyDown(e: KeyboardEvent) {
      const amount = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case "Delete":
        case "Backspace":
          removeElement(id);
          e.preventDefault();
          break;
        case "Escape":
          setSelectedElements([]);
          e.preventDefault();
          break;
        case "ArrowUp":
          setStart({ x: start.x, y: start.y - amount });
          setEnd({ x: end.x, y: end.y - amount });
          e.preventDefault();
          break;
        case "ArrowDown":
          setStart({ x: start.x, y: start.y + amount });
          setEnd({ x: end.x, y: end.y + amount });
          e.preventDefault();
          break;
        case "ArrowLeft":
          setStart({ x: start.x - amount, y: start.y });
          setEnd({ x: end.x - amount, y: end.y });
          e.preventDefault();
          break;
        case "ArrowRight":
          setStart({ x: start.x + amount, y: start.y });
          setEnd({ x: end.x + amount, y: end.y });
          e.preventDefault();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <svg
      ref={svgRef}
      className="absolute overflow-visible top-0 left-0 pointer-events-none"
    >
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={lineColor}
        strokeWidth={lineWidth}
        strokeLinecap="round"
      />
      <line
        ref={lineRef}
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="transparent"
        strokeWidth={16}
        strokeLinecap="round"
        pointerEvents="all"
        cursor="move"
      />
      {selected && (
        <>
          <rect
            ref={startRef}
            x={start.x - 8}
            y={start.y - 8}
            width={16}
            height={16}
            className="fill-transparent hover:fill-blue-200"
            pointerEvents="all"
            cursor="move"
          />
          <rect
            ref={endRef}
            x={end.x - 8}
            y={end.y - 8}
            width={16}
            height={16}
            className="fill-transparent hover:fill-blue-200"
            pointerEvents="all"
            cursor="move"
          />
          <rect
            x={start.x - 5}
            y={start.y - 5}
            width={10}
            height={10}
            fill="transparent"
            stroke="white"
            strokeWidth={2}
          />
          <rect
            x={end.x - 5}
            y={end.y - 5}
            width={10}
            height={10}
            fill="transparent"
            stroke="white"
            strokeWidth={2}
          />
        </>
      )}
    </svg>
  );
}) satisfies ElementComponent<LineValues>;
