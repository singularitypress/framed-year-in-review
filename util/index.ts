import { IShot } from "@types";

export const calendarDataFormat = (data: IShot[]) => {
  return Object.values(
    data.reduce(
      (acc, shot) => {
        const shotDate = shot.date.replace(/T.*$/g, "");

        if (acc[shotDate]) {
          acc[shotDate].value += 1;
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
