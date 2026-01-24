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
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { RedoOutlined } from "@ant-design/icons";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTable from "../Common/CommonTable";
import {
  approveTrainerPaymentTransaction,
  createTrainerPaymentTransaction,
  deleteTrainerPaymentRequest,
  getCustomers,
  getTrainerPayments,
  getTrainers,
  rejectTrainerPayment,
  updateTrainerPaymentTransaction,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
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
import ViewTrainerPaymentDetails from "./ViewTrainerPaymentDetails";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import { useSelector } from "react-redux";

export default function TrainerPayment() {
  const scrollRef = useRef();
  const addTrainerPaymentRequestUseRef = useRef();
  const permissions = useSelector((state) => state.userpermissions);
  //usestates
  const [trainerFilterId, setTrainerFilterId] = useState(null);
  const [trainerFilterType, setTrainerFilterType] = useState(1);
  const [isTrainerSelectFocused, setIsTrainerSelectFocused] = useState(false);
  const [dateFilterType, setDateFilterType] = useState("RaiseDate");
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
  //view
  const [isOpenViewDrawer, setIsOpenViewDrawer] = useState(false);
  //table data states
  const [paymentRequestsData, setPaymentRequestsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusCounts, setStatusCounts] = useState(null);
  // Payment details drawer states
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
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
  //delete request
  const [isOpenRequestDeleteModal, setIsOpenRequestDeleteModal] =
    useState(false);

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
      title: "Request Amount",
      key: "request_amount",
      dataIndex: "request_amount",
      width: 140,
      render: (text) => {
        return <p>{text ? `₹${parseFloat(text).toFixed(2)}` : "-"}</p>;
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
                              if (
                                permissions.includes("Raise Trainer Payment")
                              ) {
                                setIsOpenDetailsDrawer(true);
                                setDrawerContentStatus("Requested");
                                setSelectedPaymentDetails(record);
                                setPaymentHistory(record.transactions);
                                setCollapseDefaultKey(["1"]);
                              } else {
                                CommonMessage("error", "Access Denied");
                              }
                            }
                          }}
                        >
                          Raise Payment
                        </Checkbox>
                      ) : record.status === "Payment Rejected" ? (
                        <button
                          className="customers_finance_updatepayment_button"
                          onClick={() => {
                            if (permissions.includes("Raise Trainer Payment")) {
                              setDrawerContentStatus("Update Payment");
                              setIsOpenDetailsDrawer(true);
                              setSelectedPaymentDetails(record);
                              setPaymentHistory(record.payments);
                              setPaidNow(record.payments[0].paid_amount);
                              setPaymentType(record.payments[0].payment_type);
                              setCollapseDefaultKey(["1"]);
                              setBalanceAmount(
                                getBalanceAmount(
                                  isNaN(record.balance_amount)
                                    ? 0
                                    : record.balance_amount,
                                  isNaN(record.payments[0].paid_amount)
                                    ? 0
                                    : record.payments[0].paid_amount,
                                ),
                              );
                            } else {
                              CommonMessage("error", "Access Denied");
                            }
                          }}
                        >
                          Update Payment
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
                      record.status == "Payment Rejected" ? (
                        <Checkbox
                          className="server_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status == "Awaiting Finance") {
                              if (
                                permissions.includes("Verify Trainer Payment")
                              ) {
                                setIsOpenDetailsDrawer(true);
                                setDrawerContentStatus("Awaiting Finance");
                                setSelectedPaymentDetails(record);
                                setPaymentHistory(record.transactions);
                                setCollapseDefaultKey(["1"]);
                              } else {
                                CommonMessage("error", "Access Denied");
                              }
                              // getCustomerData(record.customer_id);
                            } else {
                              CommonMessage(
                                "warning",
                                "Payment not raised yet",
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
              ) : text === "Payment Rejected" ? (
                <div className="trainers_verifieddiv">
                  <Button className="trainers_rejected_button">
                    Payment Rejected
                  </Button>
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
                    `Unable to update in ${record.status} status`,
                  );
                }
              }}
            />
            <Tooltip
              placement="top"
              title="View Details"
              trigger={["hover", "click"]}
            >
              <FaRegEye
                size={15}
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenViewDrawer(true);
                  setSelectedPaymentDetails(record);
                }}
              />
            </Tooltip>

            {record.paid_amount == "0.00" && (
              <RiDeleteBinLine
                size={18}
                color="#d32f2f"
                className="trainers_action_icons"
                onClick={() => {
                  setSelectedPaymentDetails(record);
                  setIsOpenRequestDeleteModal(true);
                }}
              />
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (permissions.length >= 1) {
      if (!permissions.includes("Trainer Payment Page")) {
        navigate("/dashboard");
        return;
      }
      getTrainersData();
    }
    // Set loading to false initially - will be true when fetching real data
    // setTimeout(() => {
    //   setLoading(false);
    // }, 300);
  }, [permissions]);

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
          null,
          "RaiseDate",
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          null,
          1,
          10,
          true,
        );
      }, 300);
    }
  };

  const getTrainerPaymentsData = async (
    trainerId,
    dateType,
    startDate,
    endDate,
    status,
    pageNumber,
    pageLimit,
    callCustomerApi = false,
  ) => {
    setLoading(true);
    const payload = {
      trainer_id: trainerId,
      type: dateType,
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
      const responseData = response?.data?.data?.data || [];
      const paginationData = response?.data?.data?.pagination || {};
      const statusCountsData = response?.data?.data?.statusCount || {};

      // Set payment requests data
      setPaymentRequestsData(responseData);

      // Update pagination
      setPagination({
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 0,
      });

      // Update status counts
      setStatusCounts(statusCountsData);
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
    setIsOpenAddRequestComponent(true);
    setEditRequestItem(item);
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
      isNaN(value) ? 0 : value,
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
        priceValidator(isNaN(value) ? 0 : value, parseFloat(amt), true),
      );
    }
  };

  //payment submit
  const handlePaymentSubmit = async () => {
    setPaymentValidationTrigger(true);
    const paidAmountValidate = priceValidator(
      paidNow,
      parseFloat(selectedPaymentDetails.balance_amount),
      true,
    );

    setPaidNowError(paidAmountValidate);
    console.log("paidAmountValidate", paidAmountValidate);

    if (paidAmountValidate) return;
    setButtonLoading(true);

    const payload = {
      trainer_payment_id: selectedPaymentDetails.id,
      ...(drawerContentStatus == "Update Payment"
        ? { payment_trans_id: selectedPaymentDetails.payments[0].id }
        : {}),
      paid_amount: paidNow,
      payment_type: paymentType,
    };

    try {
      if (drawerContentStatus == "Update Payment") {
        await updateTrainerPaymentTransaction(payload);
      } else {
        await createTrainerPaymentTransaction(payload);
      }
      setTimeout(() => {
        CommonMessage("success", "Updated Successfully");
        paymentformReset();
        // Refresh the payment requests data
        getTrainerPaymentsData(
          trainerFilterId,
          dateFilterType,
          selectedDates[0],
          selectedDates[1],
          status || null,
          1,
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

  const handlePaymentApprove = async (payment_trans_id) => {
    setPaymentValidationTrigger(true);
    const paymentScreenshotValidate = selectValidator(paymentScreenShotBase64);

    setPaymentScreenShotBase64Error(paymentScreenshotValidate);

    if (paymentScreenshotValidate) return;

    setButtonLoading(true);

    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const today = new Date();

    const payload = {
      trainer_payment_id: selectedPaymentDetails.id,
      payment_trans_id: payment_trans_id,
      payment_screenshot: paymentScreenShotBase64,
      paid_date: formatToBackendIST(today),
      paid_by: convertAsJson?.user_id,
    };

    try {
      await approveTrainerPaymentTransaction(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated Successfully");
        paymentformReset();
        // Refresh the payment requests data
        getTrainerPaymentsData(
          trainerFilterId,
          dateFilterType,
          selectedDates[0],
          selectedDates[1],
          status || null,
          1,
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

  const handlePaymentReject = async (payment_trans_id) => {
    setIsShowRejectPaymentCommentBox(true);
    setTimeout(() => {
      const container = document.getElementById(
        "customer_trainerreject_commentContainer",
      );
      container.scrollIntoView({ behavior: "smooth" });
    }, 200);

    const commentValidate = addressValidator(rejectPaymentComments);

    setRejectPaymentCommentsError(commentValidate);

    if (commentValidate) return;

    const today = new Date();

    const payload = {
      trainer_payment_id: selectedPaymentDetails.id,
      payment_trans_id: payment_trans_id,
      rejected_reason: rejectPaymentComments,
      rejected_date: formatToBackendIST(today),
    };

    try {
      await rejectTrainerPayment(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated Successfully");
        paymentformReset();
        // Refresh the payment requests data
        getTrainerPaymentsData(
          trainerFilterId,
          dateFilterType,
          selectedDates[0],
          selectedDates[1],
          status || null,
          1,
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

  const handleRequestDelete = async () => {
    setButtonLoading(true);
    try {
      await deleteTrainerPaymentRequest(selectedPaymentDetails.id);
      setTimeout(() => {
        setIsOpenRequestDeleteModal(false);
        setButtonLoading(false);
        getTrainerPaymentsData(
          trainerFilterId,
          dateFilterType,
          selectedDates[0],
          selectedDates[1],
          status || null,
          1,
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
      trainerFilterId,
      dateFilterType,
      selectedDates[0],
      selectedDates[1],
      status || null,
      page,
      limit,
    );
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setStatus("");
    setTrainerFilterId(null);
    setTrainerFilterType(1);
    setDateFilterType("RaiseDate");
    getTrainerPaymentsData(
      null,
      "RaiseDate",
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
      1,
      10,
    );
  };

  return (
    <div>
      <Row style={{ marginBottom: "12px" }}>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={8}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <CommonSelectField
                    label="Select Trainer"
                    required={true}
                    height="35px"
                    labelMarginTop="0px"
                    labelFontSize="13px"
                    options={trainersData}
                    onChange={(e) => {
                      console.log("traineeeee", e.target.value);
                      setTrainerFilterId(e.target.value);
                      getTrainerPaymentsData(
                        e.target.value,
                        dateFilterType,
                        selectedDates[0],
                        selectedDates[1],
                        status || null,
                        1,
                        pagination.limit,
                      );
                    }}
                    value={trainerFilterId}
                    error={""}
                    disableClearable={false}
                    onFocus={() => setIsTrainerSelectFocused(true)}
                    onBlur={() => setIsTrainerSelectFocused(false)}
                    borderRightNone={true}
                    showLabelStatus={
                      trainerFilterType == 1
                        ? "Name"
                        : trainerFilterType == 2
                          ? "Trainer Id"
                          : trainerFilterType == 3
                            ? "Email"
                            : "Mobile"
                    }
                  />
                </div>

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
                          value={trainerFilterType}
                          onChange={(e) => {
                            console.log(e.target.value);
                            setTrainerFilterType(e.target.value);
                          }}
                        >
                          <Radio
                            value={1}
                            style={{
                              marginTop: "6px",
                              marginBottom: "12px",
                            }}
                          >
                            Search by Name
                          </Radio>
                          <Radio value={2} style={{ marginBottom: "12px" }}>
                            Search by Trainer Id
                          </Radio>
                          <Radio value={3} style={{ marginBottom: "12px" }}>
                            Search by Email
                          </Radio>
                          <Radio value={4} style={{ marginBottom: "12px" }}>
                            Search by Mobile
                          </Radio>
                        </Radio.Group>
                      }
                    >
                      <Button
                        className="customer_trainermappingfilter_container"
                        style={{
                          borderLeftColor: isTrainerSelectFocused && "#5b69ca",
                          height: "35px",
                        }}
                      >
                        <IoFilter size={16} />
                      </Button>
                    </Tooltip>
                  </Flex>
                </div>
              </div>
            </Col>
            <Col span={10}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <CommonMuiCustomDatePicker
                    value={selectedDates}
                    onDateChange={(dates) => {
                      setSelectedDates(dates);
                      setPagination({
                        page: 1,
                      });
                      getTrainerPaymentsData(
                        trainerFilterId,
                        dateFilterType,
                        dates[0],
                        dates[1],
                        status || null,
                        1,
                        pagination.limit,
                      );
                    }}
                  />
                </div>

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
                          value={dateFilterType}
                          onChange={(e) => {
                            console.log(e.target.value);
                            setDateFilterType(e.target.value);
                            getTrainerPaymentsData(
                              trainerFilterId,
                              e.target.value,
                              selectedDates[0],
                              selectedDates[1],
                              status || null,
                              1,
                              pagination.limit,
                            );
                          }}
                        >
                          <Radio
                            value="RaiseDate"
                            style={{
                              marginTop: "6px",
                              marginBottom: "12px",
                            }}
                          >
                            Search by Bill Raise Date
                          </Radio>
                          <Radio
                            value="Deadline"
                            style={{ marginBottom: "12px" }}
                          >
                            Search by Deadline Date
                          </Radio>
                        </Radio.Group>
                      }
                    >
                      <Button
                        className="customer_trainermappingfilter_container"
                        style={{
                          // borderLeftColor: isTrainerSelectFocused && "#5b69ca",
                          height: "35px",
                        }}
                      >
                        <IoFilter size={16} />
                      </Button>
                    </Tooltip>
                  </Flex>
                </div>
              </div>
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
        <Col span={18}>
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
                    trainerFilterId,
                    dateFilterType,
                    selectedDates[0],
                    selectedDates[1],
                    null,
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  All{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.total !== undefined &&
                    statusCounts.total !== null
                      ? statusCounts.total
                      : "-"
                  } )`}
                </p>
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
                    trainerFilterId,
                    dateFilterType,
                    selectedDates[0],
                    selectedDates[1],
                    "Requested",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Requested{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.requested !== undefined &&
                    statusCounts.requested !== null
                      ? statusCounts.requested
                      : "-"
                  } )`}
                </p>
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
                    trainerFilterId,
                    dateFilterType,
                    selectedDates[0],
                    selectedDates[1],
                    "Awaiting Finance",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Awaiting Finance{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.awaiting_finance !== undefined &&
                    statusCounts.awaiting_finance !== null
                      ? statusCounts.awaiting_finance
                      : "-"
                  } )`}
                </p>
              </div>
              <div
                className={
                  status === "Payment Rejected"
                    ? "customers_active_escalated_container"
                    : "customers_escalated_container"
                }
                onClick={() => {
                  if (status === "Payment Rejected") {
                    return;
                  }
                  setStatus("Payment Rejected");
                  setPagination({ ...pagination, page: 1 });
                  getTrainerPaymentsData(
                    trainerFilterId,
                    dateFilterType,
                    selectedDates[0],
                    selectedDates[1],
                    "Payment Rejected",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Payment Rejected{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.payment_rejected !== undefined &&
                    statusCounts.payment_rejected !== null
                      ? statusCounts.payment_rejected
                      : "-"
                  } )`}
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
                    trainerFilterId,
                    dateFilterType,
                    selectedDates[0],
                    selectedDates[1],
                    "Completed",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Completed{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.completed !== undefined &&
                    statusCounts.completed !== null
                      ? statusCounts.completed
                      : "-"
                  } )`}
                </p>
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
          span={6}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {permissions.includes("Add Trainer Payment Request") ? (
            <button
              className="leadmanager_addleadbutton"
              onClick={() => {
                setIsOpenAddRequestDrawer(true);
                setIsOpenAddRequestComponent(true);
              }}
            >
              Add Request
            </button>
          ) : (
            ""
          )}
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
                trainerFilterId,
                dateFilterType,
                selectedDates[0],
                selectedDates[1],
                status || null,
                1,
                pagination.limit,
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
                {editRequestItem ? "Update" : "Submit"}
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
            <ViewTrainerPaymentDetails
              selectedPaymentDetails={selectedPaymentDetails}
              trainersData={trainersData}
              isShowPaymentDetails={false}
            />
            <div className="customer_statusupdate_adddetailsContainer">
              {drawerContentStatus == "Requested" ||
              drawerContentStatus == "Update Payment" ? (
                <>
                  {selectedPaymentDetails.payments.length >= 1 ? (
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
                            {selectedPaymentDetails.payments.map(
                              (item, index) => {
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
                                              selectedPaymentDetails.bill_raisedate,
                                            ).format("DD/MM/YYYY")}
                                          </span>
                                        </span>

                                        {item.status === "Rejected" ? (
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

                                      {item.status == "Rejected" ? (
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
                                                      {item.reason}
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
                                                  {item.paid_date
                                                    ? moment(
                                                        item.paid_date,
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
                                                      true,
                                                    );
                                                    setTransactionScreenshot(
                                                      item.payment_screenshot,
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
                              },
                            )}
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
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#333",
                      fontSize: "16px",
                    }}
                  >
                    Payment Details
                  </p>
                  {selectedPaymentDetails.payments.length >= 1 ? (
                    <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                      <Collapse
                        activeKey={collapseDefaultKey}
                        onChange={(keys) => setCollapseDefaultKey(keys)}
                        className="customer_updatepayment_history_collapse"
                      >
                        {selectedPaymentDetails.payments.map((item, index) => {
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
                                        selectedPaymentDetails.bill_raisedate,
                                      ).format("DD/MM/YYYY")}
                                    </span>
                                  </span>

                                  {item.status === "Pending" ? (
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
                                  ) : item.status === "Rejected" ? (
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

                                {item.status == "Completed" ? (
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
                                            {item.paid_date
                                              ? moment(item.paid_date).format(
                                                  "DD/MM/YYYY",
                                                )
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
                                                true,
                                              );
                                              setTransactionScreenshot(
                                                item.payment_screenshot,
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
                                addressValidator(e.target.value),
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
            drawerContentStatus == "Update Payment" ? (
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

      {/* view payment details drawer */}
      <Drawer
        title="Trainer Payment Details"
        open={isOpenViewDrawer}
        onClose={() => {
          setIsOpenViewDrawer(false);
          setSelectedPaymentDetails(null);
        }}
        width="50%"
        style={{ position: "relative", paddingBottom: "65px" }}
        className="customer_statusupdate_drawer"
      >
        {isOpenViewDrawer ? (
          <ViewTrainerPaymentDetails
            selectedPaymentDetails={selectedPaymentDetails}
            trainersData={trainersData}
          />
        ) : (
          ""
        )}
      </Drawer>

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

      {/* delete request modal */}
      <CommonDeleteModal
        open={isOpenRequestDeleteModal}
        onCancel={() => {
          setIsOpenRequestDeleteModal(false);
          setSelectedPaymentDetails(null);
        }}
        content="Are you sure want to delete the Request?"
        loading={buttonLoading}
        onClick={handleRequestDelete}
      />
    </div>
  );
}
