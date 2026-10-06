export const LOCAL_API_URL = 'http://127.0.0.1:8787/api';
export const PUBLIC_API_URL = 'https://campus-equipment-booking-api.svg-asset.workers.dev/api';
export const REMOTE = process.argv.includes('--remote');
// Remote testing is explicit; stale environment variables cannot change the URL.
export const BASE_URL = REMOTE ? PUBLIC_API_URL : LOCAL_API_URL;
