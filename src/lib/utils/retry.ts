// lib/utils/retry.ts
export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoff: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error;
  let delay = options.delayMs;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === options.maxAttempts) break;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= options.backoff;
    }
  }

  throw lastError!;
}