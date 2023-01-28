import Head from "next/head";
import React, { useEffect } from "react";
import { IShot } from "@types";
import { getDateLastYear, sequentialFadeIn } from "@util";
import { Container } from "@components/global";
import useSWR from "swr";

const fetcher = (query: string) =>
  fetch(`${process.env.BASE_FETCH_URL}/api/graphql`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((json) => {
      const data =
        json.data.shots[Math.floor(Math.random() * json.data.shots.length)];

      setTimeout(() => {
        if (typeof window !== "undefined") {
          sequentialFadeIn("bg-img");
          sequentialFadeIn("load");
        }
      }, 100);

      return data as IShot;
    });

const Home = () => {
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

  const { data, error, isLoading } = useSWR<IShot>(
    /* GraphQL */ `
      query {
        shots(
          startDate: "2019-01-01"
          endDate: "2022-12-31"
          type: "sys"
          format: "calendar"
        ) {
          attachments
        }
      }
    `,
    fetcher,
  );

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white py-1 px-3 rounded-md shadow-md">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white py-1 px-3 rounded-md shadow-md">
        Error: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-900 text-white py-1 px-3 rounded-md shadow-md">
        Error: No data
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <main>
        <div className="absolute z-20 w-full">
          <Container className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-0 h-screen md:h-auto">
            <div className="h-full md:h-screen flex flex-col justify-center pr-4 md:pr-10 md:text-right">
              <h1 className="font-bold text-6xl md:text-8x1 lg:text-8xl load transition-all -translate-y-10 opacity-0 duration-500">
                Framed
              </h1>
              <h2 className="text-2xl font-bold load transition-all -translate-y-10 opacity-0 duration-500">
                Year in Review 2023
              </h2>
            </div>
          </Container>
        </div>
        <div className="grid z-10 md:grid-rows-none md:grid-cols-2 gap-0 h-screen md:h-auto">
          <div className="h-full z-10 md:h-screen flex flex-col justify-center bg-black/30 backdrop-blur-3xl border-r border-r-white/10 shadow-2xl"></div>
        </div>
        <picture>
          <img
            loading="lazy"
            className="home-img top-0 fixed transition-all -translate-y-10 opacity-0 duration-500 delay-1000 h-full md:h-screen object-cover w-full"
            src={data.attachments?.replace(
              "https://cdn.discordapp.com",
              "https://media.discordapp.net",
            )}
            alt="Landscape picture"
          />
        </picture>
      </main>
    </>
  );
};

export default Home;
