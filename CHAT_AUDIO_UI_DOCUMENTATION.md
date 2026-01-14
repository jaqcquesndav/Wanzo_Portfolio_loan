# 📱 Documentation UI Chat Audio - Guide de Reproduction

> **Version**: 1.0.0  
> **Date**: Janvier 2026  
> **Style**: WhatsApp / Claude / Gemini

Cette documentation contient tout le code nécessaire pour reproduire l'interface de chat avec support audio (enregistrement vocal, transcription, synthèse vocale) et la page d'accueil avec suggestions.

---

## 📁 Structure des fichiers

```
src/
├── services/
│   └── audio/
│       └── audioService.ts       # Service audio singleton
├── hooks/
│   └── useAudioChat.ts           # Hook React pour l'audio
└── components/
    └── chat/
        └── ChatContainer.tsx     # Composant principal du chat
```

---

## 🎯 Table des matières

1. [Service Audio (audioService.ts)](#1-service-audio)
2. [Hook React (useAudioChat.ts)](#2-hook-react-useaudiochat)
3. [Bouton Dynamique Mic/Send/Stop](#3-bouton-dynamique-micsendstop)
4. [Indicateur d'enregistrement](#4-indicateur-denregistrement)
5. [Page d'accueil avec suggestions](#5-page-daccueil-avec-suggestions)
6. [Intégration complète](#6-intégration-complète)

---

## 1. Service Audio

### `src/services/audio/audioService.ts`

```typescript
/**
 * 🎙️ Service Audio pour Chat
 * 
 * Gère la transcription vocale (STT) et la synthèse audio (TTS)
 * 
 * Endpoints API requis:
 * - POST /audio/transcribe/ → Speech-to-Text
 * - POST /audio/synthesize/ → Text-to-Speech
 */

// ============================================================================
// TYPES
// ============================================================================

export type TTSVoice = 'nova' | 'alloy' | 'echo' | 'onyx';
export type AudioFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';

export interface TranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
  duration?: number;
}

export interface SynthesisOptions {
  voice?: TTSVoice;
  speed?: number; // 0.25 à 4.0
  format?: AudioFormat;
}

export interface AudioError {
  code: string;
  message: string;
  details?: string;
}

// État de l'enregistrement
export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

// ============================================================================
// CONSTANTES - À ADAPTER SELON VOTRE API
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AUDIO_ENDPOINTS = {
  TRANSCRIBE: '/audio/transcribe/',
  SYNTHESIZE: '/audio/synthesize/',
};

const DEFAULT_VOICE: TTSVoice = 'nova';
const DEFAULT_SPEED = 1.0;
const DEFAULT_FORMAT: AudioFormat = 'mp3';

// Contraintes audio pour l'enregistrement (optimisées pour la transcription)
const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  sampleRate: 16000,
  channelCount: 1
};

// ============================================================================
// SERVICE AUDIO
// ============================================================================

class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingState: RecordingState = 'idle';
  private stateCallbacks: Set<(state: RecordingState) => void> = new Set();

  // --------------------------------------------------------------------------
  // TRANSCRIPTION (Speech-to-Text)
  // --------------------------------------------------------------------------

  /**
   * Transcrit un fichier audio en texte
   * @param audioFile - Fichier audio à transcrire (Blob ou File)
   * @param language - Code langue optionnel (fr, en, etc.)
   */
  async transcribe(
    audioFile: Blob | File,
    language?: string
  ): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('audio', audioFile, 'recording.webm');
    
    if (language) {
      formData.append('language', language);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}${AUDIO_ENDPOINTS.TRANSCRIBE}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de transcription');
      }

      return await response.json();
    } catch (error) {
      console.error('[AudioService] ❌ Erreur transcription:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // SYNTHÈSE (Text-to-Speech)
  // --------------------------------------------------------------------------

  /**
   * Convertit du texte en audio
   * @param text - Texte à synthétiser
   * @param options - Options de synthèse (voix, vitesse, format)
   */
  async synthesize(
    text: string,
    options: SynthesisOptions = {}
  ): Promise<Blob> {
    const {
      voice = DEFAULT_VOICE,
      speed = DEFAULT_SPEED,
      format = DEFAULT_FORMAT
    } = options;

    try {
      const response = await fetch(
        `${API_BASE_URL}${AUDIO_ENDPOINTS.SYNTHESIZE}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            voice,
            speed,
            format
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de synthèse');
      }

      return await response.blob();
    } catch (error) {
      console.error('[AudioService] ❌ Erreur synthèse:', error);
      throw error;
    }
  }

  /**
   * Joue un blob audio
   */
  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      
      audio.play();
    });
  }

  // --------------------------------------------------------------------------
  // ENREGISTREMENT AUDIO
  // --------------------------------------------------------------------------

  /**
   * Démarre l'enregistrement audio
   */
  async startRecording(): Promise<void> {
    try {
      this.setRecordingState('recording');
      this.audioChunks = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getSupportedMimeType()
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('[AudioService] ❌ Erreur MediaRecorder:', event);
        this.setRecordingState('error');
      };

      this.mediaRecorder.start(100); // Chunks de 100ms
      console.log('[AudioService] 🎙️ Enregistrement démarré');
    } catch (error) {
      console.error('[AudioService] ❌ Erreur démarrage enregistrement:', error);
      this.setRecordingState('error');
      throw error;
    }
  }

  /**
   * Arrête l'enregistrement et retourne le blob audio
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('Aucun enregistrement en cours'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: this.getSupportedMimeType()
        });
        
        // Arrêter les pistes audio
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        this.setRecordingState('idle');
        console.log('[AudioService] ⏹️ Enregistrement arrêté');
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Annule l'enregistrement en cours
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.mediaRecorder.stop();
      this.audioChunks = [];
      this.setRecordingState('idle');
      console.log('[AudioService] 🚫 Enregistrement annulé');
    }
  }

  // --------------------------------------------------------------------------
  // UTILITAIRES
  // --------------------------------------------------------------------------

  /**
   * Vérifie si le navigateur supporte l'enregistrement audio
   */
  isSupported(): boolean {
    try {
      return typeof navigator !== 'undefined' 
        && 'mediaDevices' in navigator 
        && 'getUserMedia' in navigator.mediaDevices
        && typeof MediaRecorder !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Retourne l'état actuel de l'enregistrement
   */
  getRecordingState(): RecordingState {
    return this.recordingState;
  }

  /**
   * S'abonne aux changements d'état
   */
  onStateChange(callback: (state: RecordingState) => void): () => void {
    this.stateCallbacks.add(callback);
    return () => this.stateCallbacks.delete(callback);
  }

  /**
   * Retourne le mime type supporté par le navigateur
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'audio/webm';
  }

  /**
   * Met à jour l'état d'enregistrement et notifie les abonnés
   */
  private setRecordingState(state: RecordingState): void {
    this.recordingState = state;
    this.stateCallbacks.forEach(cb => cb(state));
  }

  /**
   * Récupère le token d'authentification
   * ⚠️ À ADAPTER selon votre système d'auth
   */
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }
}

