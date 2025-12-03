import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import fs from 'fs';
import path from 'path';

// Plugin to copy production files to dist/
function copyProductionFiles() {
  return {
    name: 'copy-production-files',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      
      // Copy production-server.js to dist/server.js
      fs.copyFileSync(
        path.resolve(__dirname, 'production-server.js'),
        path.join(distDir, 'server.js')
      );
      
      // Copy production-package.json to dist/package.json
      fs.copyFileSync(
        path.resolve(__dirname, 'production-package.json'),
        path.join(distDir, 'package.json')
      );
      
      console.log('✅ Production files copied to dist/');
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    copyProductionFiles(),
  ],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hot-toast',
      '@heroicons/react',
      'lucide-react',
      'plotly.js/dist/plotly',
      'react-plotly.js',
    ],
    exclude: [
      'plotly.js/dist/plotly-basic',
      'plotly.js/dist/plotly-gl2d',
    ],
    // Force la re-optimisation en cas de problème
    force: false,
    // Optimisations spécifiques
    esbuildOptions: {
      target: 'es2020',
    }
  },
  build: {
    // Optimisation de la construction
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Charts chunk for data visualization libraries
          if (id.includes('node_modules/plotly.js/') || 
              id.includes('node_modules/react-plotly.js/') ||
              id.includes('node_modules/chart.js/') ||
              id.includes('node_modules/react-chartjs-2/') ||
              id.includes('node_modules/recharts/')) {
            return 'charts';
          }
          
          // Vendor chunk for core React libraries
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/react-router-dom/')) {
            return 'vendor';
          }
          
          // UI chunk for UI-related libraries
          if (id.includes('node_modules/react-hot-toast/') || 
              id.includes('node_modules/@heroicons/') ||
              id.includes('node_modules/lucide-react/')) {
            return 'ui';
          }
          
          // Let splitVendorChunkPlugin handle the rest
          return null;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Mise en cache optimisée
    sourcemap: false, // Désactiver pour la production
    reportCompressedSize: false, // Améliore la vitesse de build
  },
  server: {
    // Optimisation du serveur de développement
    port: 5174, // Port requis par l'utilisateur
    host: true, // Permettre l'accès depuis le réseau (0.0.0.0)
    hmr: {
      overlay: true,
      port: 24678, // Port HMR dédié pour éviter les conflits
      // Optimisations HMR pour éviter ERR_INSUFFICIENT_RESOURCES
      clientPort: 24678,
    },
    // Augmenter les limites pour éviter ERR_INSUFFICIENT_RESOURCES
    middlewareMode: false,
    fs: {
      strict: false,
      allow: ['..'], // Permettre l'accès aux fichiers parent
    },
    // Optimisations mémoire
    watch: {
      usePolling: false,
      interval: 100,
      // Ignorer les dossiers volumineux
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.vscode/**']
    },
    // Configuration pour éviter les problèmes de ressources
    cors: true,
    strictPort: false, // Permettre le fallback si le port est occupé
  },
  // Optimisations supplémentaires pour les ressources
  esbuild: {
    // Optimisation de l'analyseur TypeScript
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Réduire l'utilisation mémoire
    keepNames: false,
  },
  // Résolution des modules optimisée
  resolve: {
    dedupe: ['react', 'react-dom'],
    // Alias pour réduire la résolution de modules
    alias: {
      '@': '/src',
    }
  },
  // Configuration pour réduire l'utilisation des ressources
  define: {
    __DEV__: JSON.stringify(true),
  },
});
