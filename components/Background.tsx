import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Initialize particles with a depth factor for parallax
    const particles: { 
      x: number; 
      y: number; 
      size: number; 
      speed: number; 
      opacity: number;
      depth: number; // 0.1 to 1.0, where 1.0 moves most with mouse
    }[] = [];
    
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5,
        speed: Math.random() * 0.2 + 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        depth: Math.random() * 0.5 + 0.1,
      });
    }

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position from -1 to 1
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation for mouse movement (lag effect)
      targetX += (mouseRef.current.x - targetX) * 0.05;
      targetY += (mouseRef.current.y - targetY) * 0.05;
      
      // Draw Particles
      particles.forEach((p) => {
        ctx.fillStyle = `rgba(200, 220, 255, ${p.opacity})`;
        ctx.beginPath();
        
        // Apply parallax offset based on depth
        // We invert direction so background feels "farther away"
        const offsetX = targetX * p.depth * 50; 
        const offsetY = targetY * p.depth * 50;
        
        let drawX = p.x + offsetX;
        let drawY = p.y + offsetY;

        // Wrap around logic needs to account for offset to prevent popping
        // Simple wrap for vertical movement animation
        p.y -= p.speed;
        if (p.y < -50) p.y = height + 50;
        
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fill();
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
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Cinematic Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.07] bg-noise mix-blend-overlay pointer-events-none" />
      
      {/* Dark Gradient Vignette - Dynamic slightly based on mouse? */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_120%)]" />

      {/* Canvas for subtle moving stars */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
    </div>
  );
};

export default Background;