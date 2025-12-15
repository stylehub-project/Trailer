import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speed: number;
  opacity: number;
  depth: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  age: number; // 0 to 1
}

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ripplesRef = useRef<Ripple[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });

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
    const particles: Particle[] = [];
    const particleCount = 180;

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x: x,
        y: y,
        baseX: x,
        baseY: y,
        size: Math.random() * 2,
        speed: Math.random() * 0.2 + 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        depth: Math.random() * 0.8 + 0.2, // increased depth range
      });
    }

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Global Parallax Target
      mouseRef.current = {
        x: (x / window.innerWidth) * 2 - 1,
        y: (y / window.innerHeight) * 2 - 1
      };

      // Ripple Logic
      const dx = x - lastMousePos.current.x;
      const dy = y - lastMousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Spawn a ripple if mouse moved significantly
      if (dist > 30) {
        ripplesRef.current.push({
          x,
          y,
          radius: 1,
          age: 0
        });
        lastMousePos.current = { x, y };
      }
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

      // Update Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const ripple = ripplesRef.current[i];
        ripple.radius += 5; // Expand speed
        ripple.age += 0.015; // Fade speed

        if (ripple.age >= 1) {
          ripplesRef.current.splice(i, 1);
        }
      }
      
      // Draw Particles
      particles.forEach((p) => {
        // 1. Vertical scrolling
        p.baseY -= p.speed;
        if (p.baseY < -50) p.baseY = height + 50;

        // 2. Apply Mouse Parallax
        const parallaxX = targetX * p.depth * 60; 
        const parallaxY = targetY * p.depth * 60;
        
        let drawX = p.baseX + parallaxX;
        let drawY = p.baseY + parallaxY;

        // 3. Apply Ripple Distortion
        let rippleOffsetX = 0;
        let rippleOffsetY = 0;

        ripplesRef.current.forEach(r => {
            const dx = drawX - r.x;
            const dy = drawY - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Interaction band width (ring thickness essentially)
            const distFromWave = Math.abs(dist - r.radius);
            
            if (distFromWave < 50) {
                // Force is stronger when ripple is young and particle is close to wave front
                const force = (1 - r.age) * (1 - distFromWave / 50) * 8;
                
                // Push particles away from center of ripple
                const angle = Math.atan2(dy, dx);
                rippleOffsetX += Math.cos(angle) * force;
                rippleOffsetY += Math.sin(angle) * force;
            }
        });

        // Final position
        drawX += rippleOffsetX;
        drawY += rippleOffsetY;

        // Wrapping handling for X (simple)
        if (drawX > width + 50) drawX -= (width + 100);
        if (drawX < -50) drawX += (width + 100);

        ctx.fillStyle = `rgba(200, 220, 255, ${p.opacity})`;
        ctx.beginPath();
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
      
      {/* Dark Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_120%)]" />

      {/* Canvas for stars */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
    </div>
  );
};

export default Background;