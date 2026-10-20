import React, { useState, useEffect, useRef } from "react";
import { Button, Tooltip, Row, Col, Grid, Popover, Badge } from "antd";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import { FaWhatsapp, FaPlus } from "react-icons/fa";
import { RedoOutlined } from "@ant-design/icons";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import WhatsappTemplate from "./WhatsappTemplate";
import CommonTable from "../Common/CommonTable";
import {
  getAllDownlineUsers,
  getBranches,
  getLeadsOnly,
  getTechnologies,
  getUsers,
} from "../ApiService/action";
import {
  getCurrentandPreviousweekDate,
  regionOptions,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { CommonMessage } from "../Common/CommonMessage";
import OverflowTooltip from "../Common/OverflowTooltip";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";

export default function MarketingLeads({ courseOptions }) {
  //screen sizes
  const screens = Grid.useBreakpoint();
  const isLargeScreen = screens.lg;
  //mount
  const mounted = useRef(false);
  //search userefs start
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);
  //filter usestates
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [technologiesData, setTechnologiesData] = useState([]);
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const prevSelectedTechnologyRef = useRef("[]");
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const prevSelectedUserIdRef = useRef("[]");
  const [allDownliners, setAllDownliners] = useState([]);
  const [defaultAllDownliners, setDefaultAllDownliners] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [allRegionsCounts, setAllRegionCounts] = useState({
    hub_region: 0,
    chennai_region: 0,
    bangalore_region: 0,
    over_all_count: 0,
  });
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  //other usestates
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const columns = [
    {
      title: "Sl. No",
      key: "row_num",
      dataIndex: "row_num",
      width: 60,
    },
    {
      title: (
        <Tooltip title="Lead Executive" placement="top">
          <div
            style={{
              cursor: "pointer",
              width: "100%",
              textAlign: "center",
            }}
          >
            LE
          </div>
        </Tooltip>
      ),
      key: "lead_assigned_to_name",
      dataIndex: "lead_assigned_to_name",
      width: 80,
      render: (text, record) => {
        const lead_executive = `${record.lead_assigned_to_view_user_id} - ${text}`;
        return (
          <div style={{ textAlign: "center", width: "100%" }}>
            <OverflowTooltip
              title={lead_executive}
              children={record.lead_assigned_to_view_user_id}
            />
          </div>
        );
      },
    },
    {
      title: "Created At",
      key: "created_date",
      dataIndex: "created_date",
      width: 170,
      render: (text) => {
        return (
          <>
            <EllipsisTooltip
              text={moment(text).format("DD/MM/YYYY - HH:mm:ss")}
            />
          </>
        );
      },
    },
    {
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      width: 160,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 180,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Whatsapp",
      key: "whatsapp",
      dataIndex: "whatsapp",
      width: 140,
      render: (text, record) => {
        return (
          <div className="customers_candidatename_container">
            <EllipsisTooltip
              text={
                text
                  ? `${
                      record.whatsapp_phone_code
                        ? record.whatsapp_phone_code.startsWith("+")
                          ? record.whatsapp_phone_code
                          : `+${record.whatsapp_phone_code}`
                        : ""
                    } ${text}`
                  : "-"
              }
            />
          </div>
        );
      },
    },
    {
      title: "Lead Temp.",
      key: "lead_status",
      dataIndex: "lead_status",
      width: 140,
      sorter: (a, b) =>
        (a.lead_status || "").localeCompare(b.lead_status || ""),
      sortDirections: ["ascend", "descend"],
      render: (text) => {
        const statusClass =
          text === "Super Hot"
            ? "super_hot_priority"
            : text === "Hot"
              ? "hot_priority"
              : text === "Medium"
                ? "medium_priority"
                : text === "Cold"
                  ? "cold_priority"
                  : text === "Junk" || text === "Dormant"
                    ? "junk_priority"
                    : "others";

        return (
          <>
            {text ? (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                <div
                  className={`leadfollwup_table_status_container ${statusClass}`}
                >
                  <p>{text}</p>
                </div>
              </div>
            ) : (
              <p>-</p>
            )}
          </>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Button
          className="whatsapp-table-action-btn"
          icon={<FaWhatsapp size={13} />}
          onClick={() => handleOpenWhatsApp(record)}
        >
          Message
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      getTechnologiesData();
      getAllDownlineUsersData(null);
    }
  }, [childUsers]);

  const getTechnologiesData = async () => {
    try {
      const response = await getTechnologies();
      setTechnologiesData(response?.data?.data || []);
    } catch (error) {
      setTechnologiesData([]);
      console.log("response status error", error);
    }
  };

  const getAllDownlineUsersData = async (user_id) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);

    try {
      const response = await getAllDownlineUsers(
        user_id ? user_id : convertAsJson.user_id,
      );
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setDefaultAllDownliners(downliners_ids);
      fetchLeadsData({
        startDate: PreviousAndCurrentDate[0],
        endDate: PreviousAndCurrentDate[1],
        searchvalue: null,
        technology: null,
        regionId: null,
        branchId: null,
        downliners: downliners_ids,
        pageNumber: 1,
        limit: 10,
      });
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const fetchLeadsData = (overrides = {}) => {
    getLeadsData(
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null,
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null,
      overrides.searchvalue !== undefined ? overrides.searchvalue : searchValue,
      overrides.technology !== undefined
        ? overrides.technology
        : selectedTechnology,
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId,
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId,
      overrides.downliners !== undefined ? overrides.downliners : allDownliners,
      overrides.pageNumber !== undefined
        ? overrides.pageNumber
        : pagination?.page || 1,
      overrides.limit !== undefined ? overrides.limit : pagination?.limit || 10,
    );
  };

  const getLeadsData = async (
    startDate,
    endDate,
    searchvalue,
    technology,
    regionId,
    branchId,
    downliners,
    pageNumber,
    limit,
  ) => {
    setLoading(true);
    const payload = {
      ...(searchvalue && { search_filter: searchvalue }),
      ...(technology && technology.length >= 1
        ? { course_ids: technology }
        : {}),
      start_date: startDate,
      end_date: endDate,
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      user_ids: downliners,
      page: pageNumber,
      limit: limit,
    };

    try {
      const response = await getLeadsOnly(payload);
      const apiData = response?.data?.data?.leads || [];
      const paginationData = response?.data?.data?.pagination;

      const updatedData = apiData.map((item, index) => ({
        ...item,
        row_num: (pageNumber - 1) * limit + index + 1,
      }));

      setLeadsData(updatedData);
      setAllRegionCounts({
        hub_region: response?.data?.data?.hub_region || 0,
        chennai_region: response?.data?.data?.chennai_region || 0,
        bangalore_region: response?.data?.data?.bangalore_region || 0,
        over_all_count: response?.data?.data?.total_count || 0,
      });
      setPagination({
        page: paginationData?.page || 1,
        limit: paginationData?.limit || 10,
        total: paginationData?.total || 0,
        totalPages: paginationData?.totalPages || 0,
      });
    } catch (error) {
      setLeadsData([]);
      setAllRegionCounts({
        hub_region: 0,
        chennai_region: 0,
        bangalore_region: 0,
        over_all_count: 0,
      });
      console.log("get leads error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const input = e.target.value;
    setSearchValue(input);
    setLoading(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!input) {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchLeadsData({
        searchvalue: null,
        pageNumber: 1,
      });
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchLeadsData({
        searchvalue: e.target.value,
        pageNumber: 1,
      });
    }, 700);
  };

  const handleSelectUser = (event, newValue) => {
    setSelectedUserId(newValue);
  };

  const handleSelectUserBlur = () => {
    const currentJson = JSON.stringify(selectedUserId || []);
    if (currentJson === prevSelectedUserIdRef.current) {
      return;
    }
    prevSelectedUserIdRef.current = currentJson;

    const user_ids = (selectedUserId || []).map((u) => u.user_id);
    const finalDownliners =
      user_ids.length > 0 ? user_ids : defaultAllDownliners;

    setAllDownliners(finalDownliners);
    setPagination((prev) => ({ ...prev, page: 1 }));

    fetchLeadsData({
      downliners: finalDownliners,
      pageNumber: 1,
    });
  };

  const handleSelectTechnology = async (e) => {
    const value = e.target.value;
    setSelectedTechnology(value);
  };

  const handleSelectTechnologyBlur = async () => {
    const value = selectedTechnology;

    const stringifiedValue = JSON.stringify(value || []);

    if (prevSelectedTechnologyRef.current === stringifiedValue) {
      return;
    }
    prevSelectedTechnologyRef.current = stringifiedValue;

    fetchLeadsData({
      technology: value,
      pageNumber: 1,
    });
  };

  const getBranchesData = async (regionId) => {
    try {
      const response = await getBranches(regionId);
      const branches = response?.data?.data || [];
      const formatted = branches.map((b) => ({
        id: b.id,
        name: b.branch_name,
      }));
      setBranchOptions(formatted);
    } catch (error) {
      setBranchOptions([]);
      console.log("get branch error", error);
    }
  };

  const getUsersData = async (regionId, branchId) => {
    try {
      const response = await getUsers(regionId, branchId);
      setSubUsers(response?.data?.data?.data || []);
    } catch (error) {
      setSubUsers([]);
      console.log("get all users error", error);
    }
  };

  const handleOpenWhatsApp = (lead) => {
    setSelectedLead(lead);
    setIsBulkMode(false);
    setIsModalOpen(true);
  };

  const handleOpenBulkWhatsApp = () => {
    if (!selectedRows || selectedRows.length === 0) {
      CommonMessage(
        "warning",
        "Please select at least one lead from the table.",
      );
      return;
    }
    setIsBulkMode(true);
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleSelectedRow = (rows) => {
    setSelectedRows(rows);
    setSelectedRowKeys(rows.map((item) => item.id));
  };

  const handlePaginationChange = ({ page, limit }) => {
    setSelectedRows([]);
    setSelectedRowKeys([]);
    fetchLeadsData({
      pageNumber: page,
      limit: limit,
    });
  };

  const handleRefresh = () => {
    setSearchValue("");
    setSelectedUserId([]);
    prevSelectedUserIdRef.current = "[]";
    prevSelectedTechnologyRef.current = "[]";
    setSelectedTechnology(null);
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setSubUsers(downlineUsers);
    setSelectedRows([]);
    setSelectedRowKeys([]);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
    });
    getAllDownlineUsersData(null);
  };

  return (
    <div>
      <div className="admissions_overall_header">
        <div className="admissions_overall_indicator"></div>

        <div className="admissions_overall_content">
          <span className="admissions_overall_label">OverAll</span>

          <span className="admissions_overall_count">
            {allRegionsCounts?.over_all_count ?? 0}
          </span>
        </div>
      </div>

      <Row align="middle" gutter={[12, 12]}>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={permissions.includes("Lead Executive Filter") ? 22 : 12}
          xxl={permissions.includes("Lead Executive Filter") ? 18 : 12}
        >
          <Row gutter={12} align="middle" wrap={false}>
            <Col flex="1 1 180px">
              <div
                className="overallduecustomers_filterContainer"
                style={{ marginBottom: "0px" }}
              >
                {/* Search Input */}
                <CommonOutlinedInput
                  label={"Search..."}
                  width="100%"
                  height="32px"
                  labelFontSize="11px"
                  icon={
                    searchValue ? (
                      <div
                        className="users_filter_closeIconContainer"
                        onClick={() => {
                          setSearchValue("");
                          setPagination({
                            page: 1,
                          });
                          fetchLeadsData({
                            searchvalue: null,
                            pageNumber: 1,
                          });
                        }}
                      >
                        <IoIosClose size={11} />
                      </div>
                    ) : (
                      <CiSearch size={16} />
                    )
                  }
                  labelMarginTop="0px"
                  onChange={handleSearch}
                  value={searchValue}
                  style={{
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                />
              </div>
            </Col>

            {isLargeScreen && (
              <>
                <Col flex="1 1 150px">
                  <CommonMultiSelectField
                    height="34px"
                    label="Technology"
                    labelMarginTop="1px"
                    labelFontSize="11px"
                    options={technologiesData}
                    value={selectedTechnology}
                    onChange={handleSelectTechnology}
                    onBlur={handleSelectTechnologyBlur}
                  />
                </Col>

                {permissions.includes("Lead Executive Filter") && (
                  <>
                    <Col flex="1 1 140px">
                      <CommonSelectField
                        height="33px"
                        label="Select Region"
                        labelMarginTop="0px"
                        labelFontSize="11px"
                        options={regionOptions}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedRegionId(value);
                          setSelectedBranchId(null);
                          setSelectedUserId([]);
                          setPagination({
                            page: 1,
                          });
                          fetchLeadsData({
                            regionId: value,
                            branchId: null,
                            downliners: defaultAllDownliners,
                            pageNumber: 1,
                          });
                          if (value) {
                            getUsersData(value, null);
                            getBranchesData(value);
                          } else {
                            setBranchOptions([]);
                            setSubUsers(downlineUsers);
                          }
                        }}
                        value={selectedRegionId}
                        disableClearable={false}
                      />
                    </Col>

                    <Col flex="1 1 140px">
                      <CommonSelectField
                        height="33px"
                        label="Select Branch"
                        labelMarginTop="0px"
                        labelFontSize="11px"
                        options={branchOptions}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedBranchId(value);
                          setSelectedUserId([]);
                          getUsersData(selectedRegionId, value);
                          setPagination({
                            page: 1,
                          });
                          fetchLeadsData({
                            branchId: value,
                            downliners: defaultAllDownliners,
                            pageNumber: 1,
                          });
                        }}
                        value={selectedBranchId}
                        disableClearable={false}
                        disabled={selectedRegionId == 3 ? true : false}
                      />
                    </Col>
                    <Col flex="1 1 160px">
                      <CommonMultiSelectField
                        height="34px"
                        label="Select User"
                        labelMarginTop="1px"
                        labelFontSize="11px"
                        options={subUsers}
                        onChange={handleSelectUser}
                        onBlur={handleSelectUserBlur}
                        value={selectedUserId}
                      />
                    </Col>
                  </>
                )}
              </>
            )}
            <Col flex="0 1 250px">
              <div style={{ width: "250px", maxWidth: "100%" }}>
                <CommonMuiCustomDatePicker
                  width="250px"
                  dateFontSize="12px"
                  value={selectedDates}
                  onDateChange={(dates) => {
                    setSelectedDates(dates);
                    setPagination({
                      page: 1,
                    });
                    fetchLeadsData({
                      startDate: dates[0],
                      endDate: dates[1],
                      pageNumber: 1,
                    });
                  }}
                />
              </div>
            </Col>

            {/* Advanced Filters */}
            <Col flex="none">
              {!isLargeScreen && (
                <Popover
                  placement="bottomLeft"
                  trigger="click"
                  overlayInnerStyle={{
                    padding: 0,
                    borderRadius: "12px",
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e2e8f0",
                  }}
                  content={
                    <div
                      style={{
                        width: "320px",
                        maxWidth: "calc(100vw - 32px)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          padding: "10px 20px",
                          borderBottom: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "#f8fafc",
                          borderTopLeftRadius: "12px",
                          borderTopRightRadius: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "13px",
                            color: "#0f172a",
                          }}
                        >
                          Advanced Filters
                        </span>

                        <Badge
                          count={3}
                          style={{
                            backgroundColor: "#3b82f6",
                            boxShadow: "0 0 0 2px #f8fafc",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                          maxHeight: "420px",
                          overflowY: "auto",
                          padding: "20px",
                        }}
                      >
                        {/* Technology: small screens only */}
                        {!isLargeScreen && (
                          <CommonMultiSelectField
                            height="34px"
                            label="Technology"
                            labelMarginTop="1px"
                            labelFontSize="11px"
                            options={technologiesData}
                            value={selectedTechnology}
                            onChange={handleSelectTechnology}
                            onBlur={handleSelectTechnologyBlur}
                          />
                        )}

                        {/* Region and Branch: small screens only */}
                        {!isLargeScreen &&
                          permissions.includes("Lead Executive Filter") && (
                            <>
                              <CommonSelectField
                                height="33px"
                                label="Select Region"
                                labelMarginTop="0px"
                                labelFontSize="11px"
                                options={regionOptions}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSelectedRegionId(value);
                                  setSelectedBranchId(null);
                                  setSelectedUserId([]);
                                  setPagination({
                                    page: 1,
                                  });
                                  fetchLeadsData({
                                    regionId: value,
                                    branchId: null,
                                    downliners: defaultAllDownliners,
                                    pageNumber: 1,
                                  });
                                  if (value) {
                                    getUsersData(value, null);
                                    getBranchesData(value);
                                  } else {
                                    setBranchOptions([]);
                                    setSubUsers(downlineUsers);
                                  }
                                }}
                                value={selectedRegionId}
                                disableClearable={false}
                              />

                              <CommonSelectField
                                height="33px"
                                label="Select Branch"
                                labelMarginTop="0px"
                                labelFontSize="11px"
                                options={branchOptions}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSelectedBranchId(value);
                                  setSelectedUserId([]);
                                  getUsersData(selectedRegionId, value);
                                  setPagination({
                                    page: 1,
                                  });
                                  fetchLeadsData({
                                    branchId: value,
                                    downliners: defaultAllDownliners,
                                    pageNumber: 1,
                                  });
                                }}
                                value={selectedBranchId}
                                disableClearable={false}
                                disabled={selectedRegionId == 3 ? true : false}
                              />
                            </>
                          )}
                      </div>
                    </div>
                  }
                >
                  <Button
                    icon={<IoFilter size={14} />}
                    className="leads_advancefilter_button"
                    style={{
                      background: "#fff",
                      borderRadius: "6px",
                      height: "35px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: 500,
                      fontSize: "12px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    Filters
                  </Button>
                </Popover>
              )}
            </Col>
          </Row>
        </Col>

        <Col
          xs={24}
          sm={24}
          md={24}
          lg={permissions.includes("Lead Executive Filter") ? 2 : 12}
          xxl={permissions.includes("Lead Executive Filter") ? 6 : 12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "16px",
          }}
        >
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

      {permissions.includes("Show Region Summary") ? (
        <Row style={{ marginTop: "8px", alignItems: "center" }}>
          <Col span={12}>
            <div
              className="livelead_today_summary_container"
              style={{ marginTop: "12px" }}
            >
              <p className="livelead_today_label">REGION SUMMARY</p>

              <div className="livelead_badge_item online">
                <div
                  className="livelead_badge_dot"
                  style={{ backgroundColor: "#3c9111" }}
                />
                <p className="livelead_badge_text">
                  Hub{" "}
                  <span className="livelead_badge_count">
                    {allRegionsCounts?.hub_region ?? 0}
                  </span>
                </p>
              </div>

              <div className="livelead_badge_item classroom">
                <div
                  className="livelead_badge_dot"
                  style={{ backgroundColor: "#1e90ff" }}
                />
                <p className="livelead_badge_text">
                  Chennai{" "}
                  <span className="livelead_badge_count">
                    {allRegionsCounts?.chennai_region ?? 0}
                  </span>
                </p>
              </div>

              <div className="livelead_badge_item classroom">
                <div
                  className="livelead_badge_dot"
                  style={{ backgroundColor: "#5b69ca" }}
                />
                <p className="livelead_badge_text">
                  Bangalore{" "}
                  <span className="livelead_badge_count">
                    {allRegionsCounts?.bangalore_region ?? 0}
                  </span>
                </p>
              </div>
            </div>
          </Col>
          <Col
            span={12}
            style={{
              display: "flex",
              marginTop: "14px",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {selectedRowKeys.length > 0 && (
              <button
                className="marketing_bulk_whatsapp_button"
                onClick={handleOpenBulkWhatsApp}
              >
                <FaWhatsapp style={{ marginRight: "6px" }} size={15} />
                Send Bulk WhatsApp {`( ${selectedRowKeys.length} )`}
              </button>
            )}
            <button
              className={"create_whatsapp_template_button"}
              onClick={() => setIsTemplateModalOpen(true)}
              style={{ width: "160px" }}
            >
              <FaPlus style={{ marginRight: "6px" }} />
              Create Template
            </button>
          </Col>
        </Row>
      ) : (
        <div></div>
      )}

      <div style={{ marginTop: "22px" }}>
        <CommonTable
          scroll={{
            x: 1050,
          }}
          columns={columns}
          dataSource={leadsData}
          dataPerPage={10}
          loading={loading}
          checkBox="true"
          selectedDatas={handleSelectedRow}
          selectedRowKeys={selectedRowKeys}
          rowKey={(record) => record.id}
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
        />
      </div>

      <SendWhatsAppMessage
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsBulkMode(false);
        }}
        courseOptions={courseOptions}
        customer={selectedLead}
        leadId={selectedLead?.id}
        isBulk={isBulkMode}
        leads={selectedRows}
        onSuccess={() => {
          setSelectedRows([]);
          setSelectedRowKeys([]);
          window.dispatchEvent(new CustomEvent("refreshCampaigns"));
        }}
      />

      <WhatsappTemplate
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
}
