import { useRef, useState } from "react";
import { ElementComponent, ElementProps } from "./Element";
import { CanvasValues } from "./canvasTypes";
import { getInitialSizeInfo } from "./resizeElementTypes";
import { TypstElement } from "./TypstElement";
import { useSvgRenderer } from "../useSvgRenderer";

export const SvgTypstElement = (({
  id,
  reason,
}: ElementProps<CanvasValues>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizeInfo, setSizeInfo] = useState(
    getInitialSizeInfo(reason, 200, 100)
  );
  const { width, height } = sizeInfo;
  const { pixelPerPt, setPixelPerPt, render } = useSvgRenderer({
    width,
    height,
    container: containerRef,
  });

  return (
    <TypstElement
      reason={reason}
      id={id}
      sizeInfo={sizeInfo}
      setSizeInfo={setSizeInfo}
      render={render}
      pixelPerPt={pixelPerPt}
      setPixelPerPt={setPixelPerPt}
    >
      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{
          transform: `scale(${pixelPerPt})`,
          transformOrigin: "top left",
          scrollbarWidth: "none",
          width: width / pixelPerPt,
          height: height / pixelPerPt,
        }}
      />
    </TypstElement>
  );
}) satisfies ElementComponent<CanvasValues>;
