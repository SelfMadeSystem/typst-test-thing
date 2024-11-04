export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
