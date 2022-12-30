import { IShot } from "@types";
import Head from "next/head";
import useSWR from "swr";
import { ResponsiveCalendar } from "@nivo/calendar";
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

export default function Home() {
  const [enabled, setEnabled] = useState(false);

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

  console.log(sys.data.shots);

  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="Graphs and stuff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>
          <strong>Home</strong>
        </h1>
        <div className="container h-screen">
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

          <ResponsiveCalendar
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
