import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

export default function CommonPieChart({
  labels,
  colors,
  series,
  labelsfontSize,
  style,
  timebased,
  height,
  clickedBar,
}) {
  const [mobileView, setMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.outerWidth <= 768) {
        setMobileView(true);
      } else {
        setMobileView(false);
      }
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Format time if timebased
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
      type: "pie",
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const label = labels[config.dataPointIndex];
          clickedBar ? clickedBar(label) : "";
        },
      },
    },
    labels: labels,
    colors: colors,
    dataLabels: {
      enabled: true,
      style: {
        fontSize: mobileView ? "11px" : labelsfontSize || "13px",
        fontFamily: "Poppins, sans-serif",
        fontWeight: 400,
        colors: ["#ffffff"],
      },
      formatter: function (val, opts) {
        const value = series[opts.seriesIndex];
        // ✅ Only show count (no label)
        if (timebased === "true") {
          return formatTime(value);
        }
        return value;
      },
    },
    tooltip: {
      enabled: true,
      style: {
        fontFamily: "Poppins, sans-serif", // ✅ Tooltip font family
        fontSize: "11px",
      },
      y: {
        formatter: function (val) {
          if (timebased === "true") {
            return formatTime(val);
          }
          return val;
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "11px",
      fontFamily: "Poppins, sans-serif",
      formatter: function (seriesName, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];
        if (timebased === "true") {
          return `${seriesName}: ${formatTime(value)}`;
        }
        return `${seriesName}: ${value}`;
      },
    },
  };

  return (
    <div style={style}>
      <ReactApexChart
        options={options}
        series={series}
        type="pie"
        height={height ? height : 270}
        timebased={timebased}
      />
    </div>
  );
}
