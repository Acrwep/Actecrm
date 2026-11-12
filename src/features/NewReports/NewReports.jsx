import React, { useState, useEffect } from "react";
import "./styles.css";
import { Button, Col, message, Row, Tooltip, Skeleton } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import PreSalesReports from "./PreSalesReports";
import AdmissionReport from "./AdmissionReport";
import PostSalesReport from "./PostSalesReport";
import AccountsReport from "./AccountsReport";
import TrainerPaymentReport from "./TrainerPaymentReport";
import { FiUsers, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { FaIndianRupeeSign, FaMoneyBillWave } from "react-icons/fa6";
import {
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { TbReportAnalytics } from "react-icons/tb";
import {
  getNewReportsSummaryCounts,
  getRoles,
  getUsersByTheirRole,
} from "../ApiService/action";
import {
  getCurrentandPreviousweekDate,
  formatIndianNumber,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import moment from "moment";

/**
 * Dedicated Skeleton Loader for Management Summary Portal Cards
 */
function NewReportsSkeleton({ cardCount = 4 }) {
  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: cardCount }).map((_, i) => (
        <Col xs={24} sm={12} md={12} lg={6} xl={6} key={i}>
          <div className="mgmt_card" style={{ cursor: "default" }}>
            <div className="mgmt_card_top_row">
              <Skeleton.Avatar
                active
                size={44}
                shape="circle"
                style={{ flexShrink: 0 }}
              />
              <div
                className="mgmt_card_content"
                style={{ width: "100%", gap: 6 }}
              >
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 120, height: 16 }}
                />
                <Skeleton.Input
                  active
                  style={{ width: 75, height: 26, margin: "2px 0" }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 85, height: 13 }}
                />
              </div>
            </div>

            <div className="mgmt_card_footer" style={{ marginTop: 10 }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 90, height: 14 }}
              />
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
}

