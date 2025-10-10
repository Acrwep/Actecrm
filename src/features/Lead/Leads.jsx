import React, { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Drawer,
  Tooltip,
  Divider,
  Flex,
  Radio,
  Button,
  Checkbox,
  Modal,
  Switch,
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
import { Country, State } from "country-state-city";
import { IoFilter } from "react-icons/io5";
import {
  assignLead,
  createArea,
  createLead,
  createTechnology,
  getAllAreas,
  getBranches,
  getLeads,
  getTechnologies,
  getUsers,
  leadEmailAndMobileValidator,
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
import { SlGlobe } from "react-icons/sl";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { useSelector } from "react-redux";

export default function Leads({
  refreshLeadFollowUp,
  setLeadCount,
  leadTypeOptions,
  regionOptions,
  courseOptions,
  setCourseOptions,
  areaOptions,
  setAreaOptions,
}) {
  const mounted = useRef(false);

  const [leadData, setLeadData] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isShowEdit, setIsShowEdit] = useState(true);

  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [emailAndMobileValidation, setEmailAndMobileValidation] = useState({
    email: 0,
    mobile: 0,
    whatsApp: 0,
  });
  const [countryOptions, setCountryOptions] = useState([]);
  const [countryId, setCountryId] = useState(null);
  const [countryError, setCountryError] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [stateId, setStateId] = useState("");
  const [stateError, setStateError] = useState("");
  const [areaId, setAreaId] = useState(null);
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
  const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
  const [nxtFollowupDateError, setNxtFollowupDateError] = useState(null);
  const [expectDateJoin, setExpectDateJoin] = useState(null);
  const [expectDateJoinError, setExpectDateJoinError] = useState("");

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
  const [filterType, setFilterType] = useState(1);

  //payment usestates
  const [clickedLeadItem, setClickedLeadItem] = useState(null);
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentDateError, setPaymentDateError] = useState("");
  const [paymentMode, setPaymentMode] = useState(null);
  const [paymentModeError, setPaymentModeError] = useState(null);
  const [subTotal, setSubTotal] = useState();
  const [convenienceFees, setConvenienceFees] = useState("");
  const [taxType, setTaxType] = useState("");
  const [taxTypeError, setTaxTypeError] = useState("");
  const [amount, setAmount] = useState();
  const [paidNow, setPaidNow] = useState("");
  const [paidNowError, setPaidNowError] = useState("");
  const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
  const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
  const [paymentValidationTrigger, setPaymentValidationTrigger] =
    useState(false);
  const [balanceAmount, setBalanceAmount] = useState();
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
  //assign lead
  const [isOpenAssignDrawer, setIsOpenAssignDrawer] = useState(false);
  const [isOpenAssignModal, setIsOpenAssignModal] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [allUsersList, setAllUsersList] = useState([]);
  const [assignId, setAssignId] = useState(null);
  const [assignIdError, setAssignIdError] = useState("");
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);
  const [leadExecutives, setLeadExecutives] = useState([]);
  const [leadExecutiveId, setLeadExecutiveId] = useState(null);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [defaultColumns, setDefaultColumns] = useState([
    { title: "Lead Executive", isChecked: true },
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
      width: 220,
      isChecked: true,
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      isChecked: true,
    },
  ]);

  const nonChangeColumns = [
    {
      title: "Lead Executive",
      key: "lead_assigned_to_name",
      dataIndex: "lead_assigned_to_name",
      width: 160,
    },
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 240 },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    {
      title: "Country",
      key: "country",
      dataIndex: "country",
      width: 120,
      render: (text) => {
        return (
          <div>
            <p> {getCountryName(text)}</p>
          </div>
        );
      },
    },
    {
      title: "State",
      key: "state",
      dataIndex: "state",
      width: 150,
      render: (text, record) => {
        return (
          <div>
            <p> {getStateName(record.country, text)}</p>
          </div>
        );
      },
    },
    { title: "City ", key: "area_id", dataIndex: "area_id", width: 120 },
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
      key: "branch_name",
      dataIndex: "branch_name",
      width: 160,
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
      width: 160,
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Expected Join Date",
      key: "expected_join_date",
      dataIndex: "expected_join_date",
      width: 160,
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Created At",
      key: "created_date",
      dataIndex: "created_date",
      width: 120,
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
      width: 200,
      render: (text) => {
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
                <p style={{ cursor: "pointer" }}>{text.slice(0, 24) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
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
      render: (text, record) => (
        <div className="trainers_actionbuttonContainer">
          {permissions.includes("Edit Lead Button") &&
          isShowEdit &&
          record.is_customer_reg === 0 ? (
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
            />
          ) : (
            ""
          )}

          {record.is_customer_reg === 1 ? (
            <Tooltip placement="bottom" title="Already a Customer">
              <FaRegAddressCard
                size={19}
                color="#2ed573"
                className="trainers_action_icons"
              />
            </Tooltip>
          ) : (
            <Tooltip placement="bottom" title="Make as customer">
              <FaRegAddressCard
                size={19}
                color="#d32f2f"
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenPaymentDrawer(true);
                  setSubTotal(parseFloat(record.primary_fees));
                  setAmount(parseFloat(record.primary_fees));
                  setBalanceAmount(parseFloat(record.primary_fees));
                  setCustomerCourseId(record.primary_course_id);
                  setCustomerBatchTrackId(record.batch_track_id);
                  setClickedLeadItem(record);
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  useEffect(() => {
    setTableColumns(nonChangeColumns);
  }, [permissions, isShowEdit]);

  useEffect(() => {
    getUsersData();
  }, []);

  const getUsersData = async () => {
    const payload = {
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setAllUsersList(response?.data?.data?.data || []);
    } catch (error) {
      setAllUsersList([]);
      console.log("get all users error", error);
    }
  };

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
      getAllLeadData(
        null,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        null,
        1,
        10
      );
    }
  }, [childUsers]);

  const getAllLeadData = async (
    searchvalue,
    startDate,
    endDate,
    executive_id,
    pageNumber,
    limit
  ) => {
    console.log("executive_id", executive_id);
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
      start_date: startDate,
      end_date: endDate,
      user_ids: lead_executive.length >= 1 ? lead_executive : childUsers,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getLeads(payload);
      console.log("lead response", response);
      const pagination = response?.data?.data?.pagination;

      setLeadData(response?.data?.data?.data || []);
      setLeadCount(pagination.total || 0);

      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
    } catch (error) {
      setLeadData([]);
      setLeadCount(0);
      console.log("get leads error", error);
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

  //onchange functions
  const handleEmail = async (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailValidate = emailValidator(value);

    setEmailError(emailValidate);

    if (emailValidate) return;

    const payload = {
      email: value,
    };
    try {
      const response = await leadEmailAndMobileValidator(payload);
      console.log("lead email validator res", response);
      if (response?.data?.data === true) {
        setEmailError(" is already exist");
        setEmailAndMobileValidation((prev) => ({
          ...prev,
          email: 0,
        }));
      } else {
        setEmailAndMobileValidation((prev) => ({
          ...prev,
          email: 1,
        }));
      }
    } catch (error) {
      console.log("validation error", error);
    }
  };

  const handleMobileNumber = async (e) => {
    const value = e.target.value;
    setMobile(value);
    const mobileValidate = mobileValidator(value);

    setMobileError(mobileValidate);

    if (mobileValidate) return;

    const payload = {
      mobile: value,
    };
    try {
      const response = await leadEmailAndMobileValidator(payload);
      console.log("lead mobile validator res", response);
      if (response?.data?.data === true) {
        setMobileError(" is already exist");
        setEmailAndMobileValidation((prev) => ({
          ...prev,
          mobile: 0,
        }));
      } else {
        setMobileError("");
        setEmailAndMobileValidation((prev) => ({
          ...prev,
          mobile: 1,
        }));
      }
    } catch (error) {
      console.log("validation error", error);
    }
  };

  const handleWhatsAppNumber = async (e) => {
    const value = e.target.value;
    setWhatsApp(value);
    const whatsAppValidate = mobileValidator(value);

    setWhatsAppError(whatsAppValidate);

    if (whatsAppValidate) return;

    const payload = {
      mobile: value,
    };
    try {
      const response = await leadEmailAndMobileValidator(payload);
      console.log("lead mobile validator res", response);
      if (response?.data?.data === true) {
        setWhatsAppError(" is already exist");
        setEmailAndMobileValidation((prev) => ({
          ...prev,
          whatsApp: 0,
        }));
      } else {
        setWhatsAppError("");
        setEmailAndMobileValidation((prev) => ({
          ...prev,
          whatsApp: 1,
        }));
      }
    } catch (error) {
      console.log("validation error", error);
    }
  };

  const handlePaidNow = (e) => {
    const input = e.target.value;

    // Allow numbers, decimal point, or empty string
    if (!/^\d*\.?\d*$/.test(input)) return;

    setPaidNow(input); // store as string for user input

    const value = parseFloat(input); // parse for calculations
    const amt = parseFloat(amount);

    if (value < amt || isNaN(value) || input == "" || input == null) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }

    setBalanceAmount(
      getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(value) ? 0 : value)
    );

    if (paymentMode == 2 || paymentMode == 5) {
      const conve_fees = getConvenienceFees(isNaN(value) ? 0 : value);
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }

    if (paymentValidationTrigger) {
      setPaidNowError(
        priceValidator(isNaN(value) ? 0 : value, parseFloat(amt))
      );
    }
  };

  const handleTaxType = (e) => {
    setTaxType(e.target.value);
    if (paymentValidationTrigger) {
      setTaxTypeError(selectValidator(e.target.value));
    }
    const amnt = calculateAmount(
      parseFloat(subTotal),
      e.target.value == 5 ? 0 : 18
    );
    if (isNaN(amnt)) {
      setAmount("");
    } else {
      setAmount(parseFloat(amnt));
    }

    //handle balance amount
    if (paidNow < amnt || isNaN(paidNow) || paidNow == "" || paidNow == null) {
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
    console.log("taxType", taxType);
    const amnt = calculateAmount(
      parseFloat(subTotal),
      taxType == 5 || taxType == "" || taxType == null ? 0 : 18
    );
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
    if (value == 2 || value == 5) {
      const conve_fees = getConvenienceFees(paidNow ? paidNow : 0);
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }
  };

  //onclick functions
  const handleEdit = async (item) => {
    console.log("clicked itemmm", item);
    let areasList;
    try {
      const response = await getAllAreas();
      areasList = response?.data?.data || [];
    } catch (error) {
      areasList = [];
      console.log("response status error", error);
    }

    setIsOpenAddDrawer(true);
    setLeadId(item.id);
    setName(item.name);
    setEmail(item.email);
    setMobile(item.phone);
    setWhatsApp(item.whatsapp);
    setEmailAndMobileValidation({
      email: 1,
      mobile: 1,
      whatsApp: 1,
    });
    setCountryId(item.country);
    const stateList = State.getStatesOfCountry(item.country);
    const updateSates = stateList.map((s) => {
      return { ...s, id: s.isoCode };
    });
    setStateOptions(updateSates);
    setStateId(item.state);
    // setAreaId(parseInt(item.area_id));
    console.log("areaOptions", areasList);
    const findArea = areasList.find((f) => f.name == item.area_id);
    console.log("findArea", findArea);

    if (findArea) {
      setAreaId(parseInt(findArea.id));
    } else {
      setAreaId(null);
    }

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

  const handleSubmit = async (saveType) => {
    console.log("emailAndMobileValidation", emailAndMobileValidation);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    console.log("convertAsJson", convertAsJson);
    setValidationTrigger(true);

    let nxtFollowupDateValidate;

    if (leadStatus == 4) {
      nxtFollowupDateValidate = "";
    } else {
      nxtFollowupDateValidate = selectValidator(nxtFollowupDate);
    }

    const nameValidate = nameValidator(name);
    let emailValidate = emailValidator(email);
    let mobileValidate = mobileValidator(mobile);
    let whatsAppValidate = mobileValidator(whatsApp);
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

    if (emailAndMobileValidation.email == 0) {
      emailValidate = " is already exist";
    }
    if (emailAndMobileValidation.mobile == 0) {
      mobileValidate = " is already exist";
    }
    if (emailAndMobileValidation.whatsApp == 0) {
      whatsAppValidate = " is already exist";
    }
    console.log("emailValidate", emailValidate);
    if (
      nameValidate ||
      emailValidate ||
      mobileValidate ||
      whatsAppValidate ||
      countryValidate ||
      stateValidate ||
      cityValidate
    ) {
      const container = document.getElementById("leadform_basicinfo_heading");
      container.scrollIntoView({
        behavior: "smooth",
      });
    }
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

    //-----------------
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
          setPagination({
            page: 1,
          });
          getAllLeadData(
            searchValue,
            selectedDates[0],
            selectedDates[1],
            leadExecutiveId,
            pagination.page,
            pagination.limit
          );
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
          setPagination({
            page: 1,
          });
          getAllLeadData(
            searchValue,
            selectedDates[0],
            selectedDates[1],
            leadExecutiveId,
            1,
            pagination.limit
          );
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
        taxType == 1
          ? "GST (18%)"
          : taxType == 2
          ? "SGST (18%)"
          : taxType == 3
          ? "IGST (18%)"
          : taxType == 4
          ? "VAT (18%)"
          : "No Tax",
      gst_percentage: taxType == 5 ? "0%" : "18%",
      gst_amount: parseFloat(gstAmount).toFixed(2),
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
        setPagination({
          page: 1,
        });
        getAllLeadData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          leadExecutiveId,
          1,
          pagination.limit
        );
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

  const formReset = (dontCloseAddDrawer) => {
    if (dontCloseAddDrawer == true) {
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
    setEmailAndMobileValidation({
      email: 0,
      mobile: 0,
      whatsApp: 0,
    });
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
    setIsOpenAssignDrawer(false);
    setIsOpenAssignModal(false);
    setAssignId(null);
    setAssignIdError("");

    //payment drawer usestates
    setIsOpenPaymentDrawer(false);
    setPaymentValidationTrigger(false);
    setClickedLeadItem(null);
    setPaymentMode(null);
    setPaymentModeError("");
    setSubTotal();
    setConvenienceFees("");
    setTaxType(null);
    setTaxTypeError("");
    setAmount();
    setPaidNow("");
    setPaidNowError("");
    setPaymentDate(null);
    setPaymentDateError("");
    setPaymentScreenShotBase64("");
    setPaymentScreenShotError("");
    setIsShowDueDate(true);
    setBalanceAmount();
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

  const getCountryName = (countryCode) => {
    let countryName = "";
    const countries = Country.getAllCountries();

    const findCountry = countries.find((f) => f.isoCode == countryCode);

    if (findCountry) {
      countryName = findCountry.name;
    } else {
      countryName = "";
    }
    return countryName;
  };

  const getStateName = (countryCode, stateCode) => {
    const stateList = State.getStatesOfCountry(countryCode);
    const updateSates = stateList.map((s) => {
      return { ...s, id: s.isoCode };
    });

    let stateName = "";

    const findState = updateSates.find((f) => f.id == stateCode);
    if (findState) {
      stateName = findState.name;
    } else {
      stateName = "";
    }
    return stateName;
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getAllLeadData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        leadExecutiveId,
        1,
        pagination.limit
      );
    }, 300);
  };

  const handleSelectedRow = (row) => {
    console.log("selected rowwww", row);
    setSelectedRows(row);
    const keys = row.map((item) => item.id); // or your unique row key
    setSelectedRowKeys(keys);
    if (row.length >= 1) {
      setIsShowEdit(false);
    } else {
      setIsShowEdit(true);
    }
  };

  const handleAssignLead = async () => {
    console.log(selectedRows);
    const assignIdValidate = selectValidator(assignId);

    setAssignIdError(assignIdValidate);

    if (assignIdValidate) return;

    if (selectedRows.length >= 1) {
      //multi assign
      const updateLeadItems = selectedRows.map((item) => {
        return { assigned_to: assignId, id: item?.id };
      });
      setAddCourseLoading(true);
      const payload = {
        leads: updateLeadItems,
      };
      try {
        await assignLead(payload);
        setTimeout(() => {
          setPagination({
            page: 1,
          });
          getAllLeadData(
            searchValue,
            selectedDates[0],
            selectedDates[1],
            leadExecutiveId,
            1,
            pagination.limit
          );
          formReset();
          setAddCourseLoading(false);
          setIsShowEdit(true);
          setSelectedRowKeys([]);
          setSelectedRows([]);
        }, 300);
      } catch (error) {
        setAddCourseLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    } else {
      //single assign
      let updateLeadItem = [];

      updateLeadItem.push({ assigned_to: assignId, id: leadDetails?.id });
      const payload = {
        leads: updateLeadItem,
      };
      setAddCourseLoading(true);
      try {
        await assignLead(payload);
        setTimeout(() => {
          setPagination({
            page: 1,
          });
          getAllLeadData(
            searchValue,
            selectedDates[0],
            selectedDates[1],
            leadExecutiveId,
            1,
            pagination.limit
          );
          formReset();
          setAddCourseLoading(false);
        }, 300);
      } catch (error) {
        setAddCourseLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getAllLeadData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      leadExecutiveId,
      page,
      limit
    );
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
                          getAllLeadData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
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
                            console.log("filllllll", e.target.value);
                            setFilterType(e.target.value);
                            if (searchValue == "") {
                              return;
                            } else {
                              setSearchValue("");
                              setPagination({
                                page: 1,
                              });
                              getAllLeadData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
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
                    getAllLeadData(
                      searchValue,
                      selectedDates[0],
                      selectedDates[1],
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
                  getAllLeadData(
                    searchValue,
                    dates[0],
                    dates[1],
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
            {permissions.includes("Add Lead Button") && isShowEdit === true ? (
              <button
                className="leadmanager_addleadbutton"
                onClick={() => {
                  setIsOpenAddDrawer(true);
                }}
              >
                Add Lead
              </button>
            ) : (
              ""
            )}

            {permissions.includes("Assign Lead") && isShowEdit === false && (
              <button
                className="leadmanager_addleadbutton"
                onClick={() => {
                  setIsOpenAssignModal(true);
                }}
              >
                Assign Lead
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
          scroll={{ x: 3350 }}
          columns={tableColumns}
          dataSource={leadData}
          dataPerPage={10}
          loading={loading}
          checkBox={permissions.includes("Assign Lead") ? "true" : "false"}
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
      <Drawer
        title="Add Lead"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="52%"
        style={{ position: "relative" }}
      >
        <p className="addleaddrawer_headings" id="leadform_basicinfo_heading">
          Basic Information
        </p>
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
              onChange={handleEmail}
              error={emailError}
            />
          </Col>
          <Col span={8}>
            <div style={{ position: "relative" }}>
              <CommonInputField
                label="Mobile Number"
                required={true}
                maxLength={10}
                type="number"
                value={mobile}
                onChange={handleMobileNumber}
                error={mobileError}
                onInput={(e) => {
                  if (e.target.value.length > 15) {
                    e.target.value = e.target.value.slice(0, 15);
                  }
                }}
                errorFontSize={mobileError.length >= 10 ? "10px" : "13px"}
              />
              {/* <div className="leadmanager_countrycode_select_container">
                <CommonCountryCodeSelect
                  label="Select Country"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  required
                  error={phoneCode === "" ? "is required" : ""}
                />{" "}
              </div> */}
            </div>
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
              onChange={handleWhatsAppNumber}
              error={whatsAppError}
              onInput={(e) => {
                if (e.target.value.length > 15) {
                  e.target.value = e.target.value.slice(0, 15);
                }
              }}
              errorFontSize={whatsAppError.length >= 10 ? "9px" : "13px"}
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
                  onChange={(e) => {
                    setAreaId(e.target.value);
                    if (validationTrigger) {
                      setAreaError(selectValidator(e.target.value));
                    }
                  }}
                  options={areaOptions}
                  value={areaId}
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
                console.log("value", value);
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

                setTableColumns(reorderedColumns);
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
        width="54%"
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
                  <SlGlobe size={15} color="gray" />
                  <p className="customerdetails_rowheading">Country</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.country
                    ? getCountryName(clickedLeadItem.country)
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
                  {clickedLeadItem && clickedLeadItem.area_id
                    ? clickedLeadItem.area_id
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

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Lead Executive</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.lead_assigned_to_name
                    ? clickedLeadItem.lead_assigned_to_name
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
                { id: 5, name: "No Tax" },
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
                required={true}
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
              label="Batch Type"
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
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <p className="leads_serverrequired_label">Server Required</p>
              <Switch
                style={{ color: "#333" }}
                checked={serverRequired}
                onChange={(checked) => {
                  setServerRequired(checked);
                }}
                className="leads_serverrequired_switch"
              />
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

      {/* assign lead drawer */}
      <Drawer
        title="Assign Lead"
        open={isOpenAssignDrawer}
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
                  {leadDetails && leadDetails.name ? leadDetails.name : "-"}
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
                  {leadDetails && leadDetails.branch_name
                    ? leadDetails.branch_name
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
            Assign Lead
          </p>{" "}
          <div style={{ marginTop: "16px" }}>
            <CommonSelectField
              label="Lead Executive"
              options={allUsersList}
              onChange={(e) => {
                setAssignId(e.target.value);
                setAssignIdError(selectValidator(e.target.value));
              }}
              value={assignId}
              error={assignIdError}
            />
          </div>
        </div>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {addCourseLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={handleAssignLead}
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

      {/* assign lead modal */}
      <Modal
        title="Assign Leads"
        open={isOpenAssignModal}
        onCancel={() => {
          setIsOpenAssignModal(false);
          setAssignId(null);
          setAssignIdError("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenAssignModal(false);
              setAssignId(null);
              setAssignIdError("");
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
              onClick={handleAssignLead}
              className="leads_coursemodal_createbutton"
            >
              Assign
            </Button>
          ),
        ]}
        width="35%"
      >
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <CommonSelectField
            label="Lead Executive"
            options={allUsersList}
            onChange={(e) => {
              setAssignId(e.target.value);
              setAssignIdError(selectValidator(e.target.value));
            }}
            value={assignId}
            error={assignIdError}
          />
        </div>
      </Modal>
    </div>
  );
}
