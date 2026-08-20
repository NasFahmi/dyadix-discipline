export default defineBackground(() => {
  console.log('[TradingDiscipline OS] Background service worker initialized.');

  // Automatically open side panel on extension action click
  chrome.sidePanel
    ?.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('[TradingDiscipline OS] Failed to set sidePanel behavior:', error));

  // Create periodic alarm for periodic checks
  chrome.alarms?.create('syncDisciplineNews', { periodInMinutes: 30 });

  chrome.alarms?.onAlarm.addListener((alarm) => {
    if (alarm.name === 'syncDisciplineNews') {
      console.log('[TradingDiscipline OS] Alarm triggered: syncing market radar.');
    }
  });

  // Handle extension installation
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      console.log('[TradingDiscipline OS] Extension freshly installed.');
    }
  });
});
