import { appendFileSync, readFileSync, writeFileSync } from "fs";
import config from "@utilities/Config.js";
import Config from "@utilities/Config.js";

const debuggingLogFile = config.LOG_FILE;

/**
 * These have nothing to do with wood
 * @options INFO, WARNING, ERROR
 */
export type LogTypes = "Info " | "Warn " | "Error";

/**
 * Logs a formatted message to the log.txt file
 * @param message The log message
 * @param logType The type of log, default is "Info"
 * @see LogTypes: INFO, WARNING, ERROR
 *
 * @example
 * message = "Wer das liest, gibt gute Noten"
 * logType = "Info "
 * -> "12:34:56 | Info  | Wer das liest, gibt gute Noten"
 */
export function log(message: string, logType: LogTypes = "Info "): void {
  if (!Config.LOG_LEVELS.includes(logType)) {
    console.log("falscher log type: " + logType);
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

export function clearLogs(): void {
  try {
    writeFileSync(debuggingLogFile, "");
  } catch (error) {
    console.error(`Log Service: Error writing to log file: ${error}`);
  }
}
