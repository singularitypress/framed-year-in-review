import { IShot } from "@types";
import Head from "next/head";
import useSWR from "swr";
import { CalendarTooltipProps, ResponsiveCalendar } from "@nivo/calendar";
import { ResponsivePie } from "@nivo/pie";
import { useState } from "react";
import { calendarDataFormat } from "@util";

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
      {new Date(data.day).toLocaleString("en-US", {
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
    fetcher,
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
    fetcher,
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

        <div>
          <ResponsivePie
            data={data}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: "color",
              modifiers: [["darker", 2]],
            }}
            defs={[
              {
                id: "dots",
                type: "patternDots",
                background: "inherit",
                color: "rgba(255, 255, 255, 0.3)",
                size: 4,
                padding: 1,
                stagger: true,
              },
              {
                id: "lines",
                type: "patternLines",
                background: "inherit",
                color: "rgba(255, 255, 255, 0.3)",
                rotation: -45,
                lineWidth: 6,
                spacing: 10,
              },
            ]}
            fill={[
              {
                match: {
                  id: "ruby",
                },
                id: "dots",
              },
              {
                match: {
                  id: "c",
                },
                id: "dots",
              },
              {
                match: {
                  id: "go",
                },
                id: "dots",
              },
              {
                match: {
                  id: "python",
                },
                id: "dots",
              },
              {
                match: {
                  id: "scala",
                },
                id: "lines",
              },
              {
                match: {
                  id: "lisp",
                },
                id: "lines",
              },
              {
                match: {
                  id: "elixir",
                },
                id: "lines",
              },
              {
                match: {
                  id: "javascript",
                },
                id: "lines",
              },
            ]}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
              },
            ]}
          />
        </div>

        <div className="h-screen">
          <ResponsiveCalendar
            onClick={(data) => {
              setSelectedDay(data.day);
            }}
            data={calendarDataFormat(enabled ? hof.data.shots : sys.data.shots)}
            monthSpacing={22}
            from={new Date("2021-12-25")}
            to={new Date("2022-12-31")}
            emptyColor="#eeeeee"
            colors={[
              "#003f5c",
              "#444e86",
              "#955196",
              "#dd5182",
              "#ff6e54",
              "#ffa600",
            ]}
            tooltip={CustomTooltip}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            yearSpacing={40}
            dayBorderWidth={2}
            legends={[
              {
                anchor: "top",
                direction: "row",
                translateY: 36,
                itemCount: 4,
                itemWidth: 42,
                itemHeight: 36,
                itemsSpacing: 14,
                itemDirection: "right-to-left",
              },
            ]}
          />
        </div>
      </main>
    </>
  );
}
