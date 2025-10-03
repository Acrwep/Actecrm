import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Upload, Button, Modal, Tabs, Checkbox } from "antd";
import Logo from "../../assets/acte-logo.png";
import { PlusOutlined } from "@ant-design/icons";
import { CommonMessage } from "../Common/CommonMessage";
import { SiWhatsapp } from "react-icons/si";
import CommonInputField from "../Common/CommonInputField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import "./styles.css";
import {
  addressValidator,
  emailValidator,
  formatToBackendIST,
  mobileValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import { UploadOutlined } from "@ant-design/icons";
import { IoIosAdd } from "react-icons/io";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonSelectField from "../Common/CommonSelectField";
import CommonSignaturePad from "../Common/CommonSignaturePad";
import {
  getAllAreas,
  getBatches,
  getBatchTrack,
  getBranches,
  getCustomerById,
  getTechnologies,
  getTrainingMode,
  inserCustomerTrack,
  updateCustomer,
  updateCustomerStatus,
} from "../ApiService/action";
import CommonSpinner from "../Common/CommonSpinner";

export default function CustomerRegistration() {
  const sigCanvasRef = useRef(null);
  const navigate = useNavigate();
  const { customer_id } = useParams();
  const [activeKey, setActiveKey] = useState("1");

  const [customerFullDetails, setCustomerFullDetails] = useState(null);
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
  const [countryId, setCountryId] = useState(null);
  const [stateId, setStateId] = useState(null);
  const [areaOptions, setAreaOptions] = useState([]);
  const [areaId, setAreaId] = useState(null);
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState("");

  //course details usestates
  const [courseOptions, setCourseOptions] = useState([]);
  const [course, setCourse] = useState(null);
  const [courseError, setCourseError] = useState("");
  const [batchTrackOptions, setBatchTrackOptions] = useState([]);
  const [batchTrack, setBatchTrack] = useState(null);
  const [batchTrackError, setBatchTrackError] = useState("");
  const [batchTimingOptions, setBatchTimingOptions] = useState([]);
  const [batchTiming, setBatchTiming] = useState(null);
  const [batchTimingError, setBatchTimingError] = useState("");
  const [placementSupport, setPlacementSupport] = useState(null);
  const [placementSupportError, setPlacementSupportError] = useState(null);

  const [profilePictureArray, setProfilePictureArray] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isOpenSignatureModal, setIsOpenSignatureModal] = useState(false);
  const [signatureArray, setSignatureArray] = useState([]);
  const [signatureBase64, setSignatureBase64] = useState("");
  const [signatureError, setSignatureError] = useState("");
  const [isOpenTermsModal, setIsOpenTermsModal] = useState(false);
  const [isCheckedTerms, setIsCheckedTerms] = useState(false);
  const [isCheckedTermsError, setIsCheckedTermsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);

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
        getAreasData();
      }, 300);
    }
  };

  const getAreasData = async () => {
    let all_areas;
    try {
      const response = await getAllAreas();
      all_areas = response?.data?.data || [];
      setAreaOptions(all_areas);
    } catch (error) {
      setAreaOptions([]);
      console.log("area response error", error);
    } finally {
      setTimeout(() => {
        getCustomerData(all_areas);
      }, 300);
    }
  };

  const getCustomerData = async (all_areas) => {
    try {
      const response = await getCustomerById(customer_id);
      console.log("customer response", response);
      const customerDetails = response?.data?.data;
      if (customerDetails.is_customer_updated === 1) {
        navigate("/success");
        return;
      }
      setCustomerFullDetails(customerDetails);
      setName(customerDetails.name);
      setEmail(customerDetails.email);
      setMobile(customerDetails.phone);
      setWhatsApp(customerDetails.whatsapp);
      setCountryId(customerDetails.country);
      setStateId(customerDetails.state);
      setCourse(customerDetails.enrolled_course);
      setBatchTrack(customerDetails.batch_track_id);
      setBatchTiming(customerDetails.batch_timing_id);
      setPlacementSupport(customerDetails.placement_support);
      const findArea = all_areas.find(
        (f) => f.name == customerDetails.current_location
      );
      setAreaId(parseInt(findArea.id));
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerFullDetails(null);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  };

  const handleProfileAttachment = ({ fileList: newFileList }) => {
    console.log("newww", newFileList);

    if (newFileList.length <= 0) {
      setProfilePictureArray([]);
      setProfilePicture("");
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
        setProfilePicture(base64String); // Store in state
      };
    } else {
      if (!isValidType) {
        CommonMessage("error", "Accept only .png");
      } else if (!isValidSize) {
        CommonMessage("error", "File size must be 1MB or less");
      }
      setProfilePictureArray([]);
      setProfilePicture("");
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
      (file) => file.uid !== fileToRemove.uid
    );
    setProfilePictureArray(newFileList);
    // CommonToaster("Profile removed");
  };

  const handleSignature = ({ file }) => {
    // allowed MIME types
    const isValidType = file.type === "image/png";

    if (file.status === "uploading" || file.status === "removed") {
      setSignatureArray([]);
      setSignatureBase64("");
      setSignatureError("Signature is required");
      return;
    }
    const isValidSize = file.size <= 1024 * 1024;

    if (isValidType && isValidSize) {
      console.log("fileeeee", file);
      setSignatureArray([file]);
      CommonMessage("success", "Signature uploaded");
      setSignatureError("");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Extract Base64 content
        setSignatureBase64(base64String); // Store in state
      };
    } else {
      if (!isValidType) {
        CommonMessage("error", "Accept only .png");
      } else if (!isValidSize) {
        CommonMessage("error", "File size must be 1MB or less");
      }
      setSignatureArray([]);
      setSignatureBase64("");
    }
  };

  const handleTabClick = (key, e) => {
    setActiveKey(key);
  };

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
    const courseValidate = selectValidator(course);
    const batchTrackValidate = selectValidator(batchTrack);
    const batchTimingValidate = selectValidator(batchTiming);
    const placementSupportValidate = selectValidator(placementSupport);

    let termsandconditionsValidate;
    let signatureValidate;

    if (signatureBase64 === "") {
      signatureValidate = "Signature is required";
    } else {
      signatureValidate = "";
    }

    if (isCheckedTerms === false) {
      termsandconditionsValidate = " is required";
    } else {
      termsandconditionsValidate = "";
    }

    setNameError(nameValidate);
    setEmailError(emailValidate);
    setMobileError(mobileValidate);
    setWhatsAppError(whatsAppValidate);
    setDateOfBirthError(dateOfBirthValidate);
    setGenderError(genderValidate);
    setDateOfJoiningError(dateOfJoiningValidate);
    setCourseError(courseValidate);
    setBatchTrackError(batchTrackValidate);
    setBatchTimingError(batchTimingValidate);
    setPlacementSupportError(placementSupportValidate);
    setSignatureError(signatureValidate);
    setIsCheckedTermsError(termsandconditionsValidate);

    if (
      nameValidate ||
      emailValidate ||
      mobileValidate ||
      whatsAppValidate ||
      dateOfBirthValidate ||
      genderValidate ||
      dateOfJoiningValidate
    ) {
      setActiveKey("1");
      return;
    }

    if (
      courseValidate ||
      batchTrackValidate ||
      batchTimingValidate ||
      placementSupportValidate ||
      signatureValidate ||
      termsandconditionsValidate
    )
      return;

    setButtonLoading(true);

    const getCustomerArea = areaOptions.find((f) => f.id == areaId);

    const payload = {
      id: customer_id,
      name: name,
      email: email,
      phonecode: "+91",
      phone: mobile,
      whatsapp: whatsApp,
      date_of_birth: formatToBackendIST(dateOfBirth),
      gender: gender,
      date_of_joining: formatToBackendIST(dateOfJoining),
      enrolled_course: course,
      region_id:
        customerFullDetails && customerFullDetails.region_id
          ? customerFullDetails.region_id
          : null,
      branch_id:
        customerFullDetails && customerFullDetails.branch_id
          ? customerFullDetails.branch_id
          : null,
      batch_track_id: batchTrack,
      batch_timing_id: batchTiming,
      country: countryId,
      state: stateId,
      area: getCustomerArea.name,
      signature_image: signatureBase64,
      profile_image: profilePicture,
      placement_support: placementSupport,
    };

    try {
      await updateCustomer(payload);
      CommonMessage("success", "Registered Successfully");
      setTimeout(() => {
        handleCustomerStatus();
        setButtonLoading(false);
        navigate("/success");
      }, 300);
    } catch (error) {
      console.log("customer update error", error);
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCustomerStatus = async () => {
    const payload = {
      customer_id: customer_id,
      status: "Awaiting Finance",
    };
    try {
      await updateCustomerStatus(payload);
      handleCustomerTrack("Form Submitted");
      setTimeout(() => {
        handleCustomerTrack("Awaiting Finance");
      }, 1000);
    } catch (error) {
      console.log("customer status change error", error);
    }
  };

  const handleCustomerTrack = async (updateStatus) => {
    const today = new Date();

    const payload = {
      customer_id: customer_id,
      status: updateStatus,
      status_date: formatToBackendIST(today),
      updated_by: 211,
    };
    try {
      await inserCustomerTrack(payload);
    } catch (error) {
      console.log("customer track error", error);
    }
  };

  const renderPersonalDetails = () => {
    return (
      <div style={{ height: "300px", position: "relative" }}>
        <div className="logincard_innerContainer">
          <Row gutter={12} style={{ marginTop: "8px" }}>
            <Col xs={24} sm={24} md={24} lg={6}>
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
            <Col xs={24} sm={24} md={24} lg={6}>
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
            <Col xs={24} sm={24} md={24} lg={6}>
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
            <Col xs={24} sm={24} md={24} lg={6}>
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
          </Row>

          <Row gutter={12} style={{ marginTop: "30px" }}>
            <Col xs={24} sm={24} md={24} lg={6}>
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
            <Col xs={24} sm={24} md={24} lg={6}>
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
            <Col xs={24} sm={24} md={24} lg={6}>
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

            <Col xs={24} sm={24} md={24} lg={6}>
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

        <div className="trainer_registration_submitbuttonContainer">
          <button
            className="trainer_registration_submitbutton"
            onClick={handlePersonalDetails}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderCourseDetails = () => {
    return (
      <div style={{ height: "300px", position: "relative" }}>
        <div className="logincard_innerContainer">
          <Row gutter={12} style={{ marginTop: "8px" }}>
            <Col xs={24} sm={24} md={24} lg={6}>
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
                disabled={true}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={6}>
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
                disabled={true}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={6}>
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
                disabled={true}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={6}>
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
                disabled={true}
              />
            </Col>
          </Row>

          <Row gutter={12} style={{ marginTop: courseError ? "40px" : "30px" }}>
            <Col span={6} style={{ position: "relative", display: "flex" }}>
              <p className="trainer_registration_signaturelabel">
                Signature <span style={{ color: "#d32f2f" }}>*</span>
              </p>
              <Upload
                style={{ width: "100%", marginTop: "6px" }}
                beforeUpload={(file) => {
                  return false; // Prevent auto-upload
                }}
                accept=".png"
                onChange={handleSignature}
                fileList={signatureArray}
                multiple={false}
              >
                <Button
                  icon={<UploadOutlined />}
                  className="leadmanager_payment_screenshotbutton"
                  style={{ borderRadius: "4px" }}
                >
                  Choose file
                  <span style={{ fontSize: "10px" }}>(PNG)</span>
                </Button>
              </Upload>{" "}
              <button
                className="trainer_registration_signature_createbutton"
                onClick={() => setIsOpenSignatureModal(true)}
              >
                <IoIosAdd size={18} /> Create
              </button>
              {signatureError && (
                <p className="trainer_registration_signatureerror">
                  {signatureError}
                </p>
              )}
            </Col>
          </Row>

          <div className="customer_registration_terms_container">
            <Checkbox
              onChange={(e) => {
                setIsCheckedTerms(e.target.checked);
                if (validationTrigger) {
                  if (e.target.checked === true) {
                    setIsCheckedTermsError("");
                  } else {
                    setIsCheckedTermsError(" is required");
                  }
                }
              }}
              value={isCheckedTerms}
            >
              I have read and agree to the
            </Checkbox>
            <p
              className="customer_registration_terms_text"
              onClick={() => setIsOpenTermsModal(true)}
            >
              Terms and Conditions
            </p>
          </div>
          {isCheckedTermsError && (
            <p className="customer_registration_terms_error">
              Please accept the terms and conditions
            </p>
          )}
        </div>{" "}
        <div className="trainer_registration_submitbuttonContainer">
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
        </div>
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

  const handleSignatureBase64 = (base64) => {
    console.log(base64, "base64");
    setSignatureBase64(base64);
    setSignatureError("");
    setIsOpenSignatureModal(false);
  };

  return (
    <div className="login_mainContainer">
      <div className="customerregistration_card">
        <div className="logincard_innerContainer" style={{ marginTop: "40px" }}>
          <div className="trainer_registration_logoContainer">
            <div style={{ height: "100%" }}>
              <img src={Logo} className="login_logo" />
              <p
                className="trainer_registration_logotext"
                style={{ color: "#1b538c" }}
              >
                Technologies
              </p>
            </div>
            <div>
              <p className="trainer_registration_heading">
                Customer Registration Form
              </p>
            </div>
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
        </div>

        {loading ? (
          <div className="customer_registration_loaderContainer">
            <CommonSpinner color="#333" />
          </div>
        ) : (
          // <Tabs
          //   activeKey={activeKey}
          //   onTabClick={handleTabClick}
          //   items={tabItems}
          //   className="trainer_registration_tabs"
          // />
          <>
            <div style={{ height: "390px", position: "relative" }}>
              <div className="logincard_innerContainer">
                <Row gutter={12} style={{ marginTop: "20px" }}>
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                      disabled={true}
                    />
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                      disabled={true}
                    />
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                      disabled={true}
                    />
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                      disabled={true}
                    />{" "}
                  </Col>
                </Row>

                <Row gutter={12} style={{ marginTop: "30px" }}>
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                  <Col xs={24} sm={24} md={24} lg={6}>
                    <CommonSelectField
                      label="Area"
                      required={true}
                      options={areaOptions}
                      value={areaId}
                      disabled={true}
                    />
                  </Col>
                </Row>

                <p className="customer_registration_courseheading">
                  Course Details
                </p>
                <Row gutter={12} style={{ marginTop: "16px" }}>
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                      disabled={true}
                    />
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                      disabled={true}
                    />
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6}>
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
                      disabled={true}
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: "20px", marginBottom: "30px" }}>
                  <Col
                    span={6}
                    style={{ position: "relative", display: "flex" }}
                  >
                    {signatureBase64 ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <div>
                          <p style={{ fontWeight: 500, color: "#333" }}>
                            Signature
                          </p>
                          <img
                            src={signatureBase64}
                            alt="Trainer Signature"
                            className="customer_signature_image"
                          />
                        </div>
                        <button
                          className="trainer_registration_signature_createbutton"
                          onClick={() => setIsOpenSignatureModal(true)}
                        >
                          Update
                        </button>
                      </div>
                    ) : (
                      <>
                        <Button
                          className="customer_registration_addsign_button"
                          onClick={() => {
                            setIsOpenSignatureModal(true);
                          }}
                        >
                          Add E-Signature
                        </Button>
                        {signatureError && (
                          <p className="trainer_registration_signatureerror">
                            {signatureError}
                          </p>
                        )}
                      </>
                    )}
                  </Col>
                </Row>
                <div className="customer_registration_terms_container">
                  <Checkbox
                    onChange={(e) => {
                      setIsCheckedTerms(e.target.checked);
                      if (validationTrigger) {
                        if (e.target.checked === true) {
                          setIsCheckedTermsError("");
                        } else {
                          setIsCheckedTermsError(" is required");
                        }
                      }
                    }}
                    value={isCheckedTerms}
                  >
                    I have read and agree to the
                  </Checkbox>
                  <p
                    className="customer_registration_terms_text"
                    onClick={() => setIsOpenTermsModal(true)}
                  >
                    Terms and Conditions
                  </p>
                </div>
                {isCheckedTermsError && (
                  <p className="customer_registration_terms_error">
                    Please accept the terms and conditions
                  </p>
                )}
              </div>
            </div>

            <div className="trainer_registration_submitbuttonContainer">
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
            </div>
          </>
        )}
      </div>

      <Modal
        title="Signature"
        open={isOpenSignatureModal}
        onCancel={() => setIsOpenSignatureModal(false)}
        footer={false}
        width="40%"
      >
        <CommonSignaturePad
          instruction={true}
          onUpload={handleSignatureBase64}
        />
      </Modal>

      <Modal
        title="Terms and conditions"
        open={isOpenTermsModal}
        onCancel={() => setIsOpenTermsModal(false)}
        footer={false}
        width="50%"
        style={{ top: 20 }} // 👈 distance from top
        centered
      >
        <div className="customer_registration_terms_contentContainer">
          <ul>
            <li>
              Acte Technologies has rights to postpone/cancel courses due to
              instructor illness or natural calamities. No refund in this case.
            </li>
            <li>The refund requisition will not be accepted</li>
          </ul>
        </div>
      </Modal>

      <Modal
        open={previewOpen}
        title="Preview Profile"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}
