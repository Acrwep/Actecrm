import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Progress } from "antd";
import "./styles.css";
import CustomDateRangePicker from "../Common/CustomDateRangePicker";
import { addDays, startOfMonth, endOfMonth } from "date-fns";
import ReactApexChart from "react-apexcharts";
import { LuCalendarDays } from "react-icons/lu";
import moment from "moment";

export default function Dashboard() {
  const wrapperRef = useRef(null);
  const wrappertwoRef = useRef(null);
  const wrapperthreeRef = useRef(null);

  //card 1
  const [isOpenLeadBoardCalendar, setIsOpenLeadBoardCalendar] = useState(false);
  const [leadBoardDate, setLeadBoardDate] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), -6),
      key: "selection",
      color: "",
    },
  ]);
  const [leadBoardDateSelect, setLeadBoardDateSelect] =
    useState("Custom Range");
  //card 2
  const [isOpenChannelCalendar, setIsOpenChannelCalendar] = useState(false);
  const [channelDate, setChannelDate] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), -6),
      key: "selection",
      color: "",
    },
  ]);
  const [channelDateSelect, setChannelDateSelect] = useState("Custom Range");
  //card 3
  const [isOpenLeadChartCalendar, setIsOpenLeadChartCalendar] = useState(false);
  const [leadDetailsDate, setLeadDetailsDate] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), -6),
      key: "selection",
      color: "",
    },
  ]);
  const [leadDetailsSelect, setLeadDetailsSelect] = useState("Custom Range");

  //other states
  const leadDetils = [
    { id: 1, leadType: "Call", percentage: "12%", customers: "2" },
    { id: 2, leadType: "Direct", percentage: "16%", customers: "6" },
    { id: 3, leadType: "Enquiry form", percentage: "18%", customers: "18" },
    { id: 4, leadType: "SMO", percentage: "30%", customers: "25" },
    { id: 5, leadType: "Reference", percentage: "40%", customers: "25" },
  ];

  const [state, setState] = React.useState({
    series: [
      {
        name: "Funnel Series",
        data: [1380, 800, 1100, 990],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 400,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "60%",
          borderRadius: 4,
          distributed: true, // 👈 Enable different colors per bar
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opt) {
          return val;
        },
        style: {
          fontSize: "13px",
          fontWeight: 500,
          fontFamily: "Poppins, sans-serif",
        },
      },
      xaxis: {
        categories: [
          "Total Leads",
          "Reached Out",
          "Covert to customers",
          "Not-Covert to customers",
        ],
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
            fontFamily: "Poppins, sans-serif",
          },
        },
      },
      colors: ["#5b6aca", "#ed760c", "#258a25", "#b22021"],
      grid: {
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function (val) {
            return val; // Display value in the tooltip
          },
        },
      },
      legend: {
        fontFamily: "Poppins, sans-serif",
        show: false,
        formatter: function (seriesName, opts) {
          const value = opts.w.globals.series[opts.seriesIndex];
          return `${seriesName}: ${value}`;
        },
      },
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is outside the entire component
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpenLeadBoardCalendar(false);
      }
      if (
        wrappertwoRef.current &&
        !wrappertwoRef.current.contains(event.target)
      ) {
        setIsOpenChannelCalendar(false);
      }
      if (
        wrapperthreeRef.current &&
        !wrapperthreeRef.current.contains(event.target)
      ) {
        setIsOpenLeadChartCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBoardDates = (item) => {
    setLeadBoardDate([item.selection]);
  };

  const handleChannelDateRange = (item) => {
    setChannelDate([item.selection]);
  };

  const handleLeadDetailsDateRange = (item) => {
    setLeadDetailsDate([item.selection]);
  };

  return (
    <div
      style={{
        padding: "0px 0px 30px 0px",
      }}
    >
      <div className="dashboard_leadcount_card">
        <Row className="dashboard_leadcount_header_container">
          <Col span={12}>
            <div style={{ padding: "12px 12px 8px 12px" }}>
              <p className="dashboard_scrorecard_heading">Score Board</p>
              <p className="dashboard_daterange_text">
                <span style={{ fontWeight: "500" }}>Date Range: </span>
                {`(${moment(leadBoardDate[0].startDate).format(
                  "DD MMM YYYY"
                )} to ${moment(leadBoardDate[0].endDate).format(
                  "DD MMM YYYY"
                )})`}
              </p>
            </div>
          </Col>
          <Col
            span={12}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <div ref={wrapperRef}>
              <div
                className="dashboard_scorecard_dateiconContainer"
                onClick={() =>
                  setIsOpenLeadBoardCalendar(!isOpenLeadBoardCalendar)
                }
              >
                <LuCalendarDays size={18} />
                <p>Date Range</p>
              </div>

              {isOpenLeadBoardCalendar && (
                <div className="dashboard_daterangeContainer">
                  <CustomDateRangePicker
                    onChange={handleBoardDates}
                    ranges={leadBoardDate}
                    openState={(value) => setIsOpenLeadBoardCalendar(value)}
                    onChangeSelect={(value) => setLeadBoardDateSelect(value)}
                    selectValue={leadBoardDateSelect}
                  />
                </div>
              )}
            </div>
          </Col>
        </Row>

        <Row className="dashboard_leadcountcard_progressbar_mainContainer">
          <Col span={22}>
            <Row gutter={50}>
              <Col span={6}>
                <div>
                  <p className="dashboard_leadcountcard_subheadings">
                    Total Leads
                  </p>
                  <p className="dashboard_leadcountcard_count">8,234</p>
                  <Progress
                    percent={60}
                    showInfo
                    format={(percent) => `Verified: ${percent}`}
                    className="dashboard_leadcountcard_progressbar"
                  />

                  <Progress
                    percent={20}
                    format={(percent) => `Unverified: ${percent}`}
                    className="dashboard_leadcountcard_progressbar"
                  />
                </div>
              </Col>

              <Col span={6}>
                <div>
                  <p className="dashboard_leadcountcard_subheadings">
                    Total Enrollment
                  </p>
                  <p className="dashboard_leadcountcard_count">129</p>
                </div>
              </Col>

              <Col span={6}>
                <div>
                  <p className="dashboard_leadcountcard_subheadings">
                    Total Queries
                  </p>
                  <p className="dashboard_leadcountcard_count">0</p>
                  <Progress
                    percent={10}
                    showInfo
                    format={(percent) => `Open: ${percent}`}
                    className="dashboard_leadcountcard_progressbar"
                  />

                  <Progress
                    percent={20}
                    format={(percent) => `Progress: ${percent}`}
                    className="dashboard_leadcountcard_progressbar"
                  />

                  <Progress
                    percent={20}
                    format={(percent) => `Closed: ${percent}`}
                    className="dashboard_leadcountcard_progressbar"
                  />
                </div>
              </Col>

              <Col span={6}>
                <div>
                  <p className="dashboard_leadcountcard_subheadings">
                    Opportunity
                  </p>
                  <p className="dashboard_leadcountcard_count">1,323</p>

                  <Progress
                    percent={24}
                    showInfo
                    format={(percent) => `Contacted: ${percent}`}
                    className="dashboard_leadcountcard_progressbar"
                  />

                  <Progress
                    percent={60}
                    format={(percent) => `Qualified ${percent}`}
                    className="dashboard_leadcountcard_progressbar"
                  />

                  <Progress
                    percent={70}
                    format={(percent) => `Un-qualified: ${percent}`}
                    className="dashboard_leadcountcard_progressbar"
                  />

                  <Progress
                    percent={0}
                    format={(percent) => `Untouched: ${percent}`}
                    className="dashboard_leadcountcard_progressbar"
                  />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      <Row gutter={16} style={{ marginTop: "30px" }}>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="dashboard_leadcount_card">
            <Row className="dashboard_leadcount_header_container">
              <Col span={18}>
                <div style={{ padding: "12px 12px 8px 12px" }}>
                  <p className="dashboard_scrorecard_heading">
                    Top Performing Channels
                  </p>
                  <p className="dashboard_daterange_text">
                    <span style={{ fontWeight: "500" }}>Date Range: </span>
                    {`(${moment(channelDate[0].startDate).format(
                      "DD MMM YYYY"
                    )} to ${moment(channelDate[0].endDate).format(
                      "DD MMM YYYY"
                    )})`}
                  </p>
                </div>
              </Col>
              <Col
                span={6}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <div ref={wrappertwoRef}>
                  <div
                    className="dashboard_scorecard_dateiconContainer"
                    onClick={() =>
                      setIsOpenChannelCalendar(!isOpenChannelCalendar)
                    }
                  >
                    <LuCalendarDays size={18} />
                    <p>Date Range</p>
                  </div>

                  {isOpenChannelCalendar && (
                    <div className="dashboard_daterangeContainer">
                      <CustomDateRangePicker
                        onChange={handleChannelDateRange}
                        ranges={channelDate}
                        openState={(value) => setIsOpenChannelCalendar(value)}
                        onChangeSelect={(value) => setChannelDateSelect(value)}
                        selectValue={channelDateSelect}
                      />
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            <Row className="dashboard_performchannel_headingContainer">
              <Col span={8} className="dashboard_performchannel_heading_col">
                <p>Lead Type</p>
              </Col>
              <Col span={8} className="dashboard_performchannel_heading_col">
                <p>Percentage%</p>
              </Col>
              <Col span={8} className="dashboard_performchannel_heading_col">
                <p>Convert to customers</p>
              </Col>
            </Row>

            {leadDetils.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <Row
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid rgb(5 5 5 / 14%)",
                    }}
                  >
                    <Col span={8} className="dashboard_performchannel_data_col">
                      <p>{item.leadType}</p>
                    </Col>
                    <Col span={8} className="dashboard_performchannel_data_col">
                      <p>{item.percentage}</p>
                    </Col>
                    <Col span={8} className="dashboard_performchannel_data_col">
                      <p>{item.customers}</p>
                    </Col>
                  </Row>
                </React.Fragment>
              );
            })}
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="dashboard_leadcount_card">
            <Row className="dashboard_leadcount_header_container">
              <Col span={18}>
                <div style={{ padding: "12px 12px 8px 12px" }}>
                  <p className="dashboard_scrorecard_heading">Lead Details</p>

                  <p className="dashboard_daterange_text">
                    <span style={{ fontWeight: "500" }}>Date Range: </span>
                    {`(${moment(leadDetailsDate[0].startDate).format(
                      "DD MMM YYYY"
                    )} to ${moment(leadDetailsDate[0].endDate).format(
                      "DD MMM YYYY"
                    )})`}
                  </p>
                </div>
              </Col>
              <Col
                span={6}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <div ref={wrapperthreeRef}>
                  <div
                    className="dashboard_scorecard_dateiconContainer"
                    onClick={() =>
                      setIsOpenLeadChartCalendar(!isOpenLeadChartCalendar)
                    }
                  >
                    <LuCalendarDays size={18} />
                    <p>Date Range</p>
                  </div>

                  {isOpenLeadChartCalendar && (
                    <div className="dashboard_daterangeContainer">
                      <CustomDateRangePicker
                        onChange={handleLeadDetailsDateRange}
                        ranges={leadDetailsDate}
                        openState={(value) => setIsOpenLeadChartCalendar(value)}
                        onChangeSelect={(value) => setLeadDetailsSelect(value)}
                        selectValue={leadDetailsSelect}
                      />
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            {/* <CommonDonutChart
              labels={["Call", "Direct", "Enquiry form", "SMO", "Reference"]}
              colors={["#333b73", "#342b72", "#4e2b72", "#612b72", "red"]}
              series={[18, 2, 20, 50]} // 18 days present, 2 days absent
              labelsfontSize="16px"
            /> */}
            <ReactApexChart
              options={state.options}
              series={state.series}
              type="bar"
              height={280}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
