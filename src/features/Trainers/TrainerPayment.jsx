import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { PiSealCheckFill } from "react-icons/pi";
import { BsPatchCheckFill } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import { FaUserAlt } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { FaLinkedinIn } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { RedoOutlined } from "@ant-design/icons";
import { GiCheckMark } from "react-icons/gi";
import { FaXmark } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa";
import { FaRegCopy } from "react-icons/fa6";
import { LuFileClock } from "react-icons/lu";
import { DownloadOutlined } from "@ant-design/icons";
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
  getBranches,
} from "../ApiService/action";
import { SlActionUndo } from "react-icons/sl";
import {
  formatToBackendIST,
  getCurrentandLast90Date,
  regionOptions,
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
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";

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
    <Tooltip
      title={elapsedString}
      placement="top"
      styles={{
        body: {
          backgroundColor: "#fff",
          color: "#333",
          fontWeight: 500,
          fontSize: "13px",
        },
      }}
      color="#fff"
    >
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
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          verticalAlign: "middle",
        }}
      >
        {elapsedString}
      </div>
    </Tooltip>
  );
};

export default function TrainerPayment() {
  const location = useLocation();
  const navigate = useNavigate();
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
  //filter usestates
  const [searchValue, setSearchValue] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [commercialType, setCommercialType] = useState("");
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
  const [trainerDetailsLoading, setTrainerDetailsLoading] = useState("");
  const trainerDetailsLoadingRef = useRef(trainerDetailsLoading);
  useEffect(() => {
    trainerDetailsLoadingRef.current = trainerDetailsLoading;
  }, [trainerDetailsLoading]);
  const [isOpenStudentDetailsModal, setIsOpenStudentDetailsModal] =
    useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);

  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [selectedHistoryCustomerId, setSelectedHistoryCustomerId] =
    useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  //review modal
  const [isOpenReviewScreenshotModal, setIsOpenReviewScreenshotModal] =
    useState(false);
  const [reviewScreenshot, setReviewScreenshot] = useState("");
  const [reviewModalTitle, setReviewModalTitle] = useState("");

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

  //table data states
  const [paymentRequestsData, setPaymentRequestsData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusCounts, setStatusCounts] = useState(null);
  const [commercialTypeCounts, setCommercialTypeCounts] = useState(null);
  const [regionCounts, setRegionCounts] = useState(null);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState("");
  const customerDetailsLoadingRef = useRef(customerDetailsLoading);
  useEffect(() => {
    customerDetailsLoadingRef.current = customerDetailsLoading;
  }, [customerDetailsLoading]);

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
  // revert usestates
  const [isOpenRevertModal, setIsOpenRevertModal] = useState(false);

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
      title: "Approved Date",
      key: "approved_date",
      dataIndex: "approved_date",
      width: 130,
      render: (text, record) => {
        return (
          <p style={{ margin: 0 }}>
            {text ? moment(text).format("DD/MM/YYYY") : "-"}
          </p>
        );
      },
    },
    {
      title: "Paid Date",
      key: "paid_date",
      dataIndex: "paid_date",
      width: 110,
      render: (text, record) => {
        return (
          <p style={{ margin: 0 }}>
            {text ? moment(text).format("DD/MM/YYYY") : "-"}
          </p>
        );
      },
    },
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
    // {
    //   title: "Commercial Type",
    //   key: "commercial_type",
    //   dataIndex: "commercial_type",
    //   width: 130,
    //   render: (text, record) => {
    //     if (text == "Pay Per Head") {
    //       return {
    //         children: (
    //           <div
    //             style={{ display: "flex", gap: "6px", alignItems: "center" }}
    //           >
    //             <FaUserAlt size={11} color="#5b69ca" />
    //             <p>Pay Per Head</p>
    //           </div>
    //         ),
    //         props: { rowSpan: record.rowSpan },
    //       };
    //     } else {
    //       return {
    //         children: (
    //           <div style={{ display: "flex", gap: "6px" }}>
    //             <Tooltip
    //               placement="top"
    //               title={`Batch Code: ${record?.batch_number}`}
    //               trigger={["hover", "click"]}
    //             >
    //               <MdGroups size={17.5} color="#5b69ca" />
    //             </Tooltip>
    //             <p>Batch</p>
    //           </div>
    //         ),
    //         props: { rowSpan: record.rowSpan },
    //       };
    //     }
    //   },
    // },
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
      title: permissions.includes("View Financial Details")
        ? "Days Taken"
        : "Days Taken To Complete",
      key: "days_taken_topay",
      dataIndex: "days_taken_topay",
      width: permissions.includes("View Financial Details") ? 130 : 175,
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
      title: "Region",
      key: "std_region_name",
      dataIndex: "std_region_name",
      width: 120,
      render: (text) => <EllipsisTooltip text={text} />,
    },
    {
      title: "Place Of Sale",
      key: "std_place_of_sale_name",
      dataIndex: "std_place_of_sale_name",
      width: 120,
      render: (text) => <EllipsisTooltip text={text} />,
    },
    {
      title: "Place Of Service",
      key: "std_place_of_service_name",
      dataIndex: "std_place_of_service_name",
      width: 120,
      render: (text) => <EllipsisTooltip text={text} />,
    },
    {
      title: "Mode of Training",
      key: "mode_of_training",
      dataIndex: "mode_of_training",
      width: 130,
      render: (text) => <EllipsisTooltip text={text} />,
    },
    {
      title: "Trainer Name",
      key: "trainer_name",
      dataIndex: "trainer_name",
      width: 150,
      render: (text, record) => {
        const isLoading = trainerDetailsLoadingRef.current == record.id;

        return {
          children: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <EllipsisTooltip text={text || "-"} />
              {isLoading ? (
                <CommonSpinner color="#333" size={14} />
              ) : (
                <>
                  <FaRegEye
                    size={14}
                    className="trainers_action_icons"
                    onClick={() => {
                      setIsOpenTrainerFullDetailsModal(true);
                      getTrainerByIdData(record?.trainer_id, record?.id);
                    }}
                  />
                </>
              )}
            </div>
          ),
          props: { rowSpan: record.rowSpan },
        };
      },
    },
    {
      title: "No. Of Students",
      key: "batch_student_count",
      dataIndex: "batch_student_count",
      width: 115,
      render: (text) => {
        return <p>{`${Number(text).toLocaleString("en-IN")}`}</p>;
      },
    },
    {
      title: "Batch Id",
      key: "batch_number",
      dataIndex: "batch_number",
      width: 72,
      render: (text, record) => <EllipsisTooltip text={text} />,
    },
    {
      title: "Student Name",
      key: "customer_name",
      dataIndex: "customer_name",
      width: 150,
      render: (text, record) => {
        const isLoading =
          customerDetailsLoadingRef.current == record?.customer_id;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <EllipsisTooltip text={text || "-"} />
            {isLoading ? (
              <CommonSpinner color="#333" size={14} />
            ) : (
              <>
                {text && (
                  <FaRegEye
                    size={14}
                    className="trainers_action_icons"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      getParticularCustomerDetails(record?.customer_id);
                    }}
                  />
                )}
              </>
            )}
          </div>
        );
      },
    },
    // {
    //   title: "Tech",
    //   key: "course_name",
    //   dataIndex: "course_name",
    //   width: 150,
    //   render: (text) => <EllipsisTooltip text={text || "-"} />,
    // },
    {
      title: "Batch Amount",
      key: "batch_amount",
      dataIndex: "batch_amount",
      width: 110,
      hidden: !permissions.includes("View Financial Details") ? true : false,
      render: (text, record) => {
        return {
          children: <p>{text ? `₹${parseFloat(text).toFixed(2)}` : "-"}</p>,
        };
      },
    },
    {
      title: "Amount",
      key: "request_amount",
      dataIndex: "request_amount",
      width: 130,
      render: (text) => {
        return text ? `₹${parseFloat(text).toFixed(2)}` : "-";
      },
    },
    {
      title: "RA",
      key: "ra",
      dataIndex: "ra_user_id",
      width: 110,
      render: (text, record) => (
        <EllipsisTooltip
          text={text ? `${text} - ${record?.ra_user_name}` : "-"}
        />
      ),
    },
    {
      title: "HR",
      key: "hr_user_id",
      dataIndex: "hr_user_id",
      width: 110,
      render: (text, record) => (
        <EllipsisTooltip
          text={text ? `${text} - ${record?.hr_user_name}` : "-"}
        />
      ),
    },
    {
      title: (
        <Tooltip title="Sales Executive" placement="top">
          <div
            style={{ cursor: "pointer", width: "100%", textAlign: "center" }}
          >
            SE
          </div>
        </Tooltip>
      ),
      key: "lead_assigned_to_id",
      dataIndex: "lead_assigned_to_id",
      width: 130,
      render: (text, record) => {
        const lead_executive = `${text} - ${record?.lead_assigned_to_name}`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: (
        <Tooltip title="Payment Cleared" placement="top">
          <div
            style={{ cursor: "pointer", width: "100%", textAlign: "center" }}
          >
            PC
          </div>
        </Tooltip>
      ),
      key: "is_payment_cleared",
      dataIndex: "is_payment_cleared",
      width: 60,
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Class Completion 100%" placement="top">
          <div
            style={{ cursor: "pointer", width: "100%", textAlign: "center" }}
          >
            AC
          </div>
        </Tooltip>
      ),
      key: "is_class_percentage",
      dataIndex: "is_class_percentage",
      width: 60,
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Student Acknowledgement" placement="top">
          <div
            style={{ cursor: "pointer", width: "100%", textAlign: "center" }}
          >
            SA
          </div>
        </Tooltip>
      ),
      key: "is_acknowledged",
      dataIndex: "is_acknowledged",
      width: 60,
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
                }/acknowledge-class-completion/${record?.customer_id}`,
              );
              CommonMessage("success", "Link Copied");
              console.log("Copied: eeee");
            },
          },
        ),
    },
    {
      title: "Review Status",
      key: "review_status",
      width: 120,
      render: (text, record) => {
        return (
          <div className="customers_review_container">
            {record?.google_review ? (
              <div
                className="customers_review_google_active"
                onClick={() => {
                  setReviewModalTitle("Google Review");
                  setReviewScreenshot(record?.google_review);
                  setIsOpenReviewScreenshotModal(true);
                }}
              >
                <FcGoogle size={15} />
                {record?.is_google_verified === 1 && (
                  <PiSealCheckFill size={13} className="google_verified_icon" />
                )}
              </div>
            ) : (
              <Tooltip title="Google Review Not Collected">
                <div className="customers_review_inactive">
                  <FcGoogle size={15} className="customers_review_grayscale" />
                </div>
              </Tooltip>
            )}
            {record?.linkedin_review ? (
              <div
                className="customers_review_linkedin_active"
                onClick={() => {
                  setReviewModalTitle("LinkedIn Review");
                  setReviewScreenshot(record?.linkedin_review);
                  setIsOpenReviewScreenshotModal(true);
                }}
              >
                <FaLinkedinIn size={14} color="#0a66c2" />
                {record?.is_linkedin_verified === 1 && (
                  <PiSealCheckFill size={13} className="google_verified_icon" />
                )}
              </div>
            ) : (
              <Tooltip title="LinkedIn Review Not Collected">
                <div className="customers_review_inactive">
                  <FaLinkedinIn size={14} color="#8c8c8c" />
                </div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    // {
    //   title: "Feedback Submitted",
    //   key: "feedback",
    //   dataIndex: "feedback",
    //   width: 160,
    //   render: (text, record) => renderCellWithBackground(text),
    // },
    {
      title: "Status",
      key: "trainer_payment_status",
      dataIndex: "status",
      width: 120,
      fixed: "right",
      render: (text, record) => {
        return {
          children: (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <>
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
              </>

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
                        }/trainer-payment-claim/${record.trainer_id}/${record.payment_master_id}`,
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
        };
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
                  record?.status === "Requested"
                    ? "Click to Approve"
                    : "Click to Pay"
                }
                trigger={["hover", "click"]}
              >
                {record?.status === "Requested" ? (
                  <Button
                    className="trainers_pending_button"
                    onClick={() => {
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
                  </Button>
                ) : record?.status === "Awaiting Finance" ? (
                  <Button
                    className="trainers_verified_button"
                    onClick={() => {
                      if (record?.status == "Awaiting Finance") {
                        if (permissions.includes("Payment Completion")) {
                          setSelectedPaymentDetails(record);
                          setDrawerContentStatus("Awaiting Finance");
                          setIsOpenDetailsDrawer(true);
                        } else {
                          CommonMessage("error", "Access Denied");
                        }
                      } else {
                        CommonMessage("warning", "Claim not approved yet");
                      }
                    }}
                  >
                    Pay
                  </Button>
                ) : (
                  <p style={{ marginLeft: "6px" }}>-</p>
                )}
              </Tooltip>

              {record?.status === "Awaiting Finance" && (
                <Tooltip
                  placement="top"
                  title={"Move to Claim"}
                  trigger={["hover", "click"]}
                >
                  <SlActionUndo
                    size={14}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (
                        permissions.includes("Payment Approval") ||
                        permissions.includes("Payment Completion")
                      ) {
                        setIsOpenRevertModal(true);
                        setSelectedPaymentDetails(record);
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
      hidden: !permissions.includes("View Financial Details") ? true : false,
      render: (text, record) => {
        return {
          children: (
            <div className="trainers_actionbuttonContainer">
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
                <Tooltip
                  placement="left"
                  title="View Customer Track"
                  trigger={["hover", "click"]}
                >
                  <LuFileClock
                    size={15}
                    className="trainers_action_icons"
                    style={{ cursor: "pointer", marginLeft: "4px" }}
                    onClick={() => {
                      setSelectedHistoryCustomerId(record.customer_id);
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
  ].filter((col) => {
    if (!permissions.includes("View Financial Details")) {
      return !["request_amount", "batch_amount", "action", "details"].includes(
        col.key,
      );
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
            case "approved_date":
              return {
                ...col,
                width: 130,
                render: (text, record) => {
                  return (
                    <p style={{ margin: 0 }}>
                      {text ? moment(text).format("DD/MM/YYYY") : "-"}
                    </p>
                  );
                },
              };
            case "paid_date":
              return {
                ...col,
                width: 110,
                render: (text, record) => {
                  return (
                    <p style={{ margin: 0 }}>
                      {text ? moment(text).format("DD/MM/YYYY") : "-"}
                    </p>
                  );
                },
              };
            case "days_taken_topay":
              return {
                ...col,
                title: permissions.includes("View Financial Details")
                  ? "Days Taken"
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
                width: 110,
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
            case "std_region_name":
              return {
                ...col,
                width: 120,
                render: (students) => {
                  const text = students?.[0]?.std_region_name || "-";
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "std_place_of_sale_name":
              return {
                ...col,
                width: 120,
                render: (students) => {
                  const text =
                    students?.[0]?.std_place_of_sale_name ||
                    students?.[0]?.place_of_sale ||
                    "-";
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "std_place_of_service_name":
              return {
                ...col,
                width: 120,
                render: (students) => {
                  const text =
                    students?.[0]?.std_place_of_service_name ||
                    students?.[0]?.place_of_supply ||
                    "-";
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "mode_of_training":
              return {
                ...col,
                width: 120,
                render: (students) => {
                  const text =
                    students?.[0]?.mode_of_training ||
                    students?.[0]?.training_mode ||
                    "-";
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "batch_student_count":
              return {
                ...col,
                width: 115,
                render: (text) => {
                  return <p>{`${Number(text).toLocaleString("en-IN")}`}</p>;
                },
              };
            case "batch_number":
              return {
                ...col,
                width: 72,
                render: (text, record) => <EllipsisTooltip text={text} />,
              };
            // case "commercial_type":
            //   return {
            //     ...col,
            //     width: 130,
            //     render: (text, record) => {
            //       if (text == "Pay Per Head") {
            //         return {
            //           children: (
            //             <div
            //               style={{
            //                 display: "flex",
            //                 gap: "6px",
            //                 alignItems: "center",
            //               }}
            //             >
            //               <FaUserAlt size={11} color="#5b69ca" />
            //               <p>Pay Per Head</p>
            //             </div>
            //           ),
            //           props: { rowSpan: record.rowSpan },
            //         };
            //       } else {
            //         return {
            //           children: (
            //             <div style={{ display: "flex", gap: "6px" }}>
            //               <Tooltip
            //                 placement="top"
            //                 title={`Batch Code: ${record?.batch_number}`}
            //                 trigger={["hover", "click"]}
            //               >
            //                 <MdGroups size={18} color="#5b69ca" />
            //               </Tooltip>
            //               <p>Batch</p>
            //             </div>
            //           ),
            //           props: { rowSpan: record.rowSpan },
            //         };
            //       }
            //     },
            //   };
            case "trainer_name":
              return {
                ...col,
                width: 150,
                render: (text, record) => {
                  const isLoading =
                    trainerDetailsLoadingRef.current == record.id;

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
                        {isLoading ? (
                          <CommonSpinner color="#333" size={14} />
                        ) : (
                          <>
                            <FaRegEye
                              size={14}
                              className="trainers_action_icons"
                              onClick={() => {
                                setIsOpenTrainerFullDetailsModal(true);
                                getTrainerByIdData(
                                  record?.trainer_id,
                                  record?.id,
                                );
                              }}
                            />
                          </>
                        )}
                      </div>
                    ),
                    props: { rowSpan: record.rowSpan },
                  };
                },
              };
            case "customer_name":
              return {
                ...col,
                width: 150,
                render: (text, record) => {
                  const isLoading =
                    customerDetailsLoadingRef.current == record?.customer_id;

                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <EllipsisTooltip text={text || "-"} />
                      {isLoading ? (
                        <CommonSpinner color="#333" size={14} />
                      ) : (
                        <>
                          {text && (
                            <FaRegEye
                              size={14}
                              className="trainers_action_icons"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                getParticularCustomerDetails(
                                  record?.customer_id,
                                );
                              }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                },
              };
            // case "course_name":
            //   return {
            //     ...col,
            //     width: 150,
            //     render: (text) => <EllipsisTooltip text={text || "-"} />,
            //   };
            case "batch_amount":
              return {
                ...col,
                width: 110,
                hidden: !permissions.includes("View Financial Details")
                  ? true
                  : false,
                render: (text, record) => {
                  return {
                    children: (
                      <p>{text ? `₹${parseFloat(text).toFixed(2)}` : "-"}</p>
                    ),
                  };
                },
              };
            case "request_amount":
              return {
                ...col,
                width: 100,
                hidden: !permissions.includes("View Financial Details")
                  ? true
                  : false,
                render: (text, record) => {
                  return {
                    children: (
                      <p>
                        {record.commercial
                          ? `₹${parseFloat(record.commercial).toFixed(2)}`
                          : "-"}
                      </p>
                    ),
                    props: { rowSpan: record.rowSpan },
                  };
                },
              };
            case "ra":
              return {
                ...col,
                width: 110,
                render: (text, record) => (
                  <EllipsisTooltip
                    text={text ? `${text} - ${record?.ra_user_name}` : "-"}
                  />
                ),
              };
            case "hr_user_id":
              return {
                ...col,
                width: 110,
                render: (text, record) => (
                  <EllipsisTooltip
                    text={text ? `${text} - ${record?.hr_user_name}` : "-"}
                  />
                ),
              };
            case "lead_assigned_to_id":
              return {
                ...col,
                title: (
                  <Tooltip title="Sales Executive" placement="top">
                    <div
                      style={{
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      SE
                    </div>
                  </Tooltip>
                ),
                width: 110,
                render: (text, record) => {
                  const lead_executive = `${text} - ${record?.lead_assigned_to_name}`;
                  return <EllipsisTooltip text={lead_executive} />;
                },
              };
            case "is_payment_cleared":
              return {
                ...col,
                title: (
                  <Tooltip title="Payment Cleared" placement="top">
                    <div
                      style={{
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      PC
                    </div>
                  </Tooltip>
                ),
                width: 60,
                render: (text) => renderCellWithBackground(text),
              };
            case "is_class_percentage":
              return {
                ...col,
                title: (
                  <Tooltip title="Class Completion 100%" placement="top">
                    <div
                      style={{
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      AC
                    </div>
                  </Tooltip>
                ),
                width: 60,
                render: (text) => renderCellWithBackground(text),
              };
            case "is_acknowledged":
              return {
                ...col,
                title: (
                  <Tooltip title="Student Acknowledgement" placement="top">
                    <div
                      style={{
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      SA
                    </div>
                  </Tooltip>
                ),
                width: 60,
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
                          }/acknowledge-class-completion/${record?.customer_id}`,
                        );
                        CommonMessage("success", "Link Copied");
                        console.log("Copied: eeee");
                      },
                    },
                  ),
              };
            case "review_status":
              return {
                ...col,
                width: 120,
                render: (text, record) => {
                  return (
                    <div className="customers_review_container">
                      {record?.google_review ? (
                        <div
                          className="customers_review_google_active"
                          onClick={() => {
                            setReviewModalTitle("Google Review");
                            setReviewScreenshot(record?.google_review);
                            setIsOpenReviewScreenshotModal(true);
                          }}
                        >
                          <FcGoogle size={15} />
                          {record?.is_google_verified === 1 && (
                            <PiSealCheckFill
                              size={13}
                              className="google_verified_icon"
                            />
                          )}
                        </div>
                      ) : (
                        <Tooltip title="Google Review Not Collected">
                          <div className="customers_review_inactive">
                            <FcGoogle
                              size={15}
                              className="customers_review_grayscale"
                            />
                          </div>
                        </Tooltip>
                      )}
                      {record?.linkedin_review ? (
                        <div
                          className="customers_review_linkedin_active"
                          onClick={() => {
                            setReviewModalTitle("LinkedIn Review");
                            setReviewScreenshot(record?.linkedin_review);
                            setIsOpenReviewScreenshotModal(true);
                          }}
                        >
                          <FaLinkedinIn size={14} color="#0a66c2" />
                          {record?.is_linkedin_verified === 1 && (
                            <PiSealCheckFill
                              size={13}
                              className="google_verified_icon"
                            />
                          )}
                        </div>
                      ) : (
                        <Tooltip title="LinkedIn Review Not Collected">
                          <div className="customers_review_inactive">
                            <FaLinkedinIn size={14} color="#8c8c8c" />
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  );
                },
              };
            case "trainer_payment_status":
              return {
                ...col,
                width: 120,
                fixed: "right",
                render: (text, record) => {
                  return {
                    children: (
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                        }}
                      >
                        <>
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
                        </>

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
                                  }/trainer-payment-claim/${record.trainer_id}/${record.payment_master_id}`,
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
                  };
                },
              };
            case "action":
              return {
                ...col,
                width: 110,
                fixed: "right",
                render: (text, record) => {
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
                          placement="top"
                          title={
                            record?.status === "Requested"
                              ? "Click to Approve"
                              : "Click to Pay"
                          }
                          trigger={["hover", "click"]}
                        >
                          {record?.status === "Requested" ? (
                            <Button
                              className="trainers_pending_button"
                              onClick={() => {
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
                            </Button>
                          ) : record?.status === "Awaiting Finance" ? (
                            <Button
                              className="trainers_verified_button"
                              onClick={() => {
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
                              Pay
                            </Button>
                          ) : (
                            <p style={{ marginLeft: "6px" }}>-</p>
                          )}
                        </Tooltip>
                      </div>
                    ),
                  };
                },
              };
            case "details":
              return {
                ...col,
                width: 100,
                hidden: !permissions.includes("View Financial Details"),
                fixed: "right",
                render: (text, record) => {
                  return {
                    children: (
                      <div className="trainers_actionbuttonContainer">
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
                          <Tooltip
                            placement="left"
                            title="View Customer Track"
                            trigger={["hover", "click"]}
                          >
                            <LuFileClock
                              size={15}
                              className="trainers_action_icons"
                              style={{ cursor: "pointer", marginLeft: "4px" }}
                              onClick={() => {
                                setSelectedHistoryCustomerId(
                                  record.customer_id,
                                );
                                setIsOpenCustomerHistoryDrawer(true);
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
                    // props: { rowSpan: flatRecord.rowSpan },
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
          return !["request_amount", "action", "details"].includes(col.key);
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

    // Sanitize columns to prevent "Converting circular structure to JSON"
    // caused by React nodes in the `title` property
    const sanitizedColumns = columns.map((col) => {
      let titleStr = col.title;
      if (typeof col.title !== "string") {
        if (col.key === "is_payment_cleared") titleStr = "PC";
        else if (col.key === "is_class_percentage") titleStr = "AC";
        else if (col.key === "is_acknowledged") titleStr = "SA";
        else if (col.key === "lead_assigned_to_id") titleStr = "SE";
        else titleStr = col.key || "";
      }
      return {
        ...col,
        title: titleStr,
        render: undefined, // Remove render functions before saving
      };
    });

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Trainer Payment",
      column_names: sanitizedColumns,
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
        searchValue,
        selectedRegionId,
        selectedBranchId,
        commercialType,
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
        searchValue,
        selectedRegionId,
        selectedBranchId,
        commercialType,
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
    setSearchValue("");
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setCommercialType("");
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
      null,
      null,
      null,
      null,
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
    searchValue,
    regionId,
    branchId,
    commercialType,
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
      ...(searchValue && { search_filter: searchValue }),
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      ...(commercialType && { commercial_type: commercialType }),
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
      const regionCountsData = response?.data?.data?.regionCount || {};
      const commercialTypeCountsData =
        response?.data?.data?.commercialTypeCount || {};

      // Set payment requests data
      setPaymentRequestsData(responseData);

      // Update pagination
      setPagination({
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 0,
      });

      // Update status and region counts
      setRegionCounts(regionCountsData);
      setCommercialTypeCounts(commercialTypeCountsData);
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

  const getTrainerByIdData = async (trainerId, payment_id) => {
    setTrainerDetailsLoading(payment_id);
    try {
      const response = await getTrainerById(trainerId);
      const trainerDetails = response?.data?.data;
      console.log("particular trainer details", trainerDetails);
      setTrainerFullDetails([trainerDetails]);
      setTrainerDetailsLoading("");
    } catch (error) {
      setTrainerFullDetails([]);
      setTrainerDetailsLoading("");
      console.log("get trainer by id error", error);
    }
  };

  const getParticularCustomerDetails = async (
    customer_id,
    is_customer_history = false,
  ) => {
    console.log("is_customer_history", is_customer_history);
    setCustomerDetailsLoading(customer_id);

    try {
      const response = await getCustomerById(customer_id);
      const customer_details = response?.data?.data || null;
      console.log("customer full details", customer_details);
      setSelectedStudentDetails(customer_details);
      if (is_customer_history == false) {
        setIsOpenStudentDetailsModal(true);
        setCustomerDetailsLoading("");
      }
    } catch (error) {
      console.log("getcustomer by id error", error);
      setSelectedStudentDetails(null);
      setCustomerDetailsLoading("");
    }
  };

  const handleTrainerPaymentStatus = async (updateStatus, isRevert = false) => {
    setApproveButtonLoading(true);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      status: updateStatus,
      trainer_payment_id: selectedPaymentDetails?.payment_master_id,
      updated_by: convertAsJson?.user_id,
      updated_date: formatToBackendIST(new Date()),
      ...(isRevert && { Revert: 1 }),
    };
    try {
      await updateTrainerPaymentStatus(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated Successfully");
        paymentformReset();
        // Refresh the payment requests data
        getTrainerPaymentsData(
          selectedTrainerId,
          searchValue,
          selectedRegionId,
          selectedBranchId,
          commercialType,
          dateFilterType,
          selectedDates[0],
          selectedDates[1],
          status || null,
          pagination.page,
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
          searchValue,
          selectedRegionId,
          selectedBranchId,
          commercialType,
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

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setPagination({
      page: 1,
    });
    getTrainerPaymentsData(
      selectedTrainerId,
      e.target.value,
      selectedRegionId,
      selectedBranchId,
      commercialType,
      dateFilterType,
      selectedDates[0],
      selectedDates[1],
      status || null,
      1,
      pagination.limit,
    );
  };

  const getBranchesData = async (regionid) => {
    const payload = {
      region_id: regionid,
    };
    setFilterLoading(true);
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
    } finally {
      setFilterLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    const from_date = formatToBackendIST(selectedDates[0]);
    const to_date = formatToBackendIST(selectedDates[1]);

    const payload = {
      trainer_id: selectedTrainerId,
      ...(searchValue && { search_filter: searchValue }),
      ...(selectedRegionId && { region_id: selectedRegionId }),
      ...(selectedBranchId && { branch_id: selectedBranchId }),
      ...(commercialType && { commercial_type: commercialType }),
      type: "RaiseDate",
      start_date: from_date,
      end_date: to_date,
      status: status,
    };
    try {
      const response = await getTrainerPayments(payload);
      console.log("received payments response", response);
      const download_data = response?.data?.data?.data || [];

      const flatDownloadData = [];
      download_data.forEach((request) => {
        if (request.students && request.students.length > 0) {
          request.students.forEach((student) => {
            flatDownloadData.push({
              ...request,
              ...student,
              std_region_name: student.std_region_name || "-",
              std_place_of_sale_name:
                student.std_place_of_sale_name || student.place_of_sale || "-",
              std_place_of_service_name:
                student.std_place_of_service_name ||
                student.place_of_supply ||
                "-",
              mode_of_training:
                student.mode_of_training || student.training_mode || "-",
              request_amount:
                student.commercial ||
                request.commercial ||
                request.request_amount ||
                0,
            });
          });
        } else {
          flatDownloadData.push({
            ...request,
          });
        }
      });

      if (flatDownloadData.length >= 1) {
        const exportColumns = nonChangeColumns
          .filter((col) => {
            if (
              col.key === "review_status" ||
              col.key === "action" ||
              col.key === "details"
            ) {
              return false;
            }

            if (
              commercialType === "Pay Per Head" &&
              (col.key === "batch_number" || col.key === "batch_student_count")
            ) {
              return false;
            }

            if (col.key === "approved_date" && status !== "Awaiting Finance") {
              return false;
            }

            if (col.key === "paid_date" && status !== "Paid") {
              return false;
            }

            return true;
          })
          .flatMap((col) => {
            if (col.key === "is_payment_cleared") {
              return [{ ...col, title: "Payment Cleared" }];
            }

            if (col.key === "is_class_percentage") {
              return [{ ...col, title: "Class Completion 100%" }];
            }

            if (col.key === "is_acknowledged") {
              return [
                { ...col, title: "Student Acknowledgement" },
                //add google review columns
                {
                  key: "google_review",
                  dataIndex: "google_review",
                  title: "Google Review",
                },
                {
                  key: "is_google_verified",
                  dataIndex: "is_google_verified",
                  title: "Google Review Verify",
                },
                //add linkedin review columns
                {
                  key: "linkedin_review",
                  dataIndex: "linkedin_review",
                  title: "Linkedin Review",
                },
                {
                  key: "is_linkedin_verified",
                  dataIndex: "is_linkedin_verified",
                  title: "Linkedin Review Verify",
                },
              ];
            }

            if (col.key === "lead_assigned_to_id") {
              return [{ ...col, title: "Sales Executive" }];
            }

            return [col];
          });

        DownloadTableAsCSV(
          flatDownloadData,
          exportColumns,
          `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
            selectedDates[1],
          ).format("DD-MM-YYYY")} Trainer Payments.csv`,
          true,
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

  const paymentformReset = () => {
    setButtonLoading(false);
    setIsOpenDetailsDrawer(false);
    setSelectedPaymentDetails(null);
    setIsOpenApproveModal(false);
    setIsOpenRevertModal(false);
    setApproveButtonLoading(false);
    setDrawerContentStatus("");
  };

  const handlePaginationChange = ({ page, limit }) => {
    // This will be called when pagination changes
    setPagination({ ...pagination, page, limit });
    // Fetch data with new pagination
    getTrainerPaymentsData(
      selectedTrainerId,
      searchValue,
      selectedRegionId,
      selectedBranchId,
      commercialType,
      dateFilterType,
      selectedDates[0],
      selectedDates[1],
      status || null,
      page,
      limit,
    );
  };

  const handleSelectedRow = (row) => {
    setSelectedRows(row);
    console.log("selected rowsss", row);
    const keys = row.map((item) => item.row_num); // match table rowKey
    setSelectedRowKeys(keys);
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
    setSearchValue("");
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setCommercialType("");
    getTrainerPaymentsData(
      null,
      null,
      null,
      null,
      null,
      "RaiseDate",
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
      1,
      10,
    );
  };

  const filteredColumns = tableColumns.filter((col) => {
    // Batch-specific columns
    if (
      commercialType !== "Batch" &&
      (col.key === "batch_student_count" ||
        col.key === "batch_number" ||
        col.key === "batch_amount")
    ) {
      return false;
    }

    // Approved date
    if (col.key === "approved_date" && status !== "Awaiting Finance") {
      return false;
    }

    // Approved date
    if (col.key === "paid_date" && status !== "Paid") {
      return false;
    }

    // Hide these columns for Awaiting Finance / Paid
    if (
      (col.key === "review_status" ||
        col.key === "ra" ||
        col.key === "hr_user_id" ||
        col.key === "lead_assigned_to_id" ||
        col.key === "is_payment_cleared" ||
        col.key === "is_class_percentage" ||
        col.key === "is_acknowledged") &&
      (status === "Awaiting Finance" || status === "Paid")
    ) {
      return false;
    }

    // Hide these columns for empty / Requested status
    if (
      (col.key === "deadline_date" ||
        col.key === "days_taken_topay" ||
        col.key === "std_region_name" ||
        col.key === "std_place_of_sale_name" ||
        col.key === "std_place_of_service_name" ||
        col.key === "mode_of_training" ||
        col.key === "request_amount" ||
        col.key === "lead_assigned_to_id" ||
        col.key === "is_payment_cleared" ||
        col.key === "is_class_percentage" ||
        col.key === "is_acknowledged" ||
        col.key === "review_status") &&
      status === ""
    ) {
      return false;
    }

    if (
      (col.key === "deadline_date" ||
        col.key === "days_taken_topay" ||
        col.key === "std_region_name" ||
        col.key === "std_place_of_sale_name" ||
        col.key === "std_place_of_service_name" ||
        col.key === "mode_of_training" ||
        col.key === "lead_assigned_to_id") &&
      status === "Link Sent"
    ) {
      return false;
    }

    // hide action column
    if (
      col.key === "action" &&
      (status === "" || status === "Link Sent" || status === "Paid")
    ) {
      return false;
    }

    // hide status column
    if (
      col.key === "trainer_payment_status" &&
      (status === "Requested" ||
        status === "Awaiting Finance" ||
        status === "Paid")
    ) {
      return false;
    }
    return true;
  });

  const flattenedTableData = useMemo(() => {
    const flatData = [];
    paymentRequestsData.forEach((request) => {
      if (request.students && request.students.length > 0) {
        request.students.forEach((student, index) => {
          flatData.push({
            ...request,
            ...student,
            std_region_name: student.std_region_name || "-",
            std_place_of_sale_name:
              student.std_place_of_sale_name || student.place_of_sale || "-",
            std_place_of_service_name:
              student.std_place_of_service_name ||
              student.place_of_supply ||
              "-",
            mode_of_training:
              student.mode_of_training || student.training_mode || "-",
            request_amount:
              student.commercial ||
              request.commercial ||
              request.request_amount ||
              0,
            students: [student],
            student_details: student,
            rowSpan: index === 0 ? request.students.length : 0,
            request_details: request,
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

  const studentLevelColumns = [
    "customer_name",
    "request_amount",
    "std_region_name",
    "std_place_of_sale_name",
    "std_place_of_service_name",
    "mode_of_training",
    "ra",
    "hr_user_id",
    "lead_assigned_to_id",
    "is_payment_cleared",
    "is_class_percentage",
    "is_acknowledged",
    "review_status",
    "details",
  ];

  const finalColumns = filteredColumns.map((col) => {
    if (studentLevelColumns.includes(col.key)) {
      return col;
    }

    const originalRender = col.render;
    if (originalRender) {
      return {
        ...col,
        render: (text, record, index) => {
          const result = originalRender(text, record, index);
          if (
            result &&
            typeof result === "object" &&
            !Array.isArray(result) &&
            !result.$$typeof
          ) {
            return {
              ...result,
              props: {
                ...(result.props || {}),
                rowSpan: record.rowSpan,
              },
            };
          } else {
            return {
              children: result,
              props: { rowSpan: record.rowSpan },
            };
          }
        },
      };
    }

    return {
      ...col,
      render: (text, record) => ({
        children: text,
        props: { rowSpan: record.rowSpan },
      }),
    };
  });

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
                    searchValue,
                    selectedRegionId,
                    selectedBranchId,
                    commercialType,
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
                    searchValue,
                    selectedRegionId,
                    selectedBranchId,
                    commercialType,
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
                    searchValue,
                    selectedRegionId,
                    selectedBranchId,
                    commercialType,
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
                        searchValue,
                        selectedRegionId,
                        selectedBranchId,
                        commercialType,
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
                        searchValue,
                        selectedRegionId,
                        selectedBranchId,
                        commercialType,
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
            </div>
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
        <Col xs={24} sm={24} md={24} lg={22} xxl={18}>
          <Row gutter={12} align="middle" wrap={false}>
            <Col flex="1 1 0%">
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
                          getTrainerPaymentsData(
                            selectedTrainerId,
                            null,
                            selectedRegionId,
                            selectedBranchId,
                            commercialType,
                            dateFilterType,
                            selectedDates[0],
                            selectedDates[1],
                            status || null,
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
                  setPagination({
                    page: 1,
                  });
                  getTrainerPaymentsData(
                    selectedTrainerId,
                    searchValue,
                    value,
                    selectedBranchId,
                    commercialType,
                    dateFilterType,
                    selectedDates[0],
                    selectedDates[1],
                    status || null,
                    1,
                    pagination.limit,
                  );
                  if (value) {
                    getBranchesData(value);
                  } else {
                    setBranchOptions([]);
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
                loading={filterLoading}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedBranchId(value);
                  setPagination({
                    page: 1,
                  });
                  getTrainerPaymentsData(
                    selectedTrainerId,
                    searchValue,
                    selectedRegionId,
                    value,
                    commercialType,
                    dateFilterType,
                    selectedDates[0],
                    selectedDates[1],
                    status || null,
                    1,
                    pagination.limit,
                  );
                }}
                value={selectedBranchId}
                disableClearable={false}
                disabled={selectedRegionId == 3 ? true : false}
              />
            </Col>
            <Col flex="1.5 1 0%">
              <CommonMuiCustomDatePicker
                width={"100%"}
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getTrainerPaymentsData(
                    selectedTrainerId,
                    searchValue,
                    selectedRegionId,
                    selectedBranchId,
                    commercialType,
                    dateFilterType,
                    dates[0],
                    dates[1],
                    status || null,
                    1,
                    pagination.limit,
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
          lg={2}
          xxl={6}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {permissions.includes("Download Trainer Payment Data") && (
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
              getTableColumnsData(loginUserId);
            }}
          />
        </Col>
      </Row>

      <div
        className="customers_scroll_wrapper"
        style={{ marginTop: "12px", marginBottom: "0px" }}
      >
        <div
          className="customers_status_mainContainer"
          style={{
            marginTop: "0px",
            marginBottom: "0px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div
            className={
              commercialType === "Pay Per Head"
                ? "customers_active_completed_container"
                : "customers_completed_container"
            }
            style={{ height: "100%" }}
            onClick={() => {
              let com_type = "";
              if (commercialType == "Pay Per Head") {
                com_type = "";
              } else {
                com_type = "Pay Per Head";
              }
              setCommercialType(com_type);
              setPagination({
                page: 1,
              });
              getTrainerPaymentsData(
                selectedTrainerId,
                searchValue,
                selectedRegionId,
                selectedBranchId,
                com_type,
                dateFilterType,
                selectedDates[0],
                selectedDates[1],
                status || null,
                1,
                pagination.limit,
              );
            }}
          >
            <p>{`Pay Per Head ( ${commercialTypeCounts?.Pay_Per_Head_Count ?? 0} )`}</p>
          </div>

          <div
            className={
              commercialType === "Batch"
                ? "customers_active_verifytrainers_container"
                : "customers_verifytrainers_container"
            }
            style={{ height: "100%" }}
            onClick={() => {
              let com_type = "";
              if (commercialType == "Batch") {
                com_type = "";
              } else {
                com_type = "Batch";
              }
              setCommercialType(com_type);
              setPagination({
                page: 1,
              });
              getTrainerPaymentsData(
                selectedTrainerId,
                searchValue,
                selectedRegionId,
                selectedBranchId,
                com_type,
                dateFilterType,
                selectedDates[0],
                selectedDates[1],
                status || null,
                1,
                pagination.limit,
              );
            }}
          >
            <p>{`Batch ( ${commercialTypeCounts?.Batch_Count ?? 0} )`}</p>
          </div>

          {permissions.includes("Show Region Summary") && (
            <div
              className="livelead_today_summary_container"
              style={{ marginTop: "0px", marginLeft: "12px" }}
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
                    {regionCounts?.hub_count ?? "-"}
                  </span>
                  {regionCounts?.hub_amount != null && (
                    <span
                      style={{
                        marginLeft: "8px",
                        paddingLeft: "8px",
                        borderLeft: "1px solid rgba(0,0,0,0.15)",
                        fontWeight: "600",
                        color: "#3c9111",
                        fontSize: "13px",
                      }}
                    >
                      ₹{Number(regionCounts.hub_amount).toLocaleString("en-IN")}
                    </span>
                  )}
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
                    {regionCounts?.chn_count ?? "-"}
                  </span>
                  {regionCounts?.chn_amount != null && (
                    <span
                      style={{
                        marginLeft: "8px",
                        paddingLeft: "8px",
                        borderLeft: "1px solid rgba(0,0,0,0.15)",
                        fontWeight: "600",
                        color: "#1e90ff",
                        fontSize: "13px",
                      }}
                    >
                      ₹{Number(regionCounts.chn_amount).toLocaleString("en-IN")}
                    </span>
                  )}
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
                    {regionCounts?.blr_count ?? "-"}
                  </span>
                  {regionCounts?.blr_amount != null && (
                    <span
                      style={{
                        marginLeft: "8px",
                        paddingLeft: "8px",
                        borderLeft: "1px solid rgba(0,0,0,0.15)",
                        fontWeight: "600",
                        color: "#607d8b",
                        fontSize: "13px",
                      }}
                    >
                      ₹{Number(regionCounts.blr_amount).toLocaleString("en-IN")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Requests Table */}
      <div style={{ marginTop: "16px", marginBottom: "20px" }}>
        <CommonTable
          scroll={{
            x: filteredColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={finalColumns}
          dataSource={flattenedTableData}
          rowKey={(record) => record.row_num}
          dataPerPage={10}
          loading={loading}
          checkBox={
            permissions.includes("Show Ready to Pay & Paid Buckets") &&
            (status === "Awaiting Finance" || status === "Paid")
              ? "true"
              : "false"
          }
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange}
          selectedDatas={handleSelectedRow}
          selectedRowKeys={selectedRowKeys}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
          disableLocalPagination={true}
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
                        searchValue,
                        selectedRegionId,
                        selectedBranchId,
                        commercialType,
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

      {/* revert confirm modal */}
      <Modal
        open={isOpenRevertModal}
        onCancel={() => {
          setIsOpenRevertModal(false);
          setSelectedPaymentDetails(null);
        }}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Revert The Amount Of{" "}
          <span style={{ fontWeight: 700, color: "#333", fontSize: "14px" }}>
            {selectedPaymentDetails
              ? "₹" +
                (selectedPaymentDetails.commercial_type === "Batch"
                  ? selectedPaymentDetails.batch_amount
                  : selectedPaymentDetails.request_amount)
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
              setIsOpenRevertModal(false);
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
                handleTrainerPaymentStatus("Requested", true);
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
      <CustomerHistory
        customerId={selectedHistoryCustomerId}
        isOpen={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setSelectedHistoryCustomerId(null);
        }}
      />

      {/* profile image modal */}
      <Modal
        open={previewOpen}
        title="Preview Profile"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* review screenshot modal */}
      <Modal
        title={reviewModalTitle}
        open={isOpenReviewScreenshotModal}
        onCancel={() => {
          setIsOpenReviewScreenshotModal(false);
          setReviewScreenshot("");
          setReviewModalTitle("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {reviewScreenshot ? (
              <img
                src={`data:image/png;base64,${reviewScreenshot}`}
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
