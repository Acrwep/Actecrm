import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import {
  customizeStartDateAndEndDate,
  getLast3Months,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import CommonDoubleMonthPicker from "../Common/CommonDoubleMonthPicker";
import {
  getAllDownlineUsers,
  hrPerformanceReport,
  raPerformanceReport,
  scoreBoardReports,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";

export default function RaPerformanceReport() {
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
  const [loading, setLoading] = useState(true);
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
      key: "label",
      dataIndex: "label",
      width: 170,
      fixed: "left",
    },
    {
      title: "Awaiting Verify",
      key: "awaiting_verify",
      dataIndex: "awaiting_verify",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Awaiting Class",
      key: "awaiting_class",
      dataIndex: "awaiting_class",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Class Scheduled",
      key: "class_scheduled",
      dataIndex: "class_scheduled",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Class Going",
      key: "class_going",
      dataIndex: "class_going",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Google Review",
      key: "google_review_count",
      dataIndex: "google_review_count",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Linkedin Review",
      key: "linkedin_review_count",
      dataIndex: "linkedin_review_count",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Escalated",
      key: "escalated",
      dataIndex: "escalated",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Completed",
      key: "class_completed",
      dataIndex: "class_completed",
      width: 120,
      fixed: "right",
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
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

      getHrPerformanceData(customizeDate[0], customizeDate[1], downliners_ids);
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getHrPerformanceData = async (startDate, endDate, downliners) => {
    setLoading(true);
    const payload = {
      user_ids: downliners,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await raPerformanceReport(payload);
      console.log("ra performance report response", response);
      setReportData(response?.data?.data?.month_wise || []);
      setTotalCounts(response?.data?.data?.totals || null);
    } catch (error) {
      setReportData([]);
      setTotalCounts(null);
      console.log("ra performance report error", error);
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
      getHrPerformanceData(
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
                  getHrPerformanceData(
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
                  )} RA Performance Report.csv`
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
          scroll={{ x: 1200 }}
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
