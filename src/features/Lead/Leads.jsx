import React, { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Drawer,
  Tooltip,
  Flex,
  Radio,
  Button,
  Checkbox,
  Modal,
  Spin,
  Badge,
  Popover,
} from "antd";
import "./styles.css";
import {
  formatToBackendIST,
  getCurrentandPreviousweekDate,
  isWithin30Days,
  selectValidator,
} from "../Common/Validation";
import { PiShareFatBold } from "react-icons/pi";
import { FaRegEye } from "react-icons/fa";
import CommonSelectField from "../Common/CommonSelectField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { LoadingOutlined } from "@ant-design/icons";
import { DownloadOutlined } from "@ant-design/icons";
import { MdFormatListNumbered, MdOutlineDateRange } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import CommonTable from "../Common/CommonTable";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { AiOutlineEdit } from "react-icons/ai";
import { MdAutorenew } from "react-icons/md";
import ViewLeadDetails from "./ViewLeadDetails";
import FollowUpDrawerForm from "./FollowUpDrawerForm";
import CommonDnd from "../Common/CommonDnd";
import { IoFilter } from "react-icons/io5";
import {
  downloadLeads,
  getAllDownlineUsers,
  getLeads,
  getLeadById,
  getLeadsCountByUserIds,
  getTableColumns,
  getUsers,
  updateTableColumns,
  leadReEntry,
  getUsersByRole,
  getLeadSubCategory,
} from "../ApiService/action";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { FaRegAddressCard } from "react-icons/fa";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { useDispatch, useSelector } from "react-redux";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import AddLead from "./AddLead";
import { storeLeadFilterValues } from "../Redux/Slice";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonNxtFollowupDatePicker from "../Common/CommonNxtFollowupDatePicker";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import ScrollableTabContainer from "../Common/ScrollableTabContainer";
import MakeAsCustomer from "./MakeAsCustomer";

