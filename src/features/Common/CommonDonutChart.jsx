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
      if (window.outerWidth <= 768) {
        setMobileView(true);
      } else {
        setMobileView(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate total hours and minutes
  const totalHours = series.reduce((acc, val) => acc + val, 0);
  const totalMinutes = Math.round((totalHours % 1) * 60);

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
          size: "75%",
          labels: {
            show: true,
            total: {
              showAlways: false,
              show: true,
              color: "#2d2d2d",
              fontWeight: 600, // Increase font weight
              fontSize: mobileView ? "12px" : labelsfontSize, // Dynamically adjust font size
              fontFamily: "Poppins, sans-serif", // Change font family of y-axis labels
              formatter: function (val) {
                if (timebased === "true") {
                  const totalHours = series.reduce(
                    (acc, val) => acc + (val || 0),
                    0
                  );
                  return formatTime(totalHours);
                } else {
                  return val.globals.seriesTotals.reduce((a, b) => a + b, 0);
                }
              },
            },
            name: {
              show: true,
            },
            value: {
              show: true,
              fontSize: mobileView ? "12px" : "17px",
              color: "#2d2d2d",
              fontFamily: "Poppins, sans-serif", // Change font family of y-axis labels
              fontWeight: 700, // Increase font weight
              formatter: function (val) {
                if (timebased === "true") {
                  return formatTime(val);
                }
                return val; // Display value in the tooltip
              },
            },
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          if (timebased === "true") {
            return formatTime(val);
          }
          return val; // Display value in the tooltip
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: "bottom",
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
        type="donut"
        height={height ? height : 270}
        timebased={timebased}
      />
    </div>
  );
}
