import { ResponsiveCalendar } from "@nivo/calendar";
import axios from "axios";
import Head from "next/head";

interface IProps {
  data: {
    data: {
      shots: {
        resolvedGameName: string;
        date: string;
        user: {
          authorNick: string;
        };
      }[];
    };
  };
}

export default function Home({ data }: IProps) {
  const chartData = data.data.shots.reduce((acc, shot) => {
    const date = new Date(shot.date);
    const month =
      date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;

    const dayOfMonth =
      date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;

    const day = `${date.getFullYear()}-${month}-${dayOfMonth}`;
    const index = acc.findIndex((item) => item.day === day);
    if (index === -1) {
      acc.push({ value: 1, day });
    } else {
      acc[index].value++;
    }
    return acc;
  }, [] as { value: number; day: string }[]);

  console.log(chartData);

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
          <ResponsiveCalendar
            data={chartData}
            from={new Date("2019-01-02")}
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
            monthBorderColor="#ffffff"
            dayBorderWidth={2}
            dayBorderColor="#ffffff"
            legends={[
              {
                anchor: "bottom-right",
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

// nextjs getserversideprops with axios
export async function getServerSideProps() {
  const res = await axios.post("http://localhost:4000/graphql", {
    query: /* GraphQL */ `
      query {
        shots(startDate: "2019-01-01", endDate: "2022-12-31") {
          resolvedGameName
          date
          user {
            authorNick
          }
        }
      }
    `,
  });
  const data = await res.data;

  return {
    props: {
      data,
    },
  };
}
