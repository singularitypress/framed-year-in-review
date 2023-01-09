import Head from "next/head";
import React, { useEffect } from "react";
import { IShot } from "@types";
import { sequentialFadeIn } from "@util";
import { Container } from "@components/global";

const getDateLastYear = (tomorrow = false) => {
  const oneYear = 31556952000;
  const oneDayMs = 24 * 60 * 60 * 1000;
  const lastYear = new Date(Date.now() + (tomorrow ? oneDayMs : 0) - oneYear);

  return {
    year: lastYear.getFullYear(),
    month:
      lastYear.getMonth() + 1 < 10
        ? `0${lastYear.getMonth() + 1}`
        : lastYear.getMonth() + 1,
    day:
      lastYear.getDate() < 10 ? `0${lastYear.getDate()}` : lastYear.getDate(),
  };
};

const Home = ({ shots, randShot }: { shots: IShot[], randShot: IShot }) => {

  useEffect(() => {
    if (typeof window !== "undefined") {
      sequentialFadeIn("home-img");
      sequentialFadeIn("load");
    }
  }, []);

  console.log(shots, randShot)

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <main>
        <div className="absolute w-full">
          <Container className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-0 h-screen md:h-auto">
            <div className="h-full md:h-screen flex flex-col justify-center pr-4 md:pr-10 text-right">
              <h1 className="font-bold text-6xl md:text-8x1 lg:text-8xl load transition-all -translate-y-10 opacity-0 duration-500">
                Framed
              </h1>
              <h2 className="text-2xl font-bold load transition-all -translate-y-10 opacity-0 duration-500">
                Year in Review 2023
              </h2>
            </div>
          </Container>
        </div>
        <div className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-0 h-screen md:h-auto">
          <div className="h-full md:h-screen flex flex-col justify-center"></div>
          <picture>
            <img
              loading="lazy"
              className="home-img transition-all -translate-y-10 opacity-0 duration-500 delay-1000 h-full md:h-screen object-cover w-full shadow-2xl"
              src={randShot?.attachments}
              alt="Landscape picture"
            />
          </picture>
        </div>
      </main>
    </>
  );
};

export default Home;

// nextjs getstaticprops
export const getStaticProps = async () => {
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

  const start = getDateLastYear();
  const end = getDateLastYear(true);
  const query = /* GraphQL */ `
    query {
      shots(
        startDate: "${start.year}-${start.month}-${start.day}"
        endDate: "${end.year}-${end.month}-${end.day}"
        type: "sys"
      ) {
        attachments
      }
    }
  `;

  let { shots } = await fetcher(query);
  shots =
    (shots ?? []).filter((shot: IShot) =>
      shot.attachments?.startsWith("https")
    ) ?? [];

  const len = shots.length;
  const idx = Math.floor(Math.random() * len);

  return {
    props: {
      shots,
      randShot: shots[idx]
    },
  };
};