import fs from "fs";

const paths = ["node_modules", "storage", "js", ".env"];

paths.forEach((path) => {
  try {
    fs.rmSync(path, { recursive: true, force: true });
    console.log(`Deleted: ${path}`);
  } catch (err) {
    console.error(`Error deleting ${path}:`, err);
  }
});

console.log("Reset complete.");