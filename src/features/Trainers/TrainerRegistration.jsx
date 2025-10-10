import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Col, Divider, Row, Upload, Button, Modal, Tabs } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { SiWhatsapp } from "react-icons/si";
import Logo from "../../assets/acte-logo.png";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiTimePicker from "../Common/CommonMuiTimePicker";
import CommonMultiSelect from "../Common/CommonMultiSelect";
import { UploadOutlined } from "@ant-design/icons";
import { CommonMessage } from "../Common/CommonMessage";
import { IoIosAdd } from "react-icons/io";
import { PlusOutlined } from "@ant-design/icons";
import {
  accountNumberValidator,
  addressValidator,
  emailValidator,
  ifscValidator,
  mobileValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import {
  getBatches,
  getExperience,
  getTechnologies,
  getTrainerById,
  updateTrainer,
} from "../ApiService/action";
import CommonSpinner from "../Common/CommonSpinner";
import CommonSignaturePad from "../Common/CommonSignaturePad";
import dayjs from "dayjs";
import "./styles.css";

export default function TrainerRegistration() {
  const sigCanvasRef = useRef(null);
  const navigate = useNavigate();
  const { trainer_id } = useParams();
  const [activeKey, setActiveKey] = useState("1");
  //personal details usestates
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [technologyOptions, setTechnologyOptions] = useState("");
  const [technology, setTechnology] = useState("");
  const [technologyError, setTechnologyError] = useState("");
  const [experienceOptions, setExperienceOptions] = useState("");
  const [experience, setExperience] = useState("");
  const [experienceError, setExperienceError] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [relevantExperienceError, setRelevantExperienceError] = useState("");
  const [batchOptions, setBatchOptions] = useState("");
  const [batch, setBatch] = useState("");
  const [batchError, setBatchError] = useState("");
  const [avaibilityTime, setAvaibilityTime] = useState(null);
  const [avaibilityTimeError, setAvaibilityError] = useState("");
  const [secondaryTime, setSecondaryTime] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillsError, setSkillsError] = useState("");
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState("");
  const [trainerStatus, setTrainerstatus] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  //bank details usestates
  const [trainerBankId, setTrainerBankId] = useState(null);
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountHolderNameError, setAccountHolderNameError] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountNumberError, setAccountNumberError] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankNameError, setBankNameError] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchNameError, setBranchNameError] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [ifscCodeError, setIfscCodeError] = useState("");
  const [signatureArray, setSignatureArray] = useState([]);
  const [signatureError, setSignatureError] = useState("");
  const [signatureBase64, setSignatureBase64] = useState("");
  const [isOpenSignatureModal, setIsOpenSignatureModal] = useState(false);
  const [profilePictureArray, setProfilePictureArray] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    getTechnologiesData();
  }, []);

  const getTechnologiesData = async () => {
    try {
      const response = await getTechnologies();
      console.log("technologies response", response);
      setTechnologyOptions(response?.data?.data || []);
    } catch (error) {
      setTechnologyOptions([]);
      console.log("technology error", error);
    } finally {
      getBatchData();
    }
  };

  const getBatchData = async () => {
    try {
      const response = await getBatches();
      console.log("batches response", response);
      setBatchOptions(response?.data?.data || []);
    } catch (error) {
      setBatchOptions([]);
      console.log("batch error", error);
    } finally {
      getExperienceData();
    }
  };

  const getExperienceData = async () => {
    try {
      const response = await getExperience();
      console.log("experience response", response);
      setExperienceOptions(response?.data?.data || []);
    } catch (error) {
      setExperienceOptions([]);
      console.log("experience error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        getTrainerData();
      }, 300);
    }
  };

  const getTrainerData = async () => {
    try {
      const response = await getTrainerById(trainer_id);
      console.log("trainer details", response);
      const trainerDetails = response?.data?.data;
      if (trainerDetails.is_bank_updated === 1) {
        navigate("/success");
        return;
      }
      setProfilePicture(trainerDetails.profile_image);
      const profilebase64String = trainerDetails.profile_image;
      if (profilebase64String) {
        const fileObject = {
          uid: "-1", // any unique id
          name: "signature.png",
          status: "done",
          url: `data:image/png;base64,${profilebase64String}`, // Full Data URL
        };
        setProfilePictureArray([fileObject]);
      } else {
        setProfilePictureArray([]);
      }
      setName(trainerDetails?.name);
      setEmail(trainerDetails.email);
      setMobile(trainerDetails.mobile);
      setWhatsApp(trainerDetails.whatsapp);
      setTechnology(trainerDetails.technology_id);
      setExperience(parseInt(trainerDetails.overall_exp_year));
      setRelevantExperience(parseInt(trainerDetails.relavant_exp_year));
      setBatch(trainerDetails.batch_id);
      setAvaibilityTime(dayjs(trainerDetails.availability_time, "HH:mm:ss"));
      setSecondaryTime(
        trainerDetails.secondary_time
          ? dayjs(trainerDetails.secondary_time, "HH:mm:ss")
          : null
      );
      setSkills(trainerDetails.skills);
      setLocation(trainerDetails.location);
      setTrainerstatus(trainerDetails.status);
      setTrainerBankId(trainerDetails.trainer_bank_id);
      setAccountHolderName(trainerDetails.account_holder_name);
      setAccountNumber(trainerDetails.account_number);
      setBankName(trainerDetails.bank_name);
      setBranchName(trainerDetails.branch_name);
      setIfscCode(trainerDetails.ifsc_code);
      setSignatureBase64(trainerDetails.signature_image);
      const signbase64String = trainerDetails.signature_image;
      if (signbase64String) {
        const fileObject = {
          uid: "-1", // any unique id
          name: "signature.png",
          status: "done",
          url: `data:image/png;base64,${signbase64String}`, // Full Data URL
        };
        setSignatureArray([fileObject]);
      } else {
        setSignatureArray([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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

  const handleSignatureBase64 = (base64) => {
    console.log(base64, "base64");
    setSignatureBase64(base64);
    setSignatureError("");
    setIsOpenSignatureModal(false);
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
    const technologyValidate = selectValidator(technology);
    const experienceValidate = selectValidator(experience);
    const relevantExperienceValidate = selectValidator(relevantExperience);
    const batchValidate = selectValidator(batch);
    const avaibilityTimeValidate = selectValidator(avaibilityTime);
    const skillsValidate = selectValidator(skills);
    const locationValidate = addressValidator(location);

    setNameError(nameValidate);
    setEmailError(emailValidate);
    setMobileError(mobileValidate);
    setWhatsAppError(whatsAppValidate);
    setTechnologyError(technologyValidate);
    setExperienceError(experienceValidate);
    setRelevantExperienceError(relevantExperienceValidate);
    setBatchError(batchValidate);
    setAvaibilityError(avaibilityTimeValidate);
    setSkillsError(skillsValidate);
    setLocationError(locationValidate);

    if (
      nameValidate ||
      emailValidate ||
      mobileValidate ||
      whatsAppValidate ||
      technologyValidate ||
      experienceValidate ||
      relevantExperienceValidate ||
      batchValidate ||
      avaibilityTimeValidate ||
      skillsValidate ||
      locationValidate
    )
      return;

    // alert("success");
    setActiveKey("2");
  };

  const handleSubmit = async () => {
    setValidationTrigger(true);
    const nameValidate = nameValidator(name);
    const emailValidate = emailValidator(email);
    const mobileValidate = mobileValidator(mobile);
    const whatsAppValidate = mobileValidator(whatsApp);
    const technologyValidate = selectValidator(technology);
    const experienceValidate = selectValidator(experience);
    const relevantExperienceValidate = selectValidator(relevantExperience);
    const batchValidate = selectValidator(batch);
    const avaibilityTimeValidate = selectValidator(avaibilityTime);
    const skillsValidate = selectValidator(skills);
    const locationValidate = addressValidator(location);
    const accountHolderNameValidate = nameValidator(accountHolderName);
    const accountNumberValidate = accountNumberValidator(accountNumber);
    const bankNameValidate = nameValidator(bankName);
    const branchNameValidate = nameValidator(branchName);
    const ifscCodeValidate = ifscValidator(ifscCode);
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
    setTechnologyError(technologyValidate);
    setExperienceError(experienceValidate);
    setRelevantExperienceError(relevantExperienceValidate);
    setBatchError(batchValidate);
    setAvaibilityError(avaibilityTimeValidate);
    setSkillsError(skillsValidate);
    setLocationError(locationValidate);
    setAccountHolderNameError(accountHolderNameValidate);
    setAccountNumberError(accountNumberValidate);
    setBankNameError(bankNameValidate);
    setBranchNameError(branchNameValidate);
    setIfscCodeError(ifscCodeValidate);
    setSignatureError(signatureValidate);

    if (
      nameValidate ||
      emailValidate ||
      mobileValidate ||
      whatsAppValidate ||
      technologyValidate ||
      experienceValidate ||
      relevantExperienceValidate ||
      batchValidate ||
      avaibilityTimeValidate ||
      skillsValidate ||
      locationValidate
    ) {
      setActiveKey("1");
      return;
    }

    if (
      accountHolderNameValidate ||
      accountNumberValidate ||
      bankNameValidate ||
      branchNameValidate ||
      ifscCodeValidate ||
      signatureValidate
    ) {
      return;
    }

    const payload = {
      id: trainer_id,
      trainer_name: name,
      email: email,
      mobile: mobile,
      whatsapp: whatsApp,
      technology_id: technology,
      overall_exp_year: experience,
      relevant_exp_year: relevantExperience,
      trainer_bank_id: trainerBankId,
      batch_id: batch,
      availability_time: avaibilityTime,
      secondary_time: secondaryTime,
      skills: skills,
      location: location,
      status: trainerStatus,
      profile_image: profilePicture,
      account_holder_name: accountHolderName,
      account_number: accountNumber,
      bank_name: bankName,
      branch_name: branchName,
      ifsc_code: ifscCode,
      signature_image: signatureBase64,
    };

    setButtonLoading(true);

    try {
      await updateTrainer(payload);
      CommonMessage("success", "Registered Successfully");
      setTimeout(() => {
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

  const renderPersonalDetails = () => {
    return (
      <div style={{ height: "365px", position: "relative" }}>
        <div className="logincard_innerContainer">
          <p className="trainer_registration_headings">Primary Details</p>
          <Row gutter={12}>
            <Col xs={24} sm={24} md={24} lg={6}>
              <CommonInputField
                label="Trainer Name"
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
                onChange={(e) => {
                  setMobile(e.target.value);
                  if (validationTrigger) {
                    setMobileError(mobileValidator(e.target.value));
                  }
                }}
                value={mobile}
                error={mobileError}
                onInput={(e) => {
                  if (e.target.value.length > 13) {
                    e.target.value = e.target.value.slice(0, 13);
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
                  if (e.target.value.length > 13) {
                    e.target.value = e.target.value.slice(0, 13);
                  }
                }}
              />{" "}
            </Col>
          </Row>
        </div>

        <Divider className="trainer_registration_dividers" />

        <div className="logincard_innerContainer">
          <p className="trainer_registration_headings">Secondary Details</p>
          <Row gutter={12}>
            <Col span={6}>
              <CommonSelectField
                label="Technology"
                required={true}
                options={technologyOptions}
                onChange={(e) => {
                  setTechnology(e.target.value);
                  if (validationTrigger) {
                    setTechnologyError(selectValidator(e.target.value));
                  }
                }}
                value={technology}
                error={technologyError}
                valueMarginTop="-4px"
              />
            </Col>

            <Col span={6}>
              <CommonSelectField
                label="Experience"
                required={true}
                options={experienceOptions}
                onChange={(e) => {
                  setExperience(e.target.value);
                  if (validationTrigger) {
                    setExperienceError(selectValidator(e.target.value));
                  }
                }}
                value={experience}
                error={experienceError}
                valueMarginTop="-4px"
              />
            </Col>

            <Col span={6}>
              <CommonSelectField
                label="Relevant Experience"
                required={true}
                options={experienceOptions}
                onChange={(e) => {
                  setRelevantExperience(e.target.value);
                  if (validationTrigger) {
                    setRelevantExperienceError(selectValidator(e.target.value));
                  }
                }}
                value={relevantExperience}
                error={relevantExperienceError}
                valueMarginTop="-4px"
                errorFontSize="9.9px"
              />
            </Col>

            <Col span={6}>
              <CommonSelectField
                label="Batch"
                required={true}
                options={batchOptions}
                onChange={(e) => {
                  setBatch(e.target.value);
                  if (validationTrigger) {
                    setBatchError(selectValidator(e.target.value));
                  }
                }}
                value={batch}
                error={batchError}
                valueMarginTop="-4px"
              />
            </Col>
          </Row>

          <Row gutter={12} style={{ marginTop: "30px", marginBottom: "25px" }}>
            <Col span={6}>
              <CommonMuiTimePicker
                label="Avaibility Time"
                required={true}
                onChange={(value) => {
                  setAvaibilityTime(value);
                  console.log("timeeeeeeee", value);
                  if (validationTrigger) {
                    setAvaibilityError(selectValidator(value));
                  }
                }}
                value={avaibilityTime}
                error={avaibilityTimeError}
              />
            </Col>
            <Col span={6}>
              <CommonMuiTimePicker
                label="Secondary Time"
                required={true}
                onChange={(value) => {
                  setSecondaryTime(value);
                }}
                value={secondaryTime}
              />
            </Col>
            <Col span={6}>
              <CommonMultiSelect
                label="Skills"
                required={true}
                onChange={(e, selectedValues) => {
                  setSkills(selectedValues);
                  if (validationTrigger) {
                    setSkillsError(selectValidator(selectedValues));
                  }
                }}
                value={skills}
                error={skillsError}
              />
            </Col>
            <Col span={6}>
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

  const renderBankDetails = () => {
    return (
      <div style={{ height: "365px", position: "relative" }}>
        <div className="logincard_innerContainer">
          <p className="trainer_registration_headings">Bank Details</p>
          <Row gutter={12}>
            <Col span={6}>
              <CommonInputField
                label="Account Holder Name"
                required={true}
                onChange={(e) => {
                  setAccountHolderName(e.target.value);
                  if (validationTrigger) {
                    setAccountHolderNameError(nameValidator(e.target.value));
                  }
                }}
                value={accountHolderName}
                error={accountHolderNameError}
                errorFontSize="9px"
              />
            </Col>
            <Col span={6}>
              <CommonInputField
                label="Account Number"
                required={true}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  if (validationTrigger) {
                    setAccountNumberError(
                      accountNumberValidator(e.target.value)
                    );
                  }
                }}
                value={accountNumber}
                error={accountNumberError}
              />
            </Col>
            <Col span={6}>
              <CommonInputField
                label="Bank Name"
                required={true}
                onChange={(e) => {
                  setBankName(e.target.value);
                  if (validationTrigger) {
                    setBankNameError(nameValidator(e.target.value));
                  }
                }}
                value={bankName}
                error={bankNameError}
              />
            </Col>
            <Col span={6}>
              <CommonInputField
                label="Branch Name"
                required={true}
                onChange={(e) => {
                  setBranchName(e.target.value);
                  if (validationTrigger) {
                    setBranchNameError(nameValidator(e.target.value));
                  }
                }}
                value={branchName}
                error={branchNameError}
              />
            </Col>
          </Row>

          <Row gutter={12} style={{ marginTop: "40px" }}>
            <Col span={6}>
              <CommonInputField
                label="IFSC Code"
                required={true}
                onChange={(e) => {
                  setIfscCode(e.target.value.toUpperCase());
                  if (validationTrigger) {
                    setIfscCodeError(ifscValidator(e.target.value));
                  }
                }}
                value={ifscCode}
                error={ifscCodeError}
              />
            </Col>
            <Col span={6} style={{ position: "relative", display: "flex" }}>
              {signatureBase64 ? (
                <div style={{ display: "flex", gap: "6px" }}>
                  <div>
                    <p style={{ fontWeight: 500, color: "#333" }}>Signature</p>
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
      label: "Bank Details",
      children: renderBankDetails(),
    },
  ];

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

              {/* <p className="trainer_registration_heading">
                Trainer Registration Form
              </p> */}
            </div>
            <div>
              <p className="trainer_registration_heading">
                Trainer Registration Form
              </p>
            </div>
            <Upload
              listType="picture-circle"
              accept=".png,.jpg,.jpeg"
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

        {/* <Divider className="trainer_registration_dividers" /> */}
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
