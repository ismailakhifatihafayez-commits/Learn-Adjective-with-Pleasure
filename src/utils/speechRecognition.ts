// Speech Recognition Utility using Web Speech API

// Cross-browser speech recognition support
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
};

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  lang?: string;
}

export const createSpeechRecognizer = (handlers: SpeechRecognitionHandlers) => {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = handlers.lang || 'en-US';

  recognition.onstart = () => {
    handlers.onStart?.();
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (finalTranscript) {
      handlers.onResult(finalTranscript.trim(), true);
    } else if (interimTranscript) {
      handlers.onResult(interimTranscript.trim(), false);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    handlers.onError?.(event.error);
  };

  recognition.onend = () => {
    handlers.onEnd?.();
  };

  return recognition;
};
