import React, { useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";

export default function BranchwiseSalesChart({
  height = 280,
  xaxis,
  series,
  colors,
  isRupees,
  collections = [],
  targets = [],
  clickedBar,
  fontSize,
  type,
  enablePointer = false,
}) {
  const chartId = useRef(`chart-${Math.random().toString(36).substring(2, 9)}`);

  // ✅ Dynamically compute colors based on percentage if type == "Collection"
  const getBarColors = () => {
    if (type === "Collection") {
      return series.map((val) => {
        if (val <= 25) return "#E53935"; // red
        else if (val <= 50) return "#FB8C00"; // orange
        else if (val <= 75) return "#00ACC1"; // teal green
        else if (val <= 99) return "#A2C148"; // lime-green
        else if (val <= 125) return "#2E7D32"; // dark green
        else return "#ffbf00"; // gold
      });
    } else {
      return [colors[0]];
    }
  };

  const options = {
    series: [
      {
        name: "Funnel Series",
        data: series,
      },
    ],
    options: {
      chart: {
        id: chartId.current,
        type: "bar",
        height: 400,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          barHeight: "60%",
          borderRadius: 3,
          borderRadiusApplication: "end",
          distributed: type === "Collection", // ✅ distribute bars for color per bar
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => "",
        style: {
          fontSize: "12px",
          fontWeight: 500,
          fontFamily: "Poppins, sans-serif",
        },
      },
      xaxis: {
        categories: xaxis,
        labels: {
          style: {
            fontSize: fontSize || "12px",
            fontFamily: "Poppins, sans-serif",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: fontSize || "12px",
            fontFamily: "Poppins, sans-serif",
          },
        },
      },
      // ✅ Apply dynamic color array here
      colors: colors,

      grid: {
        xaxis: { lines: { show: false } },
      },
      tooltip: {
        shared: false,
        followCursor: true,
        x: { show: false },
        y: {
          formatter: (val, { dataPointIndex, w }) => {
            const category = w.config.xaxis.categories[dataPointIndex];
            const branchName = category;
            const value = series[dataPointIndex];
            const color = w.config.colors[0];
            return ` <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span 
            style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color};">
          </span>
          <span style="font-weight:600; font-family:Poppins, sans-serif;">${branchName}</span>
        </div>
         <div style="font-weight:400; font-family:Poppins, sans-serif">
          ${
            type === "Sale"
              ? "Sale Volume"
              : type == "Collection"
              ? "Collection"
              : "Pending"
          }: 
          <span style="font-weight:600;">
            ₹${Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>`;
          },
          title: { formatter: () => "" },
        },
        style: { fontFamily: "Poppins, sans-serif" },
        marker: { show: false },
      },
      legend: { show: false },
    },
  };

  return (
    <div id={chartId.current}>
      <ReactApexChart
        options={options.options}
        series={options.series}
        type="bar"
        height={height}
      />
    </div>
  );
}
