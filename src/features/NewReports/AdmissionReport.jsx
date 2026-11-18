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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  FiActivity,
  FiUserCheck,
  FiLayers,
  FiCompass,
  FiArrowLeft,
  FiTrendingUp,
  FiDownload,
  FiFileText,
  FiTable,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { TbTargetArrow } from "react-icons/tb";
import {
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineTrophy,
} from "react-icons/hi2";
import {
  getCurrentandPreviousweekDate,
  getFormattedDateString,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import moment from "moment";
import { useSelector } from "react-redux";
import CommonSelectField from "../Common/CommonSelectField";

// Unified progress bar color for all user progress bars across all admission cards
const USER_PROGRESS_BAR_COLOR = "rgb(2, 132, 199)";

// Default / Initial API Mock Data matching the new backend API structure
const INITIAL_ADMISSION_REPORT_DATA = {
  admission: {
    total_count: 0,
    online_mode: 0,
    classroom_mode: 0,
  },
  sources: {
    direct: 0,
    website: 0,
    reference: 0,
    smo: 0,
    call: 0,
    live_chat: 0,
  },
  sub_sources: {
    branch: 0,
    instant_form: 0,
    reference: 0,
    whatsapp_smo: 0,
    enquiry_form: 0,
    ivr: 0,
    whatsapp_website: 0,
    google_ads: 0,
  },
  leadsCount: {
    all_leads: 0,
  },
  courseResult: [],
  companies_top_10_courses: [],
  region_branches_usersCounts: [],
};

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

      {/* 2. Regional & User Admission Summary Skeleton */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <TbTargetArrow style={{ color: "#059669" }} size={19} /> Admission
          Summary & Regional Distribution
        </h2>
        <span
          className="presales_section_title_badge"
          style={{ background: "#ecfdf5", color: "#059669" }}
        >
          Overall & 3 Regional Divisions
        </span>
      </div>

      <div className="presales_funnel_container">
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <div
                className="presales_funnel_step"
                style={{
                  height: 310,
                  padding: "14px 12px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  className="presales_funnel_step_header"
                  style={{ flexShrink: 0 }}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: "70%", height: 13 }}
                  />
                  <div
                    className="presales_funnel_count_row"
                    style={{ marginTop: 6 }}
                  >
                    <Skeleton.Input active style={{ width: 45, height: 22 }} />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: i === 1 ? 36 : 75, height: 12 }}
                    />
                  </div>
                </div>

                <div
                  className="presales_funnel_subitems"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden",
                    marginTop: 8,
                    borderTop: "1px solid #eef2f6",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((u) => (
                    <div
                      className="presales_funnel_subitem"
                      key={u}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        padding: "5px 8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <span className="presales_funnel_subitem_name">
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: 14, height: 12, marginRight: 2 }}
                          />
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "65%", height: 12 }}
                          />
                        </span>
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: 22, height: 12 }}
                        />
                      </div>
                      <div
                        style={{
                          height: 3,
                          background: "#f1f5f9",
                          borderRadius: 2,
                          width: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: "80%", height: 3, borderRadius: 2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          ))}
        </Row>
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

  // Helper to determine role-based region from loginUserDetails
  const getRoleBasedRegionConfig = () => {
    try {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = getLoginUserDetails
        ? JSON.parse(getLoginUserDetails)
        : null;
      const userId = convertAsJson?.user_id
        ? String(convertAsJson.user_id).toUpperCase()
        : "";

      if (userId.startsWith("HUB")) {
        return { regionId: 3, disabled: true };
      } else if (userId.startsWith("CHN")) {
        return { regionId: 1, disabled: true };
      } else if (userId.startsWith("BNG")) {
        return { regionId: 2, disabled: true };
      }
    } catch (e) {
      console.error("Error reading loginUserDetails:", e);
    }
    return { regionId: null, disabled: false };
  };

  const roleRegionConfig = getRoleBasedRegionConfig();

  // Filter state
  const [selectedDates, setSelectedDates] = useState([]);
  const [counselorUsers, setCounselorUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(
    roleRegionConfig.regionId,
  );
  const [isRegionDisabled, setIsRegionDisabled] = useState(
    roleRegionConfig.disabled,
  );
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [filterBranchOptions, setFilterBranchOptions] = useState([]);
  const [selectedModeOfTraining, setSelectedModeOfTraining] = useState(null);

  // Loading, refresh, and export states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [courseFilterType, setCourseFilterType] = useState("courseResult"); // "courseResult" | "company"

  // Backend API Data State (Initialized with latest API response structure)
  const [reportData, setReportData] = useState(INITIAL_ADMISSION_REPORT_DATA);

  // Synchronize ref with selectedUserId
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  // Initial Date Setup and Role-Based Region Selection
  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = getLoginUserDetails
      ? JSON.parse(getLoginUserDetails)
      : null;

    // Preserve existing date selection logic using summaryStartAndEndDate
    if (summaryStartAndEndDate && summaryStartAndEndDate.length === 2) {
      setSelectedDates(summaryStartAndEndDate);
    } else {
      const dates = getCurrentandPreviousweekDate();
      setSelectedDates(dates);
    }

    // Role-based region selection using convertAsJson.user_id
    const userId = convertAsJson?.user_id
      ? String(convertAsJson.user_id).toUpperCase()
      : "";

    if (userId.startsWith("HUB")) {
      setSelectedRegionId(3);
      setIsRegionDisabled(true);
      getBranchesData(3);
    } else if (userId.startsWith("CHN")) {
      setSelectedRegionId(1);
      setIsRegionDisabled(true);
      getBranchesData(1);
    } else if (userId.startsWith("BNG")) {
      setSelectedRegionId(2);
      setIsRegionDisabled(true);
      getBranchesData(2);
    } else {
      setSelectedRegionId(null);
      setIsRegionDisabled(false);
    }
  }, [summaryStartAndEndDate]);

  // Initial Counselor Load & Data Fetch
  useEffect(() => {
    if (roleIds) {
      const roleConfig = getRoleBasedRegionConfig();
      fetchCounselorUsersData({
        startDate: summaryStartAndEndDate?.[0] || selectedDates?.[0],
        endDate: summaryStartAndEndDate?.[1] || selectedDates?.[1],
        mode_of_training: null,
        regionId: roleConfig.regionId,
        branchId: null,
      });
    }
  }, [roleIds]);

  const fetchCounselorUsersData = async (overrides = {}) => {
    const regionId =
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId;
    const branchId =
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId;
    const modeOfClass =
      overrides.mode_of_training !== undefined
        ? overrides.mode_of_training
        : selectedModeOfTraining;
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
      roles: [roleIds.sale_role_id],
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsersByTheirRole(payload);
      console.log("user by their role response", response);
      const users = response?.data?.data || [];
      const downlines = downlineUsers.filter((downline) =>
        users.some((user) => user.user_id === downline.user_id),
      );
      const activeCounselors = downlines.length > 0 ? downlines : users;
      setCounselorUsers(activeCounselors);
      console.log("admission sale users", activeCounselors);

      getAdmissionReportsData(
        startDate,
        endDate,
        modeOfClass,
        regionId,
        branchId,
        activeCounselors.map((su) => su.user_id),
      );
    } catch (error) {
      console.log("get counselor users error", error);
      setCounselorUsers([]);
      getAdmissionReportsData(
        startDate,
        endDate,
        modeOfClass,
        regionId,
        branchId,
        [],
      );
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
      overrides.mode_of_training !== undefined
        ? overrides.mode_of_training
        : selectedModeOfTraining,
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId,
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId,
      overrides.user_ids !== undefined
        ? overrides.user_ids
        : (selectedUserIdRef.current || selectedUserId).length >= 1
          ? selectedUserIdRef.current || selectedUserId
          : counselorUsers.map((su) => su.user_id),
    );
  };

  // Fetch report counts from backend API
  const getAdmissionReportsData = async (
    startDate,
    endDate,
    mode_of_training,
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
      ...(mode_of_training && { mode_of_class: mode_of_training }),
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
          companies_top_10_courses: Array.isArray(
            apiData.companies_top_10_courses,
          )
            ? apiData.companies_top_10_courses
            : [],
          region_branches_usersCounts: Array.isArray(
            apiData.region_branches_usersCounts,
          )
            ? apiData.region_branches_usersCounts
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

    const roleConfig = getRoleBasedRegionConfig();
    setSelectedRegionId(roleConfig.regionId);
    setSelectedBranchId(null);
    setSelectedModeOfTraining(null);
    prevSelectedUserIdRef.current = "[]";
    selectedUserIdRef.current = [];
    setSelectedUserId([]);

    if (roleConfig.regionId) {
      getBranchesData(roleConfig.regionId);
    } else {
      setFilterBranchOptions([]);
    }

    fetchCounselorUsersData({
      startDate: PreviousAndCurrentDate[0],
      endDate: PreviousAndCurrentDate[1],
      mode_of_training: null,
      regionId: roleConfig.regionId,
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

    // Top Courses (Filtered or Company-Wide based on courseFilterType)
    const activeCoursesRaw =
      courseFilterType === "company"
        ? reportData?.companies_top_10_courses || []
        : reportData?.courseResult || [];

    const sortedCourses = [...activeCoursesRaw].sort(
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
        id: c.course_id || idx,
        name: c.course_name || "Unknown Course",
        category: "Technology",
        count,
        share,
        demand,
      };
    });

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
      totalQualifiedLeads,
      topCourses,
      leadSources,
      leadSubSources,
      leadSourcesCount,
      leadSubSourcesCount,
    };
  }, [reportData, selectedDates, courseFilterType]);

  // Max count for scaling the course comparison bar
  const maxCourseCount = Math.max(
    1,
    ...(admissionReportData?.topCourses?.map((c) => c.count) || [1]),
  );

  // ---------------------------------------------------------------------------
  // Dynamic Regional / Branch Cards Data Model
  // - Initial render: 1. OVERALL (all users with view_user_id - user_name) + Regions
  // - Single region chosen: 1. OVERALL (region total) + that region's branches
  // ---------------------------------------------------------------------------
  const regionalCardsData = useMemo(() => {
    const rawRegions = reportData?.region_branches_usersCounts;
    const apiRegions =
      Array.isArray(rawRegions) && rawRegions.length > 0
        ? rawRegions
        : INITIAL_ADMISSION_REPORT_DATA.region_branches_usersCounts;

    const REGION_PALETTE = [
      "#0284c7", // Sky Blue
      "#4f46e5", // Indigo
      "#ea580c", // Orange
      "#10b981", // Emerald
      "#ec4899", // Pink
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#f59e0b", // Amber
    ];

    const isSingleRegionChosen = Boolean(
      selectedRegionId ||
      (apiRegions.length === 1 && selectedRegionId !== null),
    );

    if (!isSingleRegionChosen) {
      // -----------------------------------------------------------------------
      // Case 1: Initial Render / All Regions View
      // Show 1. OVERALL (all users across all regions) + Each Region as Card 2, 3, 4...
      // -----------------------------------------------------------------------
      const allUsersMap = {};
      let calculatedTotal = 0;

      apiRegions.forEach((reg) => {
        calculatedTotal += Number(reg.total_count) || 0;
        (reg.branches || []).forEach((br) => {
          (br.users || []).forEach((u) => {
            const key = u.user_id || u.view_user_id || u.user_name;
            const count = Number(u.customer_count) || 0;
            const displayName = u.view_user_id
              ? `${u.view_user_id} - ${u.user_name}`
              : u.user_name;

            if (!allUsersMap[key]) {
              allUsersMap[key] = {
                id: key,
                name: displayName,
                count: count,
              };
            } else {
              allUsersMap[key].count += count;
            }
          });
        });
      });

      const overallTotal =
        Number(reportData?.admission?.total_count) || calculatedTotal || 1;

      const overallUsers = Object.values(allUsersMap).sort(
        (a, b) => b.count - a.count,
      );

      const cards = [
        {
          id: "overall",
          title: "1. OVERALL",
          totalAdmissions: overallTotal,
          rateLabel: "TOTAL",
          color: "#059669",
          users: overallUsers,
        },
      ];

      // Desired regional card order: HUB, Chennai, Bangalore
      const PREFERRED_REGION_ORDER = ["hub", "chennai", "bangalore"];
      const sortedRegions = [...apiRegions].sort((a, b) => {
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
        const regUsersMap = {};
        (reg.branches || []).forEach((br) => {
          (br.users || []).forEach((u) => {
            const key = u.user_id || u.view_user_id || u.user_name;
            const count = Number(u.customer_count) || 0;
            const displayName = u.view_user_id
              ? `${u.view_user_id} - ${u.user_name}`
              : u.user_name;

            if (!regUsersMap[key]) {
              regUsersMap[key] = {
                id: key,
                name: displayName,
                count: count,
              };
            } else {
              regUsersMap[key].count += count;
            }
          });
        });

        const regUsers = Object.values(regUsersMap).sort(
          (a, b) => b.count - a.count,
        );

        const regCount = Number(reg.total_count) || 0;
        const pct =
          overallTotal > 0
            ? ((regCount / overallTotal) * 100).toFixed(1)
            : "0.0";

        cards.push({
          id: `region-${reg.region_id || idx}`,
          title: `${idx + 2}. ${String(reg.region || "").toUpperCase()}`,
          totalAdmissions: regCount,
          rateLabel: `${pct}% In ${reg.region}`,
          color: REGION_PALETTE[idx % REGION_PALETTE.length],
          users: regUsers,
        });
      });

      return cards;
    } else {
      // -----------------------------------------------------------------------
      // Case 2: One Region Chosen
      // Show 1. OVERALL (for that region) + All branches of that region as separate cards
      // -----------------------------------------------------------------------
      const selectedReg =
        apiRegions.find(
          (r) =>
            String(r.region_id) === String(selectedRegionId) ||
            String(r.region).toLowerCase() ===
              String(selectedRegionId).toLowerCase(),
        ) || apiRegions[0];

      if (!selectedReg) return [];

      const regTotal = Number(selectedReg.total_count) || 0;

      // Collect all users in this region across all branches
      const regAllUsersMap = {};
      (selectedReg.branches || []).forEach((br) => {
        (br.users || []).forEach((u) => {
          const key = u.user_id || u.view_user_id || u.user_name;
          const count = Number(u.customer_count) || 0;
          const displayName = u.view_user_id
            ? `${u.view_user_id} - ${u.user_name}`
            : u.user_name;

          if (!regAllUsersMap[key]) {
            regAllUsersMap[key] = {
              id: key,
              name: displayName,
              count: count,
            };
          } else {
            regAllUsersMap[key].count += count;
          }
        });
      });

      const overallRegUsers = Object.values(regAllUsersMap).sort(
        (a, b) => b.count - a.count,
      );

      const cards = [
        {
          id: `overall-${selectedReg.region_id || "sel"}`,
          title: "1. OVERALL",
          totalAdmissions: regTotal,
          rateLabel: "TOTAL",
          color: "#059669",
          users: overallRegUsers,
        },
      ];

      // Branch cards
      const branchesToDisplay = selectedBranchId
        ? (selectedReg.branches || []).filter(
            (b) => String(b.branch_id) === String(selectedBranchId),
          )
        : selectedReg.branches || [];

      branchesToDisplay.forEach((br, bIdx) => {
        const brUsers = (br.users || [])
          .map((u) => ({
            id: u.user_id || u.view_user_id || u.user_name,
            name: u.view_user_id
              ? `${u.view_user_id} - ${u.user_name}`
              : u.user_name,
            count: Number(u.customer_count) || 0,
          }))
          .sort((a, b) => b.count - a.count);

        const brCount = Number(br.total_count) || 0;
        const pct =
          regTotal > 0 ? ((brCount / regTotal) * 100).toFixed(1) : "0.0";

        cards.push({
          id: `branch-${br.branch_id || bIdx}`,
          title: `${bIdx + 2}. ${String(br.branch_name || "").toUpperCase()}`,
          totalAdmissions: brCount,
          rateLabel: `${pct}% In ${br.branch_name}`,
          color: REGION_PALETTE[bIdx % REGION_PALETTE.length],
          users: brUsers,
        });
      });

      return cards;
    }
  }, [reportData, selectedRegionId, selectedBranchId]);

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

      const filename = `Admissions_Report_${getFormattedDateString(selectedDates[0], selectedDates[1])}.pdf`;
      pdf.save(filename);

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

      // 3. Regional & User-Wise Admission Summary
      rows.push(["3. REGIONAL & USER-WISE ADMISSION SUMMARY"]);
      rows.push([
        "Card Title",
        "Total Admissions",
        "Counsellor / User",
        "User Admissions",
      ]);
      regionalCardsData.forEach((card) => {
        (card.users || []).forEach((u) => {
          rows.push([card.title, card.totalAdmissions, u.name, u.count]);
        });
      });
      rows.push([]);

      // 5. Sources
      rows.push(["5. ACQUISITION CHANNEL ATTRIBUTION (SOURCES)"]);
      rows.push(["Source Channel", "Count", "Share (%)"]);
      (admissionReportData.leadSources || []).forEach((s) => {
        rows.push([s.name, s.count, `${s.share}%`]);
      });
      rows.push([]);

      // 6. Sub-Sources
      rows.push(["6. ACQUISITION SUB-SOURCES ATTRIBUTION"]);
      rows.push(["Sub-Source Name", "Parent Channel", "Count"]);
      (admissionReportData.leadSubSources || []).forEach((sub) => {
        rows.push([sub.name, sub.parent, sub.count]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Admissions Report");
      XLSX.writeFile(
        workbook,
        `Admissions_Report_${getFormattedDateString(selectedDates[0], selectedDates[1])}.csv`,
      );
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
        <Col xs={24} sm={24} md={24} lg={22}>
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

            <Col flex={downlineUsers.length < 2 ? "1.1 1 0%" : "1 1 0%"}>
              <CommonSelectField
                height="33px"
                label="Select Mode Of Training"
                labelMarginTop="0px"
                labelFontSize="10.5px"
                options={[
                  { id: "Online", name: " Online" },
                  { id: "Classroom", name: " Classroom" },
                ]}
                width="100%"
                onChange={(e) => {
                  setSelectedModeOfTraining(e.target.value);
                  fetchAdmissionData({
                    mode_of_training: e.target.value,
                  });
                }}
                value={selectedModeOfTraining}
              />
            </Col>

            <Col flex="1 1 0%">
              {downlineUsers.length < 2 ? null : (
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
                  disableClearable={isRegionDisabled ? true : false}
                  disabled={isRegionDisabled}
                />
              )}
            </Col>
            <Col flex="1 1 0%">
              {downlineUsers.length < 2 ? null : (
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
              )}
            </Col>
            <Col flex="1 1 0%">
              {downlineUsers.length < 2 ? null : (
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
              )}
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
                    <p className="presales_stat_label">Classroom Training</p>
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
                  <span className="presales_stat_subtext">classroom / day</span>
                </div>
              </div>
            </Col>

            {/* Card 4: Online / Remote Admissions */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_amber">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Online Training</p>
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
              2. Admission Summary & Regional / Branch Distribution
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <TbTargetArrow style={{ color: "#059669" }} size={19} />{" "}
              {selectedRegionId
                ? "Branch-Wise Admission Summary"
                : "Admission Summary & Regional Distribution"}
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#ecfdf5", color: "#059669" }}
            >
              {selectedRegionId
                ? "Overall & Branch Divisions"
                : "Overall & Regional Divisions"}
            </span>
          </div>

          <div className="presales_funnel_container">
            <Row gutter={[16, 16]}>
              {regionalCardsData.map((card) => {
                const maxCount = card.users?.[0]?.count || 1;
                const cardColor = card.color || "#059669";

                return (
                  <Col xs={24} sm={12} lg={6} key={card.id}>
                    <div
                      className="presales_funnel_step"
                      style={{
                        height: 310,
                        padding: "14px 12px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        className="presales_funnel_step_header"
                        style={{ flexShrink: 0 }}
                      >
                        <p
                          className="presales_funnel_step_label"
                          title={card.title}
                        >
                          {card.title}
                        </p>
                        <div className="presales_funnel_count_row">
                          <span className="presales_funnel_step_count">
                            {Number(card.totalAdmissions).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                          {card.id.startsWith("overall") ? (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "#64748b",
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                              }}
                            >
                              TOTAL
                            </span>
                          ) : (
                            <span
                              className="presales_funnel_step_rate"
                              style={{
                                color: cardColor,
                                fontWeight: 700,
                                fontSize: "10.5px",
                              }}
                            >
                              {card.rateLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="presales_funnel_subitems admission_subitems_scroll"
                        style={{
                          flex: 1,
                          minHeight: 0,
                          overflowY: "auto",
                          paddingRight: 4,
                          marginTop: 8,
                          borderTop: "1px solid #eef2f6",
                        }}
                      >
                        {card.users.length === 0 ? (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "24px 8px",
                              fontSize: "11px",
                              color: "#94a3b8",
                            }}
                          >
                            No user admissions recorded
                          </div>
                        ) : (
                          card.users.map((user, idx) => {
                            const percentOfMax = Math.min(
                              100,
                              Math.round((user.count / maxCount) * 100),
                            );

                            return (
                              <div
                                className="presales_funnel_subitem"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                  padding: "5px 8px",
                                }}
                                title={`${user.name}: ${user.count} Admissions`}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                  }}
                                >
                                  <span className="presales_funnel_subitem_name">
                                    <span
                                      className="presales_subitem_sno"
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        color: "#64748b",
                                        minWidth: 10,
                                        flexShrink: 0,
                                        lineHeight: "14px",
                                      }}
                                    >
                                      {idx + 1}.
                                    </span>
                                    <span className="presales_subitem_text">
                                      {user.name}
                                    </span>
                                  </span>
                                  <span className="presales_funnel_subitem_count">
                                    {user.count}
                                  </span>
                                </div>

                                {/* Progress Bar Track & Fill */}
                                <div
                                  style={{
                                    height: 3,
                                    background: "#f1f5f9",
                                    borderRadius: 999,
                                    overflow: "hidden",
                                    width: "100%",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${percentOfMax}%`,
                                      background: USER_PROGRESS_BAR_COLOR,
                                      borderRadius: 999,
                                      transition: "width 0.3s ease",
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* ====================================================================
              3. Top 10 Best-Selling Courses (Clean & Attractive Comparison Grid)
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
                <HiOutlineTrophy style={{ color: "#d97706" }} size={20} />{" "}
                {courseFilterType === "company"
                  ? "Top 10 Company-Wide Best-Selling Courses"
                  : "Top 10 Best-Selling Courses"}
              </h2>
              <span className="presales_section_title_badge">
                {courseFilterType === "company"
                  ? "Company-Wide Benchmark"
                  : admissionReportData.topCourses.length <= 5
                    ? `Showing ${admissionReportData.topCourses.length} Courses`
                    : showAllCourses
                      ? `Showing All ${admissionReportData.topCourses.length} Courses`
                      : "Showing Top 5 Courses"}
              </span>
            </div>

            {/* Filter Toggle Buttons matching PostSalesReport */}
            <div
              className="postsales_datetype_toggle"
              style={{
                width: "auto",
                padding: "3px 4px",
                background: "#f1f5f9",
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <button
                type="button"
                className={`postsales_toggle_btn ${courseFilterType === "courseResult" ? "active" : ""}`}
                onClick={() => setCourseFilterType("courseResult")}
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  borderRadius: 6,
                  fontWeight: courseFilterType === "courseResult" ? 700 : 600,
                  cursor: "pointer",
                }}
              >
                Top 10 Best-Selling Courses
              </button>
              <button
                type="button"
                className={`postsales_toggle_btn ${courseFilterType === "company" ? "active" : ""}`}
                onClick={() => setCourseFilterType("company")}
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  borderRadius: 6,
                  fontWeight: courseFilterType === "company" ? 700 : 600,
                  cursor: "pointer",
                }}
              >
                Top 10 Company-Wide Best-Selling Courses
              </button>
            </div>
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
