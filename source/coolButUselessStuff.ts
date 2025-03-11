import { boxItUp, getTextOnBackground } from "@utilities/ConsoleService.js";
import dotenv from "dotenv";
import ora from "ora";
import fetch from "node-fetch";
import { log } from "@utilities/LogService.js";
import { themedInput } from "@utilities/MenuService.js";
import fs from "fs-extra";

try {
  const text = (await themedInput({ message: "Text eingeben: " })).trim();

  const response = await fetch(
    `https://asciified.thelicato.io/api/v2/ascii?font=big&text=${text}`
  );
  let responseText = await response.text();

  responseText = responseText
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");

  console.log(getTextOnBackground(boxItUp(responseText)));
} catch (error) {
  if (error instanceof Error) console.log(boxItUp(error.message));
}

////////////////////////////

type Player = {
  id: string;
  name: string;
  score: number;
  createdAt: string;
};

const url = "https://v0-node-js-game-scores-iccepjuvv.vercel.app/api/players";
dotenv.config();
const cookie = process.env.VERCEL_COOKIE;
if (cookie === undefined) {
  throw new Error("Missing VERCEL_COOKIE in environment variables");
}

// Start the loading spinner
const spinner = ora("Fetching players...").start();

try {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Cookie: cookie,
      "Content-Type": "text/json",
      "User-Agent": "Node.js",
      Accept: "text/json",
    },
  });

  const data = await response.json();

  // Stop the spinner
  spinner.succeed("Players fetched successfully!");

  (data as Player[]).forEach((player) => {
    console.log(`${player.id} - ${player.name}`);
  });
} catch (error) {
  // Stop the spinner with error
  spinner.fail("Failed to access API");
  console.log("Kein Zugriff auf die API möglich");
  log(error as string);
}

////////////////////////////////////////

/**
 * A function that generates a room visual, with hallways in the given directions
 * @param right Whether there is a hallway to the right
 * @param bottom Whether there is a hallway to the bottom
 * @param left Whether there is a hallway to the left
 * @param top Whether there is a hallway to the top
 * @param character The character that will be in the middle of the room, please think about character width for alignment reasons
 * @returns The string representing a room
 * @example
 * ######### ║   ║ #########
 * ### ╔═════╝   ╚═════╗ ###
 * ### ║               ║ ###
 * ════╝               ╚════
 *             ╬
 * ════╗               ╔════
 * ### ║               ║ ###
 * ### ╚═══════════════╝ ###
 * #########################
 */
export function getRoomVisual(
  right: boolean,
  bottom: boolean,
  left: boolean,
  top: boolean,
  character: string = "@"
) {
  const topHallway =
    "######### ║   ║ #########\n### ╔═════╝   ╚═════╗ ###\n### ║               ║ ###\n";
  const topWall =
    "#########################\n### ╔═══════════════╗ ###\n### ║               ║ ###\n";

  // underscores in the constant names to align the strings, to check for errors (and because it looks nicer)
  const LeftRightHallway = `════╝               ╚════\n            ${character}             \n════╗               ╔════\n### ║               ║ ###\n`;
  const RightHallway____ = `### ║               ╚════\n### ║       ${character}             \n### ║               ╔════\n### ║               ║ ###\n`;
  const LeftHallway_____ = `════╝               ║ ###\n            ${character}        ║ ###\n════╗               ║ ###\n### ║               ║ ###\n`;
  const LeftRightWall___ = `### ║               ║ ###\n### ║       ${character}        ║ ###\n### ║               ║ ###\n### ║               ║ ###\n`;

  const bottomHallway = "### ╚═════╗   ╔═════╝ ###\n######### ║   ║ #########";
  const bottomWallxxx = "### ╚═══════════════╝ ###\n#########################";

  const roomTop = top ? topHallway : topWall;
  const roomBottom = bottom ? bottomHallway : bottomWallxxx;
  let roomCenter;

  if (left && right) {
    roomCenter = LeftRightHallway;
  } else if (left && !right) {
    roomCenter = LeftHallway_____;
  } else if (!left && right) {
    roomCenter = RightHallway____;
  } else {
    roomCenter = LeftRightWall___;
  }

  const room = roomTop + roomCenter + roomBottom;
  return room;
}

const bomb: string[][] = fs.readJsonSync(
  "./source/resources/animations/smallBomb.json"
).frames;

bomb.map((frame: string[]) => {
  const width = frame[0].length;
  frame.unshift("*".repeat(width));
  frame.push("*".repeat(width));
});

console.log(bomb);

fs.writeJsonSync("./source/resources/animations/smallBomb.json", {
  totalFrames: bomb.length,
  frameTime: 100,
  frameHeight: bomb[0].length,
  framewidth: bomb[0][0].length,
  frames: bomb,
});