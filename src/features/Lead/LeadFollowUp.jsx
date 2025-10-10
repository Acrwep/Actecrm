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
} from "antd";
import { FiFilter } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import CommonDnd from "../Common/CommonDnd";
import { IoIosClose } from "react-icons/io";
import {
  createArea,
  createLead,
  createTechnology,
  getAllAreas,
  getBranches,
  getLeadFollowUps,
  getTechnologies,
  updateFollowUp,
} from "../ApiService/action";
import { IoMdSend } from "react-icons/io";
import moment from "moment";
import CommonDatePicker from "../Common/CommonDatePicker";
import { MdAdd } from "react-icons/md";
import { SiWhatsapp } from "react-icons/si";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import { BiMapPin } from "react-icons/bi";
import {
  nameValidator,
  emailValidator,
  mobileValidator,
  addressValidator,
  formatToBackendIST,
  selectValidator,
  shortRelativeTime,
  priceCategory,
  getCurrentandPreviousweekDate,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonInputField from "../Common/CommonInputField";
import CommonTextArea from "../Common/CommonTextArea";
import { Country, State, City } from "country-state-city";
import CommonSpinner from "../Common/CommonSpinner";
import CommonAvatar from "../Common/CommonAvatar";
import { useSelector } from "react-redux";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";

const { TextArea } = Input;

export default function LeadFollowUp({
  setFollowupCount,
  refreshLeads,
  leadTypeOptions,
  regionOptions,
  courseOptions,
  setCourseOptions,
  areaOptions,
  setAreaOptions,
}) {
  const chatBoxRef = useRef();
  const mounted = useRef(false);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [filterType, setFilterType] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [leadExecutives, setLeadExecutives] = useState([]);
  const [leadExecutiveId, setLeadExecutiveId] = useState(null);
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
  //add lead usestates
  const [leadDetails, setLeadDetails] = useState(null);
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [countryId, setCountryId] = useState(null);
  const [countryError, setCountryError] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [stateId, setStateId] = useState("");
  const [stateError, setStateError] = useState("");
  const [areaId, setAreaId] = useState("");
  const [areaError, setAreaError] = useState("");
  const [isAreaFocused, setIsAreaFocused] = useState(false);
  const [isOpenAddAreaModal, setIsOpenAddAreaModal] = useState(false);
  const [primaryCourse, setPrimaryCourse] = useState(null);
  const [primaryCourseError, setPrimaryCourseError] = useState("");
  const [isPrimaryCourseFocused, setIsPrimaryCourseFocused] = useState(false);
  const [primaryFees, setPrimaryFees] = useState("");
  const [primaryFeesError, setPrimaryFeesError] = useState("");
  const [isShowSecondaryCourse, setIsShowSecondaryCourse] = useState(false);
  const [secondaryCourse, setSecondaryCourse] = useState(null);
  const [secondaryFees, setSecondaryFees] = useState("");
  const [leadType, setLeadType] = useState(null);
  const [leadTypeError, setLeadTypeError] = useState("");
  const leadStatusOptions = [
    {
      id: 1,
      name: "High",
    },
    {
      id: 2,
      name: "Medium",
    },
    {
      id: 3,
      name: "Low",
    },
    {
      id: 4,
      name: "Junk",
    },
  ];
  const [leadStatus, setLeadStatus] = useState(null);
  const [leadStatusError, setLeadStatusError] = useState("");
  const [leadNxtFollowupDate, setLeadNxtFollowupDate] = useState(null);
  const [leadNxtFollowupDateError, setLeadNxtFollowupDateError] =
    useState(null);
  const [expectDateJoin, setExpectDateJoin] = useState(null);

  const [regionId, setRegionId] = useState(null);
  const [regionError, setRegionError] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [branch, setBranch] = useState("");
  const [branchError, setBranchError] = useState("");
  const batchTrackOptions = [
    {
      id: 1,
      name: "Normal",
    },
    {
      id: 2,
      name: "Fastrack",
    },
    {
      id: 3,
      name: "Custom",
    },
  ];
  const [batchTrack, setBatchTrack] = useState(1);
  const [batchTrackError, setBatchTrackError] = useState("");
  const [comments, setComments] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [saveOnlyLoading, setSaveOnlyLoading] = useState(false);
  //add course usestates
  const [isOpenAddCourseModal, setIsOpenAddCourseModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseNameError, setCourseNameError] = useState("");
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  //add area usestates
  const [areaName, setAreaName] = useState("");
  const [areaNameError, setAreaNameError] = useState("");

  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [defaultColumns, setDefaultColumns] = useState([
    { title: "Lead Executive", isChecked: true },
    { title: "Next Follow Up", isChecked: true },
    { title: "Candidate Name", isChecked: true },
    { title: "Email", isChecked: true },
    { title: "Mobile", isChecked: true },
    { title: "Course ", isChecked: true },
    { title: "Course Fees ", isChecked: true },
    { title: "Last Update ", isChecked: true },
    { title: "Recent Comments", isChecked: true },
  ]);

  const nonChangeColumns = [
    {
      title: "Lead Executive",
      key: "lead_assigned_to_name",
      dataIndex: "lead_assigned_to_name",
    },
    {
      title: "Next Follow Up",
      key: "next_follow_up_date",
      dataIndex: "next_follow_up_date",
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
              setCommentsHistory(record.histories);
              setLeadId(record.id);
              setLeadHistoryId(record.lead_history_id);
              setLeadDetails(record);
              setCurrentIndex(index);
            }}
          >
            <p>{moment(text).format("DD/MM/YYYY")}</p>
            <div className="leadfollowup_tablecommentContainer">
              <p>{record.histories.length}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Candidate Name",
      key: "candidate_name",
      dataIndex: "candidate_name",
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 200,
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 120 },
    {
      title: "Course",
      key: "primary_course",
      dataIndex: "primary_course",
      width: 180,
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
      title: "Recent Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 200,
      render: (text) => {
        if (text) {
          return (
            <>
              {text.length > 25 ? (
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
                    {text.slice(0, 24) + "..."}
                  </p>
                </Tooltip>
              ) : (
                <p>{text}</p>
              )}
            </>
          );
        } else {
          <p>-</p>;
        }
      },
    },
  ];

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
    const countries = Country.getAllCountries();
    const updateCountries = countries.map((c) => {
      return { ...c, id: c.isoCode };
    });
    setCountryOptions(updateCountries);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    if (childUsers.length > 0 && !mounted.current) {
      setLeadExecutives(downlineUsers);
      mounted.current = true;
      getLeadFollowUpsData(
        null,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        false,
        null,
        1,
        10
      );
    }
  }, [childUsers]);

  const getLeadFollowUpsData = async (
    searchvalue,
    startDate,
    endDate,
    updateStatus,
    executive_id,
    pageNumber,
    limit
  ) => {
    setLoading(true);
    let lead_executive = [];
    if (executive_id) {
      lead_executive.push(executive_id);
    } else {
      lead_executive = [];
    }
    const payload = {
      ...(searchvalue && filterType == 1
        ? { name: searchvalue }
        : searchvalue && filterType == 2
        ? { email: searchvalue }
        : searchvalue && filterType == 3
        ? { phone: searchvalue }
        : {}),
      from_date: startDate,
      to_date: endDate,
      user_ids: lead_executive.length >= 1 ? lead_executive : childUsers,
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
      if (updateStatus === true) {
        const record = followup_data[currentIndex];
        if (!record) return;

        setCurrentIndex(currentIndex);
        setLeadDetails(record);
        setCommentsHistory(record.histories);
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

  const handlePaginationChange = ({ page, limit }) => {
    getLeadFollowUpsData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      false,
      leadExecutiveId,
      page,
      limit
    );
  };

  const getCourseData = async () => {
    try {
      const response = await getTechnologies();
      setCourseOptions(response?.data?.data || []);
    } catch (error) {
      setCourseOptions([]);
      console.log("response status error", error);
    }
  };

  const getAreasData = async () => {
    try {
      const response = await getAllAreas();
      setAreaOptions(response?.data?.data || []);
    } catch (error) {
      setAreaOptions([]);
      console.log("response status error", error);
    }
  };

  //onchange functions
  const handleCountry = (e) => {
    const value = e.target.value;
    console.log(value, countryOptions);
    setCountryId(value);
    setStateId("");
    const selectedCountry = countryOptions.find((f) => f.id === value);
    console.log("selected country", value, selectedCountry);
    setPhoneCode(selectedCountry.phonecode);

    const stateList = State.getStatesOfCountry(selectedCountry.id);
    const updateSates = stateList.map((s) => {
      return { ...s, id: s.isoCode };
    });
    console.log(updateSates, "updateSates");
    setStateOptions(updateSates);
    if (validationTrigger) {
      setCountryError(selectValidator(value));
    }
  };

  const handleState = (e) => {
    const value = e.target.value;
    setStateId(value);
    setAreaId("");
    if (validationTrigger) {
      setStateError(selectValidator(value));
    }
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
          const reordered = [
            ...branch_data.filter((item) => item.name == "Online"),
            ...branch_data.filter((item) => item.name != "Online"),
          ];
          setBranchOptions(reordered);
        }
      } else {
        setBranchOptions([]);
      }
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
    }
  };

  const handleUpdateFollowUp = async () => {
    const actionValidate = selectValidator(actionId);
    const commentValidate = addressValidator(newComment);

    let nxtFollowdateValidate = "";

    if (actionId === 1) {
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
        setPagination({
          page: 1,
        });
        getLeadFollowUpsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          true,
          leadExecutiveId,
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

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setPagination({
      page: 1,
    });
    setTimeout(() => {
      getLeadFollowUpsData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        false,
        leadExecutiveId,
        1,
        pagination.limit
      );
    }, 300);
  };

  const handleSubmit = async (saveType) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    console.log("convertAsJson", convertAsJson);

    setValidationTrigger(true);

    let nxtFollowupDateValidate;

    if (leadStatus == 4) {
      nxtFollowupDateValidate = "";
    } else {
      nxtFollowupDateValidate = selectValidator(leadNxtFollowupDate);
    }

    const nameValidate = nameValidator(name);
    const emailValidate = emailValidator(email);
    const mobileValidate = mobileValidator(mobile);
    const whatsAppValidate = mobileValidator(whatsApp);
    const countryValidate = selectValidator(countryId);
    const stateValidate = selectValidator(stateId);
    const cityValidate = selectValidator(areaId);
    const primaryCourseValidate = selectValidator(primaryCourse);
    const primaryFeesValidate = selectValidator(primaryFees);
    const leadTypeValidate = selectValidator(leadType);
    const leadStatusValidate = selectValidator(leadStatus);
    const regionIdValidate = selectValidator(regionId);
    const branchValidate = selectValidator(branch);
    const batchTrackValidate = selectValidator(batchTrack);
    const commentsValidate = addressValidator(comments);

    setNameError(nameValidate);
    setEmailError(emailValidate);
    setMobileError(mobileValidate);
    setWhatsAppError(whatsAppValidate);
    setCountryError(countryValidate);
    setStateError(stateValidate);
    setAreaError(cityValidate);
    setPrimaryCourseError(primaryCourseValidate);
    setPrimaryFeesError(primaryFeesValidate);
    setLeadTypeError(leadTypeValidate);
    setLeadStatusError(leadStatusValidate);
    setLeadNxtFollowupDateError(nxtFollowupDateValidate);
    setRegionError(regionIdValidate);
    setBranchError(branchValidate);
    setBatchTrackError(batchTrackValidate);
    setCommentsError(commentsValidate);

    if (
      nameValidate ||
      emailValidate ||
      mobileValidate ||
      whatsAppValidate ||
      countryValidate ||
      stateValidate ||
      cityValidate ||
      primaryCourseValidate ||
      primaryFeesValidate ||
      leadTypeValidate ||
      leadStatusValidate ||
      nxtFollowupDateValidate ||
      regionIdValidate ||
      branchValidate ||
      batchTrackValidate ||
      commentsValidate
    )
      return;

    if (saveType === "Save Only") {
      setSaveOnlyLoading(true);
    } else {
      setButtonLoading(true);
    }

    const today = new Date();

    const getArea = areaOptions.find((f) => f.id == areaId);

    const payload = {
      ...(leadId && { lead_id: leadId }),
      user_id: convertAsJson?.user_id,
      name: name,
      phone_code: `+${phoneCode}`,
      phone: mobile,
      whatsapp: whatsApp,
      email: email,
      country: countryId,
      state: stateId,
      district: getArea.name,
      primary_course_id: primaryCourse,
      primary_fees: primaryFees,
      price_category: priceCategory(primaryFees),
      secondary_course_id: secondaryCourse,
      secondary_fees: secondaryFees ? secondaryFees : 0,
      lead_type_id: leadType,
      lead_status_id: leadStatus,
      next_follow_up_date: leadNxtFollowupDate
        ? formatToBackendIST(leadNxtFollowupDate)
        : null,
      expected_join_date: expectDateJoin
        ? formatToBackendIST(expectDateJoin)
        : null,
      region_id: regionId,
      branch_id: branch,
      batch_track_id: batchTrack,
      comments: comments,
      created_date: formatToBackendIST(today),
    };

    try {
      await createLead(payload);
      CommonMessage("success", "Lead created");
      setTimeout(() => {
        if (saveType === "Save Only") {
          formReset();
        } else {
          formReset(true);
        }
        setPagination({
          page: 1,
        });
        getLeadFollowUpsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          false,
          leadExecutiveId,
          1,
          pagination.limit
        );
        refreshLeads();
      }, 300);
    } catch (error) {
      console.log("lead create error", error);
      setButtonLoading(false);
      setSaveOnlyLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCreateCourse = async () => {
    const courseValidate = addressValidator(courseName);

    setCourseNameError(courseValidate);

    if (courseValidate) return;

    const payload = {
      course_name: courseName,
    };
    setAddCourseLoading(true);

    try {
      await createTechnology(payload);
      CommonMessage("success", "Course Created");
      setTimeout(() => {
        setAddCourseLoading(false);
        setIsOpenAddCourseModal(false);
        setCourseName("");
        setCourseNameError("");
        getCourseData();
      }, 300);
    } catch (error) {
      console.log(error);
      setAddCourseLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCreateArea = async () => {
    const areaValidate = addressValidator(areaName);

    setAreaNameError(areaValidate);

    if (areaValidate) return;

    const payload = {
      area_name: areaName,
    };
    setAddCourseLoading(true);

    try {
      await createArea(payload);
      CommonMessage("success", "Area Created");
      setTimeout(() => {
        setAddCourseLoading(false);
        setIsOpenAddAreaModal(false);
        setAreaName("");
        setAreaNameError("");
        getAreasData();
      }, 300);
    } catch (error) {
      setAddCourseLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const updateDetailsByIndex = (index) => {
    const record = followUpData[index];
    if (!record) return;

    setCurrentIndex(index);
    setLeadDetails(record);
    setCommentsHistory(record.histories);
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
    setValidationTrigger(false);
    setTimeout(() => {
      setLeadId(null);
    }, 300);
    setName("");
    setNameError("");
    setEmail("");
    setEmailError("");
    setMobile("");
    setMobileError("");
    setWhatsApp("");
    setWhatsAppError("");
    setPhoneCode("");
    setCountryId(null);
    setCountryError("");
    setStateId(null);
    setStateError("");
    setAreaId(null);
    setAreaError("");
    setPrimaryCourse(null);
    setPrimaryCourseError("");
    setPrimaryFees("");
    setPrimaryFeesError("");
    setIsShowSecondaryCourse(false);
    setSecondaryCourse(null);
    setSecondaryFees("");
    setLeadType(null);
    setLeadTypeError("");
    setLeadStatus(null);
    setLeadStatusError("");
    setLeadNxtFollowupDate(null);
    setLeadNxtFollowupDateError("");
    setExpectDateJoin(null);
    setRegionId(null);
    setRegionError("");
    setBranch("");
    setBranchError("");
    setBatchTrack(1);
    setBatchTrackError("");
    setComments("");
    setCommentsError("");
    setButtonLoading(false);
    setSaveOnlyLoading(false);
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
                      ? "Search By Name"
                      : filterType == 2
                      ? "Search By Email"
                      : filterType == 3
                      ? "Search by Mobile"
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
                          getLeadFollowUpsData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
                            false,
                            leadExecutiveId,
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
                            if (searchValue == "") {
                              return;
                            } else {
                              setSearchValue("");
                              setPagination({
                                page: 1,
                              });
                              getLeadFollowUpsData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
                                false,
                                leadExecutiveId,
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
                            Search by Name
                          </Radio>
                          <Radio value={2} style={{ marginBottom: "12px" }}>
                            Search by Email
                          </Radio>
                          <Radio value={3} style={{ marginBottom: "6px" }}>
                            Search by Mobile
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
                <CommonSelectField
                  height="35px"
                  label="Select Lead Executive"
                  labelMarginTop="0px"
                  labelFontSize="13px"
                  options={leadExecutives}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setLeadExecutiveId(e.target.value);
                    setPagination({
                      page: 1,
                    });
                    getLeadFollowUpsData(
                      searchValue,
                      selectedDates[0],
                      selectedDates[1],
                      false,
                      e.target.value,
                      1,
                      pagination.limit
                    );
                  }}
                  value={leadExecutiveId}
                  disableClearable={false}
                />
              </Col>
            )}
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getLeadFollowUpsData(
                    searchValue,
                    dates[0],
                    dates[1],
                    false,
                    leadExecutiveId,
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
            }}
          >
            {permissions.includes("Add Lead Button") && (
              <button
                className="leadmanager_addleadbutton"
                onClick={() => {
                  setIsOpenAddDrawer(true);
                }}
              >
                Add Lead
              </button>
            )}

            <FiFilter
              size={20}
              color="#5b69ca"
              style={{ marginLeft: "12px", cursor: "pointer" }}
              onClick={() => setIsOpenFilterDrawer(true)}
            />
          </div>
        </Col>
      </Row>
      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1250 }}
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
        title="Manage Table"
        open={isOpenFilterDrawer}
        onClose={formReset}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative" }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd
                data={defaultColumns}
                setDefaultColumns={setDefaultColumns}
              />
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={() => {
                const reorderedColumns = defaultColumns
                  .filter((item) => item.isChecked) // only include checked items
                  .map((defaultItem) =>
                    nonChangeColumns.find(
                      (col) => col.title.trim() === defaultItem.title.trim()
                    )
                  )
                  .filter(Boolean); // remove unmatched/null entries

                console.log("Reordered Columns:", reorderedColumns);

                setTableColumns(reorderedColumns);
                setIsOpenFilterDrawer(false);
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
        onClose={formReset}
        width="52%"
        style={{ position: "relative" }}
      >
        <p className="addleaddrawer_headings">Basic Information</p>
        <Row gutter={16}>
          <Col span={8}>
            <CommonInputField
              label="Candidate Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationTrigger) {
                  setNameError(nameValidator(e.target.value));
                }
              }}
              error={nameError}
              required={true}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Email"
              required={true}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationTrigger) {
                  setEmailError(emailValidator(e.target.value));
                }
              }}
              error={emailError}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Mobile Number"
              required={true}
              maxLength={10}
              type="number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                if (validationTrigger) {
                  setMobileError(mobileValidator(e.target.value));
                }
              }}
              error={mobileError}
              onInput={(e) => {
                if (e.target.value.length > 15) {
                  e.target.value = e.target.value.slice(0, 15);
                }
              }}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonOutlinedInput
              label="Whatsapp Number"
              icon={<SiWhatsapp color="#39AE41" />}
              required={true}
              maxLength={10}
              type="number"
              value={whatsApp}
              onChange={(e) => {
                setWhatsApp(e.target.value);
                if (validationTrigger) {
                  setWhatsAppError(mobileValidator(e.target.value));
                }
              }}
              error={whatsAppError}
              onInput={(e) => {
                if (e.target.value.length > 15) {
                  e.target.value = e.target.value.slice(0, 15);
                }
              }}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Lead Source"
              required={true}
              options={leadTypeOptions}
              onChange={(e) => {
                setLeadType(e.target.value);
                if (validationTrigger) {
                  setLeadTypeError(selectValidator(e.target.value));
                }
              }}
              value={leadType}
              error={leadTypeError}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Country"
              value={countryId}
              onChange={handleCountry}
              options={countryOptions}
              error={countryError}
              required={true}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "26px", marginBottom: "30px" }}>
          <Col span={8}>
            <CommonSelectField
              label="State"
              value={stateId}
              onChange={handleState}
              options={stateOptions}
              error={stateError}
              required={true}
            />
          </Col>
          <Col span={8}>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div style={{ flex: 1 }}>
                <CommonSelectField
                  label="Area"
                  value={areaId}
                  onChange={(e) => {
                    setAreaId(e.target.value);
                    if (validationTrigger) {
                      setAreaError(selectValidator(e.target.value));
                    }
                  }}
                  options={areaOptions}
                  error={areaError}
                  required={true}
                  borderRightNone={true}
                  onFocus={() => setIsAreaFocused(true)}
                  onBlur={() => setIsAreaFocused(false)}
                />
              </div>

              <div
                className={
                  areaError
                    ? "leads_errorcourse_addcontainer"
                    : isAreaFocused
                    ? "leads_focusedcourse_addcontainer"
                    : "leads_course_addcontainer"
                }
              >
                <Tooltip
                  placement="bottom"
                  title="Add Area"
                  className="leadtable_customertooltip"
                >
                  <MdAdd
                    size={19}
                    style={{ color: "#333333af", cursor: "pointer" }}
                    onClick={() => setIsOpenAddAreaModal(true)}
                  />
                </Tooltip>
              </div>
            </div>
          </Col>
        </Row>

        <p className="addleaddrawer_headings">Course Details</p>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div style={{ flex: 1 }}>
                <CommonSelectField
                  label="Primary Course"
                  value={primaryCourse}
                  onChange={(e) => {
                    setPrimaryCourse(e.target.value);
                    if (validationTrigger) {
                      setPrimaryCourseError(selectValidator(e.target.value));
                    }
                  }}
                  options={courseOptions}
                  error={primaryCourseError}
                  required={true}
                  borderRightNone={true}
                  errorFontSize="9px"
                  onFocus={() => setIsPrimaryCourseFocused(true)}
                  onBlur={() => setIsPrimaryCourseFocused(false)}
                />
              </div>

              <div
                className={
                  primaryCourseError
                    ? "leads_errorcourse_addcontainer"
                    : isPrimaryCourseFocused
                    ? "leads_focusedcourse_addcontainer"
                    : "leads_course_addcontainer"
                }
              >
                <Tooltip
                  placement="bottom"
                  title="Add Course"
                  className="leadtable_customertooltip"
                >
                  <MdAdd
                    size={19}
                    style={{ color: "#333333af", cursor: "pointer" }}
                    onClick={() => setIsOpenAddCourseModal(true)}
                  />
                </Tooltip>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Fees"
              required={true}
              value={primaryFees}
              onChange={(e) => {
                setPrimaryFees(e.target.value);
                if (validationTrigger) {
                  setPrimaryFeesError(selectValidator(e.target.value));
                }
              }}
              error={primaryFeesError}
            />
          </Col>
          <Col span={8}>
            <Checkbox
              checked={isShowSecondaryCourse}
              onChange={(e) => {
                setIsShowSecondaryCourse(e.target.checked);
                if (e.target.checked === false) {
                  setSecondaryCourse(null);
                  setSecondaryFees("");
                }
              }}
              style={{ fontSize: "12px", marginTop: "8px" }}
            >
              Add Course
            </Checkbox>
          </Col>
        </Row>

        {isShowSecondaryCourse && (
          <Row gutter={16} style={{ marginTop: "30px" }}>
            <Col span={8}>
              <CommonSelectField
                label="Secondary Course"
                value={secondaryCourse}
                onChange={(e) => {
                  setSecondaryCourse(e.target.value);
                }}
                options={courseOptions}
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Fees"
                value={secondaryFees}
                onChange={(e) => {
                  setSecondaryFees(e.target.value);
                }}
              />
            </Col>
          </Row>
        )}

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
          <Col span={8}>
            <CommonSelectField
              label="Region"
              required={true}
              options={regionOptions}
              onChange={(e) => {
                setRegionId(e.target.value);
                setBranch("");
                getBranchesData(e.target.value);
                if (validationTrigger) {
                  setRegionError(selectValidator(e.target.value));
                }
              }}
              value={regionId}
              error={regionError}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Branch Name"
              required={true}
              options={branchOptions}
              onChange={(e) => {
                setBranch(e.target.value);
                if (validationTrigger) {
                  setBranchError(selectValidator(e.target.value));
                }
              }}
              value={branch}
              error={branchError}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Batch Track"
              required={true}
              options={batchTrackOptions}
              onChange={(e) => {
                setBatchTrack(e.target.value);
                if (validationTrigger) {
                  setBatchTrackError(selectValidator(e.target.value));
                }
              }}
              value={batchTrack}
              error={batchTrackError}
            />
          </Col>
        </Row>

        {/* <Row gutter={16} style={{ marginTop: "30px",  }}>
                <Col span={8}>
                
                </Col>
              </Row> */}

        <p className="addleaddrawer_headings">Response Status</p>

        <Row gutter={16} style={{ marginBottom: "30px" }}>
          <Col span={8}>
            <CommonSelectField
              label="Lead Status"
              required={true}
              options={leadStatusOptions}
              onChange={(e) => {
                const value = e.target.value;
                setLeadStatus(value);
                if (value == 4) {
                  setNxtFollowupDate(null);
                  setNxtFollowupDateError("");
                  setExpectDateJoin(null);
                }
                if (validationTrigger) {
                  setLeadStatusError(selectValidator(value));
                }
              }}
              value={leadStatus}
              error={leadStatusError}
            />
          </Col>

          {leadStatus == 4 ? (
            ""
          ) : (
            <>
              <Col span={8}>
                <CommonMuiDatePicker
                  label="Next Follow-Up Date"
                  required={true}
                  onChange={(value) => {
                    console.log("vallll", value);
                    setLeadNxtFollowupDate(value);
                    if (validationTrigger) {
                      setLeadNxtFollowupDateError(selectValidator(value));
                    }
                  }}
                  value={leadNxtFollowupDate}
                  disablePreviousDates={true}
                  error={leadNxtFollowupDateError}
                  disabled={false}
                />
              </Col>
              <Col span={8}>
                <CommonMuiDatePicker
                  label="Expected Date Join"
                  required={false}
                  onChange={(value) => {
                    console.log("vallll", value);
                    setExpectDateJoin(value);
                  }}
                  value={expectDateJoin}
                  disablePreviousDates={true}
                />
              </Col>
            </>
          )}
        </Row>

        <Row gutter={16} style={{ marginTop: "40px", marginBottom: "30px" }}>
          <Col span={24}>
            <div style={{ marginTop: "-20px" }}>
              <CommonTextArea
                label="Comments"
                required={true}
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                  if (validationTrigger) {
                    setCommentsError(addressValidator(e.target.value));
                  }
                }}
                error={commentsError}
              />
            </div>
          </Col>
        </Row>

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
                  onClick={() => {
                    handleSubmit("Save Only");
                  }}
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
                onClick={() => {
                  handleSubmit("Save And Add New");
                }}
              >
                Save And Add New
              </button>
            )}
          </div>
        </div>
      </Drawer>

      <Modal
        title="Add Course"
        open={isOpenAddCourseModal}
        onCancel={() => {
          setIsOpenAddCourseModal(false);
          setCourseName("");
          setCourseNameError("");
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

          addCourseLoading ? (
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
              onClick={handleCreateCourse}
              className="leads_coursemodal_createbutton"
            >
              Create
            </Button>
          ),
        ]}
        width="35%"
      >
        <div style={{ marginTop: "20px", marginBottom: "40px" }}>
          <CommonInputField
            label="Course Name"
            required={true}
            onChange={(e) => {
              setCourseName(e.target.value);
              setCourseNameError(addressValidator(e.target.value));
            }}
            value={courseName}
            error={courseNameError}
          />
        </div>
      </Modal>

      {/* add area modal */}
      <Modal
        title="Add Area"
        open={isOpenAddAreaModal}
        onCancel={() => {
          setIsOpenAddAreaModal(false);
          setAreaName("");
          setAreaNameError("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenAddAreaModal(false);
              setAreaName("");
              setAreaNameError("");
            }}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          addCourseLoading ? (
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
              onClick={handleCreateArea}
              className="leads_coursemodal_createbutton"
            >
              Create
            </Button>
          ),
        ]}
        width="35%"
      >
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <CommonInputField
            label="Area Name"
            required={true}
            onChange={(e) => {
              setAreaName(e.target.value);
              setAreaNameError(addressValidator(e.target.value));
            }}
            value={areaName}
            error={areaNameError}
          />
        </div>

        <div className="lead_course_instruction_container">
          <p style={{ fontSize: "12px", fontWeight: 500 }}>Note:</p>
          <p style={{ fontSize: "13px", marginTop: "2px" }}>
            Make sure the area name remains exactly as{" "}
            <span style={{ fontWeight: 600 }}>‘Google’</span>
          </p>
          <p style={{ fontSize: "12px", fontWeight: 500, marginTop: "6px" }}>
            Example:
          </p>
          <ul>
            <li>Velachery</li>
            <li>Perungudi</li>
          </ul>
        </div>
      </Modal>

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

            {/* <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <SlGlobe size={15} color="gray" />
                  <p className="customerdetails_rowheading">Country</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.country
                    ? getCountryName(leadDetails.country)
                    : "-"}
                </p>
              </Col>
            </Row> */}

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
                  {leadDetails && leadDetails.lead_assigned_to_name
                    ? leadDetails.lead_assigned_to_name
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
                        {item.user_name ? item.user_name : "-"}
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
