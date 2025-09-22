import React, { useState, useEffect, useMemo } from "react";
import {
  Col,
  Row,
  Drawer,
  Tooltip,
  Divider,
  Upload,
  Button,
  Checkbox,
  Modal,
} from "antd";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import {
  addressValidator,
  calculateAmount,
  debounce,
  emailValidator,
  formatToBackendIST,
  getBalanceAmount,
  getConvenienceFees,
  getCurrentandPreviousweekDate,
  mobileValidator,
  nameValidator,
  priceCategory,
  priceValidator,
  selectValidator,
} from "../Common/Validation";
import CommonSelectField from "../Common/CommonSelectField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { SiWhatsapp } from "react-icons/si";
import CommonTextArea from "../Common/CommonTextArea";
import CommonTable from "../Common/CommonTable";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";
import CommonDnd from "../Common/CommonDnd";
import { Country, State, City } from "country-state-city";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";
import {
  createArea,
  createLead,
  createTechnology,
  getAllAreas,
  getBranches,
  getLeads,
  getTechnologies,
  leadPayment,
  sendCustomerFormEmail,
  sendCustomerPaymentVerificationEmail,
  sendCustomerWelcomeEmail,
  updateLead,
} from "../ApiService/action";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { FaRegAddressCard } from "react-icons/fa";
import { UploadOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";

export default function Leads({
  refreshLeadFollowUp,
  setLeadCount,
  leadTypeOptions,
  leadStatusOptions,
  regionOptions,
  batchTrackOptions,
  courseOptions,
  setCourseOptions,
  areaOptions,
  setAreaOptions,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);

  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [leadId, setLeadId] = useState(null);
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
  const [areaId, setAreaId] = useState("");
  const [areaError, setAreaError] = useState("");
  const [isAreaFocused, setIsAreaFocused] = useState(false);
  const [isOpenAddAreaModal, setIsOpenAddAreaModal] = useState(false);
  const [primaryCourse, setPrimaryCourse] = useState(null);
  const [primaryCourseError, setPrimaryCourseError] = useState("");
  const [primaryFees, setPrimaryFees] = useState("");
  const [primaryFeesError, setPrimaryFeesError] = useState("");
  const [isPrimaryCourseFocused, setIsPrimaryCourseFocused] = useState(false);
  const [isShowSecondaryCourse, setIsShowSecondaryCourse] = useState(false);
  const [secondaryCourse, setSecondaryCourse] = useState(null);
  const [secondaryFees, setSecondaryFees] = useState("");
  const [leadType, setLeadType] = useState(null);
  const [leadTypeError, setLeadTypeError] = useState("");
  const [leadStatus, setLeadStatus] = useState(null);
  const [leadStatusError, setLeadStatusError] = useState("");
  const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
  const [nxtFollowupDateError, setNxtFollowupDateError] = useState(null);
  const [expectDateJoin, setExpectDateJoin] = useState(null);
  const [expectDateJoinError, setExpectDateJoinError] = useState("");

  const [regionId, setRegionId] = useState(null);
  const [regionError, setRegionError] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [branch, setBranch] = useState("");
  const [branchError, setBranchError] = useState("");
  const [batchTrack, setBatchTrack] = useState(1);
  const [batchTrackError, setBatchTrackError] = useState("");
  const [rating, setRating] = useState(null);
  const [ratingError, setRatingError] = useState(null);
  const [comments, setComments] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [isOpenPaymentDrawer, setIsOpenPaymentDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invoiceButtonLoading, setInvoiceButtonLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [saveOnlyLoading, setSaveOnlyLoading] = useState(false);

  //payment usestates
  const [clickedLeadItem, setClickedLeadItem] = useState(null);
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentDateError, setPaymentDateError] = useState("");
  const [paymentMode, setPaymentMode] = useState(null);
  const [paymentModeError, setPaymentModeError] = useState(null);
  const [subTotal, setSubTotal] = useState("");
  const [convenienceFees, setConvenienceFees] = useState("");
  const [taxType, setTaxType] = useState("");
  const [taxTypeError, setTaxTypeError] = useState("");
  const [amount, setAmount] = useState(0);
  const [paidNow, setPaidNow] = useState("");
  const [paidNowError, setPaidNowError] = useState("");
  const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
  const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
  const [paymentValidationTrigger, setPaymentValidationTrigger] =
    useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [isShowDueDate, setIsShowDueDate] = useState(true);
  const [dueDate, setDueDate] = useState(null);
  const [dueDateError, setDueDateError] = useState("");
  const [customerCourseId, setCustomerCourseId] = useState(null);
  const [customerBatchTrackId, setCustomerBatchTrackId] = useState(null);
  const batchTimingOptions = [
    {
      id: 1,
      name: "Week Day",
    },
    {
      id: 2,
      name: "Week End",
    },
    {
      id: 3,
      name: "Fast Track",
    },
  ];
  const [customerBatchTimingId, setCustomerBatchTimingId] = useState(null);
  const [customerBatchTimingIdError, setCustomerBatchTimingIdError] =
    useState("");
  const [placementSupport, setPlacementSupport] = useState(null);
  const [placementSupportError, setPlacementSupportError] = useState("");
  const [serverRequired, setServerRequired] = useState(false);
  //add course usestates
  const [isOpenAddCourseModal, setIsOpenAddCourseModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseNameError, setCourseNameError] = useState("");
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  //add area usestates
  const [areaName, setAreaName] = useState("");
  const [areaNameError, setAreaNameError] = useState("");

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
      title: "Lead Source",
      key: "lead_type",
      dataIndex: "lead_type",
      isChecked: true,
    },
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
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
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
      title: "Lead Status",
      key: "lead_status",
      dataIndex: "lead_status",
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
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      isChecked: true,
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      isChecked: true,
    },
  ]);

  const [columns, setColumns] = useState([
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 240 },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    { title: "Country", key: "country", dataIndex: "country", width: 120 },
    { title: "State", key: "state", dataIndex: "state", width: 120 },
    { title: "City ", key: "district", dataIndex: "district", width: 120 },
    {
      title: "Lead Source",
      key: "lead_type",
      dataIndex: "lead_type",
      width: 140,
    },
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
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 140,
    },
    {
      title: "Branch",
      key: "branche_name",
      dataIndex: "branche_name",
      width: 190,
    },
    {
      title: "Batch Track",
      key: "batch_track",
      dataIndex: "batch_track",
      width: 120,
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
    {
      title: "Lead Status",
      key: "lead_status",
      dataIndex: "lead_status",
      fixed: "right",
      width: 140,
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 180,
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
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
            />

            {record.is_customer_reg === 1 ? (
              <Tooltip
                placement="bottom"
                title="Already a Customer"
                className="leadtable_customertooltip"
              >
                <FaRegAddressCard
                  size={19}
                  color="#2ed573"
                  className="trainers_action_icons"
                />
              </Tooltip>
            ) : (
              <Tooltip
                placement="bottom"
                title="Make as customer"
                className="leadtable_customertooltip"
              >
                <FaRegAddressCard
                  size={19}
                  color="#d32f2f"
                  className="trainers_action_icons"
                  onClick={() => {
                    setIsOpenPaymentDrawer(true);
                    setSubTotal(parseInt(record.primary_fees));
                    setAmount(parseInt(record.primary_fees));
                    setBalanceAmount(parseInt(record.primary_fees));
                    setCustomerCourseId(record.primary_course_id);
                    setCustomerBatchTrackId(record.batch_track_id);
                    setClickedLeadItem(record);
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ]);

  const nonChangeColumns = [
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 240 },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    { title: "Country", key: "country", dataIndex: "country", width: 120 },
    { title: "State", key: "state", dataIndex: "state", width: 120 },
    { title: "City ", key: "district", dataIndex: "district", width: 120 },
    {
      title: "Lead Source",
      key: "lead_type",
      dataIndex: "lead_type",
      width: 140,
    },
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
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 140,
    },
    {
      title: "Branch",
      key: "branche_name",
      dataIndex: "branche_name",
      width: 190,
    },
    {
      title: "Batch Track",
      key: "batch_track",
      dataIndex: "batch_track",
      width: 120,
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
    {
      title: "Lead Status",
      key: "lead_status",
      dataIndex: "lead_status",
      fixed: "right",
      width: 140,
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 180,
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
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
            />

            {record.is_customer_reg === 1 ? (
              <Tooltip
                placement="bottom"
                title="Already a Customer"
                className="leadtable_customertooltip"
              >
                <FaRegAddressCard
                  size={19}
                  color="#2ed573"
                  className="trainers_action_icons"
                />
              </Tooltip>
            ) : (
              <Tooltip
                placement="bottom"
                title="Make as customer"
                className="leadtable_customertooltip"
              >
                <FaRegAddressCard
                  size={19}
                  color="#d32f2f"
                  className="trainers_action_icons"
                  onClick={() => {
                    setIsOpenPaymentDrawer(true);
                    setSubTotal(parseInt(record.primary_fees));
                    setAmount(parseInt(record.primary_fees));
                    setBalanceAmount(parseInt(record.primary_fees));
                    setClickedLeadItem(record);
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];
  const [leadData, setLeadData] = useState([]);

  useEffect(() => {
    const countries = Country.getAllCountries();
    const updateCountries = countries.map((c) => {
      return { ...c, id: c.isoCode };
    });
    setCountryOptions(updateCountries);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    getAllLeadData(null, PreviousAndCurrentDate[0], PreviousAndCurrentDate[1]);
  }, []);

  const getAllLeadData = async (nameValue, startDate, endDate) => {
    setLoading(true);
    const payload = {
      name: nameValue,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await getLeads(payload);
      setLeadData(response?.data?.data || []);
      console.log("eeeeeeeee", response?.data?.data.length);
      setLeadCount(response?.data?.data.length || 0);
    } catch (error) {
      setLeadData([]);
      setLeadCount(0);
      console.log("get leads error");
    } finally {
      setTimeout(() => {
        setLoading(false);
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
    setAreaId("");
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
      setBranchOptions(response?.data?.result || []);
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((val) => {
        getAllLeadData(val, selectedDates[0], selectedDates[1], false);
      }, 300),
    [selectedDates]
  );

  const handleDateChange = (dates, dateStrings) => {
    setSelectedDates(dateStrings);
    const startDate = dateStrings[0];
    const endDate = dateStrings[1];
    if (startDate != "" && endDate != "") {
      console.log("call function");
      getAllLeadData(searchValue, startDate, endDate, false);
    }
  };

  const handlePaidNow = (e) => {
    const value = parseInt(e.target.value);
    const amt = parseInt(amount);
    if (value < amt || isNaN(value) || value === "" || value === null) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }
    setPaidNow(isNaN(value) ? "" : value);
    setBalanceAmount(
      getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(value) ? 0 : value)
    );

    if (paymentMode === 2 || paymentMode === 5) {
      const conve_fees = getConvenienceFees(value);
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }

    if (paymentValidationTrigger) {
      setPaidNowError(priceValidator(value, parseInt(amt)));
    }
  };

  const handleTaxType = (e) => {
    setTaxType(e.target.value);
    if (paymentValidationTrigger) {
      setTaxTypeError(selectValidator(e.target.value));
    }
    const amnt = calculateAmount(
      parseInt(subTotal),
      e.target.value === 5 ? 0 : 18
    );
    if (isNaN(amnt)) {
      setAmount("");
    } else {
      setAmount(String(amnt));
    }

    //handle balance amount
    if (
      paidNow < amnt ||
      isNaN(paidNow) ||
      paidNow === "" ||
      paidNow === null
    ) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }
    setBalanceAmount(
      getBalanceAmount(isNaN(amnt) ? 0 : amnt, isNaN(paidNow) ? 0 : paidNow)
    );
  };

  const handlePaymentType = (e) => {
    const value = e.target.value;
    setPaymentMode(value);
    const amnt = calculateAmount(parseInt(subTotal), taxType === 5 ? 0 : 18);
    setAmount(amnt);

    if (paymentValidationTrigger) {
      setPaymentModeError(selectValidator(value));
    }

    //handle balance amount
    if (
      paidNow < amnt ||
      isNaN(paidNow) ||
      paidNow === "" ||
      paidNow === null
    ) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }
    setBalanceAmount(
      getBalanceAmount(isNaN(amnt) ? 0 : amnt, isNaN(paidNow) ? 0 : paidNow)
    );

    //handle convenience fees
    if (value === 2 || value === 5) {
      const conve_fees = getConvenienceFees(paidNow ? paidNow : 0);
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }
  };

  //onclick functions
  const handleEdit = (item) => {
    console.log("clicked itemmm", item);
    setIsOpenAddDrawer(true);
    setLeadId(item.id);
    setName(item.name);
    setEmail(item.email);
    setMobile(item.phone);
    setWhatsApp(item.whatsapp);
    setCountryId(item.country);
    const stateList = State.getStatesOfCountry(item.country);
    const updateSates = stateList.map((s) => {
      return { ...s, id: s.isoCode };
    });
    console.log(updateSates, "updateSates");
    setStateOptions(updateSates);
    setStateId(item.state);
    setAreaId(item.district);

    setPrimaryCourse(item.primary_course_id);
    setPrimaryFees(item.primary_fees);
    setSecondaryCourse(item.secondary_course_id);
    setSecondaryFees(item.secondary_fees);
    setLeadType(item.lead_type_id);
    setLeadStatus(item.lead_status_id);
    setNxtFollowupDate(item.next_follow_up_date);
    setExpectDateJoin(item.expected_join_date);
    setRegionId(item.region_id);
    getBranchesData(item.region_id);
    setBranch(item.branch_id);
    setBatchTrack(item.batch_track_id);
    setRating(item.lead_quality_rating);
    setComments(item.comments);
  };

  const formReset = (dontCloseAddDrawer) => {
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
    setNxtFollowupDate(null);
    setNxtFollowupDateError("");
    setExpectDateJoin(null);
    setExpectDateJoinError("");
    setRegionId(null);
    setRegionError("");
    setBranch("");
    setBranchError("");
    setBatchTrack(1);
    setBatchTrackError("");
    setRating(null);
    setRatingError("");
    setComments("");
    setCommentsError("");
    setButtonLoading(false);
    setSaveOnlyLoading(false);

    //payment drawer usestates
    setIsOpenPaymentDrawer(false);
    setPaymentValidationTrigger(false);
    setClickedLeadItem(null);
    setPaymentMode(null);
    setPaymentModeError("");
    setSubTotal("");
    setConvenienceFees("");
    setTaxType(null);
    setTaxTypeError("");
    setAmount("");
    setPaidNow("");
    setPaidNowError("");
    setPaymentDate(null);
    setPaymentDateError("");
    setPaymentScreenShotBase64("");
    setPaymentScreenShotError("");
    setIsShowDueDate(true);
    setBalanceAmount("");
    setDueDate(null);
    setDueDateError("");
    setCustomerCourseId(null);
    setCustomerBatchTrackId(null);
    setCustomerBatchTimingId(null);
    setCustomerBatchTimingIdError("");
    setPlacementSupport("");
    setPlacementSupportError("");
    setServerRequired(false);
  };

  const handleSubmit = async (saveType) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    console.log("convertAsJson", convertAsJson);
    setValidationTrigger(true);

    let nxtFollowupDateValidate;
    let expectDateJoinValidate;

    if (leadStatus === 4) {
      nxtFollowupDateValidate = "";
      expectDateJoinValidate = "";
    } else {
      nxtFollowupDateValidate = selectValidator(nxtFollowupDate);
      expectDateJoinValidate = selectValidator(expectDateJoin);
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
    setNxtFollowupDateError(nxtFollowupDateValidate);
    setExpectDateJoinError(expectDateJoinValidate);
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
      expectDateJoinValidate ||
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

    const payload = {
      ...(leadId && { lead_id: leadId }),
      user_id: convertAsJson?.user_id,
      name: name,
      phone_code: "+91",
      phone: mobile,
      whatsapp: whatsApp,
      email: email,
      country: countryId,
      state: stateId,
      district: areaId,
      primary_course_id: primaryCourse,
      primary_fees: primaryFees,
      price_category: priceCategory(primaryFees),
      secondary_course_id: secondaryCourse,
      secondary_fees: secondaryFees ? secondaryFees : 0,
      lead_type_id: leadType,
      lead_status_id: leadStatus,
      next_follow_up_date: nxtFollowupDate
        ? formatToBackendIST(nxtFollowupDate)
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

    if (leadId) {
      try {
        await updateLead(payload);
        CommonMessage("success", "Lead updated");
        setTimeout(() => {
          formReset();
          getAllLeadData(searchValue, selectedDates[0], selectedDates[1]);
          refreshLeadFollowUp();
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
    } else {
      try {
        await createLead(payload);
        CommonMessage("success", "Lead created");
        setTimeout(() => {
          if (saveType === "Save Only") {
            formReset();
          } else {
            formReset(true);
          }
          getAllLeadData(searchValue, selectedDates[0], selectedDates[1]);
          refreshLeadFollowUp();
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
    }
  };

  const handlePaymentSubmit = async () => {
    setPaymentValidationTrigger(true);
    const taxTypeValidate = selectValidator(taxType);
    const paymentTypeValidate = selectValidator(paymentMode);
    const paymentDateValidate = selectValidator(paymentDate);
    const batchTimingValidate = selectValidator(customerBatchTimingId);
    const placementSupportValidate = selectValidator(placementSupport);

    console.log("eeeee", paidNow, amount);
    const paidNowValidate = priceValidator(parseInt(paidNow), parseInt(amount));

    const screenshotValidate = selectValidator(paymentScreenShotBase64);
    let dueDateValidate;

    if (isShowDueDate) {
      dueDateValidate = selectValidator(dueDate);
    } else {
      dueDateValidate = "";
    }

    setTaxTypeError(taxTypeValidate);
    setPaymentModeError(paymentTypeValidate);
    setPaidNowError(paidNowValidate);
    setPaymentDateError(paymentDateValidate);
    setPaymentScreenShotError(screenshotValidate);
    setDueDateError(dueDateValidate);
    setCustomerBatchTimingIdError(batchTimingValidate);
    setPlacementSupportError(placementSupportValidate);

    if (
      paymentTypeValidate ||
      paidNowValidate ||
      taxTypeValidate ||
      paymentDateValidate ||
      screenshotValidate ||
      dueDateValidate ||
      batchTimingValidate ||
      placementSupportValidate
    )
      return;

    setButtonLoading(true);

    const today = new Date();

    // Step 2: Calculate GST on discounted amount
    const gstAmount = amount - subTotal;

    console.log("GST Amount:", gstAmount);

    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      lead_id: clickedLeadItem.id,
      invoice_date: formatToBackendIST(paymentDate),
      tax_type:
        taxType === 1
          ? "GST (18%)"
          : taxType === 2
          ? "SGST (18%)"
          : taxType === 3
          ? "IGST (18%)"
          : taxType === 4
          ? "VAT (18%)"
          : "No Tax",
      gst_percentage: taxType === 5 ? "0%" : "18%",
      gst_amount: gstAmount,
      total_amount: amount,
      convenience_fees: convenienceFees,
      paymode_id: paymentMode,
      paid_amount: paidNow,
      payment_screenshot: paymentScreenShotBase64,
      payment_status: "Verify Pending",
      next_due_date: dueDate ? formatToBackendIST(dueDate) : null,
      created_date: formatToBackendIST(today),
      paid_date: formatToBackendIST(paymentDate),
      enrolled_course: customerCourseId,
      batch_track_id: customerBatchTrackId,
      batch_timing_id: customerBatchTimingId,
      placement_support: placementSupport,
      is_server_required: serverRequired,
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
    };

    console.log("payment payload", payload);

    try {
      const response = await leadPayment(payload);
      console.log("lead payment response", response);
      const createdCustomerDetails = response?.data?.data;
      CommonMessage("success", "Created as a Customer");
      setTimeout(() => {
        setButtonLoading(false);
        setInvoiceButtonLoading(false);
        formReset();
        getAllLeadData(searchValue, selectedDates[0], selectedDates[1], false);
        handleSendCustomerFormLink(createdCustomerDetails);
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      setInvoiceButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleSendCustomerFormLink = async (customerDetails) => {
    const payload = {
      email: customerDetails.email,
      link: `${import.meta.env.VITE_EMAIL_URL}/customer-registration/${
        customerDetails.insertId
      }`,
      customer_id: customerDetails.insertId,
    };

    try {
      await sendCustomerFormEmail(payload);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    } finally {
      setTimeout(() => {
        handleSendWelcomeEmail(customerDetails);
      }, 300);
    }
  };

  const handleSendWelcomeEmail = async (customerDetails) => {
    const payload = {
      email: customerDetails.email,
      name: customerDetails.name,
    };

    try {
      await sendCustomerWelcomeEmail(payload);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    } finally {
      setTimeout(() => {
        handleSendPaymentVerificationEmail(customerDetails);
      }, 300);
    }
  };

  const handleSendPaymentVerificationEmail = async (customerDetails) => {
    const payload = {
      email: customerDetails.email,
      name: customerDetails.name,
    };

    try {
      await sendCustomerPaymentVerificationEmail(payload);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
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
      setAddCourseLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCreateArea = async () => {
    const areaValidate = addressValidator(courseName);

    setAreaNameError(areaValidate);

    if (areaValidate) return;

    const payload = {
      area_name: courseName,
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
              onChange={(e) => {
                setSearchValue(e.target.value);
                debouncedSearch(e.target.value);
              }}
            />
            <CommonMuiCustomDatePicker
              value={selectedDates}
              onDateChange={(dates) => {
                setSelectedDates(dates);
                getAllLeadData(searchValue, dates[0], dates[1], false);
              }}
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
          scroll={{ x: 3200 }}
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
                if (e.target.value.length > 10) {
                  e.target.value = e.target.value.slice(0, 10);
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
                if (e.target.value.length > 10) {
                  e.target.value = e.target.value.slice(0, 10);
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
                if (value === 4) {
                  setNxtFollowupDate(null);
                  setNxtFollowupDateError("");
                  setExpectDateJoin(null);
                  setExpectDateJoinError("");
                }
                if (validationTrigger) {
                  setLeadStatusError(selectValidator(value));
                }
              }}
              value={leadStatus}
              error={leadStatusError}
            />
          </Col>

          {leadStatus === 4 ? (
            ""
          ) : (
            <>
              <Col span={8}>
                <CommonMuiDatePicker
                  label="Next Follow-Up Date"
                  required={true}
                  onChange={(value) => {
                    console.log("vallll", value);
                    setNxtFollowupDate(value);
                    if (validationTrigger) {
                      setNxtFollowupDateError(selectValidator(value));
                    }
                  }}
                  value={nxtFollowupDate}
                  disablePreviousDates={true}
                  error={nxtFollowupDateError}
                  disabled={leadId ? true : false}
                />
              </Col>
              <Col span={8}>
                <CommonMuiDatePicker
                  label="Expected Date Join"
                  required={true}
                  onChange={(value) => {
                    console.log("vallll", value);
                    setExpectDateJoin(value);
                    if (validationTrigger) {
                      setExpectDateJoinError(selectValidator(value));
                    }
                  }}
                  value={expectDateJoin}
                  disablePreviousDates={true}
                  error={expectDateJoinError}
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

        {/* <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
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
           
          </Col>
        </Row> */}

        <div className="leadmanager_submitlead_buttoncontainer">
          <div style={{ display: "flex", gap: "12px" }}>
            {leadId ? (
              ""
            ) : (
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
            )}

            {buttonLoading ? (
              <button
                className={
                  leadId
                    ? "leadmanager_loadingupdateleadbutton"
                    : "leadmanager_loadingsaveleadbutton"
                }
              >
                <CommonSpinner />
              </button>
            ) : (
              <button
                className={
                  leadId
                    ? "leadmanager_updateleadbutton"
                    : "leadmanager_saveleadbutton"
                }
                onClick={() => {
                  handleSubmit("Save And Add New");
                }}
              >
                {leadId ? "Update" : "Save And Add New"}
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* table filter drawer */}

      <Drawer
        title="Manage Table"
        open={isOpenFilterDrawer}
        onClose={formReset}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative", paddingBottom: 50 }}
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

      <Drawer
        title="Make as Customer"
        open={isOpenPaymentDrawer}
        onClose={formReset}
        width="50%"
        style={{ position: "relative", padding: "0px", paddingBottom: 50 }}
        className="leadmanager_paymentdetails_drawer"
      >
        <p className="leadfollowup_leaddetails_heading">Lead Details</p>
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
                  {clickedLeadItem && clickedLeadItem.name
                    ? clickedLeadItem.name
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
                  {clickedLeadItem && clickedLeadItem.email
                    ? clickedLeadItem.email
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
                  {clickedLeadItem && clickedLeadItem.phone
                    ? clickedLeadItem.phone
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
                  {clickedLeadItem && clickedLeadItem.whatsapp
                    ? clickedLeadItem.whatsapp
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
                  {clickedLeadItem && clickedLeadItem.district
                    ? clickedLeadItem.district
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaRegUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Lead Owner</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.user_name
                    ? clickedLeadItem.user_name
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
                  {clickedLeadItem && clickedLeadItem.next_follow_up_date
                    ? moment(clickedLeadItem.next_follow_up_date).format(
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
                  {clickedLeadItem && clickedLeadItem.primary_course
                    ? clickedLeadItem.primary_course
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
                  {clickedLeadItem && clickedLeadItem.primary_fees
                    ? "₹" + clickedLeadItem.primary_fees
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
                  {clickedLeadItem && clickedLeadItem.region_name
                    ? clickedLeadItem.region_name
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
                  {clickedLeadItem && clickedLeadItem.branch_name
                    ? clickedLeadItem.branch_name
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
                  {clickedLeadItem && clickedLeadItem.batch_track
                    ? clickedLeadItem.batch_track
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
                  {clickedLeadItem && clickedLeadItem.lead_type
                    ? clickedLeadItem.lead_type
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
                  {clickedLeadItem && clickedLeadItem.lead_status
                    ? clickedLeadItem.lead_status
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider className="leadmanger_paymentdrawer_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Payment Details
        </p>
        <Row
          gutter={16}
          className="leadmanager_paymentdetails_drawer_rowdiv"
          style={{ marginTop: "20px", marginBottom: "30px" }}
        >
          <Col span={8}>
            <CommonInputField
              label="Fees"
              required={true}
              type="number"
              value={subTotal}
              disabled={true}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Tax Type"
              required={true}
              options={[
                { id: 1, name: "GST (18%)" },
                { id: 2, name: "SGST (18%)" },
                { id: 3, name: "IGST (18%)" },
                { id: 4, name: "VAT (18%)" },
                { id: 5, name: "No tax" },
              ]}
              onChange={handleTaxType}
              value={taxType}
              error={taxTypeError}
              height="41px"
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Total Amount"
              required={true}
              disabled
              value={amount}
            />
          </Col>
        </Row>

        <Divider className="leadmanger_paymentdrawer_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Payment Info
        </p>

        <Row
          gutter={16}
          className="leadmanager_paymentdetails_drawer_rowdiv"
          style={{ marginTop: "20px" }}
        >
          <Col span={8}>
            <CommonInputField
              label="Pay Amount"
              required={true}
              onChange={handlePaidNow}
              value={paidNow}
              error={paidNowError}
              errorFontSize="10px"
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Payment Mode"
              required={true}
              options={[
                { id: 1, name: "Cash" },
                { id: 2, name: "Card" },
                { id: 3, name: "Bank" },
                { id: 4, name: "UPI" },
                { id: 5, name: "Razorpay" },
              ]}
              onChange={handlePaymentType}
              value={paymentMode}
              error={paymentModeError}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Convenience fees"
              required={true}
              value={convenienceFees}
              disabled={true}
              type="number"
            />
          </Col>
        </Row>

        <Row
          gutter={16}
          className="leadmanager_paymentdetails_drawer_rowdiv"
          style={{ marginTop: "40px" }}
        >
          <Col span={8}>
            <CommonMuiDatePicker
              label="Payment Date"
              required={true}
              onChange={(value) => {
                setPaymentDate(value);
                if (paymentValidationTrigger) {
                  setPaymentDateError(selectValidator(value));
                }
              }}
              value={paymentDate}
              error={paymentDateError}
            />
          </Col>
          <Col span={16}>
            <ImageUploadCrop
              label="Payment Screenshot"
              aspect={1}
              maxSizeMB={1}
              required={true}
              value={paymentScreenShotBase64}
              onChange={(base64) => setPaymentScreenShotBase64(base64)}
              onErrorChange={setPaymentScreenShotError} // ✅ pass setter directly
            />
            {paymentScreenShotError && (
              <p style={{ fontSize: "12px", color: "#d32f2f", marginTop: 4 }}>
                {`Payment Screenshot ${paymentScreenShotError}`}
              </p>
            )}
          </Col>
        </Row>

        <Divider className="leadmanger_paymentdrawer_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Balance Amount Details
        </p>

        <Row
          gutter={16}
          style={{ marginTop: "20px", marginBottom: "30px" }}
          className="leadmanager_paymentdetails_drawer_rowdiv"
        >
          <Col span={8}>
            <CommonInputField
              label="Balance Amount"
              required={true}
              value={balanceAmount}
              disabled={true}
              type="number"
            />
          </Col>
          {isShowDueDate ? (
            <Col span={8}>
              <CommonMuiDatePicker
                label="Next Due Date"
                onChange={(value) => {
                  setDueDate(value);
                  setDueDateError(selectValidator(value));
                }}
                value={dueDate}
                error={dueDateError}
                disablePreviousDates={true}
              />
            </Col>
          ) : (
            ""
          )}
        </Row>

        <Divider className="leadmanger_paymentdrawer_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Add Customer Details
        </p>

        <Row
          gutter={16}
          style={{ marginTop: "20px", marginBottom: "30px" }}
          className="leadmanager_paymentdetails_drawer_rowdiv"
        >
          <Col span={8}>
            <CommonSelectField
              label="Course"
              required={true}
              options={courseOptions}
              value={customerCourseId}
              disabled={true}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Batch Track"
              required={true}
              options={batchTrackOptions}
              value={customerBatchTrackId}
              disabled={true}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Batch Timing"
              required={true}
              options={batchTimingOptions}
              onChange={(e) => {
                setCustomerBatchTimingId(e.target.value);
                if (paymentValidationTrigger) {
                  setCustomerBatchTimingIdError(
                    selectValidator(e.target.value)
                  );
                }
              }}
              value={customerBatchTimingId}
              error={customerBatchTimingIdError}
            />
          </Col>
        </Row>

        <Row
          gutter={16}
          style={{ marginTop: "20px", marginBottom: "50px" }}
          className="leadmanager_paymentdetails_drawer_rowdiv"
        >
          <Col span={8}>
            <CommonSelectField
              label="Placement Support"
              required={true}
              options={[
                { id: "Need", name: "Need" },
                { id: "Not Need", name: "Not Need" },
              ]}
              onChange={(e) => {
                setPlacementSupport(e.target.value);
                if (paymentValidationTrigger) {
                  setPlacementSupportError(selectValidator(e.target.value));
                }
              }}
              value={placementSupport}
              error={placementSupportError}
            />
          </Col>
          <Col span={8}>
            <div style={{ marginTop: "10px" }}>
              <Checkbox
                style={{ color: "#333" }}
                checked={serverRequired}
                onChange={(e) => {
                  setServerRequired(e.target.checked);
                }}
              >
                Server Required
              </Checkbox>
            </div>
          </Col>
        </Row>

        <div className="leadmanager_tablefiler_footer">
          <div
            className="leadmanager_submitlead_buttoncontainer"
            style={{ gap: "12px" }}
          >
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={() => {
                  handlePaymentSubmit();
                }}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* add course modal */}
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
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
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

        <div className="lead_course_instruction_container">
          <p style={{ fontSize: "12px", fontWeight: 500 }}>Note:</p>
          <p style={{ fontSize: "13px", marginTop: "2px" }}>
            Make sure the course name remains exactly as{" "}
            <span style={{ fontWeight: 600 }}>‘Google’</span>
          </p>
          <p style={{ fontSize: "12px", fontWeight: 500, marginTop: "6px" }}>
            Example:
          </p>
          <ul>
            <li>Full Stack Development</li>
            <li>Core Java</li>
          </ul>
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
    </div>
  );
}
