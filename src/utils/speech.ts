// Audio & Speech Synthesis utility with mobile support and Web Speech API + ResponsiveVoice fallback

let audioContext: AudioContext | null = null;

export function playSuccessBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioContext && AudioCtx) {
      audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (audioContext) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioContext.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.25);
    }
  } catch (err) {
    console.warn('AudioContext error:', err);
  }
}

export function playTapSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioContext && AudioCtx) {
      audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (audioContext) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioContext.currentTime);
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.09);
    }
  } catch {
    // Ignore audio context silent fails
  }
}

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

export type EnglishAccent = 'UK' | 'US';

export function getStoredAccent(): EnglishAccent {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('preferred_accent');
      if (saved === 'UK' || saved === 'US') {
        return saved;
      }
    } catch {
      // Ignore localStorage read errors
    }
  }
  return 'UK'; // Default to British (UK) or user's stored preference
}

export function setStoredAccent(accent: EnglishAccent): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('preferred_accent', accent);
    } catch {
      // Ignore localStorage write errors
    }
  }
}

export function speakEnglishText(text: string, onEnd?: () => void, accent?: EnglishAccent) {
  if (typeof window === 'undefined') return;

  const currentAccent = accent || getStoredAccent();

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentAccent === 'UK' ? 'en-GB' : 'en-US';
      utterance.rate = 0.90;
      utterance.pitch = 1.0;

      const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
      
      let preferredVoice: SpeechSynthesisVoice | undefined;

      if (currentAccent === 'UK') {
        // Find best British (en-GB) voice
        preferredVoice = voices.find(
          (v) =>
            v.lang.replace('_', '-').toLowerCase().startsWith('en-gb') &&
            (v.name.includes('Natural') ||
             v.name.includes('Google') ||
             v.name.includes('Daniel') ||
             v.name.includes('George') ||
             v.name.includes('Oliver') ||
             v.name.includes('Libby') ||
             v.name.includes('Sonia') ||
             v.name.includes('Serena'))
        ) || voices.find(
          (v) => v.lang.replace('_', '-').toLowerCase().startsWith('en-gb')
        ) || voices.find(
          (v) => v.name.toLowerCase().includes('united kingdom') || v.name.toLowerCase().includes('british')
        );
      } else {
        // Find best American (en-US) voice
        preferredVoice = voices.find(
          (v) =>
            v.lang.replace('_', '-').toLowerCase().startsWith('en-us') &&
            (v.name.includes('Natural') ||
             v.name.includes('Google') ||
             v.name.includes('Samantha') ||
             v.name.includes('Jenny') ||
             v.name.includes('Guy') ||
             v.name.includes('Aria'))
        ) || voices.find(
          (v) => v.lang.replace('_', '-').toLowerCase().startsWith('en-us')
        ) || voices.find(
          (v) => v.name.toLowerCase().includes('united states') || v.name.toLowerCase().includes('us english')
        );
      }

      // Fallback to any English voice if specific region voice is unavailable
      if (!preferredVoice) {
        preferredVoice = voices.find((v) => v.lang.startsWith('en'));
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      if (onEnd) onEnd();
    }
  }
}

export function speakBanglaText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined') return;

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.88;

      const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
      const banglaVoice = voices.find(
        (v) => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali')
      );
      if (banglaVoice) {
        utterance.voice = banglaVoice;
      } else {
        const fallbackVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN'));
        if (fallbackVoice) utterance.voice = fallbackVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis Bangla error:', e);
      if (onEnd) onEnd();
    }
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
