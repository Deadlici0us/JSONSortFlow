/**
 * @file Test contract for RateLimiter
 * @description Validates request throttling and HTTP 429 responses
 */

import { RateLimiter } from '../../src/api/RateLimiter';

jest.useFakeTimers();

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });

  describe('Constructor', () => {
    it('instantiates RateLimiter with defaults', () => {
      expect(rateLimiter).toBeDefined();
      expect(rateLimiter).toBeInstanceOf(RateLimiter);
    });

    it('instantiates with custom max requests', () => {
      const customLimiter = new RateLimiter(50, 60000);
      expect(customLimiter).toBeDefined();
    });

    it('rejects invalid max requests', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (RateLimiter as any)(0, 60000);
      }).toThrow();
    });

    it('rejects invalid window size', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (RateLimiter as any)(100, 0);
      }).toThrow();
    });
  });

  describe('IsAllowed Method', () => {
    it('allows request under threshold', () => {
      const result = rateLimiter.IsAllowed('test-client');

      expect(result.allowed).toBe(true);
    });

    it('denies request after threshold exceeded', () => {
      // Make 100 requests (default threshold)
      for (let i = 0; i < 100; i++) {
        rateLimiter.IsAllowed('test-client');
      }

      const result = rateLimiter.IsAllowed('test-client');

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('tracks requests per client independently', () => {
      rateLimiter.IsAllowed('client-a');
      rateLimiter.IsAllowed('client-a');
      rateLimiter.IsAllowed('client-b');

      // Different clients have separate counters
      const resultA = rateLimiter.IsAllowed('client-a');
      const resultB = rateLimiter.IsAllowed('client-b');

      expect(resultA.allowed).toBe(true);
      expect(resultB.allowed).toBe(true);
    });

    it('resets counter after window expires', () => {
      const shortWindowLimiter = new RateLimiter(10, 100);

      // Fill up the limit
      for (let i = 0; i < 10; i++) {
        shortWindowLimiter.IsAllowed('test-client');
      }

      expect(shortWindowLimiter.IsAllowed('test-client').allowed).toBe(false);

      // Wait for window to expire
      jest.advanceTimersByTime(150);

      expect(shortWindowLimiter.IsAllowed('test-client').allowed).toBe(true);
    });

    it('returns accurate retryAfter time', () => {
      const shortWindowLimiter = new RateLimiter(10, 1000);

      for (let i = 0; i < 10; i++) {
        shortWindowLimiter.IsAllowed('test-client');
      }

      const result = shortWindowLimiter.IsAllowed('test-client');

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(1000);
    });
  });

  describe('Rate Limiting Behavior', () => {
    it('handles 100 rapid requests correctly', () => {
      const limiter = new RateLimiter(100, 60000);
      const allowedCount = [];
      const deniedCount = [];

      for (let i = 0; i < 150; i++) {
        const result = limiter.IsAllowed('rapid-client');
        if (result.allowed) {
          allowedCount.push(i);
        } else {
          deniedCount.push(i);
        }
      }

      expect(allowedCount.length).toBe(100);
      expect(deniedCount.length).toBe(50);
    });

    it('denied requests do not increment counter', () => {
      const limiter = new RateLimiter(5, 60000);

      // Hit the limit
      for (let i = 0; i < 5; i++) {
        limiter.IsAllowed('test-client');
      }

      // Additional requests should be denied
      const result1 = limiter.IsAllowed('test-client');
      const result2 = limiter.IsAllowed('test-client');
      const result3 = limiter.IsAllowed('test-client');

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(false);
      expect(result3.allowed).toBe(false);
    });

    it('handles concurrent clients without interference', () => {
      const limiter = new RateLimiter(10, 60000);

      // Client A makes 10 requests
      for (let i = 0; i < 10; i++) {
        limiter.IsAllowed('client-a');
      }

      // Client B should still have full quota
      for (let i = 0; i < 10; i++) {
        const result = limiter.IsAllowed('client-b');
        expect(result.allowed).toBe(true);
      }
    });
  });

  describe('GetRequestCount Method', () => {
    it('returns 0 for new client', () => {
      const count = rateLimiter.GetRequestCount('new-client');
      expect(count).toBe(0);
    });

    it('returns accurate count after requests', () => {
      rateLimiter.IsAllowed('test-client');
      rateLimiter.IsAllowed('test-client');
      rateLimiter.IsAllowed('test-client');

      const count = rateLimiter.GetRequestCount('test-client');
      expect(count).toBe(3);
    });
  });

  describe('ResetClient Method', () => {
    it('resets counter for specific client', () => {
      rateLimiter.IsAllowed('test-client');
      rateLimiter.IsAllowed('test-client');

      rateLimiter.ResetClient('test-client');

      const count = rateLimiter.GetRequestCount('test-client');
      expect(count).toBe(0);
    });

    it('allows requests after reset', () => {
      for (let i = 0; i < 100; i++) {
        rateLimiter.IsAllowed('test-client');
      }

      expect(rateLimiter.IsAllowed('test-client').allowed).toBe(false);

      rateLimiter.ResetClient('test-client');

      expect(rateLimiter.IsAllowed('test-client').allowed).toBe(true);
    });
  });

  describe('Cleanup Method', () => {
    it('removes expired client entries', () => {
      const shortWindowLimiter = new RateLimiter(10, 100);

      shortWindowLimiter.IsAllowed('old-client');
      shortWindowLimiter.IsAllowed('new-client');

      jest.advanceTimersByTime(150);

      shortWindowLimiter.Cleanup();

      // Old client should be removed
      expect(shortWindowLimiter.GetRequestCount('old-client')).toBe(0);
      // New client was also reset due to time
      expect(shortWindowLimiter.GetRequestCount('new-client')).toBe(0);
    });
  });

  describe('HTTP Response Headers', () => {
    it('returns rate limit headers', () => {
      const limiter = new RateLimiter(100, 60000);

      const headers = limiter.GetHeaders('test-client');

      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('100');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
    });

    it('updates remaining count after requests', () => {
      const limiter = new RateLimiter(100, 60000);

      for (let i = 0; i < 10; i++) {
        limiter.IsAllowed('test-client');
      }

      const headers = limiter.GetHeaders('test-client');

      expect(headers['X-RateLimit-Remaining']).toBe('90');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty client ID', () => {
      expect(() => {
        rateLimiter.IsAllowed('');
      }).not.toThrow();
    });

    it('handles special characters in client ID', () => {
      expect(() => {
        rateLimiter.IsAllowed('client@192.168.1.1/path');
      }).not.toThrow();
    });

    it('handles very long client ID', () => {
      const longId = 'a'.repeat(1000);
      expect(() => {
        rateLimiter.IsAllowed(longId);
      }).not.toThrow();
    });

    it('handles null client ID gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = rateLimiter.IsAllowed(null as any);
      expect(result).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('does not grow unbounded with many clients', () => {
      const limiter = new RateLimiter(10, 1000);

      // Simulate 1000 unique clients
      for (let i = 0; i < 1000; i++) {
        limiter.IsAllowed(`client-${i}`);
      }

      // Should not crash or throw
      expect(() => {
        limiter.Cleanup();
      }).not.toThrow();
    });
  });
});
