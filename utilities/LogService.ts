import { appendFileSync } from "fs";
import LogTypes from "../types/LogTypes.js";

const debuggingLogFile = "./data/log.txt";

export function log(message: string, logType = LogTypes.INFO) {
  let log = `${new Date().toLocaleTimeString()} | ${logType} | ${message}\n`;

  try {
    appendFileSync(debuggingLogFile, log);
  } catch (error) {
    console.error(`Error writing to log file: ${error}`);
  }
}
