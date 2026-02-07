import React, { useState, useRef, useEffect } from "react";
import {
  Row,
  Col,
  Tooltip,
  Button,
  Drawer,
  Checkbox,
  Modal,
  Divider,
} from "antd";
import { useLocation } from "react-router-dom";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { RedoOutlined } from "@ant-design/icons";
import { BsPatchCheckFill } from "react-icons/bs";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import {
  checkTicketEmail,
  getAllDownlineUsers,
  getAllTickets,
  getCustomers,
  getTicketTracks,
  getTrainers,
  ticketTrack,
  updateTicketStatus,
} from "../ApiService/action";
import {
  addressValidator,
  emailValidator,
  formatToBackendIST,
  getCurrentandPreviousweekDate,
} from "../Common/Validation";
import moment from "moment";
import { LuFileClock } from "react-icons/lu";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonTable from "../Common/CommonTable";
import CommonSpinner from "../Common/CommonSpinner";
import AddTicket from "./AddTicket";
import PrismaZoom from "react-prismazoom";
import AssignTicket from "./AssignTicket";
import TicketHistory from "./TicketHistory";
import CommonTextArea from "../Common/CommonTextArea";
import { CommonMessage } from "../Common/CommonMessage";
import { useSelector } from "react-redux";
import CommonSelectField from "../Common/CommonSelectField";
import { FaRegEye } from "react-icons/fa";
import TrainerFullDetailsModal from "../Trainers/TrainerFullDetailsModal";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";

