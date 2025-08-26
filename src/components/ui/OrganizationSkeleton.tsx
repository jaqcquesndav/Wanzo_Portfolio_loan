export function OrganizationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center">
        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded mr-2"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
      </div>

      {/* Card principale */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Header avec badge et titre */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            </div>
            <div className="h-16 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-36"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-44"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Section des licences */}
        <div className="border-t dark:border-gray-700 p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border dark:border-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section des contacts */}
        <div className="border-t dark:border-gray-700 p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-28 mb-4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
