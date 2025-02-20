import { appendFileSync, readFileSync, writeFileSync } from "fs";
import config from "../utilities/Config.js";

const debuggingLogFile = config.LOG_FILE;

/**
 * These have nothing to do with wood
 * @options INFO, WARNING, ERROR
 */
export enum LogTypes {
  INFO = "Info ",
  ERROR = "Error",
  WARNING = "Warn ",
}

/**
 * Logs a formatted message to the log.txt file
 * @param message The log message
 * @param logType The type of log, default is "Info"
 * @see LogTypes: INFO, WARNING, ERROR
 *
 * @example
 * message = "Wer das liest, gibt gute Noten"
 * logType = LogTypes.INFO
 * -> "12:34:56 | Info  | Wer das liest, gibt gute Noten"
 */
export function log(message: string, logType = LogTypes.INFO): void {
  let log = `${new Date().toLocaleTimeString()} | ${logType} | ${message}\n`;

  try {
    appendFileSync(debuggingLogFile, log);
  } catch (error) {
    console.error(`Log Service: Error writing to log file: ${error}`);
  }
}

export function getLogData(): string | null {
  try {
    const data = readFileSync(debuggingLogFile, "utf-8");
    return data;
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Log Service: Error while loading ${debuggingLogFile}: ${error.message}`,
        LogTypes.ERROR
      );
    }
    return null;
  }
}

export function clearLogs(): void {
  try {
    writeFileSync(debuggingLogFile, "");
  } catch (error) {
    console.error(`Log Service: Error writing to log file: ${error}`);
  }
}