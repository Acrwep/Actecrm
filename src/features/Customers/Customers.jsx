import React, { useState, useRef, useEffect } from "react";
import {
  Row,
  Col,
  Tooltip,
  Drawer,
  Flex,
  Button,
  Radio,
  Divider,
  Checkbox,
  Collapse,
  Modal,
  Steps,
} from "antd";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTable from "../Common/CommonTable";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import "./styles.css";
import {
  assignTrainerForCustomer,
  classScheduleForCustomer,
  generateCertForCustomer,
  getAssignTrainerHistoryForCustomer,
  getCustomerByTrainerId,
  getCustomerFullHistory,
  getCustomers,
  getTrainerById,
  getTrainers,
  inserCustomerTrack,
  rejectCustomerPayment,
  rejectTrainerForCustomer,
  sendCustomerCertificate,
  sendPaymentInvoiceByEmail,
  updateClassGoingForCustomer,
  updateCustomerPaymentTransaction,
  updateCustomerStatus,
  updatefeedbackForCustomer,
  verifyCustomer,
  verifyCustomerPayment,
  verifyTrainerForCustomer,
  viewCertForCustomer,
} from "../ApiService/action";
import {
  addressValidator,
  calculateAmount,
  formatToBackendIST,
  getBalanceAmount,
  getConvenienceFees,
  getCurrentandPreviousweekDate,
  nameValidator,
  percentageValidator,
  priceValidator,
  selectValidator,
} from "../Common/Validation";
import CommonSpinner from "../Common/CommonSpinner";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { MdOutlineDateRange } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { RedoOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import moment from "moment";
import { AiOutlineEdit } from "react-icons/ai";
import CustomerUpdate from "./CustomerUpdate";
import CommonTextArea from "../Common/CommonTextArea";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSelectField from "../Common/CommonSelectField";
import CommonInputField from "../Common/CommonInputField";
import { LuIndianRupee } from "react-icons/lu";
import { FiFilter } from "react-icons/fi";
import CommonDnd from "../Common/CommonDnd";
import { BsPatchCheckFill } from "react-icons/bs";
import { FaRegCopy } from "react-icons/fa6";
import { LuCircleUser } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { GrCertificate } from "react-icons/gr";
import { CloseOutlined } from "@ant-design/icons";
import { LuFileClock } from "react-icons/lu";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import PrismaZoom from "react-prismazoom";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonMuiMonthPicker from "../Common/CommonMuiMonthPicker";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";
import CustomerHistory from "./CustomerHistory";
import { useSelector } from "react-redux";

const { Step } = Steps;

export default function Customers() {
  const scrollRef = useRef();
  const customerUpdateRef = useRef();
  const mounted = useRef(false);

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerStatusCount, setCustomerStatusCount] = useState(null);
  const [isOpenEditDrawer, setIsOpenEditDrawer] = useState(false);
  const [updateDrawerTabKey, setUpdateDrawerTabKey] = useState("1");
  const [customerId, setCustomerId] = useState(null);
  const [updateButtonLoading, setUpdateButtonLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [pendingFeesCount, setPendingFeesCount] = useState(0);

  //form usesates
  //finance usestates
  const [isOpenPaymentScreenshotModal, setIsOpenPaymentScreenshotModal] =
    useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [transactionScreenshot, setTransactionScreenshot] = useState("");
  const [rejectTransItem, setRejectTransItem] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [isShowFinanceRejectComment, setIsShowFinanceRejectComment] =
    useState(false);
  const [financeRejectComment, setFinanceRejectComment] = useState("");
  const [financeRejectCommentError, setFinanceRejectCommentError] =
    useState("");
  const [isOpenFinanceVerifyModal, setIsOpenFinanceVerifyModal] =
    useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  //update payment usestates
  const [updatePaymentTransId, setUpdatePaymentTransId] = useState(null);
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentDateError, setPaymentDateError] = useState("");
  const [paymentMode, setPaymentMode] = useState(null);
  const [paymentModeError, setPaymentModeError] = useState(null);
  const [subTotal, setSubTotal] = useState();
  const [convenienceFees, setConvenienceFees] = useState("");
  const [taxType, setTaxType] = useState(null);
  const [taxTypeError, setTaxTypeError] = useState("");
  const [amount, setAmount] = useState();
  const [paidNow, setPaidNow] = useState("");
  const [paidNowError, setPaidNowError] = useState("");
  const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
  const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
  const [paymentValidationTrigger, setPaymentValidationTrigger] =
    useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [isShowDueDate, setIsShowDueDate] = useState(true);
  const [dueDate, setDueDate] = useState(null);
  const [dueDateError, setDueDateError] = useState("");
  //student verify usestates
  const [isStatusUpdateDrawer, setIsStatusUpdateDrawer] = useState(false);
  const [drawerContentStatus, setDrawerContentStatus] = useState("");
  const [studentVerifyProofBase64, setStudentVerifyProofBase64] = useState("");
  const [studentVerifyProofError, setStudentVerifyProofError] = useState("");
  const [studentVerifyComments, setStudentVerifyComments] = useState("");
  const [studentVerifyCommentsError, setStudentVerifyCommentsError] =
    useState("");
  const [isSatisfied, setIsSatisfied] = useState(true);

  //assign trainer usestates
  const [trainersData, setTrainersData] = useState([]);
  const [trainerId, setTrainerId] = useState(null);
  const [trainerIdError, setTrainerIdError] = useState("");
  const [commercial, setCommercial] = useState(null);
  const [commercialError, setCommercialError] = useState("");
  const modeOfClassOptions = [
    { id: "Offline", name: "Offline" },
    { id: "Online", name: "Online" },
  ];
  const [modeOfClass, setModeOfClass] = useState(null);
  const [modeOfClassError, setModeOfClassError] = useState("");
  const [trainerType, setTrainerType] = useState("");

  const [assignTrainerProofBase64, setAssignTrainerProofBase64] = useState("");
  const [assignTrainerProofError, setAssignTrainerProofError] = useState("");
  const [assignTrainerComments, setAssignTrainerComments] = useState("");
  const [assignTrainerCommentsError, setAssignTrainerCommentsError] =
    useState("");
  const [trainerHistory, setTrainerHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
  const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
    useState(false);
  const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
  const [trainerFilterType, setTrainerFilterType] = useState(1);
  const [trainerClassTakenCount, setTrainerClassTakenCount] = useState(0);
  const [trainerClassGoingCount, setTrainerClassGoingCount] = useState(0);
  //trainer verify usestates
  const [assignTrainerData, setAssignTrainerData] = useState(null);
  const [isShowRejectTrainerCommentBox, setIsShowRejectTrainerCommentBox] =
    useState(false);
  const [rejectTrainerComments, setRejectTrainerComments] = useState("");
  const [rejectTrainerCommentsError, setRejectTrainerCommentsError] =
    useState("");
  const [rejectbuttonLoader, setRejectButtonLoader] = useState(false);
  const [isOpenTrainerCustomersModal, setIsOpenTrainerCustomersModal] =
    useState(false);
  const [customerByTrainerData, setCustomerByTrainerData] = useState([]);
  const [customerByTrainerLoading, setCustomerByTrainerLoading] =
    useState(false);
  //class schedule usestates
  const scheduleOptions = [
    { id: 1, name: "On Going" },
    { id: 3, name: "Hold" },
    { id: 6, name: "CGS" },
    { id: 10, name: "Demo Completed" },
  ];
  const scheduleOptions2 = [
    { id: 1, name: "On Going" },
    { id: 3, name: "Hold" },
    { id: 5, name: "Escalated" },
    { id: 7, name: "Partially Closed" },
    { id: 8, name: "Discontinued" },
    { id: 9, name: "Refund" },
  ];
  const [scheduleId, setScheduleId] = useState(null);
  const [scheduleIdError, setScheduleIdError] = useState("");
  const [classStartDate, setClassStartDate] = useState(null);
  const [classStartDateError, setClassStartDateError] = useState("");
  const [classHoldComments, setClassHoldComments] = useState("");
  const [classHoldCommentsError, setClassHoldCommentsError] = useState("");
  //class going usestates
  const [classGoingPercentage, setClassGoingPercentage] = useState(0);
  const [classGoingPercentageError, setClassGoingPercentageError] = useState(0);
  const [classGoingComments, setClassGoingComments] = useState("");
  const [classGoingCommentsError, setClassGoingCommentsError] = useState("");
  const [addattachmentBase64, setAddattachmentBase64] = useState("");
  const [addattachmentError, setAddattachmentError] = useState("");
  const [isOpenClassCompleteModal, setIsOpenClassCompleteModal] =
    useState(false);
  const [classCompleteLoading, setClassCompleteLoading] = useState(false);
  const [isShowAddAttachment, setIsShowAddAttachment] = useState(false);
  //feedback usestates
  const [callCusTrack, setCallCusTrack] = useState(false);
  const [googleFeedbackBase64, setGoogleFeedbackBase64] = useState("");
  const [linkedinFeedbackBase64, setLinkedinFeedbackBase64] = useState("");

  const [courseDuration, setCourseDuration] = useState("");
  const [courseDurationError, setCourseDurationError] = useState("");
  const [isGoogleReviewChange, setIsGoogleReviewChange] = useState(false);
  const [isCertChange, setIsCertChange] = useState(false);
  const [certName, setCertName] = useState("");
  const [certNameError, setCertNameError] = useState("");
  const [certCourseName, setCertCourseName] = useState("");
  const [certCourseNameError, setCertCourseNameError] = useState("");
  const [certMonth, setCertMonth] = useState(null);
  const [certMonthError, setCertMonthError] = useState("");
  const certLocationOptions = [
    { id: "Chennai", name: "Chennai" },
    { id: "Bengaluru", name: "Bengaluru" },
  ];
  const [certLocation, setCertLocation] = useState("");
  const [certLocationError, setCertLocationError] = useState("");
  const [isCertGenerated, setIsCertGenerated] = useState(false);
  const [generateCertLoading, setGenerateCertLoading] = useState(false);
  const [certHtmlContent, setCertHtmlContent] = useState("");
  const [isOpenViewCertModal, setIsOpenViewCertModal] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [current, setCurrent] = useState(0);

  //customer history usestates
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false);

  const prev = () => setCurrent(current - 1);
  const [loading, setLoading] = useState(true);
  //executive filter
  const [leadExecutives, setLeadExecutives] = useState([]);
  const [leadExecutiveId, setLeadExecutiveId] = useState(null);
  //branch filter
  const [branchOptions, setBranchOptions] = useState([
    { id: 1, name: "Classroom", checked: true },
    { id: 1, name: "Online", checked: true },
  ]);
  const [duplicateBranchOptions, setDuplicateBranchOptions] = useState([
    { id: 1, name: "Classroom", checked: true },
    { id: 1, name: "Online", checked: true },
  ]);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [defaultColumns, setDefaultColumns] = useState([
    { title: "Candidate Name", isChecked: true },
    { title: "Email", isChecked: true },
    { title: "Mobile", isChecked: true },
    { title: "Course ", isChecked: true },
    { title: "Joined ", isChecked: true },
    { title: "Fees", isChecked: true },
    { title: "Balance", isChecked: true },
    { title: "Lead By ", isChecked: true },
    { title: "Trainer", isChecked: true },
    { title: "TR Number", isChecked: true },
    { title: "Form Status", isChecked: true },
    { title: "Status", isChecked: true },
    { title: "Action", isChecked: true },
  ]);

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
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "phone", dataIndex: "phone" },
    { title: "Course ", key: "course_name", dataIndex: "course_name" },
    { title: "Joined ", key: "date_of_joining", dataIndex: "date_of_joining" },
    {
      title: "Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
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
      fixed: "right",
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
      title: "Status",
      key: "status",
      dataIndex: "status",
      fixed: "right",
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
            <Tooltip
              placement="bottomLeft"
              className="customers_statustooltip"
              color="#fff"
              styles={{
                body: {
                  width: "300px",
                  maxWidth: "none",
                  whiteSpace: "normal",
                },
              }}
              // open={true}
              title={
                <>
                  <Row>
                    <Col span={12}>
                      {record.is_last_pay_rejected === 1 ? (
                        <>
                          <button
                            className="customers_finance_updatepayment_button"
                            onClick={() => {
                              if (!permissions.includes("Update Payment")) {
                                CommonMessage("error", "Access Denied");
                                return;
                              }
                              setDrawerContentStatus("Update Payment");
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setCollapseDefaultKey(["1"]);
                              setIsStatusUpdateDrawer(true);
                              setPaymentHistory(
                                record.payments && record.payments
                                  ? record.payments.payment_trans
                                  : []
                              );
                              setSubTotal(
                                parseFloat(record.primary_fees).toFixed(2)
                              );
                              setTaxType(
                                record.payments && record.payments.tax_type
                                  ? record.payments.tax_type == "GST (18%)"
                                    ? 1
                                    : record.payments.tax_type == "SGST (18%)"
                                    ? 2
                                    : record.payments.tax_type == "IGST (18%)"
                                    ? 3
                                    : record.payments.tax_type == "VAT (18%)"
                                    ? 4
                                    : record.payments.tax_type == "No Tax"
                                    ? 5
                                    : 0
                                  : 0
                              );
                              setAmount(
                                parseFloat(
                                  record.payments &&
                                    record.payments.total_amount
                                    ? record.payments.total_amount
                                    : 0
                                ).toFixed(2)
                              );
                              //transaction handling
                              const rejectedItem =
                                record?.payments?.payment_trans?.find(
                                  (f) => f?.payment_status === "Rejected"
                                );
                              console.log("rejectedItem", rejectedItem);
                              setUpdatePaymentTransId(
                                rejectedItem && rejectedItem.id
                                  ? rejectedItem.id
                                  : null
                              );
                              setPaidNow(
                                parseFloat(
                                  rejectedItem && rejectedItem.amount
                                    ? rejectedItem.amount
                                    : 0
                                ).toFixed(2)
                              );
                              setPaymentMode(
                                rejectedItem && rejectedItem.paymode_id
                                  ? rejectedItem.paymode_id
                                  : 0
                              );
                              setConvenienceFees(
                                parseFloat(
                                  rejectedItem && rejectedItem.convenience_fees
                                    ? rejectedItem.convenience_fees
                                    : 0
                                ).toFixed(2)
                              );
                              setPaymentDate(
                                rejectedItem && rejectedItem.paid_date
                                  ? rejectedItem.paid_date
                                  : null
                              );
                              setPaymentScreenShotBase64(
                                rejectedItem && rejectedItem.payment_screenshot
                                  ? rejectedItem.payment_screenshot
                                  : ""
                              );
                              setBalanceAmount(
                                rejectedItem && rejectedItem.balance_amount
                                  ? rejectedItem.balance_amount
                                  : 0
                              );
                              setDueDate(
                                rejectedItem && rejectedItem.next_due_date
                                  ? rejectedItem.next_due_date
                                  : null
                              );
                            }}
                          >
                            Update Payment
                          </button>
                        </>
                      ) : record.status === "Form Pending" ||
                        record.status === "Awaiting Finance" ||
                        record.is_second_due === 1 ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          style={{ marginTop: "6px" }}
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else {
                              if (!permissions.includes("Finance Verify")) {
                                CommonMessage("error", "Access Denied");
                                return;
                              }
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setDrawerContentStatus("Finance Verify");
                              setCollapseDefaultKey(["1"]);
                              setIsStatusUpdateDrawer(true);
                              setPaymentHistory(
                                record.payments && record.payments
                                  ? record.payments.payment_trans
                                  : []
                              );
                            }
                          }}
                        >
                          Finance Verify
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Finance Verified
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Payment Rejected" ||
                      record.status === "Awaiting Verify" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status != "Awaiting Verify") {
                              CommonMessage("warning", "Already Verified");
                            } else if (record.status === "Awaiting Verify") {
                              if (!permissions.includes("Student Verify")) {
                                CommonMessage("error", "Access Denied");
                                return;
                              }
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setDrawerContentStatus("Student Verify");
                              setIsStatusUpdateDrawer(true);
                            }
                          }}
                        >
                          Student Verify
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Student Verified
                          </p>
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ||
                      record.status === "Awaiting Trainer" ||
                      record.status === "Payment Rejected" ||
                      record.status === "Trainer Rejected" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Verify") {
                              CommonMessage(
                                "warning",
                                "Customer not Verified Yet"
                              );
                            } else if (
                              record.status === "Awaiting Trainer" ||
                              record.status === "Trainer Rejected"
                            ) {
                              if (!permissions.includes("Trainer Assign")) {
                                CommonMessage("error", "Access Denied");
                                return;
                              }
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setDrawerContentStatus("Assign Trainer");
                              handleTrainerHistory(record.id);
                              setIsStatusUpdateDrawer(true);
                            } else {
                              CommonMessage(
                                "warning",
                                "Trainer Already Assigned"
                              );
                            }
                          }}
                        >
                          Assign Trainer
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Trainer Assigned
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ||
                      record.status === "Awaiting Trainer" ||
                      record.status === "Awaiting Trainer Verify" ||
                      record.status === "Payment Rejected" ||
                      record.status === "Trainer Rejected" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Verify") {
                              CommonMessage(
                                "warning",
                                "Customer not Verified Yet"
                              );
                            } else if (
                              record.status === "Awaiting Trainer" ||
                              record.status === "Trainer Rejected"
                            ) {
                              CommonMessage(
                                "warning",
                                "Trainer not Assigned yet"
                              );
                            } else if (
                              record.status === "Awaiting Trainer Verify"
                            ) {
                              if (!permissions.includes("Trainer Verify")) {
                                CommonMessage("error", "Access Denied");
                                return;
                              }
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setDrawerContentStatus("Trainer Verify");
                              setIsStatusUpdateDrawer(true);
                              getAssignTrainerData(record.trainer_id);
                              setCommercial(record.commercial);
                              setModeOfClass(record.mode_of_class);
                              setTrainerType(record.trainer_type);
                            } else {
                              CommonMessage(
                                "warning",
                                "Trainer Already Verified"
                              );
                            }
                          }}
                        >
                          Verify Trainer
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Trainer Verified
                          </p>
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ||
                      record.status === "Awaiting Trainer" ||
                      record.status === "Awaiting Trainer Verify" ||
                      record.status === "Payment Rejected" ||
                      record.status === "Trainer Rejected" ||
                      record.status === "Awaiting Class" ||
                      record.status === "Hold" ||
                      record.status === "Escalated" ||
                      record.status === "Partially Closed" ||
                      record.status === "Discontinued" ||
                      record.status === "Demo Completed" ||
                      record.status === "Refund" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Verify") {
                              CommonMessage(
                                "warning",
                                "Customer not Verified Yet"
                              );
                            } else if (
                              record.status === "Awaiting Trainer" ||
                              record.status === "Trainer Rejected"
                            ) {
                              CommonMessage(
                                "warning",
                                "Trainer not Assigned yet"
                              );
                            } else if (
                              record.status === "Awaiting Trainer Verify"
                            ) {
                              CommonMessage(
                                "warning",
                                "Trainer not Verified yet"
                              );
                            } else if (
                              record.status === "Awaiting Class" ||
                              record.status === "Hold" ||
                              record.status === "Escalated" ||
                              record.status === "Partially Closed" ||
                              record.status === "Discontinued" ||
                              record.status === "Demo Completed" ||
                              record.status === "Refund"
                            ) {
                              if (!permissions.includes("Class Schedule")) {
                                CommonMessage("error", "Access Denied");
                                return;
                              }
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setDrawerContentStatus("Class Schedule");
                              setIsStatusUpdateDrawer(true);
                              getAssignTrainerData(record.trainer_id);
                              setCommercial(record.commercial);
                              setModeOfClass(record.mode_of_class);
                              setTrainerType(record.trainer_type);
                            } else {
                              CommonMessage(
                                "warning",
                                "Class Already Scheduled"
                              );
                            }
                          }}
                        >
                          Schedule Class
                        </Checkbox>
                      ) : record.status === "Class Scheduled" ? (
                        <button
                          className="customers_updateschedulebutton"
                          onClick={() => {
                            if (!permissions.includes("Class Schedule")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setCustomerId(record.id);
                            setCustomerDetails(record);
                            setScheduleId(record.class_schedule_id);
                            setClassStartDate(record.class_start_date);
                            setDrawerContentStatus("Class Schedule");
                            setIsStatusUpdateDrawer(true);
                          }}
                        >
                          Update Schedule
                        </button>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Class Scheduled
                          </p>
                        </div>
                      )}
                    </Col>

                    {record.status === "Class Going" ||
                    record.status === "Passedout process" ||
                    record.status === "Completed" ? (
                      <Col span={12}>
                        {classPercent < 100 ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <button
                              className="customers_classgoing_updatebutton"
                              onClick={() => {
                                if (
                                  !permissions.includes("Update Class Going")
                                ) {
                                  CommonMessage("error", "Access Denied");
                                  return;
                                }
                                setCustomerId(record.id);
                                setCustomerDetails(record);
                                setScheduleId(record.class_schedule_id);
                                setDrawerContentStatus("Class Going");
                                setIsStatusUpdateDrawer(true);
                                setClassGoingPercentage(
                                  parseFloat(record.class_percentage)
                                );
                              }}
                            >
                              Update Class Going
                            </button>
                          </div>
                        ) : (
                          <div className="customers_classcompleted_container">
                            <BsPatchCheckFill color="#3c9111" />
                            <p className="customers_classgoing_completedtext">
                              100% Class Completed
                            </p>
                          </div>
                        )}
                      </Col>
                    ) : (
                      ""
                    )}
                  </Row>

                  {record.status === "Passedout process" ||
                  record.status === "Completed" ? (
                    <Row style={{ marginTop: "0px", marginBottom: "6px" }}>
                      <Col span={12}>
                        {record.status === "Passedout process" ? (
                          <button
                            className="customers_addfeedbackbutton"
                            onClick={() => {
                              if (!permissions.includes("Passedout Process")) {
                                CommonMessage("error", "Access Denied");
                                return;
                              }
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setDrawerContentStatus("Add G-Review");
                              setCallCusTrack(true);
                              setIsStatusUpdateDrawer(true);
                              if (record.google_review === null) {
                                setCurrent(0);
                              } else if (
                                record.is_certificate_generated === 0
                              ) {
                                setCurrent(1);
                              } else {
                                setCurrent(2);
                              }
                              setCourseDuration(record.cer_course_duration);
                              setCertMonth(record.cer_course_completion_month);
                              if (record.google_review) {
                                setGoogleFeedbackBase64(record.google_review);
                              }
                              setCertName(record.name);
                              setCertCourseName(record.course_name);
                              setCertLocation(record.cer_location);
                              setIsCertGenerated(
                                record.is_certificate_generated === 1
                                  ? true
                                  : false
                              );
                            }}
                          >
                            Passedout process
                          </button>
                        ) : (
                          <div className="customers_classcompleted_container">
                            <BsPatchCheckFill color="#3c9111" />
                            <p className="customers_classgoing_completedtext">
                              PO Process Completed
                            </p>
                          </div>
                        )}
                      </Col>

                      <Col span={12}>
                        {record.status === "Completed" ? (
                          <div className="customers_classcompleted_container">
                            <BsPatchCheckFill color="#3c9111" />
                            <p className="customers_classgoing_completedtext">
                              Certificate Issued
                            </p>
                          </div>
                        ) : (
                          ""
                        )}
                      </Col>
                    </Row>
                  ) : (
                    ""
                  )}
                </>
              }
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
                text === "Payment Rejected" ||
                text === "Trainer Rejected" ||
                text === "Escalated" ||
                text === "Hold" ||
                text === "Partially Closed" ||
                text === "Discontinued" ||
                text === "Demo Completed" ||
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
            </Tooltip>
            {record.status === "Form Pending" && (
              <Tooltip placement="top" title="Copy form link">
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
                  }}
                />
              </Tooltip>
            )}
            {record.status === "Completed" && (
              <Tooltip placement="top" title="View Certificate">
                <GrCertificate
                  size={14}
                  color="#5a5858"
                  className="customers_formlink_copybutton"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleViewCert(record.id);
                    setCertificateName(record.name);
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
      key: "update",
      dataIndex: "update",
      width: 140,
      fixed: "right",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            {permissions.includes("Update Customer") && (
              <AiOutlineEdit
                size={18}
                className="trainers_action_icons"
                onClick={() => handleEdit(record)}
              />
            )}

            <Tooltip
              placement="top"
              title="View Details"
              trigger={["hover", "click"]}
            >
              <FaRegEye
                size={15}
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenDetailsDrawer(true);
                  setCustomerDetails(record);
                }}
              />
            </Tooltip>

            <Tooltip
              placement="top"
              title="View Customer History"
              trigger={["hover", "click"]}
            >
              <LuFileClock
                size={15}
                className="trainers_action_icons"
                onClick={() => {
                  setCustomerDetails(record);
                  getCustomerHistoryData(record.id);
                  setTimeout(() => {
                    const container = document.getElementById(
                      "customer_history_profilecontainer"
                    );
                    container.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 300);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  const [customersData, setCustomersData] = useState([]);

  const customerByTrainerColumn = [
    {
      title: "Customer Name",
      key: "cus_name",
      dataIndex: "cus_name",
      width: 180,
    },
    {
      title: "Customer Email",
      key: "cus_email",
      dataIndex: "cus_email",
      width: 220,
    },
    { title: "Customer Mobile", key: "cus_phone", dataIndex: "cus_phone" },
    {
      title: "Course Name",
      key: "course_name",
      dataIndex: "course_name",
      width: 200,
    },
    {
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 120,
    },
    { title: "Branch Name", key: "branch_name", dataIndex: "branch_name" },
    {
      title: "Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      width: 120,
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Class Going %",
      key: "class_percentage",
      dataIndex: "class_percentage",
      width: 120,
      fixed: "right",
    },
    {
      title: "Trainer Commercial",
      key: "commercial",
      dataIndex: "commercial",
      fixed: "right",
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
  ];

  useEffect(() => {
    setTableColumns(nonChangeColumns);
  }, [permissions]);

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setLeadExecutives(downlineUsers);
      getTrainersData();
    }
  }, [childUsers]);

  const getTrainersData = async () => {
    setLoading(true);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);

    const payload = {
      status: "Verified",
    };
    try {
      const response = await getTrainers(payload);
      setTrainersData(response?.data?.data?.trainers || []);
    } catch (error) {
      setTrainersData([]);
      console.log(error);
    } finally {
      setTimeout(() => {
        getCustomersData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          null,
          null,
          null,
          [
            { id: 1, name: "Classroom", checked: true },
            { id: 1, name: "Online", checked: true },
          ],
          1,
          10
        );
      }, 300);
    }
  };

  const getCustomersData = async (
    startDate,
    endDate,
    searchvalue,
    customerStatus,
    executive_id,
    branch_options,
    pageNumber,
    limit,
    is_generate_certificate
  ) => {
    setLoading(true);
    let lead_executive = [];
    if (executive_id) {
      lead_executive.push(executive_id);
    } else {
      lead_executive = [];
    }
    const region_data = branch_options
      .filter((f) => f.checked === true)
      .map((f) => f.name);

    const payload = {
      ...(searchvalue && filterType == 1
        ? { name: searchvalue }
        : searchvalue && filterType == 2
        ? { email: searchvalue }
        : searchvalue && filterType == 3
        ? { mobile: searchvalue }
        : searchvalue && filterType == 4
        ? { course: searchvalue }
        : {}),
      from_date: startDate,
      to_date: endDate,
      ...(customerStatus && {
        status:
          customerStatus === "Awaiting Trainer"
            ? ["Awaiting Trainer", "Trainer Rejected"]
            : customerStatus,
      }),
      user_ids: lead_executive.length >= 1 ? lead_executive : childUsers,
      ...(region_data.includes("Classroom") && region_data.includes("Online")
        ? {}
        : region_data.includes("Classroom")
        ? { region: "Classroom" }
        : region_data.includes("Online")
        ? { region: "Online" }
        : {}),
      page: pageNumber,
      limit: limit,
    };

    try {
      const response = await getCustomers(payload);
      console.log("customers response", response);
      const customers = response?.data?.data?.customers || [];
      const pagination = response?.data?.data?.pagination;

      setCustomersData(customers);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
      setCustomerStatusCount(
        response?.data?.data?.customer_status_count || null
      );
      if (is_generate_certificate === true) {
        if (customers.length >= 1) {
          const findCurrentCustomer = customers.find(
            (f) => f.id === customerDetails.id
          );

          if (findCurrentCustomer) {
            setCustomerDetails(findCurrentCustomer);
            setGoogleFeedbackBase64(findCurrentCustomer.google_review);
            setLinkedinFeedbackBase64(findCurrentCustomer.linkedin_review);
            setCourseDuration(findCurrentCustomer.course_duration);
            setCertMonth(findCurrentCustomer.cer_course_completion_month);
            setCertName(findCurrentCustomer.cer_customer_name);
            setCertCourseName(findCurrentCustomer.cer_course_name);
            setCertLocation(findCurrentCustomer.cer_location);
            setIsCertGenerated(
              findCurrentCustomer.is_certificate_generated === 1 ? true : false
            );
            setGenerateCertLoading(false);
          } else {
            setGenerateCertLoading(false);
          }
        } else {
          setGenerateCertLoading(false);
        }
      }
    } catch (error) {
      setCustomerStatusCount(null);
      setCustomersData([]);
      console.log("get customers error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getCustomersData(
      selectedDates[0],
      selectedDates[1],
      searchValue,
      status,
      leadExecutiveId,
      branchOptions,
      page,
      limit
    );
  };

  const getCustomerHistoryData = async (customerid) => {
    setIsOpenCustomerHistoryDrawer(true);
    setCustomerHistoryLoading(true);
    try {
      const response = await getCustomerFullHistory(customerid);
      setCustomerHistory(response?.data?.data || []);
      console.log("history response", response);
      setTimeout(() => {
        setCustomerHistoryLoading(false);
      }, 300);
    } catch (error) {
      setCustomerHistoryLoading(false);
      console.log("history response", error);
    }
  };

  const getAssignTrainerData = async (trainerId) => {
    try {
      const response = await getTrainerById(trainerId);
      const trainerDetails = response?.data?.data;
      setAssignTrainerData(trainerDetails);
    } catch (error) {
      setAssignTrainerData(null);
      console.log("get trainer by id error", error);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setPagination({
      page: 1,
    });
    setTimeout(() => {
      getCustomersData(
        selectedDates[0],
        selectedDates[1],
        e.target.value,
        status,
        leadExecutiveId,
        branchOptions,
        1,
        pagination.limit
      );
    }, 300);
  };

  const handleEdit = (item) => {
    setCustomerId(item.id);
    setCustomerDetails(item);
    setIsOpenEditDrawer(true);
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setIsOpenFilterDrawer(false);
    setCustomerDetails(null);
  };

  const handlePaidNow = (e) => {
    const input = e.target.value;

    // Allow numbers, decimal point, or empty string
    if (!/^\d*\.?\d*$/.test(input)) return;

    setPaidNow(input); // store as string for user input

    const value = parseFloat(input); // parse for calculations
    const amt = parseFloat(amount);

    if (value < amt || isNaN(value) || input == "" || input == null) {
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
      setPaidNowError(
        priceValidator(isNaN(value) ? 0 : value, parseFloat(amt))
      );
    }
  };

  const handlePaymentType = (e) => {
    const value = e.target.value;
    setPaymentMode(value);
    const amnt = calculateAmount(parseInt(subTotal), taxType == 5 ? 0 : 18);
    setAmount(amnt);

    if (paymentValidationTrigger) {
      setPaymentModeError(selectValidator(value));
    }

    //handle balance amount
    if (paidNow < amnt || isNaN(paidNow) || paidNow == "" || paidNow == null) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }
    setBalanceAmount(
      getBalanceAmount(isNaN(amnt) ? 0 : amnt, isNaN(paidNow) ? 0 : paidNow)
    );

    //handle convenience fees
    if (value == 2 || value == 5) {
      const conve_fees = getConvenienceFees(paidNow ? parseInt(paidNow) : 0);
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }
  };

  const handleRefresh = () => {
    setStatus("");
    setSearchValue("");
    setLeadExecutiveId(null);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
    });
    getCustomersData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
      null,
      null,
      branchOptions,
      1,
      pagination.limit
    );
  };

  const handleCustomerStatus = async (updatestatus) => {
    const payload = {
      customer_id: customerDetails.id,
      status: updatestatus,
    };
    try {
      await updateCustomerStatus(payload);
      handleCustomerTrack(updatestatus);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCustomerTrack = async (updatestatus, transactionId) => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const paymentVerifyDetails = {
      transaction_id: transactionId ?? "0",
    };
    const studentVerifiedDetails = {
      comments: studentVerifyComments,
      proof_communication: studentVerifyProofBase64,
    };

    let trainerName = "";
    if (updatestatus === "Trainer Assigned") {
      const findTrainer = trainersData.find((f) => f.id == trainerId);
      trainerName = findTrainer ? findTrainer.name : "";
    }

    const assignTrainerDetails = {
      trainer_id: trainerId,
      trainer_name: trainerName,
      commercial: commercial,
      mode_of_class: modeOfClass,
      trainer_type: trainerType,
      comments: assignTrainerComments,
      proof_communication: assignTrainerProofBase64,
    };

    const verifyOrRejectTrainerDetails = {
      trainer_name:
        customerDetails && customerDetails.trainer_name
          ? customerDetails.trainer_name
          : "-",
      trainer_email:
        customerDetails && customerDetails.trainer_email
          ? customerDetails.trainer_email
          : "-",
      trainer_mobile:
        customerDetails && customerDetails.trainer_mobile
          ? customerDetails.trainer_mobile
          : "-",
      mode_of_class:
        customerDetails && customerDetails.mode_of_class
          ? customerDetails.mode_of_class
          : "-",
      trainer_type:
        customerDetails && customerDetails.trainer_type
          ? customerDetails.trainer_type
          : "-",
      trainer_commercial:
        customerDetails && customerDetails.commercial
          ? customerDetails.commercial
          : "-",
      trainer_commercial_percentage:
        customerDetails && customerDetails.commercial_percentage
          ? customerDetails.commercial_percentage
          : "-",
      ...(updatestatus && updatestatus === "Trainer Rejected"
        ? { rejected_reason: rejectTrainerComments }
        : {}),
    };

    const classScheduledDetails = {
      schedule_status: "Class Scheduled",
      ...(classStartDate
        ? {
            class_start_date: formatToBackendIST(classStartDate),
          }
        : { class_start_date: null }),
    };

    const classGoingDetails = {
      schedule_status: "Class Going",
      class_going_percentage: classGoingPercentage,
    };

    const holdDetails = {
      comments: classHoldComments,
    };

    const escalatedDetails = {
      comments: classGoingComments,
      attachment: addattachmentBase64,
    };

    const classCompletedDetails = {
      schedule_status: "Class Completed",
      class_going_percentage: 100,
    };

    const googleReviewDetails = {
      google_review: googleFeedbackBase64,
    };

    const linkedinReviewDetails = {
      linkedin_review: linkedinFeedbackBase64,
    };

    const payload = {
      customer_id: customerDetails.id,
      status: updatestatus,
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      status_date: formatToBackendIST(today),
      ...(updatestatus && updatestatus === "Payment Verified"
        ? { details: paymentVerifyDetails }
        : updatestatus === "Part Payment Verified"
        ? { details: paymentVerifyDetails }
        : updatestatus === "Student Verified"
        ? { details: studentVerifiedDetails }
        : updatestatus === "Trainer Assigned"
        ? { details: assignTrainerDetails }
        : updatestatus === "Trainer Verified" ||
          updatestatus === "Trainer Rejected"
        ? { details: verifyOrRejectTrainerDetails }
        : updatestatus === "Class Scheduled"
        ? { details: classScheduledDetails }
        : updatestatus === "Class Going"
        ? { details: classGoingDetails }
        : updatestatus === "Hold" || updatestatus === "Demo Completed"
        ? { details: holdDetails }
        : updatestatus === "Escalated" ||
          updatestatus === "Partially Closed" ||
          updatestatus === "Discontinued" ||
          updatestatus === "Refund"
        ? { details: escalatedDetails }
        : updatestatus === "Class Completed"
        ? { details: classCompletedDetails }
        : updatestatus === "Google Review Added"
        ? { details: googleReviewDetails }
        : updatestatus === "Linkedin Review Added"
        ? { details: linkedinReviewDetails }
        : {}),
    };
    try {
      await inserCustomerTrack(payload);
      setTimeout(() => {
        if (
          updatestatus === "Google Review Added" ||
          updatestatus === "Certificate Generated"
        ) {
          return;
        }
        updateStatusDrawerReset();
        setPagination({
          page: 1,
        });
        getCustomersData(
          selectedDates[0],
          selectedDates[1],
          searchValue,
          status,
          leadExecutiveId,
          branchOptions,
          pagination.page,
          pagination.limit
        );
      }, 300);
    } catch (error) {
      console.log("customer track error", error);
    }
  };

  const handleSecondCustomerTrack = async (updatestatus) => {
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
    } catch (error) {
      console.log("customer track error", error);
    }
  };

  const handleFinanceVerify = async () => {
    setUpdateButtonLoading(true);
    const today = new Date();
    const payload = {
      payment_trans_id: transactionDetails?.id || "",
      verified_date: formatToBackendIST(today),
    };
    try {
      await verifyCustomerPayment(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(async () => {
        const payload = {
          customer_id: customerDetails.id,
          status:
            customerDetails?.is_second_due === 1
              ? customerDetails?.status ?? "Unknown"
              : "Awaiting Verify",
        };
        try {
          await updateCustomerStatus(payload);
          handleCustomerTrack(
            customerDetails?.is_second_due === 1
              ? "Part Payment Verified" ?? "Unknown"
              : "Payment Verified",
            transactionDetails?.id || ""
          );
          setTimeout(() => {
            if (customerDetails?.is_second_due === 1) {
              return;
            }
            handleSecondCustomerTrack("Awaiting Verify");
          }, 300);
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later"
          );
        }
        sendInvoiceEmail(transactionDetails);
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleFinaceReject = async () => {
    const commentValidate = addressValidator(financeRejectComment);

    setFinanceRejectCommentError(commentValidate);

    if (commentValidate) return;

    setRejectLoading(true);
    const today = new Date();
    const payload = {
      payment_trans_id: rejectTransItem?.id || "",
      reason: financeRejectComment,
      rejected_date: formatToBackendIST(today),
    };
    try {
      await rejectCustomerPayment(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        setRejectLoading(false);
        handleCustomerTrack(
          customerDetails?.is_second_due === 1
            ? "Part Payment Rejected" ?? "Unknown"
            : "Payment Rejected"
        );
      }, 300);
    } catch (error) {
      setRejectLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const sendInvoiceEmail = async (transactiondetails) => {
    const payload = {
      email:
        customerDetails && customerDetails.email ? customerDetails.email : "",
      name: customerDetails && customerDetails.name ? customerDetails.name : "",
      mobile:
        customerDetails && customerDetails.phone ? customerDetails.phone : "",
      convenience_fees: transactiondetails?.convenience_fees || "",
      gst_amount: customerDetails?.payments?.gst_amount
        ? customerDetails.payments.gst_amount
        : "",
      gst_percentage: customerDetails?.payments?.gst_percentage
        ? parseFloat(customerDetails.payments.gst_percentage)
        : "",
      invoice_date: transactiondetails?.invoice_date
        ? moment(transactiondetails.invoice_date).format("DD-MM-YYYY")
        : "",
      invoice_number: transactiondetails?.invoice_number || "",
      paid_amount: transactiondetails?.amount || "",
      payment_mode: transactiondetails?.payment_mode || "",
      total_amount: customerDetails?.payments?.total_amount
        ? customerDetails.payments.total_amount
        : "",
      balance_amount:
        transactiondetails.balance_amount != undefined ||
        transactiondetails.balance_amount != null
          ? parseFloat(transactiondetails?.balance_amount).toFixed(2)
          : "",
      course_name:
        customerDetails && customerDetails.course_name
          ? customerDetails.course_name
          : "",
      sub_total:
        customerDetails && customerDetails.primary_fees
          ? customerDetails.primary_fees
          : "",
    };

    try {
      await sendPaymentInvoiceByEmail(payload);
    } catch (error) {
      console.log("invoice error", error);
    }
  };

  const handleUpdatePaymentTransaction = async () => {
    setPaymentValidationTrigger(true);
    const paymentTypeValidate = selectValidator(paymentMode);
    const paymentDateValidate = selectValidator(paymentDate);

    const paidNowValidate = priceValidator(parseInt(paidNow), parseInt(amount));

    const screenshotValidate = selectValidator(paymentScreenShotBase64);
    let dueDateValidate;

    if (isShowDueDate) {
      dueDateValidate = selectValidator(dueDate);
    } else {
      dueDateValidate = "";
    }

    setPaymentModeError(paymentTypeValidate);
    setPaidNowError(paidNowValidate);
    setPaymentDateError(paymentDateValidate);
    setPaymentScreenShotError(screenshotValidate);
    setDueDateError(dueDateValidate);

    if (
      paymentTypeValidate ||
      paidNowValidate ||
      paymentDateValidate ||
      screenshotValidate ||
      dueDateValidate
    )
      return;

    setUpdateButtonLoading(true);
    const today = new Date();
    const payload = {
      invoice_date: formatToBackendIST(paymentDate),
      amount: paidNow,
      convenience_fees: convenienceFees,
      paymode_id: paymentMode,
      payment_screenshot: paymentScreenShotBase64,
      paid_date: formatToBackendIST(paymentDate),
      next_due_date: formatToBackendIST(dueDate),
      payment_trans_id: updatePaymentTransId,
    };
    try {
      await updateCustomerPaymentTransaction(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(async () => {
        const payload = {
          customer_id: customerDetails.id,
          status: customerDetails.status,
        };
        try {
          await updateCustomerStatus(payload);
          handleCustomerTrack("Payment Updated");
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later"
          );
        }
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleStudentVerify = async () => {
    const commentValidate = addressValidator(studentVerifyComments);
    const studentVerifyProofValidate = selectValidator(
      studentVerifyProofBase64
    );

    setStudentVerifyProofError(studentVerifyProofValidate);
    setStudentVerifyCommentsError(commentValidate);

    if (studentVerifyProofValidate || commentValidate) return;
    setUpdateButtonLoading(true);

    const payload = {
      customer_id: customerDetails.id,
      proof_communication: studentVerifyProofBase64,
      comments: studentVerifyComments,
      is_satisfied: isSatisfied,
    };

    try {
      await verifyCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(async () => {
        const payload = {
          customer_id: customerDetails.id,
          status: "Awaiting Trainer",
        };
        try {
          await updateCustomerStatus(payload);
          handleCustomerTrack("Student Verified");
          setTimeout(() => {
            handleSecondCustomerTrack("Awaiting Trainer");
          }, 300);
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later"
          );
        }
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleTrainerHistory = async (customer_id) => {
    const payload = {
      customer_id: customer_id,
    };

    try {
      const response = await getAssignTrainerHistoryForCustomer(payload);
      console.log("trainer history response", response);
      const historyData = response?.data?.data || [];
      setHistoryLoading(true);
      if (historyData.length >= 1) {
        const reverseData = historyData.reverse();
        const addChildren = reverseData.map((item, index) => {
          return {
            ...item,
            key: index + 1,
            label: (
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
                  Trainer Id -{" "}
                  <span style={{ fontWeight: "500" }}>
                    {item.trainer_code ? item.trainer_code : "-"}
                  </span>
                </span>
                <p style={{ color: "gray" }}>
                  Status: <span style={{ color: "#d32f2f" }}>Rejected</span>
                </p>{" "}
              </div>
            ),
            children: (
              <div>
                <Row gutter={16} style={{ marginTop: "6px" }}>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Trainer Name
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.trainer_name}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Commercial
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {"₹" + item.commercial}
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
                            Mode Of Class
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.mode_of_class}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Trainer Type
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.trainer_type}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row
                  gutter={16}
                  style={{ marginTop: "16px", marginBottom: "12px" }}
                >
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Rejected Date
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {moment(item.rejected_date).format("DD/MM/YYYY")}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Reason for Rejection
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">{item.comments}</p>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            ),
          };
        });

        setTrainerHistory(addChildren);
        setTimeout(() => {
          setHistoryLoading(false);
        }, 300);
      } else {
        setTrainerHistory([]);
        setTimeout(() => {
          setHistoryLoading(false);
        }, 300);
      }
    } catch (error) {
      setTrainerHistory([]);
      console.log("trainer history error", error);
    }
  };

  const handleAssignTrainer = async () => {
    const trainerIdValidate = selectValidator(trainerId);
    const commercialValidate = selectValidator(commercial);
    const modeOfClassValidate = selectValidator(modeOfClass);
    const commentValidate = addressValidator(assignTrainerComments);
    const assignTrainerProofValidate = selectValidator(
      assignTrainerProofBase64
    );

    setTrainerIdError(trainerIdValidate);
    setCommercialError(commercialValidate);
    setModeOfClassError(modeOfClassValidate);
    setAssignTrainerProofError(assignTrainerProofValidate);
    setAssignTrainerCommentsError(commentValidate);

    if (
      trainerIdValidate ||
      commercialValidate ||
      modeOfClassValidate ||
      assignTrainerProofValidate ||
      commentValidate
    )
      return;

    const today = new Date();

    setUpdateButtonLoading(true);

    const payload = {
      customer_id: customerDetails.id,
      proof_communication: assignTrainerProofBase64,
      comments: assignTrainerComments,
      trainer_id: trainerId,
      commercial: commercial,
      mode_of_class: modeOfClass,
      trainer_type: trainerType,
      created_date: formatToBackendIST(today),
    };

    try {
      await assignTrainerForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(async () => {
        const payload = {
          customer_id: customerDetails.id,
          status: "Awaiting Trainer Verify",
        };
        try {
          await updateCustomerStatus(payload);
          handleCustomerTrack("Trainer Assigned");
          setTimeout(() => {
            handleSecondCustomerTrack("Awaiting Trainer Verify");
          }, 300);
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later"
          );
        }
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const getCustomerByTrainerIdData = async (trainerid, classtaken) => {
    setCustomerByTrainerLoading(true);
    const payload = {
      trainer_id: trainerid,
      is_class_taken: classtaken,
    };
    try {
      const response = await getCustomerByTrainerId(payload);
      console.log("get customer by trainer id response", response);

      setTrainerClassTakenCount(response?.data?.data?.on_boarding_count || 0);
      setTrainerClassGoingCount(response?.data?.data?.on_going_count || 0);

      setCustomerByTrainerData(response?.data?.data?.students || []);
      setTimeout(() => {
        setCustomerByTrainerLoading(false);
      }, 300);
    } catch (error) {
      setCustomerByTrainerData([]);
      setCustomerByTrainerLoading(false);
      console.log("get customer by trainer id error", error);
    }
  };

  const handleVerifyTrainer = async () => {
    const today = new Date();

    setUpdateButtonLoading(true);

    const payload = {
      id: customerDetails.training_map_id,
      verified_date: formatToBackendIST(today),
    };

    try {
      await verifyTrainerForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(async () => {
        const payload = {
          customer_id: customerDetails.id,
          status: "Awaiting Class",
        };
        try {
          await updateCustomerStatus(payload);
          handleCustomerTrack("Trainer Verified");
          setTimeout(() => {
            handleSecondCustomerTrack("Awaiting Class");
          }, 300);
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later"
          );
        }
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleRejectTrainer = async () => {
    setIsShowRejectTrainerCommentBox(true);
    setTimeout(() => {
      const container = document.getElementById(
        "customer_trainerreject_commentContainer"
      );
      container.scrollIntoView({ behavior: "smooth" });
    }, 200);

    const commentValidate = addressValidator(rejectTrainerComments);

    setRejectTrainerCommentsError(commentValidate);

    if (commentValidate) return;

    const today = new Date();

    setRejectButtonLoader(true);

    const payload = {
      id: customerDetails.training_map_id,
      rejected_date: formatToBackendIST(today),
      comments: rejectTrainerComments,
    };

    try {
      await rejectTrainerForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(async () => {
        const payload = {
          customer_id: customerDetails.id,
          status: "Trainer Rejected",
        };
        try {
          await updateCustomerStatus(payload);
          handleCustomerTrack("Trainer Rejected");
          setTimeout(() => {
            handleSecondCustomerTrack("Awaiting Trainer");
          }, 300);
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later"
          );
        }
      }, 300);
    } catch (error) {
      setRejectButtonLoader(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleClassSchedule = async () => {
    const scheduleIdValidate = selectValidator(scheduleId);
    let classStartDateValidate;
    let classHoldCommentValidate;

    if (scheduleId === 6) {
      classStartDateValidate = selectValidator(classStartDate);
    } else {
      classStartDateValidate = "";
    }

    if (scheduleId === 3 || scheduleId === 10) {
      classHoldCommentValidate = addressValidator(classHoldComments);
    } else {
      classStartDateValidate = "";
    }

    setScheduleIdError(scheduleIdValidate);
    setClassStartDateError(classStartDateValidate);
    setClassHoldCommentsError(classHoldCommentValidate);

    if (
      scheduleIdValidate ||
      classStartDateValidate ||
      classHoldCommentValidate
    )
      return;
    setUpdateButtonLoading(true);

    const today = new Date();

    const payload = {
      customer_id: customerDetails.id,
      schedule_id: scheduleId,
      ...(classStartDate
        ? {
            class_start_date: formatToBackendIST(classStartDate),
          }
        : { class_start_date: null }),
      schedule_at: formatToBackendIST(today),
      ...(classHoldComments && { comments: classHoldComments }),
    };
    console.log("class schedule payload", payload);
    try {
      await classScheduleForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus(
          scheduleId == 1
            ? "Class Going"
            : scheduleId == 3
            ? "Hold"
            : scheduleId == 10
            ? "Demo Completed"
            : scheduleId == 5
            ? "Escalated"
            : "Class Scheduled"
        );
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleUpdateClassGoing = async () => {
    const classGoingPercentageValidate =
      percentageValidator(classGoingPercentage);
    let commentValidate;
    let attachmentValidate;

    if (scheduleId != 1) {
      commentValidate = addressValidator(classGoingComments);
      attachmentValidate = selectValidator(addattachmentBase64);
    } else {
      commentValidate = "";
      attachmentValidate = "";
    }

    setClassGoingPercentageError(classGoingPercentageValidate);
    setClassGoingCommentsError(commentValidate);
    setAddattachmentError(attachmentValidate);

    if (classGoingPercentageValidate || commentValidate || attachmentValidate)
      return;

    setUpdateButtonLoading(true);
    const payload = {
      customer_id: customerDetails.id,
      schedule_id: scheduleId,
      class_percentage: classGoingPercentage,
      class_comments: classGoingComments,
      class_attachment: addattachmentBase64,
    };

    if (classGoingPercentage >= 100) {
      setIsOpenClassCompleteModal(true);
      setUpdateButtonLoading(false);
      return;
    }

    try {
      await updateClassGoingForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      if (classGoingPercentage < 100) {
        setTimeout(() => {
          handleCustomerStatus(
            scheduleId === 1
              ? "Class Going"
              : scheduleId === 3
              ? "Hold"
              : scheduleId === 5
              ? "Escalated"
              : scheduleId === 7
              ? "Partially Closed"
              : scheduleId === 8
              ? "Discontinued"
              : scheduleId === 9
              ? "Refund"
              : ""
          );
          setUpdateButtonLoading(false);
          // updateStatusDrawerReset();
        }, 300);
      }
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCompleteClass = async () => {
    setClassCompleteLoading(true);
    const payload = {
      customer_id: customerDetails.id,
      schedule_id: scheduleId,
      class_percentage: classGoingPercentage,
      class_comments: classGoingComments,
      class_attachment: addattachmentBase64,
    };

    try {
      await updateClassGoingForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(async () => {
        setIsOpenClassCompleteModal(false);
        const payload = {
          customer_id: customerDetails.id,
          status: "Passedout process",
        };
        try {
          await updateCustomerStatus(payload);
          handleCustomerTrack("Class Completed");
          setTimeout(() => {
            handleSecondCustomerTrack("Passedout Process");
            setClassCompleteLoading(false);
          }, 300);
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later"
          );
        }
      }, 300);
    } catch (error) {
      setClassCompleteLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleGoogleReview = async () => {
    if (isGoogleReviewChange) {
      const today = new Date();
      const payload = {
        customer_id: customerDetails.id,
        linkedin_review: customerDetails.linkedin_review
          ? customerDetails.linkedin_review
          : linkedinFeedbackBase64,
        google_review: googleFeedbackBase64,
        course_duration: customerDetails.course_duration,
        course_completed_date: customerDetails.course_completion_date,
        review_updated_date: formatToBackendIST(today),
      };
      try {
        await updatefeedbackForCustomer(payload);
        setPagination({
          page: 1,
        });
        getCustomersData(
          selectedDates[0],
          selectedDates[1],
          searchValue,
          status,
          leadExecutiveId,
          branchOptions,
          pagination.page,
          pagination.limit
        );
        if (callCusTrack) {
          handleCustomerTrack("Google Review Added");
          setCallCusTrack(false);
        }
        // CommonMessage("success", "Updated Successfully");
        setCurrent(1);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    } else {
      setCurrent(1);
    }
  };

  const handleCertificateDetails = async () => {
    if (customerDetails.is_certificate_generated === 0) {
      CommonMessage(
        "error",
        "Please Generate Certificate. Before Go To Next Step"
      );
      return;
    } else {
      setCurrent(2);
    }
  };

  const handleGenerateCert = async () => {
    const courseDurationValidate = selectValidator(courseDuration);
    const certMonthValidate = selectValidator(certMonth);
    const certNameValidate = nameValidator(certName);
    const certCourseValidate = addressValidator(certCourseName);
    const certLocationValidate = selectValidator(certLocation);

    setCourseDurationError(courseDurationValidate);
    setCertMonthError(certMonthValidate);
    setCertNameError(certNameValidate);
    setCertCourseNameError(certCourseValidate);
    setCertLocationError(certLocationValidate);

    if (
      courseDurationValidate ||
      certMonthValidate ||
      certNameValidate ||
      certCourseValidate ||
      certLocationValidate
    )
      return;

    const payload = {
      customer_id: customerDetails.id,
      customer_name: certName,
      course_name: certCourseName,
      course_duration: courseDuration,
      course_completion_month: certMonth,
      current_location: certLocation,
    };

    setGenerateCertLoading(true);
    try {
      const response = await generateCertForCustomer(payload);
      console.log("cert response", response);
      CommonMessage("success", "Certificate Generated Successfully");
      setTimeout(() => {
        handleCustomerTrack("Certificate Generated");
        setPagination({
          page: 1,
        });
        getCustomersData(
          selectedDates[0],
          selectedDates[1],
          searchValue,
          status,
          leadExecutiveId,
          branchOptions,
          pagination.page,
          pagination.limit,
          true
        );
      }, 300);
    } catch (error) {
      setGenerateCertLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleViewCert = async (customer_id) => {
    setGenerateCertLoading(true);
    const payload = {
      customer_id: customer_id ? customer_id : customerDetails.id,
    };
    try {
      const response = await viewCertForCustomer(payload);
      console.log("cert response", response);
      const htmlTemplate = response?.data?.data?.html_template;
      setCertHtmlContent(htmlTemplate);
      setTimeout(() => {
        setGenerateCertLoading(false);
        setIsOpenViewCertModal(true);
      }, 300);
    } catch (error) {
      setGenerateCertLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCompleteProcess = async () => {
    if (customerDetails.is_certificate_generated === 0) {
      CommonMessage("error", "Please Generate Certificate");
      return;
    }
    setUpdateButtonLoading(true);

    const today = new Date();
    const payload = {
      customer_id: customerDetails.id,
      linkedin_review: linkedinFeedbackBase64,
      google_review: customerDetails.google_review
        ? customerDetails.google_review
        : googleFeedbackBase64,
      course_duration: null,
      course_completed_date: null,
      review_updated_date: formatToBackendIST(today),
    };
    try {
      await updatefeedbackForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(async () => {
        const payload = {
          customer_id: customerDetails.id,
          status: "Completed",
        };
        try {
          await updateCustomerStatus(payload);
          handleCustomerTrack("Linkedin Review Added");
          setTimeout(() => {
            handleSecondCustomerTrack("Completed");
            handleSendCertByEmail();
          }, 300);
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later"
          );
        }
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleSendCertByEmail = async () => {
    const payload = {
      email: customerDetails.email,
      customer_id: customerDetails.id,
    };
    try {
      await sendCustomerCertificate(payload);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const getHistoryStatusColor = (status) => {
    if (
      [
        "Verified",
        "Assigned",
        "Completed",
        "Going",
        "Added",
        "created",
        "Generated",
        "Scheduled",
      ].some((s) => status.includes(s))
    ) {
      return "green";
    }
    if (status.includes("Awaiting")) return "gray";
    if (
      ["Escalated", "Rejected", "Partially", "Discontinued"].some((s) =>
        status.includes(s)
      )
    ) {
      return "#d32f2f";
    }
    return "#000"; // default black
  };

  const handleStatusMismatch = () => {
    CommonMessage("error", "Status Mismatch. Contack Support Team");
  };

  const updateStatusDrawerReset = () => {
    setIsStatusUpdateDrawer(false);
    setCustomerDetails(null);
    setDrawerContentStatus("");
    setTimeout(() => {
      setUpdateButtonLoading(false);
    }, 300);
    setRejectButtonLoader(false);
    //finance verify
    setIsOpenPaymentScreenshotModal(false);
    setIsShowFinanceRejectComment(false);
    setFinanceRejectComment("");
    setFinanceRejectCommentError("");
    setRejectTransItem(null);
    setTransactionDetails(null);
    setIsOpenFinanceVerifyModal(false);
    //update payment
    setPaymentMode(null);
    setPaymentModeError("");
    setSubTotal();
    setConvenienceFees("");
    setTaxType(null);
    setTaxTypeError("");
    setAmount();
    setPaidNow("");
    setPaidNowError("");
    setPaymentDate(null);
    setPaymentDateError("");
    setPaymentScreenShotBase64("");
    setPaymentScreenShotError("");
    setIsShowDueDate(true);
    setBalanceAmount("");
    setDueDate(null);
    setDueDateError("");
    setPaymentValidationTrigger(false);
    //student verify
    setStudentVerifyProofBase64("");
    setStudentVerifyProofError("");
    setStudentVerifyComments("");
    setStudentVerifyCommentsError("");
    setIsSatisfied(true);
    //assign trainer
    setTrainerId(null);
    setTrainerIdError("");
    setCommercial("");
    setCommercialError("");
    setModeOfClass(null);
    setModeOfClassError("");
    setTrainerType("");
    setAssignTrainerProofBase64("");
    setAssignTrainerProofError("");
    setAssignTrainerComments("");
    setAssignTrainerCommentsError("");
    setTrainerFilterType(1);
    setTrainerHistory([]);
    setTrainerClassTakenCount(0);
    setTrainerClassGoingCount(0);
    //verify trainer
    setAssignTrainerData(null);
    setRejectTrainerComments("");
    setRejectTrainerCommentsError("");
    setIsShowRejectTrainerCommentBox(false);
    //class schedule
    setScheduleId(null);
    setScheduleIdError("");
    setClassStartDate(null);
    setClassStartDateError("");
    //class going
    setClassGoingPercentage(0);
    setClassGoingPercentageError("");
    setClassGoingComments("");
    setClassGoingCommentsError("");
    setAddattachmentBase64("");
    setAddattachmentError("");
    setClassHoldComments("");
    //feedback
    setCurrent(0);
    setGoogleFeedbackBase64("");
    setCallCusTrack(false);
    setLinkedinFeedbackBase64("");
    setCourseDuration("");
    setCourseDurationError("");
    setIsGoogleReviewChange(false);
    setIsCertChange(false);
    //cert usestaes
    setCertName("");
    setCertNameError("");
    setCertCourseName("");
    setCertCourseNameError("");
    setCertMonth("");
    setCertMonthError("");
    setCertLocation("");
    setCertLocationError("");
    setIsCertGenerated(false);
    setCertificateName("");
  };

  return (
    <div>
      <Row>
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
                          getCustomersData(
                            selectedDates[0],
                            selectedDates[1],
                            null,
                            status,
                            leadExecutiveId,
                            branchOptions,
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
                              setSearchValue("");
                              setPagination({
                                page: 1,
                              });
                              getCustomersData(
                                selectedDates[0],
                                selectedDates[1],
                                null,
                                status,
                                leadExecutiveId,
                                branchOptions,
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
                    getCustomersData(
                      selectedDates[0],
                      selectedDates[1],
                      searchValue,
                      status,
                      e.target.value,
                      branchOptions,
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
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getCustomersData(
                    dates[0],
                    dates[1],
                    searchValue,
                    status,
                    leadExecutiveId,
                    branchOptions,
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
            onClick={() => {
              setIsOpenFilterDrawer(true);
              setDuplicateBranchOptions(branchOptions);
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

      <div className="customers_scroll_wrapper">
        <button
          onClick={() => scroll(-600)}
          className="customer_statusscroll_button"
        >
          <IoMdArrowDropleft size={25} />
        </button>
        <div className="customers_status_mainContainer" ref={scrollRef}>
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
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                null,
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              All{" "}
              {`( ${
                customerStatusCount &&
                customerStatusCount.total_count !== undefined &&
                customerStatusCount.total_count !== null
                  ? customerStatusCount.total_count
                  : "-"
              } )`}
            </p>
          </div>
          <div
            className={
              status == "Form Pending"
                ? "customers_active_formpending_container"
                : "customers_formpending_container"
            }
            onClick={() => {
              if (status == "Form Pending") {
                return;
              }
              setStatus("Form Pending");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Form Pending",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Form Pending{" "}
              {`( ${
                customerStatusCount &&
                customerStatusCount.form_pending !== undefined &&
                customerStatusCount.form_pending !== null
                  ? customerStatusCount.form_pending
                  : "-"
              } )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Finance"
                ? "customers_active_awaitfinance_container"
                : "customers_awaitfinance_container"
            }
            onClick={() => {
              if (status === "Awaiting Finance") {
                return;
              }
              setStatus("Awaiting Finance");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Finance",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Awaiting Finance{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_finance !== undefined &&
                customerStatusCount.awaiting_finance !== null
                  ? customerStatusCount.awaiting_finance
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Verify"
                ? "customers_active_studentvefity_container"
                : "customers_studentvefity_container"
            }
            onClick={() => {
              if (status === "Awaiting Verify") {
                return;
              }
              setStatus("Awaiting Verify");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Verify",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Student Verify{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_verify !== undefined &&
                customerStatusCount.awaiting_verify !== null
                  ? customerStatusCount.awaiting_verify
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Trainer"
                ? "customers_active_assigntrainers_container"
                : "customers_assigntrainers_container"
            }
            onClick={() => {
              if (status === "Awaiting Trainer") {
                return;
              }
              setStatus("Awaiting Trainer");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Trainer",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Assign Trainer{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_trainer !== undefined &&
                customerStatusCount.awaiting_trainer !== null
                  ? customerStatusCount.awaiting_trainer
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Trainer Verify"
                ? "customers_active_verifytrainers_container"
                : "customers_verifytrainers_container"
            }
            onClick={() => {
              if (status === "Awaiting Trainer Verify") {
                return;
              }
              setStatus("Awaiting Trainer Verify");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Trainer Verify",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Verify Trainer{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_trainer_verify !== undefined &&
                customerStatusCount.awaiting_trainer_verify !== null
                  ? customerStatusCount.awaiting_trainer_verify
                  : "-"
              }
 )`}
            </p>
          </div>

          <div
            className={
              status === "Awaiting Class"
                ? "customers_active_awaitingclass_container"
                : "customers_awaitingclass_container"
            }
            onClick={() => {
              if (status === "Awaiting Class") {
                return;
              }
              setStatus("Awaiting Class");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Class",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Awaiting Class{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_class !== undefined &&
                customerStatusCount.awaiting_class !== null
                  ? customerStatusCount.awaiting_class
                  : "-"
              }
 )`}
            </p>
          </div>

          <div
            className={
              status === "Class Scheduled"
                ? "customers_active_classschedule_container"
                : "customers_classschedule_container"
            }
            onClick={() => {
              if (status === "Class Scheduled") {
                return;
              }
              setStatus("Class Scheduled");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Class Scheduled",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Class Scheduled{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.class_scheduled !== undefined &&
                customerStatusCount.class_scheduled !== null
                  ? customerStatusCount.class_scheduled
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Class Going"
                ? "customers_active_classgoing_container"
                : "customers_classgoing_container"
            }
            onClick={() => {
              if (status === "Class Going") {
                return;
              }
              setStatus("Class Going");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Class Going",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Class Going{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.class_going !== undefined &&
                customerStatusCount.class_going !== null
                  ? customerStatusCount.class_going
                  : "-"
              }
 )`}
            </p>
          </div>

          <div
            className={
              status === "Passedout process"
                ? "customers_active_feedback_container"
                : "customers_feedback_container"
            }
            onClick={() => {
              if (status === "Passedout process") {
                return;
              }
              setStatus("Passedout process");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Passedout Process",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Passedout Process{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.passedout_process !== undefined &&
                customerStatusCount.passedout_process !== null
                  ? customerStatusCount.passedout_process
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Completed"
                ? "customers_active_completed_container"
                : "customers_completed_container"
            }
            onClick={() => {
              if (status === "Completed") {
                return;
              }
              setStatus("Completed");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Completed",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Completed{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.completed !== undefined &&
                customerStatusCount.completed !== null
                  ? customerStatusCount.completed
                  : "-"
              }
 )`}
            </p>
          </div>

          <div
            className={
              status === "Escalated"
                ? "customers_active_escalated_container"
                : "customers_escalated_container"
            }
            onClick={() => {
              if (status === "Escalated") {
                return;
              }
              setStatus("Escalated");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Escalated",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Escalated{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.escalated !== undefined &&
                customerStatusCount.escalated !== null
                  ? customerStatusCount.escalated
                  : "-"
              }
 )`}
            </p>
          </div>

          <div
            className={
              status === "Others"
                ? "customers_active_others_container"
                : "customers_others_container"
            }
            onClick={() => {
              if (status === "Others") {
                return;
              }
              setStatus("Others");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Others",
                leadExecutiveId,
                branchOptions,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Others{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.Others !== undefined &&
                customerStatusCount.Others !== null
                  ? customerStatusCount.Others
                  : "-"
              }
 )`}
            </p>
          </div>
        </div>
        <button
          onClick={() => scroll(600)}
          className="customer_statusscroll_button"
        >
          <IoMdArrowDropright size={25} />
        </button>
      </div>

      <div>
        <CommonTable
          scroll={{ x: 2350 }}
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
        width="50%"
        style={{ position: "relative" }}
      >
        <div className="customer_profileContainer">
          {customerDetails && customerDetails.profile_image ? (
            <img
              src={customerDetails.profile_image}
              className="cutomer_profileimage"
            />
          ) : (
            <FaRegUser size={50} color="#333" />
          )}

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
                  <LuCircleUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Lead Executive</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {`${
                    customerDetails && customerDetails.lead_assigned_to_id
                      ? customerDetails.lead_assigned_to_id
                      : "-"
                  } (${
                    customerDetails && customerDetails.lead_assigned_to_name
                      ? customerDetails.lead_assigned_to_name
                      : "-"
                  })`}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <MdOutlineDateRange size={15} color="gray" />
                  <p className="customerdetails_rowheading">Created At</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.created_date
                    ? moment(customerDetails.created_date).format("DD/MM/YYYY")
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
                      <p className="customerdetails_rowheading">Course Fees</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ fontWeight: 700 }}
                    >
                      {customerDetails && customerDetails.primary_fees
                        ? "₹" + customerDetails.primary_fees
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
                      {customerDetails && customerDetails.payments.total_amount
                        ? "₹" + customerDetails.payments.total_amount
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

                {/* <Row style={{ marginTop: "12px" }}>
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
                </Row> */}
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
        title="Update Customer"
        open={isOpenEditDrawer}
        onClose={() => {
          setIsOpenEditDrawer(false);
          setCustomerId(null);
          setCustomerDetails(null);
          customerUpdateRef.current?.formReset();
        }}
        width="50%"
        className="customerupdate_drawer"
        style={{ position: "relative", paddingBottom: 65 }}
      >
        <CustomerUpdate
          ref={customerUpdateRef}
          customerId={customerId}
          setUpdateDrawerTabKey={setUpdateDrawerTabKey}
          setUpdateButtonLoading={setUpdateButtonLoading}
          setIsOpenEditDrawer={setIsOpenEditDrawer}
          paymentMasterDetails={
            customerDetails && customerDetails.payments
              ? customerDetails.payments
              : null
          }
          callgetCustomersApi={() => {
            setPagination({
              page: 1,
            });
            getCustomersData(
              selectedDates[0],
              selectedDates[1],
              searchValue,
              status,
              leadExecutiveId,
              branchOptions,
              pagination.page,
              pagination.limit
            );
          }} // pass function as prop
        />

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {updateButtonLoading ? (
              <button className="customerupdate_loadingsubmitbutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="customerupdate_submitbutton"
                // onClick={handleSubmit}
                onClick={() => {
                  if (updateDrawerTabKey === "1") {
                    customerUpdateRef.current?.handleCustomerUpdate();
                  } else {
                    customerUpdateRef.current?.handlePaymentUpdate();
                  }
                }}
              >
                {updateDrawerTabKey === "1"
                  ? "Update Customer Details"
                  : "Update Payment Master"}
              </button>
            )}
          </div>
        </div>
      </Drawer>

      <Drawer
        title="Update Status"
        open={isStatusUpdateDrawer}
        onClose={updateStatusDrawerReset}
        width="50%"
        style={{
          position: "relative",
          paddingBottom:
            drawerContentStatus === "Finance Verify" ||
            drawerContentStatus === "Update Payment"
              ? "0px"
              : "65px",
        }}
        className="customer_statusupdate_drawer"
      >
        <div className="customer_statusupdate_drawer_profileContainer">
          {customerDetails && customerDetails.profile_image ? (
            <img
              src={customerDetails.profile_image}
              className="cutomer_profileimage"
            />
          ) : (
            <FaRegUser size={50} color="#333" />
          )}

          <div>
            <p
              className="customer_nametext"
              onClick={() => {
                console.log("drawerContentStatus", drawerContentStatus);
              }}
            >
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
                  {`${
                    customerDetails && customerDetails.lead_assigned_to_id
                      ? customerDetails.lead_assigned_to_id
                      : "-"
                  } (${
                    customerDetails && customerDetails.lead_assigned_to_name
                      ? customerDetails.lead_assigned_to_name
                      : "-"
                  })`}
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
                  <p className="customerdetails_rowheading">Course Fees</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text" style={{ fontWeight: 700 }}>
                  {customerDetails && customerDetails.primary_fees
                    ? "₹" + customerDetails.primary_fees
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
                  {customerDetails && customerDetails.payments.total_amount
                    ? "₹" + customerDetails.payments.total_amount
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

        {drawerContentStatus === "Finance Verify" ? (
          <div className="customer_statusupdate_adddetailsContainer">
            <div
              className="customerdetails_coursecard"
              style={{ marginBottom: "16px" }}
            >
              <div className="customerdetails_coursecard_headercontainer">
                <p>Payment Details</p>
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
                          {customerDetails && customerDetails.primary_fees
                            ? "₹" + customerDetails.primary_fees
                            : "-"}
                        </p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Total Fees
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p
                          className="customerdetails_text"
                          style={{ fontWeight: 700 }}
                        >
                          {customerDetails &&
                          customerDetails.payments.total_amount
                            ? "₹" + customerDetails.payments.total_amount
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
                            Gst Amount
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {customerDetails?.payments?.gst_amount ? (
                            <>
                              ₹{customerDetails.payments.gst_amount}{" "}
                              <span style={{ fontSize: "11px" }}>
                                ({customerDetails.payments.tax_type || "-"})
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
                            Total Paid Amount
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p
                          className="customerdetails_text"
                          style={{ color: "#3c9111", fontWeight: 700 }}
                        >
                          {customerDetails && customerDetails.paid_amount
                            ? "₹" + customerDetails.paid_amount
                            : "-"}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </div>

            <p style={{ fontWeight: 600, color: "#333", fontSize: "16px" }}>
              Transaction History
            </p>

            <div style={{ marginBottom: "30px" }}>
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
                              <div style={{ display: "flex", gap: "12px" }}>
                                <Button
                                  className="customer_finance_rejectbutton"
                                  onClick={() => {
                                    setIsShowFinanceRejectComment(true);
                                    setFinanceRejectCommentError(
                                      addressValidator(financeRejectComment)
                                    );
                                    setRejectTransItem(item);
                                    setTimeout(() => {
                                      const container = document.getElementById(
                                        "customer_financereject_comment_container"
                                      );
                                      container.scrollIntoView({
                                        behavior: "smooth",
                                      });
                                    }, 200);
                                  }}
                                >
                                  Reject
                                </Button>

                                {updateButtonLoading ? (
                                  <Button className="customer_finance_loadingverifybutton">
                                    <CommonSpinner />
                                  </Button>
                                ) : (
                                  <Button
                                    className="customer_finance_verifybutton"
                                    onClick={() => {
                                      setIsOpenFinanceVerifyModal(true);
                                      setTransactionDetails(item);
                                    }}
                                  >
                                    Verify
                                  </Button>
                                )}
                              </div>
                            ) : item.payment_status === "Rejected" ? (
                              <div className="customer_trans_statustext_container">
                                <FaRegCircleXmark color="#d32f2f" />
                                <p
                                  style={{ color: "#d32f2f", fontWeight: 500 }}
                                >
                                  Rejected
                                </p>
                              </div>
                            ) : (
                              <div className="customer_trans_statustext_container">
                                <BsPatchCheckFill color="#3c9111" />
                                <p
                                  style={{ color: "#3c9111", fontWeight: 500 }}
                                >
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
                                    {moment(item.invoice_date).format(
                                      "DD/MM/YYYY"
                                    )}
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

                          <Row gutter={16} style={{ marginTop: "16px" }}>
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
                                      fontWeight: 700,
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

                          {item.payment_status === "Rejected" ? (
                            <Row
                              gutter={16}
                              style={{
                                marginTop: "12px",
                                marginBottom: "8px",
                              }}
                            >
                              <Col span={12}>
                                <Row>
                                  <Col span={12}>
                                    <div className="customerdetails_rowheadingContainer">
                                      <p className="customerdetails_rowheading">
                                        Nxt Due Date
                                      </p>
                                    </div>
                                  </Col>
                                  <Col span={12}>
                                    <p className="customerdetails_text">
                                      {item.next_due_date
                                        ? moment(item.next_due_date).format(
                                            "DD/MM/YYYY"
                                          )
                                        : "-"}{" "}
                                    </p>
                                  </Col>
                                </Row>
                              </Col>
                              <Col span={12}>
                                <Row>
                                  <Col span={12}>
                                    <div className="customerdetails_rowheadingContainer">
                                      <p className="customerdetails_rowheading">
                                        Rejected Reason
                                      </p>
                                    </div>
                                  </Col>
                                  <Col span={12}>
                                    <p className="customerdetails_text">
                                      {item.reason}
                                    </p>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          ) : (
                            <Row
                              gutter={16}
                              style={{
                                marginTop: "12px",
                                marginBottom: "8px",
                              }}
                            >
                              <Col span={12}>
                                <Row>
                                  <Col span={12}>
                                    <div className="customerdetails_rowheadingContainer">
                                      <p className="customerdetails_rowheading">
                                        Nxt Due Date
                                      </p>
                                    </div>
                                  </Col>
                                  <Col span={12}>
                                    <p className="customerdetails_text">
                                      {item.next_due_date
                                        ? moment(item.next_due_date).format(
                                            "DD/MM/YYYY"
                                          )
                                        : "-"}{" "}
                                    </p>
                                  </Col>
                                </Row>
                              </Col>
                              <Col span={12}>
                                <Row>
                                  <Col span={12}>
                                    <div className="customerdetails_rowheadingContainer">
                                      <p className="customerdetails_rowheading">
                                        Status
                                      </p>
                                    </div>
                                  </Col>
                                  <Col span={12}>
                                    <p className="customerdetails_text">
                                      Waiting to Verify
                                    </p>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          )}
                        </div>
                      </Collapse.Panel>
                    ))}
                  </Collapse>
                </div>
              ) : (
                <p className="customer_trainerhistory_nodatatext">
                  No Data found
                </p>
              )}

              {isShowFinanceRejectComment && (
                <div
                  className="customer_financereject_comment_container"
                  id="customer_financereject_comment_container"
                >
                  <CommonTextArea
                    label="Comments"
                    required={true}
                    onChange={(e) => {
                      setFinanceRejectComment(e.target.value);
                      setFinanceRejectCommentError(
                        addressValidator(e.target.value)
                      );
                    }}
                    value={financeRejectComment}
                    error={financeRejectCommentError}
                  />

                  <div className="customer_financereject_submitbutton_container">
                    {rejectLoading ? (
                      <Button
                        type="primary"
                        className="customer_financereject_loadingsubmitbutton"
                      >
                        <CommonSpinner />
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        className="customer_financereject_submitbutton"
                        onClick={handleFinaceReject}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : drawerContentStatus === "Update Payment" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p style={{ fontWeight: 600, color: "#333", fontSize: "16px" }}>
                Transaction History
              </p>

              <div>
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
                                  {moment(item.invoice_date).format(
                                    "DD/MM/YYYY"
                                  )}
                                </span>
                              </span>

                              {item.payment_status === "Rejected" ? (
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
                                      {moment(item.invoice_date).format(
                                        "DD/MM/YYYY"
                                      )}
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

                            <Row gutter={16} style={{ marginTop: "16px" }}>
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
                                        fontWeight: 700,
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

                            {item.payment_status === "Rejected" && (
                              <Row
                                gutter={16}
                                style={{
                                  marginTop: "12px",
                                  marginBottom: "8px",
                                }}
                              >
                                <Col span={12}>
                                  <Row>
                                    <Col span={12}>
                                      <div className="customerdetails_rowheadingContainer">
                                        <p className="customerdetails_rowheading">
                                          Nxt Due Date
                                        </p>
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <p className="customerdetails_text">
                                        {item.next_due_date
                                          ? moment(item.next_due_date).format(
                                              "DD/MM/YYYY"
                                            )
                                          : "-"}{" "}
                                      </p>
                                    </Col>
                                  </Row>
                                </Col>
                                <Col span={12}>
                                  <Row>
                                    <Col span={12}>
                                      <div className="customerdetails_rowheadingContainer">
                                        <p className="customerdetails_rowheading">
                                          Rejected Reason
                                        </p>
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <p className="customerdetails_text">
                                        {item.reason}
                                      </p>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            )}
                          </div>
                        </Collapse.Panel>
                      ))}
                    </Collapse>
                  </div>
                ) : (
                  <p className="customer_trainerhistory_nodatatext">
                    No Data found
                  </p>
                )}
              </div>
            </div>

            <Divider className="customer_statusupdate_divider" />

            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Payment Details
              </p>
              <Row
                gutter={16}
                style={{ marginTop: "20px", marginBottom: "30px" }}
              >
                <Col span={8}>
                  <CommonInputField
                    label="Fees"
                    required={true}
                    type="number"
                    value={subTotal}
                    disabled={true}
                  />
                </Col>
                <Col span={8}>
                  <CommonSelectField
                    label="Tax Type"
                    required={true}
                    options={[
                      { id: 1, name: "GST (18%)" },
                      { id: 2, name: "SGST (18%)" },
                      { id: 3, name: "IGST (18%)" },
                      { id: 4, name: "VAT (18%)" },
                      { id: 5, name: "No Tax" },
                    ]}
                    value={taxType}
                    error={taxTypeError}
                    height="41px"
                    disabled={true}
                  />
                </Col>
                <Col span={8}>
                  <CommonInputField
                    label="Total Amount"
                    required={true}
                    disabled
                    value={amount}
                  />
                </Col>
              </Row>
            </div>

            <Divider className="customer_statusupdate_divider" />

            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Update Rejected Payment
              </p>

              <Row gutter={16} style={{ marginTop: "20px" }}>
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
                <Col span={8}>
                  <CommonInputField
                    label="Convenience fees"
                    required={true}
                    value={convenienceFees}
                    disabled={true}
                    type="number"
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: "40px" }}>
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
                <Col span={16}>
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
            </div>

            <Divider className="customer_statusupdate_divider" />

            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Balance Amount Details
              </p>

              <Row
                gutter={16}
                style={{ marginTop: "20px", marginBottom: "30px" }}
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

              <div className="customer_paymentreject_buttoncontainer">
                {updateButtonLoading ? (
                  <Button
                    type="primary"
                    className="customer_paymentreject_loadingbutton"
                  >
                    <CommonSpinner />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    className="customer_paymentreject_button"
                    onClick={handleUpdatePaymentTransaction}
                  >
                    Update Payment
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : drawerContentStatus === "Student Verify" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Add Details
              </p>

              <Row style={{ marginTop: "6px" }}>
                <Col span={24}>
                  <div
                    style={{
                      marginBottom: "40px",
                    }}
                  >
                    <CommonTextArea
                      label="Comments"
                      required={true}
                      onChange={(e) => {
                        setStudentVerifyComments(e.target.value);
                        setStudentVerifyCommentsError(
                          addressValidator(e.target.value)
                        );
                      }}
                      value={studentVerifyComments}
                      error={studentVerifyCommentsError}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <ImageUploadCrop
                      label="Proof Communication"
                      aspect={1}
                      maxSizeMB={1}
                      required={true}
                      value={studentVerifyProofBase64}
                      onChange={(base64) => setStudentVerifyProofBase64(base64)}
                      onErrorChange={setStudentVerifyProofError}
                    />
                    {studentVerifyProofError && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#d32f2f",
                          marginTop: 4,
                        }}
                      >
                        {`Proof Screenshot ${studentVerifyProofError}`}
                      </p>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </>
        ) : drawerContentStatus === "Assign Trainer" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Previous Assigned Trainer History
              </p>

              {historyLoading === false ? (
                <>
                  {trainerHistory.length >= 1 ? (
                    <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                      <Collapse
                        className="assesmntresult_collapse"
                        items={trainerHistory}
                        activeKey={collapseDefaultKey}
                        onChange={(keys) => {
                          setCollapseDefaultKey(keys);
                        }}
                      ></Collapse>
                    </div>
                  ) : (
                    <p className="customer_trainerhistory_nodatatext">
                      No Data found
                    </p>
                  )}
                </>
              ) : (
                ""
              )}
              <p className="customer_statusupdate_adddetails_heading">
                Assign New Trainer
              </p>

              <Row gutter={16} style={{ marginTop: "14px" }}>
                <Col span={12}>
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
                          const clickedTrainer = trainersData.filter(
                            (f) => f.id == e.target.value
                          );
                          console.log("clickedTrainer", clickedTrainer);
                          setTrainerType(
                            clickedTrainer.length >= 1 &&
                              clickedTrainer[0].trainer_type
                              ? clickedTrainer[0].trainer_type
                              : ""
                          );
                          setClickedTrainerDetails(clickedTrainer);
                          setTrainerIdError(selectValidator(e.target.value));
                          getCustomerByTrainerIdData(e.target.value, 0);
                        }}
                        value={trainerId}
                        error={trainerIdError}
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
                      {/* <IoFilter size={16} /> */}
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
                          <Button className="customer_trainermappingfilter_container">
                            <IoFilter size={16} />
                          </Button>
                        </Tooltip>
                      </Flex>
                    </div>
                    {trainerId && (
                      <Tooltip
                        placement="top"
                        title="View Trainer Details"
                        trigger={["hover", "click"]}
                      >
                        <FaRegEye
                          size={17}
                          className="trainers_action_icons"
                          onClick={() => setIsOpenTrainerDetailModal(true)}
                        />
                      </Tooltip>
                    )}
                  </div>
                </Col>

                <Col span={12}>
                  <CommonOutlinedInput
                    label="Commercial"
                    type="number"
                    required={true}
                    onChange={(e) => {
                      setCommercial(e.target.value);
                      setCommercialError(selectValidator(e.target.value));
                    }}
                    value={commercial}
                    error={commercialError}
                    onInput={(e) => {
                      if (e.target.value.length > 10) {
                        e.target.value = e.target.value.slice(0, 10);
                      }
                    }}
                    icon={<LuIndianRupee size={16} />}
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: "30px" }}>
                <Col span={12}>
                  <CommonSelectField
                    label="Mode Of Class"
                    required={true}
                    options={modeOfClassOptions}
                    onChange={(e) => {
                      setModeOfClass(e.target.value);
                      setModeOfClassError(selectValidator(e.target.value));
                    }}
                    value={modeOfClass}
                    error={modeOfClassError}
                  />
                </Col>
                <Col span={12}>
                  <CommonInputField
                    label="Trainer Type"
                    required={true}
                    value={trainerType}
                    disabled={true}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: "28px" }}>
                <Col span={24}>
                  <div
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <CommonTextArea
                      label="Comments"
                      required={true}
                      onChange={(e) => {
                        setAssignTrainerComments(e.target.value);
                        setAssignTrainerCommentsError(
                          addressValidator(e.target.value)
                        );
                      }}
                      value={assignTrainerComments}
                      error={assignTrainerCommentsError}
                    />
                  </div>

                  <div
                    style={{
                      position: "relative",
                      marginTop: "40px",
                      marginBottom: "20px",
                    }}
                  >
                    <ImageUploadCrop
                      label="Proof Communication"
                      aspect={1}
                      maxSizeMB={1}
                      required={true}
                      value={assignTrainerProofBase64}
                      onChange={(base64) => setAssignTrainerProofBase64(base64)}
                      onErrorChange={setAssignTrainerProofError}
                    />
                    {assignTrainerProofError && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#d32f2f",
                          marginTop: 4,
                        }}
                      >
                        {`Proof Screenshot ${assignTrainerProofError}`}
                      </p>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </>
        ) : drawerContentStatus === "Trainer Verify" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Trainer Details
              </p>

              <Row gutter={16}>
                <Col span={13}>
                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Name
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {assignTrainerData && assignTrainerData.name
                          ? `${assignTrainerData.name} (${
                              assignTrainerData.trainer_code
                                ? assignTrainerData.trainer_code
                                : "-"
                            })`
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Email
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {assignTrainerData && assignTrainerData.email
                          ? assignTrainerData.email
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Mobile
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {assignTrainerData && assignTrainerData.mobile
                          ? assignTrainerData.mobile
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Mode Of Class
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">{modeOfClass}</p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Type
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">{trainerType}</p>
                    </Col>
                  </Row>
                </Col>

                <Col span={11}>
                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Skills
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {" "}
                        {assignTrainerData && assignTrainerData.skills
                          ? assignTrainerData.skills
                              .map((item) => item.name)
                              .join(", ")
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Commercial</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">{"₹" + commercial}</p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Commercial%
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p
                        className="customerdetails_text"
                        style={{
                          fontWeight: 700,
                          color:
                            customerDetails &&
                            customerDetails.commercial_percentage !== null
                              ? customerDetails.commercial_percentage < 18
                                ? "#3c9111" // green
                                : customerDetails.commercial_percentage > 18 &&
                                  customerDetails.commercial_percentage <= 22
                                ? "#ffa502" // orange
                                : customerDetails.commercial_percentage > 22
                                ? "#d32f2f" // red
                                : "inherit"
                              : "inherit", // fallback color if null
                        }}
                      >
                        {customerDetails &&
                        customerDetails.commercial_percentage
                          ? customerDetails.commercial_percentage + "%"
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Class Taken
                        </p>
                      </div>
                    </Col>
                    <Col
                      span={12}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <p className="customers_classtaken_customerscount">
                        {customerDetails &&
                        customerDetails.completed_student_count
                          ? customerDetails.completed_student_count +
                            " Customers"
                          : "-"}
                      </p>
                      <Tooltip
                        placement="top"
                        title="View Customer Details"
                        trigger={["hover", "click"]}
                      >
                        <FaRegEye
                          size={12}
                          className="trainers_action_icons"
                          onClick={() => {
                            setIsOpenTrainerCustomersModal(true);
                            getCustomerByTrainerIdData(
                              customerDetails && customerDetails.trainer_id
                                ? customerDetails.trainer_id
                                : null,
                              1
                            );
                          }}
                        />
                      </Tooltip>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Class Going
                        </p>
                      </div>
                    </Col>
                    <Col
                      span={12}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <p className="customers_classtaken_customerscount">
                        {customerDetails &&
                        customerDetails.ongoing_student_count
                          ? customerDetails.ongoing_student_count + " Customers"
                          : "-"}
                      </p>
                      <Tooltip
                        placement="top"
                        title="View Customer Details"
                        trigger={["hover", "click"]}
                      >
                        <FaRegEye
                          size={12}
                          className="trainers_action_icons"
                          onClick={() => {
                            setIsOpenTrainerCustomersModal(true);
                            getCustomerByTrainerIdData(
                              customerDetails && customerDetails.trainer_id
                                ? customerDetails.trainer_id
                                : null,
                              0
                            );
                          }}
                        />
                      </Tooltip>
                    </Col>
                  </Row>
                </Col>
              </Row>

              {isShowRejectTrainerCommentBox ? (
                <div
                  style={{ marginTop: "12px", position: "relative" }}
                  id="customer_trainerreject_commentContainer"
                >
                  <CommonTextArea
                    label="Comment"
                    required={true}
                    onChange={(e) => {
                      setRejectTrainerComments(e.target.value);
                      setRejectTrainerCommentsError(
                        addressValidator(e.target.value)
                      );
                    }}
                    value={rejectTrainerComments}
                    error={rejectTrainerCommentsError}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          </>
        ) : drawerContentStatus === "Class Schedule" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Add Details
              </p>

              <div style={{ marginTop: "16px" }}>
                <CommonSelectField
                  label="Schedule Status"
                  options={scheduleOptions}
                  required={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log("valllllllllll", value);
                    setScheduleId(value);
                    setScheduleIdError(selectValidator(value));
                    if (value == 6) {
                      setClassStartDateError(selectValidator(classStartDate));
                    } else {
                      setClassStartDate(null);
                      setClassStartDateError("");
                    }

                    if (value == 3 || value == 10) {
                      setClassHoldCommentsError(
                        addressValidator(classHoldComments)
                      );
                    } else {
                      setClassHoldCommentsError("");
                    }
                  }}
                  value={scheduleId}
                  error={scheduleIdError}
                />
              </div>
              {scheduleId == 6 ? (
                <div style={{ marginTop: "30px" }}>
                  <CommonMuiDatePicker
                    label="Schedule Date"
                    required={true}
                    onChange={(value) => {
                      setClassStartDate(value);
                      setClassStartDateError(selectValidator(value));
                    }}
                    value={classStartDate}
                    error={classStartDateError}
                    disablePreviousDates={true}
                  />
                </div>
              ) : (
                ""
              )}

              {scheduleId == 3 || scheduleId == 10 ? (
                <Row style={{ marginTop: "20px", marginBottom: 40 }}>
                  <Col span={24}>
                    <CommonTextArea
                      label="Comments"
                      required={false}
                      onChange={(e) => {
                        setClassHoldComments(e.target.value);
                        setClassHoldCommentsError(
                          addressValidator(e.target.value)
                        );
                      }}
                      value={classHoldComments}
                      error={classHoldCommentsError}
                    />
                  </Col>
                </Row>
              ) : (
                ""
              )}
            </div>
          </>
        ) : drawerContentStatus === "Class Going" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Update Class-Going Process
              </p>

              <Row gutter={16} style={{ marginTop: "30px" }}>
                <Col span={12}>
                  <CommonSelectField
                    label="Schedule Status"
                    options={scheduleOptions2}
                    required={true}
                    onChange={(e) => {
                      const value = e.target.value;
                      setScheduleId(value);
                      setScheduleIdError(selectValidator(value));
                      if (value !== 1) {
                        setClassGoingCommentsError(
                          addressValidator(classGoingComments)
                        );
                        setAddattachmentError(
                          selectValidator(addattachmentBase64)
                        );
                      } else {
                        setClassGoingCommentsError("");
                        setAddattachmentError("");
                      }
                    }}
                    value={scheduleId}
                    error={scheduleIdError}
                  />
                </Col>
                <Col span={12}>
                  <CommonInputField
                    label="Class Going Percentage"
                    required={true}
                    type="number"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value < 0) {
                        setClassGoingPercentage(0);
                        return;
                      }
                      setClassGoingPercentage(value);
                      setClassGoingPercentageError(percentageValidator(value));
                    }}
                    value={classGoingPercentage}
                    error={classGoingPercentageError}
                    onInput={(e) => {
                      if (e.target.value.length > 3) {
                        e.target.value = e.target.value.slice(0, 3);
                      }
                    }}
                    errorFontSize="9px"
                  />
                </Col>
              </Row>

              {scheduleId != 1 ? (
                <Row gutter={16} style={{ marginTop: "40px" }}>
                  <Col span={12}>
                    <div style={{ marginTop: "-25px" }}>
                      <CommonTextArea
                        label="Comments"
                        required={false}
                        onChange={(e) => {
                          setClassGoingComments(e.target.value);
                          setClassGoingCommentsError(
                            addressValidator(e.target.value)
                          );
                        }}
                        value={classGoingComments}
                        error={classGoingCommentsError}
                      />
                    </div>
                  </Col>

                  <Col span={12}>
                    <div style={{ marginTop: "16px" }}>
                      <ImageUploadCrop
                        label="Add Attachment"
                        aspect={1}
                        maxSizeMB={1}
                        required={true}
                        value={addattachmentBase64}
                        onChange={(base64) => setAddattachmentBase64(base64)}
                        onErrorChange={setAddattachmentError}
                      />
                      {addattachmentError && (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#d32f2f",
                            marginTop: 4,
                          }}
                        >
                          {`Attachment ${addattachmentError}`}
                        </p>
                      )}
                    </div>
                  </Col>
                </Row>
              ) : (
                ""
              )}
            </div>
          </>
        ) : drawerContentStatus === "Add G-Review" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <Steps current={current} size="small">
                <Step
                  title={
                    <span style={{ display: "flex", alignItems: "center" }}>
                      Add G-Review
                      <FcGoogle size={18} style={{ marginLeft: 6 }} />
                    </span>
                  }
                />
                <Step title="Certificate Details" />
                <Step
                  title={
                    <span style={{ display: "flex", alignItems: "center" }}>
                      Add L-Review
                      <FaLinkedin
                        color="#0a66c2"
                        size={18}
                        style={{ marginLeft: 6 }}
                      />
                    </span>
                  }
                />
              </Steps>

              {current === 0 ? (
                <div style={{ marginTop: "30px", marginBottom: "20px" }}>
                  <ImageUploadCrop
                    label="Google Review Screenshot"
                    aspect={1}
                    maxSizeMB={1}
                    required={false}
                    value={googleFeedbackBase64}
                    onChange={(base64) => {
                      setIsGoogleReviewChange(true);
                      setGoogleFeedbackBase64(base64);
                    }}
                  />
                </div>
              ) : (
                ""
              )}

              {current === 1 ? (
                <>
                  <Row gutter={16} style={{ marginTop: "16px" }}>
                    <Col span={12}>
                      <CommonOutlinedInput
                        label="Course Duration"
                        type="number"
                        required={true}
                        onChange={(e) => {
                          setCourseDuration(e.target.value);
                          setIsCertChange(true);
                          setCourseDurationError(
                            selectValidator(e.target.value)
                          );
                        }}
                        value={courseDuration}
                        error={courseDurationError}
                        onInput={(e) => {
                          if (e.target.value.length > 3) {
                            e.target.value = e.target.value.slice(0, 3);
                          }
                        }}
                        icon={<p style={{ fontSize: "11px" }}>Months</p>}
                        disabled={
                          customerDetails?.is_certificate_generated === 1
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <CommonMuiMonthPicker
                        label="Course Completion Month"
                        required={true}
                        onChange={(value) => {
                          console.log(value, "monthhh");
                          setCertMonth(value);
                          setCertMonthError(selectValidator(value));
                        }}
                        value={certMonth}
                        error={certMonthError}
                        disabled={
                          customerDetails?.is_certificate_generated === 1
                        }
                      />
                    </Col>
                  </Row>

                  <Row gutter={16} style={{ marginTop: "30px" }}>
                    <Col span={12}>
                      <CommonInputField
                        label="Candidate Name"
                        required={true}
                        onChange={(e) => {
                          setCertName(e.target.value);
                          setCertNameError(nameValidator(e.target.value));
                        }}
                        value={certName}
                        error={certNameError}
                        disabled={
                          customerDetails?.is_certificate_generated === 1
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <CommonInputField
                        label="Course Name"
                        required={true}
                        onChange={(e) => {
                          setCertCourseName(e.target.value);
                          setCertCourseNameError(
                            addressValidator(e.target.value)
                          );
                        }}
                        value={certCourseName}
                        error={certCourseNameError}
                        disabled={
                          customerDetails?.is_certificate_generated === 1
                        }
                      />
                    </Col>
                  </Row>

                  <Row
                    gutter={16}
                    style={{ marginTop: "30px", marginBottom: "30px" }}
                  >
                    <Col span={12}>
                      <CommonSelectField
                        label="Location"
                        required={true}
                        onChange={(e) => {
                          setCertLocation(e.target.value);
                          setCertLocationError(selectValidator(e.target.value));
                        }}
                        options={certLocationOptions}
                        value={certLocation}
                        error={certLocationError}
                        disabled={
                          customerDetails?.is_certificate_generated === 1
                        }
                      />
                    </Col>
                    <Col
                      span={12}
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      {isCertGenerated === false ? (
                        <>
                          {generateCertLoading ? (
                            <Button className="customer_generatecert_loading_button">
                              <CommonSpinner />
                            </Button>
                          ) : (
                            <Button
                              className="customer_generatecert_button"
                              onClick={handleGenerateCert}
                            >
                              Generate Certificate
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          {generateCertLoading ? (
                            <Button className="customer_viewcert_loadingbutton">
                              <CommonSpinner />
                            </Button>
                          ) : (
                            <Button
                              className="customer_viewcert_button"
                              onClick={() => handleViewCert(null)}
                            >
                              View Certificate
                            </Button>
                          )}
                        </>
                      )}
                    </Col>
                  </Row>
                </>
              ) : (
                ""
              )}

              {current === 2 ? (
                <div style={{ marginTop: "30px", marginBottom: "20px" }}>
                  <ImageUploadCrop
                    label="Linkedin Review Screenshot"
                    aspect={1}
                    maxSizeMB={1}
                    required={false}
                    value={linkedinFeedbackBase64}
                    onChange={(base64) => {
                      setLinkedinFeedbackBase64(base64);
                    }}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          </>
        ) : (
          ""
        )}

        {drawerContentStatus === "Finance Verify" ||
        drawerContentStatus === "Update Payment" ? (
          ""
        ) : (
          <div className="leadmanager_tablefiler_footer">
            <div className="leadmanager_submitlead_buttoncontainer">
              {drawerContentStatus === "Trainer Verify" ? (
                <>
                  {rejectbuttonLoader ? (
                    <button className="customer_trainerreject_loadingbutton">
                      <CommonSpinner />
                    </button>
                  ) : (
                    <button
                      className="customer_trainerreject_button"
                      onClick={handleRejectTrainer}
                    >
                      Rejected
                    </button>
                  )}
                </>
              ) : (
                ""
              )}

              {drawerContentStatus === "Add L-Review" ? (
                <>
                  {updateButtonLoading ? (
                    <button className="customer_issuecert_loadingbutton">
                      <CommonSpinner />
                    </button>
                  ) : (
                    <button
                      className="customer_issuecert_button"
                      onClick={handleCompleteProcess}
                    >
                      Update And Issue Certificate
                    </button>
                  )}
                </>
              ) : drawerContentStatus === "Add G-Review" ? (
                <>
                  {current > 0 && (
                    <Button
                      onClick={prev}
                      style={{ marginRight: 12 }}
                      className="customer_stepperbuttons"
                    >
                      Previous
                    </Button>
                  )}
                  {current < 3 && (
                    <>
                      {updateButtonLoading ? (
                        <Button
                          className={
                            current === 2
                              ? "customer_complete_loadingpassedoutbutton"
                              : "customer_stepperbuttons"
                          }
                        >
                          <CommonSpinner />
                        </Button>
                      ) : (
                        <Button
                          onClick={
                            current === 0
                              ? handleGoogleReview
                              : current === 1
                              ? handleCertificateDetails
                              : current === 2
                              ? handleCompleteProcess
                              : ""
                          }
                          className={
                            current === 2
                              ? "customer_complete_passedoutbutton"
                              : "customer_stepperbuttons"
                          }
                        >
                          {current === 2 ? "Submit" : "Next"}
                        </Button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {updateButtonLoading ? (
                    <button className="users_adddrawer_loadingcreatebutton">
                      <CommonSpinner />
                    </button>
                  ) : (
                    <button
                      className="users_adddrawer_createbutton"
                      onClick={
                        drawerContentStatus === "Student Verify"
                          ? handleStudentVerify
                          : drawerContentStatus === "Assign Trainer"
                          ? handleAssignTrainer
                          : drawerContentStatus === "Trainer Verify"
                          ? handleVerifyTrainer
                          : drawerContentStatus === "Class Schedule"
                          ? handleClassSchedule
                          : drawerContentStatus === "Class Going"
                          ? handleUpdateClassGoing
                          : drawerContentStatus === "Add G-Review"
                          ? handleGoogleReview
                          : handleStatusMismatch
                      }
                    >
                      {drawerContentStatus === "Assign Trainer"
                        ? "Assign"
                        : drawerContentStatus === "Class Going" ||
                          drawerContentStatus === "Class Schedule" ||
                          drawerContentStatus === "Add G-Review"
                        ? "Update"
                        : "Verify"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* table filter drawer */}

      <Drawer
        title="Manage Table"
        open={isOpenFilterDrawer}
        onClose={formReset}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative", paddingBottom: "60px" }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd
                data={defaultColumns}
                setDefaultColumns={setDefaultColumns}
              />
            </div>

            <Divider className="customer_statusupdate_divider" />

            <div style={{ padding: "0px 12px 20px 24px" }}>
              <p className="customers_choosebranch_heading">Choose Branch</p>
              {duplicateBranchOptions.map((item) => {
                return (
                  <div className="customers_choosebranch_checkbox_container">
                    <p>{item.name}</p>
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const updateBranchData = duplicateBranchOptions.map(
                          (u) => {
                            if (u.name == item.name) {
                              return { ...u, checked: e.target.checked };
                            }
                            return u;
                          }
                        );
                        const bothFalse = updateBranchData.every(
                          (item) => item.checked === false
                        );

                        if (bothFalse) {
                          CommonMessage("error", "Choose Atleast One Branch");
                          return;
                        }
                        setDuplicateBranchOptions(updateBranchData);
                      }}
                      value={item.checked}
                    />
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={() => {
                const reorderedColumns = defaultColumns
                  .filter((item) => item.isChecked) // only include checked items
                  .map((defaultItem) =>
                    nonChangeColumns.find(
                      (col) => col.title.trim() === defaultItem.title.trim()
                    )
                  )
                  .filter(Boolean); // remove unmatched/null entries

                console.log("Reordered Columns:", reorderedColumns);

                setTableColumns(reorderedColumns);
                setBranchOptions(duplicateBranchOptions);
                getCustomersData(
                  selectedDates[0],
                  selectedDates[1],
                  searchValue,
                  status,
                  leadExecutiveId,
                  duplicateBranchOptions,
                  pagination.page,
                  pagination.limit
                );
                setIsOpenFilterDrawer(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Drawer>

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
                      <p className="customerdetails_rowheading">Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.name
                        ? `${item.name} (${
                            item.trainer_code ? item.trainer_code : "-"
                          })`
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
                    <p className="customerdetails_text">{item.email}</p>
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
                    <p className="customerdetails_text">{item.technology}</p>
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
                    <p className="customerdetails_text">
                      {item.skills.map((item) => item.name).join(", ")}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          );
        })}

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="customer_trainer_badge_mainconatiner">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div className="customer_trainer_onboardcount_badge" />
              <p className="customer_trainer_onboardcount_badgecount">
                Class Taken{" "}
                <span style={{ fontWeight: 600 }}>
                  {trainerClassTakenCount}
                </span>{" "}
                Customers
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div className="customer_trainer_goingcount_badge" />
              <p className="customer_trainer_onboardcount_badgecount">
                Class Going{" "}
                <span style={{ fontWeight: 600 }}>
                  {trainerClassGoingCount}
                </span>{" "}
                Customers
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <p className="customer_trainer_cusomer_heading">
            Class Going Customers List{" "}
          </p>
          <CommonTable
            scroll={{ x: 1600 }}
            columns={customerByTrainerColumn}
            dataSource={customerByTrainerData}
            dataPerPage={10}
            loading={customerByTrainerLoading}
            checkBox="false"
            size="small"
            className="questionupload_table"
          />
        </div>
      </Modal>

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

      <Modal
        title="Customers Details"
        open={isOpenTrainerCustomersModal}
        onCancel={() => setIsOpenTrainerCustomersModal(false)}
        footer={false}
        width="60%"
      >
        <CommonTable
          scroll={{ x: 1600 }}
          columns={customerByTrainerColumn}
          dataSource={customerByTrainerData}
          dataPerPage={10}
          loading={customerByTrainerLoading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </Modal>

      <Modal
        open={isOpenClassCompleteModal}
        onCancel={() => setIsOpenClassCompleteModal(false)}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>
        <p className="customer_classcompletemodal_text">
          The Candidate{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "13px" }}>
            {customerDetails && customerDetails.name
              ? customerDetails.name
              : ""}
          </span>{" "}
          Has Completed The Class{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "13px" }}>
            100%
          </span>{" "}
          And Will Be Moved To The Passed Out Process.
        </p>
        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={() => setIsOpenClassCompleteModal(false)}
          >
            No
          </Button>
          {classCompleteLoading ? (
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
              onClick={handleCompleteClass}
            >
              Yes
            </Button>
          )}
        </div>
      </Modal>

      <Modal
        open={isOpenFinanceVerifyModal}
        onCancel={() => {
          setIsOpenFinanceVerifyModal(false);
        }}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Verify The Payment Of{" "}
          <span style={{ fontWeight: 700, color: "#333" }}>
            {transactionDetails && transactionDetails.amount
              ? "₹" + transactionDetails.amount
              : "-"}{" "}
          </span>
          for{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "13px" }}>
            {customerDetails && customerDetails.name
              ? customerDetails.name
              : ""}
          </span>{" "}
        </p>
        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={() => {
              setIsOpenFinanceVerifyModal(false);
              setTransactionDetails(null);
            }}
          >
            No
          </Button>
          {updateButtonLoading ? (
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
              onClick={handleFinanceVerify}
            >
              Yes
            </Button>
          )}
        </div>
      </Modal>

      <Modal
        open={isOpenViewCertModal}
        onCancel={() => {
          setIsOpenViewCertModal(false);
          setCertificateName("");
        }}
        footer={false}
        width="64%"
        style={{ marginBottom: "20px", top: 10 }}
        className="customer_certificate_viewmodal"
        zIndex={1100}
        // centered={true}
        closeIcon={
          <span
            style={{
              color: "#ffffff", // white color
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            <CloseOutlined />
          </span>
        }
      >
        <CommonCertificateViewer
          htmlTemplate={certHtmlContent}
          candidateName={
            certificateName
              ? certificateName
              : customerDetails && customerDetails.name
              ? customerDetails.name
              : "-"
          }
        />
      </Modal>

      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Customer History</span>
            <div className="customer_history_drawer_totalcount_container">
              <span style={{ fontWeight: 600 }}>
                Total Activity: {customerHistory?.length || 0}
              </span>
              <span style={{ fontWeight: 600 }}>
                Current Status:{" "}
                <span
                  style={{
                    color: getHistoryStatusColor(
                      customerHistory?.[customerHistory.length - 1]?.status ||
                        "N/A"
                    ),
                  }}
                >
                  {" "}
                  {customerHistory && customerHistory.length > 0
                    ? customerHistory[customerHistory.length - 1].status
                    : "N/A"}
                </span>
              </span>
            </div>
          </div>
        }
        open={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setCustomerDetails(null);
        }}
        width="50%"
        style={{ position: "relative" }}
        className="customer_history_drawer"
      >
        <div
          className="customer_statusupdate_drawer_profileContainer"
          id="customer_history_profilecontainer"
        >
          {customerDetails && customerDetails.profile_image ? (
            <img
              src={customerDetails.profile_image}
              className="cutomer_profileimage"
            />
          ) : (
            <FaRegUser size={50} color="#333" />
          )}

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
          style={{
            marginTop: "20px",
            padding: "0px 0px 0px 24px",
          }}
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
                  <LuCircleUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Lead Executive</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {`${
                    customerDetails && customerDetails.lead_assigned_to_id
                      ? customerDetails.lead_assigned_to_id
                      : "-"
                  } (${
                    customerDetails && customerDetails.lead_assigned_to_name
                      ? customerDetails.lead_assigned_to_name
                      : "-"
                  })`}
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
                  <p className="customerdetails_rowheading">Course Fees</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text" style={{ fontWeight: 700 }}>
                  {customerDetails && customerDetails.primary_fees
                    ? "₹" + customerDetails.primary_fees
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
                  {customerDetails && customerDetails.payments.total_amount
                    ? "₹" + customerDetails.payments.total_amount
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
          </Col>
        </Row>

        <Divider className="customer_statusupdate_divider" />

        <div style={{ marginTop: "30px" }}>
          {customerHistoryLoading ? (
            <CommonSpinner />
          ) : (
            <CustomerHistory
              data={customerHistory}
              customerDetails={customerDetails}
              trainersData={trainersData}
            />
          )}
        </div>
      </Drawer>
    </div>
  );
}
