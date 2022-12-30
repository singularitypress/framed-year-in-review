import { IShot } from "@types";
import { readFileSync } from "fs";
import { createYoga, createSchema } from "graphql-yoga";
import { resolve } from "path";
import { calendarDataFormat } from "@util";

const shareyourshot2022data = readFileSync(
  resolve("./pages/api/shareyourshot2022data.csv"),
  {
    encoding: "utf8",
  },
).split("\n");

const ShotsStandardNames = readFileSync(
  resolve("./pages/api/ShotsStandardNames.csv"),
  {
    encoding: "utf8",
  },
).split("\n");

const generateShots = (csv: string[]): IShot[] => {
  const keys = csv[0].split(",");
  return csv.slice(1).map((row) => {
    const values = row.split(",");
    return keys.reduce((obj, nextKey, index) => {
      return {
        ...obj,
        [nextKey]: values[index],
      };
    }, {});
  }) as IShot[];
};

const [sys, hof] = [
  generateShots(shareyourshot2022data),
  generateShots(ShotsStandardNames),
];

const typeDefs = /* GraphQL */ `
  type Shot {
    gameName: String
    height: String
    width: String
    authorNick: String
    authorId: String
    date: String
    score: String
    colorName: String
    orientation: String
    aspectRatio: String
  }

  type Query {
    shots(
      page: [Int]
      gameName: String
      startDate: String
      endDate: String
      authorNick: String
      type: String!
      format: String
    ): [Shot]
    games(type: String!): [String]
    authors(type: String!): [String]
  }
`;

const resolvers = {
  Query: {
    shots: (
      parent: undefined,
      {
        page = [],
        gameName,
        startDate,
        endDate,
        type,
      }: {
        page: number[];
        gameName: string;
        startDate: string;
        endDate: string;
        type: "sys" | "hof";
      },
    ) => {
      let filteredShots: IShot[] = type === "sys" ? sys : hof;

      filteredShots = filteredShots.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      if (page.length >= 1) {
        filteredShots = filteredShots.slice(page[0], page[1]);
      }

      if (gameName) {
        filteredShots = filteredShots.filter((shot) =>
          shot.gameName?.toLowerCase().match(gameName?.toLowerCase()),
        );
      }

      if (startDate) {
        filteredShots = filteredShots.filter(
          (shot) =>
            new Date(shot.date).getTime() >= new Date(startDate).getTime(),
        );
      }

      if (endDate) {
        filteredShots = filteredShots.filter(
          (shot) =>
            new Date(shot.date).getTime() <= new Date(endDate).getTime(),
        );
      }

      return filteredShots.map((shot) => ({
        ...shot,
        date: new Date(shot.date).toISOString(),
      }));
    },
    games: (parent: undefined, type: "sys" | "hof") => [
      ...new Set((type === "sys" ? sys : hof).map((shot) => shot.gameName)),
    ],
    authors: (parent: undefined, type: "sys" | "hof") => [
      ...new Set((type === "sys" ? sys : hof).map((shot) => shot.authorNick)),
    ],
  },
};

const schema = createSchema({
  typeDefs,
  resolvers,
});

export default createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
});
