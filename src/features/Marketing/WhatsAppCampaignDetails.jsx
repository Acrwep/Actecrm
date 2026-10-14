import React, { useState, useEffect } from "react";
import { Modal, Tooltip, Button, Row, Col, Progress, message } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { FiCopy, FiCheck, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import CommonTable from "../Common/CommonTable";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import { getWhatsAppCampaignMessages } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import "./styles.css";
import EllipsisTooltip from "../Common/EllipsisTooltip";

const recipientStatusOptions = [
  { id: "", name: "All Status" },
  { id: "Sent", name: "Sent" },
  { id: "Delivered", name: "Delivered" },
  { id: "Read", name: "Read" },
  { id: "Pending", name: "Pending" },
  { id: "Failed", name: "Failed" },
];

export default function WhatsAppCampaignDetails({
  isOpen,
  onClose,
  campaign,
  inline = false,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if ((isOpen || inline) && campaign?.campaign_id) {
      setSearchText("");
      setStatusFilter("");
      fetchMessages(1, "", "");
    } else {
      setMessages([]);
    }
  }, [isOpen, inline, campaign?.campaign_id]);

  const fetchMessages = async (
    page = 1,
    search = searchText,
    status = statusFilter,
  ) => {
    if (!campaign?.campaign_id) return;
    setLoading(true);
    try {
      const response = await getWhatsAppCampaignMessages(campaign.campaign_id, {
        page,
        limit: pagination.limit,
        search,
        status,
      });

      if (response?.data?.success) {
        setMessages(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        CommonMessage(
          "error",
          response?.data?.message || "Failed to load messages",
        );
      }
    } catch (error) {
      console.error("Error fetching campaign messages:", error);
      CommonMessage("error", "Failed to fetch recipient messages");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    message.success("Copied message ID!");
    setTimeout(() => setCopiedId(""), 2000);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchText(val);
    fetchMessages(1, val, statusFilter);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    fetchMessages(1, searchText, val);
  };

  const handlePaginationChange = ({ page, limit }) => {
    fetchMessages(page, searchText, statusFilter);
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    let badgeClass = "pending";
    let label = "Pending";

    if (s === "delivered") {
      badgeClass = "delivered";
      label = "Delivered";
    } else if (s === "read") {
      badgeClass = "read";
      label = "Read";
    } else if (s === "sent") {
      badgeClass = "sent";
      label = "Sent";
    } else if (s === "failed") {
      badgeClass = "failed";
      label = "Failed";
    }

    return <div className={`wcd-status-badge ${badgeClass}`}>{label}</div>;
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
      title: "Recipient Name",
      dataIndex: "recipient_name",
      key: "recipient_name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Mobile Number",
      dataIndex: "mobile_number",
      key: "mobile_number",
      width: 140,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Status",
      dataIndex: "message_status",
      key: "message_status",
      width: 110,
      render: (status) => getStatusBadge(status),
    },
    {
      title: "AiSensy Message ID",
      dataIndex: "aisensy_message_id",
      key: "aisensy_message_id",
      width: 220,
      render: (text) =>
        text ? (
          <div className="wcd-message-id-wrap">
            <EllipsisTooltip text={text} />
            <button
              onClick={() => handleCopy(text)}
              className={`wcd-copy-btn ${copiedId === text ? "copied" : ""}`}
              title="Copy ID"
            >
              {copiedId === text ? <FiCheck size={13} /> : <FiCopy size={13} />}
            </button>
          </div>
        ) : (
          <span className="wcd-text-muted-italic">Not assigned yet</span>
        ),
    },
    {
      title: "Sent At",
      dataIndex: "sent_at",
      key: "sent_at",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Delivered / Read",
      key: "delivery_info",
      width: 160,
      render: (_, record) => (
        <div className="wcd-delivery-info">
          {record.delivered_at && (
            <span className="wcd-delivered-at">
              ✓ Del: {record.delivered_at.split(" ")[1] || record.delivered_at}
            </span>
          )}
          {record.read_at && (
            <span className="wcd-read-at">
              ✓✓ Read: {record.read_at.split(" ")[1] || record.read_at}
            </span>
          )}
          {!record.delivered_at && !record.read_at && (
            <span className="wcd-empty-dash">—</span>
          )}
        </div>
      ),
    },
    {
      title: "Error / Notes",
      dataIndex: "error_message",
      key: "error_message",
      width: 180,
      render: (text) =>
        text ? (
          <Tooltip title={text} placement="topLeft">
            <span className="wcd-error-text">
              <FiAlertCircle className="wcd-error-icon" />
              {text}
            </span>
          </Tooltip>
        ) : (
          <span className="wcd-empty-dash">—</span>
        ),
    },
  ];

  const total = campaign?.total_recipients || 0;
  const success = campaign?.success_count || 0;
  const failed = campaign?.failed_count || 0;
  const pending = campaign?.pending_count || 0;
  const delivered = campaign?.delivered_count || 0;
  const read = campaign?.read_count || 0;
  const successPct = total > 0 ? Math.round((success / total) * 100) : 0;

  const content = (
    <div>
      {/* Header Bar */}
      <div className="wcd-header-bar">
        <div className="wcd-header-top-row">
          <div className="wcd-header-left">
            {inline && (
              <Tooltip placement="top" title="Back to Campaigns">
                <Button onClick={onClose} className="wcd-back-btn">
                  <FiArrowLeft size={16} />
                </Button>
              </Tooltip>
            )}
            <div>
              <div className="wcd-title-group">
                <h2 className={`wcd-title ${!inline ? "modal-mode" : ""}`}>
                  {campaign?.campaign_name || "Campaign Details"}
                </h2>
                <div
                  className={`wcd-type-badge ${
                    campaign?.campaign_type === "Bulk" ? "bulk" : "single"
                  }`}
                >
                  {campaign?.campaign_type || "Single"}
                </div>
                <div
                  className={`wcd-campaign-status-badge ${
                    campaign?.campaign_status === "Completed"
                      ? "completed"
                      : campaign?.campaign_status === "Failed"
                        ? "failed"
                        : "processing"
                  }`}
                >
                  {campaign?.campaign_status || "Processing"}
                </div>
              </div>
              <div className="wcd-meta-row">
                <div
                  style={{ display: "flex", gap: "4px", alignItems: "center" }}
                >
                  <strong>ID:</strong>{" "}
                  <p className="wcd-id-badge">{campaign?.campaign_id}</p>
                </div>
                <span>
                  <strong>Region:</strong> {campaign?.region_name || "N/A"}
                </span>
                <span>
                  <strong>Branch:</strong> {campaign?.branch_name || "N/A"}
                </span>
                <span>
                  <strong>Template:</strong> {campaign?.template_name || "N/A"}
                </span>
                <span>
                  <strong>Created By:</strong>{" "}
                  {campaign?.created_by_view_user_id || "CRM User"}
                </span>
              </div>
            </div>
          </div>
          <div>
            <Tooltip placement="top" title="Refresh">
              <Button
                className="leadmanager_refresh_button"
                onClick={() => {
                  setSearchText("");
                  setStatusFilter("");
                  fetchMessages(1, "", "");
                }}
              >
                <RedoOutlined className="refresh_icon" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Progress & Quick Stats Card */}
        <div className="wcd-stats-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={10}>
              <div className="wcd-progress-label-row">
                <span className="wcd-progress-label">Send Progress</span>
                <span className="wcd-progress-pct">
                  {successPct}% ({success} / {total})
                </span>
              </div>
              <Progress
                percent={successPct}
                status={
                  failed > 0 && success === 0
                    ? "exception"
                    : successPct === 100
                      ? "success"
                      : "active"
                }
                showInfo={false}
                strokeColor="#10b981"
              />
            </Col>
            <Col xs={24} md={14}>
              <div className="wcd-quick-stats-group">
                <div className="wcd-stat-item wcd-stat-total">
                  <div className="wcd-stat-title">Total</div>
                  <div className="wcd-stat-value">{total}</div>
                </div>
                <div className="wcd-stat-item wcd-stat-sent">
                  <div className="wcd-stat-title">Sent</div>
                  <div className="wcd-stat-value">{success}</div>
                </div>
                <div className="wcd-stat-item wcd-stat-delivered">
                  <div className="wcd-stat-title">Delivered</div>
                  <div className="wcd-stat-value">{delivered}</div>
                </div>
                <div className="wcd-stat-item wcd-stat-read">
                  <div className="wcd-stat-title">Read</div>
                  <div className="wcd-stat-value">{read}</div>
                </div>
                <div className="wcd-stat-item wcd-stat-failed">
                  <div className="wcd-stat-title">Failed</div>
                  <div className="wcd-stat-value">{failed}</div>
                </div>
                <div className="wcd-stat-item wcd-stat-pending">
                  <div className="wcd-stat-title">Pending</div>
                  <div className="wcd-stat-value">{pending}</div>
                </div>
              </div>
            </Col>
          </Row>
          <div className="wcd-dates-row">
            <span>
              <strong>Started:</strong> {campaign?.started_at || "—"}
            </span>
            <span>
              <strong>Completed:</strong>{" "}
              {campaign?.completed_at || (pending > 0 ? "Processing..." : "—")}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar using CommonOutlinedInput and CommonSelectField */}
      <Row style={{ marginBottom: "20px" }}>
        <Col xs={24} sm={24} md={24} lg={12} xxl={12}>
          <Row gutter={12}>
            <Col xs={24} sm={24} md={24} lg={12} xxl={12}>
              <CommonOutlinedInput
                label="Search recipient name, mobile..."
                width="100%"
                height="33px"
                labelFontSize="11px"
                icon={
                  searchText ? (
                    <div
                      className="users_filter_closeIconContainer"
                      onClick={() => {
                        setSearchText("");
                        fetchMessages(1, "", statusFilter);
                      }}
                    >
                      <IoIosClose size={11} />
                    </div>
                  ) : (
                    <CiSearch size={16} />
                  )
                }
                labelMarginTop="0px"
                onChange={handleSearch}
                value={searchText}
                style={{
                  padding: searchText ? "0px 26px 0px 0px" : "0px 8px 0px 0px",
                }}
              />
            </Col>

            <Col xs={24} sm={24} md={24} lg={9} xxl={9}>
              <CommonSelectField
                height="33px"
                label="Filter Status"
                labelMarginTop="0px"
                labelFontSize="11px"
                options={recipientStatusOptions}
                showLabelStatus="Name"
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Recipient Messages Table */}
      <CommonTable
        scroll={{ x: 1050 }}
        columns={columns}
        dataSource={messages}
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
  );

  if (inline) {
    return <div>{content}</div>;
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1050}
      title={null}
      centered
      destroyOnClose
      className="whatsapp-campaign-details-modal"
    >
      {content}
    </Modal>
  );
}
