import { boxItUp, getTextInRoomAsciiIfNotTooLong, themedInput } from "@utilities/ConsoleService.js";
import dotenv from "dotenv";
import ora from "ora";
import fetch from "node-fetch";
import { log } from "@utilities/LogService.js";

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

  console.log(getTextInRoomAsciiIfNotTooLong(boxItUp(responseText)));
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
  const spinner = ora('Fetching players...').start();
  
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
    spinner.succeed('Players fetched successfully!');
    
    (data as Player[]).forEach(player => {
      console.log(`${player.id} - ${player.name}`);
    });
    
  } catch (error) {
    // Stop the spinner with error
    spinner.fail('Failed to access API');
    console.log("Kein Zugriff auf die API möglich");
    log(error as string);
  }