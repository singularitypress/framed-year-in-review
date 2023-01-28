import { IShot } from "@types";
import Head from "next/head";
import { CalendarTooltipProps } from "@nivo/calendar";
import { useEffect, useState, useRef, RefObject } from "react";
import { calendarDataFormat, gameDistPie, sequentialFadeIn } from "@util";
import { Calendar, Pie } from "@components/charts";
import {
  Container,
  SegmentedControl,
  LoadWrapper,
  LoadingSpinner,
} from "@components/global";
import useSWR from "swr";
import {
  ErrorNoData,
  ErrorSection,
  LoadingSection,
} from "@components/experience-fragments";

const fetcher = (query: string, onComplete: () => void) =>
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

export default function Home() {
  const [enabled, setEnabled] = useState(false);
  const [selectedDay, setSelectedDay] = useState("2021-12-25");

  const segments: {
    [key: string]: RefObject<HTMLDivElement>;
  } = {
    "Top 10 Games in Share Your Shot": useRef<HTMLDivElement>(null),
    "Top 10 Games in the Hall of Framed": useRef<HTMLDivElement>(null),
    "Most Active Day in Share Your Shot": useRef<HTMLDivElement>(null),
    "Most Active Day in the Hall of Framed": useRef<HTMLDivElement>(null),
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

  const { data, error, isLoading } = useSWR<{
    sys: IShot[];
    hof: IShot[];
  }>(
    /* GraphQL */ `
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
      }
    `,
    fetcher,
  );

  if (isLoading) {
    return <LoadingSection />;
  }

  if (error) {
    return <ErrorSection message={error.message} />;
  }

  if (!data) {
    return <ErrorNoData />;
  }

  const grid: IShot[] = Array.from(Array(9).keys()).map(() => {
    const randIdx = Math.floor(Math.random() * data.sys.length - 1);
    return data.sys[randIdx];
  });
  const categoriesImages: IShot[] = Array.from(Array(3).keys()).map(() => {
    const randIdx = Math.floor(Math.random() * data.sys.length - 1);
    return data.sys[randIdx];
  });
  const top10sys = gameDistPie(data.sys, 11)
    .map((item) => {
      const gameList = data.sys.filter(
        (shot) => shot.gameName === item.label && !!shot.attachments,
      );
      const randIdx = Math.floor(Math.random() * gameList.length - 1);
      return { ...gameList[randIdx], ...item };
    })
    .filter((item) => !!item.attachments);
  const top10hof = gameDistPie(data.hof, 11)
    .map((item) => {
      const gameList = data.sys.filter(
        (shot) => shot.gameName === item.label && !!shot.attachments,
      );
      const randIdx = Math.floor(Math.random() * gameList.length - 1);
      return { ...gameList[randIdx], ...item };
    })
    .filter((item) => !!item.attachments);

  return (
    <>
      <Head>
        <title>Data</title>
        <meta name="description" content="Graphs and stuff" />
      </Head>
      <LoadWrapper>
        <main className="relative">
          <div className="calendar relative z-10 backdrop-blur-3xl bg-gray-900/75">
            <div className="sticky top-20 z-30">
              <Container>
                <div className="load transition-all -translate-y-10 opacity-0 duration-500 w-fit flex flex-col md:flex-row">
                  <div className="mb-4 md:mr-4 md:mb-0">
                    <SegmentedControl
                      data={["Share Your Shot", "Hall of Framed"]}
                      selected={enabled ? "Hall of Framed" : "Share Your Shot"}
                      onChange={(section) =>
                        setEnabled(section === "Hall of Framed")
                      }
                    />
                  </div>
                </div>
              </Container>
            </div>
            <Container className="pt-8 -translate-y-20">
              <div className="h-screen flex items-center load transition-all -translate-y-10 opacity-0 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                  <div className="flex flex-col justify-center">
                    <h1 className="font-bold text-7xl">
                      Welcome to Framed&apos;s 2022 in Review!
                    </h1>
                    <br />
                    <p>
                      As the year comes to a close, we wanted to take a moment
                      to reflect on some of the most stunning virtual
                      photography and video game screenshots that have graced
                      our feeds.
                    </p>
                    <br />
                    <p>
                      From breathtaking landscapes in open-world games to
                      intense action shots in first-person shooters, the gaming
                      community has truly outdone itself in capturing the beauty
                      and emotion of these digital worlds. Join us as we look
                      back at some of the most memorable moments and incredible
                      imagery of the past year.
                    </p>
                  </div>
                  <div className="hidden md:flex flex-col justify-center">
                    <div className="grid grid-cols-3 gap-4 aspect-square">
                      {grid.map((item, index) => {
                        return (
                          <div
                            key={`${item.authorId}-${index}`}
                            className="relative aspect-square"
                          >
                            <div className="absolute w-full h-full transition-all duration-500 opacity-0 translate-y-5 hover:opacity-100 hover:translate-y-0">
                              <p
                                className={`
                            absolute bottom-0 left-0 right-0 text-white text-sm p-4
                            bg-gradient-to-t from-gray-900
                          `}
                              >
                                {item.authorNick}
                                <br />
                                {item.gameName}
                              </p>
                            </div>
                            <picture>
                              <img
                                className="load transition-all -translate-y-10 opacity-0 duration-500 rounded-md object-cover"
                                alt={item.gameName}
                                src={`${item.attachments?.replace(
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
              </div>
              <div className="h-screen flex flex-col justify-center load transition-all -translate-y-10 opacity-0 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                  <div className="hidden md:grid grid-cols-3 max-h-screen">
                    {categoriesImages.map((item, index) => {
                      return (
                        <div
                          key={`${item.authorId}-${index}`}
                          className="relative aspect-auto"
                        >
                          <div className="absolute w-full h-full transition-all duration-500 opacity-0 translate-y-5 hover:opacity-100 hover:translate-y-0">
                            <p
                              className={`
                            absolute bottom-0 left-0 right-0 text-white text-sm p-4
                            bg-gradient-to-t from-gray-900
                          `}
                            >
                              {item.authorNick}
                              <br />
                              {item.gameName}
                            </p>
                          </div>
                          <picture>
                            <img
                              className={`
                            load transition-all -translate-y-10 opacity-0 duration-500 object-cover h-full
                            ${
                              index === 0
                                ? "rounded-tl-md rounded-bl-md"
                                : index === 2
                                ? "rounded-tr-md rounded-br-md"
                                : ""
                            }
                            `}
                              alt={item.gameName}
                              src={`${item.attachments?.replace(
                                "https://cdn.discordapp.com",
                                "https://media.discordapp.net",
                              )}?width=600&height=600`}
                            />
                          </picture>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <h2 className="text-6xl font-bold mb-8">Categories</h2>
                    {Object.keys(segments).map((key) => {
                      return (
                        <div key={key} className="mb-8" ref={segments[key]}>
                          <div className="flex flex-col justify-center">
                            <button
                              className="text-left"
                              onClick={() => {
                                if (segments[key].current) {
                                  segments[key].current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }}
                            >
                              <h3 className="text-3xl font-bold">{key}</h3>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div
                className="min-h-screen flex items-center load transition-all -translate-y-10 opacity-0 duration-500 mb-8"
                ref={segments["Top 10 Games in Share Your Shot"]}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                  <div className="flex flex-col justify-center">
                    <h2 className="text-6xl font-bold mb-8">
                      Top 10 Games in Share Your Shot
                    </h2>
                    <p>
                      As we wrap up 2022, it&apos;s time to take a look back at
                      the most captivating virtual shots of the year in
                      Framed&apos;s Share Your Shot. From the snow-capped
                      mountains of Skyrim to the neon-lit cityscapes of
                      Cyberpunk 2077, these shots embody the power of virtual
                      photography.
                    </p>
                  </div>
                  <div className="hidden md:flex flex-col justify-center">
                    <div className="grid grid-cols-3 grid-rows-3 gap-4 max-h-screen">
                      {top10sys.map((item, index) => {
                        return (
                          <div
                            key={`${item.authorId}-${index}`}
                            className={`
                            relative load transition-all -translate-y-10 opacity-0 duration-500
                            ${index === 0 ? "col-span-1 row-span-3" : ""}
                          `}
                          >
                            <div className="absolute w-full h-full transition-all duration-500 opacity-100">
                              <div
                                className={`
                            absolute bottom-0 left-0 right-0  p-4
                            bg-gradient-to-t from-gray-900/80
                          `}
                              >
                                <h3 className="text-white text-lg font-bold">
                                  {index + 1}. {item.value} shots
                                  <br />
                                  {item.gameName}
                                  <br />
                                </h3>
                                <p className="text-white text-sm">
                                  {item.authorNick}
                                </p>
                              </div>
                            </div>
                            <picture>
                              <img
                                className="rounded-md object-cover w-full h-full"
                                alt={item.gameName}
                                src={`${item.attachments?.replace(
                                  "https://cdn.discordapp.com",
                                  "https://media.discordapp.net",
                                )}?width=1000&height=1000`}
                              />
                            </picture>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="min-h-screen flex items-center load transition-all -translate-y-10 opacity-0 duration-500 mb-8"
                ref={segments["Top 10 Games in the Hall of Framed"]}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                  <div className="hidden md:flex flex-col justify-center">
                    <div className="grid grid-cols-3 grid-rows-3 gap-4 max-h-screen">
                      {top10hof.map((item, index) => {
                        return (
                          <div
                            key={`${item.authorId}-${index}`}
                            className={`
                            relative load transition-all -translate-y-10 opacity-0 duration-500
                            ${index === 0 ? "col-span-1 row-span-3" : ""}
                          `}
                          >
                            <div className="absolute w-full h-full transition-all duration-500 opacity-100">
                              <div
                                className={`
                            absolute bottom-0 left-0 right-0  p-4
                            bg-gradient-to-t from-gray-900/50
                          `}
                              >
                                <h3 className="text-white text-lg font-bold">
                                  {index + 1}. {item.value} shots
                                  <br />
                                  {item.gameName}
                                  <br />
                                </h3>
                                <p className="text-white text-sm">
                                  {item.authorNick}
                                </p>
                              </div>
                            </div>
                            <picture>
                              <img
                                className="rounded-md object-cover w-full h-full"
                                alt={item.gameName}
                                src={`${item.attachments?.replace(
                                  "https://cdn.discordapp.com",
                                  "https://media.discordapp.net",
                                )}?width=1000&height=1000`}
                              />
                            </picture>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h2 className="text-6xl font-bold mb-8">
                      Top 10 Games in the Hall of Framed
                    </h2>
                    <p>
                      It&apos;s been an amazing year for virtual photography and
                      video game screenshots! We&apos;ve seen a plethora of
                      stunning shots posted to the Hall of Framed, but here
                      we&apos;d like to take a look at the top 10 shots of the
                      past year.
                    </p>
                  </div>
                </div>
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
                        ((enabled ? data.hof : data.sys) as IShot[]).filter(
                          (shot) =>
                            shot.date.replace(/T.*$/g, "") === selectedDay,
                        ),
                        8,
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
                      ((enabled ? data.hof : data.sys) as IShot[]).filter(
                        (shot) =>
                          new Date(shot.date).getTime() >=
                            new Date("2021-12-25").getTime() &&
                          new Date(shot.date).getTime() <=
                            new Date("2022-12-31").getTime(),
                      ),
                      8,
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
                      segments["Daily Shots"].current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }}
                  data={calendarDataFormat(enabled ? data.hof : data.sys)}
                  from={new Date("2021-12-25")}
                  to={new Date("2022-12-31")}
                  tooltip={CustomTooltip}
                />
              </div>
            </Container>
          </div>
        </main>
      </LoadWrapper>
    </>
  );
}
