import * as fs from 'fs';
import { ILogger } from './ILogger';
import { formatStructuredLog } from './logHelpers';

/**
 * File logger that outputs structured JSON to a file.
 * Creates the directory if it doesn't exist.
 */
export class FileLogger implements ILogger {
    private readonly filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        const directory = filePath.substring(0, filePath.lastIndexOf('/'));
        if (directory && !fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
    }

    private async writeToFile(level: string, message: string, meta?: unknown): Promise<void> {
        const logLine = formatStructuredLog(level, message, meta) + '\n';
        try {
            await fs.promises.appendFile(this.filePath, logLine);
        } catch {
            console.log('Failed to write log entry to file.');
        }
    }

    public async info(message: string, meta?: unknown): Promise<void> {
        await this.writeToFile('info', message, meta);
    }

    public async warn(message: string, meta?: unknown): Promise<void> {
        await this.writeToFile('warn', message, meta);
    }

    public async error(message: string, meta?: unknown): Promise<void> {
        await this.writeToFile('error', message, meta);
    }

    public async debug(message: string, meta?: unknown): Promise<void> {
        await this.writeToFile('debug', message, meta);
    }
}
