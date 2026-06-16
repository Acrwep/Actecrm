import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Tooltip, Checkbox, Modal, Button, Rate } from "antd";
import { useNavigate } from "react-router-dom";
import { Country, State } from "country-state-city";
import {
  MdAdd,
  MdPerson,
  MdPhone,
  MdThumbUp,
  MdSchool,
  MdPlayArrow,
  MdAttachMoney,
  MdCheck,
} from "react-icons/md";
import CommonInputField from "../Common/CommonInputField";
import PhoneWithCountry from "../Common/PhoneWithCountry";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonTextArea from "../Common/CommonTextArea";
import {
  addressValidator,
  emailValidator,
  formatToBackendIST,
  getCountryFromDialCode,
  mobileValidator,
  nameValidator,
  priceCategory,
  selectValidator,
} from "../Common/Validation";
import {
  assignLiveLead,
  createArea,
  createLead,
  createTechnology,
  getAllAreas,
  getBranches,
  getLeadSubCategory,
  getTechnologies,
  getUsersByRole,
  leadEmailAndMobileValidator,
  leadReEntry,
  moveLiveLeadToJunk,
  updateLead,
  updateLiveLeadStatus,
} from "../ApiService/action";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { storeAreaList, storeCourseList } from "../Redux/Slice";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonNxtFollowupDatePicker from "../Common/CommonNxtFollowupDatePicker";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonMuiDateTimePicker from "../Common/CommonMuiDateTimePicker";

