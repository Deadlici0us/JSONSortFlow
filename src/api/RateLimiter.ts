/**
 * @file RateLimiter for API request throttling
 * @description Enforces request limits per client with sliding window
 */

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
}

interface ClientEntry {
  count: number;
  windowStart: number;
}

/**
 * RateLimiter enforces request limits per client using sliding window algorithm.
 *
 * Prevents abuse by limiting requests per time window and returns
 * HTTP 429 Too Many Requests when threshold is exceeded.
 */
export class RateLimiter {
  private maxRequests: number;
  private windowMs: number;
  private clients: Map<string, ClientEntry>;

  /**
   * Creates a new RateLimiter instance.
   *
   * @param maxRequests - Maximum requests per window (default: 100)
   * @param windowMs - Time window in milliseconds (default: 60000)
   */
  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = this.ValidateMaxRequests(maxRequests);
    this.windowMs = this.ValidateWindowMs(windowMs);
    this.clients = new Map();
  }

  /**
   * Validates max requests configuration.
   *
   * @param maxRequests - Value to validate
   * @returns Validated max requests
   * @throws Error if value is invalid
   */
  private ValidateMaxRequests(maxRequests: number): number {
    if (maxRequests <= 0 || !Number.isInteger(maxRequests)) {
      throw new Error('maxRequests must be a positive integer');
    }
    return maxRequests;
  }

  /**
   * Validates window size configuration.
   *
   * @param windowMs - Window size to validate
   * @returns Validated window size
   * @throws Error if value is invalid
   */
  private ValidateWindowMs(windowMs: number): number {
    if (windowMs <= 0 || !Number.isInteger(windowMs)) {
      throw new Error('windowMs must be a positive integer');
    }
    return windowMs;
  }

  /**
   * Checks if a request is allowed for the given client.
   *
   * @param clientId - Unique client identifier
   * @returns Rate limit result with allowed status
   */
  public IsAllowed(clientId: string): RateLimitResult {
    const normalizedId = this.NormalizeClientId(clientId);
    const now = Date.now();

    const entry = this.GetOrCreateClientEntry(normalizedId, now);

    // Check if window has expired
    if (now - entry.windowStart > this.windowMs) {
      entry.count = 0;
      entry.windowStart = now;
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      const retryAfter = Math.ceil(
        (entry.windowStart + this.windowMs - now) / 1000
      );
      return { allowed: false, retryAfter };
    }

    // Increment counter and allow
    entry.count++;
    return { allowed: true };
  }

  /**
   * Normalizes client ID for consistent tracking.
   *
   * @param clientId - Raw client ID
   * @returns Normalized client ID
   */
  private NormalizeClientId(clientId: string | null | undefined): string {
    if (!clientId || clientId === null || clientId === undefined) {
      return 'anonymous';
    }
    return String(clientId);
  }

  /**
   * Gets or creates a client entry in the tracking map.
   *
   * @param clientId - Client identifier
   * @param now - Current timestamp
   * @returns Client entry
   */
  private GetOrCreateClientEntry(
    clientId: string,
    now: number
  ): ClientEntry {
    const existing = this.clients.get(clientId);
    if (existing) {
      return existing;
    }

    const entry: ClientEntry = {
      count: 0,
      windowStart: now,
    };

    this.clients.set(clientId, entry);
    return entry;
  }

  /**
   * Gets the current request count for a client.
   *
   * @param clientId - Client identifier
   * @returns Current request count
   */
  public GetRequestCount(clientId: string): number {
    const normalizedId = this.NormalizeClientId(clientId);
    const entry = this.clients.get(normalizedId);

    if (!entry) {
      return 0;
    }

    // Check if window expired
    if (Date.now() - entry.windowStart > this.windowMs) {
      return 0;
    }

    return entry.count;
  }

  /**
   * Resets the rate limit counter for a specific client.
   *
   * @param clientId - Client identifier to reset
   */
  public ResetClient(clientId: string): void {
    const normalizedId = this.NormalizeClientId(clientId);
    this.clients.delete(normalizedId);
  }

  /**
   * Removes expired client entries from memory.
   */
  public Cleanup(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    this.clients.forEach((entry, clientId) => {
      if (now - entry.windowStart > this.windowMs) {
        entriesToDelete.push(clientId);
      }
    });

    entriesToDelete.forEach((id) => this.clients.delete(id));
  }

  /**
   * Gets rate limit headers for HTTP response.
   *
   * @param clientId - Client identifier
   * @returns HTTP rate limit headers
   */
  public GetHeaders(clientId: string): RateLimitHeaders {
    const count = this.GetRequestCount(clientId);
    const remaining = Math.max(0, this.maxRequests - count);
    const reset = Math.ceil((Date.now() + this.windowMs) / 1000);

    return {
      'X-RateLimit-Limit': String(this.maxRequests),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(reset),
    };
  }
}
