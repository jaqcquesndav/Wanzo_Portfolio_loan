// src/utils/creditScoreConverter.ts

/**
 * Convertit un score de crédit numérique (0-100) en cote alphabétique (A, B, C, D)
 * @param score Score de crédit entre 0 et 100
 * @returns Cote alphabétique correspondante
 */
export function convertScoreToRating(score: number): string {
  if (score >= 80) return 'A'; // Excellent (80-100)
  if (score >= 65) return 'B'; // Bon (65-79)
  if (score >= 50) return 'C'; // Moyen (50-64)
  return 'D'; // Risqué (0-49)
}

/**
 * Convertit une cote alphabétique (A, B, C, D) en score de crédit numérique (0-100)
 * @param rating Cote alphabétique
 * @returns Score moyen correspondant à la cote
 */
export function convertRatingToScore(rating: string): number {
  switch (rating.toUpperCase()) {
    case 'A': return 90; // Valeur moyenne pour A
    case 'B': return 72; // Valeur moyenne pour B
    case 'C': return 57; // Valeur moyenne pour C
    case 'D': return 35; // Valeur moyenne pour D
    default: return 50; // Valeur par défaut
  }
}

/**
 * Détermine la classe CSS à utiliser pour une cote de crédit donnée
 * @param rating Cote de crédit (A, B, C, D) ou score (0-100)
 * @returns Classe CSS à appliquer
 */
export function getCreditRatingClass(rating: string | number): string {
  let ratingLetter: string;
  
  if (typeof rating === 'number') {
    ratingLetter = convertScoreToRating(rating);
  } else {
    ratingLetter = rating.toUpperCase();
  }
  
  switch (ratingLetter) {
    case 'A': 
      return 'bg-green-100 text-green-800';
    case 'B':
      return 'bg-blue-100 text-blue-800';
    case 'C':
      return 'bg-yellow-100 text-yellow-800';
    case 'D':
    default:
      return 'bg-red-100 text-red-800';
  }
}