const AddNewLead = forwardRef(
  (
    {
      leadTypeOptions,
      regionOptions,
      updateLeadItem,
      isReAssign = false,
      liveLeadItem,
      setActivePage,
      callgetLeadsApi,
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [saveOnlyLoading, setSaveOnlyLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    //course and area options
    const courseOptions = useSelector((state) => state.courselist);
    const areaOptions = useSelector((state) => state.arealist);

    //permissions
    const permissions = useSelector((state) => state.userpermissions);

    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [duplicateEmail, setDuplicateEmail] = useState("");
    const [mobileCountryCode, setMobileCountryCode] = useState("");
    const [mobileCountry, setMobileCountry] = useState("in");
    const [mobile, setMobile] = useState("");
    const [duplicateMobile, setDuplicateMobile] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [whatsAppCountryCode, setWhatsAppCountryCode] = useState("");
    const [whatsAppCountry, setWhatsAppCountry] = useState("in");
    const [whatsApp, setWhatsApp] = useState("");
    const [duplicateWhatsApp, setDuplicateWhatsApp] = useState("");
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
    const [primaryCourse, setPrimaryCourse] = useState(null);
    const [primaryCourseError, setPrimaryCourseError] = useState("");
    // New fields from Image 1
    const [leadSubSourceOptions, setLeadSubSourceOptions] = useState([]);
    const [leadSubSource, setLeadSubSource] = useState(null);
    const [leadSubSourceError, setLeadSubSourceError] = useState("");
    const [referralName, setReferralName] = useState("");
    const [preferredMode, setPreferredMode] = useState(null);
    const [preferredBatch, setPreferredBatch] = useState(1);
    const [counsel, setCounsel] = useState(null);
    const [leadScore, setLeadScore] = useState("Auto");
    const [nextFollowupTime, setNextFollowupTime] = useState(null);
    const [addTodayFollowup, setAddTodayFollowup] = useState(false);

    const [primaryFees, setPrimaryFees] = useState("");
    const [primaryFeesError, setPrimaryFeesError] = useState("");
    const [isPrimaryCourseFocused, setIsPrimaryCourseFocused] = useState(false);
    const [isShowSecondaryCourse, setIsShowSecondaryCourse] = useState(false);
    const [secondaryCourse, setSecondaryCourse] = useState(null);
    const [secondaryFees, setSecondaryFees] = useState("");
    const [leadSource, setLeadSource] = useState(null);
    const [leadSourceError, setLeadSourceError] = useState("");
    const [leadStatusOptions, setLeadStatusOptions] = useState([
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
      {
        id: 6,
        name: "Followup Stopped",
        is_active: 0,
      },
    ]);
    const [leadStatus, setLeadStatus] = useState(null);
    const [leadStatusError, setLeadStatusError] = useState("");
    const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
    const [nxtFollowupDateError, setNxtFollowupDateError] = useState(null);
    const followUpStatusOptions = [
      { id: 1, name: "Hot Follow Up" },
      { id: 7, name: "Cold Follow Up" },
      { id: 8, name: "Interested" },
      { id: 9, name: "Only Enquiry" },
      { id: 10, name: "Hold" },
      { id: 11, name: "No Response" },
      { id: 6, name: "Others" },
    ];
    const [followUpStatusId, setFollowUpStatusId] = useState("");
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
    //response status usestates
    const communicationStatusOptions = [
      { id: 1, name: "Communicated" },
      { id: 2, name: "Not-Communicated" },
    ];
    const [communicationStatus, setCommunicationStatus] = useState(null);
    const [communicationStatusError, setCommunicationStatusError] =
      useState("");
    const [contactMode, setContactMode] = useState(null);
    const [contactModeError, setContactModeError] = useState("");
    const [interestRate, setInterestRate] = useState(1);
    const [comments, setComments] = useState("");
    const [commentsError, setCommentsError] = useState("");
    const [validationTrigger, setValidationTrigger] = useState(false);

    //add course usestates
    const [isOpenAddCourseModal, setIsOpenAddCourseModal] = useState(false);
    const [courseName, setCourseName] = useState("");
    const [courseNameError, setCourseNameError] = useState("");
    const [addCourseLoading, setAddCourseLoading] = useState(false);
    //add area usestates
    const [isOpenAddAreaModal, setIsOpenAddAreaModal] = useState(false);
    const [areaName, setAreaName] = useState("");
    const [areaNameError, setAreaNameError] = useState("");
    //assign lead
    const [saleUsers, setSaleUsers] = useState([]);
    const [assignExecutiveId, setAssignExecutiveId] = useState("");
    const [assignExecutiveError, setAssignExecutiveError] = useState("");
    const [managersList, setManagersList] = useState([]);
    const [assignedManager, setAssignedManager] = useState(null);
    const [leadOwner, setLeadOwner] = useState("Auto Assigned");
    //junk handle
    const [isPreviousJunk, setIsPreviousJunk] = useState(false);

    // useEffect(() => {
    //   const updatedOptions = leadStatusOptions.map((item) => ({
    //     ...item,
    //     is_active:
    //       item.id == 6
    //         ? false
    //         : (item.id == 4 || item.id == 5) && updateLeadItem
    //           ? false
    //           : item.is_active,
    //   }));

    //   setLeadStatusOptions(updatedOptions);
    // }, [updateLeadItem, isPreviousJunk]);

    useEffect(() => {
      const countries = Country.getAllCountries();
      const updateCountries = countries.map((c) => {
        return { ...c, id: c.isoCode };
      });
      setCountryOptions(updateCountries);

      setCountryId("IN");
      const stateList = State.getStatesOfCountry("IN");
      const updateSates = stateList.map((s) => {
        return { ...s, id: s.isoCode };
      });
      setStateOptions(updateSates);
      setTimeout(() => {
        setStateId("TN");
      }, 300);
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setAssignExecutiveId(convertAsJson?.user_id);
      if (!updateLeadItem) {
        getSaleManagers(convertAsJson?.user_id);
      }
      setLeadOwner(convertAsJson?.user_id);
      getSaleUsers();
      fetchLeadDetails();
    }, []);

    const fetchLeadDetails = async () => {
      if (updateLeadItem) {
        console.log("updateLeadItem", updateLeadItem);
        setTimeout(() => {
          const drawerBody = document.querySelector(
            "#leadform_addlead_drawer .ant-drawer-body",
          );
          if (drawerBody) {
            drawerBody.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }, 300);

        let areasList;
        try {
          const response = await getAllAreas();
          areasList = response?.data?.data || [];
        } catch (error) {
          areasList = [];
          console.log("response status error", error);
        }
        setLeadOwner(updateLeadItem?.user_id);
        setAssignExecutiveId(updateLeadItem?.lead_assigned_to_id);
        getSaleManagers(updateLeadItem?.lead_assigned_to_id);
        setName(updateLeadItem.name);
        setEmail(updateLeadItem.email);
        setDuplicateEmail(updateLeadItem.email);
        //mobile fetch
        setMobileCountryCode(
          updateLeadItem.phone_code ? updateLeadItem.phone_code : "",
        );
        const selected_mobile_country = getCountryFromDialCode(
          `+${updateLeadItem.phone_code ? updateLeadItem.phone_code : ""}`,
        );
        setMobileCountry(selected_mobile_country);
        setMobile(updateLeadItem.phone);
        setDuplicateMobile(updateLeadItem.phone);
        //whatsapp fetch
        setWhatsAppCountryCode(
          updateLeadItem.whatsapp_phone_code
            ? updateLeadItem.whatsapp_phone_code
            : "",
        );
        const selected_whatsapp_country = getCountryFromDialCode(
          `+${
            updateLeadItem.whatsapp_phone_code
              ? updateLeadItem.whatsapp_phone_code
              : ""
          }`,
        );
        setWhatsAppCountry(selected_whatsapp_country);
        setWhatsApp(updateLeadItem.whatsapp);
        setDuplicateWhatsApp(updateLeadItem.whatsapp);
        //----------
        setEmailAndMobileValidation({
          email: 1,
          mobile: 1,
          whatsApp: 1,
        });
        setCountryId(updateLeadItem.country);
        const stateList = State.getStatesOfCountry(updateLeadItem.country);
        const updateSates = stateList.map((s) => {
          return { ...s, id: s.isoCode };
        });
        setStateOptions(updateSates);
        setTimeout(() => {
          setStateId(updateLeadItem.state);
        }, 200);
        // setAreaId(parseInt(updateLeadItem.area_id));
        console.log("areaOptions", areasList);
        const findArea = areasList.find(
          (f) => f.name == updateLeadItem.area_id,
        );
        console.log("findArea", findArea);

        if (findArea) {
          setAreaId(parseInt(findArea.id));
        } else {
          setAreaId(null);
        }

        setPrimaryCourse(updateLeadItem.primary_course_id);
        setPrimaryFees(updateLeadItem.primary_fees);
        setSecondaryCourse(updateLeadItem.secondary_course_id);
        setSecondaryFees(updateLeadItem.secondary_fees);
        setLeadSource(updateLeadItem.lead_type_id);
        getLeadSubSourceData(updateLeadItem.lead_type_id);
        setLeadSubSource(updateLeadItem?.lead_sub_source);
        setLeadStatus(updateLeadItem.lead_status_id);
        // if (
        //   updateLeadItem.lead_status_id == 4 ||
        //   updateLeadItem.lead_status_id == 5
        // ) {
        //   setIsPreviousJunk(true);
        // } else {
        //   setIsPreviousJunk(false);
        // }
        // if (isReAssign) {
        //   setAssignExecutiveId(updateLeadItem.lead_assigned_to_id);
        //   const today = new Date();
        //   setNxtFollowupDate(today);
        //   setNxtFollowupDateError("");
        // } else {
        //   setAssignExecutiveId("");
        //   if (
        //     updateLeadItem.lead_status_id == 4 ||
        //     updateLeadItem.lead_status_id == 5
        //   ) {
        //     setNxtFollowupDate(null);
        //   } else {
        //     setNxtFollowupDate(updateLeadItem.next_follow_up_date);
        //   }
        // }
        setNxtFollowupDate(updateLeadItem.next_follow_up_date);
        setCommunicationStatus(updateLeadItem?.communication_status);
        setContactMode(updateLeadItem?.contact_mode);
        setCounsel(updateLeadItem?.counsel);
        setFollowUpStatusId(updateLeadItem?.lead_action_id);
        setExpectDateJoin(updateLeadItem.expected_join_date);
        setRegionId(updateLeadItem.region_id);
        getBranchesData(updateLeadItem.region_id);
        setBranch(updateLeadItem.branch_id);
        setBatchTrack(updateLeadItem.batch_track_id);
        setComments(updateLeadItem.comments);
      } else if (liveLeadItem) {
        setTimeout(() => {
          const drawerBody = document.querySelector(
            "#leadform_addlead_drawer .ant-drawer-body",
          );
          if (drawerBody) {
            drawerBody.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }, 300);
        console.log("liveLeadItem", liveLeadItem);
        setName(liveLeadItem.name);
        setEmail(liveLeadItem.email);
        setMobile(liveLeadItem.phone);
        setWhatsApp(liveLeadItem.phone);
        setLeadSource(4);
        getLeadSubSourceData(4);
        liveLeadEmailValidator(liveLeadItem.email, liveLeadItem.phone);
      }
    };

    const getSaleUsers = async () => {
      const payload = {
        role: "SALE",
      };
      try {
        const response = await getUsersByRole(payload);
        console.log("get ra users response", response);
        setSaleUsers(response?.data?.data?.data || []);
      } catch (error) {
        setSaleUsers([]);
        console.log("get hr users error", error);
      }
    };

    const getSaleManagers = async (sale_userid) => {
      const payload = {
        role: "Manager",
      };
      try {
        const response = await getUsersByRole(payload);
        console.log("get managers response", response);
        const managers_data = response?.data?.data?.data || [];
        setManagersList(managers_data);
        if (managers_data.length >= 1) {
          const matchedManager = managers_data.find(
            (manager) =>
              manager.user_id?.substring(0, 3) === sale_userid?.substring(0, 3),
          );

          console.log("managers_data", managers_data);
          console.log("Matched Manager:", matchedManager);
          setAssignedManager(matchedManager ? matchedManager?.user_id : "");
        } else {
          setAssignedManager("");
        }
        // setSaleUsers(response?.data?.data?.data || []);
      } catch (error) {
        setManagersList([]);
        // setSaleUsers([]);
        console.log("get managers error", error);
      }
    };

    const liveLeadEmailValidator = async (liveLeadEmail, liveLeadPhone) => {
      const payload = {
        email: liveLeadEmail,
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
      } finally {
        setTimeout(() => {
          liveLeadMobileValidator(liveLeadPhone);
        }, 300);
      }
    };

    const liveLeadMobileValidator = async (liveLeadPhone) => {
      const payload = {
        mobile: liveLeadPhone,
      };

      try {
        const response = await leadEmailAndMobileValidator(payload);
        console.log("lead mobile validator res", response);
        if (response?.data?.data === true) {
          setMobileError(" is already exist");
          setWhatsAppError(" is already exist");
          setEmailAndMobileValidation((prev) => ({
            ...prev,
            mobile: 0,
            whatsApp: 0,
          }));
        } else {
          setMobileError("");
          setWhatsAppError("");
          setEmailAndMobileValidation((prev) => ({
            ...prev,
            mobile: 1,
            whatsApp: 1,
          }));
        }
      } catch (error) {
        console.log("validation error", error);
      }
    };

    const getCourseData = async () => {
      try {
        const response = await getTechnologies();
        dispatch(storeCourseList(response?.data?.data || []));
      } catch (error) {
        dispatch(storeCourseList([]));
        console.log("response status error", error);
      } finally {
        setTimeout(() => {
          getAreasData();
        }, 300);
      }
    };

    const getAreasData = async () => {
      try {
        const response = await getAllAreas();
        dispatch(storeAreaList(response?.data?.data || []));
      } catch (error) {
        dispatch(storeAreaList([]));
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
        const branch_data = response?.data?.result || [];

        if (branch_data.length >= 1) {
          if (regionid == 1 || regionid == 2) {
            const reordered = [
              ...branch_data.filter((item) => item.name !== "Online"),
              ...branch_data.filter((item) => item.name === "Online"),
            ];
            setBranchOptions(reordered);
          } else {
            setBranchOptions([]);
            setBranch(branch_data[0]?.id);
          }
        } else {
          setBranchOptions([]);
        }
      } catch (error) {
        setBranchOptions([]);
        console.log("response status error", error);
      }
    };

    const getLeadSubSourceData = async (lead_source_id) => {
      const payload = {
        category_id: lead_source_id,
      };
      try {
        const response = await getLeadSubCategory(payload);
        const sub_source_data = response?.data?.data || [];
        setLeadSubSourceOptions(sub_source_data);
      } catch (error) {
        setLeadSubSourceOptions([]);
        console.log("response status error", error);
      }
    };

    const handleEmail = async (e) => {
      const value = e.target.value;
      setEmail(value);
      const emailValidate = emailValidator(value);

      setEmailError(emailValidate);

      if (
        permissions.includes("Add Lead With Existing Mobile Number") &&
        liveLeadItem == null
      ) {
        setEmailAndMobileValidation((prev) => ({
          ...prev,
          email: 1,
        }));
        return;
      }

      if (emailValidate) return;

      if (value == duplicateEmail) return;

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

    const handleMobileNumber = async (value, countryIso2) => {
      const cleanedMobile = value;
      console.log("cleanedMobile", cleanedMobile);
      setMobile(cleanedMobile);
      const activeCountry = countryIso2 || mobileCountry;
      const mobileValidate = mobileValidator(cleanedMobile, activeCountry);

      setMobileError(mobileValidate);

      if (
        permissions.includes("Add Lead With Existing Mobile Number") &&
        liveLeadItem == null
      ) {
        setEmailAndMobileValidation((prev) => ({
          ...prev,
          mobile: 1,
        }));
        return;
      }
      if (mobileValidate) return;

      if (cleanedMobile == duplicateMobile) return;

      const payload = {
        mobile: cleanedMobile,
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

    const handleWhatsAppNumber = async (value, countryIso2) => {
      const cleanedMobile = value;
      setWhatsApp(cleanedMobile);
      const activeCountry = countryIso2 || whatsAppCountry;
      const whatsAppValidate = mobileValidator(cleanedMobile, activeCountry);

      setWhatsAppError(whatsAppValidate);
      if (
        permissions.includes("Add Lead With Existing Mobile Number") &&
        liveLeadItem == null
      ) {
        setEmailAndMobileValidation((prev) => ({
          ...prev,
          whatsApp: 1,
        }));
        return;
      }
      if (whatsAppValidate) return;

      if (cleanedMobile == duplicateWhatsApp) return;

      const payload = {
        mobile: cleanedMobile,
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

    const handleCreateCourse = async () => {
      const courseValidate = addressValidator(courseName);

      setCourseNameError(courseValidate);

      if (courseValidate) return;

      const payload = {
        course_name: courseName,
        price: 0,
        offer_price: 0,
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
            "Something went wrong. Try again later",
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
            "Something went wrong. Try again later",
        );
      }
    };

    //save lead
    useImperativeHandle(ref, () => ({
      handleSubmit,
    }));

    const handleSubmit = async (saveType) => {
      console.log("emailAndMobileValidation", emailAndMobileValidation);
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      console.log("convertAsJson", convertAsJson);
      setValidationTrigger(true);

      // let nxtFollowupDateValidate;
      // let followUpStatusIdValidate;

      // if (leadStatus == 4 || leadStatus == 5) {
      //   nxtFollowupDateValidate = "";
      //   followUpStatusIdValidate = "";
      // } else {
      //   nxtFollowupDateValidate = selectValidator(nxtFollowupDate);
      //   followUpStatusIdValidate = selectValidator(followUpStatusId);
      // }

      // if (
      //   (leadStatus == 1 || leadStatus == 2 || leadStatus == 3) &&
      //   followUpStatusId == 6
      // ) {
      //   followUpStatusIdValidate =
      //     " cannot be Others when lead status is High, Medium, or Low";
      // }
      const nameValidate = nameValidator(name);
      let emailValidate = emailValidator(email);
      let mobileValidate = mobileValidator(mobile, mobileCountry);
      let whatsAppValidate = mobileValidator(whatsApp, whatsAppCountry);
      const countryValidate = selectValidator(countryId);
      const stateValidate = selectValidator(stateId);
      const cityValidate = selectValidator(areaId);
      const primaryCourseValidate = selectValidator(primaryCourse);
      const primaryFeesValidate = selectValidator(primaryFees);
      const leadSourceValidate = selectValidator(leadSource);
      const leadSubSourceValidate =
        leadSource == 2 || leadSource == 3
          ? ""
          : selectValidator(leadSubSource);
      const leadStatusValidate = selectValidator(leadStatus);
      const regionIdValidate = selectValidator(regionId);
      const branchValidate = selectValidator(branch);
      const batchTrackValidate = selectValidator(batchTrack);
      const communicationStatusValidate = updateLeadItem
        ? ""
        : selectValidator(communicationStatus);
      const contactModeValidate = updateLeadItem
        ? ""
        : selectValidator(contactMode);
      const nxtFollowupDateValidate =
        contactMode == 6 ||
        followUpStatusId == 2 ||
        followUpStatusId == null ||
        followUpStatusId == ""
          ? ""
          : selectValidator(nxtFollowupDate);
      const followUpStatusIdValidate =
        contactMode == 6 || followUpStatusId == 2
          ? ""
          : selectValidator(followUpStatusId);
      const commentsValidate = addressValidator(comments);

      if (email && emailAndMobileValidation.email == 0) {
        emailValidate = " is already exist";
      }
      if (mobile && emailAndMobileValidation.mobile == 0) {
        mobileValidate = " is already exist";
      }
      if (whatsApp && emailAndMobileValidation.whatsApp == 0) {
        whatsAppValidate = " is already exist";
      }
      console.log("emailValidate", emailValidate);
      // if (
      //   nameValidate ||
      //   emailValidate ||
      //   mobileValidate ||
      //   whatsAppValidate ||
      //   countryValidate ||
      //   stateValidate ||
      //   cityValidate
      // ) {
      //   const container = document.getElementById("leadform_basicinfo_heading");
      //   container.scrollIntoView({
      //     behavior: "smooth",
      //   });
      // }
      setNameError(nameValidate);
      setEmailError(emailValidate);
      setMobileError(mobileValidate);
      setWhatsAppError(whatsAppValidate);
      setCountryError(countryValidate);
      setStateError(stateValidate);
      setAreaError(cityValidate);
      setPrimaryCourseError(primaryCourseValidate);
      setPrimaryFeesError(primaryFeesValidate);
      setLeadSourceError(leadSourceValidate);
      setLeadSubSourceError(leadSubSourceValidate);
      setLeadStatusError(leadStatusValidate);
      setCommunicationStatusError(communicationStatusValidate);
      setContactModeError(contactModeValidate);
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
        leadSourceValidate ||
        leadSubSourceValidate ||
        leadStatusValidate ||
        communicationStatusValidate ||
        contactModeValidate ||
        nxtFollowupDateValidate ||
        followUpStatusIdValidate ||
        regionIdValidate ||
        branchValidate ||
        batchTrackValidate ||
        commentsValidate
      ) {
        console.log({
          nameValidate,
          emailValidate,
          mobileValidate,
          whatsAppValidate,
          countryValidate,
          stateValidate,
          cityValidate,
          primaryCourseValidate,
          primaryFeesValidate,
          leadSourceValidate,
          leadStatusValidate,
          communicationStatusValidate,
          contactModeValidate,
          nxtFollowupDateValidate,
          followUpStatusIdValidate,
          regionIdValidate,
          branchValidate,
          batchTrackValidate,
          commentsValidate,
        });

        return;
      }
      //-----------------
      if (saveType === "Save Only") {
        setSaveOnlyLoading(true);
      } else {
        setButtonLoading(true);
      }

      const today = new Date();

      const getArea = areaOptions.find((f) => f.id == areaId);

      const payload = {
        ...(updateLeadItem && { lead_id: updateLeadItem.id }),
        user_id: leadOwner,
        assigned_executive_id: assignExecutiveId,
        assigned_manager_id: assignedManager ? assignedManager : null,
        name: name,
        phone_code: mobileCountryCode,
        phone: mobile,
        whatsapp_phone_code: whatsAppCountryCode,
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
        preferred_mode: preferredMode,
        preferred_batch: batchTrack,
        counsel: counsel,
        domain_origin:
          updateLeadItem && updateLeadItem.domain_origin
            ? updateLeadItem.domain_origin
            : liveLeadItem && liveLeadItem.domain_origin
              ? liveLeadItem.domain_origin
              : "Direct",
        lead_type_id: leadSource,
        lead_status_id: leadStatus,
        lead_sub_source: leadSubSource,
        referral_name: referralName,
        lead_action_id: followUpStatusId,
        is_today_followup: addTodayFollowup
          ? formatToBackendIST(new Date())
          : null,
        // ...(updateLeadItem && {
        //   is_previous_junk:
        //     isPreviousJunk && leadStatus != 4 && leadStatus != 5,
        // }),
        is_previous_junk: false,
        communication_status: communicationStatus,
        contact_mode: contactMode,
        interest_rate: 1,
        next_follow_up_date: nxtFollowupDate
          ? formatToBackendIST(nxtFollowupDate)
          : null,
        next_follow_up_time: nextFollowupTime
          ? formatToBackendIST(nextFollowupTime)
          : null,
        lead_score: 50,
        expected_join_date: expectDateJoin
          ? formatToBackendIST(expectDateJoin)
          : null,
        region_id: regionId,
        branch_id: branch,
        batch_track_id: batchTrack,
        comments: comments,
        ...(isReAssign && isReAssign == true
          ? { is_reentry: true }
          : { is_reentry: false }),
        created_date: formatToBackendIST(today),
        is_manager: permissions.includes("Add Lead With Existing Mobile Number")
          ? true
          : false,
      };

      console.log("add leadd payload", payload);
      if (updateLeadItem) {
        //---------------lead update--------------
        try {
          await updateLead(payload);
          CommonMessage("success", "Lead updated");
          setTimeout(() => {
            formReset();
            callgetLeadsApi(false, saveType);
          }, 300);
        } catch (error) {
          console.log("lead create error", error);
          setButtonLoading(false);
          setSaveOnlyLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      } else if (isReAssign) {
        //---------------lead re-assign--------------
        const today = new Date();
        const reEntryPayload = {
          lead_ids: [updateLeadItem?.id],
          assign_date: formatToBackendIST(today),
          next_follow_up_date: formatToBackendIST(nxtFollowupDate),
          assigned_to: assignExecutiveId,
          updated_by: convertAsJson?.user_id,
        };

        try {
          await leadReEntry(reEntryPayload);
          CommonMessage("success", "Lead Assigned");
          setTimeout(() => {
            formReset();
          }, 300);
        } catch (error) {
          console.log("lead create error", error);
          setButtonLoading(false);
          setSaveOnlyLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      } else {
        //---------------lead cerate--------------
        // if (leadStatus == 4 || leadStatus == 5) {
        //   handleMoveLiveLeadToJunk(saveType);
        //   return;
        // }
        try {
          await createLead(payload);
          CommonMessage("success", "Lead created");
          setTimeout(() => {
            if (saveType === "Save Only") {
              formReset();
            } else {
              formReset(true);
            }
            if (liveLeadItem?.is_assign_lead) {
              console.log("dont call getLeadsApi");
            } else {
              callgetLeadsApi(false, saveType);
            }

            if (liveLeadItem) {
              handleAssignLiveLead();
            }
          }, 300);
        } catch (error) {
          console.log("lead create error", error);
          setButtonLoading(false);
          setSaveOnlyLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      }
    };

    const handleAssignLiveLead = async () => {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      const payload = {
        user_id: convertAsJson?.user_id,
        lead_id: liveLeadItem?.id,
      };

      try {
        await assignLiveLead(payload);
      } catch (error) {
        console.log("assign live lead error", error);
      } finally {
        setTimeout(() => {
          if (
            liveLeadItem.is_assign_lead &&
            liveLeadItem.is_assign_lead == true
          ) {
            handleUpdateLiveLeadStatus();
          }
        }, 300);
      }
    };

    const handleUpdateLiveLeadStatus = async () => {
      const payload = {
        lead_id: liveLeadItem.id,
      };
      try {
        await updateLiveLeadStatus(payload);
        callgetLeadsApi();
      } catch (error) {
        console.log("livelead update status error", error);
      }
    };

    const handleMoveLiveLeadToJunk = async (saveType) => {
      const payload = {
        lead_ids: [liveLeadItem && liveLeadItem.id ? liveLeadItem.id : ""],
        is_junk: true,
        reason: comments,
      };

      try {
        await moveLiveLeadToJunk(payload);
        CommonMessage("success", "Updated");
        setTimeout(() => {
          if (saveType === "Save Only") {
            formReset();
          } else {
            formReset(true);
          }
          callgetLeadsApi(true);
        }, 300);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const releaseLead = async () => {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      const payload = {
        user_id: convertAsJson?.user_id,
        lead_id: liveLeadItem?.id,
        is_assigned: false,
      };
      try {
        await assignLiveLead(payload);
      } catch (error) {
        console.log("assign live lead error", error);
      } finally {
        setButtonLoading(false);
        setSaveOnlyLoading(false);
      }
    };

    const formReset = (dontCloseAddDrawer) => {
      if (updateLeadItem) {
        navigate("/leads/lead-manager", { state: "open leads" });
      }
      setValidationTrigger(false);
      setName("");
      setNameError("");
      setEmail("");
      setDuplicateEmail("");
      setEmailError("");
      setMobileCountry("in");
      setMobileCountryCode("");
      setWhatsAppCountry("in");
      setWhatsAppCountryCode("");
      setMobile("");
      setDuplicateMobile("");
      setMobileError("");
      setWhatsApp("");
      setDuplicateWhatsApp("");
      setWhatsAppError("");
      setEmailAndMobileValidation({
        email: 0,
        mobile: 0,
        whatsApp: 0,
      });
      setCountryId("IN");
      const stateList = State.getStatesOfCountry("IN");
      const updateSates = stateList.map((s) => {
        return { ...s, id: s.isoCode };
      });
      setCountryError("");
      setStateOptions(updateSates);
      setStateId("TN");
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
      setLeadSource(null);
      setLeadSourceError("");
      setLeadStatus(null);
      setLeadStatusError("");
      setNxtFollowupDate(null);
      setNxtFollowupDateError("");
      setCommunicationStatus(null);
      setCommunicationStatusError("");
      setContactMode(null);
      setContactModeError("");
      // setAssignExecutiveId("");
      // setAssignExecutiveError("");
      setExpectDateJoin(null);
      setRegionId(null);
      setRegionError("");
      setBranch("");
      setBranchError("");
      setBatchTrack(1);
      setBatchTrackError("");
      setComments("");
      setCommentsError("");
      setLeadSubSource(null);
      setLeadSubSourceError("");
      setReferralName("");
      setPreferredMode(null);
      setPreferredBatch(1);
      setCounsel(null);
      setLeadScore(null);
      setNextFollowupTime(null);
      setAddTodayFollowup(false);
      setFollowUpStatusId("");
      setInterestRate(1);
      if (liveLeadItem) {
        releaseLead();
      }
      setButtonLoading(false);
      setSaveOnlyLoading(false);
    };

    const SectionHeader = ({ title }) => {
      const parts = title.split(". ");
      const number = parts[0];
      const text = parts.slice(1).join(". ");

      const StatusTimelineItem = ({ status, color, isSmall, isLast, icon }) => (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: isLast ? "0" : "18px",
            position: "relative",
          }}
        >
          {!isLast && (
            <div
              style={{
                position: "absolute",
                left: "9px",
                top: "22px",
                bottom: "-20px",
                width: "2px",
                borderLeft: "2px dotted #cbd5e1",
                zIndex: 0,
              }}
            ></div>
          )}
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: color,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
              transform: isSmall ? "scale(0.4)" : "none",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              boxShadow: "0 0 0 4px #fff",
            }}
          >
            {icon}
          </div>
          <div
            style={{
              marginLeft: "14px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#1e293b",
              paddingTop: "1px",
              letterSpacing: "0.2px",
            }}
          >
            {status}
          </div>
        </div>
      );

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#2563eb",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            {number}
          </div>
          <span
            style={{
              color: "#1e40af",
              fontWeight: 600,
              fontSize: "14px",
              letterSpacing: "0.2px",
            }}
          >
            {text || number}
          </span>
        </div>
      );
    };

    const ReadOnlyField = ({ label, value }) => (
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#475569",
            marginBottom: "6px",
            fontWeight: 500,
          }}
        >
          {label}
        </label>
        <div
          style={{
            padding: "0 12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#64748b",
            minHeight: "36px",
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
          }}
        >
          {value}
        </div>
      </div>
    );

    const cardStyle = {
      background: "#fff",
      padding: "16px 12px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      boxShadow: "rgba(0, 0, 0, 0.04) 0px 1px 3px",
      marginBottom: "14px",
    };

    const StatusTimelineItem = ({ status, color, isSmall, isLast, icon }) => (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginBottom: isLast ? "0" : "8px",
          position: "relative",
        }}
      >
        {!isLast && (
          <div
            style={{
              position: "absolute",
              left: "8px",
              top: "20px",
              bottom: "-10px",
              width: "2px",
              borderLeft: "2px dotted #cbd5e1",
              zIndex: 0,
            }}
          ></div>
        )}
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: color,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
            transform: isSmall ? "scale(0.4)" : "none",
            color: "#fff",
            fontSize: "10px",
            fontWeight: "bold",
            boxShadow: "0 0 0 4px #fff",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            marginLeft: "12px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#1e293b",
            paddingTop: "2px",
            letterSpacing: "0.2px",
          }}
        >
          {status}
        </div>
      </div>
    );

    return (
      <div
        style={{
          minHeight: "100%",
          padding: "24px",
          fontFamily: "'Inter', sans-serif",
          margin: "-24px",
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            background: "#fff",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "rgba(0, 0, 0, 0.04) 0px 1px 3px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {updateLeadItem ? "Update Lead" : "Add New Lead"}
            </h2>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "11px",
                marginTop: "4px",
              }}
            >
              Capture new student lead details
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button
              onClick={() => formReset()}
              style={{
                borderRadius: "6px",
                fontWeight: 500,
                borderColor: "#cbd5e1",
                color: "#334155",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit("Save Only")}
              loading={saveOnlyLoading}
              style={{
                borderRadius: "6px",
                fontWeight: 500,
                border: "1px solid #2563eb",
                color: "#2563eb",
                height: "33px",
              }}
            >
              {isReAssign
                ? "Re-Assign"
                : updateLeadItem
                  ? "Update Lead"
                  : "Save & Add Another"}
            </Button>
            {/* <Button
              type="primary"
              onClick={() => handleSubmit("Save And Add New")}
              loading={buttonLoading}
              style={{
                backgroundColor: "#2563eb",
                borderRadius: "6px",
                fontWeight: 500,
                border: "none",
                height: "33px",
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
              }}
            >
              {isReAssign
                ? "Re-Assign"
                : updateLeadItem
                  ? "Update Lead"
                  : "Save Lead"}
            </Button> */}
          </div>
        </div>

        <Row gutter={8}>
          {/* Column 1 */}
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={{ flex: "25%" }}
            xxl={{ flex: "25%" }}
          >
            <div
              style={{
                ...cardStyle,
                ...(isReAssign
                  ? {
                      background: "#eff6ff",
                      pointerEvents: "none",
                      opacity: 0.8,
                    }
                  : {}),
              }}
            >
              <SectionHeader title="1. Basic Information (Mandatory)" />
              <Row gutter={16}>
                <Col span={24}>
                  <ReadOnlyField
                    label="Lead Date & Time"
                    value={moment().format("DD MMM YYYY hh:mm A")}
                  />
                </Col>
              </Row>
              <div style={{ marginBottom: "26px" }}>
                <CommonInputField
                  label="Candidate Name"
                  required={true}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationTrigger)
                      setNameError(nameValidator(e.target.value));
                  }}
                  error={nameError}
                  height={"35px"}
                  fontSize={"13px"}
                  labelFontSize={"12px"}
                  errorFontSize={"9px"}
                />
              </div>
              <div style={{ marginBottom: "26px" }}>
                <PhoneWithCountry
                  label="Mobile Number"
                  onChange={handleMobileNumber}
                  selectedCountry={mobileCountry}
                  countryCode={(code) => setMobileCountryCode(code)}
                  onCountryChange={(iso2) => {
                    setMobileCountry(iso2);
                  }}
                  value={mobile}
                  error={mobileError}
                  errorFontSize={"9px"}
                  height={"34px"}
                  labelFontSize={"12px"}
                  countrySelectPadding={"6px 0px 8px 8px"}
                  countryFlagSize={20}
                />
              </div>
              <div style={{ marginBottom: "26px" }}>
                <PhoneWithCountry
                  label="WhatsApp Number"
                  onChange={handleWhatsAppNumber}
                  selectedCountry={whatsAppCountry}
                  countryCode={(code) => setWhatsAppCountryCode(code)}
                  onCountryChange={(iso2) => {
                    setWhatsAppCountry(iso2);
                  }}
                  value={whatsApp}
                  error={whatsAppError}
                  errorFontSize={"9px"}
                  height={"34px"}
                  labelFontSize={"12px"}
                  countrySelectPadding={"6px 0px 8px 8px"}
                  countryFlagSize={20}
                />
              </div>
              <div style={{ marginBottom: "26px" }}>
                <CommonInputField
                  label="Email"
                  required={true}
                  value={email}
                  onChange={handleEmail}
                  error={emailError}
                  height={"35px"}
                  fontSize={"13px"}
                  labelFontSize={"12px"}
                  errorFontSize={"9px"}
                />
              </div>
              <Row gutter={12} style={{ marginBottom: "22px" }}>
                <Col span={12}>
                  <CommonSelectField
                    label="Country"
                    required={true}
                    onChange={handleCountry}
                    options={countryOptions}
                    value={countryId}
                    error={countryError}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                  />
                </Col>
                <Col span={12}>
                  <CommonSelectField
                    label="State"
                    value={stateId}
                    onChange={handleState}
                    options={stateOptions}
                    error={stateError}
                    required={true}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                  />
                </Col>
              </Row>
              <div style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
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
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      errorFontSize={"9px"}
                      labelMarginTop={"-0.4px"}
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
              </div>
            </div>
          </Col>

          {/* Column 2 */}
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={{ flex: "21%" }}
            xxl={{ flex: "21%" }}
          >
            <div
              style={{
                ...cardStyle,
                ...(isReAssign
                  ? {
                      background: "#eff6ff",
                      pointerEvents: "none",
                      opacity: 0.8,
                    }
                  : {}),
              }}
            >
              <SectionHeader title="2. Lead Source" />
              <div style={{ marginBottom: "24px" }}>
                <CommonSelectField
                  label="Lead Source"
                  required={true}
                  value={leadSource}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLeadSource(value);
                    if (value == 2 || value == 3) {
                      setLeadSubSourceOptions([]);
                      setLeadSubSource(null);
                      setLeadSubSourceError("");
                    } else {
                      getLeadSubSourceData(value);
                    }
                    if (validationTrigger) {
                      setLeadSourceError(selectValidator(value));
                    }
                  }}
                  options={leadTypeOptions}
                  error={leadSourceError}
                  height={"35px"}
                  fontSize={"13px"}
                  labelFontSize={"12px"}
                  errorFontSize={"9px"}
                  labelMarginTop={"-0.4px"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <CommonSelectField
                  label="Lead Sub Source"
                  onChange={(e) => {
                    setLeadSubSource(e.target.value);
                    if (validationTrigger) {
                      setLeadSubSourceError(selectValidator(e.target.value));
                    }
                  }}
                  options={leadSubSourceOptions?.map((item) => ({
                    id: item.sub_category_id,
                    name: item.sub_category,
                  }))}
                  value={leadSubSource}
                  error={leadSubSourceError}
                  disabled={leadSource == 2 || leadSource == 3}
                  height={"35px"}
                  fontSize={"13px"}
                  labelFontSize={"12px"}
                  errorFontSize={"9px"}
                  labelMarginTop={"-0.4px"}
                />
              </div>
              <div style={{ marginBottom: "0px" }}>
                <CommonInputField
                  label="Referral Name"
                  value={referralName}
                  onChange={(e) => setReferralName(e.target.value)}
                  placeholder="Enter referral name"
                  height={"35px"}
                  fontSize={"13px"}
                  labelFontSize={"12px"}
                  errorFontSize={"9px"}
                />
              </div>
            </div>

            <div
              style={{
                ...cardStyle,
                ...(isReAssign
                  ? {
                      background: "#eff6ff",
                      pointerEvents: "none",
                      opacity: 0.8,
                    }
                  : {}),
              }}
            >
              <SectionHeader title="3. Course Requirement" />
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <CommonSelectField
                      label="Primary Course"
                      value={primaryCourse}
                      onChange={(e) => {
                        setPrimaryCourse(e.target.value);
                        if (validationTrigger) {
                          setPrimaryCourseError(
                            selectValidator(e.target.value),
                          );
                        }
                      }}
                      options={courseOptions}
                      error={primaryCourseError}
                      required={true}
                      borderRightNone={true}
                      onFocus={() => setIsPrimaryCourseFocused(true)}
                      onBlur={() => setIsPrimaryCourseFocused(false)}
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      errorFontSize={"9px"}
                      labelMarginTop={"-0.4px"}
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
              </div>

              <div style={{ marginBottom: "24px" }}>
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
                  height={"35px"}
                  fontSize={"13px"}
                  labelFontSize={"12px"}
                  errorFontSize={"9px"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <CommonSelectField
                  label="Preferred Mode"
                  value={preferredMode}
                  onChange={(e) => setPreferredMode(e.target.value)}
                  options={[
                    { id: 1, name: "Online" },
                    { id: 2, name: "Classroom" },
                  ]}
                  error={""}
                  height={"35px"}
                  fontSize={"13px"}
                  labelFontSize={"12px"}
                  errorFontSize={"9px"}
                  labelMarginTop={"0px"}
                />
              </div>

              <div style={{ marginBottom: "6px" }}>
                <CommonSelectField
                  label="Preferred Batch"
                  onChange={(e) => {
                    setPreferredBatch(e.target.value);
                  }}
                  options={[
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
                  ]}
                  value={preferredBatch}
                  height={"35px"}
                  fontSize={"13px"}
                  labelFontSize={"12px"}
                  errorFontSize={"9px"}
                  labelMarginTop={"0px"}
                />
              </div>
            </div>
          </Col>

          {/* Column 3 */}
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={{ flex: "29%" }}
            xxl={{ flex: "29%" }}
          >
            <div
              style={{
                ...cardStyle,
                ...(isReAssign
                  ? {
                      background: "#eff6ff",
                      pointerEvents: "none",
                      opacity: 0.8,
                    }
                  : {}),
              }}
            >
              <SectionHeader title="4. Screening" />
              {updateLeadItem ? (
                ""
              ) : (
                <Row gutter={6} style={{ marginBottom: "24px" }}>
                  <Col span={12}>
                    <CommonSelectField
                      label="Communication"
                      required={true}
                      value={communicationStatus}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCommunicationStatus(value);
                        setContactMode(null);
                        setLeadStatus(null);
                        setFollowUpStatusId(null);
                        setNxtFollowupDate(null);
                        setNextFollowupTime(null);
                        setAddTodayFollowup(false);
                        setExpectDateJoin(null);
                        if (validationTrigger) {
                          setCommunicationStatusError(selectValidator(value));
                          setContactModeError(selectValidator(null));
                          setLeadStatusError(selectValidator(null));
                        }
                      }}
                      options={communicationStatusOptions}
                      error={communicationStatusError}
                      disabled={updateLeadItem}
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      errorFontSize={"7px"}
                      labelMarginTop={"0px"}
                    />
                  </Col>
                  <Col span={12}>
                    <CommonSelectField
                      label={communicationStatus == 2 ? "Reason" : "Mode"}
                      required={true}
                      options={
                        communicationStatus == 2
                          ? [
                              {
                                id: 5,
                                name: "Data Correct But No Response",
                              },
                              { id: 6, name: "Data Incorrect" },
                            ]
                          : [
                              { id: 1, name: "Phone Call" },
                              { id: 2, name: "WhatsApp" },
                              { id: 3, name: "SMS" },
                              { id: 4, name: "Email" },
                            ]
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setContactMode(value);
                        if (value == 5) {
                          setComments(comments == "Junk" ? "" : comments);
                          setLeadStatus(1);
                          setFollowUpStatusId(1);
                        } else if (value == 6) {
                          setLeadStatus(4);
                          setNxtFollowupDate(null);
                          setNxtFollowupDateError("");
                          setNextFollowupTime(null);
                          setCounsel("Not Given");
                          setComments("Junk");
                          setCommentsError("");
                          setExpectDateJoin(null);
                          setLeadStatusError("");
                        } else {
                          setComments(comments == "Junk" ? "" : comments);
                        }
                        if (validationTrigger) {
                          setContactModeError(selectValidator(value));
                        }
                      }}
                      value={contactMode}
                      error={contactModeError}
                      disabled={updateLeadItem}
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      errorFontSize={"9px"}
                      labelMarginTop={"0px"}
                    />
                  </Col>
                </Row>
              )}
              <Row gutter={6} style={{ marginBottom: "24px" }}>
                <Col span={12}>
                  <CommonSelectField
                    label="Counsel"
                    value={counsel}
                    onChange={(e) => setCounsel(e.target.value)}
                    options={[
                      { id: "Given", name: "Given" },
                      { id: "Not Given", name: "Not Given" },
                    ]}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                    labelMarginTop={"0px"}
                  />
                </Col>
                <Col span={12}>
                  <CommonSelectField
                    label="Lead Temperature"
                    options={
                      contactMode == 6
                        ? [
                            { id: 5, name: "Super Hot", color: "#dc2626" },
                            { id: 1, name: "Hot", color: "#f97316" },
                            { id: 2, name: "Warm", color: "#eab308" },
                            { id: 3, name: "Cold", color: "#3b82f6" },
                            {
                              id: 6,
                              name: "Not Interested",
                              color: "#991b1b",
                            },
                            { id: 4, name: "Dormant", color: "#6b7280" },
                          ]
                        : [
                            { id: 5, name: "Super Hot", color: "#dc2626" },
                            { id: 1, name: "Hot", color: "#f97316" },
                            { id: 2, name: "Warm", color: "#eab308" },
                            { id: 3, name: "Cold", color: "#3b82f6" },
                            {
                              id: 6,
                              name: "Not Interested",
                              color: "#991b1b",
                            },
                          ]
                    }
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: option.color || "gray",
                            }}
                          ></span>
                          <span>{option.name}</span>
                        </div>
                      </li>
                    )}
                    onChange={(e) => {
                      setLeadStatus(e.target.value);
                      setFollowUpStatusId(1);
                      if (validationTrigger) {
                        setLeadStatusError(selectValidator(e.target.value));
                      }
                    }}
                    value={leadStatus}
                    error={leadStatusError}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"7px"}
                    labelMarginTop={"0px"}
                    disabled={contactMode == 5 || contactMode == 6}
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: "0px" }}>
                <Col span={24}>
                  <CommonMuiDatePicker
                    label="Expected Date Join"
                    required={false}
                    onChange={(value) => {
                      console.log("vallll", value);
                      setExpectDateJoin(value);
                    }}
                    value={expectDateJoin}
                    error=""
                    disablePreviousDates={true}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    labelMarginTop={"0.5px"}
                    iconSize={"16px"}
                  />
                </Col>
                {/* <Col span={12}>
                      <CommonInputField
                        label="Lead Score"
                        value={""}
                        error={""}
                        height={"36px"}
                        labelFontSize={"13px"}
                        disabled={true}
                      />
                    </Col> */}
              </Row>
            </div>

            {updateLeadItem ? (
              <div style={cardStyle}>
                <SectionHeader title="5. Assignment" />
                <Row gutter={12} style={{ marginBottom: "24px" }}>
                  <Col span={12}>
                    <CommonSelectField
                      label="Region"
                      required={true}
                      onChange={(e) => {
                        setRegionId(e.target.value);
                        getBranchesData(e.target.value);
                        if (validationTrigger) {
                          setRegionError(selectValidator(e.target.value));
                        }
                      }}
                      options={regionOptions}
                      value={regionId}
                      error={regionError}
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      errorFontSize={"9px"}
                      labelMarginTop={"0px"}
                      disabled={isReAssign}
                    />
                  </Col>
                  <Col span={12}>
                    <CommonSelectField
                      label="Branch"
                      required={true}
                      value={branch}
                      onChange={(e) => {
                        setBranch(e.target.value);
                        if (validationTrigger) {
                          setBranchError(selectValidator(e.target.value));
                        }
                      }}
                      options={branchOptions}
                      error={branchError}
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      errorFontSize={"9px"}
                      labelMarginTop={"0px"}
                      disabled={isReAssign}
                    />
                  </Col>
                </Row>
                <div style={{ marginBottom: "20px" }}>
                  <CommonSelectField
                    label="Assigned Executive"
                    required={true}
                    value={assignExecutiveId}
                    onChange={(e) => {
                      setAssignExecutiveId(e.target.value);
                      getSaleManagers(e.target.value);
                    }}
                    options={saleUsers}
                    error={assignExecutiveError}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    disabled={!permissions.includes("Assign Lead")}
                  />
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Assigned Manager"
                    required={true}
                    value={assignedManager}
                    options={managersList}
                    error={""}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    disabled={true}
                  />
                </div>
                <div style={{ marginBottom: "0px" }}>
                  <CommonSelectField
                    label="Lead Owner"
                    required={true}
                    value={leadOwner}
                    options={saleUsers}
                    error={""}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    disabled={true}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  ...cardStyle,
                  ...(contactMode == 6
                    ? {
                        background: "#eff6ff",
                        pointerEvents: "none",
                        opacity: 0.8,
                      }
                    : {}),
                }}
              >
                <SectionHeader title="6. Follow-Up Planning" />
                {/* <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Follow-up Type"
                    required={true}
                    value={followUpStatusId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFollowUpStatusId(value);
                      setFollowUpStatusIdError(selectValidator(value));
                      if (value == 2) {
                        setNxtFollowupDate(null);
                        setNxtFollowupDateError("");
                        setNextFollowupTime(null);
                      }
                    }}
                    options={[
                      {
                        id: 1,
                        name: "Highly Interested",
                        color: "#16a34a",
                      },
                      { id: 8, name: "Interested", color: "#22c55e" },
                      { id: 7, name: "Need Follow-up", color: "#f97316" },
                      { id: 10, name: "Call Back Later", color: "#eab308" },
                      { id: 9, name: "Only Enquiry", color: "#6b7280" },
                      { id: 11, name: "No Response", color: "#dc2626" },
                      {
                        id: 3,
                        name: "Service Not Availabe",
                        color: "#4b5563",
                      },
                      { id: 5, name: "Not Interested", color: "#991b1b" },
                      // { id: 2, name: "Lead Lost", color: "#111827" },
                    ]}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: option.color || "gray",
                            }}
                          ></span>
                          <span>{option.name}</span>
                        </div>
                      </li>
                    )}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                    error={followUpStatusIdError}
                    disabled={
                      contactMode == 5 ||
                      contactMode == 6 ||
                      updateLeadItem ||
                      leadStatus
                    }
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <CommonNxtFollowupDatePicker
                    label="Next Follow-up Date"
                    required={true}
                    value={nxtFollowupDate}
                    onChange={(val) => {
                      setNxtFollowupDate(val);
                      setNxtFollowupDateError(selectValidator(val));
                    }}
                    followUpStatus={parseInt(followUpStatusId)}
                    error={nxtFollowupDateError}
                    height={"36px"}
                    labelMarginTop={"1px"}
                    disabled={
                      contactMode == 6 ||
                      followUpStatusId == null ||
                      followUpStatusId == "" ||
                      followUpStatusId == 2 ||
                      updateLeadItem
                    }
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <CommonMuiDateTimePicker
                    label="Next Follow-up Time"
                    required={false}
                    value={nextFollowupTime}
                    onChange={(val) => setNextFollowupTime(val)}
                    error={""}
                    onlyTime={true}
                    height={"36px"}
                    labelMarginTop={"1px"}
                    disabled={
                      contactMode == 6 ||
                      followUpStatusId == null ||
                      followUpStatusId == "" ||
                      followUpStatusId == 2 ||
                      updateLeadItem
                    }
                  />
                </div> */}

                {/* {followUpStatusId && (
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontWeight: "500" }}>Interest Rating</p>
                        <Rate
                          style={{ marginTop: "6px", fontSize: "22px" }}
                          value={interestRate}
                          onChange={setInterestRate}
                        />
                      </div>
                    )} */}

                <div style={{ marginBottom: "16px" }}>
                  <Checkbox
                    checked={addTodayFollowup}
                    onChange={(e) => setAddTodayFollowup(e.target.checked)}
                    disabled={contactMode == 6}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      Add to today's follow-up list
                    </span>
                  </Checkbox>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <CommonTextArea
                    label={"Remarks"}
                    placeholder="Enter remarks..."
                    value={comments}
                    onChange={(e) => {
                      setComments(e.target.value);
                      if (validationTrigger) {
                        setCommentsError(addressValidator(e.target.value));
                      }
                    }}
                    error={commentsError}
                    disabled={contactMode == 6}
                  />
                </div>
              </div>
            )}
          </Col>

          {/* Right Sidebar (Status Flow & Score Criteria) */}
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={24}
            xl={{ flex: "25%" }}
            xxl={{ flex: "25%" }}
          >
            {/* <div
              style={{
                background: "#eff6ff",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #bfdbfe",
                marginBottom: "24px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px 0",
                  color: "#1e3a8a",
                  fontWeight: 600,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    background: "#3b82f6",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                  }}
                >
                  i
                </span>
                Note for Executive
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#1e3a8a",
                  lineHeight: "1.6",
                }}
              >
                Please fill mandatory fields (*) to create a lead. You can
                update remaining details during counselling.
              </p>
            </div> */}
            {updateLeadItem ? (
              ""
            ) : (
              <div style={cardStyle}>
                <SectionHeader title="5. Assignment" />
                <Row gutter={12} style={{ marginBottom: "24px" }}>
                  <Col span={12}>
                    <CommonSelectField
                      label="Region"
                      required={true}
                      onChange={(e) => {
                        setRegionId(e.target.value);
                        getBranchesData(e.target.value);
                        if (validationTrigger) {
                          setRegionError(selectValidator(e.target.value));
                        }
                      }}
                      options={regionOptions}
                      value={regionId}
                      error={regionError}
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      errorFontSize={"9px"}
                      labelMarginTop={"0px"}
                      disabled={isReAssign}
                    />
                  </Col>
                  <Col span={12}>
                    <CommonSelectField
                      label="Branch"
                      required={true}
                      value={branch}
                      onChange={(e) => {
                        setBranch(e.target.value);
                        if (validationTrigger) {
                          setBranchError(selectValidator(e.target.value));
                        }
                      }}
                      options={branchOptions}
                      error={branchError}
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      errorFontSize={"9px"}
                      labelMarginTop={"0px"}
                      disabled={isReAssign}
                    />
                  </Col>
                </Row>
                <div style={{ marginBottom: "20px" }}>
                  <CommonSelectField
                    label="Assigned Executive"
                    required={true}
                    value={assignExecutiveId}
                    onChange={(e) => {
                      setAssignExecutiveId(e.target.value);
                      getSaleManagers(e.target.value);
                    }}
                    options={saleUsers}
                    error={assignExecutiveError}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    disabled={!permissions.includes("Assign Lead")}
                  />
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Assigned Manager"
                    required={true}
                    value={assignedManager}
                    options={managersList}
                    error={""}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    disabled={true}
                  />
                </div>
                <div style={{ marginBottom: "0px" }}>
                  <CommonSelectField
                    label="Lead Owner"
                    required={true}
                    value={leadOwner}
                    options={saleUsers}
                    error={""}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    disabled={true}
                  />
                </div>
              </div>
            )}
            <div
              style={{
                ...cardStyle,
                background: "#f8fafc",
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                Lead Status Flow
              </div>
              <div>
                <StatusTimelineItem
                  status="New Lead"
                  color="#2563eb"
                  icon={<span style={{ fontSize: "11px" }}>A</span>}
                />
                <StatusTimelineItem
                  status="Validated"
                  color="#2563eb"
                  isSmall={true}
                />
                <StatusTimelineItem
                  status="Contacted"
                  color="#0d9488"
                  icon={<span style={{ fontSize: "11px" }}>A</span>}
                />
                <StatusTimelineItem
                  status="Interested"
                  color="#ef4444"
                  icon={<span style={{ fontSize: "11px" }}>B</span>}
                />
                <StatusTimelineItem
                  status="Counselling"
                  color="#ef4444"
                  icon={<span style={{ fontSize: "11px" }}>A</span>}
                />
                <StatusTimelineItem
                  status="Demo Attended"
                  color="#f97316"
                  icon={<span style={{ fontSize: "11px" }}>A</span>}
                />
                <StatusTimelineItem
                  status="Fee Discussion"
                  color="#f59e0b"
                  icon={<span style={{ fontSize: "11px" }}>Y</span>}
                />
                <StatusTimelineItem
                  status="Sales Ready"
                  color="#eab308"
                  icon={<span style={{ fontSize: "11px" }}>A</span>}
                />
                <StatusTimelineItem
                  status="Joined"
                  color="#22c55e"
                  icon={<MdCheck size={13} />}
                />
                <StatusTimelineItem
                  status="Payment Collected"
                  color="#16a34a"
                  icon={<MdPerson size={13} />}
                  isLast={true}
                />
              </div>
            </div>

            <div style={{ ...cardStyle, padding: "0" }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  borderRadius: "9px 9px 0 0",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                Score Criteria (Max 100)
              </div>
              <div style={{ padding: "16px" }}>
                <table
                  style={{
                    width: "100%",
                    fontSize: "13px",
                    borderCollapse: "collapse",
                    color: "#334155",
                  }}
                >
                  <tbody>
                    <tr style={{ borderBottom: "1px dashed #e2e8f0" }}>
                      <td style={{ padding: "10px 0", fontWeight: 500 }}>
                        Contact Connected
                      </td>
                      <td
                        align="right"
                        style={{ fontWeight: 600, color: "#2563eb" }}
                      >
                        +10
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px dashed #e2e8f0" }}>
                      <td style={{ padding: "10px 0", fontWeight: 500 }}>
                        Interested
                      </td>
                      <td
                        align="right"
                        style={{ fontWeight: 600, color: "#2563eb" }}
                      >
                        +20
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px dashed #e2e8f0" }}>
                      <td style={{ padding: "10px 0", fontWeight: 500 }}>
                        Demo Attended
                      </td>
                      <td
                        align="right"
                        style={{ fontWeight: 600, color: "#2563eb" }}
                      >
                        +20
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px dashed #e2e8f0" }}>
                      <td style={{ padding: "10px 0", fontWeight: 500 }}>
                        Budget Available
                      </td>
                      <td
                        align="right"
                        style={{ fontWeight: 600, color: "#2563eb" }}
                      >
                        +20
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "10px 0", fontWeight: 500 }}>
                        Joining Within 30 Days
                      </td>
                      <td
                        align="right"
                        style={{ fontWeight: 600, color: "#2563eb" }}
                      >
                        +30
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "12px 0",
                          fontWeight: "700",
                          color: "#0f172a",
                        }}
                      >
                        Total Score
                      </td>
                      <td
                        align="right"
                        style={{
                          padding: "12px 0",
                          fontWeight: "700",
                          color: "#0f172a",
                        }}
                      >
                        100
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Col>
        </Row>

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
  },
);
export default AddNewLead;