export default function NewReports() {
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [activeReport, setActiveReport] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summaryCounts, setSummaryCounts] = useState(null);
  const [saleDownliners, setSaleDownliners] = useState([]);
  const [saleRoleId, setSaleRoleId] = useState(null);
  const [roleIds, setRoleIds] = useState(null);

  // Available Report Portal Cards (Compact Angle + Subtext + View Report Action)
  const reportCards = [
    {
      id: "presales",
      title: "Pre-Sales Report",
      countKey: "total_leads",
      subtext: "Total Leads",
      icon: <FiUsers />,
      theme: "leads",
    },
    {
      id: "admissions",
      title: "Admissions Report",
      countKey: "admission_total",
      subtext: "Total Joinings",
      icon: <HiOutlineAcademicCap />,
      theme: "admissions",
    },
    {
      id: "postsales",
      title: "Post-Sales Report",
      countKey: "postsales_total",
      subtext: "Total Customers",
      icon: <HiOutlineClipboardDocumentCheck />,
      theme: "postsales",
    },
    {
      id: "accounts",
      title: "Accounts",
      countKey: "total_collection",
      subtext: "Total Collections",
      icon: <FaIndianRupeeSign />,
      theme: "accounts",
    },
    {
      id: "trainer_payments",
      title: "Trainer Payments",
      countKey: "trainer_payments_total",
      subtext: "Disbursements & Liabilities",
      icon: <FaMoneyBillWave />,
      theme: "trainer_payments",
    },
  ];

  useEffect(() => {
    if (downlineUsers.length >= 1) {
      getRolesData();
    }
  }, [downlineUsers]);

  const getRolesData = async () => {
    try {
      const response = await getRoles();
      console.log("roles response", response);
      const roles_data = response?.data?.data || [];

      const sale_role_id = roles_data.find(
        (role) => role.role_name?.toLowerCase() === "sale",
      )?.role_id;

      const ra_role_id = roles_data.find(
        (role) => role.role_name?.toLowerCase() === "ra",
      )?.role_id;

      const hr_role_id = roles_data.find(
        (role) => role.role_name?.toLowerCase() === "hr",
      )?.role_id;

      setRoleIds({
        sale_role_id: sale_role_id,
        ra_role_id: ra_role_id,
        hr_role_id: hr_role_id,
      });
      setSaleRoleId(sale_role_id);
      getSaleUsersData(sale_role_id);
    } catch (error) {
      console.log("roles error", error);
      setSaleRoleId(null);
    }
  };

  const getSaleUsersData = async (sale_role_id) => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    const payload = {
      roles: [sale_role_id],
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsersByTheirRole(payload);
      console.log("get sale users response", response);
      const sale_users = response?.data?.data || [];

      const sale_downlines = downlineUsers.filter((downline) =>
        sale_users.some((user) => user.user_id === downline.user_id),
      );
      console.log("sale downliners", sale_downlines);
      setSaleDownliners(sale_downlines);

      fetchNewReportsSummary({
        startDate: PreviousAndCurrentDate[0],
        endDate: PreviousAndCurrentDate[1],
        user_ids: sale_downlines.map((su) => su.user_id),
      });
    } catch (error) {
      console.log("get sale users error", error);
      setIsLoading(false);
    }
  };

  const fetchNewReportsSummary = async (overrides = {}) => {
    getNewReportsSummary(
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null,
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null,
      overrides.user_ids !== undefined
        ? overrides.user_ids
        : saleDownliners.map((su) => su.user_id),
    );
  };

  const getNewReportsSummary = async (startDate, endDate, user_ids) => {
    setIsLoading(true);
    const formattedStartDate = startDate
      ? moment(startDate).format("YYYY-MM-DD")
      : undefined;
    const formattedEndDate = endDate
      ? moment(endDate).format("YYYY-MM-DD")
      : undefined;

    const payload = {
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      ...(user_ids && user_ids.length >= 1
        ? { user_ids: user_ids }
        : { user_ids: [] }),
    };

    try {
      const summary_response = await getNewReportsSummaryCounts(payload);
      console.log("summary response", summary_response);
      const summary_counts =
        summary_response?.data?.data?.bucket_counts || null;

      setSummaryCounts({
        total_leads: summary_counts?.all || 0,
        admission_total: summary_counts?.admission_total || 0,
        postsales_total: summary_counts?.admission_total || 0,
        total_collection: summary_counts?.total_collection || 0,
      });
    } catch (error) {
      setSummaryCounts(null);
      console.log("summary error", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 400);
    }
  };

  const handleCardClick = (card) => {
    if (card.id === "presales") {
      setActiveReport("presales");
    } else if (card.id === "admissions") {
      setActiveReport("admissions");
    } else if (card.id === "postsales") {
      setActiveReport("postsales");
    } else if (card.id === "accounts") {
      setActiveReport("accounts");
    }
    //  else if (card.id === "trainer_payments") {
    //   setActiveReport("trainer_payments");
    // }
    else {
      message.info(`${card.title} is coming soon`);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    fetchNewReportsSummary({
      startDate: PreviousAndCurrentDate[0],
      endDate: PreviousAndCurrentDate[1],
    });
  };

  // If user selected the Pre-Sales report, render the dedicated PreSalesReports component
  if (activeReport === "presales") {
    return (
      <PreSalesReports
        onBack={() => setActiveReport(null)}
        summaryStartAndEndDate={selectedDates}
        saleRoleId={saleRoleId}
      />
    );
  }

  // If user selected the Admissions report, render the dedicated AdmissionReport component
  if (activeReport === "admissions") {
    return (
      <AdmissionReport
        onBack={() => setActiveReport(null)}
        summaryStartAndEndDate={selectedDates}
        roleIds={roleIds}
      />
    );
  }

  // If user selected the Post-Sales report, render the dedicated PostSalesReport component
  if (activeReport === "postsales") {
    return (
      <PostSalesReport
        onBack={() => setActiveReport(null)}
        summaryStartAndEndDate={selectedDates}
        roleIds={roleIds}
      />
    );
  }

  // If user selected the Accounts report, render the dedicated AccountsReport component
  if (activeReport === "accounts") {
    return (
      <AccountsReport
        onBack={() => setActiveReport(null)}
        summaryStartAndEndDate={selectedDates}
        roleIds={roleIds}
      />
    );
  }

  // If user selected the Trainer Payments report, render TrainerPaymentReport
  if (activeReport === "trainer_payments") {
    return (
      <TrainerPaymentReport
        onBack={() => setActiveReport(null)}
        summaryStartAndEndDate={selectedDates}
        roleIds={roleIds}
      />
    );
  }

  // Otherwise, render the initial Report Cards Portal UI
  return (
    <div className="mgmt_summary_wrapper">
      {/* Header & Controls */}
      <div className="mgmt_header_card">
        <Row gutter={[0, 24]}>
          <Col xs={24} sm={24} md={24} lg={14}>
            <div className="mgmt_header_left">
              <div className="mgmt_header_icon_box">
                <TbReportAnalytics />
              </div>
              <div>
                <h1 className="mgmt_header_title">Management Summary</h1>
                <p className="mgmt_header_subtitle">
                  Select a report to view detailed metrics, performance
                  analytics, and breakdowns
                </p>
              </div>
            </div>
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
          >
            <CommonMuiCustomDatePicker
              label={"Select Date"}
              width="280px"
              value={selectedDates}
              onDateChange={(dates) => {
                setSelectedDates(dates);
                setIsLoading(true);
                fetchNewReportsSummary({
                  startDate: dates[0],
                  endDate: dates[1],
                });
              }}
            />
            <Tooltip placement="top" title="Refresh">
              <Button
                className="newreports_refresh_button"
                onClick={handleRefresh}
                aria-label="Refresh Report"
                disabled={isRefreshing || isLoading}
              >
                <RedoOutlined
                  className="refresh_icon"
                  spin={isRefreshing || isLoading}
                />
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </div>

      {/* Report Cards Grid (Compact Horizontal Angle + Subtext + View Report Button) */}
      {isLoading ? (
        <NewReportsSkeleton cardCount={reportCards.length} />
      ) : (
        <Row gutter={[16, 16]}>
          {reportCards.map((card) => {
            const rawCount = summaryCounts?.[card.countKey] ?? "-";
            const displayCount = formatIndianNumber(rawCount);

            return (
              <Col xs={24} sm={12} md={12} lg={6} xl={6} key={card.id}>
                <div
                  className={`mgmt_card mgmt_card_clickable mgmt_theme_${card.theme}`}
                  onClick={() => handleCardClick(card)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleCardClick(card);
                  }}
                >
                  <div className="mgmt_card_top_row">
                    <div className="mgmt_card_icon_circle">{card.icon}</div>
                    <div className="mgmt_card_content">
                      <h3 className="mgmt_card_title">{card.title}</h3>
                      <div className="mgmt_card_count_row">
                        <span
                          className="mgmt_card_count"
                          title={
                            rawCount !== "-"
                              ? typeof rawCount === "number"
                                ? rawCount.toLocaleString("en-IN")
                                : String(rawCount)
                              : undefined
                          }
                        >
                          {(card.id === "accounts" ||
                            card.id === "trainer_payments") &&
                          displayCount !== "-"
                            ? `₹${displayCount}`
                            : displayCount}
                        </span>
                      </div>
                      <p className="mgmt_card_subtext">{card.subtext}</p>
                    </div>
                  </div>

                  <div className="mgmt_card_footer">
                    <span className="mgmt_card_action_hint">
                      View Report
                      <FiArrowRight className="mgmt_card_action_arrow" />
                    </span>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
