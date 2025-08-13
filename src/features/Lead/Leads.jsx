import React, { useState, useEffect } from "react";
import { Col, Row, Drawer, Rate } from "antd";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import {
  addressValidator,
  emailValidator,
  formatToBackendIST,
  getCurrentandPreviousweekDate,
  mobileValidator,
  nameValidator,
  priceCategory,
  selectValidator,
} from "../Common/Validation";
import CommonSelectField from "../Common/CommonSelectField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { SiWhatsapp } from "react-icons/si";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonTextArea from "../Common/CommonTextArea";
import CommonTable from "../Common/CommonTable";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import CommonDnd from "../Common/CommonDnd";
import { Country, State, City } from "country-state-city";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";
import {
  createLead,
  getBatchTrack,
  getBranches,
  getLeadResponseStatus,
  getLeads,
  getLeadStatus,
  getLeadType,
  getPriority,
  getTechnologies,
  getTrainingMode,
} from "../ApiService/action";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";

export default function Leads({ refreshLeadFollowUp }) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);

  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [countryId, setCountryId] = useState(null);
  const [countryError, setCountryError] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [stateId, setStateId] = useState("");
  const [stateError, setStateError] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [cityId, setCityId] = useState("");
  const [cityError, setCityError] = useState("");
  const [courseOptions, setCourseOptions] = useState([]);
  const [primaryCourse, setPrimaryCourse] = useState(null);
  const [primaryCourseError, setPrimaryCourseError] = useState("");
  const [primaryFees, setPrimaryFees] = useState("");
  const [primaryFeesError, setPrimaryFeesError] = useState("");
  const [secondaryCourse, setSecondaryCourse] = useState(null);
  const [secondaryFees, setSecondaryFees] = useState("");
  const [trainerModeOptions, setTrainerModeOptions] = useState([]);
  const [trainerMode, setTrainerMode] = useState(null);
  const [trainerModeError, setTrainerModeError] = useState("");
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [priority, setPriority] = useState(null);
  const [priorityError, setPriorityError] = useState("");
  const [leadTypeOptions, setLeadTypeOptions] = useState([]);
  const [leadType, setLeadType] = useState(null);
  const [leadTypeError, setLeadTypeError] = useState("");
  const [leadStatusOptions, setLeadStatusOptions] = useState([]);
  const [leadStatus, setLeadStatus] = useState(null);
  const [leadStatusError, setLeadStatusError] = useState("");
  const [responseStatusOptions, setResponseStatusOptions] = useState([]);
  const [responseStatus, setResponseLeadStatus] = useState(null);
  const [responseStatusError, setResponseLeadStatusError] = useState("");
  const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
  const [nxtFollowupDateError, setNxtFollowupDateError] = useState(null);
  const [expectDateJoin, setExpectDateJoin] = useState(null);
  const [expectDateJoinError, setExpectDateJoinError] = useState("");

  const [branchOptions, setBranchOptions] = useState([]);
  const [branch, setBranch] = useState("");
  const [branchError, setBranchError] = useState("");
  const [batchTrackOptions, setBatchTrackOptions] = useState([]);
  const [batchTrack, setBatchTrack] = useState("");
  const [batchTrackError, setBatchTrackError] = useState("");
  const [rating, setRating] = useState(null);
  const [ratingError, setRatingError] = useState(null);
  const [comments, setComments] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [defaultColumns, setDefaultColumns] = useState([
    {
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      isChecked: true,
    },
    { title: "Email", key: "email", dataIndex: "email", isChecked: true },
    { title: "Mobile", key: "phone", dataIndex: "phone", isChecked: true },
    { title: "Country", key: "country", dataIndex: "country", isChecked: true },
    { title: "State", key: "state", dataIndex: "state", isChecked: true },
    { title: "City ", key: "district", dataIndex: "district", isChecked: true },
    {
      title: "Primary Course",
      key: "primary_course",
      dataIndex: "primary_course",
      isChecked: true,
    },
    {
      title: "Primary Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      isChecked: true,
    },
    {
      title: "Secondary Course ",
      key: "secondary_course",
      dataIndex: "secondary_course",
      isChecked: true,
    },
    {
      title: "Secondary Course Fees",
      key: "secondary_fees",
      dataIndex: "secondary_fees",
      isChecked: true,
    },
    {
      title: "Trainer Mode",
      key: "training_mode",
      dataIndex: "training_mode",
      isChecked: true,
    },
    {
      title: "Priority",
      key: "priority",
      dataIndex: "priority",
      isChecked: true,
    },
    {
      title: "Lead Type",
      key: "lead_type",
      dataIndex: "lead_type",
      isChecked: true,
    },
    {
      title: "Lead Status",
      key: "lead_status",
      dataIndex: "lead_status",
      isChecked: true,
    },
    {
      title: "Response Status",
      key: "response_status",
      dataIndex: "response_status",
      isChecked: true,
    },
    {
      title: "Next Followup Date",
      key: "next_follow_up_date",
      dataIndex: "next_follow_up_date",
      isChecked: true,
    },
    {
      title: "Expected Join Date",
      key: "expected_join_date",
      dataIndex: "expected_join_date",
      isChecked: true,
    },
    {
      title: "Branch",
      key: "branche_name",
      dataIndex: "branche_name",
      isChecked: true,
    },
    {
      title: "Batch Track",
      key: "batch_track",
      dataIndex: "batch_track",
      isChecked: true,
    },
    {
      title: "Rating",
      key: "lead_quality_rating",
      dataIndex: "lead_quality_rating",
      isChecked: true,
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      isChecked: true,
    },
  ]);

  const [columns, setColumns] = useState([
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    { title: "Country", key: "country", dataIndex: "country", width: 120 },
    { title: "State", key: "state", dataIndex: "state", width: 120 },
    { title: "City ", key: "district", dataIndex: "district", width: 120 },
    {
      title: "Primary Course",
      key: "primary_course",
      dataIndex: "primary_course",
    },
    {
      title: "Primary Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
    },
    {
      title: "Secondary Course ",
      key: "secondary_course",
      dataIndex: "secondary_course",
    },
    {
      title: "Secondary Course Fees",
      key: "secondary_fees",
      dataIndex: "secondary_fees",
    },
    {
      title: "Trainer Mode",
      key: "training_mode",
      dataIndex: "training_mode",
      width: 140,
    },
    {
      title: "Trainer Mode",
      key: "training_mode",
      dataIndex: "training_mode",
      width: 140,
    },
    { title: "Priority", key: "priority", dataIndex: "priority", width: 140 },
    {
      title: "Lead Type",
      key: "lead_type",
      dataIndex: "lead_type",
      width: 140,
    },
    {
      title: "Lead Status",
      key: "lead_status",
      dataIndex: "lead_status",
      width: 140,
    },
    {
      title: "Response Status",
      key: "response_status",
      dataIndex: "response_status",
    },
    {
      title: "Next Followup Date",
      key: "next_follow_up_date",
      dataIndex: "next_follow_up_date",
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Expected Join Date",
      key: "expected_join_date",
      dataIndex: "expected_join_date",
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    { title: "Branch", key: "branche_name", dataIndex: "branche_name" },
    {
      title: "Batch Track",
      key: "batch_track",
      dataIndex: "batch_track",
      width: 120,
    },
    {
      title: "Rating",
      key: "lead_quality_rating",
      dataIndex: "lead_quality_rating",
      width: 130,
      fixed: "right",
      render: (text, record) => {
        return (
          <Rate allowHalf value={text} style={{ fontSize: 14 }} disabled />
        );
      },
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 200,
    },
  ]);

  const nonChangeColumns = [
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    { title: "Country", key: "country", dataIndex: "country", width: 120 },
    { title: "State", key: "state", dataIndex: "state", width: 120 },
    { title: "City ", key: "district", dataIndex: "district", width: 120 },
    {
      title: "Primary Course ",
      key: "primary_course",
      dataIndex: "primary_course",
    },
    {
      title: "Primary Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
    },
    {
      title: "Secondary Course ",
      key: "secondary_course",
      dataIndex: "secondary_course",
    },
    {
      title: "Secondary Course Fees",
      key: "secondary_fees",
      dataIndex: "secondary_fees",
    },
    {
      title: "Trainer Mode",
      key: "training_mode",
      dataIndex: "training_mode",
      width: 140,
    },
    {
      title: "Trainer Mode",
      key: "training_mode",
      dataIndex: "training_mode",
      width: 140,
    },
    { title: "Priority", key: "priority", dataIndex: "priority", width: 140 },
    {
      title: "Lead Type",
      key: "lead_type",
      dataIndex: "lead_type",
      width: 140,
    },
    {
      title: "Lead Status",
      key: "lead_status",
      dataIndex: "lead_status",
      width: 140,
    },
    {
      title: "Response Status",
      key: "response_status",
      dataIndex: "response_status",
    },
    {
      title: "Next Followup Date",
      key: "next_follow_up_date",
      dataIndex: "next_follow_up_date",
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Expected Join Date",
      key: "expected_join_date",
      dataIndex: "expected_join_date",
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    { title: "Branch", key: "branche_name", dataIndex: "branche_name" },
    {
      title: "Batch Track",
      key: "batch_track",
      dataIndex: "batch_track",
      width: 120,
    },
    {
      title: "Rating",
      key: "lead_quality_rating",
      dataIndex: "lead_quality_rating",
      width: 130,
      render: (text, record) => {
        return (
          <Rate allowHalf value={text} style={{ fontSize: 14 }} disabled />
        );
      },
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
    },
  ];
  const [leadData, setLeadData] = useState([]);

  // const leadData = [
  //   {
  //     id: 1,
  //     name: "xyz",
  //     email: "balaji@gmail.com",
  //     mobile: "986788872",
  //     state: "State Not Available",
  //     city: "City Not Available",
  //   },
  // ];

  useEffect(() => {
    const countries = Country.getAllCountries();
    const updateCountries = countries.map((c) => {
      return { ...c, id: c.isoCode };
    });
    setCountryOptions(updateCountries);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    getAllLeadData(
      null,
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      true
    );
  }, []);

  const getAllLeadData = async (
    nameValue,
    startDate,
    endDate,
    triggerOtherApis
  ) => {
    setLoading(true);
    const payload = {
      name: nameValue,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await getLeads(payload);
      setLeadData(response?.data?.data || []);
    } catch (error) {
      setLeadData([]);
      console.log("get leads error");
    } finally {
      setTimeout(() => {
        if (triggerOtherApis === true) {
          getTrainingModeData();
        } else {
          setLoading(false);
        }
      }, 300);
    }
  };

  const getTrainingModeData = async () => {
    try {
      const response = await getTrainingMode();
      setTrainerModeOptions(response?.data?.result || []);
    } catch (error) {
      setTrainerModeOptions([]);
      console.log("trainer mode error", error);
    } finally {
      setTimeout(() => {
        getPriorityData();
      }, 300);
    }
  };

  const getPriorityData = async () => {
    try {
      const response = await getPriority();
      setPriorityOptions(response?.data?.result || []);
    } catch (error) {
      setPriorityOptions([]);
      console.log("priority error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        getLeadTypeData();
      }, 300);
    }
  };

  const getLeadTypeData = async () => {
    try {
      const response = await getLeadType();
      setLeadTypeOptions(response?.data?.result || []);
    } catch (error) {
      setLeadTypeOptions([]);
      console.log("lead type error", error);
    } finally {
      setTimeout(() => {
        getLeadStatusData();
      }, 300);
    }
  };

  const getLeadStatusData = async () => {
    try {
      const response = await getLeadStatus();
      setLeadStatusOptions(response?.data?.result || []);
    } catch (error) {
      setLeadStatusOptions([]);
      console.log("lead status error", error);
    } finally {
      setTimeout(() => {
        getLeadResponseStatusData();
      }, 300);
    }
  };

  const getLeadResponseStatusData = async () => {
    try {
      const response = await getLeadResponseStatus();
      setResponseStatusOptions(response?.data?.result || []);
    } catch (error) {
      setResponseStatusOptions([]);
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        getBranchesData();
      }, 300);
    }
  };

  const getBranchesData = async () => {
    try {
      const response = await getBranches();
      setBranchOptions(response?.data?.result || []);
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        getBatchTrackData();
      }, 300);
    }
  };

  const getBatchTrackData = async () => {
    try {
      const response = await getBatchTrack();
      setBatchTrackOptions(response?.data?.result || []);
    } catch (error) {
      setBatchTrackOptions([]);
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        getCourseData();
      }, 300);
    }
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

  //onchange functions
  const handleCountry = (e) => {
    const value = e.target.value;
    console.log(value, countryOptions);
    setCountryId(value);
    setStateId("");
    setCityId("");
    const selectedCountry = countryOptions.find((f) => f.id === value);
    console.log("selected country", value, selectedCountry);

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
    setCityId("");
    const selectedState = stateOptions.find((f) => f.id === value);
    console.log("selected state", value, selectedState);

    const cityList = City.getCitiesOfState(countryId, selectedState.id);

    const updateCities = cityList.map((city) => {
      return { ...city, id: city.name };
    });
    console.log(updateCities, "updateCities");
    setCityOptions(updateCities);

    if (validationTrigger) {
      setStateError(selectValidator(value));
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    getAllLeadData(e.target.value, selectedDates[0], selectedDates[1], false);
  };

  const handleDateChange = (dates, dateStrings) => {
    setSelectedDates(dateStrings);
    const startDate = dateStrings[0];
    const endDate = dateStrings[1];
    if (startDate != "" && endDate != "") {
      console.log("call function");
      getAllLeadData(searchValue, startDate, endDate, false);
    }
  };

  //onclick functions
  const formReset = () => {
    setIsOpenAddDrawer(false);
    setIsOpenFilterDrawer(false);
    setValidationTrigger(false);
    setName("");
    setNameError("");
    setEmail("");
    setEmailError("");
    setMobile("");
    setMobileError("");
    setWhatsApp("");
    setWhatsAppError("");
    setCountryId(null);
    setCountryError("");
    setStateId(null);
    setStateError("");
    setCityId(null);
    setCityError("");
    setPrimaryCourse(null);
    setPrimaryCourseError("");
    setPrimaryFees("");
    setPrimaryFeesError("");
    setSecondaryCourse(null);
    setSecondaryFees("");
    setTrainerMode(null);
    setTrainerModeError("");
    setPriority(null);
    setPriorityError("");
    setLeadType(null);
    setLeadTypeError("");
    setLeadStatus(null);
    setLeadStatusError("");
    setResponseLeadStatus(null);
    setResponseLeadStatusError("");
    setNxtFollowupDate(null);
    setNxtFollowupDateError("");
    setExpectDateJoin(null);
    setExpectDateJoinError("");
    setBranch(null);
    setBranchError("");
    setBatchTrack(null);
    setBatchTrackError("");
    setRating(null);
    setRatingError("");
    setComments("");
    setCommentsError("");
    setButtonLoading(false);
  };

  const handleSubmit = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    console.log("convertAsJson", convertAsJson);

    setValidationTrigger(true);
    const nameValidate = nameValidator(name);
    const emailValidate = emailValidator(email);
    const mobileValidate = mobileValidator(mobile);
    const whatsAppValidate = mobileValidator(whatsApp);
    const countryValidate = selectValidator(countryId);
    const stateValidate = selectValidator(stateId);
    const cityValidate = selectValidator(cityId);
    const primaryCourseValidate = selectValidator(primaryCourse);
    const primaryFeesValidate = selectValidator(primaryFees);
    const trainerModeValidate = selectValidator(trainerMode);
    const priorityValidate = selectValidator(priority);
    const leadTypeValidate = selectValidator(leadType);
    const leadStatusValidate = selectValidator(leadStatus);
    const responseStatusValidate = selectValidator(responseStatus);
    const nxtFollowupDateValidate = selectValidator(nxtFollowupDate);
    const expectDateJoinValidate = selectValidator(expectDateJoin);
    const branchValidate = selectValidator(branch);
    const batchTrackValidate = selectValidator(batchTrack);
    const ratingValidate = selectValidator(rating);
    const commentsValidate = addressValidator(comments);

    setNameError(nameValidate);
    setEmailError(emailValidate);
    setMobileError(mobileValidate);
    setWhatsAppError(whatsAppValidate);
    setCountryError(countryValidate);
    setStateError(stateValidate);
    setCityError(cityValidate);
    setPrimaryCourseError(primaryCourseValidate);
    setPrimaryFeesError(primaryFeesValidate);
    setTrainerModeError(trainerModeValidate);
    setPriorityError(priorityValidate);
    setLeadTypeError(leadTypeValidate);
    setLeadStatusError(leadStatusValidate);
    setResponseLeadStatusError(responseStatusValidate);
    setNxtFollowupDateError(nxtFollowupDateValidate);
    setExpectDateJoinError(expectDateJoinValidate);
    setBranchError(branchValidate);
    setBatchTrackError(batchTrackValidate);
    setRatingError(ratingValidate);
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
      trainerModeValidate ||
      priorityValidate ||
      leadTypeValidate ||
      leadStatusValidate ||
      responseStatusValidate ||
      nxtFollowupDateValidate ||
      expectDateJoinValidate ||
      branchValidate ||
      batchTrackValidate ||
      ratingValidate ||
      commentsValidate
    )
      return;

    setButtonLoading(true);
    const today = new Date();
    const formatToday = formatToBackendIST(today);

    const payload = {
      user_id: convertAsJson?.user_id,
      name: name,
      phone_code: "+91",
      phone: mobile,
      whatsapp: whatsApp,
      email: email,
      country: countryId,
      state: stateId,
      district: cityId,
      primary_course_id: primaryCourse,
      primary_fees: primaryFees,
      price_category: priceCategory(primaryFees),
      secondary_course_id: secondaryCourse,
      secondary_fees: secondaryFees,
      training_mode_id: trainerMode,
      priority_id: priority,
      lead_type_id: leadType,
      lead_status_id: leadStatus,
      response_status_id: responseStatus,
      next_follow_up_date: formatToBackendIST(nxtFollowupDate),
      expected_join_date: formatToBackendIST(expectDateJoin),
      lead_quality_rating: rating,
      branch_id: branch,
      batch_track_id: batchTrack,
      comments: comments,
      created_date: formatToBackendIST(today),
    };

    try {
      await createLead(payload);
      CommonMessage("success", "Lead created");
      setTimeout(() => {
        formReset();
        getAllLeadData(searchValue, selectedDates[0], selectedDates[1]);
        refreshLeadFollowUp();
      }, 300);
    } catch (error) {
      console.log("lead create error", error);
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="leadmanager_filterContainer">
            <CommonOutlinedInput
              label="Search by Name"
              width="36%"
              height="34px"
              labelFontSize="12px"
              icon={
                searchValue ? (
                  <div
                    className="users_filter_closeIconContainer"
                    onClick={() => {
                      setSearchValue("");
                      getAllLeadData(null, selectedDates[0], selectedDates[1]);
                    }}
                  >
                    <IoIosClose size={11} />
                  </div>
                ) : (
                  <CiSearch size={16} />
                )
              }
              labelMarginTop="-1px"
              value={searchValue}
              onChange={handleSearch}
            />
            <CommonDoubleDatePicker
              value={selectedDates}
              onChange={handleDateChange}
            />
          </div>
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
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddDrawer(true);
            }}
          >
            Add Lead
          </button>
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ marginLeft: "12px", cursor: "pointer" }}
            onClick={() => setIsOpenFilterDrawer(true)}
          />
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 3600 }}
          columns={columns}
          dataSource={leadData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>
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
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                if (validationTrigger) {
                  setMobileError(mobileValidator(e.target.value));
                }
              }}
              error={mobileError}
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
              value={whatsApp}
              onChange={(e) => {
                setWhatsApp(e.target.value);
                if (validationTrigger) {
                  setWhatsAppError(mobileValidator(e.target.value));
                }
              }}
              error={whatsAppError}
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
        </Row>

        <Row gutter={16} style={{ marginTop: "26px", marginBottom: "30px" }}>
          <Col span={8}>
            <CommonSelectField
              label="City"
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                if (validationTrigger) {
                  setCityError(selectValidator(e.target.value));
                }
              }}
              options={cityOptions}
              error={cityError}
              required={true}
            />
          </Col>
        </Row>

        <p className="addleaddrawer_headings">Course Details</p>
        <Row gutter={16}>
          <Col span={8}>
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
            />
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
            <CommonSelectField
              label="Secondary Course"
              value={secondaryCourse}
              onChange={(e) => {
                setSecondaryCourse(e.target.value);
              }}
              options={courseOptions}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonInputField
              label="Fees"
              required={true}
              value={secondaryFees}
              onChange={(e) => {
                setSecondaryFees(e.target.value);
              }}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Training Mode"
              required={true}
              options={trainerModeOptions}
              onChange={(e) => {
                setTrainerMode(e.target.value);
                if (validationTrigger) {
                  setTrainerModeError(selectValidator(e.target.value));
                }
              }}
              value={trainerMode}
              error={trainerModeError}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Priority"
              required={true}
              options={priorityOptions}
              onChange={(e) => {
                setPriority(e.target.value);
                if (validationTrigger) {
                  setPriorityError(selectValidator(e.target.value));
                }
              }}
              value={priority}
              error={priorityError}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
          <Col span={8}>
            <CommonSelectField
              label="Lead Type"
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
        </Row>
        <p className="addleaddrawer_headings">Sales Information</p>

        <Row gutter={16}>
          <Col span={8}>
            <CommonSelectField
              label="Lead Status"
              required={true}
              options={leadStatusOptions}
              onChange={(e) => {
                setLeadStatus(e.target.value);
                if (validationTrigger) {
                  setLeadStatusError(selectValidator(e.target.value));
                }
              }}
              value={leadStatus}
              error={leadStatusError}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Response Status"
              options={responseStatusOptions}
              onChange={(e) => {
                setResponseLeadStatus(e.target.value);
                if (validationTrigger) {
                  setResponseLeadStatusError(selectValidator(e.target.value));
                }
              }}
              value={responseStatus}
              error={responseStatusError}
            />
          </Col>
          <Col span={8}>
            <CommonDatePicker
              placeholder="Next Follow-Up Date"
              onChange={(value) => {
                setNxtFollowupDate(value);
                if (validationTrigger) {
                  setNxtFollowupDateError(selectValidator(value));
                }
              }}
              value={nxtFollowupDate}
              allowClear={true}
              error={nxtFollowupDateError}
              labelFontSize="14px"
              disablePreviousDates={true}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
          <Col span={8}>
            <CommonDatePicker
              placeholder="Expected Date Join"
              onChange={(value) => {
                setExpectDateJoin(value);
                if (validationTrigger) {
                  setExpectDateJoinError(selectValidator(value));
                }
              }}
              value={expectDateJoin}
              error={expectDateJoinError}
              allowClear={true}
              disablePreviousDates={true}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Branch Name"
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

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
          <Col span={8}>
            <p className="leadmanager_ratinglabel">Lead Quality Rating</p>
            <Rate
              allowHalf
              value={rating}
              onChange={(value) => {
                setRating(value);
                if (validationTrigger) {
                  setRatingError(selectValidator(value));
                }
              }}
            />
            {ratingError && (
              <p className="leadmanager_ratingerror">
                {"Rating" + ratingError}
              </p>
            )}
          </Col>
          <Col span={16}>
            <CommonTextArea
              label="Comments"
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                if (validationTrigger) {
                  setCommentsError(addressValidator(e.target.value));
                }
              }}
              error={commentsError}
            />
          </Col>
        </Row>

        <div className="leadmanager_submitlead_buttoncontainer">
          {buttonLoading ? (
            <button className="users_adddrawer_loadingcreatebutton">
              <CommonSpinner />
            </button>
          ) : (
            <button
              className="leadmanager_submitleadbutton"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </Drawer>

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

                setColumns(reorderedColumns);
                setIsOpenFilterDrawer(false);
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
