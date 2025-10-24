import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Skeleton, Tooltip, Button, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import ReactApexChart from "react-apexcharts";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import {
  getHRDashboard,
  getRADashboard,
  getScoreBoard,
  getTopPerformance,
} from "../ApiService/action";
import { RedoOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import CommonSelectField from "../Common/CommonSelectField";
import CommonHorizontalBarChart from "../Common/CommonHorizontalBarChart";
import CommonPieChart from "../Common/CommonPieChart";

export default function Dashboard() {
  const wrappertwoRef = useRef(null);
  const wrapperthreeRef = useRef(null);
  const mounted = useRef(false);
  const navigate = useNavigate();

  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);
  //score card
  const [scoreBoardSelectedDates, setScoreBoardSelectedDates] = useState([]);
  const [scoreCardDetails, setScoreCardDetails] = useState(null);
  const [scoreBoardLoader, setScoreBoardLoader] = useState(true);
  //performing
  const [performingSelectedDates, setPerformingSelectedDates] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [performanceLoader, setPerformanceLoader] = useState(true);
  //sale details
  const [saleDetailsSelectedDates, setSaleDetailsSelectedDates] = useState([]);
  const [saleDetailsSeries, setSaleDetailsSeries] = useState([]);
  const [saleDetailsLoader, setSaleDetailsLoader] = useState(true);
  //RA
  const [raSelectedDates, setRaSelectedDates] = useState([]);
  const [raDataSeries, setRaDataSeries] = useState([]);
  const [raLoader, setRaLoader] = useState(true);
  //HR
  const [HrSelectedDates, setHrSelectedDates] = useState([]);
  const [hrDataSeries, setHrDataSeries] = useState([]);
  const [hrLoader, setHrLoader] = useState(true);
  //lead executive
  const [leadExecutives, setLeadExecutives] = useState([]);
  const [leadExecutiveId, setLeadExecutiveId] = useState(null);

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current && permissions.length > 0) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setScoreBoardSelectedDates(PreviousAndCurrentDate);
      setSaleDetailsSelectedDates(PreviousAndCurrentDate);
      setPerformingSelectedDates(PreviousAndCurrentDate);
      setRaSelectedDates(PreviousAndCurrentDate);
      setHrSelectedDates(PreviousAndCurrentDate);
      setLeadExecutives(downlineUsers);
      mounted.current = true;
      if (permissions.includes("Score Board")) {
        getScoreBoardData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          null,
          true
        );
      } else {
        console.log("oiiiiiiiiii");
        getSaleDetailsData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          null,
          true
        );
      }
    }
  }, [childUsers, permissions]);

  const getScoreBoardData = async (
    startDate,
    endDate,
    executive_id,
    call_api
  ) => {
    setScoreBoardLoader(true);
    let lead_executive = [];
    if (executive_id) {
      lead_executive.push(executive_id);
    } else {
      lead_executive = [];
    }
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: lead_executive.length >= 1 ? lead_executive : childUsers,
    };
    try {
      const response = await getScoreBoard(payload);
      console.log("scoreboard response", response);
      setScoreCardDetails(response?.data?.data || null);
    } catch (error) {
      setScoreCardDetails(null);
      console.log("scoreboard error", error);
    } finally {
      setTimeout(() => {
        setScoreBoardLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api == true) {
          getSaleDetailsData(
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            executive_id,
            true
          );
        }
      }, 300);
    }
  };

  const getSaleDetailsData = async (
    startDate,
    endDate,
    executive_id,
    call_api
  ) => {
    if (!permissions.includes("Sale Performance")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getTopPerformanceData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        executive_id,
        true
      );
      return;
    }
    setSaleDetailsLoader(true);
    let lead_executive = [];
    if (executive_id) {
      lead_executive.push(executive_id);
    } else {
      lead_executive = [];
    }
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: lead_executive.length >= 1 ? lead_executive : childUsers,
    };
    try {
      const response = await getScoreBoard(payload);
      console.log("sale details response", response);
      const leadDetails_data = response?.data?.data;
      const leadDetails_series = [
        Number(leadDetails_data?.sale_volume || 0),
        Number(leadDetails_data?.total_collection || 0),
        Number(leadDetails_data?.pending_payment || 0),
      ];
      setSaleDetailsSeries(leadDetails_series);
    } catch (error) {
      setSaleDetailsSeries([]);
      console.log("sale details error", error);
    } finally {
      setTimeout(() => {
        setSaleDetailsLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api == true) {
          getTopPerformanceData(
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            executive_id,
            true
          );
        }
      }, 300);
    }
  };

  const getTopPerformanceData = async (
    startDate,
    endDate,
    executive_id,
    call_api
  ) => {
    if (!permissions.includes("Top Performing Channels")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getRAData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        executive_id,
        true
      );
      return;
    }
    setPerformanceLoader(true);
    let lead_executive = [];
    if (executive_id) {
      lead_executive.push(executive_id);
    } else {
      lead_executive = [];
    }
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: lead_executive.length >= 1 ? lead_executive : childUsers,
    };
    try {
      const response = await getTopPerformance(payload);
      console.log("perfomance response", response);
      setPerformanceData(response?.data?.data || []);
    } catch (error) {
      setPerformanceData([]);
      console.log("scoreboard error", error);
    } finally {
      setTimeout(() => {
        setPerformanceLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api == true) {
          getRAData(
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            executive_id,
            true
          );
        }
      }, 300);
    }
  };

  const getRAData = async (startDate, endDate, executive_id, call_api) => {
    if (!permissions.includes("RA Dashboard")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getHRData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        executive_id,
        true
      );
      return;
    }
    setRaLoader(true);
    let lead_executive = [];
    if (executive_id) {
      lead_executive.push(executive_id);
    } else {
      lead_executive = [];
    }
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: lead_executive.length >= 1 ? lead_executive : childUsers,
    };
    try {
      const response = await getRADashboard(payload);
      console.log("ra response", response);
      const ra_data = response?.data?.data;
      const ra_series = [
        Number(ra_data?.awaiting_class || 0),
        Number(ra_data?.awaiting_verify || 0),
        Number(ra_data?.class_scheduled || 0),
        Number(ra_data?.class_going || 0),
        Number(ra_data?.google_review_count || 0),
        Number(ra_data?.linkedin_review_count || 0),
        Number(ra_data?.escalated || 0),
      ];
      if (
        ra_data?.awaiting_class == 0 &&
        ra_data?.awaiting_verify == 0 &&
        ra_data?.class_scheduled == 0 &&
        ra_data?.class_going == 0 &&
        ra_data?.google_review_count == 0 &&
        ra_data?.linkedin_review_count == 0 &&
        ra_data?.escalated == 0
      ) {
        setRaDataSeries([]);
        return;
      }

      setRaDataSeries(ra_series);
    } catch (error) {
      setRaDataSeries([]);
      console.log("ra error", error);
    } finally {
      setTimeout(() => {
        setRaLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api == true) {
          getHRData(
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            executive_id,
            true
          );
        }
      }, 300);
    }
  };

  const getHRData = async (startDate, endDate, executive_id, call_api) => {
    if (!permissions.includes("HR Dashboard")) {
      return;
    }
    setHrLoader(true);
    let lead_executive = [];
    if (executive_id) {
      lead_executive.push(executive_id);
    } else {
      lead_executive = [];
    }
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: lead_executive.length >= 1 ? lead_executive : childUsers,
    };

    try {
      const response = await getHRDashboard(payload);
      console.log("hr response", response);
      const hr_data = response?.data?.data;
      const hr_series = [
        Number(hr_data?.awaiting_trainer || 0),
        Number(hr_data?.awaiting_trainer_verify || 0),
        Number(hr_data?.verified_trainer || 0),
        Number(hr_data?.rejected_trainer || 0),
      ];
      if (
        hr_data?.awaiting_trainer == 0 &&
        hr_data?.awaiting_trainer_verify == 0 &&
        hr_data?.verified_trainer == 0 &&
        hr_data?.rejected_trainer == 0
      ) {
        setHrDataSeries([]);
        return;
      }
      setHrDataSeries(hr_series);
    } catch (error) {
      setHrDataSeries([]);
      console.log("hr error", error);
    } finally {
      setTimeout(() => {
        setHrLoader(false);
      }, 300);
    }
  };

  const handleRaDashboard = (label) => {
    console.log("ra dashboard clicked bar", label);
    if (label == "G-Review" || label == "L-Review") {
      return;
    }
    navigate("/customers", {
      state: label == "Awaiting Student Verify" ? "Awaiting Verify" : label,
    });
  };

  const handleHrDashboard = (label) => {
    console.log("hr dashboard clicked bar", label);
    navigate("/customers", {
      state:
        label == "Trainer Rejected"
          ? "Awaiting Trainer"
          : label == "Trainer Verified"
          ? "Awaiting Class"
          : label,
    });
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setScoreBoardSelectedDates(PreviousAndCurrentDate);
    setSaleDetailsSelectedDates(PreviousAndCurrentDate);
    setPerformingSelectedDates(PreviousAndCurrentDate);
    setRaSelectedDates(PreviousAndCurrentDate);
    setHrSelectedDates(PreviousAndCurrentDate);
    setLeadExecutiveId(null);
    setScoreBoardLoader(true);
    setSaleDetailsLoader(true);
    setPerformanceLoader(true);
    setRaLoader(true);
    setHrLoader(true);
    if (permissions.includes("Score Board")) {
      getScoreBoardData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        null,
        true
      );
    } else {
      getSaleDetailsData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        null,
        true
      );
    }
  };

  return (
    <div
      style={{
        padding: "0px 0px 30px 0px",
      }}
    >
      <Row>
        <Col span={12}>
          {permissions.includes("Lead Executive Filter") && (
            <div className="overallduecustomers_filterContainer">
              <div style={{ flex: 1 }}>
                <CommonSelectField
                  width="40%"
                  height="35px"
                  label="Select Lead Executive"
                  labelMarginTop="0px"
                  labelFontSize="12px"
                  options={leadExecutives}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setLeadExecutiveId(e.target.value);
                    const PreviousAndCurrentDate =
                      getCurrentandPreviousweekDate();
                    setScoreBoardLoader(true);
                    setSaleDetailsLoader(true);
                    setPerformanceLoader(true);
                    setRaLoader(true);
                    setHrLoader(true);
                    if (permissions.includes("Score Board")) {
                      getScoreBoardData(
                        PreviousAndCurrentDate[0],
                        PreviousAndCurrentDate[1],
                        e.target.value,
                        true
                      );
                    } else {
                      getSaleDetailsData(
                        PreviousAndCurrentDate[0],
                        PreviousAndCurrentDate[1],
                        e.target.value,
                        true
                      );
                    }
                  }}
                  value={leadExecutiveId}
                  disableClearable={false}
                />
              </div>
            </div>
          )}
        </Col>
        <Col span={12}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Tooltip placement="top" title="Refresh">
              <Button
                className="leadmanager_refresh_button"
                onClick={handleRefresh}
              >
                <RedoOutlined className="refresh_icon" />
              </Button>
            </Tooltip>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        {permissions.includes("Score Board") && (
          <Col span={12} style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_card">
              <Row className="dashboard_leadcount_header_container">
                <Col span={18}>
                  <div style={{ padding: "12px 12px 8px 12px" }}>
                    <p className="dashboard_scrorecard_heading">Score Board</p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(scoreBoardSelectedDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(scoreBoardSelectedDates[1]).format(
                        "DD MMM YYYY"
                      )})`}
                    </p>
                  </div>
                </Col>
                <Col
                  span={6}
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <div>
                    <CommonMuiCustomDatePicker
                      isDashboard={true}
                      value={scoreBoardSelectedDates}
                      onDateChange={(dates) => {
                        setScoreBoardSelectedDates(dates);
                        getScoreBoardData(
                          dates[0],
                          dates[1],
                          leadExecutiveId,
                          false
                        );
                      }}
                    />
                  </div>
                </Col>
              </Row>

              {scoreBoardLoader ? (
                <div style={{ padding: "12px" }}>
                  <Skeleton
                    active
                    style={{ height: "30vh" }}
                    title={{ width: 140 }}
                    paragraph={{
                      rows: 0,
                    }}
                  />
                </div>
              ) : (
                <>
                  <Row className="dashboard_leadcountcard_progressbar_mainContainer">
                    <Col span={12}>
                      <div>
                        <p className="dashboard_leadcountcard_subheadings">
                          Total Leads
                        </p>
                        <p className="dashboard_leadcountcard_count">
                          {scoreCardDetails &&
                          (scoreCardDetails.total_leads != undefined ||
                            scoreCardDetails.total_leads != null)
                            ? Number(
                                scoreCardDetails.total_leads
                              ).toLocaleString("en-IN")
                            : "-"}
                        </p>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div>
                        <p className="dashboard_leadcountcard_subheadings">
                          Total Joinings
                        </p>
                        <p className="dashboard_leadcountcard_count">
                          {scoreCardDetails &&
                          (scoreCardDetails.total_join != undefined ||
                            scoreCardDetails.total_join != null)
                            ? Number(
                                scoreCardDetails.total_join
                              ).toLocaleString("en-IN")
                            : "-"}
                        </p>
                      </div>
                    </Col>
                  </Row>

                  <Divider className="dashboard_leadcount_divider" />

                  <Row className="dashboard_leadcountcard_progressbar_mainContainer">
                    <Col span={12}>
                      <p className="dashboard_leadcountcard_subheadings">
                        Follow-Up Pending
                      </p>
                      <p
                        className="dashboard_leadcountcard_count"
                        style={{ color: "#b22021" }}
                      >
                        {scoreCardDetails &&
                        (scoreCardDetails.follow_up_unhandled != undefined ||
                          scoreCardDetails.follow_up_unhandled != null)
                          ? Number(
                              scoreCardDetails.follow_up_unhandled
                            ).toLocaleString("en-IN")
                          : "-"}
                      </p>
                    </Col>
                    <Col span={12}>
                      <div>
                        <p className="dashboard_leadcountcard_subheadings">
                          Follow-Up Handled
                        </p>
                        <p className="dashboard_leadcountcard_count">
                          {scoreCardDetails &&
                          (scoreCardDetails.follow_up_handled != undefined ||
                            scoreCardDetails.follow_up_handled != null)
                            ? Number(
                                scoreCardDetails.follow_up_handled
                              ).toLocaleString("en-IN")
                            : "-"}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </>
              )}
            </div>
            {/* <p
            className="dashboard_scrorecard_heading"
            style={{ marginTop: "14px" }}
          >
            Lead Details
          </p>
          <p className="dashboard_daterange_text">
            Date Range: (15 Oct 2025 to 21 Oct 2025)
          </p>
          <div
            style={{
              marginTop: "40px",
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <div className="dashboard_leadnumber_card">
                  <p style={{ fontSize: "13px", fontWeight: 500 }}>
                    Total Leads
                  </p>
                  <p className="dashboard_leadnumbers">45</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="dashboard_leadnumber_card">
                  <p style={{ fontSize: "13px", fontWeight: 500 }}>
                    Lead Follow-Ups
                  </p>
                  <p className="dashboard_leadnumbers">45</p>
                </div>
              </Col>
            </Row>
            <Row
              gutter={16}
              style={{ marginTop: "30px", justifyContent: "center" }}
            >
              <Col span={12}>
                <div className="dashboard_leadnumber_card">
                  <p style={{ fontSize: "13px", fontWeight: 500 }}>
                    Total Joinings
                  </p>
                  <p className="dashboard_leadnumbers">45</p>
                </div>
              </Col>
            </Row>
          </div> */}
          </Col>
        )}
        {permissions.includes("Sale Performance") && (
          <Col span={12} style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_card">
              <Row className="dashboard_leadcount_header_container">
                <Col span={18}>
                  <div style={{ padding: "12px 12px 8px 12px" }}>
                    <p className="dashboard_scrorecard_heading">
                      Sale Performance
                    </p>

                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(saleDetailsSelectedDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(saleDetailsSelectedDates[1]).format(
                        "DD MMM YYYY"
                      )})`}
                    </p>
                  </div>
                </Col>
                <Col
                  span={6}
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <div>
                    <CommonMuiCustomDatePicker
                      isDashboard={true}
                      value={saleDetailsSelectedDates}
                      onDateChange={(dates) => {
                        setSaleDetailsSelectedDates(dates);
                        getSaleDetailsData(
                          dates[0],
                          dates[1],
                          leadExecutiveId,
                          false
                        );
                      }}
                    />
                  </div>
                </Col>
              </Row>

              <div className="dadhboard_chartsContainer">
                {saleDetailsLoader ? (
                  <div className="dashboard_skeleton_container">
                    <Skeleton
                      active
                      style={{ height: "40vh" }}
                      title={{ width: 140 }}
                      paragraph={{
                        rows: 0,
                      }}
                    />
                  </div>
                ) : (
                  <>
                    {saleDetailsSeries.length >= 1 ? (
                      <CommonHorizontalBarChart
                        xaxis={["Sale Volume", "Collection", "Pending Fees"]}
                        series={saleDetailsSeries}
                        colors={["#5b6aca", "#258a25", "#b22021"]}
                        isRupees={true}
                      />
                    ) : (
                      ""
                    )}
                  </>
                )}
              </div>
            </div>
          </Col>
        )}

        {permissions.includes("Top Performing Channels") && (
          <Col xs={24} sm={24} md={24} lg={12} style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_card">
              <Row className="dashboard_leadcount_header_container">
                <Col span={18}>
                  <div style={{ padding: "12px 12px 8px 12px" }}>
                    <p className="dashboard_scrorecard_heading">
                      Top Performing Channels
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(performingSelectedDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(performingSelectedDates[1]).format(
                        "DD MMM YYYY"
                      )})`}
                    </p>
                  </div>
                </Col>
                <Col
                  span={6}
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <div>
                    <CommonMuiCustomDatePicker
                      isDashboard={true}
                      value={performingSelectedDates}
                      onDateChange={(dates) => {
                        setPerformingSelectedDates(dates);
                        getTopPerformanceData(
                          dates[0],
                          dates[1],
                          leadExecutiveId,
                          false
                        );
                      }}
                    />
                  </div>
                </Col>
              </Row>

              {performanceLoader ? (
                <div className="dashboard_skeleton_container">
                  <Skeleton
                    active
                    style={{ height: "40vh" }}
                    title={{ width: 140 }}
                    paragraph={{
                      rows: 0,
                    }}
                  />
                </div>
              ) : (
                <>
                  <Row className="dashboard_performchannel_headingContainer">
                    <Col
                      span={6}
                      className="dashboard_performchannel_heading_col"
                    >
                      <p>Lead Type</p>
                    </Col>
                    <Col
                      span={6}
                      className="dashboard_performchannel_heading_col"
                    >
                      <p>Lead Count</p>
                    </Col>
                    <Col
                      span={6}
                      className="dashboard_performchannel_heading_col"
                    >
                      <p>Percentage%</p>
                    </Col>
                    <Col
                      span={6}
                      className="dashboard_performchannel_heading_col"
                    >
                      <p>Joinings</p>
                    </Col>
                  </Row>

                  {performanceData.map((item, index) => {
                    return (
                      <React.Fragment key={index}>
                        <Row
                          style={{
                            padding: "9px 12px",
                            borderBottom: "1px solid rgb(5 5 5 / 14%)",
                          }}
                        >
                          <Col
                            span={6}
                            className="dashboard_performchannel_data_col"
                          >
                            <p>{item.name}</p>
                          </Col>
                          <Col
                            span={6}
                            className="dashboard_performchannel_data_col"
                          >
                            <p>{item.lead_count}</p>
                          </Col>
                          <Col
                            span={6}
                            className="dashboard_performchannel_data_col"
                          >
                            <p>{item.lead_percentage + "%"}</p>
                          </Col>
                          <Col
                            span={6}
                            className="dashboard_performchannel_data_col"
                          >
                            <p>{item.converted_to_customer}</p>
                          </Col>
                        </Row>
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </div>
          </Col>
        )}
        {permissions.includes("HR Dashboard") && (
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={12}
            style={{
              marginTop: "30px",
            }}
          >
            <div className="dashboard_leadcount_card">
              <Row className="dashboard_leadcount_header_container">
                <Col span={18}>
                  <div style={{ padding: "12px 12px 8px 12px" }}>
                    <p className="dashboard_scrorecard_heading">
                      HR Performance
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(HrSelectedDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(HrSelectedDates[1]).format(
                        "DD MMM YYYY"
                      )})`}
                    </p>
                  </div>
                </Col>
                <Col
                  span={6}
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <div>
                    <CommonMuiCustomDatePicker
                      isDashboard={true}
                      value={performingSelectedDates}
                      onDateChange={(dates) => {
                        setHrSelectedDates(dates);
                        getHRData(dates[0], dates[1], leadExecutiveId, false);
                      }}
                    />
                  </div>
                </Col>
              </Row>

              <div className="dadhboard_chartsContainer">
                {hrLoader ? (
                  <div className="dashboard_skeleton_container">
                    <Skeleton
                      active
                      style={{ height: "40vh" }}
                      title={{ width: 140 }}
                      paragraph={{
                        rows: 0,
                      }}
                    />
                  </div>
                ) : (
                  <>
                    {hrDataSeries.length >= 1 ? (
                      // <CommonHorizontalBarChart
                      //   xaxis={[
                      //     "Awaiting Trainer",
                      //     "Awaiting Trainer Verify",
                      //     "Trainer Verified",
                      //     "Trainer Rejected",
                      //   ]}
                      //   colors={[
                      //     "#ffa602c7",
                      //     "#1e8fffbe",
                      //     "#00cecbd0",
                      //     "#d32f2fcc",
                      //   ]}
                      //   series={hrDataSeries}
                      //   // series={[12, 34, 56, 4]}
                      //   height={290}
                      //   clickedBar={handleHrDashboard}
                      //   enablePointer={true}
                      //   fontSize="11px"
                      // />
                      <CommonPieChart
                        labels={[
                          "Awaiting Trainer",
                          "Awaiting Trainer Verify",
                          "Trainer Verified",
                          "Trainer Rejected",
                        ]}
                        colors={[
                          "#ffa602c7",
                          "#1e8fffbe",
                          "#00cecbd0",
                          "#d32f2fcc",
                        ]}
                        // series={[12, 34, 56, 4]}
                        series={hrDataSeries}
                        height={290}
                        clickedBar={handleHrDashboard}
                        enablePointer={true}
                      />
                    ) : (
                      <div className="dashboard_chart_nodata_conatiner">
                        <p>No data found</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Col>
        )}

        {permissions.includes("RA Dashboard") && (
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={12}
            style={{
              marginTop: "30px",
            }}
          >
            <div className="dashboard_leadcount_card">
              <Row className="dashboard_leadcount_header_container">
                <Col span={18}>
                  <div style={{ padding: "12px 12px 8px 12px" }}>
                    <p className="dashboard_scrorecard_heading">
                      RA Performance
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(raSelectedDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(raSelectedDates[1]).format(
                        "DD MMM YYYY"
                      )})`}
                    </p>
                  </div>
                </Col>
                <Col
                  span={6}
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <div>
                    <CommonMuiCustomDatePicker
                      isDashboard={true}
                      value={performingSelectedDates}
                      onDateChange={(dates) => {
                        setRaSelectedDates(dates);
                        getRAData(dates[0], dates[1], leadExecutiveId, false);
                      }}
                    />
                  </div>
                </Col>
              </Row>

              <div className="dadhboard_chartsContainer">
                {raLoader ? (
                  <div className="dashboard_skeleton_container">
                    <Skeleton
                      active
                      style={{ height: "40vh" }}
                      title={{ width: 140 }}
                      paragraph={{
                        rows: 0,
                      }}
                    />
                  </div>
                ) : (
                  <>
                    {raDataSeries.length >= 1 ? (
                      // <CommonHorizontalBarChart
                      //   xaxis={[
                      //     "Awaiting Class",
                      //     "Awaiting Student Verify",
                      //     "Class Scheduled",
                      //     "Class Going",
                      //     "G-Review",
                      //     "L-Review",
                      //     "Escalated",
                      //   ]}
                      //   series={raDataSeries}
                      //   // series={[12, 34, 56, 4, 9, 18, 20]}
                      //   colors={[
                      //     "#ffa602c7",
                      //     "#1e8fffbe",
                      //     "#a29bfec7",
                      //     "#00cecbd0",
                      //     "#a1c60c",
                      //     "rgba(10 102 194)",
                      //     "#d32f2fcc",
                      //   ]}
                      //   clickedBar={handleRaDashboard}
                      //   fontSize="11px"
                      //   enablePointer={true}
                      //   height={380}
                      // />
                      <CommonPieChart
                        labels={[
                          "Awaiting Class",
                          "Awaiting Student Verify",
                          "Class Scheduled",
                          "Class Going",
                          "G-Review",
                          "L-Review",
                          "Escalated",
                        ]}
                        series={raDataSeries}
                        // series={[12, 34, 56, 4, 9, 18, 20]}
                        colors={[
                          "#ffa602c7",
                          "#1e8fffbe",
                          "#a29bfec7",
                          "#00cecbd0",
                          "#a1c60c",
                          "rgba(10 102 194)",
                          "#d32f2fcc",
                        ]}
                        clickedBar={handleRaDashboard}
                        enablePointer={true}
                        height={320}
                      />
                    ) : (
                      <div className="dashboard_chart_nodata_conatiner">
                        <p>No data found</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Col>
        )}
      </Row>

      {/* <Row gutter={16}>
       
        </Row> */}

      {/* <Row gutter={16}>
      
      </Row> */}
    </div>
  );
}
