import { IShot } from "@types";
import Head from "next/head";
import { CalendarTooltipProps, ResponsiveCalendar } from "@nivo/calendar";
import Select from "react-select";
import { useEffect, useState, useRef, RefObject } from "react";
import {
  calendarDataFormat,
  gameDistPie,
  getDateLastYear,
  sequentialFadeIn,
} from "@util";
import { Calendar, Pie } from "@components/charts";
import { GetStaticProps } from "next";
import { Container, SegmentedControl } from "@components/global";

const fetcher = (query: string) =>
  fetch(`${process.env.BASE_FETCH_URL}/api/graphql`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((json) => json.data);

const CustomTooltip = (data: CalendarTooltipProps) => {
  return (
    <div className="bg-gray-900 text-white py-1 px-3 rounded-md shadow-md">
      {new Date(data.day).toLocaleDateString("en-US", {
        timeZone: "UTC",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}
      : <strong>{data.value}</strong>
    </div>
  );
};

export default function Home({
  sys,
  hof,
  shotsLastYear,
}: {
  sys: IShot[];
  hof: IShot[];
  shotsLastYear: IShot;
}) {
  const [enabled, setEnabled] = useState(false);
  const [selectedDay, setSelectedDay] = useState("2021-12-25");

  const sysGameNames = (
    [
      ...new Set(
        sys
          .map(({ gameName }: IShot) => gameName)
          .sort((a: string, b: string) => {
            const gameA = a.toLowerCase();
            const gameB = b.toLowerCase();
            if (gameA < gameB) {
              return -1;
            }
            if (gameA > gameB) {
              return 1;
            }
            return 0;
          }),
      ),
    ] as string[]
  ).map((item) => ({ label: item, value: item }));

  const segments: {
    [key: string]: RefObject<HTMLDivElement>;
  } = {
    Top: useRef<HTMLDivElement>(null),
    "Daily Shots": useRef<HTMLDivElement>(null),
    "Full Year": useRef<HTMLDivElement>(null),
    Calendar: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      sequentialFadeIn("bg-img");
      sequentialFadeIn("load");
    }
  }, []);

  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="Graphs and stuff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative">
        <div className="calendar relative z-10 backdrop-blur-3xl bg-gray-900/75">
          <div className="sticky top-20 z-30">
            <Container>
              <div className="load transition-all -translate-y-10 opacity-0 duration-500 w-fit flex flex-col md:flex-row">
                <div className="mb-4 md:mr-4 md:mb-0">
                  <SegmentedControl
                    data={["Share Your Shot", "Hall of Framed"]}
                    selected={enabled ? "Hall of Framed" : "Share Your Shot"}
                    onChange={(data) => setEnabled(data === "Hall of Framed")}
                  />
                </div>
              </div>
            </Container>
          </div>
          <Container className="pt-8 -translate-y-20">
            <div
              className="h-screen flex items-center load transition-all -translate-y-10 opacity-0 duration-500"
              ref={segments.Top}
            >
              <div className="grid grid-cols-2 gap-x-8">
                <div className="flex flex-col justify-center">
                  <h1 className="font-bold text-7xl">
                    Welcome to Framed&apos;s 2022 in Review!
                  </h1>
                  <br />
                  <p>
                    As the year comes to a close, we wanted to take a moment to
                    reflect on some of the most stunning virtual photography and
                    video game screenshots that have graced our feeds.
                  </p>
                  <br />
                  <p>
                    From breathtaking landscapes in open-world games to intense
                    action shots in first-person shooters, the gaming community
                    has truly outdone itself in capturing the beauty and emotion
                    of these digital worlds. Join us as we look back at some of
                    the most memorable moments and incredible imagery of the
                    past year.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {Array.from(Array(9).keys()).map((item, index) => {
                    const randIdx = Math.floor(Math.random() * sys.length - 1);
                    return (
                      <div
                        key={`${item}-${index}`}
                        className="relative aspect-square"
                      >
                        <p
                          className={`
                            absolute bottom-0 left-0 right-0 text-white text-sm p-4
                            bg-gradient-to-t from-gray-900
                          `}
                        >
                          {sys[randIdx].authorNick}
                        </p>
                        <picture>
                          <img
                            className="load transition-all -translate-y-10 opacity-0 duration-500 rounded-md object-cover"
                            alt={sys[randIdx].gameName}
                            src={`${sys[randIdx].attachments?.replace(
                              "https://cdn.discordapp.com",
                              "https://media.discordapp.net",
                            )}?width=600&height=600`}
                          />
                        </picture>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div
              className="h-screen flex items-center load transition-all -translate-y-10 opacity-0 duration-500"
              ref={segments.Top}
            >
              <h2 className="text-6xl font-bold">Categories</h2>
            </div>
            <div className="grid grid-rows-2 gap-y-4">
              <div className="grid grid-cols-2 load transition-all -translate-y-10 opacity-0 duration-500">
                <div ref={segments["Daily Shots"]}>
                  <h2 className="text-2xl">
                    <strong>
                      Day:{" "}
                      {new Date(selectedDay).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </strong>
                  </h2>
                </div>
                <div className="h-96">
                  <Pie
                    data={gameDistPie(
                      ((enabled ? hof : sys) as IShot[]).filter(
                        (shot) =>
                          shot.date.replace(/T.*$/g, "") === selectedDay,
                      ),
                    )}
                    tooltip={(d) => (
                      <div className="bg-gray-900 text-white py-1 px-3 rounded-md shadow-md">
                        {d.datum.label}: <strong>{d.datum.value}</strong>
                      </div>
                    )}
                  />
                </div>
              </div>
              <div
                className="grid grid-cols-2 load transition-all -translate-y-10 opacity-0 duration-500"
                ref={segments["Full Year"]}
              >
                <h2 className="text-2xl">
                  <strong>Full year</strong>
                </h2>
                <Pie
                  data={gameDistPie(
                    ((enabled ? hof : sys) as IShot[]).filter(
                      (shot) =>
                        new Date(shot.date).getTime() >=
                          new Date("2021-12-25").getTime() &&
                        new Date(shot.date).getTime() <=
                          new Date("2022-12-31").getTime(),
                    ),
                  )}
                  tooltip={(d) => (
                    <div className="bg-gray-900 text-white py-1 px-3 rounded-md shadow-md">
                      {d.datum.label}: <strong>{d.datum.value}</strong>
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="h-screen lg:h-96" ref={segments.Calendar}>
              <Calendar
                onClick={(data) => {
                  setSelectedDay(data.day);
                  if (typeof window !== "undefined") {
                    scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                data={calendarDataFormat(enabled ? hof : sys)}
                from={new Date("2021-12-25")}
                to={new Date("2022-12-31")}
                tooltip={CustomTooltip}
              />
            </div>
          </Container>
        </div>
        {shotsLastYear.attachments && (
          <picture>
            <img
              alt=""
              src={shotsLastYear.attachments}
              className="bg-img top-0 transition-all -translate-y-10 opacity-0 duration-500 object-cover absolute inset-0 w-full h-full"
            />
          </picture>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const start = getDateLastYear();
  const end = getDateLastYear(true);

  const {
    sys,
    hof,
    shotsLastYear = [],
  }: {
    sys: IShot[];
    hof: IShot[];
    shotsLastYear: IShot[];
  } = await fetcher(/* GraphQL */ `
    query {
      sys: shots(
        startDate: "2019-01-01"
        endDate: "2022-12-31"
        type: "sys"
        format: "calendar"
      ) {
        attachments
        authorNick
        gameName
        date
      }

      hof: shots(
        startDate: "2019-01-01"
        endDate: "2022-12-31"
        type: "hof"
        format: "calendar"
      ) {
        authorNick
        gameName
        date
      }

      shotsLastYear: shots(
        startDate: "${start.year}-${start.month}-${start.day}"
        endDate: "${end.year}-${end.month}-${end.day}"
        type: "sys"
      ) {
        attachments
      }
    }
  `);

  const len = shotsLastYear.length;
  const idx = Math.floor(Math.random() * len);

  return {
    props: {
      hof,
      sys: sys.filter((shot) => shot.attachments?.startsWith("https")),
      shotsLastYear: shotsLastYear.filter((shot) =>
        shot.attachments?.startsWith("https"),
      )[idx] ?? {
        attachments: "",
      },
    },
  };
};
