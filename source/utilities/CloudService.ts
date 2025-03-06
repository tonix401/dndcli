import { IApiPlayer } from "@utilities/IApiPlayer.js";
import dotenv from "dotenv";
dotenv.config();
const url = "http://v0-node-js-game-scores-ov976pprn.vercel.app/api/players/";
const cookie = process.env.VERCEL_COOKIE;

export async function loadPlayerData(id: string) {
  if (cookie === undefined) {
    throw new Error("Missing VERCEL_COOKIE in environment variables");
  }

  try {
    const response = await fetch(url + id, {
      method: "GET",
      headers: {
        Cookie: cookie,
        "Content-Type": "text/json",
        "User-Agent": "Node.js",
        Accept: "text/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching player data:", error);
  }
}

export async function savePlayerData(player: IApiPlayer) {
  if(cookie === undefined) {
    throw new Error("Missing VERCEL_COOKIE in environment variables");
  }

  try {
    const response = await fetch(url + player.id, {
      method: "PUT",
      headers: {
        Cookie: cookie,
        "Content-Type": "text/json",
        "User-Agent": "Node.js",
        Accept: "text/json",
      },
      body: JSON.stringify(player),
    });

    console.log(response);
  } catch (error) {
    console.error("Error saving player data:", error);
  }
}