import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/free-qr-code-generator-with-custom-logo/",
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
