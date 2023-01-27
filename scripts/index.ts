import { IShot } from "@types";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import csvtojson from "csvtojson";

const dict: {
  [key: string]: string;
} = JSON.parse(
  readFileSync(resolve("./scripts/game-dict.json"), {
    encoding: "utf8",
  }),
);

const sys = readFileSync(resolve("./pages/api/shareyourshot2022data.csv"), {
  encoding: "utf8",
})
  .replace(/\(PC\)/g, "")
  .replace(/\n(?!\d{16}).*(https)|\n\D.*(?!(https))/g, ",https")
  .replace(/,\n/g, "\n")
  .split("\n")
  .filter((row) => !!row)
  .join("\n");

const hof = readFileSync(resolve("./pages/api/ShotsStandardNames.csv"), {
  encoding: "utf8",
}).replace(/\(PC\)/g, "");

const reduceCallback = (acc: IShot[], curr: IShot, index: number): IShot[] => {
  if (!curr.gameName) {
    const lastGameName = acc[acc.length - 1].gameName;
    return [
      ...acc,
      {
        ...curr,
        gameName: dict[lastGameName] ?? lastGameName,
        date: new Date(curr.date).toISOString(),
      },
    ];
  }
  return [
    ...acc,
    {
      ...curr,
      gameName: dict[curr.gameName] ?? curr.gameName,
      date: new Date(curr.date).toISOString(),
    },
  ];
};

csvtojson()
  .fromString(sys)
  .then((json) => {
    writeFileSync(
      resolve("./pages/api/shareyourshot2022data.json"),
      JSON.stringify(
        (json as IShot[])
          .reduce(reduceCallback, [] as IShot[])
          .filter(({ attachments }) => !!attachments),
      ),
      {
        encoding: "utf8",
      },
    );
  });

csvtojson()
  .fromString(hof)
  .then((json) => {
    writeFileSync(
      resolve("./pages/api/ShotsStandardNames.json"),
      JSON.stringify((json as IShot[]).reduce(reduceCallback, [] as IShot[])),
      {
        encoding: "utf8",
      },
    );
  });
