import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import { FaWhatsapp, FaPlus } from "react-icons/fa";
import { MdCampaign } from "react-icons/md";
import { PiShareFatBold } from "react-icons/pi";
import { BsChatDots, BsCheck2All, BsExclamationTriangle } from "react-icons/bs";
import CommonTable from "../Common/CommonTable";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import WhatsAppCampaignDetails from "./WhatsAppCampaignDetails";
import SendFollowupTemplateModal from "./SendFollowupTemplateModal";
import {
  getWhatsAppCampaigns,
  getWhatsAppCampaignStatistics,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import moment from "moment";
import "./styles.css";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import OverflowTooltip from "../Common/OverflowTooltip";

const campaignTypeOptions = [
  { id: "", name: "All Types" },
  { id: "Single", name: "Single" },
  { id: "Bulk", name: "Bulk" },
];

const campaignStatusOptions = [
  { id: "", name: "All Status" },
  { id: "Completed", name: "Completed" },
  { id: "Processing", name: "Processing" },
  { id: "Failed", name: "Failed" },
];

export default function WhatsAppCampaigns({ onSwitchToLeads }) {
  // Filter States
  const [selectedDates, setSelectedDates] = useState(() =>
    getCurrentandPreviousweekDate(),
  );
  const [searchValue, setSearchValue] = useState("");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Data States
  const [campaigns, setCampaigns] = useState([]);
  const [statistics, setStatistics] = useState({
    today: { total_campaigns: 0, single_campaigns: 0, bulk_campaigns: 0 },
    range: {
      total_campaigns: 0,
      single_campaigns: 0,
      bulk_campaigns: 0,
      completed_campaigns: 0,
      processing_campaigns: 0,
      failed_campaigns: 0,
    },
    messages: {
      total: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      pending: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [selectedCampaignForDetails, setSelectedCampaignForDetails] =
    useState(null);
  const [followupCampaign, setFollowupCampaign] = useState(null);

  // Search debounce ref
  const searchTimeoutRef = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const initialDates = getCurrentandPreviousweekDate();
      setSelectedDates(initialDates);
      fetchCampaignsData({
        startDate: initialDates[0],
        endDate: initialDates[1],
        pageNumber: 1,
      });
      fetchStatisticsData({
        startDate: initialDates[0],
        endDate: initialDates[1],
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleRefreshCampaigns = () => {
      fetchStatisticsData({});
      fetchCampaignsData({});
    };

    window.addEventListener("refreshCampaigns", handleRefreshCampaigns);

    return () => {
      window.removeEventListener("refreshCampaigns", handleRefreshCampaigns);
    };
  }, []);

  const fetchStatisticsData = (overrides = {}) => {
    getStatisticsData(
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null,
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null,
    );
  };

  const getStatisticsData = async (startDate, endDate) => {
    setStatsLoading(true);
    try {
      const from = startDate || moment().format("YYYY-MM-DD");
      const to = endDate || moment().format("YYYY-MM-DD");
      const res = await getWhatsAppCampaignStatistics({
        fromDate: from,
        toDate: to,
      });
      if (res?.data?.success) {
        setStatistics(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCampaignsData = (overrides = {}) => {
    getCampaignsData(
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null,
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null,
      overrides.searchvalue !== undefined ? overrides.searchvalue : searchValue,
      overrides.campaignType !== undefined
        ? overrides.campaignType
        : campaignTypeFilter,
      overrides.status !== undefined ? overrides.status : statusFilter,
      overrides.pageNumber !== undefined
        ? overrides.pageNumber
        : pagination?.page || 1,
      overrides.limit !== undefined ? overrides.limit : pagination?.limit || 10,
    );
  };

  const getCampaignsData = async (
    startDate,
    endDate,
    searchvalue,
    campaignType,
    status,
    pageNumber,
    limit,
  ) => {
    setLoading(true);
    try {
      const payload = {
        page: pageNumber,
        limit: limit,
        ...(searchvalue && { search: searchvalue }),
        ...(campaignType && { campaignType: campaignType }),
        ...(status && { status: status }),
        ...(startDate && { fromDate: startDate }),
        ...(endDate && { toDate: endDate }),
      };

      const res = await getWhatsAppCampaigns(payload);

      if (res?.data?.success) {
        setCampaigns(res.data.data || []);
        if (res.data.pagination) {
          setPagination({
            page: res.data.pagination.page,
            limit: res.data.pagination.limit,
            total: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages,
          });
        }
      } else {
        CommonMessage(
          "error",
          res?.data?.message || "Failed to fetch campaigns",
        );
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      CommonMessage("error", "Error loading campaign history");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const input = e.target.value;
    setSearchValue(input);
    setLoading(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!input) {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchCampaignsData({
        searchvalue: null,
        pageNumber: 1,
      });
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchCampaignsData({
        searchvalue: input,
        pageNumber: 1,
      });
    }, 500);
  };

  const handleRefresh = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    const defaultDates = getCurrentandPreviousweekDate();
    setSearchValue("");
    setCampaignTypeFilter("");
    setStatusFilter("");
    setSelectedDates(defaultDates);
    setSelectedCampaignForDetails(null);
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
    fetchCampaignsData({
      startDate: defaultDates[0],
      endDate: defaultDates[1],
      searchvalue: null,
      campaignType: "",
      status: "",
      pageNumber: 1,
      limit: 10,
    });
    fetchStatisticsData({
      startDate: defaultDates[0],
      endDate: defaultDates[1],
    });
  };

  const handleViewDetails = (record) => {
    setSelectedCampaignForDetails(record);
  };

  const handlePaginationChange = ({ page, limit }) => {
    fetchCampaignsData({
      pageNumber: page,
      limit: limit,
    });
  };

  const columns = [
    {
      title: "Sl. No",
      key: "row_num",
      width: 60,
      render: (_, __, index) =>
        (pagination.page - 1) * pagination.limit + index + 1,
    },
    {
      title: "Campaign ID",
      dataIndex: "campaign_id",
      key: "campaign_id",
      width: 170,
      render: (text, record) => (
        <Tooltip title={"Click to view details"} placement="top">
          <p
            onClick={() => handleViewDetails(record)}
            style={{
              fontWeight: 700,
              color: "#1e40af",
              cursor: "pointer",
              fontSize: "11.5px",
            }}
          >
            {text}
          </p>
        </Tooltip>
      ),
    },
    {
      title: "Campaign Name",
      dataIndex: "campaign_name",
      key: "campaign_name",
      width: 180,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Region",
      dataIndex: "region_name",
      key: "region_name",
      width: 90,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Branch",
      dataIndex: "branch_name",
      key: "branch_name",
      width: 100,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Course",
      dataIndex: "course_name",
      key: "course_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Type",
      dataIndex: "campaign_type",
      key: "campaign_type",
      width: 90,
      render: (type) => (
        <div className={`wcd-type-badge bulk ${type}`}>{type}</div>
      ),
    },
    {
      title: "Template Name",
      dataIndex: "template_name",
      key: "template_name",
      width: 140,
      render: (text) => text || "—",
    },
    {
      title: "Created By",
      dataIndex: "created_by_name",
      key: "created_by_name",
      width: 110,
      align: "center",
      render: (text, record) => {
        const created_by = `${record.created_by_view_user_id} - ${text}`;
        return (
          <div style={{ textAlign: "center", width: "100%" }}>
            <OverflowTooltip
              title={created_by}
              children={record.created_by_view_user_id}
            />
          </div>
        );
      },
    },
    {
      title: "Recipients",
      dataIndex: "total_recipients",
      key: "total_recipients",
      width: 90,
      align: "center",
    },
    {
      title: "Successful",
      dataIndex: "success_count",
      key: "success_count",
      width: 100,
      render: (count, record) => (
        <Tooltip
          title={`Delivered: ${record.delivered_count || 0} | Read: ${record.read_count || 0}`}
        >
          <div className="wc-count-success">✓ {count}</div>
        </Tooltip>
      ),
    },
    {
      title: "Failed",
      dataIndex: "failed_count",
      key: "failed_count",
      width: 80,
      render: (count) =>
        count > 0 ? (
          <div className="wc-count-failed">✕ {count}</div>
        ) : (
          <span className="wc-count-zero">0</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "campaign_status",
      key: "campaign_status",
      width: 110,
      render: (status) => {
        const s = String(status || "").toLowerCase();
        const badgeClass =
          s === "completed"
            ? "completed"
            : s === "failed"
              ? "failed"
              : "processing";
        const label =
          status === "Completed" || status === "Failed" ? status : "Processing";
        return <div className={`wc-status-badge ${badgeClass}`}>{label}</div>;
      },
    },
    {
      title: "Timing (IST)",
      key: "timing",
      width: 160,
      render: (_, record) => {
        const startTime = record.started_at || record.created_at || "—";
        const endTime = record.completed_at || "—";

        return (
          <EllipsisTooltip text={`Start: ${startTime} | End: ${endTime}`} />
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <Tooltip placement="top" title="Send Follow-up Template">
            <div
              onClick={() => setFollowupCampaign(record)}
              style={{
                cursor: "pointer",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px",
              }}
            >
              <PiShareFatBold size={16} />
            </div>
          </Tooltip>
        </div>
      ),
    },
  ];

  // If a campaign is selected, render the details view inline
  if (selectedCampaignForDetails) {
    return (
      <div style={{ marginTop: "4px" }}>
        <WhatsAppCampaignDetails
          inline={true}
          campaign={selectedCampaignForDetails}
          onClose={() => setSelectedCampaignForDetails(null)}
          onCampaignUpdated={() => {
            fetchCampaignsData({ pageNumber: 1 });
            fetchStatisticsData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="whatsapp-campaigns-tab-content">
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: "#111827",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaWhatsapp style={{ color: "#25D366" }} size={20} />
            WhatsApp Campaign Tracking
          </h2>
          <p
            style={{ margin: "3px 0 0 0", color: "#6b7280", fontSize: "11px" }}
          >
            Real-time delivery tracking, single & bulk campaign monitoring for
            AiSensy integration
          </p>
        </div>

        <div>
          <Tooltip placement="top" title="Refresh">
            <Button
              className="leadmanager_refresh_button"
              onClick={handleRefresh}
              disabled={loading || statsLoading}
            >
              <RedoOutlined
                className={`refresh_icon ${loading || statsLoading ? "spin-icon" : ""}`}
              />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Filters Bar reusing CommonOutlinedInput and CommonSelectField */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {/* Date Picker */}
          <div style={{ width: "270px", flexShrink: 0 }}>
            <CommonMuiCustomDatePicker
              width="270px"
              value={selectedDates}
              onDateChange={(dates) => {
                setSelectedDates(dates);
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchCampaignsData({
                  startDate: dates?.[0],
                  endDate: dates?.[1],
                  pageNumber: 1,
                });
                fetchStatisticsData({
                  startDate: dates?.[0],
                  endDate: dates?.[1],
                });
              }}
            />
          </div>

          {/* Search Campaign */}
          <div style={{ width: "220px", flexShrink: 0 }}>
            <CommonOutlinedInput
              label="Search Campaign..."
              width="100%"
              height="33px"
              labelFontSize="11px"
              icon={
                searchValue ? (
                  <div
                    className="users_filter_closeIconContainer"
                    onClick={() => {
                      setSearchValue("");
                      setPagination((prev) => ({ ...prev, page: 1 }));
                      fetchCampaignsData({
                        searchvalue: null,
                        pageNumber: 1,
                      });
                    }}
                  >
                    <IoIosClose size={11} />
                  </div>
                ) : (
                  <CiSearch size={16} />
                )
              }
              labelMarginTop="0px"
              onChange={handleSearchChange}
              value={searchValue}
              style={{
                padding: searchValue ? "0px 26px 0px 0px" : "0px 8px 0px 0px",
              }}
            />
          </div>

          {/* Select Type */}
          <div style={{ width: "140px", flexShrink: 0 }}>
            <CommonSelectField
              height="33px"
              label="Select Type"
              labelMarginTop="0px"
              labelFontSize="11px"
              options={campaignTypeOptions}
              showLabelStatus="Name"
              value={campaignTypeFilter}
              onChange={(e) => {
                const val = e.target.value;
                setCampaignTypeFilter(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchCampaignsData({
                  campaignType: val,
                  pageNumber: 1,
                });
              }}
            />
          </div>

          {/* Select Status */}
          <div style={{ width: "150px", flexShrink: 0 }}>
            <CommonSelectField
              height="33px"
              label="Select Status"
              labelMarginTop="0px"
              labelFontSize="11px"
              options={campaignStatusOptions}
              showLabelStatus="Name"
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value;
                setStatusFilter(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchCampaignsData({
                  status: val,
                  pageNumber: 1,
                });
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="campaign-summary-cards" style={{ marginBottom: "20px" }}>
        <Row gutter={[14, 14]}>
          {/* Card 1: Today's Campaigns */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="campaign-stat-card today-campaigns">
              <div className="stat-card-header">
                <span className="stat-card-title">TOTAL CAMPAIGNS TODAY</span>
                <span className="stat-card-icon campaigns">
                  <MdCampaign size={20} />
                </span>
              </div>
              <div className="stat-card-main-val">
                {statistics.today.total_campaigns}
              </div>
              <div className="stat-card-footer">
                <span className="badge-sub single">
                  Single: {statistics.today.single_campaigns}
                </span>
                <span className="badge-sub bulk">
                  Bulk: {statistics.today.bulk_campaigns}
                </span>
              </div>
            </div>
          </Col>

          {/* Card 2: Total Messages */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="campaign-stat-card total-messages">
              <div className="stat-card-header">
                <span className="stat-card-title">MESSAGES IN RANGE</span>
                <span className="stat-card-icon messages">
                  <BsChatDots size={17} />
                </span>
              </div>
              <div className="stat-card-main-val">
                {statistics.messages.total}
              </div>
              <div className="stat-card-footer">
                <span style={{ color: "#059669", fontWeight: 600 }}>
                  Sent: {statistics.messages.sent}
                </span>
                <span style={{ color: "#6b7280" }}>|</span>
                <span style={{ color: "#d97706", fontWeight: 600 }}>
                  Pending: {statistics.messages.pending}
                </span>
              </div>
            </div>
          </Col>

          {/* Card 3: Delivered & Read */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="campaign-stat-card delivery-stats">
              <div className="stat-card-header">
                <span className="stat-card-title">DELIVERED & READ</span>
                <span className="stat-card-icon delivered">
                  <BsCheck2All size={20} />
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "10px",
                }}
              >
                <span
                  className="stat-card-main-val"
                  style={{ color: "#0891b2" }}
                >
                  {statistics.messages.delivered}
                </span>
                <span style={{ fontSize: "14px", color: "#6b7280" }}>
                  / Read:{" "}
                  <strong style={{ color: "#2563eb" }}>
                    {statistics.messages.read}
                  </strong>
                </span>
              </div>
              <div className="stat-card-footer">
                <span style={{ color: "#0891b2", fontSize: "12px" }}>
                  Delivery Rate:{" "}
                  <strong>
                    {statistics.messages.total > 0
                      ? Math.round(
                          (statistics.messages.delivered /
                            statistics.messages.total) *
                            100,
                        )
                      : 0}
                    %
                  </strong>
                </span>
              </div>
            </div>
          </Col>

          {/* Card 4: Failed Messages */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="campaign-stat-card failed-stats">
              <div className="stat-card-header">
                <span className="stat-card-title">FAILED ATTEMPTS</span>
                <span className="stat-card-icon failed">
                  <BsExclamationTriangle size={16} />
                </span>
              </div>
              <div
                className="stat-card-main-val"
                style={{
                  // color: statistics.messages.failed > 0 ? "#ef4444" : "#10b981",
                  color: "#ef4444",
                }}
              >
                {statistics.messages.failed}
              </div>
              <div className="stat-card-footer">
                <span
                  style={{
                    color: "#ef4444",
                  }}
                >
                  {statistics.messages.failed === 0
                    ? "All messages dispatched cleanly"
                    : "Needs review / attention"}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Campaigns History Table */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Campaign Execution History
          </h3>
        </div>

        <CommonTable
          scroll={{ x: 1100 }}
          columns={columns}
          dataSource={campaigns}
          loading={loading}
          dataPerPage={10}
          size="small"
          checkBox={"false"}
          className="questionupload_table"
          rowKey={(record) => record.id}
          onPaginationChange={handlePaginationChange}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
        />

        {/* Follow-up Template Modal from Campaign Row */}
        <SendFollowupTemplateModal
          isOpen={Boolean(followupCampaign)}
          onClose={() => setFollowupCampaign(null)}
          campaign={followupCampaign}
          onSuccess={() => {
            fetchCampaignsData({ pageNumber: 1 });
            fetchStatisticsData();
          }}
        />
      </div>
    </div>
  );
}
