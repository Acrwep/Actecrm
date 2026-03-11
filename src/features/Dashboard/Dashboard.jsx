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
} from "../Common/Validation";
import {
  downloadUserWiseLeadCounts,
  downloadUserWiseSalesCounts,
  getAllDownlineUsers,
  getBranchWisePerformance,
  getDashboardDates,
  getPostSaleDashboard,
  getRegionWisePerformance,
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
import CommonMuiMonthPicker from "../Common/CommonMuiMonthPicker";
import UserwiseSalesChart from "./UserwiseSalesChart";
import CommonDonutChart from "../Common/CommonDonutChart";
import UserwiseLeadChart from "./UserwiseLeadChart";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import { DashboardDownloadColumns } from "./DashboardDownloadColumns";
import { CommonMessage } from "../Common/CommonMessage";
import PostSalePerformanceChart from "./PostSalePerformanceChart";
import BranchwisePerformanceChart from "./BranchwisePerformanceChart";
import RegionwisePerformanceChart from "./RegionwisePerformanceChart";

export default function Dashboard() {
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
    [],
  );
  const [userWiseFollowUpHandled, setUserWiseFollowUpHandled] = useState([]);
  const [userWiseTotalFollowUp, setUserWiseTotalFollowUp] = useState([]);
  const [userWiseLeadDownloadLoader, setUserWiseLeadDownloadLoader] =
    useState(false);
  const [userWiseLeadsLoader, setUserWiseLeadsLoader] = useState(true);
  //User-Wise Sales Analysis
  const [month, setMonth] = useState(moment().format("MMMM - YYYY"));
  const [userWiseStartDate, setUserWiseStartDate] = useState(
    moment().subtract(1, "month").date(26).format("YYYY-MM-DD"), // previous month 26
  );

  const [userWiseEndDate, setUserWiseEndDate] = useState(
    moment().date(25).format("YYYY-MM-DD"), // current month 25
  );
  const [userWiseType, setUserWiseType] = useState(1);
  const [userWiseXaxis, setUserWiseXaxis] = useState([]);
  const [userWiseSeries, setUserWiseSeries] = useState([]);
  const [userWiseTargets, setUserWiseTargets] = useState([]);
  const [userWiseCollection, setUserWiseCollection] = useState([]);
  const [userWiseSalesDownloadLoader, setUserWiseSalesDownloadLoader] =
    useState(false);
  const [userWiseLoader, setUserWiseLoader] = useState(true);
  //branch-wise performance
  const branchWiseRegionOptions = [
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
  ];
  const [branchWiseRegionId, setBranchWiseRegionId] = useState(1);
  const branchWiseTypeOptions = [
    {
      id: "Leads",
      name: "Leads",
    },
    {
      id: "Follow Up",
      name: "Followup Un-Handled",
    },
    {
      id: "Customer Join",
      name: "Joinings",
    },
    {
      id: "Sale",
      name: "Sale Volume",
    },
    {
      id: "Collection",
      name: "Collection",
    },
    {
      id: "Pending",
      name: "Pending",
    },
  ];
  const [branchWiseTypeId, setBranchWiseTypeId] = useState("Leads");
  const [branchWiseDates, setBranchWiseDates] = useState([]);

  const [branchWiseXaxis, setBranchWiseXaxis] = useState([]);
  const [branchWiseSeries, setBranchWiseSeries] = useState([]);
  const [branchWiseConversion, setBranchWiseConversion] = useState([]);
  const [branchWiseJoiningsCount, setBranchWiseJoingingsCount] = useState([]);
  const [branchWiseFollowUpHandled, setBranchWiseFollowUpHandled] = useState(
    [],
  );
  const [branchWiseTotalFollowUp, setBranchWiseTotalFollowUp] = useState([]);
  const [branchWiseLoader, setBranchWiseLoader] = useState(true);
  // region-wise performance
  const [regionWiseDates, setRegionWiseDates] = useState([]);
  const [regionWiseType, setRegionWiseType] = useState("Leads");
  const [regionWiseXaxis, setRegionWiseXaxis] = useState([]);
  const [regionWiseSeries, setRegionWiseSeries] = useState([]);
  const [regionWiseConversion, setRegionWiseConversion] = useState([]);
  const [regionWiseJoiningsCount, setRegionWiseJoingingsCount] = useState([]);
  const [regionWiseFollowUpHandled, setRegionWiseFollowUpHandled] = useState(
    [],
  );
  const [regionWiseTotalFollowUp, setRegionWiseTotalFollowUp] = useState([]);
  const [regionWiseLoader, setRegionWiseLoader] = useState(true);
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
      setBranchWiseDates(PreviousAndCurrentDate);
      setRegionWiseDates(PreviousAndCurrentDate);
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
          true,
        );
      } else {
        getSaleDetailsData(
          alldashboard_cardsdates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners,
          true,
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
    call_api,
  ) => {
    setScoreBoardLoader(true);
    //date handling
    let scoreboard_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      scoreboard_dates = dashboard_dates.find(
        (f) => f.card_name == "Score Board",
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
            scoreboard_dates.card_settings,
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
      setScoreBoardLoader(false);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      if (call_api == true) {
        getSaleDetailsData(
          dashboard_dates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners,
          true,
        );
      }
    }
  };

  const getSaleDetailsData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
  ) => {
    if (!permissions.includes("Sale Performance")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getPostSalePerformance(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
      );
      return;
    }
    setSaleDetailsLoader(true);

    //date handling
    let saleperformance_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      saleperformance_dates = dashboard_dates.find(
        (f) => f.card_name == "Sale Performance",
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
            saleperformance_dates.card_settings,
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
      setSaleDetailsLoader(false);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      if (call_api == true) {
        getPostSalePerformance(
          dashboard_dates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners,
          true,
        );
      }
    }
  };

  const getPostSalePerformance = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
  ) => {
    if (!permissions.includes("Post Sale Performance")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getUserWiseLeadCountsData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
        1,
      );
      return;
    }
    setPostSaleLoader(true);

    //date handling
    let postsale_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      postsale_dates = dashboard_dates.find(
        (f) => f.card_name == "Post Sale Performance",
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
            postsale_dates.card_settings,
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
        Number(postsale_data?.certificate_generated || 0),
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
        postsale_series[11] == 0 &&
        postsale_series[12] == 0
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
      setPostSaleLoader(false);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      if (call_api === true) {
        getUserWiseLeadCountsData(
          dashboard_dates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners,
          true,
          1,
        );
      }
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
            : label == "Certificate Generated"
              ? "Passedout process"
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
    type,
  ) => {
    if (!permissions.includes("User-Wise Lead Analysis")) {
      const { month, startDate, endDate } = getActiveTargetMonthRange();
      getUserWiseScoreBoardData(
        dashboard_dates,
        startDate,
        endDate,
        downliners,
        true,
        1,
      );
      return;
    }
    setUserWiseLeadsLoader(true);

    //date handling
    let userwiseleads_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      userwiseleads_dates = dashboard_dates.find(
        (f) => f.card_name == "User-Wise Lead Analysis",
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
            userwiseleads_dates.card_settings,
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
        (item) => `${item.user_id} (${item.user_name})`,
      );

      const series = userwise_leads.map((item) =>
        Number(
          type == 1
            ? item.total_leads
            : type == 2
              ? item.followup_unhandled
              : "",
        ),
      );

      const percentage = userwise_leads.map((item) => Number(item.percentage));

      setUserWiseLeadsConversion(percentage);

      if (type == 1) {
        const customers_count = userwise_leads.map((item) =>
          Number(item.customer_count),
        );
        setUserWiseLeadsJoingingsCount(customers_count);
      } else {
        setUserWiseLeadsJoingingsCount([]);
      }

      if (type == 2) {
        const total_followup = userwise_leads.map((item) =>
          Number(item.lead_followup_count),
        );

        const followup_handled = userwise_leads.map((item) =>
          Number(item.followup_handled),
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
          Number(item.customer_count),
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
      setUserWiseLeadsLoader(false);
      const { month, startDate, endDate } = getActiveTargetMonthRange();
      if (call_api == true) {
        getUserWiseScoreBoardData(
          dashboard_dates,
          startDate,
          endDate,
          downliners,
          true,
          1,
        );
      }
    }
  };

  const getUserWiseScoreBoardData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
    type,
  ) => {
    if (!permissions.includes("User-Wise Sales Analysis")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getBranchWisePerformanceData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
        "Leads",
        1,
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
        (item) => `${item.user_id} (${item.user_name})`,
      );
      const series = userwise_scorecard.map((item) =>
        type == 1
          ? Number(item.sale_volume)
          : type == 2
            ? Number(item.percentage)
            : Number(item.pending),
      ); // for bar values
      const targets = userwise_scorecard.map((item) =>
        Number(item.target_value),
      );
      const collections = userwise_scorecard.map((item) =>
        Number(item.total_collection),
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
      setUserWiseLoader(false);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      if (call_api == true) {
        getBranchWisePerformanceData(
          dashboard_dates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners,
          true,
          "Leads",
          1,
        );
      }
    }
  };

  const getBranchWisePerformanceData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
    type,
    regionId,
  ) => {
    if (!permissions.includes("Branch-Wise Performance")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getRegionWisePerformanceData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
        1,
      );
      return;
    }
    setBranchWiseLoader(true);

    //date handling
    let branchwise_performance_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      branchwise_performance_dates = dashboard_dates.find(
        (f) => f.card_name == "Branch-Wise Performance",
      );
      if (branchwise_performance_dates) {
        if (
          branchwise_performance_dates.card_settings == "Today" ||
          branchwise_performance_dates.card_settings == "Yesterday" ||
          branchwise_performance_dates.card_settings == "7 Days" ||
          branchwise_performance_dates.card_settings == "15 Days" ||
          branchwise_performance_dates.card_settings == "30 Days" ||
          branchwise_performance_dates.card_settings == "60 Days" ||
          branchwise_performance_dates.card_settings == "90 Days"
        ) {
          const getdates_bylabel = getDatesFromRangeLabel(
            branchwise_performance_dates.card_settings,
          );
          branchwise_performance_dates = getdates_bylabel;
          setBranchWiseDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setBranchWiseDates([
            branchwise_performance_dates.card_settings.start_date,
            branchwise_performance_dates.card_settings.end_date,
          ]);
        }
      }
    }

    const payload = {
      start_date: branchwise_performance_dates
        ? branchwise_performance_dates.card_settings.start_date
        : startDate,
      end_date: branchwise_performance_dates
        ? branchwise_performance_dates.card_settings.end_date
        : endDate,
      user_ids: downliners,
      type: type,
      region_id: regionId,
    };
    try {
      const response = await getBranchWisePerformance(payload);
      console.log("branchwise leads response", response);
      const branchwise_leads = response?.data?.data;
      console.log(branchwise_leads);
      const xaxis = branchwise_leads.map((item) => item.branch_name);
      const series = branchwise_leads.map((item) =>
        Number(
          type == "Leads"
            ? item.total_leads
            : type == "Follow Up"
              ? item.followup_unhandled
              : type == "Sale"
                ? item.sale_volume
                : type == "Collection"
                  ? item.total_collection
                  : type == "Pending"
                    ? item.pending
                    : "",
        ),
      );
      const percentage = branchwise_leads.map((item) =>
        Number(item.percentage),
      );

      setBranchWiseConversion(percentage);

      if (type == "Leads") {
        const customers_count = branchwise_leads.map((item) =>
          Number(item.customer_count),
        );
        setBranchWiseJoingingsCount(customers_count);
      } else {
        setBranchWiseJoingingsCount([]);
      }

      if (type == "Follow Up") {
        const total_followup = branchwise_leads.map((item) =>
          Number(item.lead_followup_count),
        );
        const followup_handled = branchwise_leads.map((item) =>
          Number(item.followup_handled),
        );
        setBranchWiseTotalFollowUp(total_followup);
        setBranchWiseFollowUpHandled(followup_handled);
      } else {
        setBranchWiseTotalFollowUp([]);
        setBranchWiseFollowUpHandled([]);
      }

      setBranchWiseSeries(series);

      if (type == "Customer Join") {
        const customers_count = branchwise_leads.map((item) =>
          Number(item.customer_count),
        );
        setBranchWiseJoingingsCount(customers_count);
        setBranchWiseSeries(customers_count);
      }

      setBranchWiseXaxis(xaxis);
    } catch (error) {
      console.log("branchwise performance error", error);
      setBranchWiseXaxis([]);
      setBranchWiseSeries([]);
      setBranchWiseConversion([]);
      setBranchWiseJoingingsCount([]);
      setBranchWiseFollowUpHandled([]);
      setBranchWiseTotalFollowUp([]);
    } finally {
      setBranchWiseLoader(false);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      if (call_api == true) {
        getRegionWisePerformanceData(
          dashboard_dates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners,
          true,
          "Leads",
        );
      }
    }
  };

  const getRegionWisePerformanceData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
    type,
  ) => {
    if (!permissions.includes("Region-Wise Performance")) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getTopPerformanceData(
        dashboard_dates,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        downliners,
        true,
      );
      return;
    }
    setRegionWiseLoader(true);

    //date handling
    let regionwiseleads_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      regionwiseleads_dates = dashboard_dates.find(
        (f) => f.card_name == "Region-Wise Performance",
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
            regionwiseleads_dates.card_settings,
          );
          regionwiseleads_dates = getdates_bylabel;
          setRegionWiseDates([
            getdates_bylabel.card_settings.start_date,
            getdates_bylabel.card_settings.end_date,
          ]);
        } else {
          setRegionWiseDates([
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
      // user_ids: downliners,
      type: type,
    };
    try {
      const response = await getRegionWisePerformance(payload);
      console.log("regionwise leads response", response);
      const regionwise_leads = response?.data?.data;
      console.log("regionwise_leads", regionwise_leads);

      const xaxis = regionwise_leads.map((item) => item.region_name);

      setRegionWiseXaxis(xaxis);

      const series = regionwise_leads.map((item) =>
        Number(
          type == "Leads"
            ? item.total_leads
            : type == "Follow Up"
              ? item.followup_unhandled
              : type == "Sale"
                ? item.sale_volume
                : type == "Collection"
                  ? item.total_collection
                  : type == "Pending"
                    ? item.pending
                    : "",
        ),
      );
      const percentage = regionwise_leads.map((item) =>
        Number(item.percentage),
      );

      setRegionWiseConversion(percentage);

      if (type == "Leads") {
        const customers_count = regionwise_leads.map((item) =>
          Number(item.customer_count),
        );
        setRegionWiseJoingingsCount(customers_count);
      } else {
        setRegionWiseJoingingsCount([]);
      }

      if (type == "Follow Up") {
        const total_followup = regionwise_leads.map((item) =>
          Number(item.lead_followup_count),
        );
        const followup_handled = regionwise_leads.map((item) =>
          Number(item.followup_handled),
        );
        setRegionWiseTotalFollowUp(total_followup);
        setRegionWiseFollowUpHandled(followup_handled);
      } else {
        setRegionWiseTotalFollowUp([]);
        setRegionWiseFollowUpHandled([]);
      }

      setRegionWiseSeries(series);

      if (type == "Customer Join") {
        const customers_count = regionwise_leads.map((item) =>
          Number(item.customer_count),
        );
        setRegionWiseJoingingsCount(customers_count);
        setRegionWiseSeries(customers_count);
      }

      setRegionWiseXaxis(xaxis);
    } catch (error) {
      console.log("regionwise leadcounts error", error);
      setRegionWiseXaxis([]);
      setRegionWiseSeries([]);
      setRegionWiseConversion([]);
      setRegionWiseJoingingsCount([]);
      setRegionWiseFollowUpHandled([]);
      setRegionWiseTotalFollowUp([]);
    } finally {
      setRegionWiseLoader(false);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      if (call_api == true) {
        getTopPerformanceData(
          dashboard_dates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners,
          true,
        );
      }
    }
  };

  const getTopPerformanceData = async (
    dashboard_dates,
    startDate,
    endDate,
    downliners,
    call_api,
  ) => {
    if (!permissions.includes("Top Performing Channels")) {
      return;
    }
    setPerformanceLoader(true);

    //date handling
    let topperformance_dates;
    if (dashboard_dates && dashboard_dates.length >= 1) {
      topperformance_dates = dashboard_dates.find(
        (f) => f.card_name == "Top Performance",
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
            topperformance_dates.card_settings,
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
      setPerformanceLoader(false);
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
      setBranchWiseLoader(true);
      setPerformanceLoader(true);
      setPostSaleLoader(true);
      setUserWiseLeadsType(1);
      setUserWiseType(1);
      setBranchWiseRegionId(1);
      setBranchWiseTypeId("Leads");
      if (permissions.includes("Score Board")) {
        getScoreBoardData(
          allDashboardCardsDates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners_ids,
          true,
        );
      } else {
        getSaleDetailsData(
          allDashboardCardsDates,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          downliners_ids,
          true,
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
          userWiseLeadsDates[1],
        ).format("DD-MM-YYYY")} User-Wise Lead Analysis.csv`,
      );
      setUserWiseLeadDownloadLoader(false);
    } catch (error) {
      setUserWiseLeadDownloadLoader(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
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
          userWiseEndDate,
        ).format("DD-MM-YYYY")} User-Wise Sales Analysis.csv`,
      );
      setUserWiseSalesDownloadLoader(false);
    } catch (error) {
      setUserWiseSalesDownloadLoader(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
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
    setBranchWiseDates(PreviousAndCurrentDate);
    setBranchWiseRegionId(1);
    setBranchWiseTypeId("Leads");
    setRegionWiseDates(PreviousAndCurrentDate);
    setRegionWiseType("Leads");
    setRegionWiseConversion([]);
    setRegionWiseJoingingsCount([]);
    setRegionWiseFollowUpHandled([]);
    setRegionWiseTotalFollowUp([]);

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
        (f) => f.user_id == loginUserId && f.card_name == name,
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
                        "DD MMM YYYY",
                      )} to ${moment(scoreBoardSelectedDates[1]).format(
                        "DD MMM YYYY",
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
                          dates[1],
                        );
                        getScoreBoardData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
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
                                  scoreCardDetails.total_leads,
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
                                  scoreCardDetails.total_join,
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
                        "DD MMM YYYY",
                      )} to ${moment(saleDetailsSelectedDates[1]).format(
                        "DD MMM YYYY",
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
                          dates[1],
                        );
                        getSaleDetailsData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
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
                        "DD MMM YYYY",
                      )} to ${moment(postSaleSelectedDates[1]).format(
                        "DD MMM YYYY",
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
                          dates[1],
                        );
                        getPostSalePerformance(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
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
                            "Post Sale Performance",
                          );
                          DownloadTableAsCSV(
                            postSaleDownloadData,
                            columns,
                            `${moment(postSaleSelectedDates[0]).format(
                              "DD-MM-YYYY",
                            )} to ${moment(postSaleSelectedDates[1]).format(
                              "DD-MM-YYYY",
                            )} RA Performance.csv`,
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
                        "DD MMM YYYY",
                      )} to ${moment(userWiseLeadsDates[1]).format(
                        "DD MMM YYYY",
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
                          dates[1],
                        );
                        getUserWiseLeadCountsData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
                          userWiseLeadsType,
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
                        value,
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
                        "DD MMM YYYY",
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
                            "MMMM YYYY",
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
                            userWiseType,
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
                        value,
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

        {permissions.includes("Branch-Wise Performance") && (
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
                      Branch-Wise Performance
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(branchWiseDates[0]).format(
                        "DD MMM YYYY",
                      )} to ${moment(branchWiseDates[1]).format(
                        "DD MMM YYYY",
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
                      value={branchWiseDates}
                      onDateChange={(dates) => {
                        setBranchWiseDates(dates);
                        updateDashboardCardDate(
                          "Branch-Wise Performance",
                          dates[0],
                          dates[1],
                        );
                        getBranchWisePerformanceData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
                          branchWiseTypeId,
                          branchWiseRegionId,
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
                    options={branchWiseRegionOptions}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBranchWiseRegionId(value);
                      getBranchWisePerformanceData(
                        null,
                        branchWiseDates[0],
                        branchWiseDates[1],
                        allDownliners,
                        false,
                        branchWiseTypeId,
                        value,
                      );
                    }}
                    value={branchWiseRegionId}
                  />
                  <CommonSelectField
                    label="Type"
                    height="35px"
                    labelMarginTop="-1px"
                    labelFontSize="12px"
                    width="100%"
                    options={branchWiseTypeOptions}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBranchWiseTypeId(value);
                      getBranchWisePerformanceData(
                        null,
                        branchWiseDates[0],
                        branchWiseDates[1],
                        allDownliners,
                        false,
                        value,
                        branchWiseRegionId,
                      );
                    }}
                    value={branchWiseTypeId}
                  />
                </Col>
              </Row>

              <div
                style={{
                  padding: "0px 12px 12px 12px",
                }}
              >
                <div className="dadhboard_chartsContainer">
                  {branchWiseLoader ? (
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
                      {branchWiseSeries.length >= 1 ? (
                        <BranchwisePerformanceChart
                          xaxis={branchWiseXaxis}
                          series={branchWiseSeries}
                          conversion={branchWiseConversion}
                          totalFollowUp={branchWiseTotalFollowUp}
                          followUpHandled={branchWiseFollowUpHandled}
                          customers={branchWiseJoiningsCount}
                          colors={[
                            branchWiseTypeId == "Leads"
                              ? "#009688"
                              : branchWiseTypeId == "Follow Up"
                                ? "#607D8B"
                                : branchWiseTypeId == "Collection" ||
                                    branchWiseTypeId == "Customer Join"
                                  ? "#258a25"
                                  : branchWiseTypeId == "Pending"
                                    ? "#b22021"
                                    : "#5b6aca",
                          ]}
                          height={320}
                          type={branchWiseTypeId}
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

        {permissions.includes("Region-Wise Performance") && (
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
                      Region-Wise Performance
                    </p>
                    <p className="dashboard_daterange_text">
                      <span style={{ fontWeight: "500" }}>Date Range: </span>
                      {`(${moment(regionWiseDates[0]).format(
                        "DD MMM YYYY",
                      )} to ${moment(regionWiseDates[1]).format(
                        "DD MMM YYYY",
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
                      value={regionWiseDates}
                      onDateChange={(dates) => {
                        setRegionWiseDates(dates);
                        updateDashboardCardDate(
                          "Region-Wise Performance",
                          dates[0],
                          dates[1],
                        );
                        getRegionWisePerformanceData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
                          regionWiseType,
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
                    options={branchWiseTypeOptions}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRegionWiseType(value);
                      getRegionWisePerformanceData(
                        null,
                        regionWiseDates[0],
                        regionWiseDates[1],
                        allDownliners,
                        false,
                        value,
                      );
                    }}
                    value={regionWiseType}
                  />
                </Col>
              </Row>

              <div
                style={{
                  padding: "0px 12px 12px 12px",
                }}
              >
                <div className="dadhboard_chartsContainer">
                  {regionWiseLoader ? (
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
                      {regionWiseSeries.length >= 1 ? (
                        <RegionwisePerformanceChart
                          xaxis={regionWiseXaxis}
                          series={regionWiseSeries}
                          conversion={regionWiseConversion}
                          totalFollowUp={regionWiseTotalFollowUp}
                          followUpHandled={regionWiseFollowUpHandled}
                          customers={regionWiseJoiningsCount}
                          colors={[
                            regionWiseType == "Leads"
                              ? "#009688"
                              : regionWiseType == "Follow Up"
                                ? "#607D8B"
                                : regionWiseType == "Collection" ||
                                    regionWiseType == "Customer Join"
                                  ? "#258a25"
                                  : regionWiseType == "Pending"
                                    ? "#b22021"
                                    : "#5b6aca",
                          ]}
                          height={320}
                          type={regionWiseType}
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
                        "DD MMM YYYY",
                      )} to ${moment(performingSelectedDates[1]).format(
                        "DD MMM YYYY",
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
                          dates[1],
                        );
                        getTopPerformanceData(
                          null,
                          dates[0],
                          dates[1],
                          allDownliners,
                          false,
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
