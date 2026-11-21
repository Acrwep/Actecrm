import React, { useState, useEffect, useRef, useMemo } from "react";
import "./styles.css";
import { Button, Col, Divider, Row, Tooltip, Skeleton, Dropdown } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { getBranches, getServerReportsCounts } from "../ApiService/action";
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
 * Initial / Fallback Dataset for Server Analytics
 * Matches real backend response schema from /getServerReportsCounts
 */
const INITIAL_SERVER_REPORT_DATA = {
  all_server_trans_counts: 634,
  all_customers: 634,
  all_server_trans_amount: "1211449.00",
  purchased_server_trans_amount: "0.00",
  issude_server_trans_counts: 0,
  server_region_reports: [
    {
      region_id: 1,
      region_name: "Chennai",
      all_server_trans_amount: 334513,
      purchased_server_trans_amount: 0,
      issude_server_trans_counts: 0,
      branches: [
        {
          branch_id: 1,
          branch_name: "Anna Nagar",
          purchased_server_trans_amount: 0,
          issude_server_trans_counts: 0,
          all_server_trans_amount: 112700,
        },
        {
          branch_id: 5,
          branch_name: "OMR",
          purchased_server_trans_amount: 0,
          issude_server_trans_counts: 0,
          all_server_trans_amount: 101100,
        },
        {
          branch_id: 8,
          branch_name: "Velachery",
          purchased_server_trans_amount: 0,
          issude_server_trans_counts: 0,
          all_server_trans_amount: 120713,
        },
      ],
    },
    {
      region_id: 2,
      region_name: "Bangalore",
      all_server_trans_amount: 135300,
      purchased_server_trans_amount: 0,
      issude_server_trans_counts: 0,
      branches: [
        {
          branch_id: 2,
          branch_name: "BTM Layout",
          purchased_server_trans_amount: 0,
          issude_server_trans_counts: 0,
          all_server_trans_amount: 36800,
        },
        {
          branch_id: 3,
          branch_name: "Electronic city",
          purchased_server_trans_amount: 0,
          issude_server_trans_counts: 0,
          all_server_trans_amount: 29200,
        },
        {
          branch_id: 4,
          branch_name: "Marathahalli",
          purchased_server_trans_amount: 0,
          issude_server_trans_counts: 0,
          all_server_trans_amount: 40800,
        },
        {
          branch_id: 14,
          branch_name: "Rajaji Nagar",
          purchased_server_trans_amount: 0,
          issude_server_trans_counts: 0,
          all_server_trans_amount: 28500,
        },
      ],
    },
    {
      region_id: 3,
      region_name: "Hub",
      all_server_trans_amount: 741636,
      purchased_server_trans_amount: 0,
      issude_server_trans_counts: 0,
      branches: [
        {
          branch_id: 10,
          branch_name: "Virtual",
          purchased_server_trans_amount: 0,
          issude_server_trans_counts: 0,
          all_server_trans_amount: 741636,
        },
      ],
    },
  ],
  course_reports: [
    {
      course_id: 10,
      course_name: "Sap Fico on Hana",
      serverTrans_counts: 99,
      all_server_trans_amount: "109400.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 13,
      course_name: "Sap MM",
      serverTrans_counts: 80,
      all_server_trans_amount: "88800.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 332,
      course_name: "Sap Fico",
      serverTrans_counts: 68,
      all_server_trans_amount: "97400.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 474,
      course_name: "Sap Fico On S4 Hana",
      serverTrans_counts: 32,
      all_server_trans_amount: "39900.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 410,
      course_name: "Sap Mm On S4 Hana",
      serverTrans_counts: 27,
      all_server_trans_amount: "33600.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 44,
      course_name: "Sap Ehs",
      serverTrans_counts: 16,
      all_server_trans_amount: "13400.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 19,
      course_name: "SAP SD",
      serverTrans_counts: 14,
      all_server_trans_amount: "17700.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 192,
      course_name: "Oracle Fusion Finance ",
      serverTrans_counts: 13,
      all_server_trans_amount: "27700.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 244,
      course_name: "Sap Pm",
      serverTrans_counts: 13,
      all_server_trans_amount: "13000.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 66,
      course_name: "Sap Success Factor Employee Central",
      serverTrans_counts: 13,
      all_server_trans_amount: "52700.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
  ],
  companies_top_10_courses_server: [
    {
      course_id: 265,
      course_name: "Oracle Cpq",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 72,
      course_name: "Sap Successfactors Ec",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 981,
      course_name: "Sap Bi/bw",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 192,
      course_name: "Oracle Fusion Finance ",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 1814,
      course_name: "Oracle Ebs Scm",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 26,
      course_name: "Sap Analytics Cloud",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 579,
      course_name: "Guidewire",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 142,
      course_name: "Oracle Paas",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 1582,
      course_name: "Sap Successfactors Ec Payroll",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
    },
    {
      course_id: 410,
      course_name: "Sap Mm On S4 Hana",
      serverTrans_counts: 0,
      all_server_trans_amount: "0.00",
      purchased_server_trans_amount: "0.00",
      issude_server_trans_counts: 0,
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
  const [reportData, setReportData] = useState(INITIAL_SERVER_REPORT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAllTopServers, setShowAllTopServers] = useState(false);
  const [courseFilterType, setCourseFilterType] = useState("courseResult"); // "courseResult" | "company"

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

  // Selected region display name helper
  const selectedRegionName = useMemo(() => {
    if (!selectedRegionId) return "";
    const reg = regionOptions.find(
      (r) => String(r.id) === String(selectedRegionId),
    );
    if (reg) return reg.name;
    const apiReg = (reportData?.server_region_reports || []).find(
      (r) => String(r.region_id) === String(selectedRegionId),
    );
    return apiReg?.region_name || "Regional";
  }, [selectedRegionId, regionOptions, reportData]);

  // Fetch report counts from backend API
  const getServerReportsData = async (
    startDate,
    endDate,
    regionId,
    branchId,
  ) => {
    setIsLoading(true);
    const sDate = startDate
      ? moment(startDate).format("YYYY-MM-DD")
      : selectedDates?.[0]
        ? moment(selectedDates[0]).format("YYYY-MM-DD")
        : undefined;
    const eDate = endDate
      ? moment(endDate).format("YYYY-MM-DD")
      : selectedDates?.[1]
        ? moment(selectedDates[1]).format("YYYY-MM-DD")
        : undefined;

    const payload = {
      ...(sDate && { start_date: sDate }),
      ...(eDate && { end_date: eDate }),
      ...(regionId && { region: regionId, region_id: regionId }),
      ...(branchId && { branch: branchId, branch_id: branchId }),
    };

    try {
      const response = await getServerReportsCounts(payload);
      const apiData =
        response?.data?.data?.server_reports_counts ||
        response?.data?.server_reports_counts ||
        response?.data?.data ||
        response?.data ||
        {};

      if (apiData && Object.keys(apiData).length > 0) {
        setReportData(apiData);
      }
    } catch (error) {
      console.error("Error fetching Server Reports counts:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        "Failed to fetch server report data";
      CommonMessage("error", errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Helper to trigger API fetch with parameter overrides
  const fetchServerData = (overrides = {}) => {
    const sDate =
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null;
    const eDate =
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null;
    const rId =
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId;
    const bId =
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId;

    getServerReportsData(sDate, eDate, rId, bId);
  };

  // Fetch branches for region
  const getBranchesData = async (region_id) => {
    try {
      const response = await getBranches({ region_id });
      const branch_data = response?.data?.result || response?.data?.data || [];
      const formatted = branch_data.map((b) => ({
        id: b.id || b.branch_id,
        name: b.name || b.branch_name,
      }));
      if (region_id == 1 || region_id == 2) {
        const reordered = [
          ...formatted.filter((item) => item.name !== "Online"),
          ...formatted.filter((item) => item.name === "Online"),
        ];
        setFilterBranchOptions(reordered);
      } else {
        setFilterBranchOptions(formatted);
      }
    } catch (error) {
      console.error("Error loading branches for Server Report:", error);
      setFilterBranchOptions([]);
    }
  };

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

    getServerReportsData(datesToUse[0], datesToUse[1], assignedRegionId, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryStartAndEndDate]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setCourseFilterType("courseResult");
    setShowAllTopServers(false);
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

    getServerReportsData(prevAndCurr[0], prevAndCurr[1], config.regionId, null);
  };

  // ---------------------------------------------------------------------------
  // Dynamic Regional / Branch Cards Data Model
  // - When no region chosen: 1. OVERALL (all regions) + HUB, CHENNAI, BANGALORE
  // - When single region chosen: 1. OVERALL (region total) + that region's branches
  // ---------------------------------------------------------------------------
  const regionalCardsData = useMemo(() => {
    const apiRegions = Array.isArray(reportData?.server_region_reports)
      ? reportData.server_region_reports
      : [];

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
      // Show 1. OVERALL (total across all regions) + Cards for HUB, CHENNAI, BANGALORE
      // -----------------------------------------------------------------------
      const overallTotalAmount =
        Number(reportData?.all_server_trans_amount) ||
        apiRegions.reduce(
          (sum, r) => sum + (Number(r.all_server_trans_amount) || 0),
          0,
        ) ||
        0;

      const overallTotalTrans =
        Number(reportData?.all_server_trans_counts) ||
        apiRegions.reduce(
          (sum, r) =>
            sum +
            (Number(
              r.all_server_trans_counts ??
                r.serverTrans_counts ??
                r.server_trans_counts,
            ) || 0),
          0,
        ) ||
        0;

      const overallPurchasedAmount =
        Number(reportData?.purchased_server_trans_amount) ||
        apiRegions.reduce(
          (sum, r) => sum + (Number(r.purchased_server_trans_amount) || 0),
          0,
        ) ||
        0;

      const overallIssuedCount =
        Number(
          reportData?.issude_server_trans_counts ??
            reportData?.issued_server_trans_counts,
        ) ||
        apiRegions.reduce(
          (sum, r) =>
            sum +
            (Number(
              r.issude_server_trans_counts ?? r.issued_server_trans_counts,
            ) || 0),
          0,
        ) ||
        0;

      const cards = [
        {
          id: "overall",
          title: "1. OVERALL",
          totalTransactions: overallTotalTrans,
          raisedAmount: overallTotalAmount,
          purchasedAmount: overallPurchasedAmount,
          issuedCount: overallIssuedCount,
          rateLabel: "TOTAL",
          color: "#059669",
        },
      ];

      // Desired regional card order: HUB, Chennai, Bangalore
      const PREFERRED_REGION_ORDER = ["hub", "chennai", "bangalore"];
      const sortedRegions = [...apiRegions].sort((a, b) => {
        const nameA = String(a.region_name || a.region || "")
          .toLowerCase()
          .trim();
        const nameB = String(b.region_name || b.region || "")
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
        const regAmount = Number(reg.all_server_trans_amount) || 0;
        const regTrans =
          Number(
            reg.all_server_trans_counts ??
              reg.serverTrans_counts ??
              reg.server_trans_counts,
          ) || 0;
        const regPurchased = Number(reg.purchased_server_trans_amount) || 0;
        const regIssued =
          Number(
            reg.issude_server_trans_counts ?? reg.issued_server_trans_counts,
          ) || 0;
        const regName = reg.region_name || reg.region || `Region ${idx + 1}`;

        const pct =
          overallTotalAmount > 0
            ? ((regAmount / overallTotalAmount) * 100).toFixed(1)
            : overallTotalTrans > 0
              ? ((regTrans / overallTotalTrans) * 100).toFixed(1)
              : "0.0";

        cards.push({
          id: `region-${reg.region_id || idx}`,
          title: `${idx + 2}. ${String(regName).toUpperCase()}`,
          totalTransactions: regTrans,
          raisedAmount: regAmount,
          purchasedAmount: regPurchased,
          issuedCount: regIssued,
          rateLabel: `${pct}% In ${regName}`,
          color: REGION_PALETTE[idx % REGION_PALETTE.length],
        });
      });

      return cards;
    } else {
      // -----------------------------------------------------------------------
      // Case 2: One Region Chosen
      // Show 1. OVERALL (for selected region) + All branches of that region
      // -----------------------------------------------------------------------
      const activeReg =
        apiRegions.find(
          (r) =>
            String(r.region_id) === String(selectedRegionId) ||
            String(r.region_name || r.region || "").toLowerCase() ===
              String(selectedRegionId).toLowerCase(),
        ) ||
        apiRegions[0] ||
        {};

      const regTotalAmount = Number(activeReg.all_server_trans_amount) || 0;
      const regTotalTrans =
        Number(
          activeReg.all_server_trans_counts ??
            activeReg.serverTrans_counts ??
            activeReg.server_trans_counts,
        ) ||
        (activeReg.branches || []).reduce(
          (sum, b) =>
            sum +
            (Number(
              b.all_server_trans_counts ??
                b.serverTrans_counts ??
                b.server_trans_counts,
            ) || 0),
          0,
        );
      const regPurchasedAmount =
        Number(activeReg.purchased_server_trans_amount) || 0;
      const regIssuedCount =
        Number(
          activeReg.issude_server_trans_counts ??
            activeReg.issued_server_trans_counts,
        ) || 0;

      const cards = [
        {
          id: `overall-${activeReg.region_id || "sel"}`,
          title: "1. OVERALL",
          totalTransactions: regTotalTrans,
          raisedAmount: regTotalAmount,
          purchasedAmount: regPurchasedAmount,
          issuedCount: regIssuedCount,
          rateLabel: "TOTAL",
          color: "#059669",
        },
      ];

      // Branch cards
      const branchesToDisplay = selectedBranchId
        ? (activeReg.branches || []).filter(
            (b) => String(b.branch_id || b.id) === String(selectedBranchId),
          )
        : activeReg.branches || [];

      branchesToDisplay.forEach((br, bIdx) => {
        const brAmount = Number(br.all_server_trans_amount) || 0;
        const brTrans =
          Number(
            br.all_server_trans_counts ??
              br.serverTrans_counts ??
              br.server_trans_counts,
          ) || 0;
        const brPurchased = Number(br.purchased_server_trans_amount) || 0;
        const brIssued =
          Number(
            br.issude_server_trans_counts ?? br.issued_server_trans_counts,
          ) || 0;
        const brName = br.branch_name || br.name || `Branch ${bIdx + 1}`;

        const pct =
          regTotalAmount > 0
            ? ((brAmount / regTotalAmount) * 100).toFixed(1)
            : regTotalTrans > 0
              ? ((brTrans / regTotalTrans) * 100).toFixed(1)
              : "0.0";

        cards.push({
          id: `branch-${br.branch_id || bIdx}`,
          title: `${bIdx + 2}. ${String(brName).toUpperCase()}`,
          totalTransactions: brTrans,
          raisedAmount: brAmount,
          purchasedAmount: brPurchased,
          issuedCount: brIssued,
          rateLabel: `${pct}% In ${brName}`,
          color: REGION_PALETTE[bIdx % REGION_PALETTE.length],
        });
      });

      return cards;
    }
  }, [reportData, selectedRegionId, selectedBranchId]);

  // ---------------------------------------------------------------------------
  // Top 10 Servers / Courses Data Model
  // Maps directly from course_reports / companies_top_10_courses_server from backend
  // ---------------------------------------------------------------------------
  const topServersList = useMemo(() => {
    const activeList =
      courseFilterType === "company"
        ? reportData?.companies_top_10_courses_server ||
          reportData?.companies_top_10_courses ||
          []
        : reportData?.course_reports || reportData?.courseResult || [];

    const list = Array.isArray(activeList) ? activeList : [];

    const sortedList = [...list].sort(
      (a, b) =>
        (Number(b.serverTrans_counts) || 0) -
        (Number(a.serverTrans_counts) || 0),
    );

    const listToMap =
      courseFilterType === "company" ? sortedList.slice(0, 10) : sortedList;

    return listToMap.map((c, idx) => ({
      server_id: c.course_id || idx + 1,
      rank: idx + 1,
      server_name: c.course_name || "Practice Server Lab",
      trans_count: Number(c.serverTrans_counts) || 0,
      raised_amount: Number(c.all_server_trans_amount) || 0,
      purchased_amount: Number(c.purchased_server_trans_amount) || 0,
      issued_count:
        Number(c.issude_server_trans_counts ?? c.issued_server_trans_counts) ||
        0,
      demand:
        idx === 0
          ? "🔥 Highest Demand"
          : idx <= 2
            ? "🔥 High Demand"
            : "▲ Consistent",
    }));
  }, [reportData, courseFilterType]);

  const maxTopServerTrans = Math.max(
    1,
    ...(topServersList.map((s) => s.trans_count) || [1]),
  );

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
        "Total Server Transactions (Admin Priced)",
        reportData.all_server_trans_counts || 0,
      ]);
      rows.push([
        "Total Valuation Amount (Admin Priced)",
        `₹${Number(reportData.all_server_trans_amount || 0).toLocaleString("en-IN")}`,
      ]);
      rows.push([
        "Total Purchased Amount (Finance Spent)",
        `₹${Number(reportData.purchased_server_trans_amount || 0).toLocaleString("en-IN")}`,
      ]);
      rows.push([
        "Total Servers Issued to Customers",
        reportData.issude_server_trans_counts || 0,
      ]);
      rows.push(["Total Customers", reportData.all_customers || 0]);
      rows.push([]);

      // 2. Region / Branch Breakdown
      rows.push(["2. REGION / BRANCH SERVER DISTRIBUTION & METRICS"]);
      rows.push([
        "Division / Card",
        "Server Transactions",
        "Valuation Amount (₹)",
        "Purchased Amount (₹)",
        "Servers Issued",
        "Share / Rate",
      ]);
      regionalCardsData.forEach((r) => {
        rows.push([
          r.title,
          r.totalTransactions || 0,
          r.raisedAmount || 0,
          r.purchasedAmount || 0,
          r.issuedCount || 0,
          r.rateLabel || "",
        ]);
      });
      rows.push([]);

      // 3. Top Courses / Servers
      rows.push([
        courseFilterType === "company"
          ? "3. TOP 10 COMPANY-WIDE BEST-SELLING COURSES"
          : "3. TOP 10 BEST-SELLING COURSES",
      ]);
      rows.push([
        "Rank",
        "Course / Server Name",
        "Server Transactions",
        "Valuation Amount (₹)",
        "Purchased Amount (₹)",
        "Servers Issued",
        "Demand",
      ]);
      topServersList.forEach((s) => {
        rows.push([
          s.rank,
          s.server_name,
          s.trans_count,
          s.raised_amount,
          s.purchased_amount,
          s.issued_count,
          s.demand,
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
              Spreadsheet data export (.csv)
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
            <HiOutlineServerStack />
          </div>

          <div>
            <h1 className="presales_header_title">
              Server Analytics & Lifecycle
            </h1>
            <p className="presales_header_subtitle">
              End-to-end tracking of practice server transactions, valuation,
              vendor procurement, and customer issuance
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
                  if (dates?.[0] && dates?.[1]) {
                    fetchServerData({ startDate: dates[0], endDate: dates[1] });
                  }
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
                  fetchServerData({ regionId: value, branchId: null });
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
                  const value = e.target.value;
                  setSelectedBranchId(value);
                  fetchServerData({ branchId: value });
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
                {reportData?.all_customers || 0} Total Customers
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
                {reportData?.all_server_trans_counts || 0} Total Server
                Transactions
              </span>
            </div>
          </div>

          {/* ====================================================================
              1. HERO KPI STAT CARDS (Core Requested Metrics)
              - Server Transactions (all_server_trans_counts)
              - Total Valuation Amount (all_server_trans_amount)
              - Purchased Amount (purchased_server_trans_amount)
              - Servers Issued (issude_server_trans_counts)
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
              Transactions, Valuation, Purchase & Delivery Metrics
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {/* Card 1: Server Transactions (Formerly Server Raised) */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_indigo">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Server Transactions</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#4f46e5" }}
                    >
                      {reportData?.all_server_trans_counts || 0}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <HiOutlineServerStack size={20} />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge">
                    <FiTrendingUp size={12} />
                    <span>Priced by Admin</span>
                  </span>
                  <span className="presales_stat_subtext">
                    Admin added amount to transaction
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 2: Total Valuation Amount (all_server_trans_amount) */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_amber">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">
                      Total Valuation Amount
                    </p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#d97706" }}
                    >
                      ₹
                      {Number(
                        reportData?.all_server_trans_amount || 0,
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
                    <span>Admin Valuated</span>
                  </span>
                  <span className="presales_stat_subtext">
                    Total priced transaction value
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 3: Purchased Amount (purchased_server_trans_amount) */}
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
                        reportData?.purchased_server_trans_amount || 0,
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
                    <span>Procured</span>
                  </span>
                  <span className="presales_stat_subtext">
                    Paid by Finance with Txn ID
                  </span>
                </div>
              </div>
            </Col>

            {/* Card 4: Servers Issued (issude_server_trans_counts) */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_emerald">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Servers Issued</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#059669" }}
                    >
                      {reportData?.issude_server_trans_counts ??
                        reportData?.issued_server_trans_counts ??
                        0}
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
              2. REGIONAL & BRANCH BREAKDOWN
              Matches AdmissionReport:
              - When no region selected: 1. OVERALL + HUB, CHENNAI, BANGALORE
              - When region selected: 1. OVERALL (Region) + each branch of that region
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <TbTargetArrow style={{ color: "#059669" }} size={19} />{" "}
              {selectedRegionId
                ? `${selectedRegionName} Branch-Wise Server Distribution`
                : "Region-Wise Server Distribution & Financial Realization"}
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#ecfdf5", color: "#059669" }}
            >
              {selectedRegionId
                ? `${selectedRegionName} & Branch Divisions`
                : "Overall & Regional Divisions"}
            </span>
          </div>

          {/* Dynamic Cards: Either Regional (Overall, HUB, CHN, BNG) or Branch Cards */}
          <div className="presales_funnel_container">
            <Row gutter={[16, 16]}>
              {regionalCardsData.map((card) => {
                const cardColor = card.color || "#059669";

                return (
                  <Col xs={24} sm={12} lg={6} key={card.id}>
                    <div
                      className="presales_funnel_step"
                      style={{
                        padding: "14px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {/* Card Header matching AdmissionReport UI */}
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
                            {card.totalTransactions > 0
                              ? Number(card.totalTransactions).toLocaleString(
                                  "en-IN",
                                )
                              : `₹${Number(card.raisedAmount).toLocaleString("en-IN")}`}
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
                        {/* Metric 1: Valuation Value */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "11px",
                          }}
                        >
                          <span style={{ color: "#64748b", fontWeight: 500 }}>
                            Valuation Value:
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
              3. TOP 10 SERVERS / COURSES
              Mapped directly from course_reports / companies_top_10_courses_server from backend API
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
                  : topServersList.length > 10
                    ? "Best-Selling Courses"
                    : "Top 10 Best-Selling Courses"}
              </h2>
              <span className="presales_section_title_badge">
                {courseFilterType === "company"
                  ? "Company-Wide Benchmark"
                  : topServersList.length <= 5
                    ? `Showing ${topServersList.length} Courses`
                    : showAllTopServers || isExporting
                      ? `Showing All ${topServersList.length} Courses`
                      : "Showing Top 5 Courses"}
              </span>
            </div>

            {/* Filter Toggle Buttons matching AdmissionReport */}
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
                onClick={() => {
                  setCourseFilterType("courseResult");
                  setShowAllTopServers(false);
                }}
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
                onClick={() => {
                  setCourseFilterType("company");
                  setShowAllTopServers(false);
                }}
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

          {topServersList.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "36px 16px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              No course server data available for the selected period
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {(showAllTopServers || isExporting
                  ? topServersList
                  : topServersList.slice(0, 5)
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
                    (server.trans_count / maxTopServerTrans) * 100;

                  return (
                    <Col xs={24} sm={24} md={12} key={server.server_id}>
                      <div className={`admission_course_card ${cardClass}`}>
                        <div className="admission_course_top_row">
                          <div className="admission_course_left">
                            <div
                              className={`admission_rank_badge ${rankClass}`}
                            >
                              {server.rank <= 3
                                ? `#${server.rank}`
                                : server.rank}
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
                                Server Course Lab
                              </span>
                            </div>
                          </div>

                          <div className="admission_course_count_box">
                            <span className="admission_course_count">
                              {server.trans_count}
                            </span>
                            <span className="admission_course_count_lbl">
                              Trans
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
                            Valuation:{" "}
                            <strong style={{ color: "#d97706" }}>
                              ₹
                              {Number(server.raised_amount).toLocaleString(
                                "en-IN",
                              )}
                            </strong>
                          </span>
                          <span>
                            Purchased:{" "}
                            <strong style={{ color: "#0284c7" }}>
                              ₹
                              {Number(server.purchased_amount).toLocaleString(
                                "en-IN",
                              )}
                            </strong>
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
                            Transactions: {server.trans_count}
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

              {topServersList.length > 5 && !isExporting && (
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
                        Show All {topServersList.length} Courses (
                        {topServersList.length - 5} More){" "}
                        <FiChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
