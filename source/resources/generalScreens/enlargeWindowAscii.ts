import { primaryColor } from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";

export const getEnlargeWindowAscii = () => {
  return `
╔═════════╤═════════╤═════════╤═════════╤═════════╤═════════╤═════════╤═════════╤═════════╤═════════╗
║         10        20        30        40        50        60        70        80        90        ║
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
╟ 5                                                                                               5 ╢
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
╟ 10                                                                                             10 ╢
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
╟ 15                                                                                             15 ╢
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
╟ 20                                                                                             20 ╢
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
╟ 25                                                                                             25 ╢
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
╟ 30                                                                                             30 ╢
║                                                                                                   ║
║                                                                                                   ║
║                                                                                                   ║
║         10        20        30        40        50        60        70        80        90        ║
╚═════════╧═════════╧═════════╧═════════╧═════════╧═════════╧═════════╧═════════╧═════════╧═════════╝
${primaryColor(`${getTerm("enlargeWindowPrompt")} ${process.stdout.columns}x${process.stdout.rows}`)}`;
};