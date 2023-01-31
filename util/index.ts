import { IShot } from "@types";

export const calendarDataFormat = (data: IShot[]) => {
  return Object.values(
    data.reduce(
      (acc, shot) => {
        const shotDate = shot.date.replace(/T.*$/g, "");

        if (acc[shotDate]) {
          acc[shotDate].value++;
          acc[shotDate].shots.push(shot);
        } else {
          acc[shotDate] = {
            value: 1,
            day: shotDate,
            shots: [shot],
          };
        }
        return acc;
      },
      {} as {
        [key: string]: { value: number; day: string; shots: IShot[] };
      },
    ),
  );
};

export const gameDistPie = (data: IShot[], size: number) => {
  return Object.values(
    data.reduce((acc, shot) => {
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
    }, {} as { [key: string]: { id: string; label: string; value: number } }),
  )
    .sort((a, b) => b.value - a.value)
    .reduce((acc, shot, i) => {
      if (i < size) {
        return [...acc, shot];
      } else {
        acc[size - 1].id = "Other";
        acc[size - 1].label = "Other";
        acc[size - 1].value += shot.value;
        return acc;
      }
    }, [] as { id: string; label: string; value: number }[]);
};

export const sequentialFadeIn = (className: string) => {
  if (typeof window !== "undefined") {
    Array.prototype.slice
      .call(document.querySelectorAll(`.${className}`))
      .forEach((item, index) => {
        setTimeout(() => {
          item.classList.remove("opacity-0");
          item.classList.remove("-translate-y-10");
        }, 250 * (index + 1));
      });
  }
};

export const getDateLastYear = (tomorrow = false) => {
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

export const COLOURS = {
  HEAT_8: [
    "#003f5c",
    "#2f4b7c",
    "#665191",
    "#a05195",
    "#d45087",
    "#f95d6a",
    "#ff7c43",
    "#ffa600",
  ].reverse(),
  PIE_11: [
    "#ff8811",
    "#f4d06f",
    "#483D3F",
    "#9dd9d2",
    "#392f5a",
    "#5fad56",
    "#f2c14e",
    "#f78154",
    "#4d9078",
    "#b4436c",
    "#314CB6",
  ],
};
