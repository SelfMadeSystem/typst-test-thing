import { useState, useEffect } from "react";
import type { TypstRenderer, TypstCompiler } from "@myriaddreamin/typst.ts";
import { useRenderer } from "./useRenderer";

export function useCanvasRenderer({
  width = 800,
  height = 600,
}: {
  width?: number;
  height?: number;
} = {}) {
  const { renderer, compiler, pixelPerPt, setPixelPerPt, render } = useRenderer(
    { width, height, callback: renderCallback }
  );
  const [canvas, setCanvas] = useState<OffscreenCanvas | null>(null);
  const [ctx, setCtx] = useState<OffscreenCanvasRenderingContext2D | null>(
    null
  );

  useEffect(() => {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    })!;

    setCanvas(canvas);
    setCtx(ctx);
  }, []);

  useEffect(() => {
    if (canvas && ctx) {
      canvas.width = width;
      canvas.height = height;
    }
  }, [width, height, canvas, ctx]);

  async function renderCallback(
    renderer: TypstRenderer,
    _compiler: TypstCompiler,
    result: Uint8Array
  ) {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, 800, 600);
    await renderer
      .renderCanvas({
        // The types are wrong in the package
        canvas: ctx as unknown as CanvasRenderingContext2D,
        artifactContent: result,
        pageOffset: 0,
        format: "vector",
        pixelPerPt,
        backgroundColor: "#00000000",
      })
      .catch(console.error);
  }

  return {
    renderer,
    compiler,
    canvas,
    ctx,
    pixelPerPt,
    setPixelPerPt,
    render,
  };
}
