/**
 * 🎙️ Hook React pour l'audio ADHA
 * 
 * Gère l'enregistrement vocal, la transcription et la synthèse audio
 * avec une interface React simple et réactive.
 * 
 * @example
 * const { 
 *   isRecording, 
 *   startRecording, 
 *   stopAndTranscribe 
 * } = useAudioChat();
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { audioService, RecordingState, TTSVoice, SynthesisOptions } from '../services/audio/audioService';

// ============================================================================
// TYPES
// ============================================================================

export interface UseAudioChatOptions {
  /** Voix TTS par défaut */
  defaultVoice?: TTSVoice;
  /** Langue de transcription */
  language?: string;
  /** Callback appelé quand la transcription est prête */
  onTranscriptionComplete?: (text: string) => void;
  /** Callback appelé en cas d'erreur */
  onError?: (error: Error) => void;
}

export interface UseAudioChatReturn {
  /** État actuel (idle, recording, processing, error) */
  recordingState: RecordingState;
  /** Raccourci: est en train d'enregistrer */
  isRecording: boolean;
  /** Raccourci: est en train de traiter */
  isProcessing: boolean;
  /** Dernière transcription */
  transcription: string | null;
  /** Dernière erreur */
  error: Error | null;
  /** Support audio disponible */
  isSupported: boolean;
  /** Démarrer l'enregistrement */
  startRecording: () => Promise<void>;
  /** Arrêter et transcrire */
  stopAndTranscribe: () => Promise<string>;
  /** Annuler l'enregistrement */
  cancelRecording: () => void;
  /** Synthétiser et jouer du texte */
  speakText: (text: string, options?: SynthesisOptions) => Promise<void>;
  /** Est en train de parler */
  isSpeaking: boolean;
  /** Arrêter la lecture audio */
  stopSpeaking: () => void;
  /** Temps d'enregistrement en secondes */
  recordingDuration: number;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAudioChat(options: UseAudioChatOptions = {}): UseAudioChatReturn {
  const {
    defaultVoice = 'nova',
    language = 'fr',
    onTranscriptionComplete,
    onError
  } = options;

  // États
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  // ✅ FIX: Vérifier le support après le montage côté client
  const [isSupported, setIsSupported] = useState(true); // Optimiste par défaut

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartRef = useRef<number>(0);

  // ✅ FIX: Vérifier le support audio après le montage
  useEffect(() => {
    setIsSupported(audioService.isSupported());
  }, []);

  // --------------------------------------------------------------------------
  // GESTION DU TEMPS D'ENREGISTREMENT
  // --------------------------------------------------------------------------

  const startDurationTimer = useCallback(() => {
    recordingStartRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      setRecordingDuration(
        Math.floor((Date.now() - recordingStartRef.current) / 1000)
      );
    }, 100);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setRecordingDuration(0);
  }, []);

  // --------------------------------------------------------------------------
  // ENREGISTREMENT
  // --------------------------------------------------------------------------

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const err = new Error('L\'enregistrement audio n\'est pas supporté par votre navigateur');
      setError(err);
      onError?.(err);
      return;
    }

    try {
      setError(null);
      setTranscription(null);
      await audioService.startRecording();
      setRecordingState('recording');
      startDurationTimer();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur de démarrage');
      setError(error);
      setRecordingState('error');
      onError?.(error);
    }
  }, [isSupported, onError, startDurationTimer]);

  const stopAndTranscribe = useCallback(async (): Promise<string> => {
    try {
      setRecordingState('processing');
      stopDurationTimer();

      const audioBlob = await audioService.stopRecording();
      const result = await audioService.transcribe(audioBlob, language);

      setTranscription(result.text);
      setRecordingState('idle');
      onTranscriptionComplete?.(result.text);

      return result.text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur de transcription');
      setError(error);
      setRecordingState('error');
      onError?.(error);
      throw error;
    }
  }, [language, onTranscriptionComplete, onError, stopDurationTimer]);

  const cancelRecording = useCallback(() => {
    audioService.cancelRecording();
    setRecordingState('idle');
    stopDurationTimer();
  }, [stopDurationTimer]);

  // --------------------------------------------------------------------------
  // SYNTHÈSE VOCALE
  // --------------------------------------------------------------------------

  const speakText = useCallback(async (
    text: string,
    options: SynthesisOptions = {}
  ): Promise<void> => {
    try {
      setIsSpeaking(true);
      
      const audioBlob = await audioService.synthesize(text, {
        voice: options.voice || defaultVoice,
        ...options
      });

      const url = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch (err) {
      setIsSpeaking(false);
      const error = err instanceof Error ? err : new Error('Erreur de synthèse');
      onError?.(error);
      throw error;
    }
  }, [defaultVoice, onError]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // EFFETS
  // --------------------------------------------------------------------------

  // S'abonner aux changements d'état du service
  useEffect(() => {
    const unsubscribe = audioService.onStateChange(setRecordingState);
    return unsubscribe;
  }, []);

  // Cleanup à la destruction
  useEffect(() => {
    return () => {
      stopDurationTimer();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [stopDurationTimer]);

  // --------------------------------------------------------------------------
  // RETURN
  // --------------------------------------------------------------------------

  return {
    recordingState,
    isRecording: recordingState === 'recording',
    isProcessing: recordingState === 'processing',
    transcription,
    error,
    isSupported,
    startRecording,
    stopAndTranscribe,
    cancelRecording,
    speakText,
    isSpeaking,
    stopSpeaking,
    recordingDuration
  };
}

export default useAudioChat;
