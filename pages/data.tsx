import { IShot } from "@types";
import Head from "next/head";
import { CalendarTooltipProps, ResponsiveCalendar } from "@nivo/calendar";
import Select from "react-select";
import { useState } from "react";
import { calendarDataFormat, gameDistPie } from "@util";
import { Calendar, Pie } from "@components/charts";
import { GetStaticProps } from "next";
import { Container } from "@components/global";

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
    <div className="bg-slate-600 text-white py-1 px-3 rounded-md shadow-md">
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

export default function Home({ sys, hof }: { sys: IShot[]; hof: IShot[] }) {
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
          })
      ),
    ] as string[]
  ).map((item) => ({ label: item, value: item }));

  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="Graphs and stuff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="calendar pt-20">
        <Container>
          <div className="relative flex flex-col items-center justify-center overflow-hidden">
            <div className="flex">
              <label className="inline-flex relative items-center mr-5 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={enabled}
                  readOnly
                />
                <div
                  onClick={() => {
                    setEnabled(!enabled);
                  }}
                  className={`
                  w-11
                  h-6
                  bg-gray-200
                  rounded-full
                  peer
                  peer-focus:ring-green-300
                  peer-checked:after:translate-x-full
                  peer-checked:after:border-white
                  after:content-['']
                  after:absolute
                  after:top-0.5
                  after:left-[2px]
                  after:bg-white
                  after:border-gray-300
                  after:border
                  after:rounded-full
                  after:h-5
                  after:w-5
                  after:transition-all
                peer-checked:bg-green-600
                `}
                ></div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {enabled ? "Hall of Framed" : "Share Your Shot"}
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="h-screen md:h-96 flex flex-col justify-center items-center">
              <h2>
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
              <Pie
                data={gameDistPie(
                  ((enabled ? hof : sys) as IShot[]).filter(
                    (shot) => shot.date.replace(/T.*$/g, "") === selectedDay
                  )
                )}
              />
            </div>
            <div className="h-screen md:h-96 flex flex-col justify-center items-center">
              <h2>
                <strong>Full year</strong>
              </h2>
              <Pie
                data={gameDistPie(
                  ((enabled ? hof : sys) as IShot[]).filter(
                    (shot) =>
                      new Date(shot.date).getTime() >=
                        new Date("2021-12-25").getTime() &&
                      new Date(shot.date).getTime() <=
                        new Date("2022-12-31").getTime()
                  )
                )}
              />
            </div>
          </div>

          <div className="h-screen lg:h-96">
            <Calendar
              onClick={(data) => {
                setSelectedDay(data.day);
              }}
              data={calendarDataFormat(enabled ? hof : sys)}
              from={new Date("2021-12-25")}
              to={new Date("2022-12-31")}
              tooltip={CustomTooltip}
            />
          </div>
        </Container>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const {
    shots: sys,
  }: {
    shots: IShot[];
  } = await fetcher(/* GraphQL */ `
    query {
      shots(
        startDate: "2019-01-01"
        endDate: "2022-12-31"
        type: "sys"
        format: "calendar"
      ) {
        authorNick
        gameName
        date
      }
    }
  `);
  const {
    shots: hof,
  }: {
    shots: IShot[];
  } = await fetcher(/* GraphQL */ `
    query {
      shots(
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
  `);

  return {
    props: {
      hof,
      sys,
    },
  };
};
