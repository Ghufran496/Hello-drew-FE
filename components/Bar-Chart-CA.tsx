import React from "react";

import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";

interface ChartData {
  x: number;

  y: number;
}

interface BarChartComponentProps {
  data: ChartData[];
}

interface CustomLabelProps {
  x: number;
  y: number;
  value: number;
}

const CustomLabel: React.FC<CustomLabelProps> = (props) => {
  const { x, y, value } = props;

  return (
    <text
      x={x}
      y={y}
      dx={25}
      dy={-5}
      fontSize="20"
      fontWeight="bold"
      fill="#4a5568"
      textAnchor="end"
    >
      {value}
    </text>
  );
};

const BarChartComponent: React.FC<BarChartComponentProps> = ({ data }) => {
  const slicedData = data.slice(0, 4);

  const textLabels = ["MissedCalls", "Answered", "Calls", "TotalCalls"];

  const formattedData = slicedData.map((item, index) => ({
    ...item,

    textLabel: textLabels[index],
  }));

  return (
    <div className="bg-transparent rounded-lg w-fit-content">
      <BarChart
        width={350}
        height={150}
        style={{ width: "full", display: "block" }}
        data={formattedData}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="textLabel"
          tickLine={false}
          axisLine={false}
          tick={{
            fontSize: 12,
            fill: "#6b7280",
          }}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}`}
          tick={{
            fontSize: 12,

            fill: "#6b7280",
          }}
        />

        <Bar
          dataKey="y"
          fill="#3b82f6"
          barSize={28}
          label={(props) => <CustomLabel {...props} />}
        ></Bar>
      </BarChart>
    </div>
  );
};

export default BarChartComponent;