export default function Leads({
  refreshLeadFollowUp,
  setLeadCount,
  setBucketCounts,
  leadTypeOptions,
  regionOptions,
  allUsersList,
  allBranchesData,
  setLeadCountLoading,
  refreshToggle,
  setRefreshToggle,
  onEditLead,
  activePage,
  triggerApi,
}) {
  const dispatch = useDispatch();
  const mounted = useRef(false);
  const isTriggerApiInitialMount = useRef(true);
  const addLeaduseRef = useRef();
  const makeAsCustomerRef = useRef();
  const scrollRef = useRef();

  const [leadBucketOptions, setLeadBucketOptions] = useState([]);
  const [interestedLeadActions, setInterestedLeadActions] = useState({});
  const [validLeadActions, setValidLeadActions] = useState({});
  const [eligibleLeadActions, setEligibleLeadActions] = useState({});
  const [followupLeadActions, setFollowupLeadActions] = useState({});
  const [leadActionFilter, setLeadActionFilter] = useState("super_hot");
  const statusClassMap = {
    all: "all",
    valid_leads: "valid_leads",
    eligible_leads: "eligible_leads",
    interested_leads: "interested_leads",
    sales_ready: "sales_ready",
    joinings: "joinings",
    open_leads: "open_leads",
  };
  const [leadBucketName, setLeadBucketName] = useState("All");
  const [leadStatusId, setLeadStatusId] = useState(null);
  const [leadData, setLeadData] = useState([]);

  const filterValuesFromRedux = useSelector((state) => state.leadfiltervalues);
  const [searchValue, setSearchValue] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isShowEdit, setIsShowEdit] = useState(true);

  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [updateLeadItem, setUpdateLeadItem] = useState(null);
  const [isOpenViewDrawer, setIsOpenViewDrawer] = useState(false);
  const [viewLeadItem, setViewLeadItem] = useState(null);
  const [allLeadsRegionCounts, setAllLeadsRegionCounts] = useState({
    hub_leads: 0,
    chennai_leads: 0,
    bangalore_leads: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [saveOnlyLoading, setSaveOnlyLoading] = useState(false);
  const [isOpenFollowUpDrawer, setIsOpenFollowUpDrawer] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState(null);
  const [followupHistory, setFollowupHistory] = useState([]);
  const [leadHistoryId, setLeadHistoryId] = useState(null);

  const openFollowUpForm = async (record, is_moveto_interested = false) => {
    setSelectedLeadForFollowUp(record);
    try {
      const response = await getLeadById(record.id);
      const leadDetails = response?.data?.data;
      if (
        leadDetails &&
        leadDetails.history &&
        leadDetails.history.length > 0
      ) {
        const merged = [
          ...leadDetails.history.map((item) => ({
            ...item,
            date: item.updated_date || item.created_date,
          })),
        ];
        merged.sort((a, b) => new Date(b.date) - new Date(a.date));
        setFollowupHistory(merged);
        setLeadHistoryId(leadDetails.lead_history_id || null);
      } else {
        setFollowupHistory([]);
        setLeadHistoryId(null);
      }
    } catch (error) {
      console.log("Error fetching followup history", error);
      setFollowupHistory([]);
      setLeadHistoryId(null);
    }
    if (is_moveto_interested) {
      setIsOpenMoveToInterestedDrawer(true);
    } else {
      setIsOpenFollowUpDrawer(true);
    }
  };

  const [filterType, setFilterType] = useState(1);
  const [downloadButtonLoader, setDownloadButtonLoader] = useState(false);

  //payment usestates
  const [isQualityCommentSection, setIsQualityCommentSection] = useState(false);
  const [isOpenPaymentDrawer, setIsOpenPaymentDrawer] = useState(false);
  const [clickedLeadItem, setClickedLeadItem] = useState(null);
  const [raUsers, setRaUsers] = useState([]);
  //assign lead usestates
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  //assign lead
  const [isOpenAssignModal, setIsOpenAssignModal] = useState(false);
  const [assignId, setAssignId] = useState(null);
  const [assignIdError, setAssignIdError] = useState("");
  const [reEntryNxtFollowUpDate, setReEntryNxtFollowUpDate] = useState(null);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);
  //lead executive
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [leadCountByExecutives, setLeadCountByExecutives] = useState([]);
  const [leadExeCountLoading, setLeadExeCountLoading] = useState(false);
  const [executiveCountTooltip, setExecutiveCountTooltip] = useState(false);
  const [allDownliners, setAllDownliners] = useState([]);
  //lead source filter
  const [leadSourceFilterId, setLeadSourceFilterId] = useState(null);
  const [leadSubSourceOptions, setLeadSubSourceOptions] = useState([]);
  const [leadSubSourceFilterId, setLeadSubSourceFilterId] = useState(null);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  //move to interested
  const [isOpenMoveToInterestedDrawer, setIsOpenMoveToInterestedDrawer] =
    useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(null);
  const [nextFollowUpDateError, setNextFollowUpDateError] = useState(null);
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
  //re entry lead
  const [isReEntry, setIsReEntry] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const checkIsAfter45Days = (created_date) => {
    // Convert to JS Date (replace space with T for ISO format)
    const createdDateObj = new Date(created_date.replace(" ", "T"));

    const now = new Date();

    // Add 45 days to created date
    const expiryDate = new Date(createdDateObj);
    expiryDate.setDate(expiryDate.getDate() + 45);

    // Check condition
    const isAfter45Days = now > expiryDate;

    return isAfter45Days;
  };

  const nonChangeColumns = [
    {
      title: "Sl. No",
      key: "row_num",
      dataIndex: "row_num",
      width: 60,
    },
    ...(permissions.includes("Show Lead Executive Id")
      ? [
          {
            title: "Lead Executive",
            key: "lead_assigned_to_name",
            dataIndex: "lead_assigned_to_name",
            width: 160,
            sorter: (a, b) =>
              (a.lead_assigned_to_name || "").localeCompare(
                b.lead_assigned_to_name || "",
              ),
            sortDirections: ["ascend", "descend"],
            render: (text, record) => {
              const lead_executive = `${record.lead_assigned_to_id} - ${text}`;
              return <EllipsisTooltip text={lead_executive} />;
            },
          },
        ]
      : []),
    ...(leadBucketName === "Followup Leads"
      ? [
          {
            title: "Next Follow Up",
            key: "next_follow_up_date",
            dataIndex: "next_follow_up_date",
            width: 140,
            render: (text, record, index) => {
              return (
                <div
                  className="leadfollowup_tabledateContainer"
                  onClick={() => {
                    if (!permissions.includes("Update Lead Followup")) {
                      CommonMessage("error", "Access Denied");
                      return;
                    }
                    openFollowUpForm(record);
                  }}
                >
                  <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>
                  <div className="leadfollowup_tablecommentContainer">
                    <p>{record?.completed_followup_count || 0}</p>
                  </div>
                </div>
              );
            },
          },
        ]
      : [
          {
            title: "Created At",
            key: "created_date",
            dataIndex: "created_date",
            width: 170,
            render: (text, record) => {
              return (
                <>
                  {record.re_assigned_date ? (
                    <Badge
                      size="small"
                      count={moment(record.re_assigned_date).format(
                        "DD/MM/YYYY HH:mm:ss",
                      )}
                      offset={[0, 0]}
                      color="#1e90ff"
                      style={{ fontSize: "10px" }}
                    >
                      <div style={{ fontSize: "12px", marginTop: "9px" }}>
                        <EllipsisTooltip
                          text={moment(text).format("DD/MM/YYYY - HH:mm:ss")}
                        />
                      </div>
                    </Badge>
                  ) : (
                    <EllipsisTooltip
                      text={moment(text).format("DD/MM/YYYY - HH:mm:ss")}
                    />
                  )}
                </>
              );
            },
          },
        ]),
    {
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      width: 170,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    {
      title: "Orgin",
      key: "domain_origin",
      dataIndex: "domain_origin",
      width: 140,
      sorter: (a, b) =>
        (a.domain_origin || "").localeCompare(b.domain_origin || ""),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Lead Source",
      key: "lead_type",
      dataIndex: "lead_type",
      width: 140,
      sorter: (a, b) => (a.lead_type || "").localeCompare(b.lead_type || ""),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Primary Course",
      key: "primary_course",
      dataIndex: "primary_course",
      width: 200,
      sorter: (a, b) =>
        (a.primary_course || "").localeCompare(b.primary_course || ""),
      sortDirections: ["ascend", "descend"],
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Primary Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      width: 160,
      render: (text, record) => {
        return <p>{"₹" + text}</p>;
      },
    },
    ...(leadBucketName === "Followup Leads"
      ? [
          {
            title: "Followup Status",
            key: "lead_action_name",
            dataIndex: "lead_action_name",
            fixed: "right",
            width: 160,
            sorter: (a, b) =>
              (a.lead_action_name || "").localeCompare(
                b.lead_action_name || "",
              ),
            sortDirections: ["ascend", "descend"],
            render: (text) => {
              const statusColors = {
                "Sales Ready": "#dc2626",
                "Highly Interested": "#f97316",
                Interested: "#eab308",
                Exploring: "#3b82f6",
                "Not Responding": "#4b5563",
                "Not Interested": "#111827",
              };
              const baseColor = statusColors[text] || "#4338ca";

              return (
                <>
                  {text ? (
                    <div
                      className="leadfollwup_table_status_container"
                      style={{
                        background: `${baseColor}1A`,
                        color: baseColor,
                      }}
                    >
                      {text}
                    </div>
                  ) : (
                    <p>-</p>
                  )}
                </>
              );
            },
          },
        ]
      : [
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
                      {(text === "Dormant" || text === "Not Interested") && (
                        <Tooltip placement="top" title="Move to Interested">
                          <RxUpdate
                            color="#333333d3"
                            size={14}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              openFollowUpForm(record, true);
                            }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  ) : (
                    <p>-</p>
                  )}
                </>
              );
            },
          },
        ]),
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
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
      width: 120,
      render: (text, record) => {
        const isAfter45Days = checkIsAfter45Days(record.created_date);
        return (
          <div className="leadmanager_actionbuttonContainer">
            <Tooltip placement="bottom" title="View Lead Details">
              <FaRegEye
                className="leadmanager_action_icon"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setViewLeadItem(record);
                  setIsOpenViewDrawer(true);
                }}
              />
            </Tooltip>

            {permissions.includes("Edit Lead Button") &&
              isShowEdit &&
              leadBucketName !== "Open Leads" &&
              record.is_customer_reg === 0 && (
                <AiOutlineEdit
                  className="leadmanager_action_icon"
                  onClick={() => {
                    if (onEditLead) {
                      onEditLead(record, false);
                    } else {
                      setUpdateLeadItem(record);
                      setLeadId(record.id);
                      setIsOpenAddDrawer(true);
                    }
                  }}
                />
              )}

            {(leadBucketName === "All" ||
              leadBucketName === "Interested Leads" ||
              leadBucketName === "Followup Leads") &&
              (record.is_customer_reg === 1 ? (
                <Tooltip placement="bottom" title="Already a Customer">
                  <FaRegAddressCard
                    className="leadmanager_action_icon"
                    color="#2ed573"
                  />
                </Tooltip>
              ) : (
                <Tooltip placement="bottom" title="Make as customer">
                  <FaRegAddressCard
                    className="leadmanager_action_icon"
                    color="#d32f2f"
                    onClick={() => {
                      if (permissions.includes("Edit Lead Button")) {
                        if (
                          record?.lead_type_id == null ||
                          record?.lead_type_id == "" ||
                          record?.lead_type_id == 0
                        ) {
                          CommonMessage(
                            "error",
                            "Please fill in the Lead Source section in the Add Lead form",
                          );
                          return;
                        }
                        if (
                          record?.primary_course_id == null ||
                          record?.primary_course_id == "" ||
                          record?.primary_course_id == 0
                        ) {
                          CommonMessage(
                            "error",
                            "Please fill in the Course section in the Add Lead form",
                          );
                          return;
                        }
                        if (filterValuesFromRedux.call_getraapi) {
                          getRaUsers();
                        }
                        setIsOpenPaymentDrawer(true);
                        setClickedLeadItem(record);

                        setTimeout(() => {
                          const drawerBody = document.querySelector(
                            "#leadmanager_paymentdetails_drawer .ant-drawer-body",
                          );

                          if (drawerBody) {
                            drawerBody.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }
                        }, 300);
                      } else {
                        CommonMessage("error", "Access Denied");
                      }
                    }}
                  />
                </Tooltip>
              ))}

            {permissions.includes("Assign Lead") &&
              leadBucketName === "All" && (
                <Tooltip
                  placement="bottom"
                  title="Re-Assign this lead to another user"
                >
                  <PiShareFatBold
                    className="leadmanager_action_icon"
                    color="#5b69ca"
                    onClick={() => {
                      if (onEditLead) {
                        onEditLead(record, true);
                      } else {
                        setIsReEntry(true);
                        setUpdateLeadItem(record);
                        setLeadId(record.id);
                        setIsOpenAddDrawer(true);
                      }
                    }}
                  />
                </Tooltip>
              )}
          </div>
        );
      },
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({
      ...col,
      isChecked:
        col.key === "domain_origin" || col.key === "lead_type" ? false : true,
    })),
  );

  const [tableColumns, setTableColumns] = useState(
    nonChangeColumns.filter(
      (col) => col.key !== "domain_origin" && col.key !== "lead_type",
    ),
  );

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  const prevTargetPageName = useRef(
    leadBucketName === "Followup Leads" ? "Followup Leads" : "Leads",
  );

  useEffect(() => {
    setTableColumns(
      nonChangeColumns.filter(
        (col) => col.key !== "domain_origin" && col.key !== "lead_type",
      ),
    );
  }, [permissions, isShowEdit]);

  useEffect(() => {
    if (loginUserId) {
      const currentPage =
        leadBucketName === "Followup Leads" ? "Followup Leads" : "Leads";
      if (currentPage !== prevTargetPageName.current) {
        const updatedColumns = nonChangeColumns.map((col) => ({
          ...col,
          isChecked:
            col.key === "domain_origin" || col.key === "lead_type"
              ? false
              : true,
        }));
        setColumns(updatedColumns);
        setTableColumns(
          nonChangeColumns.filter(
            (col) => col.key !== "domain_origin" && col.key !== "lead_type",
          ),
        );

        getTableColumnsData(loginUserId, updatedColumns);
        prevTargetPageName.current = currentPage;
      }
    }
  }, [leadBucketName, loginUserId]);

  // useEffect(() => {
  //   getUsersData();
  //   console.log("pageeeeeeeeeee", pagination);
  // }, []);

  // const getUsersData = async () => {
  //   const payload = {
  //     page: 1,
  //     limit: 1000,
  //   };
  //   try {
  //     const response = await getUsers(payload);
  //     console.log("users response", response);
  //     setAllUsersList(response?.data?.data?.data || []);
  //   } catch (error) {
  //     setAllUsersList([]);
  //     console.log("get all users error", error);
  //   }
  // };

  useEffect(() => {
    if (
      ![
        "all_leads",
        "valid_leads",
        "eligible_leads",
        "interested_leads",
        "followup_leads",
        "joinings",
        "open_leads",
        "leads",
      ].includes(activePage) &&
      activePage !== "add_lead"
    )
      return;

    if (permissions.length >= 1) {
      if (!permissions.includes("Lead Manager Page")) {
        return;
      }

      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      if (childUsers.length > 0 && !mounted.current) {
        setSubUsers(downlineUsers);
        mounted.current = true;
        // Calculate bucket from activePage instead of relying solely on Redux initial state
        const bucketMapping = {
          all_leads: "all",
          valid_leads: "Valid Leads",
          eligible_leads: "Eligible Leads",
          interested_leads: "Interested Leads",
          followup_leads: "Followup Leads",
          joinings: "Joinings",
          open_leads: "Open Leads",
        };
        const targetBucket =
          bucketMapping[activePage] || filterValuesFromRedux.bucket;

        // ---------------------
        setSelectedDates([
          filterValuesFromRedux.start_date,
          filterValuesFromRedux.end_date,
        ]);
        setFilterType(filterValuesFromRedux.filterType);
        setSearchValue(filterValuesFromRedux.searchValue);
        setLeadSourceFilterId(filterValuesFromRedux.lead_source);
        setLeadSubSourceFilterId(filterValuesFromRedux?.lead_sub_source);
        setSelectedOrigin(filterValuesFromRedux?.origin);
        setSelectedUserId(filterValuesFromRedux.user_id);
        setLeadBucketName(targetBucket === "all" ? "All" : targetBucket);

        const initialActionFilter =
          targetBucket === "Followup Leads"
            ? "all"
            : targetBucket === "Interested Leads"
              ? "super_hot"
              : "all";
        setLeadActionFilter(initialActionFilter);

        dispatch(
          storeLeadFilterValues({
            bucket: targetBucket === "all" ? "" : targetBucket,
          }),
        );

        setPagination({
          page: filterValuesFromRedux.pageNumber,
          limit: filterValuesFromRedux.pageLimit,
        });
        // ---------------------
        setLoginUserId(convertAsJson?.user_id);
        getAllDownlineUsersData(
          filterValuesFromRedux.user_id
            ? filterValuesFromRedux.user_id
            : convertAsJson?.user_id,
          targetBucket === "all" ? "" : targetBucket,
          initialActionFilter,
        );
      }
    }
  }, [childUsers, permissions, activePage]);

  const prevActivePage = useRef(activePage);

  useEffect(() => {
    if (!mounted.current) return;

    if (prevActivePage.current !== activePage) {
      prevActivePage.current = activePage;

      if (
        [
          "all_leads",
          "valid_leads",
          "eligible_leads",
          "interested_leads",
          "followup_leads",
          "joinings",
          "open_leads",
        ].includes(activePage)
      ) {
        setLoading(true);
        const bucketMapping = {
          all_leads: "all",
          valid_leads: "Valid Leads",
          eligible_leads: "Eligible Leads",
          interested_leads: "Interested Leads",
          followup_leads: "Followup Leads",
          joinings: "Joinings",
          open_leads: "Open Leads",
        };
        const targetBucket = bucketMapping[activePage];

        setLeadBucketName(targetBucket === "all" ? "All" : targetBucket);
        setLeadActionFilter(
          targetBucket === "Followup Leads"
            ? "all"
            : targetBucket === "Interested Leads"
              ? "super_hot"
              : "all",
        );
        dispatch(
          storeLeadFilterValues({
            bucket: targetBucket == "all" ? "" : targetBucket,
            pageNumber: 1,
            pageLimit: pagination.limit,
          }),
        );
        getAllLeadData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          allDownliners,
          leadSourceFilterId,
          leadSubSourceFilterId,
          leadStatusId,
          selectedOrigin,
          targetBucket === "all" ? "" : targetBucket,
          1,
          pagination.limit,
          targetBucket === "Followup Leads"
            ? "all"
            : targetBucket === "Interested Leads"
              ? "super_hot"
              : "all",
        );
      }
    }
  }, [activePage, mounted]);

  useEffect(() => {
    if (isTriggerApiInitialMount.current) {
      isTriggerApiInitialMount.current = false;
      return;
    }
    if (mounted.current && triggerApi !== undefined) {
      setLoading(true);
      getAllLeadData(
        searchValue,
        selectedDates[0],
        selectedDates[1],
        allDownliners,
        leadSourceFilterId,
        leadSubSourceFilterId,
        leadStatusId,
        selectedOrigin,
        leadBucketName === "All" ? "" : leadBucketName,
        pagination.page,
        pagination.limit,
        leadActionFilter,
      );
    }
  }, [triggerApi]);

  const getTableColumnsData = async (user_id, latestColumns = null) => {
    try {
      const response = await getTableColumns(user_id);
      console.log("get table columns response", response);

      const data = response?.data?.data || [];
      if (data.length === 0) {
        return updateTableColumnsData(latestColumns || columns);
      }

      const filterPage = data.find(
        (f) =>
          f.page_name ===
          (leadBucketName === "Followup Leads" ? "Interested Leads" : "Leads"),
      );
      if (!filterPage) {
        setUpdateTableId(null);
        return updateTableColumnsData(latestColumns || columns);
      }

      // --- ✅ Helper function to reattach render logic ---
      const attachRenderFunctions = (cols) =>
        cols.map((col) => {
          switch (col.key) {
            case "row_num":
              return {
                ...col,
                width: 60,
              };
            case "lead_assigned_to_name":
              return {
                ...col,
                sorter: (a, b) =>
                  (a.lead_assigned_to_name || "").localeCompare(
                    b.lead_assigned_to_name || "",
                  ),
                sortDirections: ["ascend", "descend"],
                render: (text, record) => {
                  const lead_executive = `${record.lead_assigned_to_id} - ${text}`;
                  return <EllipsisTooltip text={lead_executive} />;
                },
              };
            case "name":
              return {
                ...col,
                width: 170,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "email":
              return {
                ...col,
                width: 200,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "next_follow_up_date":
            case "created_date":
              return leadBucketName === "Followup Leads"
                ? {
                    ...col,
                    title: "Next Follow Up",
                    key: "next_follow_up_date",
                    dataIndex: "next_follow_up_date",
                    width: 140,
                    render: (text, record, index) => {
                      return (
                        <div
                          className="leadfollowup_tabledateContainer"
                          onClick={() => {
                            if (!permissions.includes("Update Lead Followup")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            openFollowUpForm(record);
                          }}
                        >
                          <p>
                            {text ? moment(text).format("DD/MM/YYYY") : "-"}
                          </p>
                          <div className="leadfollowup_tablecommentContainer">
                            <p>{record?.completed_followup_count || 0}</p>
                          </div>
                        </div>
                      );
                    },
                  }
                : {
                    ...col,
                    title: "Created At",
                    key: "created_date",
                    dataIndex: "created_date",
                    sorter: (a, b) =>
                      moment(a.created_date).valueOf() -
                      moment(b.created_date).valueOf(),
                    sortDirections: ["ascend", "descend"],
                    defaultSortOrder: "descend", // Optional
                    width: 170,
                    render: (text, record) => {
                      return (
                        <>
                          {record.re_assigned_date ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: "-10px",
                                  left: "12px",
                                }}
                              >
                                <Badge
                                  size="small"
                                  count={moment(record.re_assigned_date).format(
                                    "DD/MM/YYYY - HH:mm:ss",
                                  )}
                                  offset={[0, 0]}
                                  color="#1e90ff"
                                  style={{ fontSize: "10px" }}
                                ></Badge>
                              </div>
                              <div
                                style={{ fontSize: "12px", marginTop: "9px" }}
                              >
                                <EllipsisTooltip
                                  text={moment(text).format(
                                    "DD/MM/YYYY - HH:mm:ss",
                                  )}
                                />
                              </div>
                            </div>
                          ) : (
                            <EllipsisTooltip
                              text={moment(text).format(
                                "DD/MM/YYYY - HH:mm:ss",
                              )}
                            />
                          )}
                        </>
                      );
                    },
                  };
            case "primary_course":
              return {
                ...col,
                sorter: (a, b) =>
                  (a.primary_course || "").localeCompare(
                    b.primary_course || "",
                  ),
                sortDirections: ["ascend", "descend"],
                width: 200,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "primary_fees":
              return {
                ...col,
                width: 160,
                render: (text, record) => {
                  return <p>{"₹" + text}</p>;
                },
              };
            case "domain_origin":
              return {
                ...col,
                title: "Origin",
                sorter: (a, b) =>
                  (a.domain_origin || "").localeCompare(b.domain_origin || ""),
                sortDirections: ["ascend", "descend"],
                width: 150,
                render: (text) => {
                  return (
                    <EllipsisTooltip
                      text={text ? (text == "Direct" ? "-" : text) : "-"}
                    />
                  );
                },
              };
            case "lead_type":
              return {
                ...col,
                sorter: (a, b) =>
                  (a.lead_type || "").localeCompare(b.lead_type || ""),
                sortDirections: ["ascend", "descend"],
              };
            case "lead_status":
            case "lead_action_name":
              return leadBucketName === "Followup Leads"
                ? {
                    ...col,
                    title: "Followup Status",
                    key: "lead_action_name",
                    dataIndex: "lead_action_name",
                    width: 160,
                    sorter: (a, b) =>
                      (a.lead_action_name || "").localeCompare(
                        b.lead_action_name || "",
                      ),
                    sortDirections: ["ascend", "descend"],
                    render: (text) => {
                      const statusColors = {
                        "Sales Ready": "#dc2626",
                        "Highly Interested": "#f97316",
                        Interested: "#eab308",
                        Exploring: "#3b82f6",
                        "Not Responding": "#4b5563",
                        "Not Interested": "#111827",
                      };
                      const baseColor = statusColors[text] || "#4338ca";

                      return (
                        <>
                          {text ? (
                            <div
                              className="leadfollwup_table_status_container"
                              style={{
                                background: `${baseColor}1A`,
                                color: baseColor,
                              }}
                            >
                              {text}
                            </div>
                          ) : (
                            <p>-</p>
                          )}
                        </>
                      );
                    },
                  }
                : {
                    ...col,
                    title: "Lead Temp.",
                    key: "lead_status",
                    dataIndex: "lead_status",
                    sorter: (a, b) =>
                      (a.lead_status || "").localeCompare(b.lead_status || ""),
                    sortDirections: ["ascend", "descend"],
                    width: 140,
                    render: (text, record) => {
                      const statusClass =
                        text === "Super Hot"
                          ? "super_hot_priority"
                          : text === "Hot"
                            ? "hot_priority"
                            : text === "Warm"
                              ? "medium_priority"
                              : text === "Cold"
                                ? "cold_priority"
                                : text === "Not Interested"
                                  ? "junk_priority"
                                  : text === "Dormant" || text === "Junk"
                                    ? "dormant_priority"
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
                              {(text === "Dormant" ||
                                text === "Not Interested") && (
                                <Tooltip
                                  placement="top"
                                  title="Move to Interested"
                                >
                                  <RxUpdate
                                    color="#333333d3"
                                    size={14}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      openFollowUpForm(record, true);
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </div>
                          ) : (
                            <p>-</p>
                          )}
                        </>
                      );
                    },
                  };
            case "comments":
              return {
                ...col,
                width: 200,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "action":
              return {
                ...col,
                width: 140,
                render: (text, record) => {
                  const isAfter45Days = checkIsAfter45Days(record.created_date);
                  return (
                    <div className="leadmanager_actionbuttonContainer">
                      <Tooltip placement="bottom" title="View Lead Details">
                        <FaRegEye
                          className="leadmanager_action_icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setViewLeadItem(record);
                            setIsOpenViewDrawer(true);
                          }}
                        />
                      </Tooltip>

                      {permissions.includes("Edit Lead Button") &&
                        isShowEdit &&
                        leadBucketName !== "Open Leads" &&
                        record.is_customer_reg === 0 && (
                          <AiOutlineEdit
                            className="leadmanager_action_icon"
                            onClick={() => {
                              if (onEditLead) {
                                onEditLead(record, false);
                              } else {
                                setUpdateLeadItem(record);
                                setLeadId(record.id);
                                setIsOpenAddDrawer(true);
                              }
                            }}
                          />
                        )}

                      {(leadBucketName === "All" ||
                        leadBucketName === "Interested Leads" ||
                        leadBucketName === "Followup Leads") &&
                        (record.is_customer_reg === 1 ? (
                          <Tooltip
                            placement="bottom"
                            title="Already a Customer"
                          >
                            <FaRegAddressCard
                              className="leadmanager_action_icon"
                              color="#2ed573"
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip placement="bottom" title="Make as customer">
                            <FaRegAddressCard
                              className="leadmanager_action_icon"
                              color="#d32f2f"
                              onClick={() => {
                                if (permissions.includes("Edit Lead Button")) {
                                  if (
                                    record?.lead_type_id == null ||
                                    record?.lead_type_id == "" ||
                                    record?.lead_type_id == 0
                                  ) {
                                    CommonMessage(
                                      "error",
                                      "Please fill in the Lead Source section in the Add Lead form",
                                    );
                                    return;
                                  }
                                  if (
                                    record?.primary_course_id == null ||
                                    record?.primary_course_id == "" ||
                                    record?.primary_course_id == 0
                                  ) {
                                    CommonMessage(
                                      "error",
                                      "Please fill in the Course section in the Add Lead form",
                                    );
                                    return;
                                  }
                                  if (filterValuesFromRedux.call_getraapi) {
                                    getRaUsers();
                                  }
                                  setIsOpenPaymentDrawer(true);
                                  setClickedLeadItem(record);

                                  setTimeout(() => {
                                    const drawerBody = document.querySelector(
                                      "#leadmanager_paymentdetails_drawer .ant-drawer-body",
                                    );

                                    if (drawerBody) {
                                      drawerBody.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                      });
                                    }
                                  }, 300);
                                } else {
                                  CommonMessage("error", "Access Denied");
                                }
                              }}
                            />
                          </Tooltip>
                        ))}

                      {permissions.includes("Assign Lead") &&
                        leadBucketName === "All" && (
                          <Tooltip
                            placement="bottom"
                            title="Re-Assign this lead to another user"
                          >
                            <PiShareFatBold
                              className="leadmanager_action_icon"
                              color="#5b69ca"
                              onClick={() => {
                                if (onEditLead) {
                                  onEditLead(record, true);
                                } else {
                                  setIsReEntry(true);
                                  setUpdateLeadItem(record);
                                  setLeadId(record.id);
                                  setIsOpenAddDrawer(true);
                                }
                              }}
                            />
                          </Tooltip>
                        )}
                    </div>
                  );
                },
              };
            default:
              return col;
          }
        });

      // --- ✅ Process columns ---
      setUpdateTableId(filterPage.id);

      const validColumnKeys = new Set(nonChangeColumns.map((col) => col.key));

      const missingColumns = nonChangeColumns.filter(
        (nc) => !filterPage.column_names.some((fc) => fc.key === nc.key),
      );

      const completeColumns = [
        ...filterPage.column_names.filter((col) =>
          validColumnKeys.has(col.key),
        ),
        ...missingColumns.map((col) => ({
          ...col,
          isChecked:
            col.key === "domain_origin" || col.key === "lead_type"
              ? false
              : true,
        })),
      ];

      const filteredColumns = completeColumns.filter((col) => {
        if (leadBucketName === "Followup Leads") {
          if (col.key === "lead_status") return false;
          if (col.key === "created_date") return false;
        } else {
          if (col.key === "lead_action_name") return false;
          if (col.key === "next_follow_up_date") return false;
        }
        return true;
      });

      const allColumns = attachRenderFunctions(filteredColumns);
      const visibleColumns = attachRenderFunctions(
        filteredColumns.filter((col) => col.isChecked),
      );

      setColumns(allColumns);
      setTableColumns(visibleColumns);

      console.log("Visible columns:", visibleColumns);
    } catch (error) {
      console.error("get table columns error", error);
    }
  };

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    getTableColumnsData(convertAsJson?.user_id);
  }, [filterValuesFromRedux.call_getraapi]);

  const updateTableColumnsData = async (latestColumns = columns) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name:
        leadBucketName === "Followup Leads" ? "Followup Leads" : "Leads",
      column_names: latestColumns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  const getAllDownlineUsersData = async (
    user_id,
    bucketOverride,
    actionOverride,
  ) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getAllLeadData(
        filterValuesFromRedux.searchValue,
        filterValuesFromRedux.start_date
          ? filterValuesFromRedux.start_date
          : PreviousAndCurrentDate[0],
        filterValuesFromRedux.end_date
          ? filterValuesFromRedux.end_date
          : PreviousAndCurrentDate[1],
        downliners_ids,
        filterValuesFromRedux.lead_source,
        filterValuesFromRedux.lead_sub_source,
        filterValuesFromRedux.lead_status_id,
        filterValuesFromRedux?.origin,
        bucketOverride !== undefined
          ? bucketOverride
          : filterValuesFromRedux.bucket == "all"
            ? ""
            : filterValuesFromRedux.bucket,
        filterValuesFromRedux.pageNumber,
        filterValuesFromRedux.pageLimit,
        actionOverride,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getAllLeadData = async (
    searchvalue,
    startDate,
    endDate,
    downliners,
    leadsource,
    lead_sub_source,
    leadStatusId,
    origin,
    bucket,
    pageNumber,
    limit,
    actionOverride,
    sortFieldParam,
    sortOrderParam,
  ) => {
    const currentAction =
      actionOverride !== undefined ? actionOverride : leadActionFilter;
    const finalSortField =
      sortFieldParam !== undefined ? sortFieldParam : sortField;
    const finalSortOrder =
      sortOrderParam !== undefined ? sortOrderParam : sortOrder;
    setLoading(true);
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
      ...(bucket === "Open Leads" ? {} : { user_ids: downliners }),
      ...(leadsource && { lead_type: leadsource }),
      ...(lead_sub_source && { sub_source_id: lead_sub_source }),
      ...(leadStatusId && { lead_status_id: leadStatusId }),
      ...(origin && { domain: origin }),
      ...(bucket && { bucket: bucket }),
      ...(bucket === "Followup Leads" &&
        [
          "sales_ready_leads",
          "highly_interested_leads",
          "interested_leads",
          "exploring_leads",
          "not_responding_leads",
          "not_interested_leads",
        ].includes(currentAction) && {
          lead_action: currentAction
            .split("_")
            .filter((word) => word.toLowerCase() !== "leads")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        }),
      ...(bucket === "Interested Leads" &&
        [
          "super_hot",
          "hot",
          "warm",
          "cold",
          "not_interested",
          "dormant",
          "only_enquiry",
        ].includes(currentAction) && {
          lead_action: currentAction
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        }),
      ...(bucket === "Valid Leads" &&
        ["validated", "need_screening", "junk"].includes(currentAction) && {
          lead_action:
            currentAction === "validated"
              ? "Validated"
              : currentAction === "need_screening"
                ? "Need Screening"
                : "Junk",
        }),
      ...(bucket === "Eligible Leads" &&
        [
          "communicated",
          "not_communicated",
          "no_response",
          "data correct but no response",
          "data_correct_but_no_response",
        ].includes(currentAction) && {
          lead_action:
            currentAction === "communicated"
              ? "Communicated"
              : currentAction === "not_communicated"
                ? "Not Communicated"
                : "Data Correct But No Response",
        }),
      page: pageNumber,
      limit: limit,
      ...(finalSortField && { sort_by: finalSortField }),
      ...(finalSortOrder && {
        sort_order: finalSortOrder === "ascend" ? "asc" : "desc",
      }),
    };
    try {
      const response = await getLeads(payload);
      console.log("leads responsesssss", response);

      const paginations = response?.data?.data?.pagination;
      const apiData = response?.data?.data?.data || [];
      const bucket_counts = response?.data?.data?.bucket_counts || {};
      const interested_actions =
        response?.data?.data?.interested_lead_actions || {};
      const valid_actions = response?.data?.data?.valid_lead_actions || {};
      const eligible_actions =
        response?.data?.data?.eligible_lead_actions || {};
      const followup_actions = response?.data?.data?.followup_actions || {};
      console.log("leads data", apiData);

      setInterestedLeadActions(interested_actions);
      setValidLeadActions(valid_actions);
      setEligibleLeadActions(eligible_actions);
      setFollowupLeadActions(followup_actions);

      if (setBucketCounts) {
        setBucketCounts({
          all: bucket_counts["all"] || 0,
          valid_leads: bucket_counts["valid_leads"] || 0,
          eligible_leads: bucket_counts["eligible_leads"] || 0,
          interested_leads: bucket_counts["interested_leads"] || 0,
          followup_leads: bucket_counts["followup_leads"] || 0,
          joinings: bucket_counts["joinings"] || 0,
          open_leads: bucket_counts["open_leads"] || 0,
        });
      }

      setAllLeadsRegionCounts({
        hub_leads: bucket_counts["hub_leads"] || 0,
        chennai_leads: bucket_counts["chennai_leads"] || 0,
        bangalore_leads: bucket_counts["bangalore_leads"] || 0,
        total: bucket_counts["all"] || 0,
      });

      const leadStatusOptionsWithCount = [
        {
          id: "all",
          name: "all",
          count: bucket_counts["all"] || 0,
        },
        {
          id: "valid_leads",
          name: "Valid Leads",
          count: bucket_counts["valid_leads"] || 0,
        },
        {
          id: "eligible_leads",
          name: "Eligible Leads",
          count: bucket_counts["eligible_leads"] || 0,
        },
        {
          id: "interested_leads",
          name: "Interested Leads",
          count: bucket_counts["interested_leads"] || 0,
        },
        {
          id: "followup_leads",
          name: "Followup Leads",
          count: bucket_counts["followup_leads"] || 0,
        },
        {
          id: "joinings",
          name: "Joinings",
          count: bucket_counts["joinings"] || 0,
        },
        {
          id: "open_leads",
          name: "Open Leads",
          count: bucket_counts["open_leads"] || 0,
        },
      ];

      setLeadBucketOptions(leadStatusOptionsWithCount);

      // ✅ Add serial number here
      const updatedData = apiData.map((item, index) => ({
        ...item,
        row_num: (pageNumber - 1) * limit + index + 1,
      }));

      setLeadData(updatedData);
      setLeadCount(bucket_counts["all"] || 0);
      setPagination({
        page: pageNumber,
        limit: limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
      });

      dispatch(
        storeLeadFilterValues({
          pageNumber: pageNumber,
          pageLimit: limit,
        }),
      );
      setLeadCountLoading(false);
    } catch (error) {
      setLeadData([]);
      setLeadCount(0);
      console.log("get leads error", error);
    } finally {
      setLoading(false);
    }
  };

  const getRaUsers = async () => {
    const payload = {
      role: "RA",
    };
    try {
      const response = await getUsersByRole(payload);
      console.log("get hr users response", response);
      setRaUsers(response?.data?.data?.data || []);
    } catch (error) {
      setRaUsers([]);
      console.log("get hr users error", error);
    } finally {
      dispatch(
        storeLeadFilterValues({
          call_getraapi: false,
        }),
      );
    }
  };

  //onclick functions
  const formReset = () => {
    setIsOpenFilterDrawer(false);
    setIsOpenAssignModal(false);
    //add lead drawer usestaes
    setLeadId(null);
    //payment drawer usestates
    setIsOpenPaymentDrawer(false);
    setClickedLeadItem(null);
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    dispatch(
      storeLeadFilterValues({
        searchValue: e.target.value,
        pageNumber: 1,
        pageLimit: pagination.limit,
      }),
    );
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getAllLeadData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        allDownliners,
        leadSourceFilterId,
        leadSubSourceFilterId,
        leadStatusId,
        selectedOrigin,
        filterValuesFromRedux.bucket,
        1,
        pagination.limit,
      );
    }, 300);
  };

  const handleSelectedRow = (row) => {
    console.log("selected rowwww", row);
    setSelectedRows(row);
    const keys = row.map((item) => item.id); // or your unique row key
    setSelectedRowKeys(keys);
    if (row.length >= 1) {
      setIsShowEdit(false);
    } else {
      setIsShowEdit(true);
    }
  };

  const handleAssignLeadCancel = () => {
    setIsOpenAssignModal(false);
    setAddCourseLoading(false);
    setAssignId(null);
    setAssignIdError("");
    setReEntryNxtFollowUpDate(null);
    setAddCourseLoading(false);
  };

  const handleAssignLead = async () => {
    console.log(selectedRows);
    const assignIdValidate = selectValidator(assignId);

    setAssignIdError(assignIdValidate);

    if (assignIdValidate) return;

    const today = new Date();

    if (selectedRows.length >= 1) {
      //multi assign
      const updateSelectedRows = selectedRows.map((item) => {
        return item.id;
      });
      setAddCourseLoading(true);
      const payload = {
        lead_ids: updateSelectedRows,
        assign_date: formatToBackendIST(today),
        next_follow_up_date: formatToBackendIST(reEntryNxtFollowUpDate),
        assigned_to: assignId,
        updated_by: loginUserId,
      };
      console.log("payload", payload);

      try {
        await leadReEntry(payload);
        setTimeout(() => {
          getAllLeadData(
            searchValue,
            selectedDates[0],
            selectedDates[1],
            allDownliners,
            leadSourceFilterId,
            leadSubSourceFilterId,
            leadStatusId,
            selectedOrigin,
            filterValuesFromRedux.bucket,
            pagination.page,
            pagination.limit,
          );
          handleAssignLeadCancel();
          setIsShowEdit(true);
          setSelectedRowKeys([]);
          setSelectedRows([]);
        }, 300);
      } catch (error) {
        setAddCourseLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    }
  };

  const handlePaginationChange = ({ page, limit, sorter }) => {
    let currentSortField = sortField;
    let currentSortOrder = sortOrder;

    if (sorter && sorter.field) {
      // sorter can be an array in some cases, but typically an object for single column sort
      currentSortField = Array.isArray(sorter) ? sorter[0].field : sorter.field;
      currentSortOrder = Array.isArray(sorter) ? sorter[0].order : sorter.order;
      setSortField(currentSortField);
      setSortOrder(currentSortOrder);
    } else if (sorter && !sorter.order) {
      currentSortField = null;
      currentSortOrder = null;
      setSortField(null);
      setSortOrder(null);
    }

    dispatch(
      storeLeadFilterValues({
        pageNumber: page,
        pageLimit: limit,
      }),
    );
    getAllLeadData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      allDownliners,
      leadSourceFilterId,
      leadSubSourceFilterId,
      leadStatusId,
      selectedOrigin,
      filterValuesFromRedux.bucket,
      page,
      limit,
      undefined,
      currentSortField,
      currentSortOrder,
    );
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    dispatch(
      storeLeadFilterValues({
        user_id: value,
      }),
    );
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
      dispatch(
        storeLeadFilterValues({
          pageNumber: 1,
          pageLimit: pagination.limit,
        }),
      );
      getAllLeadData(
        searchValue,
        selectedDates[0],
        selectedDates[1],
        downliners_ids,
        leadSourceFilterId,
        leadSubSourceFilterId,
        leadStatusId,
        selectedOrigin,
        filterValuesFromRedux.bucket,
        1,
        pagination.limit,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getLeadSubSourceData = async (lead_source_id) => {
    const payload = {
      category_id: lead_source_id,
    };
    try {
      const response = await getLeadSubCategory(payload);
      const sub_source_data = response?.data?.data || [];
      setLeadSubSourceOptions(sub_source_data);
    } catch (error) {
      setLeadSubSourceOptions([]);
      console.log("response status error", error);
    }
  };

  const handleLeadCountByExecutive = async () => {
    setLeadExeCountLoading(true);
    const payload = {
      start_date: selectedDates[0],
      end_date: selectedDates[1],
      user_ids: allDownliners,
      lead_type_id: leadSourceFilterId,
    };
    try {
      const response = await getLeadsCountByUserIds(payload);
      console.log("leads count response", response);
      setLeadCountByExecutives(response?.data?.data || []);
      setTimeout(() => {
        setLeadExeCountLoading(false);
      }, 200);
    } catch (error) {
      setLeadExeCountLoading(false);
      setLeadCountByExecutives([]);
      console.log("error", error);
    }
  };

  const handleDownload = async () => {
    const isWithIn30days = isWithin30Days(selectedDates[0], selectedDates[1]);
    console.log("isWithIn30days", isWithIn30days);
    if (isWithIn30days == false) {
      CommonMessage("error", "Please choose a date range within 30 days.");
      return;
    }
    setDownloadButtonLoader(true);
    const payload = {
      user_ids: allDownliners,
      start_date: selectedDates[0],
      end_date: selectedDates[1],
      ...(searchValue && filterType == 1
        ? { phone: searchValue }
        : searchValue && filterType == 2
          ? { name: searchValue }
          : searchValue && filterType == 3
            ? { email: searchValue }
            : searchValue && filterType == 4
              ? { course: searchValue }
              : {}),
    };
    try {
      const response = await downloadLeads(payload);
      console.log("leads download response", response);
      const data = response?.data?.data || [];
      const alterColumns = columns.filter((f) => f.title != "Action");
      DownloadTableAsCSV(
        data,
        alterColumns,
        `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
          selectedDates[1],
        ).format("DD-MM-YYYY")} Leads.csv`,
      );
      setTimeout(() => {
        setDownloadButtonLoader(false);
      }, 300);
    } catch (error) {
      setDownloadButtonLoader(false);
      console.log("lead download error", error);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={22}>
          <Row gutter={12}>
            <Col flex="23%">
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
                          dispatch(
                            storeLeadFilterValues({
                              searchValue: null,
                              pageNumber: 1,
                              pageLimit: pagination.limit,
                            }),
                          );
                          getAllLeadData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
                            allDownliners,
                            leadSourceFilterId,
                            leadSubSourceFilterId,
                            leadStatusId,
                            selectedOrigin,
                            filterValuesFromRedux.bucket,
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
                              storeLeadFilterValues({
                                filterType: e.target.value,
                              }),
                            );
                            if (searchValue == "") {
                              return;
                            } else {
                              setSearchValue("");
                              dispatch(
                                storeLeadFilterValues({
                                  searchValue: "",
                                  pageNumber: 1,
                                  pageLimit: pagination.limit,
                                }),
                              );
                              setPagination({
                                page: 1,
                              });
                              getAllLeadData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
                                allDownliners,
                                leadSourceFilterId,
                                leadSubSourceFilterId,
                                leadStatusId,
                                selectedOrigin,
                                filterValuesFromRedux.bucket,
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
            {permissions.includes("Lead Executive Filter") &&
              leadBucketName != "Open Leads" && (
                <Col flex="26%">
                  <div style={{ width: "100%" }}>
                    <div className="overallduecustomers_filterContainer">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <CommonMultiSelectField
                          height="34px"
                          label="Select User"
                          labelMarginTop="1px"
                          labelFontSize="11px"
                          options={subUsers}
                          onChange={handleSelectUser}
                          value={selectedUserId}
                          borderRightNone={true}
                        />
                      </div>
                      <div
                        onClick={() => {
                          if (executiveCountTooltip) {
                            return;
                          }
                          handleLeadCountByExecutive();
                        }}
                        style={{ marginLeft: "-2px" }}
                      >
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
                                {leadExeCountLoading ? (
                                  <div className="leadsmanager_executivecount_loader_container">
                                    <Spin size="small" />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      maxHeight: "140px",
                                      overflowY: "auto",
                                      whiteSpace: "pre-line",
                                      lineHeight: "24px",
                                    }}
                                  >
                                    {leadCountByExecutives.map(
                                      (item, index) => {
                                        return (
                                          <p className="leadsmanager_executivecount_text">
                                            {`${index + 1}. ${item.user_name} - ${
                                              item.lead_count
                                            }`}
                                          </p>
                                        );
                                      },
                                    )}
                                  </div>
                                )}
                              </>
                            }
                            trigger={["click"]}
                            onOpenChange={(value) => {
                              setExecutiveCountTooltip(value);
                              if (value === false) {
                                setLeadCountByExecutives([]);
                              }
                            }}
                          >
                            <Button className="leadsmanager_executivecount_iconcontainer">
                              <MdFormatListNumbered size={16} />
                            </Button>
                          </Tooltip>
                        </Flex>
                      </div>
                    </div>
                  </div>
                </Col>
              )}

            <Col flex="none">
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  dispatch(
                    storeLeadFilterValues({
                      start_date: dates[0],
                      end_date: dates[1],
                      pageNumber: 1,
                      pageLimit: pagination.limit,
                    }),
                  );
                  setPagination({
                    page: 1,
                  });
                  getAllLeadData(
                    searchValue,
                    dates[0],
                    dates[1],
                    allDownliners,
                    leadSourceFilterId,
                    leadSubSourceFilterId,
                    leadStatusId,
                    selectedOrigin,
                    filterValuesFromRedux.bucket,
                    1,
                    pagination.limit,
                  );
                }}
              />
            </Col>
            <Col flex="none">
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
                          fontWeight: "600",
                          fontSize: "13px",
                          color: "#0f172a",
                        }}
                      >
                        Advanced Filters
                      </span>
                      <Badge
                        count={leadSubSourceFilterId == 3 ? 4 : 3}
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
                        gap: "20px",
                        maxHeight: "420px",
                        overflowY: "auto",
                        padding: "20px",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <CommonSelectField
                          width="100%"
                          height="35px"
                          label="Select Lead Source"
                          labelMarginTop="0px"
                          labelFontSize="12px"
                          options={leadTypeOptions}
                          onChange={(e) => {
                            const value = e.target.value;
                            setLeadSourceFilterId(value);
                            setLeadSubSourceFilterId(null);
                            setSelectedOrigin(null);
                            dispatch(
                              storeLeadFilterValues({
                                lead_source: e.target.value,
                                lead_sub_source: null,
                                origin: null,
                                pageNumber: 1,
                                pageLimit: pagination.limit,
                              }),
                            );
                            getAllLeadData(
                              searchValue,
                              selectedDates[0],
                              selectedDates[1],
                              allDownliners,
                              e.target.value,
                              null,
                              leadStatusId,
                              null,
                              filterValuesFromRedux.bucket,
                              1,
                              pagination.limit,
                            );
                            if (value == 2 || value == 3 || value == 6) {
                              setLeadSubSourceOptions([]);
                              setLeadSubSourceFilterId(null);
                            } else if (value) {
                              getLeadSubSourceData(value);
                            }
                          }}
                          value={leadSourceFilterId}
                          disableClearable={false}
                        />{" "}
                      </div>

                      <div style={{ width: "100%" }}>
                        <CommonSelectField
                          width="100%"
                          height="35px"
                          label="Select Lead Sub Source"
                          labelMarginTop="0px"
                          labelFontSize="12px"
                          options={leadSubSourceOptions?.map((item) => ({
                            id: item.sub_category_id,
                            name: item.sub_category,
                          }))}
                          onChange={(e) => {
                            setLeadSubSourceFilterId(e.target.value);
                            setSelectedOrigin(null);
                            dispatch(
                              storeLeadFilterValues({
                                lead_sub_source: e.target.value,
                                origin: null,
                                pageNumber: 1,
                                pageLimit: pagination.limit,
                              }),
                            );
                            getAllLeadData(
                              searchValue,
                              selectedDates[0],
                              selectedDates[1],
                              allDownliners,
                              leadSourceFilterId,
                              e.target.value,
                              leadStatusId,
                              null,
                              filterValuesFromRedux.bucket,
                              1,
                              pagination.limit,
                            );
                          }}
                          value={leadSubSourceFilterId}
                          disableClearable={false}
                          disabled={
                            leadSourceFilterId == 2 ||
                            leadSourceFilterId == 3 ||
                            leadSourceFilterId == 6
                          }
                        />
                      </div>

                      {leadSubSourceFilterId == 3 && (
                        <div style={{ width: "100%" }}>
                          <CommonSelectField
                            width="100%"
                            height="35px"
                            label="Select Origin"
                            labelMarginTop="0px"
                            labelFontSize="12px"
                            options={[
                              {
                                id: "acte.in",
                                name: "acte.in",
                              },
                              {
                                id: "acte.co.in",
                                name: "acte.co.in",
                              },
                              {
                                id: "learnovita.com",
                                name: "learnovita.com",
                              },
                              {
                                id: "acte.courses",
                                name: "placement7.com",
                              },
                              {
                                id: "linkplux.com",
                                name: "linkplux.com",
                              },
                              {
                                id: "careerfast.in",
                                name: "careerfast.in",
                              },
                              {
                                id: "Google Ads",
                                name: "Google Ads",
                              },
                            ]}
                            onChange={(e) => {
                              setSelectedOrigin(e.target.value);
                              dispatch(
                                storeLeadFilterValues({
                                  origin: e.target.value,
                                  pageNumber: 1,
                                  pageLimit: pagination.limit,
                                }),
                              );
                              getAllLeadData(
                                searchValue,
                                selectedDates[0],
                                selectedDates[1],
                                allDownliners,
                                leadSourceFilterId,
                                leadSubSourceFilterId,
                                leadStatusId,
                                e.target.value,
                                filterValuesFromRedux.bucket,
                                1,
                                pagination.limit,
                              );
                            }}
                            value={selectedOrigin}
                            disableClearable={false}
                          />
                        </div>
                      )}
                      <div style={{ width: "100%" }}>
                        <CommonSelectField
                          width="100%"
                          height="35px"
                          label="Lead Temp."
                          labelMarginTop="0px"
                          labelFontSize="12px"
                          options={[
                            { id: 5, name: "Super Hot", color: "#dc2626" },
                            { id: 1, name: "Hot", color: "#f97316" },
                            { id: 2, name: "Warm", color: "#eab308" },
                            { id: 3, name: "Cold", color: "#3b82f6" },
                            {
                              id: 6,
                              name: "Not Interested",
                              color: "#991b1b",
                            },
                            { id: 4, name: "Dormant", color: "#6b7280" },
                          ]}
                          onChange={(e) => {
                            setLeadStatusId(e.target.value);
                            getAllLeadData(
                              searchValue,
                              selectedDates[0],
                              selectedDates[1],
                              allDownliners,
                              leadSourceFilterId,
                              leadSubSourceFilterId,
                              e.target.value,
                              selectedOrigin,
                              filterValuesFromRedux.bucket,
                              1,
                              pagination.limit,
                            );
                          }}
                          value={leadStatusId}
                          disableClearable={false}
                          renderOption={(props, option) => (
                            <li {...props}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <span
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: option.color || "gray",
                                  }}
                                ></span>
                                <span>{option.name}</span>
                              </div>
                            </li>
                          )}
                        />
                      </div>
                      {/* <div style={{ width: "100%" }}>
                        <CommonSelectField
                          width="100%"
                          height="35px"
                          label="Followup Status"
                          labelMarginTop="0px"
                          labelFontSize="12px"
                          options={[
                            { id: 5, name: "Sales Ready", color: "#dc2626" },
                            {
                              id: 1,
                              name: "Highly Interested",
                              color: "#f97316",
                            },
                            { id: 8, name: "Interested", color: "#eab308" },
                            { id: 9, name: "Exploring", color: "#3b82f6" },
                            {
                              id: 10,
                              name: "Not Responding",
                              color: "#4b5563",
                            },
                            { id: 2, name: "Not Interested", color: "#111827" },
                          ]}
                          onChange={() => {}}
                          value={null}
                          disableClearable={false}
                          renderOption={(props, option) => (
                            <li {...props}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <span
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: option.color || "gray",
                                  }}
                                ></span>
                                <span>{option.name}</span>
                              </div>
                            </li>
                          )}
                        />
                      </div> */}
                    </div>
                  </div>
                }
              >
                <Button
                  // type="primary"
                  icon={<IoFilter size={15} />}
                  className="leads_advancefilter_button"
                  style={{
                    background: "#fff",
                    borderRadius: "6px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "500",
                    fontSize: "12px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  Filters
                </Button>
              </Popover>
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={2}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* {permissions.includes("Add Lead Button") && isShowEdit === true ? (
              <button
                className="leadmanager_addleadbutton"
                onClick={() => {
                  setIsOpenAddDrawer(true);
                  setTimeout(() => {
                    const drawerBody = document.querySelector(
                      "#leadform_addlead_drawer .ant-drawer-body",
                    );
                    if (drawerBody) {
                      drawerBody.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }
                  }, 300);
                }}
              >
                Add Lead
              </button>
            ) : (
              ""
            )} */}
            {permissions.includes("Download Leads") &&
            selectedRowKeys.length == 0 ? (
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
            ) : (
              ""
            )}

            {permissions.includes("Assign Lead") && isShowEdit === false && (
              <button
                className="leadmanager_addleadbutton"
                onClick={() => {
                  const findJunks = selectedRows.find(
                    (f) => f.lead_status_id == 4 || f.lead_status_id == 5,
                  );
                  if (findJunks) {
                    CommonMessage("error", "Unable to assign junk leads");
                    return;
                  }
                  setIsOpenAssignModal(true);
                  setReEntryNxtFollowUpDate(new Date());
                }}
              >
                Assign Lead
              </button>
            )}

            <FiFilter
              size={20}
              color="#5b69ca"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setIsOpenFilterDrawer(true);
                getTableColumnsData(loginUserId);
              }}
            />
          </div>
        </Col>
      </Row>

      {leadBucketName === "All" &&
        permissions.includes("Show Region Summary") && (
          <div className="livelead_today_summary_container">
            <p className="livelead_today_label">Region Summary</p>

            <div className="livelead_badge_item online">
              <div
                className="livelead_badge_dot"
                style={{ backgroundColor: "#3c9111" }}
              />
              <p className="livelead_badge_text">
                Hub{" "}
                <span className="livelead_badge_count">
                  {allLeadsRegionCounts?.hub_leads ?? "-"}
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
                  {allLeadsRegionCounts?.chennai_leads ?? "-"}
                </span>
              </p>
            </div>

            <div className="livelead_badge_item corporate">
              <div
                className="livelead_badge_dot"
                style={{ backgroundColor: "#607d8b" }}
              />
              <p className="livelead_badge_text">
                Bangalore{" "}
                <span className="livelead_badge_count">
                  {allLeadsRegionCounts?.bangalore_leads ?? "-"}
                </span>
              </p>
            </div>

            {/* <div className="livelead_badge_item total">
            <div
              className="livelead_badge_dot"
              style={{ backgroundColor: "#5b69ca" }}
            />
            <p className="livelead_badge_text">
              Total{" "}
              <span className="livelead_badge_count">
                {allLeadsRegionCounts?.total || 0}
              </span>
            </p>
          </div> */}
          </div>
        )}

      {leadBucketName === "Interested Leads" &&
        Object.keys(interestedLeadActions).length > 0 && (
          <div style={{ marginTop: "15px", padding: "0 5px" }}>
            <ScrollableTabContainer>
              {(() => {
                const orderedKeys = [
                  "super_hot",
                  "hot",
                  "warm",
                  "cold",
                  "dormant",
                  "not_interested",
                ];

                const sortedKeys = Object.keys(interestedLeadActions)
                  .filter((k) => k !== "all")
                  .sort((a, b) => {
                    let indexA = orderedKeys.indexOf(a);
                    let indexB = orderedKeys.indexOf(b);
                    if (indexA === -1) indexA = 999;
                    if (indexB === -1) indexB = 999;
                    return indexA - indexB;
                  });

                return sortedKeys.map((key) => {
                  const count = interestedLeadActions[key];
                  const displayName =
                    key === "all"
                      ? "All"
                      : key
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ");
                  const isActive = leadActionFilter === key;
                  const actionColorMap = {
                    super_hot: "#dc2626",
                    hot: "#f97316",
                    warm: "#eab308",
                    cold: "#3b82f6",
                    not_interested: "#991b1b",
                    dormant: "#6b7280",
                  };
                  const baseColor = actionColorMap[key] || "#475569";

                  return (
                    <div
                      key={key}
                      onClick={() => {
                        if (leadActionFilter === key) return;
                        setLeadActionFilter(key);
                        dispatch(
                          storeLeadFilterValues({
                            pageNumber: 1,
                            pageLimit: pagination.limit,
                          }),
                        );
                        getAllLeadData(
                          searchValue,
                          selectedDates[0],
                          selectedDates[1],
                          allDownliners,
                          leadSourceFilterId,
                          leadSubSourceFilterId,
                          leadStatusId,
                          selectedOrigin,
                          "Interested Leads",
                          1,
                          pagination.limit,
                          key,
                        );
                      }}
                      className={`leadmanager_bucket ${key} ${isActive ? "active" : ""}`}
                    >
                      {displayName} {`( ${count} )`}
                    </div>
                  );
                });
              })()}
            </ScrollableTabContainer>
          </div>
        )}

      {leadBucketName === "Followup Leads" && (
        <div style={{ marginTop: "15px", padding: "0 5px" }}>
          <ScrollableTabContainer>
            {(() => {
              const orderedKeys = [
                "all",
                "sales_ready_leads",
                "highly_interested_leads",
                "interested_leads",
                "exploring_leads",
                "not_responding_leads",
                "not_interested_leads",
              ];

              const sortedKeys = [
                ...new Set(["all", ...Object.keys(followupLeadActions)]),
              ].sort((a, b) => {
                let indexA = orderedKeys.indexOf(a);
                let indexB = orderedKeys.indexOf(b);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
              });

              return sortedKeys.map((key) => {
                const count =
                  key === "all"
                    ? leadBucketOptions.find((b) => b.id === "followup_leads")
                        ?.count || 0
                    : followupLeadActions[key] || 0;
                const displayName =
                  key === "all"
                    ? "All"
                    : key
                        .split("_")
                        .filter((word) => word.toLowerCase() !== "leads")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ");
                const isActive = leadActionFilter === key;
                const actionColorMap = {
                  all: "#dc2626",
                  sales_ready_leads: "#dc2626",
                  highly_interested_leads: "#f97316",
                  interested_leads: "#eab308",
                  exploring_leads: "#3b82f6",
                  not_responding_leads: "#6b7280",
                  not_interested_leads: "#991b1b",
                };
                const baseColor = actionColorMap[key] || "#475569";

                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (leadActionFilter === key) return;
                      setLeadActionFilter(key);
                      dispatch(
                        storeLeadFilterValues({
                          pageNumber: 1,
                          pageLimit: pagination.limit,
                        }),
                      );
                      getAllLeadData(
                        searchValue,
                        selectedDates[0],
                        selectedDates[1],
                        allDownliners,
                        leadSourceFilterId,
                        leadSubSourceFilterId,
                        leadStatusId,
                        selectedOrigin,
                        "Followup Leads",
                        1,
                        pagination.limit,
                        key,
                      );
                    }}
                    className={`leadmanager_bucket ${key} ${isActive ? "active" : ""}`}
                  >
                    {displayName} {`( ${count} )`}
                  </div>
                );
              });
            })()}
          </ScrollableTabContainer>
        </div>
      )}

      {leadBucketName === "Valid Leads" &&
        Object.keys(validLeadActions).length > 0 && (
          <div style={{ marginTop: "15px", padding: "0 5px" }}>
            <ScrollableTabContainer>
              {Object.keys(validLeadActions)
                .filter((k) => k !== "all")
                .map((key) => {
                  const count = validLeadActions[key];
                  const displayName =
                    key === "validated"
                      ? "Validated"
                      : key === "need_screening"
                        ? "Need Screening"
                        : key === "junk"
                          ? "Junk"
                          : key;
                  const isActive = leadActionFilter === key;
                  const validColorMap = {
                    validated: "#16a34a",
                    junk: "#dc2626",
                    need_screening: "#eab308",
                  };
                  const baseColor = validColorMap[key] || "#3b82f6";

                  return (
                    <div
                      key={key}
                      onClick={() => {
                        if (leadActionFilter === key) return;
                        setLeadActionFilter(key);
                        dispatch(
                          storeLeadFilterValues({
                            pageNumber: 1,
                            pageLimit: pagination.limit,
                          }),
                        );
                        getAllLeadData(
                          searchValue,
                          selectedDates[0],
                          selectedDates[1],
                          allDownliners,
                          leadSourceFilterId,
                          leadSubSourceFilterId,
                          leadStatusId,
                          selectedOrigin,
                          "Valid Leads",
                          1,
                          pagination.limit,
                          key,
                        );
                      }}
                      className={`leadmanager_bucket ${isActive ? "active" : ""}`}
                      style={{
                        border: `1px solid ${isActive ? baseColor : baseColor + "66"}`,
                        backgroundColor: isActive
                          ? baseColor
                          : baseColor + "15",
                        color: isActive ? "#fff" : baseColor,
                        minWidth: "max-content",
                      }}
                    >
                      {displayName} {`( ${count} )`}
                    </div>
                  );
                })}
            </ScrollableTabContainer>
          </div>
        )}

      {leadBucketName === "Eligible Leads" &&
        Object.keys(eligibleLeadActions).length > 0 && (
          <div style={{ marginTop: "15px", padding: "0 5px" }}>
            <ScrollableTabContainer>
              {Object.keys(eligibleLeadActions)
                .filter((k) => k !== "all")
                .map((key) => {
                  const count = eligibleLeadActions[key];
                  let displayName = key;
                  if (key === "communicated") displayName = "Communicated";
                  else if (key === "not_communicated")
                    displayName = "Not Communicated";
                  else if (
                    key === "no_response" ||
                    key === "data_correct_but_no_response"
                  )
                    displayName = "Data Correct But No Response";

                  const isActive = leadActionFilter === key;
                  const eligibleColorMap = {
                    communicated: "#6366f1",
                    not_communicated: "#f97316",
                    no_response: "#64748b",
                    data_correct_but_no_response: "#64748b",
                  };
                  const baseColor = eligibleColorMap[key] || "#3b82f6";

                  return (
                    <div
                      key={key}
                      onClick={() => {
                        if (leadActionFilter === key) return;
                        setLeadActionFilter(key);
                        dispatch(
                          storeLeadFilterValues({
                            pageNumber: 1,
                            pageLimit: pagination.limit,
                          }),
                        );
                        getAllLeadData(
                          searchValue,
                          selectedDates[0],
                          selectedDates[1],
                          allDownliners,
                          leadSourceFilterId,
                          leadSubSourceFilterId,
                          leadStatusId,
                          selectedOrigin,
                          "Eligible Leads",
                          1,
                          pagination.limit,
                          key,
                        );
                      }}
                      className={`leadmanager_bucket ${isActive ? "active" : ""}`}
                      style={{
                        border: `1px solid ${isActive ? baseColor : baseColor + "66"}`,
                        backgroundColor: isActive
                          ? baseColor
                          : baseColor + "15",
                        color: isActive ? "#fff" : baseColor,
                        minWidth: "max-content",
                      }}
                    >
                      {displayName} {`( ${count} )`}
                    </div>
                  );
                })}
            </ScrollableTabContainer>
          </div>
        )}

      <div style={{ marginTop: "20px" }}>
        {(() => {
          const displayedColumns = tableColumns
            .filter((col) => {
              if (leadBucketName === "Joinings") {
                const joiningsColumns = [
                  "row_num",
                  "lead_assigned_to_name",
                  "created_date",
                  "name",
                  "email",
                  "phone",
                  "primary_course",
                  "primary_fees",
                ];
                return joiningsColumns.includes(col.key);
              }

              if (leadBucketName === "Followup Leads") {
                if (col.key === "lead_status") return false;
              } else {
                if (col.key === "lead_action_name") return false;
              }

              return true;
            })
            .map((col) => {
              if (col.key === "action") {
                return {
                  ...col,
                  render: (text, record) => {
                    const isAfter45Days = checkIsAfter45Days(
                      record.created_date,
                    );
                    return (
                      <div className="leadmanager_actionbuttonContainer">
                        <Tooltip placement="bottom" title="View Lead Details">
                          <FaRegEye
                            size={16}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setViewLeadItem(record);
                              setIsOpenViewDrawer(true);
                            }}
                          />
                        </Tooltip>

                        {permissions.includes("Edit Lead Button") &&
                          isShowEdit &&
                          leadBucketName !== "Open Leads" &&
                          record.is_customer_reg === 0 && (
                            <AiOutlineEdit
                              className="leadmanager_action_icon"
                              onClick={() => {
                                if (onEditLead) {
                                  onEditLead(record, false);
                                } else {
                                  setUpdateLeadItem(record);
                                  setLeadId(record.id);
                                  setIsOpenAddDrawer(true);
                                }
                              }}
                            />
                          )}

                        {(leadBucketName === "All" ||
                          leadBucketName === "Interested Leads" ||
                          leadBucketName === "Followup Leads") &&
                          (record.is_customer_reg === 1 ? (
                            <Tooltip
                              placement="bottom"
                              title="Already a Customer"
                            >
                              <FaRegAddressCard
                                className="leadmanager_action_icon"
                                color="#2ed573"
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip
                              placement="bottom"
                              title="Make as customer"
                            >
                              <FaRegAddressCard
                                className="leadmanager_action_icon"
                                color="#d32f2f"
                                onClick={() => {
                                  if (
                                    permissions.includes("Edit Lead Button")
                                  ) {
                                    if (
                                      record?.lead_type_id == null ||
                                      record?.lead_type_id == "" ||
                                      record?.lead_type_id == 0
                                    ) {
                                      CommonMessage(
                                        "error",
                                        "Please fill in the Lead Source section in the Add Lead form",
                                      );
                                      return;
                                    }
                                    if (
                                      record?.primary_course_id == null ||
                                      record?.primary_course_id == "" ||
                                      record?.primary_course_id == 0
                                    ) {
                                      CommonMessage(
                                        "error",
                                        "Please fill in the Course section in the Add Lead form",
                                      );
                                      return;
                                    }
                                    if (filterValuesFromRedux.call_getraapi) {
                                      getRaUsers();
                                    }
                                    setIsOpenPaymentDrawer(true);
                                    setClickedLeadItem(record);

                                    setTimeout(() => {
                                      const drawerBody = document.querySelector(
                                        "#leadmanager_paymentdetails_drawer .ant-drawer-body",
                                      );

                                      if (drawerBody) {
                                        drawerBody.scrollTo({
                                          top: 0,
                                          behavior: "smooth",
                                        });
                                      }
                                    }, 300);
                                  } else {
                                    CommonMessage("error", "Access Denied");
                                  }
                                }}
                              />
                            </Tooltip>
                          ))}

                        {permissions.includes("Assign Lead") &&
                          leadBucketName === "All" && (
                            <Tooltip
                              placement="bottom"
                              title="Re-Assign this lead to another user"
                            >
                              <PiShareFatBold
                                className="leadmanager_action_icon"
                                color="#5b69ca"
                                onClick={() => {
                                  if (onEditLead) {
                                    onEditLead(record, true);
                                  } else {
                                    setIsReEntry(true);
                                    setUpdateLeadItem(record);
                                    setLeadId(record.id);
                                    setIsOpenAddDrawer(true);
                                  }
                                }}
                              />
                            </Tooltip>
                          )}
                      </div>
                    );
                  },
                };
              }
              return col;
            });

          return (
            <CommonTable
              scroll={{
                x: displayedColumns.reduce(
                  (total, col) => total + (Number(col.width) || 150),
                  0,
                ),
              }}
              columns={displayedColumns}
              dataSource={leadData}
              dataPerPage={10}
              loading={loading}
              checkBox={"false"}
              size="small"
              className="questionupload_table"
              selectedDatas={handleSelectedRow}
              selectedRowKeys={selectedRowKeys}
              onPaginationChange={handlePaginationChange}
              limit={pagination.limit}
              page_number={pagination.page}
              totalPageNumber={pagination.total}
            />
          );
        })()}
      </div>
      <Drawer
        title="Add Lead"
        open={isOpenAddDrawer}
        onClose={() => {
          setIsOpenAddDrawer(false);
          setUpdateLeadItem(null);
          setIsReEntry(false);
          setLeadId(null);
        }}
        width="52%"
        style={{ position: "relative" }}
        id="leadform_addlead_drawer"
      >
        <AddLead
          ref={addLeaduseRef}
          key={updateLeadItem}
          leadTypeOptions={leadTypeOptions}
          regionOptions={regionOptions}
          leadId={leadId}
          updateLeadItem={updateLeadItem}
          isReEntry={isReEntry}
          subUsers={subUsers}
          setButtonLoading={setButtonLoading}
          setSaveOnlyLoading={setSaveOnlyLoading}
          setIsOpenAddDrawer={setIsOpenAddDrawer}
          callgetLeadsApi={() => {
            setUpdateLeadItem(null);
            setIsReEntry(false);
            getAllLeadData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              allDownliners,
              leadSourceFilterId,
              leadSubSourceFilterId,
              leadStatusId,
              selectedOrigin,
              filterValuesFromRedux.bucket,
              pagination.page,
              pagination.limit,
            );
            refreshLeadFollowUp();
          }}
        />

        <div className="leadmanager_submitlead_buttoncontainer">
          <div style={{ display: "flex", gap: "12px" }}>
            {leadId ? (
              ""
            ) : (
              <>
                {saveOnlyLoading ? (
                  <button className={"leadmanager_loadingupdateleadbutton"}>
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className={"leadmanager_updateleadbutton"}
                    onClick={() =>
                      addLeaduseRef.current.handleSubmit("Save Only")
                    }
                  >
                    Save
                  </button>
                )}
              </>
            )}

            {buttonLoading ? (
              <button
                className={
                  leadId
                    ? "leadmanager_loadingupdateleadbutton"
                    : "leadmanager_loadingsaveleadbutton"
                }
              >
                <CommonSpinner />
              </button>
            ) : (
              <button
                className={
                  leadId
                    ? "leadmanager_updateleadbutton"
                    : "leadmanager_saveleadbutton"
                }
                onClick={() =>
                  addLeaduseRef.current.handleSubmit("Save And Add New")
                }
              >
                {isReEntry
                  ? "Re-Assign"
                  : leadId
                    ? "Update"
                    : "Save And Add New"}
              </button>
            )}
          </div>
        </div>
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
                  page_name:
                    leadBucketName === "Followup Leads"
                      ? "Interested Leads"
                      : "Leads",
                  column_names: columns,
                };
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

      <Drawer
        title={"Make as Customer"}
        open={isOpenPaymentDrawer}
        onClose={formReset}
        width="54%"
        style={{ position: "relative", padding: "0px", paddingBottom: 50 }}
        className="leadmanager_paymentdetails_drawer"
        id="leadmanager_paymentdetails_drawer"
      >
        {clickedLeadItem && (
          <MakeAsCustomer
            ref={makeAsCustomerRef}
            clickedLeadItem={clickedLeadItem}
            raUsers={raUsers}
            allBranchesData={allBranchesData}
            callgetLeadsApi={() => {
              formReset();
              getAllLeadData(
                searchValue,
                selectedDates[0],
                selectedDates[1],
                allDownliners,
                leadSourceFilterId,
                leadSubSourceFilterId,
                leadStatusId,
                selectedOrigin,
                filterValuesFromRedux.bucket,
                pagination.page,
                pagination.limit,
              );
              refreshLeadFollowUp();
            }}
            setButtonLoading={setButtonLoading}
          />
        )}
        <div className="leadmanager_tablefiler_footer">
          <div
            className="leadmanager_submitlead_buttoncontainer"
            style={{ gap: "12px" }}
          >
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={() => makeAsCustomerRef.current.handlePaymentSubmit()}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* assign lead modal */}
      <Modal
        title="Assign Leads"
        open={isOpenAssignModal}
        onCancel={handleAssignLeadCancel}
        footer={[
          <Button
            key="cancel"
            onClick={handleAssignLeadCancel}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          addCourseLoading ? (
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
            label="Lead Executive"
            required={true}
            options={[]}
            onChange={(e) => {
              setAssignId(e.target.value);
              setAssignIdError(selectValidator(e.target.value));
            }}
            value={assignId}
            error={assignIdError}
          />
        </div>
        <div style={{ marginTop: "30px", marginBottom: "20px" }}>
          <CommonNxtFollowupDatePicker
            label="Next Follow-Up Date"
            required={true}
            onChange={(value) => {
              setReEntryNxtFollowUpDate(value);
            }}
            value={reEntryNxtFollowUpDate}
            disablePreviousDates={true}
            error={""}
          />
        </div>
      </Modal>

      {/* View Lead Drawer */}
      <Drawer
        title={
          <span
            style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}
          >
            Lead Details
          </span>
        }
        width={750}
        onClose={() => {
          setIsOpenViewDrawer(false);
          setViewLeadItem(null);
        }}
        open={isOpenViewDrawer}
        styles={{
          body: {
            padding: 0,
            background: "#f8fafc",
          },
          header: {
            borderBottom: "1px solid #e2e8f0",
          },
        }}
      >
        {viewLeadItem && <ViewLeadDetails leadData={viewLeadItem} />}
      </Drawer>

      <FollowUpDrawerForm
        isOpen={isOpenFollowUpDrawer}
        onClose={() => setIsOpenFollowUpDrawer(false)}
        leadDetails={selectedLeadForFollowUp}
        commentsHistory={followupHistory}
        leadId={selectedLeadForFollowUp?.id}
        leadHistoryId={leadHistoryId}
        onUpdateSuccess={() => {
          setIsOpenFollowUpDrawer(false);
          // if (refreshLeadFollowUp) refreshLeadFollowUp();
          if (refreshToggle !== undefined) setRefreshToggle(!refreshToggle);

          getAllLeadData(
            searchValue,
            selectedDates[0],
            selectedDates[1],
            allDownliners,
            leadSourceFilterId,
            leadSubSourceFilterId,
            leadStatusId,
            selectedOrigin,
            filterValuesFromRedux.bucket,
            pagination.page,
            pagination.limit,
          );
        }}
      />
      {/* move to interested */}
      <FollowUpDrawerForm
        isOpen={isOpenMoveToInterestedDrawer}
        onClose={() => setIsOpenMoveToInterestedDrawer(false)}
        leadDetails={selectedLeadForFollowUp}
        commentsHistory={followupHistory}
        leadId={selectedLeadForFollowUp?.id}
        leadHistoryId={leadHistoryId}
        is_moveto_interested={true}
        onUpdateSuccess={() => {
          setIsOpenMoveToInterestedDrawer(false);
          // if (refreshLeadFollowUp) refreshLeadFollowUp();
          if (refreshToggle !== undefined) setRefreshToggle(!refreshToggle);

          getAllLeadData(
            searchValue,
            selectedDates[0],
            selectedDates[1],
            allDownliners,
            leadSourceFilterId,
            leadSubSourceFilterId,
            leadStatusId,
            selectedOrigin,
            filterValuesFromRedux.bucket,
            pagination.page,
            pagination.limit,
          );
        }}
      />
    </div>
  );
}
