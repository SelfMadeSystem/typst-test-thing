import { useState, useRef, useEffect } from "react";
import "./App.css";
import {
  createTypstRenderer,
  createTypstCompiler,
} from "@myriaddreamin/typst.ts";
import type { TypstRenderer, TypstCompiler } from "@myriaddreamin/typst.ts";
import renderModule from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";
import compileModule from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";

function App() {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef<OffscreenCanvas>(new OffscreenCanvas(800, 600));
  const renderCtx = renderRef.current.getContext("2d")!;
  const typstRenderer = useRef<TypstRenderer | null>(null);
  const typstCompiler = useRef<TypstCompiler | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const renderer = createTypstRenderer();
    renderer
      .init({
        getModule: () => renderModule,
      })
      .catch(console.error);

    typstRenderer.current = renderer;

    const compiler = createTypstCompiler();
    compiler
      .init({
        getModule: () => compileModule,
        beforeBuild: [
          async (a, b) => {
            console.log(a, b);
          },
        ], // apparently this is needed for fonts to load...? idk
      })
      .catch(console.error);

    typstCompiler.current = compiler;
  }, []);

  function render() {
    const renderer = typstRenderer.current;
    const compiler = typstCompiler.current;
    const canvas = canvasRef.current;
    if (!renderer || !compiler || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    compiler.addSource("/main.typ", `\
#set page(margin: 0pt)
${text}`);
    compiler
      .compile({
        mainFilePath: "/main.typ",
        diagnostics: "full",
        format: "vector",
      })
      .then(async ({ result, diagnostics }) => {
        if (result) {
          if (diagnostics && diagnostics.length > 0) console.info(diagnostics);
          renderCtx.clearRect(0, 0, 800, 600);
          await renderer
            .renderCanvas({
              // The types are wrong in the package
              canvas: renderCtx as unknown as CanvasRenderingContext2D,
              artifactContent: result,
              pageOffset: 0,
              format: "vector",
              pixelPerPt: 2,
              backgroundColor: "#ff000000",
            })
            .catch(console.error);

          // Invert colors of the render
          const imgData = renderCtx.getImageData(0, 0, 800, 600);

          for (let i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = 255 - imgData.data[i];
            imgData.data[i + 1] = 255 - imgData.data[i + 1];
            imgData.data[i + 2] = 255 - imgData.data[i + 2];
          }

          ctx.clearRect(0, 0, 800, 600);
          ctx.putImageData(imgData, 0, 0);
        } else {
          console.error(diagnostics);
        }
      })
      .catch(console.error);
  }

  return (
    <div className="App">
      <div className="p-4 flex justify-center flex-row gap-4">
        <textarea
          className="p-2 border resize border-gray-300 rounded bg-gray-700"
          ref={inputRef}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="p-2 bg-blue-500 text-white rounded" onClick={render}>
          Draw
        </button>
      </div>
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
}

export default App;
