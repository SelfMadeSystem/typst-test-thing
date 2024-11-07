import { useState, useRef, useEffect } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { ElementComponent, ElementProps } from "./Element";
import { ResizeElement } from "./ResizeElement";
import { getInitialSizeInfo, ResizeValues } from "./resizeElementTypes";

export type CircleValues = ResizeValues & {
  strokeWidth: number;
  strokeColor: string;
  fillColor: string;
};

export const CircleElement = (({
  id,
  reason,
  state,
}: ElementProps<CircleValues>) => {
  const { selectedElement, setSelectedElements } = useEditorContext();

  const selected = selectedElement === id;

  const svgRef = useRef<SVGSVGElement>(null);

  const [sizeInfo, setSizeInfo] = useState(getInitialSizeInfo(reason));
  const [strokeWidth] = useState(
    "values" in reason ? reason.values.strokeWidth : 5
  );
  const [strokeColor] = useState(
    "values" in reason ? reason.values.strokeColor : "#ffffff"
  );
  const [fillColor] = useState(
    "values" in reason ? reason.values.fillColor : "#ff0000aa"
  );

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

  useEffect(() => {
    state.current = {
      ...sizeInfo,
      strokeWidth,
      strokeColor,
      fillColor,
    };
  }, [sizeInfo, strokeWidth, strokeColor, fillColor, state]);

  return (
    <ResizeElement
      sizeInfo={sizeInfo}
      setSizeInfo={setSizeInfo}
      selected={selected}
      startResizing={selected && reason.type === "user-place"}
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
          r={`calc(50% - ${strokeWidth / 2}px)`}
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
          r={`calc(50% - ${strokeWidth / 2}px)`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill={fillColor}
          style={{
            pointerEvents: fillColor.endsWith("00") ? "stroke" : "auto",
          }}
        />
      </svg>
    </ResizeElement>
  );
}) satisfies ElementComponent<CircleValues>;
