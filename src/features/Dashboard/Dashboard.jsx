import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Skeleton, Tooltip, Button, Divider, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { DownloadOutlined } from "@ant-design/icons";
import { PiHandCoins } from "react-icons/pi";
import { PiUsersThreeBold } from "react-icons/pi";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  getActiveTargetMonthRange,
  getCurrentandPreviousweekDate,
  getDatesFromRangeLabel,
  getRangeLabel,
  selectValidator,
} from "../Common/Validation";
import {
  downloadUserWiseLeadCounts,
  downloadUserWiseSalesCounts,
  getAllDownlineUsers,
  getBranchWiseLeadCounts,
  getBranchWiseScoreBoard,
  getDashboardDates,
  getHRDashboard,
  getPostSaleDashboard,
  getQualityDashboard,
  getRADashboard,
  getRegionWiseLeadCounts,
  getRegionWiseScoreBoard,
  getScoreBoard,
  getTopPerformance,
  getUserWiseLeadCounts,
  getUserWiseScoreBoard,
  updateDashboardDates,
} from "../ApiService/action";
import { LoadingOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import CommonSelectField from "../Common/CommonSelectField";
import CommonHorizontalBarChart from "../Common/CommonHorizontalBarChart";
import CommonPieChart from "../Common/CommonPieChart";
import CommonMuiMonthPicker from "../Common/CommonMuiMonthPicker";
import UserwiseSalesChart from "./UserwiseSalesChart";
import CommonDonutChart from "../Common/CommonDonutChart";
import UserwiseLeadChart from "./UserwiseLeadChart";
import BranchwiseLeadChart from "./BranchwiseLeadChart";
import BranchwiseSalesChart from "./BranchwisesalesChart";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import { DashboardDownloadColumns } from "./DashboardDownloadColumns";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import QualityChart from "./QualityChart";
import PostSalePerformanceChart from "./PostSalePerformanceChart";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";

export default function Dashboard() {
  const wrappertwoRef = useRef(null);
  const wrapperthreeRef = useRef(null);
  const mounted = useRef(false);
  const navigate = useNavigate();

  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);
  //dates
  const [allDashboardCardsDates, setAllDashboardCardsDates] = useState([]);
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
  //userwise lead analysis
  const [userWiseLeadsType, setUserWiseLeadsType] = useState(1);
  const [userWiseLeadsDates, setUserWiseLeadsDates] = useState([]);
  const [userWiseLeadsXaxis, setUserWiseLeadsXaxis] = useState([]);
  const [userWiseLeadsSeries, setUserWiseLeadsSeries] = useState([]);
  const [userWiseLeadsConversion, setUserWiseLeadsConversion] = useState([]);
  const [userWiseLeadjoiningsCount, setUserWiseLeadsJoingingsCount] = useState(
    []
  );
  const [userWiseFollowUpHandled, setUserWiseFollowUpHandled] = useState([]);
  const [userWiseTotalFollowUp, setUserWiseTotalFollowUp] = useState([]);
  const [userWiseLeadDownloadLoader, setUserWiseLeadDownloadLoader] =
    useState(false);
  const [userWiseLeadsLoader, setUserWiseLeadsLoader] = useState(true);
  //User-Wise Sales Analysis
  const [month, setMonth] = useState(moment().format("MMMM - YYYY"));
  const [userWiseStartDate, setUserWiseStartDate] = useState(
    moment().subtract(1, "month").date(26).format("YYYY-MM-DD") // previous month 26
  );

  const [userWiseEndDate, setUserWiseEndDate] = useState(
    moment().date(25).format("YYYY-MM-DD") // current month 25
  );
  const [userWiseType, setUserWiseType] = useState(1);
  const [userWiseXaxis, setUserWiseXaxis] = useState([]);
  const [userWiseSeries, setUserWiseSeries] = useState([]);
  const [userWiseTargets, setUserWiseTargets] = useState([]);
  const [userWiseCollection, setUserWiseCollection] = useState([]);
  const [userWiseSalesDownloadLoader, setUserWiseSalesDownloadLoader] =
    useState(false);
  const [userWiseLoader, setUserWiseLoader] = useState(true);
  //branch-wise lead analysis
  const [branchWiseLeadsRegion, setBranchWiseLeadsRegion] = useState(1);
  const [branchWiseLeadsType, setBranchWiseLeadsType] = useState(1);
  const [branchWiseLeadsDates, setBranchWiseLeadsDates] = useState([]);

  const [branchWiseLeadsXaxis, setBranchWiseLeadsXaxis] = useState([]);
  const [branchWiseLeadsSeries, setBranchWiseLeadsSeries] = useState([]);
  const [branchWiseLeadsConversion, setBranchWiseLeadsConversion] = useState(
    []
  );
  const [branchWiseLeadjoiningsCount, setBranchWiseLeadsJoingingsCount] =
    useState([]);
  const [branchWiseFollowUpHandled, setBranchWiseFollowUpHandled] = useState(
    []
  );
  const [branchWiseTotalFollowUp, setBranchWiseTotalFollowUp] = useState([]);
  const [branchWiseLeadsLoader, setBranchWiseLeadsLoader] = useState(true);
  //branch-wise sale analysis
  const [branchWiseSaleRegion, setBranchWiseSaleRegion] = useState(1);
  const [branchWiseSaleType, setBranchWiseSaleType] = useState(1);
  const [branchWiseSaleDates, setBranchWiseSaleDates] = useState([]);
  const [branchWiseSalesXaxis, setBranchWiseSalesXaxis] = useState([]);
  const [branchWiseSalesSeries, setBranchWiseSalesSeries] = useState([]);
  const [branchWiseSalesLoader, setBranchWiseSalesLoader] = useState(true);
  // region-wise lead analysis
  const [regionWiseLeadsDates, setRegionWiseLeadsDates] = useState([]);
  const [regionWiseLeadsType, setRegionWiseLeadsType] = useState(1);
  const [regionWiseLeadsXaxis, setRegionWiseLeadsXaxis] = useState([]);
  const [regionWiseLeadsSeries, setRegionWiseLeadsSeries] = useState([]);
  const [regionWiseLeadsLoader, setRegionWiseLeadsLoader] = useState(true);
  // region-wise lead analysis
  const [regionWiseSalesDates, setRegionWiseSalesDates] = useState([]);
  const [regionWiseSalesType, setRegionWiseSalesType] = useState(1);
  const [regionWiseSalesXaxis, setRegionWiseSalesXaxis] = useState([]);
  const [regionWiseSalesSeries, setRegionWiseSalesSeries] = useState([]);
  const [regionWiseSalesLoader, setRegionWiseSalesLoader] = useState(true);
  //post sale performance
  const [postSaleDataSeries, setPostSaleDataSeries] = useState([]);
  const [postSaleSelectedDates, setPostSaleSelectedDates] = useState([]);
  const [postSaleDownloadData, setPostSaleDownloadData] = useState([]);
  const [postSaleLoader, setPostSaleLoader] = useState(true);
  //lead executive
  const [loginUserId, setLoginUserId] = useState("");
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allDownliners, setAllDownliners] = useState([]);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    if (childUsers.length > 0 && !mounted.current && permissions.length > 0) {
      const { month, startDate, endDate } = getActiveTargetMonthRange();
      setMonth(month);
      setUserWiseStartDate(startDate);
      setUserWiseEndDate(endDate);

      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setScoreBoardSelectedDates(PreviousAndCurrentDate);
      setSaleDetailsSelectedDates(PreviousAndCurrentDate);
      setPerformingSelectedDates(PreviousAndCurrentDate);
      setPostSaleSelectedDates(PreviousAndCurrentDate);
      setUserWiseLeadsDates(PreviousAndCurrentDate);
      setBranchWiseLeadsDates(PreviousAndCurrentDate);
      setBranchWiseSaleDates(PreviousAndCurrentDate);
      setRegionWiseLeadsDates(PreviousAndCurrentDate);
      setRegionWiseSalesDates(PreviousAndCurrentDate);
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
      getDashboardDatesData(downliners_ids);
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getDashboardDatesData = async (downliners) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    try {
      const response = await getDashboardDates(convertAsJson?.user_id);
      console.log("dashboard dates response", response);
      const alldashboard_cardsdates = response?.data?.data || [];
      setAllDashboardCardsDates(alldashboard_cardsdates);

      if (permissions.includes("Score Board")) {
        getScoreBoardData(
          alldashboard_cardsdates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners,
          true
        );
      } else {
        getSaleDetailsData(
          alldashboard_cardsdates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners,
          true
        );
      }
    } catch (error) {
      console.log("dashboard dates error", error);
    }
  };

  const getScoreBoardData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api
  ) => {
    setScoreBoardLoader(true);
    //date handling
    let scoreboard_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      scoreboard_dates = dashboard_dates.find(
        (f) => f.card_name == "Score Board"
      );
      if (scoreboard_dates) {
        console.log("scoreboard_dates", scoreboard_dates);
        if (
          scoreboard_dates.card_settings == "Today" ||
          scoreboard_dates.card_settings == "Yesterday" ||
          scoreboard_dates.card_settings == "7 Days" ||
          scoreboard_dates.card_settings == "15 Days" ||
          scoreboard_dates.card_settings == "30 Days" ||
          scoreboard_dates.card_settings == "60 Days" ||
          scoreboard_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            scoreboard_dates.card_settings
          );
          scoreboard_dates = getdates_bylabel;
          console.log("getdates_bylabel", getdates_bylabel);
          setScoreBoardSelectedDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setScoreBoardSelectedDates([
            scoreboard_dates.card_settings.start_date,
            scoreboard_dates.card_settings.end_date,
          ]);
        }
      }
    }
    const payload = {
      start_date: scoreboard_dates
        ? scoreboard_dates.card_settings.start_date
        : startDate,
      end_date: scoreboard_dates
        ? scoreboard_dates.card_settings.end_date
        : endDate,
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
            dashboard_dates,
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
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api
  ) => {
    if (!permissions.includes("Sale Performance")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getPostSalePerformance(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true
      );
      return;
    }
    setSaleDetailsLoader(true);

    //date handling
    let saleperformance_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      saleperformance_dates = dashboard_dates.find(
        (f) => f.card_name == "Sale Performance"
      );
      if (saleperformance_dates) {
        if (
          saleperformance_dates.card_settings == "Today" ||
          saleperformance_dates.card_settings == "Yesterday" ||
          saleperformance_dates.card_settings == "7 Days" ||
          saleperformance_dates.card_settings == "15 Days" ||
          saleperformance_dates.card_settings == "30 Days" ||
          saleperformance_dates.card_settings == "60 Days" ||
          saleperformance_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            saleperformance_dates.card_settings
          );
          saleperformance_dates = getdates_bylabel;
          setSaleDetailsSelectedDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setSaleDetailsSelectedDates([
            saleperformance_dates.card_settings.start_date,
            saleperformance_dates.card_settings.end_date,
          ]);
        }
      }
    }
    const payload = {
      start_date: saleperformance_dates
        ? saleperformance_dates.card_settings.start_date
        : startDate,
      end_date: saleperformance_dates
        ? saleperformance_dates.card_settings.end_date
        : endDate,
      user_ids: downliners,
    };
    try {
      const response = await getScoreBoard(payload);
      console.log("sale details response", response);
      const saleDetails_data = response?.data?.data;
      const leadDetails_series = [
        Number(saleDetails_data?.sale_volume || 0),
        Number(saleDetails_data?.total_collection || 0),
        Number(saleDetails_data?.pending_payment || 0),
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
          getPostSalePerformance(
            dashboard_dates,
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true
          );
        }
      }, 300);
    }
  };

  const getPostSalePerformance = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api
  ) => {
    if (!permissions.includes("Post Sale Performance")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getUserWiseLeadCountsData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
        1
      );
      return;
    }
    setPostSaleLoader(true);

    //date handling
    let postsale_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      postsale_dates = dashboard_dates.find(
        (f) => f.card_name == "Post Sale Performance"
      );
      if (postsale_dates) {
        if (
          postsale_dates.card_settings == "Today" ||
          postsale_dates.card_settings == "Yesterday" ||
          postsale_dates.card_settings == "7 Days" ||
          postsale_dates.card_settings == "15 Days" ||
          postsale_dates.card_settings == "30 Days" ||
          postsale_dates.card_settings == "60 Days" ||
          postsale_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            postsale_dates.card_settings
          );
          postsale_dates = getdates_bylabel;
          setPostSaleSelectedDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setPostSaleSelectedDates([
            postsale_dates.card_settings.start_date,
            postsale_dates.card_settings.end_date,
          ]);
        }
      }
    }

    const payload = {
      start_date: postsale_dates
        ? postsale_dates.card_settings.start_date
        : startDate,
      end_date: postsale_dates
        ? postsale_dates.card_settings.end_date
        : endDate,
      user_ids: downliners,
    };
    try {
      const response = await getPostSaleDashboard(payload);
      console.log("post sale response", response);
      const postsale_data = response?.data?.data;
      // setPostSaleData(postsale_data);
      setPostSaleDownloadData([postsale_data]);
      const postsale_series = [
        Number(postsale_data?.awaiting_verify || 0),
        Number(postsale_data?.awaiting_trainer || 0),
        Number(postsale_data?.awaiting_trainer_verify || 0),
        Number(postsale_data?.verified_trainer || 0),
        Number(postsale_data?.rejected_trainer || 0),
        Number(postsale_data?.awaiting_class || 0),
        Number(postsale_data?.class_scheduled || 0),
        Number(postsale_data?.class_going || 0),
        Number(postsale_data?.google_review_count || 0),
        Number(postsale_data?.linkedin_review_count || 0),
        Number(postsale_data?.class_completed || 0),
        Number(postsale_data?.others || 0),
      ];

      if (
        postsale_series[0] == 0 &&
        postsale_series[1] == 0 &&
        postsale_series[2] == 0 &&
        postsale_series[3] == 0 &&
        postsale_series[4] == 0 &&
        postsale_series[5] == 0 &&
        postsale_series[6] == 0 &&
        postsale_series[7] == 0 &&
        postsale_series[8] == 0 &&
        postsale_series[9] == 0 &&
        postsale_series[10] == 0 &&
        postsale_series[11] == 0
      ) {
        setPostSaleDataSeries([]);
        return;
      }

      setPostSaleDataSeries(postsale_series);
    } catch (error) {
      setPostSaleDataSeries([]);
      setPostSaleDownloadData([]);
      console.log("post sale error", error);
    } finally {
      setTimeout(() => {
        setPostSaleLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api === true) {
          getUserWiseLeadCountsData(
            dashboard_dates,
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true,
            1
          );
        }
      }, 300);
    }
  };

  const handlePostSaleDashboard = (label) => {
    console.log("ra dashboard clicked bar", label);
    if (
      label == "Google Reviews" ||
      label == "LinkedIn Reviews" ||
      label === "Verified Trainers"
    ) {
      return;
    }
    const filterData = {
      status:
        label === "Awaiting Student Verify"
          ? "Awaiting Verify"
          : label === "Rejected Trainers"
          ? "Awaiting Trainer"
          : label === "Class Completed"
          ? "Completed"
          : label,
      startDate: postSaleSelectedDates[0],
      endDate: postSaleSelectedDates[1],
    };
    navigate("/customers", { state: filterData });
  };

  const getUserWiseLeadCountsData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
    type
  ) => {
    if (!permissions.includes("User-Wise Lead Analysis")) {
      const { month, startDate, endDate } = getActiveTargetMonthRange();
      getUserWiseScoreBoardData(
        dashboard_dates,
        startDate,
        endDate,
        downliners,
        true,
        1
      );
      return;
    }
    setUserWiseLeadsLoader(true);

    //date handling
    let userwiseleads_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      userwiseleads_dates = dashboard_dates.find(
        (f) => f.card_name == "User-Wise Lead Analysis"
      );
      if (userwiseleads_dates) {
        if (
          userwiseleads_dates.card_settings == "Today" ||
          userwiseleads_dates.card_settings == "Yesterday" ||
          userwiseleads_dates.card_settings == "7 Days" ||
          userwiseleads_dates.card_settings == "15 Days" ||
          userwiseleads_dates.card_settings == "30 Days" ||
          userwiseleads_dates.card_settings == "60 Days" ||
          userwiseleads_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            userwiseleads_dates.card_settings
          );
          userwiseleads_dates = getdates_bylabel;
          setUserWiseLeadsDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setUserWiseLeadsDates([
            userwiseleads_dates.card_settings.start_date,
            userwiseleads_dates.card_settings.end_date,
          ]);
        }
      }
    }
    const payload = {
      start_date: userwiseleads_dates
        ? userwiseleads_dates.card_settings.start_date
        : startDate,
      end_date: userwiseleads_dates
        ? userwiseleads_dates.card_settings.end_date
        : endDate,
      user_ids: downliners,
      type: type == 1 ? "Leads" : type == 2 ? "Follow Up" : "Customer Join",
    };

    try {
      const response = await getUserWiseLeadCounts(payload);
      console.log("userwise leadcounts response", response);
      const userwise_leads = response?.data?.data;
      console.log(userwise_leads);

      const xaxis = userwise_leads.map(
        (item) => `${item.user_id} (${item.user_name})`
      );

      const series = userwise_leads.map((item) =>
        Number(
          type == 1
            ? item.total_leads
            : type == 2
            ? item.followup_unhandled
            : ""
        )
      );

      const percentage = userwise_leads.map((item) => Number(item.percentage));

      setUserWiseLeadsConversion(percentage);

      if (type == 1) {
        const customers_count = userwise_leads.map((item) =>
          Number(item.customer_count)
        );
        setUserWiseLeadsJoingingsCount(customers_count);
      } else {
        setUserWiseLeadsJoingingsCount([]);
      }

      if (type == 2) {
        const total_followup = userwise_leads.map((item) =>
          Number(item.lead_followup_count)
        );

        const followup_handled = userwise_leads.map((item) =>
          Number(item.followup_handled)
        );

        setUserWiseTotalFollowUp(total_followup);
        setUserWiseFollowUpHandled(followup_handled);
      } else {
        setUserWiseFollowUpHandled([]);
        setUserWiseTotalFollowUp([]);
      }

      setUserWiseLeadsSeries(series);

      if (type == 3) {
        const customers_count = userwise_leads.map((item) =>
          Number(item.customer_count)
        );
        setUserWiseLeadsJoingingsCount(customers_count);
        setUserWiseLeadsSeries(customers_count);
      }

      setUserWiseLeadsXaxis(xaxis);
    } catch (error) {
      console.log("userwise leadcounts error", error);
      setUserWiseLeadsXaxis([]);
      setUserWiseLeadsSeries([]);
      setUserWiseLeadsConversion([]);
      setUserWiseLeadsJoingingsCount([]);
      setUserWiseFollowUpHandled([]);
      setUserWiseTotalFollowUp([]);
    } finally {
      setTimeout(() => {
        setUserWiseLeadsLoader(false);
        const { month, startDate, endDate } = getActiveTargetMonthRange();
        if (call_api == true) {
          getUserWiseScoreBoardData(
            dashboard_dates,
            startDate,
            endDate,
            downliners,
            true,
            1
          );
        }
      }, 300);
    }
  };

  const getUserWiseScoreBoardData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
    type
  ) => {
    if (!permissions.includes("User-Wise Sales Analysis")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getBranchWiseLeadsData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
        1,
        1
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
          getBranchWiseLeadsData(
            dashboard_dates,
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true,
            1,
            1
          );
        }
      }, 300);
    }
  };

  const getBranchWiseLeadsData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
    type,
    regionId
  ) => {
    if (!permissions.includes("Branch-Wise Lead Analysis")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getBranchWiseSalesData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
        1,
        1
      );
      return;
    }
    setBranchWiseLeadsLoader(true);

    //date handling
    let branchwiseleads_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      branchwiseleads_dates = dashboard_dates.find(
        (f) => f.card_name == "Branch-Wise Lead Analysis"
      );
      if (branchwiseleads_dates) {
        if (
          branchwiseleads_dates.card_settings == "Today" ||
          branchwiseleads_dates.card_settings == "Yesterday" ||
          branchwiseleads_dates.card_settings == "7 Days" ||
          branchwiseleads_dates.card_settings == "15 Days" ||
          branchwiseleads_dates.card_settings == "30 Days" ||
          branchwiseleads_dates.card_settings == "60 Days" ||
          branchwiseleads_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            branchwiseleads_dates.card_settings
          );
          branchwiseleads_dates = getdates_bylabel;
          setBranchWiseLeadsDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setBranchWiseLeadsDates([
            branchwiseleads_dates.card_settings.start_date,
            branchwiseleads_dates.card_settings.end_date,
          ]);
        }
      }
    }

    const payload = {
      start_date: branchwiseleads_dates
        ? branchwiseleads_dates.card_settings.start_date
        : startDate,
      end_date: branchwiseleads_dates
        ? branchwiseleads_dates.card_settings.end_date
        : endDate,
      user_ids: downliners,
      type: type == 1 ? "Leads" : type == 2 ? "Follow Up" : "Customer Join",
      region_id: regionId,
    };
    try {
      const response = await getBranchWiseLeadCounts(payload);
      console.log("branchwise leads response", response);
      const branchwise_leads = response?.data?.data;
      console.log(branchwise_leads);
      const xaxis = branchwise_leads.map((item) => item.branch_name);
      const series = branchwise_leads.map((item) =>
        Number(
          type == 1
            ? item.total_leads
            : type == 2
            ? item.followup_unhandled
            : ""
        )
      );
      const percentage = branchwise_leads.map((item) =>
        Number(item.percentage)
      );

      setBranchWiseLeadsConversion(percentage);

      if (type == 1) {
        const customers_count = branchwise_leads.map((item) =>
          Number(item.customer_count)
        );
        setBranchWiseLeadsJoingingsCount(customers_count);
      } else {
        setBranchWiseLeadsJoingingsCount([]);
      }

      if (type == 2) {
        const total_followup = branchwise_leads.map((item) =>
          Number(item.lead_followup_count)
        );
        const followup_handled = branchwise_leads.map((item) =>
          Number(item.followup_handled)
        );
        setBranchWiseTotalFollowUp(total_followup);
        setBranchWiseFollowUpHandled(followup_handled);
      } else {
        setBranchWiseTotalFollowUp([]);
        setBranchWiseFollowUpHandled([]);
      }

      setBranchWiseLeadsSeries(series);

      if (type == 3) {
        const customers_count = branchwise_leads.map((item) =>
          Number(item.customer_count)
        );
        setBranchWiseLeadsJoingingsCount(customers_count);
        setBranchWiseLeadsSeries(customers_count);
      }

      setBranchWiseLeadsXaxis(xaxis);
    } catch (error) {
      console.log("userwise leadcounts error", error);
      setBranchWiseLeadsXaxis([]);
      setBranchWiseLeadsSeries([]);
      setBranchWiseLeadsConversion([]);
      setBranchWiseLeadsJoingingsCount([]);
      setBranchWiseFollowUpHandled([]);
      setBranchWiseTotalFollowUp([]);
    } finally {
      setTimeout(() => {
        setBranchWiseLeadsLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api == true) {
          getBranchWiseSalesData(
            dashboard_dates,
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true,
            1,
            1
          );
        }
      }, 300);
    }
  };

  const getBranchWiseSalesData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
    type,
    regionId
  ) => {
    if (!permissions.includes("Branch-Wise Sales Analysis")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getRegionWiseLeadsData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
        1
      );
      return;
    }
    setBranchWiseSalesLoader(true);

    //date handling
    let branchwisesales_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      branchwisesales_dates = dashboard_dates.find(
        (f) => f.card_name == "Branch-Wise Sale Analysis"
      );
      if (branchwisesales_dates) {
        if (
          branchwisesales_dates.card_settings == "Today" ||
          branchwisesales_dates.card_settings == "Yesterday" ||
          branchwisesales_dates.card_settings == "7 Days" ||
          branchwisesales_dates.card_settings == "15 Days" ||
          branchwisesales_dates.card_settings == "30 Days" ||
          branchwisesales_dates.card_settings == "60 Days" ||
          branchwisesales_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            branchwisesales_dates.card_settings
          );
          branchwisesales_dates = getdates_bylabel;
          setBranchWiseSaleDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setBranchWiseSaleDates([
            branchwisesales_dates.card_settings.start_date,
            branchwisesales_dates.card_settings.end_date,
          ]);
        }
      }
    }

    const payload = {
      start_date: branchwisesales_dates
        ? branchwisesales_dates.card_settings.start_date
        : startDate,
      end_date: branchwisesales_dates
        ? branchwisesales_dates.card_settings.end_date
        : endDate,
      user_ids: downliners,
      type: type == 1 ? "Sale" : type == 2 ? "Collection" : "Pending",
      region_id: regionId,
    };
    try {
      const response = await getBranchWiseScoreBoard(payload);
      console.log("branchwise sales response", response);
      const branchwise_sales = response?.data?.data;

      const xaxis = branchwise_sales.map((item) => item.branch_name);
      console.log("branchwise xasis", xaxis);

      const series = branchwise_sales.map((item) =>
        type == 1
          ? Number(item.sale_volume)
          : type == 2
          ? Number(item.total_collection)
          : Number(item.pending)
      ); // for bar values

      setBranchWiseSalesXaxis(xaxis);
      setBranchWiseSalesSeries(series);
    } catch (error) {
      setBranchWiseSalesLoader(false);
      setBranchWiseSalesXaxis([]);
      setBranchWiseSalesSeries([]);
      console.log("branchwise sales error", error);
    } finally {
      setTimeout(() => {
        setBranchWiseSalesLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api == true) {
          getRegionWiseLeadsData(
            dashboard_dates,
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true,
            1
          );
        }
      }, 300);
    }
  };

  const getRegionWiseLeadsData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
    type
  ) => {
    if (!permissions.includes("Region-Wise Lead Analysis")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getRegionWiseSalesData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
        1
      );
      return;
    }
    setRegionWiseLeadsLoader(true);

    //date handling
    let regionwiseleads_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      regionwiseleads_dates = dashboard_dates.find(
        (f) => f.card_name == "Region-Wise Lead Analysis"
      );
      if (regionwiseleads_dates) {
        if (
          regionwiseleads_dates.card_settings == "Today" ||
          regionwiseleads_dates.card_settings == "Yesterday" ||
          regionwiseleads_dates.card_settings == "7 Days" ||
          regionwiseleads_dates.card_settings == "15 Days" ||
          regionwiseleads_dates.card_settings == "30 Days" ||
          regionwiseleads_dates.card_settings == "60 Days" ||
          regionwiseleads_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            regionwiseleads_dates.card_settings
          );
          regionwiseleads_dates = getdates_bylabel;
          setRegionWiseLeadsDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setRegionWiseLeadsDates([
            regionwiseleads_dates.card_settings.start_date,
            regionwiseleads_dates.card_settings.end_date,
          ]);
        }
      }
    }

    const payload = {
      start_date: regionwiseleads_dates
        ? regionwiseleads_dates.card_settings.start_date
        : startDate,
      end_date: regionwiseleads_dates
        ? regionwiseleads_dates.card_settings.end_date
        : endDate,
      user_ids: downliners,
      type: type == 1 ? "Leads" : type == 2 ? "Follow Up" : "Customer Join",
    };
    try {
      const response = await getRegionWiseLeadCounts(payload);
      console.log("regionwise leads response", response);
      const regionwise_leads = response?.data?.data;
      console.log("regionwise_leads", regionwise_leads);

      const xaxis = regionwise_leads.map((item) => item.region_name);

      setRegionWiseLeadsXaxis(xaxis);

      if (type == 1) {
        const region_wiseLeadsSeries = [
          {
            name: "Total Leads",
            data: regionwise_leads.map((item) => {
              return item.total_leads;
            }),
          },
          {
            name: "Total Joinings",
            data: regionwise_leads.map((item) => {
              return item.customer_count;
            }),
          },
          {
            name: "Conversion%",
            data: regionwise_leads.map((item) => {
              return item.percentage;
            }),
          },
        ];
        setRegionWiseLeadsSeries(region_wiseLeadsSeries);
      } else if (type == 2) {
        const region_wiseLeadsSeries = [
          {
            name: "Total Followup",
            data: regionwise_leads.map((item) => {
              return item.lead_followup_count;
            }),
          },
          {
            name: "Followup Handled",
            data: regionwise_leads.map((item) => {
              return item.followup_handled;
            }),
          },
          {
            name: "Followup Un-Handled",
            data: regionwise_leads.map((item) => {
              return item.followup_unhandled;
            }),
          },
          {
            name: "Efficiency%",
            data: regionwise_leads.map((item) => {
              return item.percentage;
            }),
          },
        ];
        setRegionWiseLeadsSeries(region_wiseLeadsSeries);
      } else {
        const region_wiseLeadsSeries = [
          {
            name: "Joinings",
            data: regionwise_leads.map((item) => {
              return item.customer_count;
            }),
          },
        ];
        setRegionWiseLeadsSeries(region_wiseLeadsSeries);
      }
    } catch (error) {
      console.log("regionwise leadcounts error", error);
      setRegionWiseLeadsXaxis([]);
      setRegionWiseLeadsSeries([]);
    } finally {
      setTimeout(() => {
        setRegionWiseLeadsLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api == true) {
          getRegionWiseSalesData(
            dashboard_dates,
            PreviousAndCurrentDate[0],
            PreviousAndCurrentDate[1],
            downliners,
            true,
            1
          );
        }
      }, 300);
    }
  };

  const getRegionWiseSalesData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
    type
  ) => {
    if (!permissions.includes("Region-Wise Sales Analysis")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getTopPerformanceData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true
      );
      return;
    }
    setRegionWiseSalesLoader(true);

    //date handling
    let branchwisesales_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      branchwisesales_dates = dashboard_dates.find(
        (f) => f.card_name == "Region-Wise Sales Analysis"
      );
      if (branchwisesales_dates) {
        if (
          branchwisesales_dates.card_settings == "Today" ||
          branchwisesales_dates.card_settings == "Yesterday" ||
          branchwisesales_dates.card_settings == "7 Days" ||
          branchwisesales_dates.card_settings == "15 Days" ||
          branchwisesales_dates.card_settings == "30 Days" ||
          branchwisesales_dates.card_settings == "60 Days" ||
          branchwisesales_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            branchwisesales_dates.card_settings
          );
          branchwisesales_dates = getdates_bylabel;
          setRegionWiseSalesDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setRegionWiseSalesDates([
            branchwisesales_dates.card_settings.start_date,
            branchwisesales_dates.card_settings.end_date,
          ]);
        }
      }
    }

    const payload = {
      start_date: branchwisesales_dates
        ? branchwisesales_dates.card_settings.start_date
        : startDate,
      end_date: branchwisesales_dates
        ? branchwisesales_dates.card_settings.end_date
        : endDate,
      user_ids: downliners,
      type: type == 1 ? "Sale" : type == 2 ? "Collection" : "Pending",
    };
    try {
      const response = await getRegionWiseScoreBoard(payload);
      console.log("regionwise sales response", response);
      const regionwise_sales = response?.data?.data;

      const xaxis = regionwise_sales.map((item) => item.region_name);

      setRegionWiseSalesXaxis(xaxis);

      if (type == 1) {
        const region_wiseSalesSeries = [
          {
            name: "Sale Volume",
            data: regionwise_sales.map((item) => {
              return item.sale_volume;
            }),
          },
        ];
        setRegionWiseSalesSeries(region_wiseSalesSeries);
      } else if (type == 2) {
        const region_wiseSalesSeries = [
          {
            name: "Collection",
            data: regionwise_sales.map((item) => {
              return item.total_collection;
            }),
          },
        ];
        setRegionWiseSalesSeries(region_wiseSalesSeries);
      } else {
        const region_wiseSalesSeries = [
          {
            name: "Pending",
            data: regionwise_sales.map((item) => {
              return item.pending;
            }),
          },
        ];
        setRegionWiseSalesSeries(region_wiseSalesSeries);
      }
    } catch (error) {
      setRegionWiseSalesLoader(false);
      setRegionWiseSalesXaxis([]);
      setRegionWiseSalesSeries([]);
      console.log("regionwise sales error", error);
    } finally {
      setTimeout(() => {
        setRegionWiseSalesLoader(false);
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        if (call_api == true) {
          getTopPerformanceData(
            dashboard_dates,
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
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api
  ) => {
    if (!permissions.includes("Top Performing Channels")) {
      return;
    }
    setPerformanceLoader(true);

    //date handling
    let topperformance_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      topperformance_dates = dashboard_dates.find(
        (f) => f.card_name == "Top Performance"
      );
      if (topperformance_dates) {
        if (
          topperformance_dates.card_settings == "Today" ||
          topperformance_dates.card_settings == "Yesterday" ||
          topperformance_dates.card_settings == "7 Days" ||
          topperformance_dates.card_settings == "15 Days" ||
          topperformance_dates.card_settings == "30 Days" ||
          topperformance_dates.card_settings == "60 Days" ||
          topperformance_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            topperformance_dates.card_settings
          );
          topperformance_dates = getdates_bylabel;
          setPerformingSelectedDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setPerformingSelectedDates([
            topperformance_dates.card_settings.start_date,
            topperformance_dates.card_settings.end_date,
          ]);
        }
      }
    }

    const payload = {
      start_date: topperformance_dates
        ? topperformance_dates.card_settings.start_date
        : startDate,
      end_date: topperformance_dates
        ? topperformance_dates.card_settings.end_date
        : endDate,
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
      }, 300);
    }
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);

    // if (permissions.includes("Score Board")) {
    //   getScoreBoardData(
    //     allDashboardCardsDates,
    //     PreviousAndCurrentDate[0],
    //     PreviousAndCurrentDate[1],
    //     value,
    //     true
    //   );
    // } else {
    //   getSaleDetailsData(
    //     allDashboardCardsDates,
    //     PreviousAndCurrentDate[0],
    //     PreviousAndCurrentDate[1],
    //     value,
    //     true
    //   );
    // }
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
      setUserWiseLeadsLoader(true);
      setUserWiseLoader(true);
      setBranchWiseLeadsLoader(true);
      setBranchWiseSalesLoader(true);
      setPerformanceLoader(true);
      setPostSaleLoader(true);
      setUserWiseLeadsType(1);
      setUserWiseType(1);
      setBranchWiseLeadsRegion(1);
      setBranchWiseLeadsType(1);
      setBranchWiseSaleRegion(1);
      setBranchWiseSaleType(1);
      if (permissions.includes("Score Board")) {
        getScoreBoardData(
          allDashboardCardsDates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners_ids,
          true
        );
      } else {
        getSaleDetailsData(
          allDashboardCardsDates,
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

  //handle download
  const handleUserWiseLeadsDownload = async () => {
    setUserWiseLeadDownloadLoader(true);
    const payload = {
      user_ids: allDownliners,
      start_date: userWiseLeadsDates[0],
      end_date: userWiseLeadsDates[1],
    };
    try {
      const response = await downloadUserWiseLeadCounts(payload);
      console.log("download response", response);
      const data = response?.data?.data || [];
      const columns = DashboardDownloadColumns("Userwise Leads");
      DownloadTableAsCSV(
        data,
        columns,
        `${moment(userWiseLeadsDates[0]).format("DD-MM-YYYY")} to ${moment(
          userWiseLeadsDates[1]
        ).format("DD-MM-YYYY")} User-Wise Lead Analysis.csv`
      );
      setTimeout(() => {
        setUserWiseLeadDownloadLoader(false);
      }, 300);
    } catch (error) {
      setUserWiseLeadDownloadLoader(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleUserWiseSalesDownload = async () => {
    setUserWiseSalesDownloadLoader(true);
    const payload = {
      user_ids: allDownliners,
      start_date: userWiseStartDate,
      end_date: userWiseEndDate,
    };
    try {
      const response = await downloadUserWiseSalesCounts(payload);
      console.log("sales download response", response);
      const data = response?.data?.data || [];
      const columns = DashboardDownloadColumns("Userwise Sales");
      DownloadTableAsCSV(
        data,
        columns,
        `${moment(userWiseStartDate).format("DD-MM-YYYY")} to ${moment(
          userWiseEndDate
        ).format("DD-MM-YYYY")} User-Wise Sales Analysis.csv`
      );
      setTimeout(() => {
        setUserWiseSalesDownloadLoader(false);
      }, 300);
    } catch (error) {
      setUserWiseSalesDownloadLoader(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setScoreBoardSelectedDates(PreviousAndCurrentDate);
    setSaleDetailsSelectedDates(PreviousAndCurrentDate);
    setPerformingSelectedDates(PreviousAndCurrentDate);
    setPostSaleSelectedDates(PreviousAndCurrentDate);
    setUserWiseLeadsDates(PreviousAndCurrentDate);

    setUserWiseLeadsType(1);
    setUserWiseType(1);
    setBranchWiseLeadsDates(PreviousAndCurrentDate);
    setBranchWiseLeadsRegion(1);
    setBranchWiseLeadsType(1);
    setBranchWiseSaleDates(PreviousAndCurrentDate);
    setBranchWiseSaleRegion(1);
    setBranchWiseSaleType(1);
    setRegionWiseLeadsDates(PreviousAndCurrentDate);
    setRegionWiseLeadsType(1);
    setRegionWiseSalesDates(PreviousAndCurrentDate);
    setRegionWiseSalesType(1);

    setSelectedUserId(null);
    setScoreBoardLoader(true);
    setSaleDetailsLoader(true);
    setPerformanceLoader(true);
    setPostSaleLoader(true);
    getAllDownlineUsersData(loginUserId);
  };

  const updateDashboardCardDate = async (name, startDate, endDate) => {
    let get_item;
    if (allDashboardCardsDates.length >= 1) {
      get_item = allDashboardCardsDates.find(
        (f) => f.user_id == loginUserId && f.card_name == name
      );
    } else {
      get_item = null;
    }

    const get_rangelabel = getRangeLabel(startDate, endDate);
    console.log("get_rangelabel", get_rangelabel);

    const payload = {
      user_id: loginUserId,
      card_name: name,
      card_settings: get_rangelabel
        ? get_rangelabel
        : { start_date: startDate, end_date: endDate },
      ...(get_item && { id: get_item.id }),
    };
    console.log("update date payload", payload);
    try {
      await updateDashboardDates(payload);
    } catch (error) {
      console.log("update card date", error);
    } finally {
      try {
        const response = await getDashboardDates(loginUserId);
        console.log("dashboard dates response", response);
        const alldashboard_cardsdates = response?.data?.data || [];
        setAllDashboardCardsDates(alldashboard_cardsdates);
      } catch (error) {
        console.log("dashboard dates", error);
      }
    }
  };

  const regionWiseLeadsLineChartOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: false, // Show toolbar (can be set to false to hide all)
      },
    },
    stroke: {
      curve: "smooth", // Keeps the line straight for the line chart
    },
    xaxis: {
      categories: regionWiseLeadsXaxis,
      labels: {
        show: true,
        rotateAlways: regionWiseLeadsSeries.length >= 6 ? true : false, // Ensure rotation is applied
        rotate: -45, // Rotate labels by -40 degrees
        color: ["#ffffff"],
        style: {
          fontFamily: "Poppins, sans-serif", // Change font family of y-axis labels
        },
      },
      trim: true,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value.toLocaleString("en-IN");
        },
        style: {
          fontFamily: "Poppins, sans-serif",
        },
      },
      title: {
        text: "Value",
      },
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex, dataPointIndex }) {
          // Show corresponding x-axis name and y value
          return `<span style="margin-left: -6px; font-family:Poppins, sans-serif;">${val.toLocaleString(
            "en-IN"
          )}</span>`;
        },
      },
      style: {
        fontFamily: "Poppins, sans-serif", // Change font family of y-axis labels
      },
    },
    legend: {
      show: true,
      position: "bottom", // optional
      fontFamily: "Poppins, sans-serif",
      fontSize: "11px",
    },
    colors:
      regionWiseLeadsType == 1
        ? ["#5b69ca", "#258a25", "#607d8b"]
        : regionWiseLeadsType == 2
        ? ["#5b69ca", "#258a25", "#d32f2fcc", "#607d8b"]
        : ["#258a25"], // Different colors for the three series
  };

  const regionWiseSalesLineChartOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: false, // Show toolbar (can be set to false to hide all)
      },
    },
    stroke: {
      curve: "smooth", // Keeps the line straight for the line chart
    },
    xaxis: {
      categories: regionWiseSalesXaxis,
      labels: {
        show: true,
        rotateAlways: regionWiseSalesSeries.length >= 6 ? true : false, // Ensure rotation is applied
        rotate: -45, // Rotate labels by -40 degrees
        color: ["#ffffff"],
        style: {
          fontFamily: "Poppins, sans-serif", // Change font family of y-axis labels
        },
      },
      trim: true,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value.toLocaleString("en-IN");
        },
        style: {
          fontFamily: "Poppins, sans-serif",
        },
      },
      title: {
        text: "Value",
      },
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex, dataPointIndex }) {
          // Show corresponding x-axis name and y value
          return `<span style="margin-left: -6px; font-family:Poppins, sans-serif;">${val.toLocaleString(
            "en-IN"
          )}</span>`;
        },
      },
      style: {
        fontFamily: "Poppins, sans-serif", // Change font family of y-axis labels
      },
    },
    colors:
      regionWiseSalesType == 1
        ? ["#5b69ca"]
        : regionWiseSalesType == 2
        ? ["#258a25"]
        : ["#d32f2fcc"], // Different colors for the three series
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
                        updateDashboardCardDate(
                          "Score Board",
                          dates[0],
                          dates[1]
                        );
                        getScoreBoardData(
                          null,
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
                  <Row
                    className="dashboard_leadcountcard_progressbar_mainContainer"
                    style={{ marginTop: "20px" }}
                  >
                    <Col span={11}>
                      <div className="dashboard_leadcount_main_container">
                        <div className="dashboard_leadcount_icon_container">
                          <PiHandCoins size={20} />
                        </div>
                        <div className="dashboard_leadcount_container">
                          <p>Total Leads</p>
                          <p
                            style={{
                              marginTop: "4px",
                              color: "#5b69ca",
                              fontSize: "24px",
                            }}
                          >
                            {scoreCardDetails &&
                            (scoreCardDetails.total_leads != undefined ||
                              scoreCardDetails.total_leads != null)
                              ? Number(
                                  scoreCardDetails.total_leads
                                ).toLocaleString("en-IN")
                              : "-"}
                          </p>
                        </div>
                      </div>

                      <div
                        className="dashboard_leadcount_main_container"
                        style={{ marginTop: "40px" }}
                      >
                        <div className="dashboard_joiningcount_icon_container">
                          <PiUsersThreeBold size={20} />
                        </div>
                        <div className="dashboard_leadcount_container">
                          <p>Total Joinings</p>
                          <p
                            style={{
                              marginTop: "4px",
                              color: "#3c9111",
                              fontSize: "24px",
                            }}
                          >
                            {scoreCardDetails &&
                            (scoreCardDetails.total_join != undefined ||
                              scoreCardDetails.total_join != null)
                              ? Number(
                                  scoreCardDetails.total_join
                                ).toLocaleString("en-IN")
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </Col>

                    <Col span={13} style={{ display: "flex" }}>
                      <CommonDonutChart
                        labels={[
                          "Total Followup",
                          "Followup Handled",
                          "Followup Un-Handled",
                        ]}
                        series={[
                          scoreCardDetails?.total_followups
                            ? Number(scoreCardDetails.total_followups)
                            : 0,
                          scoreCardDetails?.follow_up_handled
                            ? Number(scoreCardDetails.follow_up_handled)
                            : 0,
                          scoreCardDetails?.follow_up_unhandled
                            ? Number(scoreCardDetails.follow_up_unhandled)
                            : 0,
                        ]}
                        efficientValue={
                          scoreCardDetails?.follow_up_percentage
                            ? Number(scoreCardDetails.follow_up_percentage)
                            : 0
                        }
                        // series={[1116, 2579]}
                        showTotal={true}
                        labelsfontSize="15px"
                        legendFontSize="10px"
                        colors={["#5b6aca", "#009688", "#d32f2fcc"]}
                        height={260}
                      />
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
                        updateDashboardCardDate(
                          "Sale Performance",
                          dates[0],
                          dates[1]
                        );
                        getSaleDetailsData(
                          null,
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

              <div style={{ position: "relative" }}>
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
            </div>
          </Col>
        )}

        {permissions.includes("Post Sale Performance") && (
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={24}
            style={{
              marginTop: "30px",
            }}
          >
            <div className="dashboard_leadcount_card">
              <Row className="dashboard_leadcount_header_container">
                <Col span={18}>
                  <div style={{ padding: "12px 12px 8px 12px" }}>
                    <p className="dashboard_scrorecard_heading">
                      Post Sale Performance
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(postSaleSelectedDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(postSaleSelectedDates[1]).format(
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
                      value={postSaleSelectedDates}
                      onDateChange={(dates) => {
                        setPostSaleSelectedDates(dates);
                        updateDashboardCardDate(
                          "Post Sale Performance",
                          dates[0],
                          dates[1]
                        );
                        getPostSalePerformance(
                          null,
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

              <div style={{ position: "relative" }}>
                {permissions.includes("Download Dashboard Data") && (
                  <div className="hr_dashboard_download_container">
                    <Tooltip placement="top" title="Download">
                      <Button
                        className="dashboard_download_button"
                        onClick={() => {
                          const columns = DashboardDownloadColumns(
                            "Post Sale Performance"
                          );
                          DownloadTableAsCSV(
                            postSaleDownloadData,
                            columns,
                            `${moment(postSaleSelectedDates[0]).format(
                              "DD-MM-YYYY"
                            )} to ${moment(postSaleSelectedDates[1]).format(
                              "DD-MM-YYYY"
                            )} RA Performance.csv`
                          );
                        }}
                      >
                        <DownloadOutlined className="download_icon" />
                      </Button>
                    </Tooltip>
                  </div>
                )}

                <div className="dadhboard_chartsContainer">
                  {postSaleLoader ? (
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
                      {postSaleDataSeries.length >= 1 ? (
                        <PostSalePerformanceChart
                          chartData={postSaleDataSeries}
                          clickedBar={handlePostSaleDashboard}
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
                        updateDashboardCardDate(
                          "User-Wise Lead Analysis",
                          dates[0],
                          dates[1]
                        );
                        getUserWiseLeadCountsData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
                          userWiseLeadsType
                        );
                      }}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col span={13}></Col>
                <Col
                  span={11}
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
                        name: "Leads",
                      },
                      {
                        id: 2,
                        name: "Followup Un-Handled",
                      },
                      {
                        id: 3,
                        name: "Joinings",
                      },
                    ]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserWiseLeadsType(value);
                      getUserWiseLeadCountsData(
                        null,
                        userWiseLeadsDates[0],
                        userWiseLeadsDates[1],
                        allDownliners,
                        false,
                        value
                      );
                    }}
                    value={userWiseLeadsType}
                  />

                  {permissions.includes("Download Dashboard Data") && (
                    <Tooltip placement="top" title="Download">
                      <Button
                        className={
                          userWiseLeadDownloadLoader
                            ? "dashboard_loading_download_button"
                            : "dashboard_download_button"
                        }
                        onClick={handleUserWiseLeadsDownload}
                        disabled={userWiseLeadDownloadLoader}
                      >
                        {userWiseLeadDownloadLoader ? (
                          <Spin
                            indicator={<LoadingOutlined spin />}
                            size="small"
                            style={{ color: "#333" }}
                          />
                        ) : (
                          <DownloadOutlined className="download_icon" />
                        )}
                      </Button>
                    </Tooltip>
                  )}
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
                          conversion={userWiseLeadsConversion}
                          totalFollowUp={userWiseTotalFollowUp}
                          followUpHandled={userWiseFollowUpHandled}
                          customers={userWiseLeadjoiningsCount}
                          colors={[
                            userWiseLeadsType == 1
                              ? "#009688"
                              : userWiseLeadsType == 2
                              ? "#607D8B"
                              : "#5b6aca",
                          ]}
                          height={
                            userWiseLeadsXaxis.length <= 5
                              ? 280
                              : userWiseLeadsXaxis.length * 45
                          }
                          type={
                            userWiseLeadsType == 1
                              ? "Leads"
                              : userWiseLeadsType == 2
                              ? "Follow Up"
                              : "Customer Join"
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

                          // Start date: 26th of previous month
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
                            null,
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
                <Col span={13}></Col>
                <Col
                  span={11}
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
                        null,
                        userWiseStartDate,
                        userWiseEndDate,
                        allDownliners,
                        false,
                        value
                      );
                    }}
                    value={userWiseType}
                  />
                  {permissions.includes("Download Dashboard Data") && (
                    <Tooltip placement="top" title="Download">
                      <Button
                        className={
                          userWiseSalesDownloadLoader
                            ? "dashboard_loading_download_button"
                            : "dashboard_download_button"
                        }
                        onClick={handleUserWiseSalesDownload}
                        disabled={userWiseSalesDownloadLoader}
                      >
                        {userWiseSalesDownloadLoader ? (
                          <Spin
                            indicator={<LoadingOutlined spin />}
                            size="small"
                            style={{ color: "#333" }}
                          />
                        ) : (
                          <DownloadOutlined className="download_icon" />
                        )}
                      </Button>
                    </Tooltip>
                  )}
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
                        // series={[12, 34, 60, 99, 130]}
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

        {permissions.includes("Branch-Wise Lead Analysis") && (
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
                      Branch-Wise Lead Analysis
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(branchWiseLeadsDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(branchWiseLeadsDates[1]).format(
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
                      value={branchWiseLeadsDates}
                      onDateChange={(dates) => {
                        setBranchWiseLeadsDates(dates);
                        updateDashboardCardDate(
                          "Branch-Wise Lead Analysis",
                          dates[0],
                          dates[1]
                        );
                        getBranchWiseLeadsData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
                          branchWiseLeadsType,
                          branchWiseLeadsRegion
                        );
                      }}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col span={6}></Col>
                <Col
                  span={18}
                  className="dashboard_userwise_typefield_container"
                >
                  <CommonSelectField
                    label="Region"
                    height="35px"
                    labelMarginTop="-1px"
                    labelFontSize="12px"
                    width="100%"
                    options={[
                      {
                        id: 1,
                        name: "Chennai",
                      },
                      {
                        id: 2,
                        name: "Bangalore",
                      },
                      {
                        id: 3,
                        name: "Hub",
                      },
                    ]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBranchWiseLeadsRegion(value);
                      getBranchWiseLeadsData(
                        null,
                        branchWiseLeadsDates[0],
                        branchWiseLeadsDates[1],
                        allDownliners,
                        false,
                        branchWiseLeadsType,
                        value
                      );
                    }}
                    value={branchWiseLeadsRegion}
                  />
                  <CommonSelectField
                    label="Type"
                    height="35px"
                    labelMarginTop="-1px"
                    labelFontSize="12px"
                    width="100%"
                    options={[
                      {
                        id: 1,
                        name: "Leads",
                      },
                      {
                        id: 2,
                        name: "Followup Un-Handled",
                      },
                      {
                        id: 3,
                        name: "Joinings",
                      },
                    ]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBranchWiseLeadsType(value);
                      getBranchWiseLeadsData(
                        null,
                        branchWiseLeadsDates[0],
                        branchWiseLeadsDates[1],
                        allDownliners,
                        false,
                        value,
                        branchWiseLeadsRegion
                      );
                    }}
                    value={branchWiseLeadsType}
                  />
                </Col>
              </Row>

              <div
                style={{
                  padding: "0px 12px 12px 12px",
                }}
              >
                <div className="dadhboard_chartsContainer">
                  {branchWiseLeadsLoader ? (
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
                      {branchWiseLeadsSeries.length >= 1 ? (
                        <BranchwiseLeadChart
                          xaxis={branchWiseLeadsXaxis}
                          series={branchWiseLeadsSeries}
                          conversion={branchWiseLeadsConversion}
                          totalFollowUp={branchWiseTotalFollowUp}
                          followUpHandled={branchWiseFollowUpHandled}
                          customers={branchWiseLeadjoiningsCount}
                          colors={[
                            branchWiseLeadsType == 1
                              ? "#009688"
                              : branchWiseLeadsType == 2
                              ? "#607D8B"
                              : "#5b6aca",
                          ]}
                          height={320}
                          type={
                            branchWiseLeadsType == 1
                              ? "Leads"
                              : branchWiseLeadsType == 2
                              ? "Follow Up"
                              : "Customer Join"
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

        {permissions.includes("Branch-Wise Sales Analysis") && (
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
                      Branch-Wise Sale Analysis
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(branchWiseSaleDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(branchWiseSaleDates[1]).format(
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
                      value={branchWiseSaleDates}
                      onDateChange={(dates) => {
                        setBranchWiseSaleDates(dates);
                        updateDashboardCardDate(
                          "Branch-Wise Sale Analysis",
                          dates[0],
                          dates[1]
                        );
                        getBranchWiseSalesData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
                          branchWiseSaleType,
                          branchWiseSaleRegion
                        );
                      }}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col span={6}></Col>
                <Col
                  span={18}
                  className="dashboard_userwise_typefield_container"
                >
                  <CommonSelectField
                    label="Region"
                    height="35px"
                    labelMarginTop="-1px"
                    labelFontSize="12px"
                    width="100%"
                    options={[
                      {
                        id: 1,
                        name: "Chennai",
                      },
                      {
                        id: 2,
                        name: "Bangalore",
                      },
                      {
                        id: 3,
                        name: "Hub",
                      },
                    ]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBranchWiseSaleRegion(value);
                      getBranchWiseSalesData(
                        null,
                        branchWiseSaleDates[0],
                        branchWiseSaleDates[1],
                        allDownliners,
                        false,
                        branchWiseSaleType,
                        value
                      );
                    }}
                    value={branchWiseSaleRegion}
                  />
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
                      setBranchWiseSaleType(value);
                      getBranchWiseSalesData(
                        null,
                        branchWiseSaleDates[0],
                        branchWiseSaleDates[1],
                        allDownliners,
                        false,
                        value,
                        branchWiseSaleRegion
                      );
                    }}
                    value={branchWiseSaleType}
                  />
                </Col>
              </Row>
              <div
                style={{
                  padding: "0px 12px 12px 12px",
                }}
              >
                {branchWiseSalesLoader ? (
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
                    {branchWiseSalesSeries.length >= 1 ? (
                      <BranchwiseSalesChart
                        xaxis={branchWiseSalesXaxis}
                        series={branchWiseSalesSeries} // series={userWiseSeries}
                        colors={[
                          branchWiseSaleType == 1
                            ? "#5b6aca"
                            : branchWiseSaleType == 2
                            ? "#258a25"
                            : "#b22021",
                        ]}
                        type={
                          branchWiseSaleType == 1
                            ? "Sale"
                            : branchWiseSaleType == 2
                            ? "Collection"
                            : "Pending"
                        }
                        height={320}
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

        {permissions.includes("Region-Wise Lead Analysis") && (
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
                      Region-Wise Lead Analysis
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(regionWiseLeadsDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(regionWiseLeadsDates[1]).format(
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
                      value={regionWiseLeadsDates}
                      onDateChange={(dates) => {
                        setRegionWiseLeadsDates(dates);
                        updateDashboardCardDate(
                          "Region-Wise Lead Analysis",
                          dates[0],
                          dates[1]
                        );
                        getRegionWiseLeadsData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
                          regionWiseLeadsType
                        );
                      }}
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
                        name: "Leads",
                      },
                      {
                        id: 2,
                        name: "Followup Un-Handled",
                      },
                      {
                        id: 3,
                        name: "Joinings",
                      },
                    ]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRegionWiseLeadsType(value);
                      getRegionWiseLeadsData(
                        null,
                        regionWiseLeadsDates[0],
                        regionWiseLeadsDates[1],
                        allDownliners,
                        false,
                        value
                      );
                    }}
                    value={regionWiseLeadsType}
                  />
                </Col>
              </Row>

              <div
                style={{
                  padding: "0px 12px 12px 12px",
                }}
              >
                <div className="dadhboard_chartsContainer">
                  {regionWiseLeadsLoader ? (
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
                      {regionWiseLeadsSeries.length >= 1 ? (
                        <ReactApexChart
                          options={regionWiseLeadsLineChartOptions}
                          series={regionWiseLeadsSeries}
                          type="line"
                          height={350}
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

        {permissions.includes("Region-Wise Sales Analysis") && (
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
                      Region-Wise Sales Analysis
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(regionWiseSalesDates[0]).format(
                        "DD MMM YYYY"
                      )} to ${moment(regionWiseSalesDates[1]).format(
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
                      value={regionWiseSalesDates}
                      onDateChange={(dates) => {
                        setRegionWiseSalesDates(dates);
                        updateDashboardCardDate(
                          "Region-Wise Sales Analysis",
                          dates[0],
                          dates[1]
                        );
                        getRegionWiseSalesData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
                          regionWiseSalesType
                        );
                      }}
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
                      setRegionWiseSalesType(value);
                      getRegionWiseSalesData(
                        null,
                        regionWiseSalesDates[0],
                        regionWiseSalesDates[1],
                        allDownliners,
                        false,
                        value
                      );
                    }}
                    value={regionWiseSalesType}
                  />
                </Col>
              </Row>

              <div
                style={{
                  padding: "0px 12px 12px 12px",
                }}
              >
                <div className="dadhboard_chartsContainer">
                  {regionWiseSalesLoader ? (
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
                      {regionWiseSalesSeries.length >= 1 ? (
                        <ReactApexChart
                          options={regionWiseSalesLineChartOptions}
                          series={regionWiseSalesSeries}
                          type="line"
                          height={350}
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
                        updateDashboardCardDate(
                          "Top Performance",
                          dates[0],
                          dates[1]
                        );
                        getTopPerformanceData(
                          null,
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
      </Row>
    </div>
  );
}
