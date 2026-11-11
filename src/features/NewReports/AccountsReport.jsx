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
  Switch,
} from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  getBranches,
  getUsersByTheirRole,
  getAccountsReportsCounts,
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
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { LuIndianRupee, LuRefreshCw } from "react-icons/lu";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { TbReportAnalytics, TbTargetArrow } from "react-icons/tb";
import {
  getCurrentandPreviousweekDate,
  getFormattedDateString,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import moment from "moment";
import { useSelector } from "react-redux";
import CommonSelectField from "../Common/CommonSelectField";

/**
 * Dedicated Skeleton Loader for Accounts Report
 */
function AccountsReportSkeleton() {
  return (
    <div className="presales_skeleton_wrapper">
      {/* Executive Summary Skeleton (6 Cards) */}
      <div className="presales_section_header" style={{ marginTop: 20 }}>
        <h2 className="presales_section_title">
          <HiOutlineClipboardDocumentCheck
            style={{ color: "#7c3aed" }}
            size={19}
          />{" "}
          Accounts Executive Summary
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#f5f3ff", color: "#7c3aed" }}
        >
          Financial Operations & Revenue KPIs
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
    </div>
  );
}

export default function AccountsReport({
  onBack,
  summaryStartAndEndDate,
  roleIds,
}) {
  const downlineUsers = useSelector((state) => state.downlineusers) || [];
  const regionOptions = useSelector((state) => state.globalregionslist) || [];

  const prevSelectedUserIdRef = useRef("[]");
  const selectedUserIdRef = useRef([]);
  const reportContentRef = useRef(null);

  // Filter state
  const [selectedDates, setSelectedDates] = useState([]);
  const [convenienceFeesType, setConvenienceFeesType] = useState("Yes"); // "Yes" or "No"
  const [accountsUsers, setAccountsUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [filterBranchOptions, setFilterBranchOptions] = useState([]);

  // Loading, refresh, and export states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Backend API Data State (Only fields from API response)
  const [reportData, setReportData] = useState({
    sale_volume: 0,
    total_collection: 0,
    new_payment_collection: 0,
    re_payment_collection: 0,
    pending_payment: 0,
    need_to_verify: 0,
  });

  // Synchronize ref with selectedUserId
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  // Initial Date Setup
  useEffect(() => {
    if (summaryStartAndEndDate && summaryStartAndEndDate.length === 2) {
      setSelectedDates(summaryStartAndEndDate);
    } else {
      const dates = getCurrentandPreviousweekDate();
      setSelectedDates(dates);
    }
  }, [summaryStartAndEndDate]);

  // Initial Load when roleIds ready
  useEffect(() => {
    if (roleIds) {
      fetchAccountsUsersData({
        startDate: summaryStartAndEndDate?.[0] || selectedDates?.[0],
        endDate: summaryStartAndEndDate?.[1] || selectedDates?.[1],
        regionId: null,
        branchId: null,
        convenienceFeesType: "Yes",
      });
    }
  }, [roleIds]);

  const fetchAccountsUsersData = async (overrides = {}) => {
    const regionId =
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId;
    const branchId =
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId;
    const startDate =
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null;
    const endDate =
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null;
    const convenienceFees =
      overrides.convenienceFeesType !== undefined
        ? overrides.convenienceFeesType
        : convenienceFeesType;

    setIsLoading(true);
    const activeRoles = roleIds ? [roleIds.sale_role_id].filter(Boolean) : [];

    const payload = {
      ...(activeRoles.length > 0 && { roles: activeRoles }),
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      page: 1,
      limit: 1000,
    };

    try {
      const response = await getUsersByTheirRole(payload);
      const sale_users = response?.data?.data || [];

      const sale_downlines = downlineUsers.filter((downline) =>
        sale_users.some((user) => user.user_id === downline.user_id),
      );

      setAccountsUsers(sale_downlines);

      fetchAccountsData({
        startDate: startDate,
        endDate: endDate,
        regionId: regionId,
        branchId: branchId,
        user_ids: sale_downlines.map((su) => su.user_id),
        convenienceFeesType: convenienceFees,
      });
    } catch (error) {
      console.log("get accounts users error", error);
      setAccountsUsers([]);
      fetchAccountsData({
        startDate: startDate,
        endDate: endDate,
        regionId: regionId,
        branchId: branchId,
        user_ids: [],
        convenienceFeesType: convenienceFees,
      });
    }
  };

  // Fetch report counts from backend API
  const fetchAccountsData = (overrides = {}) => {
    getAccountsData(
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null,
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null,
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId,
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId,
      overrides.user_ids !== undefined
        ? overrides.user_ids
        : (selectedUserIdRef.current || selectedUserId).length >= 1
          ? selectedUserIdRef.current || selectedUserId
          : accountsUsers.map((su) => su.user_id),
      overrides.convenienceFeesType !== undefined
        ? overrides.convenienceFeesType
        : convenienceFeesType,
    );
  };

  const getAccountsData = async (
    startDate,
    endDate,
    regionId,
    branchId,
    user_ids,
    convenienceFees = convenienceFeesType,
  ) => {
    setIsLoading(true);
    const payload = {
      start_date: startDate
        ? moment(startDate).format("YYYY-MM-DD")
        : selectedDates?.[0]
          ? moment(selectedDates[0]).format("YYYY-MM-DD")
          : undefined,
      end_date: endDate
        ? moment(endDate).format("YYYY-MM-DD")
        : selectedDates?.[1]
          ? moment(selectedDates[1]).format("YYYY-MM-DD")
          : undefined,
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      user_ids: user_ids && user_ids.length >= 1 ? user_ids : [],
      convenience_fees_type: convenienceFees,
    };

    try {
      const response = await getAccountsReportsCounts(payload);
      const apiData =
        response?.data?.data || response?.data?.result || response?.data || {};

      if (apiData) {
        setReportData({
          sale_volume: Number(apiData.sale_volume) || 0,
          total_collection: Number(apiData.total_collection) || 0,
          new_payment_collection: Number(apiData.new_payment) || 0,
          re_payment_collection: Number(apiData.re_payment) || 0,
          pending_payment: Number(apiData.pending_payment) || 0,
          need_to_verify: Number(apiData.need_to_verify) || 0,
        });
      }
    } catch (error) {
      console.log("get accounts reports error", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        "Failed to fetch accounts report counts";
      CommonMessage("error", errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setSelectedRegionId(null);
    setSelectedBranchId(null);
    setFilterBranchOptions([]);
    setConvenienceFeesType("Yes");
    prevSelectedUserIdRef.current = "[]";
    selectedUserIdRef.current = [];
    setSelectedUserId([]);
    fetchAccountsUsersData({
      startDate: PreviousAndCurrentDate[0],
      endDate: PreviousAndCurrentDate[1],
      regionId: null,
      branchId: null,
      convenienceFeesType: "Yes",
    });
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    selectedUserIdRef.current = value;
    setSelectedUserId(value);
  };

  const handleSelectUserBlur = async () => {
    const value = selectedUserIdRef.current;
    if (JSON.stringify(value) !== prevSelectedUserIdRef.current) {
      prevSelectedUserIdRef.current = JSON.stringify(value);
      fetchAccountsData({
        user_ids:
          value.length >= 1 ? value : accountsUsers.map((su) => su.user_id),
      });
    }
  };

  const handleConvenienceFeesChange = (newType) => {
    if (newType === convenienceFeesType) return;
    setConvenienceFeesType(newType);
    fetchAccountsData({ convenienceFeesType: newType });
  };

  // ---------------------------------------------------------------------------
  // Derived Analytics Data Model
  // ---------------------------------------------------------------------------
  const accountsAnalytics = useMemo(() => {
    const saleVolume = Number(reportData.sale_volume) || 0;
    const totalCollection = Number(reportData.total_collection) || 0;
    const newPaymentCollection = Number(reportData.new_payment_collection) || 0;
    const rePaymentCollection = Number(reportData.re_payment_collection) || 0;
    const pendingPayment = Number(reportData.pending_payment) || 0;
    const needToVerify = Number(reportData.need_to_verify) || 0;

    // Days difference calculation
    const startDate = selectedDates?.[0] ? moment(selectedDates[0]) : null;
    const endDate = selectedDates?.[1] ? moment(selectedDates[1]) : null;
    const daysDiff =
      startDate && endDate && startDate.isValid() && endDate.isValid()
        ? Math.max(1, endDate.diff(startDate, "days") + 1)
        : 1;

    // Daily Averages
    const saleVolumeDailyAvg = Math.round(saleVolume / daysDiff);
    const totalCollectionDailyAvg = Math.round(totalCollection / daysDiff);
    const newPaymentCollectionDailyAvg = Math.round(
      newPaymentCollection / daysDiff,
    );
    const rePaymentCollectionDailyAvg = Math.round(
      rePaymentCollection / daysDiff,
    );
    const pendingPaymentDailyAvg = Math.round(pendingPayment / daysDiff);
    const needToVerifyDailyAvg = Math.round(needToVerify / daysDiff);

    // Percentage ratios relative to total sale volume
    const calcRatio = (amount) => {
      if (!saleVolume || saleVolume <= 0) return "0.0%";
      return `${((amount / saleVolume) * 100).toFixed(1)}%`;
    };

    const collectionRatioNum =
      saleVolume > 0 ? (totalCollection / saleVolume) * 100 : 0;
    const pendingRatioNum =
      saleVolume > 0 ? (pendingPayment / saleVolume) * 100 : 0;
    const verifyRatioNum =
      saleVolume > 0 ? (needToVerify / saleVolume) * 100 : 0;

    return {
      saleVolume,
      totalCollection,
      newPaymentCollection,
      rePaymentCollection,
      pendingPayment,
      needToVerify,
      daysDiff,
      saleVolumeDailyAvg,
      totalCollectionDailyAvg,
      newPaymentCollectionDailyAvg,
      rePaymentCollectionDailyAvg,
      pendingPaymentDailyAvg,
      needToVerifyDailyAvg,
      collectionRatio: calcRatio(totalCollection),
      newPaymentRatio: calcRatio(newPaymentCollection),
      rePaymentRatio: calcRatio(rePaymentCollection),
      pendingRatio: calcRatio(pendingPayment),
      verifyRatio: calcRatio(needToVerify),
      collectionRatioNum: Math.min(100, Math.max(0, collectionRatioNum)),
      pendingRatioNum: Math.min(100, Math.max(0, pendingRatioNum)),
      verifyRatioNum: Math.min(100, Math.max(0, verifyRatioNum)),
    };
  }, [reportData, selectedDates]);

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
      CommonMessage("info", "Preparing Accounts PDF report...");

      // Small delay to allow state and DOM to render export banner
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

      const filename = `Accounts_Report_${getFormattedDateString(selectedDates[0], selectedDates[1])}.pdf`;
      pdf.save(filename);

      CommonMessage("success", "Accounts PDF report downloaded successfully!");
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
      rows.push([
        "ACTE CRM — Accounts Analytics & Financial Operations Report",
      ]);
      rows.push([
        "Filter Period:",
        selectedDates?.[0]
          ? `${moment(selectedDates[0]).format("DD/MM/YYYY")} to ${moment(selectedDates[1]).format("DD/MM/YYYY")}`
          : "All Time",
      ]);
      rows.push(["Convenience Fees:", convenienceFeesType]);
      rows.push(["Generated At:", moment().format("YYYY-MM-DD HH:mm:ss")]);
      rows.push([]);

      // 1. Executive Financial Metrics
      rows.push(["1. ACCOUNTS EXECUTIVE METRICS"]);
      rows.push([
        "Metric Name",
        "Raw Amount (₹)",
        "Formatted Amount",
        "Daily Average",
        "Share of Sale Volume",
      ]);
      rows.push([
        "Sale Volume",
        reportData.sale_volume,
        `₹${Number(reportData.sale_volume).toLocaleString("en-IN")}`,
        `₹${Number(accountsAnalytics.saleVolumeDailyAvg).toLocaleString("en-IN")} / day`,
        "100.0%",
      ]);
      rows.push([
        "Total Collection",
        reportData.total_collection,
        `₹${Number(reportData.total_collection).toLocaleString("en-IN")}`,
        `₹${Number(accountsAnalytics.totalCollectionDailyAvg).toLocaleString("en-IN")} / day`,
        accountsAnalytics.collectionRatio,
      ]);
      rows.push([
        "New payment Collection",
        reportData.new_payment_collection,
        `₹${Number(reportData.new_payment_collection).toLocaleString("en-IN")}`,
        `₹${Number(accountsAnalytics.newPaymentCollectionDailyAvg).toLocaleString("en-IN")} / day`,
        accountsAnalytics.newPaymentRatio,
      ]);
      rows.push([
        "Re-Payment Collection",
        reportData.re_payment_collection,
        `₹${Number(reportData.re_payment_collection).toLocaleString("en-IN")}`,
        `₹${Number(accountsAnalytics.rePaymentCollectionDailyAvg).toLocaleString("en-IN")} / day`,
        accountsAnalytics.rePaymentRatio,
      ]);
      rows.push([
        "Pending Payment",
        reportData.pending_payment,
        `₹${Number(reportData.pending_payment).toLocaleString("en-IN")}`,
        `₹${Number(accountsAnalytics.pendingPaymentDailyAvg).toLocaleString("en-IN")} / day`,
        accountsAnalytics.pendingRatio,
      ]);
      rows.push([
        "Need to Verify",
        reportData.need_to_verify,
        `₹${Number(reportData.need_to_verify).toLocaleString("en-IN")}`,
        `₹${Number(accountsAnalytics.needToVerifyDailyAvg).toLocaleString("en-IN")} / day`,
        accountsAnalytics.verifyRatio,
      ]);
      rows.push([]);

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts Report");
      const dateStr = dayjs().format("YYYY-MM-DD");
      XLSX.writeFile(workbook, `ACTE_Accounts_Report_${dateStr}.csv`);
      CommonMessage("success", "CSV downloaded successfully!");
    } catch (error) {
      console.error("CSV export error:", error);
      CommonMessage("error", "Failed to generate CSV. Please try again.");
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
          1. Header Bar (Back button, Title, Subtitle, Download, Refresh)
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
          <div className="accounts_header_icon_box">
            <FaRupeeSign size={19} />
          </div>
          <div>
            <h1 className="presales_header_title">Accounts Report</h1>
            <p className="presales_header_subtitle">
              Financial performance, collections, pending payments, and payment
              verification tracking
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Download Dropdown */}
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
                  <RedoOutlined spin style={{ color: "#7c3aed" }} />
                ) : (
                  <FiDownload />
                )}
              </button>
            </Tooltip>
          </Dropdown>

          {/* Refresh Button */}
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
          2. Filters Row (Date Range, Region, Branch, User)
          ==================================================================== */}
      <Row gutter={[12, 8]} style={{ marginTop: "0px" }}>
        <Col span={23}>
          <Row gutter={12} align="middle">
            <Col flex={"0.8 1 0%"}>
              <div className="postsales_datetype_box">
                <div className="postsales_datetype_toggle">
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${convenienceFeesType === "Yes" ? "active" : ""}`}
                    onClick={() => handleConvenienceFeesChange("Yes")}
                  >
                    Include Conv.Fees
                  </button>
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${convenienceFeesType === "No" ? "active" : ""}`}
                    onClick={() => handleConvenienceFeesChange("No")}
                  >
                    Exclude Conv.Fees
                  </button>
                </div>
              </div>
            </Col>
            {/* Date Picker */}
            <Col flex="1.5 1 0%">
              <CommonMuiCustomDatePicker
                label="Filter by Date"
                width="100%"
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  fetchAccountsData({
                    startDate: dates?.[0],
                    endDate: dates?.[1],
                  });
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
                  const value = e.target.value;
                  setSelectedRegionId(value);
                  setSelectedBranchId(null);
                  prevSelectedUserIdRef.current = "[]";
                  selectedUserIdRef.current = [];
                  setSelectedUserId([]);
                  fetchAccountsUsersData({
                    regionId: value,
                    branchId: null,
                  });
                  if (value) {
                    getBranchesData(value);
                  } else {
                    setFilterBranchOptions([]);
                  }
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
                  const value = e.target.value;
                  setSelectedBranchId(value);
                  prevSelectedUserIdRef.current = "[]";
                  selectedUserIdRef.current = [];
                  setSelectedUserId([]);
                  fetchAccountsUsersData({
                    regionId: selectedRegionId,
                    branchId: value,
                  });
                }}
                value={selectedBranchId}
                disableClearable={false}
                disabled={selectedRegionId == 3 ? true : false}
              />
            </Col>

            {/* User Select */}
            <Col flex="1 1 0%">
              <CommonMultiSelectField
                height="34px"
                label="Select User"
                labelMarginTop="1px"
                labelFontSize="11px"
                width="100%"
                options={accountsUsers}
                onChange={handleSelectUser}
                onBlur={handleSelectUserBlur}
                value={selectedUserId}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider className="customer_statusupdate_divider" />

      {/* ====================================================================
          3. Live Content or Skeleton Loader
          ==================================================================== */}
      {isLoading ? (
        <AccountsReportSkeleton />
      ) : (
        <div
          ref={reportContentRef}
          className={`presales_printable_content ${isExporting ? "is_exporting_pdf" : ""}`}
        >
          {/* Dedicated PDF Export Header Banner (Rendered into PDF export) */}
          {isExporting && (
            <div className="presales_pdf_export_banner">
              <div
                className="presales_pdf_banner_top"
                style={{ borderBottom: "0px" }}
              >
                <div>
                  <h1 className="presales_pdf_banner_title">
                    ACTE CRM — Accounts Analytics Report
                  </h1>
                  <p className="presales_pdf_banner_subtitle">
                    Comprehensive financial performance report on sales volume,
                    payment collections, pending receivables, and verification
                    workflows.
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
                    <strong>Convenience Fees:</strong>{" "}
                    {convenienceFeesType === "Yes" ? "Included" : "Excluded"}
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
              SECTION 1: Accounts Executive Summary (6 Main KPI Cards)
              ---------------------------------------------------------------- */}
          <div
            className="presales_section_header"
            style={{ marginTop: isExporting ? 20 : 6 }}
          >
            <h2 className="presales_section_title">
              <HiOutlineClipboardDocumentCheck
                style={{ color: "#7c3aed" }}
                size={20}
              />{" "}
              Accounts Executive Summary
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#f5f3ff", color: "#7c3aed" }}
            >
              Financial Operations & Revenue KPIs
            </span>
          </div>

          <Row gutter={[16, 22]}>
            {/* Card 1: Sale Volume */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
              <div className="presales_stat_card presales_theme_indigo">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Sale Volume</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#4f46e5" }}
                      title={`₹${Number(reportData.sale_volume).toLocaleString("en-IN")}`}
                    >
                      ₹{Number(reportData.sale_volume).toLocaleString("en-IN")}
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
                      ₹
                      {Number(
                        accountsAnalytics.saleVolumeDailyAvg,
                      ).toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="Total sales booked"
                  >
                    total sales booked
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 2: New payment Collection */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
              <div className="presales_stat_card presales_theme_sky">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">
                      New payment Collection
                    </p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#0284c7" }}
                      title={`₹${Number(reportData.new_payment_collection).toLocaleString("en-IN")}`}
                    >
                      ₹
                      {Number(reportData.new_payment_collection).toLocaleString(
                        "en-IN",
                      )}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <LuIndianRupee size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiCheckCircle size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹
                      {Number(
                        accountsAnalytics.newPaymentCollectionDailyAvg,
                      ).toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="New admission payments"
                  >
                    new admissions
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 3: Re-Payment Collection */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
              <div className="presales_stat_card presales_theme_orange">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Re-Payment Collection</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#ea580c" }}
                      title={`₹${Number(reportData.re_payment_collection).toLocaleString("en-IN")}`}
                    >
                      ₹
                      {Number(reportData.re_payment_collection).toLocaleString(
                        "en-IN",
                      )}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <LuRefreshCw size={19} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <LuRefreshCw size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹
                      {Number(
                        accountsAnalytics.rePaymentCollectionDailyAvg,
                      ).toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="Installment collections"
                  >
                    installments
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 4: Total Collection */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
              <div className="presales_stat_card presales_theme_emerald">
                <div className="presales_card_top">
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <p className="presales_stat_label" style={{ margin: 0 }}>
                        Total Collection
                      </p>
                    </div>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#059669", marginTop: 4 }}
                      title={`₹${Number(reportData.total_collection).toLocaleString("en-IN")}`}
                    >
                      ₹
                      {Number(reportData.total_collection).toLocaleString(
                        "en-IN",
                      )}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FaRupeeSign size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiCheckCircle size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹
                      {Number(
                        accountsAnalytics.totalCollectionDailyAvg,
                      ).toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title={
                      convenienceFeesType === "Yes"
                        ? "Convenience fees included"
                        : "Convenience fees excluded"
                    }
                  >
                    {convenienceFeesType === "Yes"
                      ? "fees included"
                      : "fees excluded"}
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 5: Pending Payment */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
              <div className="presales_stat_card presales_theme_amber">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Pending Payment</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#d97706" }}
                      title={`₹${Number(reportData.pending_payment).toLocaleString("en-IN")}`}
                    >
                      ₹
                      {Number(reportData.pending_payment).toLocaleString(
                        "en-IN",
                      )}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiClock size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiAlertCircle size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹
                      {Number(
                        accountsAnalytics.pendingPaymentDailyAvg,
                      ).toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="Outstanding balance"
                  >
                    outstanding
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 6: Need to Verify */}
            <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4}>
              <div className="presales_stat_card presales_theme_violet">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Need to Verify</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#7c3aed" }}
                      title={`₹${Number(reportData.need_to_verify).toLocaleString("en-IN")}`}
                    >
                      ₹
                      {Number(reportData.need_to_verify).toLocaleString(
                        "en-IN",
                      )}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <HiOutlineShieldCheck size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <HiOutlineSparkles size={13} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      ₹
                      {Number(
                        accountsAnalytics.needToVerifyDailyAvg,
                      ).toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="Awaiting verification"
                  >
                    awaiting verify
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}
