import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  Modal,
  Upload,
  Skeleton,
  Popover,
  Badge,
} from "antd";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { LuSend } from "react-icons/lu";
import { FaLinkedinIn } from "react-icons/fa";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTable from "../Common/CommonTable";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import "./styles.css";
import {
  getAllDownlineUsers,
  getCustomerById,
  getCustomers,
  getTableColumns,
  updateTableColumns,
  verifyReview,
  viewCertForCustomer,
} from "../ApiService/action";
import {
  customersStatusDisplay,
  formatToBackendIST,
  getCurrentandPreviousweekDate,
  isWithin30Days,
} from "../Common/Validation";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import CommonSpinner from "../Common/CommonSpinner";
import { DownloadOutlined } from "@ant-design/icons";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { FiFileText } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { RedoOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import moment from "moment";
import { AiOutlineEdit } from "react-icons/ai";
import CustomerUpdate from "../Customers/CustomerUpdate";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSelectField from "../Common/CommonSelectField";
import { FiFilter } from "react-icons/fi";
import { MdOutlineSwapVert } from "react-icons/md";
import CommonDnd from "../Common/CommonDnd";
import { BsPatchCheckFill } from "react-icons/bs";
import { FaRegCopy } from "react-icons/fa6";
import { PiSealCheckFill } from "react-icons/pi";
import { GrCertificate } from "react-icons/gr";
import { CloseOutlined } from "@ant-design/icons";
import { LuFileClock } from "react-icons/lu";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";
import CustomerHistory from "../Customers/CustomerHistory";
import { useSelector } from "react-redux";
import FinanceVerify from "../Customers/FinanceVerify";
import StudentVerify from "../Customers/StudentVerify";
import AssignAndVerifyTrainer from "../Customers/AssignAndVerifyTrainer";
import ClassSchedule from "../Customers/ClassSchedule";
import PassesOutProcess from "../Customers/PassedOutProcess";
import DownloadRegistrationForm from "../Customers/DownloadRegistrationForm";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import CustomerEmailTemplate from "../Customers/CustomerEmailTemplate";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import OthersHandling from "../Customers/OthersHandling";
import ReAssignTrainer from "../Customers/ReAssignTrainer";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import PreCertificate from "../Customers/PreCertificate";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import PrismaZoom from "react-prismazoom";

export default function Admissions() {
  const scrollRef = useRef();
  const customerUpdateRef = useRef();
  const financeVerifyRef = useRef();
  const studentVerifyRef = useRef();
  const assignAndVerifyTrainerRef = useRef();
  const reAssignTrainerRef = useRef();
  const classScheduleRef = useRef();
  const passedOutProcessRef = useRef();
  const othersHandlingRef = useRef();
  const preCertificateRef = useRef();
  const emailTemplateRef = useRef();
  const mounted = useRef(false);
  const location = useLocation();

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
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerStatusCount, setCustomerStatusCount] = useState(null);
  const [isOpenEditDrawer, setIsOpenEditDrawer] = useState(false);
  const [updateDrawerTabKey, setUpdateDrawerTabKey] = useState("1");
  const [customerId, setCustomerId] = useState(null);
  const [updateButtonLoading, setUpdateButtonLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusUpdateDrawer, setIsStatusUpdateDrawer] = useState(false);
  const [isStatusUpdateDrawerLoading, setIsStatusUpdateDrawerLoading] =
    useState(false);
  const [drawerContentStatus, setDrawerContentStatus] = useState("");
  //profile image usestates
  const [profilePictureArray, setProfilePictureArray] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  //form usesates
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  //awaiting finance
  const [isSwap, setIsSwap] = useState(false);
  //student verify usestates
  //assign trainer usestates
  const [isAssignTrainerSwap, setIsAssignTrainerSwap] = useState(false);
  const [isApprovalTrainerSwap, setIsApprovalTrainerSwap] = useState(false);
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
  //trainer verify usestates
  const [rejectbuttonLoader, setRejectButtonLoader] = useState(false);
  //class schedule usestates
  //class going usestates
  //feedback usestates
  const [isCertGenerated, setIsCertGenerated] = useState(false);
  const [generateCertLoading, setGenerateCertLoading] = useState(false);
  const [certHtmlContent, setCertHtmlContent] = useState("");
  const [isOpenViewCertModal, setIsOpenViewCertModal] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [verifyButtonLoading, setVerifyButtonLoading] = useState(false);

  //customer history usestates
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [selectedHistoryCustomerId, setSelectedHistoryCustomerId] =
    useState(null);

  const prev = () => setStepIndex(stepIndex - 1);
  const [loading, setLoading] = useState(true);
  //executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allDownliners, setAllDownliners] = useState([]);
  //branch filter
  const [branchOptions, setBranchOptions] = useState([
    { id: 1, name: "Classroom", checked: true },
    { id: 1, name: "Online", checked: true },
  ]);
  const [duplicateBranchOptions, setDuplicateBranchOptions] = useState([
    { id: 1, name: "Classroom", checked: true },
    { id: 1, name: "Online", checked: true },
  ]);
  //review modal
  const [isOpenReviewScreenshotModal, setIsOpenReviewScreenshotModal] =
    useState(false);
  const [reviewScreenshot, setReviewScreenshot] = useState("");
  const [reviewModalTitle, setReviewModalTitle] = useState("");
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  //table dnd
  const [loginUserId, setLoginUserId] = useState("");
  const [updateTableId, setUpdateTableId] = useState(null);
  const [checkAll, setCheckAll] = useState(false);

  const nonChangeColumns = [
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
    {
      title: "Cr.Created At",
      key: "created_date",
      dataIndex: "created_date",
      width: 115,
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      width: 170,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 140 },
    {
      title: "Course ",
      key: "course_name",
      dataIndex: "course_name",
      width: 180,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Joined ",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 140,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Fees",
      key: "total_amount",
      dataIndex: "total_amount",
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
      title: "HR Name",
      key: "trainer_hr_name",
      dataIndex: "trainer_hr_name",
      width: 170,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Trainer",
      key: "trainer_name",
      dataIndex: "trainer_name",
      width: 170,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Trainer Commercial%",
      key: "commercial_percentage",
      dataIndex: "commercial_percentage",
      width: 170,
      render: (text) => {
        return (
          <p
            className="customerdetails_text"
            style={{
              fontWeight: 700,
              color:
                text && text !== null
                  ? text < 18
                    ? "#3c9111" // green
                    : text > 18 && text <= 22
                      ? "#ffa502" // yellow
                      : text > 24
                        ? "#d32f2f" // red
                        : ""
                  : "", // fallback color if null
            }}
          >
            {text && text ? text + "%" : "-"}
          </p>
        );
      },
    },
    {
      title: "TR Number",
      key: "trainer_mobile",
      dataIndex: "trainer_mobile",
      width: 150,
    },
    {
      title: "Review Status",
      key: "review_status",
      dataIndex: "review_status",
      width: 120,
      render: (text, record) => {
        return (
          <div className="customers_review_container">
            {record?.google_review ? (
              <div
                className="customers_review_google_active"
                onClick={() => {
                  setReviewModalTitle("Google Review");
                  setCustomerDetails(record);
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
                  setCustomerDetails(record);
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
    {
      title: "Form Status",
      key: "is_customer_updated",
      dataIndex: "is_customer_updated",
      width: 120,
      fixed: "right",
      render: (text, record) => {
        return (
          <>
            {record.is_customer_updated === 1 ? (
              <div style={{ display: "flex", gap: "6px" }}>
                <p>Completed</p>
                {permissions.includes("Download Registration Form") && (
                  <Tooltip placement="top" title="Customer Registration Form">
                    <FiFileText
                      size={14}
                      className="customers_formlink_copybutton"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setIsOpenFormModal(true);
                        getParticularCustomerDetails(record?.id);
                      }}
                    />
                  </Tooltip>
                )}
              </div>
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
      width: 182,
      ...(status === "" || status === "Others"
        ? {
            sorter: (a, b) =>
              customersStatusDisplay(a).localeCompare(
                customersStatusDisplay(b),
              ),
            sortDirections: ["ascend", "descend"],
          }
        : {}),
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
            >
              {record.is_second_due === 1 && status == "Awaiting Finance" ? (
                <div>
                  <Button className="customers_status_awaitfinance_button">
                    Payment Verify
                  </Button>
                </div>
              ) : record.is_second_due === 1 &&
                permissions.includes("Finance Verify") ? (
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
              ) : record.is_last_pay_rejected === 1 &&
                isSwap == true &&
                status == "Payment Rejected" ? (
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
                text === "Payment Rejected" ||
                text === "Trainer Rejected" ||
                text === "Approval Rejected" ||
                text === "Escalated" ||
                text === "Hold" ||
                text === "Partially Closed" ||
                text === "Discontinued" ||
                text === "Demo Completed" ||
                text === "Videos Given" ||
                text === "Refund" ? (
                <Button className="trainers_rejected_button">{text}</Button>
              ) : text === "Class Going" ? (
                <div style={{ display: "flex", gap: "12px" }}>
                  <Button className="customers_status_classgoing_button">
                    {text}
                  </Button>

                  <p
                    className="customer_classgoing_percentage"
                    style={{ flexShrink: 0 }}
                  >{`${parseFloat(classPercent)}%`}</p>
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
                      }/customer-registration/${record.id}`,
                    );
                    CommonMessage("success", "Link Copied");
                  }}
                />
              </Tooltip>
            )}
            {record.status === "Completed" ? (
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
            ) : (
              ""
            )}
            {record.status == "Class Going" ? (
              <Tooltip placement="top" title="Linkedin CheckIn">
                <FaLinkedinIn
                  size={14}
                  color="#0a66c2"
                  className="customers_formlink_copybutton"
                  style={{
                    cursor: "pointer",
                    marginTop: "-2px",
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    getParticularCustomerDetails(record?.id);
                    setDrawerContentStatus("Pre Certificate");
                    setIsStatusUpdateDrawer(true);
                    return;
                  }}
                />
              </Tooltip>
            ) : (
              ""
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
                size={15}
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenDetailsDrawer(true);
                  setCustomerId(record?.id);
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
                  setSelectedHistoryCustomerId(record?.id);
                  setIsOpenCustomerHistoryDrawer(true);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);
  const [customersData, setCustomersData] = useState([]);

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
  }, [permissions, isSwap, status]);

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      getAllDownlineUsersData(null);
    }
  }, [childUsers]);

  useEffect(() => {
    const handler = async (e) => {
      const data = e.detail;
      console.log("Received via event:", data, allDownliners);
      setSearchValue("");
      setSelectedUserId(null);

      // Re-run your existing logic
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      try {
        const response = await getAllDownlineUsers(convertAsJson.user_id);
        console.log("all downlines response", response);
        const downliners = response?.data?.data || [];
        const downliners_ids = downliners.map((u) => {
          return u.user_id;
        });
        setAllDownliners(downliners_ids);
        rerunCustomerFilters(data, downliners_ids);
      } catch (error) {
        console.log("all downlines error", error);
      }
    };

    window.addEventListener("notificationFilter", handler);
    return () => window.removeEventListener("notificationFilter", handler);
  }, []);

  const rerunCustomerFilters = (stateData, downliners) => {
    console.log("location state dataaa", stateData);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();

    const receivedValueFromDashboard = stateData?.status || null;
    const receivedStartDateFromDashboard = stateData?.startDate || null;
    const receivedEndDateFromDashboard = stateData?.endDate || null;
    const receivedSwapFromNotification = stateData?.payment_swap || null;

    setStatus(
      receivedValueFromDashboard
        ? receivedValueFromDashboard === "Trainer Rejected"
          ? "Awaiting Trainer"
          : receivedValueFromDashboard
        : "",
    );

    if (
      receivedValueFromDashboard == "Awaiting Trainer" ||
      receivedValueFromDashboard == "Trainer Rejected" ||
      receivedValueFromDashboard == "Awaiting Class" ||
      receivedValueFromDashboard == "Class Scheduled" ||
      receivedValueFromDashboard == "Class Going"
    ) {
      scroll(600);
    }
    if (
      receivedValueFromDashboard == "Passedout process" ||
      receivedValueFromDashboard == "Escalated" ||
      receivedValueFromDashboard == "Others" ||
      receivedValueFromDashboard == "Completed"
    ) {
      scroll(1200);
    }

    if (receivedStartDateFromDashboard) {
      setSelectedDates([
        receivedStartDateFromDashboard,
        receivedEndDateFromDashboard,
      ]);
    } else {
      setSelectedDates(PreviousAndCurrentDate);
    }

    if (receivedSwapFromNotification) {
      setIsSwap(receivedSwapFromNotification);
    }

    getCustomersData(
      receivedStartDateFromDashboard
        ? receivedStartDateFromDashboard
        : PreviousAndCurrentDate[0],
      receivedEndDateFromDashboard
        ? receivedEndDateFromDashboard
        : PreviousAndCurrentDate[1],
      null,
      null,
      receivedValueFromDashboard
        ? receivedValueFromDashboard === "Trainer Rejected"
          ? ["Trainer Rejected"]
          : receivedValueFromDashboard
        : null,
      downliners,
      [
        { id: 1, name: "Classroom", checked: true },
        { id: 1, name: "Online", checked: true },
      ],
      1,
      10,
    );
  };

  const getAllDownlineUsersData = async (user_id, isRefresh = false) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    try {
      const response = await getAllDownlineUsers(
        user_id ? user_id : convertAsJson.user_id,
      );
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      rerunCustomerFilters(isRefresh ? null : location.state, downliners_ids);
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getCustomersData = async (
    startDate,
    endDate,
    searchvalue,
    origin,
    customerStatus,
    downliners,
    branch_options,
    pageNumber,
    limit,
    is_generate_certificate,
  ) => {
    setLoading(true);

    const region_data = branch_options
      .filter((f) => f.checked === true)
      .map((f) => f.name);

    const payload = {
      ...(searchvalue && filterType == 1
        ? { mobile: searchvalue }
        : searchvalue && filterType == 2
          ? { name: searchvalue }
          : searchvalue && filterType == 3
            ? { email: searchvalue }
            : searchvalue && filterType == 4
              ? { course: searchvalue }
              : {}),
      from_date: startDate,
      to_date: endDate,
      date_type: "Created",
      ...(origin && { domain: origin }),
      ...(customerStatus && {
        status: customerStatus,
      }),
      user_ids: downliners,
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
        response?.data?.data?.customer_status_count || null,
      );
      if (is_generate_certificate === true) {
        if (customers.length >= 1) {
          const findCurrentCustomer = customers.find(
            (f) => f.id === customerDetails.id,
          );

          if (findCurrentCustomer) {
            setCustomerDetails(findCurrentCustomer);
            setIsCertGenerated(
              findCurrentCustomer.is_certificate_generated === 1 ? true : false,
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
      setLoading(false);
    }
  };

  const getTableColumnsData = async (user_id) => {
    try {
      const response = await getTableColumns(user_id);
      const data = response?.data?.data || [];
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

      const filterPage = data.find((f) => f.page_name === "Admissions");

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
      console.log("get table columns error", error);
    }
  };

  const updateTableColumnsData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Customers",
      column_names: columns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  //get particular customer full details
  const getParticularCustomerDetails = async (customer_Id) => {
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
      setIsStatusUpdateDrawerLoading(false);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getCustomersData(
      selectedDates[0],
      selectedDates[1],
      searchValue,
      selectedOrigin,
      status,
      allDownliners,
      branchOptions,
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
    setTimeout(() => {
      getCustomersData(
        selectedDates[0],
        selectedDates[1],
        e.target.value,
        selectedOrigin,
        status,
        allDownliners,
        branchOptions,
        1,
        pagination.limit,
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
      getCustomersData(
        selectedDates[0],
        selectedDates[1],
        searchValue,
        selectedOrigin,
        status,
        downliners_ids,
        branchOptions,
        1,
        pagination.limit,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const handleEdit = (item) => {
    setCustomerId(item?.id);
    getParticularCustomerDetails(item?.id);
    setIsOpenEditDrawer(true);
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setIsOpenFilterDrawer(false);
    setCustomerDetails(null);
  };

  const handleRefresh = () => {
    setStatus("");
    setSearchValue("");
    setSelectedUserId(null);
    setSelectedOrigin("");
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
    });
    getAllDownlineUsersData(null, true);
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
          "Something went wrong. Try again later",
      );
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

  const handleStatusMismatch = () => {
    CommonMessage("error", "Status Mismatch. Contact Support Team");
  };

  const updateStatusDrawerReset = () => {
    setIsStatusUpdateDrawer(false);
    setCustomerDetails(null);
    setDrawerContentStatus("");
    setTimeout(() => {
      setUpdateButtonLoading(false);
    }, 300);
    //student verify
    //assign trainer
    //verify trainer
    setRejectButtonLoader(false);
    //class schedule
    //class going
    //feedback
    setStepIndex(0);
    //cert usestaes
    setIsCertGenerated(false);
    setCertificateName("");
  };

  const handleVerifyReview = async () => {
    setVerifyButtonLoading(true);
    const payload = {
      customer_id: customerDetails?.id,
      type: reviewModalTitle.includes("Google") ? "Google" : "Linkedin",
      is_verified: 1,
      verified_by: loginUserId,
      verified_date: formatToBackendIST(new Date()),
    };
    try {
      await verifyReview(payload);
      setTimeout(() => {
        setIsOpenReviewScreenshotModal(false);
        setReviewScreenshot("");
        setReviewModalTitle("");
        setVerifyButtonLoading(false);
        CommonMessage("success", "Review Verified");
        getCustomersData(
          selectedDates[0],
          selectedDates[1],
          searchValue,
          selectedOrigin,
          status,
          allDownliners,
          branchOptions,
          pagination.page,
          pagination.limit,
        );
      }, 300);
    } catch (error) {
      setVerifyButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={20}>
          <Row gutter={12}>
            <Col flex="24%">
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
                  height="32px"
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
                          getCustomersData(
                            selectedDates[0],
                            selectedDates[1],
                            null,
                            selectedOrigin,
                            status,
                            allDownliners,
                            branchOptions,
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
                                selectedOrigin,
                                status,
                                allDownliners,
                                branchOptions,
                                1,
                                pagination.limit,
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
                        <IoFilter size={16} />
                      </Button>
                    </Tooltip>
                  </Flex>
                </div>
              </div>
            </Col>
            {permissions.includes("Lead Executive Filter") && (
              <Col flex="25%">
                <CommonMultiSelectField
                  height="34px"
                  label="Select User"
                  labelMarginTop="1px"
                  labelFontSize="11px"
                  options={subUsers}
                  onChange={handleSelectUser}
                  value={selectedUserId}
                />
              </Col>
            )}
            <Col flex="none">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "nowrap",
                }}
              >
                <div style={{ flex: "0 0 120px" }}>
                  <CommonMuiCustomDatePicker
                    width="280px"
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
                        selectedOrigin,
                        status,
                        allDownliners,
                        branchOptions,
                        1,
                        pagination.limit,
                      );
                    }}
                  />
                </div>
              </div>
            </Col>

            <Col flex="none">
              <Popover
                placement="bottomLeft"
                trigger="click"
                overlayInnerStyle={{
                  padding: 0,
                  borderRadius: "12px",
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e2e8f0",
                }}
                content={
                  <div
                    style={{
                      width: "320px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#f8fafc",
                        borderTopLeftRadius: "12px",
                        borderTopRightRadius: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "600",
                          fontSize: "13px",
                          color: "#0f172a",
                        }}
                      >
                        Advanced Filters
                      </span>
                      <Badge
                        count={1}
                        style={{
                          backgroundColor: "#3b82f6",
                          boxShadow: "0 0 0 2px #f8fafc",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        maxHeight: "420px",
                        overflowY: "auto",
                        padding: "20px",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <CommonSelectField
                          width="100%"
                          height="35px"
                          label="Select Origin"
                          labelMarginTop="0px"
                          labelFontSize="12px"
                          options={[
                            {
                              id: "acte.in",
                              name: "acte.in",
                            },
                            {
                              id: "acte.co.in",
                              name: "acte.co.in",
                            },
                            {
                              id: "learnovita.com",
                              name: "learnovita.com",
                            },
                            {
                              id: "acte.courses",
                              name: "placement7.com",
                            },
                            {
                              id: "linkplux.com",
                              name: "linkplux.com",
                            },
                            {
                              id: "careerfast.in",
                              name: "careerfast.in",
                            },
                            {
                              id: "Google Ads",
                              name: "Google Ads",
                            },
                          ]}
                          onChange={(e) => {
                            setSelectedOrigin(e.target.value);
                            setPagination({
                              page: 1,
                            });
                            getCustomersData(
                              selectedDates[0],
                              selectedDates[1],
                              searchValue,
                              e.target.value,
                              status,
                              allDownliners,
                              branchOptions,
                              1,
                              pagination.limit,
                            );
                          }}
                          value={selectedOrigin}
                          disableClearable={false}
                        />{" "}
                      </div>
                    </div>
                  </div>
                }
              >
                <Button
                  // type="primary"
                  icon={<IoFilter size={15} />}
                  className="leads_advancefilter_button"
                  style={{
                    background: "#fff",
                    borderRadius: "6px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "500",
                    fontSize: "12px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  Filters
                </Button>
              </Popover>
            </Col>
          </Row>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={4}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setIsOpenFilterDrawer(true);
              getTableColumnsData(loginUserId);
            }}
          />

          {permissions.includes("Download Customers Data") && (
            <Tooltip placement="top" title="Download">
              <Button
                className="reports_download_button"
                onClick={() => {
                  const isWithIn30days = isWithin30Days(
                    selectedDates[0],
                    selectedDates[1],
                  );
                  console.log("isWithIn30days", isWithIn30days);
                  // if (isWithIn30days == false) {
                  //   CommonMessage(
                  //     "error",
                  //     "Please choose a date range within 30 days.",
                  //   );
                  //   return;
                  // }
                  const googleReview = {
                    title: "Google Review",
                    key: "google_review",
                    dataIndex: "google_review",
                  };

                  const linkedinReview = {
                    title: "Linkedin Review",
                    key: "linkedin_review",
                    dataIndex: "linkedin_review",
                  };

                  const alterColumns = columns
                    // Remove Action and Review Status columns
                    .filter(
                      (f) =>
                        f.title !== "Action" && f.title !== "Review Status",
                    )
                    // Insert Google Review & Linkedin Review after TR Number
                    .flatMap((col) => {
                      if (col.title === "TR Number") {
                        return [col, googleReview, linkedinReview];
                      }

                      return [col];
                    });
                  console.log("alterColumns", alterColumns);
                  DownloadTableAsCSV(
                    customersData,
                    alterColumns,
                    `${moment(selectedDates[0]).format(
                      "DD-MM-YYYY",
                    )} to ${moment(selectedDates[1]).format("DD-MM-YYYY")} ${
                      status == "" ? "All" : status
                    } Customers.csv`,
                  );
                }}
              >
                <DownloadOutlined size={10} className="download_icon" />
              </Button>
            </Tooltip>
          )}

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
                selectedOrigin,
                null,
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
                selectedOrigin,
                "Form Pending",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
                : status === "Payment Rejected"
                  ? "customers_active_paymentreject_container"
                  : isSwap
                    ? "customers_paymentreject_container"
                    : "customers_awaitfinance_container"
            }
          >
            <div
              // className={
              //   status === "Awaiting Finance"
              //     ? "customers_active_awaitfinance_container"
              //     : "customers_awaitfinance_container"
              // }
              onClick={() => {
                if (
                  status === "Awaiting Finance" ||
                  status === "Payment Rejected"
                ) {
                  return;
                }
                setStatus(isSwap ? "Payment Rejected" : "Awaiting Finance");
                setPagination({
                  page: 1,
                });
                getCustomersData(
                  selectedDates[0],
                  selectedDates[1],
                  searchValue,
                  selectedOrigin,
                  isSwap ? "Payment Rejected" : "Awaiting Finance",
                  allDownliners,
                  branchOptions,
                  1,
                  pagination.limit,
                );
              }}
            >
              {isSwap ? (
                <p>
                  Payment Rejected{" "}
                  {`(  ${
                    customerStatusCount &&
                    customerStatusCount.rejected_payment !== undefined &&
                    customerStatusCount.rejected_payment !== null
                      ? customerStatusCount.rejected_payment
                      : "-"
                  }
 )`}
                </p>
              ) : (
                <p>
                  Payment Verify{" "}
                  {`(  ${
                    customerStatusCount &&
                    customerStatusCount.awaiting_finance !== undefined &&
                    customerStatusCount.awaiting_finance !== null
                      ? customerStatusCount.awaiting_finance
                      : "-"
                  }
 )`}
                </p>
              )}
            </div>
            <MdOutlineSwapVert
              size={19}
              style={{
                cursor: "pointer",
                transition: "transform 0.3s ease",
                transform: isSwap ? "rotate(180deg)" : "rotate(0deg)",
              }}
              onClick={() => {
                setIsSwap((prev) => {
                  const newSwap = !prev;
                  const newStatus = newSwap
                    ? "Payment Rejected"
                    : "Awaiting Finance";
                  console.log("newStatus", newStatus);
                  setStatus(newStatus);
                  getCustomersData(
                    selectedDates[0],
                    selectedDates[1],
                    searchValue,
                    selectedOrigin,
                    newStatus,
                    allDownliners,
                    branchOptions,
                    1,
                    pagination.limit,
                  );
                  return newSwap;
                });
              }}
            />
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
                selectedOrigin,
                "Awaiting Verify",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
            // className={
            //   status === "Awaiting Trainer"
            //     ? "customers_active_assigntrainers_container"
            //     : "customers_assigntrainers_container"
            // }

            className={
              status === "Awaiting Trainer"
                ? "customers_active_assigntrainers_container"
                : status === "Trainer Rejected"
                  ? "customers_active_paymentreject_container"
                  : isAssignTrainerSwap
                    ? "customers_paymentreject_container"
                    : "customers_assigntrainers_container"
            }
          >
            <div
              onClick={() => {
                if (
                  status === "Awaiting Trainer" ||
                  status === "Trainer Rejected"
                ) {
                  return;
                }
                setStatus(
                  isAssignTrainerSwap ? "Trainer Rejected" : "Awaiting Trainer",
                );
                setPagination({
                  page: 1,
                });
                getCustomersData(
                  selectedDates[0],
                  selectedDates[1],
                  searchValue,
                  selectedOrigin,
                  isAssignTrainerSwap ? "Trainer Rejected" : "Awaiting Trainer",
                  allDownliners,
                  branchOptions,
                  1,
                  pagination.limit,
                );
              }}
            >
              {isAssignTrainerSwap ? (
                <p>
                  Trainer Rejected{" "}
                  {`(  ${
                    customerStatusCount &&
                    customerStatusCount.trainer_rejected !== undefined &&
                    customerStatusCount.trainer_rejected !== null
                      ? customerStatusCount.trainer_rejected
                      : "-"
                  }
 )`}
                </p>
              ) : (
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
              )}
            </div>
            <MdOutlineSwapVert
              size={19}
              style={{
                cursor: "pointer",
                transition: "transform 0.3s ease",
                transform: isAssignTrainerSwap
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
              onClick={() => {
                setIsAssignTrainerSwap((prev) => {
                  const newSwap = !prev;
                  const newStatus = newSwap
                    ? "Trainer Rejected"
                    : "Awaiting Trainer";
                  console.log("newStatus", newStatus);
                  setStatus(newStatus);
                  getCustomersData(
                    selectedDates[0],
                    selectedDates[1],
                    searchValue,
                    selectedOrigin,
                    newStatus,
                    allDownliners,
                    branchOptions,
                    1,
                    pagination.limit,
                  );
                  return newSwap;
                });
              }}
            />
          </div>

          <div
            className={
              status === "Awaiting Trainer Verify"
                ? "customers_active_verifytrainers_container"
                : status === "Approval Rejected"
                  ? "customers_active_paymentreject_container"
                  : isApprovalTrainerSwap
                    ? "customers_paymentreject_container"
                    : "customers_verifytrainers_container"
            }
            onClick={() => {
              if (
                status === "Awaiting Trainer Verify" ||
                status === "Approval Rejected"
              ) {
                return;
              }
              setStatus(
                isApprovalTrainerSwap
                  ? "Approval Rejected"
                  : "Awaiting Trainer Verify",
              );
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                selectedOrigin,
                isApprovalTrainerSwap
                  ? "Approval Rejected"
                  : "Awaiting Trainer Verify",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
              );
            }}
          >
            {isApprovalTrainerSwap ? (
              <p>
                Approval Rejected{" "}
                {`(  ${
                  customerStatusCount &&
                  customerStatusCount.approval_rejected !== undefined &&
                  customerStatusCount.approval_rejected !== null
                    ? customerStatusCount.approval_rejected
                    : "-"
                }
 )`}
              </p>
            ) : (
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
            )}

            <MdOutlineSwapVert
              size={19}
              style={{
                cursor: "pointer",
                transition: "transform 0.3s ease",
                transform: isApprovalTrainerSwap
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
              onClick={() => {
                setIsApprovalTrainerSwap((prev) => {
                  const newSwap = !prev;
                  const newStatus = newSwap
                    ? "Approval Rejected"
                    : "Awaiting Trainer Verify";
                  console.log("newStatus", newStatus);
                  setStatus(newStatus);
                  getCustomersData(
                    selectedDates[0],
                    selectedDates[1],
                    searchValue,
                    selectedOrigin,
                    newStatus,
                    allDownliners,
                    branchOptions,
                    1,
                    pagination.limit,
                  );
                  return newSwap;
                });
              }}
            />
          </div>

          <div
            className={
              status === "Trainer Approval"
                ? "customers_active_trainerapproval_container"
                : "customers_trainerapproval_container"
            }
            onClick={() => {
              if (status === "Trainer Approval") {
                return;
              }
              setStatus("Trainer Approval");
              setPagination({
                page: 1,
              });
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                selectedOrigin,
                "Trainer Approval",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
              );
            }}
          >
            <p>
              Trainer Approval{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.trainer_approval !== undefined &&
                customerStatusCount.trainer_approval !== null
                  ? customerStatusCount.trainer_approval
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
                selectedOrigin,
                "Awaiting Class",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
                selectedOrigin,
                "Class Scheduled",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
                selectedOrigin,
                "Class Going",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
                selectedOrigin,
                "Passedout Process",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
                selectedOrigin,
                "Completed",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
                selectedOrigin,
                "Escalated",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
                selectedOrigin,
                "Others",
                allDownliners,
                branchOptions,
                1,
                pagination.limit,
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
        title="Customer Details"
        open={isOpenDetailsDrawer}
        onClose={() => {
          setIsOpenDetailsDrawer(false);
          setCustomerId(null);
        }}
        width="50%"
        style={{ position: "relative" }}
      >
        {isOpenDetailsDrawer ? (
          <ParticularCustomerDetails customerId={customerId} />
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
          callgetCustomersApi={() => {
            setPagination({
              page: 1,
            });
            getCustomersData(
              selectedDates[0],
              selectedDates[1],
              searchValue,
              selectedOrigin,
              status,
              allDownliners,
              branchOptions,
              pagination.page,
              pagination.limit,
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
        title={
          drawerContentStatus == "Re-Assign Trainer"
            ? "Re-Assign Trainer"
            : drawerContentStatus == "Pre Certificate"
              ? "Generate Certificate"
              : "Update Status"
        }
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
        {isStatusUpdateDrawerLoading ? (
          <div style={{ padding: "24px" }}>
            <div className="customer_profileContainer">
              <Skeleton.Avatar active size={90} shape="circle" />
              <div style={{ marginLeft: "20px", flex: 1 }}>
                <Skeleton
                  active
                  paragraph={{ rows: 2 }}
                  title={{ width: 150 }}
                />
              </div>
            </div>

            <Row gutter={16} style={{ marginTop: "30px" }}>
              <Col span={12}>
                {[1, 2, 3, 4].map((i) => (
                  <Row key={i} style={{ marginTop: i === 1 ? "0" : "12px" }}>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>
              <Col span={12}>
                {[1, 2, 3, 4].map((i) => (
                  <Row key={i} style={{ marginTop: i === 1 ? "0" : "12px" }}>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>

            <div
              className="customerdetails_coursecard"
              style={{ marginTop: "30px" }}
            >
              <div className="customerdetails_coursecard_headercontainer">
                <Skeleton.Input active size="small" style={{ width: 150 }} />
              </div>
              <div
                className="customerdetails_coursecard_contentcontainer"
                style={{ padding: "20px" }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Row
                        key={i}
                        style={{ marginTop: i === 1 ? "0" : "12px" }}
                      >
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "80%" }}
                          />
                        </Col>
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "100%" }}
                          />
                        </Col>
                      </Row>
                    ))}
                  </Col>
                  <Col span={12}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Row
                        key={i}
                        style={{ marginTop: i === 1 ? "0" : "12px" }}
                      >
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "80%" }}
                          />
                        </Col>
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "100%" }}
                          />
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="customer_statusupdate_drawer_profileContainer">
              {customerDetails && customerDetails.profile_image ? (
                <Upload
                  listType="picture-circle"
                  fileList={[
                    {
                      uid: "-1",
                      name: "profile.jpg",
                      status: "done",
                      url: customerDetails.profile_image, // Base64 string directly usable
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
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.name
                          ? customerDetails.name
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
                        customerDetails && customerDetails.email
                          ? customerDetails.email
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
                      <p className="customerdetails_rowheading">
                        Lead Executive
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={`${
                        customerDetails && customerDetails.lead_assigned_to_id
                          ? customerDetails.lead_assigned_to_id
                          : "-"
                      } (${
                        customerDetails && customerDetails.lead_assigned_to_name
                          ? customerDetails.lead_assigned_to_name
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
                        customerDetails && customerDetails.course_name
                          ? customerDetails.course_name
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
                      {customerDetails && customerDetails.total_amount
                        ? "₹" + customerDetails.total_amount
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
                      <p className="customerdetails_rowheading">Branch</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.branch_name
                          ? customerDetails.branch_name
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
              </Col>
            </Row>

            <Divider className="customer_statusupdate_divider" />

            {drawerContentStatus === "Pre Certificate" ? (
              <>
                <PreCertificate
                  ref={preCertificateRef}
                  customerDetails={customerDetails}
                  setUpdateButtonLoading={setUpdateButtonLoading}
                  callgetCustomersApi={() => {
                    updateStatusDrawerReset();
                  }}
                />
              </>
            ) : (
              ""
            )}
          </>
        )}

        {/* footer */}
        {drawerContentStatus === "Finance Verify" ||
        drawerContentStatus === "Update Payment" ? (
          ""
        ) : (
          <div className="leadmanager_tablefiler_footer">
            <div className="leadmanager_submitlead_buttoncontainer">
              {drawerContentStatus === "Trainer Verify" ||
              drawerContentStatus === "Trainer Approval" ? (
                <>
                  {rejectbuttonLoader ? (
                    <button className="customer_trainerreject_loadingbutton">
                      <CommonSpinner />
                    </button>
                  ) : (
                    <button
                      className="customer_trainerreject_button"
                      onClick={() =>
                        assignAndVerifyTrainerRef.current?.handleRejectTrainer()
                      }
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
                      onClick={() =>
                        passedOutProcessRef.current?.handleCompleteProcess()
                      }
                    >
                      Update And Issue Certificate
                    </button>
                  )}
                </>
              ) : drawerContentStatus === "Add G-Review" ? (
                <>
                  {stepIndex > 0 && (
                    <Button
                      onClick={prev}
                      style={{ marginRight: 12 }}
                      className="customer_stepperbuttons"
                    >
                      Previous
                    </Button>
                  )}
                  {stepIndex == 2 && (
                    <>
                      {linkedinLoading ? (
                        <Button className="customer_loading_linkedin_update_button">
                          <CommonSpinner />
                        </Button>
                      ) : (
                        <Button
                          className="customer_linkedin_update_button"
                          onClick={() =>
                            passedOutProcessRef.current?.handleLinkedinReview()
                          }
                        >
                          Update Linkedin
                        </Button>
                      )}
                    </>
                  )}
                  {stepIndex < 3 && (
                    <>
                      {updateButtonLoading ? (
                        <Button
                          className={
                            stepIndex == 2
                              ? "customer_complete_loadingpassedoutbutton"
                              : "customer_stepperbuttons"
                          }
                        >
                          <CommonSpinner />
                        </Button>
                      ) : (
                        <Button
                          onClick={
                            stepIndex == 0
                              ? () =>
                                  passedOutProcessRef.current?.handleGoogleReview()
                              : stepIndex == 1
                                ? () =>
                                    passedOutProcessRef.current?.handleCertificateDetails()
                                : stepIndex == 2
                                  ? () =>
                                      passedOutProcessRef.current?.handleCompleteProcess()
                                  : ""
                          }
                          className={
                            stepIndex == 2
                              ? "customer_complete_passedoutbutton"
                              : "customer_stepperbuttons"
                          }
                        >
                          {stepIndex == 2 ? "Move to Completed" : "Next"}
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
                          ? () =>
                              studentVerifyRef.current?.handleStudentVerify()
                          : drawerContentStatus === "Assign Trainer"
                            ? () =>
                                assignAndVerifyTrainerRef.current?.handleAssignTrainer()
                            : drawerContentStatus === "Re-Assign Trainer"
                              ? () =>
                                  reAssignTrainerRef.current?.handleReAssignTrainer()
                              : drawerContentStatus === "Trainer Verify" ||
                                  drawerContentStatus === "Trainer Approval"
                                ? () =>
                                    assignAndVerifyTrainerRef.current?.openTrainerVerifyModal()
                                : drawerContentStatus === "Class Schedule"
                                  ? () =>
                                      classScheduleRef.current?.handleClassSchedule()
                                  : drawerContentStatus === "Class Going"
                                    ? () =>
                                        classScheduleRef.current?.handleUpdateClassGoing()
                                    : drawerContentStatus === "Add G-Review"
                                      ? () =>
                                          passedOutProcessRef.current?.handleGoogleReview()
                                      : drawerContentStatus ===
                                          "Pre Certificate"
                                        ? () =>
                                            preCertificateRef.current?.handleGeneratePreCert()
                                        : drawerContentStatus === "Others"
                                          ? () =>
                                              othersHandlingRef.current?.handleSubmit()
                                          : handleStatusMismatch
                      }
                    >
                      {drawerContentStatus === "Assign Trainer"
                        ? "Assign"
                        : drawerContentStatus === "Trainer Approval"
                          ? "Approve"
                          : drawerContentStatus === "Re-Assign Trainer"
                            ? "Re-Assign"
                            : drawerContentStatus === "Class Going" ||
                                drawerContentStatus === "Class Schedule" ||
                                drawerContentStatus === "Add G-Review" ||
                                drawerContentStatus === "Others"
                              ? "Update"
                              : drawerContentStatus == "Pre Certificate"
                                ? "Generate"
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
        onClose={formReset}
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
                          },
                        );
                        const bothFalse = updateBranchData.every(
                          (item) => item.checked === false,
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
              onClick={async () => {
                const visibleColumns = columns.filter((col) => col.isChecked);
                console.log("visibleColumns", visibleColumns);
                setTableColumns(visibleColumns);
                setIsOpenFilterDrawer(false);

                const payload = {
                  user_id: loginUserId,
                  id: updateTableId,
                  page_name: "Admissions",
                  column_names: columns,
                };
                setBranchOptions(duplicateBranchOptions);
                getCustomersData(
                  selectedDates[0],
                  selectedDates[1],
                  searchValue,
                  selectedOrigin,
                  status,
                  allDownliners,
                  duplicateBranchOptions,
                  pagination.page,
                  pagination.limit,
                );
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

      {/* view certificate modal */}
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

      {/* customer history drawer */}
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

      {/* form modal */}
      <Modal
        open={isOpenFormModal}
        onCancel={() => {
          setIsOpenFormModal(false);
          setCustomerDetails(null);
        }}
        footer={false}
        width="64%"
        style={{ marginBottom: "20px", top: 10 }}
        className="customer_downloadform_modal"
        zIndex={1100}
        // centered={true}
        closeIcon={
          <span
            style={{
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            <CloseOutlined />
          </span>
        }
      >
        <DownloadRegistrationForm customerDetails={customerDetails} />
      </Modal>

      {/* review screenshot modal */}
      <Modal
        title={reviewModalTitle}
        open={isOpenReviewScreenshotModal}
        onCancel={() => {
          setIsOpenReviewScreenshotModal(false);
          setReviewScreenshot("");
          setReviewModalTitle("");
          setVerifyButtonLoading(false);
          setCustomerDetails(null);
        }}
        // footer={false}
        footer={
          permissions.includes("Review Verify")
            ? [
                <div style={{ marginTop: "20px" }}>
                  {verifyButtonLoading ? (
                    <Button
                      key="create"
                      type="primary"
                      className="leads_coursemodal_loading_createbutton"
                    >
                      <CommonSpinner />
                    </Button>
                  ) : (
                    <>
                      {reviewModalTitle.includes("Google") &&
                      customerDetails?.is_google_verified == 1 ? (
                        ""
                      ) : reviewModalTitle.includes("LinkedIn") &&
                        customerDetails?.is_linkedin_verified == 1 ? (
                        ""
                      ) : (
                        <Button
                          key="create"
                          type="primary"
                          className="leads_coursemodal_createbutton"
                          onClick={handleVerifyReview}
                        >
                          Verify
                        </Button>
                      )}
                    </>
                  )}
                </div>,
              ]
            : false
        }
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
