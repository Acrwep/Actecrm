import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import {
  customizeStartDateAndEndDate,
  getCurrentandPreviousweekDate,
  getLast3Months,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import CommonDoubleMonthPicker from "../Common/CommonDoubleMonthPicker";
import {
  getAllDownlineUsers,
  transactionReport,
  userwiseLeadsAnalysisReports,
  userwiseSalesAnalysisReports,
  userwiseTransactionReport,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";

export default function UserwiseTransactionReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);

  const [selectedDates, setSelectedDates] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [totalCounts, setTotalCounts] = useState(null);
  const [loginUserId, setLoginUserId] = useState("");
  const [loading, setLoading] = useState(true);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setSelectedDates(PreviousAndCurrentDate);

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setLoginUserId(convertAsJson?.user_id);
      getTransactionReportData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1]
      );
    }
  }, [childUsers]);

  const getColumns = (data) => {
    if (!data || !data.length) return [];

    const firstRow = data[0];

    return [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        fixed: "left",
        render: (text) => (text === "total" ? "Total" : text),
      },
      ...Object.keys(firstRow)
        .filter((key) => key !== "date" && key !== "key")
        .map((name) => ({
          title: name,
          dataIndex: name,
          key: name,
          render: (value, record) => {
            const amount = Number(value || 0).toLocaleString("en-IN");

            // 🔥 Add ₹ only for TOTAL row
            return record.date === "total" ? (
              <p style={{ fontWeight: 600 }}>{"₹" + amount}</p>
            ) : (
              <p>{amount}</p>
            );
          },
        })),
    ];
  };

  const getTransactionReportData = async (startDate, endDate) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await userwiseTransactionReport(payload);
      console.log("userwise transaction report response", response);
      const apiRows = response?.data?.data || []; // 🔥 IMPORTANT FIX

      const formatted = apiRows.map((row, index) => ({
        key: index,
        ...row,
      }));

      setReportData(formatted);
    } catch (error) {
      setReportData([]);
      setTotalCounts(null);
      console.log("userwise transaction report error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const columns = getColumns(reportData);

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
      limit: 100,
    });
    getTransactionReportData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[0]
    );
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={16}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                    limit: 100,
                  });
                  getTransactionReportData(dates[0], dates[1]);
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={7}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <Tooltip placement="top" title="Download">
            <Button
              className="reports_download_button"
              onClick={() => {
                const formattedData = reportData.map((row) => ({
                  ...row,
                  date:
                    row.date === "total"
                      ? "Total"
                      : moment(row.date, "DD/MM/YYYY").format("YYYY-MM-DD"), // Excel-safe
                }));
                DownloadTableAsCSV(
                  formattedData,
                  columns,
                  `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
                    selectedDates[1]
                  ).format("DD-MM-YYYY")} Userwise Transaction Report.csv`
                );
              }}
            >
              <DownloadOutlined size={10} className="download_icon" />
            </Button>
          </Tooltip>

          <Tooltip placement="top" title="Refresh">
            <Button
              className="leadmanager_refresh_button"
              onClick={handleRefresh}
            >
              <RedoOutlined className="refresh_icon" />
            </Button>
          </Tooltip>
        </Col>
      </Row>

      <div style={{ marginTop: "30px" }}>
        <CommonTable
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={reportData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="paymentreport_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
          rowClassName={(record, index) =>
            record.date === "total" ? "total-row-bg" : ""
          }
        />
      </div>
    </div>
  );
}
