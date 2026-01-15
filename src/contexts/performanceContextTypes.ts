/**
 * Types et contexte pour la performance
 */

import { createContext } from 'react';
import type { NetworkInfo, NetworkQuality } from '../services/performance/networkQualityService';

export interface PerformanceSettings {
  enableAnimations: boolean;
  enableTransitions: boolean;
  preloadImages: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  batchSize: number;
  timeout: number;
}

export interface PerformanceContextType {
  // Network info
  networkInfo: NetworkInfo;
  networkQuality: NetworkQuality;
  isOnline: boolean;
  
  // Performance settings
  settings: PerformanceSettings;
  
  // Actions
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  
  // Loading helpers
  getLoadingDelay: (priority: 'critical' | 'high' | 'medium' | 'low') => number;
  shouldPreload: () => boolean;
  
  // Connection status component helper
  showConnectionWarning: boolean;
}

export { type NetworkQuality, type NetworkInfo };

export const PerformanceContext = createContext<PerformanceContextType | null>(null);
