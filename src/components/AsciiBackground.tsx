'use client';

import { useEffect, useRef } from 'react';

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;

    // Noise field parameters
    const gridSize = 6;
    let cols = 0;
    let rows = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = parent.offsetWidth;
        height = parent.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        cols = Math.ceil(width / gridSize);
        rows = Math.ceil(height / gridSize);
      }
    };

    // Simple noise function
    const noise = (x: number, y: number, t: number): number => {
      const x1 = Math.sin(x * 0.02 + t) * Math.cos(y * 0.03 + t * 0.7);
      const y1 = Math.cos(x * 0.03 - t * 0.5) * Math.sin(y * 0.02 + t * 0.8);
      const z1 = Math.sin((x + y) * 0.01 + t * 0.6);
      return (x1 + y1 + z1) / 3;
    };

    // Target pattern - gentle waves/curves that emerge
    const pattern = (x: number, y: number, t: number): number => {
      // Multiple overlapping wave patterns
      const wave1 = Math.sin(x * 0.008 + t * 0.3) * Math.cos(y * 0.006);
      const wave2 = Math.cos(x * 0.005 - y * 0.007 + t * 0.2);
      const wave3 = Math.sin((x + y) * 0.004 + t * 0.25);

      // Circular ripples
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const ripple = Math.sin(dist * 0.02 - t * 0.5) * 0.5;

      return (wave1 + wave2 + wave3 + ripple) / 4;
    };

    const animate = () => {
      time += 0.016;

      // Cycle: 0 = noisy, 1 = clear pattern
      // Use smooth sine wave for transition
      const cycleLength = 8; // seconds per full cycle
      const cyclePos = (time % cycleLength) / cycleLength;

      // Smooth transition: noise -> pattern -> noise
      // Spend more time in transition, brief moment of clarity
      const clarity = Math.pow(Math.sin(cyclePos * Math.PI), 2);

      ctx.clearRect(0, 0, width, height);

      // Draw the noise/pattern field
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;

          // Get noise and pattern values
          const noiseVal = noise(x, y, time * 2);
          const patternVal = pattern(x, y, time);

          // Blend between noise and pattern based on clarity
          const blended = noiseVal * (1 - clarity) + patternVal * clarity;

          // Map to opacity
          const opacity = (blended + 1) / 2; // normalize to 0-1
          const finalOpacity = opacity * 0.15; // keep it subtle

          ctx.fillStyle = `rgba(5, 90, 70, ${finalOpacity})`;
          ctx.fillRect(x, y, gridSize - 1, gridSize - 1);
        }
      }

      // Add some larger "emerging" shapes during clarity
      if (clarity > 0.3) {
        const shapeOpacity = (clarity - 0.3) * 0.15;
        ctx.strokeStyle = `rgba(5, 90, 70, ${shapeOpacity})`;
        ctx.lineWidth = 1;

        // Draw flowing curves that "emerge"
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const startY = height * (0.2 + i * 0.15);

          for (let x = 0; x < width; x += 5) {
            const y = startY + Math.sin(x * 0.01 + time * 0.5 + i) * 40
                            + Math.cos(x * 0.02 - time * 0.3) * 20;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
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
