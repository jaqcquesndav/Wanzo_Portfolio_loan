import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Re-export du type pour faciliter l'usage
export type { UserContextStatus } from './AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};
