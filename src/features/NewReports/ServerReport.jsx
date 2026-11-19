import React, { useState, useEffect, useRef, useMemo } from "react";
import "./styles.css";
import { Button, Col, Divider, Row, Tooltip, Skeleton, Dropdown } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { getBranches } from "../ApiService/action";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiTable,
  FiTrendingUp,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";
import {
  HiOutlineServerStack,
  HiOutlineSparkles,
  HiOutlineTrophy,
} from "react-icons/hi2";
import { TbTargetArrow } from "react-icons/tb";
import {
  getCurrentandPreviousweekDate,
  getFormattedDateString,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import moment from "moment";
import { useSelector } from "react-redux";
import CommonSelectField from "../Common/CommonSelectField";

/**
 * Dedicated Skeleton Loader for Server Report
 */
function ServerReportSkeleton() {
  return (
    <div className="presales_skeleton_wrapper">
      <div className="presales_section_header" style={{ marginTop: 20 }}>
        <h2 className="presales_section_title">
          <HiOutlineServerStack style={{ color: "#6366f1" }} size={19} /> Server
          Lifecycle & Financial Analytics
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#eef2ff", color: "#6366f1" }}
        >
          Loading Server Metrics...
        </span>
      </div>

      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Col xs={24} sm={12} md={8} lg={i <= 2 ? 5 : 4} key={i}>
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
              <Skeleton.Input
                active
                size="small"
                style={{ width: 130, height: 13, marginTop: 12 }}
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

/**
 * Mock / Initial Dataset for Server Analytics
 * Mapped directly to the business workflow:
 * 1. Sale Person requested
 * 2. RA raised with duration
 * 3. Server Admin added amount
 * 4. Finance Head approved
 * 5. Finance Employee purchased (Date, Mode, Txn ID)
 * 6. Server Admin issued to Customer
 * 7. Expired after validity
 */
const INITIAL_SERVER_REPORT_DATA = {
  summary: {
    total_raised_count: 142, // Evalo server raise pannirukaga
    total_raised_amount: 295000, // Evalo amount ku raise pannirukaga
    total_purchased_amount: 248500, // Evalo amount ku purchase pannirukaga
    total_purchased_count: 114, // Purchased count
    total_issued_count: 98, // Evalo server issue pannirukaga
    active_servers: 98,
    expired_servers: 18,
    pending_approval_count: 14,
    ready_to_pay_count: 4,
    unique_customers: 118, // Multi-server customers insight
    multi_server_customers: 24,
  },
  flow_stages: [
    {
      step: 1,
      title: "1. REQUESTED",
      role: "Sale Person",
      desc: "Requested practice server for customer",
      count: 18,
      subtext: "18 Awaiting RA action",
      color: "#6366f1",
      badge: "Pending RA",
    },
    {
      step: 2,
      title: "2. RAISED WITH DURATION",
      role: "RA",
      desc: "Raised with validity (30d / 60d / 90d)",
      count: 14,
      subtext: "14 In RA review",
      color: "#818cf8",
      badge: "Pending Admin Valuation",
    },
    {
      step: 3,
      title: "3. VALUATION & APPROVAL",
      role: "Server Admin & Finance Head",
      desc: "Admin priced amount & Finance Head approved",
      count: 26,
      subtext: "14 Awaiting Approval · 4 Ready to Pay",
      color: "#f59e0b",
      badge: "In Approval",
    },
    {
      step: 4,
      title: "4. PURCHASED",
      role: "Finance Employee",
      desc: "Filled Payment Date, Mode & Txn ID",
      count: 114,
      amount: 248500,
      subtext: "₹2,48,500 total spend disbursed",
      color: "#0284c7",
      badge: "Procured",
    },
    {
      step: 5,
      title: "5. ISSUED TO CUSTOMER",
      role: "Server Admin",
      desc: "Delivered credentials via WhatsApp & Email",
      count: 98,
      subtext: "98 Active in-training labs",
      color: "#10b981",
      badge: "Active in Use",
    },
    {
      step: 6,
      title: "6. EXPIRED",
      role: "System / Renewal",
      desc: "Practice validity term completed",
      count: 18,
      subtext: "18 Expired / Renewal Watchlist",
      color: "#ef4444",
      badge: "Expired / Renew",
    },
  ],
  regional_data: [
    {
      region: "HUB",
      region_id: 3,
      raised_count: 54,
      raised_amount: 112000,
      purchased_count: 44,
      purchased_amount: 94500,
      issued_count: 38,
      active_count: 38,
      expired_count: 6,
      users: [
        { user_id: "HUB8003", user_name: "Kalki", count: 16, spend: 28000 },
        { user_id: "HUB8004", user_name: "Kaviya", count: 14, spend: 24500 },
        { user_id: "HUB8007", user_name: "Kaviya K", count: 12, spend: 21000 },
        { user_id: "HUB8010", user_name: "Sathish", count: 8, spend: 14000 },
        {
          user_id: "HUB8001",
          user_name: "ASIRDASS ISAAC",
          count: 4,
          spend: 7000,
        },
      ],
    },
    {
      region: "Chennai",
      region_id: 1,
      raised_count: 48,
      raised_amount: 99500,
      purchased_count: 38,
      purchased_amount: 83500,
      issued_count: 34,
      active_count: 34,
      expired_count: 7,
      users: [
        { user_id: "CHN7007", user_name: "Asra Banu", count: 15, spend: 26250 },
        {
          user_id: "CHN7014",
          user_name: "Manikandan T",
          count: 13,
          spend: 22750,
        },
        { user_id: "CHN7019", user_name: "Logesh", count: 11, spend: 19250 },
        { user_id: "CHN7006", user_name: "RSM - 2", count: 9, spend: 15750 },
      ],
    },
    {
      region: "Bangalore",
      region_id: 2,
      raised_count: 40,
      raised_amount: 83500,
      purchased_count: 32,
      purchased_amount: 70500,
      issued_count: 26,
      active_count: 26,
      expired_count: 5,
      users: [
        { user_id: "BNG9005", user_name: "Rasheetha", count: 14, spend: 24500 },
        { user_id: "BNG9023", user_name: "Revathi", count: 12, spend: 21000 },
        { user_id: "BNG9010", user_name: "Kavin", count: 8, spend: 14000 },
        {
          user_id: "BNG9009",
          user_name: "Meherriya Dholi",
          count: 6,
          spend: 10500,
        },
      ],
    },
  ],
  top_10_servers: [
    {
      rank: 1,
      server_id: "SRV-SAP-FICO",
      server_name: "SAP FICO Server (ECC & S/4)",
      category: "ERP & Finance",
      raised_count: 38,
      raised_amount: 76000,
      purchased_count: 35,
      purchased_amount: 66500,
      issued_count: 34,
      duration: "60 Days",
      vendor: "SAP Remote Lab Networks",
      demand: "🔥 Highest Enrolled",
    },
    {
      rank: 2,
      server_id: "SRV-SAP-MM",
      server_name: "SAP MM Material Management Server",
      category: "ERP & Supply Chain",
      raised_count: 26,
      raised_amount: 52000,
      purchased_count: 24,
      purchased_amount: 45500,
      issued_count: 22,
      duration: "60 Days",
      vendor: "SAP Remote Lab Networks",
      demand: "🔥 High Demand",
    },
    {
      rank: 3,
      server_id: "SRV-SAP-HANA",
      server_name: "SAP S/4 HANA 2023 Sandbox",
      category: "Next-Gen ERP",
      raised_count: 22,
      raised_amount: 50000,
      purchased_count: 20,
      purchased_amount: 44000,
      issued_count: 18,
      duration: "60 Days",
      vendor: "CloudLabs Partner India",
      demand: "🔥 High Demand",
    },
    {
      rank: 4,
      server_id: "SRV-AWS-DEVOPS",
      server_name: "AWS & DevOps Cloud Practice Instance",
      category: "Cloud Infrastructure",
      raised_count: 18,
      raised_amount: 36000,
      purchased_count: 16,
      purchased_amount: 32400,
      issued_count: 14,
      duration: "30 Days",
      vendor: "AWS Cloud Practice Sandbox",
      demand: "▲ Consistent",
    },
    {
      rank: 5,
      server_id: "SRV-DATA-ANALYTICS",
      server_name: "Data Analytics (Power BI & SQL) Lab",
      category: "Business Intelligence",
      raised_count: 14,
      raised_amount: 24000,
      purchased_count: 12,
      purchased_amount: 21000,
      issued_count: 11,
      duration: "30 Days",
      vendor: "TechVM Infrastructure",
      demand: "▲ Consistent",
    },
    {
      rank: 6,
      server_id: "SRV-AI-ML",
      server_name: "AI & Machine Learning GPU Server",
      category: "Artificial Intelligence",
      raised_count: 10,
      raised_amount: 20000,
      purchased_count: 9,
      purchased_amount: 18000,
      issued_count: 8,
      duration: "30 Days",
      vendor: "AWS Cloud Practice Sandbox",
      demand: "▲ Consistent",
    },
    {
      rank: 7,
      server_id: "SRV-SAP-SF",
      server_name: "SAP SuccessFactors Cloud Lab",
      category: "HR & Cloud ERP",
      raised_count: 6,
      raised_amount: 14000,
      purchased_count: 5,
      purchased_amount: 12000,
      issued_count: 4,
      duration: "60 Days",
      vendor: "CloudLabs Partner India",
      demand: "▲ Consistent",
    },
    {
      rank: 8,
      server_id: "SRV-NUTANIX",
      server_name: "Nutanix Cloud Virtualization Cluster",
      category: "Enterprise Cloud",
      raised_count: 4,
      raised_amount: 6400,
      purchased_count: 4,
      purchased_amount: 5600,
      issued_count: 3,
      duration: "30 Days",
      vendor: "TechVM Infrastructure",
      demand: "▲ Consistent",
    },
    {
      rank: 9,
      server_id: "SRV-SAP-ARIBA",
      server_name: "SAP Ariba Procurement Practice Server",
      category: "Procurement Cloud",
      raised_count: 3,
      raised_amount: 5000,
      purchased_count: 2,
      purchased_amount: 4500,
      issued_count: 2,
      duration: "60 Days",
      vendor: "SAP Remote Lab Networks",
      demand: "▲ Consistent",
    },
    {
      rank: 10,
      server_id: "SRV-SALESFORCE",
      server_name: "Salesforce Developer & Admin Sandbox",
      category: "CRM & Cloud",
      raised_count: 1,
      raised_amount: 1600,
      purchased_count: 1,
      purchased_amount: 1500,
      issued_count: 1,
      duration: "30 Days",
      vendor: "TechVM Infrastructure",
      demand: "▲ Consistent",
    },
  ],
  customers_watchlist: [
    {
      id: "SRV-2026-101",
      candidate: "Rohan Varma",
      mobile: "+91 98451 23412",
      course: "SAP FICO Server (ECC & S/4)",
      customer_server_note: "Server 1 of 2 (Also purchased SAP MM)",
      raisedAmount: 2000,
      purchasedAmount: 1950,
      status: "Expiring Soon",
      paymentMode: "Bank - NEFT/IMPS",
      txnId: "TXN9841284",
      expiryDate: moment().add(3, "days").format("YYYY-MM-DD"),
      daysLeft: 3,
      raisedBy: "HUB8003 - Kalki",
    },
    {
      id: "SRV-2026-102",
      candidate: "Pooja Hegde",
      mobile: "+91 97412 88910",
      course: "SAP MM Material Management",
      customer_server_note: "Single Server",
      raisedAmount: 2000,
      purchasedAmount: 1950,
      status: "Expiring Soon",
      paymentMode: "UPI",
      txnId: "UPI7784102",
      expiryDate: moment().add(5, "days").format("YYYY-MM-DD"),
      daysLeft: 5,
      raisedBy: "CHN7007 - Asra Banu",
    },
    {
      id: "SRV-2026-103",
      candidate: "Karthik Raja",
      mobile: "+91 99801 12345",
      course: "AWS & DevOps Cloud Practice",
      customer_server_note: "Server 1 of 2 (Also purchased Data Analytics)",
      raisedAmount: 1900,
      purchasedAmount: 1800,
      status: "Expiring Soon",
      paymentMode: "Bank - NEFT/IMPS",
      txnId: "TXN1029384",
      expiryDate: moment().add(6, "days").format("YYYY-MM-DD"),
      daysLeft: 6,
      raisedBy: "BNG9005 - Rasheetha",
    },
    {
      id: "SRV-2026-104",
      candidate: "Divya Balan",
      mobile: "+91 98840 76543",
      course: "SAP S/4 HANA 2023 Sandbox",
      customer_server_note: "Single Server",
      raisedAmount: 2200,
      purchasedAmount: 2000,
      status: "Expired",
      paymentMode: "UPI",
      txnId: "UPI9028172",
      expiryDate: moment().subtract(2, "days").format("YYYY-MM-DD"),
      daysLeft: -2,
      raisedBy: "CHN7014 - Manikandan T",
    },
    {
      id: "SRV-2026-105",
      candidate: "Deepak Verma",
      mobile: "+91 96112 43210",
      course: "Data Analytics Lab",
      customer_server_note: "Single Server",
      raisedAmount: 1600,
      purchasedAmount: 1400,
      status: "Expired",
      paymentMode: "UPI",
      txnId: "UPI6641920",
      expiryDate: moment().subtract(5, "days").format("YYYY-MM-DD"),
      daysLeft: -5,
      raisedBy: "HUB8004 - Kaviya",
    },
    {
      id: "SRV-2026-106",
      candidate: "Suresh Raina",
      mobile: "+91 94441 55667",
      course: "SAP SuccessFactors Cloud Lab",
      customer_server_note: "Server 2 of 2 (Also has SAP FICO)",
      raisedAmount: 2200,
      purchasedAmount: 0,
      status: "Awaiting Accounts Approval",
      paymentMode: "-",
      txnId: "-",
      expiryDate: moment().add(30, "days").format("YYYY-MM-DD"),
      daysLeft: 30,
      raisedBy: "BNG9023 - Revathi",
    },
    {
      id: "SRV-2026-107",
      candidate: "Ananya Iyer",
      mobile: "+91 98842 99001",
      course: "AI & Machine Learning GPU",
      customer_server_note: "Single Server",
      raisedAmount: 2000,
      purchasedAmount: 0,
      status: "Ready to Pay (Approved)",
      paymentMode: "Pending Payment",
      txnId: "-",
      expiryDate: moment().add(30, "days").format("YYYY-MM-DD"),
      daysLeft: 30,
      raisedBy: "HUB8007 - Kaviya K",
    },
  ],
};

/**
 * Role-Based Region Selection Utility
 */
const getRoleBasedRegionConfig = () => {
  try {
    const raw = localStorage.getItem("loginUserDetails");
    if (!raw) return { regionId: null, disabled: false };
    const user = JSON.parse(raw);
    const userId = String(user?.user_id || "").toUpperCase();

    if (userId.startsWith("HUB")) {
      return { regionId: 3, disabled: true };
    }
    if (userId.startsWith("CHN")) {
      return { regionId: 1, disabled: true };
    }
    if (userId.startsWith("BNG")) {
      return { regionId: 2, disabled: true };
    }
    return { regionId: null, disabled: false };
  } catch {
    return { regionId: null, disabled: false };
  }
};

export default function ServerReport({ onBack, summaryStartAndEndDate }) {
  const roleRegionConfig = getRoleBasedRegionConfig();
  const reportContentRef = useRef(null);

  // Filter States
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(
    roleRegionConfig.regionId,
  );
  const [isRegionDisabled, setIsRegionDisabled] = useState(
    roleRegionConfig.disabled,
  );
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [filterBranchOptions, setFilterBranchOptions] = useState([]);

  // Data & UI States
  const [reportData] = useState(INITIAL_SERVER_REPORT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAllTopServers, setShowAllTopServers] = useState(false);

  // Redux Region Options
  const reduxRegionOptions = useSelector(
    (state) => state.globalregionslist || [],
  );
  const regionOptions = useMemo(() => {
    return reduxRegionOptions.map((r) => ({
      id: r.id || r.region_id,
      name: r.name || r.region_name || r.region,
    }));
  }, [reduxRegionOptions]);

  // Initial Load & Date Setup
  useEffect(() => {
    let datesToUse = [];
    if (
      Array.isArray(summaryStartAndEndDate) &&
      summaryStartAndEndDate.length === 2 &&
      summaryStartAndEndDate[0] &&
      summaryStartAndEndDate[1]
    ) {
      datesToUse = summaryStartAndEndDate;
    } else {
      datesToUse = getCurrentandPreviousweekDate();
    }
    setSelectedDates(datesToUse);

    const config = getRoleBasedRegionConfig();
    const assignedRegionId = config.regionId;
    setSelectedRegionId(assignedRegionId);
    setIsRegionDisabled(config.disabled);

    if (assignedRegionId) {
      getBranchesData(assignedRegionId);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [summaryStartAndEndDate]);

  // Fetch branches for region
  const getBranchesData = async (region_id) => {
    try {
      const response = await getBranches({ region_id });
      const branches = response?.data?.data || [];
      const formatted = branches.map((b) => ({
        id: b.branch_id || b.id,
        name: b.branch_name || b.name,
      }));
      setFilterBranchOptions(formatted);
    } catch (error) {
      console.error("Error loading branches for Server Report:", error);
      setFilterBranchOptions([]);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    const prevAndCurr = getCurrentandPreviousweekDate();
    setSelectedDates(prevAndCurr);

    const config = getRoleBasedRegionConfig();
    setSelectedRegionId(config.regionId);
    setIsRegionDisabled(config.disabled);
    setSelectedBranchId(null);

    if (config.regionId) {
      getBranchesData(config.regionId);
    } else {
      setFilterBranchOptions([]);
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsRefreshing(false);
      CommonMessage("success", "Server report data refreshed");
    }, 400);
  };

  // ---------------------------------------------------------------------------
  // Regional Cards Calculation (Overall, HUB, Chennai, Bangalore)
  // ---------------------------------------------------------------------------
  const regionalCardsData = useMemo(() => {
    const rawRegions = reportData?.regional_data || [];
    const REGION_PALETTE = [
      "#0284c7",
      "#6366f1",
      "#ea580c",
      "#10b981",
      "#8b5cf6",
    ];

    const overallTotalRaised =
      Number(reportData?.summary?.total_raised_count) || 0;

    const cards = [
      {
        id: "overall",
        title: "1. OVERALL",
        totalServers: overallTotalRaised,
        raisedAmount: reportData?.summary?.total_raised_amount || 0,
        purchasedCount: reportData?.summary?.total_purchased_count || 0,
        purchasedAmount: reportData?.summary?.total_purchased_amount || 0,
        issuedCount: reportData?.summary?.total_issued_count || 0,
        rateLabel: "TOTAL",
        color: "#059669",
      },
    ];

    // Preferred Order: HUB, Chennai, Bangalore
    const PREFERRED_REGION_ORDER = ["hub", "chennai", "bangalore"];
    const sortedRegions = [...rawRegions].sort((a, b) => {
      const nameA = String(a.region || "")
        .toLowerCase()
        .trim();
      const nameB = String(b.region || "")
        .toLowerCase()
        .trim();
      const idxA = PREFERRED_REGION_ORDER.indexOf(nameA);
      const idxB = PREFERRED_REGION_ORDER.indexOf(nameB);

      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return nameA.localeCompare(nameB);
    });

    sortedRegions.forEach((reg, idx) => {
      const regRaised = Number(reg.raised_count) || 0;
      const pct =
        overallTotalRaised > 0
          ? ((regRaised / overallTotalRaised) * 100).toFixed(1)
          : "0.0";

      cards.push({
        id: `region-${reg.region_id || idx}`,
        title: `${idx + 2}. ${String(reg.region || "").toUpperCase()}`,
        totalServers: regRaised,
        raisedAmount: reg.raised_amount || 0,
        purchasedCount: reg.purchased_count || 0,
        purchasedAmount: reg.purchased_amount || 0,
        issuedCount: reg.issued_count || 0,
        rateLabel: `${pct}% In ${reg.region}`,
        color: REGION_PALETTE[idx % REGION_PALETTE.length],
      });
    });

    return cards;
  }, [reportData]);

  // ---------------------------------------------------------------------------
  // Export Handlers (PDF & CSV)
  // ---------------------------------------------------------------------------
  const handleDownloadPDF = async () => {
    if (!reportContentRef.current) return;
    setIsExporting(true);
    CommonMessage("info", "Generating Server Report PDF...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const element = reportContentRef.current;

      const scrollables = element.querySelectorAll(
        ".admission_subitems_scroll, .presales_funnel_subitems, [class*='scroll']",
      );
      scrollables.forEach((el) => {
        el.scrollTop = 0;
        el.scrollLeft = 0;
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1280,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 5;
      const printWidth = pageWidth - margin * 2;
      const printHeight = (canvas.height * printWidth) / canvas.width;

      let position = margin;
      let heightLeft = printHeight;

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

      const filename = `Server_Report_${getFormattedDateString(selectedDates[0], selectedDates[1])}.pdf`;
      pdf.save(filename);

      CommonMessage("success", "Server report PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      CommonMessage("error", "Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const rows = [];
      rows.push(["ACTE CRM — Server Analytics & Lifecycle Operations Report"]);
      rows.push([
        "Period:",
        selectedDates?.[0]
          ? `${moment(selectedDates[0]).format("DD/MM/YYYY")} to ${moment(selectedDates[1]).format("DD/MM/YYYY")}`
          : "All Time",
      ]);
      rows.push(["Generated At:", moment().format("YYYY-MM-DD HH:mm:ss")]);
      rows.push([]);

      // 1. Core Summary Metrics
      rows.push(["1. CORE SERVER KPI SUMMARY"]);
      rows.push(["Metric Description", "Value"]);
      rows.push([
        "Total Servers Raised",
        reportData.summary.total_raised_count,
      ]);
      rows.push([
        "Total Raised Amount (Valuation)",
        `₹${Number(reportData.summary.total_raised_amount).toLocaleString("en-IN")}`,
      ]);
      rows.push([
        "Total Purchased Amount (Spent)",
        `₹${Number(reportData.summary.total_purchased_amount).toLocaleString("en-IN")}`,
      ]);
      rows.push([
        "Total Purchased Servers Count",
        reportData.summary.total_purchased_count,
      ]);
      rows.push([
        "Total Servers Issued to Customers",
        reportData.summary.total_issued_count,
      ]);
      rows.push(["Active Practice Servers", reportData.summary.active_servers]);
      rows.push([
        "Expired Practice Servers",
        reportData.summary.expired_servers,
      ]);
      rows.push(["Unique Customers", reportData.summary.unique_customers]);
      rows.push([
        "Multi-Server Customers",
        reportData.summary.multi_server_customers,
      ]);
      rows.push([]);

      // 2. Region-Wise Breakdown
      rows.push(["2. REGION-WISE SERVER DISTRIBUTION & METRICS"]);
      rows.push([
        "Region",
        "Servers Raised",
        "Raised Amount (₹)",
        "Servers Purchased",
        "Purchased Amount (₹)",
        "Servers Issued",
      ]);
      regionalCardsData.forEach((r) => {
        rows.push([
          r.title,
          r.totalServers,
          r.raisedAmount,
          r.purchasedCount,
          r.purchasedAmount,
          r.issuedCount,
        ]);
      });
      rows.push([]);

      // 3. Top 10 Servers
      rows.push(["3. TOP 10 SERVERS DEMAND & SPEND"]);
      rows.push([
        "Rank",
        "Server Name",
        "Category",
        "Raised Count",
        "Raised Value (₹)",
        "Purchased Count",
        "Purchased Amount (₹)",
        "Issued Count",
        "Duration",
        "Vendor",
      ]);
      reportData.top_10_servers.forEach((s) => {
        rows.push([
          s.rank,
          s.server_name,
          s.category,
          s.raised_count,
          s.raised_amount,
          s.purchased_count,
          s.purchased_amount,
          s.issued_count,
          s.duration,
          s.vendor,
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Server Report");
      XLSX.writeFile(
        workbook,
        `Server_Report_${getFormattedDateString(selectedDates[0], selectedDates[1])}.csv`,
      );
      CommonMessage("success", "Server report CSV downloaded successfully!");
    } catch (e) {
      console.error("CSV Export Error:", e);
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
              Formatted A4 visual analytics report
            </span>
          </div>
        </div>
      ),
      onClick: handleDownloadPDF,
    },
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
              Spreadsheet data export (.csv)
            </span>
          </div>
        </div>
      ),
      onClick: handleDownloadCSV,
    },
  ];

  const maxTopServerRaised = Math.max(
    ...(reportData?.top_10_servers?.map((s) => s.raised_count) || [1]),
  );

  return (
    <div className="presales_report_wrapper">
      {/* ====================================================================
          1. Header & Controls
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

          <div className="server_header_icon_box">
            <HiOutlineServerStack size={22} />
          </div>

          <div>
            <h1 className="presales_header_title">
              Server Analytics & Lifecycle
            </h1>
            <p className="presales_header_subtitle">
              Tracking server requests, valuation amounts, finance purchases,
              customer issuance, and regional distribution
            </p>
          </div>
        </div>

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
                  <RedoOutlined spin style={{ color: "#6366f1" }} />
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
          2. Filters Row (Date Range, Region, Branch)
          ==================================================================== */}
      <Row gutter={[12, 8]} style={{ marginTop: "0px" }}>
        <Col xs={24} sm={24} md={24} lg={18} xl={16}>
          <Row gutter={12} align="middle" wrap={false}>
            {/* Date Range Picker */}
            <Col flex="1.5 1 0%">
              <CommonMuiCustomDatePicker
                label="Filter by Date"
                width="100%"
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
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
                  const value = e.target.value;
                  setSelectedRegionId(value);
                  setSelectedBranchId(null);
                  if (value) {
                    getBranchesData(value);
                  } else {
                    setFilterBranchOptions([]);
                  }
                }}
                value={selectedRegionId}
                disableClearable={isRegionDisabled ? true : false}
                disabled={isRegionDisabled}
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
                  setSelectedBranchId(e.target.value);
                }}
                value={selectedBranchId}
                disabled={!selectedRegionId || selectedRegionId == 3}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider className="customer_statusupdate_divider" />

      {isLoading ? (
        <ServerReportSkeleton />
      ) : (
        <div
          ref={reportContentRef}
          className={`presales_printable_content ${isExporting ? "is_exporting_pdf" : ""}`}
        >
          {/* PDF Dedicated Export Header Banner */}
          {isExporting && (
            <div className="presales_pdf_export_banner">
              <div className="presales_pdf_banner_top">
                <div>
                  <h1 className="presales_pdf_banner_title">
                    ACTE CRM — Server Lifecycle & Financial Analytics Report
                  </h1>
                  <p className="presales_pdf_banner_subtitle">
                    Fulfillment, Valuation Amounts, Procurement Spend, Customer
                    Issuance & Region-Wise Distribution
                  </p>
                </div>
                <div className="presales_pdf_banner_meta">
                  <div>
                    <strong>Period:</strong>{" "}
                    {selectedDates?.[0]
                      ? `${moment(selectedDates[0]).format("DD/MM/YYYY")} to ${moment(selectedDates[1]).format("DD/MM/YYYY")}`
                      : "All Time"}
                  </div>
                  <div>
                    <strong>Generated:</strong>{" "}
                    {moment().format("DD MMM YYYY, hh:mm A")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Customer Note Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              background: "#f0fdf4",
              borderRadius: "10px",
              border: "1px solid #bbf7d0",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <HiOutlineSparkles style={{ color: "#16a34a" }} size={18} />
              <span
                style={{ fontSize: "12px", color: "#166534", fontWeight: 600 }}
              >
                Customer Enrollment Note: One customer can purchase multiple
                servers.
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: "11px",
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontWeight: 700,
                }}
              >
                {reportData.summary.unique_customers} Unique Customers
              </span>
              <span
                style={{
                  fontSize: "11px",
                  background: "#e0e7ff",
                  color: "#4338ca",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontWeight: 700,
                }}
              >
                {reportData.summary.multi_server_customers} Multi-Server
                Learners
              </span>
            </div>
          </div>

          {/* ====================================================================
              1. HERO KPI STAT CARDS (Core Requested Metrics)
              - Evalo server raise pannirukaga
              - Evalo amount ku raise pannirukaga
              - Evalo amount ku purchase pannirukaga
              - Evalo server issue pannirukaga
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 8 }}>
            <h2 className="presales_section_title">
              <HiOutlineServerStack style={{ color: "#6366f1" }} size={19} />{" "}
              Server Operations & Financial Summary
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#eef2ff", color: "#6366f1" }}
            >
              Raised, Valuation, Purchase & Delivery Metrics
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {/* Card 1: Evalo server raise pannirukaga (Servers Raised) */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_indigo">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Servers Raised</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#4f46e5" }}
                    >
                      {reportData.summary.total_raised_count}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <HiOutlineServerStack size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge">
                    <FiTrendingUp size={12} />
                    <span>Total Raised</span>
                  </span>
                  <span className="presales_stat_subtext">
                    Raised with validity duration
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 2: Evalo amount ku raise pannirukaga (Raised Amount) */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_amber">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Total Raised Value</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#d97706" }}
                    >
                      ₹
                      {Number(
                        reportData.summary.total_raised_amount,
                      ).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FaIndianRupeeSign size={18} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge">
                    <FaIndianRupeeSign size={11} />
                    <span>Admin Priced</span>
                  </span>
                  <span className="presales_stat_subtext">
                    Estimated server valuation
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 3: Evalo amount ku purchase pannirukaga (Purchased Amount) */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_sky">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Purchased Amount</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#0284c7" }}
                    >
                      ₹
                      {Number(
                        reportData.summary.total_purchased_amount,
                      ).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FaIndianRupeeSign size={18} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge">
                    <FiCheckCircle size={12} />
                    <span>
                      {reportData.summary.total_purchased_count} Purchased
                    </span>
                  </span>
                  <span className="presales_stat_subtext">
                    Paid by Finance with Txn ID
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 4: Evalo server issue pannirukaga (Servers Issued) */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_emerald">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Servers Issued</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#059669" }}
                    >
                      {reportData.summary.total_issued_count}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiCheckCircle size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge">
                    <HiOutlineSparkles size={12} />
                    <span>Delivered</span>
                  </span>
                  <span className="presales_stat_subtext">
                    Issued to Customer by Admin
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          {/* ====================================================================
              2. REGIONAL BREAKDOWN (As requested: "i want Region-wise also")
              Shows Raised Count, Raised Amount, Purchased Amount, Issued Count
              in exact preferred order: OVERALL, HUB, CHENNAI, BANGALORE
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <TbTargetArrow style={{ color: "#059669" }} size={19} />{" "}
              Region-Wise Server Distribution & Financial Realization
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#ecfdf5", color: "#059669" }}
            >
              Raised, Purchased & Issued Metrics by Region
            </span>
          </div>

          {/* 4 Cards: OVERALL, HUB, CHENNAI, BANGALORE */}
          <div className="presales_funnel_container">
            <Row gutter={[16, 16]}>
              {regionalCardsData.map((card) => {
                const cardColor = card.color || "#059669";

                return (
                  <Col xs={24} sm={12} lg={6} key={card.id}>
                    <div
                      className="presales_funnel_step"
                      style={{
                        padding: "16px 14px",
                        borderRadius: 12,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Card Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: "1px solid #f1f5f9",
                          paddingBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 700,
                            color: "#0f172a",
                            letterSpacing: "0.2px",
                          }}
                        >
                          {card.title}
                        </span>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 12,
                            background: `${cardColor}15`,
                            color: cardColor,
                          }}
                        >
                          {card.rateLabel}
                        </span>
                      </div>

                      {/* Primary Metric: Servers Raised */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "space-between",
                          padding: "2px 0",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                              fontWeight: 600,
                            }}
                          >
                            Servers Raised
                          </div>
                          <div
                            style={{
                              fontSize: "24px",
                              fontWeight: 800,
                              color: cardColor,
                              lineHeight: 1.1,
                              marginTop: 3,
                            }}
                          >
                            {Number(card.totalServers).toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            background: `${cardColor}12`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: cardColor,
                          }}
                        >
                          <HiOutlineServerStack size={20} />
                        </div>
                      </div>

                      {/* Financial & Delivery Metrics Box */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          padding: "10px",
                          background: "#f8fafc",
                          borderRadius: 8,
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        {/* Metric 1: Raised Value */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "11px",
                          }}
                        >
                          <span style={{ color: "#64748b", fontWeight: 500 }}>
                            Raised Value:
                          </span>
                          <strong style={{ color: "#d97706", fontWeight: 700 }}>
                            ₹{Number(card.raisedAmount).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        {/* Metric 2: Purchased Amount */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "11px",
                          }}
                        >
                          <span style={{ color: "#64748b", fontWeight: 500 }}>
                            Purchased Amount:
                          </span>
                          <strong style={{ color: "#0284c7", fontWeight: 700 }}>
                            ₹
                            {Number(card.purchasedAmount).toLocaleString(
                              "en-IN",
                            )}
                          </strong>
                        </div>

                        {/* Metric 3: Servers Issued */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "11px",
                          }}
                        >
                          <span style={{ color: "#64748b", fontWeight: 500 }}>
                            Servers Issued:
                          </span>
                          <strong style={{ color: "#059669", fontWeight: 700 }}>
                            {card.issuedCount} Servers
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* ====================================================================
              4. TOP 10 SERVERS (As requested: "Then top 10 servers")
              ==================================================================== */}
          <div
            className="presales_section_header"
            style={{
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <h2 className="presales_section_title">
                <HiOutlineTrophy style={{ color: "#d97706" }} size={20} /> Top
                10 Servers
              </h2>
              <span className="presales_section_title_badge">
                {showAllTopServers || isExporting
                  ? `Showing All 10 Servers`
                  : "Showing Top 5 Servers"}
              </span>
            </div>
          </div>

          <Row gutter={[16, 16]}>
            {(showAllTopServers || isExporting
              ? reportData.top_10_servers
              : reportData.top_10_servers.slice(0, 5)
            ).map((server) => {
              const rankClass =
                server.rank === 1
                  ? "rank_1"
                  : server.rank === 2
                    ? "rank_2"
                    : server.rank === 3
                      ? "rank_3"
                      : "rank_standard";
              const cardClass =
                server.rank === 1
                  ? "top_1"
                  : server.rank === 2
                    ? "top_2"
                    : server.rank === 3
                      ? "top_3"
                      : "";
              const barWidthPercent =
                (server.raised_count / maxTopServerRaised) * 100;

              return (
                <Col xs={24} sm={24} md={12} key={server.server_id}>
                  <div className={`admission_course_card ${cardClass}`}>
                    <div className="admission_course_top_row">
                      <div className="admission_course_left">
                        <div className={`admission_rank_badge ${rankClass}`}>
                          {server.rank <= 3 ? `#${server.rank}` : server.rank}
                        </div>
                        <div className="admission_course_info">
                          <h4
                            className="admission_course_title"
                            title={server.server_name}
                          >
                            {server.server_name}
                          </h4>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            Category: {server.category} · Duration:{" "}
                            {server.duration}
                          </span>
                        </div>
                      </div>

                      <div className="admission_course_count_box">
                        <span className="admission_course_count">
                          {server.raised_count}
                        </span>
                        <span className="admission_course_count_lbl">
                          Raised
                        </span>
                      </div>
                    </div>

                    {/* Progress Fill Bar */}
                    <div className="admission_course_progress_track">
                      <div
                        className="admission_course_progress_fill"
                        style={{
                          width: `${barWidthPercent}%`,
                          background:
                            server.rank === 1
                              ? "linear-gradient(90deg, #6366f1 0%, #4338ca 100%)"
                              : server.rank === 2
                                ? "linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)"
                                : server.rank === 3
                                  ? "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
                                  : "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                        }}
                      />
                    </div>

                    {/* Metrics Footer */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 2px",
                        fontSize: "11px",
                        color: "#475569",
                        borderBottom: "1px dashed #e2e8f0",
                        marginBottom: 6,
                      }}
                    >
                      <span>
                        Raised Val:{" "}
                        <strong>
                          ₹
                          {Number(server.raised_amount).toLocaleString("en-IN")}
                        </strong>
                      </span>
                      <span>
                        Purchased:{" "}
                        <strong>
                          ₹
                          {Number(server.purchased_amount).toLocaleString(
                            "en-IN",
                          )}
                        </strong>{" "}
                        ({server.purchased_count} servers)
                      </span>
                      <span>
                        Issued:{" "}
                        <strong style={{ color: "#059669" }}>
                          {server.issued_count}
                        </strong>
                      </span>
                    </div>

                    <div className="admission_course_footer">
                      <span className="admission_course_share_pill">
                        Vendor: {server.vendor}
                      </span>
                      <span className="admission_demand_pill">
                        {server.demand}
                      </span>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>

          {reportData.top_10_servers.length > 5 && !isExporting && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 18,
                marginBottom: 6,
              }}
            >
              <button
                type="button"
                onClick={() => setShowAllTopServers(!showAllTopServers)}
                className="admission_show_more_btn"
              >
                {showAllTopServers ? (
                  <>
                    Show Less <FiChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Show All 10 Servers (5 More) <FiChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
