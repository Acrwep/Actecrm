import React, { useRef } from "react";
import ReactApexChart from "react-apexcharts";

export default function PostSalePerformanceChart({ chartData }) {
  const chartId = useRef(`chart-${Math.random().toString(36).substring(2, 9)}`);

  const labels = [
    "Awaiting Student Verify",
    "Awaiting Trainer",
    "Awaiting Trainer Verify",
    "Verified Trainers",
    "Rejected Trainers",
    "Awaiting Class",
    "Class Scheduled",
    "Class Going",
    "Google Reviews",
    "LinkedIn Reviews",
    "Class Completed",
    "Others",
  ];

  // Convert chartData into Apex series
  const series = chartData.map((value, index) => ({
    name: labels[index],
    data: [value], // IMPORTANT → MUST be an array
  }));

  const colors = [
    "#ffa602c7",
    "#2ed573",
    "#1e90ff",
    "#00cecbd0",
    "#d32f2fcc",
    "#607d8b",
    "#a29bfec7",
    "#00cecbd0",
    "#a1c60c",
    "rgba(10 102 194)",
    "#258a25",
    "#d32f2fcc",
  ];

  const options = {
    chart: {
      id: chartId.current,
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },

    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "40%",
        borderRadius: 4,
      },
    },

    colors: colors,

    xaxis: {
      categories: ["Total"],
    },

    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Poppins, sans-serif",
      fontSize: "11px",
      markers: {
        size: 5,
        shape: "circle", // ✅ make legend icon round
        width: 6,
        height: 6,
        radius: 5, // optional: makes circle perfect
      },
      formatter: function (seriesName, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];
        return `${seriesName}: <b>${value}</b>`;
      },
    },

    tooltip: {
      shared: false,
      followCursor: true, // ✅ makes the tooltip move with cursor
      x: { show: false },
      y: {
        formatter: (val, { seriesIndex, w }) => {
          const color = w.config.colors[seriesIndex]; // ✅ series color
          const label = w.config.series[seriesIndex].name || "";

          return `<div style="font-family:Poppins, sans-serif;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
            <span 
              style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color};">
            </span>
            <span style="font-weight:600;">${label}: ${val}</span>
          </div>
        </div>
      `;
        },
        title: { formatter: () => "" },
      },
      style: { fontFamily: "Poppins, sans-serif" },
      marker: { show: false }, // ✅ disables the default ApexCharts circle
    },

    dataLabels: {
      enabled: true,
    },
  };

  return (
    <div id={chartId.current} style={{ marginTop: "20px" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={250}
      />
    </div>
  );
}
