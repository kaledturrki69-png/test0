import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import fr from 'javascript-time-ago/locale/fr.json';

let initialized = false;

export function initializeTimeAgo() {
  if (typeof window !== 'undefined' && !initialized) {
    try {
      TimeAgo.addDefaultLocale(en);
      TimeAgo.addLocale(fr);
      initialized = true;
    } catch (error) {}
  }
}

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  initializeTimeAgo();
}
