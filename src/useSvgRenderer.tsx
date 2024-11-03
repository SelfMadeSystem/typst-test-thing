import type { TypstRenderer, TypstCompiler } from "@myriaddreamin/typst.ts";
import { useRenderer } from "./useRenderer";
import { RefObject } from "react";

export function useSvgRenderer({
  width = 800,
  height = 600,
  container,
}: {
  width?: number;
  height?: number;
  container: RefObject<HTMLElement>;
}) {
  const { renderer, compiler, pixelPerPt, setPixelPerPt, render } = useRenderer(
    { width, height, callback: renderCallback }
  );

  async function renderCallback(
    renderer: TypstRenderer,
    _compiler: TypstCompiler,
    result: Uint8Array
  ) {
    await renderer
      .renderToSvg({
        container: container.current!,
        artifactContent: result,
        format: "vector",
      })
      .catch(console.error);
  }

  return {
    renderer,
    compiler,
    pixelPerPt,
    setPixelPerPt,
    render,
  };
}
