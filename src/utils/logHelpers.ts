/**
 * @file Logging utilities for structured JSON logging
 * @description Provides helpers for safe JSON serialization and structured log formatting
 */

/**
 * Creates a replacer function to handle circular references during JSON serialization.
 *
 * @returns A replacer function for use with JSON.stringify
 */
export const getCircularReplacer = (): ((key: string, value: unknown) => unknown) => {
    const seen = new WeakSet<object>();
    
    return (key: string, value: unknown): unknown => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]';
            }
            seen.add(value);
        }
        return value;
    };
};

/**
 * Formats a log entry as structured JSON.
 *
 * @param level - The log level (info, warn, error, debug)
 * @param message - The log message
 * @param meta - Optional metadata to include
 * @returns A JSON string representing the structured log entry
 */
export const formatStructuredLog = (
    level: string,
    message: string,
    meta?: unknown
): string => {
    const payload: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        level,
        message,
    };
    
    // Only include meta if provided
    if (meta !== undefined && meta !== null) {
        payload.meta = meta;
    }
    
    // Safely convert to JSON handling any circular references in 'meta'
    return JSON.stringify(payload, getCircularReplacer());
};
