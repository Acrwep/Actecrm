import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Flex, Radio, Button, Drawer, Checkbox } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { FiFilter } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import { RedoOutlined } from "@ant-design/icons";
import { DownloadOutlined } from "@ant-design/icons";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import {
  customersStatusDisplay,
  formatToBackendIST,
  getPreviousYearDec26ToCurrentYearDec25,
} from "../Common/Validation";
import {
  getAllDownlineUsers,
  getBranches,
  getCustomerById,
  getPendingFeesCustomers,
  getTableColumns,
  getUsers,
  updateTableColumns,
} from "../ApiService/action";
import { useSelector } from "react-redux";
import CommonTable from "../Common/CommonTable";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";
import { FaRegCopy } from "react-icons/fa6";
import { CommonMessage } from "../Common/CommonMessage";
import CommonDnd from "../Common/CommonDnd";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonSpinner from "../Common/CommonSpinner";
import InsertPendingFees from "../Customers/Pending Fees/InsertPendingFees";
import DraggableStudentModal from "../Common/DraggableStudentModal";
import CommonSelectField from "../Common/CommonSelectField";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";

export default function Receivables({
  setReceivableCount,
  filterData,
  allTableColumns,
  refreshTableColumns,
}) {
  const mounted = useRef(false);
  const insertPendingFeesRef = useRef();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [searchValue, setSearchValue] = useState("");
  const [customersData, setCustomersData] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isOpenPaymentDrawer, setIsOpenPaymentDrawer] = useState(false);
  const [overAllPendingAmount, setOverAllPendingAmount] = useState(null);
  const [regionCounts, setRegionCounts] = useState(null);
  const [isOpenCustomerDetailsModal, setIsOpenCustomerDetailsModal] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  //lead executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const prevSelectedUserIdRef = useRef("[]");
  const [allDownliners, setAllDownliners] = useState([]);
  const [defaultAllDownliners, setDefaultAllDownliners] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  //filter usestates
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const nonChangeColumns = [
    {
      title: "Date Of Joining",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 140,
      sorter: (a, b) =>
        moment(a.date_of_joining).valueOf() -
        moment(b.date_of_joining).valueOf(),
      sortDirections: ["ascend"],
      defaultSortOrder: "descend", // Optional
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Total Collection Days",
      key: "total_days_taken",
      dataIndex: "total_days_taken",
      width: 165,
      fixed: "right",
      sorter: (a, b) =>
        moment(a.total_days_taken).valueOf() -
        moment(b.total_days_taken).valueOf(),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    {
      title: "Place Of Sale",
      key: "branch_name",
      dataIndex: "branch_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    {
      title: "Place Of Service",
      key: "place_of_service",
      dataIndex: "place_of_service",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    ...(permissions.includes("Show Lead Executive Id")
      ? [
          {
            title: "Lead Executive",
            key: "lead_assigned_to_name",
            dataIndex: "lead_assigned_to_name",
            width: 150,
            render: (text, record) => {
              const lead_executive = `${record.lead_assigned_to_id} - ${text}`;
              return <EllipsisTooltip text={lead_executive} />;
            },
          },
        ]
      : []),
    {
      title: "Student Name",
      key: "name",
      dataIndex: "name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Student Mobile",
      key: "phone",
      dataIndex: "phone",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Course",
      key: "course_name",
      dataIndex: "course_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Total Fees (With GST)",
      key: "course_fees",
      dataIndex: "course_fees",
      width: 155,
      render: (text) => {
        return <p>{text ? `₹${Number(text).toLocaleString("en-IN")}` : "-"}</p>;
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
      title: "Balance Amount",
      key: "balance_amount",
      dataIndex: "balance_amount",
      width: 130,
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
              ? `₹${amount.toLocaleString("en-IN")}`
              : "-"}
          </p>
        );
      },
    },
    {
      title: "Nxt Due Date",
      key: "next_due_date",
      dataIndex: "next_due_date",
      width: 100,
      fixed: "right",
      render: (text, record) => {
        return (
          <>
            <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>
          </>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      fixed: "right",
      width: 190,
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
            {record.is_second_due === 1 ? (
              <div>
                <Button className="customers_status_awaitfinance_button">
                  Payment Verify
                </Button>
              </div>
            ) : text === "Form Pending" ? (
              <div>
                <Button className="customers_status_formpending_button">
                  {text}
                </Button>
              </div>
            ) : record.is_last_pay_rejected === 1 ? (
              <div>
                <Button className="trainers_rejected_button">
                  Payment Rejected
                </Button>
              </div>
            ) : text === "Awaiting Finance" ? (
              <div>
                <Button className="customers_status_awaitfinance_button">
                  Payment Verify
                </Button>
              </div>
            ) : text === "Awaiting Verify" ? (
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
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: 80,
      fixed: "right",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            {/* <Tooltip
              placement="top"
              title="View Details"
              trigger={["hover", "click"]}
            >
              <FaRegEye
                size={16}
                style={{ marginTop: "1px" }}
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenDetailsDrawer(true);
                  setCustomerDetails(record);
                }}
              />
            </Tooltip> */}

            {permissions?.includes("Add Part Payment") && (
              <Tooltip
                placement="top"
                title="Add Payment"
                trigger={["hover", "click"]}
              >
                <GiReceiveMoney
                  size={18}
                  className="trainers_action_icons"
                  onClick={() => {
                    setIsOpenPaymentDrawer(true);
                    setCustomerDetails(record);
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
      page_name: "Receivable",
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

      const filterPage = data.find((f) => f.page_name === "Receivable");

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
      console.log("process table columns error", error);
    }
  };

  useEffect(() => {
    const PreviousYearDec26ToCurrentDate =
      getPreviousYearDec26ToCurrentYearDec25();
    setSelectedDates(PreviousYearDec26ToCurrentDate);
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setSubUsers(downlineUsers);
      getAllDownlineUsersData(convertAsJson?.user_id);
    }
  }, [childUsers]);

  useEffect(() => {
    const handleRefreshReceivables = () => {
      if (allDownliners.length > 0) {
        getPendingFeesCustomersData(
          selectedDates[0],
          selectedDates[1],
          searchValue,
          allDownliners,
          selectedRegionId,
          selectedBranchId,
          pagination.page,
          pagination.limit,
        );
      }
    };
    window.addEventListener("refreshReceivables", handleRefreshReceivables);
    return () => {
      window.removeEventListener(
        "refreshReceivables",
        handleRefreshReceivables,
      );
    };
  }, [
    selectedDates,
    searchValue,
    allDownliners,
    pagination.page,
    pagination.limit,
  ]);

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
      getPendingFeesCustomersData(
        PreviousYearDec26ToCurrentDate[0],
        PreviousYearDec26ToCurrentDate[1],
        null,
        downliners_ids,
        null,
        null,
        1,
        10,
      );
    } catch (error) {
      console.log("all downlines error", error);
    } finally {
      setLoading(false);
    }
  };

  const getPendingFeesCustomersData = async (
    startDate,
    endDate,
    searchvalue,
    downliners,
    regionId,
    branchId,
    pageNumber,
    limit,
  ) => {
    setLoading(true);

    const from_date = formatToBackendIST(startDate);
    const to_date = formatToBackendIST(endDate);

    const payload = {
      from_date: moment(from_date).format("YYYY-MM-DD"),
      to_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchvalue && { search_filter: searchvalue }),
      user_ids: downliners,
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getPendingFeesCustomers(payload);
      console.log("pending fee customer response", response);
      setCustomersData(response?.data?.data?.data || []);
      setRegionCounts(response?.data?.data?.bucketData || null);
      const paginations = response?.data?.data?.pagination;
      setOverAllPendingAmount(paginations?.overall_balance || 0);
      setReceivableCount(paginations?.total || 0);
      setPagination({
        page: paginations.page,
        limit: paginations.limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
      });

      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      setCustomersData([]);
      setRegionCounts(null);
      setOverAllPendingAmount(0);
      setLoading(false);
      console.log("pending fee customer error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getPendingFeesCustomersData(
      selectedDates[0],
      selectedDates[1],
      searchValue,
      allDownliners,
      selectedRegionId,
      selectedBranchId,
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
    getPendingFeesCustomersData(
      selectedDates[0],
      selectedDates[1],
      e.target.value,
      allDownliners,
      selectedRegionId,
      selectedBranchId,
      1,
      pagination.limit,
    );
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
  };

  const handleSelectUserBlur = async () => {
    const value = selectedUserId;

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
      getPendingFeesCustomersData(
        selectedDates[0],
        selectedDates[1],
        searchValue,
        downliners_ids,
        selectedRegionId,
        selectedBranchId,
        1,
        pagination.limit,
      );
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

  //get particular customer full details
  const getParticularCustomerDetails = async (
    customer_Id,
    isOpenModal = false,
  ) => {
    try {
      const response = await getCustomerById(customer_Id);
      console.log("particular customer response", response);
      const customer_details = response?.data?.data;
      setCustomerDetails(customer_details);
      if (isOpenModal) {
        setIsOpenCustomerDetailsModal(true);
      }
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    const from_date = formatToBackendIST(selectedDates[0]);
    const to_date = formatToBackendIST(selectedDates[1]);

    const payload = {
      from_date: moment(from_date).format("YYYY-MM-DD"),
      to_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchValue && { search_filter: searchValue }),
      user_ids:
        selectedRegionId || selectedBranchId
          ? defaultAllDownliners
          : allDownliners,
      ...(selectedRegionId && { region_id: selectedRegionId }),
      ...(selectedBranchId && { branch_id: selectedBranchId }),
    };
    try {
      const response = await getPendingFeesCustomers(payload);
      console.log("pending fee customers response", response);
      const download_data = response?.data?.data?.data || [];
      if (download_data.length >= 1) {
        DownloadTableAsCSV(
          download_data,
          nonChangeColumns,
          `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
            selectedDates[1],
          ).format("DD-MM-YYYY")} Receivable Payments.csv`,
        );
      } else {
        CommonMessage("error", "No Data Found");
      }
      setDownloadLoading(false);
    } catch (error) {
      setDownloadLoading(false);
      console.log("pending fee customers error", error);
    }
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setCustomerDetails(null);
    setIsOpenPaymentDrawer(false);
  };

  const handleRefresh = () => {
    setSearchValue("");
    setSelectedUserId([]);
    prevSelectedUserIdRef.current = "[]";
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setSubUsers(downlineUsers);
    const PreviousYearDec26ToCurrentDate =
      getPreviousYearDec26ToCurrentYearDec25();
    setSelectedDates(PreviousYearDec26ToCurrentDate);
    getAllDownlineUsersData(loginUserId);
  };

  useEffect(() => {
    const triggerRefresh = () => handleRefresh();
    window.addEventListener("refreshReceivablesTab", triggerRefresh);
    return () =>
      window.removeEventListener("refreshReceivablesTab", triggerRefresh);
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
                          getPendingFeesCustomersData(
                            selectedDates[0],
                            selectedDates[1],
                            null,
                            allDownliners,
                            selectedRegionId,
                            selectedBranchId,
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
                        limit: pagination.limit,
                      });
                      getPendingFeesCustomersData(
                        selectedDates[0],
                        selectedDates[1],
                        searchValue,
                        defaultAllDownliners,
                        value,
                        null,
                        1,
                        pagination.limit,
                      );
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
                      getPendingFeesCustomersData(
                        selectedDates[0],
                        selectedDates[1],
                        searchValue,
                        defaultAllDownliners,
                        selectedRegionId,
                        value,
                        1,
                        pagination.limit,
                      );
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
                <p className="accounts_datepicket_label">Nxt Due Date</p>
                <CommonMuiCustomDatePicker
                  width="100%"
                  value={selectedDates}
                  onDateChange={(dates) => {
                    setSelectedDates(dates);
                    setPagination({
                      page: 1,
                    });
                    getPendingFeesCustomersData(
                      dates[0],
                      dates[1],
                      searchValue,
                      allDownliners,
                      selectedRegionId,
                      selectedBranchId,
                      1,
                      pagination.limit,
                    );
                  }}
                />
              </div>
            </Col>
          </Row>
        </Col>
        <Col
          span={permissions.includes("Lead Executive Filter") ? 2 : 12}
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
      </Row>{" "}
      <Row style={{ marginTop: "20px" }}>
        <Col span={12}>
          {permissions.includes("Show Region Summary") && (
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
                    {regionCounts?.hub ?? "-"}
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
                    {regionCounts?.chennai ?? "-"}
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
                    {regionCounts?.bangalore ?? "-"}
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
        </Col>
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
            style={{ padding: "8px 16px" }}
          >
            <span className="overall_pending_amount_label">
              Pending Amount:
            </span>
            <span className="overall_pending_amount_value">
              ₹{Number(overAllPendingAmount)?.toLocaleString("en-IN") || 0}
            </span>
          </div>
        </Col>
      </Row>
      <div style={{ marginTop: "20px" }}>
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
        title="Pay Due Amount"
        open={isOpenPaymentDrawer}
        onClose={formReset}
        width="50%"
        style={{ position: "relative", paddingBottom: "65px" }}
        className="customer_statusupdate_drawer"
      >
        {isOpenPaymentDrawer ? (
          <InsertPendingFees
            ref={insertPendingFeesRef}
            selectedCustomerDetails={customerDetails}
            setButtonLoading={setButtonLoading}
            callgetCustomersApi={() => {
              formReset();
              setPagination({
                page: 1,
              });
              getPendingFeesCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                allDownliners,
                selectedRegionId,
                selectedBranchId,
                pagination.page,
                pagination.limit,
              );
              window.dispatchEvent(new CustomEvent("refreshReceived"));
            }}
          />
        ) : (
          ""
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
                onClick={() =>
                  insertPendingFeesRef.current?.handlePaymentSubmit()
                }
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>
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
                  page_name: "Receivable",
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
      <Drawer
        title="Customer Details"
        open={isOpenDetailsDrawer}
        onClose={formReset}
        width="45%"
        style={{ position: "relative" }}
      >
        {isOpenDetailsDrawer ? (
          <ParticularCustomerDetails customerId={customerDetails?.id} />
        ) : (
          ""
        )}
      </Drawer>
      {/* customer details modal */}
      <DraggableStudentModal
        open={isOpenCustomerDetailsModal}
        onClose={() => setIsOpenCustomerDetailsModal(false)}
        customerDetails={customerDetails}
      />
    </div>
  );
}
