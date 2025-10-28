import React, { useEffect, useState, useRef } from "react";
import ReactApexChart from "react-apexcharts";

export default function CommonDonutChart({
  labels,
  colors,
  series,
  labelsfontSize,
  style,
  timebased,
  height,
  clickedBar,
  enablePointer,
}) {
  const [mobileView, setMobileView] = useState(false);
  const chartId = useRef(`chart-${Math.random().toString(36).substring(2, 9)}`);
  const observerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setMobileView(window.outerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!enablePointer) return;

    const rootSelector = `#${chartId.current}`;
    const setPointerOnSlices = (root = document) => {
      // try several likely selectors used by ApexCharts
      const selectors = [
        `${rootSelector} .apexcharts-pie-series path`,
        `${rootSelector} .apexcharts-pie-area path`,
        `${rootSelector} .apexcharts-series path`,
        `${rootSelector} .apexcharts-pie-slice`,
        `${rootSelector} .apexcharts-markers .apexcharts-marker`,
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          el.style.cursor = "pointer";
        });
      });
    };

    // initial attempt (in case chart already rendered)
    setPointerOnSlices(document);

    // observe for new nodes inside the chart container
    const chartContainer = document.querySelector(rootSelector);
    if (chartContainer) {
      const observer = new MutationObserver((mutations) => {
        // whenever children are added, try to set pointer on slices
        let added = false;
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length) {
            added = true;
            break;
          }
        }
        if (added) setPointerOnSlices(document);
      });
      observer.observe(chartContainer, { childList: true, subtree: true });
      observerRef.current = observer;
    }

    // As a safety, also append a style tag that targets the chart id (useful if selectors match)
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-apex-pointer", chartId.current);
    styleEl.innerHTML = `
      #${chartId.current} .apexcharts-pie-series path,
      #${chartId.current} .apexcharts-pie-area path,
      #${chartId.current} .apexcharts-series path,
      #${chartId.current} .apexcharts-pie-slice,
      #${chartId.current} .apexcharts-markers .apexcharts-marker {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      // cleanup
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      const existing = document.querySelectorAll(
        `style[data-apex-pointer="${chartId.current}"]`
      );
      existing.forEach((s) => s.remove());
    };
  }, [enablePointer]);

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
      events: {
        // prefer native event: set pointer on the target element when hovering
        mouseMove: function (event, chartContext, config) {
          try {
            if (!enablePointer) return;
            // event.target is the hovered SVG element usually
            if (event && event.target) {
              // set pointer for the hovered node (and bubble up a little)
              event.target.style && (event.target.style.cursor = "pointer");
              // also try parent nodes (some browsers/elements need it)
              if (event.target.parentNode && event.target.parentNode.style)
                event.target.parentNode.style.cursor = "pointer";
            }
          } catch (e) {
            /* ignore */
          }
        },
        // when leaving, reset to default for safety
        mouseLeave: function (event, chartContext, config) {
          try {
            if (event && event.target) {
              event.target.style && (event.target.style.cursor = "default");
              if (event.target.parentNode && event.target.parentNode.style)
                event.target.parentNode.style.cursor = "default";
            }
          } catch (e) {}
        },
        // selection click handler (as you already use)
        dataPointSelection: function (event, chartContext, config) {
          const label = labels && labels[config.dataPointIndex];
          if (clickedBar) clickedBar(label);
        },
      },
    },
    labels: labels,
    colors: colors,
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: false,
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: mobileView ? "10px" : "13px",
        fontWeight: 600,
        colors: ["#fff"],
        fontFamily: "Poppins, sans-serif",
      },
      formatter: function (val, opts) {
        const value = series[opts.seriesIndex];
        if (timebased === "true") return formatTime(value);
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
    <div
      id={chartId.current}
      style={{
        ...(style || {}),
        // safety: make the wrapper pointer when enablePointer, helps fallback
        cursor: enablePointer ? "default" : "auto",
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={height || 270}
      />
    </div>
  );
}
