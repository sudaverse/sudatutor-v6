/**
 * Application Configuration
 * Centralized configuration for production deployment
 */

export const CONFIG = {
  // File Search Store configuration
  FILE_SEARCH_STORE_NAME: 'fileSearchStores/sudan-curriculum-file-searc-0yuzv4zzxz09',
  
  // Gemini AI configuration
  GEMINI_MODEL: 'gemini-2.5-flash',
  
  // API endpoints
  API_BASE_URL: 'https://generativelanguage.googleapis.com',
  API_VERSION: 'v1beta',
  
  // Application metadata
  APP_NAME: 'SUDATUTOR ',
  APP_DESCRIPTION: 'مساعدك الدراسي الذكي للمناهج السودانية',
  APP_VERSION: '1.0.0',
  
  // Supported grades and curriculum
  GRADES: [
    'الصف الأول',
    'الصف الثاني', 
    'الصف الثالث',
    'الصف الرابع',
    'الصف الخامس',
    'الصف السادس',
    'الصف السابع',
    'الصف الثامن',
    'الصف التاسع',
    'الصف العاشر',
    'الصف الحادي عشر',
    'الصف الثاني عشر (علمي)',
    'الصف الثاني عشر (أدبي)',
  ],
  
  // Feature flags
  FEATURES: {
    ENABLE_SOURCE_CITATIONS: true,
    ENABLE_MARKDOWN_RENDERING: true,
    ENABLE_ERROR_REPORTING: false,
  },
  
  // Performance configuration
  QUERY_TIMEOUT_MS: 30000,
  MAX_CHAT_HISTORY: 50,
} as const;

export default CONFIG;
