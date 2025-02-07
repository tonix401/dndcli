import { appendFileSync } from "fs";

const debuggingLogFile = "./storage/log.txt";

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

