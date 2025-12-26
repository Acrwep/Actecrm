import React, { useState, useRef, useEffect } from "react";
import CommonTable from "../Common/CommonTable";
import {
  Row,
  Col,
  Drawer,
  Checkbox,
  Input,
  Modal,
  Tooltip,
  Button,
  Divider,
  Radio,
  Flex,
  Spin,
  Tour,
} from "antd";
import { FiFilter } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import CommonDnd from "../Common/CommonDnd";
import { IoIosClose } from "react-icons/io";
import {
  downloadLeadFollowUps,
  getAllDownlineUsers,
  getLeadAndFollowupCount,
  getLeadFollowUps,
  getLeadFollowUpsCountByUserIds,
  getTableColumns,
  updateFollowUp,
  updateTableColumns,
} from "../ApiService/action";
import { IoMdSend } from "react-icons/io";
import { LoadingOutlined } from "@ant-design/icons";
import { DownloadOutlined } from "@ant-design/icons";
import moment from "moment";
import CommonDatePicker from "../Common/CommonDatePicker";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import { MdFormatListNumbered } from "react-icons/md";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
  shortRelativeTime,
  getCurrentandPreviousweekDate,
  isWithin30Days,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonTextArea from "../Common/CommonTextArea";
import { Country, State } from "country-state-city";
import CommonSpinner from "../Common/CommonSpinner";
import CommonAvatar from "../Common/CommonAvatar";
import { useDispatch, useSelector } from "react-redux";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import AddLead from "./AddLead";
import { storeFollowUpFilterValues } from "../Redux/Slice";
import EllipsisTooltip from "../Common/EllipsisTooltip";

const { TextArea } = Input;

