let audioCtx: AudioContext | null = null;
let activeNodes: AudioScheduledSourceNode[] = []; // Track oscillators to stop them
let activeGainNodes: GainNode[] = []; // Track gains to disconnect

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

  stopAmbient(); // Clear previous

  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.2; // Master volume for ambient
  masterGain.connect(audioCtx.destination);
  activeGainNodes.push(masterGain);

  const t = audioCtx.currentTime;

  // --- LAYER 1: Deep Drone (Sine) ---
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 55; // A1
  
  // LFO for Pitch modulation (subtle drift)
  const lfo1 = audioCtx.createOscillator();
  lfo1.type = 'sine';
  lfo1.frequency.value = 0.05; // Very slow
  const lfo1Gain = audioCtx.createGain();
  lfo1Gain.gain.value = 2; // +/- 2Hz
  lfo1.connect(lfo1Gain);
  lfo1Gain.connect(osc1.frequency);
  
  osc1.connect(masterGain);
  osc1.start(t);
  lfo1.start(t);
  
  activeNodes.push(osc1, lfo1);
  activeGainNodes.push(lfo1Gain);

  // --- LAYER 2: Textural Pad (Filtered Sawtooth) ---
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.value = 110.5; // A2 slightly detuned
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 2;
  
  // LFO for Filter Cutoff (breathing effect)
  const lfo2 = audioCtx.createOscillator();
  lfo2.type = 'triangle';
  lfo2.frequency.value = 0.12; // Slow breath
  const lfo2Gain = audioCtx.createGain();
  lfo2Gain.gain.value = 300; // Filter sweep range
  lfo2.connect(lfo2Gain);
  
  // Base filter value + LFO
  filter.frequency.value = 400; 
  lfo2Gain.connect(filter.frequency);

  const osc2Gain = audioCtx.createGain();
  osc2Gain.gain.value = 0.3; // Quieter than drone
  
  osc2.connect(filter);
  filter.connect(osc2Gain);
  osc2Gain.connect(masterGain);
  
  osc2.start(t);
  lfo2.start(t);

  activeNodes.push(osc2, lfo2);
  activeGainNodes.push(lfo2Gain, osc2Gain);
};

export const stopAmbient = () => {
  activeNodes.forEach(node => {
      try { node.stop(); } catch(e){}
  });
  activeNodes = [];
  
  activeGainNodes.forEach(node => {
      try { node.disconnect(); } catch(e){}
  });
  activeGainNodes = [];
};

export const playSfx = (type: string | undefined) => {
  if (!type || !audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const t = audioCtx.currentTime;

  switch (type) {
    case 'boom': {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(0.01, t + 2.0);
      
      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
      
      osc.start(t);
      osc.stop(t + 2.0);
      break;
    }
    case 'whoosh': {
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
      filter.Q.value = 0.8;
      filter.frequency.setValueAtTime(100, t);
      filter.frequency.exponentialRampToValueAtTime(5000, t + 1);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.5);
      gain.gain.linearRampToValueAtTime(0, t + 1.5);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(t);
      break;
    }
    case 'blast': {
      // Impact Blast - Heavy low end + distorted mid crack
      
      // 1. Kick/Low punch
      const oscLow = audioCtx.createOscillator();
      const gainLow = audioCtx.createGain();
      oscLow.connect(gainLow);
      gainLow.connect(audioCtx.destination);
      
      oscLow.frequency.setValueAtTime(150, t);
      oscLow.frequency.exponentialRampToValueAtTime(10, t + 0.5);
      
      gainLow.gain.setValueAtTime(1, t);
      gainLow.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      
      oscLow.start(t);
      oscLow.stop(t + 0.5);

      // 2. Crunch/Distortion layer (Square wave)
      const oscMid = audioCtx.createOscillator();
      const gainMid = audioCtx.createGain();
      oscMid.type = 'square';
      
      // Filter the square wave so it's not too harsh
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      
      oscMid.connect(filter);
      filter.connect(gainMid);
      gainMid.connect(audioCtx.destination);
      
      oscMid.frequency.setValueAtTime(80, t);
      oscMid.frequency.linearRampToValueAtTime(20, t + 0.3);
      
      gainMid.gain.setValueAtTime(0.3, t);
      gainMid.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      
      oscMid.start(t);
      oscMid.stop(t + 0.4);

      break;
    }
    case 'glitch': {
      const now = t;
      // Burst of random short sounds
      for(let i=0; i<8; i++) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          const offset = Math.random() * 0.4;
          const duration = 0.02 + Math.random() * 0.05;
          const freq = 200 + Math.random() * 2000;
          
          osc.frequency.setValueAtTime(freq, now + offset);
          
          gain.gain.setValueAtTime(0.1, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + duration);
          
          osc.start(now + offset);
          osc.stop(now + offset + duration);
      }
      break;
    }
  }
};