'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
}

const ASCII_CHARS = ['○', '◦', '·', '•', '+', '×', '∘', '◯'];
const CONNECTION_CHARS = ['─', '│', '┼', '╱', '╲', '·'];

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    const initNodes = () => {
      const nodeCount = Math.floor((canvas.width * canvas.height) / 25000);
      nodesRef.current = [];

      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          char: ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
        });
      }
    };

    const drawConnection = (x1: number, y1: number, x2: number, y2: number, opacity: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const steps = Math.floor(Math.sqrt(dx * dx + dy * dy) / 20);

      if (steps < 1) return;

      ctx.fillStyle = `rgba(5, 90, 70, ${opacity * 0.4})`;
      ctx.font = '10px monospace';

      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const x = x1 + dx * t;
        const y = y1 + dy * t;

        // Choose character based on angle
        const angle = Math.atan2(dy, dx);
        let char = '·';
        if (Math.abs(angle) < Math.PI / 6 || Math.abs(angle) > 5 * Math.PI / 6) {
          char = '─';
        } else if (Math.abs(angle - Math.PI / 2) < Math.PI / 6 || Math.abs(angle + Math.PI / 2) < Math.PI / 6) {
          char = '│';
        } else if (angle > 0 && angle < Math.PI / 2 || angle < -Math.PI / 2) {
          char = '╲';
        } else {
          char = '╱';
        }

        ctx.fillText(char, x, y);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const connectionDistance = 150;

      // Update positions
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance;
            drawConnection(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, opacity);
          }
        }
      }

      // Draw nodes
      ctx.font = '14px monospace';
      nodes.forEach((node) => {
        ctx.fillStyle = 'rgba(5, 90, 70, 0.5)';
        ctx.fillText(node.char, node.x, node.y);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initNodes();
    animate();

    const handleResize = () => {
      resizeCanvas();
      initNodes();
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
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}
