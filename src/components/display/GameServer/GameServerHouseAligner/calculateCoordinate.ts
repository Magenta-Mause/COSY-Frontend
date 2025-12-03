const POSITIONS = [
  { x: 0.13, y: 0.045 },
  { x: 0.533, y: 0.095 },
  { x: 0.317, y: 0.285 },
  { x: 0.759, y: 0.305 },
  { x: 0.3, y: 0.33 },
  { x: 0.7, y: 0.4 },
  { x: 0.22, y: 0.48 },
  { x: 0.78, y: 0.55 },
  { x: 0.28, y: 0.62 },
  { x: 0.72, y: 0.68 },
  { x: 0.24, y: 0.75 },
  { x: 0.76, y: 0.8 },
  { x: 0.3, y: 0.86 },
  { x: 0.7, y: 0.92 },
  { x: 0.5, y: 0.98 },
];

function calculateCoordinate(index: number) {
  const base = POSITIONS[index % POSITIONS.length];

  if (base === undefined) {
    return { x: 0, y: 0 };
  }

  return {
    x: base.x,
    y: base.y,
  };
}

export default calculateCoordinate;
