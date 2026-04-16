import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useSpeechSynthesis
 * Wraps the browser's SpeechSynthesis API:
 *  - speak(text): reads text aloud using the best available English voice
 *  - stop(): cancels any ongoing utterance
 *  - isSpeaking: reactive boolean
 *  - isSupported: false on unsupported browsers
 */
export default function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Pick the best English voice available
  const getBestVoice = useCallback(() => {
    if (!isSupported) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prefer en-US Google voice, fallback to any en voice
    return (
      voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] ||
      null
    );
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback((text) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech first
    stop();

    // Strip markdown syntax for cleaner TTS
    const cleaned = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>\s/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Voices may not be loaded yet — retry once
    const voice = getBestVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, stop, getBestVoice]);

  // Load voices asynchronously (Chrome requires this event)
  useEffect(() => {
    if (!isSupported) return;
    const handleVoicesChanged = () => {
      // Voices now available — no state update needed, getBestVoice() re-runs on next speak()
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, [isSupported]);

  // Cancel on unmount
  useEffect(() => {
    return () => {
      try { window.speechSynthesis?.cancel(); } catch (_) {}
    };
  }, []);

  return { isSpeaking, isSupported, speak, stop };
}
