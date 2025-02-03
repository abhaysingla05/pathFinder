
import { AdvancedCache } from './cache';
// utils/errorBoundary.ts
export const handleCacheError = (error: any) => {
    console.warn('Cache operation failed:', error);
    // Continue execution without throwing
  };
  
  // Then use it in cache operations:
  try {
    await AdvancedCache.clearByTags(['some-tag']);
  } catch (error) {
    handleCacheError(error);
  }