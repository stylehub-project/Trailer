import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scene } from '../constants';

interface SceneRendererProps {
  scene: Scene;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.3, delayChildren: 0.2 }
  },
  exit: { 
    opacity: 0, 
    filter: 'blur(10px)',
    transition: { duration: 1, ease: 'easeInOut' }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 1.1, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } // Cinematic easing
  }
};

const impactVariants = {
  hidden: { opacity: 0, scale: 0.8, filter: 'blur(20px)' },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    scale: 1.2,
    filter: 'blur(20px)',
    transition: { duration: 1 }
  }
};

const glitchVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 10, staggerChildren: 0.1 }
  }
};

const SceneRenderer: React.FC<SceneRendererProps> = ({ scene }) => {
  
  const renderContent = () => {
    switch (scene.type) {
      case 'intro':
      case 'hero':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center text-center space-y-4"
          >
            {scene.lines.map((line, idx) => (
              <motion.h1
                key={idx}
                variants={itemVariants}
                className="text-4xl md:text-6xl lg:text-8xl font-orbitron font-bold tracking-widest-cine text-white text-glow"
              >
                {line}
              </motion.h1>
            ))}
            {scene.subText && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7, transition: { delay: 1, duration: 2 } }}
                className="mt-6 text-sm md:text-lg font-sans tracking-[0.3em] text-cyan-200 uppercase"
              >
                {scene.subText}
              </motion.p>
            )}
          </motion.div>
        );

      case 'stack':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center space-y-2 md:space-y-6"
          >
            {scene.lines.map((line, idx) => (
              <motion.h2
                key={idx}
                variants={itemVariants}
                className="text-3xl md:text-6xl font-orbitron font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500"
              >
                {line}
              </motion.h2>
            ))}
          </motion.div>
        );

      case 'impact':
        return (
          <motion.div
            variants={impactVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center text-center z-10"
          >
            {scene.lines.map((line, idx) => (
              <h1 key={idx} className="text-6xl md:text-9xl font-orbitron font-black text-white tracking-tighter text-glow-strong mb-4">
                {line}
              </h1>
            ))}
            {scene.subText && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%', transition: { delay: 0.5, duration: 1 } }}
                className="h-[1px] bg-cine-blue shadow-[0_0_10px_#00f0ff] w-0 max-w-md my-4"
              />
            )}
            {scene.subText && (
               <p className="text-cine-blue font-sans tracking-[0.5em] text-sm md:text-xl uppercase">
                 {scene.subText}
               </p>
            )}
          </motion.div>
        );

      case 'glitch':
        return (
           <motion.div
            variants={glitchVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center text-center space-y-2"
          >
             {scene.lines.map((line, idx) => (
              <motion.span
                key={idx}
                variants={{
                  hidden: { opacity: 0, skewX: 20 },
                  visible: { opacity: 1, skewX: 0 }
                }}
                className="text-4xl md:text-7xl font-mono font-bold text-white tracking-widest"
                style={{
                  textShadow: `${Math.random() * 4 - 2}px ${Math.random() * 4 - 2}px 0 rgba(255,0,0,0.5), ${Math.random() * 4 - 2}px ${Math.random() * 4 - 2}px 0 rgba(0,0,255,0.5)`
                }}
              >
                {line}
              </motion.span>
            ))}
          </motion.div>
        );

      case 'final':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 3 } }}
            className="flex flex-col items-center justify-center text-center"
          >
            <p className="text-gray-400 font-sans tracking-[0.4em] mb-4 text-sm md:text-base">
              {scene.lines[0]}
            </p>
            <h1 className="text-5xl md:text-8xl font-orbitron font-black text-white tracking-widest mb-12 text-glow">
              {scene.lines[1]}
            </h1>
            
            {scene.subText && (
              <div className="overflow-hidden border-t border-gray-800 pt-8 mt-4">
                 <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 2, duration: 1 } }}
                    className="text-cine-blue font-sans tracking-[0.2em] animate-pulse"
                 >
                   {scene.subText}
                 </motion.p>
              </div>
            )}
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full flex items-center justify-center"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SceneRenderer;