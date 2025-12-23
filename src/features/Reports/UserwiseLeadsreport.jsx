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
  userwiseLeadsAnalysisReports,
  userwiseSalesAnalysisReports,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";

export default function UserwiseLeadsReport() {
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
    limit: 500,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: "User Name",
      key: "user_name",
      dataIndex: "user_name",
      width: 160,
      fixed: "left",
      render: (text, row) => ({
        children: <p> {`${row.user_id} - ${text}`}</p>,
        props: {
          rowSpan: row.branchRowSpan,
        },
      }),
    },
    {
      title: "Month",
      key: "label",
      dataIndex: "label",
      width: 160,
      fixed: "left",
    },
    {
      title: "Total Leads",
      key: "total_leads",
      dataIndex: "total_leads",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Converted Customers",
      key: "customer_count",
      dataIndex: "customer_count",
      width: 170,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Convertion Rate%",
      key: "lead_to_customer_percentage",
      dataIndex: "lead_to_customer_percentage",
      width: 140,
      render: (text) => {
        return <p style={{ fontWeight: 600 }}>{`${text}%`}</p>;
      },
    },
    {
      title: "Joined Customers",
      key: "joined_customers",
      dataIndex: "joined_customers",
      width: 160,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Total Followup",
      key: "lead_followup_count",
      dataIndex: "lead_followup_count",
      width: 130,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Followup Handled",
      key: "followup_handled",
      dataIndex: "followup_handled",
      width: 150,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Followup Un-Handled",
      key: "followup_unhandled",
      dataIndex: "followup_unhandled",
      width: 180,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Followup Efficiency%",
      key: "followup_handled_percentage",
      dataIndex: "followup_handled_percentage",
      width: 180,
      fixed: "right",
      render: (text) => {
        return <p style={{ fontWeight: 600 }}>{`${text}%`}</p>;
      },
    },
  ];

  const prepareTableData = (data) => {
    const branchCount = {};
    const branchIndexMap = {};
    let currentGroupIndex = 0;

    // Count rows per branch
    data.forEach((item) => {
      branchCount[item.user_name] = (branchCount[item.user_name] || 0) + 1;
    });

    const branchRendered = {};

    return data.map((item) => {
      // Assign fixed group index per branch
      if (branchIndexMap[item.user_name] === undefined) {
        branchIndexMap[item.user_name] = currentGroupIndex++;
      }

      const isFirstRow = !branchRendered[item.user_name];

      if (isFirstRow) {
        branchRendered[item.user_name] = true;
      }

      return {
        ...item,
        groupIndex: branchIndexMap[item.user_name],
        branchRowSpan: isFirstRow ? branchCount[item.user_name] : 0,
      };
    });
  };

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

      getUsersWiseLeadsReportData(
        customizeDate[0],
        customizeDate[1],
        downliners_ids
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getUsersWiseLeadsReportData = async (
    startDate,
    endDate,
    downliners
  ) => {
    setLoading(true);
    const payload = {
      user_ids: downliners,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await userwiseLeadsAnalysisReports(payload);
      console.log("userwise leads report response", response);
      const data = response?.data?.data || [];
      if (data.length >= 1) {
        const tableData = prepareTableData(data);
        setReportData(tableData);
      } else {
        setReportData([]);
      }
    } catch (error) {
      setReportData([]);
      setTotalCounts(null);
      console.log("userwise leads report error", error);
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
        limit: 500,
      });
      getUsersWiseLeadsReportData(
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
      limit: 500,
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
                  setPagination({
                    page: 1,
                    limit: 500,
                  });
                  getUsersWiseLeadsReportData(
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
                  )} Userwise Lead Report.csv`
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
