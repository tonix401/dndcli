import { primaryColor, secondaryColor } from "@utilities/ConsoleService.js";

export default function getPasswordBackground() {
  const s = secondaryColor;
  const p = primaryColor;

  const bg = [
    `*******************************************************************************`,
    `          |    ᚱ     __________| '=_             _ |_______ᚫ         |      ᚫ  `,
    ` _________|_________ϟ ᛡ    ᚫ        ';${p(
      "_______"
    )} .+'~    ᛡ    ᛚ &_______|_________`,
    `|           ᚱ     |      ᛚ        ${p(
      "_=''       ''=_"
    )}             |      ᛒ         `,
    `|____ᛒ____________|      ~     ${p(
      ".'               '."
    )}        _.  |________________`,
    `          |   ᚫ      ᛡ _  ᚱ   ${p(
      "/                   \\"
    )}    _='._         |    ᚫ    `,
    ` _________|_______      =_   ${p(
      "|        .===.        |"
    )}=''     '________|_________`,
    `| ᛡ             ᚫ |  _.=' '==${p(
      "|       |  O  |       |"
    )}   ~     |   ᚱ       ᛚ     `,
    `|_________________|.'  ~     ${p(
      "|        '==='        |"
    )}      ᚫ  |_________________`,
    `          | ᛡ                 ${p(
      "\\                   /"
    )}                    |       `,
    ` _________|_________    ᛚ      ${p(
      "'._             _.'"
    )}.      ᚫ   _____ᛡ____|_______`,
    `|    ᚱ        ᛒ     |      ᚫ    )  ${p(
      "'=.......='"
    )}     '=._     |                  `,
    `|___________________|     _____(_              ____='__'=.__|_____________ᚱ____`,
    `____/______/___ϟ__/______/____)_/___          /___ϟ__/______/______/______/____`,
    `/______/______/______/__ϟ___/___ϟ__/______ ______/______/______/______/______/_`,
    `____/______/______/______/______/____ϟ_/______/____ϟ_/______/______/______/____`,
    `/______/______/______/______/______/______/______/______/______/______/______/_`,
    `____/______/______/______/______/______/______/______/______/______/______/____`,
    `/______/______/______/______/______/______/______/______/______/______/______/_`,
    `*******************************************************************************`,
  ].join("\n");

  return s(bg);
}
