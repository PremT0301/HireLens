import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useSpeechRecognition
 * Wraps the Web Speech API (SpeechRecognition) with:
 *  - Continuous mode + interim results
 *  - 5-second silence auto-stop
 *  - Mapped error types: 'denied' | 'no-speech' | 'network' | 'unsupported'
 *  - Configurable language (default: en-US)
 */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export default function useSpeechRecognition({
  lang = 'en-US',
  silenceTimeoutMs = 5000,
  onFinalTranscript,   // (text: string) => void — called when speech ends
  onInterimTranscript, // (text: string) => void — called on each interim result
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null); // null | 'denied' | 'no-speech' | 'network' | 'unsupported'

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const finalTextRef = useRef(''); // accumulate across multiple results

  const isSupported = SpeechRecognition !== null;

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      console.info('[SpeechRecognition] Silence timeout — auto-stopping');
      stopListening();
    }, silenceTimeoutMs);
  }, [silenceTimeoutMs, clearSilenceTimer]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) { /* already stopped */ }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('unsupported');
      return;
    }
    setError(null);
    finalTextRef.current = '';
    setTranscript('');
    setInterimTranscript('');

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      resetSilenceTimer();
    };

    recognition.onresult = (event) => {
      resetSilenceTimer(); // reset silence clock on any speech
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalChunk) {
        finalTextRef.current += finalChunk + ' ';
        setTranscript(finalTextRef.current.trim());
      }

      const liveText = finalTextRef.current + interim;
      setInterimTranscript(interim);
      onInterimTranscript?.(liveText.trim());
    };

    recognition.onspeechend = () => {
      // Browser detected end of speech — give it a moment before stopping
      resetSilenceTimer();
    };

    recognition.onerror = (event) => {
      clearSilenceTimer();
      const code = event.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setError('denied');
      } else if (code === 'no-speech') {
        setError('no-speech');
      } else if (code === 'network') {
        setError('network');
      } else {
        setError(code);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      clearSilenceTimer();
      setIsListening(false);
      setInterimTranscript('');
      const finalText = finalTextRef.current.trim();
      if (finalText) {
        onFinalTranscript?.(finalText);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, lang, resetSilenceTimer, clearSilenceTimer, onFinalTranscript, onInterimTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      try { recognitionRef.current?.stop(); } catch (_) {}
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
  };
}
