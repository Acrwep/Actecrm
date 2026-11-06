import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import { Button, Col, Divider, Row, Tooltip, Skeleton, Dropdown } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { getBranches, getUsersByTheirRole } from "../ApiService/action";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  FiUsers,
  FiActivity,
  FiUserCheck,
  FiClock,
  FiLayers,
  FiCompass,
  FiArrowRight,
  FiArrowLeft,
  FiTrendingUp,
  FiDownload,
  FiCheckCircle,
  FiFileText,
  FiTable,
  FiAward,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { TbReportAnalytics, TbTargetArrow } from "react-icons/tb";
import {
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineTrophy,
} from "react-icons/hi2";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import moment from "moment";
import { useSelector } from "react-redux";
import CommonSelectField from "../Common/CommonSelectField";

/**
 * Dedicated Skeleton Loader for Admissions Report
 * Replicates the exact layout, cards, and structure of the live analytics view.
 */
function AdmissionReportSkeleton() {
  return (
    <div className="presales_skeleton_wrapper">
      {/* 1. Admission Summary Skeleton (4 Cards) */}
      <div className="presales_section_header" style={{ marginTop: 20 }}>
        <h2 className="presales_section_title">
          <HiOutlineAcademicCap style={{ color: "#059669" }} size={19} />{" "}
          Admission Summary
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#ecfdf5", color: "#059669" }}
        >
          Executive KPIs
        </span>
      </div>

      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} md={12} lg={6} key={i}>
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
                    style={{ width: 110, height: 30, marginTop: 4 }}
                  />
                </div>
                <Skeleton.Avatar
                  active
                  size={40}
                  shape="square"
                  style={{ borderRadius: 10 }}
                />
              </div>
              <div className="presales_card_bottom">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 120, height: 16 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 65, height: 14 }}
                />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 2. Lifecycle Pipeline Skeleton */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <TbTargetArrow style={{ color: "#059669" }} size={19} /> Student
          Onboarding & Admission Lifecycle
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#ecfdf5", color: "#059669" }}
        >
          Pipeline Milestones
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
                  <div className="presales_funnel_count_row">
                    <Skeleton.Input active style={{ width: 45, height: 22 }} />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 40, height: 14 }}
                    />
                  </div>
                </div>
                <div className="presales_funnel_subitems">
                  {[1, 2, 3, 4].map((sub) => (
                    <div className="presales_funnel_subitem" key={sub}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "60%", height: 13 }}
                      />
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 25, height: 13 }}
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

      {/* 3. Top 10 Courses Skeleton */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <HiOutlineTrophy style={{ color: "#d97706" }} size={18} /> Top 10
          Best-Selling Courses
        </h2>
        <span className="presales_section_title_badge">Demand Analysis</span>
      </div>

      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Col xs={24} md={12} key={i}>
            <div className="admission_course_card">
              <Skeleton.Input active style={{ width: "100%", height: 35 }} />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default function AdmissionReport({
  onBack,
  summaryStartAndEndDate = [],
  saleRoleId,
}) {
  const downlineUsers = useSelector((state) => state.downlineusers) || [];
  const regionOptions = useSelector((state) => state.globalregionslist) || [];

  const prevSelectedUserIdRef = useRef("[]");
  const selectedUserIdRef = useRef([]);
  const reportContentRef = useRef(null);

  // Filter state
  const [selectedDates, setSelectedDates] = useState([]);
  const [counselorUsers, setCounselorUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [filterBranchOptions, setFilterBranchOptions] = useState([]);

  // Loading, refresh, and export states
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

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

  // Load Counselors
  useEffect(() => {
    if (saleRoleId) {
      fetchCounselorUsers(saleRoleId);
    }
  }, [saleRoleId]);

  const fetchCounselorUsers = async (roleId) => {
    const payload = {
      roles: [roleId],
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsersByTheirRole(payload);
      const users = response?.data?.data || [];
      const downlines = downlineUsers.filter((downline) =>
        users.some((user) => user.user_id === downline.user_id),
      );
      setCounselorUsers(downlines.length > 0 ? downlines : users);
    } catch (error) {
      console.log("get counselor users error", error);
      setCounselorUsers([]);
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
    setIsLoading(true);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setSelectedRegionId(null);
    setSelectedBranchId(null);
    setFilterBranchOptions([]);
    prevSelectedUserIdRef.current = "[]";
    selectedUserIdRef.current = [];
    setSelectedUserId([]);

    setTimeout(() => {
      setIsLoading(false);
      setIsRefreshing(false);
      CommonMessage("success", "Admissions Report refreshed");
    }, 450);
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    selectedUserIdRef.current = value;
    setSelectedUserId(value);
  };

  const handleSelectUserBlur = async () => {
    const value =
      selectedUserIdRef.current !== undefined
        ? selectedUserIdRef.current
        : selectedUserId;

    const stringifiedValue = JSON.stringify(value || []);
    if (prevSelectedUserIdRef.current === stringifiedValue) {
      return;
    }
    prevSelectedUserIdRef.current = stringifiedValue;

    // Simulate filtering update
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 350);
  };

  // ---------------------------------------------------------------------------
  // Data Model for Admission Report
  // ---------------------------------------------------------------------------
  const admissionReportData = {
    // 1. Admission Summary KPIs
    totalAdmissions: 142,
    netConversionRate: 21.8,
    directWalkinAdmissions: 58,
    onlineAdmissions: 84,
    dailyAverage: 4.7,

    // 2. Top 10 Best-Selling Courses
    topCourses: [
      {
        rank: 1,
        name: "Full Stack Python Developer",
        category: "Software Development",
        count: 28,
        share: 19.7,
        demand: "🔥 Highest Enrolled",
        trend: "+15% MoM",
      },
      {
        rank: 2,
        name: "AWS Cloud & DevOps Engineering",
        category: "Cloud Computing",
        count: 24,
        share: 16.9,
        demand: "🔥 High Demand",
        trend: "+12% MoM",
      },
      {
        rank: 3,
        name: "Data Science & Artificial Intelligence",
        category: "Data & AI",
        count: 21,
        share: 14.8,
        demand: "🔥 High Demand",
        trend: "+18% MoM",
      },
      {
        rank: 4,
        name: "Java Full Stack Development",
        category: "Software Development",
        count: 17,
        share: 12.0,
        demand: "▲ Consistent",
        trend: "+8% MoM",
      },
      {
        rank: 5,
        name: "MERN Stack Web Development",
        category: "Web Development",
        count: 14,
        share: 9.9,
        demand: "▲ Growing",
        trend: "+10% MoM",
      },
      {
        rank: 6,
        name: "Software Testing & QA Automation",
        category: "Quality Assurance",
        count: 11,
        share: 7.7,
        demand: "▲ Popular",
        trend: "+5% MoM",
      },
      {
        rank: 7,
        name: "Data Analytics with Power BI & SQL",
        category: "Business Intelligence",
        count: 9,
        share: 6.3,
        demand: "▲ Emerging",
        trend: "+14% MoM",
      },
      {
        rank: 8,
        name: "Salesforce Admin & Development",
        category: "Enterprise Cloud",
        count: 8,
        share: 5.6,
        demand: "• Stable",
        trend: "+4% MoM",
      },
      {
        rank: 9,
        name: "Cyber Security & Ethical Hacking",
        category: "Information Security",
        count: 6,
        share: 4.2,
        demand: "• Stable",
        trend: "+7% MoM",
      },
      {
        rank: 10,
        name: "UI/UX Design Master Program",
        category: "Design & Product",
        count: 5,
        share: 3.5,
        demand: "• Stable",
        trend: "+6% MoM",
      },
    ],

    // 3. Student Onboarding & Admission Lifecycle (Derived from Admission.jsx)
    lifecycleStages: [
      {
        stepNum: 1,
        title: "1. Student Onboarding",
        count: 142,
        rateLabel: "100% Initiated",
        rateColor: "#059669",
        activities: [
          {
            name: "Welcome Call",
            count: 138,
            completedText: "Completed",
            rate: "97.2%",
            color: "#16a34a",
          },
          {
            name: "Requirement Verification",
            count: 132,
            completedText: "Completed",
            rate: "93.0%",
            color: "#0284c7",
          },
          {
            name: "Trainer Assignment Request",
            count: 125,
            completedText: "Completed",
            rate: "88.0%",
            color: "#8b5cf6",
          },
          {
            name: "Trainer Fixation Call",
            count: 120,
            completedText: "Completed",
            rate: "84.5%",
            color: "#ea580c",
          },
        ],
      },
      {
        stepNum: 2,
        title: "2. Trainer Coordination",
        count: 120,
        rateLabel: "84.5% Coordinated",
        rateColor: "#0284c7",
        activities: [
          {
            name: "WhatsApp Group Creation",
            count: 116,
            completedText: "Completed",
            rate: "81.7%",
            color: "#16a34a",
          },
          {
            name: "Welcome Message",
            count: 112,
            completedText: "Completed",
            rate: "78.9%",
            color: "#4f46e5",
          },
          {
            name: "Teams Link & Attendance",
            count: 108,
            completedText: "Shared",
            rate: "76.1%",
            color: "#0284c7",
          },
          {
            name: "First Class Monitoring",
            count: 104,
            completedText: "Monitored",
            rate: "73.2%",
            color: "#ea580c",
          },
          {
            name: "Trainer Confirmation",
            count: 100,
            completedText: "Confirmed",
            rate: "70.4%",
            color: "#16a34a",
          },
        ],
      },
      {
        stepNum: 3,
        title: "3. Progress Monitoring",
        count: 100,
        rateLabel: "70.4% In Training",
        rateColor: "#4f46e5",
        activities: [
          {
            name: "Class Progress Monitoring",
            count: 94,
            completedText: "Active",
            rate: "66.2%",
            color: "#0284c7",
          },
          {
            name: "Student Support / Tickets",
            count: 88,
            completedText: "Resolved",
            rate: "62.0%",
            color: "#16a34a",
          },
          {
            name: "Mid Course Feedback",
            count: 82,
            completedText: "Collected",
            rate: "57.7%",
            color: "#eab308",
          },
          {
            name: "LMS Access",
            count: 115,
            completedText: "Provisioned",
            rate: "81.0%",
            color: "#8b5cf6",
          },
          {
            name: "Server Provisioning",
            count: 74,
            completedText: "Allocated",
            rate: "52.1%",
            color: "#ea580c",
          },
        ],
      },
      {
        stepNum: 4,
        title: "4. Course Completion",
        count: 68,
        rateLabel: "47.9% Final Stage",
        rateColor: "#ea580c",
        activities: [
          {
            name: "Class Completion Confirmed",
            count: 64,
            completedText: "Confirmed",
            rate: "45.1%",
            color: "#16a34a",
          },
          {
            name: "Trainer Completion Report",
            count: 60,
            completedText: "Submitted",
            rate: "42.3%",
            color: "#0284c7",
          },
          {
            name: "Student Completion Report",
            count: 58,
            completedText: "Submitted",
            rate: "40.8%",
            color: "#8b5cf6",
          },
          {
            name: "Placement Handover",
            count: 54,
            completedText: "Handed Over",
            rate: "38.0%",
            color: "#ea580c",
          },
        ],
      },
      {
        stepNum: 5,
        title: "★ Certification & Closure",
        count: 48,
        rateLabel: "33.8% Graduated",
        rateColor: "#059669",
        isHero: true,
        activities: [
          {
            name: "Google Reviews",
            count: 52,
            completedText: "Verified",
            rate: "36.6%",
            color: "#16a34a",
          },
          {
            name: "LinkedIn Reviews",
            count: 45,
            completedText: "Shared",
            rate: "31.7%",
            color: "#0284c7",
          },
          {
            name: "Certificates Issued",
            count: 48,
            completedText: "Issued",
            rate: "33.8%",
            color: "#8b5cf6",
          },
          {
            name: "Course Closure Call",
            count: 46,
            completedText: "Completed",
            rate: "32.4%",
            color: "#ea580c",
          },
        ],
      },
    ],

    // 4. Admission Sources & Sub-Sources Attribution
    admissionSources: [
      { name: "Direct / Walk-in", count: 46, share: 32.4, color: "#10b981" },
      { name: "Website Portal", count: 38, share: 26.8, color: "#6366f1" },
      { name: "Student Referral", count: 24, share: 16.9, color: "#f59e0b" },
      { name: "Social Media (SMO)", count: 18, share: 12.7, color: "#ec4899" },
      { name: "Inbound Tele-Call", count: 11, share: 7.7, color: "#06b6d4" },
      { name: "Live Chat / WhatsApp", count: 5, share: 3.5, color: "#8b5cf6" },
    ],
    admissionSubSources: [
      { name: "Branch Walk-in Counseling", count: 46, parent: "Direct" },
      { name: "Website Direct Enrollment", count: 26, parent: "Website" },
      { name: "Alumni / Friend Referral", count: 24, parent: "Reference" },
      { name: "Instagram / LinkedIn Campaign", count: 18, parent: "SMO" },
      { name: "Website Contact Form", count: 12, parent: "Website" },
      { name: "IVR Helpline Call", count: 11, parent: "Call" },
      { name: "WhatsApp Business Chat", count: 5, parent: "Live Chat" },
    ],
  };

  // Max count for scaling the course comparison bar
  const maxCourseCount = Math.max(
    ...admissionReportData.topCourses.map((c) => c.count),
  );

  // ---------------------------------------------------------------------------
  // Export Handlers (PDF & CSV)
  // ---------------------------------------------------------------------------
  const handleDownloadPDF = async () => {
    if (!reportContentRef.current) return;
    setIsExporting(true);
    CommonMessage("info", "Generating Admissions Report PDF...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const element = reportContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let position = 0;
      let heightLeft = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const dateStr = dayjs().format("YYYY-MM-DD");
      pdf.save(`ACTE_Admissions_Report_${dateStr}.pdf`);
      CommonMessage("success", "PDF downloaded successfully!");
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
      rows.push(["ACTE CRM — Admissions Analytics Report"]);
      rows.push([
        "Period:",
        selectedDates?.[0]
          ? `${moment(selectedDates[0]).format("DD/MM/YYYY")} to ${moment(selectedDates[1]).format("DD/MM/YYYY")}`
          : "All Time",
      ]);
      rows.push(["Generated At:", moment().format("YYYY-MM-DD HH:mm:ss")]);
      rows.push([]);

      // 1. Summary
      rows.push(["1. ADMISSION SUMMARY"]);
      rows.push(["Metric", "Value"]);
      rows.push(["Total Admissions", admissionReportData.totalAdmissions]);
      rows.push([
        "Net Conversion Rate",
        `${admissionReportData.netConversionRate}%`,
      ]);
      rows.push([
        "Direct / Walk-in Admissions",
        admissionReportData.directWalkinAdmissions,
      ]);
      rows.push([
        "Online / Remote Admissions",
        admissionReportData.onlineAdmissions,
      ]);
      rows.push([
        "Daily Average",
        `${admissionReportData.dailyAverage} admissions/day`,
      ]);
      rows.push([]);

      // 2. Top Courses
      rows.push(["2. TOP 10 BEST-SELLING COURSES"]);
      rows.push([
        "Rank",
        "Course Name",
        "Category",
        "Admissions",
        "Share (%)",
        "Demand Trend",
      ]);
      admissionReportData.topCourses.forEach((c) => {
        rows.push([
          c.rank,
          c.name,
          c.category,
          c.count,
          `${c.share}%`,
          c.demand,
        ]);
      });
      rows.push([]);

      // 3. Lifecycle
      rows.push(["3. STUDENT ONBOARDING & ADMISSION LIFECYCLE"]);
      rows.push([
        "Stage",
        "Activity",
        "Completed Count",
        "Completion Rate (%)",
      ]);
      admissionReportData.lifecycleStages.forEach((stage) => {
        stage.activities.forEach((act) => {
          rows.push([stage.title, act.name, act.count, act.rate]);
        });
      });
      rows.push([]);

      // 4. Sources
      rows.push(["4. ADMISSION SOURCES ATTRIBUTION"]);
      rows.push(["Source Channel", "Admissions", "Share (%)"]);
      admissionReportData.admissionSources.forEach((s) => {
        rows.push([s.name, s.count, `${s.share}%`]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Admissions Report");
      const dateStr = dayjs().format("YYYY-MM-DD");
      XLSX.writeFile(workbook, `ACTE_Admissions_Report_${dateStr}.csv`);
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
          1. Header & Controls (Matching Pre-Sales Report standard)
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
          <div className="admission_header_icon_box">
            <HiOutlineAcademicCap />
          </div>
          <div>
            <h1 className="presales_header_title">Admissions Report</h1>
            <p className="presales_header_subtitle">
              Comprehensive analytics on student enrollments, course popularity,
              and onboarding milestones
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
                  <RedoOutlined spin style={{ color: "#10b981" }} />
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
          Filters Row (Date Range, Region, Branch, Counselor)
          ==================================================================== */}
      <Row gutter={[12, 8]} style={{ marginTop: "0px" }}>
        <Col xs={24} sm={24} md={24} lg={20}>
          <Row gutter={12} align="middle" wrap={false}>
            <Col flex="1.5 1 0%">
              <CommonMuiCustomDatePicker
                label={"Select Date"}
                width="100%"
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 350);
                }}
              />
            </Col>
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
                  prevSelectedUserIdRef.current = "[]";
                  selectedUserIdRef.current = [];
                  setSelectedUserId([]);
                  if (value) {
                    getBranchesData(value);
                  } else {
                    setFilterBranchOptions([]);
                  }
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 350);
                }}
                value={selectedRegionId}
                disableClearable={false}
              />
            </Col>
            <Col flex="1 1 0%">
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
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 350);
                }}
                value={selectedBranchId}
                disableClearable={false}
                disabled={selectedRegionId == 3 ? true : false}
              />
            </Col>
            <Col flex="1 1 0%">
              <CommonMultiSelectField
                height="34px"
                label="Select Counselor"
                labelMarginTop="1px"
                labelFontSize="11px"
                width="100%"
                options={counselorUsers}
                onChange={handleSelectUser}
                onBlur={handleSelectUserBlur}
                value={selectedUserId}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider className="customer_statusupdate_divider" />

      {/* Render Skeleton or Main Live Content */}
      {isLoading ? (
        <AdmissionReportSkeleton />
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
                    ACTE CRM — Admissions Analytics Report
                  </h1>
                  <p className="presales_pdf_banner_subtitle">
                    Official enrollment analytics, best-selling courses demand
                    report, and onboarding lifecycle tracking.
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
              <div className="presales_pdf_banner_kpis">
                <div className="presales_pdf_kpi_card">
                  <span className="presales_pdf_kpi_lbl">Total Admissions</span>
                  <strong
                    className="presales_pdf_kpi_val"
                    style={{ color: "#059669" }}
                  >
                    {admissionReportData.totalAdmissions}
                  </strong>
                </div>
                <div className="presales_pdf_kpi_card">
                  <span className="presales_pdf_kpi_lbl">Net Conversion</span>
                  <strong
                    className="presales_pdf_kpi_val"
                    style={{ color: "#4f46e5" }}
                  >
                    {admissionReportData.netConversionRate}%
                  </strong>
                </div>
                <div className="presales_pdf_kpi_card">
                  <span className="presales_pdf_kpi_lbl">
                    Walk-in Admissions
                  </span>
                  <strong
                    className="presales_pdf_kpi_val"
                    style={{ color: "#0284c7" }}
                  >
                    {admissionReportData.directWalkinAdmissions}
                  </strong>
                </div>
                <div className="presales_pdf_kpi_card">
                  <span className="presales_pdf_kpi_lbl">
                    Online Admissions
                  </span>
                  <strong
                    className="presales_pdf_kpi_val"
                    style={{ color: "#d97706" }}
                  >
                    {admissionReportData.onlineAdmissions}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              1. Admission Summary (Executive KPI Cards)
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 20 }}>
            <h2 className="presales_section_title">
              <HiOutlineAcademicCap style={{ color: "#059669" }} size={20} />{" "}
              Admission Summary
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#ecfdf5", color: "#059669" }}
            >
              Confirmed Enrollments
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {/* Card 1: Total Admissions */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_emerald">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Total Admissions</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#059669" }}
                    >
                      {admissionReportData.totalAdmissions}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <HiOutlineAcademicCap size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <HiOutlineSparkles size={13} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {admissionReportData.dailyAverage}
                    </strong>
                  </span>
                  <span className="presales_stat_subtext">joinings / day</span>
                </div>
              </div>
            </Col>

            {/* Card 2: Conversion Rate */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_indigo">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Net Conversion Rate</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#4f46e5" }}
                    >
                      {admissionReportData.netConversionRate}%
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <TbTargetArrow size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiTrendingUp size={12} />
                    <span className="presales_avg_label">Inquiry to Join:</span>
                    <strong className="presales_avg_val">+3.4%</strong>
                  </span>
                  <span className="presales_stat_subtext">vs last period</span>
                </div>
              </div>
            </Col>

            {/* Card 3: Direct / Walk-in Admissions */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_sky">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">On-Campus / Walk-in</p>
                    <h3 className="presales_stat_value">
                      {admissionReportData.directWalkinAdmissions}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiUserCheck size={18} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span
                    className="presales_badge"
                    style={{
                      background: "#f0f9ff",
                      color: "#0284c7",
                      borderColor: "#bae6fd",
                    }}
                  >
                    40.8% Share
                  </span>
                  <span className="presales_stat_subtext">Branch visits</span>
                </div>
              </div>
            </Col>

            {/* Card 4: Online / Remote Admissions */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_amber">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">
                      Online / Virtual Intake
                    </p>
                    <h3 className="presales_stat_value">
                      {admissionReportData.onlineAdmissions}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiActivity size={18} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span
                    className="presales_badge"
                    style={{
                      background: "#fffbeb",
                      color: "#d97706",
                      borderColor: "#fde68a",
                    }}
                  >
                    59.2% Share
                  </span>
                  <span className="presales_stat_subtext">Remote learners</span>
                </div>
              </div>
            </Col>
          </Row>

          {/* ====================================================================
              2. Student Onboarding & Admission Lifecycle
              (Based on categories & columns in Admission.jsx)
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <TbTargetArrow style={{ color: "#059669" }} size={19} /> Student
              Onboarding & Admission Lifecycle
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#ecfdf5", color: "#059669" }}
            >
              Onboarding Health: 97.2%
            </span>
          </div>

          {/* Visual Lifecycle Funnel Track (Matching PreSalesReport layout) */}
          <div className="presales_funnel_container">
            <div className="presales_funnel_steps">
              {admissionReportData.lifecycleStages.map((stage, idx) => {
                const isHero = stage.isHero;
                return (
                  <React.Fragment key={stage.stepNum}>
                    <div
                      className={`presales_funnel_step ${isHero ? "hero_step" : ""}`}
                    >
                      <div className="presales_funnel_step_header">
                        <p
                          className="presales_funnel_step_label"
                          style={{ color: isHero ? "#047857" : "#64748b" }}
                        >
                          {stage.title}
                        </p>
                        <div className="presales_funnel_count_row">
                          <span
                            className="presales_funnel_step_count"
                            style={{ color: isHero ? "#047857" : "#0f172a" }}
                          >
                            {stage.count}
                          </span>
                          <span
                            className="presales_funnel_step_rate"
                            style={{ color: stage.rateColor }}
                          >
                            {stage.rateLabel}
                          </span>
                        </div>
                      </div>

                      {/* Onboarding Activities Subitems */}
                      {!isHero ? (
                        <div className="presales_funnel_subitems">
                          {stage.activities.map((act) => (
                            <div
                              className="presales_funnel_subitem"
                              key={act.name}
                              title={`${act.name}: ${act.count} ${act.completedText}`}
                            >
                              <span className="presales_funnel_subitem_name">
                                <span
                                  className="presales_subitem_dot"
                                  style={{ background: act.color }}
                                />
                                {act.name}
                              </span>
                              <span className="presales_funnel_subitem_count">
                                {act.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="presales_funnel_subitems">
                            {stage.activities.map((act) => (
                              <div
                                className="presales_funnel_subitem"
                                key={act.name}
                                title={`${act.name}: ${act.count} ${act.completedText}`}
                              >
                                <span className="presales_funnel_subitem_name">
                                  <span
                                    className="presales_subitem_dot"
                                    style={{ background: act.color }}
                                  />
                                  {act.name}
                                </span>
                                <span
                                  className="presales_funnel_subitem_count"
                                  style={{ color: "#047857" }}
                                >
                                  {act.count}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div
                            className="presales_funnel_hero_box"
                            style={{ marginTop: 8 }}
                          >
                            <div className="presales_funnel_hero_tag">
                              <span>🎯 Goal Achievement</span>
                            </div>
                            <div className="presales_funnel_hero_stat">
                              <span className="presales_funnel_hero_stat_label">
                                Graduation Rate
                              </span>
                              <strong className="presales_funnel_hero_stat_val">
                                {stage.rateLabel}
                              </strong>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {idx < admissionReportData.lifecycleStages.length - 1 && (
                      <FiArrowRight className="presales_funnel_arrow" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ====================================================================
              3. Top 10 Best-Selling Courses (Clean & Attractive Comparison Grid)
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <HiOutlineTrophy style={{ color: "#d97706" }} size={20} /> Top 10
              Best-Selling Courses
            </h2>
            <span className="presales_section_title_badge">
              {showAllCourses
                ? "Showing All 10 Courses"
                : "Showing Top 5 Courses"}
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {(showAllCourses
              ? admissionReportData.topCourses
              : admissionReportData.topCourses.slice(0, 5)
            ).map((course) => {
              const rankClass =
                course.rank === 1
                  ? "rank_1"
                  : course.rank === 2
                    ? "rank_2"
                    : course.rank === 3
                      ? "rank_3"
                      : "rank_standard";

              const cardClass =
                course.rank === 1
                  ? "top_1"
                  : course.rank === 2
                    ? "top_2"
                    : course.rank === 3
                      ? "top_3"
                      : "";

              const barWidthPercent = (course.count / maxCourseCount) * 100;

              return (
                <Col xs={24} sm={24} md={12} key={course.rank}>
                  <div className={`admission_course_card ${cardClass}`}>
                    <div className="admission_course_top_row">
                      <div className="admission_course_left">
                        <div className={`admission_rank_badge ${rankClass}`}>
                          {course.rank <= 3 ? `#${course.rank}` : course.rank}
                        </div>
                        <div className="admission_course_info">
                          <h4
                            className="admission_course_title"
                            title={course.name}
                          >
                            {course.name}
                          </h4>
                          <span className="admission_course_category">
                            {course.category}
                          </span>
                        </div>
                      </div>

                      <div className="admission_course_count_box">
                        <span className="admission_course_count">
                          {course.count}
                        </span>
                        <span className="admission_course_count_lbl">
                          Enrolled
                        </span>
                      </div>
                    </div>

                    {/* Relative Popularity Fill Bar */}
                    <div className="admission_course_progress_track">
                      <div
                        className="admission_course_progress_fill"
                        style={{
                          width: `${barWidthPercent}%`,
                          background:
                            course.rank === 1
                              ? "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
                              : course.rank === 2
                                ? "linear-gradient(90deg, #64748b 0%, #475569 100%)"
                                : course.rank === 3
                                  ? "linear-gradient(90deg, #fb923c 0%, #ea580c 100%)"
                                  : "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                        }}
                      />
                    </div>

                    <div className="admission_course_footer">
                      <span className="admission_course_share_pill">
                        {course.share}% of Total Admissions
                      </span>
                      <span className="admission_demand_pill">
                        {course.demand}
                      </span>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>

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
              onClick={() => setShowAllCourses(!showAllCourses)}
              className="admission_show_more_btn"
            >
              {showAllCourses ? (
                <>
                  Show Less <FiChevronUp size={16} />
                </>
              ) : (
                <>
                  Show All 10 Courses (
                  {admissionReportData.topCourses.length - 5} More){" "}
                  <FiChevronDown size={16} />
                </>
              )}
            </button>
          </div>

          {/* ====================================================================
              4. Channel & Attribution Breakdown (Sources & Sub-Sources)
              (Follows Pre-Sales Report's dual-panel layout)
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <FiLayers style={{ color: "#059669" }} size={18} /> Admission
              Channel Attribution
            </h2>
            <span className="presales_section_title_badge">
              Source & Sub-Source Analytics
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {/* Panel 1: Admission Sources */}
            <Col xs={24} lg={12}>
              <div className="presales_panel_card">
                <div className="presales_panel_header">
                  <div className="presales_panel_title_box">
                    <div
                      className="presales_panel_title_icon"
                      style={{ background: "#ecfdf5", color: "#059669" }}
                    >
                      <FiCompass />
                    </div>
                    <div>
                      <h4 className="presales_panel_title">
                        Admission Sources
                      </h4>
                      <p className="presales_panel_subtitle">
                        Student distribution across inbound acquisition channels
                      </p>
                    </div>
                  </div>
                  <span
                    className="presales_panel_total_badge"
                    style={{
                      background: "#ecfdf5",
                      color: "#059669",
                      borderColor: "#a7f3d0",
                    }}
                  >
                    {admissionReportData.admissionSources.length} Channels
                  </span>
                </div>

                <div className="presales_panel_body">
                  {admissionReportData.admissionSources.map((source, index) => (
                    <div key={index} className="presales_source_item">
                      <div className="presales_source_meta">
                        <span className="presales_source_name">
                          <span
                            className="presales_source_dot"
                            style={{ backgroundColor: source.color }}
                          />
                          {source.name}
                        </span>
                        <div className="presales_source_stats">
                          <span className="presales_source_count">
                            {source.count}
                          </span>
                          <span className="presales_source_pct">
                            {source.share}%
                          </span>
                        </div>
                      </div>
                      <div className="presales_source_bar_bg">
                        <div
                          className="presales_source_bar_fill"
                          style={{
                            width: `${source.share}%`,
                            backgroundColor: source.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* Panel 2: Admission Sub-Sources */}
            <Col xs={24} lg={12}>
              <div className="presales_panel_card">
                <div className="presales_panel_header">
                  <div className="presales_panel_title_box">
                    <div
                      className="presales_panel_title_icon"
                      style={{ background: "#ecfdf5", color: "#059669" }}
                    >
                      <FiLayers />
                    </div>
                    <div>
                      <h4 className="presales_panel_title">
                        Admission Sub-Sources
                      </h4>
                      <p className="presales_panel_subtitle">
                        Granular touchpoint and campaign level enrollment
                        details
                      </p>
                    </div>
                  </div>
                  <span
                    className="presales_panel_total_badge"
                    style={{
                      background: "#ecfdf5",
                      color: "#059669",
                      borderColor: "#a7f3d0",
                    }}
                  >
                    {admissionReportData.admissionSubSources.length} Touchpoints
                  </span>
                </div>

                <div className="presales_panel_body">
                  <div className="presales_subsource_grid">
                    {admissionReportData.admissionSubSources.map(
                      (sub, index) => (
                        <div key={index} className="presales_subsource_row">
                          <div className="presales_subsource_name_box">
                            <span>{sub.name}</span>
                            <span className="presales_subsource_parent_tag">
                              {sub.parent}
                            </span>
                          </div>
                          <span className="presales_subsource_count_pill">
                            {sub.count} Enrolled
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}
