import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

export default function CommonDonutChart({
  labels,
  colors,
  series,
  labelsfontSize,
  style,
  timebased,
  height,
}) {
  const [mobileView, setMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.outerWidth <= 768);
    };
    handleResize(); // initialize once
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatTime = (value) => {
    if (isNaN(value) || value === null || value === undefined)
      return "0hr 0m 0s";
    const hours = Math.floor(value);
    const minutes = Math.floor((value % 1) * 60);
    const seconds = Math.floor(((value % 1) * 3600) % 60);
    return `${hours}hr ${minutes}m ${seconds}s`;
  };

  const options = {
    chart: {
      type: "donut",
    },
    labels: labels,
    colors: colors,
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: false, // ❌ Hide center text
          },
        },
      },
    },
    dataLabels: {
      enabled: true, // ✅ Show values on slices
      style: {
        fontSize: mobileView ? "10px" : "13px",
        fontWeight: 600,
        colors: ["#fff"],
        fontFamily: "Poppins, sans-serif",
      },
      formatter: function (val, opts) {
        const value = series[opts.seriesIndex];
        if (timebased === "true") {
          return formatTime(value);
        }
        return value;
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          if (timebased === "true") return formatTime(val);
          return val;
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Poppins, sans-serif",
      fontSize: "11px",
      formatter: function (seriesName, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];
        if (timebased === "true") return `${seriesName}: ${formatTime(value)}`;
        return `${seriesName}: ${value}`;
      },
    },
  };

  return (
    <div style={style}>
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={height || 270}
      />
    </div>
  );
}
