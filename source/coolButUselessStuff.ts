import { boxItUp, getTextInRoomAsciiIfNotTooLong, themedInput } from "@utilities/ConsoleService.js";

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
