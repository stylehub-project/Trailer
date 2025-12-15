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
  baseRadius: number;
  speed: number;
  size: number;
  color: string;
  // Physics for interaction
  offsetX: number;
  offsetY: number;
  vx: number;
  vy: number;
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

    // Initialize particles (Background - Calm)
    const particles: Particle[] = [];
    const particleCount = 200;

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

    // Initialize Orbit Particles (Interactive)
    const orbitParticles: OrbitParticle[] = [];
    const orbitCount = 40; // More orbit particles for effect
    for (let i = 0; i < orbitCount; i++) {
      const radius = 30 + Math.random() * 40;
      orbitParticles.push({
        angle: Math.random() * Math.PI * 2,
        radius: radius,
        baseRadius: radius,
        speed: (Math.random() - 0.5) * 0.05,
        size: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? '#00f0ff' : '#ffffff',
        offsetX: 0,
        offsetY: 0,
        vx: 0,
        vy: 0
      });
    }

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

    const handleClick = (e: MouseEvent) => {
      // Explosion: Apply velocity ONLY to orbit particles
      orbitParticles.forEach(p => {
        // Explode outward from the center of the orbit ring (which is mouse pos)
        const angle = p.angle; 
        const force = 15 + Math.random() * 20;
        
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleClick);

    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let orbitCenterX = width / 2;
    let orbitCenterY = height / 2;

    const render = () => {
      const audioIntensity = getAudioIntensity();
      const pulseFactor = 1 + audioIntensity * 2;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      targetX += (mouseRef.current.x - targetX) * 0.05;
      targetY += (mouseRef.current.y - targetY) * 0.05;
      
      orbitCenterX += (mousePixelPos.current.x - orbitCenterX) * 0.1;
      orbitCenterY += (mousePixelPos.current.y - orbitCenterY) * 0.1;

      // Update Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const ripple = ripplesRef.current[i];
        ripple.radius += 5;
        ripple.age += 0.015;
        if (ripple.age >= 1) ripplesRef.current.splice(i, 1);
      }
      
      // Draw Background Particles (Calm, no physics interaction from click)
      particles.forEach((p) => {
        const currentSize = p.baseSize * pulseFactor;
        
        p.baseY -= p.speed * (1 + audioIntensity * 2);
        if (p.baseY < -50) p.baseY = height + 50;

        const parallaxX = targetX * p.depth * 60; 
        const parallaxY = targetY * p.depth * 60;
        
        let drawX = p.baseX + parallaxX;
        let drawY = p.baseY + parallaxY;

        // Ripples still affect background for atmosphere
        let rippleOffsetX = 0;
        let rippleOffsetY = 0;
        ripplesRef.current.forEach(r => {
            const dx = drawX - r.x;
            const dy = drawY - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
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

        if (drawX > width + 50) drawX -= (width + 100);
        if (drawX < -50) drawX += (width + 100);

        ctx.fillStyle = `rgba(200, 220, 255, ${p.opacity * (0.8 + audioIntensity)})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Orbit Particles (Interactive)
      orbitParticles.forEach(op => {
        // Rotation
        op.angle += op.speed + (op.speed > 0 ? 0.01 : -0.01) * audioIntensity;
        
        // Physics update (Spring back to center)
        const k = 0.05; // Stiffness
        const drag = 0.9; // Friction

        const ax = -k * op.offsetX;
        const ay = -k * op.offsetY;

        op.vx += ax;
        op.vy += ay;
        op.vx *= drag;
        op.vy *= drag;

        op.offsetX += op.vx;
        op.offsetY += op.vy;

        // Calculate Position
        const dynamicRadius = op.radius + (Math.sin(Date.now() * 0.005 + op.angle) * 10 * audioIntensity);
        const opX = orbitCenterX + Math.cos(op.angle) * dynamicRadius + op.offsetX;
        const opY = orbitCenterY + Math.sin(op.angle) * dynamicRadius + op.offsetY;

        ctx.fillStyle = op.color;
        ctx.globalAlpha = 0.8 + audioIntensity * 0.2;
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
      window.removeEventListener('mousedown', handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] bg-noise mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_120%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-50 pointer-events-auto" />
    </div>
  );
};

export default Background;