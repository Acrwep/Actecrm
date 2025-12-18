import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, Flex } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { RedoOutlined } from "@ant-design/icons";
import { DownloadOutlined } from "@ant-design/icons";
import { PiHandCoins } from "react-icons/pi";
import { HiOutlineInformationCircle } from "react-icons/hi";
import {
  getAllDownlineUsers,
  getBranches,
  topPerformingChannelReport,
} from "../ApiService/action";
import { useSelector } from "react-redux";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import CommonTable from "../Common/CommonTable";
import moment from "moment";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import CommonMultiSelect from "../Common/CommonMultiSelect";

export default function TopPerformanceReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [selectedDates, setSelectedDates] = useState([]);
  const [allDownliners, setAllDownliners] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  const regionOptions = [
    { id: 1, name: "Chennai" },
    { id: 2, name: "Bangalore" },
    { id: 3, name: "HUB" },
  ];
  const [regionId, setRegionId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [totalCounts, setTotalCounts] = useState(null);
  const [totalLeadCount, setTotalLeadCount] = useState(null);
  const [loading, setLoading] = useState(true);
  //executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: "Date",
      key: "date",
      dataIndex: "date",
      width: 140,
      fixed: "left",
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Source",
      key: "name",
      dataIndex: "name",
      width: 140,
    },
    {
      title: "Total Leads",
      key: "lead_count",
      dataIndex: "lead_count",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Joinings",
      key: "converted_to_customer",
      dataIndex: "converted_to_customer",
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
      setSubUsers(downlineUsers);
      const today = new Date();
      setSelectedDates([
        moment(today).format("YYYY-MM-DD"),
        moment(today).format("YYYY-MM-DD"),
      ]);

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
      const today = new Date();

      getTopPerformanceReportData(
        moment(today).format("YYYY-MM-DD"),
        moment(today).format("YYYY-MM-DD"),
        downliners_ids,
        null,
        null
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getTopPerformanceReportData = async (
    startdate,
    enddate,
    downliners,
    regionid,
    branchid
  ) => {
    setLoading(true);

    const payload = {
      start_date: startdate,
      end_date: enddate,
      user_ids: downliners,
      ...(regionid && { region_id: regionid }),
      ...(branchid && { branch_id: branchid }),
    };

    try {
      const response = await topPerformingChannelReport(payload);
      console.log("top performance report response", response);
      setReportData(response?.data?.data?.data || []);
      const total_lead_count = response?.data?.data?.total_lead_count || [];

      if (total_lead_count.length >= 1) {
        setTotalLeadCount(total_lead_count[0].lead_count);
      } else {
        setTotalLeadCount("-");
      }
      const countArray = response?.data?.data?.total_result || [];
      let total_result = null;
      if (countArray.length >= 1) {
        const result = countArray.reduce((acc, item) => {
          acc[item.name.toLowerCase().replace(/\s+/g, "_")] = item.lead_count;
          return acc;
        }, {});
        total_result = result;
        console.log("result", result);
      } else {
        total_result = null;
      }
      setTotalCounts(total_result);
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      setLoading(false);
      setReportData([]);
      setTotalCounts(null);
      setTotalLeadCount("-");
      console.log("top performance report error", error);
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
          setBranchId(branch_data[0]?.id);
        }
      } else {
        setBranchOptions([]);
      }
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
    }
  };

  //onchange function
  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
    setRegionId(null);
    setBranchId(null);
    try {
      const response = await getAllDownlineUsers(value ? value : loginUserId);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setPagination({
        page: 1,
      });
      getTopPerformanceReportData(
        selectedDates[0],
        selectedDates[1],
        downliners_ids,
        null,
        null
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setRegionId(null);
    setBranchId(null);
    setSelectedUserId([]);
    const today = new Date();
    setSelectedDates([
      moment(today).format("YYYY-MM-DD"),
      moment(today).format("YYYY-MM-DD"),
    ]);
    getTopPerformanceReportData(
      moment(today).format("YYYY-MM-DD"),
      moment(today).format("YYYY-MM-DD"),
      allDownliners,
      null,
      null
    );
  };
  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={20}>
          <Row gutter={10}>
            <Col flex="6">
              {/* Search Input */}
              <CommonSelectField
                height="35px"
                label="Select Region"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={regionOptions}
                onChange={(e) => {
                  const value = e.target.value;
                  setRegionId(value);
                  setBranchId(null);
                  setSelectedUserId([]);
                  if (value) {
                    getBranchesData(value);
                  }
                  setPagination({
                    page: 1,
                  });
                  getTopPerformanceReportData(
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    value,
                    null
                  );
                }}
                value={regionId}
                disableClearable={false}
              />
            </Col>
            <Col flex="6">
              <CommonSelectField
                height="35px"
                label="Select Branch"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={branchOptions}
                onChange={(e) => {
                  const value = e.target.value;
                  setBranchId(value);
                  setSelectedUserId([]);
                  setPagination({
                    page: 1,
                  });
                  getTopPerformanceReportData(
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    regionId,
                    value
                  );
                }}
                value={branchId}
                disableClearable={false}
              />
            </Col>
            <Col flex="6">
              <CommonMultiSelect
                height="20px"
                label="Select User"
                labelFontSize="13px"
                options={subUsers}
                onChange={handleSelectUser}
                value={selectedUserId}
                disableClearable={false}
              />
            </Col>
            <Col flex="6">
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getTopPerformanceReportData(
                    dates[0],
                    dates[1],
                    allDownliners,
                    regionId,
                    branchId
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
          lg={4}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Tooltip placement="top" title="Download">
            <Button
              className="reports_download_button"
              onClick={() => {
                DownloadTableAsCSV(
                  reportData,
                  columns,
                  `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
                    selectedDates[1]
                  ).format("DD-MM-YYYY")} Top Performance Channel Report.csv`
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
                {totalLeadCount != undefined || totalLeadCount != null
                  ? Number(totalLeadCount).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>

            <div>
              <Flex
                justify="center"
                align="center"
                style={{ whiteSpace: "nowrap" }}
              >
                <Tooltip
                  placement="bottomLeft"
                  color="#fff"
                  title={
                    <>
                      <div
                        style={{
                          maxHeight: "140px",
                          overflowY: "auto",
                          whiteSpace: "pre-line",
                          lineHeight: "24px",
                        }}
                      >
                        <p className="leadsmanager_executivecount_text">
                          {`${1}. Call - ${
                            totalCounts &&
                            (totalCounts.call != undefined ||
                              totalCounts.call != null)
                              ? Number(totalCounts.call).toLocaleString("en-IN")
                              : "-"
                          }`}
                        </p>
                        <p className="leadsmanager_executivecount_text">
                          {`${2}. Direct - ${
                            totalCounts &&
                            (totalCounts.direct != undefined ||
                              totalCounts.direct != null)
                              ? Number(totalCounts.direct).toLocaleString(
                                  "en-IN"
                                )
                              : "-"
                          }`}
                        </p>
                        <p className="leadsmanager_executivecount_text">
                          {`${3}. Enquiry - ${
                            totalCounts &&
                            (totalCounts.enquiry_form != undefined ||
                              totalCounts.enquiry_form != null)
                              ? Number(totalCounts.enquiry_form).toLocaleString(
                                  "en-IN"
                                )
                              : "-"
                          }`}
                        </p>
                        <p className="leadsmanager_executivecount_text">
                          {`${4}. IVR - ${
                            totalCounts &&
                            (totalCounts.ivr != undefined ||
                              totalCounts.ivr != null)
                              ? Number(totalCounts.ivr).toLocaleString("en-IN")
                              : "-"
                          }`}
                        </p>
                        <p className="leadsmanager_executivecount_text">
                          {`${5}. Live Chat - ${
                            totalCounts &&
                            (totalCounts.live_chat != undefined ||
                              totalCounts.live_chat != null)
                              ? Number(totalCounts.live_chat).toLocaleString(
                                  "en-IN"
                                )
                              : "-"
                          }`}
                        </p>
                        <p className="leadsmanager_executivecount_text">
                          {`${6}. Reference - ${
                            totalCounts &&
                            (totalCounts.reference != undefined ||
                              totalCounts.reference != null)
                              ? Number(totalCounts.reference).toLocaleString(
                                  "en-IN"
                                )
                              : "-"
                          }`}
                        </p>
                        <p className="leadsmanager_executivecount_text">
                          {`${7}. SMO - ${
                            totalCounts &&
                            (totalCounts.smo != undefined ||
                              totalCounts.smo != null)
                              ? Number(totalCounts.smo).toLocaleString("en-IN")
                              : "-"
                          }`}
                        </p>
                      </div>
                    </>
                  }
                  trigger={["click"]}
                >
                  <HiOutlineInformationCircle
                    size={18}
                    color="#333"
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>
              </Flex>
            </div>
          </div>
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
