import React from 'react';
import { Mic, MicOff } from 'lucide-react';

/**
 * MicButton
 * Props:
 *   isListening  {boolean}  — whether voice capture is active
 *   isSupported  {boolean}  — whether SpeechRecognition is available
 *   disabled     {boolean}  — additional disable flag (e.g., while AI loads)
 *   onClick      {function} — toggle handler
 */
export default function MicButton({ isListening, isSupported, disabled = false, onClick }) {
  const title = !isSupported
    ? 'Voice input not supported in this browser'
    : isListening
    ? 'Stop recording (click to stop)'
    : 'Start voice input (click to speak)';

  return (
    <button
      id="copilot-mic-btn"
      className={`mic-btn${isListening ? ' recording' : ''}`}
      onClick={onClick}
      disabled={!isSupported || disabled}
      title={title}
      aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      aria-pressed={isListening}
      type="button"
    >
      {/* Expanding ripple ring — only shown while recording */}
      {isListening && <span className="mic-ripple" aria-hidden="true" />}

      {isSupported ? (
        <Mic size={18} />
      ) : (
        <MicOff size={18} />
      )}
    </button>
  );
}
