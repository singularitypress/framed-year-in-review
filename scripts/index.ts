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

const toJson = (data: string, name: string, type: "hof" | "sys") => {
  let [keys, ...rows] = data.split("\n");

  if(type === "sys") {
    rows.forEach((row, index) => {
      if(!row.match(/^\d{18}/)) {
        rows[index - 1] = rows[index - 1]?.split(/,+(?=(?:(?:[^"]*"){2})*[^"]*$)/g)?.slice(1).join(",") + row; 
      }
    });
  }

  let lastGameName = "";
  const shotArr = rows
    .filter((row) => {
      if(type === "sys") {
        return row.match(/^\d{18}/)
      } else return row;
    })
    .map((row) => {
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
        if (nextKey === "gameName") {
          if (!!values[index] && !values[index].includes("https://")) {
            lastGameName = values[index];
          } else {
            return {
              ...obj,
              [nextKey]: lastGameName,
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

  shotArr.forEach((shot) => {
    !shot?.date?.match(/^\d{4}\-/) && console.log(shot)
  })

  const shotJson = shotArr
    .filter((shot) => !!shot?.date?.match(/^\d{4}\-/))
    .reduce((acc, curr, index) => {
      let gameName = curr.gameName;

      if (curr.gameName.match(/^\./)) {
        gameName = "";
      }

      if (!curr.gameName) {
        gameName = acc.filter(({ gameName }) => !!gameName)[
          acc.filter(({ gameName }) => !!gameName).length - 1
        ].gameName;
      }
      gameName = gameName.replace(/(\r|\sPC$)/g, "").trim();
      gameName.match("\r") && console.log(gameName);

      if (!dict[gameName]) {
        dict[gameName] = "";
      }

      return [...acc, { ...curr, gameName: dict[gameName] ?? gameName }];
    }, [] as IShot[]);

  writeFileSync(
    resolve("./scripts/game-dict.json"),
    JSON.stringify(
      Object.keys(dict)
        .sort((a, b) => {
          const gameA = a.toLowerCase();
          const gameB = b.toLowerCase();
          if (gameA < gameB) return -1;
          if (gameA > gameB) return 1;
          return 0;
        })
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

toJson(hof, resolve("./pages/api/ShotsStandardNames.json"), "hof");
toJson(sys, resolve("./pages/api/shareyourshot2022data.json"), "sys");