export default function Tickets() {
  const scrollRef = useRef();
  const addTicketRef = useRef();
  const assignTicketRef = useRef();
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

  // ----------usestates----------------
  const [loginUserId, setLoginUserId] = useState("");
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allDownliners, setAllDownliners] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [status, setStatus] = useState("");
  const [statusCounts, setStatusCounts] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);
  const [isOpenAttachmentScreenshotModal, setIsOpenAttachmentScreenshotModal] =
    useState(false);
  const [attachmentScreenshot, setAttachmentScreenshot] = useState("");
  const [loading, setLoading] = useState(true);
  //-------------form usestates-----------------------
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [trainersData, setTrainersData] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  //-------------drawer usestates---------------------
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState("");
  const [ticketDetails, setTicketDetails] = useState(null);
  //----------history usestates----------------------
  const [ticketHistoryData, setTicketHistoryData] = useState([]);
  //-------------hold usestates-----------------------
  const [isOpenHoldModal, setIsOpenHoldModal] = useState(false);
  const [holdComment, setHoldComment] = useState("");
  const [holdCommentError, setHoldCommentError] = useState("");
  //trainer details modal
  const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
    useState(false);
  const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
  //customer details drawer
  const [isOpenCustomerDetailsDrawer, setIsOpenCustomerDetailsDrawer] =
    useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingRowId, setLoadingRowId] = useState(null);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);
  //-------------ticket closed usestates-----------------------
  const [isOpenCloseModal, setIsOpenCloseModal] = useState(false);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: "Created At",
      key: "created_at",
      dataIndex: "created_at",
      width: 110,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Raised By",
      key: "raised_by_role",
      dataIndex: "raised_by_role",
      width: 130,
      render: (text, record) => {
        if (text) {
          return (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <p>{text}</p>
              <>
                {loadingRowId == record.ticket_id ? (
                  <CommonSpinner color="#333" />
                ) : (
                  <Tooltip
                    placement="top"
                    title="View Details"
                    trigger={["hover", "click"]}
                  >
                    <FaRegEye
                      size={14}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (text == "Trainer") {
                          const clickedTrainer = trainersData.filter(
                            (f) => f.id == record.raised_by_id,
                          );
                          console.log("clickedTrainer", clickedTrainer);
                          setClickedTrainerDetails(clickedTrainer);
                          setIsOpenTrainerDetailModal(true);
                        } else {
                          setLoadingRowId(record.ticket_id);
                          getParticularCustomerDetails(record.raised_by_email);
                        }
                      }}
                    />
                  </Tooltip>
                )}
              </>
            </div>
          );
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "Ticket Handler",
      key: "assigned_to_name",
      dataIndex: "assigned_to_name",
      width: 150,
      render: (text, record) => {
        const lead_executive = record.assigned_to
          ? `${record.assigned_to} - ${text}`
          : "-";
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: "Title",
      key: "title",
      dataIndex: "title",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Category",
      key: "category_name",
      dataIndex: "category_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Sub Category",
      key: "sub_category_name",
      dataIndex: "sub_category_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Priority",
      key: "priority",
      dataIndex: "priority",
      width: 100,
      render: (text) => {
        if (text) {
          return (
            <div
              className={
                text == "High"
                  ? "leadmanager_leadstatus_high_container"
                  : text == "Medium"
                    ? "leadmanager_leadstatus_medium_container"
                    : text == "Low"
                      ? "leadmanager_leadstatus_low_container"
                      : "leadmanager_leadstatus_junk_container"
              }
            >
              <p>{text}</p>
            </div>
          );
        } else {
          <p>-</p>;
        }
      },
    },
    {
      title: "Type",
      key: "type",
      dataIndex: "type",
      width: 100,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
      width: 140,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Attachment",
      key: "attachments",
      dataIndex: "attachments",
      width: 150,
      render: (text) => {
        if (text.length >= 1) {
          return (
            <button
              className="pendingcustomer_paymentscreenshot_viewbutton"
              style={{ fontWeight: 500 }}
              onClick={() => {
                setIsOpenAttachmentScreenshotModal(true);
                setAttachmentScreenshot(text[0].base64string);
              }}
            >
              View Attachment
            </button>
          );
        } else {
          <p>-</p>;
        }
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: 150,
      fixed: "right",
      render: (text, record) => {
        return (
          <>
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
                    {record.status != "Closed" ? (
                      <Col span={12} style={{ marginBottom: "8px" }}>
                        <Checkbox
                          className="server_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            setIsOpenDetailsDrawer(true);
                            setTicketDetails(record);
                            setDrawerStatus("Assign Ticket");
                          }}
                        >
                          Assigned to
                        </Checkbox>
                      </Col>
                    ) : (
                      <Col span={12} style={{ marginBottom: "8px" }}>
                        <div className="customers_classcompleted_container">
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Assigned
                          </p>
                        </div>
                      </Col>
                    )}

                    {record.status == "Assign" || record.status === "Hold" ? (
                      <Col span={12} style={{ marginBottom: "8px" }}>
                        <Checkbox
                          className="server_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            setTicketDetails(record);
                            setIsOpenHoldModal(true);
                          }}
                        >
                          Hold
                        </Checkbox>
                      </Col>
                    ) : (
                      ""
                    )}

                    {record.status == "Open" ||
                    record.status == "Assigned" ||
                    record.status == "Hold" ? (
                      <Col span={12} style={{ marginBottom: "8px" }}>
                        <Checkbox
                          className="server_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            setIsOpenDetailsDrawer(true);
                            setTicketDetails(record);
                            setDrawerStatus("Close Request");
                          }}
                        >
                          Close Request
                        </Checkbox>
                      </Col>
                    ) : (
                      <Col span={12} style={{ marginBottom: "8px" }}>
                        <div className="customers_classcompleted_container">
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Close Request
                          </p>
                        </div>
                      </Col>
                    )}

                    {record.status != "Closed" ? (
                      <Col span={12} style={{ marginBottom: "8px" }}>
                        <Checkbox
                          className="server_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status == "Close Request") {
                              setTicketDetails(record);
                              setIsOpenCloseModal(true);
                            } else {
                              CommonMessage(
                                "warning",
                                "This ticket is not in a close request.",
                              );
                            }
                          }}
                        >
                          Close Ticket
                        </Checkbox>
                      </Col>
                    ) : (
                      <Col span={12} style={{ marginBottom: "8px" }}>
                        <div className="customers_classcompleted_container">
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Closed
                          </p>
                        </div>
                      </Col>
                    )}
                  </Row>
                </>
              }
            >
              {text === "Open" ? (
                <Button className="customers_status_classscheduled_button">
                  Open
                </Button>
              ) : text === "Assigned" ? (
                <Button className="customers_status_awaittrainer_button">
                  Assigned
                </Button>
              ) : text === "Hold" ? (
                <Button className="trainers_pending_button">Hold</Button>
              ) : text === "Overdue" ? (
                <Button className="trainers_rejected_button">Overdue</Button>
              ) : text === "Close Request" ? (
                <div>
                  <Button className="customers_status_awaittrainerverify_button">
                    Close Request
                  </Button>
                </div>
              ) : text === "Closed" ? (
                <Button className="customers_status_completed_button">
                  Closed
                </Button>
              ) : (
                <p style={{ marginLeft: "6px" }}>-</p>
              )}
            </Tooltip>
          </>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: 100,
      fixed: "right",
      render: (text, record) => {
        return (
          <Tooltip
            placement="top"
            title="View Ticket History"
            trigger={["hover", "click"]}
          >
            <LuFileClock
              size={15}
              className="trainers_action_icons"
              onClick={() => {
                setTicketDetails(record);
                setIsOpenDetailsDrawer(true);
                setDrawerStatus("Ticket History");
                getTicketTrackData(record.ticket_id);
                // setCustomerDetails(record);
                // getCustomerHistoryData(record.id);
                // setTimeout(() => {
                //   const container = document.getElementById(
                //     "customer_history_profilecontainer",
                //   );
                //   container.scrollIntoView({
                //     behavior: "smooth",
                //     block: "start",
                //   });
                // }, 300);
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      getTrainersData();
    }
  }, [childUsers]);

  const getTrainersData = async () => {
    const payload = {
      status: "Verified",
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getTrainers(payload);
      setTrainersData(response?.data?.data?.trainers || []);
    } catch (error) {
      setTrainersData([]);
      console.log(error);
    } finally {
      setTimeout(() => {
        // getCategoriesData();
        getAllDownlineUsersData(null);
      }, 300);
    }
  };

  useEffect(() => {
    const handler = async (e) => {
      const data = e.detail;
      console.log("Received via event:", data, allDownliners);
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
        rerunTicketsFilters(data, downliners_ids);
      } catch (error) {
        console.log("all downlines error", error);
      }
    };

    window.addEventListener("serverNotificationFilter", handler);
    return () =>
      window.removeEventListener("serverNotificationFilter", handler);
  }, []);

  const getAllDownlineUsersData = async (user_id) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    setLoginUserId(convertAsJson.user_id);

    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
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

      setTimeout(() => {
        // getTicketsData(
        //   PreviousAndCurrentDate[0],
        //   PreviousAndCurrentDate[1],
        //   downliners_ids,
        //   "",
        //   1,
        //   10,
        // );
        rerunTicketsFilters(location.state, downliners_ids);
      }, 300);
    } catch (error) {
      setTicketsData([]);
      console.log("all downlines error", error);
    }
  };

  const rerunTicketsFilters = (stateData, downliners) => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();

    const receivedStartDateFromNotification = stateData?.startDate || null;
    const receivedEndDateFromNotification = stateData?.endDate || null;

    if (receivedStartDateFromNotification) {
      setSelectedDates([
        receivedStartDateFromNotification,
        receivedEndDateFromNotification,
      ]);
    } else {
      setSelectedDates(PreviousAndCurrentDate);
    }

    getTicketsData(
      receivedStartDateFromNotification
        ? receivedStartDateFromNotification
        : PreviousAndCurrentDate[0],
      receivedEndDateFromNotification
        ? receivedEndDateFromNotification
        : PreviousAndCurrentDate[1],
      downliners,
      null,
      1,
      10,
    );
  };

  const getTicketsData = async (
    startDate,
    endDate,
    downliners,
    status,
    pageNumber,
    limit,
  ) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: downliners,
      status: status,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getAllTickets(payload);
      console.log("tickets response", response);
      // Extract data from response
      const responseData = response?.data?.data?.tickets || [];
      const paginationData = response?.data?.data?.pagination || {};
      const statusCountsData = response?.data?.data?.statusCount || {};

      // Set payment requests data
      setTicketsData(responseData);

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
      setTicketsData([]);
      console.log("get tickets error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleEmail = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (validationTrigger) {
      let emailValidate = emailValidator(value);
      setEmailError(emailValidate);

      if (emailValidate == "") {
        const payload = {
          email: value,
        };
        setTimeout(async () => {
          try {
            const response = await checkTicketEmail(payload);
            console.log("email response", response);
            setEmailError(
              response?.data?.data?.status == false ? " is not valid" : "",
            );
            // setSubCategoryOptions(response?.data?.data || []);
          } catch (error) {
            // setSubCategoryOptions([]);
            console.log("email error", error);
          }
        }, 300);
      }
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
    getTicketsData(
      selectedDates[0],
      selectedDates[1],
      allDownliners,
      status,
      page,
      limit,
    );
  };

  const handleStatusMismatch = () => {
    CommonMessage("error", "Status Mismatch. Contact Support Team");
  };

  const getTicketTrackData = async (ticketId) => {
    try {
      const response = await getTicketTracks(ticketId);
      console.log("track response", response);
      setTicketHistoryData(response?.data?.data || []);
    } catch (error) {
      setTicketHistoryData([]);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleTicketStatus = async (updateStatus) => {
    setButtonLoading(true);
    const today = new Date();

    const payload = {
      ticket_id: ticketDetails?.ticket_id ?? null,
      status: updateStatus,
      updated_at: formatToBackendIST(today),
    };

    try {
      await updateTicketStatus(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated");
        drawerReset();
        handleTicketTrack(updateStatus);
        getTicketsData(
          selectedDates[0],
          selectedDates[1],
          allDownliners,
          status,
          pagination.page,
          pagination.limit,
        );
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      console.log("update ticker status error", error);
    }
  };

  const handleTicketTrack = async (updateStatus) => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const payload = {
      ticket_id: ticketDetails?.ticket_id ?? null,
      assigned_to: "",
      status: updateStatus,
      created_date: formatToBackendIST(today),
      details: updateStatus == "Hold" ? holdComment : "",
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
    };
    console.log("payloaddd", payload);

    try {
      await ticketTrack(payload);
    } catch (error) {
      console.log("ticket track error", error);
    }
  };

  const drawerReset = () => {
    setButtonLoading(false);
    setIsOpenDetailsDrawer(false);
    setTicketDetails(null);
    setDrawerStatus("");
    setIsOpenHoldModal(false);
    setHoldComment("");
    setHoldCommentError("");
    setIsOpenCloseModal(false);
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
      getTicketsData(
        selectedDates[0],
        selectedDates[1],
        downliners_ids,
        status,
        1,
        pagination.limit,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getParticularCustomerDetails = async (customerEmail) => {
    setCustomerDetailsLoading(true);
    const payload = {
      email: customerEmail,
    };
    try {
      const response = await getCustomers(payload);
      const customer_details = response?.data?.data?.customers[0];
      console.log("customer full details", customer_details);
      setCustomerDetails(customer_details);
      setLoadingRowId(null);
      setCustomerDetailsLoading(false);
      setIsOpenCustomerDetailsDrawer(true);
    } catch (error) {
      setCustomerDetailsLoading(false);
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
      setLoadingRowId(null);
    }
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
    getTicketsData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      allDownliners,
      "",
      1,
      10,
    );
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <Row gutter={16}>
            <Col span={10}>
              <CommonSelectField
                height="35px"
                label="Select User"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={subUsers}
                onChange={handleSelectUser}
                value={selectedUserId}
                disableClearable={false}
              />
            </Col>
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    dates[0],
                    dates[1],
                    allDownliners,
                    status,
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
          lg={12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
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
        <Col span={17}>
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
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    "",
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
                  status === "Open"
                    ? "customers_active_classschedule_container"
                    : "customers_classschedule_container"
                }
                onClick={() => {
                  if (status === "Open") {
                    return;
                  }
                  setStatus("Open");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    "Open",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Open{" "}
                  {`(  ${
                    statusCounts &&
                    statusCounts.open !== undefined &&
                    statusCounts.open !== null
                      ? statusCounts.open
                      : "-"
                  }
 )`}
                </p>
              </div>
              <div
                className={
                  status === "Assigned"
                    ? "customers_active_assigntrainers_container"
                    : "customers_assigntrainers_container"
                }
                onClick={() => {
                  if (status === "Assigned") {
                    return;
                  }
                  setStatus("Assigned");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    "Assigned",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Assigned{" "}
                  {`(  ${
                    statusCounts &&
                    statusCounts.assigned !== undefined &&
                    statusCounts.assigned !== null
                      ? statusCounts.assigned
                      : "-"
                  }
 )`}
                </p>
              </div>
              <div
                className={
                  status === "Hold"
                    ? "trainers_active_verifypending_container"
                    : "customers_studentvefity_container"
                }
                onClick={() => {
                  if (status === "Hold") {
                    return;
                  }
                  setStatus("Hold");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    "Hold",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Hold{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.hold !== undefined &&
                    statusCounts.hold !== null
                      ? statusCounts.hold
                      : "-"
                  } )`}
                </p>
              </div>
              <div
                className={
                  status === "Close Request"
                    ? "customers_active_verifytrainers_container"
                    : "customers_verifytrainers_container"
                }
                onClick={() => {
                  if (status === "Close Request") {
                    return;
                  }
                  setStatus("Close Request");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    "Close Request",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Close Request{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.close_request !== undefined &&
                    statusCounts.close_request !== null
                      ? statusCounts.close_request
                      : "-"
                  } )`}
                </p>
              </div>
              <div
                className={
                  status === "Overdue"
                    ? "customers_active_escalated_container"
                    : "customers_escalated_container"
                }
                onClick={() => {
                  if (status === "Overdue") {
                    return;
                  }
                  setStatus("Overdue");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    "Overdue",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Overdue{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.overdue !== undefined &&
                    statusCounts.overdue !== null
                      ? statusCounts.overdue
                      : "-"
                  } )`}
                </p>
              </div>
              <div
                className={
                  status === "Closed"
                    ? "trainers_active_verifiedtrainers_container"
                    : "customers_completed_container"
                }
                onClick={() => {
                  if (status === "Closed") {
                    return;
                  }
                  setStatus("Closed");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    "Closed",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Closed{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.closed !== undefined &&
                    statusCounts.closed !== null
                      ? statusCounts.closed
                      : "-"
                  } )`}
                </p>
              </div>
            </div>
            <button
              onClick={() => scroll(900)}
              className="customer_statusscroll_button"
            >
              <IoMdArrowDropright size={25} />
            </button>
          </div>
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
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddDrawer(true);
            }}
          >
            Add Ticket
          </button>
        </Col>
      </Row>

      <div style={{ marginTop: "12px" }}>
        <CommonTable
          scroll={{
            x: columns.reduce((total, col) => total + (col.width || 150), 0),
          }}
          columns={columns}
          dataSource={ticketsData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
        />
      </div>

      <Drawer
        title="Add Ticket"
        open={isOpenAddDrawer}
        onClose={() => {
          setIsOpenAddDrawer(false);
          setButtonLoading(false);
        }}
        width="50%"
        className="customer_statusupdate_drawer"
        style={{ position: "relative", paddingBottom: 65 }}
      >
        {isOpenAddDrawer ? (
          <AddTicket
            ref={addTicketRef}
            trainersData={trainersData}
            setButtonLoading={setButtonLoading}
            callgetTicketApi={() => {
              setIsOpenAddDrawer(false);
              setButtonLoading(false);
              getTicketsData(
                selectedDates[0],
                selectedDates[1],
                allDownliners,
                status,
                pagination.page,
                pagination.limit,
              );
            }}
          />
        ) : (
          ""
        )}
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={() => addTicketRef.current.handleSubmit()}
              >
                {"Submit"}
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* update drawer */}
      <Drawer
        title={
          drawerStatus == "Ticket History" ? "Ticket History" : "Update Status"
        }
        open={isOpenDetailsDrawer}
        onClose={() => {
          setIsOpenDetailsDrawer(false);
          setTicketDetails(null);
          setDrawerStatus("");
        }}
        width="50%"
        style={{
          position: "relative",
          paddingBottom: drawerStatus == "Ticket History" ? "35px" : "65px",
        }}
        className="customer_statusupdate_drawer"
      >
        <div>
          <Row
            gutter={16}
            style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
          >
            <Col span={12}>
              <Row>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Created At</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip
                    text={
                      ticketDetails && ticketDetails.created_at
                        ? moment(ticketDetails.created_at).format("DD/MM/YYYY")
                        : "-"
                    }
                    smallText={true}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Title</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip
                    text={
                      ticketDetails && ticketDetails.title
                        ? ticketDetails.title
                        : "-"
                    }
                    smallText={true}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Category</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip
                    text={
                      ticketDetails && ticketDetails.category_name
                        ? ticketDetails.category_name
                        : "-"
                    }
                    smallText={true}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Sub Category</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {ticketDetails && ticketDetails.sub_category_name
                      ? ticketDetails.sub_category_name
                      : "-"}
                  </p>
                </Col>
              </Row>
            </Col>

            <Col span={12}>
              <Row>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Priority</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {ticketDetails && ticketDetails.priority
                      ? ticketDetails.priority
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Type</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip
                    text={
                      ticketDetails && ticketDetails.type
                        ? ticketDetails.type
                        : "-"
                    }
                    smallText={true}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Description</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip
                    text={
                      ticketDetails && ticketDetails.description
                        ? ticketDetails.description
                        : "-"
                    }
                    smallText={true}
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider className="customer_statusupdate_divider" />

          {drawerStatus == "Assign Ticket" ||
          drawerStatus == "Close Request" ? (
            <AssignTicket
              ref={assignTicketRef}
              drawerStatus={drawerStatus}
              ticketDetails={ticketDetails}
              setButtonLoading={setButtonLoading}
              callgetTicketsApi={() => {
                drawerReset();
                getTicketsData(
                  selectedDates[0],
                  selectedDates[1],
                  allDownliners,
                  status,
                  1,
                  pagination.limit,
                );
              }}
            />
          ) : drawerStatus == "Ticket History" ? (
            <TicketHistory data={ticketHistoryData} />
          ) : (
            ""
          )}

          {drawerStatus == "Ticket History" ? (
            ""
          ) : (
            <div className="leadmanager_tablefiler_footer">
              <div className="leadmanager_submitlead_buttoncontainer">
                {buttonLoading ? (
                  <button className="users_adddrawer_loadingcreatebutton">
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className="users_adddrawer_createbutton"
                    onClick={
                      drawerStatus == "Assign Ticket" ||
                      drawerStatus == "Close Request"
                        ? () => assignTicketRef.current?.handleTicketTrack()
                        : handleStatusMismatch
                    }
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* attachment screenshot modal */}
      <Modal
        title="Attachment"
        open={isOpenAttachmentScreenshotModal}
        onCancel={() => {
          setIsOpenAttachmentScreenshotModal(false);
          setAttachmentScreenshot("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {attachmentScreenshot ? (
              <img
                src={`data:image/png;base64,${attachmentScreenshot}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>

      {/* hold modal */}
      <Modal
        open={isOpenHoldModal}
        onCancel={drawerReset}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <CommonTextArea
          label="Comments"
          required={true}
          value={holdComment}
          onChange={(e) => {
            setHoldComment(e.target.value);
            setHoldCommentError(addressValidator(e.target.value));
          }}
          error={holdCommentError}
        />

        <div
          className="customer_classcompletemodal_button_container"
          style={{ justifyContent: "flex-end" }}
        >
          {buttonLoading ? (
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
              onClick={() => handleTicketStatus("Hold")}
            >
              Submit
            </Button>
          )}
        </div>
      </Modal>

      {/* server raise confirm modal */}
      <Modal
        open={isOpenCloseModal}
        onCancel={drawerReset}
        footer={false}
        width="30%"
        zIndex={1100}
      >
        <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Close the Ticket{" "}
        </p>
        <div className="customer_classcompletemodal_button_container">
          <Button
            className="customer_classcompletemodal_cancelbutton"
            onClick={drawerReset}
          >
            No
          </Button>
          {buttonLoading ? (
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
                handleTicketStatus("Closed");
              }}
            >
              Yes
            </Button>
          )}
        </div>
      </Modal>

      <TrainerFullDetailsModal
        open={isOpenTrainerDetailModal}
        onClose={() => {
          setIsOpenTrainerDetailModal(false);
          setClickedTrainerDetails([]);
        }}
        trainerDetails={clickedTrainerDetails}
      />

      {/* customer fulldetails drawer */}
      <Drawer
        title="Customer Details"
        open={isOpenCustomerDetailsDrawer}
        onClose={() => {
          setIsOpenCustomerDetailsDrawer(false);
          setCustomerDetails(null);
          //   setPaymentValidationTrigger(false);
        }}
        width="50%"
        style={{ position: "relative" }}
      >
        {isOpenCustomerDetailsDrawer ? (
          <ParticularCustomerDetails
            customerDetails={customerDetails}
            isCustomerPage={true}
          />
        ) : (
          ""
        )}
      </Drawer>
    </div>
  );
}
