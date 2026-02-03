'use client';

import { useEffect, useRef } from 'react';

interface AttentionHead {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  intensity: number;
  speed: number;
}

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const headsRef = useRef<AttentionHead[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

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
      }
    };

    const initHeads = () => {
      const headCount = 6;
      headsRef.current = [];

      for (let i = 0; i < headCount; i++) {
        headsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          targetX: Math.random() * width,
          targetY: Math.random() * height,
          radius: 80 + Math.random() * 120,
          intensity: 0.3 + Math.random() * 0.4,
          speed: 0.005 + Math.random() * 0.01,
        });
      }
    };

    const pickNewTarget = (head: AttentionHead) => {
      head.targetX = Math.random() * width;
      head.targetY = Math.random() * height;
    };

    const animate = () => {
      timeRef.current += 0.016;

      // Clear with slight fade for trails
      ctx.fillStyle = 'rgba(247, 250, 249, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const heads = headsRef.current;

      // Update head positions (smooth easing toward targets)
      heads.forEach((head) => {
        const dx = head.targetX - head.x;
        const dy = head.targetY - head.y;

        head.x += dx * head.speed;
        head.y += dy * head.speed;

        // Pick new target when close
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          pickNewTarget(head);
        }
      });

      // Draw attention regions
      heads.forEach((head, i) => {
        // Create radial gradient for each attention head
        const gradient = ctx.createRadialGradient(
          head.x, head.y, 0,
          head.x, head.y, head.radius
        );

        // Pulsing intensity
        const pulse = Math.sin(timeRef.current * 2 + i * 1.5) * 0.1 + 0.9;
        const alpha = head.intensity * pulse * 0.25;

        gradient.addColorStop(0, `rgba(5, 90, 70, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(5, 90, 70, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(5, 90, 70, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(head.x, head.y, head.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw flowing connection lines between nearby heads
      ctx.strokeStyle = 'rgba(5, 90, 70, 0.08)';
      ctx.lineWidth = 1;

      for (let i = 0; i < heads.length; i++) {
        for (let j = i + 1; j < heads.length; j++) {
          const dx = heads[i].x - heads[j].x;
          const dy = heads[i].y - heads[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 300) {
            const opacity = (1 - dist / 300) * 0.15;
            ctx.strokeStyle = `rgba(5, 90, 70, ${opacity})`;

            // Draw curved line
            ctx.beginPath();
            ctx.moveTo(heads[i].x, heads[i].y);

            // Control point for curve
            const midX = (heads[i].x + heads[j].x) / 2;
            const midY = (heads[i].y + heads[j].y) / 2;
            const offset = Math.sin(timeRef.current + i + j) * 30;

            ctx.quadraticCurveTo(midX + offset, midY + offset, heads[j].x, heads[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw small "token" dots that flow between attention regions
      const tokenCount = 12;
      for (let i = 0; i < tokenCount; i++) {
        const t = (timeRef.current * 0.3 + i / tokenCount) % 1;
        const headIndex = i % heads.length;
        const nextHeadIndex = (i + 1) % heads.length;

        const head = heads[headIndex];
        const nextHead = heads[nextHeadIndex];

        // Interpolate position
        const x = head.x + (nextHead.x - head.x) * t;
        const y = head.y + (nextHead.y - head.y) * t;

        // Fade based on position in journey
        const fade = Math.sin(t * Math.PI);

        ctx.fillStyle = `rgba(5, 90, 70, ${fade * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initHeads();

    // Initial clear
    ctx.fillStyle = 'rgba(247, 250, 249, 1)';
    ctx.fillRect(0, 0, width, height);

    animate();

    const handleResize = () => {
      resizeCanvas();
      initHeads();
      ctx.fillStyle = 'rgba(247, 250, 249, 1)';
      ctx.fillRect(0, 0, width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