// Export singleton
export const audioService = new AudioService();
export default audioService;
```

---

## 2. Hook React useAudioChat

### `src/hooks/useAudioChat.ts`

```typescript
/**
 * 🎙️ Hook React pour l'audio Chat
 * 
 * Gère l'enregistrement vocal, la transcription et la synthèse audio
 * avec une interface React simple et réactive.
 * 
 * @example
 * const { 
 *   isRecording, 
 *   isSupported,
 *   startRecording, 
 *   stopAndTranscribe,
 *   recordingDuration
 * } = useAudioChat({
 *   language: 'fr',
 *   onTranscriptionComplete: (text) => setMessage(text)
 * });
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { audioService, RecordingState, TTSVoice, SynthesisOptions } from '../services/audio/audioService';

// ============================================================================
// TYPES
// ============================================================================

export interface UseAudioChatOptions {
  /** Voix TTS par défaut */
  defaultVoice?: TTSVoice;
  /** Langue de transcription (fr, en, etc.) */
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
  /** Raccourci: est en train de traiter (transcription) */
  isProcessing: boolean;
  /** Dernière transcription */
  transcription: string | null;
  /** Dernière erreur */
  error: Error | null;
  /** Support audio disponible dans le navigateur */
  isSupported: boolean;
  /** Démarrer l'enregistrement */
  startRecording: () => Promise<void>;
  /** Arrêter et transcrire */
  stopAndTranscribe: () => Promise<string>;
  /** Annuler l'enregistrement */
  cancelRecording: () => void;
  /** Synthétiser et jouer du texte (TTS) */
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
  // ✅ Optimiste par défaut, vérifié après montage
  const [isSupported, setIsSupported] = useState(true);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartRef = useRef<number>(0);

  // Vérifier le support audio après le montage (côté client uniquement)
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
  // SYNTHÈSE VOCALE (TTS)
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
      
      // Stopper l'audio précédent si existant
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

  // Cleanup à la destruction du composant
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
```

---

## 3. Bouton Dynamique Mic/Send/Stop

### Logique du bouton (style WhatsApp/Claude)

| État | Bouton | Couleur | Icône |
|------|--------|---------|-------|
| Input vide, audio supporté | 🎤 Mic | Bleu (primary) | `<Mic />` |
| Input avec texte | ➤ Send | Bleu (primary) | `<Send />` |
| Enregistrement vocal | ⬛ Stop | Rouge pulsant | `<Square />` |
| Transcription en cours | ⏳ Loader | Bleu clair | `<Loader2 />` |
| Streaming IA en cours | ⬛ Stop | Rouge pulsant | `<Square />` |
| Audio non supporté | ➤ Send | Gris désactivé | `<Send />` |

### Code JSX du bouton

```tsx
import { Send, Mic, Square, Loader2 } from 'lucide-react';

