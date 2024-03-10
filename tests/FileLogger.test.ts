import { FileLogger } from "../src/utils/FileLogger";
import * as fs from "fs";

// Mock the fs module
jest.mock("fs", () => {
  const originalModule = jest.requireActual("fs");

  return {
    ...originalModule,
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
      ...originalModule.promises,
      appendFile: jest.fn().mockResolvedValue(undefined),
    },
  };
});

describe("FileLogger class (Unit Test)", () => {
  const filePath = "/path/to/logs/test_log.txt";

  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  it("should create directory if it does not exist", () => {
    (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
    new FileLogger(filePath);
    expect(fs.mkdirSync).toHaveBeenCalledWith("/path/to/logs", {
      recursive: true,
    });
  });

  it("should log messages to the file", async () => {
    const fileLogger = new FileLogger(filePath);
    await fileLogger.log("Test Message");
    expect(fs.promises.appendFile).toHaveBeenCalledWith(
      filePath,
      "Test Message\n\r"
    );
  });

  it("should handle log write failure", async () => {
    (fs.promises.appendFile as jest.Mock).mockRejectedValueOnce(
      new Error("Write Error")
    );
    const fileLogger = new FileLogger(filePath);
    await fileLogger.log("Test Message");
    expect(fs.promises.appendFile).toHaveBeenCalledWith(
      filePath,
      "Test Message\n\r"
    );
  });
});
