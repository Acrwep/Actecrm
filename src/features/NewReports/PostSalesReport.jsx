import React, { useState, useEffect, useRef, useMemo } from "react";
import "./styles.css";
import { Button, Col, Divider, Row, Tooltip, Skeleton, Dropdown } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  getBranches,
  getUsersByTheirRole,
  getCustomersReportsCounts,
} from "../ApiService/action";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  FiUsers,
  FiActivity,
  FiArrowRight,
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiTable,
  FiTrendingUp,
} from "react-icons/fi";
import { TbTargetArrow } from "react-icons/tb";
import {
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentCheck,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import moment from "moment";
import { useSelector } from "react-redux";
import CommonSelectField from "../Common/CommonSelectField";

/**
 * Dedicated Skeleton Loader for Post-Sales Report
 */
function PostSalesReportSkeleton() {
  return (
    <div className="presales_skeleton_wrapper">
      {/* 1. Summary Skeleton (4 Cards) */}
      <div className="presales_section_header" style={{ marginTop: 20 }}>
        <h2 className="presales_section_title">
          <HiOutlineClipboardDocumentCheck
            style={{ color: "#4f46e5" }}
            size={19}
          />{" "}
          Post-Sales Executive Summary
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#eef2ff", color: "#4f46e5" }}
        >
          Operations & Retention KPIs
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
                  style={{ width: 110, height: 16 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 60, height: 14 }}
                />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 2. Lifecycle Pipeline Skeleton */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <TbTargetArrow style={{ color: "#4f46e5" }} size={19} /> Student
          Operations & Learning Progression Pipeline
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#eef2ff", color: "#4f46e5" }}
        >
          5 Delivery Milestones
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
                  {[1, 2, 3].map((j) => (
                    <div className="presales_funnel_subitem" key={j}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "65%", height: 12 }}
                      />
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "20%", height: 12 }}
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

export default function PostSalesReport({
  onBack,
  summaryStartAndEndDate = [],
  roleIds,
}) {
  const downlineUsers = useSelector((state) => state.downlineusers) || [];
  const regionOptions = useSelector((state) => state.globalregionslist) || [];

  const prevSelectedUserIdRef = useRef("[]");
  const selectedUserIdRef = useRef([]);
  const reportContentRef = useRef(null);

  // Filter state
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateType, setDateType] = useState("Joining"); // "Joining" or "Updated"
  const [postSaleUsers, setPostSaleUsers] = useState([]);
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
    all_counts: 0,
    form_completed: 0,
    payment_verified: 0,
    student_verified: 0,
    trainer_assigned: 0,
    trainer_rejected: 0,
    trainer_verified: 0,
    trainer_approval_rejected: 0,
    trainer_approved: 0,
    class_scheduled: 0,
    escalated: 0,
    hold: 0,
    passedout_processed: 0,
    course_completed: 0,
    demo_completed: 0,
    videos_given: 0,
    refunded: 0,
    others: 0,
    partially_closed: 0,
    discontinued: 0,
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

  // Initial load
  useEffect(() => {
    if (roleIds) {
      setDateType("Joining");
      fetchPostSaleUsersData({
        startDate: summaryStartAndEndDate?.[0] || selectedDates?.[0],
        endDate: summaryStartAndEndDate?.[1] || selectedDates?.[1],
        regionId: null,
        branchId: null,
        dateType: "Joining",
      });
    }
  }, [roleIds]);

  const fetchPostSaleUsersData = async (overrides = {}) => {
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
    const currentDateType =
      overrides.dateType !== undefined ? overrides.dateType : dateType;

    setIsLoading(true);
    const activeRoles = roleIds
      ? [roleIds.sale_role_id, roleIds.ra_role_id, roleIds.hr_role_id].filter(
          Boolean,
        )
      : [];

    const payload = {
      ...(activeRoles.length > 0 && { roles: activeRoles }),
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      page: 1,
      limit: 1000,
    };

    try {
      const response = await getUsersByTheirRole(payload);
      const users = response?.data?.data || [];
      const downlines = downlineUsers.filter((downline) =>
        users.some((user) => user.user_id === downline.user_id),
      );
      const activeUsers = downlines.length > 0 ? downlines : users;
      setPostSaleUsers(activeUsers);

      // Fetch all customer counts initially without filtering down to individual user_ids
      fetchPostSalesData({
        startDate: startDate,
        endDate: endDate,
        regionId: null,
        branchId: null,
        user_ids: activeUsers.map((su) => su.user_id),
        dateType: currentDateType,
      });
    } catch (error) {
      console.log("get post-sale users error", error);
      setPostSaleUsers([]);
    }
  };

  // Fetch report counts from backend API
  const fetchPostSalesData = (overrides = {}) => {
    getPostSalesData(
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
          : postSaleUsers.map((su) => su.user_id),
      overrides.dateType !== undefined ? overrides.dateType : dateType,
    );
  };

  const getPostSalesData = async (
    startDate,
    endDate,
    regionId,
    branchId,
    user_ids,
    currentDateType = dateType,
  ) => {
    setIsLoading(true);
    const payload = {
      from_date: startDate
        ? moment(startDate).format("YYYY-MM-DD")
        : selectedDates?.[0]
          ? moment(selectedDates[0]).format("YYYY-MM-DD")
          : undefined,
      to_date: endDate
        ? moment(endDate).format("YYYY-MM-DD")
        : selectedDates?.[1]
          ? moment(selectedDates[1]).format("YYYY-MM-DD")
          : undefined,
      date_type: currentDateType,
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      ...(user_ids && user_ids.length >= 1
        ? { user_ids: user_ids }
        : { user_ids: [] }),
    };

    try {
      const response = await getCustomersReportsCounts(payload);
      console.log("post sales report response", response);
      const apiData = response?.data?.data || response?.data || {};

      if (apiData) {
        setReportData({
          all_counts: Number(apiData.all_counts) || 0,
          form_completed: Number(apiData.form_completed) || 0,
          payment_verified: Number(apiData.payment_verified) || 0,
          student_verified: Number(apiData.student_verified) || 0,
          trainer_assigned: Number(apiData.trainer_assigned) || 0,
          trainer_rejected: Number(apiData.trainer_rejected) || 0,
          trainer_verified: Number(apiData.trainer_verified) || 0,
          trainer_approval_rejected:
            Number(apiData.trainer_approval_rejected) || 0,
          trainer_approved: Number(apiData.trainer_approved) || 0,
          class_scheduled: Number(apiData.class_scheduled) || 0,
          escalated: Number(apiData.escalated) || 0,
          hold: Number(apiData.hold) || 0,
          passedout_processed: Number(apiData.passedout_processed) || 0,
          course_completed: Number(apiData.course_completed) || 0,
          demo_completed: Number(apiData.demo_completed) || 0,
          videos_given: Number(apiData.videos_given) || 0,
          refunded: Number(apiData.refunded) || 0,
          others: Number(apiData.others) || 0,
          partially_closed: Number(apiData.partially_closed) || 0,
          discontinued: Number(apiData.discontinued) || 0,
        });
      }
    } catch (error) {
      console.log("get post-sales reports error", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        "Failed to fetch post-sales report data";
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
    setDateType("Joining");
    prevSelectedUserIdRef.current = "[]";
    selectedUserIdRef.current = [];
    setSelectedUserId([]);
    fetchPostSaleUsersData({
      startDate: PreviousAndCurrentDate[0],
      endDate: PreviousAndCurrentDate[1],
      regionId: null,
      branchId: null,
      dateType: "Joining",
    });
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

    if (Array.isArray(value) && value.length <= 0) {
      fetchPostSaleUsersData();
    } else {
      fetchPostSalesData({ user_ids: value });
    }
  };

  const handleDateTypeChange = (newType) => {
    if (newType === dateType) return;
    setDateType(newType);
    fetchPostSalesData({ dateType: newType });
  };

  // ---------------------------------------------------------------------------
  // Derived Analytics Data Model (Strictly using API response values)
  // ---------------------------------------------------------------------------
  const postSaleAnalytics = useMemo(() => {
    const totalCustomers = Number(reportData.all_counts) || 0;
    const formCompleted = Number(reportData.form_completed) || 0;
    const classScheduled = Number(reportData.class_scheduled) || 0;
    const courseCompleted = Number(reportData.course_completed) || 0;

    // Date diff calculation for daily averages
    const startDate = selectedDates?.[0] ? moment(selectedDates[0]) : null;
    const endDate = selectedDates?.[1] ? moment(selectedDates[1]) : null;
    const daysDiff =
      startDate && endDate && startDate.isValid() && endDate.isValid()
        ? Math.max(1, endDate.diff(startDate, "days") + 1)
        : 1;

    const totalCustomersDailyAvg = (totalCustomers / daysDiff).toFixed(1);
    const formCompletedDailyAvg = (formCompleted / daysDiff).toFixed(1);
    const classScheduledDailyAvg = (classScheduled / daysDiff).toFixed(1);
    const courseCompletedDailyAvg = (courseCompleted / daysDiff).toFixed(1);

    const calcRate = (count) => {
      if (!totalCustomers || totalCustomers <= 0) return "0.0%";
      return `${((count / totalCustomers) * 100).toFixed(1)}%`;
    };

    // 5 Lifecycle Stages using ONLY the response fields
    const lifecycleStages = [
      {
        stepNum: 1,
        title: "1. Finance & Verification",
        count: reportData.form_completed,
        rateLabel: `${calcRate(reportData.form_completed)} Forms`,
        rateColor: "#0284c7",
        activities: [
          {
            name: "Form Completed",
            count: reportData.form_completed,
            completedText: "Completed",
            rate: calcRate(reportData.form_completed),
            color: "#0284c7",
          },
          {
            name: "Payment Verified",
            count: reportData.payment_verified,
            completedText: "Verified",
            rate: calcRate(reportData.payment_verified),
            color: "#16a34a",
          },
        ],
      },
      {
        stepNum: 2,
        title: "2. Trainer Coordination",
        count: reportData.trainer_assigned,
        rateLabel: `${calcRate(reportData.trainer_assigned)} Assigned`,
        rateColor: "#8b5cf6",
        activities: [
          {
            name: "Student Verified",
            count: reportData.student_verified,
            completedText: "Verified",
            rate: calcRate(reportData.student_verified),
            color: "#ffa502",
          },
          {
            name: "Trainer Assigned",
            count: reportData.trainer_assigned,
            completedText: "Assigned",
            rate: calcRate(reportData.trainer_assigned),
            color: "#2ed573",
          },
          {
            name: "Trainer Verified",
            count: reportData.trainer_verified,
            completedText: "Approved",
            rate: calcRate(reportData.trainer_verified),
            color: "#1e90ff",
          },
          {
            name: "Trainer Approved",
            count: reportData.trainer_approved,
            completedText: "Class Ready",
            rate: calcRate(reportData.trainer_approved),
            color: "#8e44ad",
          },
        ],
      },
      {
        stepNum: 3,
        title: "3. Training Delivery",
        count: reportData.class_scheduled,
        rateLabel: `${calcRate(reportData.class_scheduled)} Active`,
        rateColor: "#059669",
        activities: [
          {
            name: "Class Scheduled (Class Going)",
            count: reportData.class_scheduled,
            completedText: "In Training",
            rate: calcRate(reportData.class_scheduled),
            color: "#00cec9",
          },
          {
            name: "Demo Completed",
            count: reportData.demo_completed,
            completedText: "Completed",
            rate: calcRate(reportData.demo_completed),
            color: "#0284c7",
          },
          {
            name: "Videos Given",
            count: reportData.videos_given,
            completedText: "Given",
            rate: calcRate(reportData.videos_given),
            color: "#e84393",
          },
        ],
      },
      {
        stepNum: 4,
        title: "4. Passout & Completion",
        count: reportData.course_completed,
        rateLabel: `${calcRate(reportData.course_completed)} Completed`,
        rateColor: "#059669",
        isCompletion: true,
        activities: [
          {
            name: "Passedout Process",
            count: reportData.passedout_processed,
            completedText: "Under Review",
            rate: calcRate(reportData.passedout_processed),
            color: "#fd79a8",
          },
          {
            name: "Course Completed",
            count: reportData.course_completed,
            completedText: "Graduated",
            rate: calcRate(reportData.course_completed),
            color: "#3c9111",
          },
        ],
      },
      {
        stepNum: 5,
        title: "★ Retention & Exceptions",
        count: reportData.others,
        rateLabel: `${calcRate(reportData.others)} Retention Pool`,
        rateColor: "#dc2626",
        isRetention: true,
        activities: [
          {
            name: "Escalated",
            count: reportData.escalated,
            completedText: "Action Required",
            rate: calcRate(reportData.escalated),
            color: "#e11d48",
          },
          {
            name: "Hold",
            count: reportData.hold,
            completedText: "Paused",
            rate: calcRate(reportData.hold),
            color: "#f59e0b",
          },
          {
            name: "Trainer Rejected",
            count: reportData.trainer_rejected,
            completedText: "Reassign",
            rate: calcRate(reportData.trainer_rejected),
            color: "#ea580c",
          },
          {
            name: "Trainer Approval Rejected",
            count: reportData.trainer_approval_rejected,
            completedText: "Rejected",
            rate: calcRate(reportData.trainer_approval_rejected),
            color: "#d97706",
          },
          {
            name: "Refunded",
            count: reportData.refunded,
            completedText: "Processed",
            rate: calcRate(reportData.refunded),
            color: "#dc2626",
          },
          {
            name: "Partially Closed",
            count: reportData.partially_closed,
            completedText: "Dormant",
            rate: calcRate(reportData.partially_closed),
            color: "#64748b",
          },
          {
            name: "Discontinued",
            count: reportData.discontinued,
            completedText: "Churned",
            rate: calcRate(reportData.discontinued),
            color: "#475569",
          },
        ],
      },
    ];

    return {
      totalCustomers,
      totalCustomersDailyAvg,
      formCompletedDailyAvg,
      classScheduledDailyAvg,
      courseCompletedDailyAvg,
      daysDiff,
      lifecycleStages,
      calcRate,
    };
  }, [reportData, selectedDates]);

  // ---------------------------------------------------------------------------
  // PDF Export
  // ---------------------------------------------------------------------------
  const handleDownloadPDF = async () => {
    if (!reportContentRef.current) return;
    setIsExporting(true);
    CommonMessage("info", "Generating high-resolution Post-Sales PDF...");

    try {
      const element = reportContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f8fafc",
        windowWidth: 1400,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const totalPdfHeight = canvasHeight / ratio;

      let heightLeft = totalPdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - totalPdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight);
        heightLeft -= pdfHeight;
      }

      const dateStr = dayjs().format("DD-MM-YYYY");
      pdf.save(`Post_Sales_Report_${dateStr}.pdf`);
      CommonMessage("success", "PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      CommonMessage("error", "Failed to generate PDF. Please try again.");
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
        "ACTE CRM — Post-Sales Operations & Student Lifecycle Report",
      ]);
      rows.push([
        "Filter Period:",
        selectedDates?.[0]
          ? `${moment(selectedDates[0]).format("DD/MM/YYYY")} to ${moment(selectedDates[1]).format("DD/MM/YYYY")}`
          : "All Time",
      ]);
      rows.push(["Cohort Basis:", `${dateType} Date`]);
      rows.push(["Generated At:", moment().format("YYYY-MM-DD HH:mm:ss")]);
      rows.push([]);

      // 1. Executive KPIs
      rows.push(["1. POST-SALES EXECUTIVE KPIS"]);
      rows.push([
        "Metric Name",
        "Volume Count",
        "Daily Average",
        "Progression Rate",
      ]);
      rows.push([
        dateType === "Joining" ? "Total Customers" : "Total Updated Customers",
        reportData.all_counts,
        `${postSaleAnalytics.totalCustomersDailyAvg} / day`,
        "100.0%",
      ]);
      rows.push([
        "Form Completed (Awaiting Finance)",
        reportData.form_completed,
        `${postSaleAnalytics.formCompletedDailyAvg} / day`,
        postSaleAnalytics.calcRate(reportData.form_completed),
      ]);
      rows.push([
        "Class Scheduled (Class Going)",
        reportData.class_scheduled,
        `${postSaleAnalytics.classScheduledDailyAvg} / day`,
        postSaleAnalytics.calcRate(reportData.class_scheduled),
      ]);
      rows.push([
        "Course Completed",
        reportData.course_completed,
        `${postSaleAnalytics.courseCompletedDailyAvg} / day`,
        postSaleAnalytics.calcRate(reportData.course_completed),
      ]);
      rows.push([]);

      // 2. Lifecycle Stages (Main Overview)
      rows.push(["2. OPERATIONAL LIFECYCLE (STAGE OVERVIEW)"]);
      rows.push([
        "Stage Name",
        "Stage Volume Count",
        "Status / Progression Rate",
      ]);
      postSaleAnalytics.lifecycleStages.forEach((stage) => {
        rows.push([stage.title, stage.count, stage.rateLabel]);
      });
      rows.push([]);

      // 3. Lifecycle Activities Detailed Breakdown
      rows.push(["3. LIFECYCLE ACTIVITIES DETAILED BREAKDOWN"]);
      rows.push(["Stage", "Status Name", "Volume Count", "Cohort Share (%)"]);
      postSaleAnalytics.lifecycleStages.forEach((stage) => {
        stage.activities.forEach((act) => {
          rows.push([stage.title, act.name, act.count, act.rate]);
        });
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Post-Sales Report");
      const dateStr = dayjs().format("DD-MM-YYYY");
      XLSX.writeFile(workbook, `Post_Sales_Report_${dateStr}.csv`);
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
              High resolution report document
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
              Spreadsheet data export
            </span>
          </div>
        </div>
      ),
      onClick: handleDownloadCSV,
    },
  ];

  return (
    <div className="presales_report_wrapper" ref={reportContentRef}>
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
          <div className="postsales_header_icon_box">
            <HiOutlineClipboardDocumentCheck />
          </div>
          <div>
            <h1 className="presales_header_title">Post-Sales Report</h1>
            <p className="presales_header_subtitle">
              End-to-end customer lifecycle, trainer matching pipeline, class
              sessions, passouts, and retention monitoring
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
                  <RedoOutlined spin style={{ color: "#4f46e5" }} />
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
          2. Filters Row (Cohort Basis, Date Range, Region, Branch, User)
          ==================================================================== */}
      <Row gutter={[12, 8]} style={{ marginTop: "0px" }}>
        <Col xs={22}>
          <Row gutter={12} align="middle">
            {/* Cohort Basis Toggle */}
            <Col xs={24} sm={24} md={8} lg={5} xl={5}>
              <div className="postsales_datetype_box">
                <div className="postsales_datetype_toggle">
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${dateType === "Joining" ? "active" : ""}`}
                    onClick={() => handleDateTypeChange("Joining")}
                  >
                    Joining Date
                  </button>
                  <button
                    type="button"
                    className={`postsales_toggle_btn ${dateType === "Updated" ? "active" : ""}`}
                    onClick={() => handleDateTypeChange("Updated")}
                  >
                    Updated Date
                  </button>
                </div>
              </div>
            </Col>

            {/* Date Picker */}
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <CommonMuiCustomDatePicker
                label={
                  dateType === "Updated"
                    ? "Filter by Status Updated Date"
                    : "Filter by Joining Date"
                }
                width="100%"
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  fetchPostSalesData({
                    startDate: dates?.[0],
                    endDate: dates?.[1],
                  });
                }}
              />
            </Col>

            {/* Region Select */}
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
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
                  fetchPostSaleUsersData({
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
            <Col xs={24} sm={12} md={12} lg={4} xl={4}>
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
                  fetchPostSaleUsersData({
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
            <Col xs={24} sm={12} md={12} lg={5} xl={5}>
              <CommonMultiSelectField
                height="34px"
                label="Select User"
                labelMarginTop="1px"
                labelFontSize="11px"
                width="100%"
                options={postSaleUsers}
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
        <PostSalesReportSkeleton />
      ) : (
        <>
          {/* ----------------------------------------------------------------
              SECTION 1: Post-Sales Executive KPIs (Matching Admission Summary design)
              ---------------------------------------------------------------- */}
          <div className="presales_section_header" style={{ marginTop: 20 }}>
            <h2 className="presales_section_title">
              <HiOutlineClipboardDocumentCheck
                style={{ color: "#4f46e5" }}
                size={20}
              />{" "}
              Post-Sales Executive Summary
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#eef2ff", color: "#4f46e5" }}
            >
              Operations & Retention KPIs
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {/* Card 1: Total Enrolled Customers */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_indigo">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">
                      {dateType === "Joining"
                        ? "Total Customers"
                        : "Total Updated Customers"}
                    </p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#4f46e5" }}
                    >
                      {reportData.all_counts}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiUsers size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <HiOutlineSparkles size={13} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {postSaleAnalytics.totalCustomersDailyAvg}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="customers / day"
                  >
                    customers / day
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 2: Form Completed (Awaiting Finance) */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_sky">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Form Completed</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#0284c7" }}
                    >
                      {reportData.form_completed}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiFileText size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiTrendingUp size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {postSaleAnalytics.formCompletedDailyAvg}
                    </strong>
                  </span>
                  <span className="presales_stat_subtext" title="forms / day">
                    forms / day
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 3: Active Training (Class Going) */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_emerald">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Class Scheduled</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#059669" }}
                    >
                      {reportData.class_scheduled}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiActivity size={18} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiActivity size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {postSaleAnalytics.classScheduledDailyAvg}
                    </strong>
                  </span>
                  <span className="presales_stat_subtext" title="classes / day">
                    classes / day
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 4: Course Completed */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_amber">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Course Completed</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#d97706" }}
                    >
                      {reportData.course_completed}
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
                      {postSaleAnalytics.courseCompletedDailyAvg}
                    </strong>
                  </span>
                  <span
                    className="presales_stat_subtext"
                    title="graduates / day"
                  >
                    graduates / day
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          {/* ----------------------------------------------------------------
              SECTION 2: Student Operations & Learning Progression Pipeline
              ---------------------------------------------------------------- */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <TbTargetArrow style={{ color: "#4f46e5" }} size={19} /> Student
              Operations & Learning Progression Pipeline
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#eef2ff", color: "#4f46e5" }}
            >
              5 Key Delivery Milestones
            </span>
          </div>

          <div className="presales_funnel_container">
            <div className="presales_funnel_steps">
              {postSaleAnalytics.lifecycleStages.map((stage, idx) => {
                const isCompletion = stage.isCompletion;
                const isRetention = stage.isRetention;
                const stepClass = isCompletion
                  ? "completion_step"
                  : isRetention
                    ? "retention_step"
                    : "";

                const titleColor = isCompletion
                  ? "#047857"
                  : isRetention
                    ? "#dc2626"
                    : "#64748b";

                const countColor = isCompletion
                  ? "#047857"
                  : isRetention
                    ? "#dc2626"
                    : "#0f172a";

                return (
                  <React.Fragment key={stage.stepNum}>
                    <div className={`presales_funnel_step ${stepClass}`}>
                      <div className="presales_funnel_step_header">
                        <p
                          className="presales_funnel_step_label"
                          style={{ color: titleColor }}
                        >
                          {stage.title}
                        </p>
                        <div className="presales_funnel_count_row">
                          <span
                            className="presales_funnel_step_count"
                            style={{ color: countColor }}
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

                      {/* Activities Subitems */}
                      <div className="presales_funnel_subitems">
                        {stage.activities.map((act) => (
                          <Tooltip
                            key={act.name}
                            title={
                              <span>
                                <span
                                  style={{
                                    color: "#727272",
                                    fontWeight: 500,
                                  }}
                                >
                                  {act.name}:
                                </span>{" "}
                                <span
                                  style={{ color: "#333", fontWeight: 600 }}
                                >
                                  {act.count}
                                </span>{" "}
                                <span
                                  style={{ color: "#333", fontWeight: 500 }}
                                >
                                  {act.completedText || ""}
                                </span>
                              </span>
                            }
                            placement="top"
                            mouseEnterDelay={0.1}
                            color="#fff"
                            styles={{
                              body: {
                                backgroundColor: "#fff",
                                color: "#333",
                                fontWeight: 600,
                                fontSize: "12px",
                              },
                            }}
                          >
                            <div
                              className="presales_funnel_subitem"
                              title={`${act.name}: ${act.count} ${act.completedText}`}
                            >
                              <span className="presales_funnel_subitem_name">
                                <span
                                  className="presales_subitem_dot"
                                  style={{ background: act.color }}
                                />
                                <span className="presales_subitem_text">
                                  {act.name}
                                </span>
                              </span>
                              <span
                                className="presales_funnel_subitem_count"
                                style={{
                                  color: isCompletion
                                    ? "#047857"
                                    : isRetention
                                      ? "#dc2626"
                                      : undefined,
                                }}
                              >
                                {act.count}
                              </span>
                            </div>
                          </Tooltip>
                        ))}
                      </div>

                      {/* Goal Achievement Badge on Passout & Completion */}
                      {isCompletion && (
                        <div
                          className="presales_funnel_hero_box"
                          style={{ marginTop: 8 }}
                        >
                          <div className="presales_funnel_hero_tag">
                            <span>🎯 Goal Achievement</span>
                          </div>
                          <Tooltip
                            title={`Overall Graduation: ${postSaleAnalytics.calcRate(reportData.course_completed)} Graduated`}
                            placement="top"
                            mouseEnterDelay={0.1}
                            color="#fff"
                            styles={{
                              body: {
                                backgroundColor: "#fff",
                                color: "#333",
                                fontWeight: 600,
                                fontSize: "12px",
                              },
                            }}
                          >
                            <div className="presales_funnel_hero_stat">
                              <span className="presales_funnel_hero_stat_label">
                                Graduation
                              </span>
                              <strong className="presales_funnel_hero_stat_val">
                                {postSaleAnalytics.calcRate(
                                  reportData.course_completed,
                                )}
                              </strong>
                            </div>
                          </Tooltip>
                        </div>
                      )}
                    </div>

                    {idx < postSaleAnalytics.lifecycleStages.length - 1 && (
                      <FiArrowRight className="presales_funnel_arrow" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
