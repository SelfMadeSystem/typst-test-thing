import type { TypstRenderer, TypstCompiler } from "@myriaddreamin/typst.ts";
import { useRenderer } from "./useRenderer";
import { useEffect, useRef } from "react";
import { DiagnosticsData } from "@myriaddreamin/typst.ts/dist/esm/compiler.mjs";
import { wrapText } from "./utils";

export function useCanvasRenderer({
  width = 800,
  height = 600,
  canvas,
}: {
  width?: number;
  height?: number;
  canvas: HTMLCanvasElement | null;
}) {
  const { renderer, compiler, pixelPerPt, setPixelPerPt, render } = useRenderer(
    { width, height, callback: renderCallback }
  );
  const offscreenCanvas = useRef<OffscreenCanvas | null>(null);

  useEffect(() => {
    if (!canvas) return;
    offscreenCanvas.current = canvas.transferControlToOffscreen();
  }, [canvas]);

  useEffect(() => {
    if (!offscreenCanvas.current) return;
    offscreenCanvas.current.width = width;
    offscreenCanvas.current.height = height;
  }, [width, height]);

  async function renderCallback(
    renderer: TypstRenderer,
    _compiler: TypstCompiler,
    result: Uint8Array | undefined,
    diagnostics: DiagnosticsData["full"][] | undefined
  ) {
    console.log("Rendering", result, diagnostics);
    const ctx = offscreenCanvas.current!.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);
    if (result) {
      // TODO: Use Worker to render when it gets implemented in Typst.ts
      await renderer
        .renderCanvas({
          // The types are wrong here in the Typst package
          canvas: ctx as unknown as CanvasRenderingContext2D,
          pixelPerPt,
          artifactContent: result,
          pageOffset: 0,
          format: "vector",
          backgroundColor: "#00000000",
        })
        .catch(console.error);
    } else if (diagnostics) {
      ctx.fillStyle = "red";
      ctx.font = "20px sans-serif";

      for (const diag of diagnostics) {
        wrapText(ctx, diag.message, 0, 0, width, 20);
      }
    }
  }

  return {
    renderer,
    compiler,
    pixelPerPt,
    setPixelPerPt,
    render,
  };
}
