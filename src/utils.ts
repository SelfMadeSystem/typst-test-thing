export type Vec2 = { x: number; y: number };

export type Satisfies<U, T extends U> = T;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function createId() {
  return Math.random().toString(36).substring(2);
}

/**
 * Draw text on canvas with word wrapping.
 * 
 * @returns The bottom y position of the text.
 */
export function wrapText(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(" ");
  let line = "";
  let lineY = y + lineHeight;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, lineY);
      line = words[n] + " ";
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, lineY);

  return lineY + lineHeight;
}
