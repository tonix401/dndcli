import Config from "@utilities/Config.js";
import path from "path";
import fs from "fs";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import { getTerm } from "@utilities/LanguageService.js";
import { playAnimation } from "@utilities/ConsoleService.js";
import { getErrorMessage } from "@resources/generalScreens/errorMessage.js";
import { log } from "@utilities/LogService.js";

export async function testAnimations() {
  const dir = path.join(Config.RESOURCES_DIR, "animations");

  function getFilesInDir(dir: string) {
    return fs.readdirSync(dir).filter((file) => {
      return fs.statSync(path.join(dir, file)).isFile();
    });
  }

  const files = getFilesInDir(dir);

  while (true) {
    const aniChoice = await themedSelectInRoom({
      message: getTerm("Animations"),
      choices: [
        ...files.map((file: string) => {
          return { name: file.replace(".json", ""), value: file };
        }),
        { name: getTerm("all"), value: "all" },
        { name: getTerm("goBack"), value: "goBack" },
      ],
    });

    try {
      if (aniChoice === "goBack") {
        return;
      } else if (aniChoice === "all") {
        for (const file of files) {
          await playAnimation(file);
        }
      } else {
        await playAnimation(aniChoice);
      }
    } catch (error) {
      log("TestAnimations: Error playing animation: " + error);
      console.log(getErrorMessage("Error playing animation: " + error));
    }
  }
}
