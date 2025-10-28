import React, { useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";

export default function UserwiseSalesChart({
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
          horizontal: true,
          barHeight: "60%",
          borderRadius: 3,
          borderRadiusApplication: "end",
          distributed: false,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) =>
          type == "Collection"
            ? val + "%"
            : Number(val).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
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
      colors: [colors[0]], // ✅ use the first color only
      grid: {
        xaxis: { lines: { show: false } },
      },
      tooltip: {
        shared: false,
        fixed: {
          enabled: true,
          position: "topRight",
          offsetX: 0,
          offsetY: 8,
        },
        x: { show: false },
        y: {
          formatter: (val, { dataPointIndex, w }) => {
            const category = w.config.xaxis.categories[dataPointIndex];
            if (type == "Collection") {
              const userName = w.config.xaxis.categories[dataPointIndex];
              const target = targets[dataPointIndex];
              const collection = collections[dataPointIndex];
              const color = w.config.colors[0]; //
              return ` <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span 
            style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color};">
          </span>
          <span style="font-weight:600; font-family:Poppins, sans-serif;">${userName}</span>
        </div>
         <div style="font-weight:400; font-family:Poppins, sans-serif;margin-bottom:4px">
          Target: 
          <span style="font-weight:600;">
            ₹${Number(target).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div style="font-weight:400; font-family:Poppins, sans-serif;">
          Collection: 
          <span style="font-weight:600; color:#258a25;">
            ₹${Number(collection).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>`;
            } else {
              const userName = w.config.xaxis.categories[dataPointIndex];
              const value = series[dataPointIndex];
              const color = w.config.colors[0]; //
              return ` <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span 
            style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color};">
          </span>
          <span style="font-weight:600; font-family:Poppins, sans-serif;">${userName}</span>
        </div>
         <div style="font-weight:400; font-family:Poppins, sans-serif">
          ${type == "Sale" ? "Sale Volume" : "Pending"}: 
          <span style="font-weight:600;">
            ₹${Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      `;
            }
          },
          title: { formatter: () => "" },
        },
        style: { fontFamily: "Poppins, sans-serif" },
        marker: { show: false }, // ✅ disables the default ApexCharts circle
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
