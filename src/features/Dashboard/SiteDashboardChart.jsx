import React, { useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";

export default function SiteDashboardChart({
  height = 280,
  xaxis,
  series,
  colors,
  fontSize,
  type,
  enablePointer = false,
}) {
  const chartId = useRef(`chart-${Math.random().toString(36).substring(2, 9)}`);

  const barColors = series.map((_, index) => {
    if (index === 0) return "#258a25"; // first bar
    if (index === series.length - 1) return "#b22021"; // last bar
    return "#5b6aca"; // middle bars
  });

  const getBarColors = () => {
    return [colors[0]];
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
        // stacked: true,
        height: 400,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          barHeight: "60%",
          borderRadius: 3,
          borderRadiusApplication: "end",
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val,
        style: {
          fontSize: "12px",
          fontWeight: 500,
          fontFamily: "Poppins, sans-serif",
        },
      },
      xaxis: {
        categories: xaxis,
        labels: {
          rotate: -45, // rotate labels
          rotateAlways: true, // always apply rotation
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
        followCursor: true, // ✅ makes the tooltip move with cursor
        x: { show: false },
        y: {
          formatter: (val, { dataPointIndex, w }) => {
            const siteName = w.config.xaxis.categories[dataPointIndex];
            const value = series[dataPointIndex];
            const color = w.config.colors[0]; //

            return ` <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span 
            style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color};">
          </span>
          <span style="font-weight:600; font-family:Poppins, sans-serif;">${siteName}</span>
        </div>
         <div style="font-weight:400; font-family:Poppins, sans-serif">
          Total Leads: 
          <span style="font-weight:600;">
            ${value}
          </span>
        </div>
         </div>
      `;
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
