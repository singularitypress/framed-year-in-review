import Head from "next/head";
import useSWR from "swr";
import React, { useEffect } from "react";
import { IShot } from "@types";
import { sequentialFadeIn } from "@util";

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

const Home = () => {
  const oneYear = 31556952000;

  const start = getDateLastYear();
  const end = getDateLastYear(true);

  const shots = useSWR(
    /* GraphQL */ `
      query {
        shots(
          startDate: "${start.year}-${start.month}-${start.day}"
          endDate: "${end.year}-${end.month}-${end.day}"
          type: "sys"
        ) {
          attachments
        }
      }
    `,
    fetcher,
  );

  const shot = () => {
    const shotarr =
      shots.data?.shots.filter((shot: IShot) =>
        shot.attachments?.startsWith("https"),
      ) ?? [];
    const len = shotarr.length;
    const idx = Math.floor(Math.random() * len);

    return shotarr[idx];
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((document.querySelector(".home-img") as HTMLImageElement).complete) {
        sequentialFadeIn("home-img");
      }
      sequentialFadeIn("load");
    }
  }, []);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <main>
        <div className="absolute w-full">
          <div className="container mx-auto grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-0 h-screen md:h-auto">
            <div className="h-full md:h-screen flex flex-col justify-center">
              <h1 className="font-bold text-9xl load transition-all -translate-y-10 opacity-0 duration-500">
                Framed
              </h1>
              <h2 className="text-2xl font-bold load transition-all -translate-y-10 opacity-0 duration-500">
                Year in Review 2023
              </h2>
            </div>
          </div>
        </div>
        <div className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-0 h-screen md:h-auto">
          <div className="h-full md:h-screen flex flex-col justify-center"></div>
          <picture>
            <img
              loading="lazy"
              className="home-img transition-all -translate-y-10 opacity-0 duration-500 h-full md:h-screen object-cover w-full shadow-2xl"
              src={shot()?.attachments}
              alt="Landscape picture"
            />
          </picture>
        </div>
      </main>
    </>
  );
};

export default Home;
