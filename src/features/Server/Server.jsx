import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Button,
  Flex,
  Radio,
  Tooltip,
  Checkbox,
  Drawer,
  Divider,
  Modal,
  Collapse,
} from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { LuIndianRupee } from "react-icons/lu";
import { IoLocationOutline } from "react-icons/io5";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import CommonTable from "../Common/CommonTable";
import { FaRegCircleXmark } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { RedoOutlined } from "@ant-design/icons";
import { LuFileClock } from "react-icons/lu";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  addressValidator,
  formatToBackendIST,
  getCurrentandPreviousweekDate,
  selectValidator,
} from "../Common/Validation";
import {
  getCustomerById,
  getServerHistory,
  getServerRequest,
  insertServerTrack,
  serverApprove,
  serverVerify,
  updateServerStatus,
} from "../ApiService/action";
import moment from "moment";
import CommonSelectField from "../Common/CommonSelectField";
import CommonInputField from "../Common/CommonInputField";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { BsPatchCheckFill } from "react-icons/bs";
import CommonTextArea from "../Common/CommonTextArea";
import { useSelector } from "react-redux";
import "./styles.css";
import ServerHistory from "./ServerHistory";

export default function Server() {
  const scrollRef = useRef();

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };
  const permissions = useSelector((state) => state.userpermissions);

  const [status, setStatus] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [serverData, setServerData] = useState([]);
  const [statusCount, setStatusCount] = useState(null);
  const [loading, setLoading] = useState(true);
  //view drawer
  const [isOpenViewDrawer, setIsOpenViewDrawer] = useState(false);
  //drawer usestates
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState("");
  const [serverDetails, setServerDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [serverCost, setServerCost] = useState();
  const [serverCostError, setServerCostError] = useState("");
  const [serverDuration, setServerDuration] = useState(null);
  const [serverDurationError, setServerDurationError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [isOpenRejectBox, setIsOpenRejectBox] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [rejectCommentError, setRejectCommentError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [verifyButtonLoading, setVerifyButtonLoading] = useState(false);
  const [rejectButtonLoading, setRejectButtonLoading] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  //drawer history usestates
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [verifyHistory, setVerifyHistory] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  //full history drawer useStates
  const [isOpenHistoryDrawer, setIsOpenHistoryDrawer] = useState(false);
  const [serverHistory, setServerHistory] = useState([]);
  const [serverHistoryLoading, setServerHistoryLoading] = useState(false);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const nonChangeColumns = [
    {
      title: "Created At",
      key: "created_date",
      dataIndex: "created_date",
      width: 130,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Created By",
      key: "created_by_id",
      dataIndex: "created_by_id",
      width: 180,
      render: (text, record) => {
        return <p>{text ? `${text} - ${record.created_by}` : "-"}</p>;
      },
    },
    { title: "Name", key: "name", dataIndex: "name", width: 180 },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 140 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    {
      title: "Server Name",
      key: "server_name",
      dataIndex: "server_name",
      width: 180,
    },
    {
      title: "Server Cost",
      key: "server_cost",
      dataIndex: "server_cost",
      width: 130,
      render: (text) => {
        return <p>{text ? `₹${text}` : "-"}</p>;
      },
    },
    {
      title: "Duration",
      key: "duration",
      dataIndex: "duration",
      width: 120,
      render: (text) => {
        return <p>{text ? `${text} Days` : "-"}</p>;
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: 160,
      fixed: "right",
      render: (text, record) => {
        return (
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
                <Row style={{ marginBottom: "8px" }}>
                  <Col span={14}>
                    {record.status == "Requested" ||
                    record.status == "Server Rejected" ? (
                      <Checkbox
                        className="server_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (!permissions.includes("Server Details Update")) {
                            CommonMessage("error", "Access Denied");
                            return;
                          }
                          setIsOpenDetailsDrawer(true);
                          setDrawerStatus("Update Details");
                          setVerifyHistory(record.server_rejected_history);
                          setServerDetails(record);
                          getCustomerData(record.customer_id);
                        }}
                      >
                        Update Details
                      </Checkbox>
                    ) : (
                      <div className="customers_classcompleted_container">
                        <BsPatchCheckFill color="#3c9111" />
                        <p className="customers_classgoing_completedtext">
                          Details Updated
                        </p>
                      </div>
                    )}
                  </Col>
                  <Col span={10}>
                    {record.status == "Requested" ||
                    record.status == "Server Rejected" ||
                    record.status == "Awaiting Verify" ||
                    record.status == "Approval Rejected" ? (
                      <Checkbox
                        className="server_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (
                            record.status == "Requested" ||
                            record.status == "Server Rejected"
                          ) {
                            CommonMessage("warning", "Details not updated yet");
                            return;
                          } else {
                            if (!permissions.includes("Server Verify")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setIsOpenDetailsDrawer(true);
                            setDrawerStatus("Verify");
                            setApprovalHistory(
                              record.approval_rejected_history
                            );
                            setServerCost(
                              record.server_cost ? record.server_cost : ""
                            );
                            setServerDuration(
                              record.duration ? record.duration : null
                            );
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                          }
                        }}
                      >
                        Verify
                      </Checkbox>
                    ) : (
                      <div className="customers_classcompleted_container">
                        <BsPatchCheckFill color="#3c9111" />
                        <p className="customers_classgoing_completedtext">
                          Verified
                        </p>
                      </div>
                    )}
                  </Col>
                </Row>

                {record.status == "Issued" ? (
                  <Row style={{ marginBottom: "6px" }}>
                    <Col span={14}>
                      <div className="customers_classcompleted_container">
                        <BsPatchCheckFill color="#3c9111" />
                        <p className="customers_classgoing_completedtext">
                          Approved
                        </p>
                      </div>
                    </Col>
                    <Col span={10}>
                      <div className="customers_classcompleted_container">
                        <BsPatchCheckFill color="#3c9111" />
                        <p className="customers_classgoing_completedtext">
                          Issued
                        </p>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <Row style={{ marginBottom: "6px" }}>
                    <Col span={14}>
                      <Checkbox
                        className="server_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (
                            record.status == "Requested" ||
                            record.status == "Server Rejected"
                          ) {
                            CommonMessage("warning", "Details not updated yet");
                            return;
                          } else if (
                            record.status == "Awaiting Verify" ||
                            record.status == "Approval Rejected"
                          ) {
                            CommonMessage("warning", "Not verified yet");
                            return;
                          } else {
                            if (!permissions.includes("Server Approve")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setIsOpenDetailsDrawer(true);
                            setDrawerStatus("Approve");
                            setServerCost(
                              record.server_cost ? record.server_cost : ""
                            );
                            setServerDuration(
                              record.duration ? record.duration : null
                            );
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                          }
                        }}
                      >
                        Approve
                      </Checkbox>
                    </Col>
                  </Row>
                )}
              </>
            }
          >
            {text == "Requested" ? (
              <div>
                <Button className="customers_status_awaitfeedback_button">
                  {text}
                </Button>
              </div>
            ) : text == "Awaiting Verify" ? (
              <div>
                <Button className="customers_status_awaitverify_button">
                  {text}
                </Button>
              </div>
            ) : text == "Awaiting Approval" ? (
              <div>
                <Button className="customers_status_classscheduled_button">
                  {text}
                </Button>
              </div>
            ) : text == "Issued" ? (
              <div>
                <Button className="customers_status_completed_button">
                  Server Issued
                </Button>
              </div>
            ) : text == "Rejected" ||
              text == "Server Rejected" ||
              text == "Approval Rejected" ||
              text == "Hold" ? (
              <div>
                <Button className="trainers_rejected_button">{text}</Button>
              </div>
            ) : (
              <p>{text}</p>
            )}
          </Tooltip>
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
            <FaRegEye
              size={15}
              className="trainers_action_icons"
              onClick={() => {
                setIsOpenViewDrawer(true);
                setServerDetails(record);
                getCustomerData(record.customer_id);
              }}
            />

            <Tooltip
              placement="top"
              title="View Server History"
              trigger={["hover", "click"]}
            >
              <LuFileClock
                size={15}
                className="trainers_action_icons"
                onClick={() => {
                  setServerDetails(record);
                  getServerHistoryData(record.id, record.customer_id);
                  // setTimeout(() => {
                  //   const container = document.getElementById(
                  //     "customer_history_profilecontainer"
                  //   );
                  //   container.scrollIntoView({
                  //     behavior: "smooth",
                  //     block: "start",
                  //   });
                  // }, 300);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    getServerRequestData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
      null,
      1,
      10
    );
  }, []);

  const getServerRequestData = async (
    startDate,
    endDate,
    serverStatus,
    searchvalue,
    pageNumber,
    limit
  ) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      ...(serverStatus && serverStatus == "Awaiting Verify"
        ? { status: ["Awaiting Verify", "Approval Rejected"] }
        : { status: serverStatus }),
      ...(searchvalue && filterType == 1
        ? { mobile: searchvalue }
        : searchvalue && filterType == 2
        ? { name: searchvalue }
        : searchvalue && filterType == 3
        ? { email: searchvalue }
        : searchvalue && filterType == 4
        ? { server: searchvalue }
        : {}),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getServerRequest(payload);
      console.log("server response", response);
      setServerData(response?.data?.data?.data || []);
      setStatusCount(response?.data?.data?.statusCount || null);

      const pagination = response?.data?.data?.pagination;
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
    } catch (error) {
      setServerData([]);
      setStatusCount(null);
      console.log("get server error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getServerRequestData(
        selectedDates[0],
        selectedDates[1],
        status,
        e.target.value,
        1,
        pagination.limit
      );
    }, 300);
  };

  const handlePaginationChange = ({ page, limit }) => {
    getServerRequestData(
      selectedDates[0],
      selectedDates[1],
      status,
      searchValue,
      page,
      limit
    );
  };

  const getCustomerData = async (customer_id) => {
    try {
      const response = await getCustomerById(customer_id);
      console.log("customer details", response);
      const customer_details = response?.data?.data || null;
      setCustomerDetails(customer_details);
    } catch (error) {
      setCustomerDetails(null);
      console.log("customer details error", error);
    }
  };

  const handleUpdateDetails = async () => {
    setValidationTrigger(true);
    const costValidate = selectValidator(serverCost);
    const durationValidate = selectValidator(serverDuration);

    setServerCostError(costValidate);
    setServerDurationError(durationValidate);

    if (costValidate || durationValidate) return;

    setButtonLoading(true);

    const payload = {
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
      server_cost: serverCost,
      duration: serverDuration,
    };

    try {
      await serverVerify(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated");
        drawerReset();
        handleServerStatus("Awaiting Verify");
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleServerVerify = () => {
    setIsOpenConfirmModal(true);
  };

  const handleRejection = async () => {
    if (isOpenRejectBox == false) {
      setIsOpenRejectBox(true);
      setTimeout(() => {
        const container = document.getElementById(
          "server_commentreject_container"
        );
        container.scrollIntoView({ behavior: "smooth" });
      }, 200);
      return;
    }

    setRejectButtonLoading(true);
    const commentValidate = addressValidator(rejectComment);

    if (commentValidate) return;

    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
      status:
        drawerStatus == "Verify" ? "Server Rejected" : "Approval Rejected",
      comments: rejectComment,
      rejected_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : "",
    };
    try {
      await updateServerStatus(payload);
      setTimeout(() => {
        setRejectButtonLoading(false);
        handleServerTrack(payload.status);
        drawerReset();
        getServerRequestData(
          selectedDates[0],
          selectedDates[1],
          status,
          searchValue,
          1,
          pagination.limit
        );
      }, 300);
    } catch (error) {
      setRejectButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleServerApprove = async () => {
    setButtonLoading(true);
    const payload = {
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
    };
    try {
      await serverApprove(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated");
        drawerReset();
        handleServerStatus("Issued");
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleServerStatus = async (updateStatus) => {
    setVerifyButtonLoading(true);
    const payload = {
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
      status: updateStatus,
    };
    try {
      await updateServerStatus(payload);
      setTimeout(() => {
        setVerifyButtonLoading(false);
        setIsOpenConfirmModal(false);
        handleServerTrack(updateStatus);
        drawerReset();
        getServerRequestData(
          selectedDates[0],
          selectedDates[1],
          status,
          searchValue,
          1,
          pagination.limit
        );
      }, 300);
    } catch (error) {
      setVerifyButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleServerTrack = async (updateStatus) => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const updateDetailsPayload = {
      server_name:
        serverDetails && serverDetails.server_name
          ? serverDetails.server_name
          : null,
      server_cost: serverCost,
      server_duration: serverDuration,
    };

    const approveDetails = {
      server_name:
        serverDetails && serverDetails.server_name
          ? serverDetails.server_name
          : null,
      server_cost: serverCost,
      server_duration: serverDuration,
    };

    const rejectionDetails = {
      reject_comment: rejectComment,
    };

    const payload = {
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
      status:
        updateStatus == "Awaiting Verify"
          ? "Details Updated"
          : updateStatus == "Awaiting Approval"
          ? "Verified"
          : updateStatus == "Issued"
          ? "Server Approved"
          : updateStatus,
      status_date: formatToBackendIST(today),
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      ...(updateStatus && updateStatus == "Awaiting Verify"
        ? { details: updateDetailsPayload }
        : updateStatus == "Issued"
        ? { details: approveDetails }
        : updateStatus == "Server Rejected" ||
          updateStatus == "Approval Rejected"
        ? { details: rejectionDetails }
        : {}),
    };
    try {
      await insertServerTrack(payload);
      if (
        updateStatus == "Awaiting Verify" ||
        updateStatus == "Awaiting Approval" ||
        updateStatus == "Approval Rejected" ||
        updateStatus == "Issued"
      ) {
        handleSecondServerTrack(
          updateStatus == "Approval Rejected"
            ? "Awaiting Verify"
            : updateStatus == "Issued"
            ? "Server Issued"
            : updateStatus
        );
      }
    } catch (error) {
      console.log("server track error", error);
    }
  };

  const handleSecondServerTrack = async (updatestatus) => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const payload = {
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
      status: updatestatus,
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      status_date: formatToBackendIST(today),
    };
    try {
      await insertServerTrack(payload);
    } catch (error) {
      console.log("server track error", error);
    }
  };

  const getServerHistoryData = async (serverId, customer_id) => {
    setServerHistoryLoading(true);
    try {
      const response = await getServerHistory(serverId);
      console.log("server history response", response);
      const history = response?.data?.data || [];
      if (history.length >= 1) {
        const reverseData = history.reverse();
        setServerHistory(reverseData);
      } else {
        setServerHistory([]);
      }
      setIsOpenHistoryDrawer(true);
      //call customer api
      getCustomerData(customer_id);
      setTimeout(() => {
        setServerHistoryLoading(false);
      }, 300);
    } catch (error) {
      setServerHistory([]);
      setServerHistoryLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const getHistoryStatusColor = (status) => {
    if (
      ["Details Updated", "Issued", "Approved"].some((s) => status.includes(s))
    ) {
      return "green";
    }
    if (status.includes("Awaiting")) return "gray";
    if (["Rejected"].some((s) => status.includes(s))) {
      return "#d32f2f";
    }
    return "#000"; // default black
  };

  const handleStatusMismatch = () => {
    CommonMessage("error", "Status Mismatch. Contact Support Team");
  };

  const drawerReset = () => {
    setIsOpenDetailsDrawer(false);
    setIsOpenViewDrawer(false);
    setServerDetails(null);
    setServerCost("");
    setServerCostError("");
    setServerDuration(null);
    setServerDurationError("");
    setValidationTrigger(false);
    setButtonLoading(false);
    setCustomerDetails(null);
    setIsOpenRejectBox(false);
    setRejectComment("");
    setRejectCommentError("");
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setSearchValue("");
    setStatus("");
    setPagination({
      page: 1,
    });
    getServerRequestData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
      null,
      1,
      pagination.limit
    );
  };
  return (
    <div>
      <Row style={{ marginBottom: "12px" }}>
        <Col xs={24} sm={24} md={24} lg={12}>
          <Row gutter={16}>
            <Col span={10}>
              <div className="overallduecustomers_filterContainer">
                {/* <CommonOutlinedInput
              label="Search"
              width="40%"
              height="33px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
            /> */}
                <CommonOutlinedInput
                  label={
                    filterType == 1
                      ? "Search By Mobile"
                      : filterType == 2
                      ? "Search By Name"
                      : filterType == 3
                      ? "Search by Email"
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
                          getServerRequestData(
                            selectedDates[0],
                            selectedDates[1],
                            status,
                            null,
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
                            console.log(e.target.value);
                            setFilterType(e.target.value);
                            if (searchValue === "") {
                              return;
                            } else {
                              setSearchValue("");
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
                            Search by Server Name
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

            <Col span={14}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getServerRequestData(
                    dates[0],
                    dates[1],
                    status,
                    searchValue,
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
          lg={12}
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
              // setIsOpenFilterDrawer(true);
              // getTableColumnsData(loginUserId);
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
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                null,
                searchValue,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              All{" "}
              {`( ${
                statusCount && statusCount.total ? statusCount.total : "-"
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
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                "Requested",
                searchValue,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Server Request{" "}
              {`( ${
                statusCount && statusCount.requested
                  ? statusCount.requested
                  : "-"
              } )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Verify"
                ? "trainers_active_verifypending_container"
                : "customers_studentvefity_container"
            }
            onClick={() => {
              if (status === "Awaiting Verify") {
                return;
              }
              setStatus("Awaiting Verify");
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                "Awaiting Verify",
                searchValue,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Awaiting Verify{" "}
              {`( ${
                statusCount && statusCount.awaiting_verify
                  ? statusCount.awaiting_verify
                  : "-"
              } )`}
            </p>
          </div>
          <div
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
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                "Awaiting Approval",
                searchValue,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Awaiting Approval{" "}
              {`( ${
                statusCount && statusCount.awaiting_approval
                  ? statusCount.awaiting_approval
                  : "-"
              } )`}
            </p>
          </div>
          <div
            className={
              status === "Issued"
                ? "trainers_active_verifiedtrainers_container"
                : "customers_completed_container"
            }
            onClick={() => {
              if (status === "Issued") {
                return;
              }
              setStatus("Issued");
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                "Issued",
                searchValue,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Server Issued{" "}
              {`( ${
                statusCount && statusCount.issued ? statusCount.issued : "-"
              } )`}
            </p>
          </div>
          <div
            className={
              status === "Expired"
                ? "customers_active_awaitingclass_container"
                : "customers_awaitingclass_container"
            }
            onClick={() => {
              if (status === "Expired") {
                return;
              }
              setStatus("Expired");
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                "Expired",
                searchValue,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Expired Servers{" "}
              {`( ${
                statusCount && statusCount.expired ? statusCount.expired : "-"
              } )`}
            </p>
          </div>
          <div
            className={
              status === "Server Rejected"
                ? "trainers_active_rejectedtrainers_container"
                : "trainers_rejected_container"
            }
            onClick={() => {
              if (status === "Server Rejected") {
                return;
              }
              setStatus("Server Rejected");
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                "Server Rejected",
                searchValue,
                1,
                pagination.limit
              );
            }}
          >
            <p>
              Rejected Servers{" "}
              {`( ${
                statusCount && statusCount.server_rejected
                  ? statusCount.server_rejected
                  : "-"
              } )`}
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

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1600 }}
          columns={nonChangeColumns}
          dataSource={serverData}
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

      {/* update drawer */}
      <Drawer
        title="Update Status"
        open={isOpenDetailsDrawer}
        onClose={drawerReset}
        width="50%"
        style={{
          position: "relative",
          paddingBottom: "65px",
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
                  {customerDetails && customerDetails.total_course_amount
                    ? "₹" + customerDetails.total_course_amount
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

        <div className="customer_statusupdate_adddetailsContainer">
          {drawerStatus == "Update Details" ? (
            <>
              <p className="customer_statusupdate_adddetails_heading">
                Previous History
              </p>

              {historyLoading === false ? (
                <>
                  {verifyHistory.length >= 1 ? (
                    <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                      <Collapse
                        className="assesmntresult_collapse"
                        activeKey={collapseDefaultKey}
                        onChange={(keys) => {
                          setCollapseDefaultKey(keys);
                        }}
                      >
                        {verifyHistory.map((item, index) => (
                          <Collapse.Panel
                            key={index + 1}
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
                                  Rejection Date -{" "}
                                  <span style={{ fontWeight: "500" }}>
                                    {item.rejected_date
                                      ? moment(item.rejected_date).format(
                                          "DD/MM/YYYY"
                                        )
                                      : "-"}
                                  </span>
                                </span>
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
                              </div>
                            }
                          >
                            <div>
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
                                          Rejected By
                                        </p>
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <p className="customerdetails_text">
                                        {item.rejected_by
                                          ? item.rejected_by
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
                                          Reason for Rejection
                                        </p>
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <p className="customerdetails_text">
                                        {item.comments}
                                      </p>
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
                    <p className="customer_trainerhistory_nodatatext">
                      No Data found
                    </p>
                  )}
                </>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}

          {drawerStatus == "Verify" ? (
            <>
              <p className="customer_statusupdate_adddetails_heading">
                Previous History
              </p>

              {historyLoading === false ? (
                <>
                  {approvalHistory.length >= 1 ? (
                    <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                      <Collapse
                        className="assesmntresult_collapse"
                        activeKey={collapseDefaultKey}
                        onChange={(keys) => {
                          setCollapseDefaultKey(keys);
                        }}
                      >
                        {approvalHistory.map((item, index) => (
                          <Collapse.Panel
                            key={index + 1}
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
                                  Rejection Date -{" "}
                                  <span style={{ fontWeight: "500" }}>
                                    {item.rejected_date
                                      ? moment(item.rejected_date).format(
                                          "DD/MM/YYYY"
                                        )
                                      : "-"}
                                  </span>
                                </span>
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
                              </div>
                            }
                          >
                            <div>
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
                                          Rejected By
                                        </p>
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <p className="customerdetails_text">
                                        {item.rejected_by
                                          ? item.rejected_by
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
                                          Reason for Rejection
                                        </p>
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <p className="customerdetails_text">
                                        {item.comments}
                                      </p>
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
                    <p className="customer_trainerhistory_nodatatext">
                      No Data found
                    </p>
                  )}
                </>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}
          <p className="customer_statusupdate_adddetails_heading">
            Add Details
          </p>
          <Row
            gutter={16}
            style={{
              marginTop: "14px",
              marginBottom: isOpenRejectBox ? "0px" : "40px",
            }}
          >
            <Col span={8}>
              <CommonInputField
                label="Server Name"
                required={true}
                disabled={true}
                value={
                  serverDetails && serverDetails.server_name
                    ? serverDetails.server_name
                    : "-"
                }
              />
            </Col>
            <Col span={8}>
              <CommonOutlinedInput
                label="Server Cost"
                type="number"
                required={true}
                onChange={(e) => {
                  setServerCost(e.target.value);
                  if (validationTrigger) {
                    setServerCostError(selectValidator(e.target.value));
                  }
                }}
                value={serverCost}
                error={serverCostError}
                onInput={(e) => {
                  if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                  }
                }}
                icon={<LuIndianRupee size={16} />}
                disabled={drawerStatus == "Approve" ? true : false}
              />{" "}
            </Col>
            <Col span={8}>
              <CommonSelectField
                required={true}
                label="Duration"
                options={[
                  { id: 15, name: "15 Days" },
                  { id: 30, name: "30 Days" },
                  { id: 45, name: "45 Days" },
                ]}
                onChange={(e) => {
                  setServerDuration(e.target.value);
                  if (validationTrigger) {
                    setServerDurationError(selectValidator(e.target.value));
                  }
                }}
                value={serverDuration}
                error={serverDurationError}
                disabled={drawerStatus == "Approve" ? true : false}
              />
            </Col>
          </Row>

          {isOpenRejectBox && (
            <div id="server_commentreject_container">
              <Row
                gutter={16}
                style={{ marginTop: "20px", marginBottom: "30px" }}
              >
                <Col span={16}>
                  <CommonTextArea
                    label="Comments"
                    required={true}
                    onChange={(e) => {
                      setRejectComment(e.target.value);
                      setRejectCommentError(addressValidator(e.target.value));
                    }}
                    value={rejectComment}
                    error={rejectCommentError}
                  />
                </Col>
              </Row>
            </div>
          )}
        </div>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {drawerStatus == "Verify" || drawerStatus == "Approve" ? (
              <>
                {rejectButtonLoading ? (
                  <button className="customer_trainerreject_loadingbutton">
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className="customer_trainerreject_button"
                    onClick={handleRejection}
                  >
                    Reject
                  </button>
                )}
              </>
            ) : (
              ""
            )}

            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={
                  drawerStatus == "Update Details"
                    ? handleUpdateDetails
                    : drawerStatus == "Verify"
                    ? handleServerVerify
                    : drawerStatus == "Approve"
                    ? handleServerApprove
                    : handleStatusMismatch
                }
              >
                {drawerStatus == "Update Details"
                  ? "Update"
                  : drawerStatus == "Verify"
                  ? "Verify"
                  : drawerStatus == "Approve"
                  ? "Approve"
                  : "ee"}
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* view drawer */}
      <Drawer
        title="Full Details"
        open={isOpenViewDrawer}
        onClose={drawerReset}
        width="50%"
        style={{
          position: "relative",
          paddingBottom: "65px",
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
                  {customerDetails && customerDetails.total_course_amount
                    ? "₹" + customerDetails.total_course_amount
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

        <div
          className="customer_statusupdate_adddetailsContainer"
          style={{ marginBottom: "20px" }}
        >
          <div className="customerdetails_coursecard">
            <div className="customerdetails_coursecard_headercontainer">
              <p>Server Details</p>
            </div>

            <div className="customerdetails_coursecard_contentcontainer">
              <Row>
                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Created At</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {serverDetails && serverDetails.created_date
                          ? moment(serverDetails.created_date).format(
                              "DD/MM/YYYY"
                            )
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Server Name
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {serverDetails && serverDetails.server_name
                          ? serverDetails.server_name
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Server Cost
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p
                        className="customerdetails_text"
                        style={{ fontWeight: 700 }}
                      >
                        {serverDetails && serverDetails.server_cost
                          ? "₹" + serverDetails.server_cost
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
                          Server Duration
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {serverDetails && serverDetails.duration
                          ? serverDetails.duration + " " + "Days"
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Start Date</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {serverDetails && serverDetails.start_date
                          ? moment(serverDetails.start_date).format(
                              "DD/MM/YYYY"
                            )
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Expire Date
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {serverDetails && serverDetails.end_date
                          ? moment(serverDetails.end_date).format("DD/MM/YYYY")
                          : "-"}
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Drawer>
      {/* verify confirm modal */}
      <Modal
        open={isOpenConfirmModal}
        onCancel={() => {
          setIsOpenConfirmModal(false);
        }}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Verify The Server{" "}
          <span style={{ fontWeight: 700, color: "#333", fontSize: "14px" }}>
            {serverDetails && serverDetails.server_name
              ? `${serverDetails.server_name}`
              : "-"}
          </span>{" "}
          for{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            {serverDetails && serverDetails.name ? serverDetails.name : ""}
          </span>{" "}
          at a cost of{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            {serverDetails && serverDetails.server_cost
              ? "₹" + serverDetails.server_cost
              : ""}
          </span>
        </p>
        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={() => {
              setIsOpenConfirmModal(false);
            }}
          >
            No
          </Button>
          {verifyButtonLoading ? (
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
                handleServerStatus("Awaiting Approval");
              }}
            >
              Yes
            </Button>
          )}
        </div>
      </Modal>

      {/* server history drawer */}
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Server History</span>
            <div className="customer_history_drawer_totalcount_container">
              <span style={{ fontWeight: 600 }}>
                Total Activity: {serverHistory?.length || 0}
              </span>
              <span style={{ fontWeight: 600 }}>
                Current Status:{" "}
                <span
                  style={{
                    color: getHistoryStatusColor(
                      serverHistory?.[0]?.status || "N/A"
                    ),
                  }}
                >
                  {" "}
                  {serverHistory && serverHistory.length > 0
                    ? serverHistory[0].status
                    : "N/A"}
                </span>
              </span>
            </div>
          </div>
        }
        open={isOpenHistoryDrawer}
        onClose={() => {
          setIsOpenHistoryDrawer(false);
          setCustomerDetails(null);
        }}
        width="50%"
        style={{ position: "relative" }}
        className="customer_history_drawer"
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
                  {customerDetails && customerDetails.total_course_amount
                    ? "₹" + customerDetails.total_course_amount
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

        <div style={{ marginTop: "30px" }}>
          {serverHistoryLoading ? (
            <CommonSpinner />
          ) : (
            <ServerHistory data={serverHistory} />
          )}
        </div>
      </Drawer>
    </div>
  );
}
