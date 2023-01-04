import { IShot } from "@types";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const dict: {
  [key: string]: string;
} = JSON.parse(
  readFileSync(resolve("./scripts/game-dict.json"), {
    encoding: "utf8",
  }),
);

const sys = readFileSync(resolve("./pages/api/shareyourshot2022data.csv"), {
  encoding: "utf8",
});

const hof = readFileSync(resolve("./pages/api/ShotsStandardNames.csv"), {
  encoding: "utf8",
});

const toJson = (data: string, name: string) => {
  const [keys, ...values] = data.split("\n");

  const shotArr = values.map((row) => {
    const values = row.split(",");
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
    } bad objects out of ${shotArr.length}`,
  );

  writeFileSync(
    name,
    JSON.stringify(
      shotArr
        .filter((shot) => !!shot?.date?.match(/^\d{4}\-/))
        .reduce((acc, curr, index) => {
          if (!curr.gameName) {
            const lastGameName = acc.filter(({ gameName }) => !!gameName)[
              acc.filter(({ gameName }) => !!gameName).length - 1
            ].gameName;

            return [
              ...acc,
              {
                ...curr,
                gameName: lastGameName,
              },
            ];
          }

          return [...acc, curr];
        }, [] as IShot[])
        .map((shot) => ({
          ...shot,
          gameName: dict[shot.gameName] ?? shot.gameName,
        })),
    ),
    {
      encoding: "utf8",
    },
  );
};

toJson(hof, "ShotsStandardNames.json");
toJson(sys, "shareyourshot2022data.json");
