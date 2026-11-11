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
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Col xs={24} sm={12} md={12} lg={8} xl={4} key={i}>
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

      {/* 2. Funnel Skeleton */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <TbTargetArrow style={{ color: "#0284c7" }} size={19} /> Payment Claim
          & Disbursement Pipeline
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#e0f2fe", color: "#0284c7" }}
        >
          5 Disbursement Milestones
        </span>
      </div>

      <div className="presales_funnel_container">
        <div className="presales_funnel_steps">
          {[1, 2, 3, 4, 5].map((i) => (
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
                <div className="presales_funnel_subitems">
                  {[1, 2].map((j) => (
                    <div className="presales_funnel_subitem" key={j}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "65%", height: 12 }}
                      />
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "25%", height: 12 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {i < 5 && <FiArrowRight className="presales_funnel_arrow" />}
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
  const [dateFilterType, setDateFilterType] = useState("RaiseDate"); // "RaiseDate" | "PaidDate" | "DeadLineDate"
  const [commercialType, setCommercialType] = useState(""); // "" (All) | "Pay Per Head" | "Batch"
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [filterBranchOptions, setFilterBranchOptions] = useState([]);
  const [trainersList, setTrainersList] = useState([]);

  // Loading & Export States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Raw API Data State
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
    } else {
      const dates = getCurrentandPreviousweekDate();
      setSelectedDates(dates);
    }
  }, [summaryStartAndEndDate]);

  // Load Trainer List & Initial Report Data
  useEffect(() => {
    fetchTrainersDropdown();
    if (selectedDates && selectedDates.length === 2) {
      fetchTrainerPaymentData();
    }
  }, []);

  const fetchTrainersDropdown = async () => {
    try {
      const res = await getTrainers({ page: 1, limit: 1000 });
      const list = res?.data?.data || [];
      const formatted = list.map((t) => ({
        label: t.trainer_name || `Trainer #${t.trainer_id}`,
        value: t.trainer_id,
      }));
      setTrainersList(formatted);
    } catch (err) {
      console.error("Failed to load trainers dropdown:", err);
    }
  };

  const getBranchesData = async (regionId) => {
    try {
      const res = await getBranches(regionId);
      const branches = res?.data?.data || [];
      setFilterBranchOptions(
        branches.map((b) => ({
          label: b.branch_name,
          value: b.branch_id,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setFilterBranchOptions([]);
    }
  };

  // Main Data Fetcher
  const fetchTrainerPaymentData = async (overrides = {}) => {
    setIsLoading(true);

    const dates = overrides.dates || selectedDates;
    const dateType = overrides.dateType || dateFilterType;
    const comType =
      overrides.commercialType !== undefined
        ? overrides.commercialType
        : commercialType;
    const regionId =
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId;
    const branchId =
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId;
    const trainerId =
      overrides.trainerId !== undefined
        ? overrides.trainerId
        : selectedTrainerId;

    const startDate = dates?.[0] ? moment(dates[0]).format("YYYY-MM-DD") : null;
    const endDate = dates?.[1] ? moment(dates[1]).format("YYYY-MM-DD") : null;

    const payload = {
      type: dateType,
      start_date: startDate,
      end_date: endDate,
      page: 1,
      limit: 10000, // Fetch broad cohort for accurate analytical aggregations
      ...(comType && { commercial_type: comType }),
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      ...(trainerId && { trainer_id: trainerId }),
    };

    try {
      const response = await getTrainerPayments(payload);
      const dataArr = response?.data?.data?.data || [];
      const sCounts = response?.data?.data?.statusCount || {};
      const cCounts = response?.data?.data?.commercialTypeCount || {};

      setPaymentRequests(dataArr);
      setStatusCounts({
        total: Number(sCounts.total) || dataArr.length || 0,
        link_sent: Number(sCounts.link_sent) || 0,
        requested: Number(sCounts.requested) || 0,
        awaiting_finance: Number(sCounts.awaiting_finance) || 0,
        paid: Number(sCounts.paid) || 0,
      });
      setCommercialTypeCounts({
        Pay_Per_Head_Count: Number(cCounts.Pay_Per_Head_Count) || 0,
        Batch_Count: Number(cCounts.Batch_Count) || 0,
      });
    } catch (error) {
      console.error("Error fetching trainer payments report data:", error);
      CommonMessage("error", "Failed to fetch Trainer Payment Report data");
      setPaymentRequests([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTrainerPaymentData();
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

    let totalPayoutClaimed = 0;
    let totalDisbursed = 0;
    let readyToPayAmount = 0;
    let claimedAmount = 0;
    let linkSentAmount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let onTimeCount = 0;

    let payPerHeadAmount = 0;
    let payPerHeadCount = 0;
    let batchAmount = 0;
    let batchCount = 0;

    let onlineAmount = 0;
    let onlineCount = 0;
    let classroomAmount = 0;
    let classroomCount = 0;

    let totalDaysTaken = 0;
    let paidRecordsWithDays = 0;

    const now = moment();

    paymentRequests.forEach((req) => {
      const reqAmt = Number(
        req.request_amount || req.commercial || req.batch_amount || 0,
      );
      const paidAmt = Number(req.paid_amount || reqAmt || 0);
      const status = req.status || "";
      const isPaid = status === "Paid" || status === "Completed";
      const isReadyToPay =
        status === "Awaiting Finance" || status === "Ready to Pay";
      const isClaimed = status === "Requested" || status === "Claim";
      const isLinkSent = status === "Link Sent";

      totalPayoutClaimed += reqAmt;

      if (isPaid) {
        totalDisbursed += paidAmt;
        if (
          req.days_taken_topay !== undefined &&
          req.days_taken_topay !== null
        ) {
          totalDaysTaken += Number(req.days_taken_topay);
          paidRecordsWithDays++;
        }
      } else if (isReadyToPay) {
        readyToPayAmount += reqAmt;
      } else if (isClaimed) {
        claimedAmount += reqAmt;
      } else if (isLinkSent) {
        linkSentAmount += reqAmt;
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

      // Commercial Split
      const comType = req.commercial_type || "";
      if (comType === "Pay Per Head") {
        payPerHeadAmount += reqAmt;
        payPerHeadCount++;
      } else if (comType === "Batch") {
        batchAmount += reqAmt;
        batchCount++;
      }

      // Mode Split
      const mode = req.mode_of_training || req.training_mode || "";
      if (mode.toLowerCase().includes("online")) {
        onlineAmount += reqAmt;
        onlineCount++;
      } else if (mode.toLowerCase().includes("classroom")) {
        classroomAmount += reqAmt;
        classroomCount++;
      }
    });

    const totalClaimsCount = statusCounts.total || paymentRequests.length || 0;
    const payoutRealizationRate =
      totalPayoutClaimed > 0
        ? ((totalDisbursed / totalPayoutClaimed) * 100).toFixed(1)
        : "0.0";
    const averageDaysTaken =
      paidRecordsWithDays > 0
        ? (totalDaysTaken / paidRecordsWithDays).toFixed(1)
        : "0";
    const onTimeRate =
      paidRecordsWithDays > 0
        ? ((onTimeCount / paidRecordsWithDays) * 100).toFixed(1)
        : "100.0";

    return {
      totalPayoutClaimed,
      totalDisbursed,
      readyToPayAmount,
      claimedAmount,
      linkSentAmount,
      overdueCount,
      overdueAmount,
      payoutRealizationRate,
      averageDaysTaken,
      onTimeRate,
      daysDiff,
      totalClaimsCount,
      // Daily Averages
      claimedDailyAvg: Math.round(totalPayoutClaimed / daysDiff),
      disbursedDailyAvg: Math.round(totalDisbursed / daysDiff),
      readyToPayDailyAvg: Math.round(readyToPayAmount / daysDiff),
      awaitingApprovalDailyAvg: Math.round(claimedAmount / daysDiff),
      linkSentDailyAvg: Math.round(linkSentAmount / daysDiff),
      // Commercial Split
      payPerHeadAmount,
      payPerHeadCount:
        commercialTypeCounts.Pay_Per_Head_Count || payPerHeadCount,
      batchAmount,
      batchCount: commercialTypeCounts.Batch_Count || batchCount,
      // Mode Split
      onlineAmount,
      onlineCount,
      classroomAmount,
      classroomCount,
    };
  }, [paymentRequests, statusCounts, commercialTypeCounts, selectedDates]);

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
      rows.push(["Date Filter Basis:", dateFilterType]);
      rows.push(["Commercial Filter:", commercialType || "All Commercials"]);
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
      rows.push([]);

      // 2. Commercial Model Breakdown
      rows.push(["2. COMMERCIAL MODEL BREAKDOWN"]);
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

      // 3. Operational Delivery Split
      rows.push(["3. OPERATIONAL DELIVERY SPLIT"]);
      rows.push(["Training Mode", "Claims Count", "Total Amount (₹)"]);
      rows.push([
        "Online Training",
        analytics.onlineCount,
        `₹${analytics.onlineAmount.toLocaleString("en-IN")}`,
      ]);
      rows.push([
        "Classroom Training",
        analytics.classroomCount,
        `₹${analytics.classroomAmount.toLocaleString("en-IN")}`,
      ]);
      rows.push([]);

      // 4. Itemized Transactions
      rows.push(["4. ITEMIZED PAYMENT REQUESTS"]);
      rows.push([
        "Payment ID",
        "Trainer Name",
        "Status",
        "Commercial Type",
        "Mode of Training",
        "Request Amount (₹)",
        "Paid Amount (₹)",
        "Bill Raise Date",
        "Paid Date",
        "Deadline Date",
        "Days Taken To Pay",
      ]);

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
        <Col span={24}>
          <Row gutter={12} align="middle">
            {/* Commercial Type Toggle */}
            <Col flex="0.9 1 0%">
              <div className="postsales_datetype_box">
                <div className="postsales_datetype_toggle">
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${commercialType === "" ? "active" : ""}`}
                    onClick={() => {
                      setCommercialType("");
                      fetchTrainerPaymentData({ commercialType: "" });
                    }}
                  >
                    All Types
                  </button>
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${commercialType === "Pay Per Head" ? "active" : ""}`}
                    onClick={() => {
                      setCommercialType("Pay Per Head");
                      fetchTrainerPaymentData({
                        commercialType: "Pay Per Head",
                      });
                    }}
                  >
                    PPH
                  </button>
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${commercialType === "Batch" ? "active" : ""}`}
                    onClick={() => {
                      setCommercialType("Batch");
                      fetchTrainerPaymentData({ commercialType: "Batch" });
                    }}
                  >
                    Batch
                  </button>
                </div>
              </div>
            </Col>

            {/* Date Type Toggle */}
            <Col flex="1 1 0%">
              <div className="postsales_datetype_box">
                <div className="postsales_datetype_toggle">
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${dateFilterType === "RaiseDate" ? "active" : ""}`}
                    onClick={() => {
                      setDateFilterType("RaiseDate");
                      fetchTrainerPaymentData({ dateType: "RaiseDate" });
                    }}
                  >
                    Bill Raised
                  </button>
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${dateFilterType === "PaidDate" ? "active" : ""}`}
                    onClick={() => {
                      setDateFilterType("PaidDate");
                      fetchTrainerPaymentData({ dateType: "PaidDate" });
                    }}
                  >
                    Paid Date
                  </button>
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${dateFilterType === "DeadLineDate" ? "active" : ""}`}
                    onClick={() => {
                      setDateFilterType("DeadLineDate");
                      fetchTrainerPaymentData({ dateType: "DeadLineDate" });
                    }}
                  >
                    Deadline
                  </button>
                </div>
              </div>
            </Col>

            {/* Date Picker */}
            <Col flex="1.3 1 0%">
              <CommonMuiCustomDatePicker
                label="Filter by Date"
                width="100%"
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  fetchTrainerPaymentData({ dates });
                }}
              />
            </Col>

            {/* Region Select */}
            <Col flex="0.8 1 0%">
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
            <Col flex="0.8 1 0%">
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

            {/* Trainer Select */}
            <Col flex="1 1 0%">
              <CommonSelectField
                height="33px"
                label="Select Trainer"
                labelMarginTop="0px"
                labelFontSize="11px"
                options={trainersList}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTrainerId(val);
                  fetchTrainerPaymentData({ trainerId: val });
                }}
                value={selectedTrainerId}
                disableClearable={false}
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
              <div className="presales_pdf_banner_top">
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
                    <strong>Date Basis:</strong>{" "}
                    {dateFilterType === "RaiseDate"
                      ? "Bill Raise Date"
                      : dateFilterType === "PaidDate"
                        ? "Paid Date"
                        : "Deadline Date"}
                  </div>
                  <div>
                    <strong>Commercial Model:</strong>{" "}
                    {commercialType || "All Commercials"}
                  </div>
                  <div>
                    <strong>Generated:</strong>{" "}
                    {moment().format("DD MMM YYYY, hh:mm A")}
                  </div>
                </div>
              </div>
              <div className="presales_pdf_banner_kpis">
                <div className="presales_pdf_kpi_card">
                  <span className="presales_pdf_kpi_lbl">
                    Total Payout Claimed
                  </span>
                  <strong
                    className="presales_pdf_kpi_val"
                    style={{ color: "#4f46e5" }}
                  >
                    ₹
                    {Number(analytics.totalPayoutClaimed).toLocaleString(
                      "en-IN",
                    )}
                  </strong>
                </div>
                <div className="presales_pdf_kpi_card">
                  <span className="presales_pdf_kpi_lbl">Total Disbursed</span>
                  <strong
                    className="presales_pdf_kpi_val"
                    style={{ color: "#059669" }}
                  >
                    ₹{Number(analytics.totalDisbursed).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="presales_pdf_kpi_card">
                  <span className="presales_pdf_kpi_lbl">
                    Ready to Pay (Finance)
                  </span>
                  <strong
                    className="presales_pdf_kpi_val"
                    style={{ color: "#0284c7" }}
                  >
                    ₹
                    {Number(analytics.readyToPayAmount).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="presales_pdf_kpi_card">
                  <span className="presales_pdf_kpi_lbl">Realization Rate</span>
                  <strong
                    className="presales_pdf_kpi_val"
                    style={{ color: "#059669" }}
                  >
                    {analytics.payoutRealizationRate}%
                  </strong>
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
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
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
                    title="gross claims raised"
                  >
                    gross claims raised
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 2: Total Disbursed */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
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
                    title="cleared disbursements"
                  >
                    cleared payouts
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 3: Ready to Pay (Finance Queue) */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
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
                    title="Finance release queue"
                  >
                    finance queue
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 4: Claimed (Awaiting Approval) */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
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
                    title="Awaiting Ops approval"
                  >
                    awaiting approval
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 5: Unclaimed Links Sent */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
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
                    title="Pending trainer claim"
                  >
                    pending trainer claim
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 6: Overdue / SLA Breached */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
              <div className="presales_stat_card presales_theme_rose">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">
                      Overdue / SLA Breached
                    </p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#e11d48" }}
                      title={`₹${analytics.overdueAmount.toLocaleString("en-IN")}`}
                    >
                      ₹{analytics.overdueAmount.toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiAlertTriangle size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiAlertCircle size={12} />
                    <span className="presales_avg_label">Breached:</span>
                    <strong className="presales_avg_val">
                      {analytics.overdueCount} claims
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="Past deadline date"
                  >
                    past deadline date
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
              5 Key Disbursement Milestones
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
                      {statusCounts.link_sent}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{ color: "#d97706" }}
                    >
                      ₹{formatIndianNumber(analytics.linkSentAmount)}
                    </span>
                  </div>
                </div>
                <div className="presales_funnel_subitems">
                  <div className="presales_funnel_subitem">
                    <span className="presales_funnel_subitem_name">
                      <span
                        className="presales_subitem_dot"
                        style={{ background: "#f59e0b" }}
                      />
                      <span className="presales_subitem_text">
                        Links Dispatched
                      </span>
                    </span>
                    <span className="presales_funnel_subitem_count">
                      {statusCounts.link_sent}
                    </span>
                  </div>
                  <div className="presales_funnel_subitem">
                    <span className="presales_funnel_subitem_name">
                      <span
                        className="presales_subitem_dot"
                        style={{ background: "#fbbf24" }}
                      />
                      <span className="presales_subitem_text">
                        Awaiting Submission
                      </span>
                    </span>
                    <span className="presales_funnel_subitem_count">
                      {statusCounts.link_sent}
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
                      {statusCounts.requested}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{ color: "#7c3aed" }}
                    >
                      ₹{formatIndianNumber(analytics.claimedAmount)}
                    </span>
                  </div>
                </div>
                <div className="presales_funnel_subitems">
                  <div className="presales_funnel_subitem">
                    <span className="presales_funnel_subitem_name">
                      <span
                        className="presales_subitem_dot"
                        style={{ background: "#8b5cf6" }}
                      />
                      <span className="presales_subitem_text">
                        Forms Submitted
                      </span>
                    </span>
                    <span className="presales_funnel_subitem_count">
                      {statusCounts.requested}
                    </span>
                  </div>
                  <div className="presales_funnel_subitem">
                    <span className="presales_funnel_subitem_name">
                      <span
                        className="presales_subitem_dot"
                        style={{ background: "#a78bfa" }}
                      />
                      <span className="presales_subitem_text">
                        Under HR Review
                      </span>
                    </span>
                    <span className="presales_funnel_subitem_count">
                      {statusCounts.requested}
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
                    3. READY TO PAY
                  </p>
                  <div className="presales_funnel_count_row">
                    <span className="presales_funnel_step_count">
                      {statusCounts.awaiting_finance}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{ color: "#0284c7" }}
                    >
                      ₹{formatIndianNumber(analytics.readyToPayAmount)}
                    </span>
                  </div>
                </div>
                <div className="presales_funnel_subitems">
                  <div className="presales_funnel_subitem">
                    <span className="presales_funnel_subitem_name">
                      <span
                        className="presales_subitem_dot"
                        style={{ background: "#0ea5e9" }}
                      />
                      <span className="presales_subitem_text">HR Approved</span>
                    </span>
                    <span className="presales_funnel_subitem_count">
                      {statusCounts.awaiting_finance}
                    </span>
                  </div>
                  <div className="presales_funnel_subitem">
                    <span className="presales_funnel_subitem_name">
                      <span
                        className="presales_subitem_dot"
                        style={{ background: "#38bdf8" }}
                      />
                      <span className="presales_subitem_text">
                        Finance Bank Queue
                      </span>
                    </span>
                    <span className="presales_funnel_subitem_count">
                      {statusCounts.awaiting_finance}
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
                  <div className="presales_funnel_count_row">
                    <span
                      className="presales_funnel_step_count"
                      style={{ color: "#047857" }}
                    >
                      {statusCounts.paid}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{ color: "#047857" }}
                    >
                      ₹{formatIndianNumber(analytics.totalDisbursed)}
                    </span>
                  </div>
                </div>
                <div className="presales_funnel_subitems">
                  <div className="presales_funnel_subitem">
                    <span className="presales_funnel_subitem_name">
                      <span
                        className="presales_subitem_dot"
                        style={{ background: "#10b981" }}
                      />
                      <span className="presales_subitem_text">
                        Transfers Cleared
                      </span>
                    </span>
                    <span
                      className="presales_funnel_subitem_count"
                      style={{ color: "#047857" }}
                    >
                      {statusCounts.paid}
                    </span>
                  </div>
                  <div className="presales_funnel_subitem">
                    <span className="presales_funnel_subitem_name">
                      <span
                        className="presales_subitem_dot"
                        style={{ background: "#34d399" }}
                      />
                      <span className="presales_subitem_text">
                        Payslips Generated
                      </span>
                    </span>
                    <span
                      className="presales_funnel_subitem_count"
                      style={{ color: "#047857" }}
                    >
                      {statusCounts.paid}
                    </span>
                  </div>
                </div>

                <div
                  className="presales_funnel_hero_box"
                  style={{ marginTop: 8 }}
                >
                  <div className="presales_funnel_hero_tag">
                    <span>🎯 Payout Realization</span>
                  </div>
                  <div className="presales_funnel_hero_stat">
                    <span className="presales_funnel_hero_stat_label">
                      Realization Rate
                    </span>
                    <strong className="presales_funnel_hero_stat_val">
                      {analytics.payoutRealizationRate}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              SECTION 3: Commercial Model & Operational Distribution
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
                        Online Training (7/14 Day SLA)
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{analytics.onlineAmount.toLocaleString("en-IN")} (
                        {analytics.onlineCount})
                      </strong>
                    </div>
                    <Progress
                      percent={
                        analytics.totalPayoutClaimed > 0
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
                        Classroom Training (2/5 Day SLA)
                      </span>
                      <strong style={{ color: "#0f172a" }}>
                        ₹{analytics.classroomAmount.toLocaleString("en-IN")} (
                        {analytics.classroomCount})
                      </strong>
                    </div>
                    <Progress
                      percent={
                        analytics.totalPayoutClaimed > 0
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
                      Number(analytics.averageDaysTaken) <= 7
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
                      {analytics.averageDaysTaken}{" "}
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
                      {analytics.onTimeRate}%
                    </h3>
                  </Col>
                </Row>
                <div style={{ marginTop: 12 }}>
                  <Progress
                    percent={parseFloat(analytics.onTimeRate) || 0}
                    strokeColor="#059669"
                    size="small"
                    status={
                      parseFloat(analytics.onTimeRate) >= 90
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
