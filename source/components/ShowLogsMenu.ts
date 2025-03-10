import {
  pressEnter,
  primaryColor,
  secondaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { clearLogs, getLogData, log } from "@utilities/LogService.js";
import { themedSelectInRoom } from "./ThemedSelectInRoom.js";

export async function showLogsMenu() {
  const logMenuChoices = [
    {
      name: getTerm("showLogs"),
      value: "showLogs",
    },
    {
      name: getTerm("clearLogs"),
      value: "clearLogs",
    },
    {
      name: getTerm("goBack"),
      value: "goBack",
    },
  ];

  while (true) {
    totalClear();
    const choice = await themedSelectInRoom({
      canGoBack: true,
      message: getTerm("logsMenu"),
      choices: logMenuChoices,
    });

    switch (choice) {
      case "showLogs":
        await showLogsScreen();
        break;
      case "clearLogs":
        await clearLogsScreen();
        break;
      case "goBack":
        return;
    }
  }
}

async function showLogsScreen() {
  totalClear();
  const logData = getLogData();

  const oneHourAgo = new Date(Date.now() - 3600000);

  if (!logData) {
    // results in a no logs message
    logFormattedLogs();
    await pressEnter();
    return;
  }

  const filteredLogs = logData
    .split("\n")
    .filter((line) => {
      const match = line.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (!match) return false;
      const [hours, minutes, seconds] = match.slice(1).map(Number);
      const logDate = new Date();
      logDate.setHours(hours, minutes, seconds, 0);
      return logDate >= oneHourAgo;
    })
    .join("\n");

  logFormattedLogs(filteredLogs);
  log("Log Menu: Showing logs of last hour");
  await pressEnter();
}

function logFormattedLogs(logs?: string) {
  console.log(
    primaryColor(`################## ${getTerm("showLogs")} ##################`)
  );
  console.log(secondaryColor(logs || getTerm("noLogs")));
  console.log(
    primaryColor(
      `##################${"#".repeat(
        getTerm("showLogs").length + 2
      )}##################`
    )
  );
}

async function clearLogsScreen() {
  log("Log Menu: Cleared logs");
  clearLogs();
  console.log(primaryColor(getTerm("logsCleared", true)));
  await pressEnter();
}
