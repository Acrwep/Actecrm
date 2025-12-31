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
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";

export default function TransactionReport() {
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

  const columns = [
    {
      title: "Entry Date",
      key: "entry_date",
      dataIndex: "entry_date",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Paid Date",
      key: "paid_date",
      dataIndex: "paid_date",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 100,
    },
    {
      title: "Branch Name",
      key: "branch_name",
      dataIndex: "branch_name",
      width: 140,
      render: (text) => {
        return (
          <>
            {text && text.length > 20 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 19) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text ? text : "-"}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Lead Executive",
      key: "closed_by",
      dataIndex: "closed_by",
      width: 130,
      render: (text) => {
        return (
          <>
            {text && text.length > 16 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 15) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text ? text : "-"}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Collection Type",
      key: "collection_type",
      dataIndex: "collection_type",
      width: 120,
      render: (text) => {
        if (text) {
          const type = text.toLowerCase();
          if (type.includes("new")) {
            return <div className="transactionreport_new_type">{text}</div>;
          } else if (type.includes("lmj")) {
            return <div className="transactionreport_lmj_type">{text}</div>;
          } else if (type.includes("cmj")) {
            return <div className="transactionreport_cmj_type">{text}</div>;
          } else if (type.includes("pmj")) {
            return <div className="transactionreport_pmj_type">{text}</div>;
          } else {
            <p>{text}</p>;
          }
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "Joined Date",
      key: "cus_reg_date",
      dataIndex: "cus_reg_date",
      width: 100,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Name",
      key: "cus_name",
      dataIndex: "cus_name",
      width: 130,
      render: (text) => {
        return (
          <>
            {text && text.length > 16 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 15) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text ? text : "-"}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Mobile",
      key: "cus_phone",
      dataIndex: "cus_phone",
      width: 100,
    },
    {
      title: "Course",
      key: "course_name",
      dataIndex: "course_name",
      width: 130,
      render: (text) => {
        return (
          <>
            {text && text.length > 16 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 15) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text ? text : "-"}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Place of payment",
      key: "place_of_payment",
      dataIndex: "place_of_payment",
      width: 130,
      render: (text) => {
        if (text) {
          if (text == "Tamil Nadu") {
            return (
              <div
                className="transactionreport_lmj_type"
                style={{ textTransform: "none" }}
              >
                Tamil Nadu
              </div>
            );
          } else if (text == "Out of TN") {
            return (
              <div
                className="transactionreport_cmj_type"
                style={{ textTransform: "none" }}
              >
                Out of TN
              </div>
            );
          } else if (text == "Out of IND") {
            return (
              <div
                className="transactionreport_pmj_type"
                style={{ textTransform: "none" }}
              >
                Out of IND
              </div>
            );
          }
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "Course Fees",
      key: "course_fees",
      dataIndex: "course_fees",
      width: 100,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "GST",
      key: "gst_amount",
      dataIndex: "gst_amount",
      width: 80,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Total Fees",
      key: "total_course_fees",
      dataIndex: "total_course_fees",
      width: 95,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Fees Balance",
      key: "fees_balance",
      dataIndex: "fees_balance",
      width: 105,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Paid Amount",
      key: "paid_amount",
      dataIndex: "paid_amount",
      width: 105,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Conv.Fee",
      key: "convenience_fees",
      dataIndex: "convenience_fees",
      width: 80,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Collected Fees",
      key: "collected_fees",
      dataIndex: "collected_fees",
      width: 115,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Balance Due",
      key: "balance_due",
      dataIndex: "balance_due",
      width: 110,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Transacted To",
      key: "transacted_to",
      dataIndex: "transacted_to",
      width: 110,
    },
    {
      title: "Collected By",
      key: "collected_by",
      dataIndex: "collected_by",
      width: 110,
      render: (text) => {
        return (
          <>
            {text && text.length > 16 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 15) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text ? text : "-"}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Payment Status",
      key: "payment_status",
      dataIndex: "payment_status",
      width: 120,
    },
    {
      title: "Verified Date",
      key: "verified_date",
      dataIndex: "verified_date",
      width: 110,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
  ];

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

  const getTransactionReportData = async (startDate, endDate) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await transactionReport(payload);
      console.log("transaction report response", response);
      setReportData(response?.data?.data || []);
    } catch (error) {
      setReportData([]);
      setTotalCounts(null);
      console.log("transaction report error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

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
                    limit: pagination.limit,
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
                DownloadTableAsCSV(
                  reportData,
                  columns,
                  `${moment(selectedDates[0]).format(
                    "DD MMMM YYYY"
                  )} to ${moment(selectedDates[1]).format(
                    "DD MMMM YYYY"
                  )} Transaction Report.csv`
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
          scroll={{ x: 1300 }}
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
        />
      </div>
    </div>
  );
}
