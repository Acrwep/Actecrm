import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Tooltip,
  Flex,
  Button,
  Drawer,
  Checkbox,
  Divider,
  Modal,
} from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa";
import { LuFileClock } from "react-icons/lu";
import { SlActionUndo } from "react-icons/sl";
import { RiRefund2Fill } from "react-icons/ri";
import { DownloadOutlined } from "@ant-design/icons";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import {
  formatToBackendIST,
  getPreviousYearDec26ToCurrentYearDec25,
  selectValidator,
} from "../Common/Validation";
import {
  getAllDownlineUsers,
  updateTableColumns,
  getPaymentRecievedList,
  getCustomerById,
  getBranches,
  getUsers,
  getRefundCustomers,
  updateCustomerStatus,
  inserCustomerTrack,
  addRefundCustomers,
  getRefundCustomer,
} from "../ApiService/action";
import { useSelector } from "react-redux";
import CommonTable from "../Common/CommonTable";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonDnd from "../Common/CommonDnd";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonSelectField from "../Common/CommonSelectField";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import OverflowTooltip from "../Common/OverflowTooltip";
import CustomerHistory from "../Customers/CustomerHistory";
import CommonSpinner from "../Common/CommonSpinner";
import CustomerOverviewSkeleton from "../Customers/CustomerOverviewSkeleton";
import CustomerOverview from "../Customers/CustomerOverview";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonInputField from "../Common/CommonInputField";

