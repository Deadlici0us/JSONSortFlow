/**
 * @file Structured JSON Logger
 * @description Provides structured JSON logging to stdout/stderr
 */

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  payload?: unknown;
}

/**
 * Structured JSON Logger for production telemetry.
 *
 * Logs messages as JSON to stdout (info, warn, debug) or stderr (error).
 * Handles circular references safely and maintains consistent format.
 */
export class Logger {
  /**
   * Creates a new Logger instance.
   */
  constructor() {
    // No initialization required
  }

  /**
   * Logs a message with the specified level.
   *
   * @param level - Log level (info, warn, error, debug)
   * @param message - Message to log
   * @param payload - Optional payload object
   */
  public Log(level: string, message: string, payload?: unknown): void {
    if (level === null || level === undefined || level === '') {
      throw new Error('Log level cannot be null, undefined, or empty');
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level,
      message: message,
    };

    // Only include payload if provided
    if (payload !== undefined && payload !== null) {
      entry.payload = payload;
    }

    // Serialize to JSON, handling circular references
    const jsonString = this.SafeStringify(entry);

    // Route to appropriate stream based on level
    if (level === 'error') {
      process.stderr.write(jsonString + '\n');
    } else {
      process.stdout.write(jsonString + '\n');
    }
  }

  /**
   * Safely stringifies an object, handling circular references.
   *
   * @param obj - Object to stringify
   * @returns JSON string representation
   */
  private SafeStringify(obj: unknown): string {
    try {
      return JSON.stringify(obj, this.getCircularReplacer(), 2);
    } catch {
      // Fallback for unstringifiable objects
      return JSON.stringify({ error: 'Failed to serialize log entry' });
    }
  }

  /**
   * Creates a replacer function to handle circular references.
   *
   * @returns Replacer function for JSON.stringify
   */
  private getCircularReplacer(): (key: string, value: unknown) => unknown {
    const seen = new WeakSet();

    return (key: string, value: unknown): unknown => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    };
  }

  /**
   * Convenience method for info level logging.
   *
   * @param message - Message to log
   * @param payload - Optional payload object
   */
  public Info(message: string, payload?: unknown): void {
    this.Log('info', message, payload);
  }

  /**
   * Convenience method for warn level logging.
   *
   * @param message - Message to log
   * @param payload - Optional payload object
   */
  public Warn(message: string, payload?: unknown): void {
    this.Log('warn', message, payload);
  }

  /**
   * Convenience method for error level logging.
   *
   * @param message - Message to log
   * @param payload - Optional payload object
   */
  public Error(message: string, payload?: unknown): void {
    this.Log('error', message, payload);
  }

  /**
   * Convenience method for debug level logging.
   *
   * @param message - Message to log
   * @param payload - Optional payload object
   */
  public Debug(message: string, payload?: unknown): void {
    this.Log('debug', message, payload);
  }
}
