import { Bot, Loader2 } from 'lucide-react';

interface TypingIndicatorProps {
  mode?: 'typing' | 'thinking' | 'processing';
}

export function TypingIndicator({ mode = 'typing' }: TypingIndicatorProps) {
  const messages = {
    typing: "Génération en cours...",
    thinking: "Analyse en cours...",
    processing: "Traitement en cours..."
  };

  return (
    <div className="group relative w-full">
      <div className="flex items-start space-x-3 py-2 px-2 -mx-2">
        {/* Avatar - Style cohérent avec ChatMessage */}
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="h-4 w-4 text-primary" />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">ADHA</span>
            <span className="text-xs text-primary animate-pulse flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              {messages[mode]}
            </span>
          </div>
          
          {/* Points animés avec délais décalés */}
          <div className="flex items-center space-x-1.5 py-2">
            <div 
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" 
              style={{ animationDelay: '0ms', animationDuration: '0.6s' }} 
            />
            <div 
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" 
              style={{ animationDelay: '150ms', animationDuration: '0.6s' }} 
            />
            <div 
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" 
              style={{ animationDelay: '300ms', animationDuration: '0.6s' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
