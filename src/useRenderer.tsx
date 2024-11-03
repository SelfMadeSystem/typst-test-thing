import { useRef, useState, useEffect } from "react";
import type { TypstRenderer, TypstCompiler } from "@myriaddreamin/typst.ts";
import {
  createTypstRenderer,
  createTypstCompiler,
} from "@myriaddreamin/typst.ts";
import renderModule from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";
import compileModule from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";

export function useRenderer() {
  const [renderer, setRenderer] = useState<TypstRenderer | null>(null);
  const [compiler, setCompiler] = useState<TypstCompiler | null>(null);
  const [canvas, setCanvas] = useState<OffscreenCanvas | null>(null);
  const [ctx, setCtx] = useState<OffscreenCanvasRenderingContext2D | null>(
    null
  );
  const image = useRef<ImageData | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      const canvas = new OffscreenCanvas(800, 600);
      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
      })!;

      setCanvas(canvas);
      setCtx(ctx);

      const renderer = createTypstRenderer();
      renderer
        .init({
          getModule: () => renderModule,
        })
        .catch(console.error);

      setRenderer(renderer);

      const compiler = createTypstCompiler();
      compiler
        .init({
          getModule: () => compileModule,
          beforeBuild: [async () => {}], // apparently this is needed for fonts to load...? idk
        })
        .catch(console.error);

      setCompiler(compiler);
    }
  }, []);

  async function render(text: string) {
    if (!renderer || !compiler || !canvas || !ctx) return;

    compiler.addSource(
      "/main.typ",
      `
#set page(margin: 0pt)
${text}`
    );
    const { result, diagnostics } = await compiler.compile({
      mainFilePath: "/main.typ",
      diagnostics: "full",
      format: "vector",
    });
    if (result) {
      if (diagnostics && diagnostics.length > 0) console.info(diagnostics);
      ctx.clearRect(0, 0, 800, 600);
      await renderer
        .renderCanvas({
          // The types are wrong in the package
          canvas: ctx as unknown as CanvasRenderingContext2D,
          artifactContent: result,
          pageOffset: 0,
          format: "vector",
          pixelPerPt: 2,
          backgroundColor: "#00000000",
        })
        .catch(console.error);

      // Invert colors of the render
      const imgData = ctx.getImageData(0, 0, 800, 600);

      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i];
        imgData.data[i + 1] = 255 - imgData.data[i + 1];
        imgData.data[i + 2] = 255 - imgData.data[i + 2];
      }

      image.current = imgData;
    } else {
      console.error(diagnostics);
    }
  }

  return { renderer, compiler, canvas, ctx, image, render };
}
