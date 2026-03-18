import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button } from "antd";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import { getUsers, serverReport, ticketsReport } from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import CommonSelectField from "../Common/CommonSelectField";
import { useSelector } from "react-redux";
import EllipsisTooltip from "../Common/EllipsisTooltip";

export default function TicketsReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);
  // ------------------BASIC USESTATES-----------------
  const [usersData, setUsersData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [reportData, setReportData] = useState([]);
  const typeOptions = [
    { id: "Server", name: "Server" },
    { id: "Course", name: "Course" },
  ];
  const [typeId, setTypeId] = useState("Server");
  const [loading, setLoading] = useState(true);
  //--------------PAGINATION--------------------
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  //-------------COLUMN--------------------
  const columns = [
    {
      title: "User",
      key: "user_name",
      dataIndex: "user_name",
      width: 115,
      render: (text, record) => {
        const lead_executive = `${record.user_id} - ${text}`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: "Total Tickets",
      key: "total_tickets",
      dataIndex: "total_tickets",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Open Tickets",
      key: "open_count",
      dataIndex: "open_count",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Pending Tickets",
      key: "pending_count",
      dataIndex: "pending_count",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Overdue Tickets",
      key: "overdue_count",
      dataIndex: "overdue_count",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Closed Tickets",
      key: "closed_count",
      dataIndex: "closed_count",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Average Time to Close",
      key: "avg_time",
      dataIndex: "avg_time",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{text ? text : "-"}</p>;
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
      getAllUsersData();
    }
  }, [childUsers]);

  const getAllUsersData = async () => {
    const payload = {
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      const users_data = response?.data?.data?.data || [];
      setUsersData(users_data);
    } catch (error) {
      setUsersData([]);
      console.log(error);
    } finally {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getTicketsReportData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        null,
      );
    }
  };

  const getTicketsReportData = async (startDate, endDate, user_id) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_id: user_id,
    };
    try {
      const response = await ticketsReport(payload);
      console.log("tickets report response", response);
      setReportData(response?.data?.data || []);
    } catch (error) {
      setReportData([]);
      console.log("tickets report error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
    setPagination({
      page: 1,
      limit: pagination.limit,
    });
    getTicketsReportData(selectedDates[0], selectedDates[1], value);
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
    getTicketsReportData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
    );
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
                options={usersData}
                onChange={handleSelectUser}
                value={selectedUserId}
                disableClearable={false}
              />
            </Col>
            <Col span={16}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                    limit: pagination.limit,
                  });
                  getTicketsReportData(dates[0], dates[1], selectedUserId);
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
                    "DD MMMM YYYY",
                  )} to ${moment(selectedDates[1]).format(
                    "DD MMMM YYYY",
                  )} Tickets Report.csv`,
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
          scroll={{ x: 600 }}
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
