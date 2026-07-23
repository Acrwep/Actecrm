import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
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
  Upload,
} from "antd";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { FaRegUser } from "react-icons/fa";
import { BsPatchCheckFill } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import { FaUserAlt } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { LuCircleUser } from "react-icons/lu";
import { FiFileText } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { RedoOutlined } from "@ant-design/icons";
import { GiCheckMark } from "react-icons/gi";
import { FaXmark } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa";
import { FaRegCopy } from "react-icons/fa6";
import { LuFileClock } from "react-icons/lu";
import CommonTable from "../Common/CommonTable";
import {
  deleteTrainerPaymentRequest,
  getAllBranches,
  getCustomerById,
  getTrainerById,
  getTrainerPayments,
  getTrainers,
  updateTrainerPaymentStatus,
  getTableColumns,
  updateTableColumns,
  getCustomerFullHistory,
} from "../ApiService/action";
import {
  formatToBackendIST,
  getCurrentandLast90Date,
} from "../Common/Validation";
import moment from "moment";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonSpinner from "../Common/CommonSpinner";
import "./styles.css";
import { CommonMessage } from "../Common/CommonMessage";
import DraggableStudentModal from "../Common/DraggableStudentModal";
import PrismaZoom from "react-prismazoom";
import AddTrainerPaymentRequest from "./AddTrainerPaymentRequest";
import ViewTrainerPaymentDetails from "./ViewTrainerPaymentDetails";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import CustomerHistory from "../Customers/CustomerHistory";
import { useSelector } from "react-redux";
import CommonDnd from "../Common/CommonDnd";
import CommonCustomerSingleSelectField from "../Common/CommonCustomerSingleSelect";
import TrainerFullDetailsModal from "./TrainerFullDetailsModal";
import TrainerPayslip from "./TrainerPayslip";
import { TagOutlined } from "@ant-design/icons";

export const calculateDeadlineDate = (updatedDate, students, hasPermission) => {
  if (!updatedDate) return null;

  let onlineCount = 0;
  let classroomCount = 0;

  if (students && students.length > 0) {
    students.forEach((student) => {
      if (student.training_mode === "Online") onlineCount++;
      else if (student.training_mode === "Classroom") classroomCount++;
    });
  }

  const majorityMode = onlineCount >= classroomCount ? "Online" : "Classroom";

  let workingDaysToAdd = 0;
  if (majorityMode === "Online") {
    workingDaysToAdd = hasPermission ? 14 : 7;
  } else {
    workingDaysToAdd = hasPermission ? 5 : 2;
  }

  let current = moment(updatedDate);
  let daysAdded = 0;

  while (daysAdded < workingDaysToAdd) {
    current.add(1, "days");
    if (current.day() !== 0) {
      daysAdded++;
    }
  }

  return current;
};

