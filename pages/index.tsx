import Head from "next/head";
import React, { useMemo } from "react";
import { IShot } from "@types";
import { getDateLastYear } from "@util";
import { Container, LoadWrapper } from "@components/global";
import useSWR from "swr";
import {
  ErrorNoData,
  ErrorSection,
  LoadingSection,
} from "@components/experience-fragments";
import Link from "next/link";

const fetcher = (query: string) =>
  fetch(`/api/graphql`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((json) => {
      const len = json.data.shots.length;
      const data = json.data.shots[Math.floor(Math.random() * len - 1)];
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

  const { data, error, isLoading } = useSWR<IShot>(query, fetcher);

  if (isLoading) {
    return <LoadingSection />;
  }

  if (error) {
    return <ErrorSection message={error.message} />;
  }

  if (!data) {
    return <ErrorNoData />;
  }

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <LoadWrapper>
        <main>
          <div className="absolute z-20 w-full">
            <Container className="grid grid-rows-2 md:grid-rows-none md:grid-cols-2 gap-0 h-screen md:h-auto">
              <div className="h-full md:h-screen flex flex-col justify-center pr-4 md:pr-10 md:text-right">
                <h1 className="font-bold text-6xl md:text-8x1 lg:text-8xl load transition-all -translate-y-10 opacity-0 duration-500">
                  Framed
                </h1>
                <h2 className="text-2xl font-bold load transition-all -translate-y-10 opacity-0 duration-500">
                  Year in Review 2022
                </h2>
                <Link
                  className="rounded-md bg-gray-100 text-gray-900 border hover:bg-framed-black hover:text-gray-100 w-fit ml-auto px-4 py-2 mt-4 font-bold load transition-all -translate-y-10 opacity-0 duration-500"
                  href="/data"
                >
                  View
                </Link>
              </div>
            </Container>
          </div>
          <div className="grid z-10 md:grid-rows-none md:grid-cols-2 gap-0 h-screen md:h-auto">
            <div className="h-full z-10 md:h-screen flex flex-col justify-center bg-black/30 backdrop-blur-3xl border-r border-r-white/10 shadow-2xl"></div>
          </div>
          <picture>
            <img
              loading="lazy"
              className="load top-0 fixed transition-all -translate-y-10 opacity-0 duration-500 h-full md:h-screen object-cover w-full"
              src={`${data.attachments?.replace(
                "https://cdn.discordapp.com",
                "https://media.discordapp.net",
              )}?width=1920&height=1080`}
              alt="Landscape picture"
            />
          </picture>
        </main>
      </LoadWrapper>
    </>
  );
};

export default Home;