export default function Refund({
  filterData,
  setReceivedCount,
  allTableColumns,
  refreshTableColumns,
}) {
  const mounted = useRef(false);
  const searchTimeoutRef = useRef(null);
  const [paymentType, setPaymentType] = useState("NEW");
  const [statusCount, setStatusCount] = useState({});
  const [regionCounts, setRegionCounts] = useState(null);

  useEffect(() => {
    if (filterData && mounted.current && allDownliners.length > 0) {
      const startDate = new Date(filterData.startDate);
      const endDate = new Date(filterData.endDate);
      setSelectedDates([startDate, endDate]);
      fetchRefundCustomersData({});
    }
  }, [filterData]);

  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("");
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  const [refundData, setRefundData] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  //verify payment
  const [selectedRefundCustomerDetails, setSelectedRefundCustomerDetails] =
    useState(null);
  const [isStatusUpdateDrawer, setIsStatusUpdateDrawer] = useState(false);
  const [drawerContentStatus, setDrawerContentStatus] = useState("");
  const [isStatusUpdateDrawerLoading, setIsStatusUpdateDrawerLoading] =
    useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loginUserId, setLoginUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  //lead executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const prevSelectedUserIdRef = useRef("[]");
  const [allDownliners, setAllDownliners] = useState([]);
  const [defaultAllDownliners, setDefaultAllDownliners] = useState([]);
  //filter usestates
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  //history and details drawer
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  //approve usestates
  const [isOpenApproveModal, setIsOpenApproveModal] = useState(false);
  const [approveButtonLoading, setApproveButtonLoading] = useState(false);
  // revert usestates
  const [isOpenRevertModal, setIsOpenRevertModal] = useState(false);
  //refund fields usestates
  const [refundAmount, setRefundAmount] = useState("");
  const [refundAmountError, setRefundAmountError] = useState("");
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentDateError, setPaymentDateError] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentModeError, setPaymentModeError] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [transactionIdError, setTransactionIdError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState("");
  //refund completed usestates
  const [refundedDetails, setRefundedDetails] = useState(null);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    overall_refunded_amount: 0,
  });

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
      width: 120,
      render: (text, record) => {
        return (
          <EllipsisTooltip
            text={
              text
                ? `${
                    text
                      ? record.phonecode.startsWith("+")
                        ? record.phonecode
                        : `+${record.phonecode}`
                      : ""
                  } ${text}`
                : "-"
            }
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
      title: "Paid Amount",
      key: "paid_amount",
      dataIndex: "paid_amount",
      width: 120,
      render: (text) => {
        return <p>{text ? `₹${Number(text).toLocaleString("en-IN")}` : "-"}</p>;
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
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: 110,
      fixed: "right",
      render: (text, record) => {
        return {
          children: (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Tooltip
                placement="top"
                title={
                  record?.status === "Refund Request"
                    ? "Click to Approve"
                    : "Click to Pay"
                }
                trigger={["hover", "click"]}
              >
                {record?.status === "Refund Request" ? (
                  <Button
                    className="trainers_pending_button"
                    onClick={() => {
                      if (permissions.includes("Refund Approval")) {
                        setIsOpenApproveModal(true);
                        setSelectedRefundCustomerDetails(record);
                      } else {
                        CommonMessage("error", "Access Denied");
                      }
                    }}
                  >
                    Approve
                  </Button>
                ) : record?.status === "Refund Ready to Pay" ? (
                  <Button
                    className="trainers_verified_button"
                    onClick={() => {
                      if (record?.status == "Refund Ready to Pay") {
                        if (permissions.includes("Refund Completion")) {
                          setSelectedRefundCustomerDetails(record);
                          setIsStatusUpdateDrawer(true);
                          getParticularCustomerDetails(record.id);
                        } else {
                          CommonMessage("error", "Access Denied");
                        }
                      } else {
                        CommonMessage("warning", "Refund not approved yet");
                      }
                    }}
                  >
                    Pay
                  </Button>
                ) : (
                  <p style={{ marginLeft: "6px" }}>-</p>
                )}
              </Tooltip>

              {record?.status === "Refund Ready to Pay" && (
                <Tooltip
                  placement="top"
                  title={"Move to Requested"}
                  trigger={["hover", "click"]}
                >
                  <SlActionUndo
                    size={14}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (
                        permissions.includes("Refund Request") ||
                        permissions.includes("Refund Completion")
                      ) {
                        setIsOpenRevertModal(true);
                        setSelectedRefundCustomerDetails(record);
                      }
                    }}
                  />
                </Tooltip>
              )}
            </div>
          ),
        };
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
                    setSelectedRefundCustomerDetails(record);
                  }}
                  style={{
                    visibility: record.rowSpan !== 0 ? "visible" : "hidden",
                  }}
                />
              </Tooltip>
              {record?.status === "Refunded" &&
                statusRef.current === "Refunded" && (
                  <Tooltip
                    placement="left"
                    title="View Refund Details"
                    trigger={["hover", "click"]}
                  >
                    <RiRefund2Fill
                      size={15}
                      className="trainers_action_icons"
                      style={{ cursor: "pointer", marginLeft: "4px" }}
                      onClick={() => {
                        setSelectedRefundCustomerDetails(record);
                        setIsStatusUpdateDrawer(true);
                        setDrawerContentStatus("View Refund Details");
                        getParticularCustomerDetails(record.id, true);
                      }}
                    />
                  </Tooltip>
                )}
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
                      setSelectedRefundCustomerDetails(record);
                      setIsOpenCustomerHistoryDrawer(true);
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
      page_name: "Refund",
      column_names: defaultColumns || columns,
    };
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  useEffect(() => {
    if (allTableColumns !== null) {
      processTableColumnsData(allTableColumns);
    }
  }, [allTableColumns]);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    if (convertAsJson?.user_id) {
      setLoginUserId(convertAsJson.user_id);
    }
  }, []);

  const processTableColumnsData = (data) => {
    try {
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

      const filterPage = data.find((f) => f.page_name === "Refund");

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

      let filteredBackendColumns = [...(filterPage.column_names || [])];

      const attachRenderFunctions = (cols) => {
        return cols
          .filter((col) => nonChangeColumns.some((c) => c.key === col.key))
          .map((col) => {
            const original = nonChangeColumns.find((c) => c.key === col.key);
            return {
              ...col,
              width: original.width,
              fixed: original.fixed,
              hidden: original.hidden,
              render: original.render,
              sorter: original.sorter,
              sortDirections: original.sortDirections,
            };
          });
      };

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
      console.log("process table columns error", error);
    }
  };

  useEffect(() => {
    const PreviousYearDec26ToCurrentDate =
      getPreviousYearDec26ToCurrentYearDec25();
    const startDate = filterData?.startDate
      ? new Date(filterData.startDate)
      : PreviousYearDec26ToCurrentDate[0];
    const endDate = filterData?.endDate
      ? new Date(filterData.endDate)
      : PreviousYearDec26ToCurrentDate[1];
    setSelectedDates([startDate, endDate]);
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setSubUsers(downlineUsers);
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
      setDefaultAllDownliners(downliners_ids);
      const PreviousYearDec26ToCurrentDate =
        getPreviousYearDec26ToCurrentYearDec25();
      const startDate = filterData?.startDate
        ? new Date(filterData.startDate)
        : PreviousYearDec26ToCurrentDate[0];
      const endDate = filterData?.endDate
        ? new Date(filterData.endDate)
        : PreviousYearDec26ToCurrentDate[1];
      fetchRefundCustomersData({
        startDate: startDate,
        endDate: endDate,
        searchvalue: "",
        regionId: null,
        branchId: null,
        downliners: downliners_ids,
        status: null,
        pageNumber: 1,
        limit: 10,
      });
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const fetchRefundCustomersData = (overrides = {}) => {
    getRefundCustomersData(
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
      overrides.status !== undefined ? overrides.status : status,
      overrides.pageNumber !== undefined
        ? overrides.pageNumber
        : pagination?.page || 1,
      overrides.limit !== undefined ? overrides.limit : pagination?.limit || 10,
    );
  };

  const getRefundCustomersData = async (
    startDate,
    endDate,
    searchvalue,
    regionId,
    branchId,
    downliners,
    status,
    pageNumber,
    limit,
  ) => {
    setLoading(true);

    const from_date = formatToBackendIST(startDate);
    const to_date = formatToBackendIST(endDate);

    const payload = {
      start_date: moment(from_date).format("YYYY-MM-DD"),
      end_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchvalue && { search_filter: searchvalue }),
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      user_ids: downliners,
      ...(status && { status: status }),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getRefundCustomers(payload);
      console.log("refund customers response", response);
      setRefundData(response?.data?.customers || []);
      setRegionCounts(response?.data?.region_counts || null);
      setStatusCount(response?.data?.refund_counts || null);
      const paginations = response?.data?.pagination;

      setPagination({
        page: paginations.page,
        limit: paginations.limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
        overall_refunded_amount: paginations.overall_refunded_amount,
      });
      setLoading(false);
    } catch (error) {
      setRefundData([]);
      setRegionCounts(null);
      setStatusCount(null);
      setLoading(false);
      console.log("refund customers error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    fetchRefundCustomersData({ pageNumber: page, limit: limit });
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
      fetchRefundCustomersData({
        searchvalue: "",
        pageNumber: 1,
        limit: pagination.limit,
      });
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchRefundCustomersData({
        searchvalue: input,
        pageNumber: 1,
        limit: pagination.limit,
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
      fetchRefundCustomersData({ downliners: downliners_ids, pageNumber: 1 });
    } catch (error) {
      console.log("all downlines error", error);
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

  const handlePreview = async (file) => {
    if (file.url) {
      setPreviewImage(file.url);
      setPreviewOpen(true);
      return;
    }
    setPreviewOpen(true);
    const rawFile = file.originFileObj || file;
    const reader = new FileReader();
    reader.readAsDataURL(rawFile);
    reader.onload = () => {
      const dataUrl = reader.result; // Full base64 data URL like "data:image/jpeg;base64,..."
      console.log("urlllll", dataUrl);
      setPreviewImage(dataUrl); // Show in Modal
      setPreviewOpen(true);
    };
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
      console.log("get branches error", error);
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

  //get particular customer full details
  const getParticularCustomerDetails = async (customer_Id, is_refunded) => {
    setIsStatusUpdateDrawerLoading(true);
    try {
      const response = await getCustomerById(customer_Id);
      console.log("particular customer response", response);
      const customer_details = response?.data?.data;
      setCustomerDetails(customer_details);
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    } finally {
      if (is_refunded) {
        getRefundCustomerDetails(customer_Id);
      } else {
        setIsStatusUpdateDrawerLoading(false);
      }
    }
  };

  const getRefundCustomerDetails = async (customer_Id) => {
    try {
      const response = await getRefundCustomer(customer_Id);
      console.log("refund customer response", response);
      setRefundedDetails(response?.data?.data || null);
    } catch (error) {
      console.log("getcustomer by id error", error);
      setRefundedDetails(null);
    } finally {
      setIsStatusUpdateDrawerLoading(false);
    }
  };

  const handleRefund = async () => {
    setValidationTrigger(true);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const refundAmountValidate = selectValidator(refundAmount);
    const paymentDateValidate = selectValidator(paymentDate);
    const paymentModeValidate = selectValidator(paymentMode);
    const transactionIdValidate = selectValidator(transactionId);

    setRefundAmountError(refundAmountValidate);
    setPaymentDateError(paymentDateValidate);
    setPaymentModeError(paymentModeValidate);
    setTransactionIdError(transactionIdValidate);

    if (
      refundAmountValidate ||
      paymentDateValidate ||
      paymentModeValidate ||
      transactionIdValidate
    ) {
      CommonMessage("error", "Please fill all mandatory fields");
      return;
    }

    setApproveButtonLoading(true);

    const payload = {
      customer_id: selectedRefundCustomerDetails?.id,
      refund_amount: refundAmount,
      payment_mode: paymentMode,
      paid_date: formatToBackendIST(paymentDate),
      created_date: formatToBackendIST(new Date()),
      paid_by: convertAsJson?.user_id,
      transaction_id: transactionId,
    };
    try {
      await addRefundCustomers(payload);
      handleCustomerStatus("Refunded");

      formReset();
    } catch (error) {
      setApproveButtonLoading(false);
      console.log("move to refunded error", error);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleCustomerStatus = async (updatestatus, isRevert = false) => {
    setApproveButtonLoading(true);
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const customer_ids = [
      {
        customer_id: selectedRefundCustomerDetails.id,
        status: updatestatus,
        updated_at: formatToBackendIST(new Date()),
        updated_by: converAsJson?.user_id || "",
      },
    ];

    const payload = { customer_ids };
    try {
      await updateCustomerStatus(payload);
      CommonMessage(
        "success",
        isRevert
          ? "Refund Approval Reverted Successfully"
          : updatestatus === "Refund Ready to Pay"
            ? "Refund Approved Successfully"
            : "Moved to Refunded Successfully",
      );
      handleCustomerTrack(isRevert ? "Reverted Refund Approval" : updatestatus);
    } catch (error) {
      setApproveButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleCustomerTrack = async (updatestatus) => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const customers = [
      {
        customer_id: selectedRefundCustomerDetails.id,
        status:
          updatestatus === "Refund Ready to Pay"
            ? "Refund Approved"
            : updatestatus,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(new Date()),
      },
    ];

    const payload = { customers };

    try {
      await inserCustomerTrack(payload);
      formReset();
      fetchRefundCustomersData({});
    } catch (error) {
      setApproveButtonLoading(false);
      console.log("customer track error", error);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    const from_date = formatToBackendIST(selectedDates[0]);
    const to_date = formatToBackendIST(selectedDates[1]);

    const payload = {
      start_date: moment(from_date).format("YYYY-MM-DD"),
      end_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchValue && { search_filter: searchValue }),
      user_ids:
        selectedRegionId || selectedBranchId
          ? defaultAllDownliners
          : allDownliners,
      ...(selectedRegionId && { region_id: selectedRegionId }),
      ...(selectedBranchId && { branch_id: selectedBranchId }),
      ...(paymentType && { payment_type: paymentType }),
    };
    try {
      const response = await getPaymentRecievedList(payload);
      console.log("received payments response", response);
      const download_data = response?.data?.result?.data || [];
      if (download_data.length >= 1) {
        DownloadTableAsCSV(
          download_data,
          nonChangeColumns,
          `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
            selectedDates[1],
          ).format("DD-MM-YYYY")} Refund Customers.csv`,
        );
      } else {
        CommonMessage("error", "No Data Found");
      }
      setDownloadLoading(false);
    } catch (error) {
      setDownloadLoading(false);
      console.log("received payments error", error);
    }
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setIsOpenCustomerHistoryDrawer(false);
    setIsOpenApproveModal(false);
    setIsOpenRevertModal(false);
    setApproveButtonLoading(false);
    setIsStatusUpdateDrawer(false);
    setDrawerContentStatus("");
    setSelectedRefundCustomerDetails(null);
    setCustomerDetails(null);
    setValidationTrigger(false);
    setRefundAmount("");
    setRefundAmountError("");
    setPaymentDate(null);
    setPaymentDateError("");
    setPaymentMode("");
    setPaymentModeError("");
    setTransactionId("");
    setTransactionIdError("");
  };

  const handleRefresh = () => {
    setSearchValue("");
    setSelectedUserId([]);
    prevSelectedUserIdRef.current = "[]";
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setSubUsers(downlineUsers);
    setStatus("");
    const PreviousYearDec26ToCurrentDate =
      getPreviousYearDec26ToCurrentYearDec25();
    setSelectedDates(PreviousYearDec26ToCurrentDate);
    getAllDownlineUsersData(loginUserId);
  };

  useEffect(() => {
    const triggerRefresh = () => handleRefresh();
    window.addEventListener("refreshRefundTab", triggerRefresh);
    return () => window.removeEventListener("refreshRefundTab", triggerRefresh);
  });

  return (
    <div>
      <Row
        style={{
          alignItems: "center",
          marginTop: permissions.includes("Lead Executive Filter")
            ? "22px"
            : "30px",
        }}
      >
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
                  label={"Candidate Search..."}
                  width="100%"
                  height="33px"
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
                          fetchRefundCustomersData({
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
                      setSelectedUserId([]);
                      setPagination({
                        page: 1,
                      });
                      fetchRefundCustomersData({
                        regionId: value,
                        branchId: null,
                        downliners: defaultAllDownliners,
                        page: 1,
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
                      fetchRefundCustomersData({
                        branchId: value,
                        downliners: defaultAllDownliners,
                        page: 1,
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
                    width={"100%"}
                    options={subUsers}
                    onChange={handleSelectUser}
                    onBlur={handleSelectUserBlur}
                    value={selectedUserId}
                  />
                </Col>
              </>
            )}
            <Col flex="1.5 1 0%">
              <div style={{ position: "relative" }}>
                <p className="accounts_datepicket_label">Joining Date</p>
                <CommonMuiCustomDatePicker
                  width="100%"
                  value={selectedDates}
                  onDateChange={(dates) => {
                    setSelectedDates(dates);
                    setPagination({
                      page: 1,
                    });
                    fetchRefundCustomersData({
                      startDate: dates[0],
                      endDate: dates[1],
                      pageNumber: 1,
                    });
                  }}
                />
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
            gap: "12px",
          }}
        >
          {permissions.includes("Download Customers Data") && (
            <Tooltip placement="top" title="Download">
              <Button
                className="dashboard_download_button"
                onClick={handleDownload}
                disabled={downloadLoading}
              >
                <DownloadOutlined className="download_icon" />
              </Button>
            </Tooltip>
          )}
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setIsOpenFilterDrawer(true);
              //   getTableColumnsData(loginUserId);
            }}
          />
        </Col>
      </Row>

      {permissions.includes("Show Region Summary") ? (
        <>
          <Row style={{ marginBottom: "16px" }}>
            <Col
              span={24}
              style={{ display: "flex", gap: "16px", alignItems: "center" }}
            >
              <Flex
                gap="middle"
                wrap="wrap"
                align="center"
                style={{ marginTop: "18px" }}
              >
                {[
                  {
                    label: "Requested",
                    value: "Refund Request",
                    baseColor: "#607d8b",
                    count: statusCount?.refund_request_count || 0,
                  },
                  {
                    label: "Ready to Pay",
                    value: "Refund Ready to Pay",
                    baseColor: "#ffa502",
                    count: statusCount?.refund_ready_to_pay_count || 0,
                  },
                  {
                    label: "Refunded",
                    value: "Refunded",
                    baseColor: "#3c9111",
                    count: statusCount?.refunded_count || 0,
                  },
                ].map((bucket) => {
                  const isActive = status === bucket.value;
                  const baseColor = bucket.baseColor;
                  return (
                    <div
                      key={bucket.label}
                      onClick={() => {
                        if (status == bucket?.value) {
                          return;
                        }
                        setStatus(bucket.value);
                        setPagination({ ...pagination, page: 1 });
                        fetchRefundCustomersData({
                          status: bucket.value,
                          pageNumber: 1,
                        });
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
                      {bucket.label}{" "}
                      {bucket.count !== null && `( ${bucket.count} )`}
                    </div>
                  );
                })}
              </Flex>
            </Col>
          </Row>

          <Row style={{ marginTop: "16px" }}>
            <Col span={12}>
              <div
                className="livelead_today_summary_container"
                style={{ marginTop: "0px" }}
              >
                <p className="livelead_today_label">Region Summary</p>

                <div className="livelead_badge_item online">
                  <div
                    className="livelead_badge_dot"
                    style={{ backgroundColor: "#3c9111" }}
                  />
                  <p className="livelead_badge_text">
                    Hub{" "}
                    <span className="livelead_badge_count">
                      {regionCounts?.hub_region ?? "-"}
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
                      {regionCounts?.chennai_region ?? "-"}
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
                      {regionCounts?.bangalore_region ?? "-"}
                    </span>
                  </p>
                </div>
              </div>
            </Col>

            {status === "Refunded" && (
              <Col
                span={12}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  className="overall_pending_amount_card"
                  style={{
                    padding: "8px 16px",
                    borderLeft: "5px solid #3C9111",
                  }}
                >
                  <span className="overall_pending_amount_label">
                    Total Refunded Amount:
                  </span>
                  <span
                    className="overall_pending_amount_value"
                    style={{ color: "#3C9111" }}
                  >
                    ₹
                    {Number(pagination.overall_refunded_amount)?.toLocaleString(
                      "en-IN",
                    ) || 0}
                  </span>
                </div>
              </Col>
            )}
          </Row>
        </>
      ) : (
        <Row style={{ marginTop: "16px", marginBottom: "16px" }}>
          <Col
            span={12}
            style={{ display: "flex", gap: "16px", alignItems: "center" }}
          >
            <Flex gap="middle" wrap="wrap" align="center">
              {[
                {
                  label: "Requested",
                  value: "Refund Request",
                  baseColor: "#607d8b",
                  count: statusCount?.refund_request_count || 0,
                },
                {
                  label: "Ready to Pay",
                  value: "Refund Ready to Pay",
                  baseColor: "#ffa502",
                  count: statusCount?.refund_ready_to_pay_count || 0,
                },
                {
                  label: "Refunded",
                  value: "Refunded",
                  baseColor: "#3c9111",
                  count: statusCount?.refunded_count || 0,
                },
              ].map((bucket) => {
                const isActive = status === bucket.value;
                const baseColor = bucket.baseColor;
                return (
                  <div
                    key={bucket.label}
                    onClick={() => {
                      if (status == bucket?.value) {
                        return;
                      }
                      setStatus(bucket.value);
                      setPagination({ ...pagination, page: 1 });
                      fetchRefundCustomersData({
                        status: bucket.value,
                        pageNumber: 1,
                      });
                    }}
                    className={`leadmanager_bucket ${isActive ? "active" : ""}`}
                    style={{
                      border: `1px solid ${isActive ? baseColor : baseColor + "66"}`,
                      backgroundColor: isActive ? baseColor : baseColor + "15",
                      color: isActive ? "#fff" : baseColor,
                      minWidth: "max-content",
                    }}
                  >
                    {bucket.label}{" "}
                    {bucket.count !== null && `( ${bucket.count} )`}
                  </div>
                );
              })}
            </Flex>
          </Col>

          {status === "Refunded" && (
            <Col
              span={12}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <div
                className="overall_pending_amount_card"
                style={{ padding: "8px 16px", borderLeft: "5px solid #3C9111" }}
              >
                <span className="overall_pending_amount_label">
                  Total Refunded Amount:
                </span>
                <span
                  className="overall_pending_amount_value"
                  style={{ color: "#3C9111" }}
                >
                  ₹
                  {Number(pagination.overall_refunded_amount)?.toLocaleString(
                    "en-IN",
                  ) || 0}
                </span>
              </div>
            </Col>
          )}
        </Row>
      )}

      <div style={{ marginTop: "16px" }}>
        <CommonTable
          // scroll={{ x: 2350 }}
          scroll={{
            x: (status === "Refunded"
              ? tableColumns
                  .filter((col) => col.key !== "action")
                  .map((col) =>
                    col.key === "details" ? { ...col, width: 110 } : col,
                  )
              : tableColumns
            ).reduce((total, col) => total + (col.width || 150), 0),
          }}
          columns={
            status === "Refunded" || status === ""
              ? tableColumns
                  .filter((col) => col.key !== "action")
                  .map((col) =>
                    col.key === "details" ? { ...col, width: 110 } : col,
                  )
              : tableColumns
          }
          dataSource={refundData}
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
                  page_name: "Refund",
                  column_names: columns,
                };

                try {
                  await updateTableColumns(payload);
                  setTimeout(() => {
                    if (refreshTableColumns) refreshTableColumns();
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

      {/* Customer Details Drawer */}
      <Drawer
        title="Customer Details"
        open={isOpenDetailsDrawer}
        onClose={formReset}
        width="50%"
        style={{ position: "relative" }}
      >
        {isOpenDetailsDrawer ? (
          <ParticularCustomerDetails
            customerId={selectedRefundCustomerDetails?.id}
          />
        ) : (
          ""
        )}
      </Drawer>

      {/* Customer History Drawer */}
      <CustomerHistory
        customerId={selectedRefundCustomerDetails?.id}
        isOpen={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setSelectedRefundCustomerDetails(null);
        }}
      />

      <Drawer
        title={"Update Status"}
        open={isStatusUpdateDrawer}
        onClose={formReset}
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

            {drawerContentStatus === "View Refund Details" ? (
              <div style={{ padding: "4px 24px" }}>
                <div className="refunded-details-container">
                  <p className="refunded-details-title">Refunded Details:</p>

                  <Row gutter={[16, 8]} style={{ marginTop: "8px" }}>
                    {[
                      {
                        label: "Refunded Amount",
                        value: refundedDetails?.refund_amount || "-",
                      },
                      {
                        label: "Transaction Id",
                        value: refundedDetails?.transaction_id || "-",
                      },
                      {
                        label: "Paid Date",
                        value: refundedDetails.paid_date
                          ? moment(refundedDetails.paid_date).format(
                              "DD/MM/YYYY",
                            )
                          : "-",
                      },
                      {
                        label: "Paid By",
                        value: refundedDetails.paid_by_user_id
                          ? `${refundedDetails.paid_by_view_user_id} - ${refundedDetails.paid_by_name}`
                          : "-",
                      },
                      {
                        label: "Payment Mode",
                        value: refundedDetails?.payment_mode || "-",
                      },
                    ].map((item, index) => (
                      <Col span={12} key={index}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "flex-start",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              textTransform: "capitalize",
                              minWidth: "140px",
                            }}
                          >
                            {item.label}:
                          </span>
                          <span
                            style={{
                              color: "#333",
                            }}
                          >
                            {item.value || "-"}
                          </span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            ) : (
              <div style={{ padding: "4px 24px" }}>
                <p
                  style={{
                    fontWeight: 600,
                    color: "#333",
                    fontSize: "14px",
                  }}
                >
                  Add Details
                </p>

                <Row
                  gutter={[12, 24]}
                  style={{ marginTop: "12px", marginBottom: "40px" }}
                >
                  <Col span={8}>
                    <CommonInputField
                      label={"Refund Amount"}
                      required={true}
                      type="number"
                      fontSize={"11px"}
                      height={"33px"}
                      labelFontSize={"11px"}
                      labelMarginTop={"0px"}
                      onChange={(e) => {
                        setRefundAmount(e.target.value);
                        if (validationTrigger) {
                          setRefundAmountError(selectValidator(e.target.value));
                        }
                      }}
                      value={refundAmount}
                      error={refundAmountError}
                      errorFontSize={"9px"}
                    />
                  </Col>

                  <Col span={8}>
                    <CommonMuiDatePicker
                      label={"Payment Date"}
                      required={true}
                      height={"33px"}
                      fontSize={"11px"}
                      labelFontSize={"11px"}
                      labelMarginTop={"0px"}
                      iconSize={"14px"}
                      onChange={(value) => {
                        setPaymentDate(value);
                        if (validationTrigger) {
                          setPaymentDateError(selectValidator(value));
                        }
                      }}
                      value={paymentDate}
                      error={paymentDateError}
                      errorFontSize={"9px"}
                    />
                  </Col>
                  <Col span={8}>
                    <CommonSelectField
                      label={"Payment Mode"}
                      required={true}
                      height={"33px"}
                      fontSize={"11px"}
                      labelFontSize={"11px"}
                      labelMarginTop={"0px"}
                      options={[
                        { id: "Bank - NEFT/IMPS", name: "Bank - NEFT/IMPS" },
                        { id: "UPI", name: "UPI" },
                      ]}
                      onChange={(e) => {
                        setPaymentMode(e.target.value);
                        if (validationTrigger) {
                          setPaymentModeError(selectValidator(e.target.value));
                        }
                      }}
                      value={paymentMode}
                      error={paymentModeError}
                      errorFontSize={"9px"}
                    />
                  </Col>
                  <Col span={8}>
                    <CommonInputField
                      label={"Reference Id"}
                      required={true}
                      fontSize={"11px"}
                      height={"33px"}
                      labelFontSize={"11px"}
                      labelMarginTop={"0px"}
                      onChange={(e) => {
                        setTransactionId(e.target.value);
                        if (validationTrigger) {
                          setTransactionIdError(
                            selectValidator(e.target.value),
                          );
                        }
                      }}
                      value={transactionId}
                      error={transactionIdError}
                      errorFontSize={"9px"}
                    />
                  </Col>
                </Row>
              </div>
            )}
          </>
        )}

        {drawerContentStatus != "View Refund Details" && (
          <div className="leadmanager_tablefiler_footer">
            <div className="leadmanager_submitlead_buttoncontainer">
              {approveButtonLoading ? (
                <button className="users_adddrawer_loadingcreatebutton">
                  <CommonSpinner />
                </button>
              ) : (
                <button
                  className="users_adddrawer_createbutton"
                  onClick={handleRefund}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* profile image modal */}
      <Modal
        open={previewOpen}
        title="Preview Profile"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* approval confirm modal */}
      <Modal
        open={isOpenApproveModal}
        onCancel={() => {
          setIsOpenApproveModal(false);
          setSelectedRefundCustomerDetails(null);
        }}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Approve the Refund for customer{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            {selectedRefundCustomerDetails?.name || ""}
          </span>
        </p>
        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={() => {
              setIsOpenApproveModal(false);
              setSelectedRefundCustomerDetails(null);
            }}
          >
            No
          </Button>
          {approveButtonLoading ? (
            <Button
              type="primary"
              className="customer_classcompletemodal_loading_okbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              type="primary"
              className="customer_classcompletemodal_okbutton"
              onClick={() => {
                handleCustomerStatus("Refund Ready to Pay");
              }}
            >
              Yes
            </Button>
          )}
        </div>
      </Modal>

      {/* revert confirm modal */}
      <Modal
        open={isOpenRevertModal}
        onCancel={() => {
          setIsOpenRevertModal(false);
          setSelectedRefundCustomerDetails(null);
        }}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Revert the Refund Approval for customer{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            {selectedRefundCustomerDetails?.name || ""}
          </span>
        </p>
        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={() => {
              setIsOpenRevertModal(false);
              setSelectedRefundCustomerDetails(null);
            }}
          >
            No
          </Button>
          {approveButtonLoading ? (
            <Button
              type="primary"
              className="customer_classcompletemodal_loading_okbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              type="primary"
              className="customer_classcompletemodal_okbutton"
              onClick={() => {
                handleCustomerStatus("Refund Request", true);
              }}
            >
              Yes
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
}