export const TimerPill = ({ updatedDate, deadlineDate, status, paidDate }) => {
  const [elapsedString, setElapsedString] = useState("");
  const [pillColor, setPillColor] = useState("");

  useEffect(() => {
    if (!updatedDate || !deadlineDate) {
      setElapsedString("-");
      return;
    }

    const start = moment(updatedDate);
    const end = moment(deadlineDate);
    const totalMs = end.diff(start);

    const calculateTimer = () => {
      const isPaid = status === "Paid" || status === "Completed";
      const current = isPaid && paidDate ? moment(paidDate) : moment();

      const elapsedMs = Math.max(current.diff(start), 0);

      // ---------------- Timer Format ----------------
      const duration = moment.duration(elapsedMs);

      const totalSeconds = Math.floor(duration.asSeconds());
      const totalDays = Math.floor(duration.asDays());

      let timeString = "";

      // if (totalDays < 1) {
      //   // Less than 24 Hours -> HH:MM:SS
      //   const hours = Math.floor(totalSeconds / 3600);
      //   const minutes = Math.floor((totalSeconds % 3600) / 60);
      //   const seconds = totalSeconds % 60;

      //   timeString = `${String(hours).padStart(2, "0")}h:${String(
      //     minutes,
      //   ).padStart(2, "0")}m:${String(seconds).padStart(2, "0")}s`;
      // }
      if (totalDays < 7) {
        // Days
        timeString = `${totalDays} ${totalDays === 1 ? "Day" : "Days"}`;
      } else if (totalDays < 30) {
        // Weeks + Days
        const weeks = Math.floor(totalDays / 7);
        const days = totalDays % 7;

        timeString = `${weeks} ${weeks === 1 ? "Week" : "Weeks"}${
          days ? ` ${days} ${days === 1 ? "Day" : "Days"}` : ""
        }`;
      } else {
        // Months + Weeks + Days
        const months = Math.floor(totalDays / 30);
        const remainingDays = totalDays % 30;

        const weeks = Math.floor(remainingDays / 7);
        const days = remainingDays % 7;

        timeString = `${months} ${months === 1 ? "Month" : "Months"}`;

        if (weeks) {
          timeString += ` ${weeks} ${weeks === 1 ? "Week" : "Weeks"}`;
        }

        if (days) {
          timeString += ` ${days} ${days === 1 ? "Day" : "Days"}`;
        }
      }

      setElapsedString(timeString);

      // ---------------- Color Logic ----------------
      let percentage = 0;

      if (totalMs > 0) {
        percentage = elapsedMs / totalMs;
      }

      if (percentage >= 0.9) {
        setPillColor("#fce4e4"); // Red
      } else if (percentage >= 0.5) {
        setPillColor("#fff3e0"); // Orange
      } else {
        setPillColor("#e8f5e9"); // Green
      }
    };

    calculateTimer();

    const isPaid = status === "Paid" || status === "Completed";

    let intervalId;

    if (!isPaid) {
      // Update every second so HH:MM:SS is live
      intervalId = setInterval(calculateTimer, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [updatedDate, deadlineDate, status, paidDate]);

  let textColor = "#2e7d32";

  if (pillColor === "#fce4e4") {
    textColor = "#c62828";
  } else if (pillColor === "#fff3e0") {
    textColor = "#ef6c00";
  }

  if (elapsedString === "-") {
    return <p>-</p>;
  }

  return (
    <div
      style={{
        backgroundColor: pillColor,
        color: textColor,
        padding: "3px 12px",
        borderRadius: "20px",
        display: "inline-block",
        fontWeight: "bold",
        fontSize: "11px",
        whiteSpace: "nowrap",
      }}
    >
      {elapsedString}
    </div>
  );
};

export default function TrainerPayment() {
  const location = useLocation();
  const scrollRef = useRef();
  const trainerPayslipRef = useRef();
  const emailTemplateRef = useRef();
  const addTrainerPaymentRequestUseRef = useRef();
  const permissions = useSelector((state) => state.userpermissions);

  const [loginUserId, setLoginUserId] = useState("");
  const [updateTableId, setUpdateTableId] = useState(null);
  const [checkAll, setCheckAll] = useState(false);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };
  /* ---------------- Trainer STATES ---------------- */
  const [trainersDataList, setTrainersDataList] = useState([]);
  // ✅ IMPORTANT: keep IDs & Objects separately
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [selectedTrainerObject, setSelectedTrainerObject] = useState(null);
  const [trainerSearchText, setTrainerSearchText] = useState("");
  /* ---------------- PAGINATION ---------------- */
  const [trainerPage, setTrainerPage] = useState(1);
  const [trainerHasMore, setTrainerHasMore] = useState(true);
  const [trainerSelectloading, setTrainerSelectloading] = useState(false);

  const [dateFilterType, setDateFilterType] = useState("RaiseDate");
  const [selectedDates, setSelectedDates] = useState([]);
  const [status, setStatus] = useState("");
  const [allBranchesData, setAllBranchesData] = useState([]);
  //form usestates
  const [buttonLoading, setButtonLoading] = useState(false);
  //view
  const [isOpenViewDrawer, setIsOpenViewDrawer] = useState(false);
  const [isOpenTrainerFullDetailsModal, setIsOpenTrainerFullDetailsModal] =
    useState(false);
  const [trainerFullDetails, setTrainerFullDetails] = useState([]);
  const [isOpenStudentDetailsModal, setIsOpenStudentDetailsModal] =
    useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);

  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false);

  const getCustomerHistoryData = async (customerid) => {
    setIsOpenCustomerHistoryDrawer(true);
    setCustomerHistoryLoading(true);
    try {
      const response = await getCustomerFullHistory(customerid);
      const customer_history = response?.data?.data || [];
      const reverse_data = customer_history.reverse();
      setCustomerHistory(reverse_data);
      setTimeout(() => {
        setCustomerHistoryLoading(false);
      }, 300);
    } catch (error) {
      setCustomerHistoryLoading(false);
      console.log("history response", error);
    }
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
        status.includes(s),
      )
    ) {
      return "red";
    }
    return "blue";
  };
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
  // update drawer states
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  const [drawerContentStatus, setDrawerContentStatus] = useState("");
  const [isOpenPaymentScreenshotModal, setIsOpenPaymentScreenshotModal] =
    useState(false);
  const [transactionScreenshot, setTransactionScreenshot] = useState("");
  //delete request
  const [isOpenRequestDeleteModal, setIsOpenRequestDeleteModal] =
    useState(false);
  //approve usestates
  const [isOpenApproveModal, setIsOpenApproveModal] = useState(false);
  const [approveButtonLoading, setApproveButtonLoading] = useState(false);

  const renderCellWithBackground = (
    status,
    extraProps = {},
    { showCopy = false, onCopy } = {},
  ) => {
    return {
      children: (
        <div
          style={{
            color: status ? "#2e7d32" : "#c62828",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {status ? (
            <GiCheckMark size={14} />
          ) : (
            <>
              <FaXmark size={14} />
              {showCopy && (
                <Tooltip
                  placement="top"
                  title="Copy Acknowledgement Link"
                  trigger={["hover", "click"]}
                >
                  <FaRegCopy
                    size={13}
                    color="#33333398"
                    style={{ cursor: "pointer", marginLeft: "6px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy?.();
                    }}
                  />
                </Tooltip>
              )}
            </>
          )}
        </div>
      ),
      props: {
        ...extraProps,
        style: {
          backgroundColor: status ? "#e8f5e9" : "#ffebee",
          ...(extraProps.style || {}),
        },
      },
    };
  };

  // Table columns definition
  const nonChangeColumns = [
    {
      title: "Bill Raise Date",
      key: "bill_raisedate",
      dataIndex: "bill_raisedate",
      width: 130,
      render: (text, record) => {
        return {
          children: (
            <p style={{ margin: 0 }}>
              {text ? moment(text).format("DD/MM/YYYY") : "-"}
            </p>
          ),
          props: { rowSpan: record.rowSpan },
        };
      },
    },
    {
      title: "Commercial Type",
      key: "commercial_type",
      dataIndex: "commercial_type",
      width: 130,
      render: (text, record) => {
        if (text == "Pay Per Head") {
          return {
            children: (
              <div
                style={{ display: "flex", gap: "6px", alignItems: "center" }}
              >
                <FaUserAlt size={11} color="#5b69ca" />
                <p>Pay Per Head</p>
              </div>
            ),
            props: { rowSpan: record.rowSpan },
          };
        } else {
          return {
            children: (
              <div style={{ display: "flex", gap: "6px" }}>
                <Tooltip
                  placement="top"
                  title={`Batch Code: ${record?.batch_number}`}
                  trigger={["hover", "click"]}
                >
                  <MdGroups size={17.5} color="#5b69ca" />
                </Tooltip>
                <p>Batch</p>
              </div>
            ),
            props: { rowSpan: record.rowSpan },
          };
        }
      },
    },
    {
      title: "Trainer Name",
      key: "trainer_name",
      dataIndex: "trainer_name",
      width: 150,
      render: (text, record) => {
        return {
          children: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <EllipsisTooltip text={text || "-"} />
              <FaRegEye
                size={14}
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenTrainerFullDetailsModal(true);
                  getTrainerByIdData(record?.trainer_id);
                }}
              />
            </div>
          ),
          props: { rowSpan: record.rowSpan },
        };
      },
    },
    {
      title: "Student Name",
      key: "student_id",
      dataIndex: ["student_details", "customer_name"],
      width: 150,
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <EllipsisTooltip text={text || "-"} />
          {text && (
            <FaRegEye
              size={14}
              className="trainers_action_icons"
              style={{ cursor: "pointer" }}
              onClick={() => {
                getParticularCustomerDetails(
                  record.student_details?.customer_id,
                );
              }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Tech",
      key: "tech",
      dataIndex: ["student_details", "course_name"],
      width: 150,
      render: (text) => <EllipsisTooltip text={text || "-"} />,
    },
    {
      title: "RA",
      key: "ra",
      dataIndex: ["student_details", "ra_user_id"],
      width: 110,
      render: (text, record) => (
        <EllipsisTooltip
          text={
            text ? `${text} - ${record?.student_details?.ra_user_name}` : "-"
          }
        />
      ),
    },
    {
      title: "HR",
      key: "hr",
      dataIndex: ["student_details", "hr_user_id"],
      width: 110,
      render: (text, record) => (
        <EllipsisTooltip
          text={
            text ? `${text} - ${record?.student_details?.hr_user_name}` : "-"
          }
        />
      ),
    },
    {
      title: "Mode of Training",
      key: "training_mode",
      dataIndex: ["student_details", "training_mode"],
      width: 130,
      render: (text) => <p>{text || "-"}</p>,
    },
    {
      title: "Payment Cleared",
      key: "is_payment_cleared",
      dataIndex: ["student_details", "is_payment_cleared"],
      width: 130,
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: "Completion 100%",
      key: "is_class_percentage",
      dataIndex: ["student_details", "is_class_percentage"],
      width: 140,
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: "Google Review",
      key: "is_google",
      dataIndex: ["student_details", "is_google"],
      width: 120,
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: "LinkedIn Review",
      key: "is_linkedin",
      dataIndex: ["student_details", "is_linkedin"],
      width: 130,
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: "Student Acknowledgement",
      key: "is_acknowledged",
      dataIndex: ["student_details", "is_acknowledged"],
      width: 190,
      render: (text, record) =>
        renderCellWithBackground(
          text,
          {},
          {
            showCopy: true,
            onCopy: () => {
              navigator.clipboard.writeText(
                `${
                  import.meta.env.VITE_EMAIL_URL
                }/acknowledge-class-completion/${record.student_details?.customer_id}`,
              );
              CommonMessage("success", "Link Copied");
              console.log("Copied: eeee");
            },
          },
        ),
    },
    // {
    //   title: "Feedback Submitted",
    //   key: "feedback",
    //   dataIndex: "feedback",
    //   width: 160,
    //   render: (text, record) => renderCellWithBackground(text),
    // },
    {
      title: "Request Amount",
      key: "request_amount",
      dataIndex: "request_amount",
      width: 140,
      hidden: !permissions.includes("View Financial Details") ? true : false,
      render: (text, record) => {
        return {
          children: <p>{text ? `₹${parseFloat(text).toFixed(2)}` : "-"}</p>,
          props: { rowSpan: record.rowSpan },
        };
      },
    },
    {
      title: permissions.includes("View Financial Details")
        ? "Days Taken To Pay"
        : "Days Taken To Complete",
      key: "days_taken_topay",
      dataIndex: "days_taken_topay",
      width: permissions.includes("View Financial Details") ? 140 : 175,
      render: (text, record) => {
        const hasPermission = permissions.includes("View Financial Details");
        const deadlineDate = calculateDeadlineDate(
          record?.updated_date,
          record?.students,
          hasPermission,
        );
        return {
          children: (
            <TimerPill
              updatedDate={record?.updated_date}
              deadlineDate={deadlineDate}
              status={record?.status}
              paidDate={record?.paid_date}
            />
          ),
          props: { rowSpan: record.rowSpan },
        };
      },
    },
    {
      title: "Deadline Date",
      key: "deadline_date",
      dataIndex: "deadline_date",
      width: 130,
      render: (text, record) => {
        const hasPermission = permissions.includes("View Financial Details");
        const calcDate = calculateDeadlineDate(
          record?.updated_date,
          record?.students,
          hasPermission,
        );
        return {
          children: <p>{calcDate ? calcDate.format("DD/MM/YYYY") : "-"}</p>,
          props: { rowSpan: record.rowSpan },
        };
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: 140,
      fixed: "right",
      render: (text, flatRecord) => {
        const record = flatRecord.request_details;
        return {
          children: (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <Tooltip
                placement="bottomLeft"
                className="customers_statustooltip"
                color="#fff"
                styles={{
                  body: {
                    width: "240px",
                    maxWidth: "none",
                    whiteSpace: "normal",
                  },
                }}
                title={
                  <>
                    <Row>
                      <Col span={12} style={{ marginBottom: "8px" }}>
                        {record?.status == "Requested" ||
                        record?.status == "Link Sent" ||
                        record?.status == "Payment Rejected" ||
                        record?.status == "Approval Rejected" ||
                        record?.status == "Awaiting Approval" ? (
                          <Checkbox
                            className="server_statuscheckbox"
                            checked={false}
                            onChange={(e) => {
                              if (permissions.includes("Payment Approval")) {
                                if (record?.status == "Link Sent") {
                                  CommonMessage(
                                    "error",
                                    "This payment has not been claimed yet.",
                                  );
                                  return;
                                }
                                // setIsOpenDetailsDrawer(true);
                                // setDrawerContentStatus("Approve");
                                setIsOpenApproveModal(true);
                                setSelectedPaymentDetails(record);
                              } else {
                                CommonMessage("error", "Access Denied");
                              }
                            }}
                          >
                            Approve
                          </Checkbox>
                        ) : (
                          <div className="customers_classcompleted_container">
                            <BsPatchCheckFill color="#3c9111" />
                            <p className="customers_classgoing_completedtext">
                              Approved
                            </p>
                          </div>
                        )}
                      </Col>

                      <Col span={12} style={{ marginBottom: "8px" }}>
                        {record?.status == "Requested" ||
                        record?.status == "Link Sent" ||
                        record?.status == "Awaiting Finance" ||
                        record?.status == "Awaiting Approval" ||
                        record?.status == "Approval Rejected" ||
                        record?.status == "Payment Rejected" ? (
                          <Checkbox
                            className="server_statuscheckbox"
                            checked={false}
                            onChange={(e) => {
                              if (record?.status == "Awaiting Finance") {
                                if (
                                  permissions.includes("Payment Completion")
                                ) {
                                  setSelectedPaymentDetails(record);
                                  setDrawerContentStatus("Awaiting Finance");
                                  setIsOpenDetailsDrawer(true);
                                } else {
                                  CommonMessage("error", "Access Denied");
                                }
                              } else {
                                CommonMessage(
                                  "warning",
                                  "Claim not approved yet",
                                );
                              }
                            }}
                          >
                            Ready to Pay{" "}
                          </Checkbox>
                        ) : (
                          <div className="customers_classcompleted_container">
                            <BsPatchCheckFill color="#3c9111" />
                            <p className="customers_classgoing_completedtext">
                              Paid
                            </p>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </>
                }
              >
                {text === "Link Sent" ? (
                  <Button className="customers_status_awaitingclass_button">
                    Link Sent
                  </Button>
                ) : text === "Requested" ? (
                  <Button className="customers_status_formpending_button">
                    Claim
                  </Button>
                ) : text === "Awaiting Approval" ? (
                  <Button className="customers_status_classscheduled_button">
                    Awaiting Approval
                  </Button>
                ) : text === "Awaiting Finance" ? (
                  <Button className="trainers_pending_button">
                    Ready to Pay
                  </Button>
                ) : text === "Paid" ? (
                  <div className="trainers_verifieddiv">
                    <Button className="trainers_verified_button">Paid</Button>
                  </div>
                ) : text === "Completed" ? (
                  <Button className="customers_status_completed_button">
                    Completed
                  </Button>
                ) : text === "Payment Rejected" ||
                  text === "Approval Rejected" ? (
                  <div className="trainers_verifieddiv">
                    <Button className="trainers_rejected_button">{text}</Button>
                  </div>
                ) : (
                  <p style={{ marginLeft: "6px" }}>-</p>
                )}
              </Tooltip>

              {record?.status == "Link Sent" ? (
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
                        }/trainer-payment-claim/${record.trainer_id}/${record.id}`,
                      );
                      CommonMessage("success", "Link Copied");
                      console.log("Copied: eeee");
                    }}
                  />
                </Tooltip>
              ) : (
                ""
              )}
            </div>
          ),
          props: { rowSpan: flatRecord.rowSpan },
        };
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
      width: 100,
      hidden: !permissions.includes("View Financial Details") ? true : false,
      render: (text, flatRecord) => {
        const record = flatRecord.request_details;
        return {
          children: (
            <div className="trainers_actionbuttonContainer">
              {/* <AiOutlineEdit
                size={18}
                className="trainers_action_icons"
                onClick={() => {
                  if (record?.status == "Requested") {
                    handleEdit(record);
                  } else {
                    CommonMessage(
                      "error",
                      `Unable to update in ${record?.status} status`,
                    );
                  }
                }}
              /> */}
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  justifyContent: "center",
                }}
              >
                {record?.students?.map((student, index) => (
                  <Tooltip
                    key={index}
                    placement="left"
                    title={`View History: ${student.customer_name || "Student"}`}
                    trigger={["hover", "click"]}
                  >
                    <LuFileClock
                      size={15}
                      className="trainers_action_icons"
                      style={{ cursor: "pointer", marginLeft: "4px" }}
                      onClick={() => {
                        getParticularCustomerDetails(student.customer_id, true);
                        getCustomerHistoryData(student.customer_id);
                        setTimeout(() => {
                          const container = document.getElementById(
                            "customer_history_profilecontainer",
                          );
                          if (container) {
                            container.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }, 300);
                      }}
                    />
                  </Tooltip>
                ))}
              </div>

              {/* {record?.paid_amount == "0.00" && (
                <RiDeleteBinLine
                  size={18}
                  color="#d32f2f"
                  className="trainers_action_icons"
                  onClick={() => {
                    setSelectedPaymentDetails(record);
                    setIsOpenRequestDeleteModal(true);
                  }}
                />
              )} */}
            </div>
          ),
          props: { rowSpan: flatRecord.rowSpan },
        };
      },
    },
  ].filter((col) => {
    if (!permissions.includes("View Financial Details")) {
      return !["request_amount", "action"].includes(col.key);
    }
    return true;
  });

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  const getTableColumnsData = async (user_id) => {
    try {
      const response = await getTableColumns(user_id);
      const data = response?.data?.data || [];
      if (data.length === 0) {
        return updateTableColumnsData();
      }

      const filterPage = data.find((f) => f.page_name === "Trainer Payment");
      console.log("filterPage", filterPage);

      if (!filterPage) {
        setUpdateTableId(null);
        return updateTableColumnsData();
      }

      const hasPermission = permissions?.includes("View Financial Details");
      const hasRequestAmount = filterPage.column_names?.some(
        (item) =>
          item.title === "Request Amount" || item.title === "Days Taken To Pay",
      );

      if (hasPermission && !hasRequestAmount) {
        setUpdateTableId(null);
        return updateTableColumnsData();
      }

      const attachRenderFunctions = (cols) =>
        cols.map((col) => {
          switch (col.key) {
            case "bill_raisedate":
              return {
                ...col,
                width: 130,
                render: (text, record) => {
                  return {
                    children: (
                      <p style={{ margin: 0 }}>
                        {text ? moment(text).format("DD/MM/YYYY") : "-"}
                      </p>
                    ),
                    props: { rowSpan: record.rowSpan },
                  };
                },
              };
            case "commercial_type":
              return {
                ...col,
                width: 130,
                render: (text, record) => {
                  if (text == "Pay Per Head") {
                    return {
                      children: (
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <FaUserAlt size={11} color="#5b69ca" />
                          <p>Pay Per Head</p>
                        </div>
                      ),
                      props: { rowSpan: record.rowSpan },
                    };
                  } else {
                    return {
                      children: (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Tooltip
                            placement="top"
                            title={`Batch Code: ${record?.batch_number}`}
                            trigger={["hover", "click"]}
                          >
                            <MdGroups size={18} color="#5b69ca" />
                          </Tooltip>
                          <p>Batch</p>
                        </div>
                      ),
                      props: { rowSpan: record.rowSpan },
                    };
                  }
                },
              };
            case "trainer_name":
              return {
                ...col,
                width: 150,
                render: (text, record) => {
                  return {
                    children: (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <EllipsisTooltip text={text || "-"} />
                        <FaRegEye
                          size={14}
                          className="trainers_action_icons"
                          onClick={() => {
                            setIsOpenTrainerFullDetailsModal(true);
                            getTrainerByIdData(record?.trainer_id);
                          }}
                        />
                      </div>
                    ),
                    props: { rowSpan: record.rowSpan },
                  };
                },
              };
            case "student_id":
              return {
                ...col,
                width: 150,
                render: (text, record) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <EllipsisTooltip text={text || "-"} />
                    {text && (
                      <FaRegEye
                        size={14}
                        className="trainers_action_icons"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          getParticularCustomerDetails(
                            record.student_details?.customer_id,
                          );
                        }}
                      />
                    )}
                  </div>
                ),
              };
            case "tech":
              return {
                ...col,
                width: 150,
                render: (text) => <EllipsisTooltip text={text || "-"} />,
              };
            case "ra":
              return {
                ...col,
                width: 110,
                render: (text, record) => (
                  <EllipsisTooltip
                    text={
                      text
                        ? `${text} - ${record?.student_details?.ra_user_name}`
                        : "-"
                    }
                  />
                ),
              };
            case "hr":
              return {
                ...col,
                width: 110,
                render: (text, record) => (
                  <EllipsisTooltip
                    text={
                      text
                        ? `${text} - ${record?.student_details?.hr_user_name}`
                        : "-"
                    }
                  />
                ),
              };
            case "training_mode":
              return {
                ...col,
                width: 130,
                render: (text) => <p>{text || "-"}</p>,
              };
            case "is_payment_cleared":
              return {
                ...col,
                width: 130,
                render: (text) => renderCellWithBackground(text),
              };
            case "is_class_percentage":
              return {
                ...col,
                width: 140,
                render: (text) => renderCellWithBackground(text),
              };
            case "is_google":
              return {
                ...col,
                width: 120,
                render: (text) => renderCellWithBackground(text),
              };
            case "is_linkedin":
              return {
                ...col,
                width: 130,
                render: (text) => renderCellWithBackground(text),
              };
            case "is_acknowledged":
              return {
                ...col,
                width: 190,
                render: (text, record) =>
                  renderCellWithBackground(
                    text,
                    {},
                    {
                      showCopy: true,
                      onCopy: () => {
                        navigator.clipboard.writeText(
                          `${
                            import.meta.env.VITE_EMAIL_URL
                          }/acknowledge-class-completion/${record.student_details?.customer_id}`,
                        );
                        CommonMessage("success", "Link Copied");
                        console.log("Copied: eeee");
                      },
                    },
                  ),
              };
            case "request_amount":
              return {
                ...col,
                width: 140,
                hidden: !permissions.includes("View Financial Details")
                  ? true
                  : false,
                render: (text, record) => {
                  return {
                    children: (
                      <p>{text ? `₹${parseFloat(text).toFixed(2)}` : "-"}</p>
                    ),
                    props: { rowSpan: record.rowSpan },
                  };
                },
              };
            case "days_taken_topay":
              return {
                ...col,
                title: permissions.includes("View Financial Details")
                  ? "Days Taken To Pay"
                  : "Days Taken To Complete",
                width: permissions.includes("View Financial Details")
                  ? 140
                  : 175,
                render: (text, record) => {
                  const hasPermission = permissions.includes(
                    "View Financial Details",
                  );
                  const deadlineDate = calculateDeadlineDate(
                    record?.updated_date,
                    record?.students,
                    hasPermission,
                  );
                  return {
                    children: (
                      <TimerPill
                        updatedDate={record?.updated_date}
                        deadlineDate={deadlineDate}
                        status={record?.status}
                        paidDate={record?.paid_date}
                      />
                    ),
                    props: { rowSpan: record.rowSpan },
                  };
                },
              };
            case "deadline_date":
              return {
                ...col,
                width: 130,
                render: (text, record) => {
                  const hasPermission = permissions.includes(
                    "View Financial Details",
                  );
                  const calcDate = calculateDeadlineDate(
                    record?.updated_date,
                    record?.students,
                    hasPermission,
                  );
                  return {
                    children: (
                      <p>{calcDate ? calcDate.format("DD/MM/YYYY") : "-"}</p>
                    ),
                    props: { rowSpan: record.rowSpan },
                  };
                },
              };
            case "status":
              return {
                ...col,
                width: 140,
                fixed: "right",
                render: (text, flatRecord) => {
                  const record = flatRecord.request_details;
                  return {
                    children: (
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
                              width: "240px",
                              maxWidth: "none",
                              whiteSpace: "normal",
                            },
                          }}
                          title={
                            <>
                              <Row>
                                <Col span={12} style={{ marginBottom: "8px" }}>
                                  {record?.status == "Requested" ||
                                  record?.status == "Link Sent" ||
                                  record?.status == "Payment Rejected" ||
                                  record?.status == "Approval Rejected" ||
                                  record?.status == "Awaiting Approval" ? (
                                    <Checkbox
                                      className="server_statuscheckbox"
                                      checked={false}
                                      onChange={(e) => {
                                        if (
                                          permissions.includes(
                                            "Payment Approval",
                                          )
                                        ) {
                                          setIsOpenApproveModal(true);
                                          setSelectedPaymentDetails(record);
                                        } else {
                                          CommonMessage(
                                            "error",
                                            "Access Denied",
                                          );
                                        }
                                      }}
                                    >
                                      Approve
                                    </Checkbox>
                                  ) : (
                                    <div className="customers_classcompleted_container">
                                      <BsPatchCheckFill color="#3c9111" />
                                      <p className="customers_classgoing_completedtext">
                                        Approved
                                      </p>
                                    </div>
                                  )}
                                </Col>

                                <Col span={12} style={{ marginBottom: "8px" }}>
                                  {record?.status == "Requested" ||
                                  record?.status == "Link Sent" ||
                                  record?.status == "Awaiting Finance" ||
                                  record?.status == "Awaiting Approval" ||
                                  record?.status == "Approval Rejected" ||
                                  record?.status == "Payment Rejected" ? (
                                    <Checkbox
                                      className="server_statuscheckbox"
                                      checked={false}
                                      onChange={(e) => {
                                        if (
                                          record?.status == "Awaiting Finance"
                                        ) {
                                          if (
                                            permissions.includes(
                                              "Payment Completion",
                                            )
                                          ) {
                                            setSelectedPaymentDetails(record);
                                            setDrawerContentStatus(
                                              "Awaiting Finance",
                                            );
                                            setIsOpenDetailsDrawer(true);
                                          } else {
                                            CommonMessage(
                                              "error",
                                              "Access Denied",
                                            );
                                          }
                                        } else {
                                          CommonMessage(
                                            "warning",
                                            "Claim not approved yet",
                                          );
                                        }
                                      }}
                                    >
                                      Ready to Pay{" "}
                                    </Checkbox>
                                  ) : (
                                    <div className="customers_classcompleted_container">
                                      <BsPatchCheckFill color="#3c9111" />
                                      <p className="customers_classgoing_completedtext">
                                        Paid
                                      </p>
                                    </div>
                                  )}
                                </Col>
                              </Row>
                            </>
                          }
                        >
                          {text === "Link Sent" ? (
                            <Button className="customers_status_awaitingclass_button">
                              Link Sent
                            </Button>
                          ) : text === "Requested" ? (
                            <Button className="customers_status_formpending_button">
                              Claim
                            </Button>
                          ) : text === "Awaiting Approval" ? (
                            <Button className="customers_status_classscheduled_button">
                              Awaiting Approval
                            </Button>
                          ) : text === "Awaiting Finance" ? (
                            <Button className="trainers_pending_button">
                              Ready to Pay
                            </Button>
                          ) : text === "Paid" ? (
                            <div className="trainers_verifieddiv">
                              <Button className="trainers_verified_button">
                                Paid
                              </Button>
                            </div>
                          ) : text === "Completed" ? (
                            <Button className="customers_status_completed_button">
                              Completed
                            </Button>
                          ) : text === "Payment Rejected" ||
                            text === "Approval Rejected" ? (
                            <div className="trainers_verifieddiv">
                              <Button className="trainers_rejected_button">
                                {text}
                              </Button>
                            </div>
                          ) : (
                            <p style={{ marginLeft: "6px" }}>-</p>
                          )}
                        </Tooltip>

                        {record?.status == "Link Sent" ? (
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
                                  }/trainer-payment-claim/${record.trainer_id}/${record.id}`,
                                );
                                CommonMessage("success", "Link Copied");
                                console.log("Copied: eeee");
                              }}
                            />
                          </Tooltip>
                        ) : (
                          ""
                        )}
                      </div>
                    ),
                    props: { rowSpan: flatRecord.rowSpan },
                  };
                },
              };
            case "action":
              return {
                ...col,
                width: 100,
                hidden: !permissions.includes("View Financial Details"),
                fixed: "right",
                render: (text, flatRecord) => {
                  const record = flatRecord.request_details;
                  return {
                    children: (
                      <div className="trainers_actionbuttonContainer">
                        {/* <AiOutlineEdit
                size={18}
                className="trainers_action_icons"
                onClick={() => {
                  if (record?.status == "Requested") {
                    handleEdit(record);
                  } else {
                    CommonMessage(
                      "error",
                      `Unable to update in ${record?.status} status`,
                    );
                  }
                }}
              /> */}
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
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            justifyContent: "center",
                          }}
                        >
                          {record?.students?.map((student, index) => (
                            <Tooltip
                              key={index}
                              placement="left"
                              title={`View History: ${student.customer_name || "Student"}`}
                              trigger={["hover", "click"]}
                            >
                              <LuFileClock
                                size={15}
                                className="trainers_action_icons"
                                style={{ cursor: "pointer", marginLeft: "4px" }}
                                onClick={() => {
                                  getParticularCustomerDetails(
                                    student.customer_id,
                                    true,
                                  );
                                  getCustomerHistoryData(student.customer_id);
                                  setTimeout(() => {
                                    const container = document.getElementById(
                                      "customer_history_profilecontainer",
                                    );
                                    if (container) {
                                      container.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                    }
                                  }, 300);
                                }}
                              />
                            </Tooltip>
                          ))}
                        </div>

                        {/* {record?.paid_amount == "0.00" && (
                <RiDeleteBinLine
                  size={18}
                  color="#d32f2f"
                  className="trainers_action_icons"
                  onClick={() => {
                    setSelectedPaymentDetails(record);
                    setIsOpenRequestDeleteModal(true);
                  }}
                />
              )} */}
                      </div>
                    ),
                    props: { rowSpan: flatRecord.rowSpan },
                  };
                },
              };
            default:
              return col;
          }
        });

      setUpdateTableId(filterPage.id);

      const filteredBackendColumns = filterPage.column_names.filter((col) => {
        if (!permissions.includes("View Financial Details")) {
          return !["request_amount", "action"].includes(col.key);
        }
        return true;
      });

      const allColumns = attachRenderFunctions(filteredBackendColumns);
      const visibleColumns = attachRenderFunctions(
        filteredBackendColumns.filter((col) => col.isChecked),
      );

      setColumns(allColumns);
      setTableColumns(visibleColumns);
    } catch (error) {
      console.error("get table columns error", error);
    }
  };

  const updateTableColumnsData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Trainer Payment",
      column_names: columns,
    };
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  useEffect(() => {
    if (permissions.length >= 1) {
      if (!permissions.includes("Trainer Payment Page")) {
        navigate("/dashboard");
        return;
      }
      rerunTrainerPaymentFilters(location.state);

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      if (getLoginUserDetails) {
        const convertAsJson = JSON.parse(getLoginUserDetails);
        setLoginUserId(convertAsJson?.user_id);
        setTimeout(() => {
          getTableColumnsData(convertAsJson?.user_id);
        }, 300);
      }
      setTableColumns(nonChangeColumns);
    }
  }, [permissions]);

  /* ---------------- FETCH TRAINERS ---------------- */
  const getTrainersData = async (searchvalue, pageNumber = 1) => {
    setTrainerSelectloading(true);
    const payload = {
      // status: "Verified",
      keyword: searchvalue,
      page: pageNumber,
      limit: 10,
    };
    try {
      const response = await getTrainers(payload);
      const trainers = response?.data?.data?.trainers || [];
      const pagination = response?.data?.data?.pagination;

      setTrainersDataList((prev) =>
        pageNumber === 1 ? trainers : [...prev, ...trainers],
      );
      setTrainerHasMore(pageNumber < (pagination?.totalPages || 1));
      setTrainerPage(pageNumber);
    } catch (error) {
      setTrainersDataList([]);
      console.log(error);
    } finally {
      setTrainerSelectloading(false);
    }
  };

  /* ---------------- SEARCH HANDLER ---------------- */
  const handleTrainerSearch = (value) => {
    setTrainerSearchText(value);
    setTrainerPage(1);
    setTrainerHasMore(true);
    setTrainersDataList([]);
    getTrainersData(value, 1);
  };

  /* ---------------- SELECT HANDLER ---------------- */
  const handleTrainerSelect = (event) => {
    const selectedId = event.target.value;
    if (selectedId) {
      const selectedObj = event.target.object;
      setSelectedTrainerId(selectedId);
      setSelectedTrainerObject(selectedObj);
      setTrainerSearchText(selectedObj?.name || "");

      getTrainerPaymentsData(
        selectedId,
        dateFilterType,
        selectedDates[0],
        selectedDates[1],
        status || null,
        1,
        pagination.limit,
      );
    } else {
      setSelectedTrainerId(null);
      setSelectedTrainerObject(null);
      setTrainerSearchText("");
      getTrainersData(null, 1);
      getTrainerPaymentsData(
        null,
        dateFilterType,
        selectedDates[0],
        selectedDates[1],
        status || null,
        1,
        pagination.limit,
      );
    }
  };

  /* ---------------- MERGED OPTIONS ---------------- */
  const mergedTrainersList = useMemo(() => {
    const map = new Map();
    if (selectedTrainerObject) {
      map.set(selectedTrainerObject.id, selectedTrainerObject);
    }
    trainersDataList.forEach((c) => map.set(c.id, c));
    return Array.from(map.values());
  }, [trainersDataList, selectedTrainerObject]);

  /* ---------------- DROPDOWN OPEN ---------------- */
  const handleTrainerDropdownOpen = () => {
    if (trainersDataList.length === 0) {
      getTrainersData(null, 1);
    }
  };

  /* ---------------- INFINITE SCROLL ---------------- */
  const handleTrainerScroll = (e) => {
    const listbox = e.target;
    if (
      listbox.scrollTop + listbox.clientHeight >= listbox.scrollHeight - 5 &&
      trainerHasMore &&
      !trainerSelectloading
    ) {
      getTrainersData(trainerSearchText, trainerPage + 1);
    }
  };

  const getAllBranchesData = async () => {
    try {
      const response = await getAllBranches();
      console.log("all branches response", response);
      setAllBranchesData(response?.data?.result || []);
    } catch (error) {
      setAllBranchesData([]);
      console.log(error);
    } finally {
      getTrainersData(null, 1);
    }
  };

  useEffect(() => {
    const handler = async (e) => {
      const data = e.detail;
      console.log("Received via event:", data);
      setSelectedTrainerId("");
      // Re-run your existing logic
      rerunTrainerPaymentFilters(data);
    };

    window.addEventListener("trainerPaymentNotificationFilter", handler);
    return () =>
      window.removeEventListener("trainerPaymentNotificationFilter", handler);
  }, []);

  const rerunTrainerPaymentFilters = (stateData) => {
    const PreviousAndCurrentDate = getCurrentandLast90Date();
    const receivedSearchValueFromNotification = stateData?.searchValue || null;
    const receivedStatusValueFromNotification = stateData?.status || null;
    const receivedBillRaiseDateFromNotification =
      stateData?.bill_raisedate || null;

    if (receivedSearchValueFromNotification) {
      setSelectedTrainerId(receivedSearchValueFromNotification);
    }

    setStatus(
      receivedStatusValueFromNotification
        ? receivedStatusValueFromNotification
        : "",
    );
    if (receivedBillRaiseDateFromNotification) {
      setDateFilterType("RaiseDate");
      setSelectedDates([
        receivedBillRaiseDateFromNotification,
        receivedBillRaiseDateFromNotification,
      ]);
    } else {
      setSelectedDates(PreviousAndCurrentDate);
    }

    getTrainerPaymentsData(
      receivedSearchValueFromNotification
        ? receivedSearchValueFromNotification
        : null,
      "RaiseDate",
      receivedBillRaiseDateFromNotification
        ? receivedBillRaiseDateFromNotification
        : PreviousAndCurrentDate[0],
      receivedBillRaiseDateFromNotification
        ? receivedBillRaiseDateFromNotification
        : PreviousAndCurrentDate[1],
      receivedStatusValueFromNotification
        ? receivedStatusValueFromNotification
        : "",
      1,
      10,
      true,
    );
  };

  const getTrainerPaymentsData = async (
    trainerId,
    dateType,
    startDate,
    endDate,
    status,
    pageNumber,
    pageLimit,
    callGetBranchApi = false,
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
      setLoading(false);
      if (callGetBranchApi) {
        getAllBranchesData();
      }
    }
  };

  const getTrainerByIdData = async (trainerId) => {
    try {
      const response = await getTrainerById(trainerId);
      const trainerDetails = response?.data?.data;
      setTrainerFullDetails([trainerDetails]);
    } catch (error) {
      setTrainerFullDetails([]);
      console.log("get trainer by id error", error);
    }
  };

  const getParticularCustomerDetails = async (
    customer_id,
    is_customer_history = false,
  ) => {
    console.log("is_customer_history", is_customer_history);

    try {
      const response = await getCustomerById(customer_id);
      const customer_details = response?.data?.data || null;
      console.log("customer full details", customer_details);
      setSelectedStudentDetails(customer_details);
      if (is_customer_history == false) {
        setIsOpenStudentDetailsModal(true);
      }
    } catch (error) {
      console.log("getcustomer by id error", error);
      setSelectedStudentDetails(null);
    }
  };

  const handleTrainerPaymentStatus = async (updateStatus) => {
    setApproveButtonLoading(true);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      status: updateStatus,
      trainer_payment_id: selectedPaymentDetails?.id,
      updated_by: convertAsJson?.user_id,
      updated_date: formatToBackendIST(new Date()),
    };
    try {
      await updateTrainerPaymentStatus(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated Successfully");
        paymentformReset();
        // Refresh the payment requests data
        getTrainerPaymentsData(
          selectedTrainerId,
          dateFilterType,
          selectedDates[0],
          selectedDates[1],
          status || null,
          1,
          pagination.limit,
        );
      }, 300);
    } catch (error) {
      setApproveButtonLoading(false);
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
          selectedTrainerId,
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
    setIsOpenApproveModal(false);
    setApproveButtonLoading(false);
    setDrawerContentStatus("");
  };

  const handlePaginationChange = ({ page, limit }) => {
    // This will be called when pagination changes
    setPagination({ ...pagination, page, limit });
    // Fetch data with new pagination
    getTrainerPaymentsData(
      selectedTrainerId,
      dateFilterType,
      selectedDates[0],
      selectedDates[1],
      status || null,
      page,
      limit,
    );
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandLast90Date();
    setSelectedDates(PreviousAndCurrentDate);
    setStatus("");
    setSelectedTrainerId(null);
    setDateFilterType("RaiseDate");
    setSelectedTrainerId(null);
    setSelectedTrainerObject(null);
    setTrainerSearchText("");
    getTrainersData(null, 1);
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

  const flattenedTableData = useMemo(() => {
    const flatData = [];
    paymentRequestsData.forEach((request) => {
      if (request.students && request.students.length > 0) {
        request.students.forEach((student, index) => {
          flatData.push({
            ...request, // spreads id, which is fine since handleMoveToPaidNow expects item.id to be the request id
            student_details: student,
            rowSpan: index === 0 ? request.students.length : 0,
            request_details: request, // Keep original request handy
            row_num: `${request.id}_${student.customer_id || index}`,
          });
        });
      } else {
        flatData.push({
          ...request,
          student_details: null,
          rowSpan: 1,
          request_details: request,
          row_num: `${request.id}_no_student`,
        });
      }
    });
    return flatData;
  }, [paymentRequestsData]);

  return (
    <div>
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
                    selectedTrainerId,
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
                  status === "Link Sent"
                    ? "customers_active_awaitingclass_container"
                    : "customers_awaitingclass_container"
                }
                onClick={() => {
                  if (status === "Link Sent") {
                    return;
                  }
                  setStatus("Link Sent");
                  setPagination({ ...pagination, page: 1 });
                  getTrainerPaymentsData(
                    selectedTrainerId,
                    dateFilterType,
                    selectedDates[0],
                    selectedDates[1],
                    "Link Sent",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Link Sent{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.link_sent !== undefined &&
                    statusCounts.link_sent !== null
                      ? statusCounts.link_sent
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
                    selectedTrainerId,
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
                  Claim{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.requested !== undefined &&
                    statusCounts.requested !== null
                      ? statusCounts.requested
                      : "-"
                  } )`}
                </p>
              </div>
              {/* <div
                className={
                  status === "Awaiting Approval"
                    ? "customers_active_classschedule_container"
                    : "customers_classschedule_container"
                }
                onClick={() => {
                  if (status === "Awaiting Approval") {
                    return;
                  }
                  setStatus("Awaiting Approval");
                  setPagination({ ...pagination, page: 1 });
                  getTrainerPaymentsData(
                    selectedTrainerId,
                    dateFilterType,
                    selectedDates[0],
                    selectedDates[1],
                    "Awaiting Approval",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Awaiting Approval{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.awaiting_approval !== undefined &&
                    statusCounts.awaiting_approval !== null
                      ? statusCounts.awaiting_approval
                      : "-"
                  } )`}
                </p>
              </div> */}
              {permissions.includes("Show Ready to Pay & Paid Buckets") && (
                <>
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
                        selectedTrainerId,
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
                      Ready to Pay{" "}
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
                      status === "Paid"
                        ? "customers_active_completed_container"
                        : "customers_completed_container"
                    }
                    onClick={() => {
                      if (status === "Paid") {
                        return;
                      }
                      setStatus("Paid");
                      setPagination({ ...pagination, page: 1 });
                      getTrainerPaymentsData(
                        selectedTrainerId,
                        dateFilterType,
                        selectedDates[0],
                        selectedDates[1],
                        "Paid",
                        1,
                        pagination.limit,
                      );
                    }}
                  >
                    <p>
                      Paid{" "}
                      {`( ${
                        statusCounts &&
                        statusCounts.paid !== undefined &&
                        statusCounts.paid !== null
                          ? statusCounts.paid
                          : "-"
                      } )`}
                    </p>
                  </div>
                </>
              )}
              {/* <div
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
                    selectedTrainerId,
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
                  Rejected{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.payment_rejected !== undefined &&
                    statusCounts.payment_rejected !== null
                      ? statusCounts.payment_rejected
                      : "-"
                  } )`}
                </p>
              </div> */}
              {/* <div
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
                    selectedTrainerId,
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
              </div> */}
            </div>
            {/* <button
              onClick={() => scroll(900)}
              className="customer_statusscroll_button"
            >
              <IoMdArrowDropright size={25} />
            </button> */}
          </div>
        </Col>

        <Col
          xs={24}
          sm={24}
          md={24}
          lg={6}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
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
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={8}>
              <CommonCustomerSingleSelectField
                label="Trainer"
                height="30px"
                labelMarginTop="0px"
                required={false}
                options={mergedTrainersList}
                value={selectedTrainerId}
                inputValue={trainerSearchText}
                onChange={handleTrainerSelect}
                onInputChange={handleTrainerSearch}
                onDropdownOpen={handleTrainerDropdownOpen}
                onDropdownScroll={handleTrainerScroll}
                loading={trainerSelectloading}
                // renderOption={renderTrainerOption}
                error={""}
                disableClearable={false}
              />
            </Col>
            <Col span={10}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "nowrap",
                }}
              >
                <div style={{ flex: "0 0 260px" }}>
                  <CommonMuiCustomDatePicker
                    value={selectedDates}
                    onDateChange={(dates) => {
                      setSelectedDates(dates);
                      setPagination({
                        page: 1,
                      });
                      getTrainerPaymentsData(
                        selectedTrainerId,
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

                {/* <div>
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
                              selectedTrainerId,
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
                </div> */}
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
            gap: "12px",
          }}
        >
          {/* {permissions.includes("Add Trainer Payment Request") ? (
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
          )} */}
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setIsOpenFilterDrawer(true);
              getTableColumnsData(loginUserId);
            }}
          />
        </Col>
      </Row>

      {/* Payment Requests Table */}
      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={tableColumns}
          dataSource={flattenedTableData}
          dataPerPage={10}
          loading={loading}
          // checkBox={permissions.includes("Payment Approval") ? "true" : "false"}
          checkBox={"false"}
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
          disableLocalPagination={true}
          getCheckboxProps={(record) => ({
            disabled: record.rowSpan === 0,
            style: { display: record.rowSpan === 0 ? "none" : "block" },
          })}
          rowKey="row_num"
        />
      </div>

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
              trainer_payment_id={selectedPaymentDetails?.id}
              allBranchesData={allBranchesData}
              isShowPaymentDetails={false}
            />
            <Divider className="customer_statusupdate_divider" />
            <div className="customer_statusupdate_adddetailsContainer">
              {drawerContentStatus == "Awaiting Finance" ? (
                <div>
                  <TrainerPayslip
                    ref={trainerPayslipRef}
                    selectedPaymentDetails={selectedPaymentDetails}
                    setButtonLoading={setButtonLoading}
                    isOnRefresh={() => {
                      paymentformReset();
                      getTrainerPaymentsData(
                        selectedTrainerId,
                        dateFilterType,
                        selectedDates[0],
                        selectedDates[1],
                        status || null,
                        pagination.page,
                        pagination.limit,
                      );
                    }}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="leadmanager_tablefiler_footer">
              <div className="leadmanager_submitlead_buttoncontainer">
                {buttonLoading ? (
                  <button className="users_adddrawer_loadingcreatebutton">
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className="users_adddrawer_createbutton"
                    onClick={() => trainerPayslipRef.current?.handlePaid()}
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>{" "}
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
        style={{ position: "relative", paddingBottom: "40px" }}
        className="customer_statusupdate_drawer"
      >
        {isOpenViewDrawer ? (
          <ViewTrainerPaymentDetails
            trainer_payment_id={selectedPaymentDetails?.id}
            allBranchesData={allBranchesData}
          />
        ) : (
          ""
        )}
      </Drawer>

      {/* approval confirm modal */}
      <Modal
        open={isOpenApproveModal}
        onCancel={() => {
          setIsOpenApproveModal(false);
          setSelectedPaymentDetails(null);
        }}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Approve The Amount Of{" "}
          <span style={{ fontWeight: 700, color: "#333", fontSize: "14px" }}>
            {selectedPaymentDetails && selectedPaymentDetails.request_amount
              ? "₹" + selectedPaymentDetails.request_amount
              : "-"}{" "}
          </span>
          for trainer{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            {selectedPaymentDetails && selectedPaymentDetails.trainer_name
              ? selectedPaymentDetails.trainer_name
              : ""}
          </span>{" "}
        </p>
        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={() => {
              setIsOpenApproveModal(false);
              setSelectedPaymentDetails(null);
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
                handleTrainerPaymentStatus("Awaiting Finance");
              }}
            >
              Yes
            </Button>
          )}
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
      <TrainerFullDetailsModal
        open={isOpenTrainerFullDetailsModal}
        onClose={() => {
          setIsOpenTrainerFullDetailsModal(false);
          setTrainerFullDetails([]);
        }}
        trainerDetails={trainerFullDetails}
      />

      <DraggableStudentModal
        open={isOpenStudentDetailsModal}
        onClose={() => setIsOpenStudentDetailsModal(false)}
        customerDetails={selectedStudentDetails}
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
        onClose={() => setIsOpenFilterDrawer(false)}
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
                setTableColumns(visibleColumns);
                setIsOpenFilterDrawer(false);

                const payload = {
                  user_id: loginUserId,
                  id: updateTableId,
                  page_name: "Trainer Payment",
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

      {/* Customer History Drawer */}
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
                      customerHistory?.[0]?.status || "N/A",
                    ),
                  }}
                >
                  {" "}
                  {customerHistory && customerHistory.length > 0
                    ? customerHistory[0].status
                    : "N/A"}
                </span>
              </span>
            </div>
          </div>
        }
        open={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setSelectedStudentDetails(null);
        }}
        width="50%"
        style={{ position: "relative" }}
        className="customer_history_drawer"
      >
        <div
          className="customer_statusupdate_drawer_profileContainer"
          id="customer_history_profilecontainer"
        >
          {selectedStudentDetails && selectedStudentDetails.profile_image ? (
            <Upload
              listType="picture-circle"
              fileList={[
                {
                  uid: "-1",
                  name: "profile.jpg",
                  status: "done",
                  url: selectedStudentDetails.profile_image, // Base64 string directly usable
                },
              ]}
              onPreview={handlePreview}
              onRemove={false}
              showUploadList={{
                showRemoveIcon: false,
              }}
              beforeUpload={() => false} // prevent auto upload
              style={{ width: 90, height: 90 }} // reduce size
              accept=".png,.jpg,.jpeg"
            ></Upload>
          ) : (
            <FaRegUser size={50} color="#333" />
          )}

          <div>
            <p className="customer_nametext">
              {" "}
              {selectedStudentDetails && selectedStudentDetails.name
                ? selectedStudentDetails.name
                : "-"}
            </p>
            <p className="customer_coursenametext">
              {" "}
              {selectedStudentDetails && selectedStudentDetails.course_name
                ? selectedStudentDetails.course_name
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
                <EllipsisTooltip
                  text={
                    selectedStudentDetails && selectedStudentDetails.name
                      ? selectedStudentDetails.name
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
                <EllipsisTooltip
                  text={
                    selectedStudentDetails && selectedStudentDetails.email
                      ? selectedStudentDetails.email
                      : "-"
                  }
                  smallText={true}
                />
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
                  {selectedStudentDetails && selectedStudentDetails.phone
                    ? selectedStudentDetails.phone
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
                  {selectedStudentDetails &&
                  selectedStudentDetails.current_location
                    ? selectedStudentDetails.current_location
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
                <EllipsisTooltip
                  text={`${
                    selectedStudentDetails &&
                    selectedStudentDetails.lead_assigned_to_id
                      ? selectedStudentDetails.lead_assigned_to_id
                      : "-"
                  } (${
                    selectedStudentDetails &&
                    selectedStudentDetails.lead_assigned_to_name
                      ? selectedStudentDetails.lead_assigned_to_name
                      : "-"
                  })`}
                  smallText={true}
                />
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
                <EllipsisTooltip
                  text={
                    selectedStudentDetails && selectedStudentDetails.course_name
                      ? selectedStudentDetails.course_name
                      : "-"
                  }
                  smallText={true}
                />
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
                  {selectedStudentDetails && selectedStudentDetails.primary_fees
                    ? "₹" + selectedStudentDetails.primary_fees
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
                  {selectedStudentDetails && selectedStudentDetails.total_amount
                    ? "₹" + selectedStudentDetails.total_amount
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
                  {selectedStudentDetails &&
                  selectedStudentDetails.balance_amount !== undefined &&
                  selectedStudentDetails.balance_amount !== null
                    ? "₹" + selectedStudentDetails.balance_amount
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
                <EllipsisTooltip
                  text={
                    selectedStudentDetails && selectedStudentDetails.branch_name
                      ? selectedStudentDetails.branch_name
                      : "-"
                  }
                  smallText={true}
                />
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
                  {selectedStudentDetails &&
                  selectedStudentDetails.batch_tracking
                    ? selectedStudentDetails.batch_tracking
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
              customerDetails={selectedStudentDetails}
            />
          )}
        </div>
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
    </div>
  );
}
