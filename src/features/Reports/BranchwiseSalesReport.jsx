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
  getBranches,
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
  //filter usestates
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 500,
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
      render: (text, row) => ({
        children: text,
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
      render: (text) => {
        return <p>{text}</p>;
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
      const getLast3MonthDates = getLast3Months();
      setSelectedDates(getLast3MonthDates);

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setLoginUserId(convertAsJson?.user_id);

      const customizeDate = customizeStartDateAndEndDate(getLast3MonthDates);
      setStartDateAndEndDate(customizeDate);
      console.log("startAndEndDate", customizeDate);

      getBranchWiseSalesReportData(
        customizeDate[0],
        customizeDate[1],
        null,
        null
      );
    }
  }, [childUsers]);

  const getBranchWiseSalesReportData = async (
    startDate,
    endDate,
    regionId,
    branchId
  ) => {
    setLoading(true);
    const payload = {
      region_id: regionId,
      ...(branchId && { branch_id: branchId }),
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await branchwiseSalesAnalysisReports(payload);
      console.log("branchwise sales report response", response);
      const data = response?.data?.data || [];
      if (data.length >= 1) {
        const tableData = prepareTableData(data);
        setReportData(tableData);
      } else {
        setReportData([]);
      }
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

  const getBranchesData = async (regionid) => {
    const payload = {
      region_id: regionid,
    };
    try {
      const response = await getBranches(payload);
      const branch_data = response?.data?.result || [];

      if (branch_data.length >= 1) {
        if (regionid == 1 || regionid == 2) {
          const reordered = [
            ...branch_data.filter((item) => item.name !== "Online"),
            ...branch_data.filter((item) => item.name === "Online"),
          ];
          setBranchOptions(reordered);
        } else {
          setBranchOptions([]);
          setBranch(branch_data[0]?.id);
        }
      } else {
        setBranchOptions([]);
      }
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
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
      limit: 500,
    });

    getBranchWiseSalesReportData(
      customizeDate[0],
      customizeDate[1],
      null,
      null
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
                label="Select Region"
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
                  setSelectedRegionId(value);
                  setSelectedBranchId(null);
                  setPagination({
                    page: 1,
                    limit: 500,
                  });
                  getBranchWiseSalesReportData(
                    startDateAndEndDate[0],
                    startDateAndEndDate[1],
                    value,
                    null
                  );
                  getBranchesData(value);
                }}
                value={selectedRegionId}
                disableClearable={false}
              />
            </Col>
            <Col span={7}>
              <CommonSelectField
                height="35px"
                label="Select Branch"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={branchOptions}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedBranchId(value);
                  setPagination({
                    page: 1,
                    limit: 500,
                  });
                  getBranchWiseSalesReportData(
                    startDateAndEndDate[0],
                    startDateAndEndDate[1],
                    selectedRegionId,
                    value
                  );
                }}
                value={selectedBranchId}
                disableClearable={false}
                disabled={selectedRegionId == 3 ? true : false}
              />
            </Col>
            <Col span={10}>
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
          // rowClassName={(record) =>
          //   record.groupIndex % 2 === 0 ? "branch-even" : "branch-odd"
          // }
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>
    </div>
  );
}
