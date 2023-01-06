import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const csv = readFileSync(resolve("./scripts/game-dict.csv"), {
  encoding: "utf8",
})
  .split("\n")
  .map((row) => row.split(/,+(?=(?:(?:[^"]*"){2})*[^"]*$)/g)).reduce((acc, curr) => {
    const [key, value] = curr;
    return {
      ...acc,
      [key]: value.trim(),
    }
  }, {} as { [key: string]: string });

writeFileSync(resolve("./scripts/game-dict.json"), JSON.stringify(csv), {encoding: "utf8"});