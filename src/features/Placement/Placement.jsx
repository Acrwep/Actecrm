import React, { useState, useRef, useEffect } from "react";
import {
  Row,
  Col,
  Tooltip,
  Drawer,
  Button,
  Checkbox,
  Progress,
  Badge,
  Popover,
  Grid,
} from "antd";
import { CiSearch } from "react-icons/ci";
import {
  IoIosClose,
  IoMdArrowDropleft,
  IoMdArrowDropright,
} from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { MdOutlineSwapVert } from "react-icons/md";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import "../Customers/styles.css";
import {
  getAllDownlineUsers,
  getCustomerById,
  getTableColumns,
  updateTableColumns,
  getBranches,
  getUsers,
  getPlacementSupport,
  getTechnologies,
} from "../ApiService/action";
import {
  customersStatusDisplay,
  getCurrentandPreviousweekDate,
  regionOptions,
} from "../Common/Validation";
import { FaRegEye } from "react-icons/fa";
import { RedoOutlined } from "@ant-design/icons";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import { FiFilter } from "react-icons/fi";
import { FaRegCopy } from "react-icons/fa6";
import { LuFileClock } from "react-icons/lu";
import CommonDnd from "../Common/CommonDnd";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { useSelector } from "react-redux";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import DraggableStudentModal from "../Common/DraggableStudentModal";
import CommonSelectField from "../Common/CommonSelectField";
import CustomerHistory from "../Customers/CustomerHistory";
import OverflowTooltip from "../Common/OverflowTooltip";
import CandidateNumberWithWhatsApp from "../Common/CandidateNumberWithWhatsApp";

