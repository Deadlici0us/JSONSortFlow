import * as fs from "fs";
import { Logger } from "./ILogger";

export class FileLogger implements Logger {
  constructor(private FilePath: string) {
    const directory = FilePath.substring(0, FilePath.lastIndexOf("/"));
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  public async log(message: string): Promise<void> {
    try {
      await fs.promises.appendFile(this.FilePath, message + "\n\r");
    } catch (err) {
      console.log("Failed to write log entry to file.");
    }
  }
}
