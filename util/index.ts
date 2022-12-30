import { IShot } from "@types";

export const calendarDataFormat = (data: IShot[]) => {
  return data.reduce((acc, shot) => {
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
};
