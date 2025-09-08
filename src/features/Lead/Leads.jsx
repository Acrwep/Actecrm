import React, { useState, useEffect, useMemo } from "react";
import {
  Col,
  Row,
  Drawer,
  Rate,
  Tooltip,
  Divider,
  Upload,
  Button,
  Checkbox,
} from "antd";
import {
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  ListSubheader,
} from "@mui/material";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import {
  addressValidator,
  calculateAmount,
  debounce,
  discountValidator,
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
import { VscPercentage } from "react-icons/vsc";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonTextArea from "../Common/CommonTextArea";
import CommonTable from "../Common/CommonTable";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
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
  getRegions,
  getTechnologies,
  getTrainingMode,
  leadPayment,
  sendCustomerFormEmail,
  sendLeadInvoiceEmail,
  updateLead,
} from "../ApiService/action";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { FaRegAddressCard } from "react-icons/fa";
import CommonImageUpload from "../Common/CommonImageUpload";
import { UploadOutlined } from "@ant-design/icons";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";

export default function Leads({ refreshLeadFollowUp, setLeadCount }) {
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
  const [cityOptions, setCityOptions] = useState([]);
  const [cityId, setCityId] = useState("");
  const [cityError, setCityError] = useState("");
  const [courseOptions, setCourseOptions] = useState([]);
  const [primaryCourse, setPrimaryCourse] = useState(null);
  const [primaryCourseError, setPrimaryCourseError] = useState("");
  const [primaryFees, setPrimaryFees] = useState("");
  const [primaryFeesError, setPrimaryFeesError] = useState("");
  const [isShowSecondaryCourse, setIsShowSecondaryCourse] = useState(false);
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

  const [regionOptions, setRegionOptions] = useState([]);
  const [regionId, setRegionId] = useState(null);
  const [regionError, setRegionError] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [branch, setBranch] = useState("");
  const [branchError, setBranchError] = useState("");
  const [batchTrackOptions, setBatchTrackOptions] = useState([]);
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
  const [paymentScreenShotsArray, setPaymentScreenShotsArray] = useState([]);
  const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
  const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
  const [paymentValidationTrigger, setPaymentValidationTrigger] =
    useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [isShowDueDate, setIsShowDueDate] = useState(true);
  const [dueDate, setDueDate] = useState(null);
  const [dueDateError, setDueDateError] = useState("");
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
      title: "Trainer Mode",
      key: "training_mode",
      dataIndex: "training_mode",
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
      title: "Priority",
      key: "priority",
      dataIndex: "priority",
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
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
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
      title: "Trainer Mode",
      key: "training_mode",
      dataIndex: "training_mode",
      width: 140,
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
      title: "Lead Status",
      key: "lead_status",
      dataIndex: "lead_status",
      width: 140,
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
      title: "Priority",
      key: "priority",
      dataIndex: "priority",
      width: 140,
      fixed: "right",
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
  ]);

  const nonChangeColumns = [
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
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
      title: "Trainer Mode",
      key: "training_mode",
      dataIndex: "training_mode",
      width: 140,
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
      title: "Lead Status",
      key: "lead_status",
      dataIndex: "lead_status",
      width: 140,
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
      title: "Priority",
      key: "priority",
      dataIndex: "priority",
      width: 140,
      fixed: "right",
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
      setLeadCount(response?.data?.data.length || 0);
    } catch (error) {
      setLeadData([]);
      setLeadCount(0);
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
        getRegionData();
      }, 300);
    }
  };

  const getRegionData = async () => {
    try {
      const response = await getRegions();
      setRegionOptions(response?.data?.data || []);
    } catch (error) {
      setRegionOptions([]);
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
      const conve_fees = getConvenienceFees(paidNow);
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }
  };

  const handlePaymentScreenshot = ({ file }) => {
    // allowed MIME types
    const isValidType =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg";

    if (file.status === "uploading" || file.status === "removed") {
      setPaymentScreenShotsArray([]);
      setPaymentScreenShotBase64("");
      setPaymentScreenShotError(" is required");
      return;
    }
    const isValidSize = file.size <= 1024 * 1024;

    if (isValidType && isValidSize) {
      console.log("fileeeee", file);
      setPaymentScreenShotsArray([file]);
      CommonMessage("success", "Screenshot uploaded");
      setPaymentScreenShotError("");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Extract Base64 content
        setPaymentScreenShotBase64(base64String); // Store in state
      };
    } else {
      if (!isValidType) {
        CommonMessage("error", "Accept only .png, .jpg and .jpeg");
      } else if (!isValidSize) {
        CommonMessage("error", "File size must be 1MB or less");
      }
      setPaymentScreenShotsArray([]);
      setPaymentScreenShotBase64("");
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
    const cityList = City.getCitiesOfState(item.country, item.state);

    const updateCities = cityList.map((city) => {
      return { ...city, id: city.name };
    });
    console.log(updateCities, "updateCities");
    setCityOptions(updateCities);
    setCityId(item.district);

    setPrimaryCourse(item.primary_course_id);
    setPrimaryFees(item.primary_fees);
    setSecondaryCourse(item.secondary_course_id);
    setSecondaryFees(item.secondary_fees);
    setTrainerMode(item.training_mode_id);
    setPriority(item.priority_id);
    setLeadType(item.lead_type_id);
    setLeadStatus(item.lead_status_id);
    setResponseLeadStatus(item.response_status_id);
    setNxtFollowupDate(item.next_follow_up_date);
    setExpectDateJoin(item.expected_join_date);
    setRegionId(item.region_id);
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
    setLeadId(null);
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
    setPaymentScreenShotsArray([]);
    setPaymentScreenShotBase64("");
    setPaymentScreenShotError("");
    setIsShowDueDate(true);
    setBalanceAmount("");
    setDueDate(null);
    setDueDateError("");
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
    const nxtFollowupDateValidate = selectValidator(nxtFollowupDate);
    const expectDateJoinValidate = selectValidator(expectDateJoin);
    const branchValidate = selectValidator(branch);
    const batchTrackValidate = selectValidator(batchTrack);
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
    setNxtFollowupDateError(nxtFollowupDateValidate);
    setExpectDateJoinError(expectDateJoinValidate);
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
      trainerModeValidate ||
      priorityValidate ||
      leadTypeValidate ||
      leadStatusValidate ||
      nxtFollowupDateValidate ||
      expectDateJoinValidate ||
      branchValidate ||
      batchTrackValidate ||
      commentsValidate
    )
      return;

    setButtonLoading(true);
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
      next_follow_up_date: formatToBackendIST(nxtFollowupDate),
      expected_join_date: formatToBackendIST(expectDateJoin),
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
          formReset(true);
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
    }
  };

  const handlePaymentSubmit = async (is_sendInvoice) => {
    setPaymentValidationTrigger(true);
    const taxTypeValidate = selectValidator(taxType);
    const paymentTypeValidate = selectValidator(paymentMode);
    const paymentDateValidate = selectValidator(paymentDate);

    console.log("eeeee", paidNow, amount);
    const paidNowValidate = priceValidator(parseInt(paidNow), parseInt(amount));

    const screenshotValidate =
      paymentScreenShotsArray.length <= 0 ? " is required" : "";
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

    if (
      paymentTypeValidate ||
      paidNowValidate ||
      taxTypeValidate ||
      paymentDateValidate ||
      screenshotValidate ||
      dueDateValidate
    )
      return;
    if (is_sendInvoice) {
      setInvoiceButtonLoading(true);
    } else {
      setButtonLoading(true);
    }

    const today = new Date();

    // Step 2: Calculate GST on discounted amount
    const gstAmount = amount - subTotal;

    console.log("GST Amount:", gstAmount);

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
      next_due_date: formatToBackendIST(dueDate),
      created_date: formatToBackendIST(today),
      paid_date: formatToBackendIST(paymentDate),
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
        handleSendCustomerFormLink(createdCustomerDetails, is_sendInvoice);
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

  const handleSendCustomerFormLink = async (
    customerDetails,
    is_sendInvoice
  ) => {
    const payload = {
      email: customerDetails.email,
      link: `${import.meta.env.VITE_EMAIL_URL}/customer-registration/${
        customerDetails.insertId
      }`,
      customer_id: customerDetails.insertId,
    };

    try {
      await sendCustomerFormEmail(payload);
      setTimeout(() => {
        if (is_sendInvoice === true) {
          sendInvoiceEmail(customerDetails);
        }
      }, 300);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const sendInvoiceEmail = async (customerDetails) => {
    const invoiceDetails = customerDetails.invoice_details;
    const courseDetails = customerDetails.course;
    const payload = {
      email: customerDetails.email,
      name: customerDetails.name,
      mobile: customerDetails.phone,
      convenience_fees: invoiceDetails.convenience_fees,
      discount_amount: invoiceDetails.discount_amount,
      gst_amount: invoiceDetails.gst_amount,
      gst_percentage: parseFloat(invoiceDetails.gst_percentage),
      invoice_date: invoiceDetails.invoice_date,
      invoice_number: invoiceDetails.invoice_number,
      paid_amount: invoiceDetails.paid_amount,
      payment_mode: invoiceDetails.payment_mode,
      tax_type: invoiceDetails.tax_type,
      total_amount: invoiceDetails.total_amount,
      balance_amount: invoiceDetails.balance_amount,
      course_name: courseDetails.course_name,
      sub_total: courseDetails.primary_fees,
    };

    try {
      await sendLeadInvoiceEmail(payload);
    } catch (error) {
      console.log("invoice error", error);
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
          scroll={{ x: 3400 }}
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
            <div style={{ marginTop: "10px" }}>
              <Checkbox
                value={isShowSecondaryCourse}
                onChange={(e) => {
                  setIsShowSecondaryCourse(e.target.checked);
                  if (e.target.checked === false) {
                    setSecondaryCourse(null);
                    setSecondaryFees("");
                  }
                }}
              >
                Add Course
              </Checkbox>
            </div>
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

        <Row gutter={16} style={{ marginTop: "30px" }}>
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
        </Row>

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
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

        <p className="addleaddrawer_headings">Response Status</p>

        <Row gutter={16} style={{ marginBottom: "30px" }}>
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
        </Row>

        <p className="addleaddrawer_headings">Priority Status</p>
        <Row gutter={16} style={{ marginBottom: "30px" }}>
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
          <Col span={10}>
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
            <div style={{ display: "flex", gap: "12px" }}>
              {leadId ? (
                ""
              ) : (
                <button
                  className={"leadmanager_updateleadbutton"}
                  onClick={handleSubmit}
                >
                  Save
                </button>
              )}

              <button
                className={
                  leadId
                    ? "leadmanager_updateleadbutton"
                    : "leadmanager_saveleadbutton"
                }
                onClick={handleSubmit}
              >
                {leadId ? "Update" : "Save And Add New"}
              </button>
            </div>
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
        <p
          className="leadmanager_paymentdetails_drawer_heading"
          style={{ marginTop: "24px" }}
        >
          Candidate Details
        </p>

        <Row
          gutter={16}
          className="leadmanager_paymentdetails_drawer_rowdiv"
          style={{ marginTop: "16px" }}
        >
          <Col span={8}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Candidate Name:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                {clickedLeadItem ? clickedLeadItem.name : "-"}
              </span>
            </p>
          </Col>
          <Col span={8}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Email:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                {clickedLeadItem ? clickedLeadItem.email : "-"}
              </span>
            </p>
          </Col>
          <Col span={8}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Mobile:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                {clickedLeadItem ? clickedLeadItem.phone : "-"}
              </span>
            </p>
          </Col>
        </Row>

        <Row
          gutter={16}
          className="leadmanager_paymentdetails_drawer_rowdiv"
          style={{ marginTop: "20px" }}
        >
          <Col span={8}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Course:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                {clickedLeadItem ? clickedLeadItem.primary_course : "-"}
              </span>
            </p>
          </Col>
          <Col span={8}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Training Mode:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                {clickedLeadItem ? clickedLeadItem.training_mode : "-"}
              </span>
            </p>
          </Col>
          <Col span={8}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Region:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                {clickedLeadItem ? clickedLeadItem.region_name : "-"}
              </span>
            </p>
          </Col>
        </Row>

        <Row
          gutter={16}
          className="leadmanager_paymentdetails_drawer_rowdiv"
          style={{ marginTop: "20px" }}
        >
          <Col span={8}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Branch Name:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                {clickedLeadItem ? clickedLeadItem.branche_name : "-"}
              </span>
            </p>
          </Col>
          <Col span={8}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Course Fees:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                {clickedLeadItem ? "₹" + clickedLeadItem.primary_fees : "-"}
              </span>
            </p>
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
            <p
              className="leads_paymentscreenshot_label"
              style={{ fontSize: "13px" }}
            >
              Payment Screenshot <span style={{ color: "#d32f2f" }}>*</span>
            </p>
            <Upload
              style={{ width: "100%", marginTop: "8px" }}
              beforeUpload={(file) => {
                return false; // Prevent auto-upload
              }}
              accept=".png,.jpg,.jpeg"
              onChange={handlePaymentScreenshot}
              fileList={paymentScreenShotsArray}
              multiple={false}
            >
              <Button
                icon={<UploadOutlined />}
                className="leadmanager_payment_screenshotbutton"
              >
                Choose file
                <span style={{ fontSize: "10px" }}>(PNG, JPEG, & PNG)</span>
              </Button>
            </Upload>{" "}
            {paymentScreenShotError && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#d32f2f",
                  marginTop: "4px",
                  marginLeft: "6px",
                }}
              >{`Screenshot ${paymentScreenShotError}`}</p>
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

        <div className="leadmanager_tablefiler_footer">
          <div
            className="leadmanager_submitlead_buttoncontainer"
            style={{ gap: "12px" }}
          >
            {invoiceButtonLoading ? (
              <button className="lead_paymentsubmitwithinvoice_loadingbutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="lead_paymentsubmitwithinvoice_button"
                onClick={() => {
                  handlePaymentSubmit(true);
                }}
              >
                Submit and Send Invoice
              </button>
            )}

            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={() => {
                  handlePaymentSubmit(false);
                }}
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
