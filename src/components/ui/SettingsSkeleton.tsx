export function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center">
        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded mr-2"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
      </div>
      
      {/* Container principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
        {/* Onglets */}
        <div className="flex space-x-4 border-b dark:border-gray-700 pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          ))}
        </div>

        {/* Contenu des paramètres */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="space-y-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border dark:border-gray-700 rounded">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                  </div>
                  <div className="h-6 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-4 pt-4">
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
