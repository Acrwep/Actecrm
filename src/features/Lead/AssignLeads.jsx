import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Flex,
  Tooltip,
  Radio,
  Button,
  Badge,
  Spin,
  Modal,
  Drawer,
  Checkbox,
  Divider,
} from "antd";
import { IoIosClose } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { LoadingOutlined } from "@ant-design/icons";
import { DownloadOutlined } from "@ant-design/icons";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonDnd from "../Common/CommonDnd";
import { GiCardPickup } from "react-icons/gi";
import { PiShareFatBold } from "react-icons/pi";
import { LiaUserClockSolid } from "react-icons/lia";
import { MdOutlinePlaylistRemove } from "react-icons/md";
import { MdOutlineRefresh, MdOutlineCheckCircle } from "react-icons/md";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  assignLiveLead,
  getAllDownlineUsers,
  getLeadAndFollowupCount,
  acknowledgeLead,
  getManualAssignLeads,
  getUsers,
  liveLeadManualAssign,
  moveLiveLeadToJunk,
  getUsersByRole,
  leadReEntry,
  getTableColumns,
  updateTableColumns,
  getCustomerById,
  getCustomerFullHistory,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  getCurrentandPreviousweekDate,
  selectValidator,
} from "../Common/Validation";
import CommonTable from "../Common/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import CommonTextArea from "../Common/CommonTextArea";
import moment from "moment";
import { storeAssignLeadFilterValues } from "../Redux/Slice";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import CustomerHistory from "../Customers/CustomerHistory";

