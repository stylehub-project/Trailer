import React, { useEffect, useRef } from 'react';
import { getAudioIntensity } from '../utils/audio';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  baseSize: number;
  speed: number;
  opacity: number;
  depth: number;
}

interface OrbitParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  color: string;
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
  // Add direct pixel position for orbit calculations
  const mousePixelPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

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
    const particleCount = 200; // Increased count

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      particles.push({
        x: x,
        y: y,
        baseX: x,
        baseY: y,
        size: size,
        baseSize: size,
        speed: Math.random() * 0.2 + 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        depth: Math.random() * 0.8 + 0.2,
      });
    }

    // Initialize Orbit Particles
    const orbitParticles: OrbitParticle[] = [];
    const orbitCount = 25;
    for (let i = 0; i < orbitCount; i++) {
      orbitParticles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 30 + Math.random() * 40,
        speed: (Math.random() - 0.5) * 0.05,
        size: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.5 ? '#00f0ff' : '#ffffff',
      });
    }

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      mousePixelPos.current = { x, y };

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
    // Smooth orbit center follower
    let orbitCenterX = width / 2;
    let orbitCenterY = height / 2;

    const render = () => {
      // Audio Reactivity
      const audioIntensity = getAudioIntensity(); // 0 to 1
      const pulseFactor = 1 + audioIntensity * 2; // Scale multiplier

      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation for mouse movement (lag effect)
      targetX += (mouseRef.current.x - targetX) * 0.05;
      targetY += (mouseRef.current.y - targetY) * 0.05;
      
      // Smooth Orbit Center
      orbitCenterX += (mousePixelPos.current.x - orbitCenterX) * 0.1;
      orbitCenterY += (mousePixelPos.current.y - orbitCenterY) * 0.1;

      // Update Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const ripple = ripplesRef.current[i];
        ripple.radius += 5; // Expand speed
        ripple.age += 0.015; // Fade speed

        if (ripple.age >= 1) {
          ripplesRef.current.splice(i, 1);
        }
      }
      
      // Draw Background Particles
      particles.forEach((p) => {
        // 1. Audio Reactive Size
        const currentSize = p.baseSize * pulseFactor;

        // 2. Vertical scrolling (affected slightly by audio intensity for speed burst)
        p.baseY -= p.speed * (1 + audioIntensity * 2);
        if (p.baseY < -50) p.baseY = height + 50;

        // 3. Apply Mouse Parallax
        const parallaxX = targetX * p.depth * 60; 
        const parallaxY = targetY * p.depth * 60;
        
        let drawX = p.baseX + parallaxX;
        let drawY = p.baseY + parallaxY;

        // 4. Apply Ripple Distortion
        let rippleOffsetX = 0;
        let rippleOffsetY = 0;

        ripplesRef.current.forEach(r => {
            const dx = drawX - r.x;
            const dy = drawY - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Interaction band width
            const distFromWave = Math.abs(dist - r.radius);
            
            if (distFromWave < 50) {
                const force = (1 - r.age) * (1 - distFromWave / 50) * 8;
                const angle = Math.atan2(dy, dx);
                rippleOffsetX += Math.cos(angle) * force;
                rippleOffsetY += Math.sin(angle) * force;
            }
        });

        drawX += rippleOffsetX;
        drawY += rippleOffsetY;

        // Wrapping
        if (drawX > width + 50) drawX -= (width + 100);
        if (drawX < -50) drawX += (width + 100);

        ctx.fillStyle = `rgba(200, 220, 255, ${p.opacity * (0.8 + audioIntensity)})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Orbit Particles
      orbitParticles.forEach(op => {
        op.angle += op.speed + (op.speed > 0 ? 0.01 : -0.01) * audioIntensity;
        
        // Variable radius based on audio
        const dynamicRadius = op.radius + (Math.sin(Date.now() * 0.005 + op.angle) * 10 * audioIntensity);

        const opX = orbitCenterX + Math.cos(op.angle) * dynamicRadius;
        const opY = orbitCenterY + Math.sin(op.angle) * dynamicRadius;

        ctx.fillStyle = op.color;
        // Make them fade if far from mouse actually moving (optional, but looks nice)
        // keeping constant for now as requested
        ctx.globalAlpha = 0.6 + audioIntensity * 0.4;
        ctx.beginPath();
        ctx.arc(opX, opY, op.size * (1 + audioIntensity), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
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