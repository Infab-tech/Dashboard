/** Curved connector clipped to each circle's edge, bowing left or right of the straight line. */
export function circleEdgePath(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  curveDir: number,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const sx = x1 + ux * r1;
  const sy = y1 + uy * r1;
  const ex = x2 - ux * r2;
  const ey = y2 - uy * r2;
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const bow = Math.min(40, dist * 0.18) * curveDir;
  const cx = mx - uy * bow;
  const cy = my + ux * bow;
  return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
}

/** Stable pseudo-random bow direction per edge, so fanned-out curves don't all bow the same way. */
export function curveDirFor(a: string, b: string): number {
  let hash = 0;
  const s = a + b;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return hash % 2 === 0 ? 1 : -1;
}
