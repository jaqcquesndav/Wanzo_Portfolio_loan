import { Bot, Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  mode?: 'typing' | 'thinking' | 'processing' | 'streaming';
}

export function TypingIndicator({ mode = 'typing' }: TypingIndicatorProps) {
  const messages = {
    typing: "Génération en cours",
    thinking: "Analyse en cours",
    processing: "Traitement en cours",
    streaming: "ADHA écrit"
  };

  return (
    <div className="group relative w-full animate-fade-in">
      <div className="flex items-start space-x-3 py-2.5 px-3 -mx-3 rounded-xl">
        {/* Avatar avec animation subtile - style Gemini */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 relative">
          <Bot className="h-4 w-4 text-primary" />
          {/* Indicateur de streaming actif - style Gemini */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-ping-slow" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Header avec nom et status animé */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">ADHA</span>
            <span className="flex items-center space-x-1.5 text-xs text-primary">
              <Sparkles className="h-3 w-3 animate-sparkle" />
              <span className="animate-pulse-subtle">{messages[mode]}</span>
            </span>
          </div>
          
          {/* Indicateur de frappe style Gemini - plus élégant */}
          <div className="flex items-center space-x-1 py-2">
            {/* Animation wave */}
            <div className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-wave" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-wave" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-wave" style={{ animationDelay: '300ms' }} />
            </div>
            {/* Barre de progression subtile */}
            <div className="ml-2 flex-1 max-w-[100px] h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary/40 rounded-full animate-progress-indeterminate" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
