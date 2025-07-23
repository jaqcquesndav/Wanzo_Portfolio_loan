import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

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
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hot-toast',
      '@heroicons/react',
    ],
  },
  build: {
    // Optimisation de la construction
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for core React libraries
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/react-router-dom/')) {
            return 'vendor';
          }
          
          // UI chunk for UI-related libraries
          if (id.includes('node_modules/react-hot-toast/') || 
              id.includes('node_modules/@heroicons/')) {
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
    hmr: {
      overlay: true,
    },
  },
});
