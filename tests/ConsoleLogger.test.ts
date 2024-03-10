import { ConsoleLogger } from "../src/utils/ConsoleLogger";

describe("ConsoleLogger class (Unit Test)", () => {
  it("should log messages to the console", () => {
    const spyConsoleLog = jest.spyOn(console, "log");
    const consoleLogger = new ConsoleLogger();

    consoleLogger.log("Test Message");

    expect(spyConsoleLog).toHaveBeenCalledWith("Test Message");
    spyConsoleLog.mockRestore(); // Restore the original console.log function
  });
});
