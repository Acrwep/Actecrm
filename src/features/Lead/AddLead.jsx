import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Tooltip, Checkbox, Modal, Button } from "antd";
import { Country, State } from "country-state-city";
import { MdAdd } from "react-icons/md";
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
  getTechnologies,
  leadEmailAndMobileValidator,
  moveLiveLeadToJunk,
  updateLead,
} from "../ApiService/action";
import { useDispatch, useSelector } from "react-redux";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { storeAreaList, storeCourseList } from "../Redux/Slice";

const AddLead = forwardRef(
  (
    {
      leadTypeOptions,
      regionOptions,
      updateLeadItem,
      liveLeadItem,
      setIsOpenAddDrawer,
      setButtonLoading,
      setSaveOnlyLoading,
      callgetLeadsApi,
    },
    ref
  ) => {
    const dispatch = useDispatch();
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
      {
        id: 5,
        name: "Not Interested",
      },
    ];
    const [leadStatus, setLeadStatus] = useState(null);
    const [leadStatusError, setLeadStatusError] = useState("");
    const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
    const [nxtFollowupDateError, setNxtFollowupDateError] = useState(null);
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

    //add course usestates
    const [isOpenAddCourseModal, setIsOpenAddCourseModal] = useState(false);
    const [courseName, setCourseName] = useState("");
    const [courseNameError, setCourseNameError] = useState("");
    const [addCourseLoading, setAddCourseLoading] = useState(false);
    //add area usestates
    const [isOpenAddAreaModal, setIsOpenAddAreaModal] = useState(false);
    const [areaName, setAreaName] = useState("");
    const [areaNameError, setAreaNameError] = useState("");

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

      fetchLeadDetails();
    }, []);

    const fetchLeadDetails = async () => {
      if (updateLeadItem) {
        setTimeout(() => {
          const drawerBody = document.querySelector(
            "#leadform_addlead_drawer .ant-drawer-body"
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
        setName(updateLeadItem.name);
        setEmail(updateLeadItem.email);
        setDuplicateEmail(updateLeadItem.email);
        //mobile fetch
        setMobileCountryCode(
          updateLeadItem.phone_code ? updateLeadItem.phone_code : ""
        );
        const selected_mobile_country = getCountryFromDialCode(
          `+${updateLeadItem.phone_code ? updateLeadItem.phone_code : ""}`
        );
        setMobileCountry(selected_mobile_country);
        setMobile(updateLeadItem.phone);
        setDuplicateMobile(updateLeadItem.phone);
        //whatsapp fetch
        setWhatsAppCountryCode(
          updateLeadItem.whatsapp_phone_code
            ? updateLeadItem.whatsapp_phone_code
            : ""
        );
        const selected_whatsapp_country = getCountryFromDialCode(
          `+${
            updateLeadItem.whatsapp_phone_code
              ? updateLeadItem.whatsapp_phone_code
              : ""
          }`
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
          (f) => f.name == updateLeadItem.area_id
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
        setLeadType(updateLeadItem.lead_type_id);
        setLeadStatus(updateLeadItem.lead_status_id);
        setNxtFollowupDate(updateLeadItem.next_follow_up_date);
        setExpectDateJoin(updateLeadItem.expected_join_date);
        setRegionId(updateLeadItem.region_id);
        getBranchesData(updateLeadItem.region_id);
        setBranch(updateLeadItem.branch_id);
        setBatchTrack(updateLeadItem.batch_track_id);
        setComments(updateLeadItem.comments);
      } else if (liveLeadItem) {
        console.log("liveLeadItem", liveLeadItem);
        setName(liveLeadItem.name);
        setEmail(liveLeadItem.email);
        setMobile(liveLeadItem.phone);
        setWhatsApp(liveLeadItem.phone);
        setLeadType(4);
        liveLeadEmailValidator(liveLeadItem.email, liveLeadItem.phone);
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

    const handleMobileNumber = async (value) => {
      const cleanedMobile = value;
      console.log("cleanedMobile", cleanedMobile);
      setMobile(cleanedMobile);
      const mobileValidate = mobileValidator(cleanedMobile);

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

    const handleWhatsAppNumber = async (value) => {
      const cleanedMobile = value;
      setWhatsApp(cleanedMobile);
      const whatsAppValidate = mobileValidator(cleanedMobile);

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

      let nxtFollowupDateValidate;

      if (leadStatus == 4 || leadStatus == 5) {
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
        ...(updateLeadItem && { lead_id: updateLeadItem.id }),
        user_id: convertAsJson?.user_id,
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
        is_manager: permissions.includes("Add Lead With Existing Mobile Number")
          ? true
          : false,
      };

      if (updateLeadItem) {
        try {
          await updateLead(payload);
          CommonMessage("success", "Lead updated");
          setTimeout(() => {
            formReset();
            callgetLeadsApi();
          }, 300);
        } catch (error) {
          console.log("lead create error", error);
          setButtonLoading(false);
          setSaveOnlyLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later"
          );
        }
      } else {
        if (leadStatus == 4 || leadStatus == 5) {
          handleMoveLiveLeadToJunk(saveType);
          return;
        }
        try {
          await createLead(payload);
          CommonMessage("success", "Lead created");
          setTimeout(() => {
            if (saveType === "Save Only") {
              formReset();
            } else {
              formReset(true);
            }
            const container = document.getElementById(
              "leadform_basicinfo_heading"
            );
            container.scrollIntoView({
              behavior: "smooth",
            });
            callgetLeadsApi();
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
              "Something went wrong. Try again later"
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
          const container = document.getElementById(
            "leadform_basicinfo_heading"
          );
          container.scrollIntoView({
            behavior: "smooth",
          });
          callgetLeadsApi(true);
        }, 300);
      } catch (error) {
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
      setComments("");
      setCommentsError("");
      setButtonLoading(false);
      setSaveOnlyLoading(false);
    };

    return (
      <div>
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
            <div style={{ position: "relative" }}>
              <PhoneWithCountry
                label="Mobile Number"
                onChange={handleMobileNumber}
                selectedCountry={mobileCountry}
                countryCode={(code) => {
                  setMobileCountryCode(code);
                }}
                onCountryChange={(iso2) => {
                  setMobileCountry(iso2);
                  setWhatsAppCountry(iso2);
                }}
                value={mobile}
                error={mobileError}
                errorFontSize={mobileError.length >= 10 ? "10px" : "13px"}
                disabled={
                  permissions.includes("Edit Lead Mobile Number")
                    ? false
                    : updateLeadItem
                    ? true
                    : false
                }
                disableCountrySelect={
                  permissions.includes("Edit Lead Mobile Number")
                    ? false
                    : updateLeadItem
                    ? true
                    : false
                }
              />
            </div>
          </Col>
          <Col span={8}>
            <PhoneWithCountry
              label="WhatsApp Number"
              onChange={handleWhatsAppNumber}
              countryCode={(code) => {
                setWhatsAppCountryCode(code);
              }}
              selectedCountry={whatsAppCountry}
              value={whatsApp}
              error={whatsAppError}
              onCountryChange={(iso2) => {
                setWhatsAppCountry(iso2);
              }}
              errorFontSize={whatsAppError.length >= 10 ? "9.5px" : "13px"}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
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

          {regionId == 3 ? (
            ""
          ) : (
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
          )}

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

          {leadStatus == 4 || leadStatus == 5 ? (
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
                  disabled={updateLeadItem ? true : false}
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
                  error=""
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
);

export default AddLead;
