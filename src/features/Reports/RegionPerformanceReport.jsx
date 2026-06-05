import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, Spin } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import {
  DownloadOutlined,
  RedoOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { MdHistory } from "react-icons/md";
import {
  customizeStartDateAndEndDate,
  getCurrentandPreviousweekDate,
  getLast3Months,
  getThisMonthDateRange,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import CommonDoubleMonthPicker from "../Common/CommonDoubleMonthPicker";
import {
  regionwiseLeadsAnalysisReports,
  getBranches,
  getMonthwiseTotalCollectionReport,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";

export default function RegionPerformanceReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);

  const [selectedDates, setSelectedDates] = useState([]);
  const [viewType, setViewType] = useState("month");
  const viewTypeOptions = [
    { id: "month", name: "Monthwise" },
    { id: "date", name: "Datewise" },
  ];
  const [startDateAndEndDate, setStartDateAndEndDate] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  const [loading, setLoading] = useState(true);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 500,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: viewType === "month" ? "Month" : "Date",
      key: "date",
      dataIndex: "date",
      width: 180,
      fixed: "left",
      render: (value) => {
        if (viewType === "month") {
          return value;
        }

        return moment(value).format("DD/MM/YYYY dddd");
      },
    },
    {
      title: "Overall Leads",
      key: "overall_leads",
      dataIndex: "overall_leads",
      width: 130,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Overall Joins",
      key: "overall_joins",
      dataIndex: "overall_joins",
      width: 130,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Overall Collections",
      key: "overall_collections",
      dataIndex: "overall_collections",
      width: 180,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Hub Leads",
      key: "hub_leads",
      dataIndex: "hub_leads",
      width: 120,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Hub Joins",
      key: "hub_joins",
      dataIndex: "hub_joins",
      width: 120,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Hub Collections",
      key: "hub_collections",
      dataIndex: "hub_collections",
      width: 150,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Chennai Leads",
      key: "chennai_leads",
      dataIndex: "chennai_leads",
      width: 130,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Chennai Joins",
      key: "chennai_joins",
      dataIndex: "chennai_joins",
      width: 130,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Chennai Collections",
      key: "chennai_collections",
      dataIndex: "chennai_collections",
      width: 170,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Bangalore Leads",
      key: "bangalore_leads",
      dataIndex: "bangalore_leads",
      width: 150,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Bangalore Joins",
      key: "bangalore_joins",
      dataIndex: "bangalore_joins",
      width: 150,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
    {
      title: "Bangalore Collections",
      key: "bangalore_collections",
      dataIndex: "bangalore_collections",
      width: 190,
      render: (text) => <p>{Number(text).toLocaleString("en-IN")}</p>,
    },
  ];

  const getRowClassName = (record) => {
    return record.groupIndex % 2 === 0 ? "branch-even" : "branch-odd";
  };

  const prepareTableData = (data) => {
    const branchCount = {};
    const branchIndexMap = {};
    let currentGroupIndex = 0;

    // Count rows per branch
    data.forEach((item) => {
      branchCount[item.branch_name] = (branchCount[item.branch_name] || 0) + 1;
    });

    const branchRendered = {};

    return data.map((item) => {
      // Assign fixed group index per branch
      if (branchIndexMap[item.branch_name] === undefined) {
        branchIndexMap[item.branch_name] = currentGroupIndex++;
      }

      const isFirstRow = !branchRendered[item.branch_name];

      if (isFirstRow) {
        branchRendered[item.branch_name] = true;
      }

      return {
        ...item,
        groupIndex: branchIndexMap[item.branch_name],
        branchRowSpan: isFirstRow ? branchCount[item.branch_name] : 0,
      };
    });
  };

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setSelectedDates(PreviousAndCurrentDate);

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setLoginUserId(convertAsJson?.user_id);

      const getLast3MonthDates = getLast3Months();
      setSelectedDates(getLast3MonthDates);
      const customizeDate = customizeStartDateAndEndDate(getLast3MonthDates);
      setStartDateAndEndDate(customizeDate);

      getRegionWiseLeadsReportData(customizeDate[0], customizeDate[1], "month");
    }
  }, [childUsers]);

  const getRegionWiseLeadsReportData = async (
    startDate,
    endDate,
    view_type,
  ) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      type: view_type,
    };
    try {
      const response = await regionwiseLeadsAnalysisReports(payload);
      console.log("regionwise leads report response", response);
      const data = response?.data?.data || [];
      if (data.length >= 1) {
        setReportData(data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      setReportData([]);
      console.log("regionwise leads report error", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const handleRefresh = () => {
    const getLast3MonthDates = getLast3Months();
    setSelectedDates(getLast3MonthDates);
    const customizeDate = customizeStartDateAndEndDate(getLast3MonthDates);
    setStartDateAndEndDate(customizeDate);
    setViewType("month");
    setPagination({
      page: 1,
      limit: 500,
    });
    getRegionWiseLeadsReportData(customizeDate[0], customizeDate[1], "month");
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={20}>
          <Row gutter={16}>
            <Col span={6}>
              <CommonSelectField
                height="35px"
                label="View Type"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={viewTypeOptions}
                onChange={(e) => {
                  const type = e.target.value;
                  setViewType(type);
                  if (type == "month") {
                    const getLast3MonthDates = getLast3Months();
                    setSelectedDates(getLast3MonthDates);
                    const customizeDate =
                      customizeStartDateAndEndDate(getLast3MonthDates);
                    setStartDateAndEndDate(customizeDate);
                    getRegionWiseLeadsReportData(
                      customizeDate[0],
                      customizeDate[1],
                      type,
                    );
                  } else {
                    const thisMonthDateRange = getThisMonthDateRange();
                    setSelectedDates(thisMonthDateRange);
                    getRegionWiseLeadsReportData(
                      thisMonthDateRange[0],
                      thisMonthDateRange[1],
                      type,
                    );
                  }
                }}
                value={viewType}
              />
            </Col>
            <Col span={10}>
              {viewType == "month" ? (
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
                    getRegionWiseLeadsReportData(
                      customizeDate[0],
                      customizeDate[1],
                      viewType,
                    );
                  }}
                />
              ) : (
                <CommonMuiCustomDatePicker
                  value={selectedDates}
                  onDateChange={(dates) => {
                    setSelectedDates(dates);
                    getRegionWiseLeadsReportData(dates[0], dates[1], viewType);
                  }}
                />
              )}
            </Col>
          </Row>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={4}
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
                  )} Regionwise Performance.csv`,
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
          rowClassName={getRowClassName}
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>
    </div>
  );
}
