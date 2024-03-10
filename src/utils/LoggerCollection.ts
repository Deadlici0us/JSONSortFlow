import { Logger } from "./ILogger";

export class LoggerCollection implements Logger {
  private loggers: Logger[];

  constructor(loggers: Logger[]) {
    this.loggers = loggers;
  }
  log(message: string): void {
    this.loggers.forEach((logger) => {
      logger.log(message);
    });
  }
}
