import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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
  Input,
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
import CommonSelectField from "../Common/CommonSelectField";
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
  getAllDownlineUsers,
  getCustomerById,
  getServerHistory,
  getServerRequest,
  getTableColumns,
  insertServerTrack,
  sendNotification,
  serverIssue,
  updateServerStatus,
  updateTableColumns,
} from "../ApiService/action";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { BsPatchCheckFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import "./styles.css";
import ServerHistory from "./ServerHistory";
import ServerUpdateDetails from "./ServerUpdateDetails";
import ServerVerify from "./ServerVerify";
import ServerApproval from "./ServerApproval";
import ServerIssue from "./ServerIssue";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonDnd from "../Common/CommonDnd";
import CommonTextArea from "../Common/CommonTextArea";

export default function Server() {
  const scrollRef = useRef();
  const mounted = useRef(false);
  const location = useLocation();
  const serverUpdateDetailsRef = useRef();
  const serverVerifyRef = useRef();
  const serverApproveRef = useRef();
  const serverIssueRef = useRef();

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };
  //permissions
  const childUsers = useSelector((state) => state.childusers);
  const permissions = useSelector((state) => state.userpermissions);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [status, setStatus] = useState("");
  const [dateFilterType, setDateFilterType] = useState("Raise Date");
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [serverData, setServerData] = useState([]);
  const [statusCount, setStatusCount] = useState(null);
  const [loginUserId, setLoginUserId] = useState("");
  const [loading, setLoading] = useState(true);
  //view drawer
  const [isOpenViewDrawer, setIsOpenViewDrawer] = useState(false);
  //raise usestates
  const [isOpenRaiseModal, setIsOpenRaiseModal] = useState(false);
  //support usestates
  const [isOpenSupportModal, setIsOpenSupportModal] = useState(false);
  const [supportComment, setSupportComment] = useState("");
  const [supportCommentError, setSupportCommentError] = useState("");
  const [isOpenMoveToIssueModal, setIsOpenMoveToIssueModal] = useState(false);
  //hold usestates
  const [isOpenHoldModal, setIsOpenHoldModal] = useState(false);
  //drawer usestates
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState("");
  const [serverDetails, setServerDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [verifyButtonLoading, setVerifyButtonLoading] = useState(false);
  const [rejectButtonLoading, setRejectButtonLoading] = useState(false);
  //drawer history usestates
  const [verifyHistory, setVerifyHistory] = useState([]);
  //full history drawer useStates
  const [isOpenHistoryDrawer, setIsOpenHistoryDrawer] = useState(false);
  const [serverHistory, setServerHistory] = useState([]);
  const [serverHistoryLoading, setServerHistoryLoading] = useState(false);
  //lead executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allDownliners, setAllDownliners] = useState([]);
  //table dnd
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [updateTableId, setUpdateTableId] = useState(null);
  const [checkAll, setCheckAll] = useState(false);
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
      width: 110,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Raise Date",
      key: "server_raise_date",
      dataIndex: "server_raise_date",
      width: 110,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Created By",
      key: "created_by_id",
      dataIndex: "created_by_id",
      width: 150,
      render: (text, record) => {
        const lead_executive = `${
          text ? `${text} - ${record.created_by}` : "-"
        }`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      width: 180,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 120 },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Server Name",
      key: "server_name",
      dataIndex: "server_name",
      width: 180,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
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
                width: "260px",
                maxWidth: "none",
                whiteSpace: "normal",
              },
            }}
            title={
              <>
                <Row>
                  <Col span={12} style={{ marginBottom: "8px" }}>
                    {record.status == "Requested" ? (
                      <Checkbox
                        className="server_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (record.status == "Requested") {
                            setIsOpenRaiseModal(true);
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                          }
                        }}
                      >
                        Raise
                      </Checkbox>
                    ) : (
                      <div className="customers_classcompleted_container">
                        <BsPatchCheckFill color="#3c9111" />
                        <p className="customers_classgoing_completedtext">
                          Raised
                        </p>
                      </div>
                    )}
                  </Col>

                  <Col span={12} style={{ marginBottom: "8px" }}>
                    {record.status == "Requested" ||
                    record.status == "Server Raised" ||
                    record.status == "Verification Rejected" ||
                    record.status == "Approval Rejected" ||
                    record.status == "Server Rejected" ? (
                      <Checkbox
                        className="server_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (record.status == "Requested") {
                            CommonMessage("warning", "Server not raised yet");
                          } else {
                            if (
                              !permissions.includes("Server Details Update")
                            ) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setIsOpenDetailsDrawer(true);
                            setVerifyHistory(record.server_history);
                            setDrawerStatus("Update Details");
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                          }
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

                  <Col span={12} style={{ marginBottom: "8px" }}>
                    {record.status == "Requested" ||
                    record.status == "Server Raised" ||
                    record.status == "Awaiting Verify" ||
                    record.status == "Verification Rejected" ||
                    record.status == "Approval Rejected" ||
                    record.status == "Hold" ? (
                      <Checkbox
                        className="server_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (
                            record.status == "Awaiting Verify" ||
                            record.status == "Hold"
                          ) {
                            if (!permissions.includes("Server Verify")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setIsOpenDetailsDrawer(true);
                            setDrawerStatus("Verify");
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                          } else {
                            CommonMessage("warning", "Details not updated yet");
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

                  {record.status == "Awaiting Verify" ? (
                    <Col span={12} style={{ marginBottom: "8px" }}>
                      <Checkbox
                        className="server_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (!permissions.includes("Server Verify")) {
                            CommonMessage("error", "Access Denied");
                            return;
                          }

                          setIsOpenHoldModal(true);
                          setServerDetails(record);
                        }}
                      >
                        Hold
                      </Checkbox>
                    </Col>
                  ) : (
                    ""
                  )}

                  <Col span={12} style={{ marginBottom: "8px" }}>
                    {record.status == "Approved" ||
                    record.status == "Issued" ? (
                      <div className="customers_classcompleted_container">
                        <BsPatchCheckFill color="#3c9111" />
                        <p className="customers_classgoing_completedtext">
                          Approved
                        </p>
                      </div>
                    ) : (
                      <Checkbox
                        className="server_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (record.status == "Awaiting Approval") {
                            if (!permissions.includes("Server Approve")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setIsOpenDetailsDrawer(true);
                            setDrawerStatus("Approve");
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                          } else {
                            CommonMessage("warning", "Not verified yet");
                          }
                        }}
                      >
                        Approve
                      </Checkbox>
                    )}
                  </Col>

                  <Col span={12} style={{ marginBottom: "8px" }}>
                    {record.status == "Requested" ||
                    record.status == "Server Raised" ||
                    record.status == "Awaiting Verify" ||
                    record.status == "Verification Rejected" ||
                    record.status == "Awaiting Approval" ||
                    record.status == "Approval Rejected" ||
                    record.status == "Approved" ||
                    record.status == "Hold" ? (
                      <Checkbox
                        className="server_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (record.status == "Approved") {
                            if (!permissions.includes("Server Issue")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setIsOpenDetailsDrawer(true);
                            setDrawerStatus("Issue");
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                            return;
                          } else {
                            CommonMessage("warning", "Not approved yet");
                          }
                        }}
                      >
                        Issue
                      </Checkbox>
                    ) : (
                      <div className="customers_classcompleted_container">
                        <BsPatchCheckFill color="#3c9111" />
                        <p className="customers_classgoing_completedtext">
                          Issued
                        </p>
                      </div>
                    )}
                  </Col>
                </Row>
              </>
            }
          >
            {text == "Requested" ? (
              <div>
                <Button className="customers_status_awaitfeedback_button">
                  {text}
                </Button>
              </div>
            ) : text == "Server Raised" ? (
              <div>
                <Button className="customers_status_awaittrainer_button">
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
            ) : text == "Approved" ? (
              <div>
                <Button className="customers_status_classgoing_button">
                  {text}
                </Button>
              </div>
            ) : text == "Issued" ? (
              <div>
                <Button className="customers_status_completed_button">
                  Server Issued
                </Button>
              </div>
            ) : text == "Support" ? (
              <div>
                <Button className="customers_status_awaittrainerverify_button">
                  Support
                </Button>
              </div>
            ) : text == "Rejected" ||
              text == "Server Rejected" ||
              text == "Approval Rejected" ||
              text == "Verification Rejected" ||
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

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setSelectedDates(PreviousAndCurrentDate);
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setLoginUserId(convertAsJson?.user_id);
      getAllDownlineUsersData(convertAsJson?.user_id);
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
        rerunServerFilters(data, downliners_ids);
      } catch (error) {
        console.log("all downlines error", error);
      }
    };

    window.addEventListener("serverNotificationFilter", handler);
    return () =>
      window.removeEventListener("serverNotificationFilter", handler);
  }, []);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    setLoginUserId(convertAsJson?.user_id);
    setTimeout(() => {
      getTableColumnsData(convertAsJson?.user_id);
    }, 300);

    setTableColumns(nonChangeColumns);
  }, [permissions]);

  const getAllDownlineUsersData = async (user_id) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      // getServerRequestData(
      //   PreviousAndCurrentDate[0],
      //   PreviousAndCurrentDate[1],
      //   "Raise Date",
      //   downliners_ids,
      //   null,
      //   null,
      //   1,
      //   10,
      // );
      rerunServerFilters(location.state, downliners_ids);
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const rerunServerFilters = (stateData, downliners) => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();

    const receivedSearchValueFromNotification = stateData?.searchValue || null;
    const receivedStartDateFromNotification = stateData?.startDate || null;
    const receivedEndDateFromNotification = stateData?.endDate || null;

    if (receivedSearchValueFromNotification) {
      setFilterType(1);
      setSearchValue(receivedSearchValueFromNotification);
    }
    if (receivedStartDateFromNotification) {
      setDateFilterType(1);
      setSelectedDates([
        receivedStartDateFromNotification,
        receivedEndDateFromNotification,
      ]);
    } else {
      setSelectedDates(PreviousAndCurrentDate);
    }

    getServerRequestData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      "Raise Date",
      downliners,
      null,
      receivedSearchValueFromNotification,
      1,
      10,
    );
  };

  const getServerRequestData = async (
    startDate,
    endDate,
    dateType,
    downliners,
    serverStatus,
    searchvalue,
    pageNumber,
    limit,
  ) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      type: dateType,
      user_ids: downliners,
      ...(serverStatus && serverStatus == "Server Raised"
        ? {
            status: [
              "Server Raised",
              "Verification Rejected",
              "Approval Rejected",
            ],
          }
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

  const getTableColumnsData = async (user_id) => {
    try {
      const response = await getTableColumns(user_id);
      console.log("get table columns response", response);

      const data = response?.data?.data || [];
      if (data.length === 0) {
        return updateTableColumnsData();
      }

      const filterPage = data.find((f) => f.page_name === "Server");
      if (!filterPage) {
        setUpdateTableId(null);
        return updateTableColumnsData();
      }

      // --- ✅ Helper function to reattach render logic ---
      const attachRenderFunctions = (cols) =>
        cols.map((col) => {
          switch (col.key) {
            case "created_date":
              return {
                ...col,
                width: 110,
                render: (text) => {
                  return (
                    <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>
                  );
                },
              };
            case "server_raise_date":
              return {
                ...col,
                title: "Raise Date",
                width: 110,
                render: (text) => {
                  return (
                    <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>
                  );
                },
              };
            case "created_by_id":
              return {
                ...col,
                width: 150,
                render: (text, record) => {
                  const lead_executive = `${
                    text ? `${text} - ${record.created_by}` : "-"
                  }`;
                  return <EllipsisTooltip text={lead_executive} />;
                },
              };
            case "name":
              return {
                ...col,
                width: 180,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "email":
              return {
                ...col,
                width: 200,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "phone":
              return {
                ...col,
                width: 120,
              };
            case "server_name":
              return {
                ...col,
                width: 180,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "server_cost":
              return {
                ...col,
                hidden: true,
                width: 130,
                render: (text) => {
                  return <p>{text ? `₹${text}` : "-"}</p>;
                },
              };
            case "duration":
              return {
                ...col,
                width: 120,
                render: (text) => {
                  return <p>{text ? `${text} Days` : "-"}</p>;
                },
              };
            case "status":
              return {
                ...col,
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
                          width: "260px",
                          maxWidth: "none",
                          whiteSpace: "normal",
                        },
                      }}
                      title={
                        <>
                          <Row>
                            <Col span={12} style={{ marginBottom: "8px" }}>
                              {record.status == "Requested" ? (
                                <Checkbox
                                  className="server_statuscheckbox"
                                  checked={false}
                                  onChange={(e) => {
                                    if (record.status == "Requested") {
                                      setIsOpenRaiseModal(true);
                                      setServerDetails(record);
                                      getCustomerData(record.customer_id);
                                    }
                                  }}
                                >
                                  Raise
                                </Checkbox>
                              ) : (
                                <div className="customers_classcompleted_container">
                                  <BsPatchCheckFill color="#3c9111" />
                                  <p className="customers_classgoing_completedtext">
                                    Raised
                                  </p>
                                </div>
                              )}
                            </Col>

                            <Col span={12} style={{ marginBottom: "8px" }}>
                              {record.status == "Requested" ||
                              record.status == "Server Raised" ||
                              record.status == "Verification Rejected" ||
                              record.status == "Approval Rejected" ||
                              record.status == "Server Rejected" ? (
                                <Checkbox
                                  className="server_statuscheckbox"
                                  checked={false}
                                  onChange={(e) => {
                                    if (record.status == "Requested") {
                                      CommonMessage(
                                        "warning",
                                        "Server not raised yet",
                                      );
                                    } else {
                                      if (
                                        !permissions.includes(
                                          "Server Details Update",
                                        )
                                      ) {
                                        CommonMessage("error", "Access Denied");
                                        return;
                                      }
                                      setIsOpenDetailsDrawer(true);
                                      setVerifyHistory(record.server_history);
                                      setDrawerStatus("Update Details");
                                      setServerDetails(record);
                                      getCustomerData(record.customer_id);
                                    }
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

                            <Col span={12} style={{ marginBottom: "8px" }}>
                              {record.status == "Requested" ||
                              record.status == "Server Raised" ||
                              record.status == "Awaiting Verify" ||
                              record.status == "Verification Rejected" ||
                              record.status == "Approval Rejected" ||
                              record.status == "Hold" ? (
                                <Checkbox
                                  className="server_statuscheckbox"
                                  checked={false}
                                  onChange={(e) => {
                                    if (
                                      record.status == "Awaiting Verify" ||
                                      record.status == "Hold"
                                    ) {
                                      if (
                                        !permissions.includes("Server Verify")
                                      ) {
                                        CommonMessage("error", "Access Denied");
                                        return;
                                      }
                                      setIsOpenDetailsDrawer(true);
                                      setDrawerStatus("Verify");
                                      setServerDetails(record);
                                      getCustomerData(record.customer_id);
                                    } else {
                                      CommonMessage(
                                        "warning",
                                        "Details not updated yet",
                                      );
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

                            {record.status == "Awaiting Verify" ? (
                              <Col span={12} style={{ marginBottom: "8px" }}>
                                <Checkbox
                                  className="server_statuscheckbox"
                                  checked={false}
                                  onChange={(e) => {
                                    if (
                                      !permissions.includes("Server Verify")
                                    ) {
                                      CommonMessage("error", "Access Denied");
                                      return;
                                    }

                                    setIsOpenHoldModal(true);
                                    setServerDetails(record);
                                  }}
                                >
                                  Hold
                                </Checkbox>
                              </Col>
                            ) : (
                              ""
                            )}

                            <Col span={12} style={{ marginBottom: "8px" }}>
                              {record.status == "Approved" ||
                              record.status == "Issued" ||
                              record.status == "Support" ? (
                                <div className="customers_classcompleted_container">
                                  <BsPatchCheckFill color="#3c9111" />
                                  <p className="customers_classgoing_completedtext">
                                    Approved
                                  </p>
                                </div>
                              ) : (
                                <Checkbox
                                  className="server_statuscheckbox"
                                  checked={false}
                                  onChange={(e) => {
                                    if (record.status == "Awaiting Approval") {
                                      if (
                                        !permissions.includes("Server Approve")
                                      ) {
                                        CommonMessage("error", "Access Denied");
                                        return;
                                      }
                                      setIsOpenDetailsDrawer(true);
                                      setDrawerStatus("Approve");
                                      setServerDetails(record);
                                      getCustomerData(record.customer_id);
                                    } else {
                                      CommonMessage(
                                        "warning",
                                        "Not verified yet",
                                      );
                                    }
                                  }}
                                >
                                  Approve
                                </Checkbox>
                              )}
                            </Col>

                            <Col span={12} style={{ marginBottom: "8px" }}>
                              {record.status == "Requested" ||
                              record.status == "Server Raised" ||
                              record.status == "Awaiting Verify" ||
                              record.status == "Verification Rejected" ||
                              record.status == "Awaiting Approval" ||
                              record.status == "Approval Rejected" ||
                              record.status == "Approved" ||
                              record.status == "Hold" ? (
                                <Checkbox
                                  className="server_statuscheckbox"
                                  checked={false}
                                  onChange={(e) => {
                                    if (record.status == "Approved") {
                                      if (
                                        !permissions.includes("Server Issue")
                                      ) {
                                        CommonMessage("error", "Access Denied");
                                        return;
                                      }
                                      setIsOpenDetailsDrawer(true);
                                      setDrawerStatus("Issue");
                                      setServerDetails(record);
                                      getCustomerData(record.customer_id);
                                      return;
                                    } else {
                                      CommonMessage(
                                        "warning",
                                        "Not approved yet",
                                      );
                                    }
                                  }}
                                >
                                  Issue
                                </Checkbox>
                              ) : (
                                <div className="customers_classcompleted_container">
                                  <BsPatchCheckFill color="#3c9111" />
                                  <p className="customers_classgoing_completedtext">
                                    Issued
                                  </p>
                                </div>
                              )}
                            </Col>

                            {record.status == "Issued" ? (
                              <Col span={12} style={{ marginBottom: "8px" }}>
                                <button
                                  className="server_movetosupport_button"
                                  onClick={() => {
                                    setIsOpenSupportModal(true);
                                    setServerDetails(record);
                                  }}
                                >
                                  Move to Support
                                </button>
                              </Col>
                            ) : (
                              ""
                            )}

                            {record.status == "Support" ? (
                              <Col span={12} style={{ marginBottom: "8px" }}>
                                <button
                                  className="server_movetoissued_button"
                                  onClick={() => {
                                    setIsOpenMoveToIssueModal(true);
                                    setServerDetails(record);
                                  }}
                                >
                                  Move to Issued
                                </button>
                              </Col>
                            ) : (
                              ""
                            )}
                          </Row>
                        </>
                      }
                    >
                      {text == "Requested" ? (
                        <div>
                          <Button className="customers_status_awaitfeedback_button">
                            {text}
                          </Button>
                        </div>
                      ) : text == "Server Raised" ? (
                        <div>
                          <Button className="customers_status_awaittrainer_button">
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
                      ) : text == "Approved" ? (
                        <div>
                          <Button className="customers_status_classgoing_button">
                            {text}
                          </Button>
                        </div>
                      ) : text == "Issued" ? (
                        <div>
                          <Button className="customers_status_completed_button">
                            Server Issued
                          </Button>
                        </div>
                      ) : text == "Support" ? (
                        <div>
                          <Button className="customers_status_awaittrainerverify_button">
                            Support
                          </Button>
                        </div>
                      ) : text == "Rejected" ||
                        text == "Server Rejected" ||
                        text == "Approval Rejected" ||
                        text == "Verification Rejected" ||
                        text == "Hold" ? (
                        <div>
                          <Button className="trainers_rejected_button">
                            {text}
                          </Button>
                        </div>
                      ) : (
                        <p>{text}</p>
                      )}
                    </Tooltip>
                  );
                },
              };
            case "action":
              return {
                ...col,
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
              };
            default:
              return col;
          }
        });

      // --- ✅ Process columns ---
      setUpdateTableId(filterPage.id);

      const allColumns = attachRenderFunctions(filterPage.column_names);
      const visibleColumns = attachRenderFunctions(
        filterPage.column_names.filter((col) => col.isChecked),
      );

      setColumns(allColumns);
      setTableColumns(visibleColumns);

      console.log("Visible columns:", visibleColumns);
    } catch (error) {
      console.error("get table columns error", error);
    }
  };

  const updateTableColumnsData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Server",
      column_names: columns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
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
        dateFilterType,
        allDownliners,
        status,
        e.target.value,
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
      getServerRequestData(
        selectedDates[0],
        selectedDates[1],
        dateFilterType,
        downliners_ids,
        status,
        searchValue,
        1,
        pagination.limit,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getServerRequestData(
      selectedDates[0],
      selectedDates[1],
      dateFilterType,
      allDownliners,
      status,
      searchValue,
      page,
      limit,
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

  const handleServerStatus = async (updateStatus) => {
    let supportCommentValidate = "";
    if (updateStatus == "Support") {
      supportCommentValidate = addressValidator(supportComment);
    } else {
      supportCommentValidate = "";
    }

    setSupportCommentError(supportCommentValidate);

    if (supportCommentValidate) return;

    setVerifyButtonLoading(true);
    const today = new Date();
    const payload = {
      ...(updateStatus == "Server Raised" ? { server_raise_date: today } : {}),
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
      status: updateStatus,
    };
    try {
      await updateServerStatus(payload);
      setTimeout(() => {
        setVerifyButtonLoading(false);
        handleServerTrack(updateStatus);
        drawerReset();
        getServerRequestData(
          selectedDates[0],
          selectedDates[1],
          dateFilterType,
          allDownliners,
          status,
          searchValue,
          1,
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

  const handleServerTrack = async (updateStatus) => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const supportDetails = {
      comments: supportComment,
    };

    const payload = {
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
      status: updateStatus,
      status_date: formatToBackendIST(today),
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      ...(updateStatus == "Support" ? { details: supportDetails } : {}),
    };
    try {
      await insertServerTrack(payload);
    } catch (error) {
      console.log("server track error", error);
    } finally {
      if (updateStatus == "Server Raised") {
        handleSendNotification();
      }
    }
  };

  const handleSendNotification = async () => {
    const today = new Date();
    const payload = {
      user_ids: [import.meta.env.PROD ? "ACC0003" : "DEV2119"],
      title: "Server Raised",
      message: {
        customer_name:
          customerDetails && customerDetails.name ? customerDetails.name : "-",
        customer_phonecode:
          customerDetails && customerDetails.phonecode
            ? customerDetails.phonecode
            : "-",
        customer_phone:
          customerDetails && customerDetails.phone
            ? customerDetails.phone
            : "-",
        customer_course:
          customerDetails && customerDetails.course_name
            ? customerDetails.course_name
            : "-",
        customer_raise_date: formatToBackendIST(today),
        customer_status:
          customerDetails && customerDetails.status
            ? customerDetails.status
            : "-",
      },
      created_at: formatToBackendIST(today),
    };
    try {
      await sendNotification(payload);
    } catch (error) {
      console.log("send notification error", error);
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
          "Something went wrong. Try again later",
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
    setDrawerStatus("");
    setIsOpenDetailsDrawer(false);
    setIsOpenHoldModal(false);
    setIsOpenRaiseModal(false);
    setIsOpenViewDrawer(false);
    setIsOpenSupportModal(false);
    setSupportComment("");
    setSupportCommentError("");
    setServerDetails(null);
    setButtonLoading(false);
    setRejectButtonLoading(false);
    setCustomerDetails(null);
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setSearchValue("");
    setSelectedUserId(null);
    setStatus("");
    setPagination({
      page: 1,
    });
    getAllDownlineUsersData(loginUserId);
  };

  return (
    <div>
      <Row style={{ marginBottom: "12px" }}>
        <Col xs={24} sm={24} md={24} lg={19}>
          <Row gutter={16}>
            <Col span={7}>
              <div className="overallduecustomers_filterContainer">
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
                            dateFilterType,
                            allDownliners,
                            status,
                            null,
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

            {permissions.includes("Lead Executive Filter") && (
              <Col span={7}>
                <div className="overallduecustomers_filterContainer">
                  <div style={{ flex: 1 }}>
                    <CommonSelectField
                      width="100%"
                      height="35px"
                      label="Select User"
                      labelMarginTop="0px"
                      labelFontSize="12px"
                      options={subUsers}
                      onChange={handleSelectUser}
                      value={selectedUserId}
                      disableClearable={false}
                    />
                  </div>
                </div>
              </Col>
            )}
            <Col span={10}>
              {/* <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getServerRequestData(
                    dates[0],
                    dates[1],
                    allDownliners,
                    status,
                    searchValue,
                    1,
                    pagination.limit,
                  );
                }}
              /> */}
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
                      getServerRequestData(
                        dates[0],
                        dates[1],
                        dateFilterType,
                        allDownliners,
                        status,
                        searchValue,
                        1,
                        pagination.limit,
                      );
                    }}
                  />
                </div>

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
                          value={dateFilterType}
                          onChange={(e) => {
                            console.log(e.target.value);
                            setDateFilterType(e.target.value);
                            getServerRequestData(
                              selectedDates[0],
                              selectedDates[1],
                              e.target.value,
                              allDownliners,
                              status,
                              searchValue,
                              1,
                              pagination.limit,
                            );
                          }}
                        >
                          <Radio
                            value="Raise Date"
                            style={{
                              marginTop: "6px",
                              marginBottom: "12px",
                            }}
                          >
                            Search by Raise Date
                          </Radio>
                          <Radio
                            value="Created Date"
                            style={{ marginBottom: "12px" }}
                          >
                            Search by Created Date
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
                </div>
              </div>
            </Col>
          </Row>
        </Col>

        <Col
          xs={24}
          sm={24}
          md={24}
          lg={5}
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
              getTableColumnsData(loginUserId);
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
                dateFilterType,
                allDownliners,
                null,
                searchValue,
                1,
                pagination.limit,
              );
            }}
          >
            <p>
              All{" "}
              {`( ${
                statusCount && statusCount.total != null
                  ? statusCount.total
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
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                dateFilterType,
                allDownliners,
                "Requested",
                searchValue,
                1,
                pagination.limit,
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
              status === "Server Raised"
                ? "customers_active_assigntrainers_container"
                : "customers_assigntrainers_container"
            }
            onClick={() => {
              if (status === "Server Raised") {
                return;
              }
              setStatus("Server Raised");
              setPagination({
                page: 1,
              });
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                dateFilterType,
                allDownliners,
                "Server Raised",
                searchValue,
                1,
                pagination.limit,
              );
            }}
          >
            <p>
              Server Raised{" "}
              {`(  ${
                statusCount &&
                statusCount.server_raised !== undefined &&
                statusCount.server_raised !== null
                  ? statusCount.server_raised
                  : "-"
              }
 )`}
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
                dateFilterType,
                allDownliners,
                "Awaiting Verify",
                searchValue,
                1,
                pagination.limit,
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
                dateFilterType,
                allDownliners,
                "Awaiting Approval",
                searchValue,
                1,
                pagination.limit,
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
              status === "Approved"
                ? "customers_active_classgoing_container"
                : "customers_classgoing_container"
            }
            onClick={() => {
              if (status === "Approved") {
                return;
              }
              setStatus("Approved");
              setPagination({
                page: 1,
              });
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                dateFilterType,
                allDownliners,
                "Approved",
                searchValue,
                1,
                pagination.limit,
              );
            }}
          >
            <p>
              Approved{" "}
              {`(  ${
                statusCount &&
                statusCount.server_approved !== undefined &&
                statusCount.server_approved !== null
                  ? statusCount.server_approved
                  : "-"
              }
 )`}
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
                dateFilterType,
                allDownliners,
                "Issued",
                searchValue,
                1,
                pagination.limit,
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
              status === "Support"
                ? "customers_active_verifytrainers_container"
                : "customers_verifytrainers_container"
            }
            onClick={() => {
              if (status === "Support") {
                return;
              }
              setStatus("Support");
              // getServerRequestData(
              //   selectedDates[0],
              //   selectedDates[1],
              //   dateFilterType,
              //   allDownliners,
              //   "Issued",
              //   searchValue,
              //   1,
              //   pagination.limit,
              // );
            }}
          >
            <p>
              Support{" "}
              {`( ${
                statusCount && statusCount.support ? statusCount.support : "-"
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
                dateFilterType,
                allDownliners,
                "Expired",
                searchValue,
                1,
                pagination.limit,
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
              status === "Hold"
                ? "customers_active_escalated_container"
                : "customers_escalated_container"
            }
            onClick={() => {
              if (status === "Hold") {
                return;
              }
              setStatus("Hold");
              getServerRequestData(
                selectedDates[0],
                selectedDates[1],
                dateFilterType,
                allDownliners,
                "Hold",
                searchValue,
                1,
                pagination.limit,
              );
            }}
          >
            <p>
              Hold{" "}
              {`( ${
                statusCount && statusCount.hold ? statusCount.hold : "-"
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
          // scroll={{ x: 1200 }}
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={tableColumns}
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
                <EllipsisTooltip
                  text={
                    customerDetails && customerDetails.current_location
                      ? customerDetails.current_location
                      : "-"
                  }
                  smallText={true}
                />
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
            <ServerUpdateDetails
              ref={serverUpdateDetailsRef}
              serverDetails={serverDetails}
              setButtonLoading={setButtonLoading}
              verifyHistory={verifyHistory}
              callgetServerApi={() => {
                drawerReset();
                getServerRequestData(
                  selectedDates[0],
                  selectedDates[1],
                  dateFilterType,
                  allDownliners,
                  status,
                  searchValue,
                  1,
                  pagination.limit,
                );
              }}
            />
          ) : drawerStatus == "Verify" ? (
            <ServerVerify
              ref={serverVerifyRef}
              serverDetails={serverDetails}
              setRejectButtonLoading={setRejectButtonLoading}
              callgetServerApi={() => {
                drawerReset();
                getServerRequestData(
                  selectedDates[0],
                  selectedDates[1],
                  dateFilterType,
                  allDownliners,
                  status,
                  searchValue,
                  1,
                  pagination.limit,
                );
              }}
            />
          ) : drawerStatus == "Approve" ? (
            <ServerApproval
              ref={serverApproveRef}
              serverDetails={serverDetails}
              setRejectButtonLoading={setRejectButtonLoading}
              callgetServerApi={() => {
                drawerReset();
                getServerRequestData(
                  selectedDates[0],
                  selectedDates[1],
                  dateFilterType,
                  allDownliners,
                  status,
                  searchValue,
                  1,
                  pagination.limit,
                );
              }}
            />
          ) : drawerStatus == "Issue" ? (
            <ServerIssue
              ref={serverIssueRef}
              serverDetails={serverDetails}
              setButtonLoading={setButtonLoading}
              callgetServerApi={() => {
                drawerReset();
                getServerRequestData(
                  selectedDates[0],
                  selectedDates[1],
                  dateFilterType,
                  allDownliners,
                  status,
                  searchValue,
                  1,
                  pagination.limit,
                );
              }}
            />
          ) : (
            ""
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
                    onClick={
                      drawerStatus == "Verify"
                        ? () =>
                            serverVerifyRef.current?.handleVerificationReject()
                        : drawerStatus == "Approve"
                          ? () =>
                              serverApproveRef.current?.handleApprovalReject()
                          : ""
                    }
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
                    ? () =>
                        serverUpdateDetailsRef.current?.handleUpdateDetails()
                    : drawerStatus == "Verify"
                      ? () => serverVerifyRef.current?.handleServerVerify()
                      : drawerStatus == "Approve"
                        ? () => serverApproveRef.current?.handleServerApprove()
                        : drawerStatus == "Issue"
                          ? () => serverIssueRef.current?.handleServerIssue()
                          : handleStatusMismatch
                }
              >
                {drawerStatus == "Update Details"
                  ? "Update"
                  : drawerStatus == "Verify"
                    ? "Verify"
                    : drawerStatus == "Approve"
                      ? "Approve"
                      : drawerStatus == "Issue"
                        ? "Issue"
                        : ""}
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
                              "DD/MM/YYYY",
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
                              "DD/MM/YYYY",
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
      {/* server raise confirm modal */}
      <Modal
        open={isOpenRaiseModal}
        onCancel={() => {
          setIsOpenRaiseModal(false);
        }}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Raise The Server for{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            {serverDetails && serverDetails.name ? serverDetails.name : ""}
          </span>{" "}
        </p>
        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={() => {
              setIsOpenRaiseModal(false);
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
                handleServerStatus("Server Raised");
              }}
            >
              Yes
            </Button>
          )}
        </div>
      </Modal>

      {/* server support confirm modal */}
      <Modal
        open={isOpenSupportModal}
        onCancel={() => {
          setIsOpenSupportModal(false);
          setSupportComment("");
          setSupportCommentError("");
          setServerDetails(null);
        }}
        footer={false}
        width="35%"
        zIndex={1100}
      >
        <CommonTextArea
          label="Comments"
          required={true}
          value={supportComment}
          onChange={(e) => {
            setSupportComment(e.target.value);
            setSupportCommentError(addressValidator(e.target.value));
          }}
          error={supportCommentError}
        />
        <div
          className="customer_classcompletemodal_button_container"
          style={{ justifyContent: "flex-end" }}
        >
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
                handleServerStatus("Support");
              }}
            >
              Submit
            </Button>
          )}
        </div>
      </Modal>

      {/* moveto issue confirm modal */}
      <Modal
        open={isOpenMoveToIssueModal}
        onCancel={() => {
          setIsOpenMoveToIssueModal(false);
          setServerDetails(null);
        }}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You want to move the server for{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            {serverDetails?.name || ""}
          </span>{" "}
          from Support Status to{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            Server Issued
          </span>{" "}
          Status?
        </p>

        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={() => {
              setIsOpenMoveToIssueModal(false);
              setServerDetails(null);
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
                handleServerStatus("Issued");
              }}
            >
              Yes
            </Button>
          )}
        </div>
      </Modal>

      {/* hold modal */}
      <Modal
        open={isOpenHoldModal}
        onCancel={() => {
          setIsOpenHoldModal(false);
        }}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Hold the Server for{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            {serverDetails && serverDetails.name ? serverDetails.name : ""}
          </span>{" "}
        </p>
        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={() => {
              setIsOpenHoldModal(false);
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
                handleServerStatus("Hold");
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
                      serverHistory?.[0]?.status || "N/A",
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
                <EllipsisTooltip
                  text={
                    customerDetails && customerDetails.current_location
                      ? customerDetails.current_location
                      : "-"
                  }
                  smallText={true}
                />
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
        onClose={() => {
          setIsOpenFilterDrawer(false);
        }}
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
                const visibleColumns = columns
                  .filter((col) => col.isChecked)
                  .map((col) => ({
                    ...col,
                    width: col.width || 150, // fallback width for consistent layout
                  }));
                console.log("visibleColumns", visibleColumns);
                setTableColumns(visibleColumns);
                setIsOpenFilterDrawer(false);

                const payload = {
                  user_id: loginUserId,
                  id: updateTableId,
                  page_name: "Server",
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
    </div>
  );
}
