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
  getCustomers,
  getLeads,
  getNotifications,
  getTechnologies,
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
import {
  confirmPasswordValidator,
  passwordValidator,
  shortRelativeTime,
} from "../Common/Validation";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CommonMessage } from "../Common/CommonMessage";
import NotificationImage from "../../assets/bell-colored.svg";
import { NotificationContext } from "../../Context/NotificationContext";
import EllipsisTooltip from "../Common/EllipsisTooltip";

export default function CustomHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useContext(NotificationContext);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

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
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false);
  const [viewCustomerLoading, setViewCustomerLoading] = useState(false);
  //course search
  const [courseSearchValue, setCourseSearchValue] = useState("");
  const [courseData, setCourseData] = useState([]);
  const [isOpenCourseSearchOptions, setIsOpenCourseSearchOptions] =
    useState(true);

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

  const handleLogout = () => {
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
      key: "2",
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

  const getCustomerData = async (customer_email) => {
    setViewCustomerLoading(true);
    const payload = {
      email: customer_email,
    };
    try {
      const response = await getCustomers(payload);
      console.log("customer response", response);
      const customerDetails = response?.data?.data?.customers[0];
      setCustomerDetails(customerDetails);
      setTimeout(() => {
        setIsOpenLeadDetailsDrawer(false);
        setLeadDetails(null);
        getCustomerHistoryData(
          leadDetails && leadDetails.customer_id
            ? leadDetails.customer_id
            : null,
        );
      }, 300);
    } catch (error) {
      setViewCustomerLoading(false);
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
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

  const getCustomerHistoryData = async (customerid) => {
    setTimeout(() => {
      setIsOpenCustomerHistoryDrawer(true);
    }, 300);
    setCustomerHistoryLoading(true);
    try {
      const response = await getCustomerFullHistory(customerid);
      const customer_history = response?.data?.data || [];
      const reverse_data = customer_history.reverse();
      setCustomerHistory(reverse_data);
      console.log("history response", response);
      setTimeout(() => {
        setCustomerHistoryLoading(false);
      }, 300);
    } catch (error) {
      setCustomerHistoryLoading(false);
      console.log("history response", error);
    } finally {
      setTimeout(() => {
        setViewCustomerLoading(false);
      }, 300);
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
      return "#d32f2f";
    }
    return "#000"; // default black
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

    if (item.title == "Ticket Assigned") {
      console.log("ticketss notifyyyyy", message);

      const ticketFilterData = {
        startDate: message.ticket_created_date,
        endDate: message.ticket_created_date,
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

    if (location.pathname === "/customers") {
      window.dispatchEvent(
        new CustomEvent("notificationFilter", { detail: filterData }),
      );
      setIsOpenNotificationsDrawer(false);
      return;
    }
    console.log("Hiiiiiiiiiiiiiiiiiiee");
    navigate("/customers", { state: filterData });
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
    const price = Number(item.price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const offer = Number(item.offer_price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `Course Name: ${item.name}
Price: ₹${price}
Offer Price: ₹${offer}
Brouchures: ${item.brouchures || "-"}
Syllabus: ${item.syllabus || "-"}`;
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
    //     const price = Number(item.price).toLocaleString("en-IN", {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     });

    //     const offer = Number(item.offer_price).toLocaleString("en-IN", {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     });

    //     const shareText = `Course Name: ${item.name}
    // Price: ₹${price}
    // Offer Price: ₹${offer}
    // Syllabus: ${item.syllabus || "-"}
    // Brouchures: ${item.brouchures || "-"}`;

    //     try {
    //       if (navigator.share) {
    //         await navigator.share({
    //           title: item.name,
    //           text: shareText,
    //         });
    //       } else {
    //         await navigator.clipboard.writeText(shareText);
    //         alert("Course details copied to clipboard");
    //       }
    //     } catch (err) {
    //       console.log("Share failed:", err);
    //     }
    if (sharePlatform == "whatsapp") {
      const text = encodeURIComponent(buildShareText(item));
      window.open(`https://wa.me/?text=${text}`, "_blank");
    } else if (sharePlatform == "gmail") {
      const subject = encodeURIComponent(item.name);
      const body = encodeURIComponent(buildShareText(item));

      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
        "_blank",
      );
    }
  };

  return (
    <div className="header_maincontainer">
      <div className="header_innercontainer">
        {/* left div */}
        <div className="header_titleContainer">
          <p className="header_pagetitle">
            {location.pathname === "/dashboard"
              ? "Dashboard"
              : location.pathname === "/lead-manager"
                ? "Lead Manager"
                : location.pathname === "/lead-followup"
                  ? "Lead Followup"
                  : location.pathname === "/customers"
                    ? "Customers"
                    : location.pathname === "/fee-pending-customers"
                      ? "Fee Pending Customers"
                      : location.pathname === "/batches"
                        ? "Batches"
                        : location.pathname === "/bulk-search"
                          ? "Bulk Search"
                          : location.pathname === "/trainers"
                            ? "Trainers"
                            : location.pathname === "/trainer-payment"
                              ? "Trainer Payment"
                              : location.pathname === "/server"
                                ? "Server"
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
                                  <Tooltip
                                    placement="bottom"
                                    color="#fff"
                                    title={
                                      <>
                                        <Row
                                          gutter={12}
                                          style={{ alignItems: "center" }}
                                        >
                                          <Col span={12}>
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
                              <div className="header_search_link_row">
                                {item.brouchures && (
                                  <a
                                    href={item.brouchures}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Open Brouchure
                                  </a>
                                )}

                                {item.syllabus && (
                                  <a
                                    href={item.syllabus}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Open Syllabus
                                  </a>
                                )}
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
                                setLeadDetails(item);
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
        style={{ position: "relative", paddingBottom: "65px" }}
        className="customer_statusupdate_drawer"
      >
        <Row
          gutter={16}
          style={{ padding: "0px 0px 0px 24px", marginTop: "20px" }}
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
                    leadDetails && leadDetails.name ? leadDetails.name : "-"
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
                    leadDetails && leadDetails.email ? leadDetails.email : "-"
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
                  {leadDetails && leadDetails.phone ? leadDetails.phone : "-"}
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
                  {leadDetails && leadDetails.whatsapp
                    ? leadDetails.whatsapp
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
                  {leadDetails && leadDetails.area_id
                    ? leadDetails.area_id
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
                <EllipsisTooltip
                  text={`${
                    leadDetails && leadDetails.lead_assigned_to_id
                      ? leadDetails.lead_assigned_to_id
                      : "-"
                  } (${
                    leadDetails && leadDetails.lead_assigned_to_name
                      ? leadDetails.lead_assigned_to_name
                      : "-"
                  })`}
                  smallText={true}
                />
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
                  {leadDetails && leadDetails.created_date
                    ? moment(leadDetails.created_date).format("DD/MM/YYYY")
                    : "-"}
                </p>
              </Col>
            </Row>

            {leadDetails && leadDetails.re_assigned_date && (
              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <MdAutorenew size={16} color="gray" />
                    <p className="customerdetails_rowheading">Re-Assined At</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {leadDetails && leadDetails.re_assigned_date
                      ? moment(leadDetails.re_assigned_date).format(
                          "DD/MM/YYYY",
                        )
                      : "-"}
                  </p>
                </Col>
              </Row>
            )}

            {leadDetails && leadDetails.is_customer_reg == 0 ? (
              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <MdOutlineDateRange size={15} color="gray" />
                    <p className="customerdetails_rowheading">Next Followup</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {leadDetails && leadDetails.next_follow_up_date
                      ? moment(leadDetails.next_follow_up_date).format(
                          "DD/MM/YYYY",
                        )
                      : "-"}
                  </p>
                </Col>
              </Row>
            ) : (
              ""
            )}

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <BiCommentDetail size={15} color="gray" />
                  <p className="customerdetails_rowheading">Comments</p>
                </div>
              </Col>
              <Col span={12}>
                <>
                  {leadDetails && leadDetails.comments ? (
                    leadDetails.comments.length > 20 ? (
                      <Tooltip
                        color="#fff"
                        placement="bottom"
                        title={leadDetails.comments}
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
                        <p className="customerdetails_text">
                          {leadDetails.comments.slice(0, 19) + "..."}
                        </p>
                      </Tooltip>
                    ) : (
                      <p className="customerdetails_text">
                        {leadDetails.comments}
                      </p>
                    )
                  ) : (
                    <p className="customerdetails_text">-</p>
                  )}
                </>
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
                    leadDetails && leadDetails.primary_course
                      ? leadDetails.primary_course
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
                  style={{ color: "#333", fontWeight: 700 }}
                >
                  {leadDetails && leadDetails.primary_fees
                    ? "₹" + leadDetails.primary_fees
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Region</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.region_name
                    ? leadDetails.region_name
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
                  {leadDetails && leadDetails.branch_name
                    ? leadDetails.branch_name
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
                  {leadDetails && leadDetails.batch_track
                    ? leadDetails.batch_track
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Lead Source</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.lead_type
                    ? leadDetails.lead_type
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Lead Status</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.lead_status
                    ? leadDetails.lead_status
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Is Customer</p>
                </div>
              </Col>
              <Col span={12}>
                {leadDetails && leadDetails.is_customer_reg === 1 ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <p
                      className="customerdetails_text"
                      style={{ fontWeight: 700, color: "#3c9111" }}
                    >
                      Yes
                    </p>
                    <Tooltip
                      placement="bottom"
                      title="View Customer Track"
                      className="leadtable_comments_tooltip"
                    >
                      {viewCustomerLoading ? (
                        <FaRegEye
                          color="#333"
                          style={{
                            marginTop: "2px",
                            opacity: "0.7",
                          }}
                        />
                      ) : (
                        <FaRegEye
                          color="#333"
                          style={{ marginTop: "2px", cursor: "pointer" }}
                          onClick={() => {
                            getCustomerData(
                              leadDetails && leadDetails.email
                                ? leadDetails.email
                                : null,
                            );
                          }}
                        />
                      )}
                    </Tooltip>
                  </div>
                ) : (
                  <p
                    className="customerdetails_text"
                    style={{ color: "rgb(211, 47, 47)", fontWeight: 700 }}
                  >
                    No
                  </p>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider className="customer_statusupdate_divider" />
      </Drawer>

      {/* customer history drawer */}
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
            // <img
            //   src={customerDetails.profile_image}
            //   className="cutomer_profileimage"
            // />
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
            />
          )}
        </div>
      </Drawer>

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
                          item.title == "Server Raised"
                            ? "header_notification_popup_list_ticket_icon_container"
                            : "header_notification_popup_list_icon_container"
                        }
                      >
                        {item.title == "Ticket Assigned" ? (
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
    </div>
  );
}
