import { useState, useRef, useEffect } from "react";
import { useEditorContext } from "../editor/EditorContext";
import { ElementComponent, ElementProps } from "./Element";
import { ResizeElement } from "./ResizeElement";
import { getInitialSizeInfo, ResizeValues } from "./resizeElementTypes";

export const RectElement = (({ id, reason }: ElementProps<ResizeValues>) => {
  const { selectedElement, setSelectedElements } = useEditorContext();

  const selected = selectedElement === id;

  const topLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);

  const [sizeInfo, setSizeInfo] = useState(getInitialSizeInfo(reason));
  const { width, height } = sizeInfo;
  const [lineWidth] = useState(5);
  const [lineColor] = useState("white");
  const [rounding] = useState(5);

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
      startResizing={true}
      id={id}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: `${lineWidth}px solid ${lineColor}`,
          borderRadius: rounding,
        }}
      />
      <div
        style={{
          top: -8,
          left: -8,
          width,
          height: lineWidth,
        }}
        ref={topLineRef}
        className="absolute border-8 border-transparent box-content cursor-move pointer-events-auto"
      />
      <div
        style={{
          top: -8,
          left: width - 8 - lineWidth,
          width: lineWidth,
          height,
        }}
        ref={rightLineRef}
        className="absolute border-8 border-transparent box-content cursor-move pointer-events-auto"
      />
      <div
        style={{
          top: height - 8 - lineWidth,
          left: -8,
          width,
          height: lineWidth,
        }}
        ref={bottomLineRef}
        className="absolute border-8 border-transparent box-content cursor-move pointer-events-auto"
      />
      <div
        style={{
          top: -8,
          left: -8,
          width: lineWidth,
          height,
        }}
        ref={leftLineRef}
        className="absolute border-8 border-transparent box-content cursor-move pointer-events-auto"
      />
    </ResizeElement>
  );
}) satisfies ElementComponent<ResizeValues>;
