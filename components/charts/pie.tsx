import { ResponsivePie, PieSvgProps, DefaultRawDatum } from "@nivo/pie";
import React from "react";

export const Pie = (
  props: Omit<PieSvgProps<DefaultRawDatum>, "width" | "height">,
) => {
  const total = props.data.reduce((total, item) => total + item.value, 0);
  return (
    <ResponsivePie
      margin={{ top: 40, bottom: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={4}
      activeOuterRadiusOffset={8}
      borderWidth={0}
      colors={[
        "#003f5c",
        "#2f4b7c",
        "#665191",
        "#a05195",
        "#d45087",
        "#f95d6a",
        "#ff7c43",
        "#ffa600",
      ].reverse()}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={1}
      arcLinkLabel={(d) => `${d.id} (${((d.value / total) * 100).toFixed(2)}%)`}
      enableArcLabels={false}
      arcLinkLabelsTextColor="#FFF"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [
          ["darker", 2],
          ["opacity", 2],
        ],
      }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.15)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.15)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={props.data.map((item, index) => ({
        match: {
          id: item.id,
        },
        id: index % 2 === 0 ? "dots" : "lines",
      }))}
      {...props}
    />
  );
};
