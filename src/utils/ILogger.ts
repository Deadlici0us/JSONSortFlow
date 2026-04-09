/**
 * Logger interface for structured logging.
 * Provides methods for different log levels with optional metadata.
 */
export interface ILogger {
    /** Log an informational message */
    info(message: string, meta?: unknown): void;
    
    /** Log a warning message */
    warn(message: string, meta?: unknown): void;
    
    /** Log an error message */
    error(message: string, meta?: unknown): void;
    
    /** Log a debug message */
    debug(message: string, meta?: unknown): void;
}
