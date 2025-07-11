// Mock chat response utilities

export function detectKeywords(message: string): string[] {
  // Simple keyword detection for demo
  const keywords = ['comptabilité', 'fiscalité', 'analyse', 'ratios', 'prévisions'];
  return keywords.filter(kw => message.toLowerCase().includes(kw));
}

export function generateResponse(message: string): string {
  const keywords = detectKeywords(message);
  if (keywords.length === 0) {
    return "Je n'ai pas détecté de sujet spécifique. Pouvez-vous préciser votre demande ?";
  }
  return `Votre question concerne : ${keywords.join(', ')}. Voici quelques informations utiles...`;
}