export default function Placement() {
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

  //======eye icon loading
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState("");
  const customerDetailsLoadingRef = useRef(customerDetailsLoading);
  //======

  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [allAdmissionsRegionCounts, setAllAdmissionsRegionCounts] =
    useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [modeStatus, setModeStatus] = useState("");
  const [isOpenCustomerDetailsModal, setIsOpenCustomerDetailsModal] =
    useState(false);
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  //feedback usestates
  const [loading, setLoading] = useState(true);
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
  //status bucket
  const [status, setStatus] = useState("");
  const [isSwap, setIsSwap] = useState(false);
  const [customerStatusCount, setCustomerStatusCount] = useState(null);
  const [classGoingCounts, setClassGoingCounts] = useState(null);
  const [trainerSubbucketStatus, setTrainerSubbucketsStatus] = useState("");
  const [classGoingSubBucketStatus, setClassGoingSubBucketStatus] =
    useState("");
  const scrollRef = useRef();
  const statusBuckets = [
    {
      label: "All",
      value: "",
      countKey: "total_count",
      activeClass: "addlead_tab_activebutton",
      inactiveClass: "addlead_tab_inactivebutton",
    },
    {
      label: "Form Pending",
      value: "Form Pending",
      countKey: "form_pending",
      activeClass: "customers_active_formpending_container",
      inactiveClass: "customers_formpending_container",
    },
    {
      type: "payment",
    },

    {
      label: "Student Verify",
      value: "Awaiting Verify",
      countKey: "awaiting_verify",
      activeClass: "customers_active_studentvefity_container",
      inactiveClass: "customers_studentvefity_container",
    },
    {
      label: "Assign Trainer",
      value: "assign_trainer",
      countKey: "assign_trainer",
      activeClass: "customers_active_assigntrainers_container",
      inactiveClass: "customers_assigntrainers_container",

      onClick: () => {
        setTrainerSubbucketsStatus("");
      },
    },
    {
      label: "Awaiting Class",
      value: "Awaiting Class",
      countKey: "awaiting_class",
      activeClass: "customers_active_awaitingclass_container",
      inactiveClass: "customers_awaitingclass_container",
    },
    {
      label: "Class Scheduled",
      value: "Class Scheduled",
      countKey: "class_scheduled",
      activeClass: "customers_active_classschedule_container",
      inactiveClass: "customers_classschedule_container",
    },
    {
      label: "Class Going",
      value: "Class Going",
      countKey: "class_going",
      activeClass: "customers_active_classgoing_container",
      inactiveClass: "customers_classgoing_container",

      onClick: () => {
        setClassGoingSubBucketStatus("");

        return {
          classGoingSubBucketStatus: null,
        };
      },
    },
    {
      label: "Escalated",
      value: "Escalated",
      countKey: "escalated",
      activeClass: "customers_active_escalated_container",
      inactiveClass: "customers_escalated_container",
    },
    {
      label: "Passedout Process",
      value: "Passedout process",
      countKey: "passedout_process",
      activeClass: "customers_active_feedback_container",
      inactiveClass: "customers_feedback_container",
    },
    {
      label: "Course Completed",
      value: "Completed",
      countKey: "completed",
      activeClass: "customers_active_completed_container",
      inactiveClass: "customers_completed_container",
    },
    {
      label: "Hold",
      value: "Hold",
      countKey: "hold",
      activeClass: "customers_active_studentvefity_container",
      inactiveClass: "customers_studentvefity_container",
    },
    {
      label: "Others",
      value: "Others",
      countKey: "Others",
      activeClass: "customers_active_others_container",
      inactiveClass: "customers_others_container",
    },
  ];

  const trainerSubbucketConfigs = [
    {
      label: "Awaiting Trainer",
      value: "Awaiting Trainer",
      countKey: "awaiting_trainer",
      activeClass: "customers_active_awaitingclass_container",
      inactiveClass: "customers_awaitingclass_container",
    },
    {
      label: "Trainer Rejected",
      value: "Trainer Rejected",
      countKey: "trainer_rejected",
      activeClass: "customers_active_paymentreject_container",
      inactiveClass: "customers_paymentreject_container",
    },
    {
      label: "Verify Trainer",
      value: "Awaiting Trainer Verify",
      countKey: "awaiting_trainer_verify",
      activeClass: "customers_active_verifytrainers_container",
      inactiveClass: "customers_verifytrainers_container",
      role: "RM",
    },
    {
      label: "Trainer Approval",
      value: "Trainer Approval",
      countKey: "trainer_approval",
      activeClass: "customers_active_trainerapproval_container",
      inactiveClass: "customers_trainerapproval_container",
      role: "CFO",
    },
    {
      label: "Approval Rejected",
      value: "Approval Rejected",
      countKey: "approval_rejected",
      activeClass: "customers_active_paymentreject_container",
      inactiveClass: "customers_paymentreject_container",
      role: "CFO",
    },
  ];
  const classGoingSubbucketConfigs = [
    {
      label: "25 & Below",
      value: "under_25",
      countKey: "under_25",
      activeClass: "trainers_active_stage1_container",
      inactiveClass: "trainers_stage1_container",
    },
    {
      label: "50 & Below",
      value: "under_50",
      countKey: "under_50",
      activeClass: "trainers_active_stage2_container",
      inactiveClass: "trainers_stage2_container",
    },
    {
      label: "75 & Below",
      value: "under_75",
      countKey: "under_75",
      activeClass: "trainers_active_stage4_container",
      inactiveClass: "trainers_stage4_container",
    },
    {
      label: "99 & Below",
      value: "under_99",
      countKey: "under_99",
      activeClass: "customers_active_trainer_coordination_container",
      inactiveClass: "customers_trainer_coordination_container",
    },
  ];

  const scroll = (scrollOffset) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollLeft += scrollOffset;
  };

  const handleBucketClick = (config) => {
    if (
      status === config.value &&
      !trainerSubbucketStatus &&
      !classGoingSubBucketStatus
    ) {
      return;
    }

    const extraOverrides = config.onClick?.() || {};

    const overrides = {
      status: config.value,
      pageNumber: 1,
      ...extraOverrides,
    };

    setStatus(config.value);
    setTrainerSubbucketsStatus("");
    setClassGoingSubBucketStatus("");

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    fetchPlacementSupportData(overrides);
  };

  const handlePaymentStatusClick = () => {
    if (status === "Awaiting Finance" || status === "Payment Rejected") {
      return;
    }

    const newStatus = isSwap ? "Payment Rejected" : "Awaiting Finance";

    setStatus(newStatus);
    setTrainerSubbucketsStatus("");
    setClassGoingSubBucketStatus("");

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    fetchPlacementSupportData({
      status: newStatus,
      pageNumber: 1,
    });
  };

  const handlePaymentSwap = (e) => {
    e.stopPropagation();

    const newSwap = !isSwap;
    const newStatus = newSwap ? "Payment Rejected" : "Awaiting Finance";

    setIsSwap(newSwap);
    setStatus(newStatus);
    setTrainerSubbucketsStatus("");
    setClassGoingSubBucketStatus("");

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    fetchPlacementSupportData({
      status: newStatus,
      pageNumber: 1,
    });
  };

  const handleTrainerSubbucketClick = (config) => {
    if (trainerSubbucketStatus === config.value) {
      return;
    }

    setTrainerSubbucketsStatus(config.value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    fetchPlacementSupportData({
      status: config.value,
      pageNumber: 1,
    });
  };

  const handleClassGoingSubbucketClick = (config) => {
    if (classGoingSubBucketStatus === config.value) {
      return;
    }

    setClassGoingSubBucketStatus(config.value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    fetchPlacementSupportData({
      classGoingSubBucketStatus: config.value,
      pageNumber: 1,
    });
  };

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
      title: "Date Of Joining",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 120,
      defaultSortOrder: "descend", // Optional
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Candidate Name / ID",
      key: "name",
      dataIndex: "name",
      width: 160,
      render: (text, record) => {
        return (
          <div className="customers_candidatename_container">
            <EllipsisTooltip text={text} />
            {record.student_id && (
              <span className="customers_studentid_badge">
                {record.student_id}
              </span>
            )}
          </div>
        );
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
          <CandidateNumberWithWhatsApp
            text={text}
            phoneCode={record.phonecode}
            whatsapp={record.whatsapp}
            whatsappPhoneCode={record.whatsapp_phone_code}
          />
        );
      },
    },
    {
      title: "Course ",
      key: "course_name",
      dataIndex: "course_name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "RA",
      key: "ra_name",
      dataIndex: "ra_name",
      width: 80,
      align: "center",
      render: (text, record) => {
        if (text) {
          const ra = `${record.ra_view_user_id} - ${text}`;
          return (
            <div style={{ textAlign: "center", width: "100%" }}>
              <OverflowTooltip title={ra} children={record.ra_view_user_id} />
            </div>
          );
        } else {
          return <p style={{ margin: 0, textAlign: "center" }}>-</p>;
        }
      },
    },
    {
      title: "HR",
      key: "hr_name",
      dataIndex: "hr_name",
      width: 80,
      align: "center",
      render: (text, record) => {
        if (text) {
          const hr = `${record.hr_view_user_id} - ${text}`;
          return (
            <div style={{ textAlign: "center", width: "100%" }}>
              <OverflowTooltip title={hr} children={record.hr_view_user_id} />
            </div>
          );
        } else {
          return <p style={{ margin: 0, textAlign: "center" }}>-</p>;
        }
      },
    },
    {
      title: "Sale Executive",
      key: "lead_assigned_to_name",
      dataIndex: "lead_assigned_to_name",
      width: 110,
      render: (text, record) => {
        const salse_executive = `${record.lead_assigned_to_view_user_id} - ${text}`;
        return (
          <div style={{ textAlign: "center", width: "100%" }}>
            <OverflowTooltip
              title={salse_executive}
              children={record.lead_assigned_to_view_user_id}
            />
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      fixed: "right",
      width: 170,
      sorter: (a, b) =>
        customersStatusDisplay(a).localeCompare(customersStatusDisplay(b)),
      sortDirections: ["ascend", "descend"],
      render: (text, record) => {
        let classPercent = 0;

        if (
          record.class_percentage !== null &&
          record.class_percentage !== undefined
        ) {
          const parsed = parseFloat(record.class_percentage);
          classPercent = isNaN(parsed) ? 0 : parsed;
        }
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {text === "Form Pending" ? (
              <div>
                <Button className="customers_status_formpending_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Finance" ? (
              <div>
                <Button className="customers_status_awaitfinance_button">
                  Payment Verify
                </Button>
              </div>
            ) : text === "Awaiting Verify" || text === "Hold" ? (
              <div>
                <Button className="customers_status_awaitverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer" ? (
              <div>
                <Button className="customers_status_awaittrainer_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer Verify" ? (
              <div>
                <Button className="customers_status_awaittrainerverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Trainer Approval" ? (
              <div>
                <Button className="customers_status_trainerapproval_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Class" ? (
              <div>
                <Button className="customers_status_awaitingclass_button">
                  {text}
                </Button>
              </div>
            ) : text === "Class Scheduled" ? (
              <div>
                <Button className="customers_status_classscheduled_button">
                  {text}
                </Button>
              </div>
            ) : text === "Passedout process" ? (
              <div>
                <Button className="customers_status_awaitfeedback_button">
                  {text}
                </Button>
              </div>
            ) : text === "Completed" ? (
              <div>
                <Button className="customers_status_completed_button">
                  {text}
                </Button>
              </div>
            ) : text === "Rejected" ||
              text === "REJECTED" ||
              text === "Trainer Rejected" ||
              text === "Payment Rejected" ||
              text === "Escalated" ||
              text === "Hold" ||
              text === "Partially Closed" ||
              text === "Discontinued" ||
              text === "Videos Given" ||
              text === "Refund" ? (
              <Button className="trainers_rejected_button">{text}</Button>
            ) : text === "Class Going" ? (
              <div style={{ display: "flex", gap: "12px" }}>
                <Button className="customers_status_classgoing_button">
                  {text}
                </Button>

                <p className="customer_classgoing_percentage">{`${parseFloat(
                  classPercent,
                )}%`}</p>
              </div>
            ) : (
              <p style={{ marginLeft: "6px" }}>-</p>
            )}
            {record.status === "Form Pending" && (
              <Tooltip
                placement="top"
                title="Copy form link"
                trigger={["hover", "click"]}
              >
                <FaRegCopy
                  size={14}
                  className="customers_formlink_copybutton"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${
                        import.meta.env.VITE_EMAIL_URL
                      }/customer-registration/${record.id}`,
                    );
                    CommonMessage("success", "Link Copied");
                    console.log("Copied: eeee");
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Details",
      key: "details",
      dataIndex: "details",
      fixed: "right",
      width: 100,
      render: (text, record) => {
        return {
          children: (
            <div className="trainers_actionbuttonContainer">
              <Tooltip
                placement="top"
                title="View Candidate Details"
                trigger={["hover", "click"]}
              >
                <FaRegEye
                  size={15}
                  className="trainers_action_icons"
                  onClick={() => {
                    setIsOpenDetailsDrawer(true);
                    setCustomerId(record.id);
                  }}
                  style={{
                    visibility: record.rowSpan !== 0 ? "visible" : "hidden",
                  }}
                />
              </Tooltip>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  justifyContent: "center",
                }}
              >
                <Tooltip
                  placement="left"
                  title="View Candidate Track"
                  trigger={["hover", "click"]}
                >
                  <LuFileClock
                    size={15}
                    className="trainers_action_icons"
                    style={{ cursor: "pointer", marginLeft: "4px" }}
                    onClick={() => {
                      setIsOpenCustomerHistoryDrawer(true);
                      setCustomerId(record.id);
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          ),
          // props: { rowSpan: flatRecord.rowSpan },
        };
      },
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);
  const [placementCustomersData, setPlacementCustomersData] = useState([]);

  useEffect(() => {
    customerDetailsLoadingRef.current = customerDetailsLoading;
  }, [customerDetailsLoading]);

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const userId = convertAsJson?.user_id;

    setLoginUserId(userId);
    getTechnologiesData();
    if (userId) {
      getTableColumnsData(userId);
    }
  }, [permissions]);

  const getTechnologiesData = async () => {
    try {
      const response = await getTechnologies();
      setTechnologiesData(response?.data?.data || []);
    } catch (error) {
      setTechnologiesData([]);
      console.log("response status error", error);
    }
  };

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
      fetchPlacementSupportData({
        startDate: PreviousAndCurrentDate[0],
        endDate: PreviousAndCurrentDate[1],
        searchvalue: null,
        technology: null,
        bucket: null,
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

  const fetchPlacementSupportData = (overrides = {}) => {
    getPlacementSupportCustomersData(
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
      overrides.bucket !== undefined ? overrides.bucket : modeStatus,
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId,
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId,
      overrides.downliners !== undefined ? overrides.downliners : allDownliners,
      overrides.pageNumber !== undefined
        ? overrides.pageNumber
        : pagination?.page || 1,
      overrides.limit !== undefined ? overrides.limit : pagination?.limit || 10,
      overrides.status !== undefined
        ? overrides.status
        : trainerSubbucketStatus
          ? trainerSubbucketStatus
          : status,
      overrides.classGoingSubBucketStatus !== undefined
        ? overrides.classGoingSubBucketStatus
        : classGoingSubBucketStatus,
    );
  };

  const getPlacementSupportCustomersData = async (
    startDate,
    endDate,
    searchvalue,
    technology,
    bucket,
    regionId,
    branchId,
    downliners,
    pageNumber,
    limit,
    customerStatus,
    class_going_sub_bucket_status,
  ) => {
    setLoading(true);
    const payload = {
      ...(searchvalue && { search_filter: searchvalue }),
      ...(technology && technology.length >= 1
        ? { course_ids: technology }
        : {}),
      from_date: startDate,
      to_date: endDate,
      ...(bucket && { bucket: bucket }),
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      ...(customerStatus && { status: customerStatus }),
      ...(class_going_sub_bucket_status &&
        customerStatus === "Class Going" && {
          class_going_sub_bucket: class_going_sub_bucket_status,
        }),
      user_ids: downliners,
      page: pageNumber,
      limit: limit,
    };

    try {
      const response = await getPlacementSupport(payload);
      console.log("placement response", response);
      const customers = response?.data?.data?.customers || [];
      const pagination = response?.data?.data?.pagination;

      setPlacementCustomersData(customers);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
      setAllAdmissionsRegionCounts({
        total_count: response?.data?.data?.total_count || 0,
        chennai_region: response?.data?.data?.chennai_region || 0,
        bangalore_region: response?.data?.data?.bangalore_region || 0,
        hub_region: response?.data?.data?.hub_region || 0,
        online_mode: response?.data?.data?.online_mode || 0,
        classroom_mode: response?.data?.data?.classroom_mode || 0,
      });
      setCustomerStatusCount(
        response?.data?.data?.customer_status_count || null,
      );
      setClassGoingCounts(response?.data?.data?.class_going_sub_bucket || null);
    } catch (error) {
      setPlacementCustomersData([]);
      console.log("get placement error", error);
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

      const filterPage = data.find((f) => f.page_name === "Placement Support");
      console.log("filterPage", filterPage);
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
              title: original.title,
              width: original.width,
              fixed: original.fixed,
              hidden: original.hidden,
              render: original.render,
              group: original.group,
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

    const serializableColumns = columns.map((col) => ({
      key: col.key,
      dataIndex: col.dataIndex,
      width: col.width,
      group: col.group,
      fixed: col.fixed,
      isChecked: col.isChecked,
    }));

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Placement Support",
      column_names: serializableColumns,
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
    setCustomerDetailsLoading(customer_Id);

    try {
      const response = await getCustomerById(customer_Id);
      console.log("particular customer response", response);
      const customer_details = response?.data?.data;
      setCustomerDetails(customer_details);
      setIsOpenCustomerDetailsModal(true);
      setCustomerDetailsLoading("");
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
      setCustomerDetailsLoading("");
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    fetchPlacementSupportData({
      pageNumber: page,
      limit: limit,
    });
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
      fetchPlacementSupportData({
        searchvalue: null,
        pageNumber: 1,
      });
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchPlacementSupportData({
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
      fetchPlacementSupportData({
        downliners: downliners_ids,
        pageNumber: 1,
      });
    } catch (error) {
      console.log("all downlines error", error);
    }
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

    fetchPlacementSupportData({
      technology: value,
      pageNumber: 1,
    });
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

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setIsOpenFilterDrawer(false);
    setCustomerDetails(null);
  };

  const handleRefresh = () => {
    setSearchValue("");
    setSelectedUserId([]);
    prevSelectedUserIdRef.current = "[]";
    prevSelectedTechnologyRef.current = "[]";
    setSelectedTechnology(null);
    setModeStatus("");
    setStatus("");
    setIsSwap(false);
    setTrainerSubbucketsStatus("");
    setClassGoingSubBucketStatus("");
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setSubUsers(downlineUsers);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
    });
    getAllDownlineUsersData(null, true);
  };

  return (
    <div>
      <div className="admissions_overall_header">
        <div className="admissions_overall_indicator"></div>

        <div className="admissions_overall_content">
          <span className="admissions_overall_label">OverAll</span>

          <span className="admissions_overall_count">
            {allAdmissionsRegionCounts?.total_count ?? 0}
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
          <Row gutter={[12, 12]} align="middle" wrap={false}>
            {/* Search */}
            <Col flex="1 1 180px">
              <div
                className="overallduecustomers_filterContainer"
                style={{ marginBottom: 0 }}
              >
                <CommonOutlinedInput
                  label="Search..."
                  width="100%"
                  height="32px"
                  labelFontSize="11px"
                  icon={
                    searchValue ? (
                      <div
                        className="users_filter_closeIconContainer"
                        onClick={() => {
                          setSearchValue("");
                          setPagination({ page: 1 });
                          fetchPlacementSupportData({
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

            {/* Large screen: Technology, Region, Branch and User */}
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
                      {/* Keep your existing Select Region component here */}
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
                          setPagination({ page: 1 });

                          fetchPlacementSupportData({
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
                      {/* Keep your existing Select Branch component here */}
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
                          setPagination({ page: 1 });

                          fetchPlacementSupportData({
                            branchId: value,
                            downliners: defaultAllDownliners,
                            pageNumber: 1,
                          });
                        }}
                        value={selectedBranchId}
                        disableClearable={false}
                        disabled={selectedRegionId == 3}
                      />
                    </Col>

                    <Col flex="1 1 150px">
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

            {/* Date Picker */}
            <Col flex="1 1 240px">
              <CommonMuiCustomDatePicker
                width="100%"
                dateFontSize="12.5px"
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({ page: 1 });
                  fetchPlacementSupportData({
                    startDate: dates[0],
                    endDate: dates[1],
                    pageNumber: 1,
                  });
                }}
              />
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
                                  setPagination({ page: 1 });

                                  fetchPlacementSupportData({
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
                                  setPagination({ page: 1 });

                                  fetchPlacementSupportData({
                                    branchId: value,
                                    downliners: defaultAllDownliners,
                                    pageNumber: 1,
                                  });
                                }}
                                value={selectedBranchId}
                                disableClearable={false}
                                disabled={selectedRegionId == 3}
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

        {/* Existing actions */}
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

      {/* <div
        className="customers_scroll_wrapper"
        style={{ marginTop: "12px", marginBottom: "0px" }}
      >
     
      </div> */}

      <Row style={{ marginTop: "18px" }}>
        <Col span={8} style={{ display: "flex", alignItems: "center" }}>
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
                setPagination({
                  page: 1,
                });
                fetchPlacementSupportData({
                  bucket: "Online",
                  pageNumber: 1,
                });
              }}
            >
              <p>
                Online {`( ${allAdmissionsRegionCounts?.online_mode ?? 0} )`}
              </p>
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
                setPagination({
                  page: 1,
                });
                fetchPlacementSupportData({
                  bucket: "Classroom",
                  pageNumber: 1,
                });
              }}
            >
              <p>
                Classroom{" "}
                {`( ${allAdmissionsRegionCounts?.classroom_mode ?? 0} )`}
              </p>
            </div>
          </div>
        </Col>
        {permissions.includes("Show Region Summary") && (
          <Col
            span={16}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <div
              className="livelead_today_summary_container"
              style={{ marginTop: "0px" }}
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

              <div className="livelead_badge_item total">
                <div
                  className="livelead_badge_dot"
                  style={{ backgroundColor: "#5b69ca" }}
                />
                <p className="livelead_badge_text">
                  Total{" "}
                  <span className="livelead_badge_count">
                    {(allAdmissionsRegionCounts?.hub_region ?? 0) +
                      (allAdmissionsRegionCounts?.chennai_region ?? 0) +
                      (allAdmissionsRegionCounts?.bangalore_region ?? 0)}
                  </span>
                </p>
              </div>
            </div>
          </Col>
        )}
      </Row>

      {/* Status Buckets */}
      <div
        className="customers_scroll_wrapper"
        style={{
          flex: "0 1 auto",
          width: "auto",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "12px",
          marginBottom: "0px",
        }}
      >
        <button
          onClick={() => scroll(-600)}
          className="customer_statusscroll_button"
          style={{
            flexShrink: 0,
          }}
        >
          <IoMdArrowDropleft size={25} />
        </button>
        <div
          className="customers_status_mainContainer"
          ref={scrollRef}
          style={{
            flex: "0 1 auto",
            minWidth: 0,
          }}
        >
          {statusBuckets.map((config, index) => {
            // PAYMENT VERIFY / PAYMENT REJECTED
            if (config.type === "payment") {
              const isPaymentRejected = isSwap;

              const paymentLabel = isPaymentRejected
                ? "Payment Rejected"
                : "Payment Verify";

              const paymentCount = isPaymentRejected
                ? customerStatusCount?.payment_rejected
                : customerStatusCount?.awaiting_finance;

              const isPaymentActive =
                status === "Awaiting Finance" || status === "Payment Rejected";

              const activeClass = isPaymentRejected
                ? "customers_active_paymentreject_container"
                : "customers_active_awaitfinance_container";

              const inactiveClass = isPaymentRejected
                ? "customers_paymentreject_container"
                : "customers_awaitfinance_container";

              return (
                <div
                  key={index}
                  className={isPaymentActive ? activeClass : inactiveClass}
                  onClick={handlePaymentStatusClick}
                >
                  <p>
                    {paymentLabel} ({paymentCount ?? "-"})
                  </p>

                  <MdOutlineSwapVert
                    size={19}
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.3s ease",
                      transform: isSwap ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                    onClick={handlePaymentSwap}
                  />
                </div>
              );
            }

            // NORMAL BUCKETS
            const isActive = status === config.value;

            const count = customerStatusCount?.[config.countKey] ?? "-";

            return (
              <div
                key={config.value || index}
                className={isActive ? config.activeClass : config.inactiveClass}
                onClick={() => handleBucketClick(config)}
              >
                <p>{`${config.label} (${count})`}</p>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => scroll(600)}
          className="customer_statusscroll_button"
          style={{
            flexShrink: 0,
          }}
        >
          <IoMdArrowDropright size={25} />
        </button>
      </div>

      {status === "assign_trainer" && (
        <Row
          style={{
            marginTop: "12px",
            marginBottom: "24px",
            gap: "12px",
            paddingLeft: "12px",
          }}
        >
          {trainerSubbucketConfigs.map((config) => {
            const isActive = trainerSubbucketStatus === config.value;

            const count = customerStatusCount?.[config.countKey] ?? "-";

            return (
              <div
                key={config.value}
                className={isActive ? config.activeClass : config.inactiveClass}
                onClick={() => handleTrainerSubbucketClick(config)}
              >
                <p className="customers_verify_trainer_label">
                  <span className="customers_verify_trainer_text">
                    {`${config.label} `}

                    {config.role && (
                      <span
                        className={
                          config.role === "RM"
                            ? "customers_rm_label"
                            : "customers_cfo_label"
                        }
                      >
                        ({config.role})
                      </span>
                    )}
                  </span>

                  <span
                    className={
                      config.role ? "customers_verify_trainer_count" : ""
                    }
                    style={
                      config.label === "Trainer Approval" ||
                      config.label === "Approval Rejected"
                        ? { marginLeft: "36px" }
                        : config.label === "Awaiting Trainer" ||
                            config.label === "Trainer Rejected"
                          ? { marginLeft: "3px" }
                          : {}
                    }
                  >
                    {`( ${count} )`}
                  </span>
                </p>
              </div>
            );
          })}
        </Row>
      )}

      {status === "Class Going" && (
        <Row
          style={{
            marginTop: "12px",
            marginBottom: "24px",
            gap: "12px",
            paddingLeft: "12px",
          }}
        >
          {classGoingSubbucketConfigs.map((config) => {
            const isActive = classGoingSubBucketStatus === config.value;

            const count = classGoingCounts?.[config.countKey] ?? 0;

            return (
              <div
                key={config.value}
                className={isActive ? config.activeClass : config.inactiveClass}
                onClick={() => handleClassGoingSubbucketClick(config)}
                style={{
                  cursor: "pointer",
                }}
              >
                <p>
                  {config.label} ({count})
                </p>
              </div>
            );
          })}
        </Row>
      )}

      <div
        style={{
          marginTop:
            status === "assign_trainer" || status === "Class Going"
              ? "12px"
              : "16px",
        }}
      >
        <CommonTable
          // scroll={{ x: 2350 }}
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={tableColumns}
          dataSource={placementCustomersData}
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
                  page_name: "Placement Support",
                  column_names: columns,
                };
                fetchPlacementSupportData({});
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

      {/* customer history drawer */}
      <CustomerHistory
        customerId={customerId}
        isOpen={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setCustomerId(null);
        }}
      />
    </div>
  );
}
