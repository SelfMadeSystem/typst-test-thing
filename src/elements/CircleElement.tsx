import { useState, useRef, useEffect } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { ElementComponent } from "./Element";
import { ResizeElement } from "./ResizeElement";

export const CircleElement = (({
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
}) => {
  const { selectedElements, setSelectedElements } = useEditorContext();

  const selected = selectedElements.includes(id);

  const svgRef = useRef<SVGSVGElement>(null);

  const [sizeInfo, setSizeInfo] = useState({
    x: initialX,
    y: initialY,
    width: initialWidth,
    height: initialHeight,
    rotation: 0,
  });
  const [lineWidth] = useState(5);
  const [lineColor] = useState("white");

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedElements([id]);
    }

    const svg = svgRef.current;
    svg?.addEventListener("mousedown", handleMouseDown);

    return () => {
      svg?.removeEventListener("mousedown", handleMouseDown);
    };
  }, [id, setSelectedElements]);

  return (
    <ResizeElement
      sizeInfo={sizeInfo}
      setSizeInfo={setSizeInfo}
      selected={selected}
      startResizing={true}
      id={id}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="50%"
          cy="50%"
          rx="50%"
          ry="50%"
          r={`calc(50% - ${lineWidth / 2}px)`}
          stroke="transparent"
          strokeWidth={16}
          fill="transparent"
          style={{ pointerEvents: "stroke" }}
        />
        <ellipse
          cx="50%"
          cy="50%"
          rx="50%"
          ry="50%"
          r={`calc(50% - ${lineWidth / 2}px)`}
          stroke={lineColor}
          strokeWidth={lineWidth}
          fill="transparent"
          style={{ pointerEvents: "stroke" }}
        />
      </svg>
    </ResizeElement>
  );
}) satisfies ElementComponent;
