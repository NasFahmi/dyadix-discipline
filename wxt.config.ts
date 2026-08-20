import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  manifest: {
    name: 'Trading Discipline OS',
    description: 'Enforce trading discipline, checklist process, session clock and economic news radar on TradingView.',
    version: '1.0.0',
    permissions: ['storage', 'alarms', 'sidePanel'],
    host_permissions: [
      'https://nfs.faireconomy.media/*'
    ],
    action: {
      default_title: 'Open Trading Discipline OS'
    },
    side_panel: {
      default_path: 'sidepanel.html'
    }
  }
});
