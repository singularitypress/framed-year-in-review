import { IShot } from "@types";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const dict: {
  [key: string]: string;
} = JSON.parse(
  readFileSync(resolve("./scripts/game-dict.json"), {
    encoding: "utf8",
  })
);

const sys = readFileSync(resolve("./pages/api/shareyourshot2022data.csv"), {
  encoding: "utf8",
}).replace(/\(PC\)/g, "");

const hof = readFileSync(resolve("./pages/api/ShotsStandardNames.csv"), {
  encoding: "utf8",
}).replace(/\(PC\)/g, "");

const toJson = (data: string, name: string) => {
  const [keys, ...values] = data.split("\n");

  const shotArr = values.map((row) => {
    const values = row.split(/,+(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
    return keys.split(",").reduce((obj, nextKey, index) => {
      if (nextKey === "date") {
        if (!!new Date(values[index]).getTime()) {
          return {
            ...obj,
            [nextKey]: new Date(values[index]).toISOString(),
          };
        }
      }
      return {
        ...obj,
        [nextKey]: values[index],
      };
    }, {} as IShot);
  });

  console.log(
    `there are ${
      shotArr.filter((shot) => !shot?.date?.match(/^\d{4}\-/)).length
    } bad objects out of ${shotArr.length}`
  );

  const shotJson = shotArr
    .filter((shot) => !!shot?.date?.match(/^\d{4}\-/))
    .reduce((acc, curr, index) => {
      let gameName = curr.gameName;
      if (!curr.gameName || curr.gameName === "." || curr.gameName.includes("https://")) {
        gameName = acc.filter(({ gameName }) => !!gameName)[
          acc.filter(({ gameName }) => !!gameName).length - 1
        ].gameName;
      }
      gameName = gameName.replace(/(\r|\sPC$)/g, "");
      gameName.match("\r") && console.log(gameName);

      // if (!dict[gameName]) {
      //   dict[gameName] = "";
      // }

      return [...acc, { ...curr, gameName: dict[gameName] ?? gameName }];
    }, [] as IShot[]);

  writeFileSync(
    resolve("./scripts/game-dict.json"),
    JSON.stringify(
      Object.keys(dict)
        .sort(
          (a, b) => {
            const gameA = a.toLowerCase();
            const gameB = b.toLowerCase();
            if (gameA < gameB) return -1;
            if (gameA > gameB) return 1;
            return 0;
          }
        )
        .reduce((obj, key) => {
          obj[key] = dict[key];
          return obj;
        }, {} as { [key: string]: string })
    ),
    { encoding: "utf8" }
  );

  writeFileSync(name, JSON.stringify(shotJson), {
    encoding: "utf8",
  });
};

toJson(hof, "ShotsStandardNames.json");
toJson(sys, "shareyourshot2022data.json");
