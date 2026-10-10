import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Tag, Row, Col, Tooltip } from "antd";
import { CiSearch } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import { FaWhatsapp, FaPlus } from "react-icons/fa";
import { RedoOutlined } from "@ant-design/icons";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import CreateTemplateModal from "./CreateTemplateModal";
import CommonTable from "../Common/CommonTable";
import {
  getAllDownlineUsers,
  getBranches,
  getLeadsOnly,
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

export default function Marketing() {
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
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchText, setSearchText] = useState("");

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
      render: (text, record) => {
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
      width: 160,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Mobile",
      key: "phone",
      dataIndex: "phone",
      width: 140,
      render: (text, record) => {
        return (
          <div className="customers_candidatename_container">
            <EllipsisTooltip
              text={
                text
                  ? `${
                      text
                        ? record.phone_code.startsWith("+")
                          ? record.phone_code
                          : `+${record.phone_code}`
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
      fixed: "right",
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
      getAllDownlineUsersData(null);
    }
  }, [childUsers]);

  const getAllDownlineUsersData = async (user_id, isRefresh = false) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);

    try {
      const response = await getAllDownlineUsers(
        user_id ? user_id : convertAsJson.user_id,
      );
      console.log("all downlines response", response);
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
    regionId,
    branchId,
    downliners,
    pageNumber,
    limit,
  ) => {
    setLoading(true);
    const payload = {
      ...(searchvalue && { search_filter: searchvalue }),
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
      console.log("leads response", response);
      const apiData = response?.data?.data?.leads || [];
      const pagination = response?.data?.data?.pagination;

      // ✅ Add serial number here
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
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
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
    }, 400);
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
  };

  const handleSelectUserBlur = async () => {
    const value = selectedUserId;

    // if (!value || value.length <= 0) return;

    const stringifiedValue = JSON.stringify(value || []);
    if (prevSelectedUserIdRef.current === stringifiedValue) {
      return;
    }
    prevSelectedUserIdRef.current = stringifiedValue;

    try {
      const response = await getAllDownlineUsers(
        Array.isArray(value) && value.length > 0 ? value : loginUserId,
      );
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setPagination({
        page: 1,
      });
      fetchLeadsData({
        downliners: downliners_ids,
        pageNumber: 1,
      });
    } catch (error) {
      console.log("all downlines error", error);
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
          setBranchOptions(branch_data);
          setSelectedBranchId(branch_data[0]?.id);
        }
      } else {
        setBranchOptions([]);
      }
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
    }
  };

  const getUsersData = async (regionId, branchId) => {
    const payload = {
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setSubUsers(response?.data?.data?.data || []);
    } catch (error) {
      setSubUsers([]);
      console.log("get all users error", error);
    }
  };

  const handleOpenWhatsApp = (lead) => {
    setSelectedCustomer(lead);
    setIsModalOpen(true);
  };

  const handlePaginationChange = ({ page, limit }) => {
    fetchLeadsData({
      pageNumber: page,
      limit: limit,
    });
  };

  const handleRefresh = () => {
    setSearchValue("");
    setSelectedUserId([]);
    prevSelectedUserIdRef.current = "[]";
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setSubUsers(downlineUsers);
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

      <Row align="middle">
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={permissions.includes("Lead Executive Filter") ? 22 : 12}
          xxl={permissions.includes("Lead Executive Filter") ? 18 : 12}
        >
          <Row gutter={12} align="middle" wrap={false}>
            <Col flex="1 1 0%">
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
            {permissions.includes("Lead Executive Filter") && (
              <>
                <Col flex="0.8 1 0%">
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

                <Col flex="0.8 1 0%">
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
                <Col flex="1 1 0%">
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
            <Col flex="1.5 1 0%">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "nowrap",
                  }}
                >
                  <div style={{ flex: "0 0 120px" }}>
                    <CommonMuiCustomDatePicker
                      width="280px"
                      dateFontSize="12.5px"
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
                </div>
              </div>
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
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setIsOpenFilterDrawer(true);
              getTableColumnsData(loginUserId);
            }}
          />

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
            }}
          >
            {/* <Button
              type="primary"
              icon={<FaPlus />}
              onClick={() => setIsTemplateModalOpen(true)}
              style={{ backgroundColor: "#4f46e5" }}
            >
              New Template
            </Button> */}
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
        ""
      )}

      <div style={{ marginTop: "22px" }}>
        <CommonTable
          scroll={{
            x: columns.reduce((total, col) => total + (col.width || 150), 0),
          }}
          columns={columns}
          dataSource={leadsData}
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

      <SendWhatsAppMessage
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        leadId={selectedCustomer?.id}
      />

      <CreateTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
}
