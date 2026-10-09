import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuMessageCircleMore } from "react-icons/lu";
import { IoMdNotificationsOutline } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import {
  Row,
  Col,
  Button,
  Dropdown,
  Space,
  Tooltip,
  Radio,
  Flex,
  Spin,
  Drawer,
  Divider,
  Upload,
  Modal,
  Input,
} from "antd";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { PiShareFat } from "react-icons/pi";
import { GoCopy } from "react-icons/go";
import GmailIcon from "../../assets/gmail_icon.png";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { FcManager } from "react-icons/fc";
import { AiOutlineLogout } from "react-icons/ai";
import { MdAutorenew } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { RiErrorWarningFill } from "react-icons/ri";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import "./styles.css";
import {
  changePassword,
  getCustomerById,
  getCustomerFullHistory,
  getLeadById,
  getNotifications,
  getTechnologies,
  getUsers,
  globalFilter,
  readNotification,
} from "../ApiService/action";
import { BiCommentDetail } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { LuCircleUser } from "react-icons/lu";
import { PiShield } from "react-icons/pi";
import { IoTicketOutline } from "react-icons/io5";
import moment from "moment";
import CustomerHistory from "../Customers/CustomerHistory";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import ViewLeadDetails from "../Lead/ViewLeadDetails";
import {
  confirmPasswordValidator,
  getRegionNameByUserId,
  passwordValidator,
  shortRelativeTime,
} from "../Common/Validation";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CommonMessage } from "../Common/CommonMessage";
import NotificationImage from "../../assets/bell-colored.svg";
import { NotificationContext } from "../../Context/NotificationContext";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import { useSelector } from "react-redux";

