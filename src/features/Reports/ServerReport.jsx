import React, { useState, useEffect } from "react";
import { Row, Col, Tooltip, Button } from "antd";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import { serverReport } from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import CommonSelectField from "../Common/CommonSelectField";

export default function ServerReport() {
  // ------------------BASIC USESTATES-----------------
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
  //-------------TABLE COLUMN--------------------
  const firstColumn =
    typeId == "Course"
      ? {
          title: "Course Name",
          key: "course_name",
          dataIndex: "course_name",
          width: 120,
          fixed: "left",
          render: (text) => <p>{text}</p>,
        }
      : {
          title: "Server Date",
          key: "server_date",
          dataIndex: "server_date",
          width: 120,
          fixed: "left",
          render: (text) => <p>{moment(text).format("DD/MM/YYYY")}</p>,
        };

  const columns = [
    firstColumn,
    {
      title: "Total Server Count",
      key: "total",
      dataIndex: "total",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Total Amount",
      key: "total_amount",
      dataIndex: "total_amount",
      width: 115,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
  ];

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);

    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    getServerReportData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
    );
  }, []);

  const getServerReportData = async (startDate, endDate, type) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      type: type == "Course" ? "Course" : null,
    };
    try {
      const response = await serverReport(payload);
      console.log("server report response", response);
      setReportData(response?.data?.data || []);
    } catch (error) {
      setReportData([]);
      console.log("server report error", error);
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
    setTypeId("Server");
    setPagination({
      page: 1,
      limit: 100,
    });
    getServerReportData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[0],
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
                label="Select Type"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={typeOptions}
                onChange={(e) => {
                  setTypeId(e.target.value);
                  getServerReportData(
                    selectedDates[0],
                    selectedDates[0],
                    e.target.value,
                  );
                }}
                value={typeId}
                disableClearable={true}
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
                  getServerReportData(dates[0], dates[1], typeId);
                  //   getTransactionReportData(dates[0], dates[1]);
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
                  )} Server Report.csv`,
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
