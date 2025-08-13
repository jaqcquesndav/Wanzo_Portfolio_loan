import { interceptorManager, ResponseInterceptor } from './interceptors';

// Interceptor pour normaliser les réponses API
const responseNormalizerInterceptor: ResponseInterceptor = {
  onResponse<T>(response: T): T {
    // Si la réponse est déjà au format attendu, la retourner directement
    if (!response || typeof response !== 'object') {
      return response;
    }

    const resp = response as Record<string, unknown>;

    // Si la réponse contient une structure {success: true, data: ...}
    if (resp.success === true && 'data' in resp) {
      return resp.data as unknown as T;
    }

    // Si la réponse contient une structure paginée
    if (resp.success === true && 'data' in resp && 'meta' in resp) {
      return {
        items: resp.data,
        pagination: resp.meta
      } as unknown as T;
    }

    return response;
  },
  
  onError<E extends Error>(error: E): E {
    // Pour l'instant, on se contente de renvoyer l'erreur telle quelle
    return error;
  }
};

// Ajouter l'intercepteur à la liste des intercepteurs
interceptorManager.addResponseInterceptor(responseNormalizerInterceptor);

// Exporter pour s'assurer que le fichier est importé
export const setupResponseInterceptors = () => {
  console.log('Response interceptors configured');
};
