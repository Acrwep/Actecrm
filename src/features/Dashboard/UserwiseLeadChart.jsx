import React, { useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";

export default function UserwiseLeadChart({
  height = 280,
  xaxis,
  series,
  colors,
  conversion,
  customers,
  clickedBar,
  fontSize,
  totalFollowUps,
  followUpHandled,
  totalFollowUp,
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
    if (type == "Leads" || type == "Follow Up") {
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
        // stacked: true,
        height: 400,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
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
            const userName = w.config.xaxis.categories[dataPointIndex];
            const value = series[dataPointIndex];
            const joinings = customers[dataPointIndex];
            const conversion_value = conversion[dataPointIndex];
            const followup_handledcount = followUpHandled[dataPointIndex];
            const total_followup = totalFollowUp[dataPointIndex];
            const color = w.config.colors[0]; //

            if (type == "Leads") {
              return ` <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span 
            style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color};">
          </span>
          <span style="font-weight:600; font-family:Poppins, sans-serif;">${userName}</span>
        </div>
         <div style="font-weight:400; font-family:Poppins, sans-serif">
          Total Leads: 
          <span style="font-weight:600;">
            ${value}
          </span>
        </div>
           <div style="font-weight:400; font-family:Poppins, sans-serif;margin-top:4px">
          Total Joinings: 
          <span style="font-weight:600;">
            ${joinings}
          </span>
        </div>
         </div>
           <div style="font-weight:400; font-family:Poppins, sans-serif;margin-top:4px">
          Conversion: 
          <span style="font-weight:600;">
            ${conversion_value}%
          </span>
        </div>
      `;
            } else if (type == "Follow Up") {
              return ` <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span 
            style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color};">
          </span>
          <span style="font-weight:600; font-family:Poppins, sans-serif;">${userName}</span>
        </div>
         <div style="font-weight:400; font-family:Poppins, sans-serif">
          Total Followup: 
          <span style="font-weight:600;">
            ${total_followup}
          </span>
        </div>
           <div style="font-weight:400; font-family:Poppins, sans-serif;margin-top:4px">
         Followup Handled: 
          <span style="font-weight:600;">
            ${followup_handledcount}
          </span>
        </div>
         </div>
           <div style="font-weight:400; font-family:Poppins, sans-serif;margin-top:4px">
          Followup Un-Handled: 
          <span style="font-weight:600;">
            ${value}
          </span>
        </div>
          <div style="font-weight:400; font-family:Poppins, sans-serif;margin-top:4px">
          Efficiency: 
          <span style="font-weight:600;">
            ${conversion_value}%
          </span>
        </div>
      `;
            } else {
              return ` <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span 
            style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color};">
          </span>
          <span style="font-weight:600; font-family:Poppins, sans-serif;">${userName}</span>
        </div>
         <div style="font-weight:400; font-family:Poppins, sans-serif">
          Total Joinings: 
          <span style="font-weight:600;">
            ${joinings}
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
