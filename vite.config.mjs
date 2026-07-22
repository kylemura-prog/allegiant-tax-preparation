import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'copy-checklist-pdf',
      closeBundle() {
        const outputDirectory = resolve(import.meta.dirname, 'dist', 'assets');
        mkdirSync(outputDirectory, { recursive: true });
        copyFileSync(
          resolve(import.meta.dirname, 'assets', 'small-business-books-payroll-checklist.pdf'),
          resolve(outputDirectory, 'small-business-books-payroll-checklist.pdf')
        );
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        businessCheckup: resolve(import.meta.dirname, 'business-checkup.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        terms: resolve(import.meta.dirname, 'terms.html')
      }
    }
  }
});
