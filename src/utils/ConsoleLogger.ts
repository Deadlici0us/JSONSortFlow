import { ILogger } from './ILogger';
import { formatStructuredLog } from './logHelpers';

/**
 * Console logger that outputs structured JSON to stdout/stderr.
 * Routes error logs to stderr, all other levels to stdout.
 */
export class ConsoleLogger implements ILogger {
    public info(message: string, meta?: unknown): void {
        process.stdout.write(formatStructuredLog('info', message, meta) + '\n');
    }

    public warn(message: string, meta?: unknown): void {
        process.stdout.write(formatStructuredLog('warn', message, meta) + '\n');
    }

    public debug(message: string, meta?: unknown): void {
        process.stdout.write(formatStructuredLog('debug', message, meta) + '\n');
    }

    public error(message: string, meta?: unknown): void {
        // Errors must go to stderr for proper production telemetry
        process.stderr.write(formatStructuredLog('error', message, meta) + '\n');
    }
}
