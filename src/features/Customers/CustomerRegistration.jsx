import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Upload, Button, Modal, Tabs } from "antd";
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
  updateCustomer,
  updateCustomerStatus,
} from "../ApiService/action";
import CommonSpinner from "../Common/CommonSpinner";

export default function CustomerRegistration() {
  const sigCanvasRef = useRef(null);
  const navigate = useNavigate();
  const { customer_id } = useParams();
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

  const [profilePictureArray, setProfilePictureArray] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
  const [isOpenSignatureModal, setIsOpenSignatureModal] = useState(false);
  const [signatureArray, setSignatureArray] = useState([]);
  const [signatureBase64, setSignatureBase64] = useState("");
  const [signatureError, setSignatureError] = useState("");
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
        getBranchesData();
      }, 300);
    }
  };

  const getBranchesData = async () => {
    try {
      const response = await getBranches();
      setBranchOptions(response?.data?.result || []);
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
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
      setName(customerDetails.name);
      setEmail(customerDetails.email);
      setMobile(customerDetails.phone);
      setWhatsApp(customerDetails.whatsapp);
      setCourse(customerDetails.enrolled_course);
    } catch (error) {
      console.log("getcustomer by id error", error);
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
    const trainingModeValidate = selectValidator(trainingMode);
    const batchTrackValidate = selectValidator(batchTrack);
    const batchTimingValidate = selectValidator(batchTiming);
    const branchIdValidate = selectValidator(branchId);
    const placementSupportValidate = selectValidator(placementSupport);

    let signatureValidate;

    if (signatureBase64 === "") {
      signatureValidate = "Signature is required";
    } else {
      signatureValidate = "";
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
    setTrainingModeError(trainingModeValidate);
    setBatchTrackError(batchTrackValidate);
    setBatchTimingError(batchTimingValidate);
    setBranchIdError(branchIdValidate);
    setPlacementSupportError(placementSupportValidate);
    setSignatureError(signatureValidate);

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
      batchTrackValidate ||
      batchTimingValidate ||
      branchIdValidate ||
      placementSupportValidate ||
      signatureValidate
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
      training_mode: trainingMode,
      branch_id: branchId,
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
    } catch (error) {
      console.log("customer status change error", error);
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
          </Row>

          <Row gutter={12} style={{ marginTop: courseError ? "40px" : "30px" }}>
            <Col xs={24} sm={24} md={24} lg={6}>
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
    </div>
  );
}
