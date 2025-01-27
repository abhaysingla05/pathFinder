// lib/utils/cache.ts
interface CacheItem<T> {
    value: T;
    timestamp: number;
  }
  
  export class Cache {
    private static EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours
  
    static set(key: string, value: any) {
      const item: CacheItem<any> = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(item));
    }
  
    static get<T>(key: string): T | null {
      const item = localStorage.getItem(key);
      if (!item) return null;
  
      const { value, timestamp }: CacheItem<T> = JSON.parse(item);
      if (Date.now() - timestamp > this.EXPIRY_TIME) {
        localStorage.removeItem(key);
        return null;
      }
  
      return value;
    }
  }