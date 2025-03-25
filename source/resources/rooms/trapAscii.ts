import { primaryColor, secondaryColor } from "@core/ConsoleService.js";

export default function getTrapAscii() {
  const p = (text: string) => primaryColor(text);
  const s = (text: string) => secondaryColor(text);
  return s(`*******************************************************************************
          |                   |                  |             ${p(
            "\\_______/"
          )}       
 _________|___________________|__________________|_________${p(
   "`.,-'\\_____/`-.,'"
 )}___
|                   |                   |                  ${p(
    "/  /`.,' `.,'\\  \\"
  )}   
|___________________|___________________|________________${p(
    "_/__/__/     \\__\\__\\_"
  )}_
          |                   |                  |        ${p(
            "\\  \\  \\     /  /  /"
          )}  
 _________|___________________|__________________|_________${p(
   "\\  \\,'`._,'`./  /"
 )}___
|                   |                   |                   ${p(
    "\\,'`./___\\,'`./"
  )}    
|___________________|___________________|__________________${p(
    ",'`-./_____\\,-'`."
  )}___
          |                   |                  |             ${p(
            "/       \\"
          )}       
 _________|___________________|__________________|_____________________|_______
|                   |                   |                  |                   
|___________________|___________________|__________________|___________________
____/______/______/______/______/______/______/______/______/______/______/____
/______/______/______/______/_${p("ϟ")}__${p("ϟ")}_/__${p("ϟ")}___/___${p(
    "ϟ"
  )}__/______/______/______/______/_
____/______/______/______/_${p("ϟ")}____/__${p("ϟ")}___/___${p("ϟ")}__/___${p(
    "ϟ"
  )}__/______/______/______/____
/______/______/______/__${p("ϟ")}___/_${p("ϟ")}_${p("ϟ")}__/___${p(
    "ϟ"
  )}__/___${p("ϟ")}__/_${p("ϟ")}_${p("ϟ")}__/______/______/______/_
____/______/______/______/__${p("ϟ")}_${p("ϟ")}_/___${p("ϟ")}__/__${p(
    "ϟ"
  )}___/__${p("ϟ")}___/______/______/______/____
/______/______/______/______/______/______/______/______/______/______/______/_
*******************************************************************************`);
}
