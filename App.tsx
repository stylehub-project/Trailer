import React, { useState, useEffect, useRef } from 'react';
import Background from './components/Background';
import SceneRenderer from './components/SceneRenderer';
import { SCENES, Scene } from './constants';
import { Play, Volume2 } from 'lucide-react';
import { initAudio, playAmbient, playSfx, stopAmbient } from './utils/audio';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentScene, setCurrentScene] = useState<Scene>(SCENES[0]);
  const [isFinished, setIsFinished] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const startExperience = () => {
    setHasStarted(true);
    
    // Initialize Web Audio API
    initAudio();
    playAmbient();
    
    // Start RAF loop
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
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
      setIsFinished(true);
      stopAmbient();
    } else if (activeScene && activeScene.id !== currentScene.id) {
       // Scene Change Detected
       setCurrentScene(prev => {
         if (prev.id !== activeScene.id) {
            // Trigger sound for new scene
            // Note: 'ambient' is handled by playAmbient() at start, so we ignore it here to prevent stacking/restarting
            if (activeScene.soundEffect && activeScene.soundEffect !== 'ambient') {
               playSfx(activeScene.soundEffect);
            }
            return activeScene;
         }
         return prev;
       });
    }

    if (elapsed <= lastScene.end + 5) {
      rafRef.current = requestAnimationFrame(loop);
    }
  };

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

      {!hasStarted ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/90 backdrop-blur-sm transition-opacity duration-1000">
          <button 
            onClick={startExperience}
            className="group flex flex-col items-center space-y-6 transition-transform duration-500 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cine-blue blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-full" />
              <div className="relative w-24 h-24 border border-cine-blue/50 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md border-t-cine-blue border-r-transparent animate-spin-slow">
                 <Play className="w-8 h-8 text-cine-blue ml-1" fill="currentColor" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-orbitron tracking-[0.3em] text-white group-hover:text-cine-blue transition-colors">
                ENTER EXPERIENCE
              </h2>
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs tracking-widest uppercase">
                <Volume2 className="w-3 h-3" />
                <span>Sound Recommended</span>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="relative z-10 w-full h-full">
           <SceneRenderer scene={currentScene} />
           
           {/* Timeline Progress Bar */}
           <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900">
              <div 
                className="h-full bg-cine-blue shadow-[0_0_10px_#00f0ff]" 
                style={{ width: `${Math.min((currentTime / 60) * 100, 100)}%` }}
              />
           </div>

           {/* Timecode */}
           <div className="absolute bottom-4 right-6 font-mono text-xs text-gray-600 tracking-widest">
             2026_TRAILER_SEQ_01 // {currentTime.toFixed(2)}s
           </div>
        </div>
      )}
    </div>
  );
};

export default App;