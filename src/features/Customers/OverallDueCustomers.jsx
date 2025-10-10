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
  Collapse,
  Modal,
} from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import {
  customerDuePayment,
  getPendingFeesCustomers,
  inserCustomerTrack,
} from "../ApiService/action";
import {
  formatToBackendIST,
  getBalanceAmount,
  getConvenienceFees,
  getCurrentandPreviousweekDate,
  priceValidator,
  selectValidator,
} from "../Common/Validation";
import CommonTable from "../Common/CommonTable";
import { FaRegUser } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { IoLocationOutline } from "react-icons/io5";
import { GiReceiveMoney } from "react-icons/gi";
import moment from "moment";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonSpinner from "../Common/CommonSpinner";
import { CommonMessage } from "../Common/CommonMessage";
import { FaRegCopy } from "react-icons/fa6";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import PrismaZoom from "react-prismazoom";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { useSelector } from "react-redux";

export default function OverallDueCustomers({
  setOverAllDueCount,
  setDueSelectedDates,
}) {
  const mounted = useRef(false);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [customersData, setCustomersData] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isOpenPaymentDrawer, setIsOpenPaymentDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);

  //payment usestates
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pendingAmount, setPendingAmount] = useState();
  const [payAmount, setPayAmount] = useState("");
  const [payAmountError, setPayAmountError] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentModeError, setPaymentModeError] = useState("");
  const [convenienceFees, setConvenienceFees] = useState("");
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentDateError, setPaymentDateError] = useState(null);
  const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
  const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
  const [paymentValidationTrigger, setPaymentValidationTrigger] =
    useState(false);
  const [balanceAmount, setBalanceAmount] = useState();
  const [isShowDueDate, setIsShowDueDate] = useState(true);
  const [dueDate, setDueDate] = useState(null);
  const [dueDateError, setDueDateError] = useState("");
  const [isOpenPaymentScreenshotModal, setIsOpenPaymentScreenshotModal] =
    useState(false);
  const [transactionScreenshot, setTransactionScreenshot] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  //lead executive filter
  const [leadExecutives, setLeadExecutives] = useState([]);
  const [leadExecutiveId, setLeadExecutiveId] = useState(null);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: "Lead Executive",
      key: "lead_assigned_to_name",
      dataIndex: "lead_assigned_to_name",
      width: 160,
    },
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "phone", dataIndex: "phone" },
    { title: "Course ", key: "course_name", dataIndex: "course_name" },
    { title: "Joined ", key: "date_of_joining", dataIndex: "date_of_joining" },
    {
      title: "Fees",
      key: "course_fees",
      dataIndex: "course_fees",
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Balance",
      key: "balance_amount",
      dataIndex: "balance_amount",
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    { title: "Lead By", key: "lead_by", dataIndex: "lead_by" },
    {
      title: "Trainer",
      key: "trainer_name",
      dataIndex: "trainer_name",
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
                size={17}
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
                    setCollapseDefaultKey(["1"]);
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

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setLeadExecutives(downlineUsers);
      getPendingFeesCustomersData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        null,
        null,
        1,
        10
      );
    }
  }, [childUsers]);

  const getPendingFeesCustomersData = async (
    startDate,
    endDate,
    searchvalue,
    executive_id,
    pageNumber,
    limit
  ) => {
    setLoading(true);
    let lead_executive = [];
    if (executive_id) {
      lead_executive.push(executive_id);
    } else {
      lead_executive = [];
    }
    const from_date = formatToBackendIST(startDate);
    const to_date = formatToBackendIST(endDate);

    const payload = {
      from_date: moment(from_date).format("YYYY-MM-DD"),
      to_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchvalue && filterType === 1
        ? { name: searchvalue }
        : searchvalue && filterType === 2
        ? { email: searchvalue }
        : searchvalue && filterType === 3
        ? { mobile: searchvalue }
        : searchvalue && filterType === 4
        ? { course: searchvalue }
        : {}),
      user_ids: lead_executive.length >= 1 ? lead_executive : childUsers,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getPendingFeesCustomers(payload);
      console.log("pending fee customer response", response);
      setCustomersData(response?.data?.data?.data || []);
      const pagination = response?.data?.data?.pagination;
      setOverAllDueCount(pagination?.total || 0);
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

  const handlePaginationChange = ({ page, limit }) => {
    getPendingFeesCustomersData(
      selectedDates[0],
      selectedDates[1],
      searchValue,
      leadExecutiveId,
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
        leadExecutiveId,
        1,
        pagination.limit
      );
    }, 300);
  };

  const handlePaidNow = (e) => {
    const input = e.target.value;

    // Allow numbers, decimal point, or empty string
    if (!/^\d*\.?\d*$/.test(input)) return;

    // Keep the input as string
    setPayAmount(input);

    const value = parseFloat(input); // parse for calculations
    const amt = parseFloat(pendingAmount);

    if (value < amt || isNaN(value) || input === "" || input === null) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }

    setBalanceAmount(
      getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(value) ? 0 : value)
    );

    if (paymentMode == 2 || paymentMode == 5) {
      const conve_fees = getConvenienceFees(isNaN(value) ? 0 : value);
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }

    if (paymentValidationTrigger) {
      setPayAmountError(
        priceValidator(isNaN(value) ? 0 : value, parseFloat(amt))
      );
    }
  };

  const handlePaymentType = (e) => {
    const value = e.target.value;
    setPaymentMode(value);

    if (paymentValidationTrigger) {
      setPaymentModeError(selectValidator(value));
    }

    //handle balance amount
    if (
      payAmount < pendingAmount ||
      isNaN(payAmount) ||
      payAmount == "" ||
      payAmount == null
    ) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }
    setBalanceAmount(
      getBalanceAmount(
        isNaN(pendingAmount) ? 0 : pendingAmount,
        isNaN(payAmount) ? 0 : payAmount
      )
    );

    //handle convenience fees
    if (value == 2 || value == 5) {
      const conve_fees = getConvenienceFees(
        payAmount ? parseInt(payAmount) : 0
      );
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }
  };

  const handlePaymentSubmit = async () => {
    setPaymentValidationTrigger(true);
    const paymentTypeValidate = selectValidator(paymentMode);
    const paymentDateValidate = selectValidator(paymentDate);
    const payAmountValidate = priceValidator(
      parseInt(payAmount),
      parseInt(pendingAmount)
    );

    const screenshotValidate = selectValidator(paymentScreenShotBase64);
    let dueDateValidate;

    if (isShowDueDate) {
      dueDateValidate = selectValidator(dueDate);
    } else {
      dueDateValidate = "";
    }

    setPaymentModeError(paymentTypeValidate);
    setPayAmountError(payAmountValidate);
    setPaymentDateError(paymentDateValidate);
    setPaymentScreenShotError(screenshotValidate);
    setDueDateError(dueDateValidate);

    if (
      paymentTypeValidate ||
      payAmountValidate ||
      paymentDateValidate ||
      screenshotValidate ||
      dueDateValidate
    )
      return;

    setButtonLoading(true);

    const today = new Date();

    // setTimeout(() => {
    //   setInvoiceButtonLoading(false);
    //   setButtonLoading(false);
    // }, 300);

    const payload = {
      payment_master_id: customerDetails.payment_master_id,
      invoice_date: formatToBackendIST(paymentDate),
      paid_amount: payAmount,
      convenience_fees: convenienceFees,
      balance_amount: balanceAmount,
      paymode_id: paymentMode,
      payment_screenshot: paymentScreenShotBase64,
      payment_status: "Verify Pending",
      next_due_date: dueDate ? formatToBackendIST(dueDate) : null,
      created_date: formatToBackendIST(today),
      paid_date: formatToBackendIST(paymentDate),
    };

    try {
      const response = await customerDuePayment(payload);
      console.log("lead payment response", response);
      const createdCustomerDetails = response?.data?.data;
      setTimeout(() => {
        handleCustomerTrack("Part Payment Added");
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      console.log("part payment error", error);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCustomerTrack = async (updatestatus) => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const payload = {
      customer_id: customerDetails.id,
      status: updatestatus,
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      status_date: formatToBackendIST(today),
    };

    try {
      await inserCustomerTrack(payload);
      setTimeout(() => {
        setButtonLoading(false);
        setPagination({
          page: 1,
        });
        getPendingFeesCustomersData(
          selectedDates[0],
          selectedDates[1],
          searchValue,
          leadExecutiveId,
          pagination.page,
          pagination.limit
        );
        formReset();
      }, 300);
    } catch (error) {
      console.log("customer track error", error);
    }
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setCustomerDetails(null);
    setIsOpenPaymentDrawer(false);
    setPendingAmount();
    setPayAmount("");
    setPayAmountError("");
    setPaymentMode(null);
    setPaymentModeError("");
    setConvenienceFees(0);
    setPaymentDate(null);
    setPaymentDateError("");
    setPaymentScreenShotBase64("");
    setPaymentScreenShotError("");
    setBalanceAmount();
    setDueDate(null);
    setDueDateError("");
    setPaymentValidationTrigger(false);
    setTransactionScreenshot("");
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
                    filterType === 1
                      ? "Search By Name"
                      : filterType === 2
                      ? "Search By Email"
                      : filterType === 3
                      ? "Search by Mobile"
                      : filterType === 4
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
                            leadExecutiveId,
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
                                leadExecutiveId,
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
                            Search by Name
                          </Radio>
                          <Radio value={2} style={{ marginBottom: "12px" }}>
                            Search by Email
                          </Radio>
                          <Radio value={3} style={{ marginBottom: "6px" }}>
                            Search by Mobile
                          </Radio>
                          <Radio
                            value={4}
                            style={{ marginTop: "6px", marginBottom: "6px" }}
                          >
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
                  label="Select Lead Executive"
                  labelMarginTop="0px"
                  labelFontSize="13px"
                  options={leadExecutives}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setLeadExecutiveId(e.target.value);
                    setPagination({
                      page: 1,
                    });
                    getPendingFeesCustomersData(
                      selectedDates[0],
                      selectedDates[1],
                      searchValue,
                      e.target.value,
                      1,
                      pagination.limit
                    );
                  }}
                  value={leadExecutiveId}
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
                      leadExecutiveId,
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
      </Row>

      <div style={{ marginTop: "22px" }}>
        <CommonTable
          scroll={{ x: 2350 }}
          columns={columns}
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
        <div className="customer_profileContainer">
          {/* <img src={ProfileImage} className="cutomer_profileimage" /> */}
          <FaRegUser size={50} color="#333" />

          <div>
            <p className="customer_nametext">
              {" "}
              {customerDetails && customerDetails.name
                ? customerDetails.name
                : "-"}
            </p>
            <p className="customer_coursenametext">
              {" "}
              {customerDetails && customerDetails.course_name
                ? customerDetails.course_name
                : "-"}
            </p>
          </div>
        </div>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaRegCircleUser size={15} color="gray" />

                  <p className="customerdetails_rowheading">Name</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.name
                    ? customerDetails.name
                    : "-"}
                </p>
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
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.email
                    ? customerDetails.email
                    : "-"}
                </p>
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
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.phone
                    ? customerDetails.phone
                    : "-"}
                </p>
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
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.whatsapp
                    ? customerDetails.whatsapp
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <MdOutlineDateRange size={15} color="gray" />
                  <p className="customerdetails_rowheading">Date Of Birth</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.date_of_birth
                    ? moment(customerDetails.date_of_birth).format("DD/MM/YYYY")
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  {customerDetails && customerDetails.gender === "Male" ? (
                    <BsGenderMale size={15} color="gray" />
                  ) : (
                    <BsGenderFemale size={15} color="gray" />
                  )}
                  <p className="customerdetails_rowheading">Gender</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.gender
                    ? customerDetails.gender
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <IoLocationOutline size={15} color="gray" />
                  <p className="customerdetails_rowheading">Area</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {" "}
                  {customerDetails && customerDetails.current_location
                    ? customerDetails.current_location
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaRegUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Lead Executive</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.lead_assigned_to_name
                    ? customerDetails.lead_assigned_to_name
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>
        </Row>

        <div className="customerdetails_coursecard">
          <div className="customerdetails_coursecard_headercontainer">
            <p>Course Details</p>
          </div>

          <div className="customerdetails_coursecard_contentcontainer">
            <Row>
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Course</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.course_name
                        ? customerDetails.course_name
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Course Fees
                        <span className="customerdetails_coursegst">{` (+Gst)`}</span>
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ fontWeight: 700 }}
                    >
                      {customerDetails && customerDetails.payment.total_amount
                        ? "₹" + customerDetails.payment.total_amount
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
                      {customerDetails &&
                      customerDetails.balance_amount !== undefined &&
                      customerDetails.balance_amount !== null
                        ? "₹" + customerDetails.balance_amount
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Joining Date</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {" "}
                      {customerDetails && customerDetails.date_of_joining
                        ? moment(customerDetails.date_of_joining).format(
                            "DD/MM/YYYY"
                          )
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Server</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails &&
                      customerDetails.is_server_required !== undefined
                        ? customerDetails.is_server_required === 1
                          ? "Required"
                          : "Not Required"
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Region</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.region_name
                        ? customerDetails.region_name
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Branch</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.branch_name
                        ? customerDetails.branch_name
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Batch Type</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.batch_timing
                        ? customerDetails.batch_timing
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Batch Track</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.batch_tracking
                        ? customerDetails.batch_tracking
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Placement Support
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.placement_support
                        ? customerDetails.placement_support
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>

        {customerDetails && customerDetails.signature_image ? (
          <div className="customerdetails_signatureContainer">
            <p style={{ fontWeight: "500", marginRight: "40px" }}>Signature</p>
            <img
              src={`${customerDetails.signature_image}`}
              alt="Customer Signature"
              className="customer_signature_image"
            />
          </div>
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
        <div className="customer_statusupdate_drawer_profileContainer">
          {/* <img src={ProfileImage} className="cutomer_profileimage" /> */}
          <FaRegUser size={50} color="#333" />

          <div>
            <p className="customer_nametext">
              {" "}
              {customerDetails && customerDetails.name
                ? customerDetails.name
                : "-"}
            </p>
            <p className="customer_coursenametext">
              {" "}
              {customerDetails && customerDetails.course_name
                ? customerDetails.course_name
                : "-"}
            </p>
          </div>
        </div>

        <Row
          gutter={16}
          style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
        >
          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaRegCircleUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Name</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.name
                    ? customerDetails.name
                    : "-"}
                </p>
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
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.email
                    ? customerDetails.email
                    : "-"}
                </p>
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
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.phone
                    ? customerDetails.phone
                    : "-"}
                </p>
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
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.whatsapp
                    ? customerDetails.whatsapp
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  {customerDetails && customerDetails.gender === "Male" ? (
                    <BsGenderMale size={15} color="gray" />
                  ) : (
                    <BsGenderFemale size={15} color="gray" />
                  )}
                  <p className="customerdetails_rowheading">Gender</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.gender
                    ? customerDetails.gender
                    : "-"}
                </p>
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
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.current_location
                    ? customerDetails.current_location
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaRegUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Lead Executive</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.lead_assigned_to_name
                    ? customerDetails.lead_assigned_to_name
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Course</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.course_name
                    ? customerDetails.course_name
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">
                    Course Fees
                    <span className="customerdetails_coursegst">{` (+Gst)`}</span>
                  </p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text" style={{ fontWeight: 700 }}>
                  {customerDetails && customerDetails.payment.total_amount
                    ? "₹" + customerDetails.payment.total_amount
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Balance Amount</p>
                </div>
              </Col>
              <Col span={12}>
                <p
                  className="customerdetails_text"
                  style={{ color: "#d32f2f", fontWeight: 700 }}
                >
                  {customerDetails &&
                  customerDetails.balance_amount !== undefined &&
                  customerDetails.balance_amount !== null
                    ? "₹" + customerDetails.balance_amount
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Server</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails &&
                  customerDetails.is_server_required !== undefined
                    ? customerDetails.is_server_required === 1
                      ? "Required"
                      : "Not Required"
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Branch</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.branch_name
                    ? customerDetails.branch_name
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Batch Track</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.batch_tracking
                    ? customerDetails.batch_tracking
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Batch Type</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.batch_timing
                    ? customerDetails.batch_timing
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider className="customer_statusupdate_divider" />

        <div style={{ padding: "0px 24px" }}>
          <div className="customerdetails_coursecard">
            <div className="customerdetails_coursecard_headercontainer">
              <p>Tax Details</p>
            </div>

            <div className="customerdetails_coursecard_contentcontainer">
              <Row>
                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Course Fees
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.course_fees
                          ? "₹" + customerDetails.course_fees
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Total Fees</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p
                        className="customerdetails_text"
                        style={{ fontWeight: 700 }}
                      >
                        {customerDetails && customerDetails.payment.total_amount
                          ? "₹" + customerDetails.payment.total_amount
                          : "-"}
                      </p>
                    </Col>
                  </Row>
                </Col>

                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Gst Amount</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails?.payment?.gst_amount ? (
                          <>
                            ₹{customerDetails.payment.gst_amount}{" "}
                            <span style={{ fontSize: "11px" }}>
                              ({customerDetails.payment.tax_type || "-"})
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
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
                        style={{ fontWeight: 700, color: "rgb(211, 47, 47)" }}
                      >
                        {customerDetails && customerDetails.balance_amount
                          ? "₹" + customerDetails.balance_amount
                          : "-"}
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </div>

        <Divider className="customer_statusupdate_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Transaction History
        </p>

        <div style={{ padding: "0px 24px" }}>
          {paymentHistory.length >= 1 ? (
            <div style={{ marginTop: "12px", marginBottom: "20px" }}>
              <Collapse
                activeKey={collapseDefaultKey}
                onChange={(keys) => setCollapseDefaultKey(keys)}
                className="assesmntresult_collapse"
              >
                {paymentHistory.map((item, index) => (
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
                          Transaction Date -{" "}
                          <span style={{ fontWeight: "500" }}>
                            {moment(item.invoice_date).format("DD/MM/YYYY")}
                          </span>
                        </span>
                        {item.payment_status === "Verify Pending" ? (
                          <div className="customer_trans_statustext_container">
                            <PiClockCounterClockwiseBold
                              size={16}
                              color="gray"
                            />
                            <p style={{ color: "gray", fontWeight: 500 }}>
                              Waiting for Verify
                            </p>
                          </div>
                        ) : item.payment_status === "Rejected" ? (
                          <div className="customer_trans_statustext_container">
                            <FaRegCircleXmark color="#d32f2f" />
                            <p style={{ color: "#d32f2f", fontWeight: 500 }}>
                              Rejected
                            </p>
                          </div>
                        ) : (
                          <div className="customer_trans_statustext_container">
                            <BsPatchCheckFill color="#3c9111" />
                            <p style={{ color: "#3c9111", fontWeight: 500 }}>
                              Verified
                            </p>
                          </div>
                        )}
                      </div>
                    }
                  >
                    <div>
                      <Row gutter={16} style={{ marginTop: "6px" }}>
                        <Col span={12}>
                          <Row>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Invoice Date
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {moment(item.invoice_date).format("DD/MM/YYYY")}
                              </p>
                            </Col>
                          </Row>
                        </Col>
                        <Col span={12}>
                          <Row>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Invoice Number
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {item.invoice_number}
                              </p>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row gutter={16} style={{ marginTop: "16px" }}>
                        <Col span={12}>
                          <Row>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Payment Mode
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {item.payment_mode}
                              </p>
                            </Col>
                          </Row>
                        </Col>
                        <Col span={12}>
                          <Row>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Convenience Fees
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {"₹" + item.convenience_fees}
                              </p>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row
                        gutter={16}
                        style={{ marginTop: "16px", marginBottom: "8px" }}
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
                              <p
                                className="customerdetails_text"
                                style={{
                                  color: "#3c9111",
                                  fontWeight: 500,
                                }}
                              >
                                {"₹" + item.amount}
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
                                  setIsOpenPaymentScreenshotModal(true);
                                  setTransactionScreenshot(
                                    item.payment_screenshot
                                  );
                                }}
                              >
                                <FaRegEye size={16} /> View screenshot
                              </button>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </div>
                  </Collapse.Panel>
                ))}
              </Collapse>
            </div>
          ) : (
            <p className="customer_trainerhistory_nodatatext">No Data found</p>
          )}
        </div>

        <Divider className="customer_statusupdate_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Payment Info
        </p>

        <Row
          gutter={16}
          className="leadmanager_paymentdetails_drawer_rowdiv"
          style={{ marginTop: "16px" }}
        >
          <Col span={8}>
            <CommonInputField
              label="Pending Amount"
              required={true}
              value={pendingAmount}
              disabled={true}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Pay Amount"
              required={true}
              onChange={handlePaidNow}
              value={payAmount}
              error={payAmountError}
              errorFontSize="10px"
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Payment Mode"
              required={true}
              options={[
                { id: 1, name: "Cash" },
                { id: 2, name: "Card" },
                { id: 3, name: "Bank" },
                { id: 4, name: "UPI" },
                { id: 5, name: "Razorpay" },
              ]}
              onChange={handlePaymentType}
              value={paymentMode}
              error={paymentModeError}
            />
          </Col>
        </Row>

        <Row
          gutter={16}
          className="leadmanager_paymentdetails_drawer_rowdiv"
          style={{ marginTop: "34px" }}
        >
          <Col span={8}>
            <CommonInputField
              label="Convenience fees"
              required={true}
              value={convenienceFees}
              disabled={true}
              type="number"
            />
          </Col>
          <Col span={8}>
            <CommonMuiDatePicker
              label="Payment Date"
              required={true}
              onChange={(value) => {
                setPaymentDate(value);
                if (paymentValidationTrigger) {
                  setPaymentDateError(selectValidator(value));
                }
              }}
              value={paymentDate}
              error={paymentDateError}
            />
          </Col>

          <Col span={8}>
            <ImageUploadCrop
              label="Payment Screenshot"
              aspect={1}
              maxSizeMB={1}
              required={true}
              value={paymentScreenShotBase64}
              onChange={(base64) => setPaymentScreenShotBase64(base64)}
              onErrorChange={setPaymentScreenShotError} // ✅ pass setter directly
            />
            {paymentScreenShotError && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#d32f2f",
                  marginTop: 4,
                }}
              >
                {`Payment Screenshot ${paymentScreenShotError}`}
              </p>
            )}
          </Col>
        </Row>

        <Divider className="leadmanger_paymentdrawer_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Balance Amount Details
        </p>

        <Row
          gutter={16}
          style={{ marginTop: "20px", marginBottom: "30px" }}
          className="leadmanager_paymentdetails_drawer_rowdiv"
        >
          <Col span={8}>
            <CommonInputField
              label="Balance Amount"
              required={true}
              value={balanceAmount}
              disabled={true}
              type="number"
            />
          </Col>
          {isShowDueDate ? (
            <Col span={8}>
              <CommonMuiDatePicker
                label="Next Due Date"
                required={true}
                onChange={(value) => {
                  setDueDate(value);
                  setDueDateError(selectValidator(value));
                }}
                value={dueDate}
                error={dueDateError}
                disablePreviousDates={true}
              />
            </Col>
          ) : (
            ""
          )}
        </Row>

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
                onClick={() => {
                  handlePaymentSubmit();
                }}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>

      <Modal
        title="Payment Screenshot"
        open={isOpenPaymentScreenshotModal}
        onCancel={() => setIsOpenPaymentScreenshotModal(false)}
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
    </div>
  );
}
