import { IShot } from "@types";
import Head from "next/head";
import useSWR from "swr";
import { CalendarTooltipProps, ResponsiveCalendar } from "@nivo/calendar";
import { ResponsivePie } from "@nivo/pie";
import { useState } from "react";
import { calendarDataFormat } from "@util";
import { Calendar, Pie } from "@components/charts";

const fetcher = (query: string) =>
  fetch("/api/graphql", {
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

export default function Home() {
  const [enabled, setEnabled] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");

  const sys = useSWR(
    /* GraphQL */ `
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
    `,
    fetcher
  );

  const hof = useSWR(
    /* GraphQL */ `
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
    `,
    fetcher
  );

  if (sys.error || hof.error) return <div>Failed to load</div>;
  if (!sys.data || !hof.data) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="Graphs and stuff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="calendar container my-0 mx-auto">
        <h1>
          <strong>Home</strong>
        </h1>
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
                className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
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
              data={Object.values(
                ((enabled ? hof.data.shots : sys.data.shots) as IShot[])
                  .filter(
                    (shot) =>
                      shot.date.replace(/T.*$/g, "") === selectedDay
                  )
                  .reduce((acc, shot) => {
                    if (acc[shot.gameName]) {
                      acc[shot.gameName].value++;
                    } else {
                      acc[shot.gameName] = {
                        id: shot.gameName,
                        label: shot.gameName,
                        value: 1,
                      };
                    }
                    return acc;
                  }, {} as { [key: string]: { id: string; label: string; value: number } })
              )
                .sort((a, b) => b.value - a.value)
                .reduce((acc, shot, i) => {
                  if (i < 8) {
                    return [...acc, shot];
                  } else {
                    acc[7].id = "Other";
                    acc[7].label = "Other";
                    acc[7].value += shot.value;
                    return acc;
                  }
                }, [] as { id: string; label: string; value: number }[])}
            />
          </div>
          <div className="h-screen md:h-96 flex flex-col justify-center items-center">
            <h2>
              <strong>Full year</strong>
            </h2>
            <Pie
              data={Object.values(
                ((enabled ? hof.data.shots : sys.data.shots) as IShot[])
                  .filter(
                    (shot) =>
                      new Date(shot.date).getTime() >=
                        new Date("2021-12-25").getTime() &&
                      new Date(shot.date).getTime() <=
                        new Date("2022-12-31").getTime()
                  )
                  .reduce((acc, shot) => {
                    if (acc[shot.gameName]) {
                      acc[shot.gameName].value++;
                    } else {
                      acc[shot.gameName] = {
                        id: shot.gameName,
                        label: shot.gameName,
                        value: 1,
                      };
                    }
                    return acc;
                  }, {} as { [key: string]: { id: string; label: string; value: number } })
              )
                .sort((a, b) => b.value - a.value)
                .reduce((acc, shot, i) => {
                  if (i < 8) {
                    return [...acc, shot];
                  } else {
                    acc[7].id = "Other";
                    acc[7].label = "Other";
                    acc[7].value += shot.value;
                    return acc;
                  }
                }, [] as { id: string; label: string; value: number }[])}
            />
          </div>
        </div>

        <div className="h-screen lg:h-96">
          <Calendar
            onClick={(data) => {
              setSelectedDay(data.day);
            }}
            data={calendarDataFormat(enabled ? hof.data.shots : sys.data.shots)}
            from={new Date("2021-12-25")}
            to={new Date("2022-12-31")}
            tooltip={CustomTooltip}
          />
        </div>
      </main>
    </>
  );
}
