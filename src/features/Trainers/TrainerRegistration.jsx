import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Col,
  Divider,
  Row,
  Upload,
  Button,
  Modal,
  Tabs,
  Select,
  Checkbox,
} from "antd";
import CommonInputField from "../Common/CommonInputField";
import { IoCaretDownSharp } from "react-icons/io5";
import Logo from "../../assets/acte-logo.png";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiTimePicker from "../Common/CommonMuiTimePicker";
import { CommonMessage } from "../Common/CommonMessage";
import { PlusOutlined } from "@ant-design/icons";
import {
  accountNumberValidator,
  addressValidator,
  emailValidator,
  getCountryFromDialCode,
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
  getTrainerSkills,
  updateTrainer,
} from "../ApiService/action";
import CommonSpinner from "../Common/CommonSpinner";
import CommonSignaturePad from "../Common/CommonSignaturePad";
import dayjs from "dayjs";
import "./styles.css";
import PhoneWithCountry from "../Common/PhoneWithCountry";

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
  const [mobileCountryCode, setMobileCountryCode] = useState("");
  const [mobileCountry, setMobileCountry] = useState("in");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [whatsAppCountry, setWhatsAppCountry] = useState("in");
  const [whatsAppCountryCode, setWhatsAppCountryCode] = useState("");
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
  const [skillsOptions, setSkillsOptions] = useState([]);
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
        getSkillsData();
      }, 300);
    }
  };

  const getSkillsData = async (call_api) => {
    try {
      const response = await getTrainerSkills();
      console.log("skills response", response);
      setSkillsOptions(response?.data?.data || []);
    } catch (error) {
      setSkillsOptions([]);
      console.log("skills error", error);
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
      //mobile fetch
      setMobileCountryCode(
        trainerDetails.mobile_phone_code ? trainerDetails.mobile_phone_code : ""
      );
      const selected_mobile_country = getCountryFromDialCode(
        `+${
          trainerDetails.mobile_phone_code
            ? trainerDetails.mobile_phone_code
            : ""
        }`
      );
      setMobileCountry(selected_mobile_country);
      setMobile(trainerDetails.mobile);
      //whatsapp fetch
      setWhatsAppCountryCode(
        trainerDetails.whatsapp_phone_code
          ? trainerDetails.whatsapp_phone_code
          : ""
      );
      const selected_whatsapp_country = getCountryFromDialCode(
        `+${
          trainerDetails.whatsapp_phone_code
            ? trainerDetails.whatsapp_phone_code
            : ""
        }`
      );
      setWhatsAppCountry(selected_whatsapp_country);
      setWhatsApp(trainerDetails.whatsapp);
      //-----------
      setTechnology(trainerDetails.technology_id);
      setExperience(parseInt(trainerDetails.overall_exp_year));
      setRelevantExperience(parseInt(trainerDetails.relavant_exp_year));
      setBatch(trainerDetails.batch_id);
      setAvaibilityTime(
        trainerDetails.availability_time ? trainerDetails.availability_time : ""
      );
      setSecondaryTime(
        trainerDetails.secondary_time ? trainerDetails.secondary_time : ""
      );
      const getSkillsIds = trainerDetails.skills.map((s) => {
        return s.id;
      });
      setSkills(getSkillsIds);
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
    const skillsValidate = selectValidator(skills);
    const locationValidate = addressValidator(location);
    const accountHolderNameValidate = nameValidator(accountHolderName);
    const accountNumberValidate = accountNumberValidator(accountNumber);
    const bankNameValidate = nameValidator(bankName);
    const branchNameValidate = nameValidator(branchName);
    const ifscCodeValidate = ifscValidator(ifscCode);
    let signatureValidate;

    if (signatureBase64 == "") {
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
      mobile_phone_code: mobileCountryCode,
      mobile: mobile,
      whatsapp_phone_code: whatsAppCountryCode,
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
      is_bank_updated: 1,
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
      <div style={{ height: "auto", position: "relative" }}>
        <div className="logincard_innerContainer">
          <p className="trainer_registration_headings">Primary Details</p>
          <Row gutter={12}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
                disabled={true}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
              <PhoneWithCountry
                label="Mobile Number"
                onChange={(value) => {
                  setMobile(value);
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
                disabled={true}
                disableCountrySelect={true}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
              <PhoneWithCountry
                label="WhatsApp Number"
                onChange={(value) => {
                  setWhatsApp(value);
                }}
                countryCode={(code) => {
                  setWhatsAppCountryCode(code);
                }}
                selectedCountry={whatsAppCountry}
                value={whatsApp}
                onCountryChange={(iso2) => {
                  setWhatsAppCountry(iso2);
                }}
                disabled={true}
                disableCountrySelect={true}
              />
            </Col>
          </Row>
        </div>

        <Divider className="trainer_registration_dividers" />

        <div className="logincard_innerContainer">
          <p className="trainer_registration_headings">Secondary Details</p>
          <Row gutter={12}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
                disabled={true}
              />
            </Col>

            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
                disabled={true}
              />
            </Col>

            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
                disabled={true}
              />
            </Col>

            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
                disabled={true}
              />
            </Col>
          </Row>

          <Row gutter={12} style={{ marginTop: "30px", marginBottom: "25px" }}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
                disabled={true}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
              <CommonMuiTimePicker
                label="Secondary Time"
                required={true}
                onChange={(value) => {
                  setSecondaryTime(value);
                }}
                value={secondaryTime}
                disabled={true}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
              <div style={{ position: "relative", height: "auto" }}>
                <p className={"trainer_skillslabel"}>Skills</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Select
                      className={
                        skills.length <= 0 && !skillsError
                          ? "trainer_skills_multiselect"
                          : skills.length >= 1 && !skillsError
                          ? "trainer_skills_multiselect_two"
                          : skills.length <= 0 && skillsError
                          ? "trainer_skills_multiselect_error"
                          : "trainer_skills_multiselect"
                      }
                      style={{ width: "100%" }}
                      suffixIcon={<IoCaretDownSharp color="rgba(0,0,0,0.54)" />}
                      disabled={true}
                      mode="multiple"
                      allowClear
                      showSearch
                      value={skills} // Only real selected values
                      onChange={(value) => {
                        console.log("skilllll", value);
                        setSkills(value);
                        if (validationTrigger) {
                          setSkillsError(selectValidator(value));
                        }
                      }}
                      status={skillsError ? "error" : ""}
                      optionLabelProp="label"
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {skillsOptions.map((item) => {
                        const itemValue = item.id;
                        const itemLabel = item.name;

                        return (
                          <Select.Option
                            key={itemValue}
                            value={itemValue}
                            label={itemLabel}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                textWrap: "wrap",
                              }}
                            >
                              <Checkbox
                                checked={skills.includes(itemValue)}
                                style={{ marginRight: 8 }}
                                className="common_antdmultiselect_checkbox"
                              />
                              {itemLabel}
                            </div>
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </div>
                </div>
                {skillsError && (
                  <p className="trainer_skills_error">Skills {skillsError}</p>
                )}
              </div>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
                disabled={true}
              />
            </Col>
          </Row>
        </div>
        <div className="trainer_registration_nextbuttonContainer">
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
      <div className="customerregistration_formcontainer">
        <div className="logincard_innerContainer">
          <p className="trainer_registration_headings">Bank Details</p>
          <Row gutter={12}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
            >
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
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={6}
              className="trainer_registration_primarydetails_col_container"
              style={{ position: "relative", display: "flex" }}
            >
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
        <div className="customer_registration_submitbuttonContainer">
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
    <div className="customerregistration_mainContainer">
      <div className="customerregistration_card">
        <div className="customerregistration_innerContainer">
          <Row style={{ display: "flex" }}>
            <Col xs={24} sm={24} md={8} lg={8}>
              <img src={Logo} className="trainer_registration_logo" />
              <p
                className="trainer_registration_logotext"
                style={{ color: "#1b538c" }}
              >
                Technologies
              </p>
              <p
                style={{
                  color: "#1b538c",
                  fontWeight: "bold",
                  marginTop: "1px",
                  letterSpacing: "0.3px",
                }}
              >
                Private Limited
              </p>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              style={{
                display: "flex",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              <p className="trainer_registration_heading">
                Trainer Registration Form
              </p>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              className="customerregistration_profileimage_container"
            >
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
            </Col>
          </Row>
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
        className="customerregistration_signaturemodal"
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
