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
  branchwiseLeadsAnalysisReports,
  getAllDownlineUsers,
  getBranches,
  userwiseLeadsAnalysisReports,
  userwiseSalesAnalysisReports,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";

export default function BranchwiseLeadsReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);

  const [selectedDates, setSelectedDates] = useState([]);
  const [startDateAndEndDate, setStartDateAndEndDate] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
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

      getBranchWiseLeadsReportData(
        customizeDate[0],
        customizeDate[1],
        null,
        null
      );
    }
  }, [childUsers]);

  const getBranchWiseLeadsReportData = async (
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
      const response = await branchwiseLeadsAnalysisReports(payload);
      console.log("branchwise leads report response", response);
      const data = response?.data?.data || [];
      if (data.length >= 1) {
        const tableData = prepareTableData(data);
        setReportData(tableData);
      } else {
        setReportData([]);
      }
    } catch (error) {
      setReportData([]);
      console.log("branchwise leads report error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
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

    getBranchWiseLeadsReportData(
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
                  getBranchWiseLeadsReportData(
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
                  getBranchWiseLeadsReportData(
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
                  getBranchWiseLeadsReportData(
                    customizeDate[0],
                    customizeDate[1],
                    selectedRegionId,
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
                  )} Branchwise Lead Report.csv`
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
