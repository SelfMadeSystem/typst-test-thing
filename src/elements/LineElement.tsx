import { useState, useRef, useEffect } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { ElementComponent } from "./Element";

export const LineElement = (({
  id,
  x: initialX = 50,
  y: initialY = 50,
  width: initialWidth = 0,
  height: initialHeight = 0,
}: {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) => {
  const { selectedElements, setSelectedElements, removeElement } = useEditorContext();

  const selected = selectedElements.includes(id);

  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const startRef = useRef<SVGRectElement>(null);
  const endRef = useRef<SVGRectElement>(null);

  const [start, setStart] = useState({ x: initialX, y: initialY });
  const [end, setEnd] = useState({
    x: initialX + initialWidth,
    y: initialY + initialHeight,
  });
  const [startStart, setStartStart] = useState({ x: initialX, y: initialY });
  const [startEnd, setStartEnd] = useState({
    x: initialX + initialWidth,
    y: initialY + initialHeight,
  });
  const [lineWidth] = useState(5);
  const [lineColor] = useState("white");

  const [dragging, setDragging] = useState<false | "start" | "end" | "line">(
    false
  );
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (dragging == false) return;

    function handleMouseMove(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();

      const dx = e.clientX - mouseStart.x;
      const dy = e.clientY - mouseStart.y;

      switch (dragging) {
        case "start":
          setStart({
            x: startStart.x + dx,
            y: startStart.y + dy,
          });
          break;
        case "end":
          setEnd({
            x: startEnd.x + dx,
            y: startEnd.y + dy,
          });
          break;
        case "line":
          setStart({
            x: startStart.x + dx,
            y: startStart.y + dy,
          });
          setEnd({
            x: startEnd.x + dx,
            y: startEnd.y + dy,
          });
          break;
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
  }, [
    dragging,
    mouseStart.x,
    mouseStart.y,
    startEnd.x,
    startEnd.y,
    startStart.x,
    startStart.y,
  ]);

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
      switch (e.key) {
        case "Delete":
        case "Backspace":
          removeElement(id);
          break;
        case "Escape":
          setSelectedElements([]);
          break;
        case "ArrowUp":
          setStart({ x: start.x, y: start.y - 1 });
          setEnd({ x: end.x, y: end.y - 1 });
          break;
        case "ArrowDown":
          setStart({ x: start.x, y: start.y + 1 });
          setEnd({ x: end.x, y: end.y + 1 });
          break;
        case "ArrowLeft":
          setStart({ x: start.x - 1, y: start.y });
          setEnd({ x: end.x - 1, y: end.y });
          break;
        case "ArrowRight":
          setStart({ x: start.x + 1, y: start.y });
          setEnd({ x: end.x + 1, y: end.y });
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  })

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
}) satisfies ElementComponent;
