import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Button, Tooltip, Checkbox, Drawer, Divider } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import CommonSelectField from "../Common/CommonSelectField";
import { FaRegCopy } from "react-icons/fa6";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import CommonTable from "../Common/CommonTable";
import { FiFilter } from "react-icons/fi";
import { RedoOutlined } from "@ant-design/icons";
import { LuFileClock } from "react-icons/lu";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  addressValidator,
  formatToBackendIST,
  getCurrentandLast90Date,
  getPreviousYearDec26ToCurrentYearDec25,
  regionOptions,
} from "../Common/Validation";
import {
  getAllDownlineUsers,
  getBranches,
  getCustomerById,
  getServerHistory,
  getServerRequest,
  getTableColumns,
  getUsers,
  inserCustomerTrack,
  sendNotification,
  updateServerStatus,
  updateTableColumns,
} from "../ApiService/action";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { BsPatchCheckFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import "./styles.css";
import ServerUpdateDetails from "../Server/ServerUpdateDetails";
import ServerApproval from "../Server/ServerApproval";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonDnd from "../Common/CommonDnd";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import OverflowTooltip from "../Common/OverflowTooltip";
import CustomerOverviewSkeleton from "../Customers/CustomerOverviewSkeleton";
import CustomerOverview from "../Customers/CustomerOverview";
import CandidateNumberWithWhatsApp from "../Common/CandidateNumberWithWhatsApp";
import ViewServerDetails from "../Server/ViewServerDetails";
import CustomerHistory from "../Customers/CustomerHistory";
import ServerIssue from "../Server/ServerIssue";

export default function Server({ setServerCount }) {
  const scrollRef = useRef();
  const mounted = useRef(false);
  const location = useLocation();
  const serverUpdateDetailsRef = useRef();
  const serverVerifyRef = useRef();
  const serverApproveRef = useRef();
  const serverIssueRef = useRef();

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };
  //permissions
  const childUsers = useSelector((state) => state.childusers);
  const permissions = useSelector((state) => state.userpermissions);
  const downlineUsers = useSelector((state) => state.downlineusers);
  //filter usestates
  const statusBuckets = [
    {
      label: "Awaiting Approval",
      value: "Awaiting Approval",
      countKey: "awaiting_approval",
      activeClass: "customers_active_classschedule_container",
      inactiveClass: "customers_classschedule_container",
    },
    {
      label: "Approved",
      value: "Approved",
      countKey: "server_approved",
      activeClass: "customers_active_classgoing_container",
      inactiveClass: "customers_classgoing_container",
    },
  ];
  const [status, setStatus] = useState("Awaiting Approval");
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [regionCounts, setRegionCounts] = useState(null);
  const [statusCount, setStatusCount] = useState(null);
  //datas usestates
  const [serverData, setServerData] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  const [isStatusUpdateDrawerLoading, setIsStatusUpdateDrawerLoading] =
    useState(false);
  const [loading, setLoading] = useState(true);
  //view drawer
  const [isOpenViewDrawer, setIsOpenViewDrawer] = useState(false);
  //drawer usestates
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState("");
  const [serverDetails, setServerDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  //lead executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const prevSelectedUserIdRef = useRef("[]");
  const [allDownliners, setAllDownliners] = useState([]);
  const [defaultAllDownliners, setDefaultAllDownliners] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  //customer history usestates
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [selectedHistoryCustomerId, setSelectedHistoryCustomerId] =
    useState(null);
  //table dnd
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [updateTableId, setUpdateTableId] = useState(null);
  const [checkAll, setCheckAll] = useState(false);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const nonChangeColumns = [
    {
      title: "Joined On",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 100,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Raise Date",
      key: "server_raise_date",
      dataIndex: "server_raise_date",
      width: 120,
      render: (text) => {
        return (
          <EllipsisTooltip
            text={text ? moment(text).format("DD/MM/YYYY hh:mm A") : "-"}
          />
        );
      },
    },
    {
      title: "Server Name",
      key: "server_name",
      dataIndex: "server_name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Server Cost",
      key: "server_cost",
      dataIndex: "trans_details",
      width: 100,
      render: (text, record) => {
        const serverCost = record.trans_details?.[0]?.server_cost;

        return <EllipsisTooltip text={serverCost ? `₹${serverCost}` : "-"} />;
      },
    },
    {
      title: "Duration",
      key: "requested_duration",
      dataIndex: "requested_duration",
      width: 90,
      render: (text) => {
        return <p>{text ? `${text} Days` : "-"}</p>;
      },
    },
    {
      title: "Vendor",
      key: "vendor_id",
      dataIndex: "trans_details",
      width: 80,
      render: (text, record) => {
        const vendor = record.trans_details?.[0]?.vendor_id;

        return <EllipsisTooltip text={vendor ? `${vendor}` : "-"} />;
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
      title: "Balance",
      key: "balance_amount",
      dataIndex: "balance_amount",
      width: 95,
      render: (text) => {
        const amount = Number(text);

        return (
          <p
            style={{
              color: amount === 0 ? "green" : "#D32F2F",
              margin: 0,
              fontWeight: 700,
            }}
          >
            {text !== null && text !== undefined
              ? amount.toLocaleString("en-IN")
              : "-"}
          </p>
        );
      },
    },
    {
      title: "Sale Executive",
      key: "created_by",
      dataIndex: "created_by",
      width: 110,
      render: (text, record) => {
        const salse_executive = `${record.created_by_view_user_id} - ${text}`;
        return (
          <div style={{ textAlign: "center", width: "100%" }}>
            <OverflowTooltip
              title={salse_executive}
              children={record.created_by_view_user_id}
            />
          </div>
        );
      },
    },
    {
      title: "Last Updated At",
      key: "last_updated_at",
      dataIndex: "last_updated_at",
      width: 120,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Candidate Status",
      key: "customer_status",
      dataIndex: "customer_status",
      fixed: "right",
      width: 160,
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
            {text === "Form Pending" || text === "Refunded" ? (
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
            ) : text === "Awaiting Verify" ||
              text === "Hold" ||
              text === "Refund Ready to Pay" ? (
              <div>
                <Button className="customers_status_awaitverify_button">
                  {text === "Refund Ready to Pay" ? "Ready for Refund" : text}
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
            ) : text === "Awaiting Class" || text === "Refund Request" ? (
              <div>
                <Button className="customers_status_awaitingclass_button">
                  {text === "Refund Request" ? "Refund Requested" : text}
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
              text === "Partially Closed" ||
              text === "Discontinued" ||
              text === "Videos Given" ||
              text === "Refund" ? (
              <Button className="trainers_rejected_button">{text}</Button>
            ) : text === "Demo Completed" ? (
              <Button className="customers_status_classgoing_button">
                Only Demo
              </Button>
            ) : text === "Videos Given" ? (
              <Button className="customers_status_videos_given_button">
                Self-Paced
              </Button>
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
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: 100,
      fixed: "right",
      render: (text, record) => {
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {record.status === "Awaiting Approval" ? (
              <div>
                <Tooltip
                  placement="top"
                  title="Click to Approve"
                  trigger={["hover", "click"]}
                >
                  <Button
                    className="customers_status_classscheduled_button"
                    onClick={() => {
                      if (!permissions.includes("Server Approve")) {
                        CommonMessage("error", "Access Denied");
                        return;
                      }
                      setIsOpenDetailsDrawer(true);
                      setDrawerStatus("Approve");
                      setServerDetails(record);
                      getCustomerData(record.customer_id);
                    }}
                  >
                    Approve
                  </Button>
                </Tooltip>
              </div>
            ) : (
              <Tooltip
                placement="top"
                title="Click to Issue"
                trigger={["hover", "click"]}
              >
                <Button
                  className="customers_status_completed_button"
                  onClick={() => {
                    if (!permissions.includes("Server Issue")) {
                      CommonMessage("error", "Access Denied");
                      return;
                    }
                    setIsOpenDetailsDrawer(true);
                    setDrawerStatus("Issue");
                    setServerDetails(record);
                    getCustomerData(record.customer_id);
                  }}
                >
                  Issue
                </Button>
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
        return (
          <div className="trainers_actionbuttonContainer">
            <FaRegEye
              size={15}
              className="trainers_action_icons"
              onClick={() => {
                setIsOpenViewDrawer(true);
                setServerDetails(record);
                getCustomerData(record.customer_id);
              }}
            />

            <Tooltip
              placement="top"
              title="View Candidate History"
              trigger={["hover", "click"]}
            >
              <LuFileClock
                size={15}
                className="trainers_action_icons"
                onClick={() => {
                  setSelectedHistoryCustomerId(record?.customer_id);
                  setIsOpenCustomerHistoryDrawer(true);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      const PreviousAndCurrentDate = getCurrentandLast90Date();
      setSelectedDates(PreviousAndCurrentDate);
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setLoginUserId(convertAsJson?.user_id);
      getAllDownlineUsersData(convertAsJson?.user_id);
    }
  }, [childUsers]);

  useEffect(() => {
    const triggerRefresh = () => handleRefresh();
    window.addEventListener("refreshServerTab", triggerRefresh);
    return () => window.removeEventListener("refreshServerTab", triggerRefresh);
  });

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    setLoginUserId(convertAsJson?.user_id);
    setTimeout(() => {
      getTableColumnsData(convertAsJson?.user_id);
    }, 300);

    setTableColumns(nonChangeColumns);
  }, [permissions]);

  const getAllDownlineUsersData = async (user_id, isRefresh = false) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setDefaultAllDownliners(downliners_ids);
      const PreviousYearDec26ToCurrentDate =
        getPreviousYearDec26ToCurrentYearDec25();
      setSelectedDates(PreviousYearDec26ToCurrentDate);
      fetchServerRequestsData({
        startDate: PreviousYearDec26ToCurrentDate[0],
        endDate: PreviousYearDec26ToCurrentDate[1],
        dateType: "Raise Date",
        regionId: null,
        branchId: null,
        downliners: downliners_ids,
        serverStatus: "Awaiting Approval",
        searchvalue: null,
        pageNumber: 1,
        limit: 10,
      });
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const fetchServerRequestsData = (overrides = {}) => {
    getServerRequestData(
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null,
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null,
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId,
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId,
      overrides.downliners !== undefined ? overrides.downliners : allDownliners,
      overrides.serverStatus !== undefined ? overrides.serverStatus : status,
      overrides.searchvalue !== undefined ? overrides.searchvalue : searchValue,
      overrides.pageNumber !== undefined
        ? overrides.pageNumber
        : pagination?.page || 1,
      overrides.limit !== undefined ? overrides.limit : pagination?.limit || 10,
    );
  };

  const getServerRequestData = async (
    startDate,
    endDate,
    regionId,
    branchId,
    downliners,
    serverStatus,
    searchvalue,
    pageNumber,
    limit,
  ) => {
    setLoading(true);
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      start_date: startDate,
      end_date: endDate,
      type: "Raise Date",
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      ...(converAsJson?.user_id == "BNG9001" ? {} : { user_ids: downliners }),
      ...(serverStatus && serverStatus == "Server Raised"
        ? {
            status: [
              "Server Raised",
              "Verification Rejected",
              "Approval Rejected",
            ],
          }
        : { status: serverStatus }),
      ...(searchvalue && { search_filter: searchvalue }),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getServerRequest(payload);
      console.log("server response", response);
      setServerData(response?.data?.data?.data || []);
      setRegionCounts(response?.data?.data?.region_count || null);

      const status_counts = response?.data?.data?.statusCount || null;

      setStatusCount(status_counts);

      setServerCount(
        Number(status_counts?.awaiting_approval || 0) +
          Number(status_counts?.server_approved || 0),
      );

      const pagination = response?.data?.data?.pagination;
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
    } catch (error) {
      setServerData([]);
      setStatusCount(null);
      setRegionCounts(null);
      console.log("get server error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
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

      const filterPage = data.find((f) => f.page_name === "Accounts Server");

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
      page_name: "Accounts Server",
      column_names: columns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      fetchServerRequestsData({
        searchvalue: e.target.value,
        pageNumber: 1,
      });
    }, 300);
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
      fetchServerRequestsData({
        downliners: downliners_ids,
        pageNumber: 1,
      });
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const handleBucketClick = (config) => {
    if (status === config.value) {
      return;
    }

    const extraOverrides = config.onClick?.() || {};

    const overrides = {
      serverStatus: config.value,
      pageNumber: 1,
      ...extraOverrides,
    };

    setStatus(config.value);
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    fetchServerRequestsData(overrides);
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

  const handlePaginationChange = ({ page, limit }) => {
    fetchServerRequestsData({
      pageNumber: page,
      limit: limit,
    });
  };

  const getCustomerData = async (customer_id) => {
    setIsStatusUpdateDrawerLoading(true);
    try {
      const response = await getCustomerById(customer_id);
      console.log("customer details", response);
      const customer_details = response?.data?.data || null;
      setCustomerDetails(customer_details);
      setIsStatusUpdateDrawerLoading(false);
    } catch (error) {
      setIsStatusUpdateDrawerLoading(false);
      setCustomerDetails(null);
      console.log("customer details error", error);
    }
  };

  const handleStatusMismatch = () => {
    CommonMessage("error", "Status Mismatch. Contact Support Team");
  };

  const drawerReset = () => {
    setDrawerStatus("");
    setIsOpenDetailsDrawer(false);
    setIsOpenViewDrawer(false);
    setServerDetails(null);
    setButtonLoading(false);
    setCustomerDetails(null);
  };

  const handleSelectedRow = (row) => {
    console.log("selected rowwww", row);
    setSelectedRows(row);
    const keys = row.map((item) => item.id); // or your unique row key
    setSelectedRowKeys(keys);
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getPreviousYearDec26ToCurrentYearDec25();
    setSearchValue("");
    setSelectedUserId([]);
    prevSelectedUserIdRef.current = "[]";
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setSubUsers(downlineUsers);
    setSelectedDates(PreviousAndCurrentDate);
    setStatus("Awaiting Approval");
    setPagination({
      page: 1,
    });
    getAllDownlineUsersData(loginUserId, true);
  };

  const filteredTableColumns = useMemo(() => {
    if (status === "Requested" || status === "") {
      const hiddenKeys = [
        "server_raise_date",
        "server_name",
        "server_cost",
        "duration",
        "vendor_id",
      ];

      return tableColumns.filter(
        (col) =>
          !hiddenKeys.includes(col.key) && !hiddenKeys.includes(col.dataIndex),
      );
    }

    if (status === "Server Raised") {
      const hiddenKeys = ["server_name", "server_cost", "vendor_id"];

      return tableColumns.filter(
        (col) =>
          !hiddenKeys.includes(col.key) && !hiddenKeys.includes(col.dataIndex),
      );
    }

    return tableColumns;
  }, [tableColumns, status]);

  return (
    <div>
      <Row style={{ marginBottom: "12px" }} align="middle">
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
                <CommonOutlinedInput
                  label={"Candidate Search..."}
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
                          fetchServerRequestsData({
                            searchvalue: "",
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
                  style={{
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                  onChange={handleSearch}
                  value={searchValue}
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
                        limit: pagination.limit,
                      });
                      fetchServerRequestsData({
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
                        limit: pagination.limit,
                      });
                      fetchServerRequestsData({
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
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "nowrap",
                  width: "100%",
                }}
              >
                <div style={{ flex: 1 }}>
                  <CommonMuiCustomDatePicker
                    width="100%"
                    value={selectedDates}
                    onDateChange={(dates) => {
                      setSelectedDates(dates);
                      setPagination({
                        page: 1,
                      });
                      fetchServerRequestsData({
                        startDate: dates[0],
                        endDate: dates[1],
                        pageNumber: 1,
                      });
                    }}
                  />
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
          }}
        >
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ marginRight: "16px", cursor: "pointer" }}
            onClick={() => {
              setIsOpenFilterDrawer(true);
              getTableColumnsData(loginUserId);
            }}
          />
        </Col>
      </Row>

      <div className="customers_scroll_wrapper" style={{ marginBottom: "8px" }}>
        <div className="customers_status_mainContainer" ref={scrollRef}>
          {" "}
          {statusBuckets.map((config, index) => {
            const isActive = status === config.value;

            const count = statusCount?.[config.countKey] ?? "-";
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
      </div>

      {permissions.includes("Show Region Summary") ? (
        <Row style={{ position: "relative" }}>
          <Col span={12}>
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
                    {regionCounts?.hub_region ?? 0}
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
                    {regionCounts?.chennai_region ?? 0}
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
                    {regionCounts?.bangalore_region ?? 0}
                  </span>
                </p>
              </div>
            </div>
          </Col>
          <Col
            span={12}
            style={{
              marginTop: "12px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              className={
                selectedRowKeys.length >= 1
                  ? "show_server_total_container"
                  : "server_total_container"
              }
            >
              <div className="server_total_card">
                <p className="server_total_label">
                  Selected Total
                  {selectedRows.length > 0 && (
                    <span className="server_total_selected_badge">
                      {selectedRows.length}
                    </span>
                  )}
                  :
                </p>
                <p className="server_total_value">
                  {"₹" +
                    selectedRows
                      .reduce(
                        (acc, row) => acc + (Number(row.server_cost) || 0),
                        0,
                      )
                      .toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        <div
          className={
            selectedRowKeys.length >= 1
              ? "show_server_total_container"
              : "server_total_container"
          }
          style={{
            ...(selectedRowKeys.length <= 0 && { height: "20px" }),
          }}
        >
          <div className="server_total_card">
            <p className="server_total_label">
              Selected Total
              {selectedRows.length > 0 && (
                <span className="server_total_selected_badge">
                  {selectedRows.length}
                </span>
              )}
              :
            </p>
            <p className="server_total_value">
              {"₹" +
                selectedRows
                  .reduce((acc, row) => acc + (Number(row.server_cost) || 0), 0)
                  .toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: permissions.includes("Show Region Summary")
            ? "8px"
            : "0px",
        }}
      >
        <CommonTable
          // scroll={{ x: 1200 }}
          scroll={{
            x: filteredTableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={filteredTableColumns}
          dataSource={serverData}
          loading={loading}
          checkBox={"false"}
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          selectedDatas={handleSelectedRow}
          selectedRowKeys={selectedRowKeys}
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>

      {/* update drawer */}
      <Drawer
        title="Update Status"
        open={isOpenDetailsDrawer}
        onClose={drawerReset}
        width="50%"
        style={{
          position: "relative",
          paddingBottom: drawerStatus == "Approve" ? "0px" : "65px",
        }}
        className="customer_statusupdate_drawer"
      >
        {isStatusUpdateDrawerLoading ? (
          <CustomerOverviewSkeleton />
        ) : (
          <>
            <CustomerOverview customerDetails={customerDetails} />

            <Divider className="customer_statusupdate_divider" />

            <div className="customer_statusupdate_adddetailsContainer">
              {drawerStatus == "Update Details" ? (
                <ServerUpdateDetails
                  ref={serverUpdateDetailsRef}
                  serverDetails={serverDetails}
                  setButtonLoading={setButtonLoading}
                  callgetServerApi={() => {
                    drawerReset();
                    fetchServerRequestsData({});
                  }}
                />
              ) : drawerStatus == "Approve" ? (
                <ServerApproval
                  ref={serverApproveRef}
                  serverDetails={serverDetails}
                  callgetServerApi={() => {
                    drawerReset();
                    fetchServerRequestsData({});
                  }}
                />
              ) : drawerStatus == "Issue" ? (
                <ServerIssue
                  ref={serverIssueRef}
                  serverDetails={serverDetails}
                  setButtonLoading={setButtonLoading}
                  callgetServerApi={() => {
                    drawerReset();
                    fetchServerRequestsData({});
                  }}
                />
              ) : (
                ""
              )}
            </div>

            {/* footer */}
            {drawerStatus == "Approve" ? null : (
              <div className="leadmanager_tablefiler_footer">
                <div className="leadmanager_submitlead_buttoncontainer">
                  {buttonLoading ? (
                    <button className="users_adddrawer_loadingcreatebutton">
                      <CommonSpinner />
                    </button>
                  ) : (
                    <button
                      className="users_adddrawer_createbutton"
                      onClick={
                        drawerStatus == "Update Details"
                          ? () =>
                              serverUpdateDetailsRef.current?.handleUpdateDetails()
                          : drawerStatus == "Verify"
                            ? () =>
                                serverVerifyRef.current?.handleServerVerify()
                            : drawerStatus == "Approve"
                              ? () =>
                                  serverApproveRef.current?.handleServerApprove()
                              : drawerStatus == "Issue"
                                ? () =>
                                    serverIssueRef.current?.handleServerIssue()
                                : handleStatusMismatch
                      }
                    >
                      {drawerStatus == "Update Details"
                        ? "Update"
                        : drawerStatus == "Verify"
                          ? "Verify"
                          : drawerStatus == "Approve"
                            ? "Approve"
                            : drawerStatus == "Issue"
                              ? "Issue"
                              : ""}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Drawer>

      {/* view drawer */}
      <Drawer
        title="Full Details"
        open={isOpenViewDrawer}
        onClose={drawerReset}
        width="50%"
        style={{
          position: "relative",
          paddingBottom: "65px",
        }}
        className="customer_statusupdate_drawer"
      >
        {isStatusUpdateDrawerLoading ? (
          <CustomerOverviewSkeleton />
        ) : (
          <>
            <CustomerOverview customerDetails={customerDetails} />

            <Divider className="customer_statusupdate_divider" />

            <ViewServerDetails serverDetails={serverDetails} />
          </>
        )}
      </Drawer>

      {/* customer history drawer */}
      <CustomerHistory
        customerId={selectedHistoryCustomerId}
        isOpen={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setSelectedHistoryCustomerId(null);
        }}
      />

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
        onClose={() => {
          setIsOpenFilterDrawer(false);
        }}
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
                const visibleColumns = columns
                  .filter((col) => col.isChecked)
                  .map((col) => ({
                    ...col,
                    width: col.width || 150, // fallback width for consistent layout
                  }));
                console.log("visibleColumns", visibleColumns);
                setTableColumns(visibleColumns);
                setIsOpenFilterDrawer(false);

                const payload = {
                  user_id: loginUserId,
                  id: updateTableId,
                  page_name: "Accounts Server",
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
    </div>
  );
}
