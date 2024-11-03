import { useState, useRef } from "react";
import { useRenderer } from "./useRenderer";

export function Thing() {
  const { image, render } = useRenderer();

  const [text, setText] = useState("hi");

  const textRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function onInput() {
    setText(textRef.current!.value);
  }

  async function onClick() {
    await render(text);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    ctx.putImageData(image.current!, 0, 0);
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex items-center">
        <textarea
          className="p-2 bg-gray-800 text-white"
          ref={textRef}
          defaultValue={text}
          onInput={onInput}
        />
        <button className="ml-4 p-2 bg-gray-800 text-white" onClick={onClick}>
          Render
        </button>
      </div>
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
}
