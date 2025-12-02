import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, Spin } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import { PiHandCoins } from "react-icons/pi";
import { PiUsersThreeBold } from "react-icons/pi";
import { GoGraph } from "react-icons/go";
import { MdCurrencyRupee } from "react-icons/md";
import { MdOutlinePendingActions } from "react-icons/md";
import { MdHistory } from "react-icons/md";
import {
  customizeStartDateAndEndDate,
  getLast3Months,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import CommonDoubleMonthPicker from "../Common/CommonDoubleMonthPicker";
import {
  getAllDownlineUsers,
  getMonthwiseTotalCollectionReport,
  scoreBoardReports,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";

export default function LeadsScoreboardReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [selectedDates, setSelectedDates] = useState([]);
  const [startDateAndEndDate, setStartDateAndEndDate] = useState([]);
  const [allDownliners, setAllDownliners] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [totalCounts, setTotalCounts] = useState(null);
  const [loginUserId, setLoginUserId] = useState("");
  const [collectionHistory, setCollectionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionLoading, setCollectionLoading] = useState(false);
  //executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: "Month",
      key: "sale_month",
      dataIndex: "sale_month",
      width: 170,
      fixed: "left",
    },
    {
      title: "Total Leads",
      key: "leads",
      dataIndex: "leads",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Joinings",
      key: "joins",
      dataIndex: "joins",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Sale Volume",
      key: "sale_volume",
      dataIndex: "sale_volume",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Collection",
      key: "collection",
      dataIndex: "collection",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Total Collection",
      key: "total_collection",
      dataIndex: "total_collection",
      width: 140,
      render: (text, record) => {
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <p>{Number(text).toLocaleString("en-IN")}</p>
            {text == 0 ? (
              ""
            ) : (
              <Tooltip
                placement="bottomLeft"
                color="#fff"
                trigger={["click"]}
                title={
                  <>
                    {collectionLoading ? (
                      <div className="reports_collection_tooltip_container">
                        <Spin size="small" />
                      </div>
                    ) : (
                      <div
                        style={{
                          maxHeight: "140px",
                          overflowY: "auto",
                          whiteSpace: "pre-line",
                          lineHeight: "26px",
                        }}
                      >
                        {collectionHistory.map((item, index) => {
                          return (
                            <p className="reports_collection_tooltip_text">
                              {index + 1}. {item.month_name} -{" "}
                              <span style={{ fontWeight: 600 }}>
                                ₹
                                {Number(item.collection).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </>
                }
              >
                <MdHistory
                  size={18}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const [monthName, year] = record.sale_month.split(" ");
                    const selectedMonth = moment(
                      `${monthName} ${year}`,
                      "MMMM YYYY"
                    );
                    // Start date: 25th of previous month
                    const startDate = selectedMonth
                      .clone()
                      .subtract(1, "month")
                      .date(26)
                      .format("YYYY-MM-DD");

                    // End date: 25th of selected month
                    const endDate = selectedMonth
                      .clone()
                      .date(25)
                      .format("YYYY-MM-DD");

                    console.log("s", startDate, "e", endDate);
                    getMonthwiseTotalCollectionData(startDate, endDate);
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Pending",
      key: "pending",
      dataIndex: "pending",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Total Followup",
      key: "total_followups",
      dataIndex: "total_followups",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Followup Handled",
      key: "follow_up_handled",
      dataIndex: "follow_up_handled",
      width: 180,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Followup Un-Handled",
      key: "follow_up_unhandled",
      dataIndex: "follow_up_unhandled",
      width: 180,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Followup Efficiency",
      key: "followup_percentage",
      dataIndex: "followup_percentage",
      width: 160,
      render: (text) => {
        return <p>{`${text}%`}</p>;
      },
    },
  ];

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      const getLast3MonthDates = getLast3Months();
      setSelectedDates(getLast3MonthDates);

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setLoginUserId(convertAsJson?.user_id);
      getAllDownlineUsersData(convertAsJson?.user_id);
    }
  }, [childUsers]);

  const getAllDownlineUsersData = async (user_id) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      const getLast3MonthDates = getLast3Months();
      setSelectedDates(getLast3MonthDates);
      const customizeDate = customizeStartDateAndEndDate(getLast3MonthDates);
      setStartDateAndEndDate(customizeDate);
      console.log("startAndEndDate", customizeDate);

      getScoreBoardReportsData(
        customizeDate[0],
        customizeDate[1],
        downliners_ids
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getScoreBoardReportsData = async (startDate, endDate, downliners) => {
    setLoading(true);
    const payload = {
      user_ids: downliners,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await scoreBoardReports(payload);
      console.log("leads scoreboard report response", response);
      setReportData(response?.data?.data?.month_wise || []);
      setTotalCounts(response?.data?.data?.totals || null);
    } catch (error) {
      setReportData([]);
      setTotalCounts(null);
      console.log("get scoreboard report error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const getMonthwiseTotalCollectionData = async (startDate, endDate) => {
    setCollectionLoading(true);
    const payload = {
      user_ids: allDownliners,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await getMonthwiseTotalCollectionReport(payload);
      console.log("collection report response", response);
      setCollectionHistory(response?.data?.data || []);
      setTimeout(() => {
        setCollectionLoading(false);
      }, 300);
    } catch (error) {
      setCollectionLoading(false);
      setCollectionHistory([]);
      console.log("collection report error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
    try {
      const response = await getAllDownlineUsers(value ? value : loginUserId);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setPagination({
        page: 1,
      });
      getScoreBoardReportsData(
        startDateAndEndDate[0],
        startDateAndEndDate[1],
        downliners_ids
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const handleRefresh = () => {
    const getLast3MonthDates = getLast3Months();
    setSelectedDates(getLast3MonthDates);
    const customizeDate = customizeStartDateAndEndDate(getLast3MonthDates);
    setStartDateAndEndDate(customizeDate);
    setPagination({
      page: 1,
    });
    getAllDownlineUsersData(loginUserId);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={7}>
              <CommonSelectField
                height="35px"
                label="Select User"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={subUsers}
                onChange={handleSelectUser}
                value={selectedUserId}
                disableClearable={false}
              />
            </Col>
            <Col span={16}>
              <CommonDoubleMonthPicker
                label="Select Months"
                value={selectedDates}
                onChange={(dates, strings) => {
                  console.log(strings);
                  setSelectedDates([
                    dates[0].format("YYYY-MM"),
                    dates[1].format("YYYY-MM"),
                  ]);
                  const customizeDate = customizeStartDateAndEndDate(dates);
                  setStartDateAndEndDate(customizeDate);
                  getScoreBoardReportsData(
                    customizeDate[0],
                    customizeDate[1],
                    allDownliners
                  );
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
                  `${moment(startDateAndEndDate[0]).format(
                    "DD MMMM YYYY"
                  )} to ${moment(startDateAndEndDate[1]).format(
                    "DD MMMM YYYY"
                  )} Scoreboar Report.csv`
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

      <Row gutter={16}>
        <Col flex="20%" style={{ marginTop: "30px" }}>
          <div className="dashboard_leadcount_main_container">
            <div className="reports_leadcount_icon_container">
              <PiHandCoins size={18} />
            </div>
            <div className="reports_leadcount_container">
              <p>Total Leads</p>
              <p
                style={{
                  marginTop: "4px",
                  color: "#5b69ca",
                  fontSize: "20px",
                }}
              >
                {totalCounts &&
                (totalCounts.total_leads != undefined ||
                  totalCounts.total_leads != null)
                  ? Number(totalCounts.total_leads).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>
          </div>
        </Col>

        <Col flex="20%" style={{ marginTop: "30px" }}>
          <div className="dashboard_leadcount_main_container">
            <div className="reports_joiningcount_icon_container">
              <PiUsersThreeBold size={18} />
            </div>
            <div className="reports_leadcount_container">
              <p>Total Joinings</p>
              <p
                style={{
                  marginTop: "4px",
                  color: "#2ed573",
                  fontSize: "20px",
                }}
              >
                {totalCounts &&
                (totalCounts.total_joins != undefined ||
                  totalCounts.total_joins != null)
                  ? Number(totalCounts.total_joins).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>
          </div>
        </Col>

        <Col flex="20%" style={{ marginTop: "30px" }}>
          <div className="dashboard_leadcount_main_container">
            <div className="reports_salevolume_icon_container">
              <GoGraph size={17} />
            </div>
            <div className="reports_leadcount_container">
              <p>Sale Volume</p>
              <p
                style={{
                  marginTop: "4px",
                  color: "#1e90ff",
                  fontSize: "20px",
                }}
              >
                {totalCounts &&
                (totalCounts.sale_volume != undefined ||
                  totalCounts.sale_volume != null)
                  ? "₹" +
                    Number(totalCounts.sale_volume).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>
          </div>
        </Col>

        <Col flex="20%" style={{ marginTop: "30px" }}>
          <div className="dashboard_leadcount_main_container">
            <div className="reports_collection_icon_container">
              <MdCurrencyRupee size={20} />
            </div>
            <div className="reports_leadcount_container">
              <p>Collection</p>
              <p
                style={{
                  marginTop: "4px",
                  color: "#3c9111",
                  fontSize: "20px",
                }}
              >
                {totalCounts &&
                (totalCounts.total_collection != undefined ||
                  totalCounts.total_collection != null)
                  ? "₹" +
                    Number(totalCounts.total_collection).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>
          </div>
        </Col>

        <Col flex="20%" style={{ marginTop: "30px" }}>
          <div className="dashboard_leadcount_main_container">
            <div className="reports_pending_icon_container">
              <MdOutlinePendingActions size={18} />
            </div>
            <div className="reports_leadcount_container">
              <p>Pending</p>
              <p
                style={{
                  marginTop: "4px",
                  color: "#d32f2f",
                  fontSize: "20px",
                }}
              >
                {totalCounts &&
                (totalCounts.pending_payment != undefined ||
                  totalCounts.pending_payment != null)
                  ? "₹" +
                    Number(totalCounts.pending_payment).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: "30px" }}>
        <CommonTable
          scroll={{ x: 1250 }}
          columns={columns}
          dataSource={reportData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>
    </div>
  );
}
