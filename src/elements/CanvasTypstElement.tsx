import { useState } from "react";
import { ElementComponent, ElementProps } from "./Element";
import { useCanvasRenderer } from "../useCanvasRenderer";
import { CanvasValues } from "./canvasTypes";
import { getInitialSizeInfo } from "./resizeElementTypes";
import { TypstElement } from "./TypstElement";

export const CanvasTypstElement = (({
  id,
  reason,
  state,
}: ElementProps<CanvasValues>) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [sizeInfo, setSizeInfo] = useState(
    getInitialSizeInfo(reason, 200, 100)
  );
  const { width, height } = sizeInfo;
  const { pixelPerPt, setPixelPerPt, render } = useCanvasRenderer({
    width,
    height,
    canvas,
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
      state={state}
      type="canvasTypst"
    >
      <canvas ref={setCanvas} width={width} height={height} />
    </TypstElement>
  );
}) satisfies ElementComponent<CanvasValues>;
