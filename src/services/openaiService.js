// src/services/openaiService.js
// This file is now just a placeholder to maintain compatibility
// The OpenAI usage tracking is now handled on the server

export const usageTracker = {
  trackUsage: () => {
    // Usage tracking is now handled on the server
    console.log('Usage tracking handled on server')
  }
};

export const NUTRITION_DATABASE = {
  // ... existing entries ...
  'beef': { calories: 250, protein: 26, per: '100g' },
  'fish': { calories: 120, protein: 20, per: '100g' },
  'vegetables': { calories: 50, protein: 3, per: '100g' },
  // Add more common foods
}