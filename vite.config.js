import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [laravel({
    input: 'resources/js/app.jsx',
    ssr: 'resources/js/ssr.jsx',
    refresh: true,
  }), react(), flowbiteReact()],
});