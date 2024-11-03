import { useState, useRef, useEffect } from "react";
import { useCanvasRenderer } from "./useCanvasRenderer";

export function CanvasThing() {
  const {
    ctx: renderCtx,
    pixelPerPt,
    setPixelPerPt,
    render,
  } = useCanvasRenderer();

  const [text, setText] = useState("");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [scale, setScale] = useState((pixelPerPt / 2) ** 0.5);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  function redraw() {
    if (!canvasRef.current || !renderCtx) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(renderCtx.canvas, x, y);
  }

  async function rerender() {
    await render(text);

    redraw();
  }

  useEffect(() => {
    redraw();
  }, [x, y]);

  useEffect(() => {
    rerender();
  }, [pixelPerPt]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex items-center">
        <textarea
          className="p-2 bg-gray-800 text-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          className="ml-4 p-1 w-12 bg-gray-800 text-white"
          type="number"
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
        />
        <input
          className="ml-4 p-1 w-12 bg-gray-800 text-white"
          type="number"
          value={y}
          onChange={(e) => setY(Number(e.target.value))}
        />
        <input
          className="ml-4 p-1 w-12 bg-gray-800 text-white"
          type="number"
          value={scale}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(e) => {
            const value = Number(e.target.value);
            setScale(value);
            setPixelPerPt(value ** 2 * 2);
          }}
        />
        <button className="ml-4 p-2 bg-gray-800 text-white" onClick={rerender}>
          Render
        </button>
      </div>
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
}
