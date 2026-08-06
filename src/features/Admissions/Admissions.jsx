import React, { useState, useRef, useEffect } from "react";
import {
  Row,
  Col,
  Tooltip,
  Drawer,
  Flex,
  Button,
  Radio,
  Divider,
  Checkbox,
  Progress,
} from "antd";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import {
  getAllDownlineUsers,
  getCustomerById,
  getAdmissions,
  getTableColumns,
  updateTableColumns,
} from "../ApiService/action";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import { FaRegEye } from "react-icons/fa";
import { RedoOutlined } from "@ant-design/icons";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import { FiFilter } from "react-icons/fi";
import CommonDnd from "../Common/CommonDnd";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { useSelector } from "react-redux";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import DraggableStudentModal from "../Common/DraggableStudentModal";

export default function Admissions() {
  const mounted = useRef(false);

  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [allAdmissionsRegionCounts, setAllAdmissionsRegionCounts] =
    useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [modeStatus, setModeStatus] = useState("");
  const [status, setStatus] = useState("");
  const [isStatusUpdateDrawerLoading, setIsStatusUpdateDrawerLoading] =
    useState(false);
  const [isOpenCustomerDetailsModal, setIsOpenCustomerDetailsModal] =
    useState(false);
  //feedback usestates
  const [loading, setLoading] = useState(true);
  //executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allDownliners, setAllDownliners] = useState([]);
  //branch filter
  const [branchOptions, setBranchOptions] = useState([
    { id: 1, name: "Classroom", checked: true },
    { id: 1, name: "Online", checked: true },
  ]);
  const [duplicateBranchOptions, setDuplicateBranchOptions] = useState([
    { id: 1, name: "Classroom", checked: true },
    { id: 1, name: "Online", checked: true },
  ]);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  //table dnd
  const [loginUserId, setLoginUserId] = useState("");
  const [updateTableId, setUpdateTableId] = useState(null);
  const [checkAll, setCheckAll] = useState(false);

  const nonChangeColumns = [
    {
      title: "Sl. No",
      key: "row_num",
      dataIndex: "row_num",
      width: 80,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Joined Date",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 110,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Student Id",
      key: "student_id",
      dataIndex: "student_id",
      width: 100,
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <EllipsisTooltip text={text || "-"} />
          {text && (
            <FaRegEye
              size={14}
              className="trainers_action_icons"
              style={{ cursor: "pointer" }}
              onClick={() => {
                getParticularCustomerDetails(record?.customer_id);
              }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Course ",
      key: "course_name",
      dataIndex: "course_name",
      width: 180,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Sale Executive",
      key: "sale_executive",
      dataIndex: "sale_executive",
      width: 150,
      render: (text, record) => {
        const lead_executive = `${record.assigned_to} - ${text}`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: "RA",
      key: "ra_user_name",
      dataIndex: "ra_user_name",
      width: 150,
      render: (text, record) => {
        if (text) {
          const ra = `${record.ra_user_id} - ${text}`;
          return <EllipsisTooltip text={ra} />;
        } else {
          return "-";
        }
      },
    },
    {
      title: "HR",
      key: "hr_user_name",
      dataIndex: "hr_user_name",
      width: 150,
      render: (text, record) => {
        if (text) {
          const hr = `${record.hr_user_id} - ${text}`;
          return <EllipsisTooltip text={hr} />;
        } else {
          return "-";
        }
      },
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);
  const [customersData, setCustomersData] = useState([]);

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    setLoginUserId(convertAsJson?.user_id);
    setTimeout(() => {
      getTableColumnsData(convertAsJson?.user_id);
    }, 300);

    setTableColumns(nonChangeColumns);
  }, [permissions, status]);

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      getAllDownlineUsersData(null);
    }
  }, [childUsers]);

  useEffect(() => {
    const handler = async (e) => {
      const data = e.detail;
      console.log("Received via event:", data, allDownliners);
      setSearchValue("");
      setSelectedUserId(null);

      // Re-run your existing logic
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      try {
        const response = await getAllDownlineUsers(convertAsJson.user_id);
        console.log("all downlines response", response);
        const downliners = response?.data?.data || [];
        const downliners_ids = downliners.map((u) => {
          return u.user_id;
        });
        setAllDownliners(downliners_ids);
      } catch (error) {
        console.log("all downlines error", error);
      }
    };

    window.addEventListener("notificationFilter", handler);
    return () => window.removeEventListener("notificationFilter", handler);
  }, []);

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
      getAdmissionsData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        null,
        null,
        null,
        null,
        downliners_ids,
        [
          { id: 1, name: "Classroom", checked: true },
          { id: 1, name: "Online", checked: true },
        ],
        1,
        10,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getAdmissionsData = async (
    startDate,
    endDate,
    searchvalue,
    bucket,
    origin,
    customerStatus,
    downliners,
    branch_options,
    pageNumber,
    limit,
    is_generate_certificate,
  ) => {
    setLoading(true);

    const region_data = branch_options
      .filter((f) => f.checked === true)
      .map((f) => f.name);

    const payload = {
      ...(searchvalue && filterType == 1
        ? { mobile: searchvalue }
        : searchvalue && filterType == 2
          ? { name: searchvalue }
          : searchvalue && filterType == 3
            ? { email: searchvalue }
            : searchvalue && filterType == 4
              ? { course: searchvalue }
              : {}),
      from_date: startDate,
      to_date: endDate,
      bucket: bucket,
      date_type: "Created",
      ...(origin && { domain: origin }),
      ...(customerStatus && {
        status: customerStatus,
      }),
      user_ids: downliners,
      ...(region_data.includes("Classroom") && region_data.includes("Online")
        ? {}
        : region_data.includes("Classroom")
          ? { region: "Classroom" }
          : region_data.includes("Online")
            ? { region: "Online" }
            : {}),
      page: pageNumber,
      limit: limit,
    };

    try {
      const response = await getAdmissions(payload);
      console.log("admissions response", response);
      const customers = response?.data?.data?.customers || [];
      const pagination = response?.data?.data?.pagination;

      setCustomersData(customers);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
      setAllAdmissionsRegionCounts({
        chennai_region: response?.data?.data?.chennai_region || 0,
        bangalore_region: response?.data?.data?.bangalore_region || 0,
        hub_region: response?.data?.data?.hub_region || 0,
        online_mode: response?.data?.data?.online_mode || 0,
        classroom_mode: response?.data?.data?.classroom_mode || 0,
      });
    } catch (error) {
      setCustomersData([]);
      console.log("get customers error", error);
    } finally {
      setLoading(false);
    }
  };

  const getTableColumnsData = async (user_id) => {
    try {
      const response = await getTableColumns(user_id);
      const data = response?.data?.data || [];
      if (data.length === 0) {
        setUpdateTableId(null);
        const newCols = nonChangeColumns.map((c) => ({
          ...c,
          isChecked: true,
        }));
        setColumns(newCols);
        setTableColumns(nonChangeColumns);
        return updateTableColumnsData(newCols);
      }

      const filterPage = data.find((f) => f.page_name === "Admissions");

      if (!filterPage) {
        setUpdateTableId(null);
        const newCols = nonChangeColumns.map((c) => ({
          ...c,
          isChecked: true,
        }));
        setColumns(newCols);
        setTableColumns(nonChangeColumns);
        return updateTableColumnsData(newCols);
      }

      setUpdateTableId(filterPage.id);

      const filteredBackendColumns = filterPage.column_names || [];

      const attachRenderFunctions = (cols) =>
        cols.map((col) => {
          const original = nonChangeColumns.find((c) => c.key === col.key);
          if (original) {
            return {
              ...col,
              width: original.width,
              fixed: original.fixed,
              hidden: original.hidden,
              render: original.render,
            };
          }
          return col;
        });

      nonChangeColumns.forEach((c) => {
        if (!filteredBackendColumns.some((b) => b.key === c.key)) {
          filteredBackendColumns.push({ ...c, isChecked: true });
        }
      });

      const allColumns = attachRenderFunctions(filteredBackendColumns);
      const visibleColumns = attachRenderFunctions(
        filteredBackendColumns.filter((col) => col.isChecked),
      );

      setColumns(allColumns);
      setTableColumns(visibleColumns);
    } catch (error) {
      console.log("get table columns error", error);
    }
  };

  const updateTableColumnsData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Admissions",
      column_names: columns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  //get particular customer full details
  const getParticularCustomerDetails = async (customer_Id) => {
    setIsStatusUpdateDrawerLoading(true);
    try {
      const response = await getCustomerById(customer_Id);
      console.log("particular customer response", response);
      const customer_details = response?.data?.data;
      setCustomerDetails(customer_details);
      setIsOpenCustomerDetailsModal(true);
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    } finally {
      setIsStatusUpdateDrawerLoading(false);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getAdmissionsData(
      selectedDates[0],
      selectedDates[1],
      searchValue,
      modeStatus,
      selectedOrigin,
      status,
      allDownliners,
      branchOptions,
      page,
      limit,
    );
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setPagination({
      page: 1,
    });
    setTimeout(() => {
      getAdmissionsData(
        selectedDates[0],
        selectedDates[1],
        e.target.value,
        modeStatus,
        selectedOrigin,
        status,
        allDownliners,
        branchOptions,
        1,
        pagination.limit,
      );
    }, 300);
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
      });
      getAdmissionsData(
        selectedDates[0],
        selectedDates[1],
        searchValue,
        modeStatus,
        selectedOrigin,
        status,
        downliners_ids,
        branchOptions,
        1,
        pagination.limit,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setIsOpenFilterDrawer(false);
    setCustomerDetails(null);
  };

  const handleRefresh = () => {
    setStatus("");
    setSearchValue("");
    setSelectedUserId(null);
    setSelectedOrigin("");
    setModeStatus("");
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
    });
    getAllDownlineUsersData(null, true);
  };

  return (
    <div>
      <Row align="middle">
        <Col xs={24} sm={24} md={24} lg={16}>
          <Row gutter={12} align="middle" wrap={false}>
            <Col flex="28%">
              <div
                className="overallduecustomers_filterContainer"
                style={{ marginBottom: "0px" }}
              >
                {/* Search Input */}
                <CommonOutlinedInput
                  label={
                    filterType == 1
                      ? "Search By Mobile"
                      : filterType == 2
                        ? "Search By Name"
                        : filterType == 3
                          ? "Search by Email"
                          : filterType == 4
                            ? "Search by Course"
                            : ""
                  }
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
                          getAdmissionsData(
                            selectedDates[0],
                            selectedDates[1],
                            null,
                            modeStatus,
                            selectedOrigin,
                            status,
                            allDownliners,
                            branchOptions,
                            1,
                            pagination.limit,
                          );
                        }}
                      >
                        <IoIosClose size={11} />
                      </div>
                    ) : (
                      <CiSearch size={16} />
                    )
                  }
                  labelMarginTop="0px"
                  style={{
                    borderTopRightRadius: "0px",
                    borderBottomRightRadius: "0px",
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                  onChange={handleSearch}
                  value={searchValue}
                />
                {/* Filter Button */}
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
                        <Radio.Group
                          value={filterType}
                          onChange={(e) => {
                            setFilterType(e.target.value);
                            if (searchValue === "") {
                              return;
                            } else {
                              setSearchValue("");
                              setPagination({
                                page: 1,
                              });
                              getAdmissionsData(
                                selectedDates[0],
                                selectedDates[1],
                                null,
                                modeStatus,
                                selectedOrigin,
                                status,
                                allDownliners,
                                branchOptions,
                                1,
                                pagination.limit,
                              );
                            }
                          }}
                        >
                          <Radio
                            value={1}
                            style={{ marginTop: "6px", marginBottom: "12px" }}
                          >
                            Search by Mobile
                          </Radio>
                          <Radio value={2} style={{ marginBottom: "12px" }}>
                            Search by Name
                          </Radio>
                          <Radio value={3} style={{ marginBottom: "12px" }}>
                            Search by Email
                          </Radio>
                          <Radio value={4} style={{ marginBottom: "6px" }}>
                            Search by Course
                          </Radio>
                        </Radio.Group>
                      }
                    >
                      <Button className="users_filterbutton">
                        <IoFilter size={16} />
                      </Button>
                    </Tooltip>
                  </Flex>
                </div>
              </div>
            </Col>
            {permissions.includes("Lead Executive Filter") && (
              <Col flex="28%">
                <CommonMultiSelectField
                  height="34px"
                  label="Select User"
                  labelMarginTop="1px"
                  labelFontSize="11px"
                  options={subUsers}
                  onChange={handleSelectUser}
                  value={selectedUserId}
                />
              </Col>
            )}
            <Col flex="none">
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
                        getAdmissionsData(
                          dates[0],
                          dates[1],
                          searchValue,
                          modeStatus,
                          selectedOrigin,
                          status,
                          allDownliners,
                          branchOptions,
                          1,
                          pagination.limit,
                        );
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
          lg={8}
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

          {/* {permissions.includes("Download Customers Data") && (
            <Tooltip placement="top" title="Download">
              <Button
                className="reports_download_button"
                // onClick={() => {
                //   const isWithIn30days = isWithin30Days(
                //     selectedDates[0],
                //     selectedDates[1],
                //   );
                //   console.log("isWithIn30days", isWithIn30days);
                //   const googleReview = {
                //     title: "Google Review",
                //     key: "google_review",
                //     dataIndex: "google_review",
                //   };

                //   const linkedinReview = {
                //     title: "Linkedin Review",
                //     key: "linkedin_review",
                //     dataIndex: "linkedin_review",
                //   };

                //   const alterColumns = columns
                //     // Remove Action and Review Status columns
                //     .filter(
                //       (f) =>
                //         f.title !== "Action" && f.title !== "Review Status",
                //     )
                //     // Insert Google Review & Linkedin Review after TR Number
                //     .flatMap((col) => {
                //       if (col.title === "TR Number") {
                //         return [col, googleReview, linkedinReview];
                //       }

                //       return [col];
                //     });
                //   console.log("alterColumns", alterColumns);
                //   DownloadTableAsCSV(
                //     customersData,
                //     alterColumns,
                //     `${moment(selectedDates[0]).format(
                //       "DD-MM-YYYY",
                //     )} to ${moment(selectedDates[1]).format("DD-MM-YYYY")} ${
                //       status == "" ? "All" : status
                //     } Customers.csv`,
                //   );
                // }}
              >
                <DownloadOutlined size={10} className="download_icon" />
              </Button>
            </Tooltip>
          )} */}

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

      <Row>
        <Col span={12}>
          <div className="livelead_today_summary_container">
            <p className="livelead_today_label">REGION SUMMARY</p>

            <div className="livelead_badge_item online">
              <div
                className="livelead_badge_dot"
                style={{ backgroundColor: "#3c9111" }}
              />
              <p className="livelead_badge_text">
                Hub{" "}
                <span className="livelead_badge_count">
                  {allAdmissionsRegionCounts?.hub_region ?? 0}
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
                  {allAdmissionsRegionCounts?.chennai_region ?? 0}
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
                  {allAdmissionsRegionCounts?.bangalore_region ?? 0}
                </span>
              </p>
            </div>
          </div>
        </Col>
        <Col
          span={12}
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div className="admissions_progress_container">
            <span className="admissions_progress_label">Overall Progress:</span>
            <Progress
              percent={65}
              showInfo={false}
              strokeWidth={6}
              strokeColor={{
                "0%": "#8a9bf8",
                "100%": "#5b69ca",
              }}
              trailColor="#f1f5f9"
              className="admissions_progress_bar"
            />
            <span className="admissions_progress_text">65%</span>
          </div>
        </Col>
      </Row>

      <div
        className="customers_scroll_wrapper"
        style={{ marginTop: "6px", marginBottom: "0px" }}
      >
        <div
          className="customers_status_mainContainer"
          style={{
            marginTop: "0px",
            marginBottom: "0px",
            display: "flex",
            gap: "12px",
          }}
        >
          <div
            className={
              modeStatus === "Online"
                ? "customers_active_completed_container"
                : "customers_completed_container"
            }
            onClick={() => {
              if (modeStatus == "Online") {
                return;
              }
              setModeStatus("Online");
              getAdmissionsData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Online",
                selectedOrigin,
                status,
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
              );
            }}
          >
            <p>Online {`( ${allAdmissionsRegionCounts?.online_mode ?? 0} )`}</p>
          </div>

          <div
            className={
              modeStatus === "Classroom"
                ? "customers_active_verifytrainers_container"
                : "customers_verifytrainers_container"
            }
            onClick={() => {
              if (modeStatus == "Classroom") {
                return;
              }
              setModeStatus("Classroom");
              getAdmissionsData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Classroom",
                selectedOrigin,
                status,
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
              );
            }}
          >
            <p>
              Classroom{" "}
              {`( ${allAdmissionsRegionCounts?.classroom_mode ?? 0} )`}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "12px" }}>
        <CommonTable
          // scroll={{ x: 2350 }}
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={tableColumns}
          dataSource={customersData}
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

      <Drawer
        title="Customer Details"
        open={isOpenDetailsDrawer}
        onClose={() => {
          setIsOpenDetailsDrawer(false);
          setCustomerId(null);
        }}
        width="50%"
        style={{ position: "relative" }}
      >
        {isOpenDetailsDrawer ? (
          <ParticularCustomerDetails customerId={customerId} />
        ) : (
          ""
        )}
      </Drawer>

      {/* table filter drawer */}
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Manage Table</span>
            <div className="managetable_checkbox_container">
              <p style={{ fontWeight: 400, fontSize: "13px" }}>Check All</p>
              <Checkbox
                className="settings_pageaccess_checkbox"
                onChange={(e) => {
                  const checked = e.target.checked;
                  setCheckAll(checked);
                  // Update all checkboxes
                  const updated = columns.map((col) => ({
                    ...col,
                    isChecked: checked,
                  }));
                  setColumns(updated);
                }}
                checked={checkAll}
              />
            </div>
          </div>
        }
        open={isOpenFilterDrawer}
        onClose={formReset}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative", paddingBottom: 50 }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd data={columns} setColumns={setColumns} />
            </div>

            <Divider className="customer_statusupdate_divider" />

            <div style={{ padding: "0px 12px 20px 24px" }}>
              <p className="customers_choosebranch_heading">Choose Branch</p>
              {duplicateBranchOptions.map((item) => {
                return (
                  <div className="customers_choosebranch_checkbox_container">
                    <p>{item.name}</p>
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const updateBranchData = duplicateBranchOptions.map(
                          (u) => {
                            if (u.name == item.name) {
                              return { ...u, checked: e.target.checked };
                            }
                            return u;
                          },
                        );
                        const bothFalse = updateBranchData.every(
                          (item) => item.checked === false,
                        );

                        if (bothFalse) {
                          CommonMessage("error", "Choose Atleast One Branch");
                          return;
                        }
                        setDuplicateBranchOptions(updateBranchData);
                      }}
                      value={item.checked}
                    />
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={async () => {
                const visibleColumns = columns.filter((col) => col.isChecked);
                console.log("visibleColumns", visibleColumns);
                setTableColumns(visibleColumns);
                setIsOpenFilterDrawer(false);

                const payload = {
                  user_id: loginUserId,
                  id: updateTableId,
                  page_name: "Admissions",
                  column_names: columns,
                };
                setBranchOptions(duplicateBranchOptions);
                getAdmissionsData(
                  selectedDates[0],
                  selectedDates[1],
                  searchValue,
                  modeStatus,
                  selectedOrigin,
                  status,
                  allDownliners,
                  duplicateBranchOptions,
                  pagination.page,
                  pagination.limit,
                );
                try {
                  await updateTableColumns(payload);
                  setTimeout(() => {
                    getTableColumnsData(loginUserId);
                  }, 300);
                } catch (error) {
                  console.log("update table columns error", error);
                }
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Drawer>

      <DraggableStudentModal
        open={isOpenCustomerDetailsModal}
        onClose={() => setIsOpenCustomerDetailsModal(false)}
        customerDetails={customerDetails}
      />
    </div>
  );
}
