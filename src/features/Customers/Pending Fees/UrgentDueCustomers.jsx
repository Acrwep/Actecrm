import React, { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Flex,
  Tooltip,
  Radio,
  Button,
  Drawer,
  Divider,
  Checkbox,
} from "antd";
import CommonOutlinedInput from "../../Common/CommonOutlinedInput";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import {
  getAllDownlineUsers,
  getPendingFeesCustomers,
  getTableColumns,
  updateTableColumns,
} from "../../ApiService/action";
import {
  formatToBackendIST,
  getCurrentandPreviousweekDate,
} from "../../Common/Validation";
import CommonTable from "../../Common/CommonTable";
import CommonDnd from "../../Common/CommonDnd";
import { FaRegEye } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import moment from "moment";
import CommonSelectField from "../../Common/CommonSelectField";
import CommonSpinner from "../../Common/CommonSpinner";
import { CommonMessage } from "../../Common/CommonMessage";
import { FaRegCopy } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import CommonMuiCustomDatePicker from "../../Common/CommonMuiCustomDatePicker";
import { useSelector } from "react-redux";
import InsertPendingFees from "./InsertPendingFees";
import ParticularCustomerDetails from "../ParticularCustomerDetails";

export default function UrgentDueCustomers({
  setUrgentDueCount,
  setDueSelectedDates,
}) {
  const mounted = useRef(false);
  const insertPendingFeesRef = useRef();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [customersData, setCustomersData] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isOpenPaymentDrawer, setIsOpenPaymentDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  //payment usestates
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pendingAmount, setPendingAmount] = useState();
  const [balanceAmount, setBalanceAmount] = useState();
  const [buttonLoading, setButtonLoading] = useState(false);
  //lead executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allDownliners, setAllDownliners] = useState([]);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  //table dnd
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [loginUserId, setLoginUserId] = useState("");
  const [updateTableId, setUpdateTableId] = useState(null);
  const [checkAll, setCheckAll] = useState(false);

  const nonChangeColumns = [
    {
      title: "Lead Executive",
      key: "lead_assigned_to_name",
      dataIndex: "lead_assigned_to_name",
      width: 160,
      render: (text, record) => {
        return (
          <div>
            <p> {`${record.lead_assigned_to_id} - ${text}`}</p>
          </div>
        );
      },
    },
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 220,
      render: (text) => {
        return (
          <>
            {text.length > 22 ? (
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
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 21) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 140 },
    {
      title: "Course ",
      key: "course_name",
      dataIndex: "course_name",
      width: 180,
    },
    {
      title: "Joined ",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 140,
    },
    {
      title: "Fees",
      key: "course_fees",
      dataIndex: "course_fees",
      width: 140,
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Balance",
      key: "balance_amount",
      dataIndex: "balance_amount",
      width: 140,
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Trainer",
      key: "trainer_name",
      dataIndex: "trainer_name",
      width: 170,
      render: (text, record) => {
        if (record.is_trainer_verified === 1) {
          return <p>{text}</p>;
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "TR Number",
      key: "trainer_mobile",
      dataIndex: "trainer_mobile",
      width: 150,
      render: (text, record) => {
        if (record.is_trainer_verified === 1) {
          return <p>{text}</p>;
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "Form Status",
      key: "form_status",
      dataIndex: "form_status",
      width: 120,
      render: (text, record) => {
        return (
          <>
            {record.is_customer_updated === 1 ? (
              <p>Completed</p>
            ) : (
              <p>Pending</p>
            )}
          </>
        );
      },
    },
    {
      title: "Nxt Due Date",
      key: "next_due_date",
      dataIndex: "next_due_date",
      width: 120,
      fixed: "right",
      render: (text, record) => {
        return (
          <>
            <p>{moment(text).format("DD/MM/YYYY")}</p>
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
                  Awaiting Finance
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
                  {text}
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
                  classPercent
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
                      }/customer-registration/${record.id}`
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
      width: 140,
      fixed: "right",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <Tooltip
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
            </Tooltip>

            {permissions?.includes("Add Part Payment") && (
              <Tooltip
                placement="top"
                title="Pay Amount"
                trigger={["hover", "click"]}
              >
                <GiReceiveMoney
                  size={17}
                  className="trainers_action_icons"
                  onClick={() => {
                    setIsOpenPaymentDrawer(true);
                    setCustomerDetails(record);
                    setPendingAmount(parseFloat(record.balance_amount));
                    setBalanceAmount(parseFloat(record.balance_amount));
                    setPaymentHistory(
                      record.payment && record.payment.payment_trans
                        ? record.payment.payment_trans
                        : []
                    );
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
    nonChangeColumns.map((col) => ({ ...col, isChecked: true }))
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

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
  }, [permissions]);

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
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
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getPendingFeesCustomersData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        null,
        downliners_ids,
        1,
        10
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getPendingFeesCustomersData = async (
    startDate,
    endDate,
    searchvalue,
    downliners,
    pageNumber,
    limit
  ) => {
    setLoading(true);

    const from_date = formatToBackendIST(startDate);
    const to_date = formatToBackendIST(endDate);

    const payload = {
      from_date: moment(from_date).format("YYYY-MM-DD"),
      to_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchvalue && filterType == 1
        ? { mobile: searchvalue }
        : searchvalue && filterType == 2
        ? { name: searchvalue }
        : searchvalue && filterType == 3
        ? { email: searchvalue }
        : searchvalue && filterType == 4
        ? { course: searchvalue }
        : {}),
      urgent_due: "Urgent Due",
      user_ids: downliners,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getPendingFeesCustomers(payload);
      console.log("urgent due customer response", response);
      setCustomersData(response?.data?.data?.data || []);
      const pagination = response?.data?.data?.pagination;
      setUrgentDueCount(pagination?.total || 0);

      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });

      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      setCustomersData([]);
      setLoading(false);
      console.log("pending fee customer error", error);
    }
  };

  const getTableColumnsData = async (user_id) => {
    try {
      const response = await getTableColumns(user_id);
      console.log("get table columns response", response);

      const data = response?.data?.data || [];
      if (data.length === 0) {
        return updateTableColumnsData();
      }

      const filterPage = data.find((f) => f.page_name === "Urgent Due");
      if (!filterPage) {
        setUpdateTableId(null);
        return updateTableColumnsData();
      }
      // --- ✅ Helper function to reattach render logic ---
      const attachRenderFunctions = (cols) =>
        cols
          .filter((col) => col.key !== "lead_by") // remove 'lead_by' column
          .map((col) => {
            switch (col.key) {
              case "lead_assigned_to_name":
                return {
                  ...col,
                  render: (text, record) => {
                    return (
                      <div>
                        <p> {`${record.lead_assigned_to_id} - ${text}`}</p>
                      </div>
                    );
                  },
                };
              case "email":
                return {
                  ...col,
                  render: (text) => {
                    return (
                      <>
                        {text.length > 22 ? (
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
                                fontSize: "13px",
                              },
                            }}
                          >
                            <p style={{ cursor: "pointer" }}>
                              {text.slice(0, 21) + "..."}
                            </p>
                          </Tooltip>
                        ) : (
                          <p>{text}</p>
                        )}
                      </>
                    );
                  },
                };
              case "course_fees":
                return {
                  ...col,
                  render: (text) => {
                    return <p>{"₹" + text}</p>;
                  },
                };
              case "balance_amount":
                return {
                  ...col,
                  render: (text) => {
                    return <p>{"₹" + text}</p>;
                  },
                };
              case "trainer_name":
                return {
                  ...col,
                  render: (text, record) => {
                    if (record.is_trainer_verified === 1) {
                      return <p>{text}</p>;
                    } else {
                      return <p>-</p>;
                    }
                  },
                };
              case "trainer_mobile":
                return {
                  ...col,
                  render: (text, record) => {
                    if (record.is_trainer_verified === 1) {
                      return <p>{text}</p>;
                    } else {
                      return <p>-</p>;
                    }
                  },
                };
              case "form_status":
                return {
                  ...col,
                  render: (text, record) => {
                    return (
                      <>
                        {record.is_customer_updated === 1 ? (
                          <p>Completed</p>
                        ) : (
                          <p>Pending</p>
                        )}
                      </>
                    );
                  },
                };
              case "next_due_date":
                return {
                  ...col,
                  render: (text, record) => {
                    return (
                      <>
                        <p>{moment(text).format("DD/MM/YYYY")}</p>
                      </>
                    );
                  },
                };
              case "status":
                return {
                  ...col,
                  width: 180,
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
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                        }}
                      >
                        {record.is_second_due === 1 ? (
                          <div>
                            <Button className="customers_status_awaitfinance_button">
                              Awaiting Finance
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
                              {text}
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
                          <Button className="trainers_rejected_button">
                            {text}
                          </Button>
                        ) : text === "Class Going" ? (
                          <div style={{ display: "flex", gap: "12px" }}>
                            <Button className="customers_status_classgoing_button">
                              {text}
                            </Button>

                            <p className="customer_classgoing_percentage">{`${parseFloat(
                              classPercent
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
                                  }/customer-registration/${record.id}`
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
                };
              case "action":
                return {
                  ...col,
                  render: (text, record) => {
                    return (
                      <div className="trainers_actionbuttonContainer">
                        <Tooltip
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
                        </Tooltip>

                        {permissions?.includes("Add Part Payment") && (
                          <Tooltip
                            placement="top"
                            title="Pay Amount"
                            trigger={["hover", "click"]}
                          >
                            <GiReceiveMoney
                              size={17}
                              className="trainers_action_icons"
                              onClick={() => {
                                setIsOpenPaymentDrawer(true);
                                setCustomerDetails(record);
                                setPendingAmount(
                                  parseFloat(record.balance_amount)
                                );
                                setBalanceAmount(
                                  parseFloat(record.balance_amount)
                                );
                                setPaymentHistory(
                                  record.payment && record.payment.payment_trans
                                    ? record.payment.payment_trans
                                    : []
                                );
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

      const allColumns = attachRenderFunctions(filterPage.column_names);
      const visibleColumns = attachRenderFunctions(
        filterPage.column_names.filter((col) => col.isChecked)
      );

      setColumns(allColumns);
      setTableColumns(visibleColumns);

      console.log("Visible columns:", visibleColumns);
    } catch (error) {
      console.error("get table columns error", error);
    }
  };

  const updateTableColumnsData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Urgent Due",
      column_names: columns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getPendingFeesCustomersData(
      selectedDates[0],
      selectedDates[1],
      searchValue,
      allDownliners,
      page,
      limit
    );
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getPendingFeesCustomersData(
        selectedDates[0],
        selectedDates[1],
        e.target.value,
        allDownliners,
        1,
        pagination.limit
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
      getPendingFeesCustomersData(
        selectedDates[0],
        selectedDates[1],
        searchValue,
        downliners_ids,
        1,
        pagination.limit
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setCustomerDetails(null);
    setIsOpenPaymentDrawer(false);
    setPendingAmount();
    setBalanceAmount();
  };

  return (
    <div>
      <Row style={{ marginTop: "40px" }}>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={7}>
              <div className="overallduecustomers_filterContainer">
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
                          getPendingFeesCustomersData(
                            selectedDates[0],
                            selectedDates[1],
                            null,
                            allDownliners,
                            1,
                            pagination.limit
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
                              setPagination({
                                page: 1,
                              });
                              setSearchValue("");
                              getPendingFeesCustomersData(
                                selectedDates[0],
                                selectedDates[1],
                                null,
                                allDownliners,
                                1,
                                pagination.limit
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
            {permissions.includes("Lead Executive Filter") && (
              <Col span={7}>
                <CommonSelectField
                  height="35px"
                  label="Select User"
                  labelMarginTop="0px"
                  labelFontSize="13px"
                  options={subUsers}
                  onChange={handleSelectUser}
                  value={selectedUserId}
                  disableClearable={false}
                />
              </Col>
            )}
            <Col span={10}>
              <div style={{ position: "relative" }}>
                <CommonMuiCustomDatePicker
                  value={selectedDates}
                  onDateChange={(dates) => {
                    setSelectedDates(dates);
                    setDueSelectedDates(dates);
                    setPagination({
                      page: 1,
                    });
                    getPendingFeesCustomersData(
                      dates[0],
                      dates[1],
                      searchValue,
                      allDownliners,
                      1,
                      pagination.limit
                    );
                  }}
                />
                <p className="pendingcustomers_datepicker_label">
                  Nxt Due Date
                </p>
              </div>
            </Col>
          </Row>
        </Col>
        <Col
          span={7}
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

      <div style={{ marginTop: "22px" }}>
        <CommonTable
          // scroll={{ x: 2350 }}
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0
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
        onClose={formReset}
        width="45%"
        style={{ position: "relative" }}
      >
        {isOpenDetailsDrawer ? (
          <ParticularCustomerDetails customerDetails={customerDetails} />
        ) : (
          ""
        )}
      </Drawer>

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
            pending={pendingAmount}
            bal={balanceAmount}
            customerDetails={customerDetails}
            paymentHistory={paymentHistory}
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
                pagination.page,
                pagination.limit
              );
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

            <Divider className="customer_statusupdate_divider" />
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
                  page_name: "Urgent Due",
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
