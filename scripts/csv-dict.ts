import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const json = JSON.parse(
  readFileSync(resolve("./scripts/game-dict.json"), { encoding: "utf8" })
);

writeFileSync(
  resolve("./scripts/game-dict.csv"),
  Object.keys(json)
    .sort((a, b) => {
      const gameA = a.toLowerCase().replace(/([^\w\s]| +)/g, "");
      const gameB = b.toLowerCase().replace(/([^\w\s]| +)/g, "");
      if (gameA < gameB) return -1;
      if (gameA > gameB) return 1;
      return 0;
    })
    .map((key) => `${key},${json[key]}`)
    .join("\n"),
  { encoding: "utf8" }
);
