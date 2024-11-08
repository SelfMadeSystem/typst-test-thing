import { useState } from "react";
import type { TypstRenderer, TypstCompiler } from "@myriaddreamin/typst.ts";
import {
  createTypstRenderer,
  createTypstCompiler,
} from "@myriaddreamin/typst.ts";
import renderModule from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";
import compileModule from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";
import { DiagnosticsData } from "@myriaddreamin/typst.ts/dist/esm/compiler.mjs";

const compiler = createTypstCompiler();
compiler
  .init({
    getModule: () => compileModule,
    beforeBuild: [async () => {}], // apparently this is needed for fonts to load...? idk
  })
  .catch(console.error);
const renderer = createTypstRenderer();
renderer
  .init({
    getModule: () => renderModule,
  })
  .catch(console.error);

export function useRenderer({
  width = 800,
  height = 600,
  callback,
}: {
  width?: number;
  height?: number;
  callback: (
    renderer: TypstRenderer,
    compiler: TypstCompiler,
    result: Uint8Array | undefined,
    diagnostics: DiagnosticsData["full"][] | undefined
  ) => void;
  }) {
  const [pixelPerPt, setPixelPerPt] = useState(2);

  async function render(text: string) {
    if (!renderer || !compiler) {
      console.error("Renderer or compiler not initialized");
      return;
    }

    compiler.addSource(
      "/main.typ",
      `
#set page(margin: 0pt, width: ${width / pixelPerPt}pt, height: ${
        height / pixelPerPt
      }pt)
#set text(white)
${text}`
    );
    const { result, diagnostics } = await compiler.compile({
      mainFilePath: "/main.typ",
      diagnostics: "full",
      format: "vector",
    });
    if (result) {
      if (diagnostics && diagnostics.length > 0) console.info(diagnostics);
    } else {
      console.error(diagnostics);
    }
    callback(renderer, compiler, result, diagnostics);
  }

  return {
    renderer,
    compiler,
    pixelPerPt,
    setPixelPerPt,
    render,
  };
}
