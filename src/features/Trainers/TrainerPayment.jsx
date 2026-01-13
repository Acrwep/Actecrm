import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Tooltip,
  Button,
  Drawer,
  Flex,
  Radio,
  Modal,
  Checkbox,
  Divider,
  Collapse,
} from "antd";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { BsPatchCheckFill } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";
import { RedoOutlined } from "@ant-design/icons";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTable from "../Common/CommonTable";
import {
  approveTrainerPaymentTransaction,
  createTrainerPaymentTransaction,
  getCustomers,
  getTrainerPayments,
  getTrainers,
  rejectTrainerPayment,
  updateTrainerPaymentTransaction,
} from "../ApiService/action";
import {
  addressValidator,
  getBalanceAmount,
  getCurrentandPreviousweekDate,
  priceValidator,
  selectValidator,
} from "../Common/Validation";
import moment from "moment";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonSpinner from "../Common/CommonSpinner";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import { CommonMessage } from "../Common/CommonMessage";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import PrismaZoom from "react-prismazoom";
import AddTrainerPaymentRequest from "./AddTrainerPaymentRequest";
import CommonTextArea from "../Common/CommonTextArea";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";

export default function TrainerPayment() {
  const scrollRef = useRef();
  const addTrainerPaymentRequestUseRef = useRef();
  //usestates
  const [selectedDates, setSelectedDates] = useState([]);
  const [status, setStatus] = useState("");
  const [isOpenAddRequestDrawer, setIsOpenAddRequestDrawer] = useState(false);
  //select trainer usestates
  const [trainersData, setTrainersData] = useState([]);
  const [isOpenAddRequestComponent, setIsOpenAddRequestComponent] =
    useState(false);
  //form usestates
  const [editRequestItem, setEditRequestItem] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  //table data states
  const [paymentRequestsData, setPaymentRequestsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    Requested: 0,
    "Awaiting Finance": 0,
    Completed: 0,
    all: 0,
  });
  // Payment details drawer states
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  const [isOpenAttendanceScreenshotModal, setIsOpenAttendanceScreenshotModal] =
    useState(false);
  const [viewAttendanceScreenshot, setViewAttendanceScreenshot] = useState("");
  //payment usesates
  const [drawerContentStatus, setDrawerContentStatus] = useState("");
  const [paidNow, setPaidNow] = useState("");
  const [paidNowError, setPaidNowError] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const paymentTypeOptions = [
    { id: "Full", name: "Fully" },
    { id: "Partial", name: "Partial" },
  ];
  const [paymentType, setPaymentType] = useState("");
  const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
  const [paymentScreenShotBase64Error, setPaymentScreenShotBase64Error] =
    useState("");
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentValidationTrigger, setPaymentValidationTrigger] =
    useState(false);
  const [isOpenPaymentScreenshotModal, setIsOpenPaymentScreenshotModal] =
    useState(false);
  const [transactionScreenshot, setTransactionScreenshot] = useState("");
  const [isShowRejectPaymentCommentBox, setIsShowRejectPaymentCommentBox] =
    useState(false);
  const [rejectPaymentComments, setRejectPaymentComments] = useState("");
  const [rejectPaymentCommentsError, setRejectPaymentCommentsError] =
    useState("");
  //customer details
  const [isOpenCustomerDetailsDrawer, setIsOpenCustomerDetailsDrawer] =
    useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  //trainer details
  const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
    useState(false);
  const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);

  // Table columns definition
  const columns = [
    {
      title: "Bill Raise Date",
      key: "bill_raisedate",
      dataIndex: "bill_raisedate",
      width: 130,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Trainer Name",
      key: "trainer_name",
      dataIndex: "trainer_name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Trainer Email",
      key: "trainer_email",
      dataIndex: "trainer_email",
      width: 180,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Trainer Mobile",
      key: "trainer_mobile",
      dataIndex: "trainer_mobile",
      width: 130,
      render: (text) => {
        return <p>{text || "-"}</p>;
      },
    },
    {
      title: "Customer Name",
      key: "customer_name",
      dataIndex: "customer_name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Customer Email",
      key: "customer_email",
      dataIndex: "customer_email",
      width: 180,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Stream",
      key: "streams",
      dataIndex: "streams",
      width: 120,
      render: (text) => {
        return <p>{text || "-"}</p>;
      },
    },
    {
      title: "Attendance Status",
      key: "attendance_status",
      dataIndex: "attendance_status",
      width: 150,
      render: (text) => {
        return <p>{text || "-"}</p>;
      },
    },
    {
      title: "Attendance Link",
      key: "attendance_sheetlink",
      dataIndex: "attendance_sheetlink",
      width: 150,
      render: (text, record) => {
        return text ? (
          <a
            href={text}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#5b69ca" }}
          >
            View Sheet
          </a>
        ) : (
          <p
            style={{ color: "#5b69ca", fontWeight: 500, cursor: "pointer" }}
            onClick={() => {
              setIsOpenAttendanceScreenshotModal(true);
              setViewAttendanceScreenshot(record.attendance_screenshot);
            }}
          >
            View Screenshot
          </p>
        );
      },
    },
    {
      title: "Request Amount",
      key: "request_amount",
      dataIndex: "request_amount",
      width: 140,
      render: (text) => {
        return <p>{text ? `₹ ${parseFloat(text).toFixed(2)}` : "-"}</p>;
      },
    },
    {
      title: "Days Taken To Pay",
      key: "days_taken_topay",
      dataIndex: "days_taken_topay",
      width: 150,
      render: (text) => {
        return <p>{text !== null && text !== undefined ? text : "-"}</p>;
      },
    },
    {
      title: "Deadline Date",
      key: "deadline_date",
      dataIndex: "deadline_date",
      width: 130,
      render: (text) => {
        return <p>{text ? moment(text).format("DD-MM-YYYY") : "-"}</p>;
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: 195,
      fixed: "right",
      render: (text, record) => {
        return (
          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
            }}
          >
            <Tooltip
              placement="bottomLeft"
              className="customers_statustooltip"
              color="#fff"
              styles={{
                body: {
                  width: "290px",
                  maxWidth: "none",
                  whiteSpace: "normal",
                },
              }}
              title={
                <>
                  <Row>
                    <Col span={12}>
                      {record.status == "Requested" ? (
                        <Checkbox
                          className="server_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (
                              record.status == "Requested" ||
                              record.status == "Rejected"
                            ) {
                              setIsOpenDetailsDrawer(true);
                              setDrawerContentStatus("Requested");
                              setSelectedPaymentDetails(record);
                              setPaymentHistory(record.transactions);
                              setCollapseDefaultKey(["1"]);
                            }
                          }}
                        >
                          Raise Payment
                        </Checkbox>
                      ) : record.status === "Rejected" ? (
                        <button
                          className="customers_finance_updatepayment_button"
                          onClick={() => {
                            setDrawerContentStatus("Update Request");
                            setIsOpenDetailsDrawer(true);
                            setSelectedPaymentDetails(record);
                            setPaymentHistory(record.transactions);
                            setPaidNow(record.transactions[0].paid_amount);
                            setPaymentType(record.transactions[0].payment_type);
                            setCollapseDefaultKey(["1"]);
                            setBalanceAmount(
                              getBalanceAmount(
                                isNaN(record.balance_amount)
                                  ? 0
                                  : record.balance_amount,
                                isNaN(record.transactions[0].paid_amount)
                                  ? 0
                                  : record.transactions[0].paid_amount
                              )
                            );
                          }}
                        >
                          Update Request
                        </button>
                      ) : (
                        <div className="customers_classcompleted_container">
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Payment Raised
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col span={12}>
                      {record.status == "Requested" ||
                      record.status == "Awaiting Finance" ||
                      record.status == "Rejected" ? (
                        <Checkbox
                          className="server_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status == "Awaiting Finance") {
                              setIsOpenDetailsDrawer(true);
                              setDrawerContentStatus("Awaiting Finance");
                              setSelectedPaymentDetails(record);
                              setPaymentHistory(record.transactions);
                              setCollapseDefaultKey(["1"]);
                              // getCustomerData(record.customer_id);
                            } else {
                              CommonMessage(
                                "warning",
                                "Payment not raised yet"
                              );
                            }
                          }}
                        >
                          Awaiting Finance{" "}
                        </Checkbox>
                      ) : (
                        <div className="customers_classcompleted_container">
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Finance Verified
                          </p>
                        </div>
                      )}
                    </Col>
                  </Row>
                </>
              }
            >
              {text === "Requested" ? (
                <Button className="customers_status_formpending_button">
                  Requested
                </Button>
              ) : text === "Awaiting Finance" ? (
                <Button className="trainers_pending_button">
                  Awaiting Finance
                </Button>
              ) : text === "Completed" ? (
                <div className="trainers_verifieddiv">
                  <Button className="trainers_verified_button">
                    Completed
                  </Button>
                </div>
              ) : text === "Rejected" ? (
                <div className="trainers_verifieddiv">
                  <Button className="trainers_rejected_button">Rejected</Button>
                </div>
              ) : (
                <p style={{ marginLeft: "6px" }}>-</p>
              )}
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
      width: 100,
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <AiOutlineEdit
              size={18}
              className="trainers_action_icons"
              onClick={() => {
                if (record.status == "Requested") {
                  handleEdit(record);
                } else {
                  CommonMessage(
                    "error",
                    `Unable to update in ${record.status} status`
                  );
                }
              }}
            />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getTrainersData();
    // Set loading to false initially - will be true when fetching real data
    // setTimeout(() => {
    //   setLoading(false);
    // }, 300);
  }, []);

  const getTrainersData = async () => {
    const payload = {
      status: "Verified",
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getTrainers(payload);
      setTrainersData(response?.data?.data?.trainers || []);
    } catch (error) {
      setTrainersData([]);
      console.log(error);
    } finally {
      setTimeout(() => {
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        setSelectedDates(PreviousAndCurrentDate);
        getTrainerPaymentsData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          null,
          1,
          10,
          true
        );
      }, 300);
    }
  };

  const getTrainerPaymentsData = async (
    startDate,
    endDate,
    status,
    pageNumber,
    pageLimit,
    callCustomerApi = false
  ) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      status: status,
      page: pageNumber,
      limit: pageLimit,
    };
    try {
      const response = await getTrainerPayments(payload);
      console.log("trainer payment response", response);

      // Extract data from response
      const responseData = response?.data?.data || [];
      const paginationData = response?.data?.pagination || {};
      const statusCountsData = response?.data?.statusCounts || {};

      // Set payment requests data
      setPaymentRequestsData(responseData);

      // Update pagination
      setPagination({
        page: paginationData.currentPage || 1,
        limit: paginationData.limit || 10,
        total: paginationData.totalRecords || 0,
        totalPages: paginationData.totalPages || 0,
      });

      // Update status counts
      setStatusCounts({
        Requested: statusCountsData.Requested || 0,
        "Awaiting Finance": statusCountsData["Awaiting Finance"] || 0,
        Completed: statusCountsData.Completed || 0,
        all: statusCountsData.all || 0,
      });
    } catch (error) {
      setPaymentRequestsData([]);
      setLoading(false);
      console.log(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleEdit = (item) => {
    setIsOpenAddRequestDrawer(true);
    setEditRequestItem(item);
    // setRequestId(item.id);
    // setBillRaiseDate(item.bill_raisedate);
    // setStreamId(item.streams);
    // setAttendanceStatusId(item.attendance_status);
    // setAttendanceSheetLink(item.attendance_sheetlink);
    // setAttendanceScreenShotBase64(item.attendance_screenshot);
    // if (item.attendance_sheetlink) {
    //   setAttendanceType("Link");
    // } else {
    //   setAttendanceType("Screenshot");
    // }
    // setTrainerId(item.trainer_id);
    // setDaysTakenToPay(item.days_taken_topay);
    // setDeadLineDate(item.deadline_date);
    // getParticularCustomerDetails(item.customer_email, true);
  };

  //payment onchange functions
  const handlePaidNow = (e) => {
    const input = e.target.value;

    // Allow numbers, decimal point, or empty string
    if (!/^\d*\.?\d*$/.test(input)) return;

    setPaidNow(input); // store as string for user input

    const value = parseFloat(input); // parse for calculations
    const amt = parseFloat(selectedPaymentDetails?.balance_amount ?? "");

    const balance_amount = getBalanceAmount(
      isNaN(amt) ? 0 : amt,
      isNaN(value) ? 0 : value
    );

    if (balance_amount == 0) {
      setPaymentType("Full");
    } else if (balance_amount > 0) {
      setPaymentType("Partial");
    } else {
      setPaymentType("");
    }
    setBalanceAmount(balance_amount);

    if (paymentValidationTrigger) {
      setPaidNowError(
        priceValidator(isNaN(value) ? 0 : value, parseFloat(amt), true)
      );
    }
  };

  //payment submit
  const handlePaymentSubmit = async () => {
    setPaymentValidationTrigger(true);
    const paidAmountValidate = priceValidator(
      paidNow,
      parseFloat(selectedPaymentDetails.balance_amount),
      true
    );

    setPaidNowError(paidAmountValidate);
    console.log("paidAmountValidate", paidAmountValidate);

    if (paidAmountValidate) return;
    setButtonLoading(true);

    const payload = {
      ...(drawerContentStatus == "Update Request"
        ? { transaction_id: selectedPaymentDetails.transactions[0].id }
        : { trainer_payment_id: selectedPaymentDetails.id }),
      paid_amount: paidNow,
      payment_type: paymentType,
    };

    try {
      if (drawerContentStatus === "Update Request") {
        await updateTrainerPaymentTransaction(payload);
      } else {
        await createTrainerPaymentTransaction(payload);
      }
      setTimeout(() => {
        CommonMessage("success", "Updated Successfully");
        paymentformReset();
        // Refresh the payment requests data
        getTrainerPaymentsData(
          selectedDates[0],
          selectedDates[1],
          status || null,
          1,
          pagination.limit
        );
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handlePaymentApprove = async (transactionId) => {
    setPaymentValidationTrigger(true);
    const paymentScreenshotValidate = selectValidator(paymentScreenShotBase64);

    setPaymentScreenShotBase64Error(paymentScreenshotValidate);

    if (paymentScreenshotValidate) return;

    setButtonLoading(true);

    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      transaction_id: transactionId,
      payment_screenshot: paymentScreenShotBase64,
      finance_head_id: convertAsJson?.user_id,
    };

    try {
      await approveTrainerPaymentTransaction(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated Successfully");
        paymentformReset();
        // Refresh the payment requests data
        getTrainerPaymentsData(
          selectedDates[0],
          selectedDates[1],
          status || null,
          1,
          pagination.limit
        );
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handlePaymentReject = async () => {
    setIsShowRejectPaymentCommentBox(true);
    setTimeout(() => {
      const container = document.getElementById(
        "customer_trainerreject_commentContainer"
      );
      container.scrollIntoView({ behavior: "smooth" });
    }, 200);

    const commentValidate = addressValidator(rejectPaymentComments);

    setRejectPaymentCommentsError(commentValidate);

    if (commentValidate) return;

    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      trainer_payment_id: selectedPaymentDetails.id,
      reject_reason: rejectPaymentComments,
      finance_head_id: convertAsJson?.user_id,
    };

    try {
      await rejectTrainerPayment(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated Successfully");
        paymentformReset();
        // Refresh the payment requests data
        getTrainerPaymentsData(
          selectedDates[0],
          selectedDates[1],
          status || null,
          1,
          pagination.limit
        );
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const paymentformReset = () => {
    setButtonLoading(false);
    setIsOpenDetailsDrawer(false);
    setSelectedPaymentDetails(null);
    setPaymentValidationTrigger(false);
    setPaidNow("");
    setPaidNowError("");
    setPaymentType("");
    setBalanceAmount("");
    setPaymentScreenShotBase64("");
    setPaymentScreenShotBase64Error("");
    setDrawerContentStatus("");
    setPaymentHistory([]);
    setIsShowRejectPaymentCommentBox(false);
    setRejectPaymentComments("");
    setRejectPaymentCommentsError("");
  };

  const handlePaginationChange = ({ page, limit }) => {
    // This will be called when pagination changes
    setPagination({ ...pagination, page, limit });
    // Fetch data with new pagination
    getTrainerPaymentsData(
      selectedDates[0],
      selectedDates[1],
      status || null,
      page,
      limit
    );
  };

  const getParticularCustomerDetails = async () => {
    const payload = {
      email: selectedPaymentDetails.customer_email,
    };
    try {
      const response = await getCustomers(payload);
      const customer_details = response?.data?.data?.customers[0];
      console.log("customer full details", customer_details);
      setCustomerDetails(customer_details);
      setIsOpenCustomerDetailsDrawer(true);
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    }
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setStatus("");
    getTrainerPaymentsData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
      1,
      10
    );
  };

  return (
    <div>
      <Row style={{ marginBottom: "12px" }}>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={16}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getTrainerPaymentsData(
                    dates[0],
                    dates[1],
                    status || null,
                    1,
                    pagination.limit
                  );
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col
          xs={24}
          sm={24}
          md={24}
          lg={7}
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
            // onClick={() => {
            //   setIsOpenFilterDrawer(true);
            //   getTableColumnsData(loginUserId);
            // }}
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

      <Row>
        <Col span={16}>
          <div className="customers_scroll_wrapper">
            {/* <button
          onClick={() => scroll(-600)}
          className="customer_statusscroll_button"
        >
          <IoMdArrowDropleft size={25} />
        </button> */}
            <div className="customers_status_mainContainer" ref={scrollRef}>
              {" "}
              <div
                className={
                  status === ""
                    ? "trainers_active_all_container"
                    : "trainers_all_container"
                }
                onClick={() => {
                  if (status === "") {
                    return;
                  }
                  setStatus("");
                  setPagination({ ...pagination, page: 1 });
                  getTrainerPaymentsData(
                    selectedDates[0],
                    selectedDates[1],
                    null,
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>All {`( ${statusCounts.all} )`}</p>
              </div>
              <div
                className={
                  status === "Requested"
                    ? "trainers_active_formpending_container"
                    : "customers_feedback_container"
                }
                onClick={() => {
                  if (status === "Requested") {
                    return;
                  }
                  setStatus("Requested");
                  setPagination({ ...pagination, page: 1 });
                  getTrainerPaymentsData(
                    selectedDates[0],
                    selectedDates[1],
                    "Requested",
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>Requested {`( ${statusCounts.Requested} )`}</p>
              </div>
              <div
                className={
                  status === "Awaiting Finance"
                    ? "trainers_active_verifypending_container"
                    : "customers_studentvefity_container"
                }
                onClick={() => {
                  if (status === "Awaiting Finance") {
                    return;
                  }
                  setStatus("Awaiting Finance");
                  setPagination({ ...pagination, page: 1 });
                  getTrainerPaymentsData(
                    selectedDates[0],
                    selectedDates[1],
                    "Awaiting Finance",
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>
                  Awaiting Finance {`( ${statusCounts["Awaiting Finance"]} )`}
                </p>
              </div>
              <div
                className={
                  status === "Completed"
                    ? "trainers_active_verifiedtrainers_container"
                    : "customers_completed_container"
                }
                onClick={() => {
                  if (status === "Completed") {
                    return;
                  }
                  setStatus("Completed");
                  setPagination({ ...pagination, page: 1 });
                  getTrainerPaymentsData(
                    selectedDates[0],
                    selectedDates[1],
                    "Completed",
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>Completed {`( ${statusCounts.Completed} )`}</p>
              </div>
            </div>
            {/* <button
          onClick={() => scroll(600)}
          className="customer_statusscroll_button"
        >
          <IoMdArrowDropright size={25} />
        </button> */}
          </div>
        </Col>
        <Col
          span={8}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddRequestDrawer(true);
              setIsOpenAddRequestComponent(true);
            }}
          >
            Add Request
          </button>
        </Col>
      </Row>

      {/* Payment Requests Table */}
      <div style={{ marginTop: "12px" }}>
        <CommonTable
          scroll={{
            x: columns.reduce((total, col) => total + (col.width || 150), 0),
          }}
          columns={columns}
          dataSource={paymentRequestsData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
        />
      </div>

      <Drawer
        title="Add Request"
        open={isOpenAddRequestDrawer}
        onClose={() => {
          setIsOpenAddRequestDrawer(false);
          setEditRequestItem(null);
          setIsOpenAddRequestComponent(false);
        }}
        width="50%"
        className="customer_statusupdate_drawer"
        style={{ position: "relative", paddingBottom: 65 }}
      >
        {isOpenAddRequestComponent && (
          <AddTrainerPaymentRequest
            ref={addTrainerPaymentRequestUseRef}
            trainersData={trainersData}
            editRequestItem={editRequestItem}
            setButtonLoading={setButtonLoading}
            callgetTrainerPaymentsApi={() => {
              setIsOpenAddRequestDrawer(false);
              setEditRequestItem(null);
              setIsOpenAddRequestComponent(false);
              setPagination({
                page: 1,
              });
              setButtonLoading(false);
              getTrainerPaymentsData(
                selectedDates[0],
                selectedDates[1],
                status || null,
                1,
                pagination.limit
              );
            }}
          />
        )}

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={() =>
                  addTrainerPaymentRequestUseRef.current?.handleRequestSubmit()
                }
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* Payment Details Drawer */}
      <Drawer
        title="Update Status"
        open={isOpenDetailsDrawer}
        onClose={paymentformReset}
        width="50%"
        style={{ position: "relative", paddingBottom: "65px" }}
        className="customer_statusupdate_drawer"
      >
        {selectedPaymentDetails && (
          <>
            <Row
              gutter={16}
              style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
            >
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Bill Raise Date
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {moment(selectedPaymentDetails.bill_raisedate).format(
                        "DD/MM/YYYY"
                      )}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Trainer Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <EllipsisTooltip
                        text={
                          selectedPaymentDetails &&
                          selectedPaymentDetails.trainer_name
                            ? selectedPaymentDetails.trainer_name
                            : "-"
                        }
                        smallText={true}
                      />
                      <FaRegEye
                        size={16}
                        className="trainers_action_icons"
                        onClick={() => {
                          const clickedTrainer = trainersData.filter(
                            (f) => f.id == selectedPaymentDetails.trainer_id
                          );
                          console.log("clickedTrainer", clickedTrainer);
                          setClickedTrainerDetails(clickedTrainer);
                          setIsOpenTrainerDetailModal(true);
                        }}
                      />
                    </div>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Customer Name
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <EllipsisTooltip
                        text={
                          selectedPaymentDetails &&
                          selectedPaymentDetails.customer_name
                            ? selectedPaymentDetails.customer_name
                            : "-"
                        }
                        smallText={true}
                      />
                      <FaRegEye
                        size={16}
                        className="trainers_action_icons"
                        onClick={() => getParticularCustomerDetails(null)}
                      />
                    </div>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Commercial</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {selectedPaymentDetails &&
                      selectedPaymentDetails.request_amount !== undefined &&
                      selectedPaymentDetails.request_amount !== null
                        ? "₹" + selectedPaymentDetails.request_amount
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Commercial%</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {" "}
                      {selectedPaymentDetails &&
                      selectedPaymentDetails.commercial_percentage !==
                        undefined &&
                      selectedPaymentDetails.commercial_percentage !== null
                        ? selectedPaymentDetails.commercial_percentage + "%"
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Balance Amount
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ color: "#d32f2f", fontWeight: 700 }}
                    >
                      {selectedPaymentDetails &&
                      selectedPaymentDetails.balance_amount !== undefined &&
                      selectedPaymentDetails.balance_amount !== null
                        ? "₹" + selectedPaymentDetails.balance_amount
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Streams</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {selectedPaymentDetails && selectedPaymentDetails.streams
                        ? selectedPaymentDetails.streams
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Attendance Status
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {selectedPaymentDetails &&
                      selectedPaymentDetails.attendance_status
                        ? selectedPaymentDetails.attendance_status
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        {selectedPaymentDetails &&
                        selectedPaymentDetails.attendance_sheetlink
                          ? "Attendance Sheet Link"
                          : "Attendance Screenshot"}
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    {selectedPaymentDetails &&
                    selectedPaymentDetails.attendance_sheetlink ? (
                      <EllipsisTooltip
                        text={
                          selectedPaymentDetails &&
                          selectedPaymentDetails.attendance_sheetlink
                            ? selectedPaymentDetails.attendance_sheetlink
                            : "-"
                        }
                        smallText={true}
                      />
                    ) : (
                      <button
                        className="pendingcustomer_paymentscreenshot_viewbutton"
                        onClick={() => {
                          setIsOpenAttendanceScreenshotModal(true);
                          setViewAttendanceScreenshot(
                            selectedPaymentDetails.attendance_screenshot
                          );
                        }}
                      >
                        <FaRegEye size={16} /> View screenshot
                      </button>
                    )}
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Days Taken To Pay
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {selectedPaymentDetails &&
                      selectedPaymentDetails.days_taken_topay !== undefined &&
                      selectedPaymentDetails.days_taken_topay !== null
                        ? selectedPaymentDetails.days_taken_topay
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Deadline Date
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {selectedPaymentDetails &&
                      selectedPaymentDetails.deadline_date
                        ? moment(selectedPaymentDetails.deadline_date).format(
                            "DD/MM/YYYY"
                          )
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Divider className="customer_statusupdate_divider" />

            <div className="customer_statusupdate_adddetailsContainer">
              {drawerContentStatus == "Requested" ||
              drawerContentStatus == "Update Request" ? (
                <>
                  {paymentHistory.length >= 1 ? (
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          color: "#333",
                          fontSize: "16px",
                        }}
                      >
                        Payment History
                      </p>

                      <div>
                        <div
                          style={{ marginTop: "12px", marginBottom: "20px" }}
                        >
                          <Collapse
                            activeKey={collapseDefaultKey}
                            onChange={(keys) => setCollapseDefaultKey(keys)}
                            className="customer_updatepayment_history_collapse"
                          >
                            {paymentHistory.map((item, index) => {
                              const panelKey = String(index + 1); // convert to string
                              return (
                                <Collapse.Panel
                                  key={panelKey} // unique key
                                  header={
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        fontSize: "13px",
                                        alignItems: "center",
                                      }}
                                    >
                                      <span>
                                        Bill Raise Date -{" "}
                                        <span style={{ fontWeight: "500" }}>
                                          {moment(
                                            selectedPaymentDetails.bill_raisedate
                                          ).format("DD/MM/YYYY")}
                                        </span>
                                      </span>

                                      {item.finance_status === "Rejected" ? (
                                        <div className="customer_trans_statustext_container">
                                          <FaRegCircleXmark color="#d32f2f" />
                                          <p
                                            style={{
                                              color: "#d32f2f",
                                            }}
                                          >
                                            Rejected
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="customer_trans_statustext_container">
                                          <BsPatchCheckFill color="#3c9111" />
                                          <p
                                            style={{
                                              color: "#3c9111",
                                            }}
                                          >
                                            Verified
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  }
                                >
                                  <div style={{ padding: "0px 12px" }}>
                                    <Row
                                      gutter={16}
                                      style={{
                                        marginTop: "6px",
                                        marginBottom: "8px",
                                      }}
                                    >
                                      <Col span={12}>
                                        <Row>
                                          <Col span={12}>
                                            <div className="customerdetails_rowheadingContainer">
                                              <p className="customerdetails_rowheading">
                                                Paid Amount
                                              </p>
                                            </div>
                                          </Col>
                                          <Col span={12}>
                                            <p className="customerdetails_text">
                                              {"₹" + item.paid_amount}
                                            </p>
                                          </Col>
                                        </Row>
                                      </Col>

                                      <Col span={12}>
                                        <Row>
                                          <Col span={12}>
                                            <div className="customerdetails_rowheadingContainer">
                                              <p className="customerdetails_rowheading">
                                                Payment Type
                                              </p>
                                            </div>
                                          </Col>
                                          <Col span={12}>
                                            <p className="customerdetails_text">
                                              {item.payment_type}
                                            </p>
                                          </Col>
                                        </Row>
                                      </Col>
                                    </Row>

                                    {item.finance_status == "Rejected" ? (
                                      <>
                                        <Divider className="customer_statusupdate_divider" />
                                        <div
                                          style={{
                                            padding: "0px 12px 6px 0px",
                                          }}
                                        >
                                          <Row>
                                            <Col span={24}>
                                              <Row>
                                                <Col span={6}>
                                                  <div className="customerdetails_rowheadingContainer">
                                                    <p
                                                      className="customerdetails_rowheading"
                                                      style={{
                                                        color: "#d32f2f",
                                                      }}
                                                    >
                                                      Rejection Reason:
                                                    </p>
                                                  </div>
                                                </Col>
                                                <Col span={18}>
                                                  <p className="customerdetails_text">
                                                    {item.reject_reason}
                                                  </p>
                                                </Col>
                                              </Row>
                                            </Col>
                                          </Row>
                                        </div>
                                      </>
                                    ) : (
                                      <Row
                                        gutter={16}
                                        style={{
                                          marginTop: "16px",
                                          marginBottom: "12px",
                                        }}
                                      >
                                        <Col span={12}>
                                          <Row>
                                            <Col span={12}>
                                              <div className="customerdetails_rowheadingContainer">
                                                <p className="customerdetails_rowheading">
                                                  Paid Date
                                                </p>
                                              </div>
                                            </Col>
                                            <Col span={12}>
                                              <p className="customerdetails_text">
                                                {item.verified_date
                                                  ? moment(
                                                      item.verified_date
                                                    ).format("DD/MM/YYYY")
                                                  : "-"}
                                              </p>
                                            </Col>
                                          </Row>
                                        </Col>

                                        <Col span={12}>
                                          <Row>
                                            <Col span={12}>
                                              <div className="customerdetails_rowheadingContainer">
                                                <p className="customerdetails_rowheading">
                                                  Payment Screenshot
                                                </p>
                                              </div>
                                            </Col>
                                            <Col span={12}>
                                              <button
                                                className="pendingcustomer_paymentscreenshot_viewbutton"
                                                onClick={() => {
                                                  setIsOpenPaymentScreenshotModal(
                                                    true
                                                  );
                                                  setTransactionScreenshot(
                                                    item.payment_screenshot
                                                  );
                                                }}
                                              >
                                                <FaRegEye size={16} /> View
                                                screenshot
                                              </button>
                                            </Col>
                                          </Row>
                                        </Col>
                                      </Row>
                                    )}
                                  </div>
                                </Collapse.Panel>
                              );
                            })}
                          </Collapse>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <p className="customer_statusupdate_adddetails_heading">
                    Add Details
                  </p>

                  <Row
                    gutter={16}
                    style={{ marginTop: "20px", marginBottom: "40px" }}
                  >
                    <Col span={8}>
                      <CommonInputField
                        label="Pay Amount"
                        required={true}
                        onChange={handlePaidNow}
                        value={paidNow}
                        error={paidNowError}
                        errorFontSize="10px"
                      />
                    </Col>
                    <Col span={8}>
                      <CommonSelectField
                        label="Payment Type"
                        required={true}
                        options={paymentTypeOptions}
                        value={paymentType}
                        error={""}
                        disabled={true}
                      />
                    </Col>
                    <Col span={8}>
                      <CommonInputField
                        label="Balance Amount"
                        required={true}
                        value={balanceAmount}
                        disabled={true}
                        type="number"
                      />
                    </Col>
                  </Row>
                </>
              ) : (
                ""
              )}

              {drawerContentStatus == "Awaiting Finance" && (
                <div>
                  {paymentHistory.length >= 1 ? (
                    <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                      <Collapse
                        activeKey={collapseDefaultKey}
                        onChange={(keys) => setCollapseDefaultKey(keys)}
                        className="customer_updatepayment_history_collapse"
                      >
                        {paymentHistory.map((item, index) => {
                          return (
                            <Collapse.Panel
                              key={index + 1} // unique key
                              header={
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    fontSize: "13px",
                                    alignItems: "center",
                                  }}
                                >
                                  <span>
                                    Bill Raise Date -{" "}
                                    <span style={{ fontWeight: "500" }}>
                                      {moment(
                                        selectedPaymentDetails.bill_raisedate
                                      ).format("DD/MM/YYYY")}
                                    </span>
                                  </span>

                                  {item.finance_status === "Pending" ? (
                                    <div
                                      style={{ display: "flex", gap: "12px" }}
                                    >
                                      <Button
                                        className="customer_finance_rejectbutton"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePaymentReject(item.id);
                                        }}
                                      >
                                        Reject
                                      </Button>

                                      <Button
                                        className="customer_finance_verifybutton"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePaymentApprove(item.id);
                                        }}
                                      >
                                        Verify
                                      </Button>
                                    </div>
                                  ) : item.finance_status === "Rejected" ? (
                                    <div className="customer_trans_statustext_container">
                                      <FaRegCircleXmark color="#d32f2f" />
                                      <p
                                        style={{
                                          color: "#d32f2f",
                                          fontWeight: 500,
                                        }}
                                      >
                                        Rejected
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="customer_trans_statustext_container">
                                      <BsPatchCheckFill color="#3c9111" />
                                      <p
                                        style={{
                                          color: "#3c9111",
                                          fontWeight: 500,
                                        }}
                                      >
                                        Verified
                                      </p>
                                    </div>
                                  )}
                                </div>
                              }
                            >
                              <div style={{ padding: "0px 12px" }}>
                                <Row
                                  gutter={16}
                                  style={{
                                    marginTop: "6px",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <Col span={12}>
                                    <Row>
                                      <Col span={12}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p className="customerdetails_rowheading">
                                            Pay Amount
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <p className="customerdetails_text">
                                          {"₹" + item.paid_amount}
                                        </p>
                                      </Col>
                                    </Row>
                                  </Col>

                                  <Col span={12}>
                                    <Row>
                                      <Col span={12}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p className="customerdetails_rowheading">
                                            Payment Type
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <p className="customerdetails_text">
                                          {item.payment_type}
                                        </p>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>

                                {item.finance_status == "Approved" ? (
                                  <Row
                                    gutter={16}
                                    style={{
                                      marginTop: "16px",
                                      marginBottom: "12px",
                                    }}
                                  >
                                    <Col span={12}>
                                      <Row>
                                        <Col span={12}>
                                          <div className="customerdetails_rowheadingContainer">
                                            <p className="customerdetails_rowheading">
                                              Paid Date
                                            </p>
                                          </div>
                                        </Col>
                                        <Col span={12}>
                                          <p className="customerdetails_text">
                                            {item.verified_date
                                              ? moment(
                                                  item.verified_date
                                                ).format("DD/MM/YYYY")
                                              : "-"}
                                          </p>
                                        </Col>
                                      </Row>
                                    </Col>

                                    <Col span={12}>
                                      <Row>
                                        <Col span={12}>
                                          <div className="customerdetails_rowheadingContainer">
                                            <p className="customerdetails_rowheading">
                                              Payment Screenshot
                                            </p>
                                          </div>
                                        </Col>
                                        <Col span={12}>
                                          <button
                                            className="pendingcustomer_paymentscreenshot_viewbutton"
                                            onClick={() => {
                                              setIsOpenPaymentScreenshotModal(
                                                true
                                              );
                                              setTransactionScreenshot(
                                                item.payment_screenshot
                                              );
                                            }}
                                          >
                                            <FaRegEye size={16} /> View
                                            screenshot
                                          </button>
                                        </Col>
                                      </Row>
                                    </Col>
                                  </Row>
                                ) : (
                                  <Row
                                    gutter={16}
                                    style={{
                                      marginTop: "40px",
                                      marginBottom: "20px",
                                    }}
                                  >
                                    <Col span={12}>
                                      <ImageUploadCrop
                                        label="Payment Screenshot"
                                        aspect={1}
                                        maxSizeMB={1}
                                        required={true}
                                        value={paymentScreenShotBase64}
                                        onChange={(base64) =>
                                          setPaymentScreenShotBase64(base64)
                                        }
                                        onErrorChange={
                                          setPaymentScreenShotBase64Error
                                        } // ✅ pass setter directly
                                      />
                                      {paymentScreenShotBase64Error &&
                                      paymentValidationTrigger ? (
                                        <p
                                          style={{
                                            fontSize: "12px",
                                            color: "#d32f2f",
                                            marginTop: 4,
                                          }}
                                        >
                                          {`Payment Screenshot ${paymentScreenShotBase64Error}`}
                                        </p>
                                      ) : (
                                        ""
                                      )}
                                    </Col>
                                  </Row>
                                )}
                              </div>
                            </Collapse.Panel>
                          );
                        })}
                      </Collapse>

                      {isShowRejectPaymentCommentBox ? (
                        <div
                          style={{ marginTop: "12px", position: "relative" }}
                          id="customer_trainerreject_commentContainer"
                        >
                          <CommonTextArea
                            label="Comments"
                            required={true}
                            onChange={(e) => {
                              setRejectPaymentComments(e.target.value);
                              setRejectPaymentCommentsError(
                                addressValidator(e.target.value)
                              );
                            }}
                            value={rejectPaymentComments}
                            error={rejectPaymentCommentsError}
                          />
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    <p className="customer_trainerhistory_nodatatext">
                      No Data found
                    </p>
                  )}
                </div>
              )}
            </div>

            {drawerContentStatus == "Requested" ||
            drawerContentStatus == "Update Request" ? (
              <div className="leadmanager_tablefiler_footer">
                <div className="leadmanager_submitlead_buttoncontainer">
                  {buttonLoading ? (
                    <button className="users_adddrawer_loadingcreatebutton">
                      <CommonSpinner />
                    </button>
                  ) : (
                    <button
                      className="users_adddrawer_createbutton"
                      onClick={handlePaymentSubmit}
                    >
                      {drawerContentStatus == "Requested" ? "Submit" : "Update"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              ""
            )}
          </>
        )}
      </Drawer>

      {/* attendance screenshot modal */}
      <Modal
        title="Attendance Screenshot"
        open={isOpenAttendanceScreenshotModal}
        onCancel={() => {
          setIsOpenAttendanceScreenshotModal(false);
          setViewAttendanceScreenshot("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {viewAttendanceScreenshot ? (
              <img
                src={`data:image/png;base64,${viewAttendanceScreenshot}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>

      {/* payment screenshot modal */}
      <Modal
        title="Payment Screenshot"
        open={isOpenPaymentScreenshotModal}
        onCancel={() => {
          setIsOpenPaymentScreenshotModal(false);
          setTransactionScreenshot("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {transactionScreenshot ? (
              <img
                src={`data:image/png;base64,${transactionScreenshot}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>

      {/* customer fulldetails drawer */}
      <Drawer
        title="Customer Details"
        open={isOpenCustomerDetailsDrawer}
        onClose={() => {
          setIsOpenCustomerDetailsDrawer(false);
          setCustomerDetails(null);
        }}
        width="50%"
        style={{ position: "relative" }}
      >
        {isOpenCustomerDetailsDrawer ? (
          <ParticularCustomerDetails
            customerDetails={customerDetails}
            isCustomerPage={true}
          />
        ) : (
          ""
        )}
      </Drawer>

      {/* trainer fulldetails modal */}
      <Modal
        title="Trainer Full Details"
        open={isOpenTrainerDetailModal}
        onCancel={() => setIsOpenTrainerDetailModal(false)}
        footer={false}
        width="50%"
      >
        {clickedTrainerDetails.map((item, index) => {
          return (
            <Row gutter={16} style={{ marginTop: "20px" }}>
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegCircleUser size={15} color="gray" />
                      <p className="customerdetails_rowheading">HR Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={item.hr_head ? item.hr_head : "-"}
                      smallText={true}
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegCircleUser size={15} color="gray" />
                      <p className="customerdetails_rowheading">Trainer Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        item.name
                          ? `${item.name} (${
                              item.trainer_code ? item.trainer_code : "-"
                            })`
                          : "-"
                      }
                      smallText={true}
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <MdOutlineEmail size={15} color="gray" />
                      <p className="customerdetails_rowheading">Email</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip text={item.email} smallText={true} />
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <IoCallOutline size={15} color="gray" />
                      <p className="customerdetails_rowheading">Mobile</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">{item.mobile}</p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaWhatsapp size={15} color="gray" />
                      <p className="customerdetails_rowheading">Whatsapp</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">{item.whatsapp}</p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <IoLocationOutline size={15} color="gray" />
                      <p className="customerdetails_rowheading">Location</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">{item.location}</p>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Technology</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip text={item.technology} smallText={true} />
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Experience</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.overall_exp_year + " Years"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Relevent Experience
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.relavant_exp_year + " Years"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Avaibility Timing
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.availability_time
                        ? moment(item.availability_time, "HH:mm:ss").format(
                            "hh:mm A"
                          )
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Secondary Timing
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.secondary_time
                        ? moment(item.secondary_time, "HH:mm:ss").format(
                            "hh:mm A"
                          )
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Skills</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={item.skills.map((item) => item.name).join(", ")}
                      smallText={true}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          );
        })}
      </Modal>
    </div>
  );
}