// Dans votre composant, utilisez le hook:
const {
  isRecording: isVoiceRecording,
  isProcessing: isVoiceProcessing,
  isSupported: isAudioSupported,
  startRecording: startVoiceRecording,
  stopAndTranscribe,
  cancelRecording,
  recordingDuration
} = useAudioChat({
  language: 'fr',
  defaultVoice: 'nova',
  onTranscriptionComplete: (text) => {
    setNewMessage(prev => prev ? `${prev} ${text}` : text);
  },
  onError: (error) => {
    console.error('Erreur audio:', error);
  }
});

// Le bouton dynamique (positionné en absolute dans un container relative)
{/* ✅ Bouton Send/Stop/Audio dynamique - style WhatsApp/Claude */}
{isStreamingActive ? (
  // Bouton STOP pendant le streaming IA
  <button
    onClick={cancelStream}
    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md group"
    title="Arrêter la génération"
  >
    <Square className="h-4 w-4 fill-current" />
    {/* Animation pulse discrète */}
    <span className="absolute inset-0 rounded-lg bg-red-400 animate-ping opacity-30" />
  </button>
) : isVoiceRecording ? (
  // Mode enregistrement actif - Bouton Stop
  <button
    onClick={async () => {
      try {
        await stopAndTranscribe();
      } catch (err) {
        console.error('Erreur transcription:', err);
      }
    }}
    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md group"
    title="Arrêter et transcrire"
  >
    <Square className="h-4 w-4 fill-current" />
    <span className="absolute inset-0 rounded-lg bg-red-400 animate-ping opacity-30" />
  </button>
) : isVoiceProcessing ? (
  // Mode traitement transcription
  <button
    disabled
    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/20 text-primary"
    title="Transcription en cours..."
  >
    <Loader2 className="h-4 w-4 animate-spin" />
  </button>
) : newMessage.trim() ? (
  // Bouton SEND quand il y a du texte
  <button
    onClick={handleSend}
    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md hover:scale-105"
    title="Envoyer (Entrée)"
  >
    <Send className="h-4 w-4" />
  </button>
) : isAudioSupported ? (
  // Bouton MICRO quand l'input est vide (par défaut)
  <button
    onClick={startVoiceRecording}
    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md hover:scale-105"
    title="Message vocal"
  >
    <Mic className="h-4 w-4" />
  </button>
) : (
  // Fallback: Bouton SEND désactivé si audio non supporté
  <button
    disabled
    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
    title="Tapez un message"
  >
    <Send className="h-4 w-4" />
  </button>
)}
```

---

## 4. Indicateur d'enregistrement

### Animation avec timer et bouton annuler

```tsx
import { X, Loader2 } from 'lucide-react';

