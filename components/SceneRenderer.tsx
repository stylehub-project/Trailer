import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Scene } from '../constants';

interface SceneRendererProps {
  scene: Scene;
}

// -- Animation Variants --

// Stagger container for words/letters
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger for improved pacing
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(10px)',
    transition: { duration: 0.8 },
  },
};

// Cinematic Letter Reveal (Up and Out) for Intro/Stack
const cinematicRevealVariant: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40, 
    scale: 0.8,
    filter: 'blur(8px)',
    rotateX: 45
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    rotateX: 0,
    transition: { 
      type: "spring",
      damping: 15,
      stiffness: 100,
      duration: 0.8 
    },
  },
};

// Aggressive Slide & Slam for Stacks (Legacy/Alternative)
const stackItemVariant: Variants = {
  hidden: { x: -100, opacity: 0, skewX: 20 },
  visible: { 
    x: 0, 
    opacity: 1, 
    skewX: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 }
  }
};

// Modified Glitch Effect: Less shaking, more readable, longer intervals
const glitchItemVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    textShadow: [
      "0px 0px 0px rgba(0,0,0,0)",
      "-3px 1px 0px rgba(255,0,0,0.8), 3px -1px 0px rgba(0,255,255,0.8)",
      "0px 0px 0px rgba(0,0,0,0)",
    ],
    x: [0, -3, 3, -1, 1, 0],
    skewX: [0, 5, -5, 2, -2, 0],
    opacity: 1,
    transition: { 
      duration: 0.3, 
      repeat: Infinity, 
      repeatType: "mirror",
      repeatDelay: 4, 
      ease: "linear"
    }
  }
};

