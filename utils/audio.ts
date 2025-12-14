let audioCtx: AudioContext | null = null;
let ambientOscillators: AudioScheduledSourceNode[] = [];
let ambientGain: GainNode | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playAmbient = () => {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  // Stop previous if exists to avoid stacking
  stopAmbient();

  ambientGain = audioCtx.createGain();
  ambientGain.gain.value = 0.15; // Low volume background drone
  ambientGain.connect(audioCtx.destination);

  // Drone 1: Low Sine (Deep bass)
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 55; // A1 approx
  osc1.connect(ambientGain);
  osc1.start();
  ambientOscillators.push(osc1);

  // Drone 2: Detuned Triangle (Texture)
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 58; // Slight beat frequency
  
  // Filter the triangle wave to make it less harsh
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;

  osc2.connect(filter);
  filter.connect(ambientGain);
  osc2.start();
  ambientOscillators.push(osc2);
};

export const stopAmbient = () => {
  ambientOscillators.forEach(osc => {
      try { osc.stop(); } catch(e){}
  });
  ambientOscillators = [];
  if (ambientGain) {
      try { ambientGain.disconnect(); } catch(e){}
      ambientGain = null;
  }
};

export const playSfx = (type: string | undefined) => {
  if (!type || !audioCtx) return;
  
  // Resume if suspended (browser policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const t = audioCtx.currentTime;

  switch (type) {
    case 'boom': {
      // Deep impact sound
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(0.01, t + 1.5);
      
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      
      osc.start(t);
      osc.stop(t + 1.5);
      break;
    }
    case 'whoosh': {
      // Filtered noise sweep
      const bufferSize = audioCtx.sampleRate * 2.0;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 0.5;
      filter.frequency.setValueAtTime(100, t);
      filter.frequency.exponentialRampToValueAtTime(4000, t + 1);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.5);
      gain.gain.linearRampToValueAtTime(0, t + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(t);
      break;
    }
    case 'rise': {
      // Rising pitch tension
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 3);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 2);
      gain.gain.linearRampToValueAtTime(0, t + 3);
      
      osc.start(t);
      osc.stop(t + 3);
      break;
    }
    case 'glitch': {
      // Random digital artifacts
      for(let i=0; i<6; i++) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          const offset = Math.random() * 0.3;
          const duration = 0.05 + Math.random() * 0.05;
          
          osc.frequency.setValueAtTime(400 + Math.random()*1000, t + offset);
          
          gain.gain.setValueAtTime(0.08, t + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, t + offset + duration);
          
          osc.start(t + offset);
          osc.stop(t + offset + duration);
      }
      break;
    }
  }
};