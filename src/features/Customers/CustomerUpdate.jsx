import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Upload, Button, Tabs } from "antd";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import {
  addressValidator,
  calculateAmount,
  emailValidator,
  formatToBackendIST,
  mobileValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { SiWhatsapp } from "react-icons/si";
import "./styles.css";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import {
  getAllAreas,
  getBatches,
  getBatchTrack,
  getBranches,
  getCustomerById,
  getRegions,
  getTechnologies,
  getTrainingMode,
  paymentMasterUpdate,
  updateCustomer,
} from "../ApiService/action";
import { Country, State } from "country-state-city";
import { CommonMessage } from "../Common/CommonMessage";
import { useSelector } from "react-redux";

const CustomerUpdate = forwardRef(
  (
    {
      callgetCustomersApi,
      setUpdateDrawerTabKey,
      customerId,
      setUpdateButtonLoading,
      setIsOpenEditDrawer,
      paymentMasterDetails,
    },
    ref
  ) => {
    //permissions
    const permissions = useSelector((state) => state.userpermissions);

    const [activeKey, setActiveKey] = useState("1");
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [mobile, setMobile] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [whatsApp, setWhatsApp] = useState("");
    const [whatsAppError, setWhatsAppError] = useState("");

    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [dateOfBirthError, setDateOfBirthError] = useState(null);
    const [gender, setGender] = useState(null);
    const [genderError, setGenderError] = useState("");
    const [dateOfJoining, setDateOfJoining] = useState("");
    const [dateOfJoiningError, setDateOfJoiningError] = useState("");
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
    const [batchTrackOptions, setBatchTrackOptions] = useState([]);
    const [batchTrack, setBatchTrack] = useState(null);
    const [batchTrackError, setBatchTrackError] = useState("");
    const [batchTimingOptions, setBatchTimingOptions] = useState([]);
    const [batchTiming, setBatchTiming] = useState(null);
    const [batchTimingError, setBatchTimingError] = useState("");
    const [placementSupport, setPlacementSupport] = useState(null);
    const [placementSupportError, setPlacementSupportError] = useState(null);
    const [branchOptions, setBranchOptions] = useState([]);
    const [branchId, setBranchId] = useState(null);
    const [branchIdError, setBranchIdError] = useState("");

    const [profilePictureBase64, setProfilePictureBase64] = useState("");
    const [signatureBase64, setSignatureBase64] = useState("");
    const [loading, setLoading] = useState(true);
    const [validationTrigger, setValidationTrigger] = useState(false);
    const [callCustomerApi, setCallCustomerApi] = useState(false);

    //payment master usestaes
    const [subTotal, setSubTotal] = useState();
    const [subTotalError, setSubTotalError] = useState("");
    const [taxType, setTaxType] = useState("");
    const [taxTypeError, setTaxTypeError] = useState("");
    const [amount, setAmount] = useState();
    const [paymentValidationTrigger, setPaymentValidationTrigger] =
      useState(false);

    useEffect(() => {
      setActiveKey("1");
      setUpdateDrawerTabKey("1");
      if (callCustomerApi && customerId != null) {
        setUpdateDrawerTabKey("1");
        setActiveKey("1");
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
        setBatchTrackOptions(response?.data?.result || []);
      } catch (error) {
        setBatchTrackOptions([]);
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
          getCustomerData();
        }, 300);
      }
    };

    const getCustomerData = async () => {
      try {
        const response = await getCustomerById(customerId);
        console.log("customer response", response);
        const customerDetails = response?.data?.data;
        setName(customerDetails.name);
        setEmail(customerDetails.email);
        setMobile(customerDetails.phone);
        setWhatsApp(customerDetails.whatsapp);
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
            (f) => f.name === customerDetails.current_location
          );
          setAreaId(parseInt(findArea.id));
        } catch (error) {
          setAreaOptions([]);
          console.log("area error", error);
        }
        setBatchTrack(customerDetails.batch_track_id);
        setBatchTiming(customerDetails.batch_timing_id);
        setBranchId(customerDetails.branch_id);
        setPlacementSupport(customerDetails.placement_support);
        setCourse(customerDetails.enrolled_course);
        setProfilePictureBase64(customerDetails.profile_image);
        setSignatureBase64(customerDetails.signature_image);
        setRegionId(customerDetails.region_id);
        getBranchesData(customerDetails, true);
        console.log("paymentMasterDetails", paymentMasterDetails);
        //payment usestaes
        setSubTotal(parseFloat(customerDetails.primary_fees));
        // { id: 1, name: "GST (18%)" },
        //           { id: 2, name: "SGST (18%)" },
        //           { id: 3, name: "IGST (18%)" },
        //           { id: 4, name: "VAT (18%)" },
        //           { id: 5, name: "No tax" },
        setTaxType(
          paymentMasterDetails?.tax_type == "GST (18%)"
            ? 1
            : paymentMasterDetails?.tax_type == "SGST (18%)"
            ? 2
            : paymentMasterDetails?.tax_type == "IGST (18%)"
            ? 3
            : paymentMasterDetails?.tax_type == "VAT (18%)"
            ? 4
            : paymentMasterDetails?.tax_type == "No Tax"
            ? 5
            : ""
        );
        setAmount(parseFloat(paymentMasterDetails?.total_amount));
      } catch (error) {
        console.log("getcustomer by id error", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
          setCallCustomerApi(true);
        }, 200);
      }
    };

    const getBranchesData = async (customerfulldetails, initialset) => {
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
      const amnt = calculateAmount(value, taxType == 5 ? 0 : 18);
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
        e.target.value == 5 ? 0 : 18
      );
      if (isNaN(amnt)) {
        setAmount("");
      } else {
        setAmount(parseFloat(amnt));
      }
    };

    const handleCustomerUpdate = async () => {
      setValidationTrigger(true);
      const nameValidate = nameValidator(name);
      const emailValidate = emailValidator(email);
      const mobileValidate = mobileValidator(mobile);
      const whatsAppValidate = mobileValidator(whatsApp);
      const dateOfBirthValidate = selectValidator(dateOfBirth);
      const genderValidate = selectValidator(gender);
      const dateOfJoiningValidate = selectValidator(dateOfJoining);
      const countryValidate = selectValidator(countryId);
      const stateValidate = selectValidator(stateId);
      const areaValidate = selectValidator(areaId);
      const courseValidate = selectValidator(course);
      const regionIdValidate = selectValidator(regionId);
      const branchIdValidate = selectValidator(branchId);
      const batchTrackValidate = selectValidator(batchTrack);
      const batchTimingValidate = selectValidator(batchTiming);
      const placementSupportValidate = selectValidator(placementSupport);

      setNameError(nameValidate);
      setEmailError(emailValidate);
      setMobileError(mobileValidate);
      setWhatsAppError(whatsAppValidate);
      setDateOfBirthError(dateOfBirthValidate);
      setGenderError(genderValidate);
      setDateOfJoiningError(dateOfJoiningValidate);
      setCountryIdError(countryValidate);
      setStateIdError(stateValidate);
      setAreaIdError(areaValidate);
      setCourseError(courseValidate);
      setRegionError(regionIdValidate);
      setBranchIdError(branchIdValidate);
      setBatchTrackError(batchTrackValidate);
      setBatchTimingError(batchTimingValidate);
      setPlacementSupportError(placementSupportValidate);

      if (
        nameValidate ||
        emailValidate ||
        mobileValidate ||
        whatsAppValidate ||
        dateOfBirthValidate ||
        genderValidate ||
        dateOfJoiningValidate ||
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
        batchTrackValidate ||
        batchTimingValidate ||
        placementSupportValidate
      )
        return;

      setUpdateButtonLoading(true);
      const getCustomerArea = areaOptions.find((f) => f.id == areaId);

      const payload = {
        id: customerId,
        name: name,
        email: email,
        phonecode: "+91",
        phone: mobile,
        whatsapp: whatsApp,
        date_of_birth: formatToBackendIST(dateOfBirth),
        gender: gender,
        date_of_joining: formatToBackendIST(dateOfJoining),
        enrolled_course: course,
        region_id: regionId,
        branch_id: branchId,
        batch_track_id: batchTrack,
        batch_timing_id: batchTiming,
        country: countryId,
        state: stateId,
        area: getCustomerArea.name,
        signature_image: signatureBase64,
        profile_image: profilePictureBase64,
        placement_support: placementSupport,
      };

      try {
        await updateCustomer(payload);
        CommonMessage("success", "Updated");
        setTimeout(() => {
          setUpdateButtonLoading(false);
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
            "Something went wrong. Try again later"
        );
      }
    };

    const handlePaymentUpdate = async () => {
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
        payment_master_id: paymentMasterDetails?.id,
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
      };
      try {
        await paymentMasterUpdate(payload);
        CommonMessage("success", "Updated");
        setTimeout(() => {
          setUpdateButtonLoading(false);
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
            "Something went wrong. Try again later"
        );
      }
    };

    const handleTabClick = (key, e) => {
      setActiveKey(key);
      setUpdateDrawerTabKey(key);
    };

    const formReset = () => {
      setName("");
      setNameError("");
      setEmail("");
      setEmailError("");
      setMobile("");
      setMobileError("");
      setDateOfBirth(null);
      setDateOfBirthError("");
      setGender("");
      setGenderError("");
      setDateOfJoining(null);
      setDateOfJoiningError("");
      setCountryId(null);
      setCountryIdError("");
      setStateId(null);
      setStateIdError("");
      setAreaId(null);
      setAreaIdError("");
      setCourse("");
      setCourseError("");
      setBatchTrack("");
      setBatchTrackError("");
      setBatchTiming("");
      setBatchTimingError("");
      setBranchId(null);
      setBranchIdError("");
      setPlacementSupport("");
      setPlacementSupportError("");
      setUpdateDrawerTabKey("1");
      //payment usestates
      setPaymentValidationTrigger(false);
      setSubTotal();
      setSubTotalError("");
      setTaxType("");
      setTaxTypeError("");
      setAmount();
    };

    const renderPersonalDetails = () => {
      return (
        <div>
          <div className="customerupdate_maincontainer">
            <Row gutter={12} style={{ marginTop: "8px" }}>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonInputField
                  label="Name"
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
                <CommonInputField
                  label="Mobile"
                  required={true}
                  maxLength={10}
                  type="number"
                  onChange={(e) => {
                    setMobile(e.target.value);
                    if (validationTrigger) {
                      setMobileError(mobileValidator(e.target.value));
                    }
                  }}
                  value={mobile}
                  error={mobileError}
                  onInput={(e) => {
                    if (e.target.value.length > 15) {
                      e.target.value = e.target.value.slice(0, 15);
                    }
                  }}
                />
              </Col>
            </Row>

            <Row gutter={12} style={{ marginTop: "30px" }}>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonOutlinedInput
                  label="Whatsapp Number"
                  icon={<SiWhatsapp color="#39AE41" />}
                  required={true}
                  maxLength={10}
                  type="number"
                  onChange={(e) => {
                    setWhatsApp(e.target.value);
                    if (validationTrigger) {
                      setWhatsAppError(mobileValidator(e.target.value));
                    }
                  }}
                  value={whatsApp}
                  error={whatsAppError}
                  errorFontSize="10px"
                  onInput={(e) => {
                    if (e.target.value.length > 15) {
                      e.target.value = e.target.value.slice(0, 15);
                    }
                  }}
                />{" "}
              </Col>

              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonMuiDatePicker
                  label="Date Of Birth"
                  required={true}
                  onChange={(value) => {
                    console.log("vallll", value);
                    setDateOfBirth(value);
                    if (validationTrigger) {
                      setDateOfBirthError(selectValidator(value));
                    }
                  }}
                  value={dateOfBirth}
                  error={dateOfBirthError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonSelectField
                  label="Gender"
                  required={true}
                  options={[
                    { id: "Male", name: "Male" },
                    { id: "Female", name: "Female" },
                  ]}
                  onChange={(e) => {
                    setGender(e.target.value);
                    if (validationTrigger) {
                      setGenderError(selectValidator(e.target.value));
                    }
                  }}
                  value={gender}
                  error={genderError}
                />
              </Col>
            </Row>

            <Row gutter={12} style={{ marginTop: "30px" }}>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonMuiDatePicker
                  label="Date Of Joining"
                  required={true}
                  maxLength={10}
                  onChange={(value) => {
                    setDateOfJoining(value);
                    if (validationTrigger) {
                      setDateOfJoiningError(selectValidator(value));
                    }
                  }}
                  value={dateOfJoining}
                  error={dateOfJoiningError}
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
            </Row>

            <Row gutter={12} style={{ marginTop: "30px" }}>
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
                    getBranchesData(e.target.value, false);
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
          </div>
        </div>
      );
    };

    const renderPaymentMaster = () => {
      return (
        <div>
          <div className="customerupdate_maincontainer">
            <Row gutter={12} style={{ marginTop: "8px" }}>
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonInputField
                  label="Fees"
                  value={subTotal}
                  onChange={handleSubTotal}
                  error={subTotalError}
                  required={true}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
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
              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonInputField
                  label="Total Amount"
                  required={true}
                  disabled
                  value={amount}
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
        label: "Candidate Details",
        children: renderPersonalDetails(),
      },
      {
        key: "2",
        label: "Payment Details",
        children: renderPaymentMaster(),
      },
    ];

    return (
      <>
        {loading ? (
          <div className="customer_registration_loaderContainer">
            <CommonSpinner color="#333" />
          </div>
        ) : (
          <Tabs
            activeKey={activeKey}
            onTabClick={handleTabClick}
            items={tabItems}
            className="customer_update_tab"
          />
        )}
      </>
    );
  }
);

export default CustomerUpdate;
