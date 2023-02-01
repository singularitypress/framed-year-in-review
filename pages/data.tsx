import { IShot } from "@types";
import Head from "next/head";
import { CalendarTooltipProps } from "@nivo/calendar";
import { useState, useRef, RefObject } from "react";
import { calendarDataFormat, gameDistPie } from "@util";
import { Calendar, Pie } from "@components/charts";
import { Container, LoadWrapper, Modal } from "@components/global";
import useSWR from "swr";
import {
  ErrorNoData,
  ErrorSection,
  LoadingSection,
} from "@components/experience-fragments";

interface CalendarPieTooltip extends CalendarTooltipProps {
  data: {
    shots: IShot[];
  };
}

const fetcher = (query: string) =>
  fetch(`/api/graphql`, {
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
    <div className="bg-framed-black text-white py-1 px-3 rounded-md shadow-md">
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

const ModalContent = ({ data }: { data: CalendarTooltipProps }) => {
  return (
    <div className="bg-framed-black text-white py-1 px-3 rounded-md h-96 aspect-video">
      {new Date(data.day).toLocaleDateString("en-US", {
        timeZone: "UTC",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}
      : <strong>{data.value}</strong>
      <Pie
        data={gameDistPie((data as CalendarPieTooltip).data.shots, 11)}
        tooltip={(d) => (
          <div className="bg-framed-black text-white py-1 px-3 rounded-md shadow-md">
            {d.datum.label}: <strong>{d.datum.value}</strong> shots
          </div>
        )}
      />
    </div>
  );
};

export default function Home() {
  const [visible, setVisible] = useState(false);
  const [calendarDatum, setCalendarDatum] = useState<CalendarTooltipProps>();

  const segments: {
    [key: string]: RefObject<HTMLDivElement>;
  } = {
    "Top 10 Games in Share Your Shot": useRef<HTMLDivElement>(null),
    "Top 10 Games in the Hall of Framed": useRef<HTMLDivElement>(null),
    "Most Active Day in Share Your Shot": useRef<HTMLDivElement>(null),
    "Most Active Day in the Hall of Framed": useRef<HTMLDivElement>(null),
    "Daily Hall of Framed": useRef<HTMLDivElement>(null),
    "Daily Share Your Shot": useRef<HTMLDivElement>(null),
  };

  const { data, error, isLoading } = useSWR<{
    sys: IShot[];
    hof: IShot[];
  }>(
    /* GraphQL */ `
      query {
        sys: shots(
          startDate: "2022-01-01"
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
          startDate: "2022-01-01"
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

  const mostActiveSys = gameDistPie(
    calendarDataFormat(data.sys).sort((a, b) => b.value - a.value)[0].shots,
    11,
  ).map((item) => {
    const gameList = data.sys.filter(
      (shot) => shot.gameName === item.label && !!shot.attachments,
    );
    const randIdx = Math.floor(Math.random() * gameList.length - 1);
    if (!gameList[randIdx]) {
      return { ...gameList[0], ...item };
    }
    return { ...gameList[randIdx], ...item };
  });

  const mostActiveHof = gameDistPie(
    calendarDataFormat(data.hof).sort((a, b) => b.value - a.value)[0].shots,
    11,
  ).map((item) => {
    const gameList = data.sys.filter(
      (shot) => shot.gameName === item.label && !!shot.attachments,
    );
    const randIdx = Math.floor(Math.random() * gameList.length - 1);
    if (!gameList[randIdx]) {
      return { ...gameList[0], ...item };
    }
    return { ...gameList[randIdx], ...item };
  });

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
          <div className="relative z-10 bg-framed-black/60">
            <Container className="pt-20 md:pt-0">
              <div className="min-h-screen md:flex md:items-center load transition-all -translate-y-10 opacity-0 duration-500 mb-8">
                <div className="md:grid md:grid-cols-2 md:gap-x-16">
                  <div className="flex flex-col justify-center">
                    <h1 className="font-bold text-4xl md:text-7xl md:mb-8">
                      Welcome to Framed&apos;s 2022 in Review!
                    </h1>
                    <br />
                    <p>
                      We wanted to take a moment to reflect on some of the most
                      stunning virtual photography and video game screenshots
                      that have graced our feeds.
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
                  <div className="flex flex-col justify-center">
                    <div className="grid grid-cols-3 gap-4 aspect-square mt-8 md:mt-32">
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
                            bg-gradient-to-t from-framed-black/75
                          `}
                              >
                                {item.gameName}
                                <br />
                                <span className="text-white/75 text-xs">
                                  {item.authorNick}
                                </span>
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
              <div className="min-h-screen flex flex-col justify-center load transition-all -translate-y-10 opacity-0 duration-500 mb-8">
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
                            absolute bottom-0 left-0 right-0 p-4
                            bg-gradient-to-t from-framed-black/75
                          `}
                            >
                              {item.gameName}
                              <br />
                              <span className="text-white/75 text-xs text-right">
                                {item.authorNick}
                              </span>
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
                  <div className="md:grid md:grid-rows-2 md:gap-y-8 mb-16 md:mb-0">
                    <div className="h-full flex flex-col justify-end">
                      <h2 className="md:text-6xl text-3xl font-bold mb-8">
                        Top 10 Games in Share Your Shot
                      </h2>
                      <p>
                        As we wrap up 2022, it&apos;s time to take a look back
                        at the most captivating virtual shots of the year in
                        Framed&apos;s Share Your Shot. From the snow-capped
                        mountains of Skyrim to the neon-lit cityscapes of
                        Cyberpunk 2077, these shots embody the power of virtual
                        photography.
                      </p>
                    </div>
                    <div className="aspect-video hidden md:block">
                      <Pie
                        data={gameDistPie(
                          (data.sys as IShot[]).filter(
                            (shot) =>
                              new Date(shot.date).getTime() >=
                                new Date("2022-01-01").getTime() &&
                              new Date(shot.date).getTime() <=
                                new Date("2022-12-31").getTime(),
                          ),
                          11,
                        )}
                        tooltip={(d) => (
                          <div className="bg-framed-black text-white py-1 px-3 rounded-md shadow-md">
                            {d.datum.label}: <strong>{d.datum.value}</strong>{" "}
                            shots
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
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
                            bg-gradient-to-t from-framed-black/75
                          `}
                              >
                                <p className="text-white font-bold text-xs md:text-base">
                                  {index + 1}: {item.value} shots
                                  <br />
                                  {item.gameName}
                                  <br />
                                </p>
                                <p className="text-white/75 text-xs text-right">
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
              <div
                className="min-h-screen flex items-center load transition-all -translate-y-10 opacity-0 duration-500 mb-8"
                ref={segments["Top 10 Games in the Hall of Framed"]}
              >
                <div className="grid md:grid-rows-none md:grid-cols-2 gap-x-16 gap-y-16">
                  <div className="md:flex md:flex-col md:justify-center">
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
                            absolute bottom-0 left-0 right-0 p-4
                            bg-gradient-to-t from-framed-black/75
                          `}
                              >
                                <p className="text-white font-bold text-xs md:text-base">
                                  {index + 1}: {item.value} shots
                                  <br />
                                  {item.gameName}
                                  <br />
                                </p>
                                <p className="text-white/75 text-xs text-right">
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
                                )}?width=600&height=600`}
                              />
                            </picture>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="order-first md:order-none md:grid md:grid-rows-2 md:gap-y-8">
                    <div className="md:h-full md:flex md:flex-col md:justify-end">
                      <h2 className="text-3xl md:text-6xl font-bold mb-8">
                        Top 10 Games in the Hall of Framed
                      </h2>
                      <p>
                        It&apos;s been an amazing year for virtual photography
                        and video game screenshots! We&apos;ve seen a plethora
                        of stunning shots posted to the Hall of Framed, but here
                        we&apos;d like to take a look at the top 10 shots of the
                        past year.
                      </p>
                    </div>
                    <div className="aspect-video hidden md:block">
                      <Pie
                        data={gameDistPie(
                          (data.hof as IShot[]).filter(
                            (shot) =>
                              new Date(shot.date).getTime() >=
                                new Date("2022-01-01").getTime() &&
                              new Date(shot.date).getTime() <=
                                new Date("2022-12-31").getTime(),
                          ),
                          11,
                        )}
                        tooltip={(d) => (
                          <div className="bg-framed-black text-white py-1 px-3 rounded-md shadow-md">
                            {d.datum.label}: <strong>{d.datum.value}</strong>{" "}
                            shots
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="min-h-screen flex items-center load transition-all -translate-y-10 opacity-0 duration-500 mb-16"
                ref={segments["Most Active Day in Share Your Shot"]}
              >
                <div className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-x-16 gap-y-16">
                  <div className="grid md:grid-rows-2 gap-y-8">
                    <div className="h-full flex flex-col justify-end">
                      <h2 className="text-3xl md:text-6xl font-bold mb-8">
                        Most Active Day in Share Your Shot
                      </h2>
                      <h3 className="text-2xl md:text-4xl font-bold mb-8">
                        {new Date(
                          calendarDataFormat(data.sys).sort(
                            (a, b) => b.value - a.value,
                          )[0].day,
                        ).toLocaleDateString("en-US", {
                          timeZone: "UTC",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <p>
                        The top three most shot games this year were SIFU, God
                        of War, and No Man&apos;s Sky, each inspiring players to
                        capture breathtaking moments and share their own unique
                        perspectives with the community. Whether it was
                        showcasing the fluid martial arts combat in SIFU,
                        capturing the epic battles of God of War, or exploring
                        the vast and beautiful alien landscapes of No Man&apos;s
                        Sky, these games provided plenty of opportunities for
                        players to showcase their skills and imagination.
                        It&apos;s clear that virtual photography continues to
                        thrive and evolve, and we can&apos;t wait to see what
                        creative shots players will come up with in the years to
                        come!
                      </p>
                    </div>
                    <div className="aspect-video hidden md:block">
                      <Pie
                        data={gameDistPie(
                          calendarDataFormat(data.sys).sort(
                            (a, b) => b.value - a.value,
                          )[0].shots,
                          11,
                        )}
                        tooltip={(d) => (
                          <div className="bg-framed-black text-white py-1 px-3 rounded-md shadow-md">
                            {d.datum.label}: <strong>{d.datum.value}</strong>{" "}
                            shots
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="grid grid-cols-3 grid-rows-3 gap-4 max-h-screen">
                      {mostActiveSys.slice(0, 10).map((item, index) => {
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
                            bg-gradient-to-t from-framed-black/75
                          `}
                              >
                                <p className="text-white font-bold text-xs md:text-base">
                                  {index + 1}: {item.value} shots
                                  <br />
                                  {item.gameName}
                                  <br />
                                </p>
                                <p className="text-white/75 text-xs text-right">
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
              <div
                className="min-h-screen flex items-center load transition-all -translate-y-10 opacity-0 duration-500 mb-16"
                ref={segments["Most Active Day in the Hall of Framed"]}
              >
                <div className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-x-16 gap-y-16">
                  <div className="md:flex flex-col justify-center">
                    <div className="grid grid-cols-3 grid-rows-3 gap-4 max-h-screen">
                      {mostActiveHof.slice(0, 10).map((item, index) => {
                        if (!item.gameName || !item.attachments) {
                          console.log("SHIT", mostActiveHof.slice(0, 10));
                        }
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
                            absolute bottom-0 left-0 right-0 p-4
                            bg-gradient-to-t from-framed-black/75
                          `}
                              >
                                <p className="text-white font-bold">
                                  {index + 1}: {item.value} shots
                                  <br />
                                  {item.gameName}
                                  <br />
                                </p>
                                <p className="text-white/75 text-xs text-right">
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
                                )}?width=600&height=600`}
                              />
                            </picture>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="md:grid md:grid-rows-2 md:gap-y-8 order-first md:order-none">
                    <div className="h-full flex flex-col justify-end">
                      <h2 className="text-3xl md:text-6xl font-bold mb-8">
                        The Most Active Day in the Hall of Framed
                      </h2>
                      <h3 className="text-2xl font-bold mb-4">
                        {new Date(
                          calendarDataFormat(data.hof).sort(
                            (a, b) => b.value - a.value,
                          )[0].day,
                        ).toLocaleDateString("en-US", {
                          timeZone: "UTC",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <p>
                        Players were eager to capture the stunning vistas and
                        gritty towns of Red Dead Redemption 2, the neon-lit
                        futuristic world of Cyberpunk 2077, and the mysterious
                        forest landscapes of The Pathless. Whether it was
                        showcasing the realism of the Wild West or exploring a
                        futuristic metropolis, players were able to express
                        their creativity and passion for virtual photography.
                        With such a diverse range of games and a community of
                        talented photographers, the Hall of Framed was
                        definitely the place to be for all things virtual
                        photography in 2022!
                      </p>
                    </div>
                    <div className="aspect-video hidden md:block">
                      <Pie
                        data={gameDistPie(
                          calendarDataFormat(data.hof).sort(
                            (a, b) => b.value - a.value,
                          )[0].shots,
                          11,
                        )}
                        tooltip={(d) => (
                          <div className="bg-framed-black text-white py-1 px-3 rounded-md shadow-md">
                            {d.datum.label}: <strong>{d.datum.value}</strong>{" "}
                            shots
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="calendar h-screen grid grid-rows-2 gap-x-8 overflow-scroll md:overflow-auto">
                <div
                  className="flex flex-col items-center w-h-screen md:w-full"
                  ref={segments["Daily Share Your Shot"]}
                >
                  <h3 className="font-bold text-3xl pl-20">
                    Share Your Shot Calendar in 2022
                  </h3>
                  <Calendar
                    data={calendarDataFormat(data.sys)}
                    onClick={(d) => {
                      setCalendarDatum(d as any as CalendarTooltipProps);
                      setVisible(true);
                    }}
                    from={new Date("2022-01-02")}
                    to={new Date("2022-12-31")}
                    tooltip={CustomTooltip}
                  />
                </div>
                <div
                  className="flex flex-col items-center w-h-screen md:w-full"
                  ref={segments["Daily Hall of Framed"]}
                >
                  <h3 className="font-bold text-3xl pl-20">
                    Hall of Framed Calendar in 2022
                  </h3>
                  <Calendar
                    data={calendarDataFormat(data.hof)}
                    onClick={(d) => {
                      setCalendarDatum(d as any as CalendarTooltipProps);
                      setVisible(true);
                    }}
                    from={new Date("2022-01-02")}
                    to={new Date("2022-12-31")}
                    tooltip={CustomTooltip}
                  />
                </div>
              </div>
            </Container>
          </div>
          <picture>
            <img
              className="absolute top-0 left-0 w-full h-full object-cover"
              src="/images/Topography.svg"
              alt=""
            />
          </picture>
        </main>
      </LoadWrapper>
      <Modal
        open={visible}
        onClose={() => {
          setVisible(false);
          setCalendarDatum(undefined);
        }}
      >
        {calendarDatum && <ModalContent data={calendarDatum} />}
      </Modal>
    </>
  );
}
