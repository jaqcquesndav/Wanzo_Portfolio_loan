// Mock chat response utilities

export function detectKeywords(message: string): string[] {
  // Simple keyword detection for demo
  const keywords = ['comptabilité', 'fiscalité', 'analyse', 'ratios', 'prévisions'];
  return keywords.filter(kw => message.toLowerCase().includes(kw));
}

export function generateResponse(message: string, mode: 'chat' | 'analyse' = 'chat'): string {
  const keywords = detectKeywords(message);
  
  if (keywords.length === 0) {
    if (mode === 'analyse') {
      return "Mode Analyse: Je n'ai pas détecté de sujet spécifique pour l'analyse. Pouvez-vous me donner plus de détails sur ce que vous souhaitez analyser ?";
    }
    return "Je n'ai pas détecté de sujet spécifique. Pouvez-vous préciser votre demande ?";
  }
  
  if (mode === 'analyse') {
    return `Mode Analyse: Analyse approfondie sur les sujets : ${keywords.join(', ')}. \n\nVoici une analyse détaillée de ces éléments et leurs impacts sur votre portfolio...`;
  }
  
  return `Votre question concerne : ${keywords.join(', ')}. Voici quelques informations utiles...`;
}
