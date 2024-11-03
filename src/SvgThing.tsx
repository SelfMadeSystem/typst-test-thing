import { useState, useRef } from "react";
import { useSvgRenderer } from "./useSvgRenderer";

export function SvgThing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pixelPerPt, setPixelPerPt, render } = useSvgRenderer({
    container: containerRef,
  });

  const [text, setText] = useState("");
  const [scale, setScale] = useState((pixelPerPt / 2) ** 0.5);

  async function rerender() {
    await render(text);
  }

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
      <div ref={containerRef} className="mt-4" style={{ 
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }} />
    </div>
  );
}
