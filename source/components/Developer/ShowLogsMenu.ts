import {
  pressEnter,
  primaryColor,
  secondaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { clearLogs, getLogData, log } from "@utilities/LogService.js";
import { themedSelectInRoom } from "../General/ThemedSelectInRoom.js";

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

  if (!logData) {
    // results in a no logs message
    logFormattedLogs();
    await pressEnter();
    return;
  }

  const logLines = logData.split("\n");
  const filteredLogs = logLines
    .filter((_log: string, index: number) => index >= logLines.length - 51)
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
