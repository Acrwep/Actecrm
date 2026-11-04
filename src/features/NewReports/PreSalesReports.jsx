import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import { Button, Col, Divider, Row, Tooltip, Skeleton } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  getAllDownlineUsers,
  getPreSalesReportsCounts,
  getUsersByRole,
} from "../ApiService/action";
import dayjs from "dayjs";
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
  FiPhoneCall,
  FiPhoneForwarded,
  FiPhoneMissed,
  FiCheckCircle,
} from "react-icons/fi";
import { TbReportAnalytics, TbTargetArrow } from "react-icons/tb";
import { HiOutlineSparkles } from "react-icons/hi2";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";

/**
 * Dedicated Skeleton Loader for Pre-Sales Reports
 * Replicates the exact shape, hierarchy, and cards of the live analytics view.
 */
function PreSalesReportsSkeleton() {
  return (
    <div className="presales_skeleton_wrapper">
      {/* 1. Lead Inflow & Allocation Skeleton (4 Cards) */}
      <div className="presales_section_header" style={{ marginTop: 20 }}>
        <h2 className="presales_section_title">
          <FiCompass style={{ color: "#5b69ca" }} size={19} /> Lead Inflow &
          Allocation
        </h2>
        <span className="presales_section_title_badge">Top of Funnel</span>
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
                    style={{ width: 80, height: 14 }}
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
              <div
                className="presales_card_bottom"
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Skeleton.Button
                  active
                  size="small"
                  style={{ width: 95, height: 22, borderRadius: 12 }}
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

      {/* 2. Qualification Pipeline & Conversion Skeleton (5 Cards) */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <TbTargetArrow style={{ color: "#059669" }} size={19} /> Lead
          Qualification & Conversion Lifecycle
        </h2>
        <Skeleton.Button
          active
          size="small"
          style={{ width: 140, height: 22, borderRadius: 12 }}
        />
      </div>

      <div className="presales_funnel_container">
        <div className="presales_funnel_steps">
          {[
            { title: "1. VALID LEADS", count: 3 },
            { title: "2. ELIGIBLE LEADS", count: 3 },
            { title: "3. INTERESTED LEADS", count: 4 },
            { title: "4. FOLLOW-UP LEADS", count: 5 },
          ].map((col, idx) => (
            <React.Fragment key={idx}>
              <div className="presales_funnel_step">
                <div className="presales_funnel_step_header">
                  <p className="presales_funnel_step_label">{col.title}</p>
                  <div
                    className="presales_funnel_count_row"
                    style={{ marginTop: 8 }}
                  >
                    <Skeleton.Input active style={{ width: 45, height: 22 }} />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 60, height: 13 }}
                    />
                  </div>
                </div>

                <div className="presales_funnel_subitems">
                  {Array.from({ length: col.count }).map((_, subIdx) => (
                    <div
                      className="presales_funnel_subitem"
                      key={subIdx}
                      style={{ justifyContent: "space-between" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Skeleton.Avatar active size={7} shape="circle" />
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: 75, height: 12 }}
                        />
                      </div>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 22, height: 12 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <FiArrowRight className="presales_funnel_arrow" />
            </React.Fragment>
          ))}

          {/* Hero Step (Joining Count) */}
          <div className="presales_funnel_step hero_step">
            <div className="presales_funnel_step_header">
              <p
                className="presales_funnel_step_label"
                style={{ color: "#047857" }}
              >
                ★ JOINING COUNT
              </p>
              <div
                className="presales_funnel_count_row"
                style={{ marginTop: 8 }}
              >
                <Skeleton.Input active style={{ width: 45, height: 22 }} />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 65, height: 13 }}
                />
              </div>
            </div>

            <div className="presales_funnel_hero_box">
              <Skeleton.Button
                active
                size="small"
                style={{ width: 110, height: 20, borderRadius: 6 }}
              />
              <div className="presales_funnel_hero_stat">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 75, height: 12 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 30, height: 12 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Follow-up Activity & Status Skeleton (3 Cards) */}
      <div className="presales_section_header" style={{ marginTop: 28 }}>
        <h2 className="presales_section_title">
          <FiPhoneCall style={{ color: "#0284c7" }} size={18} /> Follow-up
          Activity & Status
        </h2>
        <Skeleton.Button
          active
          size="small"
          style={{ width: 130, height: 22, borderRadius: 12 }}
        />
      </div>

      <Row gutter={[16, 16]}>
        {[1, 2, 3].map((i) => (
          <Col xs={24} sm={24} md={8} key={i}>
            <div className="presales_stat_card">
              <div className="presales_card_top">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 120, height: 14 }}
                  />
                  <Skeleton.Input
                    active
                    style={{ width: 90, height: 28, marginTop: 4 }}
                  />
                </div>
                <Skeleton.Avatar
                  active
                  size={40}
                  shape="square"
                  style={{ borderRadius: 10 }}
                />
              </div>

              <div
                style={{
                  margin: "12px 0 10px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <Skeleton.Button
                  active
                  size="small"
                  style={{ width: "100%", height: 6, borderRadius: 3 }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 80, height: 11 }}
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 60, height: 11 }}
                  />
                </div>
              </div>

              <div className="presales_card_bottom">
                <Skeleton.Button
                  active
                  size="small"
                  style={{ width: 100, height: 20, borderRadius: 12 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 65, height: 12 }}
                />
              </div>
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
                    style={{ width: 120, height: 14 }}
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 190, height: 11 }}
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

