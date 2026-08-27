import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Upload, Modal, Tabs, Skeleton } from "antd";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import {
  addressValidator,
  calculateAmount,
  emailValidator,
  formatToBackendIST,
  getCountryFromDialCode,
  mobileValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import { PlusOutlined } from "@ant-design/icons";
import "./styles.css";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import {
  getAllAreas,
  getAllBranches,
  getBatches,
  getBatchTrack,
  getBranches,
  getCustomerById,
  getCustomersPaymentHistory,
  getRegions,
  getTechnologies,
  getTrainingMode,
  getUsersByRole,
  paymentMasterUpdate,
  updateCustomer,
  inserCustomerTrack,
} from "../ApiService/action";
import { Country, State } from "country-state-city";
import { CommonMessage } from "../Common/CommonMessage";
import { useSelector } from "react-redux";
import PhoneWithCountry from "../Common/PhoneWithCountry";

const CustomerUpdate = forwardRef(
  (
    {
      callgetCustomersApi,
      setUpdateDrawerTabKey,
      customerId,
      setCustomerId,
      setCustomerDetails,
      setUpdateButtonLoading,
      setIsOpenEditDrawer,
    },
    ref,
  ) => {
    //permissions
    const permissions = useSelector((state) => state.userpermissions);

    const [activeKey, setActiveKey] = useState("1");
    const [profilePictureArray, setProfilePictureArray] = useState([]);
    const [profilePictureBase64, setProfilePictureBase64] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [raUsers, setRaUsers] = useState([]);
    const [selectedRA, setSelectedRA] = useState(null);
    const [modeOfClass, setModeOfClass] = useState("");
    const [modeOfClassError, setModeOfClassError] = useState("");
    const [placeOfService, setPlaceOfService] = useState("");
    const [placeOfServiceError, setPlaceOfServiceError] = useState("");
    const [allBranchesData, setAllBranchesData] = useState([]);
    const [leadId, setLeadId] = useState(null);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [mobileCountryCode, setMobileCountryCode] = useState("");
    const [mobileCountry, setMobileCountry] = useState("in");
    const [mobile, setMobile] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [whatsAppCountry, setWhatsAppCountry] = useState("in");
    const [whatsAppCountryCode, setWhatsAppCountryCode] = useState("");
    const [whatsApp, setWhatsApp] = useState("");
    const [whatsAppError, setWhatsAppError] = useState("");

    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [gender, setGender] = useState(null);
    const [dateOfJoining, setDateOfJoining] = useState("");
    const [countryOptions, setCountryOptions] = useState([]);
    const [countryId, setCountryId] = useState(null);
    const [countryIdError, setCountryIdError] = useState("");
    const [stateOptions, setStateOptions] = useState([]);
    const [stateId, setStateId] = useState(null);
    const [stateIdError, setStateIdError] = useState("");
    const [areaOptions, setAreaOptions] = useState([]);
    const [areaId, setAreaId] = useState(null);
    const [areaIdError, setAreaIdError] = useState("");

    //course details usestates
    const [courseOptions, setCourseOptions] = useState([]);
    const [course, setCourse] = useState(null);
    const [courseError, setCourseError] = useState("");
    const [regionOptions, setRegionOptions] = useState([]);
    const [regionId, setRegionId] = useState(null);
    const [regionError, setRegionError] = useState("");
    const [preferredBatchOptions, setPreferredBatchOptions] = useState([]);
    const [preferredBatch, setPreferredBatch] = useState(null);
    const [preferredBatchError, setPreferredBatchError] = useState("");
    const [batchTimingOptions, setBatchTimingOptions] = useState([]);
    const [batchTiming, setBatchTiming] = useState(null);
    const [batchTimingError, setBatchTimingError] = useState("");
    const [currentLocation, setCurrentLocation] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [placementSupport, setPlacementSupport] = useState(null);
    const [placementSupportError, setPlacementSupportError] = useState(null);
    const [server, setServer] = useState("");
    const [branchOptions, setBranchOptions] = useState([]);
    const [branchId, setBranchId] = useState(null);
    const [branchIdError, setBranchIdError] = useState("");

    const [signatureBase64, setSignatureBase64] = useState("");
    const [loading, setLoading] = useState(true);
    const [validationTrigger, setValidationTrigger] = useState(false);
    const [callCustomerApi, setCallCustomerApi] = useState(false);
    const [originalCustomerDetails, setOriginalCustomerDetails] =
      useState(null);

    //payment master usestaes
    const [paymentFullDetails, setPaymentFullDetails] = useState(null);
    const [subTotal, setSubTotal] = useState();
    const [subTotalError, setSubTotalError] = useState("");
    const [taxType, setTaxType] = useState("");
    const [taxTypeError, setTaxTypeError] = useState("");
    const [amount, setAmount] = useState();
    const [discountAmount, setDiscountAmount] = useState("");
    const [paymentValidationTrigger, setPaymentValidationTrigger] =
      useState(false);

    useEffect(() => {
      setActiveKey("1");
      setUpdateDrawerTabKey("1");
      if (callCustomerApi && customerId != null) {
        setUpdateDrawerTabKey("1");
        setActiveKey("1");
        setLoading(true);
        getCustomerData(customerId);
      }
    }, [customerId]);

    useEffect(() => {
      getTechnologiesData();
    }, []);

    const getTechnologiesData = async () => {
      try {
        const response = await getTechnologies();
        setCourseOptions(response?.data?.data || []);
      } catch (error) {
        setCourseOptions([]);
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
        setPreferredBatchOptions(response?.data?.result || []);
      } catch (error) {
        setPreferredBatchOptions([]);
        console.log("response status error", error);
      } finally {
        setTimeout(() => {
          getBatchTimingData();
        }, 300);
      }
    };

    const getAreasData = async () => {
      try {
        const response = await getAllAreas();
        const allArea = response?.data?.data || [];
        setAreaOptions(allArea);
      } catch (error) {
        setAreaOptions([]);
        console.log("response status error", error);
      } finally {
        setTimeout(() => {
          getBatchTimingData();
        }, 300);
      }
    };

    const getBatchTimingData = async () => {
      try {
        const response = await getBatches();
        console.log("batches response", response);
        setBatchTimingOptions(response?.data?.data || []);
      } catch (error) {
        setBatchTimingOptions([]);
        console.log("batch error", error);
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
          getRaUsers();
        }, 300);
      }
    };

    const getRaUsers = async () => {
      const payload = {
        role: "RA",
      };
      try {
        const response = await getUsersByRole(payload);
        console.log("get ra users response", response);
        setRaUsers(response?.data?.data?.data || []);
      } catch (error) {
        setRaUsers([]);
        console.log("get hr users error", error);
      } finally {
        getAllBranchesData();
      }
    };

    const getAllBranchesData = async () => {
      try {
        const response = await getAllBranches();
        const branchData = response?.data?.result || [];

        const branchOrder = [
          "BDC",
          "Velachery",
          "Anna Nagar",
          "OMR",
          "Porur",
          "Thambaram",
          "Electronic city",
          "BTM Layout",
          "Rajaji Nagar",
          "Marathahalli",
          "Maraimalai Nagar",
          "Hebbal",
        ];

        const sortedBranches = [...branchData].sort(
          (a, b) => branchOrder.indexOf(a.name) - branchOrder.indexOf(b.name),
        );

        setAllBranchesData(sortedBranches);
      } catch (error) {
        setAllBranchesData([]);
        console.log("get all branches error", error);
      } finally {
        getCustomerData();
      }
    };

    const getCustomerData = async () => {
      try {
        const response = await getCustomerById(customerId);
        console.log("customer response", response);
        const customerDetails = response?.data?.data;
        setOriginalCustomerDetails(customerDetails);
        setModeOfClass(customerDetails?.mode_of_class);
        setPlaceOfService(customerDetails?.place_of_service);
        setSelectedRA(customerDetails?.ra_id);
        setLeadId(customerDetails?.lead_id);
        setName(customerDetails.name);
        setEmail(customerDetails.email);
        //mobile fetch
        setMobileCountryCode(
          customerDetails.phonecode ? customerDetails.phonecode : "",
        );
        const selected_mobile_country = getCountryFromDialCode(
          `+${customerDetails.phonecode ? customerDetails.phonecode : ""}`,
        );
        setMobileCountry(selected_mobile_country);
        setMobile(customerDetails.phone);
        //whatsapp fetch
        setWhatsAppCountryCode(
          customerDetails.whatsapp_phone_code
            ? customerDetails.whatsapp_phone_code
            : "",
        );
        const selected_whatsapp_country = getCountryFromDialCode(
          `+${
            customerDetails.whatsapp_phone_code
              ? customerDetails.whatsapp_phone_code
              : ""
          }`,
        );
        setWhatsAppCountry(selected_whatsapp_country);
        setWhatsApp(customerDetails.whatsapp);
        //--------
        setDateOfBirth(customerDetails.date_of_birth);
        setGender(customerDetails.gender);
        setDateOfJoining(customerDetails.date_of_joining);
        const countries = Country.getAllCountries();
        const updateCountries = countries.map((c) => {
          return { ...c, id: c.isoCode };
        });
        setCountryOptions(updateCountries);

        setCountryId(customerDetails.country);
        const stateList = State.getStatesOfCountry(customerDetails.country);
        const updateSates = stateList.map((s) => {
          return { ...s, id: s.isoCode };
        });
        setStateOptions(updateSates);
        setStateId(customerDetails.state);
        //area
        try {
          const response = await getAllAreas();
          const allArea = response?.data?.data || [];
          setAreaOptions(allArea);
          const findArea = allArea.find(
            (f) => f.name === customerDetails.current_location,
          );
          setAreaId(parseInt(findArea.id));
        } catch (error) {
          setAreaOptions([]);
          console.log("area error", error);
        }
        setPreferredBatch(customerDetails?.batch_track_id ?? "");
        setBatchTiming(customerDetails?.batch_timing_id ?? "");
        setBranchId(customerDetails?.branch_id ?? "");
        setCurrentLocation(customerDetails?.place_of_supply ?? "");
        setPinCode(customerDetails?.pincode ?? "");
        setCustomerAddress(customerDetails?.address ?? "");
        setGstNumber(customerDetails?.gst_number ?? "");
        setPlacementSupport(customerDetails.placement_support);
        setServer(
          customerDetails.is_server_required === 1 ? "Need" : "Not Need",
        );
        setCourse(customerDetails.enrolled_course);
        if (customerDetails.profile_image) {
          setProfilePictureArray([
            {
              uid: "-1",
              name: "profile.jpg",
              status: "done",
              url: customerDetails.profile_image, // Base64 string directly usable
            },
          ]);
        } else {
          setProfilePictureArray([]);
        }
        setProfilePictureBase64(customerDetails.profile_image);
        setSignatureBase64(customerDetails.signature_image);
        setRegionId(customerDetails.region_id);
        getBranchesData(customerDetails, true);
        getPaymentHistoryData(customerDetails);
      } catch (error) {
        console.log("getcustomer by id error", error);
      } finally {
        setTimeout(() => {
          // setLoading(false);
          setCallCustomerApi(true);
        }, 200);
      }
    };

    const getPaymentHistoryData = async (customerDetails) => {
      try {
        const response = await getCustomersPaymentHistory(
          customerDetails?.lead_id,
        );
        console.log("particular customer payment history", response);
        const payment_full_details = response?.data?.data || null;
        const payment_history = response?.data?.data?.payment_trans || [];

        setPaymentFullDetails(payment_full_details);
        //payment usestaes
        setSubTotal(parseFloat(customerDetails.primary_fees));
        setTaxType(
          payment_full_details?.tax_type.includes("18%") ? "18%" : "0%",
        );
        setAmount(
          (parseFloat(payment_full_details?.total_amount) || 0) +
            (parseFloat(payment_full_details?.discount_amount) || 0),
        );
        setDiscountAmount(payment_full_details?.discount_amount || "");
      } catch (error) {
        setPaymentFullDetails(null);
        console.log("particular customer payment history error", error);
      } finally {
        setLoading(false);
      }
    };

    const getBranchesData = async (customerfulldetails, initialset) => {
      console.log("customerfulldetails", customerfulldetails);

      const payload = {
        region_id:
          typeof customerfulldetails === "number"
            ? customerfulldetails
            : customerfulldetails.region_id,
      };
      try {
        const response = await getBranches(payload);
        setBranchOptions(response?.data?.result || []);
        if (initialset === true) {
          setBranchId(customerfulldetails.branch_id);
        }
      } catch (error) {
        setBranchOptions([]);
        console.log("response status error", error);
      }
    };

    useImperativeHandle(ref, () => ({
      handleCustomerUpdate,
      handlePaymentUpdate,
      formReset,
    }));

    //onchange function
    const handleProfileAttachment = ({ fileList: newFileList }) => {
      console.log("newww", newFileList);

      if (newFileList.length <= 0) {
        setProfilePictureArray([]);
        setProfilePictureBase64("");
        return;
      }

      const file = newFileList[0].originFileObj; // actual File object

      // ✅ Check file type
      const isValidType =
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg";

      // ✅ Check file size (1MB = 1,048,576 bytes)
      const isValidSize = file.size <= 1024 * 1024;

      if (isValidType && isValidSize) {
        console.log("fileeeee", newFileList);
        setProfilePictureArray(newFileList);
        CommonMessage("success", "Profile uploaded");

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64String = reader.result; // Extract Base64 content
          setProfilePictureBase64(base64String); // Store in state
        };
      } else {
        if (!isValidType) {
          CommonMessage("error", "Accept only .png");
        } else if (!isValidSize) {
          CommonMessage("error", "File size must be 1MB or less");
        }
        setProfilePictureArray([]);
        setProfilePictureBase64("");
      }
    };

    const handlePreview = async (file) => {
      if (file.url) {
        setPreviewImage(file.url);
        setPreviewOpen(true);
        return;
      }
      setPreviewOpen(true);
      const rawFile = file.originFileObj || file;
      const reader = new FileReader();
      reader.readAsDataURL(rawFile);
      reader.onload = () => {
        const dataUrl = reader.result; // Full base64 data URL like "data:image/jpeg;base64,..."
        console.log("urlllll", dataUrl);
        setPreviewImage(dataUrl); // Show in Modal
        setPreviewOpen(true);
      };
    };

    const handleRemoveProfile = (fileToRemove) => {
      const newFileList = profilePictureArray.filter(
        (file) => file.uid !== fileToRemove.uid,
      );
      setProfilePictureArray(newFileList);
      // CommonToaster("Profile removed");
    };

    const handleCountry = (e) => {
      const value = e.target.value;
      console.log(value, countryOptions);
      setCountryId(value);
      setStateId("");
      const selectedCountry = countryOptions.find((f) => f.id === value);
      console.log("selected country", value, selectedCountry);

      const stateList = State.getStatesOfCountry(selectedCountry.id);
      const updateSates = stateList.map((s) => {
        return { ...s, id: s.isoCode };
      });
      console.log(updateSates, "updateSates");
      setStateOptions(updateSates);
      if (validationTrigger) {
        setCountryIdError(selectValidator(value));
      }
    };

    const handleSubTotal = (e) => {
      const input = e.target.value;

      // Allow numbers, decimal point, or empty string
      if (!/^\d*\.?\d*$/.test(input)) return;

      setSubTotal(input); // store as string for user input

      const value = parseFloat(input); // parse for calculations

      if (paymentValidationTrigger) {
        setSubTotalError(selectValidator(value));
      }
      //handle total amount
      const amnt = calculateAmount(value, taxType === "18%" ? 18 : 0);
      if (isNaN(amnt)) {
        setAmount("");
      } else {
        setAmount(parseFloat(amnt));
      }
    };

    const handleTaxType = (e) => {
      setTaxType(e.target.value);
      if (paymentValidationTrigger) {
        setTaxTypeError(selectValidator(e.target.value));
      }
      const amnt = calculateAmount(
        parseFloat(subTotal),
        e.target.value === "18%" ? 18 : 0,
      );
      if (isNaN(amnt)) {
        setAmount("");
      } else {
        setAmount(parseFloat(amnt));
      }
    };

    const handleCustomerUpdate = async () => {
      if (loading) return;
      setValidationTrigger(true);
      const modeOfClassValidate = selectValidator(modeOfClass);
      const placeOfServiceValidate = selectValidator(placeOfService);
      const nameValidate = nameValidator(name);
      const emailValidate = emailValidator(email);
      const mobileValidate = mobileValidator(mobile);
      const whatsAppValidate = mobileValidator(whatsApp);
      const countryValidate = selectValidator(countryId);
      const stateValidate = selectValidator(stateId);
      const areaValidate = selectValidator(areaId);
      const courseValidate = selectValidator(course);
      const regionIdValidate = selectValidator(regionId);
      const branchIdValidate = selectValidator(branchId);
      const preferredBatchValidate = selectValidator(preferredBatch);
      const batchTimingValidate = selectValidator(batchTiming);
      const placementSupportValidate = selectValidator(placementSupport);

      setModeOfClassError(modeOfClassValidate);
      setPlaceOfServiceError(placeOfServiceValidate);
      setNameError(nameValidate);
      setEmailError(emailValidate);
      setMobileError(mobileValidate);
      setWhatsAppError(whatsAppValidate);
      setCountryIdError(countryValidate);
      setStateIdError(stateValidate);
      setAreaIdError(areaValidate);
      setCourseError(courseValidate);
      setRegionError(regionIdValidate);
      setBranchIdError(branchIdValidate);
      setPreferredBatchError(preferredBatchValidate);
      setBatchTimingError(batchTimingValidate);
      setPlacementSupportError(placementSupportValidate);

      if (
        modeOfClassValidate ||
        placeOfServiceValidate ||
        nameValidate ||
        emailValidate ||
        mobileValidate ||
        whatsAppValidate ||
        countryValidate ||
        stateValidate ||
        areaValidate
      ) {
        setActiveKey("1");
        return;
      }

      if (
        courseValidate ||
        regionIdValidate ||
        branchIdValidate ||
        preferredBatchValidate ||
        batchTimingValidate ||
        placementSupportValidate
      )
        return;

      setUpdateButtonLoading(true);
      const getCustomerArea = areaOptions.find((f) => f.id == areaId);

      const payload = {
        id: customerId,
        ra_id: selectedRA ? selectedRA : null,
        lead_id: leadId,
        name: name,
        email: email,
        phonecode: mobileCountryCode,
        phone: mobile,
        whatsapp_phone_code: whatsAppCountryCode,
        whatsapp: whatsApp,
        date_of_birth: dateOfBirth ? formatToBackendIST(dateOfBirth) : null,
        gender: gender,
        date_of_joining: dateOfJoining
          ? formatToBackendIST(dateOfJoining)
          : null,
        enrolled_course: course,
        region_id: regionId,
        branch_id: branchId,
        batch_track_id: preferredBatch,
        batch_timing_id: batchTiming,
        country: countryId,
        state: stateId,
        area: getCustomerArea.name,
        signature_image: signatureBase64,
        profile_image: profilePictureBase64,
        place_of_supply: "",
        mode_of_class: modeOfClass,
        place_of_service: placeOfService,
        pincode: pinCode,
        address: customerAddress,
        state_code: "",
        gst_number: gstNumber,
        placement_support: placementSupport,
        is_server_required: server == "Need" ? 1 : 0,
      };

      const changedFields = {};
      if (originalCustomerDetails) {
        const getNameFromOptions = (options, val) => {
          if (!options || !Array.isArray(options)) return val;
          const found = options.find((o) => String(o.id) === String(val));
          return found ? found.name || found.course_name || val : val;
        };

        const fieldsToCompare = [
          { key: "ra_id", origKey: "ra_id", options: raUsers },
          { key: "name", origKey: "name" },
          { key: "email", origKey: "email" },
          { key: "phone", origKey: "phone" },
          { key: "phonecode", origKey: "phonecode" },
          { key: "whatsapp", origKey: "whatsapp" },
          { key: "whatsapp_phone_code", origKey: "whatsapp_phone_code" },
          { key: "date_of_birth", origKey: "date_of_birth" },
          { key: "gender", origKey: "gender" },
          { key: "date_of_joining", origKey: "date_of_joining" },
          {
            key: "enrolled_course",
            origKey: "enrolled_course",
            options: courseOptions,
          },
          { key: "region_id", origKey: "region_id", options: regionOptions },
          { key: "branch_id", origKey: "branch_id", options: branchOptions },
          {
            key: "batch_track_id",
            origKey: "batch_track_id",
            options: preferredBatchOptions,
          },
          {
            key: "batch_timing_id",
            origKey: "batch_timing_id",
            options: batchTimingOptions,
          },
          { key: "country", origKey: "country", options: countryOptions },
          { key: "state", origKey: "state", options: stateOptions },
          { key: "area", origKey: "current_location" },
          {
            key: "mode_of_class",
            origKey: "mode_of_class",
            options: [
              { id: 1, name: "Online" },
              { id: 2, name: "Classroom" },
            ],
          },
          {
            key: "place_of_service",
            origKey: "place_of_service",
            options: allBranchesData,
          },
          { key: "pincode", origKey: "pincode" },
          { key: "address", origKey: "address" },
          { key: "gst_number", origKey: "gst_number" },
          { key: "placement_support", origKey: "placement_support" },
        ];

        fieldsToCompare.forEach(({ key, origKey, options }) => {
          let newVal = payload[key];
          let oldVal = originalCustomerDetails[origKey];

          if (newVal === null || newVal === undefined) newVal = "";
          if (oldVal === null || oldVal === undefined) oldVal = "";

          let nValStr = String(newVal);
          let oValStr = String(oldVal);

          if (key === "date_of_birth" || key === "date_of_joining") {
            nValStr = nValStr.substring(0, 10);
            oValStr = oValStr.substring(0, 10);
          }

          if (nValStr !== oValStr) {
            changedFields[key] = {
              previous_value:
                getNameFromOptions(options, originalCustomerDetails[origKey]) ||
                "",
              new_value: getNameFromOptions(options, payload[key]) || "",
            };
          }
        });

        let oldServer = originalCustomerDetails.is_server_required == 1 ? 1 : 0;
        if (String(payload.is_server_required) !== String(oldServer)) {
          changedFields["is_server_required"] = {
            previous_value: oldServer,
            new_value: payload.is_server_required,
          };
        }

        let oldProfile = originalCustomerDetails.profile_image || "";
        let newProfile = payload.profile_image || "";
        if (oldProfile !== newProfile) {
          changedFields["profile_image"] = {
            previous_value: oldProfile,
            new_value: newProfile,
          };
        }

        let oldSignature = originalCustomerDetails.signature_image || "";
        let newSignature = payload.signature_image || "";
        if (oldSignature !== newSignature) {
          changedFields["signature_image"] = {
            previous_value: oldSignature,
            new_value: newSignature,
          };
        }
      }

      if (Object.keys(changedFields).length === 0) {
        setUpdateButtonLoading(false);
        CommonMessage("info", "No changes made to update.");
        return;
      }

      try {
        await updateCustomer(payload);

        const getloginUserDetails = localStorage.getItem("loginUserDetails");
        const converAsJson = getloginUserDetails
          ? JSON.parse(getloginUserDetails)
          : null;
        const trackPayload = {
          customers: [
            {
              customer_id: customerId,
              status: "Customer Details Updated",
              details: changedFields,
              status_date: formatToBackendIST(new Date()),
              updated_by: converAsJson?.user_id || "",
            },
          ],
        };
        await inserCustomerTrack(trackPayload);

        CommonMessage("success", "Updated");
        setTimeout(() => {
          setUpdateButtonLoading(false);
          setCustomerId(null);
          setCustomerDetails(null);
          setIsOpenEditDrawer(false);
          setUpdateDrawerTabKey("1");
          setActiveKey("1");
          callgetCustomersApi();
        }, 300);
      } catch (error) {
        setUpdateButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handlePaymentUpdate = async () => {
      if (loading) return;
      if (!permissions.includes("Update Payment Master")) {
        CommonMessage("error", "Access Denied");
        return;
      }

      setPaymentValidationTrigger(true);
      const subTotalValidate = selectValidator(subTotal);
      const taxTypeValidate = selectValidator(taxType);

      setSubTotalError(subTotalValidate);
      setTaxTypeError(taxTypeValidate);

      if (subTotalValidate || taxTypeValidate) return;

      setUpdateButtonLoading(true);
      const gstAmount = amount - subTotal;

      console.log("GST Amount:", gstAmount);

      const payload = {
        payment_master_id: paymentFullDetails?.id,
        tax_type: taxType === "18%" ? "GST (18%)" : "No Tax",
        gst_percentage: taxType === "0%" ? "0%" : "18%",
        gst_amount: parseFloat(gstAmount).toFixed(2),
        discount_amount: parseFloat(discountAmount) || 0,
        total_amount: amount - (parseFloat(discountAmount) || 0),
      };
      const changedFields = {};
      if (paymentFullDetails) {
        const fieldsToCompare = [
          { key: "primary_fees", origKey: "primary_fees" },
          { key: "tax_type", origKey: "tax_type" },
          { key: "gst_percentage", origKey: "gst_percentage" },
          { key: "gst_amount", origKey: "gst_amount" },
          { key: "discount_amount", origKey: "discount_amount" },
          { key: "total_amount", origKey: "total_amount" },
        ];

        fieldsToCompare.forEach(({ key, origKey }) => {
          let newVal = payload[key];

          // Since primary_fees is not sent to paymentMasterUpdate payload,
          // fetch it directly from the subTotal state for history tracking
          if (key === "primary_fees") {
            newVal = subTotal;
          }

          let oldVal = paymentFullDetails[origKey];

          if (newVal === null || newVal === undefined) newVal = "";
          if (oldVal === null || oldVal === undefined) oldVal = "";

          let nValStr = String(newVal);
          let oValStr = String(oldVal);

          if (key.includes("amount") || key.includes("fees")) {
            nValStr = Number(newVal || 0).toFixed(2);
            oValStr = Number(oldVal || 0).toFixed(2);
          }

          if (nValStr !== oValStr) {
            changedFields[key] = {
              previous_value: oValStr,
              new_value: nValStr,
            };
          }
        });
      }

      if (Object.keys(changedFields).length === 0) {
        setUpdateButtonLoading(false);
        CommonMessage("info", "No changes made to update.");
        return;
      }

      try {
        await paymentMasterUpdate(payload);

        const getloginUserDetails = localStorage.getItem("loginUserDetails");
        const converAsJson = getloginUserDetails
          ? JSON.parse(getloginUserDetails)
          : null;
        const trackPayload = {
          customers: [
            {
              customer_id: customerId,
              status: "Customer Details Updated",
              details: changedFields,
              status_date: formatToBackendIST(new Date()),
              updated_by: converAsJson?.user_id || "",
            },
          ],
        };
        await inserCustomerTrack(trackPayload);

        CommonMessage("success", "Updated");
        setTimeout(() => {
          setUpdateButtonLoading(false);
          setCustomerId(null);
          setCustomerDetails(null);
          setIsOpenEditDrawer(false);
          setUpdateDrawerTabKey("1");
          setActiveKey("1");
          callgetCustomersApi();
        }, 300);
      } catch (error) {
        console.log("paymant master error", error);
        setUpdateButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleTabClick = (key, e) => {
      setActiveKey(key);
      setUpdateDrawerTabKey(key);
    };

    const formReset = () => {
      setProfilePictureArray([]);
      setProfilePictureBase64("");
      setSelectedRA(null);
      setModeOfClass("");
      setModeOfClassError("");
      setPlaceOfService("");
      setPlaceOfServiceError("");
      setLeadId(null);
      setName("");
      setNameError("");
      setEmail("");
      setEmailError("");
      setMobileCountry("in");
      setMobileCountryCode("");
      setWhatsAppCountry("in");
      setWhatsAppCountryCode("");
      setMobile("");
      setMobileError("");
      setDateOfBirth(null);
      setGender("");
      setDateOfJoining(null);
      setCountryId(null);
      setCountryIdError("");
      setStateId(null);
      setStateIdError("");
      setAreaId(null);
      setAreaIdError("");
      setCourse("");
      setCourseError("");
      setPreferredBatch("");
      setPreferredBatchError("");
      setBatchTiming("");
      setBatchTimingError("");
      setBranchId(null);
      setBranchIdError("");
      setCurrentLocation("");
      setPinCode("");
      setCustomerAddress("");
      setGstNumber("");
      setPlacementSupport("");
      setPlacementSupportError("");
      setServer("");
      setUpdateDrawerTabKey("1");
      //payment usestates
      setPaymentValidationTrigger(false);
      setSubTotal();
      setSubTotalError("");
      setTaxType("");
      setTaxTypeError("");
      setAmount();
      setDiscountAmount("");
    };

    const renderPersonalDetails = () => {
      return (
        <div>
          <div className="customerupdate_maincontainer">
            <div className="customerupdate_profilepicture_container">
              <Upload
                listType="picture-circle"
                fileList={profilePictureArray}
                onPreview={handlePreview}
                onChange={handleProfileAttachment}
                onRemove={(file) => handleRemoveProfile(file)}
                beforeUpload={() => false} // prevent auto upload
                style={{ width: 90, height: 90 }} // reduce size
                accept=".png,.jpg,.jpeg"
              >
                {profilePictureArray.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8, fontSize: "12px" }}>
                      Upload <br /> Profile
                    </div>
                  </div>
                )}
              </Upload>
            </div>

            <Row gutter={[12, 30]} style={{ marginTop: "8px" }}>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonMuiDatePicker
                  label="Date Of Joining"
                  required={false}
                  maxLength={10}
                  onChange={(value) => {
                    setDateOfJoining(value);
                  }}
                  value={dateOfJoining}
                  error={""}
                />
              </Col>

              <Col span={8}>
                <CommonSelectField
                  width="100%"
                  label="Mode of Training"
                  labelMarginTop={"1px"}
                  labelFontSize={"11px"}
                  options={[
                    { id: 1, name: "Online" },
                    { id: 2, name: "Classroom" },
                  ]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setModeOfClass(value);
                    if (value == 1) {
                      setPlaceOfService(10);
                      setPlaceOfServiceError("");
                    } else {
                      setPlaceOfService(null);
                    }
                    if (validationTrigger) {
                      setModeOfClassError(selectValidator(value));
                    }
                  }}
                  value={modeOfClass}
                  error={modeOfClassError}
                  errorFontSize={"9px"}
                />
              </Col>

              <Col span={8}>
                <CommonSelectField
                  width="100%"
                  label="Place Of Service"
                  labelFontSize={"11px"}
                  labelMarginTop={"1px"}
                  options={
                    modeOfClass == 2
                      ? allBranchesData.filter(
                          (b) =>
                            b.name.toLowerCase() !== "bdc" &&
                            b.name.toLowerCase() !== "virtual",
                        )
                      : allBranchesData
                  }
                  onChange={(e) => {
                    setPlaceOfService(e.target.value);
                    if (validationTrigger) {
                      setPlaceOfServiceError(selectValidator(e.target.value));
                    }
                  }}
                  value={placeOfService}
                  error={placeOfServiceError}
                  errorFontSize={"9px"}
                  disabled={modeOfClass == 1}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  width="100%"
                  label="Select RA"
                  options={raUsers}
                  onChange={(e) => {
                    setSelectedRA(e.target.value);
                  }}
                  value={selectedRA}
                  disableClearable={false}
                />
              </Col>

              <Col xs={24} sm={24} md={24} lg={8}>
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

              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonInputField
                  label="Email"
                  required={true}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationTrigger) {
                      setEmailError(emailValidator(e.target.value));
                    }
                  }}
                  value={email}
                  error={emailError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <PhoneWithCountry
                  label="Mobile Number"
                  onChange={(value, countryIso2) => {
                    setMobile(value);
                    const activeCountry = countryIso2 || mobileCountry;
                    if (validationTrigger) {
                      setMobileError(mobileValidator(value, activeCountry));
                    }
                  }}
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
                  errorFontSize={mobileError.length >= 10 ? "9.5px" : "13px"}
                />
              </Col>

              <Col xs={24} sm={24} md={24} lg={8}>
                <PhoneWithCountry
                  label="WhatsApp Number"
                  onChange={(value, countryIso2) => {
                    setWhatsApp(value);
                    const activeCountry = countryIso2 || whatsAppCountry;
                    if (validationTrigger) {
                      setWhatsAppError(mobileValidator(value, activeCountry));
                    }
                  }}
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

              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonMuiDatePicker
                  label="Date Of Birth"
                  required={false}
                  onChange={(value) => {
                    console.log("vallll", value);
                    setDateOfBirth(value);
                  }}
                  value={dateOfBirth}
                  error={""}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Gender"
                  required={false}
                  options={[
                    { id: "Male", name: "Male" },
                    { id: "Female", name: "Female" },
                  ]}
                  onChange={(e) => {
                    setGender(e.target.value);
                  }}
                  value={gender}
                  error={""}
                />
              </Col>

              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Country"
                  required={true}
                  options={countryOptions}
                  onChange={handleCountry}
                  value={countryId}
                  error={countryIdError}
                />
              </Col>

              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="State"
                  required={true}
                  options={stateOptions}
                  onChange={(e) => {
                    setStateId(e.target.value);
                    if (validationTrigger) {
                      setStateIdError(selectValidator(e.target.value));
                    }
                  }}
                  value={stateId}
                  error={stateIdError}
                />
              </Col>

              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Area"
                  required={true}
                  options={areaOptions}
                  onChange={(e) => {
                    console.log("aaaaaaaa", e.target.value);
                    setAreaId(e.target.value);
                    if (validationTrigger) {
                      setAreaIdError(selectValidator(e.target.value));
                    }
                  }}
                  value={areaId}
                  error={areaIdError}
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="Postal/Zip Code"
                  required={false}
                  onChange={(e) => {
                    setPinCode(e.target.value);
                  }}
                  value={pinCode}
                  error={""}
                  errorFontSize="9px"
                />
              </Col>
              {/* <Col xs={24} sm={24} md={24} lg={8}>
                <CommonInputField
                  label="GST No"
                  required={false}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setGstNumber(value);
                  }}
                  value={gstNumber}
                  error={""}
                />
              </Col> */}

              <Col xs={24} sm={24} md={24} lg={14}>
                <CommonInputField
                  label="Address"
                  required={true}
                  multiline={true}
                  // rows={1}
                  onChange={(e) => {
                    const formatted = e.target.value;
                    setCustomerAddress(formatted);
                  }}
                  value={customerAddress}
                  error={""}
                />
              </Col>
            </Row>
          </div>

          <p className="customerupdate_coursedetails_heading">Course Details</p>
          <div className="customerupdate_maincontainer">
            <Row gutter={12} style={{ marginTop: "8px" }}>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Enrolled Course"
                  required={true}
                  options={courseOptions}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    if (validationTrigger) {
                      setCourseError(selectValidator(e.target.value));
                    }
                  }}
                  value={course}
                  error={courseError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Region"
                  required={true}
                  options={regionOptions}
                  onChange={(e) => {
                    setRegionId(e.target.value);
                    setBranchId("");
                    getBranchesData(parseInt(e.target.value), false);
                    if (validationTrigger) {
                      setRegionError(selectValidator(e.target.value));
                    }
                  }}
                  value={regionId}
                  error={regionError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Branch"
                  required={true}
                  options={branchOptions}
                  onChange={(e) => {
                    setBranchId(e.target.value);
                    if (validationTrigger) {
                      setBranchIdError(selectValidator(e.target.value));
                    }
                  }}
                  value={branchId}
                  error={branchIdError}
                />
              </Col>
            </Row>

            <Row
              gutter={12}
              style={{ marginTop: courseError ? "40px" : "30px" }}
            >
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Preferred Batch"
                  required={true}
                  options={preferredBatchOptions}
                  onChange={(e) => {
                    setPreferredBatch(e.target.value);
                    if (validationTrigger) {
                      setPreferredBatchError(selectValidator(e.target.value));
                    }
                  }}
                  value={preferredBatch}
                  error={preferredBatchError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Batch Type"
                  required={true}
                  options={batchTimingOptions}
                  onChange={(e) => {
                    setBatchTiming(e.target.value);
                    if (validationTrigger) {
                      setBatchTimingError(selectValidator(e.target.value));
                    }
                  }}
                  value={batchTiming}
                  error={batchTimingError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Placement Support"
                  required={true}
                  options={[
                    { id: "Need", name: "Need" },
                    { id: "Not Need", name: "Not Need" },
                  ]}
                  onChange={(e) => {
                    setPlacementSupport(e.target.value);
                    if (validationTrigger) {
                      setPlacementSupportError(selectValidator(e.target.value));
                    }
                  }}
                  value={placementSupport}
                  error={placementSupportError}
                />
              </Col>
            </Row>

            <Row gutter={12} style={{ marginTop: "30px" }}>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Server"
                  required={true}
                  options={[
                    { id: "Need", name: "Need" },
                    { id: "Not Need", name: "Not Need" },
                  ]}
                  onChange={(e) => {
                    setServer(e.target.value);
                  }}
                  value={server}
                />
              </Col>
            </Row>
          </div>
        </div>
      );
    };

    const renderPaymentMaster = () => {
      return (
        <div>
          <div className="customerupdate_maincontainer">
            <Row gutter={12} style={{ marginTop: "8px" }}>
              <Col xs={24} sm={24} md={24} lg={6}>
                <CommonInputField
                  label="Fees"
                  value={subTotal}
                  onChange={handleSubTotal}
                  error={subTotalError}
                  required={true}
                  type="number"
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={6}>
                <CommonSelectField
                  label="Tax Type"
                  required={true}
                  options={[
                    { id: "18%", name: "18%" },
                    { id: "0%", name: "0%" },
                  ]}
                  onChange={handleTaxType}
                  value={taxType}
                  error={taxTypeError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={6}>
                <CommonInputField
                  label="Add Discount"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  required={false}
                  type="number"
                  disabled={!permissions.includes("Update Discount")}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={6}>
                <CommonInputField
                  label="Total Amount"
                  required={true}
                  disabled
                  value={
                    amount ? amount - (parseFloat(discountAmount) || 0) : ""
                  }
                  type="number"
                />
              </Col>
            </Row>
          </div>
        </div>
      );
    };

    const tabItems = [
      {
        key: "1",
        label: <span style={{ fontSize: "13px" }}>Customer Details</span>,
        children: renderPersonalDetails(),
      },
      {
        key: "2",
        label: <span style={{ fontSize: "13px" }}>Payment Details</span>,
        children: renderPaymentMaster(),
      },
    ];

    return (
      <>
        {loading ? (
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <Skeleton.Avatar active size={100} shape="circle" />
            </div>
            <Row gutter={[16, 24]}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <Col span={8} key={i}>
                  <Skeleton.Input
                    active
                    block
                    style={{ height: "40px", borderRadius: "10px" }}
                  />
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: "40px" }}>
              <Row gutter={[16, 24]}>
                {[1, 2, 3].map((i) => (
                  <Col span={8} key={i}>
                    <Skeleton.Input
                      active
                      block
                      style={{ height: "40px", borderRadius: "10px" }}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        ) : (
          <Tabs
            activeKey={activeKey}
            onTabClick={handleTabClick}
            items={tabItems}
            className="customer_update_tab"
          />
        )}
        <Modal
          open={previewOpen}
          title="Preview Profile"
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <img alt="preview" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      </>
    );
  },
);

export default CustomerUpdate;
