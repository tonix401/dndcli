import { appendFileSync } from "fs";
import logTypes from "../types/logTypes.js";

const debuggingLogFile = "./data/log.txt";

class LogService {
  static
  log(message, logType = logTypes.INFO) {
    let log = `${new Date().toLocaleTimeString()} | ${logType} | ${message}\n`;

    appendFileSync(debuggingLogFile, log, (err) => {
      if (err) {
        console.error(`Error writing to log file: ${err}`);
      }
    });
  }
}

export default LogService;