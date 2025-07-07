import React from 'react';

export const NotFound: React.FC<{ message?: string }> = ({ message }) => (
  <div className="p-8 text-center text-gray-400">
    {message || 'Aucune donnée trouvée.'}
  </div>
);
