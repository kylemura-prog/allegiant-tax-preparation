import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local']
  },
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
        bookkeepingServices: resolve(import.meta.dirname, 'bookkeeping-services-muskegon.html'),
        payrollServices: resolve(import.meta.dirname, 'payroll-services-muskegon.html'),
        taxPreparation: resolve(import.meta.dirname, 'tax-preparation-north-muskegon.html'),
        taxNoticeHelp: resolve(import.meta.dirname, 'tax-notice-help-michigan.html'),
        businessCheckup: resolve(import.meta.dirname, 'business-checkup.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        terms: resolve(import.meta.dirname, 'terms.html')
      }
    }
  }
});
