import React, { useState, useEffect, useRef, useMemo } from "react";
import "./styles.css";
import { Button, Col, Divider, Row, Tooltip, Skeleton, Dropdown } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  getBranches,
  getUsersByTheirRole,
  getAdmissionsReportsCounts,
} from "../ApiService/action";
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

      {/* 4. Acquisition Channel Attribution Skeleton (2 Panels) */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <FiLayers style={{ color: "#6366f1" }} size={17} /> Acquisition
          Channel Attribution
        </h2>
        <span className="presales_section_title_badge">Source Analytics</span>
      </div>

      <Row gutter={[16, 16]}>
        {/* Left Panel: Sources */}
        <Col xs={24} lg={12}>
          <div className="presales_panel_card">
            <div className="presales_panel_header">
              <div className="presales_panel_title_box">
                <Skeleton.Avatar
                  active
                  size={32}
                  shape="square"
                  style={{ borderRadius: 8 }}
                />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 110, height: 14 }}
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 180, height: 11 }}
                  />
                </div>
              </div>
              <Skeleton.Button
                active
                size="small"
                style={{ width: 75, height: 20, borderRadius: 12 }}
              />
            </div>

            <div
              className="presales_panel_body"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                paddingTop: 6,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Skeleton.Avatar active size={7} shape="circle" />
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 90, height: 12 }}
                      />
                    </div>
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 50, height: 12 }}
                    />
                  </div>
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: "100%", height: 6, borderRadius: 3 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Right Panel: Sub-Sources */}
        <Col xs={24} lg={12}>
          <div className="presales_panel_card">
            <div className="presales_panel_header">
              <div className="presales_panel_title_box">
                <Skeleton.Avatar
                  active
                  size={32}
                  shape="square"
                  style={{ borderRadius: 8 }}
                />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 130, height: 14 }}
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 200, height: 11 }}
                  />
                </div>
              </div>
              <Skeleton.Button
                active
                size="small"
                style={{ width: 90, height: 20, borderRadius: 12 }}
              />
            </div>

            <div className="presales_panel_body">
              <div className="presales_subsource_grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="presales_subsource_row">
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 110, height: 13 }}
                    />
                    <Skeleton.Button
                      active
                      size="small"
                      style={{ width: 65, height: 20, borderRadius: 12 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default function AdmissionReport({
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
  const [counselorUsers, setCounselorUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [filterBranchOptions, setFilterBranchOptions] = useState([]);

  // Loading, refresh, and export states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Backend API Data State
  const [reportData, setReportData] = useState({
    admission: {
      total_count: 0,
      online_mode: 0,
      classroom_mode: 0,
      student_onboarding: {},
      trainer_coordination: {},
      progress_monitoring: {},
      course_completion: {},
      review_certifications: {},
    },
    sources: {},
    sub_sources: {},
    leadsCount: { all_leads: 0 },
    courseResult: [],
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

  // Fetch report counts from backend API
  const getAdmissionReportsData = async (
    startDate,
    endDate,
    regionId,
    branchId,
    user_ids,
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
      ...(regionId && { region: regionId }),
      ...(branchId && { branch: branchId }),
      ...(user_ids && user_ids.length >= 1
        ? { user_ids: user_ids }
        : { user_ids: [] }),
    };

    try {
      const response = await getAdmissionsReportsCounts(payload);
      console.log("admissions report response", response);
      const apiData = response?.data?.data || response?.data || {};

      if (apiData) {
        setReportData({
          admission: apiData.admission || {},
          sources: apiData.sources || {},
          sub_sources: apiData.sub_sources || {},
          leadsCount: apiData.leadsCount || { all_leads: 0 },
          courseResult: Array.isArray(apiData.courseResult)
            ? apiData.courseResult
            : [],
        });
      }
    } catch (error) {
      console.log("get admissions reports error", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        "Failed to fetch admissions report data";
      CommonMessage("error", errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchAdmissionData = (overrides = {}) => {
    getAdmissionReportsData(
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
          : counselorUsers.map((su) => su.user_id),
    );
  };

  const fetchCounselorUsersData = async (overrides = {}) => {
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

    setIsLoading(true);
    const payload = {
      roles: [roleIds.sale_role_id, roleIds.ra_role_id, roleIds.hr_role_id],
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
      const activeCounselors = downlines.length > 0 ? downlines : users;
      setCounselorUsers(activeCounselors);

      getAdmissionReportsData(
        startDate,
        endDate,
        regionId,
        branchId,
        activeCounselors.map((su) => su.user_id),
      );
    } catch (error) {
      console.log("get counselor users error", error);
      setCounselorUsers([]);
      getAdmissionReportsData(startDate, endDate, regionId, branchId, []);
    }
  };

  // Initial Counselor Load & Data Fetch
  useEffect(() => {
    if (roleIds) {
      fetchCounselorUsersData({
        startDate: summaryStartAndEndDate?.[0] || selectedDates?.[0],
        endDate: summaryStartAndEndDate?.[1] || selectedDates?.[1],
        regionId: null,
        branchId: null,
      });
    }
  }, [roleIds]);

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
    prevSelectedUserIdRef.current = "[]";
    selectedUserIdRef.current = [];
    setSelectedUserId([]);
    fetchCounselorUsersData({
      startDate: PreviousAndCurrentDate[0],
      endDate: PreviousAndCurrentDate[1],
      regionId: null,
      branchId: null,
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
      fetchCounselorUsersData();
    } else {
      fetchAdmissionData({ user_ids: value });
    }
  };

  // ---------------------------------------------------------------------------
  // Dynamic Data Model for Admission Report (Derived from API state)
  // ---------------------------------------------------------------------------
  const admissionReportData = useMemo(() => {
    const admission = reportData?.admission || {};
    const sources = reportData?.sources || {};
    const sub_sources = reportData?.sub_sources || {};
    const leadsCount = reportData?.leadsCount || {};
    const courseResult = reportData?.courseResult || [];

    const totalAdmissions = Number(admission.total_count) || 0;
    const directWalkinAdmissions = Number(admission.classroom_mode) || 0;
    const onlineAdmissions = Number(admission.online_mode) || 0;
    const totalQualifiedLeads = Number(leadsCount.all_leads) || 0;

    // Date diff calculation for daily averages
    const startDate = selectedDates?.[0] ? moment(selectedDates[0]) : null;
    const endDate = selectedDates?.[1] ? moment(selectedDates[1]) : null;
    const daysDiff =
      startDate && endDate && startDate.isValid() && endDate.isValid()
        ? Math.max(1, endDate.diff(startDate, "days") + 1)
        : 1;

    const dailyAverage = (totalAdmissions / daysDiff).toFixed(1);
    const walkinDailyAverage = (directWalkinAdmissions / daysDiff).toFixed(1);
    const onlineDailyAverage = (onlineAdmissions / daysDiff).toFixed(1);

    const netConversionRate =
      totalQualifiedLeads > 0
        ? ((totalAdmissions / totalQualifiedLeads) * 100).toFixed(1)
        : "0.0";

    const calcActivityRate = (count) => {
      if (!totalAdmissions || totalAdmissions <= 0) return "0.0%";
      return `${((count / totalAdmissions) * 100).toFixed(1)}%`;
    };

    // Onboarding Health (Welcome call status / total admissions)
    const welcomeCallCount =
      Number(admission?.student_onboarding?.welcome_call_status) || 0;
    const onboardingHealth =
      totalAdmissions > 0
        ? `${((welcomeCallCount / totalAdmissions) * 100).toFixed(1)}%`
        : "100.0%";

    // Top Courses
    const sortedCourses = [...courseResult].sort(
      (a, b) =>
        (Number(b.customer_count) || 0) - (Number(a.customer_count) || 0),
    );

    const topCourses = sortedCourses.slice(0, 10).map((c, idx) => {
      const count = Number(c.customer_count) || 0;
      const share =
        totalAdmissions > 0
          ? Number(((count / totalAdmissions) * 100).toFixed(1))
          : 0;
      const rank = idx + 1;
      const demand =
        rank === 1
          ? "🔥 Highest Enrolled"
          : rank <= 3
            ? "🔥 High Demand"
            : "▲ Consistent";

      return {
        rank,
        id: c.course_id,
        name: c.course_name || "Unknown Course",
        category: "Technology",
        count,
        share,
        demand,
      };
    });

    // Lifecycle Stages
    const onboarding = admission.student_onboarding || {};
    const coord = admission.trainer_coordination || {};
    const prog = admission.progress_monitoring || {};
    const comp = admission.course_completion || {};
    const cert = admission.review_certifications || {};

    const welcomeCall = Number(onboarding.welcome_call_status) || 0;
    const reqVerified = Number(onboarding.technology_verified) || 0;
    const trainerReq = Number(onboarding.trainer_assignment_request) || 0;
    const trainerFix = Number(onboarding.trainer_fixation_call) || 0;

    const waGroup = Number(coord.whatsapp_group_creation) || 0;
    const hrWelcome = Number(coord.hr_welcome_message) || 0;
    const attendLink = Number(coord.shared_attendance_link) || 0;
    const firstClass = Number(coord.first_class_monitoring) || 0;
    const trainerConfirm = Number(coord.trainer_confirmation) || 0;

    const classProg = Number(prog.class_progress_monitoring) || 0;
    const ticketRaised = Number(prog.ticket_raised) || 0;
    const midFeedback = Number(prog.mid_course_feedback) || 0;
    const lmsAccess = Number(prog.lms_access) || 0;
    const serverReq = Number(prog.is_server_required) || 0;
    const placementHandover = Number(prog.placement_handover) || 0;

    const classCompConfirm = Number(comp.class_completion_confirmation) || 0;
    const trainerCompRep = Number(comp.trainer_completion_report) || 0;
    const studentCompRep = Number(comp.student_completion_report) || 0;

    const googleReview = Number(cert.google_review_collection) || 0;
    const linkedinReview = Number(cert.linkedin_review_collection) || 0;
    const certIssued = Number(cert.course_completion_certificate) || 0;
    const closureCall = Number(cert.course_closure_call) || 0;

    const stage1Activities = [
      {
        name: "Welcome Call",
        count: welcomeCall,
        completedText: "Completed",
        rate: calcActivityRate(welcomeCall),
        color: "#16a34a",
      },
      {
        name: "Requirement Verification",
        count: reqVerified,
        completedText: "Completed",
        rate: calcActivityRate(reqVerified),
        color: "#0284c7",
      },
      {
        name: "Trainer Assignment Request",
        count: trainerReq,
        completedText: "Completed",
        rate: calcActivityRate(trainerReq),
        color: "#8b5cf6",
      },
      {
        name: "Trainer Fixation Call",
        count: trainerFix,
        completedText: "Completed",
        rate: calcActivityRate(trainerFix),
        color: "#ea580c",
      },
    ];
    const stage1Total = stage1Activities.reduce(
      (acc, act) => acc + act.count,
      0,
    );

    const stage2Activities = [
      {
        name: "WhatsApp Group Creation",
        count: waGroup,
        completedText: "Completed",
        rate: calcActivityRate(waGroup),
        color: "#16a34a",
      },
      {
        name: "Welcome Message",
        count: hrWelcome,
        completedText: "Completed",
        rate: calcActivityRate(hrWelcome),
        color: "#4f46e5",
      },
      {
        name: "Teams Link & Attendance",
        count: attendLink,
        completedText: "Shared",
        rate: calcActivityRate(attendLink),
        color: "#0284c7",
      },
      {
        name: "First Class Monitoring",
        count: firstClass,
        completedText: "Monitored",
        rate: calcActivityRate(firstClass),
        color: "#ea580c",
      },
      {
        name: "Trainer Confirmation",
        count: trainerConfirm,
        completedText: "Confirmed",
        rate: calcActivityRate(trainerConfirm),
        color: "#16a34a",
      },
    ];
    const stage2Total = stage2Activities.reduce(
      (acc, act) => acc + act.count,
      0,
    );

    const stage3Activities = [
      {
        name: "Class Progress Monitoring",
        count: classProg,
        completedText: "Active",
        rate: calcActivityRate(classProg),
        color: "#0284c7",
      },
      {
        name: "Student Support / Tickets",
        count: ticketRaised,
        completedText: "Resolved",
        rate: calcActivityRate(ticketRaised),
        color: "#16a34a",
      },
      {
        name: "Mid Course Feedback",
        count: midFeedback,
        completedText: "Collected",
        rate: calcActivityRate(midFeedback),
        color: "#eab308",
      },
      {
        name: "LMS Access",
        count: lmsAccess,
        completedText: "Provisioned",
        rate: calcActivityRate(lmsAccess),
        color: "#8b5cf6",
      },
      {
        name: "Server Provisioning",
        count: serverReq,
        completedText: "Allocated",
        rate: calcActivityRate(serverReq),
        color: "#ea580c",
      },
      {
        name: "Placement Handover",
        count: placementHandover,
        completedText: "Handed Over",
        rate: calcActivityRate(placementHandover),
        color: "#ea580c",
      },
    ];
    const stage3Total = stage3Activities.reduce(
      (acc, act) => acc + act.count,
      0,
    );

    const stage4Activities = [
      {
        name: "Class Completion Confirmed",
        count: classCompConfirm,
        completedText: "Confirmed",
        rate: calcActivityRate(classCompConfirm),
        color: "#16a34a",
      },
      {
        name: "Trainer Completion Report",
        count: trainerCompRep,
        completedText: "Submitted",
        rate: calcActivityRate(trainerCompRep),
        color: "#0284c7",
      },
      {
        name: "Student Completion Report",
        count: studentCompRep,
        completedText: "Submitted",
        rate: calcActivityRate(studentCompRep),
        color: "#8b5cf6",
      },
    ];
    const stage4Total = stage4Activities.reduce(
      (acc, act) => acc + act.count,
      0,
    );

    const stage5Activities = [
      {
        name: "Google Reviews",
        count: googleReview,
        completedText: "Collected",
        rate: calcActivityRate(googleReview),
        color: "#16a34a",
      },
      {
        name: "LinkedIn Reviews",
        count: linkedinReview,
        completedText: "Collected",
        rate: calcActivityRate(linkedinReview),
        color: "#0284c7",
      },
      {
        name: "Certificates Issued",
        count: certIssued,
        completedText: "Issued",
        rate: calcActivityRate(certIssued),
        color: "#8b5cf6",
      },
      {
        name: "Course Closure Call",
        count: closureCall,
        completedText: "Completed",
        rate: calcActivityRate(closureCall),
        color: "#ea580c",
      },
    ];
    const stage5Total = stage5Activities.reduce(
      (acc, act) => acc + act.count,
      0,
    );

    const lifecycleStages = [
      {
        stepNum: 1,
        title: "1. Student Onboarding",
        count: stage1Total,
        rateLabel: totalAdmissions > 0 ? "100% Initiated" : "0% Initiated",
        rateColor: "#059669",
        activities: stage1Activities,
      },
      {
        stepNum: 2,
        title: "2. Trainer Coordination",
        count: stage2Total,
        rateLabel:
          calcActivityRate(trainerConfirm || trainerFix || 0) + " Coordinated",
        rateColor: "#0284c7",
        activities: stage2Activities,
      },
      {
        stepNum: 3,
        title: "3. Progress Monitoring",
        count: stage3Total,
        rateLabel: calcActivityRate(classProg) + " In Training",
        rateColor: "#4f46e5",
        activities: stage3Activities,
      },
      {
        stepNum: 4,
        title: "4. Course Completion",
        count: stage4Total,
        rateLabel: calcActivityRate(classCompConfirm) + " Final Stage",
        rateColor: "#ea580c",
        activities: stage4Activities,
      },
      {
        stepNum: 5,
        title: "★ Certification & Closure",
        count: stage5Total,
        rateLabel:
          calcActivityRate(
            certIssued || Number(cert.is_course_completed) || 0,
          ) + " Graduated",
        rateColor: "#059669",
        isHero: true,
        activities: stage5Activities,
      },
    ];

    // Source share calculation
    const sourceDirect = Number(sources.direct) || 0;
    const sourceWebsite = Number(sources.website) || 0;
    const sourceRef = Number(sources.reference) || 0;
    const sourceSmo = Number(sources.smo) || 0;
    const sourceCall = Number(sources.call) || 0;
    const sourceLiveChat = Number(sources.live_chat) || 0;

    // Raw Sources (Matching PreSalesReport.jsx standard)
    const rawSources = [
      {
        name: "Call",
        count: Number(sources.call) || 0,
        color: "#4f46e5",
      },
      {
        name: "Direct",
        count: Number(sources.direct) || 0,
        color: "#ec4899",
      },
      {
        name: "Website",
        count: Number(sources.website) || 0,
        color: "#10b981",
      },
      {
        name: "SMO",
        count: Number(sources.smo) || 0,
        color: "#8b5cf6",
      },
      {
        name: "Live Chat",
        count: Number(sources.live_chat) || 0,
        color: "#06b6d4",
      },
      {
        name: "Reference",
        count: Number(sources.reference) || 0,
        color: "#f59e0b",
      },
    ];

    const totalSrcCount = rawSources.reduce((acc, curr) => acc + curr.count, 0);

    const leadSources = rawSources
      .map((item) => ({
        ...item,
        share:
          totalSrcCount > 0
            ? Number(((item.count / totalSrcCount) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Sub-sources formatting (Matching PreSalesReport.jsx standard)
    const rawSubSources = [
      {
        name: "IVR",
        parent: "Call",
        count: Number(sub_sources.ivr) || 0,
      },
      {
        name: "Branch",
        parent: "Call",
        count: Number(sub_sources.branch) || 0,
      },
      {
        name: "Enquiry Form",
        parent: "Website",
        count: Number(sub_sources.enquiry_form) || 0,
      },
      {
        name: "WhatsApp",
        parent: "Website",
        count: Number(sub_sources.whatsapp_website) || 0,
      },
      {
        name: "Google Ads",
        parent: "Website",
        count: Number(sub_sources.google_ads) || 0,
      },
      {
        name: "Instant Form",
        parent: "SMO",
        count: Number(sub_sources.instant_form) || 0,
      },
      {
        name: "Call",
        parent: "SMO",
        count: Number(sub_sources.call_sub || sub_sources.call || 0),
      },
      {
        name: "WhatsApp",
        parent: "SMO",
        count: Number(sub_sources.whatsapp_smo) || 0,
      },
    ];

    if (Number(sub_sources.reference) > 0) {
      rawSubSources.push({
        name: "Reference",
        parent: "Reference",
        count: Number(sub_sources.reference) || 0,
      });
    }

    const leadSubSources = rawSubSources.sort((a, b) => b.count - a.count);

    const leadSourcesCount =
      leadSources.filter((s) => s.count > 0).length || leadSources.length;
    const leadSubSourcesCount =
      leadSubSources.filter((s) => s.count > 0).length || leadSubSources.length;

    return {
      totalAdmissions,
      netConversionRate,
      directWalkinAdmissions,
      onlineAdmissions,
      dailyAverage,
      walkinDailyAverage,
      onlineDailyAverage,
      targetConversionRate: 20,
      totalQualifiedLeads,
      onboardingHealth,
      topCourses,
      lifecycleStages,
      leadSources,
      leadSubSources,
      leadSourcesCount,
      leadSubSourcesCount,
      admissionSources: leadSources,
      admissionSubSources: leadSubSources,
    };
  }, [reportData, selectedDates]);

  // Max count for scaling the course comparison bar
  const maxCourseCount = Math.max(
    1,
    ...(admissionReportData?.topCourses?.map((c) => c.count) || [1]),
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
        `${admissionReportData.netConversionRate}% (Daily Avg: ${admissionReportData.dailyAverage}/day)`,
      ]);
      rows.push([
        "Direct / Walk-in Admissions",
        `${admissionReportData.directWalkinAdmissions} (Daily Avg: ${admissionReportData.walkinDailyAverage}/day)`,
      ]);
      rows.push([
        "Online / Remote Admissions",
        `${admissionReportData.onlineAdmissions} (Daily Avg: ${admissionReportData.onlineDailyAverage}/day)`,
      ]);
      rows.push([
        "Overall Daily Average",
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
      rows.push(["4. ACQUISITION CHANNEL ATTRIBUTION (SOURCES)"]);
      rows.push(["Source Channel", "Count", "Share (%)"]);
      (admissionReportData.leadSources || []).forEach((s) => {
        rows.push([s.name, s.count, `${s.share}%`]);
      });
      rows.push([]);

      // 5. Sub-Sources
      rows.push(["5. ACQUISITION SUB-SOURCES ATTRIBUTION"]);
      rows.push(["Sub-Source Name", "Parent Channel", "Count"]);
      (admissionReportData.leadSubSources || []).forEach((sub) => {
        rows.push([sub.name, sub.parent, sub.count]);
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
                label={"Filter by Joining Date"}
                width="100%"
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  fetchAdmissionData({
                    startDate: dates?.[0],
                    endDate: dates?.[1],
                  });
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
                  fetchCounselorUsersData({
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
                  fetchCounselorUsersData({
                    regionId: selectedRegionId,
                    branchId: value,
                  });
                }}
                value={selectedBranchId}
                disableClearable={false}
                disabled={selectedRegionId == 3 ? true : false}
              />
            </Col>
            <Col flex="1 1 0%">
              <CommonMultiSelectField
                height="34px"
                label="Select User"
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
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {admissionReportData.dailyAverage}
                    </strong>
                  </span>
                  <span className="presales_stat_subtext">
                    {admissionReportData.totalAdmissions} of{" "}
                    {admissionReportData.totalQualifiedLeads} leads
                  </span>
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
                  <span className="presales_badge presales_avg_badge">
                    <FiUserCheck size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {admissionReportData.walkinDailyAverage}
                    </strong>
                  </span>
                  <span className="presales_stat_subtext">walk-ins / day</span>
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
                  <span className="presales_badge presales_avg_badge">
                    <FiActivity size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {admissionReportData.onlineDailyAverage}
                    </strong>
                  </span>
                  <span className="presales_stat_subtext">online / day</span>
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
              Onboarding Health: {admissionReportData.onboardingHealth}
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
                                <span className="presales_funnel_subitem_count">
                                  {act.count}
                                </span>
                              </div>
                            </Tooltip>
                          ))}
                        </div>
                      ) : (
                        <>
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
                                    style={{ color: "#047857" }}
                                  >
                                    {act.count}
                                  </span>
                                </div>
                              </Tooltip>
                            ))}
                          </div>

                          <div
                            className="presales_funnel_hero_box"
                            style={{ marginTop: 8 }}
                          >
                            <div className="presales_funnel_hero_tag">
                              <span>🎯 Goal Achievement</span>
                            </div>
                            <Tooltip
                              title={`Overall Graduation: ${stage.rateLabel}`}
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
                                  {stage.rateLabel}
                                </strong>
                              </div>
                            </Tooltip>
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
              {admissionReportData.topCourses.length <= 5
                ? `Showing ${admissionReportData.topCourses.length} Courses`
                : showAllCourses
                  ? `Showing All ${admissionReportData.topCourses.length} Courses`
                  : "Showing Top 5 Courses"}
            </span>
          </div>

          {admissionReportData.topCourses.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "36px 16px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                color: "#64748b",
                marginBottom: 16,
              }}
            >
              No course enrollments found for the selected criteria.
            </div>
          ) : (
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
                            {/* <span className="admission_course_category">
                              {course.category}
                            </span> */}
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
                                  ? "linear-gradient(90deg, #f97316 0%, #ea580c 100%)"
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
          )}

          {admissionReportData.topCourses.length > 5 && (
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
                    Show All {admissionReportData.topCourses.length} Courses (
                    {admissionReportData.topCourses.length - 5} More){" "}
                    <FiChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ====================================================================
              4. Channel & Attribution Breakdown (Sources & Sub-Sources)
              (Exact match with PreSalesReport.jsx standard)
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <FiLayers style={{ color: "#6366f1" }} size={17} /> Acquisition
              Channel Attribution
            </h2>
            <span className="presales_section_title_badge">
              Source & Sub-Source Analytics
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {/* Metric 4: Lead Sources Panel */}
            <Col xs={24} lg={12}>
              <div className="presales_panel_card">
                <div className="presales_panel_header">
                  <div className="presales_panel_title_box">
                    <div
                      className="presales_panel_title_icon"
                      style={{ background: "#eef2ff", color: "#4f46e5" }}
                    >
                      <FiCompass />
                    </div>
                    <div>
                      <h4 className="presales_panel_title">Lead Sources</h4>
                      <p className="presales_panel_subtitle">
                        Distribution across main marketing acquisition channels
                      </p>
                    </div>
                  </div>
                  <span className="presales_panel_total_badge">
                    {admissionReportData.leadSourcesCount} Channels
                  </span>
                </div>

                <div className="presales_panel_body">
                  {admissionReportData.leadSources.map((source, index) => (
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
                            {Number(source.count).toLocaleString("en-IN")}
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

            {/* Metric 5: Lead Sub-Sources Panel */}
            <Col xs={24} lg={12}>
              <div className="presales_panel_card">
                <div className="presales_panel_header">
                  <div className="presales_panel_title_box">
                    <div
                      className="presales_panel_title_icon"
                      style={{ background: "#f0fdf4", color: "#16a34a" }}
                    >
                      <FiLayers />
                    </div>
                    <div>
                      <h4 className="presales_panel_title">Lead Sub-Sources</h4>
                      <p className="presales_panel_subtitle">
                        Granular campaign, creative, and partner level
                        attribution
                      </p>
                    </div>
                  </div>
                  <span
                    className="presales_panel_total_badge"
                    style={{
                      background: "#f0fdf4",
                      color: "#16a34a",
                      borderColor: "#bbf7d0",
                    }}
                  >
                    {admissionReportData.leadSubSourcesCount} Sub-Sources
                  </span>
                </div>

                <div className="presales_panel_body">
                  <div className="presales_subsource_grid">
                    {admissionReportData.leadSubSources.map((sub, index) => (
                      <div key={index} className="presales_subsource_row">
                        <div className="presales_subsource_name_box">
                          <span>{sub.name}</span>
                          <span className="presales_subsource_parent_tag">
                            {sub.parent}
                          </span>
                        </div>
                        <span className="presales_subsource_count_pill">
                          {Number(sub.count).toLocaleString("en-IN")} leads
                        </span>
                      </div>
                    ))}
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
