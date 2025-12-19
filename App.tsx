import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import SceneRenderer from './components/SceneRenderer';
import { SCENES, Scene } from './constants';
import { Play, Volume2, Globe, Cpu, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { initAudio, playAmbient, playSfx, stopAmbient } from './utils/audio';

// Project Data
const PROJECTS = [
  {
    title: "NEWS APP 02",
    desc: "Brand new news app",
    status: "DEV",
    statusColor: "text-amber-400 border-amber-400/50",
    url: "https://newsapp02.vercel.app",
    icon: Globe,
    tech: "Under Development"
  },
  {
    title: "STUDY CLUB",
    desc: "Sunrise student study app",
    status: "BETA",
    statusColor: "text-cyan-400 border-cyan-400/50",
    url: "https://studyclubapp.vercel.app",
    icon: Cpu,
    tech: "Frontend Completed"
  },
  {
    title: "AI PPT SLIDE",
    desc: "AI Study explainer",
    status: "LIVE",
    statusColor: "text-emerald-400 border-emerald-400/50",
    url: "https://ai-ppt-slide.vercel.app",
    icon: Zap,
    tech: "System Online"
  },
  {
    title: "NEWS CLUB",
    desc: "News app features testing website",
    status: "LIVE",
    statusColor: "text-emerald-400 border-emerald-400/50",
    url: "https://news-club.vercel.app",
    icon: Globe,
    tech: "Features Testing"
  }
];

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentScene, setCurrentScene] = useState<Scene>(SCENES[0]);
  const [isFinished, setIsFinished] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const totalDuration = SCENES[SCENES.length - 1].end;

  const startExperience = () => {
    setHasStarted(true);
    
    // Initialize Web Audio API
    initAudio();
    playAmbient();
    
    // Start RAF loop
    startTimeRef.current = performance.now();
    loop(performance.now());
  };

  const loop = (timestamp: number) => {
    if (!startTimeRef.current) return;
    
    const elapsed = (timestamp - startTimeRef.current) / 1000; // in seconds
    setCurrentTime(elapsed);

    // Find active scene
    const activeScene = SCENES.find(s => elapsed >= s.start && elapsed < s.end);
    
    // Check if we hit the end
    const lastScene = SCENES[SCENES.length - 1];
    if (elapsed > lastScene.end) {
      if (!isFinished) {
         setIsFinished(true);
         stopAmbient();
      }
      rafRef.current = null; // Loop stops
    } else {
       // Scene Management
       if (activeScene && activeScene.id !== currentScene.id) {
         setCurrentScene(prev => {
           if (prev.id !== activeScene.id) {
              // Trigger sound for new scene if not ambient (ambient is continuous)
              if (activeScene.soundEffect && activeScene.soundEffect !== 'ambient') {
                 playSfx(activeScene.soundEffect);
              }
              return activeScene;
           }
           return prev;
         });
       }
       // Continue loop
       rafRef.current = requestAnimationFrame(loop);
    }
  };

  // --- Timeline Interaction ---
  const handleSeek = (clientX: number) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(x / width, 1));
    const newTime = percentage * totalDuration;

    // Adjust start time so the next RAF frame calculates 'newTime' as elapsed
    startTimeRef.current = performance.now() - (newTime * 1000);
    setCurrentTime(newTime);

    // If we were finished and scrubbed back, resume
    if (newTime < SCENES[SCENES.length - 1].end) {
        if (isFinished) {
            setIsFinished(false);
            playAmbient();
            // Restart loop if it stopped
            if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(loop);
            }
        } else if (!rafRef.current && hasStarted) {
             // Case where loop stopped but state wasn't technically finished yet (edge case)
             rafRef.current = requestAnimationFrame(loop);
        }
    }
    
    // Update scene immediately for better feedback
    const activeScene = SCENES.find(s => newTime >= s.start && newTime < s.end);
    if (activeScene && activeScene.id !== currentScene.id) {
        setCurrentScene(activeScene);
    }
  };

  const onTimelineMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSeek(e.clientX);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSeek(e.clientX);
      }
    };
    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isFinished, currentScene]);

  // Ensure cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopAmbient();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white select-none">
      <Background />
      <div className="scanline"></div>

      {!hasStarted ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
          
          {/* --- TOP: System Header --- */}
          <div className="absolute top-10 w-full text-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="inline-block border-b border-white/20 pb-2"
            >
              <h3 className="text-xs md:text-sm font-mono tracking-[0.5em] text-gray-400">
                SYSTEM ID: STYLE_HUB_NETWORK
              </h3>
            </motion.div>
          </div>

          {/* --- CENTER: Main Reactor Button --- */}
          <div className="flex-grow flex items-center justify-center relative w-full">
            <button 
              onClick={startExperience}
              className="group relative flex flex-col items-center justify-center transition-all duration-700 outline-none"
            >
              {/* Outer Ring 1 */}
              <div className="absolute w-64 h-64 rounded-full border border-dashed border-white/10 animate-spin-slow group-hover:border-cine-blue/30 transition-colors" />
              {/* Outer Ring 2 */}
              <div className="absolute w-56 h-56 rounded-full border border-white/5 animate-spin-reverse group-hover:border-cine-blue/30 transition-colors" />
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-cine-blue blur-[60px] opacity-10 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
              
              {/* Core Button */}
              <div className="relative w-32 h-32 border border-cine-blue/50 rounded-full flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-[0_0_30px_rgba(0,240,255,0.1)] group-hover:shadow-[0_0_50px_rgba(0,240,255,0.4)]">
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cine-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <Play className="w-10 h-10 text-cine-blue ml-1 group-hover:text-white transition-colors duration-300" fill="currentColor" />
              </div>
              
              <div className="mt-8 text-center space-y-2 z-10">
                <h2 className="text-3xl md:text-4xl font-orbitron font-bold tracking-[0.2em] text-white group-hover:text-glow transition-all">
                  INITIATE
                </h2>
                <div className="flex items-center justify-center space-x-2 text-cine-blue/60 text-[10px] tracking-[0.3em] uppercase">
                  <Volume2 className="w-3 h-3" />
                  <span>Audio Required</span>
                </div>
              </div>
            </button>
          </div>

          {/* --- BOTTOM: Network Grid (Projects) --- */}
          <div className="w-full max-w-7xl px-6 pb-12 z-20">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5, duration: 1 }}
               className="mb-4 flex items-center space-x-4"
             >
                <div className="h-[1px] bg-white/20 flex-grow" />
                <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Network Nodes Detected</span>
                <div className="h-[1px] bg-white/20 flex-grow" />
             </motion.div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PROJECTS.map((project, idx) => (
                  <motion.a
                    key={idx}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + (idx * 0.1), duration: 0.6 }}
                    className="holo-card group relative p-5 bg-white/5 border border-white/10 rounded-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 block overflow-hidden"
                  >
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cine-blue/0 to-cine-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className={`p-2 rounded-full border ${project.statusColor} bg-black/40`}>
                        <project.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className={`text-[9px] font-bold px-2 py-1 rounded border ${project.statusColor} bg-black/60 tracking-wider`}>
                        {project.status}
                      </div>
                    </div>

                    <h3 className="relative z-10 text-lg font-orbitron font-bold text-gray-100 group-hover:text-cine-blue transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="relative z-10 text-xs text-gray-400 mt-1 font-sans tracking-wide line-clamp-2">
                      {project.desc}
                    </p>
                    
                    <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                       <span className="text-[10px] font-mono text-gray-500 uppercase group-hover:text-gray-300 transition-colors">
                         // {project.tech}
                       </span>
                       <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-cine-blue transition-colors" />
                    </div>

                    {/* Corner accents */}
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-cine-blue transition-colors" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-cine-blue transition-colors" />
                  </motion.a>
                ))}
             </div>
          </div>

        </div>
      ) : (
        <div className="relative z-10 w-full h-full">
           <SceneRenderer scene={currentScene} />
           
           {/* Interactive Timeline Progress Bar */}
           <div 
             ref={progressBarRef}
             className="absolute bottom-0 left-0 w-full h-8 cursor-pointer z-50 flex items-end group"
             onMouseDown={onTimelineMouseDown}
           >
             {/* The visible track (background) */}
             <div className="w-full h-1 bg-gray-900/50 backdrop-blur-sm transition-all duration-200 group-hover:h-2">
                {/* The Progress Fill */}
                <div 
                  className="h-full bg-cine-blue shadow-[0_0_15px_#00f0ff] relative" 
                  style={{ width: `${Math.min((currentTime / totalDuration) * 100, 100)}%` }}
                >
                   {/* Scrubber Handle (Glow/Dot) */}
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-0 group-hover:scale-100" />
                </div>
             </div>
           </div>

           {/* Timecode */}
           <div className="absolute bottom-6 right-6 font-mono text-xs text-gray-500 tracking-widest pointer-events-none">
             SEQ_01 // {currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
           </div>
        </div>
      )}
    </div>
  );
};

export default App;