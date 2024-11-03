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

    compiler.addSource("/main.typ", text);
    compiler
      .compile({
        mainFilePath: "/main.typ",
        diagnostics: "full",
        inputs: {},
        format: "vector",
      })
      .then(({ result, diagnostics }) => {
        if (result) {
          if (diagnostics && diagnostics.length > 0) console.info(diagnostics);
          console.info(result);
          renderer.renderCanvas({
            canvas: ctx,
            artifactContent: result,
            pageOffset: 0,
            format: "vector",
            pixelPerPt: 4.5,
            backgroundColor: "#ff000000",
          });
        } else {
          console.error(diagnostics);
        }
      })
      .catch(console.error);
  }

  return (
    <div className="App">
      <div>
        <textarea ref={inputRef} onChange={(e) => setText(e.target.value)} />
        <button onClick={render}>Draw</button>
      </div>
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
}

export default App;
