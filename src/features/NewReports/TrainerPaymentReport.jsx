import React, { useState, useEffect, useRef, useMemo } from "react";
import "./styles.css";
import {
  Button,
  Col,
  Divider,
  Row,
  Tooltip,
  Skeleton,
  Dropdown,
  Progress,
  Tag,
} from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  getBranches,
  getTrainers,
  getTrainerPayments,
  getTrainerReportsCounts,
} from "../ApiService/action";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiTable,
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiSend,
  FiAlertTriangle,
  FiUsers,
  FiArrowRight,
  FiCalendar,
} from "react-icons/fi";
import { FaRupeeSign, FaMoneyBillWave } from "react-icons/fa";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { TbReportAnalytics, TbTargetArrow } from "react-icons/tb";
import {
  getCurrentandPreviousweekDate,
  getFormattedDateString,
  formatIndianNumber,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSelectField from "../Common/CommonSelectField";
import moment from "moment";
import { useSelector } from "react-redux";

/**
 * Skeleton Loader for Trainer Payment Report
 */
function TrainerPaymentReportSkeleton() {
  return (
    <div className="presales_skeleton_wrapper">
      {/* 1. Executive Summary Skeleton (6 Cards) */}
      <div className="presales_section_header" style={{ marginTop: 20 }}>
        <h2 className="presales_section_title">
          <HiOutlineClipboardDocumentCheck
            style={{ color: "#0284c7" }}
            size={19}
          />{" "}
          Trainer Payment Executive Summary
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#e0f2fe", color: "#0284c7" }}
        >
          Disbursement & Liability KPIs
        </span>
      </div>

      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Col xs={24} sm={12} md={12} lg={8} xl={6} key={i}>
            <div className="presales_stat_card">
              <div className="presales_card_top">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 90, height: 14 }}
                  />
                  <Skeleton.Input
                    active
                    style={{ width: 110, height: 28, marginTop: 4 }}
                  />
                </div>
                <Skeleton.Avatar
                  active
                  size={38}
                  shape="square"
                  style={{ borderRadius: 10 }}
                />
              </div>
              <div className="presales_card_bottom">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 85, height: 16 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 55, height: 12 }}
                />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 2. Trainer & Customer Distribution Skeleton (3 Cards) */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <FiUsers style={{ color: "#0284c7" }} size={19} /> Trainer & Customer
          Distribution
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#e0f2fe", color: "#0284c7" }}
        >
          Paid Beneficiary & Volume Reach
        </span>
      </div>

      <Row gutter={[16, 16]}>
        {[1, 2, 3].map((i) => (
          <Col xs={24} sm={12} md={8} key={i}>
            <div className="presales_stat_card">
              <div className="presales_card_top">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 100, height: 14 }}
                  />
                  <Skeleton.Input
                    active
                    style={{ width: 120, height: 28, marginTop: 4 }}
                  />
                </div>
                <Skeleton.Avatar
                  active
                  size={38}
                  shape="square"
                  style={{ borderRadius: 10 }}
                />
              </div>
              <div className="presales_card_bottom">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 90, height: 16 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 70, height: 12 }}
                />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 3. Funnel Skeleton */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <TbTargetArrow style={{ color: "#0284c7" }} size={19} /> Payment Claim
          & Disbursement Pipeline
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#e0f2fe", color: "#0284c7" }}
        >
          4 Disbursement Milestones
        </span>
      </div>

      <div className="presales_funnel_container">
        <div className="presales_funnel_steps">
          {[1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
              <div className="presales_funnel_step">
                <div className="presales_funnel_step_header">
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: "80%", height: 13 }}
                  />
                  <div
                    className="presales_funnel_count_row"
                    style={{ marginTop: 8 }}
                  >
                    <Skeleton.Input active style={{ width: 50, height: 22 }} />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 45, height: 14 }}
                    />
                  </div>
                </div>
              </div>
              {i < 4 && <FiArrowRight className="presales_funnel_arrow" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TrainerPaymentReport({
  onBack,
  summaryStartAndEndDate,
  roleIds,
}) {
  const regionOptions = useSelector((state) => state.globalregionslist) || [];
  const reportContentRef = useRef(null);

  // Filter States
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [filterBranchOptions, setFilterBranchOptions] = useState([]);

  // Loading & Export States
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Raw API Data State
  const [reportCounts, setReportCounts] = useState({
    total_master_amount: 0,
    total_master_count: 0,
    link_sent_count: 0,
    link_sent_amount: 0,
    requested_count: 0,
    requested_amount: 0,
    awaiting_finance_count: 0,
    awaiting_finance_amount: 0,
    paid_count: 0,
    paid_amount: 0,
    balance_count: 0,
    balance_amount: 0,
    batch_count: 0,
    batch_amount: 0,
    pay_per_head_count: 0,
    pay_per_head_amount: 0,
    links_dispatched_count: 0,
    links_dispatched_amount: 0,
    claim_submitted_count: 0,
    claim_submitted_amount: 0,
    paid_total_trainer_count: 0,
    not_paid_total_trainer_count: 0,
    paid_total_customer_count: 0,
    not_paid_total_customer_count: 0,
    customer_paid_count: 0,
    trainer_paid_count: 0,
    by_paid_amount: 0,
    online_customer_count: 0,
    online_total_amount: 0,
    classroom_customer_count: 0,
    classroom_total_amount: 0,
    class_mode_avgDays: 0,
    class_mode_percentage: 0,
  });
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    link_sent: 0,
    requested: 0,
    awaiting_finance: 0,
    paid: 0,
  });
  const [commercialTypeCounts, setCommercialTypeCounts] = useState({
    Pay_Per_Head_Count: 0,
    Batch_Count: 0,
  });

  // Initial Date Setup
  useEffect(() => {
    if (summaryStartAndEndDate && summaryStartAndEndDate.length === 2) {
      setSelectedDates(summaryStartAndEndDate);
      fetchTrainerPaymentData(summaryStartAndEndDate);
    } else {
      const dates = getCurrentandPreviousweekDate();
      setSelectedDates(dates);
      fetchTrainerPaymentData(dates);
    }
  }, [summaryStartAndEndDate]);

  const getBranchesData = async (regionId) => {
    const payload = { region_id: regionId };
    try {
      const response = await getBranches(payload);
      const branch_data = response?.data?.result || [];
      if (branch_data.length >= 1) {
        if (regionId == 1 || regionId == 2) {
          const reordered = [
            ...branch_data.filter((item) => item.name !== "Online"),
            ...branch_data.filter((item) => item.name === "Online"),
          ];
          setFilterBranchOptions(reordered);
        } else {
          setFilterBranchOptions(branch_data);
          setSelectedBranchId(branch_data[0]?.id);
        }
      } else {
        setFilterBranchOptions([]);
      }
    } catch (error) {
      setFilterBranchOptions([]);
      console.log("branches error", error);
    }
  };

  // Main Data Fetcher
  const fetchTrainerPaymentData = async (overrides = {}) => {
    setIsLoading(true);

    const dates = Array.isArray(overrides)
      ? overrides
      : overrides.dates || selectedDates;
    const regionId =
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId;
    const branchId =
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId;

    const startDate = dates?.[0] ? moment(dates[0]).format("YYYY-MM-DD") : null;
    const endDate = dates?.[1] ? moment(dates[1]).format("YYYY-MM-DD") : null;

    const payload = {
      type: "RaiseDate",
      start_date: startDate,
      end_date: endDate,
      page: 1,
      limit: 10000, // Fetch broad cohort for accurate analytical aggregations
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
    };

    try {
      const response = await getTrainerReportsCounts(payload);
      const apiData =
        response?.data?.data || response?.data?.result || response?.data || {};

      setReportCounts({
        total_master_amount: Number(apiData.total_master_amount) || 0,
        total_master_count: Number(apiData.total_master_count) || 0,
        link_sent_count: Number(apiData.link_sent_count) || 0,
        link_sent_amount: Number(apiData.link_sent_amount) || 0,
        requested_count: Number(apiData.requested_count) || 0,
        requested_amount: Number(apiData.requested_amount) || 0,
        awaiting_finance_count: Number(apiData.awaiting_finance_count) || 0,
        awaiting_finance_amount: Number(apiData.awaiting_finance_amount) || 0,
        paid_count: Number(apiData.paid_count) || 0,
        paid_amount: Number(apiData.paid_amount) || 0,
        balance_count: Number(apiData.balance_count) || 0,
        balance_amount: Number(apiData.balance_amount) || 0,
        batch_count: Number(apiData.batch_count) || 0,
        batch_amount: Number(apiData.batch_amount) || 0,
        pay_per_head_count: Number(apiData.pay_per_head_count) || 0,
        pay_per_head_amount: Number(apiData.pay_per_head_amount) || 0,
        links_dispatched_count: Number(apiData.links_dispatched_count) || 0,
        links_dispatched_amount: Number(apiData.links_dispatched_amount) || 0,
        claim_submitted_count: Number(apiData.claim_submitted_count) || 0,
        claim_submitted_amount: Number(apiData.claim_submitted_amount) || 0,
        paid_total_trainer_count: Number(apiData.paid_total_trainer_count) || 0,
        not_paid_total_trainer_count:
          Number(apiData.not_paid_total_trainer_count) || 0,
        paid_total_customer_count:
          Number(apiData.paid_total_customer_count) || 0,
        not_paid_total_customer_count:
          Number(apiData.not_paid_total_customer_count) || 0,
        customer_paid_count: Number(apiData.customer_paid_count) || 0,
        trainer_paid_count: Number(apiData.trainer_paid_count) || 0,
        by_paid_amount: Number(apiData.by_paid_amount) || 0,
        online_customer_count: Number(apiData.online_customer_count) || 0,
        online_total_amount: Number(apiData.online_total_amount) || 0,
        classroom_customer_count: Number(apiData.classroom_customer_count) || 0,
        classroom_total_amount: Number(apiData.classroom_total_amount) || 0,
        class_mode_avgDays:
          apiData.class_mode_avgDays !== undefined &&
          apiData.class_mode_avgDays !== null &&
          !isNaN(Number(apiData.class_mode_avgDays))
            ? Number(apiData.class_mode_avgDays)
            : 0,
        class_mode_percentage:
          apiData.class_mode_percentage !== undefined &&
          apiData.class_mode_percentage !== null &&
          !isNaN(Number(apiData.class_mode_percentage))
            ? Number(apiData.class_mode_percentage)
            : 0,
      });

      setStatusCounts({
        total: Number(apiData.total_master_count) || 0,
        link_sent: Number(apiData.link_sent_count) || 0,
        requested: Number(apiData.requested_count) || 0,
        awaiting_finance: Number(apiData.awaiting_finance_count) || 0,
        paid: Number(apiData.paid_count) || 0,
      });

      setCommercialTypeCounts({
        Pay_Per_Head_Count: Number(apiData.pay_per_head_count) || 0,
        Batch_Count: Number(apiData.batch_count) || 0,
      });

      if (Array.isArray(apiData.data)) {
        setPaymentRequests(apiData.data);
      } else if (Array.isArray(response?.data?.data?.data)) {
        setPaymentRequests(response.data.data.data);
      } else {
        setPaymentRequests([]);
      }
    } catch (error) {
      console.error("Error fetching trainer payments report counts:", error);
      CommonMessage("error", "Failed to fetch Trainer Payment Report data");
      setPaymentRequests([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setSelectedRegionId(null);
    setSelectedBranchId(null);
    setFilterBranchOptions([]);
    fetchTrainerPaymentData({
      dates: PreviousAndCurrentDate,
      regionId: null,
      branchId: null,
    });
  };

  // ---------------------------------------------------------------------------
  // Derived Analytical Metrics
  // ---------------------------------------------------------------------------
  const analytics = useMemo(() => {
    // Days diff calculation for daily averages
    const startDate = selectedDates?.[0] ? moment(selectedDates[0]) : null;
    const endDate = selectedDates?.[1] ? moment(selectedDates[1]) : null;
    const daysDiff =
      startDate && endDate && startDate.isValid() && endDate.isValid()
        ? Math.max(1, endDate.diff(startDate, "days") + 1)
        : 1;

    // Primary metrics mapped directly from API Report Counts
    const totalPayoutClaimed = Number(reportCounts.total_master_amount) || 0;
    const totalPayoutClaimedCount =
      Number(reportCounts.total_master_count) || 0;

    const totalDisbursed = Number(reportCounts.paid_amount) || 0;
    const paidCount = Number(reportCounts.paid_count) || 0;

    const readyToPayAmount = Number(reportCounts.awaiting_finance_amount) || 0;
    const awaitingFinanceCount =
      Number(reportCounts.awaiting_finance_count) || 0;

    const claimedAmount = Number(reportCounts.requested_amount) || 0;
    const requestedCount = Number(reportCounts.requested_count) || 0;

    const linkSentAmount = Number(reportCounts.link_sent_amount) || 0;
    const linkSentCount = Number(reportCounts.link_sent_count) || 0;

    const payPerHeadAmount = Number(reportCounts.pay_per_head_amount) || 0;
    const payPerHeadCount = Number(reportCounts.pay_per_head_count) || 0;

    const batchAmount = Number(reportCounts.batch_amount) || 0;
    const batchCount = Number(reportCounts.batch_count) || 0;

    const balanceAmount = Number(reportCounts.balance_amount) || 0;
    const balanceCount = Number(reportCounts.balance_count) || 0;

    // Executive Summary: 2 new card counts
    const notPaidTotalTrainerCount =
      Number(reportCounts.not_paid_total_trainer_count) || 0;
    const notPaidTotalCustomerCount =
      Number(reportCounts.not_paid_total_customer_count) || 0;

    // Trainer & Customer Distribution
    const trainersPaidCount =
      Number(reportCounts.paid_total_trainer_count) || 0;
    const customersPaidCount =
      Number(reportCounts.paid_total_customer_count) || 0;
    const amountDistributed =
      Number(reportCounts.by_paid_amount) || totalDisbursed;

    // Total Trainers & Customers (Sum of Paid + Not Paid)
    const totalTrainersCount = trainersPaidCount + notPaidTotalTrainerCount;
    const totalCustomersCount = customersPaidCount + notPaidTotalCustomerCount;

    // Daily Averages of Paid Trainers & Customers
    const paidTrainersDailyAvg =
      daysDiff > 0 ? (trainersPaidCount / daysDiff).toFixed(1) : "0.0";
    const paidCustomersDailyAvg =
      daysDiff > 0 ? (customersPaidCount / daysDiff).toFixed(1) : "0.0";

    // Paid Rates (Percentages)
    const paidTrainerRate =
      totalTrainersCount > 0
        ? ((trainersPaidCount / totalTrainersCount) * 100).toFixed(1)
        : "0.0";
    const paidCustomerRate =
      totalCustomersCount > 0
        ? ((customersPaidCount / totalCustomersCount) * 100).toFixed(1)
        : "0.0";

    // Lifecycle / Funnel counts & amounts
    const linksDispatchedCount =
      Number(reportCounts.links_dispatched_count) || 0;
    const linksDispatchedAmount =
      Number(reportCounts.links_dispatched_amount) || 0;
    const claimSubmittedCount = Number(reportCounts.claim_submitted_count) || 0;
    const claimSubmittedAmount =
      Number(reportCounts.claim_submitted_amount) || 0;

    // Optional detailed metrics computed if transaction array is provided
    let overdueCount = 0;
    let overdueAmount = 0;
    let onTimeCount = 0;
    let fallbackOnlineAmount = 0;
    let fallbackOnlineCount = 0;
    let fallbackClassroomAmount = 0;
    let fallbackClassroomCount = 0;
    let totalDaysTaken = 0;
    let paidRecordsWithDays = 0;

    const paidTrainersSet = new Set();
    const paidCustomersSet = new Set();
    const now = moment();

    if (Array.isArray(paymentRequests) && paymentRequests.length > 0) {
      paymentRequests.forEach((req) => {
        const reqAmt = Number(
          req.request_amount || req.commercial || req.batch_amount || 0,
        );
        const status = req.status || "";
        const isPaid =
          status === "Paid" ||
          status === "Completed" ||
          status.toLowerCase() === "paid" ||
          status.toLowerCase() === "completed";

        if (isPaid) {
          const trainerKey =
            req.trainer_id || req.trainer_name || req.trainer_code;
          if (trainerKey) {
            paidTrainersSet.add(trainerKey);
          }

          if (Array.isArray(req.students) && req.students.length > 0) {
            req.students.forEach((student) => {
              const custKey =
                typeof student === "object"
                  ? student.customer_id ||
                    student.id ||
                    student.student_id ||
                    student.customer_name ||
                    student.name
                  : student;
              if (custKey) {
                paidCustomersSet.add(custKey);
              }
            });
          }
          if (
            req.customer_id ||
            req.customer_name ||
            req.student_id ||
            req.candidate_name
          ) {
            const directCustKey =
              req.customer_id ||
              req.customer_name ||
              req.student_id ||
              req.candidate_name;
            paidCustomersSet.add(directCustKey);
          }

          if (
            req.days_taken_topay !== undefined &&
            req.days_taken_topay !== null
          ) {
            totalDaysTaken += Number(req.days_taken_topay);
            paidRecordsWithDays++;
          }
        }

        // SLA & Deadline Tracking
        if (req.deadline_date) {
          const deadline = moment(req.deadline_date);
          if (!isPaid && deadline.isBefore(now)) {
            overdueCount++;
            overdueAmount += reqAmt;
          } else if (isPaid) {
            const paidD = req.paid_date ? moment(req.paid_date) : null;
            if (paidD && paidD.isAfter(deadline)) {
              overdueCount++;
            } else {
              onTimeCount++;
            }
          }
        }

        // Mode Split fallback
        const mode = req.mode_of_training || req.training_mode || "";
        if (mode.toLowerCase().includes("online")) {
          fallbackOnlineAmount += reqAmt;
          fallbackOnlineCount++;
        } else if (mode.toLowerCase().includes("classroom")) {
          fallbackClassroomAmount += reqAmt;
          fallbackClassroomCount++;
        }
      });
    }

    const totalClaimsCount =
      totalPayoutClaimedCount ||
      statusCounts.total ||
      paymentRequests.length ||
      0;
    const payoutRealizationRate =
      totalPayoutClaimed > 0
        ? ((totalDisbursed / totalPayoutClaimed) * 100).toFixed(1)
        : "0.0";

    // Training Mode Split (API Metrics Mapping)
    const onlineCount =
      reportCounts.online_customer_count !== undefined &&
      reportCounts.online_customer_count !== null &&
      !isNaN(Number(reportCounts.online_customer_count))
        ? Number(reportCounts.online_customer_count)
        : fallbackOnlineCount;

    const onlineAmount =
      reportCounts.online_total_amount !== undefined &&
      reportCounts.online_total_amount !== null &&
      !isNaN(Number(reportCounts.online_total_amount))
        ? Number(reportCounts.online_total_amount)
        : fallbackOnlineAmount;

    const classroomCount =
      reportCounts.classroom_customer_count !== undefined &&
      reportCounts.classroom_customer_count !== null &&
      !isNaN(Number(reportCounts.classroom_customer_count))
        ? Number(reportCounts.classroom_customer_count)
        : fallbackClassroomCount;

    const classroomAmount =
      reportCounts.classroom_total_amount !== undefined &&
      reportCounts.classroom_total_amount !== null &&
      !isNaN(Number(reportCounts.classroom_total_amount))
        ? Number(reportCounts.classroom_total_amount)
        : fallbackClassroomAmount;

    // Turnaround (TAT) & SLA Health (API Metrics Mapping)
    const rawAvgDays =
      reportCounts.class_mode_avgDays !== undefined &&
      reportCounts.class_mode_avgDays !== null
        ? Number(reportCounts.class_mode_avgDays)
        : null;
    const averageDaysTaken =
      rawAvgDays !== null && !isNaN(rawAvgDays)
        ? Number.isInteger(rawAvgDays)
          ? rawAvgDays.toString()
          : rawAvgDays.toFixed(1)
        : paidRecordsWithDays > 0
          ? (totalDaysTaken / paidRecordsWithDays).toFixed(1)
          : "0";

    const rawOnTime =
      reportCounts.class_mode_percentage !== undefined &&
      reportCounts.class_mode_percentage !== null
        ? Number(reportCounts.class_mode_percentage)
        : null;
    const onTimeRate =
      rawOnTime !== null && !isNaN(rawOnTime)
        ? Number.isInteger(rawOnTime)
          ? rawOnTime.toString()
          : rawOnTime.toFixed(1)
        : paidRecordsWithDays > 0
          ? ((onTimeCount / paidRecordsWithDays) * 100).toFixed(1)
          : "0";

    return {
      totalPayoutClaimed,
      totalPayoutClaimedCount,
      totalDisbursed,
      paidCount,
      readyToPayAmount,
      awaitingFinanceCount,
      claimedAmount,
      requestedCount,
      linkSentAmount,
      linkSentCount,
      balanceAmount,
      balanceCount,
      balanceDailyAvg: Math.round(balanceAmount / daysDiff),
      // Executive Summary: 2 new card counts & analytical totals
      notPaidTotalTrainerCount,
      notPaidTotalCustomerCount,
      totalTrainersCount,
      totalCustomersCount,
      paidTrainersDailyAvg,
      paidCustomersDailyAvg,
      paidTrainerRate,
      paidCustomerRate,
      // Lifecycle / Funnel counts & amounts
      linksDispatchedCount,
      linksDispatchedAmount,
      claimSubmittedCount,
      claimSubmittedAmount,
      overdueCount,
      overdueAmount,
      payoutRealizationRate,
      averageDaysTaken,
      onTimeRate,
      daysDiff,
      totalClaimsCount,
      // Trainer & Customer Distribution KPIs
      trainersPaidCount,
      customersPaidCount,
      amountDistributed,
      amountDistributedDailyAvg: Math.round(amountDistributed / daysDiff),
      // Daily Averages
      claimedDailyAvg: Math.round(totalPayoutClaimed / daysDiff),
      disbursedDailyAvg: Math.round(totalDisbursed / daysDiff),
      readyToPayDailyAvg: Math.round(readyToPayAmount / daysDiff),
      awaitingApprovalDailyAvg: Math.round(claimedAmount / daysDiff),
      linkSentDailyAvg: Math.round(linkSentAmount / daysDiff),
      // Commercial Split
      payPerHeadAmount,
      payPerHeadCount,
      batchAmount,
      batchCount,
      // Mode Split (UI Metrics & Exact API Field Aliases)
      onlineAmount,
      onlineCount,
      classroomAmount,
      classroomCount,
      online_customer_count: onlineCount,
      online_total_amount: onlineAmount,
      classroom_customer_count: classroomCount,
      classroom_total_amount: classroomAmount,
      // Payout TAT & SLA Health
      class_mode_avgDays: averageDaysTaken,
      class_mode_percentage: onTimeRate,
    };
  }, [reportCounts, paymentRequests, statusCounts, selectedDates]);

  // ---------------------------------------------------------------------------
  // PDF Export
  // ---------------------------------------------------------------------------
  const handleDownloadPDF = async () => {
    if (isLoading) {
      CommonMessage("warning", "Please wait for report data to finish loading");
      return;
    }
    if (!reportContentRef.current) return;

    try {
      setIsExporting(true);
      CommonMessage("info", "Preparing Trainer Payments PDF report...");

      await new Promise((resolve) => setTimeout(resolve, 250));

      if (document.fonts) {
        await document.fonts.ready;
      }

      const element = reportContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 1240,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 10;
      const printWidth = pageWidth - margin * 2; // 190mm
      const printHeight = (canvas.height * printWidth) / canvas.width;

      let heightLeft = printHeight;
      let position = margin;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        printWidth,
        printHeight,
        undefined,
        "FAST",
      );
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - printHeight + margin;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position,
          printWidth,
          printHeight,
          undefined,
          "FAST",
        );
        heightLeft -= pageHeight - margin * 2;
      }

      const filename = `Trainer_Payments_Report_${getFormattedDateString(selectedDates[0], selectedDates[1])}.pdf`;
      pdf.save(filename);

      CommonMessage("success", "Trainer Payments PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF Export Error:", error);
      CommonMessage("error", "Failed to generate PDF report");
    } finally {
      setIsExporting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CSV Export
  // ---------------------------------------------------------------------------
  const handleDownloadCSV = () => {
    try {
      const rows = [];
      rows.push(["ACTE CRM — Trainer Payments & Disbursement Report"]);
      rows.push([
        "Filter Period:",
        selectedDates?.[0]
          ? `${moment(selectedDates[0]).format("DD/MM/YYYY")} to ${moment(selectedDates[1]).format("DD/MM/YYYY")}`
          : "All Time",
      ]);
      rows.push(["Generated At:", moment().format("YYYY-MM-DD HH:mm:ss")]);
      rows.push([]);

      // 1. Executive Metrics
      rows.push(["1. EXECUTIVE PAYOUT METRICS"]);
      rows.push([
        "Metric Name",
        "Volume / Amount",
        "Daily Average",
        "Progression / Share",
      ]);
      rows.push([
        "Total Payout Liability Claimed",
        `₹${analytics.totalPayoutClaimed.toLocaleString("en-IN")}`,
        `₹${analytics.claimedDailyAvg.toLocaleString("en-IN")} / day`,
        "100.0%",
      ]);
      rows.push([
        "Total Disbursed / Paid",
        `₹${analytics.totalDisbursed.toLocaleString("en-IN")}`,
        `₹${analytics.disbursedDailyAvg.toLocaleString("en-IN")} / day`,
        `${analytics.payoutRealizationRate}% Realized`,
      ]);
      rows.push([
        "Ready to Pay (Finance Queue)",
        `₹${analytics.readyToPayAmount.toLocaleString("en-IN")}`,
        `₹${analytics.readyToPayDailyAvg.toLocaleString("en-IN")} / day`,
        `${statusCounts.awaiting_finance} Claims`,
      ]);
      rows.push([
        "Claimed (Awaiting Approval)",
        `₹${analytics.claimedAmount.toLocaleString("en-IN")}`,
        `₹${analytics.awaitingApprovalDailyAvg.toLocaleString("en-IN")} / day`,
        `${statusCounts.requested} Claims`,
      ]);
      rows.push([
        "Unclaimed Links Sent",
        `₹${analytics.linkSentAmount.toLocaleString("en-IN")}`,
        `₹${analytics.linkSentDailyAvg.toLocaleString("en-IN")} / day`,
        `${statusCounts.link_sent} Links`,
      ]);
      rows.push([
        "Overdue / SLA Breached",
        `₹${analytics.overdueAmount.toLocaleString("en-IN")}`,
        "-",
        `${analytics.overdueCount} Claims Breached`,
      ]);
      rows.push([
        "Trainers (Total / Paid)",
        `${analytics.totalTrainersCount} (${analytics.trainersPaidCount} Paid, ${analytics.notPaidTotalTrainerCount} Pending)`,
        `${analytics.paidTrainersDailyAvg} / day`,
        `${analytics.paidTrainerRate}% Paid`,
      ]);
      rows.push([
        "Customers (Total / Paid)",
        `${analytics.totalCustomersCount} (${analytics.customersPaidCount} Paid, ${analytics.notPaidTotalCustomerCount} Pending)`,
        `${analytics.paidCustomersDailyAvg} / day`,
        `${analytics.paidCustomerRate}% Paid`,
      ]);
      rows.push([]);

      // 2. Trainer & Customer Distribution
      rows.push(["2. TRAINER & CUSTOMER DISTRIBUTION"]);
      rows.push(["Metric", "Count / Value", "Description"]);
      rows.push([
        "Trainers Paid",
        analytics.trainersPaidCount,
        "Trainers who have been sent payments",
      ]);
      rows.push([
        "Customers Paid",
        analytics.customersPaidCount,
        "Customers whose trainers payment sent",
      ]);
      rows.push([
        "Amount Distributed",
        `₹${analytics.amountDistributed.toLocaleString("en-IN")}`,
        "Total paid amount disbursed",
      ]);
      rows.push([]);

      // 3. Commercial Model Breakdown
      rows.push(["3. COMMERCIAL MODEL BREAKDOWN"]);
      rows.push([
        "Model",
        "Claims Count",
        "Total Amount (₹)",
        "Average Payout (₹)",
      ]);
      rows.push([
        "Pay Per Head (PPH)",
        analytics.payPerHeadCount,
        `₹${analytics.payPerHeadAmount.toLocaleString("en-IN")}`,
        analytics.payPerHeadCount > 0
          ? `₹${Math.round(analytics.payPerHeadAmount / analytics.payPerHeadCount).toLocaleString("en-IN")}`
          : "₹0",
      ]);
      rows.push([
        "Batch Commercial",
        analytics.batchCount,
        `₹${analytics.batchAmount.toLocaleString("en-IN")}`,
        analytics.batchCount > 0
          ? `₹${Math.round(analytics.batchAmount / analytics.batchCount).toLocaleString("en-IN")}`
          : "₹0",
      ]);
      rows.push([]);

      // 4. Operational Delivery Split
      rows.push(["4. OPERATIONAL DELIVERY SPLIT"]);
      rows.push(["Training Mode", "Customer Count", "Total Amount (₹)"]);
      rows.push([
        "Online Training",
        analytics.onlineCount,
        `₹${Number(analytics.onlineAmount || 0).toLocaleString("en-IN")}`,
      ]);
      rows.push([
        "Classroom Training",
        analytics.classroomCount,
        `₹${Number(analytics.classroomAmount || 0).toLocaleString("en-IN")}`,
      ]);
      rows.push([]);

      // 5. Payout SLA & Turnaround (TAT)
      rows.push(["5. DISBURSEMENT TURNAROUND (TAT)"]);
      rows.push(["Metric", "Value"]);
      rows.push([
        "Average Payout TAT",
        `${analytics.averageDaysTaken || 0} days`,
      ]);
      rows.push(["On-Time Clearance", `${analytics.onTimeRate || 0}%`]);
      rows.push([]);

      paymentRequests.forEach((req) => {
        rows.push([
          req.trainer_payment_id || req.payment_id || "-",
          req.trainer_name || "-",
          req.status || "-",
          req.commercial_type || "-",
          req.mode_of_training || req.training_mode || "-",
          req.request_amount || req.commercial || req.batch_amount || 0,
          req.paid_amount || "-",
          req.bill_raisedate
            ? moment(req.bill_raisedate).format("DD/MM/YYYY")
            : "-",
          req.paid_date ? moment(req.paid_date).format("DD/MM/YYYY") : "-",
          req.deadline_date
            ? moment(req.deadline_date).format("DD/MM/YYYY")
            : "-",
          req.days_taken_topay ?? "-",
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Trainer Payments");
      const filename = `Trainer_Payments_Report_${getFormattedDateString(selectedDates[0], selectedDates[1])}.csv`;
      XLSX.writeFile(workbook, filename);
      CommonMessage("success", "CSV downloaded successfully!");
    } catch (error) {
      console.error("CSV export error:", error);
      CommonMessage("error", "Failed to export CSV. Please try again.");
    }
  };

  const downloadMenuItems = [
    {
      key: "pdf",
      label: (
        <div className="presales_export_menu_item">
          <div className="presales_export_icon_box presales_export_icon_pdf">
            <FiFileText />
          </div>
          <div className="presales_export_text_box">
            <span className="presales_export_title">Download as PDF</span>
            <span className="presales_export_desc">
              Formatted executive report
            </span>
          </div>
        </div>
      ),
      onClick: handleDownloadPDF,
    },
    { type: "divider" },
    {
      key: "csv",
      label: (
        <div className="presales_export_menu_item">
          <div className="presales_export_icon_box presales_export_icon_csv">
            <FiTable />
          </div>
          <div className="presales_export_text_box">
            <span className="presales_export_title">Download as CSV</span>
            <span className="presales_export_desc">
              Spreadsheet data export
            </span>
          </div>
        </div>
      ),
      onClick: handleDownloadCSV,
    },
  ];

  return (
    <div className="presales_report_wrapper">
      {/* ====================================================================
          1. Header & Controls (Screen only - excluded from PDF)
          ==================================================================== */}
      <div className="presales_header_card">
        <div className="presales_header_left">
          {onBack && (
            <Tooltip placement="top" title="Back to Summary">
              <Button onClick={onBack} className="wcd-back-btn">
                <FiArrowLeft size={16} />
              </Button>
            </Tooltip>
          )}
          <div className="trainer_payments_header_icon_box">
            <FaMoneyBillWave size={19} />
          </div>
          <div>
            <h1 className="presales_header_title">Trainer Payments Report</h1>
            <p className="presales_header_subtitle">
              Remuneration liabilities, disbursement lifecycles, commercial
              models, and payment turnaround times (TAT)
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Dropdown
            menu={{ items: downloadMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
            disabled={isLoading || isExporting}
          >
            <Tooltip
              title={
                isExporting
                  ? "Generating Export..."
                  : "Export Report (PDF / CSV)"
              }
            >
              <button
                className={`presales_icon_button ${isExporting ? "is_exporting" : ""}`}
                aria-label="Export Data"
                disabled={isLoading || isExporting}
              >
                {isExporting ? (
                  <RedoOutlined spin style={{ color: "#0284c7" }} />
                ) : (
                  <FiDownload />
                )}
              </button>
            </Tooltip>
          </Dropdown>

          <Tooltip placement="top" title="Refresh">
            <Button
              className="newreports_refresh_button"
              onClick={handleRefresh}
              aria-label="Refresh Report"
            >
              <RedoOutlined
                className="refresh_icon"
                spin={isRefreshing || isLoading}
              />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* ====================================================================
          2. Interactive Filter Bar (Screen only - excluded from PDF)
          ==================================================================== */}
      <Row gutter={[12, 8]} style={{ marginTop: "0px" }}>
        <Col xs={24} sm={24} md={24} lg={16} xl={15} xxl={12}>
          <Row gutter={12} align="middle">
            {/* Date Picker */}
            <Col flex="1.5 1 0%">
              <CommonMuiCustomDatePicker
                label="Filter by Bill Raise Date"
                width="100%"
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  fetchTrainerPaymentData({ dates });
                }}
              />
            </Col>

            {/* Region Select */}
            <Col flex="1 1 0%">
              <CommonSelectField
                height="33px"
                label="Select Region"
                labelMarginTop="0px"
                labelFontSize="11px"
                options={regionOptions}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedRegionId(val);
                  setSelectedBranchId(null);
                  if (val) {
                    getBranchesData(val);
                  } else {
                    setFilterBranchOptions([]);
                  }
                  fetchTrainerPaymentData({ regionId: val, branchId: null });
                }}
                value={selectedRegionId}
                disableClearable={false}
              />
            </Col>

            {/* Branch Select */}
            <Col flex="1 1 0%">
              <CommonSelectField
                height="33px"
                label="Select Branch"
                labelMarginTop="0px"
                labelFontSize="11px"
                options={filterBranchOptions}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBranchId(val);
                  fetchTrainerPaymentData({ branchId: val });
                }}
                value={selectedBranchId}
                disableClearable={false}
                disabled={selectedRegionId == 3}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider className="customer_statusupdate_divider" />

      {/* ====================================================================
          3. Printable Content Area (Captured into PDF)
          ==================================================================== */}
      {isLoading ? (
        <TrainerPaymentReportSkeleton />
      ) : (
        <div
          ref={reportContentRef}
          className={`presales_printable_content ${isExporting ? "is_exporting_pdf" : ""}`}
        >
          {/* Dedicated PDF Export Header Banner */}
          {isExporting && (
            <div className="presales_pdf_export_banner">
              <div
                className="presales_pdf_banner_top"
                style={{ borderBottom: "0px" }}
              >
                <div>
                  <h1 className="presales_pdf_banner_title">
                    ACTE CRM — Trainer Payments Analytics Report
                  </h1>
                  <p className="presales_pdf_banner_subtitle">
                    Comprehensive financial and operational audit on trainer
                    remunerations, disbursement timelines, claim lifecycles, and
                    compliance SLAs.
                  </p>
                </div>
                <div className="presales_pdf_banner_meta">
                  <div>
                    <strong>Date Period:</strong>{" "}
                    {selectedDates?.[0]
                      ? `${moment(selectedDates[0]).format("DD/MM/YYYY")} to ${moment(selectedDates[1]).format("DD/MM/YYYY")}`
                      : "Current Period"}
                  </div>
                  <div>
                    <strong>Generated:</strong>{" "}
                    {moment().format("DD MMM YYYY, hh:mm A")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              SECTION 1: Executive Summary (6 Main Financial & Liability Cards)
              ---------------------------------------------------------------- */}
          <div
            className="presales_section_header"
            style={{ marginTop: isExporting ? 20 : 6 }}
          >
            <h2 className="presales_section_title">
              <HiOutlineClipboardDocumentCheck
                style={{ color: "#0284c7" }}
                size={20}
              />{" "}
              Trainer Payment Executive Summary
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#e0f2fe", color: "#0284c7" }}
            >
              Disbursement & Liability KPIs
            </span>
          </div>

          <Row gutter={[16, 22]}>
            {/* Card 1: Total Payout Claimed */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <div className="presales_stat_card presales_theme_indigo">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Total Payout Claimed</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#4f46e5" }}
                      title={`₹${analytics.totalPayoutClaimed.toLocaleString("en-IN")}`}
                    >
                      ₹{analytics.totalPayoutClaimed.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiTrendingUp size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <HiOutlineSparkles size={13} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹{analytics.claimedDailyAvg.toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title={`${analytics.totalPayoutClaimedCount} total claims`}
                  >
                    {analytics.totalPayoutClaimedCount}{" "}
                    {analytics.totalPayoutClaimedCount === 1
                      ? "claim"
                      : "claims"}
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 2: Unclaimed Links Sent */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <div className="presales_stat_card presales_theme_amber">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Unclaimed Links</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#d97706" }}
                      title={`₹${analytics.linkSentAmount.toLocaleString("en-IN")}`}
                    >
                      ₹{analytics.linkSentAmount.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiSend size={19} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiSend size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹{analytics.linkSentDailyAvg.toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title={`${analytics.linkSentCount} unclaimed links`}
                  >
                    {analytics.linkSentCount}{" "}
                    {analytics.linkSentCount === 1 ? "link" : "links"} sent
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 3: Claimed (Awaiting Approval) */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <div className="presales_stat_card presales_theme_violet">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Claimed (Pending HR)</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#7c3aed" }}
                      title={`₹${analytics.claimedAmount.toLocaleString("en-IN")}`}
                    >
                      ₹{analytics.claimedAmount.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <HiOutlineClipboardDocumentCheck size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <HiOutlineSparkles size={13} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹
                      {analytics.awaitingApprovalDailyAvg.toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title={`${analytics.requestedCount} awaiting approval`}
                  >
                    {analytics.requestedCount}{" "}
                    {analytics.requestedCount === 1 ? "claim" : "claims"}{" "}
                    awaiting
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 4: Ready to Pay (Finance Queue) */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <div className="presales_stat_card presales_theme_sky">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Ready to Pay</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#0284c7" }}
                      title={`₹${analytics.readyToPayAmount.toLocaleString("en-IN")}`}
                    >
                      ₹{analytics.readyToPayAmount.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiClock size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiClock size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹{analytics.readyToPayDailyAvg.toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title={`${analytics.awaitingFinanceCount} in finance queue`}
                  >
                    {analytics.awaitingFinanceCount}{" "}
                    {analytics.awaitingFinanceCount === 1 ? "claim" : "claims"}{" "}
                    is approved
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 5: Total Disbursed */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <div className="presales_stat_card presales_theme_emerald">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">
                      Total Disbursed (Paid)
                    </p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#059669" }}
                      title={`₹${analytics.totalDisbursed.toLocaleString("en-IN")}`}
                    >
                      ₹{analytics.totalDisbursed.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiCheckCircle size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiCheckCircle size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹{analytics.disbursedDailyAvg.toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title={`${analytics.paidCount} payouts cleared`}
                  >
                    {analytics.paidCount}{" "}
                    {analytics.paidCount === 1 ? "payout" : "payouts"}
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 6: Overdue / SLA Breached */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <div className="presales_stat_card presales_theme_rose">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">
                      Balance / Pending Payout
                    </p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#e11d48" }}
                      title={`₹${(analytics.balanceAmount || analytics.overdueAmount).toLocaleString("en-IN")}`}
                    >
                      ₹
                      {(
                        analytics.balanceAmount || analytics.overdueAmount
                      ).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiAlertTriangle size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiAlertCircle size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹{analytics.balanceDailyAvg.toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title={`${analytics.balanceCount || analytics.overdueCount} pending claims`}
                  >
                    {analytics.balanceCount || analytics.overdueCount}{" "}
                    {(analytics.balanceCount || analytics.overdueCount) === 1
                      ? "claim"
                      : "claims"}{" "}
                    pending
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 7: Trainers (Total: Paid + Not Paid) */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <div className="presales_stat_card presales_theme_sky">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Trainers</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#0284c7" }}
                      title={`${analytics.totalTrainersCount} total trainers (${analytics.trainersPaidCount} paid, ${analytics.notPaidTotalTrainerCount} pending)`}
                    >
                      {analytics.totalTrainersCount.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <HiOutlineAcademicCap size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <HiOutlineSparkles size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {analytics.paidTrainersDailyAvg}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title={`${analytics.trainersPaidCount} paid of ${analytics.totalTrainersCount} total trainers (${analytics.paidTrainerRate}%)`}
                  >
                    {analytics.trainersPaidCount} paid (
                    {analytics.paidTrainerRate}%)
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 8: Customers (Total: Paid + Not Paid) */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6}>
              <div className="presales_stat_card presales_theme_violet">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Customers</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#7c3aed" }}
                      title={`${analytics.totalCustomersCount} total customers (${analytics.customersPaidCount} paid, ${analytics.notPaidTotalCustomerCount} pending)`}
                    >
                      {analytics.totalCustomersCount.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiUsers size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <HiOutlineSparkles size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {analytics.paidCustomersDailyAvg}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title={`${analytics.customersPaidCount} paid of ${analytics.totalCustomersCount} total customers (${analytics.paidCustomerRate}%)`}
                  >
                    {analytics.customersPaidCount} paid (
                    {analytics.paidCustomerRate}%)
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          {/* ----------------------------------------------------------------
              SECTION 2: Payment Lifecycle & Disbursement Pipeline (Funnel)
              ---------------------------------------------------------------- */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <TbTargetArrow style={{ color: "#0284c7" }} size={19} /> Payment
              Claim & Disbursement Lifecycle
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#e0f2fe", color: "#0284c7" }}
            >
              4 Key Disbursement Milestones
            </span>
          </div>

          <div className="presales_funnel_container">
            <div className="presales_funnel_steps">
              {/* Funnel Step 1: Link Sent */}
              <div className="presales_funnel_step">
                <div className="presales_funnel_step_header">
                  <p
                    className="presales_funnel_step_label"
                    style={{ color: "#d97706" }}
                  >
                    1. LINK SENT
                  </p>
                  <div className="presales_funnel_count_row">
                    <span className="presales_funnel_step_count">
                      {analytics.linksDispatchedCount}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{ color: "#d97706" }}
                    >
                      ₹{formatIndianNumber(analytics.linksDispatchedAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <FiArrowRight className="presales_funnel_arrow" />

              {/* Funnel Step 2: Claim Submitted */}
              <div className="presales_funnel_step">
                <div className="presales_funnel_step_header">
                  <p
                    className="presales_funnel_step_label"
                    style={{ color: "#7c3aed" }}
                  >
                    2. CLAIM SUBMITTED
                  </p>
                  <div className="presales_funnel_count_row">
                    <span className="presales_funnel_step_count">
                      {analytics.claimSubmittedCount}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{ color: "#7c3aed" }}
                    >
                      ₹{formatIndianNumber(analytics.claimSubmittedAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <FiArrowRight className="presales_funnel_arrow" />

              {/* Funnel Step 3: Ready to Pay */}
              <div className="presales_funnel_step">
                <div className="presales_funnel_step_header">
                  <p
                    className="presales_funnel_step_label"
                    style={{ color: "#0284c7" }}
                  >
                    3. Approved Claims
                  </p>
                  <div className="presales_funnel_count_row">
                    <span className="presales_funnel_step_count">
                      {analytics.awaitingFinanceCount}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{ color: "#0284c7" }}
                    >
                      ₹{formatIndianNumber(analytics.readyToPayAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <FiArrowRight className="presales_funnel_arrow" />

              {/* Funnel Step 4: Disbursed / Paid (Hero Card) */}
              <div className="presales_funnel_step completion_step">
                <div className="presales_funnel_step_header">
                  <p
                    className="presales_funnel_step_label"
                    style={{ color: "#047857" }}
                  >
                    4. ★ DISBURSED (PAID)
                  </p>
                  <div
                    className="presales_funnel_count_row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span
                      className="presales_funnel_step_count"
                      style={{
                        color: "#047857",
                        fontSize: 18,
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                      title={`${analytics.paidCount} payouts cleared`}
                    >
                      {analytics.paidCount}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{
                        color: "#047857",
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                      title={`Disbursed: ₹${formatIndianNumber(analytics.totalDisbursed)}`}
                    >
                      ₹{formatIndianNumber(analytics.totalDisbursed)}
                    </span>
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        border: "1px solid #bbf7d0",
                        padding: "2px 7px",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                      title={`Payout Realization Rate: ${analytics.payoutRealizationRate}%`}
                    >
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          color: "#166534",
                        }}
                      >
                        Rate:
                      </span>
                      {analytics.payoutRealizationRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              SECTION 3: Trainer & Customer Distribution
              ---------------------------------------------------------------- */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <FiUsers style={{ color: "#0284c7" }} size={20} /> Trainer &
              Customer Distribution
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#e0f2fe", color: "#0284c7" }}
            >
              Paid Beneficiary & Volume Reach
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {/* Card 1: Trainers Paid */}
            <Col xs={24} sm={12} md={8}>
              <div className="presales_stat_card presales_theme_sky">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Trainers Paid</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#0284c7" }}
                      title={`${analytics.trainersPaidCount} trainers paid`}
                    >
                      {analytics.trainersPaidCount.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <HiOutlineAcademicCap size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiCheckCircle size={12} />
                    <span className="presales_avg_label">Paid:</span>
                    <strong className="presales_avg_val">
                      {analytics.trainersPaidCount} trainers
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="send payment for how many trainers"
                  >
                    send payment for how many trainers
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 2: Customers Paid */}
            <Col xs={24} sm={12} md={8}>
              <div className="presales_stat_card presales_theme_violet">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Customers Paid</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#7c3aed" }}
                      title={`${analytics.customersPaidCount} customers`}
                    >
                      {analytics.customersPaidCount.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiUsers size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <HiOutlineSparkles size={12} />
                    <span className="presales_avg_label">Coverage:</span>
                    <strong className="presales_avg_val">
                      {analytics.customersPaidCount} candidates
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="this customers trainers payment sent"
                  >
                    this customers trainers payment sent
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 3: Amount Distributed */}
            <Col xs={24} sm={12} md={8}>
              <div className="presales_stat_card presales_theme_emerald">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Amount Distributed</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#059669" }}
                      title={`₹${analytics.amountDistributed.toLocaleString("en-IN")}`}
                    >
                      ₹{analytics.amountDistributed.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FaRupeeSign size={18} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiCheckCircle size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹
                      {analytics.amountDistributedDailyAvg.toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="total paid amount"
                  >
                    total paid amount
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          {/* ----------------------------------------------------------------
              SECTION 4: Commercial Model & Operational Distribution
              ---------------------------------------------------------------- */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <TbReportAnalytics style={{ color: "#0284c7" }} size={19} />{" "}
              Commercial Model & Turnaround (TAT) Distribution
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#e0f2fe", color: "#0284c7" }}
            >
              Operational Efficiency
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {/* Card 1: Commercial Model Split */}
            <Col xs={24} sm={12} md={12} lg={8}>
              <div
                className="presales_stat_card"
                style={{ height: "100%", padding: "18px 20px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Commercial Model Split
                  </h4>
                  <Tag color="cyan">Models</Tag>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: "#64748b", fontWeight: 500 }}>
                        Pay Per Head (PPH)
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{analytics.payPerHeadAmount.toLocaleString("en-IN")} (
                        {analytics.payPerHeadCount} claims)
                      </strong>
                    </div>
                    <Progress
                      percent={
                        analytics.totalPayoutClaimed > 0
                          ? Math.round(
                              (analytics.payPerHeadAmount /
                                analytics.totalPayoutClaimed) *
                                100,
                            )
                          : 0
                      }
                      strokeColor="#0284c7"
                      size="small"
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: "#64748b", fontWeight: 500 }}>
                        Batch Model
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{analytics.batchAmount.toLocaleString("en-IN")} (
                        {analytics.batchCount} batches)
                      </strong>
                    </div>
                    <Progress
                      percent={
                        analytics.totalPayoutClaimed > 0
                          ? Math.round(
                              (analytics.batchAmount /
                                analytics.totalPayoutClaimed) *
                                100,
                            )
                          : 0
                      }
                      strokeColor="#7c3aed"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </Col>

            {/* Card 2: Training Delivery Mode Split */}
            <Col xs={24} sm={12} md={12} lg={8}>
              <div
                className="presales_stat_card"
                style={{ height: "100%", padding: "18px 20px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Training Delivery Mode
                  </h4>
                  <Tag color="geekblue">Delivery</Tag>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: "#64748b", fontWeight: 500 }}>
                        Online Training (14 Days SLA)
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹
                        {Number(analytics.onlineAmount || 0).toLocaleString(
                          "en-IN",
                        )}{" "}
                        (
                        {Number(analytics.onlineCount || 0).toLocaleString(
                          "en-IN",
                        )}
                        )
                      </strong>
                    </div>
                    <Progress
                      percent={
                        analytics.onlineAmount + analytics.classroomAmount > 0
                          ? Math.round(
                              (analytics.onlineAmount /
                                (analytics.onlineAmount +
                                  analytics.classroomAmount)) *
                                100,
                            )
                          : analytics.totalPayoutClaimed > 0
                            ? Math.round(
                                (analytics.onlineAmount /
                                  analytics.totalPayoutClaimed) *
                                  100,
                              )
                            : 0
                      }
                      strokeColor="#0284c7"
                      size="small"
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: "#64748b", fontWeight: 500 }}>
                        Classroom Training (5 Days SLA)
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹
                        {Number(analytics.classroomAmount || 0).toLocaleString(
                          "en-IN",
                        )}{" "}
                        (
                        {Number(analytics.classroomCount || 0).toLocaleString(
                          "en-IN",
                        )}
                        )
                      </strong>
                    </div>
                    <Progress
                      percent={
                        analytics.onlineAmount + analytics.classroomAmount > 0
                          ? Math.round(
                              (analytics.classroomAmount /
                                (analytics.onlineAmount +
                                  analytics.classroomAmount)) *
                                100,
                            )
                          : analytics.totalPayoutClaimed > 0
                            ? Math.round(
                                (analytics.classroomAmount /
                                  analytics.totalPayoutClaimed) *
                                  100,
                              )
                            : 0
                      }
                      strokeColor="#f59e0b"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </Col>

            {/* Card 3: Payout SLA & Turnaround (TAT) */}
            <Col xs={24} sm={12} md={12} lg={8}>
              <div
                className="presales_stat_card"
                style={{ height: "100%", padding: "18px 20px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Disbursement Turnaround (TAT)
                  </h4>
                  <Tag
                    color={
                      Number(analytics.averageDaysTaken || 0) <= 7
                        ? "green"
                        : "volcano"
                    }
                  >
                    SLA Health
                  </Tag>
                </div>
                <Row gutter={12} align="middle">
                  <Col span={12}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      Average Payout TAT
                    </p>
                    <h3
                      style={{
                        margin: "4px 0 0",
                        fontSize: "24px",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {analytics.averageDaysTaken || 0}{" "}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#64748b",
                        }}
                      >
                        days
                      </span>
                    </h3>
                  </Col>
                  <Col span={12}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      On-Time Clearance
                    </p>
                    <h3
                      style={{
                        margin: "4px 0 0",
                        fontSize: "24px",
                        fontWeight: 800,
                        color: "#059669",
                      }}
                    >
                      {analytics.onTimeRate || 0}%
                    </h3>
                  </Col>
                </Row>
                <div style={{ marginTop: 12 }}>
                  <Progress
                    percent={parseFloat(analytics.onTimeRate) || 0}
                    strokeColor="#059669"
                    size="small"
                    status={
                      (parseFloat(analytics.onTimeRate) || 0) >= 90
                        ? "success"
                        : "normal"
                    }
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}