export default function CustomHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const loginUserProfileImage = useSelector(
    (state) => state.loginuserprofilebase64,
  );

  const [userName, setUserName] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterType, setFilterType] = useState(1);
  const [leadData, setLeadData] = useState([]);
  const [isOpenSearchOptions, setIsOpenSearchOptions] = useState(true);
  const [isOpenLeadDetailsDrawer, setIsOpenLeadDetailsDrawer] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  //course search
  const [courseSearchValue, setCourseSearchValue] = useState("");
  const [courseData, setCourseData] = useState([]);
  const [isOpenCourseSearchOptions, setIsOpenCourseSearchOptions] =
    useState(true);
  const [sharingItemId, setSharingItemId] = useState(null);

  //notification
  const [isOpenNotificationsDrawer, setIsOpenNotificationsDrawer] =
    useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    label: "",
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  //change password
  const [isOpenChangePasswordDrawer, setIsOpenChangePasswordDrawer] =
    useState(false);
  const [profileName, setProfileName] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordValidationTrigger, setPasswordValidationTrigger] =
    useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  //profile image usestates
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Share Modal states
  const [isOpenShareModal, setIsOpenShareModal] = useState(false);
  const [shareTemplateText, setShareTemplateText] = useState("");
  const [currentShareItem, setCurrentShareItem] = useState(null);
  const [currentSharePlatform, setCurrentSharePlatform] = useState("");
  const [isOpenProfileDrawer, setIsOpenProfileDrawer] = useState(false);
  const [loginUserDetails, setLoginUserDetails] = useState(null);

  const { notifications, unreadCount, setUnreadCount, logout } =
    useContext(NotificationContext);

  useEffect(() => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);
    if (converAsJson) {
      setUserName(converAsJson?.user_name || "");
    } else {
      setUserName("-");
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleNewSocketNotification = (event) => {
      const newNotif = event.detail;
      console.log("Adding new real-time notification to list:", newNotif);
      setNotificationData((prev) => [newNotif, ...prev]);
    };

    window.addEventListener("socket_notification", handleNewSocketNotification);
    return () => {
      window.removeEventListener(
        "socket_notification",
        handleNewSocketNotification,
      );
    };
  }, []);

  const getLoginUserDetailsData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      keyword: convertAsJson?.user_id || "",
    };
    try {
      const response = await getUsers(payload);
      console.log("login user details", response);
      const profile_details = response?.data?.data?.data[0] || null;
      setLoginUserDetails(profile_details);
      setIsOpenProfileDrawer(true);
    } catch (error) {
      console.log("login user details error");
    }
  };

  const handleLogout = () => {
    logout(); // 🚀 Disconnect socket and clear state
    localStorage.removeItem("AccessToken");
    localStorage.removeItem("loginUserDetails");
    sessionStorage.clear();
    navigate("/login");
  };
  const items = [
    {
      key: "1",
      label: (
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            fontSize: "13px",
          }}
          // onClick={() => {
          //   const getLoginUserDetails =
          //     localStorage.getItem("loginUserDetails");
          //   const convertAsJson = JSON.parse(getLoginUserDetails);
          //   setLoginUserDetails(convertAsJson);
          //   setIsOpenProfileDrawer(true);
          // }}
          onClick={getLoginUserDetailsData}
        >
          <LuCircleUser size={14} />
          <p>View Profile</p>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            fontSize: "13px",
          }}
          onClick={() => {
            setIsOpenChangePasswordDrawer(true);
            const getLoginUserDetails =
              localStorage.getItem("loginUserDetails");
            const convertAsJson = JSON.parse(getLoginUserDetails);
            setProfileName(convertAsJson?.user_name);
          }}
        >
          <PiShield size={14} />
          <p>Change Password</p>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            fontSize: "13px",
          }}
          onClick={handleLogout}
        >
          <AiOutlineLogout size={14} />
          <p>Logout</p>
        </div>
      ),
    },
  ];

  const getAllLeadData = async (searchvalue) => {
    setSearchLoading(true);
    try {
      const response = await globalFilter(searchvalue);
      console.log("global lead response", response);
      setLeadData(response?.data?.result || []);
    } catch (error) {
      setLeadData([]);
      console.log("get leads error");
    } finally {
      setTimeout(() => {
        setSearchLoading(false);
      }, 300);
    }
  };

  const getCourseData = async (searchvalue) => {
    const payload = {
      ...(searchvalue && { name: searchvalue }),
    };
    try {
      const response = await getTechnologies(payload);
      setCourseData(response?.data?.data || []);
    } catch (error) {
      setCourseData([]);
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        setSearchLoading(false);
      }, 300);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setIsOpenSearchOptions(true);
    setSearchLoading(true);
    if (e.target.value === "") {
      setLeadData([]);
      setSearchLoading(false);
      return;
    }
    setTimeout(() => {
      getAllLeadData(e.target.value);
    }, 300);
  };

  const handleCourseSearch = (e) => {
    setCourseSearchValue(e.target.value);
    setIsOpenCourseSearchOptions(true);
    setSearchLoading(true);
    if (e.target.value === "") {
      setCourseData([]);
      setSearchLoading(false);
      return;
    }
    setTimeout(() => {
      getCourseData(e.target.value);
    }, 300);
  };

  const fetchLeadDetails = async (lead_id) => {
    try {
      const res = await getLeadById(lead_id);
      console.log("particular lead details", res);
      if (res?.data?.data) {
        setLeadDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
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

  const handleChangePassword = async () => {
    setPasswordValidationTrigger(true);
    const oldPasswordValidate = passwordValidator(oldPassword);
    const newPasswordValidate = passwordValidator(newPassword);
    const confirmPasswordValidate = confirmPasswordValidator(
      newPassword,
      confirmPassword,
    );

    setOldPasswordError(oldPasswordValidate);
    setNewPasswordError(newPasswordValidate);
    setConfirmPasswordError(confirmPasswordValidate);

    if (oldPasswordValidate || newPasswordValidate || confirmPasswordValidate)
      return;

    setPasswordLoading(true);

    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      currentPassword: oldPassword,
      newPassword: newPassword,
    };
    try {
      await changePassword(payload);
      setTimeout(() => {
        CommonMessage("success", "Password Updated");
        passwordDrawerReset();
      }, 300);
    } catch (error) {
      setPasswordLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const getNotificationData = async (page_number) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    const payload = {
      user_id: convertAsJson?.user_id,
      page: page_number,
    };
    try {
      const response = await getNotifications(payload);
      console.log("notification response", response);
      const data = response?.data?.data || [];
      const paginations = response?.data?.pagination;
      setPagination({
        page: paginations.page,
        label: paginations.label,
        limit: paginations.limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
      });
      setNotificationData(data);
    } catch (error) {
      setNotificationData([]);
      console.log("notification error", error);
    }
  };

  const handleMarkAsRead = async (item) => {
    const payload = {
      id: item.id,
    };
    try {
      await readNotification(payload);
      if (item.is_read === 0) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setIsOpenNotificationsDrawer(false);
      setTimeout(() => {
        handleNotification(item);
        getNotificationData(pagination.page);
      }, 300);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleNotification = (item) => {
    const message = JSON.parse(item.message);

    if (item.title == "Server Raised") {
      const serverFilterData = {
        searchValue: message.customer_phone,
        startDate: moment(message.customer_raise_date).format("YYYY-MM-DD"),
        endDate: moment(message.customer_raise_date).format("YYYY-MM-DD"),
        status: "Server Raised",
      };

      if (location.pathname === "/server") {
        window.dispatchEvent(
          new CustomEvent("serverNotificationFilter", {
            detail: serverFilterData,
          }),
        );
        setIsOpenNotificationsDrawer(false);
      }
      navigate("/server", { state: serverFilterData });
      return;
    }

    if (item.title == "Trainer Payment Rejected") {
      const trainerPaymentFilterData = {
        searchValue: message.trainer_id,
        bill_raisedate: moment(message.bill_raisedate).format("YYYY-MM-DD"),
        status: "Payment Rejected",
      };

      if (location.pathname === "/trainer-payment") {
        window.dispatchEvent(
          new CustomEvent("trainerPaymentNotificationFilter", {
            detail: trainerPaymentFilterData,
          }),
        );
        setIsOpenNotificationsDrawer(false);
      }
      navigate("/trainer-payment", { state: trainerPaymentFilterData });
      return;
    }

    if (
      item.title == "Ticket Assigned" ||
      item.title == "New comment added to the ticket"
    ) {
      console.log("ticketss notifyyyyy", message);

      const ticketFilterData = {
        startDate: moment(message.ticket_created_date).format("YYYY-MM-DD"),
        endDate: moment(message.ticket_created_date).format("YYYY-MM-DD"),
      };

      if (location.pathname === "/tickets") {
        window.dispatchEvent(
          new CustomEvent("serverNotificationFilter", {
            detail: ticketFilterData,
          }),
        );
        setIsOpenNotificationsDrawer(false);
      }
      navigate("/tickets", { state: ticketFilterData });
      return;
    }

    if (item.title == "Payment Rejected") {
      const accountsFilterData = {
        activeBucket: "Received",
        startDate:
          message.customer_last_payment_date || message.customer_created_date,
        endDate:
          message.customer_last_payment_date || message.customer_created_date,
      };

      if (location.pathname === "/accounts") {
        window.dispatchEvent(
          new CustomEvent("accountsNotificationFilter", {
            detail: accountsFilterData,
          }),
        );
        setIsOpenNotificationsDrawer(false);
      }
      navigate("/accounts", { state: accountsFilterData });
      return;
    }

    const filterData = {
      status:
        item.title == "Trainer Rejected"
          ? "Trainer Rejected"
          : "Payment Rejected",
      startDate:
        item.title === "Payment Rejected"
          ? message.customer_last_payment_date || message.customer_created_date
          : message.customer_created_date,
      endDate:
        item.title === "Payment Rejected"
          ? message.customer_last_payment_date || message.customer_created_date
          : message.customer_created_date,
      payment_swap: true,
    };

    if (location.pathname === "/postsales") {
      window.dispatchEvent(
        new CustomEvent("notificationFilter", { detail: filterData }),
      );
      setIsOpenNotificationsDrawer(false);
      return;
    }
    console.log("Hiiiiiiiiiiiiiiiiiiee");
    navigate("/postsales", { state: filterData });
    setIsOpenNotificationsDrawer(false);
  };

  const passwordDrawerReset = () => {
    setIsOpenChangePasswordDrawer(false);
    setPasswordLoading(false);
    setOldPassword("");
    setOldPasswordError("");
    setNewPassword("");
    setNewPasswordError("");
    setConfirmPassword("");
    setConfirmPasswordError("");
    setPasswordValidationTrigger(false);
    //notifications
    setIsOpenNotificationsDrawer(false);
    setNotificationData([]);
  };

  const buildShareText = (item) => {
    const raw = localStorage.getItem("loginUserDetails");
    const user = raw ? JSON.parse(raw) : null;

    const price = Number(item.price).toLocaleString("en-IN");
    const offer = Number(item.offer_price).toLocaleString("en-IN");
    const total = (Number(item.offer_price) * 1.18).toLocaleString("en-IN");
    const advisorName = user?.user_name || "[Advisor Name]";
    const advisorPhone = user?.mobile || "[Advisor Phone Number]";

    return `Dear [Customer Name],

Greetings from *ACTE Technologies!* 👋

Thank you for showing interest in our *${item.name} Training Program*. Please find the key details of the training below.

📘 *Course Fee*
• Standard Fee: *₹${price} + 18% GST*
• *Offer Fee:* ₹${offer} + 18% GST = *₹${total}* (Applicable for the upcoming batch)
• *One-to-One / Fast Track Training:* + ₹2,000

📅 *Batch Start Date*
• Weekday Batch – [Date]
• Weekend Batch – [Date]

⏱ *Course Duration*
• *30–45 Hours (Approx.)*
• *Mode:* Live Instructor-Led Online Training

🎓 *Training Benefits*
• Experienced Corporate Trainers
• Recorded Sessions & Study Materials
• Lifetime Student Portal Access
• Resume Preparation & Interview Assistance
• Course Completion Certificate

💳 *Enrollment Process*
Kindly complete your enrollment using the *Razorpay payment link* and share the *payment screenshot* for confirmation.

After payment completion:
• Joining form will be sent to your email
• Student ID will be created
• Batch & trainer details will be shared by our scheduling team

⚠ *Important Note:*
Enrollment and class joining should not be on the same date. Kindly complete the enrollment *24–48 hours before the batch start date* so that we can arrange your session smoothly.

If you have any questions regarding the *course syllabus, batch timings, or offers*, please feel free to contact us.

📞 *Phone:* ${advisorPhone}
📧 *Email:* contact@acte.in

We look forward to supporting you in your *learning journey with ACTE Technologies.*

Best Regards,
*${advisorName}*
Course Advisor
*ACTE Technologies*`;
  };

  const copyCourseText = async (item) => {
    try {
      const text = buildShareText(item);
      await navigator.clipboard.writeText(text);

      // optional success message
      CommonMessage("success", "Copied");
    } catch (err) {
      CommonMessage("error", "Copied failed");
    }
  };

  const handleShare = async (item, sharePlatform) => {
    setCurrentShareItem(item);
    setCurrentSharePlatform(sharePlatform);
    setShareTemplateText(buildShareText(item));
    setIsOpenShareModal(true);
  };

  const proceedWithShare = async () => {
    const item = currentShareItem;
    const sharePlatform = currentSharePlatform;
    const shareText = shareTemplateText;

    if (sharePlatform === "whatsapp") {
      const itemId = item.id || item.name;

      // Proper URLs (use correct properties)
      const brouchuresPdfUrl =
        item.brouchures && item.brouchures.toLowerCase().endsWith(".pdf")
          ? `${import.meta.env.VITE_API_URL}${item.brouchures}`
          : null;

      const syllabusPdfUrl =
        item.syllabus && item.syllabus.toLowerCase().endsWith(".pdf")
          ? `${import.meta.env.VITE_API_URL}${item.syllabus}`
          : null;

      setSharingItemId(itemId);

      try {
        const filesToShare = [];

        // Fetch brochure if URL exists
        if (brouchuresPdfUrl) {
          const brouchureResponse = await fetch(brouchuresPdfUrl);
          if (brouchureResponse.ok) {
            const brouchureBlob = await brouchureResponse.blob();
            filesToShare.push(
              new File([brouchureBlob], `${item.name}_Brouchure.pdf`, {
                type: "application/pdf",
              }),
            );
          }
        }

        // Fetch syllabus if URL exists
        if (syllabusPdfUrl) {
          const syllabusResponse = await fetch(syllabusPdfUrl);
          if (syllabusResponse.ok) {
            const syllabusBlob = await syllabusResponse.blob();
            filesToShare.push(
              new File([syllabusBlob], `${item.name}_Syllabus.pdf`, {
                type: "application/pdf",
              }),
            );
          }
        }

        // Copy message as fallback
        try {
          await navigator.clipboard.writeText(shareText);
        } catch (err) {
          console.error("Clipboard copy failed:", err);
        }

        // share text with files if available
        if (
          navigator.canShare &&
          filesToShare.length > 0 &&
          navigator.canShare({ files: filesToShare })
        ) {
          await navigator.share({
            files: filesToShare,
            title: item.name,
            text: shareText,
          });

          setSharingItemId(null);
          return;
        }

        // share text only if no files or canShare files is not supported
        if (navigator.share) {
          await navigator.share({
            title: item.name,
            text: shareText,
          });
          setSharingItemId(null);
          return;
        }
      } catch (error) {
        console.error("Error sharing:", error);
      } finally {
        setSharingItemId(null);
      }

      // Fallback for desktop
      const text = encodeURIComponent(shareText);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    } else if (sharePlatform == "gmail") {
      const subject = encodeURIComponent(item.name);
      const body = encodeURIComponent(shareText);

      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
        "_blank",
      );
    }
    setIsOpenShareModal(false);
  };

  return (
    <div className="header_maincontainer">
      <div className="header_innercontainer">
        {/* left div */}
        <div className="header_titleContainer">
          <p className="header_pagetitle">
            {location.pathname === "/dashboard"
              ? "Dashboard"
              : location.pathname === "/leads"
                ? "Leads"
                : location.pathname === "/leads/add-lead"
                  ? "Add Lead"
                  : location.pathname === "/presales"
                    ? "Pre Sales"
                    : location.pathname === "/accounts"
                      ? "Accounts"
                      : location.pathname === "/lead-followup"
                        ? "Lead Followup"
                        : location.pathname === "/postsales"
                          ? "Post Sales"
                          : location.pathname === "/admissions"
                            ? "Admissions"
                            : location.pathname === "/fee-pending-customers"
                              ? "Fee Pending Customers"
                              : location.pathname === "/batchmanagement"
                                ? "Batch Management"
                                : location.pathname === "/bulk-search"
                                  ? "Bulk Search"
                                  : location.pathname === "/trainers"
                                    ? "Trainers"
                                    : location.pathname === "/trainer-payment"
                                      ? "Trainer Payment"
                                      : location.pathname === "/server"
                                        ? "Server"
                                        : location.pathname === "/placement"
                                          ? "Placement"
                                          : location.pathname === "/tickets"
                                            ? "Tickets"
                                            : location.pathname === "/settings"
                                              ? "Settings"
                                              : location.pathname === "/reports"
                                                ? "Reports"
                                                : ""}
          </p>
        </div>

        {/* right div */}
        <div style={{ display: "flex" }}>
          <div className="header_searchbar_container">
            <input
              className="header_searchbar"
              placeholder="Fees Search"
              onChange={handleCourseSearch}
              value={courseSearchValue}
              onBlur={() => {
                setTimeout(() => {
                  setIsOpenCourseSearchOptions(false);
                }, 300);
              }}
              onFocus={() => {
                setIsOpenCourseSearchOptions(true);
              }}
            />
            <CiSearch className="header_searchbar_icon" />
            <div
              className={
                courseSearchValue && isOpenCourseSearchOptions
                  ? "header_search_options_container"
                  : "header_search_options_hidecontainer"
              }
              // className="header_search_options_container"
            >
              {searchLoading ? (
                <div className="header_search_loader_container">
                  <Spin size="small" style={{ paddingTop: "0px" }} />
                </div>
              ) : (
                <>
                  {courseData.length >= 1 ? (
                    <>
                      {courseData.map((item, index) => {
                        return (
                          <React.Fragment key={index}>
                            <div className="header_search_course_card">
                              {/* Course Name */}

                              <div className="header_search_title_row">
                                <p className="header_search_course_name">
                                  {item.name}
                                </p>

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    flexShrink: 0,
                                  }}
                                >
                                  {/* ----------copy tooltip---------- */}
                                  <Tooltip placement="bottom" title="Copy">
                                    <GoCopy
                                      size={14}
                                      style={{ cursor: "pointer" }}
                                      onClick={() => copyCourseText(item)}
                                    />
                                  </Tooltip>

                                  {/* ----------share tooltip---------- */}
                                  {/* <Tooltip
                                    placement="bottom"
                                    color="#fff"
                                    title={
                                      <>
                                        <Row
                                          gutter={12}
                                          style={{ alignItems: "center" }}
                                        >
                                          <Col span={12}>
                                            {sharingItemId ===
                                            (item.id || item.name) ? (
                                              <Spin
                                                size="small"
                                                style={{ marginTop: "3px" }}
                                              />
                                            ) : (
                                              <BsWhatsapp
                                                size={14}
                                                color="green"
                                                style={{
                                                  cursor: "pointer",
                                                  marginTop: "3px",
                                                }}
                                                onClick={() =>
                                                  handleShare(item, "whatsapp")
                                                }
                                              />
                                            )}
                                          </Col>
                                          <Col span={12}>
                                            <img
                                              src={GmailIcon}
                                              style={{
                                                width: "14px",
                                                height: "14px",
                                                cursor: "pointer",
                                                marginTop: "-6px",
                                              }}
                                              onClick={() =>
                                                handleShare(item, "gmail")
                                              }
                                            />
                                          </Col>
                                        </Row>
                                      </>
                                    }
                                    styles={{
                                      body: {
                                        backgroundColor: "#fff", // Tooltip background
                                        color: "#333", // Tooltip text color
                                        fontWeight: 500,
                                        fontSize: "13px",
                                        width: "100%",
                                      },
                                    }}
                                  >
                                    <PiShareFat
                                      size={14}
                                      style={{ cursor: "pointer" }}
                                    />
                                  </Tooltip> */}
                                  <Tooltip
                                    placement="bottom"
                                    title="Share on Whatsapp"
                                  >
                                    <BsWhatsapp
                                      size={14}
                                      color="green"
                                      style={{
                                        cursor: "pointer",
                                        marginTop: "0px",
                                      }}
                                      onClick={() =>
                                        handleShare(item, "whatsapp")
                                      }
                                    />
                                  </Tooltip>

                                  <Tooltip
                                    placement="bottom"
                                    title="Share on Gmail"
                                  >
                                    <img
                                      src={GmailIcon}
                                      style={{
                                        width: "14px",
                                        height: "14px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => handleShare(item, "gmail")}
                                    />
                                  </Tooltip>
                                </div>
                              </div>

                              {/* Price Row */}
                              <div className="header_search_price_row">
                                <div>
                                  <span className="label">Actual Price</span>
                                  <span className="value">
                                    {Number(item.price).toLocaleString(
                                      "en-IN",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )}
                                  </span>
                                </div>

                                <div>
                                  <span className="label">Offer Price</span>
                                  <span className="value offer">
                                    {Number(item.offer_price).toLocaleString(
                                      "en-IN",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Links Row */}
                              <div className="header_search_price_row">
                                <div>
                                  <p
                                    className="label"
                                    style={{ fontSize: "11px" }}
                                  >
                                    Server:{" "}
                                    <span
                                      style={{
                                        fontWeight: "700",
                                        color: "#333",
                                      }}
                                    >
                                      {item.is_server === 1
                                        ? Number(item.server_amount || 0) > 0
                                          ? Number(
                                              item.server_amount,
                                            ).toLocaleString("en-IN")
                                          : "Available"
                                        : "NA"}
                                    </span>
                                  </p>
                                </div>
                                <div className="header_search_link_row">
                                  {item.brouchures && (
                                    <a
                                      href={`${import.meta.env.VITE_API_URL}${item.brouchures}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Open Brouchure
                                    </a>
                                  )}

                                  {item.syllabus && (
                                    <a
                                      href={`${import.meta.env.VITE_API_URL}${item.syllabus}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Open Syllabus
                                    </a>
                                  )}
                                </div>
                              </div>

                              <Divider style={{ margin: "0px 0" }} />
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </>
                  ) : (
                    <p className="header_search_options_nodata">
                      No data found
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="header_searchbar_container">
            <input
              className="header_searchbar"
              placeholder="Candidate Search"
              onChange={handleSearch}
              value={searchValue}
              onBlur={() => {
                setTimeout(() => {
                  setIsOpenSearchOptions(false);
                }, 300);
              }}
              onFocus={() => {
                setIsOpenSearchOptions(true);
              }}
            />
            <CiSearch className="header_searchbar_icon" />
            <div
              className={
                searchValue && isOpenSearchOptions
                  ? "header_search_options_container"
                  : "header_search_options_hidecontainer"
              }
            >
              {searchLoading ? (
                <div className="header_search_loader_container">
                  <Spin size="small" style={{ paddingTop: "0px" }} />
                </div>
              ) : (
                <>
                  {leadData.length >= 1 ? (
                    <>
                      {leadData.map((item, index) => {
                        return (
                          <React.Fragment key={index}>
                            <div
                              onClick={() => {
                                setIsOpenLeadDetailsDrawer(true);
                                console.log("global search lead details", item);
                                fetchLeadDetails(item.id);
                              }}
                            >
                              <p className="header_search_options_name">
                                {item.name}
                              </p>
                              <Divider style={{ margin: 0 }} />
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </>
                  ) : (
                    <p className="header_search_options_nodata">
                      No data found
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="header_profile_container">
            <div className="header_notificationicon_maincontainer">
              {/* <div className="header_notificationicon_container">
                <LuMessageCircleMore size={16} />
              </div> */}

              <div
                className="header_notificationicon_container"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setIsOpenNotificationsDrawer(true);
                  getNotificationData(1);
                }}
              >
                <IoMdNotificationsOutline size={16} />

                {unreadCount > 0 && (
                  <div className="header_notification_count_container">
                    <p>{unreadCount}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div>
                <p className="header_nametext">{userName}</p>
                <p className="header_roletext">ACTE</p>
              </div>

              <div className="header_profileContainer">
                <Space direction="vertical">
                  <Space wrap>
                    <Dropdown
                      menu={{ items: items }}
                      placement="bottomLeft"
                      arrow={{ pointAtCenter: true }}
                      // popupRender={() => <CustomDropdownContent />}
                      trigger={["click"]}
                    >
                      <FcManager size={32} style={{ cursor: "pointer" }} />
                    </Dropdown>
                  </Space>
                </Space>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        title="Lead Details"
        open={isOpenLeadDetailsDrawer}
        onClose={() => {
          setIsOpenLeadDetailsDrawer(false);
          setLeadDetails(null);
        }}
        width="52%"
        style={{ position: "relative", paddingBottom: "40px" }}
        className="customer_statusupdate_drawer"
      >
        {leadDetails && <ViewLeadDetails leadData={leadDetails} />}
      </Drawer>

      <CustomerHistory
        customerId={selectedCustomerId}
        isOpen={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setSelectedCustomerId(null);
        }}
      />

      {/* change password drawer */}
      <Drawer
        title="Change Password"
        open={isOpenChangePasswordDrawer}
        onClose={passwordDrawerReset}
        width="38%"
        style={{ position: "relative" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <CommonInputField
              label="Profile Name"
              required={true}
              value={profileName}
              disabled={true}
            />
          </Col>
          <Col span={12}>
            <CommonOutlinedInput
              label="Current Password"
              type={showOldPassword ? "text" : "password"}
              required={true}
              icon={
                <>
                  {showOldPassword ? (
                    <FiEye
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    />
                  ) : (
                    <FiEyeOff
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    />
                  )}
                </>
              }
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (passwordValidationTrigger) {
                  setOldPasswordError(passwordValidator(e.target.value));
                }
              }}
              value={oldPassword}
              error={oldPasswordError}
              errorFontSize="9px"
              helperTextContainerStyle={{
                position: "absolute",
                bottom: "-16px",
                width: "100%",
              }}
            />
          </Col>
        </Row>

        <Row
          gutter={16}
          style={{ marginTop: oldPasswordError ? "45px" : "30px" }}
        >
          <Col span={12}>
            <CommonOutlinedInput
              label="New Password"
              type={showPassword ? "text" : "password"}
              required={true}
              icon={
                <>
                  {showPassword ? (
                    <FiEye
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <FiEyeOff
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  )}
                </>
              }
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordValidationTrigger) {
                  setNewPasswordError(passwordValidator(e.target.value));
                  setConfirmPasswordError(
                    confirmPasswordValidator(e.target.value, confirmPassword),
                  );
                }
              }}
              value={newPassword}
              error={newPasswordError}
              helperTextContainerStyle={{
                position: "absolute",
                bottom: "-21px",
                width: "100%",
              }}
            />
          </Col>
          <Col span={12}>
            <CommonOutlinedInput
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              required={true}
              icon={
                <>
                  {showConfirmPassword ? (
                    <FiEye
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  ) : (
                    <FiEyeOff
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  )}
                </>
              }
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordValidationTrigger) {
                  setConfirmPasswordError(
                    confirmPasswordValidator(newPassword, e.target.value),
                  );
                }
              }}
              value={confirmPassword}
              error={confirmPasswordError}
              helperTextContainerStyle={{
                position: "absolute",
                bottom:
                  confirmPasswordError === " is required" ? "0px" : "-21px",
                width: "100%",
              }}
            />{" "}
          </Col>
        </Row>

        <div className="leadmanager_tablefiler_footer">
          <div
            className="leadmanager_submitlead_buttoncontainer"
            style={{ gap: "12px" }}
          >
            {passwordLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={handleChangePassword}
              >
                Update
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
            <span>Notifications</span>
            <div className="header_notification_pagenumber_container">
              <p>{pagination.label}</p>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  color: "gray",
                  alignItems: "center",
                }}
              >
                {/* forward */}
                {pagination.page == 1 ? (
                  <div className="header_notification_disable_arrowbutton">
                    <IoIosArrowBack size={15} />
                  </div>
                ) : (
                  <div
                    className="header_notification_arrowbutton"
                    onClick={() => {
                      getNotificationData(pagination.page - 1);
                    }}
                  >
                    <IoIosArrowBack size={15} />
                  </div>
                )}

                {/* backward */}
                {pagination.page == pagination.totalPages ? (
                  <div className="header_notification_disable_arrowbutton">
                    <IoIosArrowForward size={15} />
                  </div>
                ) : (
                  <div
                    className="header_notification_arrowbutton"
                    onClick={() => {
                      getNotificationData(pagination.page + 1);
                    }}
                  >
                    <IoIosArrowForward size={15} />
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        open={isOpenNotificationsDrawer}
        onClose={passwordDrawerReset}
        width="35%"
        style={{ position: "relative", paddingBottom: "20px" }}
        className="header_notification_drawer"
      >
        {notificationData.length >= 1 ? (
          <>
            {notificationData.map((item, index) => {
              const message = (() => {
                try {
                  return JSON.parse(item.message);
                } catch {
                  return item.message;
                }
              })();
              return (
                <React.Fragment key={index}>
                  <Row
                    gutter={12}
                    className="header_notification_drawer_list_container"
                    style={{
                      backgroundColor:
                        item.is_read == 0 ? "rgb(91 105 202 / 11%)" : "#fff",
                    }}
                    onClick={() => {
                      handleMarkAsRead(item);
                    }}
                  >
                    <Col span={4}>
                      <div
                        className={
                          item.title == "Ticket Assigned" ||
                          item.title == "New comment added to the ticket" ||
                          item.title == "Server Raised"
                            ? "header_notification_popup_list_ticket_icon_container"
                            : "header_notification_popup_list_icon_container"
                        }
                      >
                        {item.title == "Ticket Assigned" ||
                        item.title == "New comment added to the ticket" ? (
                          <IoTicketOutline color="#5b69ca" size={22} />
                        ) : (
                          <RiErrorWarningFill color="#d32f2f" size={24} />
                        )}
                      </div>
                    </Col>
                    <Col span={20}>
                      <div className="header_notification_drawer_list_title_container">
                        <p
                          className={
                            item.is_read == 0
                              ? "header_notification_drawer_list_title"
                              : "header_notification_drawer_listunread_title"
                          }
                        >
                          {item.title}
                        </p>
                        <p style={{ color: "gray", fontSize: "11px" }}>
                          {item.created_at
                            ? shortRelativeTime(item.created_at)
                            : ""}
                        </p>
                      </div>
                      {item.title === "Payment Rejected" ||
                      (item.title === "Trainer Rejected" &&
                        typeof message === "object") ? (
                        <p className="header_notification_drawer_list_message">
                          {`Customer Name: ${message.customer_name ?? "-"} | 
     Mobile: ${message.customer_phonecode ?? ""}${
       message.customer_phone ?? ""
     } | 
     Course: ${message.customer_course ?? "-"}`}
                        </p>
                      ) : item.title === "Server Raised" &&
                        typeof message === "object" ? (
                        <p className="header_notification_drawer_list_message">
                          {`Customer Name: ${message.customer_name ?? "-"} | 
     Mobile: ${message.customer_phonecode ?? ""}${
       message.customer_phone ?? ""
     } | 
     Course: ${message.customer_course ?? "-"}`}
                        </p>
                      ) : item.title === "Ticket Assigned" &&
                        typeof message === "object" ? (
                        <p className="header_notification_drawer_list_message">
                          {`Title: ${message.title ?? "-"} | 
     Category: ${message.category_name ?? ""}${message.category_name ?? ""} | 
     Priority: ${message.priority ?? "-"}`}
                        </p>
                      ) : item.title === "New comment added to the ticket" &&
                        typeof message === "object" ? (
                        <p className="header_notification_drawer_list_message">
                          {`Title: ${message.title ?? "-"} | 
     Category: ${message.category_name ?? ""}${message.category_name ?? ""} | 
     Comment: ${message.comment ?? "-"}`}
                        </p>
                      ) : item.title === "Trainer Payment Rejected" &&
                        typeof message === "object" ? (
                        <p className="header_notification_drawer_list_message">
                          {`Trainer Name: ${message.trainer_name ?? "-"} | 
     Mobile: +91 ${message.trainer_mobile ?? ""}`}
                        </p>
                      ) : (
                        <p className="header_notification_drawer_list_message">
                          {typeof message === "string"
                            ? message
                            : JSON.stringify(message)}
                        </p>
                      )}
                    </Col>
                    <div
                      className="header_notification_drawer_unreadindicator"
                      style={{ opacity: item.is_read == 0 ? 1 : 0 }}
                    />
                  </Row>
                  <Divider className={"header_notification_drawer_divider"} />
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <div className="header_notification_drawer_nonotification_container">
            <img src={NotificationImage} />
            <p className="header_notification_drawer_nonotification_text">
              Haven't got any notifications
            </p>
          </div>
        )}
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

      {/* Share Template Modal */}
      <Modal
        title="Edit Share Template"
        open={isOpenShareModal}
        onCancel={() => setIsOpenShareModal(false)}
        onOk={proceedWithShare}
        okText={
          currentSharePlatform == "whatsapp"
            ? "Share to Whatsapp"
            : "Share to Gmail"
        }
        cancelText="Cancel"
        width="50%"
      >
        <Input.TextArea
          rows={20}
          value={shareTemplateText}
          onChange={(e) => setShareTemplateText(e.target.value)}
          style={{ fontFamily: "inherit", fontSize: "13px" }}
          className="sharetemplate_textarea_input"
        />
      </Modal>

      <Drawer
        title="Profile Details"
        open={isOpenProfileDrawer}
        onClose={() => setIsOpenProfileDrawer(false)}
        width="30%"
        className="premium_profile_drawer"
      >
        <div className="pp_top_card">
          <div className="pp_avatar_wrapper">
            {loginUserProfileImage ? (
              <Upload
                listType="picture-circle"
                fileList={[
                  {
                    uid: "-1",
                    name: "profile.jpg",
                    status: "done",
                    url:
                      loginUserProfileImage.startsWith("data:image") ||
                      loginUserProfileImage.startsWith("http")
                        ? loginUserProfileImage
                        : `${import.meta.env.VITE_API_URL}/${loginUserProfileImage}`,
                  },
                ]}
                onPreview={(file) => {
                  setPreviewImage(file.url);
                  setPreviewOpen(true);
                }}
                onRemove={false}
                showUploadList={{ showRemoveIcon: false }}
                beforeUpload={() => false}
                accept=".png,.jpg,.jpeg"
              />
            ) : (
              <div className="pp_avatar_placeholder">
                <FcManager size={60} />
              </div>
            )}
          </div>
          <div className="pp_info_section">
            <h2 className="pp_name">{loginUserDetails?.user_name || "-"}</h2>
            <p className="pp_company">ACTE</p>
          </div>
        </div>

        <div className="pp_details_container">
          <div className="pp_detail_row">
            <div className="pp_icon_box user_icon">
              <FaRegUser size={14} />
            </div>
            <div className="pp_detail_content">
              <p className="pp_detail_label">User ID</p>
              <p className="pp_detail_value">
                {loginUserDetails?.user_id || "-"}
              </p>
            </div>
          </div>

          <div className="pp_detail_row">
            <div className="pp_icon_box mobile_icon">
              <IoCallOutline size={16} />
            </div>
            <div className="pp_detail_content">
              <p className="pp_detail_label">Mobile</p>
              <p className="pp_detail_value">
                {loginUserDetails?.phone || "-"}
              </p>
            </div>
          </div>

          {loginUserDetails?.branch_name && (
            <div className="pp_detail_row">
              <div className="pp_icon_box branch_icon">
                <IoLocationOutline size={16} />
              </div>
              <div className="pp_detail_content">
                <p className="pp_detail_label">Branch</p>
                <p className="pp_detail_value">
                  {loginUserDetails.branch_name}
                </p>
              </div>
            </div>
          )}

          {loginUserDetails?.region_name && (
            <div className="pp_detail_row">
              <div className="pp_icon_box region_icon">
                <IoLocationOutline size={16} />
              </div>
              <div className="pp_detail_content">
                <p className="pp_detail_label">Region</p>
                <p className="pp_detail_value">
                  {loginUserDetails.region_name}
                </p>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
