import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import SceneRenderer from './components/SceneRenderer';
import { SCENES, Scene } from './constants';
import { Play, Volume2, Globe, Cpu, Zap, ChevronDown, ExternalLink, Download, Loader2, FileVideo, Film } from 'lucide-react';
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
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalDuration = SCENES[SCENES.length - 1].end;

  const startExperience = () => {
    setHasStarted(true);
    // Lock scroll when trailer starts
    document.body.style.overflow = 'hidden';
    
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

  const handleDownload = async (e: React.MouseEvent, format: 'mp4' | 'mov') => {
    e.preventDefault();
    if (downloadingFormat) return;

    setDownloadingFormat(format);

    // Simulate server processing / encoding delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const filename = format === 'mp4' ? 'TRAILER_2026_HD.mp4' : 'TRAILER_2026_4K_MASTER.mov';
    const mime = format === 'mp4' ? 'video/mp4' : 'video/quicktime';
    
    // Create a dummy file for demonstration
    // In a real app, this would be a fetch to a backend endpoint or CDN URL
    const videoContent = `CINEMATIC TRAILER 2026 - ${format.toUpperCase()} DATA - [VIDEO STREAM PLACEHOLDER]`; 
    const blob = new Blob([videoContent], { type: mime });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    setDownloadingFormat(null);
  };

  // --- Timeline Interaction ---
  const handleSeek = (clientX: number) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(x / width, 1));
    const newTime = percentage * totalDuration;

    startTimeRef.current = performance.now() - (newTime * 1000);
    setCurrentTime(newTime);

    if (newTime < SCENES[SCENES.length - 1].end) {
        if (isFinished) {
            setIsFinished(false);
            playAmbient();
            if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(loop);
            }
        } else if (!rafRef.current && hasStarted) {
             rafRef.current = requestAnimationFrame(loop);
        }
    }
    
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
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black font-sans text-white select-none overflow-x-hidden">
      <Background />
      <div className="scanline"></div>

      {!hasStarted ? (
        <div ref={scrollRef} className="relative z-50 w-full min-h-screen flex flex-col items-center bg-black/40 backdrop-blur-[2px] overflow-y-auto no-scrollbar pt-10 px-4 md:px-0">
          
          {/* --- TOP: System Header --- */}
          <div className="w-full text-center mb-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="inline-block border-b border-white/20 pb-2"
            >
              <h3 className="text-[10px] md:text-sm font-mono tracking-[0.5em] text-gray-400 px-2">
                SYSTEM ID: STYLE_HUB_NETWORK
              </h3>
            </motion.div>
          </div>

          {/* --- TOP RIGHT: Download Actions --- */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute top-5 right-5 md:top-8 md:right-8 z-50 flex flex-col items-end gap-3"
          >
             {/* Header */}
             <div className="flex items-center gap-2 mb-1 opacity-50">
                <div className="h-[1px] w-4 bg-white/50"></div>
                <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">Source_Access</span>
             </div>

             {/* MP4 Button */}
             <button 
               onClick={(e) => handleDownload(e, 'mp4')}
               disabled={!!downloadingFormat}
               className={`group flex items-center gap-3 px-3 py-2 md:px-4 md:py-2 bg-black/30 border ${downloadingFormat === 'mp4' ? 'border-cine-blue bg-cine-blue/10' : 'border-white/10 hover:border-cine-blue/50'} backdrop-blur-md transition-all duration-300 hover:bg-white/5 w-full justify-end disabled:opacity-50 disabled:cursor-not-allowed`}
             >
               <div className="hidden md:flex flex-col items-end">
                 <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-0.5 group-hover:text-cine-blue/70 transition-colors">
                   1080p_HEVC
                 </span>
                 <span className={`text-[10px] font-orbitron font-bold tracking-wider transition-colors ${downloadingFormat === 'mp4' ? 'text-cine-blue' : 'text-gray-200 group-hover:text-cine-blue'}`}>
                   {downloadingFormat === 'mp4' ? 'GENERATING...' : 'DOWNLOAD MP4'}
                 </span>
               </div>
               {/* Mobile Text */}
               <span className={`md:hidden text-[10px] font-orbitron font-bold tracking-wider ${downloadingFormat === 'mp4' ? 'text-cine-blue' : 'text-gray-200 group-hover:text-cine-blue'}`}>
                  HD
               </span>
               <div className={`p-1 rounded-sm transition-colors ${downloadingFormat === 'mp4' ? 'bg-cine-blue/20' : 'bg-white/5 group-hover:bg-cine-blue/10'}`}>
                  {downloadingFormat === 'mp4' ? (
                    <Loader2 className="w-3.5 h-3.5 text-cine-blue animate-spin" />
                  ) : (
                    <FileVideo className="w-3.5 h-3.5 text-gray-400 group-hover:text-cine-blue transition-colors" />
                  )}
               </div>
             </button>

             {/* MOV Button */}
             <button 
               onClick={(e) => handleDownload(e, 'mov')}
               disabled={!!downloadingFormat}
               className={`group flex items-center gap-3 px-3 py-2 md:px-4 md:py-2 bg-black/30 border ${downloadingFormat === 'mov' ? 'border-purple-400 bg-purple-400/10' : 'border-white/10 hover:border-purple-400/50'} backdrop-blur-md transition-all duration-300 hover:bg-white/5 w-full justify-end disabled:opacity-50 disabled:cursor-not-allowed`}
             >
               <div className="hidden md:flex flex-col items-end">
                 <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-0.5 group-hover:text-purple-400/70 transition-colors">
                   4K_PRORES
                 </span>
                 <span className={`text-[10px] font-orbitron font-bold tracking-wider transition-colors ${downloadingFormat === 'mov' ? 'text-purple-400' : 'text-gray-200 group-hover:text-purple-400'}`}>
                   {downloadingFormat === 'mov' ? 'GENERATING...' : 'DOWNLOAD MOV'}
                 </span>
               </div>
               {/* Mobile Text */}
               <span className={`md:hidden text-[10px] font-orbitron font-bold tracking-wider ${downloadingFormat === 'mov' ? 'text-purple-400' : 'text-gray-200 group-hover:text-purple-400'}`}>
                  4K
               </span>
               <div className={`p-1 rounded-sm transition-colors ${downloadingFormat === 'mov' ? 'bg-purple-400/20' : 'bg-white/5 group-hover:bg-purple-400/10'}`}>
                  {downloadingFormat === 'mov' ? (
                    <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  ) : (
                    <Film className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  )}
               </div>
             </button>
          </motion.div>

          {/* --- FIRST: Network Grid (Projects) --- */}
          <div id="project-grid" className="w-full max-w-7xl px-4 md:px-10 pb-12 pt-10 z-20">
             <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               className="mb-8 flex items-center space-x-4"
             >
                <div className="h-[1px] bg-white/20 flex-grow" />
                <span className="text-[9px] md:text-[10px] font-mono text-gray-500 tracking-widest uppercase">Active Nodes</span>
                <div className="h-[1px] bg-white/20 flex-grow" />
             </motion.div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {PROJECTS.map((project, idx) => (
                  <motion.a
                    key={idx}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
                    className="holo-card group relative p-6 bg-white/5 border border-white/10 rounded-sm backdrop-blur-md block overflow-hidden"
                  >
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cine-blue/0 to-cine-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div className={`p-2.5 rounded-full border ${project.statusColor} bg-black/60 shadow-inner`}>
                        <project.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className={`text-[9px] font-bold px-2 py-1 rounded border ${project.statusColor} bg-black/80 tracking-wider`}>
                        {project.status}
                      </div>
                    </div>

                    <h3 className="relative z-10 text-xl font-orbitron font-bold text-gray-100 group-hover:text-cine-blue transition-colors tracking-tight">
                      {project.title}
                    </h3>
                    
                    <p className="relative z-10 text-xs text-gray-400 mt-2 font-sans tracking-wide leading-relaxed min-h-[3em]">
                      {project.desc}
                    </p>
                    
                    <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                       <span className="text-[10px] font-mono text-gray-500 uppercase group-hover:text-gray-300 transition-colors">
                         // {project.tech}
                       </span>
                       <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cine-blue transition-all" />
                    </div>

                    {/* Corner accents */}
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 group-hover:border-cine-blue transition-colors" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 group-hover:border-cine-blue transition-colors" />
                  </motion.a>
                ))}
             </div>
          </div>

          {/* --- SECOND: Main Reactor Button (Trailer) --- */}
          <div className="flex flex-col items-center justify-center min-h-[50vh] w-full pb-20 relative z-20">
            <div className="w-full max-w-7xl px-4 md:px-10 mb-10 flex items-center space-x-4">
                 <div className="h-[1px] bg-white/20 flex-grow" />
                 <span className="text-[9px] md:text-[10px] font-mono text-gray-500 tracking-widest uppercase">Cinema Experience</span>
                 <div className="h-[1px] bg-white/20 flex-grow" />
            </div>

            <button 
              onClick={startExperience}
              className="group relative flex flex-col items-center justify-center transition-all duration-700 outline-none active:scale-95 scale-90 md:scale-100"
            >
              {/* Outer Ring 1 */}
              <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full border border-dashed border-white/10 animate-spin-slow group-hover:border-cine-blue/30 transition-colors" />
              {/* Outer Ring 2 */}
              <div className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full border border-white/5 animate-spin-reverse group-hover:border-cine-blue/30 transition-colors" />
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-cine-blue blur-[60px] opacity-10 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
              
              {/* Core Button */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 border border-cine-blue/50 rounded-full flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-[0_0_30px_rgba(0,240,255,0.1)] group-hover:shadow-[0_0_50px_rgba(0,240,255,0.4)]">
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cine-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <Play className="w-8 h-8 md:w-10 md:h-10 text-cine-blue ml-1 group-hover:text-white transition-colors duration-300" fill="currentColor" />
              </div>
              
              <div className="mt-8 text-center space-y-2 z-10">
                <h2 className="text-2xl md:text-4xl font-orbitron font-bold tracking-[0.2em] text-white group-hover:text-glow transition-all">
                  INITIATE
                </h2>
                <div className="flex items-center justify-center space-x-2 text-cine-blue/60 text-[9px] md:text-[10px] tracking-[0.3em] uppercase">
                  <Volume2 className="w-3 h-3" />
                  <span>Audio Optimized</span>
                </div>
              </div>
            </button>
            
            <div className="mt-16 text-center opacity-30 text-[9px] font-mono tracking-[1em] uppercase">
                End of Transmission // Style Hub 2026
            </div>
          </div>

        </div>
      ) : (
        <div className="fixed inset-0 z-[100] w-full h-full bg-black">
           <SceneRenderer scene={currentScene} />
           
           {/* Interactive Timeline Progress Bar */}
           <div 
             ref={progressBarRef}
             className="absolute bottom-0 left-0 w-full h-10 cursor-pointer z-50 flex items-end group"
             onMouseDown={onTimelineMouseDown}
           >
             {/* The visible track (background) */}
             <div className="w-full h-1.5 bg-gray-900/50 backdrop-blur-sm transition-all duration-200 group-hover:h-3">
                {/* The Progress Fill */}
                <div 
                  className="h-full bg-cine-blue shadow-[0_0_20px_#00f0ff] relative" 
                  style={{ width: `${Math.min((currentTime / totalDuration) * 100, 100)}%` }}
                >
                   {/* Scrubber Handle (Glow/Dot) */}
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-[0_0_15px_white] opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-0 group-hover:scale-100" />
                </div>
             </div>
           </div>

           {/* Timecode */}
           <div className="absolute bottom-8 right-8 font-mono text-[10px] md:text-xs text-gray-500 tracking-widest pointer-events-none opacity-50">
             SEQ_01 // {currentTime.toFixed(2)}S / {totalDuration.toFixed(2)}S
           </div>
        </div>
      )}
    </div>
  );
};

export default App;