export default function PreSalesReports({ onBack, summaryStartAndEndDate }) {
  const prevSelectedUserIdRef = useRef("[]");

  // Default to last 7 days to match CommonMuiCustomDatePicker's initial state
  const [selectedDates, setSelectedDates] = useState([]);
  const [saleUsers, setSaleUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pre-Sales Metric Data State
  const [reportData, setReportData] = useState({
    totalLeads: 0,
    liveLeads: 0,
    assignedLeads: 0,
    openLeads: 0,
    avgTotalLeads: 0,
    avgLiveLeads: 0,
    avgOpenLeads: 0,
    validLeads: 0,
    validSubcategories: [
      { name: "Validated", count: 0, color: "#16a34a" },
      { name: "Need Screening", count: 0, color: "#d97706" },
      { name: "Junk", count: 0, color: "#dc2626" },
    ],
    eligibleLeads: 0,
    eligibleSubcategories: [
      { name: "Communicated", count: 0, color: "#4f46e5" },
      { name: "Not Communicated", count: 0, color: "#ea580c" },
      { name: "No Response", count: 0, color: "#64748b" },
    ],
    interestedLeads: 0,
    interestedSubcategories: [
      { name: "Super Hot", count: 0, color: "#dc2626" },
      { name: "Hot", count: 0, color: "#ea580c" },
      { name: "Warm", count: 0, color: "#eab308" },
      { name: "Cold", count: 0, color: "#3b82f6" },
    ],
    nextFollowupLeads: 0,
    nxtFollowupSubcategories: [
      { name: "Sales Ready", count: 0, color: "#16a34a" },
      { name: "Highly Interested", count: 0, color: "#059669" },
      { name: "Interested", count: 0, color: "#0284c7" },
      { name: "Exploring", count: 0, color: "#8b5cf6" },
      { name: "Not Responding", count: 0, color: "#64748b" },
    ],
    joiningCount: 0,
    totalFollowups: 485,
    handledFollowups: 412,
    unhandledFollowups: 73,
    leadSourcesCount: 0,
    leadSubSourcesCount: 0,
    leadSources: [],
    leadSubSources: [],
    apiPercentages: null,
  });

  // Trigger fetch when selectedDates changes
  useEffect(() => {
    setSelectedDates(summaryStartAndEndDate);
    getSaleUsersData();
  }, []);

  const getSaleUsersData = async () => {
    const payload = {
      role: "SALE",
    };
    try {
      const response = await getUsersByRole(payload);
      console.log("get sale users response", response);
      setSaleUsers(response?.data?.data?.data || []);
    } catch (error) {
      setSaleUsers([]);
      console.log("get sale users error", error);
    } finally {
      getAllDownlineUsersData();
    }
  };

  const getAllDownlineUsersData = async (isRefresh = false) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    setLoginUserId(convertAsJson?.user_id);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();

    if (isRefresh) {
      setSelectedDates(PreviousAndCurrentDate);
    }
    try {
      const response = await getAllDownlineUsers(convertAsJson?.user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      fetchPreSalesData({
        startDate: isRefresh
          ? PreviousAndCurrentDate[0]
          : summaryStartAndEndDate[0],
        endDate: isRefresh
          ? PreviousAndCurrentDate[1]
          : summaryStartAndEndDate[1],
        user_ids: downliners_ids,
      });
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const fetchPreSalesData = (overrides = {}) => {
    getPreSalesReportsData(
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null,
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null,
      overrides.user_ids !== undefined ? overrides.user_ids : selectedUserId,
    );
  };

  // Fetch report counts from backend API
  const getPreSalesReportsData = async (startDate, endDate, user_ids) => {
    setIsLoading(true);
    // Only pass start_date and end_date as requested
    const payload = {
      start_date: startDate,
      end_date: endDate,
      ...(user_ids && user_ids.length >= 1 ? { user_ids: user_ids } : {}),
    };

    try {
      setIsLoading(true);
      const response = await getPreSalesReportsCounts(payload);
      console.log("presales report response", response);
      const apiData = response?.data?.data || response?.data || {};

      if (apiData) {
        const bc = apiData.bucket_counts || {};
        const sc = apiData.source_counts || {};
        const ssc = apiData.sub_source_counts || {};
        const vla = apiData.valid_lead_actions || {};
        const ela = apiData.eligible_lead_actions || {};
        const ila = apiData.interested_lead_actions || {};
        const nfa = apiData.followup_actions || {};
        const tfups = apiData.followup_leads || {};
        const avg = apiData.average || {};
        const pct = apiData.percentage || {};

        const totalLeads = parseInt(bc.all ?? 0);
        const openLeads = parseInt(bc.open_leads ?? 0);
        const assignedLeads = Math.max(0, totalLeads - openLeads);

        // Sources formatting & share calculation
        const rawSources = [
          {
            name: "Call",
            count: parseInt(sc.call ?? 0),
            color: "#4f46e5",
          },
          {
            name: "Direct",
            count: parseInt(sc.direct ?? 0),
            color: "#ec4899",
          },
          {
            name: "Website",
            count: parseInt(sc.website ?? 0),
            color: "#10b981",
          },
          {
            name: "SMO",
            count: parseInt(sc.smo ?? 0),
            color: "#8b5cf6",
          },
          {
            name: "Live Chat",
            count: parseInt(sc.live_chat ?? 0),
            color: "#06b6d4",
          },
          {
            name: "Reference",
            count: parseInt(sc.reference ?? 0),
            color: "#f59e0b",
          },
        ];
        const totalSrcCount = rawSources.reduce(
          (acc, curr) => acc + curr.count,
          0,
        );
        const mappedSources = rawSources
          .map((item) => ({
            ...item,
            share:
              totalSrcCount > 0
                ? Number(((item.count / totalSrcCount) * 100).toFixed(1))
                : 0,
          }))
          .sort((a, b) => b.count - a.count);

        // Sub-sources formatting
        const mappedSubSources = [
          {
            name: "IVR",
            parent: "Call",
            count: parseInt(ssc.ivr ?? 0),
          },
          {
            name: "Branch",
            parent: "Call",
            count: parseInt(ssc.branch ?? 0),
          },
          {
            name: "Enquiry Form",
            parent: "Website",
            count: parseInt(ssc.enquiry_form ?? 0),
          },
          {
            name: "WhatsApp",
            parent: "Website",
            count: parseInt(ssc.whatsapp_website ?? 0),
          },
          {
            name: "Google Ads",
            parent: "Website",
            count: parseInt(ssc.google_ads ?? 0),
          },
          {
            name: "Instant Form",
            parent: "SMO",
            count: parseInt(ssc.instant_form ?? 0),
          },
          {
            name: "Call",
            parent: "SMO",
            count: parseInt(ssc.call ?? 0),
          },
          {
            name: "WhatsApp",
            parent: "SMO",
            count: parseInt(ssc.whatsapp_smo ?? 0),
          },
        ].sort((a, b) => b.count - a.count);

        // Build interested subcategories
        const interestedSubs = [
          {
            name: "Super Hot",
            count: parseInt(ila.super_hot ?? 0),
            color: "#dc2626",
          },
          { name: "Hot", count: parseInt(ila.hot ?? 0), color: "#ea580c" },
          { name: "Warm", count: parseInt(ila.warm ?? 0), color: "#eab308" },
          { name: "Cold", count: parseInt(ila.cold ?? 0), color: "#3b82f6" },
          { name: "Dormant", count: parseInt(ila.cold ?? 0), color: "#6b7280" },
          {
            name: "Not Interested",
            count: parseInt(ila.cold ?? 0),
            color: "#991b1b",
          },
        ];
        if (parseInt(ila.dormant ?? 0) > 0) {
          interestedSubs.push({
            name: "Dormant",
            count: parseInt(ila.dormant),
            color: "#6b7280",
          });
        }
        if (parseInt(ila.not_interested ?? 0) > 0) {
          interestedSubs.push({
            name: "Not Interested",
            count: parseInt(ila.not_interested),
            color: "#94a3b8",
          });
        }

        // Build followup subcategories
        const followupSubs = [
          {
            name: "Sales Ready",
            count: parseInt(nfa.sales_ready_leads ?? 0),
            color: "#16a34a",
          },
          {
            name: "Highly Interested",
            count: parseInt(nfa.highly_interested_leads ?? 0),
            color: "#059669",
          },
          {
            name: "Interested",
            count: parseInt(nfa.interested_leads ?? 0),
            color: "#0284c7",
          },
          {
            name: "Exploring",
            count: parseInt(nfa.exploring_leads ?? 0),
            color: "#8b5cf6",
          },
          {
            name: "Not Responding",
            count: parseInt(nfa.not_responding_leads ?? 0),
            color: "#64748b",
          },
        ];
        if (parseInt(nfa.not_interested_leads ?? 0) > 0) {
          followupSubs.push({
            name: "Not Interested",
            count: parseInt(nfa.not_interested_leads),
            color: "#94a3b8",
          });
        }

        setReportData({
          totalLeads: totalLeads,
          liveLeads: parseInt(bc.website_leads ?? 0),
          assignedLeads: assignedLeads,
          openLeads: openLeads,
          avgTotalLeads: avg.all != null ? avg.all : "-",
          avgLiveLeads:
            avg.website_leads != null
              ? avg.website_leads
              : parseInt(bc.website_leads ?? 0)
                ? (parseInt(bc.website_leads ?? 0) / 7).toFixed(1)
                : 0,
          avgOpenLeads: avg.open_leads != null ? avg.open_leads : "-",
          validLeads: parseInt(bc.valid_leads ?? 0),
          validSubcategories: [
            {
              name: "Validated",
              count: parseInt(vla.validated ?? 0),
              color: "#16a34a",
            },
            {
              name: "Need Screening",
              count: parseInt(vla.need_screening ?? 0),
              color: "#d97706",
            },
            { name: "Junk", count: parseInt(vla.junk ?? 0), color: "#dc2626" },
          ],
          eligibleLeads: parseInt(bc.eligible_leads ?? 0),
          eligibleSubcategories: [
            {
              name: "Communicated",
              count: parseInt(ela.communicated ?? 0),
              color: "#4f46e5",
            },
            {
              name: "Not Communicated",
              count: parseInt(ela.not_communicated ?? 0),
              color: "#ea580c",
            },
            {
              name: "No Response",
              count: parseInt(ela.no_response ?? 0),
              color: "#64748b",
            },
          ],
          interestedLeads: parseInt(bc.interested_leads ?? 0),
          interestedSubcategories: interestedSubs,
          nextFollowupLeads: parseInt(bc.followup_leads ?? 0),
          nxtFollowupSubcategories: followupSubs,
          joiningCount: parseInt(bc.joinings ?? 0),
          totalFollowups: parseInt(tfups.total_followups ?? 0),
          handledFollowups: parseInt(tfups.follow_up_handled ?? 0),
          unhandledFollowups: parseInt(tfups.follow_up_unhandled ?? 0),
          leadSourcesCount:
            mappedSources.filter((s) => s.count > 0).length ||
            mappedSources.length,
          leadSubSourcesCount:
            mappedSubSources.filter((s) => s.count > 0).length ||
            mappedSubSources.length,
          leadSources: mappedSources,
          leadSubSources: mappedSubSources,
          apiPercentages: pct,
        });
      }
    } catch (error) {
      console.log("get presale reports error", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        "Failed to get reports data";
      CommonMessage("error", errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
  };

  const handleSelectUserBlur = async () => {
    const value = selectedUserId;

    const stringifiedValue = JSON.stringify(value || []);
    if (prevSelectedUserIdRef.current === stringifiedValue) {
      return;
    }
    prevSelectedUserIdRef.current = stringifiedValue;

    console.log("stringifiedValue", stringifiedValue);

    if (Array.isArray(value) && value.length <= 0) {
      try {
        const response = await getAllDownlineUsers(loginUserId);
        console.log("all downlines response", response);
        const downliners = response?.data?.data || [];
        const downliners_ids = downliners.map((u) => {
          return u.user_id;
        });
        fetchPreSalesData({ user_ids: downliners_ids });
      } catch (error) {
        console.log("all downlines error", error);
      }
    } else {
      fetchPreSalesData({ user_ids: value });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    prevSelectedUserIdRef.current = "[]";
    setSelectedUserId([]);
    getAllDownlineUsersData(true);
  };

  // Helper calculations for rates & conversion
  const conversionRate =
    reportData.apiPercentages?.joinings != null
      ? Number(reportData.apiPercentages.joinings).toFixed(1)
      : reportData.totalLeads
        ? ((reportData.joiningCount / reportData.totalLeads) * 100).toFixed(1)
        : "0.0";

  const validRate =
    reportData.apiPercentages?.valid_leads != null
      ? Number(reportData.apiPercentages.valid_leads).toFixed(1)
      : reportData.totalLeads
        ? ((reportData.validLeads / reportData.totalLeads) * 100).toFixed(1)
        : "0.0";

  const eligibleRate = reportData.validLeads
    ? ((reportData.eligibleLeads / reportData.validLeads) * 100).toFixed(1)
    : "0.0";

  const interestedRate = reportData.eligibleLeads
    ? ((reportData.interestedLeads / reportData.eligibleLeads) * 100).toFixed(1)
    : "0.0";

  const joiningFromInterestedRate = reportData.interestedLeads
    ? ((reportData.joiningCount / reportData.interestedLeads) * 100).toFixed(1)
    : "0.0";

  // Follow-up Activity & Status calculations
  const totalFollowups = Number(reportData.totalFollowups ?? 485);
  const handledFollowups = Number(reportData.handledFollowups ?? 412);
  const unhandledFollowups = Number(reportData.unhandledFollowups ?? 73);

  const followupHandledRate =
    totalFollowups > 0
      ? ((handledFollowups / totalFollowups) * 100).toFixed(1)
      : "0.0";
  const followupUnhandledRate =
    totalFollowups > 0
      ? ((unhandledFollowups / totalFollowups) * 100).toFixed(1)
      : "0.0";

  // Average count metrics for Lead Inflow & Allocation cards
  const avgTotalLeads = reportData.avgTotalLeads ?? 0;
  const avgLiveLeads = reportData.avgLiveLeads ?? 0;
  const avgOpenLeads = reportData.avgOpenLeads ?? 0;

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
          <div className="presales_header_icon_box">
            <TbReportAnalytics />
          </div>
          <div>
            <h1 className="presales_header_title">Pre-Sales Report</h1>
            <p className="presales_header_subtitle">
              Comprehensive analytics on lead inflow, qualification stages, and
              enrollment conversions
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
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

          {/* Download Button */}
          <Tooltip title="Export Report Data">
            <button className="presales_icon_button" aria-label="Export Data">
              <FiDownload />
            </button>
          </Tooltip>
        </div>
      </div>

      <Row gutter={[0, 24]} style={{ marginTop: "0px" }}>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={14}
          style={{ display: "flex", gap: "12px" }}
        >
          <CommonMuiCustomDatePicker
            label={"Select Date"}
            width="280px"
            value={selectedDates}
            onDateChange={(dates) => {
              setSelectedDates(dates);
              fetchPreSalesData({ startDate: dates[0], endDate: dates[1] });
            }}
          />
          <CommonMultiSelectField
            height="34px"
            label="Select User"
            labelMarginTop="1px"
            labelFontSize="11px"
            width={"200px"}
            options={saleUsers}
            onChange={handleSelectUser}
            onBlur={handleSelectUserBlur}
            value={selectedUserId}
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={10}
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        ></Col>
      </Row>

      <Divider className="customer_statusupdate_divider" />

      {/* Conditional rendering: Render Skeleton Loader while loading, Live Content when loaded */}
      {isLoading ? (
        <PreSalesReportsSkeleton />
      ) : (
        <>
          {/* ====================================================================
              2. Executive Summary - Top Volume Drivers (4 Metrics)
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 20 }}>
            <h2 className="presales_section_title">
              <FiCompass style={{ color: "#5b69ca" }} size={19} /> Lead Inflow &
              Allocation
            </h2>
            <span className="presales_section_title_badge">Top of Funnel</span>
          </div>

          <Row gutter={[16, 16]}>
            {/* Total Leads */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_indigo">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Total Leads</p>
                    <h3 className="presales_stat_value">
                      {Number(reportData.totalLeads).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiUsers />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiTrendingUp size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">
                      {avgTotalLeads}
                    </strong>
                  </span>
                  <span className="presales_stat_subtext">leads / day</span>
                </div>
              </div>
            </Col>

            {/* Live Leads */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_emerald">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Pick from Live Leads</p>
                    <h3 className="presales_stat_value">
                      {Number(reportData.liveLeads).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiActivity />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <HiOutlineSparkles size={13} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">{avgLiveLeads}</strong>
                  </span>
                  <span className="presales_stat_subtext">leads / day</span>
                </div>
              </div>
            </Col>

            {/* Assigned Leads */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_sky">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">
                      Pick from Assigned Leads
                    </p>
                    <h3 className="presales_stat_value">
                      {Number(reportData.assignedLeads).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiUserCheck />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge">
                    {reportData.totalLeads
                      ? `${((reportData.assignedLeads / reportData.totalLeads) * 100).toFixed(1)}%`
                      : "0%"}{" "}
                    Allocated
                  </span>
                  <span className="presales_stat_subtext">
                    Active counseling
                  </span>
                </div>
              </div>
            </Col>

            {/* Open Leads */}
            <Col xs={24} sm={12} md={12} lg={6}>
              <div className="presales_stat_card presales_theme_amber">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Pick from Open Leads</p>
                    <h3 className="presales_stat_value">
                      {Number(reportData.openLeads).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiClock />
                  </div>
                </div>
                <div className="presales_card_bottom">
                  <span className="presales_badge presales_avg_badge">
                    <FiClock size={12} />
                    <span className="presales_avg_label">Daily Avg:</span>
                    <strong className="presales_avg_val">{avgOpenLeads}</strong>
                  </span>
                  <span className="presales_stat_subtext">leads / day</span>
                </div>
              </div>
            </Col>
          </Row>

          {/* ====================================================================
              3. Qualification Pipeline & Conversion (5 Metrics)
              ==================================================================== */}
          <div className="presales_section_header">
            <h2 className="presales_section_title">
              <TbTargetArrow style={{ color: "#059669" }} size={19} /> Lead
              Qualification & Conversion Lifecycle
            </h2>
            <span
              className="presales_section_title_badge"
              style={{ background: "#ecfdf5", color: "#059669" }}
            >
              {conversionRate}% Net Conversion
            </span>
          </div>

          {/* Visual Pipeline Funnel Track */}
          <div className="presales_funnel_container">
            <div className="presales_funnel_steps">
              {/* Step 1: Valid Leads */}
              <div className="presales_funnel_step">
                <div className="presales_funnel_step_header">
                  <p className="presales_funnel_step_label">1. Valid Leads</p>
                  <div className="presales_funnel_count_row">
                    <span className="presales_funnel_step_count">
                      {Number(reportData.validLeads).toLocaleString("en-IN")}
                    </span>
                    <span className="presales_funnel_step_rate">
                      {validRate}% of Total
                    </span>
                  </div>
                </div>

                <div className="presales_funnel_subitems">
                  {(reportData.validSubcategories || []).map((sub) => (
                    <div className="presales_funnel_subitem" key={sub.name}>
                      <span className="presales_funnel_subitem_name">
                        <span
                          className="presales_subitem_dot"
                          style={{ background: sub.color || "#16a34a" }}
                        />
                        {sub.name}
                      </span>
                      <span className="presales_funnel_subitem_count">
                        {Number(sub.count).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <FiArrowRight className="presales_funnel_arrow" />

              {/* Step 2: Eligible Leads */}
              <div className="presales_funnel_step">
                <div className="presales_funnel_step_header">
                  <p className="presales_funnel_step_label">
                    2. Eligible Leads
                  </p>
                  <div className="presales_funnel_count_row">
                    <span className="presales_funnel_step_count">
                      {Number(reportData.eligibleLeads).toLocaleString("en-IN")}
                    </span>
                    <span className="presales_funnel_step_rate">
                      {eligibleRate}% of Valid
                    </span>
                  </div>
                </div>

                <div className="presales_funnel_subitems">
                  {(reportData.eligibleSubcategories || []).map((sub) => (
                    <div className="presales_funnel_subitem" key={sub.name}>
                      <span className="presales_funnel_subitem_name">
                        <span
                          className="presales_subitem_dot"
                          style={{ background: sub.color || "#4f46e5" }}
                        />
                        {sub.name}
                      </span>
                      <span className="presales_funnel_subitem_count">
                        {Number(sub.count).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <FiArrowRight className="presales_funnel_arrow" />

              {/* Step 3: Interested Leads */}
              <div className="presales_funnel_step">
                <div className="presales_funnel_step_header">
                  <p className="presales_funnel_step_label">
                    3. Interested Leads
                  </p>
                  <div className="presales_funnel_count_row">
                    <span className="presales_funnel_step_count">
                      {Number(reportData.interestedLeads).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                    <span className="presales_funnel_step_rate">
                      {interestedRate}% of Eligible
                    </span>
                  </div>
                </div>

                <div className="presales_funnel_subitems">
                  {(reportData.interestedSubcategories || []).map((sub) => (
                    <div className="presales_funnel_subitem" key={sub.name}>
                      <span className="presales_funnel_subitem_name">
                        <span
                          className="presales_subitem_dot"
                          style={{ background: sub.color || "#ea580c" }}
                        />
                        {sub.name}
                      </span>
                      <span className="presales_funnel_subitem_count">
                        {Number(sub.count).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <FiArrowRight className="presales_funnel_arrow" />

              {/* Step 4: Follow-up Leads */}
              <div className="presales_funnel_step">
                <div className="presales_funnel_step_header">
                  <p className="presales_funnel_step_label">
                    4. Nxt Follow-up Leads
                  </p>
                  <div className="presales_funnel_count_row">
                    <span className="presales_funnel_step_count">
                      {Number(reportData.nextFollowupLeads).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{ color: "#ea580c" }}
                    >
                      Active Nurturing
                    </span>
                  </div>
                </div>

                <div className="presales_funnel_subitems">
                  {(reportData.nxtFollowupSubcategories || []).map((sub) => (
                    <div className="presales_funnel_subitem" key={sub.name}>
                      <span className="presales_funnel_subitem_name">
                        <span
                          className="presales_subitem_dot"
                          style={{ background: sub.color || "#0284c7" }}
                        />
                        {sub.name}
                      </span>
                      <span className="presales_funnel_subitem_count">
                        {Number(sub.count).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <FiArrowRight className="presales_funnel_arrow" />

              {/* Step 5: Joining Count (Outcome - Except Joinings) */}
              <div className="presales_funnel_step hero_step">
                <div className="presales_funnel_step_header">
                  <p
                    className="presales_funnel_step_label"
                    style={{ color: "#047857" }}
                  >
                    ★ Joining Count
                  </p>
                  <div className="presales_funnel_count_row">
                    <span
                      className="presales_funnel_step_count"
                      style={{ color: "#047857" }}
                    >
                      {Number(reportData.joiningCount).toLocaleString("en-IN")}
                    </span>
                    <span
                      className="presales_funnel_step_rate"
                      style={{ color: "#059669" }}
                    >
                      {joiningFromInterestedRate}% Win Rate
                    </span>
                  </div>
                </div>

                <div className="presales_funnel_hero_box">
                  <div className="presales_funnel_hero_tag">
                    <span>🎯 Goal Achievement</span>
                  </div>
                  <div className="presales_funnel_hero_stat">
                    <span className="presales_funnel_hero_stat_label">
                      Net Conversion
                    </span>
                    <strong className="presales_funnel_hero_stat_val">
                      {conversionRate}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================================
              3. Follow-up Activity & Status (3 Cards)
              ==================================================================== */}
          <div className="presales_section_header" style={{ marginTop: 28 }}>
            <h2 className="presales_section_title">
              <FiPhoneCall style={{ color: "#0284c7" }} size={18} /> Follow-up
              Activity & Status
            </h2>
            <span
              className="presales_section_title_badge"
              style={{
                background: "#f0fdf4",
                color: "#16a34a",
                borderColor: "#bbf7d0",
              }}
            >
              {followupHandledRate}% Handled Rate
            </span>
          </div>

          <Row gutter={[16, 16]}>
            {/* 1. Total Followup Count */}
            <Col xs={24} sm={24} md={7}>
              <div className="presales_stat_card presales_theme_sky">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Total Follow-ups</p>
                    <h3 className="presales_stat_value">
                      {Number(totalFollowups).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiPhoneCall size={17} />
                  </div>
                </div>

                <div className="presales_followup_progress_box">
                  <div className="presales_followup_progress_track">
                    <div
                      className="presales_followup_progress_fill handled"
                      style={{ width: `${followupHandledRate}%` }}
                    />
                    <div
                      className="presales_followup_progress_fill unhandled"
                      style={{ width: `${followupUnhandledRate}%` }}
                    />
                  </div>
                  <div className="presales_followup_progress_labels">
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>
                      ● {followupHandledRate}% Handled
                    </span>
                    <span style={{ color: "#e11d48", fontWeight: 600 }}>
                      ● {followupUnhandledRate}% Pending
                    </span>
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
                    <FiTrendingUp size={12} /> Total Scheduled
                  </span>
                  <span className="presales_stat_subtext">
                    Counselor pipeline
                  </span>
                </div>
              </div>
            </Col>

            {/* 2. Handled Followup Count */}
            <Col xs={24} sm={24} md={7}>
              <div className="presales_stat_card presales_theme_emerald">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Handled Follow-ups</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#16a34a" }}
                    >
                      {Number(handledFollowups).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiPhoneForwarded size={17} />
                  </div>
                </div>

                <div className="presales_followup_progress_box">
                  <div className="presales_followup_progress_track">
                    <div
                      className="presales_followup_progress_fill handled"
                      style={{ width: `${followupHandledRate}%` }}
                    />
                  </div>
                  <div className="presales_followup_progress_labels">
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>
                      {followupHandledRate}% Execution Rate
                    </span>
                    <span style={{ color: "#64748b" }}>Actioned</span>
                  </div>
                </div>

                <div className="presales_card_bottom">
                  <span
                    className="presales_badge"
                    style={{
                      background: "#ecfdf5",
                      color: "#059669",
                      borderColor: "#a7f3d0",
                    }}
                  >
                    <FiCheckCircle size={12} /> Contact Completed
                  </span>
                  <span className="presales_stat_subtext">Calls logged</span>
                </div>
              </div>
            </Col>

            {/* 3. Un-Handled Followup Count */}
            <Col xs={24} sm={24} md={7}>
              <div className="presales_stat_card presales_theme_rose">
                <div className="presales_card_top">
                  <div>
                    <p className="presales_stat_label">Un-Handled Follow-ups</p>
                    <h3
                      className="presales_stat_value"
                      style={{ color: "#e11d48" }}
                    >
                      {Number(unhandledFollowups).toLocaleString("en-IN")}
                    </h3>
                  </div>
                  <div className="presales_stat_icon_wrapper">
                    <FiPhoneMissed size={17} />
                  </div>
                </div>

                <div className="presales_followup_progress_box">
                  <div className="presales_followup_progress_track">
                    <div
                      className="presales_followup_progress_fill unhandled"
                      style={{ width: `${followupUnhandledRate}%` }}
                    />
                  </div>
                  <div className="presales_followup_progress_labels">
                    <span style={{ color: "#e11d48", fontWeight: 600 }}>
                      {followupUnhandledRate}% Backlog Rate
                    </span>
                    <span style={{ color: "#e11d48" }}>Pending action</span>
                  </div>
                </div>

                <div className="presales_card_bottom">
                  <span
                    className="presales_badge"
                    style={{
                      background: "#fff1f2",
                      color: "#e11d48",
                      borderColor: "#fecdd3",
                    }}
                  >
                    <FiClock size={12} /> Pending Outreach
                  </span>
                  <span className="presales_stat_subtext">
                    Needs counselor call
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          {/* ====================================================================
              4. Channel & Attribution Breakdown (Lead Sources & Sub-Sources)
              ==================================================================== */}
          <div className="presales_section_header">
            <h2 className="presales_section_title">
              <FiLayers style={{ color: "#6366f1" }} size={17} /> Acquisition
              Channel Attribution
            </h2>
            <span className="presales_section_title_badge">
              Source Analytics
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
                    {reportData.leadSourcesCount} Channels
                  </span>
                </div>

                <div className="presales_panel_body">
                  {reportData.leadSources.map((source, index) => (
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
                    {reportData.leadSubSourcesCount} Sub-Sources
                  </span>
                </div>

                <div className="presales_panel_body">
                  <div className="presales_subsource_grid">
                    {reportData.leadSubSources.map((sub, index) => (
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
        </>
      )}
    </div>
  );
}
