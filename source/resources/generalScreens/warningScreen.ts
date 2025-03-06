import { errorColor, secondaryColor } from "@utilities/ConsoleService.js";

export function getWarningScreenAscii() {
  const e = (text: string) => errorColor(text);
  const s = (text: string) => secondaryColor(text);
  return s(`*******************************************************************************
          |                   |                  |             \\_______/       
 _________|___________________|__________________|_________\`.,-'\\_____/\`-.,'___
|                   |                   |                  /  /\`.,' \`.,'\\  \\   
|___________________|___________________|_________________/__/__/     \\__\\__\\__
          |                   |                  |        \\  \\  \\     /  /  /
 _________|______${e(
   "/‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\\"
 )}\\,'\`._,'\`./  /___
|                ${e(
    "⎸                            _              ⎹"
  )}'\`./___\\,'\`./
|________________${e(
    "⎸  __      ____ _ _ __ _ __ (_)_ __   __ _  ⎹"
  )}-./_____\\,-'\`.___
          |      ${e(
            "⎸  \\ \\ /\\ / / _` | '__| '_ \\| | '_ \\ / _` | ⎹"
          )} /       \\
 _________|______${e(
   "⎸   \\ V  V / (_| | |  | | | | | | | | (_| | ⎹"
 )}_________|_______
|                ${e("⎸    \\_/\\_/ \\__,_|_|  |_| |_|_|_| |_|\\__, | ⎹")}
|________________${e(
    "⎸                                    |___/  ⎹"
  )}_________________
____/______/ᘛ⁐̤ᕐᐷ_${e(
    "\\___________________________________________/"
  )}_____/______/____
/______/______/______/______/______/______/______/______/______/______/______/_
____/______/______/______/______/______/______/______/______/______/______/____
/______/______/______/______/______/______/______/______/______/______/______/_
____/______/______/______/______/______/______/______/______/______/______/____
/______/______/______/______/______/______/______/______/______/______/______/_
*******************************************************************************`);
}