export default function AssignLeads({
  leadTypeOptions,
  regionOptions,
  refreshLeadFollowUp,
  refreshLeads,
  refreshJunkLeads,
  setAssignLeadCount,
  onPickLead,
  refreshToggle,
}) {
  const dispatch = useDispatch();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  //usestates
  const filterValuesFromRedux = useSelector(
    (state) => state.assignleadfiltervalues,
  );
  const tabName = useSelector((state) => state.leadmanageractivepage);
  const [filterType, setFilterType] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedBucket, setSelectedBucket] = useState("Assigned");
  const [bucketCounts, setBucketCounts] = useState({
    assigned: 0,
    consigned: 0,
    awaiting: 0,
    reassigned: 0,
  });
  const [leadData, setLeadData] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [saleUsers, setSaleUsers] = useState([]);
  const [downloadButtonLoader, setDownloadButtonLoader] = useState(false);
  //pick lead drawer
  const [pickLeadItem, setPickLeadItem] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [allDownliners, setAllDownliners] = useState([]);
  const [leadId, setLeadId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isActualLead, setIsActualLead] = useState(false);
  const [actualLeadItem, setActualLeadItem] = useState(null);
  //move modal
  const [isOpenMoveModal, setIsOpenMoveModal] = useState(false);
  const [isOpenAcknowledgeModal, setIsOpenAcknowledgeModal] = useState(false);
  const [acknowledgeLeadItem, setAcknowledgeLeadItem] = useState(null);
  //assign lead
  const [isOpenAssignModal, setIsOpenAssignModal] = useState(false);
  const [allUsersList, setAllUsersList] = useState([]);
  const [assignId, setAssignId] = useState(null);
  const [assignIdError, setAssignIdError] = useState("");
  //junk usestates
  const [isOpenJunkModal, setIsOpenJunkModal] = useState(false);
  const [junkComments, setJunkComments] = useState("");
  const [junkCommentsError, setJunkCommentsError] = useState("");
  const [liveLeadId, setLiveLeadId] = useState(null);
  //customer history usestates
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  //loading
  const [loading, setLoading] = useState(true);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const formatDuration = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();

    const diffMs = now - created;

    if (diffMs < 0) return { text: "00:00", hours: 0 };

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalHours = totalSeconds / 3600;

    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const pad = (n) => String(n).padStart(2, "0");

    let text = "";

    if (days === 0) {
      const hh = pad(Math.floor(totalSeconds / 3600));
      text = `${hh}h:${pad(minutes)}m`;
    } else {
      text = `${pad(days)}d:${pad(hours)}h:${pad(minutes)}m`;
    }

    return { text, hours: totalHours };
  };

  const nonChangeColumns = [
    // { title: "Sl. No", key: "row_num", dataIndex: "row_num", width: 60 },
    {
      title: "Assigned At",
      key: "assigned_date_ist",
      dataIndex: "assigned_date_ist",
      width: 160,
      render: (text) => {
        return (
          <p>{text ? moment(text).format("DD/MM/YYYY - HH:mm:ss") : "-"}</p>
        );
      },
    },
    {
      title: "Assigned Before",
      key: "assigned_before_ist",
      dataIndex: "assigned_date_ist",
      width: 130,
      render: (text) => {
        const { text: durationText, hours } = formatDuration(text);

        let bg = "";
        let color = "";

        if (hours <= 1) {
          bg = "rgba(0, 128, 0, 0.12)"; // light green
          color = "#0f8a0f"; // dark green
        } else if (hours > 1 && hours <= 24) {
          bg = "rgba(255, 165, 0, 0.15)"; // light orange
          color = "#d27a00"; // dark orange
        } else {
          bg = "rgba(255, 0, 0, 0.13)"; // light red
          color = "#c80000"; // dark red
        }

        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                background: bg,
                color: color,
                padding: "3px 8px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                display: "inline-block",
                minWidth: "75px",
                textAlign: "center",
              }}
            >
              {durationText}
            </span>
          </div>
        );
      },
    },
    {
      title: "Assign By",
      key: "assigned_by_user",
      dataIndex: "assigned_by_user",
      width: 130,
      render: (text, record) => {
        const lead_executive = `${record.assigned_by} - ${text}`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    ...(selectedBucket === "Assigned" || selectedBucket === "Reassigned"
      ? [
          {
            title: "Assigned Branch",
            key: "assigned_branch_name",
            dataIndex: "assigned_branch_name",
            width: 130,
            render: (text, record) => {
              return <EllipsisTooltip text={text} />;
            },
          },
        ]
      : []),
    {
      title: "Assign To",
      key: "assigned_to_user",
      dataIndex: "assigned_to_user",
      width: 130,
      render: (text, record) => {
        if (text) {
          const lead_executive = `${record.assigned_to} - ${text}`;
          return <EllipsisTooltip text={lead_executive} />;
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      width: 200,
      render: (text, record) => {
        return (
          <>
            {record.lead_type == "New" || record.lead_type == null ? (
              <Badge
                size="small"
                count={
                  record.lead_type == "New" || record.lead_type == null
                    ? "New"
                    : "Existing"
                }
                offset={
                  record.lead_type == "New" || record.lead_type == null
                    ? [22, 0]
                    : [30, 0]
                }
                color={
                  record.lead_type == "New" || record.lead_type == null
                    ? "#1e90ff"
                    : "#d32f2f"
                }
                style={{ fontSize: "9px" }}
              >
                {text.length > 16 ? (
                  <Tooltip
                    color="#fff"
                    placement="bottom"
                    title={text}
                    className="leadtable_comments_tooltip"
                    styles={{
                      body: {
                        backgroundColor: "#fff", // Tooltip background
                        color: "#333", // Tooltip text color
                        fontWeight: 500,
                        fontSize: "12px",
                      },
                    }}
                  >
                    <p style={{ cursor: "pointer", fontSize: "12px" }}>
                      {text.slice(0, 15) + "..."}
                    </p>
                  </Tooltip>
                ) : (
                  <p style={{ fontSize: "12px" }}>{text}</p>
                )}
              </Badge>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Course",
      key: "course",
      dataIndex: "course",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    ...(selectedBucket === "Assigned"
      ? [
          {
            title: "Location",
            key: "location",
            dataIndex: "location",
            width: 160,
            render: (text) => {
              return <EllipsisTooltip text={text} />;
            },
          },
          {
            title: "Origin",
            key: "domain_origin",
            dataIndex: "domain_origin",
            width: 90,
            hidden: permissions.includes("Show Origin in Live Leads")
              ? false
              : true,
            render: (text) => {
              return (
                <EllipsisTooltip
                  text={text ? (text == "Direct" ? "-" : text) : "-"}
                />
              );
            },
          },
        ]
      : []),
    {
      title: "Training Mode",
      key: "training",
      dataIndex: "training",
      fixed: "right",
      width: 140,
      render: (text) => {
        if (text.includes("Online")) {
          return (
            <div className="livelead_onlinetraining_container">
              <p>Online</p>
            </div>
          );
        } else if (text.includes("Classroom")) {
          return (
            <div className="livelead_classroomtraining_container">
              <p>Classroom</p>
            </div>
          );
        } else if (text.includes("Corporate")) {
          return (
            <div className="livelead_corporatetraining_container">
              <p>Corporate</p>
            </div>
          );
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    ...(selectedBucket === "Assigned" ||
    selectedBucket === "Reassigned" ||
    selectedBucket === "Awaiting"
      ? [
          {
            title: "Action",
            key: "action",
            dataIndex: "action",
            fixed: "right",
            width: 90,
            render: (text, record) => {
              const getLoginUserDetails =
                localStorage.getItem("loginUserDetails");
              const convertAsJson = JSON.parse(getLoginUserDetails);
              return (
                <div className="trainers_actionbuttonContainer">
                  {record?.lead_entry_type == 1 ? (
                    <Tooltip placement="bottom" title="Pick">
                      <GiCardPickup
                        size={21}
                        color="#5b69ca"
                        className="trainers_action_icons"
                        onClick={() => {
                          handlePick(record);
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <>
                      {record.assigned_to == null ? (
                        <Tooltip placement="bottom" title="Assign to Executive">
                          <PiShareFatBold
                            size={19}
                            color="#f67f07"
                            className="trainers_action_icons"
                            onClick={() => {
                              setActualLeadItem(record);
                              setIsActualLead(true);
                              setIsOpenAssignModal(true);
                              getUsersData(record?.assigned_branch_id);
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <>
                          {record.assigned_to == convertAsJson?.user_id ? (
                            <Tooltip placement="bottom" title="Acknowledge">
                              <MdOutlineCheckCircle
                                size={19}
                                color="#3c9111"
                                className="trainers_action_icons"
                                onClick={() => {
                                  setAcknowledgeLeadItem(record);
                                  setIsOpenAcknowledgeModal(true);
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip
                              placement="bottom"
                              title="Waiting for Acknowledgement"
                            >
                              <LiaUserClockSolid size={19} color="gray" />
                            </Tooltip>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {record?.lead_entry_type == 1 && (
                    <Tooltip placement="bottom" title="Move to Trash">
                      <MdOutlinePlaylistRemove
                        color="#d32f2f"
                        size={20}
                        className="trainers_action_icons"
                        onClick={() => {
                          setLiveLeadId(record.id);
                          setIsOpenJunkModal(true);
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
              );
            },
          },
        ]
      : []),

    ...(selectedBucket === "Consigned"
      ? [
          {
            title: "Is Customer",
            key: "converted",
            dataIndex: "converted",
            fixed: "right",
            width: 110,
            render: (text, record) =>
              text ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <p
                    className="customerdetails_text"
                    style={{ fontWeight: 700, color: "#3c9111" }}
                  >
                    Yes
                  </p>

                  <Tooltip
                    placement="bottom"
                    title="View Customer Track"
                    className="leadtable_comments_tooltip"
                  >
                    <FaRegEye
                      color="#333"
                      size={14}
                      style={{
                        marginTop: "3px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedCustomerId(record?.customer_id ?? null);
                        setIsOpenCustomerHistoryDrawer(true);
                      }}
                    />
                  </Tooltip>
                </div>
              ) : (
                <p
                  className="customerdetails_text"
                  style={{ color: "rgb(211, 47, 47)", fontWeight: 700 }}
                >
                  No
                </p>
              ),
          },
        ]
      : []),
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);
  const [updateTableId, setUpdateTableId] = useState(null);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [checkAll, setCheckAll] = useState(true);

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  const updateTableColumnsData = async (defaultColumns) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Assign Leads",
      column_names: defaultColumns || columns,
    };
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
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

      const filterPage = data.find((f) => f.page_name === "Assign Leads");

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

  useEffect(() => {
    if (columns.length > 0) {
      let currentColumns = columns;
      const missingColumns = nonChangeColumns.filter(
        (c) => !columns.some((col) => col.key === c.key),
      );

      if (missingColumns.length > 0) {
        const newCols = missingColumns.map((c) => ({ ...c, isChecked: true }));
        currentColumns = [...columns, ...newCols];
        setColumns(currentColumns);
      }

      const visibleColumns = currentColumns
        .filter((col) => col.isChecked)
        .map((col) => {
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
          return null;
        })
        .filter(Boolean);

      setTableColumns(visibleColumns);
    }
  }, [selectedBucket]);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    if (convertAsJson?.user_id) {
      getTableColumnsData(convertAsJson.user_id);
    }
  }, [permissions]);

  useEffect(() => {
    if (permissions.length >= 1) {
      setSelectedDates([
        filterValuesFromRedux.start_date,
        filterValuesFromRedux.end_date,
      ]);
      setFilterType(filterValuesFromRedux.filterType);
      setSearchValue(filterValuesFromRedux.searchValue);
      setPagination({
        page: filterValuesFromRedux.pageNumber,
        limit: filterValuesFromRedux.pageLimit,
      });
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      // getAllDownlineUsersData(convertAsJson?.user_id);
      getSaleUsersData();
    }
  }, [permissions]);

  const getSaleUsersData = async () => {
    const payload = {
      role: "SALE",
    };
    try {
      const response = await getUsersByRole(payload);
      console.log("get sale users response", response);
      setSaleUsers(response?.data?.data?.data || []);
    } catch (error) {
      setSaleUsers([]);
      console.log("get sale users error", error);
    }
  };

  const getAllDownlineUsersData = async (user_id) => {
    try {
      const response = await getAllDownlineUsers(user_id);
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

  const getManualAssignLeadsData = async (
    searchvalue,
    startDate,
    endDate,
    pageNumber,
    limit,
    bucketName = selectedBucket,
  ) => {
    setLoading(true);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      ...(searchvalue && filterType == 1
        ? { phone: searchvalue }
        : searchvalue && filterType == 2
          ? { name: searchvalue }
          : searchvalue && filterType == 3
            ? { email: searchvalue }
            : searchvalue && filterType == 4
              ? { course: searchvalue }
              : {}),
      start_date: startDate,
      end_date: endDate,
      ...(!permissions.includes("View All Assigned Leads")
        ? { user_ids: [convertAsJson?.user_id] }
        : {}),
      ...(bucketName ? { bucket: bucketName } : {}),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getManualAssignLeads(payload);
      console.log("get manual assign leads response", response);
      const data = response?.data?.data?.data || [];
      const pagination = response?.data?.data?.pagination;

      const assigned = response?.data?.data?.assigned || 0;
      const consigned = response?.data?.data?.consigned || 0;
      const awaiting = response?.data?.data?.awaiting || 0;
      const reassigned = response?.data?.data?.reassigned || 0;
      setBucketCounts({
        assigned: assigned,
        consigned: consigned,
        awaiting: awaiting,
        reassigned: reassigned,
      });
      setLeadData(data);
      setAssignLeadCount(assigned);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
      dispatch(
        storeAssignLeadFilterValues({
          pageNumber: pagination.page,
          pageLimit: pagination.limit,
        }),
      );
    } catch (error) {
      setLeadData([]);
      console.log("get manual assign leads error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    if (tabName !== "assign_leads") return;
    if (permissions.length >= 1) {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getManualAssignLeadsData(
        filterValuesFromRedux.searchValue,
        filterValuesFromRedux.start_date
          ? filterValuesFromRedux.start_date
          : PreviousAndCurrentDate[0],
        filterValuesFromRedux.end_date
          ? filterValuesFromRedux.end_date
          : PreviousAndCurrentDate[1],
        filterValuesFromRedux.pageNumber,
        filterValuesFromRedux.pageLimit,
      );
    }
  }, [refreshToggle, tabName]);

  const handlePick = async (item) => {
    console.log("itemmmm", item);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    const pickedData = {
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      location: item.location ? item.location : "",
      course: item.course ? item.course : "",
      training: item.training ? item.training : "",
      comments: item.comments ? item.comments : "",
      is_assign_lead: true,
    };
    if (onPickLead) {
      onPickLead(pickedData);
    } else {
      setPickLeadItem(pickedData);
      setIsOpenAddDrawer(true);
    }
  };

  const handleAcknowledgeLead = async () => {
    if (!acknowledgeLeadItem) return;
    setButtonLoading(true);
    try {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      const payload = {
        lead_id: acknowledgeLeadItem.id,
        acknowledged_by: convertAsJson?.user_id,
        acknowledged_date: moment().format("YYYY-MM-DD HH:mm:ss"),
      };
      await acknowledgeLead(payload);
      CommonMessage("success", "Lead acknowledged successfully");
      setIsOpenAcknowledgeModal(false);
      setAcknowledgeLeadItem(null);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getManualAssignLeadsData(
        searchValue,
        selectedDates[0] ? selectedDates[0] : PreviousAndCurrentDate[0],
        selectedDates[1] ? selectedDates[1] : PreviousAndCurrentDate[1],
        pagination.page,
        pagination.limit,
      );
      if (refreshLeads) {
        refreshLeads();
      }
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details || "Failed to acknowledge lead",
      );
    } finally {
      setButtonLoading(false);
    }
  };

  const handleSelectedRow = (row) => {
    console.log("selected rowwww", row);
    setSelectedRows(row);
    const keys = row.map((item) => item.id); // or your unique row key
    setSelectedRowKeys(keys);
  };

  const handleMoveToLiveLead = async () => {
    console.log("selectedRowKeys", selectedRowKeys);
    setButtonLoading(true);
    const payload = {
      lead_ids: selectedRows.length >= 1 ? selectedRowKeys : [leadId],
      is_assigned: false,
    };
    try {
      await liveLeadManualAssign(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        setButtonLoading(false);
        setIsOpenMoveModal(false);
        setLeadId(null);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        getManualAssignLeadsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          pagination.page,
          pagination.limit,
        );
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    dispatch(
      storeAssignLeadFilterValues({
        pageNumber: page,
        pageLimit: limit,
      }),
    );
    getManualAssignLeadsData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      page,
      limit,
    );
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    dispatch(
      storeAssignLeadFilterValues({
        searchValue: e.target.value,
        pageNumber: 1,
        pageLimit: pagination.limit,
      }),
    );
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getManualAssignLeadsData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        1,
        pagination.limit,
      );
    }, 300);
  };

  const getUsersData = async (branch_id = null) => {
    const payload = {
      ...(branch_id && { branch_id: branch_id }),
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setAllUsersList(response?.data?.data?.data || []);
    } catch (error) {
      setAllUsersList([]);
      console.log("get all users error", error);
    }
  };

  const handleAssignLead = async () => {
    console.log("selectedRowKeys", selectedRowKeys, "accc", actualLeadItem);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    const today = new Date();
    const userValidate = selectValidator(assignId);

    setAssignIdError(userValidate);

    if (userValidate) return;

    if (isActualLead) {
      setButtonLoading(true);
      const reEntryPayload = {
        lead_ids: [actualLeadItem?.id],
        assign_date: formatToBackendIST(today),
        next_follow_up_date: null,
        next_followup_time: null,
        today_followup_date: null,
        assigned_to: assignId,
        updated_by: convertAsJson?.user_id,
        is_branch_changed: null,
        assigned_manager: null,
        branch_manager_id: null,
      };

      try {
        await leadReEntry(reEntryPayload);
        CommonMessage("success", "Lead Assigned");
        setTimeout(() => {
          setTimeout(() => {
            setButtonLoading(false);
            setIsOpenAssignModal(false);
            setAssignId(null);
            setAssignIdError("");
            setSelectedRows([]);
            setSelectedRowKeys([]);
            getManualAssignLeadsData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              pagination.page,
              pagination.limit,
            );
          }, 300);
        }, 300);
      } catch (error) {
        console.log("lead create error", error);
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    } else {
      setButtonLoading(true);
      const payload = {
        user_id: assignId,
        assigned_by: convertAsJson?.id,
        lead_ids: selectedRows.length >= 1 ? selectedRowKeys : [liveLeadId],
        is_assigned: true,
        is_reassigned: false,
        assigned_date: formatToBackendIST(today),
      };

      try {
        await liveLeadManualAssign(payload);
        CommonMessage("success", "Updated");
        setTimeout(() => {
          setButtonLoading(false);
          setIsOpenAssignModal(false);
          setAssignId(null);
          setAssignIdError("");
          setSelectedRows([]);
          setSelectedRowKeys([]);
          getManualAssignLeadsData(
            searchValue,
            selectedDates[0],
            selectedDates[1],
            pagination.page,
            pagination.limit,
          );
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    }
  };

  const handleMoveToJunk = async () => {
    console.log("selectedRowKeys", selectedRowKeys);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const commentsValidate = addressValidator(junkComments);

    setJunkCommentsError(commentsValidate);

    if (commentsValidate) return;

    setButtonLoading(true);
    const payload = {
      lead_ids: selectedRows.length >= 1 ? selectedRowKeys : [liveLeadId],
      is_junk: true,
      reason: junkComments,
      junk_by: convertAsJson?.user_id,
    };
    try {
      await moveLiveLeadToJunk(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        setButtonLoading(false);
        setIsOpenJunkModal(false);
        setLiveLeadId(null);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        setJunkComments("");
        getManualAssignLeadsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          pagination.page,
          pagination.limit,
        );
        refreshJunkLeads();
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleDownload = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      ...(searchValue && filterType == 1
        ? { phone: searchValue }
        : searchValue && filterType == 2
          ? { name: searchValue }
          : searchValue && filterType == 3
            ? { email: searchValue }
            : searchValue && filterType == 4
              ? { course: searchValue }
              : {}),
      // start_date: startDate,
      // end_date: endDate,
      ...(!permissions.includes("View All Assigned Leads")
        ? { user_ids: [convertAsJson?.user_id] }
        : {}),
      ...(selectedBucket ? { bucket: selectedBucket } : {}),
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getManualAssignLeads(payload);
      console.log("get manual assign leads response", response);
      const download_data = response?.data?.data?.data || [];
      const alterColumns = tableColumns.filter(
        (f) => f.title !== "Action" && f.title !== "Assigned Before",
      );
      DownloadTableAsCSV(
        download_data,
        alterColumns,
        `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
          selectedDates[1],
        ).format("DD-MM-YYYY")} Assign Leads.csv`,
      );
      setTimeout(() => {
        setDownloadButtonLoader(false);
      }, 300);
    } catch (error) {
      setDownloadButtonLoader(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const drawerColumns = columns.filter((col) =>
    nonChangeColumns.some((c) => c.key === col.key),
  );

  const handleSetDrawerColumns = (updatedDrawerColumnsOrUpdater) => {
    setColumns((prevColumns) => {
      const updatedDrawerColumns =
        typeof updatedDrawerColumnsOrUpdater === "function"
          ? updatedDrawerColumnsOrUpdater(drawerColumns)
          : updatedDrawerColumnsOrUpdater;

      const hiddenColumns = prevColumns.filter(
        (col) => !nonChangeColumns.some((c) => c.key === col.key),
      );

      return [...updatedDrawerColumns, ...hiddenColumns];
    });
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={8}>
              <div className="overallduecustomers_filterContainer">
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
                  height="33px"
                  labelFontSize="12px"
                  icon={
                    searchValue ? (
                      <div
                        className="users_filter_closeIconContainer"
                        onClick={() => {
                          setSearchValue("");
                          setPagination({
                            page: 1,
                          });
                          dispatch(
                            storeAssignLeadFilterValues({
                              searchValue: null,
                              pageNumber: 1,
                              pageLimit: pagination.limit,
                            }),
                          );
                          getManualAssignLeadsData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
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
                  labelMarginTop="-1px"
                  style={{
                    borderTopRightRadius: "0px",
                    borderBottomRightRadius: "0px",
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                  value={searchValue}
                  onChange={handleSearch}
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
                            dispatch(
                              storeAssignLeadFilterValues({
                                filterType: e.target.value,
                              }),
                            );
                            if (searchValue == "") {
                              return;
                            } else {
                              setSearchValue("");
                              dispatch(
                                storeAssignLeadFilterValues({
                                  searchValue: "",
                                  pageNumber: 1,
                                  pageLimit: pagination.limit,
                                }),
                              );
                              setPagination({
                                page: 1,
                              });
                              getManualAssignLeadsData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
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
                        <IoFilter size={18} />
                      </Button>
                    </Tooltip>
                  </Flex>
                </div>
              </div>
            </Col>
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  dispatch(
                    storeAssignLeadFilterValues({
                      start_date: dates[0],
                      end_date: dates[1],
                      pageNumber: 1,
                      pageLimit: pagination.limit,
                    }),
                  );
                  setPagination({
                    page: 1,
                  });
                  getManualAssignLeadsData(
                    searchValue,
                    dates[0],
                    dates[1],
                    1,
                    pagination.limit,
                  );
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={7}>
          <div className="livelead_junkbutton_container">
            {selectedRows.length >= 1 ? (
              <>
                {permissions.includes("Assign Lead") && (
                  <button
                    className="leadmanager_addleadbutton"
                    onClick={() => {
                      setIsOpenAssignModal(true);
                      getUsersData();
                    }}
                  >
                    Assign Lead
                  </button>
                )}

                <Button
                  className="livelead_junkbutton"
                  onClick={() => {
                    setIsOpenJunkModal(true);
                  }}
                >
                  Move to Trash
                </Button>
              </>
            ) : (
              <>
                {permissions.includes("Download Leads") && (
                  <Tooltip placement="top" title="Download">
                    <Button
                      className={
                        downloadButtonLoader
                          ? "customer_loading_download_button"
                          : "customer_download_button"
                      }
                      style={{ padding: "2px 10px" }}
                      onClick={handleDownload}
                      disabled={downloadButtonLoader}
                    >
                      {downloadButtonLoader ? (
                        <Spin
                          indicator={<LoadingOutlined spin />}
                          style={{ color: "#333" }}
                          size="small"
                        />
                      ) : (
                        <DownloadOutlined className="download_icon" />
                      )}
                    </Button>
                  </Tooltip>
                )}

                {permissions.includes("Download Leads") && (
                  <FiFilter
                    size={20}
                    color="#5b69ca"
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                    onClick={() => {
                      setIsOpenFilterDrawer(true);
                      // getTableColumnsData is already called in useEffect on mount/deps change
                    }}
                  />
                )}
              </>
            )}
          </div>
        </Col>
      </Row>

      <div
        style={{
          marginTop: "15px",
          padding: "0 5px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div
          className={`leadmanager_bucket ${selectedBucket === "Assigned" ? "active" : ""}`}
          onClick={() => {
            if (selectedBucket == "Assigned") {
              return;
            }
            setSelectedBucket("Assigned");
            getManualAssignLeadsData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              1,
              pagination.limit,
              "Assigned",
            );
          }}
          style={{
            border: `1px solid ${selectedBucket === "Assigned" ? "#1890ff" : "#1890ff66"}`,
            backgroundColor:
              selectedBucket === "Assigned" ? "#1890ff" : "#1890ff15",
            color: selectedBucket === "Assigned" ? "#fff" : "#1890ff",
            minWidth: "max-content",
          }}
        >
          Fresh {`( ${bucketCounts.assigned || 0} )`}
        </div>
        <div
          className={`leadmanager_bucket ${selectedBucket === "Reassigned" ? "active" : ""}`}
          onClick={() => {
            if (selectedBucket == "Reassigned") {
              return;
            }
            setSelectedBucket("Reassigned");
            getManualAssignLeadsData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              1,
              pagination.limit,
              "Reassigned",
            );
          }}
          style={{
            border: `1px solid ${selectedBucket === "Reassigned" ? "#722ed1" : "#722ed166"}`,
            backgroundColor:
              selectedBucket === "Reassigned" ? "#722ed1" : "#722ed115",
            color: selectedBucket === "Reassigned" ? "#fff" : "#722ed1",
            minWidth: "max-content",
          }}
        >
          Reassigned {`( ${bucketCounts.reassigned || 0} )`}
        </div>
        <div
          className={`leadmanager_bucket ${selectedBucket === "Awaiting" ? "active" : ""}`}
          onClick={() => {
            if (selectedBucket == "Awaiting") {
              return;
            }
            setSelectedBucket("Awaiting");
            getManualAssignLeadsData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              1,
              pagination.limit,
              "Awaiting",
            );
          }}
          style={{
            border: `1px solid ${selectedBucket === "Awaiting" ? "#faad14" : "#faad1466"}`,
            backgroundColor:
              selectedBucket === "Awaiting" ? "#faad14" : "#faad1415",
            color: selectedBucket === "Awaiting" ? "#fff" : "#faad14",
            minWidth: "max-content",
          }}
        >
          Awaiting {`( ${bucketCounts.awaiting || 0} )`}
        </div>
        <div
          className={`leadmanager_bucket ${selectedBucket === "Consigned" ? "active" : ""}`}
          onClick={() => {
            if (selectedBucket == "Consigned") {
              return;
            }
            setSelectedBucket("Consigned");
            getManualAssignLeadsData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              1,
              pagination.limit,
              "Consigned",
            );
          }}
          style={{
            border: `1px solid ${selectedBucket === "Consigned" ? "#ff7a45" : "#ff7a4566"}`,
            backgroundColor:
              selectedBucket === "Consigned" ? "#ff7a45" : "#ff7a4515",
            color: selectedBucket === "Consigned" ? "#fff" : "#ff7a45",
            minWidth: "max-content",
          }}
        >
          Consigned {`( ${bucketCounts.consigned || 0} )`}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1500 }}
          columns={tableColumns}
          dataSource={leadData}
          dataPerPage={10}
          checkBox={permissions.includes("Assign Lead") ? "true" : "false"}
          // checkBox={"false"}
          loading={loading}
          size="small"
          className="questionupload_table"
          selectedDatas={handleSelectedRow}
          selectedRowKeys={selectedRowKeys}
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
          getCheckboxProps={(record) => ({
            disabled: record?.lead_entry_type != 1,
            style: { display: record?.lead_entry_type == 1 ? "" : "none" },
          })}
        />
      </div>

      {/* move to live lead modal */}
      <Modal
        open={isOpenMoveModal}
        onCancel={() => {
          setIsOpenMoveModal(false);
          setLeadId(null);
        }}
        footer={false}
        closable={false}
        width={420}
      >
        <div className="junklead_movemodalContainer">
          <div className="junklead_movemodal_iconContainer">
            <MdOutlineRefresh size={21} color="#5b69ca" />
          </div>

          <p className="common_deletemodal_confirmdeletetext">
            Move to Live Lead
          </p>

          <p className="common_deletemodal_text">
            Are you sure want to move the Leads to Live Leads?
          </p>

          <div className="common_deletemodal_footerContainer">
            <Button
              className="common_deletemodal_cancelbutton"
              onClick={() => {
                setIsOpenMoveModal(false);
                setLeadId(null);
              }}
            >
              No
            </Button>
            {buttonLoading ? (
              <Button
                className="common_deletemodal_loading_deletebutton"
                type="primary"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                className="common_deletemodal_deletebutton"
                onClick={handleMoveToLiveLead}
                type="primary"
              >
                Yes
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={isOpenAcknowledgeModal}
        onCancel={() => {
          setIsOpenAcknowledgeModal(false);
          setAcknowledgeLeadItem(null);
        }}
        footer={false}
        closable={false}
        width={420}
      >
        <div className="junklead_movemodalContainer">
          <div className="junklead_movemodal_iconContainer">
            <MdOutlineCheckCircle size={24} color="#5b69ca" />
          </div>

          <p className="common_deletemodal_confirmdeletetext">
            Acknowledge Lead
          </p>

          <p className="common_deletemodal_text">
            Are you sure you want to acknowledge this lead?
          </p>

          <div className="common_deletemodal_footerContainer">
            <Button
              className="common_deletemodal_cancelbutton"
              onClick={() => {
                setIsOpenAcknowledgeModal(false);
                setAcknowledgeLeadItem(null);
              }}
            >
              No
            </Button>
            {buttonLoading ? (
              <Button
                className="common_deletemodal_loading_deletebutton"
                style={{ backgroundColor: "#5b69ca", borderColor: "#5b69ca" }}
                type="primary"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                className="common_deletemodal_deletebutton"
                style={{
                  backgroundColor: "#5b69ca",
                  borderColor: "#5b69ca",
                  color: "#fff",
                }}
                onClick={handleAcknowledgeLead}
                type="primary"
              >
                Yes
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* assign lead modal */}
      <Modal
        title="Assign Leads"
        open={isOpenAssignModal}
        onCancel={() => {
          setIsOpenAssignModal(false);
          setAssignId(null);
          setAssignIdError("");
          setActualLeadItem(null);
          setIsActualLead(false);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenAssignModal(false);
              setAssignId(null);
              setAssignIdError("");
            }}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleAssignLead}
              className="leads_coursemodal_createbutton"
            >
              Assign
            </Button>
          ),
        ]}
        width="35%"
      >
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <CommonSelectField
            label="Assign To"
            options={allUsersList}
            onChange={(e) => {
              setAssignId(e.target.value);
              setAssignIdError(selectValidator(e.target.value));
            }}
            value={assignId}
            error={assignIdError}
          />
        </div>
      </Modal>

      <Modal
        title="Move to Trash"
        open={isOpenJunkModal}
        onCancel={() => {
          setIsOpenJunkModal(false);
          setLiveLeadId(null);
          setJunkComments("");
          setJunkCommentsError("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenJunkModal(false);
              setLiveLeadId(null);
              setJunkComments("");
              setJunkCommentsError("");
            }}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              style={{ width: "120px", opacity: 0.7 }}
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleMoveToJunk}
              style={{ width: "120px" }}
            >
              Move to Trash
            </Button>
          ),
        ]}
      >
        <div style={{ marginBottom: "20px" }}>
          <CommonTextArea
            label="Comments"
            required={false}
            onChange={(e) => {
              setJunkComments(e.target.value);
              setJunkCommentsError(addressValidator(e.target.value));
            }}
            value={junkComments}
            error={junkCommentsError}
          />
        </div>
      </Modal>

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
              <p style={{ fontWeight: 400, fontSize: "13px" }}> Check All</p>
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
        onClose={() => setIsOpenFilterDrawer(false)}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative", paddingBottom: 50 }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd
                data={drawerColumns}
                setColumns={handleSetDrawerColumns}
              />
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={async () => {
                const visibleColumns = columns
                  .filter((col) => col.isChecked)
                  .map((col) => {
                    const original = nonChangeColumns.find(
                      (c) => c.key === col.key,
                    );
                    if (original) {
                      return {
                        ...col,
                        width: original.width,
                        fixed: original.fixed,
                        hidden: original.hidden,
                        render: original.render,
                      };
                    }
                    return null;
                  })
                  .filter(Boolean);

                setTableColumns(visibleColumns);
                setIsOpenFilterDrawer(false);

                const getLoginUserDetails =
                  localStorage.getItem("loginUserDetails");
                const convertAsJson = JSON.parse(getLoginUserDetails);

                const payload = {
                  user_id: convertAsJson?.user_id,
                  id: updateTableId,
                  page_name: "Assign Leads",
                  column_names: columns,
                };

                try {
                  await updateTableColumns(payload);
                  setTimeout(() => {
                    getTableColumnsData(convertAsJson?.user_id);
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

      {/* customer history drawer */}
      <CustomerHistory
        customerId={selectedCustomerId}
        isOpen={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setSelectedCustomerId(null);
        }}
      />
    </div>
  );
}
