import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Tooltip, Checkbox, Modal, Button, Rate } from "antd";
import { useNavigate } from "react-router-dom";
import { Country, State } from "country-state-city";
import { MdAdd, MdPerson, MdCheck } from "react-icons/md";
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
  getBranchManagers,
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
      allUsersList,
      allBranchesData,
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
    const [buttonLoading, setButtonLoading] = useState(false);
    //course and area options
    const courseOptions = useSelector((state) => state.courselist);
    const areaOptions = useSelector((state) => state.arealist);

    //permissions
    const permissions = useSelector((state) => state.userpermissions);

    const [loginUserId, setLogInUserId] = useState("");
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
    const [counsel, setCounsel] = useState("Not Given");
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
    const [leadTemperature, setLeadTemperature] = useState(null);
    const [leadTemperatureError, setLeadTemperatureError] = useState(null);
    const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
    const [nxtFollowupDateError, setNxtFollowupDateError] = useState("");
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
    const [followUpStatusIdError, setFollowUpStatusIdError] = useState("");
    const [expectDateJoin, setExpectDateJoin] = useState(null);

    const [regionId, setRegionId] = useState(null);
    const [regionError, setRegionError] = useState("");
    const [branchOptions, setBranchOptions] = useState([]);
    const [defaultBranch, setDefaultBranch] = useState("");
    const [hasSetAssignmentDefaults, setHasSetAssignmentDefaults] =
      useState(false);
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
    const [contactMode, setContactMode] = useState(null);
    const [contactModeError, setContactModeError] = useState("");
    const [responseStatus, setResponseStatus] = useState(null);
    const [responseStatusError, setResponseStatusError] = useState(null);
    const [interestRate, setInterestRate] = useState(5);
    const [comments, setComments] = useState("");
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
    const [regionManagerId, setRegionManagerId] = useState(null);
    const [branchManagerId, setBranchManagerId] = useState(null);
    const [leadOwner, setLeadOwner] = useState("Auto Assigned");
    //junk handle
    const [isPreviousJunk, setIsPreviousJunk] = useState(false);

    // Action bar scroll animation
    const [showActionBar, setShowActionBar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
      const handleScroll = (e) => {
        const currentScrollY = e.target.scrollTop || window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 20) {
          setShowActionBar(true);
        } else if (currentScrollY < lastScrollY) {
          setShowActionBar(false);
        }
        setLastScrollY(currentScrollY);
      };

      const drawerBody = document.querySelector(".ant-drawer-body");
      if (drawerBody) {
        drawerBody.addEventListener("scroll", handleScroll, { passive: true });
        return () => drawerBody.removeEventListener("scroll", handleScroll);
      } else {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
      }
    }, [lastScrollY]);

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
      setLogInUserId(convertAsJson?.user_id);
      setAssignExecutiveId(convertAsJson?.user_id);

      if (updateLeadItem || liveLeadItem) {
        if (!updateLeadItem) {
          setRegionId(
            convertAsJson?.user_id?.startsWith("CHN")
              ? 1
              : convertAsJson?.user_id?.startsWith("BNG")
                ? 2
                : convertAsJson?.user_id?.startsWith("HUB") ||
                    convertAsJson?.user_id?.startsWith("DEV")
                  ? 3
                  : null,
          );
        }
        setLeadOwner(convertAsJson?.user_id);
        if (allUsersList.length >= 1) {
          findUserBranch(null);
        }
      }
      fetchLeadDetails();
    }, [allUsersList]);

    useEffect(() => {
      if (!updateLeadItem && !liveLeadItem && !hasSetAssignmentDefaults) {
        if (
          name ||
          email ||
          mobile ||
          whatsApp ||
          leadSource ||
          primaryCourse ||
          branch
        ) {
          const getLoginUserDetails = localStorage.getItem("loginUserDetails");
          const convertAsJson = JSON.parse(getLoginUserDetails);

          setAssignExecutiveId(convertAsJson?.user_id);
          setLeadOwner(convertAsJson?.user_id);
          setRegionId(
            convertAsJson?.user_id?.startsWith("CHN")
              ? 1
              : convertAsJson?.user_id?.startsWith("BNG")
                ? 2
                : convertAsJson?.user_id?.startsWith("HUB") ||
                    convertAsJson?.user_id?.startsWith("DEV")
                  ? 3
                  : null,
          );
          setRegionError("");
          if (!branch && allUsersList.length >= 1) {
            findUserBranch(null);
          }

          setHasSetAssignmentDefaults(true);
        }
      }
    }, [
      name,
      email,
      mobile,
      whatsApp,
      leadSource,
      primaryCourse,
      branch,
      allUsersList,
      hasSetAssignmentDefaults,
      updateLeadItem,
      liveLeadItem,
    ]);

    const fetchLeadDetails = async () => {
      if (updateLeadItem) {
        console.log("updateLeadItem", updateLeadItem);
        // setTimeout(() => {
        //   const drawerBody = document.querySelector(
        //     "#leadform_addlead_drawer .ant-drawer-body",
        //   );
        //   if (drawerBody) {
        //     drawerBody.scrollTo({
        //       top: 0,
        //       behavior: "smooth",
        //     });
        //   }
        // }, 300);

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
        if (isReAssign) {
          getSaleUsersData();
        }
        // getSaleManagers(updateLeadItem?.lead_assigned_to_id);
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
        setPreferredMode(updateLeadItem?.preferred_mode);
        setLeadSource(updateLeadItem.lead_type_id);
        getLeadSubSourceData(updateLeadItem.lead_type_id);
        setLeadSubSource(updateLeadItem?.lead_sub_source);
        setLeadTemperature(updateLeadItem.lead_status_id);

        if (isReAssign) {
          setNxtFollowupDate(new Date());
          setFollowUpStatusId(1);
        } else {
          setNxtFollowupDate(updateLeadItem.next_follow_up_date);
          setFollowUpStatusId(updateLeadItem?.lead_action_id);
        }
        setCommunicationStatus(updateLeadItem?.communication_status);
        setContactMode(updateLeadItem?.contact_mode);
        setCounsel(updateLeadItem?.counsel);
        setExpectDateJoin(updateLeadItem.expected_join_date);
        setRegionId(updateLeadItem.region_id);
        // getBranchesData(updateLeadItem.region_id);
        setBranch(updateLeadItem.branch_id);
        setBatchTrack(updateLeadItem.batch_track_id);
        setInterestRate(updateLeadItem?.interest_rate || 5);
        setComments(updateLeadItem.comments);
      } else if (liveLeadItem) {
        // --------------------live lead item-----------------------
        // setTimeout(() => {
        //   const drawerBody = document.querySelector(
        //     "#leadform_addlead_drawer .ant-drawer-body",
        //   );
        //   if (drawerBody) {
        //     drawerBody.scrollTo({
        //       top: 0,
        //       behavior: "smooth",
        //     });
        //   }
        // }, 300);
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

    const findUserBranch = async () => {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      const findUser = allUsersList.find(
        (f) => f.user_id == convertAsJson?.user_id,
      );

      console.log("findUser", findUser);

      if (findUser) {
        setBranch(findUser?.branch_id);
        setDefaultBranch(findUser?.branch_id);
        getBranchManagersData(findUser?.branch_id);
        return;
      }
    };

    const getBranchManagersData = async (branchId) => {
      const payload = {
        branch_id: branchId,
      };
      if (!branchId) {
        setRegionManagerId(null);
        setBranchManagerId(null);
        return;
      }
      try {
        const response = await getBranchManagers(payload);
        console.log("get branch managers response", response);

        const branch_data = response?.data?.data[0];
        console.log("branch_data", branch_data);

        if (branch_data) {
          setRegionManagerId(branch_data?.regional_manager_id);

          if (branch_data?.regional_manager_id?.startsWith("HUB")) {
            setBranchManagerId(null);
          } else {
            setBranchManagerId(branch_data?.branch_manager_id);
          }
        }
      } catch (error) {
        console.log("get branch managers error", error);
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

    const getSaleUsersData = async () => {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      const payload = {
        role: "SALE",
      };

      try {
        const response = await getUsersByRole(payload);

        const users = response?.data?.data?.data || [];

        // Get first 3 letters from logged-in user_id
        const loggedPrefix = convertAsJson?.user_id
          ?.substring(0, 3)
          ?.toUpperCase();

        // Filter users whose user_id starts with same 3 letters
        const filteredUsers = loggedPrefix
          ? users.filter((item) =>
              item?.user_id?.toUpperCase()?.startsWith(loggedPrefix),
            )
          : users;

        console.log("filtered sale users", filteredUsers);

        setSaleUsers(filteredUsers);
      } catch (error) {
        setSaleUsers([]);
        console.log("get sale users error", error);
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
      console.log(branch, defaultBranch, "checkkk");
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setValidationTrigger(true);

      const nameValidate = nameValidator(name);
      let emailValidate = emailValidator(email);
      let mobileValidate = mobileValidator(mobile, mobileCountry);
      let whatsAppValidate = mobileValidator(whatsApp, whatsAppCountry);
      const countryValidate = selectValidator(countryId);
      const stateValidate = selectValidator(stateId);
      const cityValidate = selectValidator(areaId);
      // const leadSourceValidate = selectValidator(leadSource);
      const leadSubSourceValidate =
        leadSource == null ||
        leadSource == "" ||
        leadSource == 2 ||
        leadSource == 3 ||
        leadSource == 6
          ? ""
          : selectValidator(leadSubSource);
      const regionIdValidate = selectValidator(regionId);
      const branchValidate = selectValidator(branch);
      const batchTrackValidate = selectValidator(batchTrack);
      const contactModeValidate = communicationStatus
        ? selectValidator(contactMode)
        : "";
      const responseStatusValidate = communicationStatus
        ? selectValidator(responseStatus)
        : "";
      const leadTemperatureValidate = communicationStatus
        ? selectValidator(leadTemperature)
        : "";
      const followUpStatusIdValidate =
        communicationStatus == 1
          ? leadTemperature == 6
            ? ""
            : selectValidator(followUpStatusId)
          : communicationStatus && communicationStatus != 2
            ? selectValidator(followUpStatusId)
            : "";
      const nxtFollowupDateValidate =
        leadTemperature == 6
          ? ""
          : communicationStatus && contactMode != 6
            ? selectValidator(nxtFollowupDate)
            : "";
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
      // setLeadSourceError(leadSourceValidate);
      setLeadSubSourceError(leadSubSourceValidate);
      setContactModeError(contactModeValidate);
      setResponseStatusError(responseStatusValidate);
      setLeadTemperatureError(leadTemperatureValidate);
      setFollowUpStatusIdError(followUpStatusIdValidate);
      setNxtFollowupDateError(nxtFollowupDateValidate);
      setRegionError(regionIdValidate);
      setBranchError(branchValidate);
      setBatchTrackError(batchTrackValidate);

      if (
        nameValidate ||
        emailValidate ||
        mobileValidate ||
        whatsAppValidate ||
        countryValidate ||
        stateValidate ||
        cityValidate ||
        leadSubSourceValidate ||
        contactModeValidate ||
        responseStatusValidate ||
        leadTemperatureValidate ||
        followUpStatusIdValidate ||
        nxtFollowupDateValidate ||
        regionIdValidate ||
        branchValidate ||
        batchTrackValidate
      ) {
        console.log({
          nameValidate,
          emailValidate,
          mobileValidate,
          whatsAppValidate,
          countryValidate,
          stateValidate,
          cityValidate,
          leadSubSourceValidate,
          contactModeValidate,
          responseStatusValidate,
          leadTemperatureValidate,
          followUpStatusIdValidate,
          nxtFollowupDateValidate,
          regionIdValidate,
          branchValidate,
          batchTrackValidate,
        });

        setTimeout(() => {
          const errorElements = Array.from(
            document.querySelectorAll(
              ".Mui-error input, .Mui-error .MuiSelect-select, .Mui-error textarea, .common_singledatepicker_error input, .commontextarea_error, .common_antdmultiselectfield_error input",
            ),
          );

          const firstErrorElement = errorElements.find((el) => {
            if (el.type === "hidden") return false;
            if (el.tabIndex < 0 && !el.classList.contains("MuiSelect-select"))
              return false;
            if (el.classList.contains("MuiSelect-nativeInput")) return false;
            if (
              el.classList.contains("MuiSelect-select") &&
              el.closest(".MuiInputAdornment-root")
            ) {
              return false;
            }
            return true;
          });

          if (firstErrorElement) {
            firstErrorElement.focus();
            firstErrorElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);

        return;
      }
      console.log("success");
      // return;
      //-----------------
      setButtonLoading(true);

      const today = new Date();

      const getArea = areaOptions.find((f) => f.id == areaId);

      const payload = {
        ...(updateLeadItem && { lead_id: updateLeadItem.id }),
        user_id: leadOwner,
        assigned_executive_id: assignExecutiveId,
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
        primary_fees: primaryFees ? primaryFees : 0,
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
        lead_status_id: leadTemperature,
        lead_sub_source: leadSubSource,
        referral_name: referralName,
        lead_action_id: followUpStatusId,
        is_today_followup: addTodayFollowup
          ? formatToBackendIST(new Date())
          : null,
        // ...(updateLeadItem && {
        //   is_previous_junk:
        //     isPreviousJunk && leadTemperature != 4 && leadTemperature != 5,
        // }),
        is_previous_junk: false,
        communication_status: communicationStatus ? communicationStatus : null,
        contact_mode: contactMode ? contactMode : null,
        response_status: responseStatus,
        interest_rate: interestRate,
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
        updated_date: formatToBackendIST(today),
        updated_by: convertAsJson?.user_id,
        is_manager: permissions.includes("Add Lead With Existing Mobile Number")
          ? true
          : false,
        assigned_manager_id: regionManagerId,
        branch_manager_id: branchManagerId,
        consigned_id: defaultBranch == branch ? null : leadOwner,
        assigned_to: defaultBranch == branch ? leadOwner : null,
        assigned_branch_id: branch,
      };

      console.log("add leadd payload", payload);
      if (updateLeadItem && isReAssign == false) {
        //---------------lead update--------------
        try {
          await updateLead(payload);
          CommonMessage("success", "Lead updated");
          setTimeout(() => {
            formReset();
          }, 300);
        } catch (error) {
          console.log("lead create error", error);
          setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      } else if (isReAssign) {
        //---------------lead re-assign--------------
        const isBranchChanged = defaultBranch == branch ? false : true;

        const today = new Date();
        const reEntryPayload = {
          lead_ids: [updateLeadItem?.id],
          assign_date: formatToBackendIST(today),
          next_follow_up_date: formatToBackendIST(nxtFollowupDate),
          next_followup_time: nextFollowupTime
            ? formatToBackendIST(nextFollowupTime)
            : null,
          today_followup_date: addTodayFollowup
            ? formatToBackendIST(new Date())
            : null,
          assigned_to: assignExecutiveId,
          updated_by: convertAsJson?.user_id,
          is_branch_changed: isBranchChanged ? 1 : 0,
          assigned_manager: isBranchChanged ? regionManagerId : null,
          branch_manager_id: isBranchChanged ? branchManagerId : null,
          assigned_branch_id: branch,
        };

        try {
          await leadReEntry(reEntryPayload);
          CommonMessage("success", "Lead Assigned");
          setTimeout(() => {
            formReset(true, true);
          }, 300);
        } catch (error) {
          console.log("lead create error", error);
          setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      } else {
        //---------------lead create--------------
        // if (leadTemperature == 4 || leadTemperature == 5) {
        //   handleMoveLiveLeadToJunk(saveType);
        //   return;
        // }
        try {
          await createLead(payload);
          CommonMessage("success", "Lead created");
          setTimeout(() => {
            formReset(true, defaultBranch == branch ? false : true);
            if (liveLeadItem) {
              handleAssignLiveLead();
            }
          }, 300);
        } catch (error) {
          console.log("lead create error", error);
          setButtonLoading(false);
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
      } catch (error) {
        console.log("livelead update status error", error);
      }
    };

    const formReset = (isSuccess = false, isReAssign = false) => {
      const isCancel = !isSuccess;
      if (updateLeadItem) {
        callgetLeadsApi(false, isCancel, isReAssign);
      } else if (liveLeadItem) {
        callgetLeadsApi(false, isCancel, isReAssign);
      } else if (isSuccess) {
        console.log("form reset", isReAssign);
        callgetLeadsApi(true, isCancel, isReAssign);
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
      setPrimaryFees("");
      setPrimaryFeesError("");
      setIsShowSecondaryCourse(false);
      setSecondaryCourse(null);
      setSecondaryFees("");
      setLeadSource(null);
      setLeadSourceError("");
      setLeadTemperature(null);
      setLeadTemperatureError("");
      setNxtFollowupDate(null);
      setNxtFollowupDateError("");
      setCommunicationStatus(null);
      setContactMode(null);
      setContactModeError("");
      setResponseStatus(null);
      setResponseStatusError("");
      setAssignExecutiveId(loginUserId);
      setBranch("");
      setDefaultBranch("");
      setBranchError("");
      findUserBranch(null);
      // setAssignExecutiveError("");
      setExpectDateJoin(null);
      setRegionId(
        loginUserId?.startsWith("CHN")
          ? 1
          : loginUserId?.startsWith("BNG")
            ? 2
            : loginUserId?.startsWith("HUB") || loginUserId?.startsWith("DEV")
              ? 3
              : null,
      );
      setRegionError("");
      setBatchTrack(1);
      setBatchTrackError("");
      setComments("");
      setLeadSubSource(null);
      setLeadSubSourceError("");
      setReferralName("");
      setPreferredMode(null);
      setPreferredBatch(1);
      setCounsel("Not Given");
      setLeadScore(null);
      setNextFollowupTime(null);
      setAddTodayFollowup(false);
      setFollowUpStatusId("");
      setFollowUpStatusIdError("");
      setInterestRate(5);
      setButtonLoading(false);
    };

    const SectionHeader = ({ title }) => {
      const parts = title.split(". ");
      const number = parts[0];
      const text = parts.slice(1).join(". ");

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div className="addnewlead_card_heading_circleicon">{number}</div>
          <span
            className={
              text.includes("Basic Information")
                ? "addnewlead_basicinfo_card_headings"
                : "addnewlead_card_headings"
            }
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
          marginBottom: isLast ? "0" : "6px",
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
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: color,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
            transform: isSmall ? "scale(0.4)" : "none",
            color: "#fff",
            fontSize: "1px",
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
        {liveLeadItem && (
          <div
            style={{
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "14px",
                  background: "#3b82f6",
                  borderRadius: "4px",
                }}
              ></div>
              <span
                style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}
              >
                Live Lead Details
              </span>
            </div>

            <Row gutter={[16, 8]}>
              {[
                { label: "Name", value: liveLeadItem?.name || "-" },
                { label: "Email", value: liveLeadItem?.email || "-" },
                { label: "Mobile", value: liveLeadItem?.phone || "-" },
                { label: "Location", value: liveLeadItem?.location || "-" },
                { label: "Course", value: liveLeadItem?.course || "-" },
                { label: "Training", value: liveLeadItem?.training || "-" },
                {
                  label: "Comments",
                  value: liveLeadItem?.comments || "-",
                  span: 24,
                },
              ].map((item, index) => (
                <Col xs={24} sm={12} md={item.span || 8} key={index}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        width: "70px",
                        flexShrink: 0,
                      }}
                    >
                      {item.label}:
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#1e293b",
                        fontWeight: 500,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        <Row gutter={8}>
          <Col span={6} style={{ display: "flex" }}>
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
                width: "100%",
              }}
            >
              <SectionHeader title="1. Basic Information (Mandatory)" />
              <div style={{ marginBottom: "26px" }}>
                <CommonInputField
                  label="Lead Date & Time"
                  value={moment().format("DD MMM YYYY hh:mm A")}
                  disabled={true}
                  error={""}
                  height={"35px"}
                  fontSize={"13px"}
                  labelFontSize={"12px"}
                />
              </div>
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
                  disabled={
                    isReAssign
                      ? true
                      : permissions.includes("Edit Lead Mobile Number")
                        ? false
                        : updateLeadItem
                          ? true
                          : false
                  }
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
                  disabled={
                    isReAssign
                      ? true
                      : permissions.includes("Edit Lead Mobile Number")
                        ? false
                        : updateLeadItem
                          ? true
                          : false
                  }
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
              <div style={{ marginBottom: "26px" }}>
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
              </div>
              <div style={{ marginBottom: "26px" }}>
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
              </div>
              <div style={{ marginBottom: "0px" }}>
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
          <Col span={6} style={{ display: "flex" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
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
                  marginBottom: "12px",
                }}
              >
                <SectionHeader title="2. Lead Source" />
                <div style={{ marginBottom: "22px" }}>
                  <CommonSelectField
                    label="Lead Source"
                    required={false}
                    value={leadSource}
                    onChange={(e) => {
                      const value = e.target.value;
                      setLeadSource(value);
                      setLeadSubSource(null);
                      if (value == 2 || value == 3 || value == 6) {
                        setLeadSubSourceOptions([]);
                        setLeadSubSource(null);
                        setLeadSubSourceError("");
                      } else if (value) {
                        getLeadSubSourceData(value);
                        if (validationTrigger) {
                          setLeadSubSourceError(selectValidator(leadSubSource));
                        }
                      } else {
                        setLeadSubSourceError("");
                      }
                    }}
                    options={leadTypeOptions}
                    error={leadSourceError}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                    labelMarginTop={"0px"}
                    disableClearable={false}
                    disabled={liveLeadItem}
                  />
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <CommonSelectField
                    label="Lead Sub Source"
                    required={
                      leadSource == 2 ||
                      leadSource == 3 ||
                      leadSource == null ||
                      leadSource == ""
                        ? false
                        : true
                    }
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
                    disabled={
                      leadSource == 2 || leadSource == 3 || leadSource == 6
                    }
                    disableClearable={false}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                    labelMarginTop={"0px"}
                  />
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <CommonSelectField
                    label="Region"
                    required={false}
                    onChange={(e) => {
                      setRegionId(e.target.value);
                      // getBranchesData(e.target.value);
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
                    disabled={true}
                  />
                </div>

                {leadSource == 6 && (
                  <div style={{ marginBottom: "0px" }}>
                    <CommonInputField
                      label="Referral Name"
                      required={true}
                      value={referralName}
                      onChange={(e) => setReferralName(e.target.value)}
                      placeholder="Enter referral name"
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      errorFontSize={"9px"}
                    />
                  </div>
                )}
              </div>

              <div
                style={{
                  ...cardStyle,
                  flex: 1,
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
                <div style={{ marginBottom: "21px" }}>
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
                        }}
                        options={courseOptions}
                        error={""}
                        required={false}
                        borderRightNone={true}
                        onFocus={() => setIsPrimaryCourseFocused(true)}
                        onBlur={() => setIsPrimaryCourseFocused(false)}
                        height={"35px"}
                        fontSize={"13px"}
                        labelFontSize={"12px"}
                        errorFontSize={"9px"}
                        labelMarginTop={"-0.4px"}
                        disableClearable={false}
                      />
                    </div>

                    <div
                      className={
                        isPrimaryCourseFocused
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

                <div style={{ marginBottom: "21px" }}>
                  <CommonInputField
                    label="Fees"
                    required={false}
                    value={primaryFees}
                    type={"number"}
                    onChange={(e) => {
                      setPrimaryFees(e.target.value);
                    }}
                    error={""}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                  />
                </div>

                <div style={{ marginBottom: "22px" }}>
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

                <div style={{ marginBottom: "0px" }}>
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
            </div>
          </Col>
          <Col span={6}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  ...(isReAssign ||
                  (updateLeadItem?.completed_followup_count != null &&
                    updateLeadItem?.completed_followup_count !== 0)
                    ? {
                        background: "#eff6ff",
                        pointerEvents: "none",
                        opacity: 0.8,
                      }
                    : {}),
                  flex: 1,
                }}
              >
                <SectionHeader title="4. Screening" />
                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Communication"
                    required={false}
                    value={communicationStatus}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCommunicationStatus(value);
                      setContactMode(null);
                      setResponseStatus(null);
                      setResponseStatusError("");
                      setCounsel("Not Given");
                      setLeadTemperature(null);
                      setLeadTemperatureError("");
                      setFollowUpStatusId(null);
                      setFollowUpStatusIdError("");
                      setNxtFollowupDate(null);
                      setNextFollowupTime(null);
                      setAddTodayFollowup(false);
                      setExpectDateJoin(null);
                      if (value && validationTrigger) {
                        setContactModeError(selectValidator(null));
                        setResponseStatusError(selectValidator(null));
                        setLeadTemperatureError(selectValidator(null));
                        setFollowUpStatusIdError(selectValidator(null));
                        setNxtFollowupDateError(selectValidator(null));
                      } else {
                        setContactModeError("");
                        setResponseStatusError("");
                        setNxtFollowupDateError("");
                      }
                    }}
                    options={communicationStatusOptions}
                    error={""}
                    disabled={
                      updateLeadItem?.completed_followup_count != null &&
                      updateLeadItem?.completed_followup_count !== 0
                    }
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"7.7px"}
                    labelMarginTop={"0px"}
                    disableClearable={false}
                  />
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label={communicationStatus == 2 ? "Reason" : "Mode"}
                    required={communicationStatus ? true : false}
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
                            { id: 7, name: "Direct" },
                          ]
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setContactMode(value);
                      if (value == 5) {
                        setComments(comments == "Junk" ? "" : comments);
                        setLeadTemperature(1);
                        setLeadTemperatureError("");
                        setFollowUpStatusId(1);
                        setFollowUpStatusIdError("");
                        setCounsel("Not Given");
                        setResponseStatus("Not-Received");
                        setResponseStatusError("");
                      } else if (value == 6) {
                        setLeadTemperature(4);
                        setLeadTemperatureError("");
                        setFollowUpStatusId(null);
                        setFollowUpStatusIdError("");
                        setNxtFollowupDate(null);
                        setNxtFollowupDateError("");
                        setNextFollowupTime(null);
                        setCounsel("Not Given");
                        setResponseStatus("Not-Received");
                        setResponseStatusError("");
                        setComments("Junk");
                        setExpectDateJoin(null);
                      } else {
                        setComments(comments == "Junk" ? "" : comments);
                      }
                      if (validationTrigger) {
                        setContactModeError(selectValidator(value));
                      }
                    }}
                    value={contactMode}
                    error={contactModeError}
                    disabled={
                      updateLeadItem?.completed_followup_count != null &&
                      updateLeadItem?.completed_followup_count !== 0
                    }
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                    labelMarginTop={"0px"}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Response Status"
                    required={communicationStatus ? true : false}
                    value={responseStatus}
                    onChange={(e) => {
                      const value = e.target.value;
                      setResponseStatus(value);
                      if (value == "Not-Received") {
                        setCounsel("Not Given");
                      }
                      setResponseStatusError(selectValidator(value));
                    }}
                    options={[
                      { id: "Received", name: "Received" },
                      { id: "Not-Received", name: "Not-Received" },
                    ]}
                    error={responseStatusError}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                    labelMarginTop={"0px"}
                    disabled={contactMode == 5 || contactMode == 6}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Counsel"
                    required={true}
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
                    disabled={
                      contactMode == 5 ||
                      contactMode == 6 ||
                      responseStatus == "Not-Received"
                    }
                  />
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Lead Temp."
                    required={true}
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
                      const value = e.target.value;
                      setLeadTemperature(e.target.value);
                      if (value == 6) {
                        setFollowUpStatusId(null);
                        setFollowUpStatusIdError("");
                        setNxtFollowupDate(null);
                        setNxtFollowupDateError("");
                        setNextFollowupTime(null);
                        setAddTodayFollowup(false);
                      }
                      if (validationTrigger) {
                        setLeadTemperatureError(
                          selectValidator(e.target.value),
                        );
                      }
                    }}
                    value={leadTemperature}
                    error={leadTemperatureError}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                    labelMarginTop={"0px"}
                    disabled={contactMode == 5 || contactMode == 6}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <CommonMuiDatePicker
                    label="Expected Join Date"
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
                    disabled={contactMode == 6}
                  />
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <CommonInputField
                    label="Lead Score"
                    value={""}
                    error={""}
                    height={"36px"}
                    labelFontSize={"13px"}
                    disabled={true}
                  />
                </div>
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
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  ...(updateLeadItem && isReAssign == false
                    ? {
                        background: "#eff6ff",
                        pointerEvents: "none",
                        opacity: 0.8,
                      }
                    : {}),
                  flex: 1,
                }}
              >
                <SectionHeader title="5. Assignment" />
                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Assigned Branch"
                    required={false}
                    value={branch}
                    onChange={(e) => {
                      setBranch(e.target.value);
                      setAssignExecutiveId("");
                      setRegionManagerId("");
                      setBranchManagerId("");
                      getBranchManagersData(e.target.value);
                      if (validationTrigger) {
                        setBranchError(selectValidator(e.target.value));
                      }
                    }}
                    options={allBranchesData}
                    error={branchError}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                    labelMarginTop={"0px"}
                    // disabled={true}
                  />
                </div>
                {!regionManagerId?.startsWith("HUB") && (
                  <div style={{ marginBottom: "24px" }}>
                    <CommonSelectField
                      label="Branch Manager"
                      required={false}
                      value={branchManagerId}
                      options={allUsersList}
                      error={""}
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      disabled={true}
                    />
                  </div>
                )}
                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Region Manager"
                    required={false}
                    value={regionManagerId}
                    options={allUsersList}
                    error={""}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    disabled={true}
                  />
                </div>

                {isReAssign && defaultBranch == branch && (
                  <div style={{ marginBottom: "20px" }}>
                    <CommonSelectField
                      label="Assigned Executive"
                      required={false}
                      value={assignExecutiveId}
                      onChange={(e) => {
                        setAssignExecutiveId(e.target.value);
                        // getSaleManagers(e.target.value);
                      }}
                      options={saleUsers}
                      error={""}
                      height={"35px"}
                      fontSize={"13px"}
                      labelFontSize={"12px"}
                      // disabled={
                      //   !permissions.includes("Assign Lead") ||
                      //   (isReAssign == false && updateLeadItem)
                      // }
                    />
                  </div>
                )}

                <div style={{ marginBottom: "0px" }}>
                  <CommonSelectField
                    label="Lead Owner"
                    required={false}
                    value={leadOwner}
                    options={allUsersList}
                    error={""}
                    height={"35px"}
                    fontSize={"13px"}
                    labelFontSize={"12px"}
                    disabled={true}
                  />
                </div>
              </div>

              <div
                style={{
                  ...cardStyle,
                  ...(contactMode == 6 ||
                  leadTemperature == 6 ||
                  (updateLeadItem?.completed_followup_count != null &&
                    updateLeadItem?.completed_followup_count !== 0)
                    ? {
                        background: "#eff6ff",
                        pointerEvents: "none",
                        opacity: 0.8,
                      }
                    : {}),
                  // flex: 1,
                }}
              >
                <SectionHeader title="6. Follow-Up Planning" />
                <div style={{ marginBottom: "24px" }}>
                  <CommonSelectField
                    label="Follow-up Type"
                    required={false}
                    value={followUpStatusId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFollowUpStatusId(value);
                      if (validationTrigger) {
                        setFollowUpStatusIdError(
                          selectValidator(e.target.value),
                        );
                      }
                    }}
                    options={[
                      { id: 5, name: "Sales Ready", color: "#dc2626" },
                      { id: 1, name: "Highly Interested", color: "#f97316" },
                      { id: 8, name: "Interested", color: "#eab308" },
                      { id: 9, name: "Exploring", color: "#3b82f6" },
                      { id: 10, name: "Not Responding", color: "#4b5563" },
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
                    labelMarginTop={"0px"}
                    labelFontSize={"12px"}
                    errorFontSize={"9px"}
                    error={followUpStatusIdError}
                    disabled={
                      communicationStatus == null ||
                      communicationStatus == "" ||
                      contactMode == 5 ||
                      contactMode == 6 ||
                      leadTemperature == 6
                    }
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <CommonNxtFollowupDatePicker
                    label="Next Follow-up Date"
                    required={
                      communicationStatus && contactMode != 6 ? true : false
                    }
                    value={nxtFollowupDate}
                    onChange={(val) => {
                      setNxtFollowupDate(val);
                      setNxtFollowupDateError(selectValidator(val));
                    }}
                    leadTemperature={parseInt(leadTemperature)}
                    error={nxtFollowupDateError}
                    height={"35px"}
                    errorFontSize={"10px"}
                    labelFontSize={"12px"}
                    fontSize={"13px"}
                    labelMarginTop={"0px"}
                    iconSize={"16px"}
                    disabled={
                      contactMode == 6 ||
                      leadTemperature == "" ||
                      leadTemperature == null ||
                      leadTemperature == 6 ||
                      (updateLeadItem?.completed_followup_count != null &&
                        updateLeadItem?.completed_followup_count !== 0 &&
                        isReAssign == false)
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
                    height={"35px"}
                    labelFontSize={"12px"}
                    fontSize={"13px"}
                    labelMarginTop={"0px"}
                    iconSize={"16px"}
                    disabled={
                      contactMode == 6 ||
                      (updateLeadItem && isReAssign == false) ||
                      leadTemperature == 6
                    }
                  />
                </div>

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

                <div
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Checkbox
                    checked={addTodayFollowup}
                    onChange={(e) => setAddTodayFollowup(e.target.checked)}
                    disabled={contactMode == 6}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      Add to today's follow-up list
                    </span>
                  </Checkbox>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={12}>
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <SectionHeader title="7. Remarks" />
                <div
                  style={{
                    marginBottom: "8px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CommonTextArea
                    label={""}
                    textAreaStyle={{
                      height: "100%",
                      resize: "none",
                      flex: 1,
                    }}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    placeholder="Enter remarks..."
                    value={comments}
                    onChange={(e) => {
                      setComments(e.target.value);
                    }}
                    error={""}
                    disabled={contactMode == 6}
                  />
                </div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ ...cardStyle, padding: "0" }}>
              <div
                style={{
                  padding: "6px 16px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  borderRadius: "9px 9px 0 0",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                Score Criteria (Max 100)
              </div>
              <div style={{ padding: "4px 16px" }}>
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
                      <td style={{ padding: "6px 0", fontWeight: 500 }}>
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
                      <td style={{ padding: "6px 0", fontWeight: 500 }}>
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
                      <td style={{ padding: "6px 0", fontWeight: 500 }}>
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
                      <td style={{ padding: "6px 0", fontWeight: 500 }}>
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
                      <td style={{ padding: "6px 0", fontWeight: 500 }}>
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
                          padding: "8px 0",
                          fontWeight: "700",
                          color: "#0f172a",
                        }}
                      >
                        Total Score
                      </td>
                      <td
                        align="right"
                        style={{
                          padding: "8px 0",
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

        <div
          style={{
            position: "sticky",
            bottom: "0",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: "32px",
            padding: "16px 24px",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "16px 16px 0 0",
            borderTop: "1px solid rgba(226, 232, 240, 0.6)",
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.05)",
            gap: "12px",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: showActionBar ? "translateY(0)" : "translateY(-4px)",
            opacity: showActionBar ? 1 : 0.8,
            margin: "0 -24px -24px -24px",
          }}
        >
          <Button
            className="animated-cancel-btn"
            onClick={() => formReset()}
            style={{
              borderRadius: "6px",
              fontWeight: 500,
              borderColor: "#cbd5e1",
              color: "#334155",
              fontSize: "13px",
            }}
          >
            Cancel
          </Button>
          <Button
            className="animated-save-btn"
            onClick={() => handleSubmit("Save Only")}
            loading={buttonLoading}
            style={{
              borderRadius: "6px",
              fontWeight: 500,
              border: "1px solid #2563eb",
              color: "#2563eb",
              height: "33px",
              fontSize: "13px",
            }}
          >
            {isReAssign
              ? "Re-Assign"
              : updateLeadItem
                ? "Update Lead"
                : "Save & Add Another"}
          </Button>
        </div>

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