{/* 🎙️ Indicateur d'enregistrement audio (visible quand isVoiceRecording = true) */}
{isVoiceRecording && (
  <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg border border-red-200 dark:border-red-800 animate-pulse">
    {/* Point rouge animé */}
    <div className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </div>
    
    {/* Timer MM:SS */}
    <span className="text-xs font-mono text-red-600 dark:text-red-400 min-w-[40px]">
      {Math.floor(recordingDuration / 60).toString().padStart(2, '0')}:
      {(recordingDuration % 60).toString().padStart(2, '0')}
    </span>
    
    {/* Bouton Annuler */}
    <button
      onClick={cancelRecording}
      className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
      title="Annuler l'enregistrement"
    >
      <X className="h-3 w-3" />
    </button>
  </div>
)}

{/* Indicateur de traitement transcription */}
{isVoiceProcessing && (
  <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-lg">
    <Loader2 className="h-4 w-4 animate-spin text-primary" />
    <span className="text-xs text-primary font-medium">Transcription...</span>
  </div>
)}
```

---

## 5. Page d'accueil avec suggestions

### Écran d'accueil style ChatGPT/Claude/Gemini

```tsx
import { Sparkles, TrendingUp, AlertCircle, FileText, User, HelpCircle } from 'lucide-react';

// Suggestions de prompts (à personnaliser selon votre app)
const PROMPT_SUGGESTIONS = [
  {
    id: 'analyze',
    title: 'Analyse de données',
    description: 'Performance, tendances et opportunités',
    prompt: 'Analyse la performance de mes données',
    icon: TrendingUp,
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'risks',
    title: 'Évaluation des risques',
    description: 'Alertes et points d\'attention',
    prompt: 'Quels sont les risques majeurs à surveiller ?',
    icon: AlertCircle,
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'reports',
    title: 'Génération de rapports',
    description: 'Synthèses et documents automatisés',
    prompt: 'Génère un rapport de synthèse mensuel',
    icon: FileText,
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'help',
    title: 'Aide et support',
    description: 'Questions fréquentes et guides',
    prompt: 'Comment puis-je utiliser cette fonctionnalité ?',
    icon: HelpCircle,
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
];

// Page d'accueil (quand messages.length === 0)
{messages.length === 0 && (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
    {/* Logo animé avec badge en ligne */}
    <div className="relative mb-6">
      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      {/* Badge "En ligne" */}
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>
    </div>
    
    {/* Message de bienvenue personnalisé */}
    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
      Bonjour, {userName} 👋
    </h2>
    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
      Je suis <span className="font-medium text-primary">votre assistant</span> intelligent. 
      Comment puis-je vous aider aujourd'hui ?
    </p>
    
    {/* Grille de suggestions */}
    <div className="grid gap-3 w-full max-w-lg grid-cols-1 md:grid-cols-2">
      {PROMPT_SUGGESTIONS.map((suggestion) => {
        const IconComponent = suggestion.icon;
        return (
          <button 
            key={suggestion.id}
            onClick={() => setNewMessage(suggestion.prompt)}
            className="group flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left"
          >
            <div className={`w-10 h-10 rounded-lg ${suggestion.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <IconComponent className={`h-5 w-5 ${suggestion.iconColor}`} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {suggestion.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {suggestion.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
    
    {/* Tip optionnel */}
    <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
      <Sparkles className="h-3 w-3" />
      <span>Tapez votre question ou utilisez une suggestion ci-dessus</span>
    </div>
  </div>
)}
```

---

## 6. Intégration complète

### Exemple de composant Chat complet

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Square, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  HelpCircle,
  X,
  Paperclip,
  Smile
} from 'lucide-react';
import { useAudioChat } from '../hooks/useAudioChat';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatContainerProps {
  userName: string;
  onSendMessage: (content: string) => Promise<void>;
  messages: Message[];
  isStreaming?: boolean;
  onCancelStream?: () => void;
}

export function ChatContainer({ 
  userName, 
  onSendMessage, 
  messages, 
  isStreaming = false,
  onCancelStream 
}: ChatContainerProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🎙️ Hook Audio
  const {
    isRecording: isVoiceRecording,
    isProcessing: isVoiceProcessing,
    recordingDuration,
    isSupported: isAudioSupported,
    startRecording: startVoiceRecording,
    stopAndTranscribe,
    cancelRecording
  } = useAudioChat({
    language: 'fr',
    defaultVoice: 'nova',
    onTranscriptionComplete: (text) => {
      setNewMessage(prev => prev ? `${prev} ${text}` : text);
    },
    onError: (error) => {
      console.error('Erreur audio:', error);
    }
  });

  // Auto-scroll aux nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          /* Page d'accueil - voir section 5 */
          <WelcomeScreen userName={userName} onSelectPrompt={setNewMessage} />
        ) : (
          /* Liste des messages */
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="w-full px-4 py-3 pr-16 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none"
            rows={2}
            disabled={isStreaming || isVoiceRecording}
          />
          
          {/* Bouton dynamique - voir section 3 */}
          <DynamicButton
            newMessage={newMessage}
            isStreaming={isStreaming}
            isVoiceRecording={isVoiceRecording}
            isVoiceProcessing={isVoiceProcessing}
            isAudioSupported={isAudioSupported}
            onSend={handleSend}
            onStartRecording={startVoiceRecording}
            onStopRecording={stopAndTranscribe}
            onCancelStream={onCancelStream}
          />
        </div>

        {/* Indicateurs et actions */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            {/* Indicateur d'enregistrement - voir section 4 */}
            {isVoiceRecording && (
              <RecordingIndicator 
                duration={recordingDuration} 
                onCancel={cancelRecording} 
              />
            )}
            {isVoiceProcessing && <ProcessingIndicator />}
          </div>
          <span className="text-xs text-gray-400">
            {isVoiceRecording ? 'Tap pour transcrire' : '↵ envoyer'}
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 📦 Dépendances requises

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "lucide-react": "^0.344.0"
  }
}
```

```bash
npm install lucide-react
# ou
yarn add lucide-react
```

---

## 🎨 Classes Tailwind utilisées

Les classes principales utilisées pour le styling:

| Élément | Classes |
|---------|---------|
| Bouton primary | `bg-primary text-white hover:bg-primary/90` |
| Bouton danger | `bg-red-500 hover:bg-red-600 text-white` |
| Bouton disabled | `bg-gray-200 text-gray-400 cursor-not-allowed` |
| Animation ping | `animate-ping opacity-30` |
| Animation pulse | `animate-pulse` |
| Animation spin | `animate-spin` |
| Carte suggestion | `border border-gray-200 rounded-xl hover:border-primary/50` |
| Badge enregistrement | `bg-red-50 border-red-200 animate-pulse` |

---

## ✅ Checklist d'implémentation

- [ ] Créer `src/services/audio/audioService.ts`
- [ ] Créer `src/hooks/useAudioChat.ts`
- [ ] Installer `lucide-react`
- [ ] Configurer les endpoints API audio dans les constantes
- [ ] Adapter `getAuthToken()` selon votre système d'auth
- [ ] Intégrer le bouton dynamique dans votre composant chat
- [ ] Ajouter l'indicateur d'enregistrement
- [ ] Créer la page d'accueil avec suggestions personnalisées
- [ ] Tester sur différents navigateurs (Chrome, Firefox, Safari)

---

## 🔗 Références

- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
