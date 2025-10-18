import React, { useState, useEffect } from "react";
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
} from "antd";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { FcManager } from "react-icons/fc";
import { AiOutlineLogout } from "react-icons/ai";
import { IoFilter } from "react-icons/io5";
import { FiEyeOff, FiEye } from "react-icons/fi";
import "./styles.css";
import {
  changePassword,
  getCustomerById,
  getCustomerFullHistory,
  getCustomers,
  getLeads,
} from "../ApiService/action";
import { BiCommentDetail } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa";
import { LuCircleUser } from "react-icons/lu";
import { PiShield } from "react-icons/pi";
import moment from "moment";
import CustomerHistory from "../Customers/CustomerHistory";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import {
  confirmPasswordValidator,
  passwordValidator,
} from "../Common/Validation";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CommonMessage } from "../Common/CommonMessage";

export default function CustomHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterType, setFilterType] = useState(3);
  const [leadData, setLeadData] = useState([]);
  const [isOpenSearchOptions, setIsOpenSearchOptions] = useState(true);
  const [isOpenLeadDetailsDrawer, setIsOpenLeadDetailsDrawer] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false);

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
    const payload = {
      ...(searchvalue && filterType == 1
        ? { name: searchvalue }
        : searchvalue && filterType == 2
        ? { email: searchvalue }
        : searchvalue && filterType == 3
        ? { phone: searchvalue }
        : {}),
      user_ids: [],
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getLeads(payload);
      console.log("global lead response", response);
      setLeadData(response?.data?.data?.data || []);
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
            : null
        );
      }, 300);
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
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

  const getCustomerHistoryData = async (customerid) => {
    setTimeout(() => {
      setIsOpenCustomerHistoryDrawer(true);
    }, 300);
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

  const handleChangePassword = async () => {
    setPasswordValidationTrigger(true);
    const oldPasswordValidate = passwordValidator(oldPassword);
    const newPasswordValidate = passwordValidator(newPassword);
    const confirmPasswordValidate = confirmPasswordValidator(
      newPassword,
      confirmPassword
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
          "Something went wrong. Try again later"
      );
    }
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
              : location.pathname === "/trainers"
              ? "Trainers"
              : location.pathname === "/server"
              ? "Server"
              : location.pathname === "/settings"
              ? "Settings"
              : ""}
          </p>
        </div>

        {/* right div */}
        <div style={{ display: "flex" }}>
          <div className="header_searchbar_container">
            <input
              className="header_searchbar"
              placeholder={
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
                          getAllLeadData(null);
                        }
                      }}
                    >
                      <Radio
                        value={1}
                        style={{
                          marginTop: "6px",
                          marginBottom: "12px",
                          fontSize: "13px",
                        }}
                      >
                        Search by Name
                      </Radio>
                      <Radio
                        value={2}
                        style={{ marginBottom: "12px", fontSize: "13px" }}
                      >
                        Search by Email
                      </Radio>
                      <Radio
                        value={3}
                        style={{ marginBottom: "6px", fontSize: "13px" }}
                      >
                        Search by Mobile
                      </Radio>
                      <Radio
                        value={4}
                        style={{
                          marginTop: "6px",
                          marginBottom: "6px",
                          fontSize: "13px",
                        }}
                      >
                        Search by Course
                      </Radio>
                    </Radio.Group>
                  }
                >
                  <Button className="header_searchbar_filtericon_button">
                    <IoFilter size={16} color="#333" />
                  </Button>
                </Tooltip>
              </Flex>
            </div>
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
                      {leadData.map((item) => {
                        return (
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
              <div className="header_notificationicon_container">
                <LuMessageCircleMore size={16} />
              </div>
              <div className="header_notificationicon_container">
                <IoMdNotificationsOutline size={16} />
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
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.name ? leadDetails.name : "-"}
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
                  {leadDetails && leadDetails.email ? leadDetails.email : "-"}
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
                <p className="customerdetails_text">
                  {`${
                    leadDetails && leadDetails.lead_assigned_to_id
                      ? leadDetails.lead_assigned_to_id
                      : "-"
                  } (${
                    leadDetails && leadDetails.lead_assigned_to_name
                      ? leadDetails.lead_assigned_to_name
                      : "-"
                  })`}
                </p>
              </Col>
            </Row>

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
                          "DD/MM/YYYY"
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
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.primary_course
                    ? leadDetails.primary_course
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
                      <FaRegEye
                        color="#333"
                        style={{ marginTop: "2px", cursor: "pointer" }}
                        onClick={() => {
                          getCustomerData(
                            leadDetails && leadDetails.email
                              ? leadDetails.email
                              : null
                          );
                        }}
                      />
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
                    confirmPasswordValidator(e.target.value, confirmPassword)
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
                    confirmPasswordValidator(newPassword, e.target.value)
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
    </div>
  );
}
