import React, { useState, useEffect } from "react";
import "./styles.css";
import { Button, Col, message, Row, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import PreSalesReports from "./PreSalesReports";
import { FiUsers, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { LuIndianRupee } from "react-icons/lu";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { TbReportAnalytics } from "react-icons/tb";
import { getPreSalesReportsSummaryCounts } from "../ApiService/action";
import { getCurrentandPreviousweekDate } from "../Common/Validation";

export default function NewReports() {
  const [activeReport, setActiveReport] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summaryCounts, setSummaryCounts] = useState(null);

  // Available Report Portal Cards (Compact Angle + Subtext + View Report Action)
  const reportCards = [
    {
      id: "presales",
      title: "Pre-Sales Report",
      countKey: "all",
      subtext: "Total Leads",
      icon: <FiUsers />,
      theme: "leads",
      available: true,
    },
    {
      id: "admissions",
      title: "Admissions Report",
      countKey: "admission_total",
      subtext: "Total Joinings",
      icon: <HiOutlineAcademicCap />,
      theme: "admissions",
      available: false,
    },
    // {
    //   id: "revenue",
    //   title: "Revenue Report",
    //   count: "₹35.5L",
    //   subtext: "Total Revenue",
    //   icon: <LuIndianRupee />,
    //   theme: "revenue",
    //   available: false,
    // },
    // {
    //   id: "attention",
    //   title: "Attention Report",
    //   count: "53",
    //   subtext: "Total Overdue",
    //   icon: <FiAlertCircle />,
    //   theme: "attention",
    //   available: false,
    // },
  ];

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    fetchNewReportsSummary(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
    );
  }, []);

  const fetchNewReportsSummary = async (startDate, endDate) => {
    const payload = {
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await getPreSalesReportsSummaryCounts(payload);
      console.log("summary response", response);
      setSummaryCounts(response?.data?.data?.bucket_counts || null);
    } catch (error) {
      setSummaryCounts(null);
      console.log("summary error", error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 600);
    }
  };

  const handleCardClick = (card) => {
    if (card.id === "presales") {
      setActiveReport("presales");
    } else {
      message.info(`${card.title} is coming soon`);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    fetchNewReportsSummary(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
    );
  };

  // If user selected the Pre-Sales report, render the dedicated PreSalesReports component
  if (activeReport === "presales") {
    return (
      <PreSalesReports
        onBack={() => setActiveReport(null)}
        summaryStartAndEndDate={selectedDates}
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
                fetchNewReportsSummary(dates[0], dates[1]);
              }}
            />
            <Tooltip placement="top" title="Refresh">
              <Button
                className="newreports_refresh_button"
                onClick={handleRefresh}
                aria-label="Refresh Report"
                disabled={isRefreshing}
              >
                <RedoOutlined className="refresh_icon" spin={isRefreshing} />
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </div>

      {/* Report Cards Grid (Compact Horizontal Angle + Subtext + View Report Button) */}
      <Row gutter={[16, 16]}>
        {reportCards.map((card) => {
          const count = summaryCounts?.[card.countKey] ?? "-";

          return (
            <Col xs={24} sm={12} lg={12} xl={6} key={card.id}>
              <div
                className={`mgmt_card mgmt_card_clickable mgmt_theme_${card.theme}`}
                onClick={() => handleCardClick(card)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleCardClick(card);
                }}
              >
                <div className="mgmt_card_top_row">
                  <div className="mgmt_card_icon_circle">{card.icon}</div>
                  <div className="mgmt_card_content">
                    <h3 className="mgmt_card_title">{card.title}</h3>
                    <div className="mgmt_card_count_row">
                      <span className="mgmt_card_count">{count}</span>
                    </div>
                    <p className="mgmt_card_subtext">{card.subtext}</p>
                  </div>
                </div>

                <div className="mgmt_card_footer">
                  <span className="mgmt_card_action_hint">
                    View Report{" "}
                    <FiArrowRight className="mgmt_card_action_arrow" />
                  </span>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
