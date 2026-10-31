import React, { useState, useEffect, useRef, useMemo } from "react";
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
} from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import CommonSelectField from "../Common/CommonSelectField";
import { FaRegCopy } from "react-icons/fa6";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import CommonTable from "../Common/CommonTable";
import { FiFilter } from "react-icons/fi";
import { RedoOutlined } from "@ant-design/icons";
import { LuFileClock } from "react-icons/lu";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  addressValidator,
  formatToBackendIST,
  getCurrentandPreviousweekDate,
  getPreviousYearDec26ToCurrentYearDec25,
  regionOptions,
  selectValidator,
} from "../Common/Validation";
import {
  getAllDownlineUsers,
  getBranches,
  getCustomerById,
  getServerRequest,
  getTableColumns,
  getUsers,
  inserCustomerTrack,
  sendNotification,
  updateServerStatus,
  updateTableColumns,
} from "../ApiService/action";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { BsPatchCheckFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import "./styles.css";
import ServerUpdateDetails from "./ServerUpdateDetails";
import ServerVerify from "./ServerVerify";
import ServerApproval from "./ServerApproval";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonDnd from "../Common/CommonDnd";
import CommonTextArea from "../Common/CommonTextArea";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import OverflowTooltip from "../Common/OverflowTooltip";
import CustomerOverviewSkeleton from "../Customers/CustomerOverviewSkeleton";
import CustomerOverview from "../Customers/CustomerOverview";
import CandidateNumberWithWhatsApp from "../Common/CandidateNumberWithWhatsApp";
import CustomerHistory from "../Customers/CustomerHistory";
import ViewServerDetails from "./ViewServerDetails";
import ScrollableTabContainer from "../Common/ScrollableTabContainer";
import ServerIssue from "./ServerIssue";
import CustomerStatusRenderer from "../Customers/CustomerStatusRenderer";

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
  //filter usestates
  const statusBuckets = [
    {
      label: "All",
      value: "",
      countKey: "total",
      activeClass: "trainers_active_all_container",
      inactiveClass: "trainers_all_container",
    },
    {
      label: "Server Required",
      value: "Requested",
      countKey: "requested",
      activeClass: "trainers_active_formpending_container",
      inactiveClass: "customers_feedback_container",
    },
    {
      label: "Server Raised",
      value: "Server Raised",
      countKey: "server_raised",
      activeClass: "customers_active_assigntrainers_container",
      inactiveClass: "customers_assigntrainers_container",
    },
    {
      label: "Link Sent",
      value: "Awaiting Verify",
      countKey: "awaiting_verify",
      activeClass: "trainers_active_verifypending_container",
      inactiveClass: "customers_studentvefity_container",
    },
    {
      label: "Approval Rejected",
      value: "Approval Rejected",
      countKey: "approval_rejected",
      activeClass: "customers_active_escalated_container",
      inactiveClass: "customers_escalated_container",
    },
    {
      label: "Purchased",
      value: "Purchased",
      countKey: "Purchased",
      activeClass: "customers_active_classgoing_container",
      inactiveClass: "customers_classgoing_container",
    },
    {
      label: "Server Issued",
      value: "Issued",
      countKey: "issued",
      activeClass: "trainers_active_verifiedtrainers_container",
      inactiveClass: "customers_completed_container",
    },
    {
      label: "Expired Servers",
      value: "Expired",
      countKey: "expired",
      activeClass: "customers_active_awaitingclass_container",
      inactiveClass: "customers_awaitingclass_container",
    },
  ];
  const [status, setStatus] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("");
  const [raisedDates, setRaisedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [regionCounts, setRegionCounts] = useState(null);
  const [statusCount, setStatusCount] = useState(null);
  //datas usestates
  const [serverData, setServerData] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  const [isStatusUpdateDrawerLoading, setIsStatusUpdateDrawerLoading] =
    useState(false);
  const [loading, setLoading] = useState(true);
  //view drawer
  const [isOpenViewDrawer, setIsOpenViewDrawer] = useState(false);
  //raise usestates
  const [isOpenRaiseModal, setIsOpenRaiseModal] = useState(false);
  const [requestServerDuration, setRequestServerDuration] = useState("");
  const [requestServerDurationError, setRequestServerDurationError] =
    useState("");
  //support usestates
  const [isOpenSupportModal, setIsOpenSupportModal] = useState(false);
  const [supportComment, setSupportComment] = useState("");
  const [supportCommentError, setSupportCommentError] = useState("");
  const [isOpenMoveToIssueModal, setIsOpenMoveToIssueModal] = useState(false);
  //drawer usestates
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState("");
  const [serverDetails, setServerDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [verifyButtonLoading, setVerifyButtonLoading] = useState(false);
  const [rejectButtonLoading, setRejectButtonLoading] = useState(false);
  //lead executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const prevSelectedUserIdRef = useRef("[]");
  const [allDownliners, setAllDownliners] = useState([]);
  const [defaultAllDownliners, setDefaultAllDownliners] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  //table dnd
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [updateTableId, setUpdateTableId] = useState(null);
  const [checkAll, setCheckAll] = useState(false);
  //customer history usestates
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [selectedHistoryCustomerId, setSelectedHistoryCustomerId] =
    useState(null);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const formatDuration = (dateString) => {
    const createdUTC = new Date(dateString);
    const createdIST = new Date(createdUTC.getTime() - 5.5 * 60 * 60 * 1000);

    const now = new Date();
    const diffMs = now - createdIST;

    if (diffMs < 0) return { text: "00:00", hours: 0 };

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalHours = totalSeconds / 3600;

    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const pad = (n) => String(n).padStart(2, "0");

    let text = "";

    if (days === 0) {
      const hh = pad(Math.floor(totalSeconds / 3600));
      text = `${hh}h:${pad(minutes)}m`;
    } else {
      text = `${pad(days)}d:${pad(hours)}h:${pad(minutes)}m`;
    }

    return { text, hours: totalHours };
  };

  const formatExpiryDuration = (expiryDate) => {
    if (!expiryDate) {
      return { text: "-", expired: false };
    }

    const expiry = new Date(expiryDate);
    const now = new Date();

    const diffMs = expiry.getTime() - now.getTime();

    if (Number.isNaN(expiry.getTime())) {
      return { text: "-", expired: false };
    }

    if (diffMs <= 0) {
      return { text: "Expired", expired: true };
    }

    const totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const pad = (n) => String(n).padStart(2, "0");

    let text;

    if (days === 0) {
      text = `${pad(hours)}h:${pad(minutes)}m`;
    } else {
      text = `${pad(days)}d:${pad(hours)}h:${pad(minutes)}m`;
    }

    return { text, expired: false };
  };

  const nonChangeColumns = [
    {
      title: "Joined On",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 100,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Raise Date",
      key: "server_raise_date",
      dataIndex: "server_raise_date",
      width: 120,
      render: (text) => {
        return (
          <EllipsisTooltip
            text={text ? moment(text).format("DD/MM/YYYY hh:mm A") : "-"}
          />
        );
      },
    },
    {
      title: "Raised Before",
      key: "raised_before",
      dataIndex: "server_raise_date",
      width: 130,
      render: (text) => {
        const { text: durationText, hours } = formatDuration(text);

        let bg = "#5b69ca1a";
        let color = "#5b69ca";

        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                background: bg,
                color: color,
                padding: "3px 8px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                display: "inline-block",
                minWidth: "75px",
                textAlign: "center",
              }}
            >
              {durationText}
            </span>
          </div>
        );
      },
    },
    {
      title: "Purchased At",
      key: "start_date",
      dataIndex: "trans_details",
      width: 110,
      render: (text, record) => {
        const start_date = record.trans_details?.[0]?.start_date;
        return (
          <EllipsisTooltip
            text={start_date ? moment(start_date).format("DD/MM/YYYY") : "-"}
          />
        );
      },
    },
    {
      title: "Issued On",
      key: "issued_date",
      dataIndex: "trans_details",
      width: 90,
      render: (text, record) => {
        const issued_date = record.trans_details?.[0]?.issued_date;
        return (
          <EllipsisTooltip
            text={issued_date ? moment(issued_date).format("DD/MM/YYYY") : "-"}
          />
        );
      },
    },
    {
      title: "Duration",
      key: "requested_duration",
      dataIndex: "requested_duration",
      width: 90,
      render: (text) => {
        return <p>{text ? `${text} Days` : "-"}</p>;
      },
    },
    {
      title: "Expires In",
      key: "expires_in",
      dataIndex: "trans_details",
      width: 110,
      render: (text, record) => {
        const end_date = record.trans_details?.[0]?.end_date;

        const { text: durationText, expired } = formatExpiryDuration(end_date);

        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                background: expired ? "#d32f2f1a" : "#5b69ca1a",
                color: expired ? "#d32f2f" : "#5b69ca",
                padding: "3px 8px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                display: "inline-block",
                minWidth: "75px",
                textAlign: "center",
              }}
            >
              {durationText}
            </span>
          </div>
        );
      },
    },
    {
      title: "Server Cost",
      key: "server_cost",
      dataIndex: "trans_details",
      width: 100,
      render: (text, record) => {
        const serverCost = record.trans_details?.[0]?.server_cost;

        return <EllipsisTooltip text={serverCost ? `₹${serverCost}` : "-"} />;
      },
    },
    {
      title: "Vendor",
      key: "vendor_id",
      dataIndex: "trans_details",
      width: 80,
      render: (text, record) => {
        const vendor = record.trans_details?.[0]?.vendor_id;

        return <EllipsisTooltip text={vendor ? `${vendor}` : "-"} />;
      },
    },
    {
      title: "Server Name",
      key: "server_name",
      dataIndex: "server_name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Candidate Name / ID",
      key: "name",
      dataIndex: "name",
      width: 160,
      render: (text, record) => {
        return (
          <div className="customers_candidatename_container">
            <EllipsisTooltip text={text} />
            {record.student_id && (
              <span className="customers_studentid_badge">
                {record.student_id}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Sale Executive",
      key: "created_by",
      dataIndex: "created_by",
      width: 110,
      render: (text, record) => {
        const salse_executive = `${record.created_by_view_user_id} - ${text}`;
        return (
          <div style={{ textAlign: "center", width: "100%" }}>
            <OverflowTooltip
              title={salse_executive}
              children={record.created_by_view_user_id}
            />
          </div>
        );
      },
    },
    {
      title: "Last Updated At",
      key: "last_updated_at",
      dataIndex: "last_updated_at",
      width: 120,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Candidate Status",
      key: "customer_status",
      dataIndex: "customer_status",
      fixed: "right",
      width: 160,
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
          <CustomerStatusRenderer
            text={text}
            record={record}
            classPercent={classPercent}
          />
        );
      },
    },
    {
      title: "Server Status",
      key: "status",
      dataIndex: "status",
      width: 150,
      fixed: "right",
      render: (text, record) => {
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
                  width: "260px",
                  maxWidth: "none",
                  whiteSpace: "normal",
                },
              }}
              title={
                <>
                  <Row>
                    <Col span={12}>
                      {record.status == "Requested" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status == "Requested") {
                              setIsOpenRaiseModal(true);
                              setServerDetails(record);
                              getCustomerData(record.customer_id);
                            }
                          }}
                        >
                          Raise Server
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "8px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Server Raised
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col span={12}>
                      {record.status == "Requested" ||
                      record.status == "Server Raised" ||
                      record.status == "Verification Rejected" ||
                      record.status == "Approval Rejected" ||
                      record.status == "Server Rejected" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
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
                              setDrawerStatus("Update Details");
                              setServerDetails(record);
                              getCustomerData(record.customer_id);
                            }
                          }}
                        >
                          Update Details
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "8px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Details Updated
                          </p>
                        </div>
                      )}
                    </Col>

                    {record.status == "Requested" ||
                    record.status == "Server Raised" ||
                    record.status == "Verification Rejected" ||
                    record.status == "Approval Rejected" ||
                    record.status == "Server Rejected" ||
                    record.status == "Purchased" ? (
                      <Checkbox
                        className="customers_statuscheckbox"
                        checked={false}
                        onChange={(e) => {
                          if (record.status == "Purchased") {
                            if (!permissions.includes("Server Issue")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setIsOpenDetailsDrawer(true);
                            setDrawerStatus("Issue");
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                          } else {
                            CommonMessage(
                              "warning",
                              "Server not purchased yet",
                            );
                          }
                        }}
                      >
                        Issue
                      </Checkbox>
                    ) : record.status == "Issued" ? (
                      <Col span={12}>
                        <div className="customers_classcompleted_container">
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Server Issued
                          </p>
                        </div>
                      </Col>
                    ) : (
                      ""
                    )}

                    {record.status == "Issued" || record.status == "Expired" ? (
                      <Col span={12}>
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (!permissions.includes("Server Re-Purchase")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                            setDrawerStatus("Re-Purchase");
                            setIsOpenDetailsDrawer(true);
                          }}
                        >
                          Re-Purchase
                        </Checkbox>
                      </Col>
                    ) : (
                      ""
                    )}

                    {record.status == "Issued" ? (
                      <Col span={12}>
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (!permissions.includes("Server Issue")) {
                              CommonMessage("error", "Access Denied");
                              return;
                            }
                            setServerDetails(record);
                            getCustomerData(record.customer_id);
                            setDrawerStatus("Re-Send");
                            setIsOpenDetailsDrawer(true);
                          }}
                        >
                          Re-Send
                        </Checkbox>
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
                    Required
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
                    Link Sent
                  </Button>
                </div>
              ) : text == "Awaiting Approval" ? (
                <div>
                  <Button className="customers_status_classscheduled_button">
                    {text}
                  </Button>
                </div>
              ) : text == "Approved" || text === "Purchased" ? (
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
              ) : text == "Expired" ? (
                <div>
                  <Button className="customers_status_awaitingclass_button">
                    {text}
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
            {record.status === "Awaiting Verify" && (
              <Tooltip
                placement="top"
                title="Copy server acknowledge link"
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
                      }/acknowledge-server-request/${record.trans_details[0].server_trans_id}/${record.customer_id}`,
                    );
                    CommonMessage("success", "Link Copied");
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
              title="View Candidate History"
              trigger={["hover", "click"]}
            >
              <LuFileClock
                size={15}
                className="trainers_action_icons"
                onClick={() => {
                  setSelectedHistoryCustomerId(record?.customer_id);
                  setIsOpenCustomerHistoryDrawer(true);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const getFilteredColumns = (cols) => {
    if (!cols) return [];

    let hiddenKeys = [];
    if (status === "Requested" || status === "") {
      hiddenKeys = [
        "server_raise_date",
        "raised_before",
        "expires_in",
        "server_name",
        "server_cost",
        "requested_duration",
        "vendor_id",
        "start_date",
        "issued_date",
      ];
    } else if (status === "Server Raised") {
      hiddenKeys = [
        "server_cost",
        "vendor_id",
        "expires_in",
        "start_date",
        "issued_date",
      ];
    } else if (status === "Awaiting Verify" || status === "Approval Rejected") {
      hiddenKeys = ["start_date", "expires_in", "issued_date"];
    } else if (status === "Purchased" || status === "Issued") {
      hiddenKeys =
        status === "Purchased"
          ? ["raised_before", "issued_date"]
          : ["raised_before"];
    } else if (status === "Expired") {
      hiddenKeys = ["raised_before", "expires_in"];
    } else {
      hiddenKeys = ["expires_in"];
    }

    return cols.filter(
      (col) =>
        !hiddenKeys.includes(col.key) && !hiddenKeys.includes(col.dataIndex),
    );
  };

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  // Drawer columns filtered by current bucket/status
  const drawerColumns = getFilteredColumns(columns);

  const handleSetDrawerColumns = (updatedDrawerColumnsOrUpdater) => {
    setColumns((prevColumns) => {
      const currentDrawerColumns = getFilteredColumns(prevColumns);
      const updatedDrawerColumns =
        typeof updatedDrawerColumnsOrUpdater === "function"
          ? updatedDrawerColumnsOrUpdater(currentDrawerColumns)
          : updatedDrawerColumnsOrUpdater;

      let drawerIdx = 0;
      const updatedColumns = prevColumns.map((col) => {
        const isDrawerCol = currentDrawerColumns.some((c) => c.key === col.key);
        if (isDrawerCol && drawerIdx < updatedDrawerColumns.length) {
          const replacement = updatedDrawerColumns[drawerIdx];
          drawerIdx++;
          return replacement;
        }
        return col;
      });

      if (drawerIdx < updatedDrawerColumns.length) {
        updatedColumns.push(...updatedDrawerColumns.slice(drawerIdx));
      }

      return updatedColumns;
    });
  };

  useEffect(() => {
    if (drawerColumns.length > 0) {
      const allChecked = drawerColumns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    } else {
      setCheckAll(false);
    }
  }, [drawerColumns]);

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      const PreviousAndCurrentDate = getPreviousYearDec26ToCurrentYearDec25();
      setSelectedDates(PreviousAndCurrentDate);
      const RaisedPreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setRaisedDates(RaisedPreviousAndCurrentDate);
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

  const getAllDownlineUsersData = async (user_id, isRefresh = false) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setDefaultAllDownliners(downliners_ids);
      rerunServerFilters(isRefresh ? null : location.state, downliners_ids);
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const rerunServerFilters = (stateData, downliners) => {
    const PreviousAndCurrentDate = getPreviousYearDec26ToCurrentYearDec25();

    const receivedSearchValueFromNotification = stateData?.searchValue || null;
    const receivedStatusValueFromNotification = stateData?.status || "";
    const receivedStartDateFromNotification =
      stateData?.startDate || PreviousAndCurrentDate[0];
    const receivedEndDateFromNotification =
      stateData?.endDate || PreviousAndCurrentDate[1];

    if (receivedSearchValueFromNotification) {
      setSearchValue(receivedSearchValueFromNotification);
    }

    setStatus(
      receivedStatusValueFromNotification
        ? receivedStatusValueFromNotification
        : "",
    );

    if (receivedStartDateFromNotification) {
      setSelectedDates([
        receivedStartDateFromNotification,
        receivedEndDateFromNotification,
      ]);
    } else {
      setSelectedDates(PreviousAndCurrentDate);
    }
    fetchServerRequestsData({
      startDate: receivedStartDateFromNotification,
      endDate: receivedEndDateFromNotification,
      dateType: "",
      raised_at: null,
      raised_end: null,
      regionId: null,
      branchId: null,
      downliners: downliners,
      serverStatus: "",
      searchvalue: receivedSearchValueFromNotification,
      pageNumber: 1,
      limit: 10,
    });
  };

  const fetchServerRequestsData = (overrides = {}) => {
    getServerRequestData(
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null,
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null,
      overrides.dateType !== undefined ? overrides.dateType : dateFilterType,
      overrides.raised_at !== undefined
        ? overrides.raised_at
        : raisedDates?.[0] || null,
      overrides.raised_end !== undefined
        ? overrides.raised_end
        : raisedDates?.[1] || null,
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId,
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId,
      overrides.downliners !== undefined ? overrides.downliners : allDownliners,
      overrides.serverStatus !== undefined ? overrides.serverStatus : status,
      overrides.searchvalue !== undefined ? overrides.searchvalue : searchValue,
      overrides.pageNumber !== undefined
        ? overrides.pageNumber
        : pagination?.page || 1,
      overrides.limit !== undefined ? overrides.limit : pagination?.limit || 10,
    );
  };

  const getServerRequestData = async (
    startDate,
    endDate,
    dateType,
    raised_at,
    raised_end,
    regionId,
    branchId,
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
      ...(serverStatus === "" || serverStatus === "Requested"
        ? {}
        : dateType
          ? { type: dateType }
          : {}),
      ...(serverStatus === "" || serverStatus === "Requested"
        ? {}
        : dateType
          ? { raised_at: raised_at }
          : {}),
      ...(serverStatus === "" || serverStatus === "Requested"
        ? {}
        : dateType
          ? { raised_end: raised_end }
          : {}),
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      ...(permissions.includes("View All Candidate Server Details")
        ? {}
        : { user_ids: downliners }),
      ...(serverStatus && serverStatus == "Server Raised"
        ? {
            status: ["Server Raised", "Verification Rejected"],
          }
        : { status: serverStatus }),
      ...(searchvalue && { search_filter: searchvalue }),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getServerRequest(payload);
      console.log("server response", response);
      setServerData(response?.data?.data?.data || []);
      setRegionCounts(response?.data?.data?.region_count || null);
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
      setRegionCounts(null);
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

      const filterPage = data.find((f) => f.page_name === "Server");

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
      fetchServerRequestsData({
        searchvalue: e.target.value,
        pageNumber: 1,
      });
    }, 300);
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
  };

  const handleSelectUserBlur = async () => {
    const value = selectedUserId;

    // if (!value || value.length <= 0) return;

    const stringifiedValue = JSON.stringify(value || []);
    if (prevSelectedUserIdRef.current === stringifiedValue) {
      return;
    }
    prevSelectedUserIdRef.current = stringifiedValue;

    try {
      const response = await getAllDownlineUsers(
        Array.isArray(value) && value.length > 0 ? value : loginUserId,
      );
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setPagination({
        page: 1,
      });
      fetchServerRequestsData({
        downliners: downliners_ids,
        pageNumber: 1,
      });
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const handleBucketClick = (config) => {
    if (status === config.value) {
      return;
    }

    const isPreviousDefaultStatus = status === "" || status === "Requested";

    const isTargetDefaultStatus =
      config.value === "" || config.value === "Requested";

    let date_type = dateFilterType;

    if (isTargetDefaultStatus) {
      // All / Server Required
      date_type = dateFilterType;
    } else if (isPreviousDefaultStatus) {
      // All / Server Required -> other buckets
      date_type = dateFilterType;
    }

    setDateFilterType(date_type);

    const extraOverrides = config.onClick?.() || {};

    const overrides = {
      serverStatus: config.value,
      dateType: date_type,
      pageNumber: 1,
      ...extraOverrides,
    };

    setStatus(config.value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    fetchServerRequestsData(overrides);
  };

  const getBranchesData = async (regionid) => {
    const payload = {
      region_id: regionid,
    };
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
    }
  };

  const getUsersData = async (regionId, branchId) => {
    const payload = {
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setSubUsers(response?.data?.data?.data || []);
    } catch (error) {
      setSubUsers([]);
      console.log("get all users error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    fetchServerRequestsData({
      pageNumber: page,
      limit: limit,
    });
  };

  const getCustomerData = async (customer_id) => {
    setIsStatusUpdateDrawerLoading(true);
    try {
      const response = await getCustomerById(customer_id);
      console.log("customer details", response);
      const customer_details = response?.data?.data || null;
      setCustomerDetails(customer_details);
      setIsStatusUpdateDrawerLoading(false);
    } catch (error) {
      setIsStatusUpdateDrawerLoading(false);
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
      ...(updateStatus == "Server Raised"
        ? { server_raise_date: formatToBackendIST(today) }
        : {
            server_raise_date:
              serverDetails && serverDetails.server_raise_date
                ? serverDetails.server_raise_date
                : null,
          }),
      ...(updateStatus == "Server Raised"
        ? { requested_duration: requestServerDuration }
        : {}),
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
      status: updateStatus,
    };
    try {
      await updateServerStatus(payload);

      // if(updateStatus == "Server Raised"){
      //   handleUpdateServerDetails();
      // }
      setTimeout(() => {
        setVerifyButtonLoading(false);
        handleCustomerTrack(updateStatus);
        drawerReset();
        fetchServerRequestsData({});
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

  const handleServerRePurchase = () => {};

  const handleCustomerTrack = async (updateStatus) => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const supportDetails = {
      comments: supportComment,
    };

    const changedFields = {};

    changedFields["request_server_duration"] = {
      previous_value: serverDetails.requested_duration,
      new_value: requestServerDuration,
    };

    const payload = {
      customers: [
        {
          customer_id: serverDetails.customer_id,
          status: updateStatus,
          updated_by:
            converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
          status_date: formatToBackendIST(new Date()),
          details: changedFields,
        },
      ],
    };
    try {
      await inserCustomerTrack(payload);
    } catch (error) {
      console.log("server track error", error);
    } finally {
      if (updateStatus == "Server Raised") {
        // handleSendNotification();
      }
    }
  };

  const handleSendNotification = async () => {
    const today = new Date();
    const payload = {
      user_ids: import.meta.env.PROD
        ? ["ACC0003", "BNG9001"] // production → two IDs
        : ["DEV2119"],
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

  const handleStatusMismatch = () => {
    CommonMessage("error", "Status Mismatch. Contact Support Team");
  };

  const drawerReset = () => {
    setDrawerStatus("");
    setIsOpenDetailsDrawer(false);
    setIsOpenRaiseModal(false);
    setRequestServerDuration("");
    setRequestServerDurationError("");
    setIsOpenViewDrawer(false);
    setIsOpenSupportModal(false);
    setSupportComment("");
    setSupportCommentError("");
    setServerDetails(null);
    setButtonLoading(false);
    setRejectButtonLoading(false);
    setIsOpenMoveToIssueModal(false);
    setCustomerDetails(null);
  };

  const handleSelectedRow = (row) => {
    console.log("selected rowwww", row);
    setSelectedRows(row);
    const keys = row.map((item) => item.id); // or your unique row key
    setSelectedRowKeys(keys);
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getPreviousYearDec26ToCurrentYearDec25();
    setSearchValue("");
    setSelectedUserId([]);
    prevSelectedUserIdRef.current = "[]";
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setSubUsers(downlineUsers);
    setDateFilterType("");
    setSelectedDates(PreviousAndCurrentDate);
    setStatus("");
    setPagination({
      page: 1,
    });
    getAllDownlineUsersData(loginUserId, true);
  };

  const filteredTableColumns = useMemo(() => {
    return getFilteredColumns(tableColumns);
  }, [tableColumns, status]);

  return (
    <div>
      <div className="admissions_overall_header">
        <div className="admissions_overall_indicator"></div>

        <div className="admissions_overall_content">
          <span className="admissions_overall_label">OverAll</span>

          <span className="admissions_overall_count">
            {statusCount?.total ?? 0}
          </span>
        </div>
      </div>

      <Row style={{ marginBottom: "12px" }} align="middle">
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={permissions.includes("Lead Executive Filter") ? 22 : 12}
          xxl={permissions.includes("Lead Executive Filter") ? 18 : 12}
        >
          <Row gutter={12} align="middle" wrap={false}>
            <Col flex="1 1 0%">
              <div
                className="overallduecustomers_filterContainer"
                style={{ marginBottom: "0px" }}
              >
                <CommonOutlinedInput
                  label={"Candidate Search..."}
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
                          fetchServerRequestsData({
                            searchvalue: "",
                            pageNumber: 1,
                          });
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
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                  onChange={handleSearch}
                  value={searchValue}
                />
              </div>
            </Col>

            {/* {permissions.includes("Lead Executive Filter") && (
              <Col span={7}>
                <div className="overallduecustomers_filterContainer">
                  <div style={{ flex: 1 }}>
                    <CommonMultiSelectField
                      height="34px"
                      label="Select User"
                      labelMarginTop="1px"
                      labelFontSize="11px"
                      options={subUsers}
                      onChange={handleSelectUser}
                      value={selectedUserId}
                    />
                  </div>
                </div>
              </Col>
            )} */}
            {permissions.includes("Lead Executive Filter") && (
              <>
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
                      setSelectedUserId([]);
                      setPagination({
                        page: 1,
                        limit: pagination.limit,
                      });
                      fetchServerRequestsData({
                        regionId: value,
                        branchId: null,
                        downliners: defaultAllDownliners,
                        pageNumber: 1,
                      });
                      if (value) {
                        getUsersData(value, null);
                        getBranchesData(value);
                      } else {
                        setBranchOptions([]);
                        setSubUsers(downlineUsers);
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedBranchId(value);
                      setSelectedUserId([]);
                      getUsersData(selectedRegionId, value);
                      setPagination({
                        page: 1,
                        limit: pagination.limit,
                      });
                      fetchServerRequestsData({
                        branchId: value,
                        downliners: defaultAllDownliners,
                        pageNumber: 1,
                      });
                    }}
                    value={selectedBranchId}
                    disableClearable={false}
                    disabled={selectedRegionId == 3 ? true : false}
                  />
                </Col>
                <Col flex="1 1 0%">
                  <CommonMultiSelectField
                    height="34px"
                    label="Select User"
                    labelMarginTop="1px"
                    labelFontSize="11px"
                    options={subUsers}
                    onChange={handleSelectUser}
                    onBlur={handleSelectUserBlur}
                    value={selectedUserId}
                  />
                </Col>
              </>
            )}
            <Col flex="1.5 1 0%">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "nowrap",
                  width: "100%",
                }}
              >
                <div style={{ flex: 1 }}>
                  <CommonMuiCustomDatePicker
                    label={"Filter by Joining Date"}
                    width="100%"
                    value={selectedDates}
                    onDateChange={(dates) => {
                      setSelectedDates(dates);
                      setPagination({
                        page: 1,
                      });
                      fetchServerRequestsData({
                        startDate: dates[0],
                        endDate: dates[1],
                        pageNumber: 1,
                      });
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Col>

        <Col
          xs={24}
          sm={24}
          md={24}
          lg={permissions.includes("Lead Executive Filter") ? 2 : 12}
          xxl={permissions.includes("Lead Executive Filter") ? 6 : 12}
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

      {/* <div className="customers_scroll_wrapper"> */}
      {/* <button
          onClick={() => scroll(-600)}
          className="customer_statusscroll_button"
        >
          <IoMdArrowDropleft size={25} />
        </button> */}
      <ScrollableTabContainer>
        {" "}
        {statusBuckets.map((config, index) => {
          const isActive = status === config.value;

          const count = statusCount?.[config.countKey] ?? "-";
          return (
            <div
              key={config.value || index}
              className={isActive ? config.activeClass : config.inactiveClass}
              onClick={() => handleBucketClick(config)}
            >
              <p>{`${config.label} (${count})`}</p>
            </div>
          );
        })}
      </ScrollableTabContainer>
      {/* <button
          onClick={() => scroll(600)}
          className="customer_statusscroll_button"
        >
          <IoMdArrowDropright size={25} />
        </button> */}
      {/* </div> */}

      <Row style={{ position: "relative" }}>
        {permissions.includes("Show Region Summary") && (
          <Col span={12}>
            <div
              className="livelead_today_summary_container"
              style={{ marginTop: "0px" }}
            >
              <p className="livelead_today_label">REGION SUMMARY</p>

              <div className="livelead_badge_item online">
                <div
                  className="livelead_badge_dot"
                  style={{ backgroundColor: "#3c9111" }}
                />
                <p className="livelead_badge_text">
                  Hub{" "}
                  <span className="livelead_badge_count">
                    {regionCounts?.hub_region ?? 0}
                  </span>
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
                    {regionCounts?.chennai_region ?? 0}
                  </span>
                </p>
              </div>

              <div className="livelead_badge_item classroom">
                <div
                  className="livelead_badge_dot"
                  style={{ backgroundColor: "#5b69ca" }}
                />
                <p className="livelead_badge_text">
                  Bangalore{" "}
                  <span className="livelead_badge_count">
                    {regionCounts?.bangalore_region ?? 0}
                  </span>
                </p>
              </div>
            </div>
          </Col>
        )}

        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: permissions.includes("Show Region Summary")
              ? "flex-end"
              : "flex-start",
          }}
        >
          {status === "" || status === "Requested" ? null : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "nowrap",
                width: "300px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  opacity: dateFilterType === "" ? 0.5 : 1,
                  pointerEvents: dateFilterType === "" ? "none" : "auto",
                  transition: "opacity 0.2s ease",
                }}
              >
                <CommonMuiCustomDatePicker
                  label={
                    dateFilterType === "Raise Date"
                      ? "Filter by Raise Date"
                      : dateFilterType === "Expiry Date"
                        ? "Filter by Expiry Date"
                        : ""
                  }
                  width="100%"
                  value={raisedDates}
                  onDateChange={(dates) => {
                    setRaisedDates(dates);
                    setPagination({
                      page: 1,
                    });
                    fetchServerRequestsData({
                      raised_at: dates[0],
                      raised_end: dates[1],
                      pageNumber: 1,
                    });
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
                          fetchServerRequestsData({
                            dateType: e.target.value,
                            pageNumber: 1,
                          });
                        }}
                      >
                        <Radio
                          value="Raise Date"
                          className="customers_datetypefilter_radio"
                          style={{
                            marginTop: "6px",
                            marginBottom: "12px",
                            fontSize: "12px",
                          }}
                        >
                          Filter by Raise Date
                        </Radio>
                        <Radio
                          value="Expiry Date"
                          style={{ marginBottom: "12px", fontSize: "12px" }}
                        >
                          Filter by Expiry Date
                        </Radio>
                      </Radio.Group>
                    }
                  >
                    <Button
                      className={`customer_trainermappingfilter_container ${
                        dateFilterType === "" ? "filter-pulse-animation" : ""
                      }`}
                      style={{
                        height: "35px",
                      }}
                    >
                      <IoFilter size={16} />
                    </Button>
                  </Tooltip>
                </Flex>
              </div>
            </div>
          )}
        </Col>
      </Row>

      <div
        style={{
          marginTop: "20px",
        }}
      >
        <CommonTable
          // scroll={{ x: 1200 }}
          scroll={{
            x: filteredTableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={filteredTableColumns}
          dataSource={serverData}
          loading={loading}
          checkBox={"false"}
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          selectedDatas={handleSelectedRow}
          selectedRowKeys={selectedRowKeys}
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
        {isStatusUpdateDrawerLoading ? (
          <CustomerOverviewSkeleton />
        ) : (
          <>
            <CustomerOverview customerDetails={customerDetails} />

            <Divider className="customer_statusupdate_divider" />

            <div className="customer_statusupdate_adddetailsContainer">
              {drawerStatus == "Update Details" ||
              drawerStatus === "Re-Purchase" ? (
                <ServerUpdateDetails
                  ref={serverUpdateDetailsRef}
                  serverDetails={serverDetails}
                  drawerStatus={drawerStatus}
                  setButtonLoading={setButtonLoading}
                  callgetServerApi={() => {
                    drawerReset();
                    fetchServerRequestsData({});
                  }}
                />
              ) : drawerStatus == "Verify" ? (
                <ServerVerify
                  ref={serverVerifyRef}
                  serverDetails={serverDetails}
                  setRejectButtonLoading={setRejectButtonLoading}
                  callgetServerApi={() => {
                    drawerReset();
                    fetchServerRequestsData({});
                  }}
                />
              ) : drawerStatus == "Approve" ? (
                <ServerApproval
                  ref={serverApproveRef}
                  serverDetails={serverDetails}
                  setRejectButtonLoading={setRejectButtonLoading}
                  callgetServerApi={() => {
                    drawerReset();
                    fetchServerRequestsData({});
                  }}
                />
              ) : drawerStatus == "Issue" || drawerStatus === "Re-Send" ? (
                <ServerIssue
                  ref={serverIssueRef}
                  serverDetails={serverDetails}
                  customerDetails={customerDetails}
                  drawerStatus={drawerStatus}
                  setButtonLoading={setButtonLoading}
                  callgetServerApi={() => {
                    drawerReset();
                    fetchServerRequestsData({});
                  }}
                />
              ) : (
                ""
              )}
            </div>
            <div className="leadmanager_tablefiler_footer">
              <div className="leadmanager_submitlead_buttoncontainer">
                {buttonLoading ? (
                  <button
                    className="users_adddrawer_loadingcreatebutton"
                    style={{
                      ...(drawerStatus === "Re-Purchase" && { width: "120px" }),
                    }}
                  >
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className="users_adddrawer_createbutton"
                    style={{
                      ...(drawerStatus === "Re-Purchase" && { width: "120px" }),
                    }}
                    onClick={
                      drawerStatus == "Update Details" ||
                      drawerStatus === "Re-Purchase"
                        ? () =>
                            serverUpdateDetailsRef.current?.handleUpdateDetails()
                        : drawerStatus == "Issue" || drawerStatus === "Re-Send"
                          ? () => serverIssueRef.current?.handleServerIssue()
                          : handleStatusMismatch
                    }
                  >
                    {drawerStatus == "Update Details"
                      ? "Update"
                      : drawerStatus === "Re-Purchase"
                        ? "Re-Purchase"
                        : drawerStatus == "Issue" || drawerStatus === "Re-Send"
                          ? "Issue"
                          : ""}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </Drawer>

      {/* view drawer */}
      <Drawer
        title="Server Details"
        open={isOpenViewDrawer}
        onClose={drawerReset}
        width="50%"
        style={{
          position: "relative",
          paddingBottom: "65px",
        }}
        className="customer_statusupdate_drawer"
      >
        {isStatusUpdateDrawerLoading ? (
          <CustomerOverviewSkeleton />
        ) : (
          <>
            <CustomerOverview customerDetails={customerDetails} />

            <Divider className="customer_statusupdate_divider" />

            <ViewServerDetails serverDetails={serverDetails} />
          </>
        )}
      </Drawer>
      {/* server raise confirm modal */}
      <Modal
        title={"Server Raise"}
        open={isOpenRaiseModal}
        onCancel={() => {
          setIsOpenRaiseModal(false);
          setRequestServerDuration("");
          setRequestServerDurationError("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenRaiseModal(false);
              setRequestServerDuration("");
              setRequestServerDurationError("");
            }}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          verifyButtonLoading ? (
            <Button
              key="create"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={() => {
                const durationValidate = selectValidator(requestServerDuration);

                setRequestServerDurationError(durationValidate);

                if (durationValidate) return;
                handleServerStatus("Server Raised");
              }}
              className="leads_coursemodal_createbutton"
            >
              Submit
            </Button>
          ),
        ]}
        width="32%"
        zIndex={1100}
      >
        {/* <p className="customer_classcompletemodal_heading">Are you sure?</p>

        <p className="customer_classcompletemodal_text">
          You Want To Raise The Server for{" "}
          <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
            {serverDetails && serverDetails.name ? serverDetails.name : ""}
          </span>{" "}
        </p> */}
        <div style={{ marginTop: "20px", marginBottom: "30px" }}>
          <CommonSelectField
            required={true}
            label="Request Server Duration"
            options={[
              { id: 30, name: "30 Days" },
              { id: 60, name: "60 Days" },
              { id: 90, name: "90 Days" },
            ]}
            onChange={(e) => {
              setRequestServerDuration(e.target.value);
              setRequestServerDurationError(selectValidator(e.target.value));
            }}
            value={requestServerDuration}
            error={requestServerDurationError}
          />
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

      {/* customer history drawer */}
      <CustomerHistory
        customerId={selectedHistoryCustomerId}
        isOpen={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setSelectedHistoryCustomerId(null);
        }}
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
                  const currentDrawerKeys = new Set(
                    drawerColumns.map((col) => col.key),
                  );
                  const updated = columns.map((col) => {
                    if (currentDrawerKeys.has(col.key)) {
                      return {
                        ...col,
                        isChecked: checked,
                      };
                    }
                    return col;
                  });
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
              <CommonDnd
                data={drawerColumns}
                setColumns={handleSetDrawerColumns}
              />
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
