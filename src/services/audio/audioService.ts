/**
 * 🎙️ Service Audio pour ADHA
 * 
 * Gère la transcription vocale et la synthèse audio selon la documentation v2.4.0
 * 
 * Endpoints API (via API Gateway vers ADHA AI Service):
 * - POST /adha-ai/audio/transcribe/ → Speech-to-Text (Whisper)
 * - POST /adha-ai/audio/synthesize/ → Text-to-Speech
 * - WS /adha-ai/audio/duplex/ → Mode bidirectionnel temps réel
 * 
 * @see API DOCUMENTATION/chat/README.md - Section "Mode Audio Duplex (v2.4.0)"
 * 
 * Architecture:
 * Frontend → API Gateway (/adha-ai/...) → ADHA AI Service (AudioService)
 * 
 * @version 2.4.0
 */

import { API_CONFIG } from '../../config/api';
import { getAccessToken } from '../api/authHeaders';

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

export interface DuplexConfig {
  institutionId: string;
  conversationId?: string;
  voice?: TTSVoice;
  language?: string;
}

// État de l'enregistrement
export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

// Callbacks pour le mode duplex
export interface DuplexCallbacks {
  onTranscript: (text: string, isFinal: boolean) => void;
  onAudioResponse: (audioBlob: Blob) => void;
  onError: (error: AudioError) => void;
  onStateChange: (state: RecordingState) => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const AUDIO_ENDPOINTS = {
  TRANSCRIBE: '/adha-ai/audio/transcribe/',
  SYNTHESIZE: '/adha-ai/audio/synthesize/',
  DUPLEX: '/adha-ai/audio/duplex/'
};

const DEFAULT_VOICE: TTSVoice = 'nova';
const DEFAULT_SPEED = 1.0;
const DEFAULT_FORMAT: AudioFormat = 'mp3';

// Contraintes audio pour l'enregistrement
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
  private duplexSocket: WebSocket | null = null;
  private recordingState: RecordingState = 'idle';
  private stateCallbacks: Set<(state: RecordingState) => void> = new Set();

  // --------------------------------------------------------------------------
  // TRANSCRIPTION (Speech-to-Text)
  // --------------------------------------------------------------------------

  /**
   * Transcrit un fichier audio en texte
   * @param audioFile - Fichier audio à transcrire
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
      const token = await this.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.gatewayUrl}${AUDIO_ENDPOINTS.TRANSCRIBE}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
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
      const token = await this.getAuthToken();
      const response = await fetch(
        `${API_CONFIG.gatewayUrl}${AUDIO_ENDPOINTS.SYNTHESIZE}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
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
  // MODE DUPLEX (WebSocket temps réel)
  // --------------------------------------------------------------------------

  /**
   * Initialise une connexion duplex pour audio bidirectionnel
   */
  async connectDuplex(
    config: DuplexConfig,
    callbacks: DuplexCallbacks
  ): Promise<void> {
    const { institutionId, conversationId, voice = DEFAULT_VOICE, language = 'fr' } = config;

    // Construire l'URL WebSocket (via API Gateway vers ADHA AI Service)
    const token = await this.getAuthToken();
    const wsUrl = new URL(
      AUDIO_ENDPOINTS.DUPLEX,
      API_CONFIG.gatewayUrl.replace('http', 'ws')
    );
    wsUrl.searchParams.set('institution_id', institutionId);
    if (conversationId) wsUrl.searchParams.set('conversation_id', conversationId);
    wsUrl.searchParams.set('voice', voice);
    wsUrl.searchParams.set('language', language);
    wsUrl.searchParams.set('token', token);

    try {
      this.duplexSocket = new WebSocket(wsUrl.toString());

      this.duplexSocket.onopen = () => {
        console.log('[AudioService] 🔗 Connexion duplex établie');
        callbacks.onStateChange('idle');
      };

      this.duplexSocket.onmessage = async (event) => {
        // Gérer les messages binaires (audio) et texte (transcription)
        if (event.data instanceof Blob) {
          callbacks.onAudioResponse(event.data);
        } else {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'transcript') {
              callbacks.onTranscript(data.text, data.is_final);
            } else if (data.type === 'error') {
              callbacks.onError({
                code: data.code || 'DUPLEX_ERROR',
                message: data.message
              });
            }
          } catch (e) {
            console.error('[AudioService] ❌ Erreur parsing message duplex:', e);
          }
        }
      };

      this.duplexSocket.onerror = (event) => {
        console.error('[AudioService] ❌ Erreur duplex:', event);
        callbacks.onError({
          code: 'WEBSOCKET_ERROR',
          message: 'Erreur de connexion audio'
        });
        callbacks.onStateChange('error');
      };

      this.duplexSocket.onclose = () => {
        console.log('[AudioService] 🔌 Connexion duplex fermée');
        callbacks.onStateChange('idle');
      };
    } catch (error) {
      console.error('[AudioService] ❌ Erreur connexion duplex:', error);
      throw error;
    }
  }

  /**
   * Envoie des données audio via le socket duplex
   */
  sendAudioData(audioData: ArrayBuffer | Blob): void {
    if (this.duplexSocket?.readyState === WebSocket.OPEN) {
      this.duplexSocket.send(audioData);
    }
  }

  /**
   * Ferme la connexion duplex
   */
  disconnectDuplex(): void {
    if (this.duplexSocket) {
      this.duplexSocket.close();
      this.duplexSocket = null;
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
   * Retourne le mime type supporté
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
   * Met à jour l'état d'enregistrement
   */
  private setRecordingState(state: RecordingState): void {
    this.recordingState = state;
    this.stateCallbacks.forEach(cb => cb(state));
  }

  /**
   * Récupère le token d'authentification
   * Utilise la même méthode que les autres services API (Auth0)
   */
  private async getAuthToken(): Promise<string> {
    try {
      // Utiliser getAccessToken qui gère Auth0 et le cache
      const token = await getAccessToken();
      return token || '';
    } catch (error) {
      console.error('[AudioService] ❌ Erreur récupération token:', error);
      // Fallback vers localStorage si getAccessToken échoue
      return localStorage.getItem('auth_token') || '';
    }
  }
}

// Export singleton
export const audioService = new AudioService();
export default audioService;