export default function LeadFollowUp({
  setFollowupCount,
  refreshLeads,
  leadTypeOptions,
  regionOptions,
}) {
  const dispatch = useDispatch();
  const chatBoxRef = useRef();
  const mounted = useRef(false);
  const addLeaduseRef = useRef();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const filterValuesFromRedux = useSelector(
    (state) => state.followupfiltervalues
  );
  const [filterType, setFilterType] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [executiveCountTooltip, setExecutiveCountTooltip] = useState(false);

  const [followUpData, setFollowUpData] = useState([]);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [isOpenCommentModal, setIsOpenCommentModal] = useState(false);
  const [isOpenFollowUpDrawer, setIsOpenFollowUpDrawer] = useState(false);
  const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
  const [nxtFollowupDateError, setNxtFollowupDateError] = useState(null);
  const actionOptions = [
    { id: 1, name: "Follow Up" },
    { id: 2, name: "Joined Other" },
    { id: 3, name: "Fees High" },
    { id: 4, name: "Negative Review" },
    { id: 5, name: "Not interested Now" },
    { id: 6, name: "Others" },
  ];
  const [actionId, setActionId] = useState(null);
  const [actionIdError, setActionIdError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newCommentError, setNewCommentError] = useState("");
  const [commentsHistory, setCommentsHistory] = useState([]);
  const [leadHistoryId, setLeadHistoryId] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [downloadButtonLoader, setDownloadButtonLoader] = useState(false);
  //add lead usestates
  const [leadDetails, setLeadDetails] = useState(null);
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [saveOnlyLoading, setSaveOnlyLoading] = useState(false);
  //lead executive usestates
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [leadCountByExecutives, setLeadCountByExecutives] = useState([]);
  const [leadExeCountLoading, setLeadExeCountLoading] = useState(false);
  const [allDownliners, setAllDownliners] = useState([]);
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
  //tour
  const [addLeadTour, setAddLeadTour] = useState(false);
  const addLeadButtonRef = useRef(null);

  const steps = [
    {
      title: "Submit Button",
      description: "Click this button to submit the form",
      target: () => addLeadButtonRef.current,
      placement: "bottom",
      nextButtonProps: {
        children: "Ok, got it", // Change "Next" to "Finish Tour" on the last step
      },
    },
  ];

  const nonChangeColumns = [
    { title: "Sl. No", key: "row_num", dataIndex: "row_num", width: 60 },
    {
      title: "Lead Executive",
      key: "lead_assigned_to_name",
      dataIndex: "lead_assigned_to_name",
      width: 160,
      render: (text, record) => {
        const lead_executive = `${record.lead_assigned_to_id} - ${text}`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: "Next Follow Up",
      key: "next_follow_up_date",
      dataIndex: "next_follow_up_date",
      width: 160,
      render: (text, record, index) => {
        return (
          <div
            className="leadfollowup_tabledateContainer"
            onClick={() => {
              // setIsOpenCommentModal(true);
              if (!permissions.includes("Update Lead Followup")) {
                CommonMessage("error", "Access Denied");
                return;
              }
              console.log("recordddd", record);
              setIsOpenFollowUpDrawer(true);
              setLeadId(record.id);
              setLeadHistoryId(record.lead_history_id);
              setLeadDetails(record);
              setCurrentIndex(index);
              const merged = [
                ...record.histories.map((item) => ({
                  ...item,
                  date: item.updated_date,
                })),
                ...record.quality_history.map((item) => ({
                  ...item,
                  date: item.created_date,
                })),
              ];

              // Sort latest first
              merged.sort((a, b) => new Date(b.date) - new Date(a.date));

              setCommentsHistory(merged);
            }}
          >
            <p>{moment(text).format("DD/MM/YYYY")}</p>
            <div className="leadfollowup_tablecommentContainer">
              <p>{record.histories.length + record.quality_history.length}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Candidate Name",
      key: "candidate_name",
      dataIndex: "candidate_name",
      width: 180,
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
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 130 },
    {
      title: "Course",
      key: "primary_course",
      dataIndex: "primary_course",
      width: 180,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      width: 120,
      render: (text, record) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Lead Priority",
      key: "lead_status",
      dataIndex: "lead_status",
      fixed: "right",
      width: 140,
      render: (text) => {
        return (
          <div
            className={
              text == "High"
                ? "leadmanager_leadstatus_high_container"
                : text == "Medium"
                ? "leadmanager_leadstatus_medium_container"
                : "leadmanager_leadstatus_low_container"
            }
          >
            <p>{text}</p>
          </div>
        );
      },
    },
    {
      title: "Recent Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true }))
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  const messages = [
    { id: 1, text: "Hey there!", type: "receiver" },
    { id: 2, text: "Hello! How are you?", type: "sender" },
    { id: 3, text: "I’m doing well, thanks!", type: "receiver" },
    { id: 4, text: "Glad to hear!", type: "sender" },
  ];

  useEffect(() => {
    setTableColumns(nonChangeColumns);
  }, [permissions]);

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target)) {
        setIsOpenChat(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (permissions.length >= 1) {
      if (!permissions.includes("Lead Manager Page")) {
        return;
      }
      // ---------------------
      setSelectedDates([
        filterValuesFromRedux.start_date,
        filterValuesFromRedux.end_date,
      ]);
      setFilterType(filterValuesFromRedux.filterType);
      setSearchValue(filterValuesFromRedux.searchValue);
      setSelectedUserId(filterValuesFromRedux.user_id);
      setPagination({
        page: filterValuesFromRedux.pageNumber,
        limit: filterValuesFromRedux.pageLimit,
      });

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setTimeout(() => {
        getTableColumnsData(convertAsJson?.user_id);
      }, 300);
      if (childUsers.length > 0 && !mounted.current) {
        setSubUsers(downlineUsers);
        mounted.current = true;
        setLoginUserId(convertAsJson?.user_id);
        getAllDownlineUsersData(
          filterValuesFromRedux.user_id
            ? filterValuesFromRedux.user_id
            : convertAsJson?.user_id
        );
        // const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        // getLeadFollowUpsData(
        //   null,
        //   PreviousAndCurrentDate[0],
        //   PreviousAndCurrentDate[1],
        //   false,
        //   null,
        //   1,
        //   10
        // );
      }
    }
  }, [childUsers, permissions]);

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
      console.log("filterValuesFromRedux", filterValuesFromRedux);
      getLeadFollowUpsData(
        filterValuesFromRedux.searchValue,
        filterValuesFromRedux.start_date,
        filterValuesFromRedux.end_date,
        false,
        downliners_ids,
        filterValuesFromRedux.pageNumber,
        filterValuesFromRedux.pageLimit
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getLeadFollowUpsData = async (
    searchvalue,
    startDate,
    endDate,
    updateStatus,
    downliners,
    pageNumber,
    limit
  ) => {
    setLoading(true);

    const payload = {
      ...(searchvalue && filterType == 1
        ? { phone: searchvalue }
        : searchvalue && filterType == 2
        ? { name: searchvalue }
        : searchvalue && filterType == 3
        ? { email: searchvalue }
        : searchvalue && filterType == 4
        ? { course: searchvalue }
        : {}),
      from_date: startDate,
      to_date: endDate,
      user_ids: downliners,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getLeadFollowUps(payload);
      console.log("follow up response", response);
      const followup_data = response?.data?.data?.data || [];
      const pagination = response?.data?.data?.pagination;

      setFollowUpData(followup_data);
      setFollowupCount(pagination.total);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
      dispatch(
        storeFollowUpFilterValues({
          pageNumber: pagination.page,
          pageLimit: pagination.limit,
        })
      );

      if (updateStatus === true) {
        const record = followup_data[currentIndex];
        if (!record) {
          setIsOpenFollowUpDrawer(false);
          return;
        }

        setCurrentIndex(currentIndex);
        setLeadDetails(record);
        const merged = [
          ...record.histories.map((item) => ({
            ...item,
            date: item.updated_date,
          })),
          ...record.quality_history.map((item) => ({
            ...item,
            date: item.created_date,
          })),
        ];

        // Sort latest first
        merged.sort((a, b) => new Date(b.date) - new Date(a.date));

        console.log(merged);
        setCommentsHistory(merged);
        setLeadId(record.id);
        setLeadHistoryId(record.lead_history_id);
      }
    } catch (error) {
      setFollowUpData([]);
      setFollowupCount(0);
      console.log("get followup error", error);
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

      const filterPage = data.find((f) => f.page_name === "Lead Followup");
      if (!filterPage) {
        setUpdateTableId(null);
        return updateTableColumnsData();
      }

      // --- ✅ Helper function to reattach render logic ---
      const attachRenderFunctions = (cols) =>
        cols.map((col) => {
          switch (col.key) {
            case "row_num":
              return {
                ...col,
                width: 60,
              };
            case "lead_assigned_to_name":
              return {
                ...col,
                width: 160,
                render: (text, record) => {
                  const lead_executive = `${record.lead_assigned_to_id} - ${text}`;
                  return <EllipsisTooltip text={lead_executive} />;
                },
              };
            case "candidate_name":
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
                width: 130,
              };
            case "primary_course":
              return {
                ...col,
                width: 180,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "next_follow_up_date":
              return {
                ...col,
                width: 160,
                render: (text, record, index) => {
                  return (
                    <div
                      className="leadfollowup_tabledateContainer"
                      onClick={() => {
                        // setIsOpenCommentModal(true);
                        if (!permissions.includes("Update Lead Followup")) {
                          CommonMessage("error", "Access Denied");
                          return;
                        }
                        console.log("recordddd", record);
                        setIsOpenFollowUpDrawer(true);
                        setLeadId(record.id);
                        setLeadHistoryId(record.lead_history_id);
                        setLeadDetails(record);
                        setCurrentIndex(index);
                        const merged = [
                          ...record.histories.map((item) => ({
                            ...item,
                            date: item.updated_date,
                          })),
                          ...record.quality_history.map((item) => ({
                            ...item,
                            date: item.created_date,
                          })),
                        ];

                        // Sort latest first
                        merged.sort(
                          (a, b) => new Date(b.date) - new Date(a.date)
                        );

                        console.log(merged);
                        setCommentsHistory(merged);
                      }}
                    >
                      <p>{moment(text).format("DD/MM/YYYY")}</p>
                      <div className="leadfollowup_tablecommentContainer">
                        <p>
                          {record.histories.length +
                            record.quality_history.length}
                        </p>
                      </div>
                    </div>
                  );
                },
              };
            case "primary_fees":
              return {
                ...col,
                width: 120,
                render: (text, record) => {
                  return <p>{"₹" + text}</p>;
                },
              };
            case "lead_status":
              return {
                ...col,
                title: "Lead Priority",
                width: 140,
                render: (text) => {
                  return (
                    <div
                      className={
                        text == "High"
                          ? "leadmanager_leadstatus_high_container"
                          : text == "Medium"
                          ? "leadmanager_leadstatus_medium_container"
                          : "leadmanager_leadstatus_low_container"
                      }
                    >
                      <p>{text}</p>
                    </div>
                  );
                },
              };
            case "comments":
              return {
                ...col,
                width: 200,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
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
      page_name: "Lead Followup",
      column_names: columns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    dispatch(storeFollowUpFilterValues({ pageNumber: page, pageLimit: limit }));
    getLeadFollowUpsData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      false,
      allDownliners,
      page,
      limit
    );
  };

  //onchange functions
  const handleUpdateFollowUp = async () => {
    const actionValidate = selectValidator(actionId);
    const commentValidate = addressValidator(newComment);

    let nxtFollowdateValidate = "";

    if (actionId == 1) {
      nxtFollowdateValidate = selectValidator(nxtFollowupDate);
    } else {
      nxtFollowdateValidate = "";
    }

    setActionIdError(actionValidate);
    setNxtFollowupDateError(nxtFollowdateValidate);
    setNewCommentError(commentValidate);

    if (actionValidate || nxtFollowdateValidate || commentValidate) return;

    setButtonLoading(true);
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      lead_history_id: leadHistoryId,
      comments: newComment,
      next_follow_up_date: nxtFollowupDate
        ? formatToBackendIST(nxtFollowupDate)
        : null,
      lead_status_id: actionId,
      lead_id: leadId,
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      updated_date: formatToBackendIST(today),
    };

    try {
      await updateFollowUp(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        getLeadFollowUpsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          true,
          allDownliners,
          pagination.page,
          pagination.limit
        );
        refreshLeads();
        setNewComment("");
        setNewCommentError("");
        setActionId(null);
        setActionIdError("");
        setNxtFollowupDate(null);
        setNxtFollowupDateError("");
        setButtonLoading(false);
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      console.log("update follow up error");
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  //onchange functions
  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    dispatch(
      storeFollowUpFilterValues({
        searchValue: e.target.value,
        pageNumber: 1,
        pageLimit: pagination.limit,
      })
    );
    setPagination({
      page: 1,
    });
    setTimeout(() => {
      getLeadFollowUpsData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        false,
        allDownliners,
        1,
        pagination.limit
      );
    }, 300);
  };

  const updateDetailsByIndex = (index) => {
    const record = followUpData[index];
    if (!record) return;

    setCurrentIndex(index);
    setLeadDetails(record);
    const merged = [
      ...record.histories.map((item) => ({
        ...item,
        date: item.updated_date,
      })),
      ...record.quality_history.map((item) => ({
        ...item,
        date: item.created_date,
      })),
    ];

    // Sort latest first
    merged.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(merged);
    setCommentsHistory(merged);
    setLeadId(record.id);
    setLeadHistoryId(record.lead_history_id);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      updateDetailsByIndex(currentIndex - 1);
      setTimeout(() => {
        const container = document.getElementById(
          "leadfollowup_leaddetails_heading"
        );
        container.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleNext = () => {
    if (currentIndex < followUpData.length - 1) {
      updateDetailsByIndex(currentIndex + 1);
      setTimeout(() => {
        const container = document.getElementById(
          "leadfollowup_leaddetails_heading"
        );
        container.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleLeadCountByExecutive = async () => {
    setLeadExeCountLoading(true);
    const payload = {
      start_date: selectedDates[0],
      end_date: selectedDates[1],
      user_ids: allDownliners,
    };
    try {
      const response = await getLeadFollowUpsCountByUserIds(payload);
      console.log("leads count response", response);
      setLeadCountByExecutives(response?.data?.data || []);
      setTimeout(() => {
        setLeadExeCountLoading(false);
      }, 200);
    } catch (error) {
      setLeadExeCountLoading(false);
      setLeadCountByExecutives([]);
      console.log("error", error);
    }
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    dispatch(
      storeFollowUpFilterValues({
        user_id: value,
      })
    );
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
      dispatch(
        storeFollowUpFilterValues({
          pageNumber: 1,
          pageLimit: pagination.limit,
        })
      );
      getLeadFollowUpsData(
        null,
        selectedDates[0],
        selectedDates[1],
        false,
        downliners_ids,
        1,
        10
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const handleDownload = async () => {
    const isWithIn30days = isWithin30Days(selectedDates[0], selectedDates[1]);
    console.log("isWithIn30days", isWithIn30days);
    if (isWithIn30days == false) {
      CommonMessage("error", "Please choose a date range within 30 days.");
      return;
    }
    setDownloadButtonLoader(true);
    const payload = {
      user_ids: allDownliners,
      start_date: selectedDates[0],
      to_date: selectedDates[1],
      ...(searchValue && filterType == 1
        ? { phone: searchValue }
        : searchValue && filterType == 2
        ? { name: searchValue }
        : searchValue && filterType == 3
        ? { email: searchValue }
        : searchValue && filterType == 4
        ? { course: searchValue }
        : {}),
    };
    try {
      const response = await downloadLeadFollowUps(payload);
      console.log("followups download response", response);
      const data = response?.data?.data || [];
      const alterColumns = columns.filter((f) => f.title != "Action");
      DownloadTableAsCSV(
        data,
        alterColumns,
        `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
          selectedDates[1]
        ).format("DD-MM-YYYY")} Followups.csv`
      );
      setTimeout(() => {
        setDownloadButtonLoader(false);
      }, 300);
    } catch (error) {
      setDownloadButtonLoader(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const formReset = (dontCloseAddDrawer) => {
    setIsOpenFilterDrawer(false);
    setIsOpenCommentModal(false);
    setButtonLoading(false);
    setIsOpenFollowUpDrawer(false);
    setActionId(null);
    setActionIdError("");
    setNxtFollowupDate(null);
    setNxtFollowupDateError("");
    setNewComment("");
    setNewCommentError("");
    setCommentsHistory([]);
    setLeadHistoryId(null);
    setLeadId(null);
    setLeadDetails(null);
    setCurrentIndex(null);
    //add lead usestates
    if (dontCloseAddDrawer === true) {
      setIsOpenAddDrawer(true);
    } else {
      setIsOpenAddDrawer(false);
    }
    setIsOpenFilterDrawer(false);
  };

  return (
    <div style={{ position: "relative" }}>
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
                          setPagination({
                            page: 1,
                          });
                          dispatch(
                            storeFollowUpFilterValues({
                              searchValue: null,
                              pageNumber: 1,
                              pageLimit: pagination.limit,
                            })
                          );
                          getLeadFollowUpsData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
                            false,
                            allDownliners,
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
                            dispatch(
                              storeFollowUpFilterValues({
                                filterType: e.target.value,
                              })
                            );
                            if (searchValue == "") {
                              return;
                            } else {
                              setSearchValue("");
                              dispatch(
                                storeFollowUpFilterValues({
                                  searchValue: "",
                                  pageNumber: 1,
                                  pageLimit: pagination.limit,
                                })
                              );
                              setPagination({
                                page: 1,
                              });
                              getLeadFollowUpsData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
                                false,
                                allDownliners,
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
                      borderRightNone={true}
                    />
                  </div>
                  <div
                    onClick={() => {
                      if (executiveCountTooltip) {
                        return;
                      }
                      handleLeadCountByExecutive();
                    }}
                  >
                    <Flex
                      justify="center"
                      align="center"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <Tooltip
                        placement="bottomLeft"
                        color="#fff"
                        title={
                          <>
                            {leadExeCountLoading ? (
                              <div className="leadsmanager_executivecount_loader_container">
                                <Spin size="small" />
                              </div>
                            ) : (
                              <div
                                style={{
                                  maxHeight: "140px",
                                  overflowY: "auto",
                                  whiteSpace: "pre-line",
                                  lineHeight: "26px",
                                }}
                              >
                                {leadCountByExecutives.map((item, index) => {
                                  return (
                                    <p className="leadsmanager_executivecount_text">
                                      {`${index + 1}. ${item.user_name} - ${
                                        item.follow_up_count
                                      }`}
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        }
                        trigger={["click"]}
                        onOpenChange={(value) => {
                          setExecutiveCountTooltip(value);
                          if (value === false) {
                            setLeadCountByExecutives([]);
                          }
                        }}
                      >
                        <Button className="leadsmanager_executivecount_iconcontainer">
                          <MdFormatListNumbered size={16} />
                        </Button>
                      </Tooltip>
                    </Flex>
                  </div>
                </div>
              </Col>
            )}
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  dispatch(
                    storeFollowUpFilterValues({
                      start_date: dates[0],
                      end_date: dates[1],
                      pageNumber: 1,
                      pageLimit: pagination.limit,
                    })
                  );
                  setPagination({
                    page: 1,
                  });
                  getLeadFollowUpsData(
                    searchValue,
                    dates[0],
                    dates[1],
                    false,
                    allDownliners,
                    1,
                    pagination.limit
                  );
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={7}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {permissions.includes("Add Lead Button") && (
              <>
                <button
                  className="leadmanager_addleadbutton"
                  ref={addLeadButtonRef}
                  onClick={() => {
                    // setAddLeadTour(true);
                    setIsOpenAddDrawer(true);
                    setTimeout(() => {
                      const drawerBody = document.querySelector(
                        "#leadfollowup_addlead_drawer .ant-drawer-body"
                      );
                      if (drawerBody) {
                        drawerBody.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }
                    }, 300);
                  }}
                >
                  Add Lead
                </button>

                {/* <Tour
                  open={addLeadTour}
                  onClose={() => setAddLeadTour(false)}
                  steps={steps}
                  onFinish={() => {
                    setAddLeadTour(false);
                    setIsOpenAddDrawer(true);
                    setTimeout(() => {
                      const drawerBody = document.querySelector(
                        "#leadfollowup_addlead_drawer .ant-drawer-body"
                      );
                      if (drawerBody) {
                        drawerBody.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }
                    }, 300);
                  }}
                  mask={{
                    style: { backgroundColor: "rgba(0,0,0,0.6)" }, // dull background
                  }}
                /> */}
              </>
            )}

            {permissions.includes("Download Lead Followups") && (
              <Tooltip placement="top" title="Download">
                <Button
                  className={
                    downloadButtonLoader
                      ? "customer_loading_download_button"
                      : "customer_download_button"
                  }
                  onClick={handleDownload}
                  disabled={downloadButtonLoader}
                >
                  {downloadButtonLoader ? (
                    <Spin
                      indicator={<LoadingOutlined spin />}
                      size="small"
                      style={{ color: "#333" }}
                    />
                  ) : (
                    <DownloadOutlined className="download_icon" />
                  )}
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
          </div>
        </Col>
      </Row>
      <div style={{ marginTop: "20px" }}>
        <CommonTable
          // scroll={{ x: 1250 }}
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0
            ),
          }}
          columns={tableColumns}
          dataSource={followUpData}
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
                  page_name: "Lead Followup",
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

      <Modal
        title="Update Followup"
        open={isOpenCommentModal}
        onCancel={formReset}
        footer={false}
        width="35%"
        className="leadfollowup_actionmodal"
      >
        <div className="leadfollowup_actionfield_mainContainer">
          <Row gutter={12} className="leadfollowup_actionfield_rowdiv">
            <Col span={12}>
              <CommonSelectField
                label="Action"
                options={actionOptions}
                height="34px"
                labelMarginTop="-2px"
                value={actionId}
                onChange={(e) => {
                  const value = e.target.value;
                  setActionId(value);
                  if (value != 1) {
                    setNxtFollowupDate(null);
                    setNxtFollowupDateError("");
                  }
                  setActionIdError(selectValidator(value));
                }}
                error={actionIdError}
              />
            </Col>

            {actionId == 1 && (
              <Col span={12}>
                <CommonDatePicker
                  placeholder="Next Followup Date"
                  height="35px"
                  onChange={(value) => {
                    console.log("nxtttttt", value);
                    setNxtFollowupDate(value);
                    setNxtFollowupDateError(selectValidator(value));
                  }}
                  value={nxtFollowupDate}
                  error={nxtFollowupDateError}
                  disablePreviousDates={true}
                />
              </Col>
            )}
          </Row>

          <p className="leadmanager_commentbox_heading">Comments</p>
          {commentsHistory.length >= 1 ? (
            <>
              {commentsHistory.map((item) => {
                return (
                  <>
                    <div className="leadmanager_comments_namecontainer">
                      <div className="leadfollowup_chatbox_initialContainer">
                        <p>BA</p>
                      </div>
                      <p className="leadfollowup_comment_username">
                        Balaji{" "}
                        <span className="leadfollowup_comment_time">
                          {shortRelativeTime(item.updated_date)}
                        </span>
                      </p>
                    </div>
                    <p className="leadfollowup_comments_text">
                      {item.comments}
                    </p>
                  </>
                );
              })}
            </>
          ) : (
            <p className="leadfollowup_comment_nodatafound">
              No comments found
            </p>
          )}

          <div style={{ position: "relative" }}>
            <TextArea
              placeholder="Add Comment..."
              className="leadmanager_commentbox_input"
              onChange={(e) => {
                setNewComment(e.target.value);
                setNewCommentError(addressValidator(e.target.value));
              }}
              value={newComment}
            />
            {buttonLoading ? (
              <div
                className="leadmanager_comment_senddiv"
                style={{ opacity: 0.7 }}
              >
                <IoMdSend size={18} />
              </div>
            ) : (
              <div
                className="leadmanager_comment_senddiv"
                onClick={handleUpdateFollowUp}
              >
                <IoMdSend size={18} />
              </div>
            )}
          </div>

          {newCommentError && (
            <p className="leadfollowup_newcommenterror">
              {"Comments" + newCommentError}
            </p>
          )}
        </div>
      </Modal>

      <div
        className="leadfollowup_chatbox_container"
        style={{ display: isOpenChat ? "block" : "none" }}
        ref={chatBoxRef}
      >
        <div className="leadfollowup_chatbox_headercontainer">
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className="leadfollowup_chatbox_initialContainer">
              <p>BA</p>
            </div>
            <p className="leadfollowup_chatbox_username">Balaji</p>
          </div>

          <div
            className="leadfollowup_chatbox_header_closediv"
            onClick={() => setIsOpenChat(false)}
          >
            <IoIosClose size={16} />{" "}
          </div>
        </div>

        <div className="chat-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${
                msg.type === "sender" ? "sender-row" : "receiver-row"
              }`}
            >
              {msg.type === "receiver" ? (
                <div className={"chat_receiver_usernamediv"}>
                  <p className="username">BA</p>
                </div>
              ) : (
                ""
              )}
              <div
                className={`message ${
                  msg.type === "sender" ? "sender" : "receiver"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* add lead drawer */}
      <Drawer
        title="Add Lead"
        open={isOpenAddDrawer}
        onClose={() => {
          setIsOpenAddDrawer(false);
        }}
        width="52%"
        style={{ position: "relative" }}
        id="leadfollowup_addlead_drawer"
      >
        <AddLead
          ref={addLeaduseRef}
          leadTypeOptions={leadTypeOptions}
          regionOptions={regionOptions}
          leadId={leadId}
          updateLeadItem={null}
          setButtonLoading={setButtonLoading}
          setSaveOnlyLoading={setSaveOnlyLoading}
          setIsOpenAddDrawer={setIsOpenAddDrawer}
          callgetLeadsApi={() => {
            getLeadFollowUpsData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              false,
              allDownliners,
              pagination.page,
              pagination.limit
            );
            refreshLeads();
          }}
        />
        <div className="leadmanager_submitlead_buttoncontainer">
          <div style={{ display: "flex", gap: "12px" }}>
            <>
              {saveOnlyLoading ? (
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
                  Save
                </button>
              )}
            </>

            {buttonLoading ? (
              <button className="leadmanager_loadingsaveleadbutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="leadmanager_saveleadbutton"
                onClick={() =>
                  addLeaduseRef.current.handleSubmit("Save And Add New")
                }
              >
                Save And Add New
              </button>
            )}
          </div>
        </div>
      </Drawer>

      <Drawer
        title="Lead Follow-Up"
        open={isOpenFollowUpDrawer}
        onClose={formReset}
        width="52%"
        style={{ position: "relative", paddingBottom: "65px" }}
        className="customer_statusupdate_drawer"
      >
        <p
          className="leadfollowup_leaddetails_heading"
          id="leadfollowup_leaddetails_heading"
        >
          Lead Details
        </p>
        <Row gutter={16} style={{ padding: "0px 0px 0px 24px" }}>
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
                  {leadDetails && leadDetails.candidate_name
                    ? leadDetails.candidate_name
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
                  <p className="customerdetails_rowheading">Branch</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.branche_name
                    ? leadDetails.branche_name
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
          </Col>
        </Row>
        <Divider className="customer_statusupdate_divider" />
        <div className="customer_statusupdate_adddetailsContainer">
          <p className="customer_statusupdate_adddetails_heading">
            Follow-Up History
          </p>

          {commentsHistory.length >= 1 ? (
            <div className="leadmanager_comments_maincontainer">
              {commentsHistory.map((item) => {
                return (
                  <>
                    <div className="leadmanager_comments_namecontainer">
                      <CommonAvatar itemName={item.user_name} avatarSize={32} />
                      <p className="leadfollowup_comment_username">
                        {item.user_name
                          ? `${item.updated_by} - ${item.user_name}`
                          : "-"}
                        <span className="leadfollowup_comment_time">
                          {item.updated_date
                            ? moment(item.updated_date).format(
                                "YYYY-MM-DD hh:mm:ss A"
                              )
                            : item.created_date
                            ? moment(item.created_date).format(
                                "YYYY-MM-DD hh:mm:ss A"
                              )
                            : "-"}
                        </span>
                      </p>
                    </div>
                    <p className="leadfollowup_comments_text">
                      {item.comments}
                    </p>

                    {item.status && (
                      <p className="leadfollowup_qualitystatus_text">
                        <span style={{ fontWeight: 600, color: "gray" }}>
                          Status:
                        </span>{" "}
                        {item.status == 1
                          ? "Details Shared"
                          : item.status == 2
                          ? "Details Not Shared"
                          : "CNA"}
                      </p>
                    )}
                  </>
                );
              })}
            </div>
          ) : (
            <p className="leadfollowup_comment_nodatafound">
              No comments found
            </p>
          )}
        </div>{" "}
        <Divider className="customer_statusupdate_divider" />
        <div className="customer_statusupdate_adddetailsContainer">
          <p className="customer_statusupdate_adddetails_heading">
            Update Follow-Up
          </p>
          <Row style={{ marginTop: "10px" }}>
            <Col span={24}>
              <CommonTextArea
                label="Comments"
                required={true}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  setNewCommentError(addressValidator(e.target.value));
                }}
                value={newComment}
                error={newCommentError}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: "30px", marginBottom: "16px" }}>
            <Col span={12}>
              <CommonSelectField
                label="Action"
                options={actionOptions}
                value={actionId}
                onChange={(e) => {
                  const value = e.target.value;
                  setActionId(value);
                  if (value != 1) {
                    setNxtFollowupDate(null);
                    setNxtFollowupDateError("");
                  } else {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // optional: reset time

                    const nextDay = new Date(today);
                    nextDay.setDate(today.getDate() + 2);
                    setNxtFollowupDate(nextDay);
                    setNxtFollowupDateError("");
                  }
                  setActionIdError(selectValidator(value));
                }}
                error={actionIdError}
              />{" "}
            </Col>

            {actionId == 1 || actionId == null ? (
              <Col span={12}>
                <CommonMuiDatePicker
                  label="Next Followup Date"
                  onChange={(value) => {
                    setNxtFollowupDate(value);
                    setNxtFollowupDateError(selectValidator(value));
                  }}
                  value={nxtFollowupDate}
                  error={nxtFollowupDateError}
                  disablePreviousDates={true}
                  disabled={true}
                />
              </Col>
            ) : (
              ""
            )}
          </Row>
        </div>
        <div
          className="leadmanager_tablefiler_footer"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div className="leadfollowup_prev_next_container">
            <Button
              className="leadfollowup_prev_next_button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              className="leadfollowup_prev_next_button"
              onClick={handleNext}
              disabled={currentIndex === followUpData.length - 1}
            >
              Next
            </Button>
          </div>
          <div className="leadmanager_submitlead_buttoncontainer">
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={handleUpdateFollowUp}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
