import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, Spin } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import { MdHistory } from "react-icons/md";
import {
  customizeStartDateAndEndDate,
  getLast3Months,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import CommonDoubleMonthPicker from "../Common/CommonDoubleMonthPicker";
import {
  branchwiseSalesAnalysisReports,
  getMonthwiseTotalCollectionReport,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";

export default function BranchwiseSalesReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);

  const [selectedDates, setSelectedDates] = useState([]);
  const [startDateAndEndDate, setStartDateAndEndDate] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [collectionHistory, setCollectionHistory] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  //executive filter
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: "Branch Name",
      key: "branch_name",
      dataIndex: "branch_name",
      width: 160,
      fixed: "left",
      render: (text, record) => {
        return (
          <div>
            <p> {`${text}`}</p>
          </div>
        );
      },
    },
    {
      title: "Month",
      key: "label",
      dataIndex: "label",
      width: 160,
      fixed: "left",
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
                    const [monthName, year] = record.label.split(" ");
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
                    getMonthwiseTotalCollectionData(
                      record.branch_id,
                      startDate,
                      endDate
                    );
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
  ];

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      const getLast3MonthDates = getLast3Months();
      setSelectedDates(getLast3MonthDates);

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setLoginUserId(convertAsJson?.user_id);

      const customizeDate = customizeStartDateAndEndDate(getLast3MonthDates);
      setStartDateAndEndDate(customizeDate);
      console.log("startAndEndDate", customizeDate);

      getBranchWiseSalesReportData(customizeDate[0], customizeDate[1], null);
    }
  }, [childUsers]);

  const getBranchWiseSalesReportData = async (startDate, endDate, regionId) => {
    setLoading(true);
    const payload = {
      region_id: regionId,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await branchwiseSalesAnalysisReports(payload);
      console.log("branchwise sales report response", response);
      setReportData(response?.data?.data || []);
    } catch (error) {
      setReportData([]);
      console.log("branchwise sales report error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const getMonthwiseTotalCollectionData = async (
    branchId,
    startDate,
    endDate
  ) => {
    setCollectionLoading(true);
    const payload = {
      branch_id: branchId,
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

  const handleRefresh = () => {
    const getLast3MonthDates = getLast3Months();
    setSelectedDates(getLast3MonthDates);
    const customizeDate = customizeStartDateAndEndDate(getLast3MonthDates);
    setStartDateAndEndDate(customizeDate);
    setPagination({
      page: 1,
    });

    getBranchWiseSalesReportData(customizeDate[0], customizeDate[1], null);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={7}>
              <CommonSelectField
                height="35px"
                label="Select Branch"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={[
                  {
                    id: 1,
                    name: "Chennai",
                  },
                  {
                    id: 2,
                    name: "Bangalore",
                  },
                  {
                    id: 3,
                    name: "Hub",
                  },
                ]}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedBranchId(value);
                  setPagination({
                    page: 1,
                  });
                  getBranchWiseSalesReportData(
                    startDateAndEndDate[0],
                    startDateAndEndDate[1],
                    value
                  );
                }}
                value={selectedBranchId}
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
                  getBranchWiseSalesReportData(
                    customizeDate[0],
                    customizeDate[1],
                    selectedBranchId
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
            gap: "16px",
          }}
        >
          <Tooltip placement="top" title="Download">
            <Button
              className="customer_download_button"
              onClick={() => {
                DownloadTableAsCSV(
                  reportData,
                  columns,
                  `${moment(startDateAndEndDate[0]).format(
                    "DD MMMM YYYY"
                  )} to ${moment(startDateAndEndDate[1]).format(
                    "DD MMMM YYYY"
                  )} Branchwise Sales Report.csv`
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
          scroll={{ x: 1000 }}
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
