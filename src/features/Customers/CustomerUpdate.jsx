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
  getBatches,
  getBatchTrack,
  getBranches,
  getCustomerById,
  getRegions,
  getTechnologies,
  getTrainingMode,
  updateCustomer,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";

const CustomerUpdate = forwardRef(
  (
    {
      callgetCustomersApi,
      setUpdateDrawerTabKey,
      customerId,
      setUpdateButtonLoading,
      setIsOpenEditDrawer,
    },
    ref
  ) => {
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
    const [location, setLocation] = useState("");
    const [locationError, setLocationError] = useState("");

    //course details usestates
    const [courseOptions, setCourseOptions] = useState([]);
    const [course, setCourse] = useState(null);
    const [courseError, setCourseError] = useState("");
    const [regionOptions, setRegionOptions] = useState([]);
    const [regionId, setRegionId] = useState(null);
    const [regionError, setRegionError] = useState("");
    const [trainingModeOptions, setTrainingModeOptions] = useState([]);
    const [trainingMode, setTrainingMode] = useState(null);
    const [trainingModeError, setTrainingModeError] = useState("");
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

    useEffect(() => {
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
          getTrainingModeData();
        }, 300);
      }
    };

    const getTrainingModeData = async () => {
      try {
        const response = await getTrainingMode();
        setTrainingModeOptions(response?.data?.result || []);
      } catch (error) {
        setTrainingModeOptions([]);
        console.log("trainer mode error", error);
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
        setLocation(
          customerDetails.current_location
            ? customerDetails.current_location
            : ""
        );
        setTrainingMode(customerDetails.training_mode_id);
        setBatchTrack(customerDetails.batch_track_id);
        setBatchTiming(customerDetails.batch_timing_id);
        setBranchId(customerDetails.branch_id);
        setPlacementSupport(customerDetails.placement_support);
        setCourse(customerDetails.enrolled_course);
        setProfilePictureBase64(customerDetails.profile_image);
        setSignatureBase64(customerDetails.signature_image);
        setRegionId(customerDetails.region_id);
        getBranchesData(customerDetails, true);
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
      handlePersonalDetails,
      handleSubmit,
      formReset,
    }));

    const handlePersonalDetails = () => {
      setValidationTrigger(true);
      const nameValidate = nameValidator(name);
      const emailValidate = emailValidator(email);
      const mobileValidate = mobileValidator(mobile);
      const whatsAppValidate = mobileValidator(whatsApp);
      const dateOfBirthValidate = selectValidator(dateOfBirth);
      const genderValidate = selectValidator(gender);
      const dateOfJoiningValidate = selectValidator(dateOfJoining);
      const locationValidate = addressValidator(location);

      console.log("locationValidate", location, locationValidate);

      setNameError(nameValidate);
      setEmailError(emailValidate);
      setMobileError(mobileValidate);
      setWhatsAppError(whatsAppValidate);
      setDateOfBirthError(dateOfBirthValidate);
      setGenderError(genderValidate);
      setDateOfJoiningError(dateOfJoiningValidate);
      setLocationError(locationValidate);

      if (
        nameValidate ||
        emailValidate ||
        mobileValidate ||
        whatsAppValidate ||
        dateOfBirthValidate ||
        genderValidate ||
        dateOfJoiningValidate ||
        locationValidate
      )
        return;

      setActiveKey("2");
      setUpdateDrawerTabKey("2");
    };

    const handleSubmit = async () => {
      setValidationTrigger(true);
      const nameValidate = nameValidator(name);
      const emailValidate = emailValidator(email);
      const mobileValidate = mobileValidator(mobile);
      const whatsAppValidate = mobileValidator(whatsApp);
      const dateOfBirthValidate = selectValidator(dateOfBirth);
      const genderValidate = selectValidator(gender);
      const dateOfJoiningValidate = selectValidator(dateOfJoining);
      const locationValidate = addressValidator(location);
      const courseValidate = selectValidator(course);
      const trainingModeValidate = selectValidator(trainingMode);
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
      setLocationError(locationValidate);
      setCourseError(courseValidate);
      setTrainingModeError(trainingModeValidate);
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
        locationValidate
      ) {
        setActiveKey("1");
        return;
      }

      if (
        courseValidate ||
        trainingModeValidate ||
        regionIdValidate ||
        branchIdValidate ||
        batchTrackValidate ||
        batchTimingValidate ||
        placementSupportValidate
      )
        return;

      setUpdateButtonLoading(true);

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
        training_mode: trainingMode,
        region_id: regionId,
        branch_id: branchId,
        batch_track_id: batchTrack,
        batch_timing_id: batchTiming,
        current_location: location,
        signature_image: signatureBase64,
        profile_image: profilePictureBase64,
        palcement_support: placementSupport,
      };

      try {
        await updateCustomer(payload);
        CommonMessage("success", "Updated");
        setTimeout(() => {
          setUpdateButtonLoading(false);
          setIsOpenEditDrawer(false);
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
      setLocation("");
      setLocationError("");
      setCourse("");
      setCourseError("");
      setTrainingMode("");
      setTrainingModeError("");
      setBatchTrack("");
      setBatchTrackError("");
      setBatchTiming("");
      setBatchTimingError("");
      setBranchId(null);
      setBranchIdError("");
      setPlacementSupport("");
      setPlacementSupportError("");
      setUpdateDrawerTabKey("1");
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
                    if (e.target.value.length > 10) {
                      e.target.value = e.target.value.slice(0, 10);
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
                    if (e.target.value.length > 10) {
                      e.target.value = e.target.value.slice(0, 10);
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
                    console.log("vallll", value);
                    setDateOfJoining(value);
                    if (validationTrigger) {
                      setDateOfJoiningError(selectValidator(value));
                    }
                  }}
                  value={dateOfJoining}
                  error={dateOfJoiningError}
                  onInput={(e) => {
                    if (e.target.value.length > 10) {
                      e.target.value = e.target.value.slice(0, 10);
                    }
                  }}
                />
              </Col>

              <Col xs={24} sm={24} md={24} lg={8}>
                <CommonInputField
                  label="Location"
                  required={true}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (validationTrigger) {
                      setLocationError(addressValidator(e.target.value));
                    }
                  }}
                  value={location}
                  error={locationError}
                  onInput={(e) => {
                    if (e.target.value.length > 10) {
                      e.target.value = e.target.value.slice(0, 10);
                    }
                  }}
                />
              </Col>
            </Row>
          </div>

          {/* <div className="trainer_registration_submitbuttonContainer">
          <button
            className="trainer_registration_submitbutton"
            onClick={handlePersonalDetails}
          >
            Next
          </button>
        </div> */}
        </div>
      );
    };

    const renderCourseDetails = () => {
      return (
        <div>
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
                  label="Training Mode"
                  required={true}
                  options={trainingModeOptions}
                  onChange={(e) => {
                    setTrainingMode(e.target.value);
                    if (validationTrigger) {
                      setTrainingModeError(selectValidator(e.target.value));
                    }
                  }}
                  value={trainingMode}
                  error={trainingModeError}
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
            </Row>

            <Row
              gutter={12}
              style={{ marginTop: courseError ? "40px" : "30px" }}
            >
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
                  label="Batch Timing"
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
            </Row>

            <Row gutter={12} style={{ marginTop: "30px" }}>
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
          </div>{" "}
          {/* <div className="trainer_registration_submitbuttonContainer">
          {buttonLoading ? (
            <button className="trainer_registration_loadingsubmitbutton">
              <CommonSpinner />
            </button>
          ) : (
            <button
              className="trainer_registration_submitbutton"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div> */}
        </div>
      );
    };

    const tabItems = [
      {
        key: "1",
        label: "Personal Details",
        children: renderPersonalDetails(),
      },
      {
        key: "2",
        label: "Course Details",
        children: renderCourseDetails(),
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
