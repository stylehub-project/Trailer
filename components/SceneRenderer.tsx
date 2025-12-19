import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Scene } from '../constants';

interface SceneRendererProps {
  scene: Scene;
}

// -- Animation Variants --

const containerStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(10px)',
    transition: { duration: 0.8 },
  },
};

const lineWrapperVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.01 }
  }
};

const lineStagger: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035, 
    },
  },
};

const cinematicRevealVariant: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
    filter: 'blur(10px)',
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
    },
  },
};

const glitchItemVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    textShadow: [
      "0px 0px 0px rgba(0,0,0,0)",
      "-3px 1px 0px rgba(255,0,0,0.8), 3px -1px 0px rgba(0,255,255,0.8)",
      "0px 0px 0px rgba(0,0,0,0)",
    ],
    x: [0, -2, 2, -1, 1, 0],
    skewX: [0, 3, -3, 1, -1, 0],
    opacity: 1,
    transition: { 
      duration: 0.25, 
      repeat: Infinity, 
      repeatType: "mirror",
      repeatDelay: 3.5, 
      ease: "linear"
    }
  }
};

const SplitText: React.FC<{ text: string; variant?: Variants; className?: string }> = ({ text, variant, className }) => {
  return (
    <motion.span 
      className={`inline-block whitespace-pre-wrap text-center ${className}`}
      variants={lineStagger}
    >
      {text.split('').map((char, i) => (
        <motion.span key={i} variants={variant} className="inline-block">
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const SceneRenderer: React.FC<SceneRendererProps> = ({ scene }) => {
  
  const renderContent = () => {
    switch (scene.type) {
      case 'teaser':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
            className="flex flex-col items-center justify-center text-center relative px-6"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 md:opacity-20">
               <motion.div 
                 animate={{ y: ['-100%', '200%'] }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="w-full h-1 bg-cine-blue shadow-[0_0_15px_#00f0ff]"
               />
            </div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { delay: 0.2 } }}
              className="mb-4 bg-cine-blue/10 px-3 py-1 border border-cine-blue/30 inline-block backdrop-blur-md"
            >
               <span className="text-[9px] md:text-xs tracking-[0.4em] text-cine-blue uppercase font-bold">
                 System Preview // Incoming
               </span>
            </motion.div>

            <motion.h1 className="text-2xl md:text-6xl lg:text-7xl font-orbitron font-black text-white tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 leading-tight">
               {scene.lines[0]}
            </motion.h1>

            {scene.subText && (
               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.6, transition: { delay: 0.4 } }}
                 className="text-[9px] md:text-sm font-sans tracking-[0.4em] md:tracking-[0.6em] text-gray-300 uppercase max-w-2xl"
               >
                 {scene.subText}
               </motion.p>
            )}
            
            <div className="mt-8 flex space-x-2">
              {[1, 2, 3, 4].map(i => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-0.5 md:w-1 h-3 md:h-4 bg-cine-blue" 
                />
              ))}
            </div>
          </motion.div>
        );

      case 'intro':
      case 'hero':
        return (
          <motion.div
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 px-6"
          >
            {scene.lines.map((line, idx) => (
              <motion.div key={idx} variants={lineWrapperVariant} className="overflow-visible">
                <motion.h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-orbitron font-bold tracking-widest-cine text-white text-glow leading-tight">
                  <SplitText text={line} variant={cinematicRevealVariant} />
                </motion.h1>
              </motion.div>
            ))}
            {scene.subText && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 0.8, y: 0, transition: { delay: 0.8, duration: 1.2 } }}
                className="mt-6 md:mt-8"
              >
                <p className="text-[10px] md:text-sm font-sans tracking-[0.3em] md:tracking-[0.5em] text-cine-blue uppercase border-b border-cine-blue/20 pb-2 inline-block">
                  {scene.subText}
                </p>
              </motion.div>
            )}
          </motion.div>
        );

      case 'stack':
        return (
          <motion.div
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center space-y-3 px-6"
          >
            {scene.lines.map((line, idx) => (
              <motion.h2 
                key={idx} 
                variants={lineWrapperVariant}
                className="text-3xl sm:text-4xl md:text-7xl font-orbitron font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-500 leading-none"
              >
                  <SplitText text={line} variant={cinematicRevealVariant} />
              </motion.h2>
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
                exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 0.5 } }
            }}
            className="flex flex-col items-center justify-center text-center z-10 px-6"
          >
            {scene.lines.map((line, idx) => (
              <motion.h1 
                key={idx} 
                variants={{
                    hidden: { opacity: 0, scale: 1.5, filter: "blur(15px)" },
                    visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 150, damping: 20 } }
                }}
                className="text-5xl sm:text-6xl md:text-9xl font-orbitron font-black text-white tracking-tight text-glow-strong mb-2 leading-none"
              >
                {line}
              </motion.h1>
            ))}
            {scene.subText && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1, transition: { delay: 0.4, duration: 0.7, ease: "circOut" } }}
                className="flex flex-col items-center mt-6 w-full max-w-md"
              >
                 <div className="h-[1px] md:h-[2px] w-full bg-cine-blue shadow-[0_0_10px_#00f0ff]" />
                 <p className="mt-4 text-cine-blue font-sans tracking-[0.4em] md:tracking-[0.6em] text-xs md:text-xl uppercase">
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
            className="flex flex-col items-center text-center space-y-4 px-6"
          >
             {scene.lines.map((line, idx) => (
              <motion.div
                key={idx}
                variants={glitchItemVariant}
                className="relative"
              >
                <span className="text-3xl sm:text-4xl md:text-8xl font-mono font-bold text-white tracking-widest relative z-10 mix-blend-hard-light leading-tight">
                  {line}
                </span>
                
                <motion.span 
                    animate={{ x: [-4, 4, -4], opacity: [0, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.1, repeatDelay: 2 }}
                    className="absolute top-0 left-0 text-3xl sm:text-4xl md:text-8xl font-mono font-bold text-cyan-400 tracking-widest opacity-30 z-0 mix-blend-screen"
                >
                    {line}
                </motion.span>

                <motion.span 
                    animate={{ x: [4, -4, 4], opacity: [0, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.12, repeatDelay: 2.5 }}
                    className="absolute top-0 left-0 text-3xl sm:text-4xl md:text-8xl font-mono font-bold text-red-500 tracking-widest opacity-30 z-0 mix-blend-screen"
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
            className="flex flex-col items-center justify-center text-center px-6"
          >
            <motion.p 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.8 } }}
                className="text-gray-500 font-sans tracking-[0.3em] mb-4 md:mb-6 text-[10px] md:text-base uppercase"
            >
              {scene.lines[0]}
            </motion.p>
            
            <motion.h1 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { delay: 0.8, duration: 1.2, ease: "easeOut" } }}
                className="text-4xl sm:text-5xl md:text-9xl font-orbitron font-black text-white tracking-widest mb-10 md:mb-12 text-glow-strong leading-tight"
            >
              {scene.lines[1]}
            </motion.h1>
            
            {scene.subText && (
              <motion.div 
                className="relative mt-4 md:mt-8 p-4 border border-white/5 bg-white/5 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 2.5, duration: 1 } }}
              >
                 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cine-blue/60" />
                 <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cine-blue/60" />
                 <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cine-blue/60" />
                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cine-blue/60" />
                 
                 <p className="text-cine-blue text-[10px] md:text-sm font-sans tracking-[0.2em] uppercase">
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
    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 w-full h-full perspective-1000 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          className="w-full h-full flex items-center justify-center"
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SceneRenderer;