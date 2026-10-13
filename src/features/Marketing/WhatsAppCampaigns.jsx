import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import { FiRefreshCw, FiEye } from "react-icons/fi";
import { FaWhatsapp, FaPlus } from "react-icons/fa";
import CommonTable from "../Common/CommonTable";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import WhatsappTemplate from "./WhatsappTemplate";
import WhatsAppCampaignDetailsModal from "./WhatsAppCampaignDetailsModal";
import {
  getWhatsAppCampaigns,
  getWhatsAppCampaignStatistics,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import moment from "moment";
import "./styles.css";
import EllipsisTooltip from "../Common/EllipsisTooltip";

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

  // Search debounce ref
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchStatistics();
    fetchCampaigns(1);
  }, [selectedDates, campaignTypeFilter, statusFilter]);

  const fetchStatistics = async (dates = selectedDates) => {
    setStatsLoading(true);
    try {
      const [from, to] = dates || [];
      const res = await getWhatsAppCampaignStatistics({
        fromDate: from || moment().format("YYYY-MM-DD"),
        toDate: to || moment().format("YYYY-MM-DD"),
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

  const fetchCampaigns = async (
    page = 1,
    search = searchValue,
    type = campaignTypeFilter,
    status = statusFilter,
    dates = selectedDates,
  ) => {
    setLoading(true);
    try {
      const [from, to] = dates || [];
      const res = await getWhatsAppCampaigns({
        page,
        limit: pagination.limit,
        search,
        campaignType: type,
        status: status,
        fromDate: from,
        toDate: to,
      });

      if (res?.data?.success) {
        setCampaigns(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
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
    const val = e.target.value;
    setSearchValue(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchCampaigns(1, val);
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
    setPagination((prev) => ({ ...prev, page: 1 }));

    fetchStatistics(defaultDates);
    fetchCampaigns(1, "", "", "", defaultDates);
  };

  const handleViewDetails = (record) => {
    setSelectedCampaignForDetails(record);
  };

  const handlePaginationChange = ({ page, limit }) => {
    fetchCampaigns(page, searchValue);
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
      dataIndex: "created_by",
      key: "created_by",
      width: 110,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
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
      render: (_, record) => (
        <Tooltip
          placement="top"
          title="View Campaign Details"
          trigger={["hover", "click"]}
        >
          <div onClick={() => handleViewDetails(record)}>
            <FaRegEye
              size={15}
              className="trainers_action_icons"
              style={{ flexShrink: 0 }}
            />
          </div>
        </Tooltip>
      ),
    },
  ];

  // If a campaign is selected, render the details view inline
  if (selectedCampaignForDetails) {
    return (
      <div style={{ marginTop: "4px" }}>
        <WhatsAppCampaignDetailsModal
          inline={true}
          campaign={selectedCampaignForDetails}
          onClose={() => setSelectedCampaignForDetails(null)}
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
            >
              <RedoOutlined className="refresh_icon" />
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
              dateFontSize="12px"
              value={selectedDates}
              onDateChange={(dates) => {
                setSelectedDates(dates);
                setPagination((prev) => ({ ...prev, page: 1 }));
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
                      fetchCampaigns(1, "");
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
                setCampaignTypeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
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
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
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
                <span
                  className="stat-card-icon"
                  style={{ background: "#eff6ff", color: "#3b82f6" }}
                >
                  📊
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
                <span
                  className="stat-card-icon"
                  style={{ background: "#f0fdf4", color: "#16a34a" }}
                >
                  💬
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
                <span
                  className="stat-card-icon"
                  style={{ background: "#ecfeff", color: "#0891b2" }}
                >
                  ✓✓
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
                <span
                  className="stat-card-icon"
                  style={{ background: "#fef2f2", color: "#ef4444" }}
                >
                  ⚠️
                </span>
              </div>
              <div
                className="stat-card-main-val"
                style={{
                  color: statistics.messages.failed > 0 ? "#ef4444" : "#10b981",
                }}
              >
                {statistics.messages.failed}
              </div>
              <div className="stat-card-footer">
                <span
                  style={{
                    color:
                      statistics.messages.failed > 0 ? "#dc2626" : "#059669",
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
      <div>
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
      </div>
    </div>
  );
}
