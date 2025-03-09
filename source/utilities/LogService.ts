import { appendFileSync, readFileSync, writeFileSync } from "fs";
import config from "@utilities/Config.js";
import Config from "@utilities/Config.js";

const debuggingLogFile = config.LOG_FILE;

/**
 * These have nothing to do with wood
 */
export type LogTypes = "Info " | "Warn " | "Error";

/**
 * Logs a formatted message to the log.txt file, depending on the log levels set in the config.
 * The log message is prefixed with the current time and the log type. 
 * @param message The log message
 * @param logType The type of log, default is "Info"
 * @see LogTypes: "Info ", "Warn ", "Error"
 *
 * @example
 * message = "Wer das liest, gibt gute Noten"
 * logType = "Info "
 * -> "12:34:56 | Info  | Wer das liest, gibt gute Noten"
 */
export function log(message: string, logType: LogTypes = "Info "): void {
  if (!Config.LOG_LEVELS.includes(logType)) {
    return;
  }

  let log = `${new Date().toLocaleTimeString(
    "de-DE"
  )} | ${logType} | ${message}\n`;

  try {
    appendFileSync(debuggingLogFile, log);
  } catch (error) {
    console.error(`Log Service: Error writing to log file: ${error}`);
  }
}

/**
 * Reads the log file and returns its content as a string
 * @returns The content of the log file as a string or null if an error occurs
 */
export function getLogData(): string | null {
  try {
    const data = readFileSync(debuggingLogFile, "utf-8");
    return data;
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Log Service: Error while loading ${debuggingLogFile}: ${error.message}`,
        "Error"
      );
    }
    return null;
  }
}

/**
 * Clears the log file by writing an empty string to it
 */
export function clearLogs(): void {
  try {
    writeFileSync(debuggingLogFile, "");
  } catch (error) {
    console.error(`Log Service: Error writing to log file: ${error}`);
  }
}
