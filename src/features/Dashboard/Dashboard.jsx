import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Skeleton, Tooltip, Button, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import ReactApexChart from "react-apexcharts";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  getCurrentandPreviousweekDate,
  selectValidator,
} from "../Common/Validation";
import {
  getAllDownlineUsers,
  getHRDashboard,
  getRADashboard,
  getScoreBoard,
  getTopPerformance,
  getUserWiseLeadCounts,
  getUserWiseScoreBoard,
} from "../ApiService/action";
import { RedoOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import CommonSelectField from "../Common/CommonSelectField";
import CommonHorizontalBarChart from "../Common/CommonHorizontalBarChart";
import CommonPieChart from "../Common/CommonPieChart";
import CommonMuiMonthPicker from "../Common/CommonMuiMonthPicker";
import UserwiseSalesChart from "./UserwiseSalesChart";
import CommonDonutChart from "../Common/CommonDonutChart";
import UserwiseLeadChart from "./UserwiseLeadChart";

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
  //User-Wise Sales Analysis
  const [month, setMonth] = useState(moment().format("MMMM - YYYY"));
  const [userWiseStartDate, setUserWiseStartDate] = useState(
    moment().subtract(1, "month").date(26).format("YYYY-MM-DD") // previous month 25
  );

  const [userWiseEndDate, setUserWiseEndDate] = useState(
    moment().date(25).format("YYYY-MM-DD") // current month 25
  );
  const [userWiseType, setUserWiseType] = useState(1);
  const [userWiseXaxis, setUserWiseXaxis] = useState([]);
  const [userWiseSeries, setUserWiseSeries] = useState([]);
  const [userWiseTargets, setUserWiseTargets] = useState([]);
  const [userWiseCollection, setUserWiseCollection] = useState([]);
  const [userWiseLoader, setUserWiseLoader] = useState(true);
  //RA
  const [raSelectedDates, setRaSelectedDates] = useState([]);
  const [raDataSeries, setRaDataSeries] = useState([]);
  const [raLoader, setRaLoader] = useState(true);
  //HR
  const [HrSelectedDates, setHrSelectedDates] = useState([]);
  const [hrDataSeries, setHrDataSeries] = useState([]);
  const [hrLoader, setHrLoader] = useState(true);
  //HR
  const [userWiseLeadsDates, setUserWiseLeadsDates] = useState([]);
  const [userWiseLeadsXaxis, setUserWiseLeadsXaxis] = useState([]);
  const [userWiseLeadsSeries, setUserWiseLeadsSeries] = useState([]);
  const [userWiseLeadsCount, setUserWiseLeadsCount] = useState([]);
  const [userWiseLeadjoiningsCount, setUserWiseLeadsJoingingsCount] = useState(
    []
  );
  const [userWiseLeadsLoader, setUserWiseLeadsLoader] = useState(true);
  //lead executive
  const [loginUserId, setLoginUserId] = useState("");
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allDownliners, setAllDownliners] = useState([]);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    if (childUsers.length > 0 && !mounted.current && permissions.length > 0) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setScoreBoardSelectedDates(PreviousAndCurrentDate);
      setSaleDetailsSelectedDates(PreviousAndCurrentDate);
      setPerformingSelectedDates(PreviousAndCurrentDate);
      setRaSelectedDates(PreviousAndCurrentDate);
      setHrSelectedDates(PreviousAndCurrentDate);
      setUserWiseLeadsDates(PreviousAndCurrentDate);
      setSubUsers(downlineUsers);
      mounted.current = true;
      setLoginUserId(convertAsJson?.user_id);
      getAllDownlineUsersData(convertAsJson?.user_id);
    }
  }, [childUsers, permissions]);

  const getAllDownlineUsersData = async (user_id) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      if (permissions.includes("Score Board")) {
        getScoreBoardData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners_ids,
          true
        );
      } else {
        getSaleDetailsData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners_ids,
          true
        );
      }
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getScoreBoardData = async (
    startDate,
    endDate,
    downliners,
    call_api
  ) => {
    setScoreBoardLoader(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: downliners,
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
            downliners,
            true
          );
        }
      }, 300);
    }
  };

  const getSaleDetailsData = async (
    startDate,
    endDate,
    downliners,
    call_api
  ) => {
    if (!permissions.includes("Sale Performance")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getUserWiseLeadCountsData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true
      );
      return;
    }
    setSaleDetailsLoader(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: downliners,
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
          getUserWiseLeadCountsData(
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true
          );
        }
      }, 300);
    }
  };

  const getUserWiseLeadCountsData = async (
    startDate,
    endDate,
    downliners,
    call_api
  ) => {
    if (!permissions.includes("User-Wise Lead Analysis")) {
      const start_date = moment()
        .subtract(1, "month")
        .date(26)
        .format("YYYY-MM-DD");

      const end_date = moment().date(25).format("YYYY-MM-DD");
      getUserWiseScoreBoardData(
        start_date,
        end_date,
        downliners,
        true,
        userWiseType ? userWiseType : 1
      );
      return;
    }
    setUserWiseLeadsLoader(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: downliners,
    };

    try {
      const response = await getUserWiseLeadCounts(payload);
      console.log("userwise leadcounts response", response);
      const userwise_leadscount = response?.data?.data;
      console.log(userwise_leadscount);

      const xaxis = userwise_leadscount.map(
        (item) => `${item.user_id} (${item.user_name})`
      );
      const series = userwise_leadscount.map((item) => Number(item.percentage));

      const leads_count = userwise_leadscount.map((item) =>
        Number(item.total_leads)
      );

      const customers_count = userwise_leadscount.map((item) =>
        Number(item.customer_count)
      );

      setUserWiseLeadsXaxis(xaxis);
      setUserWiseLeadsSeries(series);
      setUserWiseLeadsCount(leads_count);
      setUserWiseLeadsJoingingsCount(customers_count);
    } catch (error) {
      console.log("userwise leadcounts error", error);
      setUserWiseLeadsXaxis([]);
      setUserWiseLeadsSeries([]);
      setUserWiseLeadsCount([]);
      setUserWiseLeadsJoingingsCount([]);
    } finally {
      setTimeout(() => {
        setUserWiseLeadsLoader(false);
        const start_date = moment()
          .subtract(1, "month")
          .date(26)
          .format("YYYY-MM-DD");

        const end_date = moment().date(25).format("YYYY-MM-DD");
        if (call_api == true) {
          getUserWiseScoreBoardData(
            start_date,
            end_date,
            downliners,
            true,
            userWiseType ? userWiseType : 1
          );
        }
      }, 300);
    }
  };

  const getUserWiseScoreBoardData = async (
    startDate,
    endDate,
    downliners,
    call_api,
    type
  ) => {
    if (!permissions.includes("User-Wise Sales Analysis")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getTopPerformanceData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true
      );
      return;
    }
    setUserWiseLoader(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: downliners,
      type: type == 1 ? "Sale" : type == 2 ? "Collection" : "Pending",
    };
    try {
      const response = await getUserWiseScoreBoard(payload);
      console.log("userwise score response", response);
      const userwise_scorecard = response?.data?.data;
      console.log(userwise_scorecard);

      const xaxis = userwise_scorecard.map(
        (item) => `${item.user_id} (${item.user_name})`
      );
      const series = userwise_scorecard.map((item) =>
        type == 1
          ? Number(item.sale_volume)
          : type == 2
          ? Number(item.percentage)
          : Number(item.pending)
      ); // for bar values
      const targets = userwise_scorecard.map((item) =>
        Number(item.target_value)
      );
      const collections = userwise_scorecard.map((item) =>
        Number(item.total_collection)
      ); // for tooltip

      setUserWiseXaxis(xaxis);
      setUserWiseSeries(series);
      if (type == 2) {
        setUserWiseTargets(targets);
        setUserWiseCollection(collections);
      } else {
        setUserWiseTargets([]);
        setUserWiseCollection([]);
      }
    } catch (error) {
      setUserWiseLoader(false);
      setUserWiseXaxis([]);
      setUserWiseSeries([]);
      setUserWiseTargets([]);
      setUserWiseCollection([]);
      console.log("userwise error", error);
    } finally {
      setTimeout(() => {
        setUserWiseLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api == true) {
          getTopPerformanceData(
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true
          );
        }
      }, 300);
    }
  };

  const getTopPerformanceData = async (
    startDate,
    endDate,
    downliners,
    call_api
  ) => {
    if (!permissions.includes("Top Performing Channels")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getRAData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true
      );
      return;
    }
    setPerformanceLoader(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: downliners,
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
          getHRData(
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true
          );
        }
      }, 300);
    }
  };

  const getHRData = async (startDate, endDate, downliners, call_api) => {
    if (!permissions.includes("HR Dashboard")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getRAData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true
      );
      return;
    }
    setHrLoader(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: downliners,
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
        hr_series[0] == 0 &&
        hr_series[1] == 0 &&
        hr_series[2] == 0 &&
        hr_series[3] == 0
      ) {
        console.log();
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
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api === true) {
          getRAData(
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true
          );
        }
      }, 300);
    }
  };

  const getRAData = async (startDate, endDate, downliners, call_api) => {
    if (!permissions.includes("RA Dashboard")) {
      return;
    }
    setRaLoader(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: downliners,
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
        Number(ra_data?.class_completed || 0),
      ];
      if (
        ra_series[0] == 0 &&
        ra_series[1] == 0 &&
        ra_series[2] == 0 &&
        ra_series[3] == 0 &&
        ra_series[4] == 0 &&
        ra_series[5] == 0 &&
        ra_series[6] == 0 &&
        ra_series[7] == 0
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
      }, 300);
    }
  };

  const handleRaDashboard = (label) => {
    console.log("ra dashboard clicked bar", label);
    if (label == "G-Review" || label == "L-Review") {
      return;
    }
    navigate("/customers", {
      state: {
        status: label === "Awaiting Student Verify" ? "Awaiting Verify" : label,
        startDate: raSelectedDates[0],
        endDate: raSelectedDates[1],
      },
    });
  };

  const handleHrDashboard = (label) => {
    console.log("hr dashboard clicked bar", label);
    navigate("/customers", {
      state: {
        status:
          label == "Trainer Rejected"
            ? "Awaiting Trainer"
            : label == "Trainer Verified"
            ? "Awaiting Class"
            : label,
        startDate: HrSelectedDates[0],
        endDate: HrSelectedDates[1],
      },
    });
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
    try {
      const response = await getAllDownlineUsers(value ? value : loginUserId);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setScoreBoardLoader(true);
      setSaleDetailsLoader(true);
      setPerformanceLoader(true);
      setRaLoader(true);
      setHrLoader(true);
      if (permissions.includes("Score Board")) {
        getScoreBoardData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners_ids,
          true
        );
      } else {
        getSaleDetailsData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners_ids,
          true
        );
      }
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setScoreBoardSelectedDates(PreviousAndCurrentDate);
    setSaleDetailsSelectedDates(PreviousAndCurrentDate);
    setPerformingSelectedDates(PreviousAndCurrentDate);
    setRaSelectedDates(PreviousAndCurrentDate);
    setHrSelectedDates(PreviousAndCurrentDate);
    setUserWiseLeadsDates(PreviousAndCurrentDate);
    setSelectedUserId(null);
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
                  label="Select User"
                  labelMarginTop="0px"
                  labelFontSize="12px"
                  options={subUsers}
                  onChange={handleSelectUser}
                  value={selectedUserId}
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
                          allDownliners,
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
                          allDownliners,
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

        {permissions.includes("User-Wise Lead Analysis") && (
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
                      User-Wise Lead Analysis
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(userWiseLeadsDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(userWiseLeadsDates[1]).format(
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
                      value={userWiseLeadsDates}
                      onDateChange={(dates) => {
                        setUserWiseLeadsDates(dates);
                        getUserWiseLeadCountsData(
                          dates[0],
                          dates[1],
                          allDownliners,
                          false
                        );
                      }}
                    />
                  </div>
                </Col>
              </Row>

              <div
                style={{
                  padding: "0px 12px 12px 12px",
                  height: 350,
                  overflowY: "auto",
                }}
              >
                <div className="dadhboard_chartsContainer">
                  {userWiseLeadsLoader ? (
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
                    <div>
                      {userWiseLeadsSeries.length >= 1 ? (
                        <UserwiseLeadChart
                          xaxis={userWiseLeadsXaxis}
                          // series={[12, 34, 45]}
                          series={userWiseLeadsSeries}
                          leads={userWiseLeadsCount}
                          customers={userWiseLeadjoiningsCount}
                          colors={["#258a25", "#5b6aca", "#b22021"]}
                          height={
                            userWiseLeadsXaxis.length <= 5
                              ? 280
                              : userWiseLeadsXaxis.length * 45
                          }
                        />
                      ) : (
                        <div className="dashboard_chart_nodata_conatiner">
                          <p>No data found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>
        )}

        {permissions.includes("User-Wise Sales Analysis") && (
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
                <Col span={16}>
                  <div style={{ padding: "12px 12px 8px 12px" }}>
                    <p className="dashboard_scrorecard_heading">
                      User-Wise Sales Analysis
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(userWiseStartDate).format(
                        "DD MMM YYYY"
                      )} to ${moment(userWiseEndDate).format("DD MMM YYYY")})`}
                    </p>
                  </div>
                </Col>
                <Col
                  span={8}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    padding: "0px 12px 0px 0px",
                  }}
                >
                  <div style={{ width: "100%" }}>
                    <CommonMuiMonthPicker
                      label="Month"
                      required={true}
                      onChange={(value) => {
                        console.log(value, "monthhh");
                        setMonth(value);
                        if (value) {
                          const [monthName, year] = value.split(" - ");
                          const selectedMonth = moment(
                            `${monthName} ${year}`,
                            "MMMM YYYY"
                          );

                          // Start date: 25th of previous month
                          const startDate = selectedMonth
                            .clone()
                            .subtract(1, "month")
                            .date(26)
                            .format("YYYY-MM-DD");

                          // End date: 25th of selected month
                          const endDate = selectedMonth
                            .clone()
                            .date(25)
                            .format("YYYY-MM-DD");

                          setUserWiseStartDate(startDate);
                          setUserWiseEndDate(endDate);
                          console.log("Start Date:", startDate);
                          console.log("End Date:", endDate);
                          getUserWiseScoreBoardData(
                            startDate,
                            endDate,
                            allDownliners,
                            false,
                            userWiseType
                          );
                        }
                      }}
                      value={month}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col span={15}></Col>
                <Col
                  span={9}
                  className="dashboard_userwise_typefield_container"
                >
                  <CommonSelectField
                    label="Type"
                    height="35px"
                    labelMarginTop="-1px"
                    labelFontSize="12px"
                    width="100%"
                    options={[
                      {
                        id: 1,
                        name: "Sale Volume",
                      },
                      {
                        id: 2,
                        name: "Collection",
                      },
                      {
                        id: 3,
                        name: "Pending",
                      },
                    ]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserWiseType(value);
                      getUserWiseScoreBoardData(
                        userWiseStartDate,
                        userWiseEndDate,
                        allDownliners,
                        false,
                        value
                      );
                    }}
                    value={userWiseType}
                  />
                </Col>
              </Row>

              <div
                style={{
                  padding: "0px 12px 12px 12px",
                  height: 310,
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                {userWiseLoader ? (
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
                    {userWiseSeries.length >= 1 ? (
                      <UserwiseSalesChart
                        xaxis={userWiseXaxis}
                        // series={[12, 34, 45]}
                        series={userWiseSeries}
                        targets={userWiseTargets}
                        collections={userWiseCollection}
                        colors={[
                          userWiseType == 1
                            ? "#5b6aca"
                            : userWiseType == 2
                            ? "#258a25"
                            : "#b22021",
                        ]}
                        type={
                          userWiseType == 1
                            ? "Sale"
                            : userWiseType == 2
                            ? "Collection"
                            : "Pending"
                        }
                        height={
                          userWiseXaxis.length <= 5
                            ? 280
                            : userWiseXaxis.length * 45
                        }
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
                          allDownliners,
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
                        getHRData(dates[0], dates[1], allDownliners, false);
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
                      // <CommonPieChart
                      //   labels={[
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
                      //   // series={[12, 34, 56, 4]}
                      //   series={hrDataSeries}
                      //   height={290}
                      //   clickedBar={handleHrDashboard}
                      //   enablePointer={true}
                      // />
                      <CommonDonutChart
                        labels={[
                          "Awaiting Trainer",
                          "Awaiting Trainer Verify",
                          "Trainer Verified",
                          "Trainer Rejected",
                        ]}
                        // series={[12, 34, 56, 4]}
                        series={hrDataSeries}
                        labelsfontSize="11px"
                        colors={[
                          "#ffa602c7",
                          "#1e8fffbe",
                          "#00cecbd0",
                          "#d32f2fcc",
                        ]}
                        height={300}
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
                        getRAData(dates[0], dates[1], allDownliners, false);
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
                      <CommonDonutChart
                        labels={[
                          "Awaiting Class",
                          "Awaiting Student Verify",
                          "Class Scheduled",
                          "Class Going",
                          "G-Review",
                          "L-Review",
                          "Escalated",
                          "Completed",
                        ]}
                        // series={[12, 34, 56, 4, 9, 18, 20]}
                        series={raDataSeries}
                        labelsfontSize="11px"
                        colors={[
                          "#ffa602c7",
                          "#1e8fffbe",
                          "#a29bfec7",
                          "#00cecbd0",
                          "#a1c60c",
                          "rgba(10 102 194)",
                          "#d32f2fcc",
                          "#258a25",
                        ]}
                        height={320}
                        clickedBar={handleRaDashboard}
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
      </Row>

      {/* <Row gutter={16}>
       
        </Row> */}

      {/* <Row gutter={16}>
      
      </Row> */}
    </div>
  );
}
