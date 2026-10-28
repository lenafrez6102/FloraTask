import { AmbientSound } from '../types/garden';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a peaceful crystal singing bowl chime (pentatonic harmonic triad).
 */
export function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [528, 660, 792, 1056]; // Solfeggio 528Hz love/miracle tone with harmonics

  frequencies.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12 / (index + 1), now + index * 0.08 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2 + index * 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.08);
    osc.stop(now + 4.0);
  });
}

/**
 * Play an earthy planting pop sound.
 */
export function playPlantSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * Play a soft water droplet sound.
 */
export function playWaterDropSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
}

// Ambient loop management
let ambientGainNode: GainNode | null = null;
let ambientSourceNodes: AudioNode[] = [];
let chimeIntervalId: number | null = null;

export function stopAmbient() {
  if (chimeIntervalId) {
    clearInterval(chimeIntervalId);
    chimeIntervalId = null;
  }
  ambientSourceNodes.forEach(node => {
    try {
      (node as AudioScheduledSourceNode).stop?.();
      node.disconnect();
    } catch {
      // ignore
    }
  });
  ambientSourceNodes = [];
  if (ambientGainNode) {
    try {
      ambientGainNode.disconnect();
    } catch {
      // ignore
    }
    ambientGainNode = null;
  }
}

/**
 * Synthesize offline ambient soundscapes.
 */
export function startAmbient(type: AmbientSound, volume = 0.2) {
  stopAmbient();
  if (type === 'none') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.connect(ctx.destination);
  ambientGainNode = masterGain;

  if (type === 'rain') {
    // Generate gentle rain noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Brown/pinkish noise
      lastOut = output[i];
      output[i] *= 2.5;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();

    ambientSourceNodes.push(whiteNoise, filter);
  } else if (type === 'breeze') {
    // Low-frequency modulated gentle wind
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 380;
    filter.Q.value = 2.0;

    // Modulate filter frequency slowly for wind swell
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15; // 6.6 second swell cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(masterGain);

    noiseSource.start();
    lfo.start();

    ambientSourceNodes.push(noiseSource, filter, lfo, lfoGain);
  } else if (type === 'chimes') {
    // Gentle recurring random pentatonic chimes
    const pentatonicFrequencies = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

    const triggerChime = () => {
      if (!ctx || ctx.state === 'closed') return;
      const freq = pentatonicFrequencies[Math.floor(Math.random() * pentatonicFrequencies.length)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 3.0);
    };

    triggerChime();
    chimeIntervalId = window.setInterval(() => {
      if (Math.random() > 0.3) {
        triggerChime();
      }
    }, 2800);
  }
}
