import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, Drawer, Flex, Radio, Modal } from "antd";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { FiFilter } from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";
import { RedoOutlined } from "@ant-design/icons";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { LuIndianRupee } from "react-icons/lu";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTable from "../Common/CommonTable";
import {
  getCustomerById,
  getCustomers,
  getTrainerPayments,
  getTrainers,
  insertTrainerPaymentRequest,
  updateTrainerPaymentRequest,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  getCurrentandPreviousweekDate,
  selectValidator,
} from "../Common/Validation";
import moment from "moment";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSpinner from "../Common/CommonSpinner";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import CommonCustomerSelectField from "../Common/CommonCustomerSelect";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import { CommonMessage } from "../Common/CommonMessage";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import PrismaZoom from "react-prismazoom";

export default function TrainerPayment() {
  const scrollRef = useRef();
  //usestates
  const [selectedDates, setSelectedDates] = useState([]);
  const [status, setStatus] = useState("");
  const [isOpenAddRequestDrawer, setIsOpenAddRequestDrawer] = useState(false);
  //select trainer usestates
  const [trainersData, setTrainersData] = useState([]);
  const [trainerId, setTrainerId] = useState(null);
  const [trainerIdError, setTrainerIdError] = useState("");
  const [trainerType, setTrainerType] = useState("");
  const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
  const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
    useState(false);
  //form usestates
  const [requestId, setRequestId] = useState(null);
  const [billRaiseDate, setBillRaiseDate] = useState(null);
  const [billRaiseDateError, setBillRaiseDateError] = useState(null);
  const streamOptions = [
    { id: "Online", name: "Online" },
    { id: "Chennai", name: "Chennai" },
    { id: "Bangalore", name: "Bangalore" },
  ];
  const [streamId, setStreamId] = useState("");
  const [streamIdError, setStreamIdError] = useState("");
  const attendanceStatusOptions = [
    { id: "V Completed", name: "V Completed" },
    { id: "ST SHT INC", name: "ST SHT INC" },
    { id: "Class Not Completed", name: "Class Not Completed" },
  ];
  const [attendanceStatusId, setAttendanceStatusId] = useState("");
  const [attendanceStatusIdError, setAttendanceStatusIdError] = useState("");
  const attendanceTypeOptions = [
    { id: "Link", name: "Link" },
    { id: "Screenshot", name: "Screenshot" },
  ];
  const [attendanceType, setAttendanceType] = useState("Link");
  const [attendanceTypeError, setAttendanceTypeError] = useState("");
  const [attendanceScreenShotBase64, setAttendanceScreenShotBase64] =
    useState("");
  const [attendanceScreenShotBase64Error, setAttendanceScreenShotBase64Error] =
    useState("");
  const [attendanceSheetLink, setAttendanceSheetLink] = useState("");
  const [attendanceSheetLinkError, setAttendanceSheetLinkError] = useState("");
  const [commercial, setCommercial] = useState(null);
  const [commercialError, setCommercialError] = useState();
  const [commercialPercentage, setCommercialPercentage] = useState("");
  const [daysTakenToPay, setDaysTakenToPay] = useState("");
  const [deadLineDate, setDeadLineDate] = useState(null);
  const [customersData, setCustomersData] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerError, setSelectedCustomerError] = useState("");
  const [customerSearchText, setCustomerSearchText] = useState("");
  const [requestComments, setRequsetComments] = useState("");
  const [requestCommentsError, setRequsetCommentsError] = useState("");
  const [isOpenCustomerDetailsDrawer, setIsOpenCustomerDetailsDrawer] =
    useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [validationTrigger, setValidationTrigger] = useState(false);
  //pagination
  const [customerPage, setCustomerPage] = useState(1);
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [customerSelectloading, setCustomerSelectloading] = useState(false);
  const [candidateIdError, setCandidateIdError] = useState("");
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
      width: 140,
      fixed: "right",
      render: (text) => {
        return (
          <Flex style={{ whiteSpace: "nowrap" }}>
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
                <Button className="trainers_verified_button">Completed</Button>
              </div>
            ) : (
              <p style={{ marginLeft: "6px" }}>-</p>
            )}
          </Flex>
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
            {/* <Tooltip placement="top" title="View Details">
              <FaRegEye
                size={18}
                className="trainers_action_icons"
                onClick={() => {
                  setSelectedPaymentDetails(record);
                  setIsOpenDetailsDrawer(true);
                }}
              />
            </Tooltip> */}
            <AiOutlineEdit
              size={18}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
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
        if (callCustomerApi) {
          getCustomersData(null, 1);
        }
      }, 300);
    }
  };

  const buildCustomerSearchPayload = (value) => {
    if (!value) return {};

    const trimmed = value.trim();

    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return { email: trimmed };
    }

    // Mobile (6–15 digits)
    if (/^\d{6,15}$/.test(trimmed)) {
      return { mobile: trimmed };
    }

    // Name
    return { name: trimmed };
  };

  const getCustomersData = async (searchvalue, pageNumber = 1) => {
    setCustomerSelectloading(true);

    const searchPayload = buildCustomerSearchPayload(searchvalue);

    const payload = {
      ...searchPayload,
      user_ids: null,
      page: pageNumber,
      limit: 10,
    };

    try {
      const response = await getCustomers(payload);
      const customers = response?.data?.data?.customers || [];
      const pagination = response?.data?.data?.pagination;

      setCustomersData((prev) =>
        pageNumber == 1 ? customers : [...prev, ...customers]
      );

      setCustomerHasMore(pageNumber < pagination.totalPages);
      setCustomerPage(pageNumber);
    } catch (error) {
      console.log("get customers error", error);
    } finally {
      setCustomerSelectloading(false);
    }
  };

  //customer select onchange functions
  // 🔍 Search while typing
  const handleCustomerSearch = (value) => {
    setCustomerSearchText(value);
    setCustomerPage(1);
    setCustomerHasMore(true);
    setCustomersData([]);
    getCustomersData(value, 1);
  };

  // ✅ Select option
  const handleCustomerSelect = (event, option) => {
    if (!option) return;

    setSelectedCustomer(option);
    if (validationTrigger) {
      setSelectedCustomerError(selectValidator(option));
    }
    setCustomerId(option.id);
    getParticularCustomerDetails(option.email);
  };

  // ⬇ Load first page when opened
  const handleCustomerDropdownOpen = () => {
    if (customersData.length === 0) getCustomersData(null, 1);
  };

  // ⬇ Infinite scroll
  const handleCustomerScroll = (e) => {
    const listbox = e.target;

    if (
      listbox.scrollTop + listbox.clientHeight >= listbox.scrollHeight - 5 &&
      customerHasMore &&
      !customerSelectloading
    ) {
      getCustomersData(customerSearchText, customerPage + 1);
    }
  };

  const getParticularCustomerDetails = async (
    customerEmail,
    isEdit = false
  ) => {
    const payload = {
      email: customerEmail ? customerEmail : selectedCustomer.email,
    };
    try {
      const response = await getCustomers(payload);
      const customer_details = response?.data?.data?.customers[0];
      console.log("customer full details", customer_details);
      setCustomerDetails(customer_details);
      if (customerEmail) {
        setIsOpenCustomerDetailsDrawer(false);
      } else {
        setIsOpenCustomerDetailsDrawer(true);
      }
      if (isEdit) {
        setSelectedCustomer(customer_details);
      }
      //mapping trainer details
      if (customer_details.trainer_verified_date) {
        setTrainerId(customer_details?.trainer_id ?? null);
        setTrainerIdError("");
        setCommercial(customer_details?.commercial ?? "");
        setCommercialPercentage(
          customer_details?.commercial_percentage !== null &&
            customer_details?.commercial_percentage !== undefined &&
            customer_details?.commercial_percentage !== ""
            ? customer_details.commercial_percentage
            : ""
        );
      } else if (customerEmail) {
        setTrainerId(null);
        if (validationTrigger) {
          setTrainerIdError(" is required");
        }
        setCommercial("");
        setCommercialPercentage("");
        CommonMessage("error", "Trainer not Assigned or Verified Yet");
      }
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    }
  };

  const getDayDifference = (inputDate) => {
    const today = new Date();
    const given = new Date(inputDate);

    // normalize both to UTC midnight
    const utcToday = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const utcGiven = Date.UTC(
      given.getFullYear(),
      given.getMonth(),
      given.getDate()
    );

    const diffTime = utcToday - utcGiven; // today - past date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays < 0 ? 0 : diffDays;
  };

  const addWorkingDays = (startDate, workingDays) => {
    let date = new Date(startDate);
    let addedDays = 0;

    while (addedDays < workingDays) {
      date.setDate(date.getDate() + 1);

      const day = date.getDay();
      // 0 = Sunday, 6 = Saturday

      if (day !== 0 && day !== 6) {
        addedDays++;
      }
    }

    return date;
  };

  const handleEdit = (item) => {
    setIsOpenAddRequestDrawer(true);
    setRequestId(item.id);
    setBillRaiseDate(item.bill_raisedate);
    setStreamId(item.streams);
    setAttendanceStatusId(item.attendance_status);
    setAttendanceSheetLink(item.attendance_sheetlink);
    setAttendanceScreenShotBase64(item.attendance_screenshot);
    if (item.attendance_sheetlink) {
      setAttendanceType("Link");
    } else {
      setAttendanceType("Screenshot");
    }
    setTrainerId(item.trainer_id);
    setDaysTakenToPay(item.days_taken_topay);
    setDeadLineDate(item.deadline_date);
    getParticularCustomerDetails(item.customer_email, true);
  };

  const handleRequestSubmit = async () => {
    setValidationTrigger(true);
    const raiseDateValidate = selectValidator(billRaiseDate);
    const streamValidate = selectValidator(streamId);
    const attendanceStatusIdValidate = selectValidator(attendanceStatusId);
    const attendanceTypeValidate = selectValidator(attendanceType);
    const trainerValidate = selectValidator(trainerId);
    let attendanceSheetValidate;
    let attendanceScreenshotValidate;

    if (attendanceType == "Link") {
      attendanceSheetValidate = addressValidator(attendanceSheetLink);
      attendanceScreenshotValidate = "";
    } else {
      attendanceSheetValidate = "";
      attendanceScreenshotValidate = selectValidator(
        attendanceScreenShotBase64
      );
    }

    setBillRaiseDateError(raiseDateValidate);
    setStreamIdError(streamValidate);
    setAttendanceStatusIdError(attendanceStatusIdValidate);
    setAttendanceTypeError(attendanceTypeValidate);
    setAttendanceSheetLinkError(attendanceSheetValidate);
    setAttendanceScreenShotBase64Error(attendanceScreenshotValidate);
    setTrainerIdError(trainerValidate);

    if (
      raiseDateValidate ||
      streamValidate ||
      attendanceStatusIdValidate ||
      attendanceTypeValidate ||
      attendanceSheetValidate ||
      attendanceScreenshotValidate ||
      trainerValidate
    )
      return;

    setButtonLoading(true);
    const today = new Date();
    const payload = {
      ...(requestId && { id: requestId }),
      bill_raisedate: moment(billRaiseDate).format("YYYY-MM-DD"),
      streams: streamId,
      attendance_status: attendanceStatusId,
      ...(attendanceType == "Link"
        ? { attendance_sheetlink: attendanceSheetLink }
        : { attendance_screenshot: attendanceScreenShotBase64 }),
      customer_id: selectedCustomer.id,
      trainer_id: trainerId,
      request_amount: commercial,
      commercial_percentage: commercialPercentage,
      days_taken_topay: daysTakenToPay,
      deadline_date: moment(deadLineDate).format("YYYY-MM-DD"),
      status: "Requested",
      created_date: formatToBackendIST(today),
    };
    console.log("payloaddd", payload);
    // setButtonLoading(false);
    // return;

    if (requestId) {
      try {
        await updateTrainerPaymentRequest(payload);
        setTimeout(() => {
          CommonMessage("success", "Updated Successfully");
          formReset();
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
    } else {
      try {
        await insertTrainerPaymentRequest(payload);
        setTimeout(() => {
          CommonMessage("success", "Requested Successfully");
          formReset();
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
    }
  };

  const formReset = () => {
    setIsOpenAddRequestDrawer(false);
    setButtonLoading(false);
    setRequestId(null);
    setBillRaiseDate(null);
    setBillRaiseDateError("");
    setStreamId("");
    setStreamIdError("");
    setAttendanceStatusId("");
    setAttendanceStatusIdError("");
    setAttendanceType("Link");
    setAttendanceTypeError("");
    setAttendanceScreenShotBase64("");
    setAttendanceScreenShotBase64Error("");
    setAttendanceSheetLink("");
    setAttendanceSheetLinkError("");
    setCommercial("");
    setCommercialError("");
    setCommercialPercentage("");
    setTrainerId(null);
    setTrainerIdError("");
    setDaysTakenToPay("");
    setDeadLineDate(null);
    setCustomerId(null);
    setCandidateIdError("");
    setCustomerSearchText("");
    setSelectedCustomer(null);
    setSelectedCustomerError("");
    setRequsetComments("");
    setRequsetCommentsError("");
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
        onClose={formReset}
        width="50%"
        style={{ position: "relative", paddingBottom: 65 }}
      >
        <Row gutter={16} style={{ marginTop: "14px" }}>
          <Col span={8}>
            <CommonMuiDatePicker
              label="Bill Raise Date"
              required={true}
              onChange={(value) => {
                setBillRaiseDate(value);
                console.log("raise date", value);
                const days_taken = getDayDifference(value);
                console.log("days_taken", days_taken);
                setDaysTakenToPay(days_taken);
                const deadline = addWorkingDays(value, 14);
                console.log("deadline", deadline);
                setDeadLineDate(deadline);
                if (validationTrigger) {
                  setBillRaiseDateError(selectValidator(value));
                }
              }}
              value={billRaiseDate}
              error={billRaiseDateError}
              disablePreviousDates={false}
            />
          </Col>

          <Col span={8}>
            <CommonSelectField
              label="Streams"
              options={streamOptions}
              required={true}
              onChange={(e) => {
                setStreamId(e.target.value);
                if (validationTrigger) {
                  setStreamIdError(selectValidator(e.target.value));
                }
              }}
              value={streamId}
              error={streamIdError}
            />
          </Col>

          <Col span={8}>
            <CommonSelectField
              label="Attendance Status"
              options={attendanceStatusOptions}
              required={true}
              onChange={(e) => {
                setAttendanceStatusId(e.target.value);
                if (validationTrigger) {
                  setAttendanceStatusIdError(selectValidator(e.target.value));
                }
              }}
              value={attendanceStatusId}
              error={attendanceStatusIdError}
              errorFontSize={"10px"}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonSelectField
              label="Attendance Type"
              required={true}
              options={attendanceTypeOptions}
              onChange={(e) => {
                setAttendanceType(e.target.value);
                if (validationTrigger) {
                  setAttendanceTypeError(selectValidator(e.target.value));
                }
              }}
              value={attendanceType}
              error={attendanceTypeError}
            />
          </Col>
          <Col span={8}>
            {attendanceType == "Link" ? (
              <CommonInputField
                label="Attendance Sheet Link"
                required={true}
                onChange={(e) => {
                  setAttendanceSheetLink(e.target.value);
                  if (validationTrigger) {
                    setAttendanceSheetLinkError(
                      addressValidator(e.target.value)
                    );
                  }
                }}
                value={attendanceSheetLink}
                error={attendanceSheetLinkError}
                errorFontSize={"9px"}
              />
            ) : (
              <>
                <ImageUploadCrop
                  label="Attendance Screenshot"
                  aspect={1}
                  maxSizeMB={1}
                  required={true}
                  value={attendanceScreenShotBase64}
                  onChange={(base64) => setAttendanceScreenShotBase64(base64)}
                  onErrorChange={setAttendanceScreenShotBase64Error} // ✅ pass setter directly
                />
                {attendanceScreenShotBase64Error && validationTrigger ? (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#d32f2f",
                      marginTop: 4,
                    }}
                  >
                    {`Attendance Screenshot ${attendanceScreenShotBase64Error}`}
                  </p>
                ) : (
                  ""
                )}
              </>
            )}
          </Col>
          <Col span={8}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1 }}>
                <CommonCustomerSelectField
                  label="Select Customer"
                  required={true}
                  options={customersData}
                  value={selectedCustomer}
                  onChange={handleCustomerSelect}
                  onInputChange={handleCustomerSearch}
                  onDropdownOpen={handleCustomerDropdownOpen}
                  onDropdownScroll={handleCustomerScroll}
                  loading={customerSelectloading}
                  showLabelStatus="Name"
                  onBlur={() => {
                    getCustomersData(null, 1);
                  }}
                  error={selectedCustomerError}
                />
              </div>
              {selectedCustomer && (
                <Tooltip
                  placement="top"
                  title="View Customer Details"
                  trigger={["hover", "click"]}
                >
                  <FaRegEye
                    size={16}
                    className="trainers_action_icons"
                    onClick={() => getParticularCustomerDetails(null)}
                  />
                </Tooltip>
              )}
            </div>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonOutlinedInput
              label="Commercial"
              type="number"
              required={true}
              onChange={(e) => {
                setCommercial(e.target.value);
                if (validationTrigger) {
                  setCommercialError(selectValidator(e.target.value));
                }
              }}
              value={commercial}
              error={commercialError}
              icon={<LuIndianRupee size={16} />}
              disabled={true}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Commercial %"
              type="number"
              required={true}
              value={
                commercialPercentage !== "" ? String(commercialPercentage) : ""
              }
              disabled={true}
            />
          </Col>
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
                  label="Trainer"
                  required={true}
                  options={trainersData}
                  onChange={(e) => {
                    setTrainerId(e.target.value);
                    if (validationTrigger) {
                      setTrainerIdError(selectValidator(e.target.value));
                    }
                    // getCustomerByTrainerIdData(e.target.value, 0);
                  }}
                  value={trainerId}
                  error={trainerIdError}
                  disabled={true}
                />
              </div>
              {trainerId && (
                <Tooltip
                  placement="top"
                  title="View Trainer Details"
                  trigger={["hover", "click"]}
                >
                  <FaRegEye
                    size={16}
                    className="trainers_action_icons"
                    onClick={() => {
                      const clickedTrainer = trainersData.filter(
                        (f) => f.id == trainerId
                      );
                      console.log("clickedTrainer", clickedTrainer);
                      setTrainerType(
                        clickedTrainer.length >= 1 &&
                          clickedTrainer[0].trainer_type
                          ? clickedTrainer[0].trainer_type
                          : ""
                      );
                      setClickedTrainerDetails(clickedTrainer);
                      setIsOpenTrainerDetailModal(true);
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonInputField
              label="Days Taken To Pay"
              required={true}
              onChange={(e) => {
                const input = e.target.value;

                // Allow numbers, decimal point, or empty string
                if (!/^\d*\.?\d*$/.test(input)) return;

                setDaysTakenToPay(input);
              }}
              value={daysTakenToPay}
              error={""}
              disabled={true}
            />
          </Col>
          <Col span={8}>
            <CommonMuiDatePicker
              label="Deadline Date"
              required={true}
              onChange={(value) => {
                setDeadLineDate(value);
              }}
              value={deadLineDate}
              error={""}
              disablePreviousDates={true}
              disabled={true}
            />
          </Col>
          {/* <Col span={8}>
            <CommonInputField
              label="Comments"
              required={true}
              multiline={true}
              onChange={(e) => {
                setRequsetComments(e.target.value);
                setRequsetCommentsError(addressValidator(e.target.value));
              }}
              value={requestComments}
              error={requestCommentsError}
            />
          </Col> */}
        </Row>

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={handleRequestSubmit}
              >
                Submit
              </button>
            )}
          </div>
        </div>
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

      {/* Payment Details Drawer */}
      <Drawer
        title="Payment Request Details"
        open={isOpenDetailsDrawer}
        onClose={() => {
          setIsOpenDetailsDrawer(false);
          setSelectedPaymentDetails(null);
        }}
        width="50%"
        style={{ position: "relative" }}
      >
        {selectedPaymentDetails && (
          <>
            <Row gutter={16} style={{ marginTop: "0px" }}>
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
                    <EllipsisTooltip
                      text={
                        selectedPaymentDetails &&
                        selectedPaymentDetails.trainer_name
                          ? selectedPaymentDetails.trainer_name
                          : "-"
                      }
                      smallText={true}
                    />
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
                    <EllipsisTooltip
                      text={
                        selectedPaymentDetails &&
                        selectedPaymentDetails.customer_name
                          ? selectedPaymentDetails.customer_name
                          : "-"
                      }
                      smallText={true}
                    />
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
                    <p className="customerdetails_text">14%</p>
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
    </div>
  );
}