// Helper to split text into letters
const SplitText: React.FC<{ text: string; variant?: Variants; className?: string }> = ({ text, variant, className }) => {
  return (
    <span className={`inline-block whitespace-nowrap ${className}`}>
      {text.split('').map((char, i) => (
        <motion.span key={i} variants={variant} className="inline-block">
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

const SceneRenderer: React.FC<SceneRendererProps> = ({ scene }) => {
  
  const renderContent = () => {
    switch (scene.type) {
      case 'intro':
        return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center text-center space-y-2 md:space-y-4"
          >
            {scene.lines.map((line, idx) => (
              <div key={idx} className="overflow-hidden p-2">
                <motion.h1 className="text-4xl md:text-6xl lg:text-8xl font-orbitron font-bold tracking-widest-cine text-white text-glow">
                  <SplitText text={line} variant={cinematicRevealVariant} />
                </motion.h1>
              </div>
            ))}
          </motion.div>
        );

      case 'hero':
         return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center text-center space-y-2 md:space-y-4"
          >
            {scene.lines.map((line, idx) => (
              <div key={idx} className="overflow-hidden">
                <motion.h1 className="text-4xl md:text-6xl lg:text-8xl font-orbitron font-bold tracking-widest-cine text-white text-glow">
                  <SplitText text={line} variant={cinematicRevealVariant} />
                </motion.h1>
              </div>
            ))}
            {scene.subText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.8, y: 0, transition: { delay: 1.5, duration: 1.5 } }}
                className="mt-8"
              >
                <p className="text-xs md:text-sm font-sans tracking-[0.5em] text-cine-blue uppercase border-b border-cine-blue/30 pb-2 inline-block">
                  {scene.subText}
                </p>
              </motion.div>
            )}
          </motion.div>
        );

      case 'stack':
        return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center space-y-4"
          >
            {scene.lines.map((line, idx) => (
              <h2 key={idx} className="text-4xl md:text-7xl font-orbitron font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-400">
                  <SplitText text={line} variant={cinematicRevealVariant} />
              </h2>
            ))}
          </motion.div>
        );

      case 'impact':
        return (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
                visible: { transition: { staggerChildren: 0.2 } },
                exit: { opacity: 0, scale: 1.1, filter: 'blur(10px)', transition: { duration: 0.5 } }
            }}
            className="flex flex-col items-center justify-center text-center z-10"
          >
            {scene.lines.map((line, idx) => (
              <motion.h1 
                key={idx} 
                variants={{
                    hidden: { opacity: 0, scale: 2, filter: "blur(20px)" },
                    visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 200, damping: 20 } }
                }}
                className="text-6xl md:text-9xl font-orbitron font-black text-white tracking-tight text-glow-strong mb-2"
              >
                {line}
              </motion.h1>
            ))}
            {scene.subText && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1, transition: { delay: 0.5, duration: 0.8, ease: "circOut" } }}
                className="flex flex-col items-center mt-6 w-full max-w-lg"
              >
                 <div className="h-[2px] w-full bg-cine-blue shadow-[0_0_15px_#00f0ff]" />
                 <p className="mt-4 text-cine-blue font-sans tracking-[0.6em] text-sm md:text-xl uppercase">
                   {scene.subText}
                 </p>
              </motion.div>
            )}
          </motion.div>
        );

      case 'glitch':
        return (
           <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center text-center space-y-4"
          >
             {scene.lines.map((line, idx) => (
              <motion.div
                key={idx}
                variants={glitchItemVariant}
                className="relative"
              >
                {/* Main Text */}
                <span className="text-5xl md:text-8xl font-mono font-bold text-white tracking-widest relative z-10 mix-blend-hard-light">
                  {line}
                </span>
                
                {/* Glitch Layer 1 - Cyan/Blue - Toned down */}
                <motion.span 
                    animate={{ 
                        x: [0, -5, 5, 0], 
                        opacity: [0, 0.5, 0],
                        skewX: [0, 10, -10, 0] 
                    }}
                    transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 2.3 }}
                    className="absolute top-0 left-0 text-5xl md:text-8xl font-mono font-bold text-cyan-400 tracking-widest opacity-40 z-0 mix-blend-screen"
                >
                    {line}
                </motion.span>

                {/* Glitch Layer 2 - Red/Magenta - Toned down */}
                <motion.span 
                    animate={{ 
                        x: [0, 5, -5, 0], 
                        opacity: [0, 0.5, 0],
                        skewX: [0, -10, 10, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 0.25, repeatDelay: 3.1 }}
                    className="absolute top-0 left-0 text-5xl md:text-8xl font-mono font-bold text-red-500 tracking-widest opacity-40 z-0 mix-blend-screen"
                >
                    {line}
                </motion.span>
                
                 {/* Glitch Layer 3 - White Slice - Toned down */}
                <motion.span 
                    animate={{ 
                        clipPath: ['inset(40% 0 40% 0)', 'inset(20% 0 70% 0)', 'inset(70% 0 10% 0)'],
                        x: [-2, 2, -2, 2],
                        opacity: [0, 0.8, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 0.15, repeatDelay: 4.5 }}
                    className="absolute top-0 left-0 text-5xl md:text-8xl font-mono font-bold text-white tracking-widest opacity-60 z-20"
                >
                    {line}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        );

      case 'final':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 2 } }}
            className="flex flex-col items-center justify-center text-center"
          >
            <motion.p 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 1 } }}
                className="text-gray-400 font-sans tracking-[0.4em] mb-6 text-sm md:text-base uppercase"
            >
              {scene.lines[0]}
            </motion.p>
            
            <motion.h1 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { delay: 1, duration: 1.5, ease: "easeOut" } }}
                className="text-5xl md:text-9xl font-orbitron font-black text-white tracking-widest mb-12 text-glow-strong"
            >
              {scene.lines[1]}
            </motion.h1>
            
            {scene.subText && (
              <motion.div 
                className="relative mt-8 p-4 border border-white/10 bg-white/5 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 3, duration: 1 } }}
              >
                 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cine-blue" />
                 <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cine-blue" />
                 <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cine-blue" />
                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cine-blue" />
                 
                 <p className="text-cine-blue font-sans tracking-[0.2em] uppercase text-xs md:text-sm">
                   {scene.subText}
                 </p>
              </motion.div>
            )}
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 w-full h-full perspective-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          className="w-full h-full flex items-center justify-center"
          // We handle exit animations within the specific scene renderers usually, 
          // but having a container exit ensures clean breaks
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SceneRenderer;