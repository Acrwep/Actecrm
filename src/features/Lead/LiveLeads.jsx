import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Flex,
  Tooltip,
  Radio,
  Button,
  Drawer,
  Badge,
  Modal,
  Checkbox,
} from "antd";
import { IoFilter } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import {
  assignLiveLead,
  getAllDownlineUsers,
  getLeadAndFollowupCount,
  getLiveLeads,
  getTableColumns,
  moveLiveLeadToJunk,
  updateTableColumns,
} from "../ApiService/action";
import {
  addressValidator,
  getCurrentandPreviousweekDate,
} from "../Common/Validation";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTable from "../Common/CommonTable";
import { GiCardPickup } from "react-icons/gi";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlinePlaylistRemove } from "react-icons/md";
import CommonSpinner from "../Common/CommonSpinner";
import AddLead from "./AddLead";
import { useDispatch, useSelector } from "react-redux";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import { CommonMessage } from "../Common/CommonMessage";
import CommonTextArea from "../Common/CommonTextArea";
import {
  storeLiveLeadFilterType,
  storeLiveLeadSearchValue,
  storeLiveLeadSelectedDates,
} from "../Redux/Slice";
import CommonDnd from "../Common/CommonDnd";

export default function LiveLead({
  setLiveLeadCount,
  leadTypeOptions,
  regionOptions,
  refreshLeadFollowUp,
  refreshLeads,
  setLeadCount,
  isLeadPageVisited,
  setJunkLeadCount,
  isJunkPageVisited,
  refreshJunkLeads,
}) {
  //useref
  const filterTypeRef = useRef("");
  const searchRef = useRef("");
  const datesRef = useRef([]);
  const paginationRef = useRef({ page: 1, limit: 10 });
  const addLeaduseRef = useRef();
  const dispatch = useDispatch();
  //useselector
  const liveLeadSearchValue = useSelector((state) => state.liveleadsearchvalue);
  const liveLeadFilterType = useSelector((state) => state.liveleadfiltertype);
  const liveLeadSelecteDates = useSelector(
    (state) => state.liveleadselecteddates
  );
  const tabName = useSelector((state) => state.leadmanageractivepage);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  //usestates
  const [selectedDates, setSelectedDates] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [leadData, setLeadData] = useState([]);
  const [liveLeadAllCounts, setLiveLeadAllCounts] = useState(null);
  const [loginUserId, setLoginUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  //pick lead drawer
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [pickLeadItem, setPickLeadItem] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [callCountApi, setCallCountApi] = useState(true);
  const [allDownliners, setAllDownliners] = useState([]);
  const [pickLoadingRow, setPickLoadingRow] = useState(null);
  //junk usestates
  const [isOpenJunkModal, setIsOpenJunkModal] = useState(false);
  const [junkComments, setJunkComments] = useState("");
  const [junkCommentsError, setJunkCommentsError] = useState("");
  const [liveLeadId, setLiveLeadId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  //table filter usestates
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  //table dnd
  const [checkAll, setCheckAll] = useState(false);
  const [updateTableId, setUpdateTableId] = useState(null);
  const formatDuration = (dateString) => {
    if (import.meta.env.PROD) {
      const created = new Date(dateString);
      const now = new Date();
      const diffMs = now - created;

      if (diffMs < 0) return { text: "00:00", hours: 0 };

      const totalSeconds = Math.floor(diffMs / 1000);
      const totalHours = totalSeconds / 3600;

      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      const pad = (n) => String(n).padStart(2, "0");

      let text = "";

      if (days === 0) {
        // HHh:MMm
        const hh = pad(Math.floor(totalSeconds / 3600));
        text = `${hh}h:${pad(minutes)}m`;
      } else {
        // DDd:HHh:MMm
        text = `${pad(days)}d:${pad(hours)}h:${pad(minutes)}m`;
      }

      return { text, hours: totalHours };
    } else {
      //dev
      // Time is coming with a +5h 30m IST offset, so subtract 5h 30m
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
    }
  };

  const nonChangeColumns = [
    { title: "Sl. No", key: "row_num", dataIndex: "row_num", width: 60 },
    {
      title: "Created Before",
      key: "created_date",
      dataIndex: "created_date",
      width: 130,
      render: (text) => {
        const { text: durationText, hours } = formatDuration(text);

        let bg = "";
        let color = "";

        if (hours <= 1) {
          bg = "rgba(0, 128, 0, 0.12)"; // light green
          color = "#0f8a0f"; // dark green
        } else if (hours > 1 && hours <= 24) {
          bg = "rgba(255, 165, 0, 0.15)"; // light orange
          color = "#d27a00"; // dark orange
        } else {
          bg = "rgba(255, 0, 0, 0.13)"; // light red
          color = "#c80000"; // dark red
        }

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
                fontSize: "12px",
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
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      width: 200,
      render: (text, record) => {
        return (
          <Badge
            size="small"
            count={
              record.lead_type == "New" || record.lead_type == null
                ? "New"
                : "Existing"
            }
            offset={
              record.lead_type == "New" || record.lead_type == null
                ? [22, 0]
                : [30, 0]
            }
            color={
              record.lead_type == "New" || record.lead_type == null
                ? "#1e90ff"
                : "#d32f2f"
            }
            style={{ fontSize: "10px" }}
          >
            {text.length > 16 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
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
                <p style={{ cursor: "pointer", fontSize: "13px" }}>
                  {text.slice(0, 15) + "..."}
                </p>
              </Tooltip>
            ) : (
              <p style={{ fontSize: "13px" }}>{text}</p>
            )}
          </Badge>
        );
      },
    },
    {
      title: "Course",
      key: "course",
      dataIndex: "course",
      width: 200,
      render: (text) => {
        return (
          <>
            {text.length > 22 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
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
                <p style={{ cursor: "pointer" }}>{text.slice(0, 21) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 240,
      render: (text) => {
        return (
          <>
            {text.length > 26 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
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
                <p style={{ cursor: "pointer" }}>{text.slice(0, 25) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      dataIndex: "location",
      width: 160,
      render: (text) => {
        return (
          <>
            {text && text.length > 20 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
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
                <p style={{ cursor: "pointer" }}>{text.slice(0, 19) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text ? text : "-"}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Origin",
      key: "domain_origin",
      dataIndex: "domain_origin",
      width: 90,
      hidden: permissions.includes("Show Origin in Live Leads") ? false : true,
    },
    {
      title: "Training Mode",
      key: "training",
      dataIndex: "training",
      fixed: "right",
      width: 140,
      render: (text) => {
        if (text.includes("Online")) {
          return (
            <div className="livelead_onlinetraining_container">
              <p>Online</p>
            </div>
          );
        } else if (text.includes("Classroom")) {
          return (
            <div className="livelead_classroomtraining_container">
              <p>Classroom</p>
            </div>
          );
        } else {
          return (
            <div className="livelead_corporatetraining_container">
              <p>Corporate</p>
            </div>
          );
        }
      },
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 220,
      render: (text) => {
        return (
          <>
            {text && text.length > 26 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
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
                <p style={{ cursor: "pointer" }}>{text.slice(0, 25) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text ? text : "-"}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
      width: 120,
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <Tooltip placement="bottom" title="Pick">
              {pickLoadingRow == record.id ? (
                <GiCardPickup
                  size={26}
                  color="#5b69ca"
                  className="trainers_action_icons"
                  style={{ opacity: "0.7" }}
                />
              ) : (
                <GiCardPickup
                  size={26}
                  color="#5b69ca"
                  className="trainers_action_icons"
                  onClick={() => {
                    setPickLoadingRow(record.id);
                    handlePick(record);
                  }}
                />
              )}
            </Tooltip>
            <Tooltip placement="bottom" title="Move to Junk">
              <MdOutlinePlaylistRemove
                color="#d32f2f"
                size={20}
                className="trainers_action_icons"
                onClick={() => {
                  setLiveLeadId(record.id);
                  setIsOpenJunkModal(true);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true }))
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  useEffect(() => {
    setCallCountApi(
      isLeadPageVisited == true && isJunkPageVisited == true ? false : true
    );
  }, [isLeadPageVisited, isJunkPageVisited]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    setTableColumns(nonChangeColumns);
  }, [permissions]);

  useEffect(() => {
    console.log("acccccc", tabName, liveLeadSelecteDates);

    //redux values handling
    if (liveLeadSelecteDates.length >= 1) {
      setSelectedDates(liveLeadSelecteDates);
      datesRef.current = liveLeadSelecteDates;
    } else {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setSelectedDates(PreviousAndCurrentDate);
      dispatch(storeLiveLeadSelectedDates(PreviousAndCurrentDate));
      datesRef.current = PreviousAndCurrentDate;
    }

    if (liveLeadFilterType) {
      filterTypeRef.current = liveLeadFilterType;
    } else {
      filterTypeRef.current = 1;
    }

    if (liveLeadSearchValue) {
      searchRef.current = liveLeadSearchValue;
    } else {
      searchRef.current = null;
    }

    // Store values in refs to avoid re-render
    paginationRef.current = { page: 1, limit: 10, total: 0, totalPages: 0 };

    // STOP polling if tab not equal
    if (tabName !== "live_leads") return;

    // Store previous response to prevent unnecessary re-render
    const prevDataRef = { current: null };

    // Initial API call
    const fetchAndUpdate = async () => {
      const res = await getLiveLeadsData(
        searchRef.current,
        datesRef.current[0],
        datesRef.current[1],
        paginationRef.current.page,
        paginationRef.current.limit
      );

      if (!res) return;

      // Only update UI when data actually changes
      if (JSON.stringify(prevDataRef.current) !== JSON.stringify(res)) {
        setLeadData(res);
        prevDataRef.current = res;
      }
    };

    // Initial call
    fetchAndUpdate();

    // Delay for login data
    setTimeout(() => {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      getTableColumnsData(convertAsJson?.user_id);
      getAllDownlineUsersData(convertAsJson?.user_id);
      setLoginUserId(convertAsJson?.user_id);
    }, 300);

    // Poll only when tab is visible
    const isTabActive = () => document.visibilityState === "visible";

    // Polling Interval (optimized)
    const interval = setInterval(() => {
      if (isTabActive()) {
        fetchAndUpdate();
      }
    }, 600); // your interval

    // Cleanup
    return () => clearInterval(interval);
  }, [tabName]);

  // useEffect(() => {
  //   console.log("acccccc", tabName);
  //   const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
  //   setSelectedDates(PreviousAndCurrentDate);
  //   searchRef.current = null;
  //   filterTypeRef.current = 1;
  //   datesRef.current = PreviousAndCurrentDate;
  //   const initialPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
  //   paginationRef.current = initialPagination;
  //   if (tabName !== "live_leads") return; // Stop polling

  //   // Initial Call
  //   getLiveLeadsData(
  //     null,
  //     PreviousAndCurrentDate[0],
  //     PreviousAndCurrentDate[1],
  //     1,
  //     10
  //   );
  //   setTimeout(() => {
  //     const getLoginUserDetails = localStorage.getItem("loginUserDetails");
  //     const convertAsJson = JSON.parse(getLoginUserDetails);
  //     getAllDownlineUsersData(convertAsJson?.user_id);
  //     setLoginUserId(convertAsJson?.user_id);
  //   }, 300);
  //   // Call every 5 seconds
  //   const interval = setInterval(() => {
  //     getLiveLeadsData(
  //       searchRef.current,
  //       datesRef.current[0],
  //       datesRef.current[1],
  //       paginationRef.current.page,
  //       paginationRef.current.limit
  //     );
  //   }, 1000);

  //   // Cleanup interval when component unmounts
  //   return () => clearInterval(interval);
  // }, [tabName]);

  const getAllDownlineUsersData = async (user_id) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getLiveLeadsData = async (
    searchvalue,
    startDate,
    endDate,
    pageNumber,
    limit
  ) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    const payload = {
      region_type: convertAsJson?.user_id,
      ...(searchvalue && filterTypeRef.current == 1
        ? { phone: searchvalue }
        : searchvalue && filterTypeRef.current == 2
        ? { name: searchvalue }
        : searchvalue && filterTypeRef.current == 3
        ? { email: searchvalue }
        : searchvalue && filterTypeRef.current == 4
        ? { course: searchvalue }
        : {}),
      start_date: startDate,
      end_date: endDate,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getLiveLeads(payload);
      console.log("live lead response", response);
      const paginations = response?.data?.data?.pagination;

      setLeadData(response?.data?.data?.data || []);
      const count = response?.data?.data?.lead_count || null;
      paginationRef.current = paginations;

      setLiveLeadAllCounts(count);
      setLiveLeadCount(paginations.total);
      setPagination({
        page: paginations.page,
        limit: paginations.limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
      });
    } catch (error) {
      setLeadData([]);
      setLiveLeadAllCounts(null);
      console.log("get live lead error", error);
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
        return updateTableColumns();
      }

      const filterPage = data.find((f) => f.page_name === "Live Leads");
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
                width: 130,
                render: (text) => {
                  const { text: durationText, hours } = formatDuration(text);

                  let bg = "";
                  let color = "";

                  if (hours <= 1) {
                    bg = "rgba(0, 128, 0, 0.12)"; // light green
                    color = "#0f8a0f"; // dark green
                  } else if (hours > 1 && hours <= 24) {
                    bg = "rgba(255, 165, 0, 0.15)"; // light orange
                    color = "#d27a00"; // dark orange
                  } else {
                    bg = "rgba(255, 0, 0, 0.13)"; // light red
                    color = "#c80000"; // dark red
                  }

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
                          fontSize: "12px",
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
              };
            case "name":
              return {
                ...col,
                width: 180,
                render: (text, record) => {
                  return (
                    <Badge
                      size="small"
                      count={
                        record.lead_type == "New" || record.lead_type == null
                          ? "New"
                          : "Existing"
                      }
                      offset={
                        record.lead_type == "New" || record.lead_type == null
                          ? [22, 0]
                          : [30, 0]
                      }
                      color={
                        record.lead_type == "New" || record.lead_type == null
                          ? "#1e90ff"
                          : "#d32f2f"
                      }
                      style={{ fontSize: "10px" }}
                    >
                      {text.length > 16 ? (
                        <Tooltip
                          color="#fff"
                          placement="bottom"
                          title={text}
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
                          <p style={{ cursor: "pointer", fontSize: "13px" }}>
                            {text.slice(0, 15) + "..."}
                          </p>
                        </Tooltip>
                      ) : (
                        <p style={{ fontSize: "13px" }}>{text}</p>
                      )}
                    </Badge>
                  );
                },
              };
            case "course":
              return {
                ...col,
                width: 200,
                render: (text) => {
                  return (
                    <>
                      {text.length > 22 ? (
                        <Tooltip
                          color="#fff"
                          placement="bottom"
                          title={text}
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
                          <p style={{ cursor: "pointer" }}>
                            {text.slice(0, 21) + "..."}
                          </p>
                        </Tooltip>
                      ) : (
                        <p>{text}</p>
                      )}
                    </>
                  );
                },
              };
            case "phone":
              return {
                ...col,
                width: 130,
              };
            case "email":
              return {
                ...col,
                width: 240,
                render: (text) => {
                  return (
                    <>
                      {text.length > 26 ? (
                        <Tooltip
                          color="#fff"
                          placement="bottom"
                          title={text}
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
                          <p style={{ cursor: "pointer" }}>
                            {text.slice(0, 25) + "..."}
                          </p>
                        </Tooltip>
                      ) : (
                        <p>{text}</p>
                      )}
                    </>
                  );
                },
              };
            case "location":
              return {
                ...col,
                width: 160,
                render: (text) => {
                  return (
                    <>
                      {text && text.length > 20 ? (
                        <Tooltip
                          color="#fff"
                          placement="bottom"
                          title={text}
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
                          <p style={{ cursor: "pointer" }}>
                            {text.slice(0, 19) + "..."}
                          </p>
                        </Tooltip>
                      ) : (
                        <p>{text ? text : "-"}</p>
                      )}
                    </>
                  );
                },
              };
            case "training":
              return {
                ...col,
                width: 140,
                render: (text) => {
                  if (text.includes("Online")) {
                    return (
                      <div className="livelead_onlinetraining_container">
                        <p>Online</p>
                      </div>
                    );
                  } else if (text.includes("Classroom")) {
                    return (
                      <div className="livelead_classroomtraining_container">
                        <p>Classroom</p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="livelead_corporatetraining_container">
                        <p>Corporate</p>
                      </div>
                    );
                  }
                },
              };
            case "domain_origin": {
              return {
                ...col,
                width: 90,
                hidden: permissions.includes("Show Origin in Live Leads")
                  ? false
                  : true,
              };
            }
            case "comments":
              return {
                ...col,
                width: 220,
                render: (text) => {
                  return (
                    <>
                      {text && text.length > 26 ? (
                        <Tooltip
                          color="#fff"
                          placement="bottom"
                          title={text}
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
                          <p style={{ cursor: "pointer" }}>
                            {text.slice(0, 25) + "..."}
                          </p>
                        </Tooltip>
                      ) : (
                        <p>{text ? text : "-"}</p>
                      )}
                    </>
                  );
                },
              };
            case "action":
              return {
                ...col,
                fixed: "right",
                width: 120,
                render: (text, record) => {
                  return (
                    <div className="trainers_actionbuttonContainer">
                      <Tooltip placement="bottom" title="Pick">
                        {pickLoadingRow == record.id ? (
                          <GiCardPickup
                            size={26}
                            color="#5b69ca"
                            className="trainers_action_icons"
                            style={{ opacity: "0.7" }}
                          />
                        ) : (
                          <GiCardPickup
                            size={26}
                            color="#5b69ca"
                            className="trainers_action_icons"
                            onClick={() => {
                              setPickLoadingRow(record.id);
                              handlePick(record);
                            }}
                          />
                        )}
                      </Tooltip>
                      <Tooltip placement="bottom" title="Move to Junk">
                        <MdOutlinePlaylistRemove
                          color="#d32f2f"
                          size={20}
                          className="trainers_action_icons"
                          onClick={() => {
                            setLiveLeadId(record.id);
                            setIsOpenJunkModal(true);
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
        filterPage.column_names.filter((col) => col.isChecked)
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
      page_name: "Live Leads",
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
    setLoading(true);
    dispatch(storeLiveLeadSearchValue(e.target.value));
    searchRef.current = e.target.value;
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getLiveLeadsData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        1,
        pagination.limit
      );
    }, 300);
  };

  const handlePaginationChange = ({ page, limit }) => {
    paginationRef.current = { page: page, limit: limit };
    getLiveLeadsData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      page,
      limit
    );
  };

  const handlePick = async (item) => {
    console.log("itemmmm", item);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    setPickLoadingRow(item.id); // show loading only for this row
    const payload = {
      user_id: convertAsJson?.user_id,
      lead_id: item.id,
      is_assigned: true,
    };

    try {
      await assignLiveLead(payload);
      setPickLeadItem({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        location: item.location ? item.location : "",
        course: item.course ? item.course : "",
        training: item.training ? item.training : "",
        comments: item.comments ? item.comments : "",
      });
      setIsOpenAddDrawer(true);
    } catch (error) {
      console.log("assign live lead error", error);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    } finally {
      setPickLoadingRow(null); // remove loading
    }
  };

  const getLeadAndFollowupCountData = async () => {
    if (callCountApi == false) return;
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    const payload = {
      user_ids: allDownliners,
      start_date: PreviousAndCurrentDate[0],
      end_date: PreviousAndCurrentDate[1],
    };
    try {
      const response = await getLeadAndFollowupCount(payload);
      console.log("lead count response", response);
      const countDetails = response?.data?.data;
      setLeadCount(countDetails.total_lead_count);
      setJunkLeadCount(countDetails.junk_lead_count);
    } catch (error) {
      console.log("lead count error", error);
      // dispatch(storeUsersList([]));
    }
  };

  const handleSelectedRow = (row) => {
    console.log("selected rowwww", row);
    setSelectedRows(row);
    const keys = row.map((item) => item.id); // or your unique row key
    setSelectedRowKeys(keys);
  };

  const handleMoveToJunk = async () => {
    console.log("selectedRowKeys", selectedRowKeys);
    const commentsValidate = addressValidator(junkComments);

    setJunkCommentsError(commentsValidate);

    if (commentsValidate) return;

    setButtonLoading(true);
    const payload = {
      lead_ids: selectedRows.length >= 1 ? selectedRowKeys : [liveLeadId],
      is_junk: true,
      reason: junkComments,
    };
    try {
      await moveLiveLeadToJunk(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        setButtonLoading(false);
        setIsOpenJunkModal(false);
        setLiveLeadId(null);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        setJunkComments("");
        setPagination({
          page: 1,
        });
        getLiveLeadsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          1,
          pagination.limit
        );
        getLeadAndFollowupCountData();
        refreshJunkLeads();
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

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
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
                      : filterType == 4
                      ? "Search by Course"
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
                          dispatch(storeLiveLeadSearchValue(null));
                          setLoading(true);
                          searchRef.current = null;
                          setPagination({
                            page: 1,
                          });
                          getLiveLeadsData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
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
                  value={searchValue}
                  onChange={handleSearch}
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
                            dispatch(storeLiveLeadFilterType(e.target.value));
                            filterTypeRef.current = e.target.value;
                            if (searchValue == "") {
                              return;
                            } else {
                              setSearchValue("");
                              dispatch(storeLiveLeadSearchValue(null));
                              searchRef.current = null;
                              setPagination({
                                page: 1,
                              });
                              getLiveLeadsData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
                                1,
                                pagination.limit
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
                        <IoFilter size={18} />
                      </Button>
                    </Tooltip>
                  </Flex>
                </div>
              </div>
            </Col>
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  datesRef.current = dates;
                  dispatch(storeLiveLeadSelectedDates(dates));
                  setLoading(true);
                  setPagination({
                    page: 1,
                  });
                  getLiveLeadsData(
                    searchValue,
                    dates[0],
                    dates[1],
                    1,
                    pagination.limit
                  );
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={7}>
          <div className="livelead_junkbutton_container">
            {selectedRows.length >= 1 && (
              <Button
                className="livelead_junkbutton"
                onClick={() => {
                  setIsOpenJunkModal(true);
                }}
              >
                Move to Junk
              </Button>
            )}
            <FiFilter
              size={20}
              color="#5b69ca"
              style={{
                cursor: "pointer",
                marginTop: selectedRows.length >= 1 ? "0px" : "5px",
              }}
              onClick={() => {
                setIsOpenFilterDrawer(true);
                getTableColumnsData(loginUserId);
              }}
            />
          </div>
        </Col>
      </Row>

      <div className="customer_trainer_badge_mainconatiner">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div className="customer_trainer_onboardcount_badge" />
          <p className="customer_trainer_onboardcount_badgecount">
            Online{" "}
            <span style={{ fontWeight: 600, fontSize: "12px" }}>
              {liveLeadAllCounts && liveLeadAllCounts.online_count
                ? liveLeadAllCounts.online_count
                : "-"}
            </span>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            className="customer_trainer_goingcount_badge"
            style={{ backgroundColor: "#1e90ff" }}
          />
          <p className="customer_trainer_onboardcount_badgecount">
            Classroom{" "}
            <span style={{ fontWeight: 600, fontSize: "12px" }}>
              {" "}
              {liveLeadAllCounts && liveLeadAllCounts.classroom_count
                ? liveLeadAllCounts.classroom_count
                : "-"}
            </span>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            className="customer_trainer_goingcount_badge"
            style={{ backgroundColor: "#607d8b" }}
          />
          <p className="customer_trainer_onboardcount_badgecount">
            Corporate{" "}
            <span style={{ fontWeight: 600, fontSize: "12px" }}>
              {" "}
              {liveLeadAllCounts && liveLeadAllCounts.corporate_count
                ? liveLeadAllCounts.corporate_count
                : "-"}
            </span>
          </p>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          // scroll={{ x: 1300 }}
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0
            ),
          }}
          columns={tableColumns}
          dataSource={leadData}
          dataPerPage={10}
          loading={loading}
          size="small"
          className="questionupload_table"
          selectedDatas={handleSelectedRow}
          selectedRowKeys={selectedRowKeys}
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>

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
                  page_name: "Live Leads",
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

      <Drawer
        title="Add Lead"
        open={isOpenAddDrawer}
        onClose={async () => {
          setIsOpenAddDrawer(false);
          setPickLeadItem(null);
          const getLoginUserDetails = localStorage.getItem("loginUserDetails");
          const convertAsJson = JSON.parse(getLoginUserDetails);
          const payload = {
            user_id: convertAsJson?.user_id,
            lead_id: pickLeadItem.id,
            is_assigned: false,
          };

          try {
            await assignLiveLead(payload);
          } catch (error) {
            console.log("assign live lead error", error);
          }
        }}
        width="52%"
        style={{ position: "relative" }}
        id="leadform_addlead_drawer"
      >
        <AddLead
          ref={addLeaduseRef}
          key={pickLeadItem}
          leadTypeOptions={leadTypeOptions}
          regionOptions={regionOptions}
          updateLeadItem={null}
          setSaveOnlyLoading={setButtonLoading}
          setButtonLoading={setButtonLoading}
          setIsOpenAddDrawer={setIsOpenAddDrawer}
          liveLeadItem={pickLeadItem}
          callgetLeadsApi={(is_refreshjunk) => {
            console.log("is_refreshjunk", is_refreshjunk);
            if (is_refreshjunk == true) {
              setPickLeadItem(null);
              getLeadAndFollowupCountData();
              refreshJunkLeads();
              return;
            }
            setPickLeadItem(null);
            setPagination({
              page: 1,
            });
            getLiveLeadsData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              1,
              pagination.limit
            );
            refreshLeadFollowUp();
            refreshLeads();
            getLeadAndFollowupCountData();
          }}
        />

        <div className="leadmanager_submitlead_buttoncontainer">
          <div style={{ display: "flex", gap: "12px" }}>
            <>
              {buttonLoading ? (
                <button className={"leadmanager_loadingupdateleadbutton"}>
                  <CommonSpinner />
                </button>
              ) : (
                <button
                  className={"leadmanager_updateleadbutton"}
                  onClick={() =>
                    addLeaduseRef.current.handleSubmit("Save Only")
                  }
                >
                  Submit
                </button>
              )}
            </>
          </div>
        </div>
      </Drawer>

      {/* delete modal */}
      {/* <CommonDeleteModal
        title="Move to Junk"
        open={isOpenJunkModal}
        onCancel={() => {
          setIsOpenJunkModal(false);
          setLiveLeadId(null);
        }}
        content="Are you sure want to move the Lead to Junk?"
        loading={buttonLoading}
        onClick={handleMoveToJunk}
      /> */}
      <Modal
        title="Move to Junk"
        open={isOpenJunkModal}
        onCancel={() => {
          setIsOpenJunkModal(false);
          setLiveLeadId(null);
          setJunkComments("");
          setJunkCommentsError("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenAddCourseModal(false);
              setCourseName("");
              setCourseNameError("");
            }}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              style={{ width: "120px", opacity: 0.7 }}
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleMoveToJunk}
              style={{ width: "120px" }}
            >
              Move to Junk
            </Button>
          ),
        ]}
      >
        <div style={{ marginBottom: "20px" }}>
          <CommonTextArea
            label="Comments"
            required={false}
            onChange={(e) => {
              setJunkComments(e.target.value);
              setJunkCommentsError(addressValidator(e.target.value));
            }}
            value={junkComments}
            error={junkCommentsError}
          />
        </div>
      </Modal>
    </div>
  );
}
