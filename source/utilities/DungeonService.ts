
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

  // Xs in the variable names to align the strings, to check for errors (and because it looks nicer)
  const LeftRightHallway = `════╝               ╚════\n            ${character}             \n════╗               ╔════\n### ║               ║ ###\n`;
  const RightHallwayxxxx = `### ║               ╚════\n### ║       ${character}             \n### ║               ╔════\n### ║               ║ ###\n`;
  const LeftHallwayxxxxx = `════╝               ║ ###\n            ${character}        ║ ###\n════╗               ║ ###\n### ║               ║ ###\n`;
  const LeftRightWallxxx = `### ║               ║ ###\n### ║       ${character}        ║ ###\n### ║               ║ ###\n### ║               ║ ###\n`;

  const bottomHallway = "### ╚═════╗   ╔═════╝ ###\n######### ║   ║ #########";
  const bottomWallxxx = "### ╚═══════════════╝ ###\n#########################";

  const roomTop = top ? topHallway : topWall;
  const roomBottom = bottom ? bottomHallway : bottomWallxxx;
  let roomCenter;

  if (left && right) {
    roomCenter = LeftRightHallway;
  } else if (left && !right) {
    roomCenter = LeftHallwayxxxxx;
  } else if (!left && right) {
    roomCenter = RightHallwayxxxx;
  } else {
    roomCenter = LeftRightWallxxx;
  }

  const room = roomTop + roomCenter + roomBottom;
  return room;
}
