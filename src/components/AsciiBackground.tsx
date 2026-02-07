'use client';

import { useEffect, useRef } from 'react';

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 6;

    const renderStatic = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.offsetWidth;
      const height = parent.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);

      // Use a fixed time value to produce one static frame
      const t = 4.0;

      // Noise function at fixed time
      const noise = (x: number, y: number): number => {
        const x1 = Math.sin(x * 0.02 + t) * Math.cos(y * 0.03 + t * 0.7);
        const y1 = Math.cos(x * 0.03 - t * 0.5) * Math.sin(y * 0.02 + t * 0.8);
        const z1 = Math.sin((x + y) * 0.01 + t * 0.6);
        return (x1 + y1 + z1) / 3;
      };

      // Pattern function at fixed time
      const pattern = (x: number, y: number): number => {
        const wave1 = Math.sin(x * 0.008 + t * 0.3) * Math.cos(y * 0.006);
        const wave2 = Math.cos(x * 0.005 - y * 0.007 + t * 0.2);
        const wave3 = Math.sin((x + y) * 0.004 + t * 0.25);

        const cx = width / 2;
        const cy = height / 2;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const ripple = Math.sin(dist * 0.02 - t * 0.5) * 0.5;

        return (wave1 + wave2 + wave3 + ripple) / 4;
      };

      // Fixed clarity (peak of clarity cycle at t=4.0 with cycleLength=8)
      const cycleLength = 8;
      const cyclePos = (t % cycleLength) / cycleLength;
      const clarity = Math.pow(Math.sin(cyclePos * Math.PI), 2);

      ctx.clearRect(0, 0, width, height);

      // Draw the noise/pattern field
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;

          const noiseVal = noise(x, y);
          const patternVal = pattern(x, y);

          const blended = noiseVal * (1 - clarity) + patternVal * clarity;
          const opacity = (blended + 1) / 2;
          const finalOpacity = opacity * 0.15;

          ctx.fillStyle = `rgba(5, 90, 70, ${finalOpacity})`;
          ctx.fillRect(x, y, gridSize - 1, gridSize - 1);
        }
      }

      // Draw emerging shapes (same as original, at fixed time)
      if (clarity > 0.3) {
        const shapeOpacity = (clarity - 0.3) * 0.15;
        ctx.strokeStyle = `rgba(5, 90, 70, ${shapeOpacity})`;
        ctx.lineWidth = 1;

        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const startY = height * (0.2 + i * 0.15);

          for (let x = 0; x < width; x += 5) {
            const y = startY + Math.sin(x * 0.01 + t * 0.5 + i) * 40
                            + Math.cos(x * 0.02 - t * 0.3) * 20;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      }
    };

    renderStatic();

    window.addEventListener('resize', renderStatic);
    return () => {
      window.removeEventListener('resize', renderStatic);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
