import { useState, useRef, useEffect } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { ElementComponent, ElementProps } from "./Element";
import { ResizeElement } from "./ResizeElement";
import { getInitialSizeInfo, ResizeValues } from "./resizeElementTypes";

export type RectValues = ResizeValues & {
  strokeWidth: number;
  strokeColor: string;
  fillColor: string;
  rounding: number;
};

export const RectElement = (({ id, reason, state }: ElementProps<RectValues>) => {
  const { selectedElement, setSelectedElements } = useEditorContext();

  const selected = selectedElement === id;

  const topLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);

  const [sizeInfo, setSizeInfo] = useState(getInitialSizeInfo(reason));
  const { width, height } = sizeInfo;
  const [strokeWidth] = useState(
    "values" in reason ? reason.values.strokeWidth : 5
  );
  const [strokeColor] = useState(
    "values" in reason ? reason.values.strokeColor : "#ffffff"
  );
  const [fillColor] = useState(
    "values" in reason ? reason.values.fillColor : "#00000000"
  );
  const [rounding] = useState("values" in reason ? reason.values.rounding : 0);

  useEffect(() => {
    state.current = {
      ...sizeInfo,
      strokeWidth,
      strokeColor,
      fillColor,
      rounding,
    };
  }, [sizeInfo, strokeWidth, strokeColor, fillColor, rounding, state]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedElements([id]);
    }

    const lineRefs = [
      topLineRef.current,
      rightLineRef.current,
      bottomLineRef.current,
      leftLineRef.current,
    ];

    lineRefs.forEach((ref) => {
      ref?.addEventListener("mousedown", handleMouseDown);
    });

    return () => {
      lineRefs.forEach((ref) => {
        ref?.removeEventListener("mousedown", handleMouseDown);
      });
    };
  }, [id, setSelectedElements]);

  return (
    <ResizeElement
      sizeInfo={sizeInfo}
      setSizeInfo={setSizeInfo}
      selected={selected}
      startResizing={selected && reason.type === "user-place"}
      id={id}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: `${strokeWidth}px solid ${strokeColor}`,
          backgroundColor: fillColor,
          borderRadius: rounding,
        }}
      />
      <div
        style={{
          top: -8,
          left: -8,
          width,
          height: strokeWidth,
        }}
        ref={topLineRef}
        className="absolute border-8 border-transparent box-content cursor-move pointer-events-auto"
      />
      <div
        style={{
          top: -8,
          left: width - 8 - strokeWidth,
          width: strokeWidth,
          height,
        }}
        ref={rightLineRef}
        className="absolute border-8 border-transparent box-content cursor-move pointer-events-auto"
      />
      <div
        style={{
          top: height - 8 - strokeWidth,
          left: -8,
          width,
          height: strokeWidth,
        }}
        ref={bottomLineRef}
        className="absolute border-8 border-transparent box-content cursor-move pointer-events-auto"
      />
      <div
        style={{
          top: -8,
          left: -8,
          width: strokeWidth,
          height,
        }}
        ref={leftLineRef}
        className="absolute border-8 border-transparent box-content cursor-move pointer-events-auto"
      />
    </ResizeElement>
  );
}) satisfies ElementComponent<RectValues>;
