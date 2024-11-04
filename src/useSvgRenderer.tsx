import type { TypstRenderer, TypstCompiler } from "@myriaddreamin/typst.ts";
import { useRenderer } from "./useRenderer";
import { RefObject } from "react";
import { DiagnosticsData } from "@myriaddreamin/typst.ts/dist/esm/compiler.mjs";

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
    result: Uint8Array | undefined,
    diagnostics: DiagnosticsData["full"][] | undefined
  ) {
    if (result) {
      await renderer
        .renderToSvg({
          container: container.current!,
          artifactContent: result,
          format: "vector",
        })
        .catch(console.error);
    } else if (diagnostics) {
      container.current!.innerHTML = "";

      const ul = document.createElement("ul");
      ul.style.color = "red";
      ul.style.listStyle = "none";
      ul.style.padding = "0";
      ul.style.margin = "0";

      for (const diagnostic of diagnostics) {
        const li = document.createElement("li");
        li.textContent = diagnostic.message;
        ul.appendChild(li);
      }

      container.current!.appendChild(ul);
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
