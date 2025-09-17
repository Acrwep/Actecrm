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
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState("");

  //course details usestates
  const [courseOptions, setCourseOptions] = useState([]);
  const [course, setCourse] = useState(null);
  const [courseError, setCourseError] = useState("");
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

  const [profilePictureArray, setProfilePictureArray] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
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
        getCustomerData();
      }, 300);
    }
  };

  const getCustomerData = async () => {
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
      setCourse(customerDetails.enrolled_course);
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
    const isValidType = file.type === "image/png";

    // ✅ Check file size (1MB = 1,048,576 bytes)
    const isValidSize = file.size <= 1024 * 1024;

    if (isValidType && isValidSize) {
      console.log("fileeeee", newFileList);
      setProfilePictureArray(newFileList);
      CommonMessage("success", "Profile uploaded");

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Extract Base64 content
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
    const locationValidate = addressValidator(location);
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
    setLocationError(locationValidate);
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
      dateOfJoiningValidate ||
      locationValidate
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
      current_location: location,
      signature_image: signatureBase64,
      profile_image: profilePicture,
      palcement_support: placementSupport,
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
      handleCustomerTrack();
    } catch (error) {
      console.log("customer status change error", error);
    }
  };

  const handleCustomerTrack = async () => {
    const today = new Date();

    const payload = {
      customer_id: customer_id,
      status: "Awaiting Finance",
      status_date: formatToBackendIST(today),
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
                  <span style={{ fontSize: "10px" }}>(PNG, JPEG, & PNG)</span>
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
              style={{
                cursor: "pointer",
                color: "#5b69ca",
                fontWeight: 500,
                marginLeft: "-3px",
              }}
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
              className="trainer_picture_circle"
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
          <Tabs
            activeKey={activeKey}
            onTabClick={handleTabClick}
            items={tabItems}
            className="trainer_registration_tabs"
          />
        )}
      </div>

      <Modal
        title="Create Signature"
        open={isOpenSignatureModal}
        onCancel={() => setIsOpenSignatureModal(false)}
        footer={false}
        width="40%"
      >
        <CommonSignaturePad />
      </Modal>

      <Modal
        title="Terms and conditions"
        open={isOpenTermsModal}
        onCancel={() => setIsOpenTermsModal(false)}
        footer={false}
        width="50%"
        style={{ top: 20 }} // 👈 distance from top
      >
        <div className="customer_registration_terms_contentContainer">
          <ul>
            <li>
              The candidate should be on the date & time once the classes have
              been scheduled, if found irregular attendance management isn’t
              responsible for the subject coverage
            </li>
            <li>
              Candidates are advised to attend the class properly and neatly
              dressed and are asked to leave their sandals outside (Only shoes
              allowed inside)
            </li>
            <li>
              The candidate should not be engaged in entertaining activities
              during class hours other than subject training
            </li>
            <li>
              The candidate should not bring any irrelevant person into ACTE
              campus except for the course inquiry
            </li>
            <li>
              If the candidate finds any quality lacking in the subject, they
              should immediately bring into the notice of the Management so that
              they will take the necessary steps
            </li>
            <li>
              Internal examination score with rich attendance is mandatory for
              the candidate, to apply for the certification
            </li>
            <li>
              On successful completion of training candidates need to register
              for their Certificate to the Management
            </li>
            <li>
              Certification will be issued to the candidate after 15 days which
              is required for management processing for a soft copy.
            </li>
            <li>
              Candidates discussing other than placement activities in the ACTE
              forum What Sapp group will be removed from the group if required
            </li>
            <li>
              They need to drop an e-mail regarding their query to
              support@acte.in or they should communicate with the concerned team
            </li>
            <li>
              Once the enrolment has been done in ACTE the management starts its
              process of allocating trainer and scheduling the class which will
              not pave the way to any kind of refund claim.
            </li>
            <li>
              Raise refund requests within 7 days of purchase of course. A
              money-back guarantee is void if the participant has accessed more
              than 30% of the content or downloaded the E-Book.
            </li>
            <li>
              On figuring out any kind of quality issues necessary steps will be
              taken by the management to retain the training quality if the
              required trainer will be changed
            </li>
            <li>
              For a change of trainer, the student should submit their
              attendance record maintained by the trainer. After that management
              will check the trainer’s quality with other students in their
              batch
            </li>
            <li>
              ACTE makes its full-fledged effort at maximum level to make the
              candidates placed and on which candidate’s active performance in
              class and the candidate’s best performance in the interview are
              mandatory
            </li>
            <li>
              Management holds the responsibility of providing software that is
              widely available in the market and if particularly you’ve paid for
              that software subscription
            </li>
            <li>
              In rare cases if it fails to provide the software then virtual &
              real-time oriented practical sessions will be provided by the
              management
            </li>
            <li>
              Candidates are requested to bring their laptops during practical
              sessions and if not possible management will provide a system
              based on the availability with respect to time & class
            </li>
            <li>
              Once every 15 days candidates are subjected to quality checks by
              the management, for that purpose they need their own system
            </li>
            <li>
              Candidates opted for the part payment are asked to clear their
              pending fee amount within 15 days of time once the course is
              started
            </li>
            <li>
              Candidates are authorized to utilize the management’s resources
              like the Internet, and systems only during the class timings
            </li>
            <li>
              ACTE is the brand name of our service and it functions under the
              care of ACTE Training Institute Private Limited
            </li>
            <li>
              You must update the attendance form we gave you. If you do not
              keep your attendance record, you will not be eligible for
              compensation.
            </li>
            <li>
              Once you made the payment the process for your training will be
              started, it will take a minimum of 24 to 48 HRS to start the
              session for you.
            </li>
            <li>
              Refunds must be requested within 7 days of the start of the batch
              in which you registered. If a participant has accessed more than
              50% of an e-learning course's content or has attended Online
              Classrooms for more than one day, the money-back promise is null
              and void.
            </li>
            <li>
              If a cancellation is done by a candidate of the event, no refunds
              will be made.
            </li>
            <li>
              The attendance record we provided you with needs to be updated.
              You won't be able to receive a payment if you don't keep a record
              of your attendance.
            </li>
            <li>
              Following ACTE Technologies Pvt Ltd.’s approval of the refund
              request, all reimbursements will be executed within 7 to 10
              working days.
            </li>
            <li>
              ACTE is the brand name of our service and it functions under the
              care of ACTE Training Institute Private Limited
            </li>
            <li>
              I agree to the above terms and Conditions with my knowledge and
              consciousness and I wish to join in ACTE
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}
