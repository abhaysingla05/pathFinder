import { handleCacheError } from "./errorBoundary";
// lib/utils/cache.ts
export interface CacheOptions {
  expiryTime?: number;
  version?: string;
  tags?: string[];
}

export interface CacheItem<T> {
  value: T;
  timestamp: number;
  version: string;
  tags: string[];
}

// Export the CacheStats interface
export interface CacheStats {
  totalItems: number;
  totalSize: number;
  oldestItem: number;
  newestItem: number;
  itemsByTag: Record<string, number>;
  averageItemSize: number;
}

export class AdvancedCache {
  private static readonly DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly VERSION = '1.0.0';
  
private static cache: Map<string, CacheItem<any>> = new Map();

  static async clearByTags(tags: string[]): Promise<void> {
    try {
      if (!tags || !Array.isArray(tags)) {
        console.warn('Invalid tags provided to clearByTags');
        return;
      }

      const keys = Object.keys(localStorage);
      for (const key of keys) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.tags && Array.isArray(parsed.tags) && 
                tags.some(tag => parsed.tags.includes(tag))) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          handleCacheError(error);
        }
      }
    } catch (error) {
      handleCacheError(error);
    }
  }

  static async set<T>(
    key: string, 
    value: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const item: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        version: options.version || this.VERSION,
        tags: options.tags || []
      };

      const serialized = JSON.stringify(item);
      const size = new Blob([serialized]).size;

      // Check if we have enough storage space
      if (size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Cache item too large');
      }

      await this.ensureStorageSpace(size);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Cache set error:', error);
      // Attempt to clear some space and retry
      await this.clearOldest();
      try {
        localStorage.setItem(key, JSON.stringify({
          value,
          timestamp: Date.now(),
          version: options.version || this.VERSION,
          tags: options.tags || []
        }));
      } catch (retryError) {
        console.error('Cache retry failed:', retryError);
      }
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, timestamp, version, tags }: CacheItem<T> = JSON.parse(item);

      // Version check
      if (version !== this.VERSION) {
        localStorage.removeItem(key);
        return null;
      }

      // Expiry check
      if (Date.now() - timestamp > this.DEFAULT_EXPIRY) {
        localStorage.removeItem(key);
        return null;
      }

      return value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  

  private static async ensureStorageSpace(requiredBytes: number): Promise<void> {
    while (this.getStorageUsed() + requiredBytes > this.getStorageLimit()) {
      await this.clearOldest();
    }
  }

  private static getStorageUsed(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += new Blob([localStorage[key]]).size;
      }
    }
    return total;
  }

  private static getStorageLimit(): number {
    return 5 * 1024 * 1024; // 5MB
  }

  private static async clearOldest(): Promise<void> {
    const items: { key: string; timestamp: number }[] = [];
    
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const item = JSON.parse(localStorage[key]);
          if (item.timestamp) {
            items.push({ key, timestamp: item.timestamp });
          }
        } catch (error) {
          // Skip non-JSON items
        }
      }
    }

    if (items.length > 0) {
      items.sort((a, b) => a.timestamp - b.timestamp);
      localStorage.removeItem(items[0].key);
    }
  }

  static async clear(): Promise<void> {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error clearing cache for key ${key}:`, error);
      }
    }
  }

  static getStats(): CacheStats {
    const stats: CacheStats = {
      totalItems: 0,
      totalSize: 0,
      oldestItem: Date.now(),
      newestItem: 0,
      itemsByTag: {},
      averageItemSize: 0
    };

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const item = JSON.parse(localStorage[key]);
          stats.totalItems++;
          const size = new Blob([localStorage[key]]).size;
          stats.totalSize += size;
          
          if (item.timestamp) {
            stats.oldestItem = Math.min(stats.oldestItem, item.timestamp);
            stats.newestItem = Math.max(stats.newestItem, item.timestamp);
          }

          if (item.tags) {
            item.tags.forEach((tag: string) => {
              stats.itemsByTag[tag] = (stats.itemsByTag[tag] || 0) + 1;
            });
          }
        } catch (error) {
          // Skip non-JSON items
        }
      }
    }

    stats.averageItemSize = stats.totalItems ? stats.totalSize / stats.totalItems : 0;
    return stats;
  }
}