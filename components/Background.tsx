import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5,
        speed: Math.random() * 0.2 + 0.05,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw Particles
      particles.forEach((p) => {
        ctx.fillStyle = `rgba(200, 220, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Move slightly up
        p.y -= p.speed;
        
        // Reset if out of bounds
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Cinematic Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.07] bg-noise mix-blend-overlay pointer-events-none" />
      
      {/* Dark Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_120%)]" />

      {/* Canvas for subtle moving stars */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
    </div>
  );
};

export default Background;