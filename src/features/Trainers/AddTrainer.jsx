import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import {
  Row,
  Col,
  Upload,
  Tooltip,
  Select,
  Checkbox,
  Modal,
  Radio,
  Input,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { MdAdd } from "react-icons/md";
import { IoCaretDownSharp } from "react-icons/io5";

import CommonInputField from "../Common/CommonInputField";
import PhoneWithCountry from "../Common/PhoneWithCountry";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiTimePicker from "../Common/CommonMuiTimePicker";

import {
  addressValidator,
  emailValidator,
  formatToBackendIST,
  getCountryFromDialCode,
  mobileValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";

import {
  createTrainer,
  updateTrainer,
  getTrainerBanks,
  getTrainerById,
} from "../ApiService/action";

import { CommonMessage } from "../Common/CommonMessage";
import CommonTextArea from "../Common/CommonTextArea";

const AddTrainer = forwardRef(
  (
    {
      editTrainerId,
      editTrainerData,
      technologyOptions,
      experienceOptions,
      batchOptions,
      skillsOptions,
      setIsOpenAddCourseModal,
      setIsOpenAddSkillModal,
      callgetTrainersApi,
      setButtonLoading,
      previousStatus,
      setStatus,
      setPreviousStatus,
    },
    ref,
  ) => {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [mobileCountryCode, setMobileCountryCode] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("in");
    const [mobile, setMobile] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [whatsAppCountry, setWhatsAppCountry] = useState("in");
    const [whatsAppCountryCode, setWhatsAppCountryCode] = useState("");
    const [whatsApp, setWhatsApp] = useState("");
    const [whatsAppError, setWhatsAppError] = useState("");
    const [technology, setTechnology] = useState("");
    const [technologyError, setTechnologyError] = useState("");
    const [isTechnologyFocused, setIsTechnologyFocused] = useState(false);
    const [isTechnologyHovered, setIsTechnologyHovered] = useState(false);
    const [experience, setExperience] = useState("");
    const [experienceError, setExperienceError] = useState("");
    const [relevantExperience, setRelevantExperience] = useState("");
    const [relevantExperienceError, setRelevantExperienceError] = useState("");
    const [batch, setBatch] = useState("");
    const [batchError, setBatchError] = useState("");
    const [avaibilityTime, setAvaibilityTime] = useState(null);
    const [secondaryTime, setSecondaryTime] = useState("");
    const [skills, setSkills] = useState([]);
    const [skillsError, setSkillsError] = useState("");
    const [isSkillFocused, setIsSkillFocused] = useState(false);
    const [isSkillHovered, setIsSkillHovered] = useState(false);
    const [location, setLocation] = useState("");
    const [locationError, setLocationError] = useState("");
    const [validationTrigger, setValidationTrigger] = useState(false);

    const [profilePictureArray, setProfilePictureArray] = useState([]);
    const [profilePictureBase64, setProfilePictureBase64] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [trainerMainStatus, setTrainerMainStatus] = useState("");
    const [trainerCurrentStatus, setTrainerCurrentStatus] = useState("Active");

    const [trainerBankId, setTrainerBankId] = useState(null);
    const [accountHolderName, setAccountHolderName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [bankName, setBankName] = useState("");
    const [branchName, setBranchName] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [signatureImage, setSignatureImage] = useState("");

    const [trainerBanksList, setTrainerBanksList] = useState([]);

    const [secondarySkills, setSecondarySkills] = useState([]);
    const [secondarySkillsError, setSecondarySkillsError] = useState("");

    const [certifications, setCertifications] = useState([]);

    const [preferredDays, setPreferredDays] = useState([]);
    const [preferredDaysError, setPreferredDaysError] = useState("");

    const [trainerType, setTrainerType] = useState("Freelancer");

    const [preferredMode, setPreferredMode] = useState([]);

    const [salaryExpectation, setSalaryExpectation] = useState("");
    const [salaryType, setSalaryType] = useState("Per session");

    const [languagesKnown, setLanguagesKnown] = useState([]);
    const [languagesKnownError, setLanguagesKnownError] = useState("");

    const [additionalNotes, setAdditionalNotes] = useState("");

    const preferredDaysOptions = [
      { id: "Available Every Day", name: "Available Every Day" },
      { id: "Sunday", name: "Sunday" },
      { id: "Monday", name: "Monday" },
      { id: "Tuesday", name: "Tuesday" },
      { id: "Wednesday", name: "Wednesday" },
      { id: "Thursday", name: "Thursday" },
      { id: "Friday", name: "Friday" },
      { id: "Saturday", name: "Saturday" },
    ];

    const languagesKnownOptions = [
      { id: "English", name: "English" },
      { id: "Hindi", name: "Hindi" },
      { id: "Tamil", name: "Tamil" },
      { id: "Telugu", name: "Telugu" },
      { id: "Malayalam", name: "Malayalam" },
      { id: "Kannada", name: "Kannada" },
    ];

    const SectionHeader = ({ number, text }) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "32px",
          }}
        >
          <div className="addnewlead_card_heading_circleicon">{number}</div>
          <span className="addnewlead_card_headings">{text}</span>
        </div>
      );
    };

    const cardStyle = {
      background: "#fff",
      padding: "16px 24px 24px 24px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      boxShadow: "rgba(0, 0, 0, 0.04) 0px 1px 3px",
      marginBottom: "12px",
    };

    useEffect(() => {
      const fetchTrainerData = async () => {
        if (editTrainerId) {
          try {
            const response = await getTrainerById(editTrainerId);
            const rawItem = response?.data?.data;
            const item = Array.isArray(rawItem) ? rawItem[0] : rawItem;
            if (!item) return;

            if (item.profile_image) {
              setProfilePictureArray([
                {
                  uid: "-1",
                  name: "profile.jpg",
                  status: "done",
                  url: item.profile_image,
                },
              ]);
            } else {
              setProfilePictureArray([]);
            }
            setProfilePictureBase64(item.profile_image);
            setName(item.name || "");
            setEmail(item.email || "");

            setMobileCountryCode(
              item.mobile_phone_code ? item.mobile_phone_code : "",
            );
            const selected_mobile_country = getCountryFromDialCode(
              `+${item.mobile_phone_code ? item.mobile_phone_code : ""}`,
            );
            setSelectedCountry(selected_mobile_country);
            setMobile(item.mobile || "");

            setWhatsAppCountryCode(
              item.whatsapp_phone_code ? item.whatsapp_phone_code : "",
            );
            const selected_whatsapp_country = getCountryFromDialCode(
              `+${item.whatsapp_phone_code ? item.whatsapp_phone_code : ""}`,
            );
            setWhatsAppCountry(selected_whatsapp_country);
            setWhatsApp(item.whatsapp || "");

            setTrainerMainStatus(item?.status);
            setTrainerCurrentStatus(item.trainer_status);
            setTechnology(item.technology_id);
            setExperience(parseInt(item.overall_exp_year));
            setRelevantExperience(parseInt(item.relavant_exp_year));
            setBatch(item.batch_id);
            setLocation(item.location || "");
            setAvaibilityTime(
              item.availability_time ? item.availability_time : "",
            );
            setSecondaryTime(item.secondary_time ? item.secondary_time : "");
            const getSkillsIds = item.skills
              ? item.skills.map((s) => s.id)
              : [];
            setSkills(getSkillsIds);

            setTrainerBankId(item.trainer_bank_id);
            setAccountHolderName(item.account_holder_name || "");
            setAccountNumber(item.account_number || "");
            setBankName(item.bank_name || "");
            setBranchName(item.branch_name || "");
            setIfscCode(item.ifsc_code || "");
            setSignatureImage(item.signature_image || "");

            setSecondarySkills(item.secondary_skills || []);
            setCertifications(item.certifications || []);
            setPreferredDays(item.preferred_days || []);
            setTrainerType(item.trainer_type || "");
            setPreferredMode(item.preferred_mode || []);
            setSalaryExpectation(item.salary_expectation || "");
            setSalaryType(item.salary_type || "Per session");
            setLanguagesKnown(
              item.language_known || item.languages_known || [],
            );
            setAdditionalNotes(item.additional_notes || "");

            getTrainerBanks(item?.id)
              .then((response) => {
                const bank_details = response.data?.data || [];
                if (bank_details.length >= 1) {
                  const updateData = bank_details.filter(
                    (f) => f.account_number != "",
                  );
                  setTrainerBanksList(updateData);
                  if (updateData.length > 0) {
                    const primaryBank = updateData[0];
                    setTrainerBankId(primaryBank.id);
                    setAccountHolderName(primaryBank.account_holder_name || "");
                    setAccountNumber(primaryBank.account_number || "");
                    setBankName(primaryBank.bank_name || "");
                    setBranchName(primaryBank.branch_name || "");
                    setIfscCode(primaryBank.ifsc_code || "");
                  }
                } else {
                  setTrainerBanksList([]);
                }
              })
              .catch((error) => {
                console.log("trainer bank error", error);
                setTrainerBanksList([]);
              });
          } catch (error) {
            console.log("Error fetching trainer by id", error);
          }
        }
      };

      fetchTrainerData();
    }, [editTrainerId]);

    useImperativeHandle(ref, () => ({
      handleSubmit,
      resetForm,
    }));

    const handleSubmit = async () => {
      setValidationTrigger(true);
      const nameValidate = nameValidator(name);
      const emailValidate = emailValidator(email);
      const mobileValidate = mobileValidator(mobile, selectedCountry);
      const whatsAppValidate = mobileValidator(whatsApp, whatsAppCountry);
      const technologyValidate = selectValidator(technology);
      const experienceValidate = selectValidator(experience);
      const relevantExperienceValidate = selectValidator(relevantExperience);
      const batchValidate = selectValidator(batch);
      const skillsValidate = selectValidator(skills);
      const preferredDaysValidate = selectValidator(preferredDays);
      const languagesValidate = selectValidator(languagesKnown);
      const locationValidate = addressValidator(location);
      // Optional fields that we don't strictly validate format for now, just empty string fallback if needed
      // Actually location is not in UI anymore, but keep validation if backend requires it. Wait, location was removed in UI? I'll re-add it or skip its validation. Let's skip location validate since it's not in the mockup.

      setNameError(nameValidate);
      setEmailError(emailValidate);
      setMobileError(mobileValidate);
      setWhatsAppError(whatsAppValidate);
      setTechnologyError(technologyValidate);
      setExperienceError(experienceValidate);
      setRelevantExperienceError(relevantExperienceValidate);
      setBatchError(batchValidate);
      setSkillsError(skillsValidate);
      setPreferredDaysError(preferredDaysValidate);
      setLanguagesKnownError(languagesValidate);
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
        preferredDaysValidate ||
        languagesValidate ||
        locationValidate
      ) {
        return;
      }

      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      const today = new Date();
      const payload = {
        ...(editTrainerId && { id: editTrainerId }),
        trainer_name: name,
        email: email,
        mobile_phone_code: mobileCountryCode,
        mobile: mobile,
        whatsapp_phone_code: whatsAppCountryCode,
        whatsapp: whatsApp,
        technology_id: technology,
        overall_exp_year: experience,
        relevant_exp_year: relevantExperience,
        batch_id: batch,
        availability_time: avaibilityTime,
        secondary_time: secondaryTime,
        skills: skills,
        location: location,
        status: trainerMainStatus,
        profile_image: profilePictureBase64,
        trainer_bank_id: trainerBankId,
        account_holder_name: accountHolderName,
        account_number: accountNumber,
        bank_name: bankName,
        branch_name: branchName,
        ifsc_code: ifscCode,
        signature_image: signatureImage,
        secondary_skills: secondarySkills,
        certifications: certifications,
        preferred_days: preferredDays,
        trainer_type: trainerType,
        preferred_mode: preferredMode,
        salary_expectation: salaryExpectation,
        salary_type: salaryType,
        language_known: languagesKnown,
        trainer_status: trainerCurrentStatus,
        additional_notes: additionalNotes,
        ...(!editTrainerId
          ? {
              created_by:
                converAsJson && converAsJson.user_id
                  ? converAsJson.user_id
                  : "",
            }
          : {}),
        created_date: formatToBackendIST(today),
      };

      if (editTrainerId) {
        if (setButtonLoading) setButtonLoading(true);
        try {
          await updateTrainer(payload);
          CommonMessage("success", "Trainer Updated");

          setTimeout(() => {
            if (setButtonLoading) setButtonLoading(false);
            resetForm();
            if (previousStatus !== null) {
              if (setStatus) setStatus(previousStatus);
              if (setPreviousStatus) setPreviousStatus(null);
            }
            if (callgetTrainersApi) callgetTrainersApi();
          }, 300);
        } catch (error) {
          if (setButtonLoading) setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      } else {
        if (setButtonLoading) setButtonLoading(true);
        try {
          await createTrainer(payload);
          CommonMessage("success", "Trainer Created");

          setTimeout(() => {
            if (setButtonLoading) setButtonLoading(false);
            resetForm();
            if (previousStatus !== null) {
              if (setStatus) setStatus(previousStatus);
              if (setPreviousStatus) setPreviousStatus(null);
            }
            if (callgetTrainersApi) callgetTrainersApi();
          }, 300);
        } catch (error) {
          if (setButtonLoading) setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      }
    };

    const resetForm = () => {
      setName("");
      setNameError("");
      setEmail("");
      setEmailError("");
      setMobile("");
      setMobileError("");
      setWhatsApp("");
      setWhatsAppError("");
      setTechnology("");
      setTechnologyError("");
      setExperience("");
      setExperienceError("");
      setRelevantExperience("");
      setRelevantExperienceError("");
      setBatch("");
      setBatchError("");
      setAvaibilityTime(null);
      setSecondaryTime("");
      setSkills([]);
      setSkillsError("");
      setLocation("");
      setLocationError("");
      setProfilePictureArray([]);
      setProfilePictureBase64("");
      setSignatureImage("");
      setSecondarySkills([]);
      setSecondarySkillsError("");
      setCertifications([]);
      setPreferredDays([]);
      setPreferredDaysError("");
      setTrainerType("Freelancer");
      setPreferredMode([]);
      setSalaryExpectation("");
      setSalaryType("Per session");
      setTrainerCurrentStatus("Active");
      setLanguagesKnown([]);
      setLanguagesKnownError("");
      setAdditionalNotes("");
      setValidationTrigger(false);
    };

    const handleProfileAttachment = ({ fileList: newFileList }) => {
      if (newFileList.length <= 0) {
        setProfilePictureArray([]);
        setProfilePictureBase64("");
        return;
      }
      const file = newFileList[0].originFileObj;
      const isValidType =
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg";
      const isValidSize = file.size <= 1024 * 1024;
      if (isValidType && isValidSize) {
        setProfilePictureArray(newFileList);
        CommonMessage("success", "Profile uploaded");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64String = reader.result;
          setProfilePictureBase64(base64String);
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
        const dataUrl = reader.result;
        setPreviewImage(dataUrl);
        setPreviewOpen(true);
      };
    };

    const handleRemoveProfile = (fileToRemove) => {
      const newFileList = profilePictureArray.filter(
        (file) => file.uid !== fileToRemove.uid,
      );
      setProfilePictureArray(newFileList);
    };

    return (
      <div
        style={{
          minHeight: "calc(100vh - 180px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, paddingBottom: "40px" }}>
          <div style={{ marginBottom: "20px" }}>
            {editTrainerId && (
              <div
                className="customerupdate_profilepicture_container"
                style={{ marginTop: "20px" }}
              >
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
            )}
            {/* Card 1: Personal Information */}
            <div style={cardStyle}>
              <SectionHeader number="1" text="Personal Information" />
              <Row gutter={16}>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Trainer Name<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <CommonInputField
                      errorLabel="Trainer Name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (validationTrigger) {
                          setNameError(nameValidator(e.target.value));
                        }
                      }}
                      error={nameError}
                      required={true}
                      errorFontSize={"9px"}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Trainer Email<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <CommonInputField
                      errorLabel="Trainer Email"
                      required={true}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validationTrigger) {
                          setEmailError(emailValidator(e.target.value));
                        }
                      }}
                      value={email}
                      error={emailError}
                      errorFontSize={"9px"}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Mobile Number<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <PhoneWithCountry
                      errorLabel="Mobile Number"
                      onChange={(value, countryIso2) => {
                        setMobile(value);
                        const activeCountry = countryIso2 || selectedCountry;
                        if (validationTrigger) {
                          setMobileError(mobileValidator(value, activeCountry));
                        }
                      }}
                      selectedCountry={selectedCountry}
                      countryCode={(code) => {
                        setMobileCountryCode(code);
                      }}
                      error={mobileError}
                      errorFontSize={"9px"}
                      onCountryChange={(iso2) => {
                        setSelectedCountry(iso2);
                        setWhatsAppCountry(iso2);
                      }}
                      value={mobile}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      WhatsApp Number
                      <span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <PhoneWithCountry
                      errorLabel="WhatsApp Number"
                      onChange={(value, countryIso2) => {
                        setWhatsApp(value);
                        const activeCountry = countryIso2 || whatsAppCountry;
                        if (validationTrigger) {
                          setWhatsAppError(
                            mobileValidator(value, activeCountry),
                          );
                        }
                      }}
                      countryCode={(code) => {
                        setWhatsAppCountryCode(code);
                      }}
                      selectedCountry={whatsAppCountry}
                      value={whatsApp}
                      error={whatsAppError}
                      errorFontSize={"9px"}
                      onCountryChange={(iso2) => {
                        setWhatsAppCountry(iso2);
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* Card 2: Professional Information */}
            <div style={cardStyle}>
              <SectionHeader number="2" text="Professional Information" />
              <Row gutter={16}>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Technology<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                      onMouseEnter={() => setIsTechnologyHovered(true)}
                      onMouseLeave={() => setIsTechnologyHovered(false)}
                    >
                      <div style={{ flex: 1 }}>
                        <CommonSelectField
                          errorLabel="Technology"
                          required={true}
                          options={technologyOptions}
                          onChange={(e) => {
                            setTechnology(e.target.value);
                            if (validationTrigger) {
                              setTechnologyError(
                                selectValidator(e.target.value),
                              );
                            }
                          }}
                          value={technology}
                          error={technologyError}
                          errorFontSize={"9px"}
                          valueMarginTop="-4px"
                          borderRightNone={true}
                          onFocus={() => setIsTechnologyFocused(true)}
                          onBlur={() => setIsTechnologyFocused(false)}
                        />
                      </div>
                      <div
                        className={
                          technologyError
                            ? "leads_errorcourse_addcontainer"
                            : isTechnologyFocused
                              ? "leads_focusedcourse_addcontainer"
                              : isTechnologyHovered
                                ? "leads_hovercourse_addcontainer"
                                : "leads_course_addcontainer"
                        }
                        style={{ height: "auto", minHeight: "36px" }}
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
                </Col>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Experience<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <CommonSelectField
                      errorLabel="Experience"
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
                      errorFontSize={"9px"}
                      valueMarginTop="-4px"
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Relevant Experience
                      <span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <CommonSelectField
                      errorLabel="Relevant Experience"
                      options={experienceOptions}
                      required={true}
                      onChange={(e) => {
                        setRelevantExperience(e.target.value);
                        if (validationTrigger) {
                          setRelevantExperienceError(
                            selectValidator(e.target.value),
                          );
                        }
                      }}
                      value={relevantExperience}
                      error={relevantExperienceError}
                      valueMarginTop="-4px"
                      errorFontSize="9px"
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Batch<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <CommonSelectField
                      errorLabel="Batch"
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
                  </div>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: "40px" }}>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Skills<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                      onMouseEnter={() => setIsSkillHovered(true)}
                      onMouseLeave={() => setIsSkillHovered(false)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
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
                          onFocus={() => setIsSkillFocused(true)}
                          onBlur={() => setIsSkillFocused(false)}
                          suffixIcon={
                            <IoCaretDownSharp color="rgba(0,0,0,0.54)" />
                          }
                          mode="multiple"
                          allowClear
                          showSearch
                          value={skills}
                          onChange={(value) => {
                            setSkills(value);
                            if (validationTrigger) {
                              setSkillsError(selectValidator(value));
                            }
                          }}
                          status={skillsError ? "error" : ""}
                          optionLabelProp="label"
                          filterOption={(input, option) =>
                            option.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
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
                      <div
                        className={
                          skillsError
                            ? "leads_errorcourse_addcontainer"
                            : isSkillFocused
                              ? "leads_focusedcourse_addcontainer"
                              : isSkillHovered
                                ? "leads_hovercourse_addcontainer"
                                : "leads_course_addcontainer"
                        }
                        style={{ height: "auto", minHeight: "36px" }}
                      >
                        <Tooltip
                          placement="bottom"
                          title="Add Skill"
                          className="leadtable_customertooltip"
                        >
                          <MdAdd
                            size={19}
                            style={{ color: "#333333af", cursor: "pointer" }}
                            onClick={() => setIsOpenAddSkillModal(true)}
                          />
                        </Tooltip>
                      </div>
                    </div>
                    {skillsError && (
                      <p className="trainer_skills_error">
                        Skills {skillsError}
                      </p>
                    )}
                  </div>
                </Col>

                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>Certifications</p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Select
                          className={
                            certifications.length <= 0
                              ? "trainer_certificate_field"
                              : "trainer_certificate_multiselect_two"
                          }
                          style={{ width: "100%" }}
                          mode="tags"
                          allowClear
                          placeholder="Type and press enter"
                          value={certifications}
                          onChange={(value) => {
                            setCertifications(value);
                          }}
                          status={""}
                          open={false}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Card 3: Availability Details */}
            <div style={cardStyle}>
              <SectionHeader number="3" text="Availability Details" />
              <Row gutter={16}>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Availability Time
                      <span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <CommonMuiTimePicker
                      errorLabel="Availability Time"
                      required={false}
                      onChange={(value) => {
                        setAvaibilityTime(value);
                      }}
                      value={avaibilityTime}
                      allowClear={true}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>Secondary Time</p>
                    <CommonMuiTimePicker
                      errorLabel="Secondary Time"
                      required={false}
                      onChange={(value) => {
                        setSecondaryTime(value);
                      }}
                      value={secondaryTime}
                      allowClear={true}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ position: "relative", height: "auto" }}>
                    <p className={"trainer_skillslabel"}>
                      Preferred Days<span style={{ color: "#d32f2f" }}> *</span>
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Select
                          className={
                            preferredDays.length <= 0 && !preferredDaysError
                              ? "trainer_certificate_field"
                              : preferredDays.length >= 1 && !preferredDaysError
                                ? "trainer_certificate_multiselect_two"
                                : preferredDays.length <= 0 &&
                                    preferredDaysError
                                  ? "trainer_certificate_field_error"
                                  : "trainer_certificate_field"
                          }
                          style={{ width: "100%" }}
                          suffixIcon={
                            <IoCaretDownSharp color="rgba(0,0,0,0.54)" />
                          }
                          mode="multiple"
                          allowClear
                          showSearch
                          value={preferredDays}
                          onChange={(value) => {
                            setPreferredDays(value);
                            if (validationTrigger) {
                              setPreferredDaysError(selectValidator(value));
                            }
                          }}
                          status={preferredDaysError ? "error" : ""}
                          optionLabelProp="label"
                          filterOption={(input, option) =>
                            option.label
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {preferredDaysOptions.map((item) => {
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
                                    checked={preferredDays.includes(itemValue)}
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
                    {preferredDaysError && (
                      <p className="trainer_skills_error">
                        Preferred Days {preferredDaysError}
                      </p>
                    )}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Card 4: Additional Information */}
            <div style={cardStyle}>
              <SectionHeader number="4" text="Additional Information" />
              <Row gutter={16} align="stretch">
                <Col span={12}>
                  <Row gutter={12}>
                    <Col span={12}>
                      <p className="trainer_skillslabel">Trainer Type</p>
                      <Radio.Group
                        className="small-radio-group"
                        onChange={(e) => setTrainerType(e.target.value)}
                        value={trainerType}
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          rowGap: "6px",
                        }}
                      >
                        <Radio value="Freelancer" style={{ fontSize: "13px" }}>
                          Freelancer
                        </Radio>
                        <Radio value="Full Time" style={{ fontSize: "13px" }}>
                          Full Time
                        </Radio>
                        <Radio value="Part Time" style={{ fontSize: "13px" }}>
                          Part Time
                        </Radio>
                      </Radio.Group>
                    </Col>
                    <Col span={12}>
                      <p className="trainer_skillslabel">Preferred Mode</p>
                      <Checkbox.Group
                        value={preferredMode}
                        onChange={(checkedValues) =>
                          setPreferredMode(checkedValues)
                        }
                        style={{ paddingTop: "6px" }}
                      >
                        <Checkbox value="Online" style={{ fontSize: "13px" }}>
                          Online
                        </Checkbox>
                        <Checkbox value="Offline" style={{ fontSize: "13px" }}>
                          Offline
                        </Checkbox>
                        <Checkbox value="Hybrid" style={{ fontSize: "13px" }}>
                          Hybrid
                        </Checkbox>
                      </Checkbox.Group>
                    </Col>
                  </Row>

                  <Row gutter={12} style={{ marginTop: "40px" }}>
                    <Col span={12}>
                      <div style={{ position: "relative", height: "auto" }}>
                        <p className={"trainer_skillslabel"}>
                          Languages Known
                          <span style={{ color: "#d32f2f" }}> *</span>
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Select
                              className={
                                languagesKnown.length <= 0 &&
                                !languagesKnownError
                                  ? "trainer_certificate_field"
                                  : languagesKnown.length >= 1 &&
                                      !languagesKnownError
                                    ? "trainer_certificate_multiselect_two"
                                    : languagesKnown.length <= 0 &&
                                        languagesKnownError
                                      ? "trainer_certificate_field_error"
                                      : "trainer_certificate_field"
                              }
                              style={{ width: "100%" }}
                              suffixIcon={
                                <IoCaretDownSharp color="rgba(0,0,0,0.54)" />
                              }
                              mode="multiple"
                              allowClear
                              showSearch
                              value={languagesKnown}
                              onChange={(value) => {
                                setLanguagesKnown(value);
                                if (validationTrigger) {
                                  setLanguagesKnownError(
                                    selectValidator(value),
                                  );
                                }
                              }}
                              status={languagesKnownError ? "error" : ""}
                              optionLabelProp="label"
                              filterOption={(input, option) =>
                                option.label
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                            >
                              {languagesKnownOptions.map((item) => {
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
                                        checked={languagesKnown.includes(
                                          itemValue,
                                        )}
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
                        {languagesKnownError && (
                          <p className="trainer_skills_error">
                            Languages {languagesKnownError}
                          </p>
                        )}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ position: "relative", height: "auto" }}>
                        <p className={"trainer_skillslabel"}>
                          Current Trainer Status
                          <span style={{ color: "#d32f2f" }}> *</span>
                        </p>
                        <CommonSelectField
                          errorLabel="Current Trainer Status"
                          required={true}
                          options={[
                            { id: "Active", name: "Active" },
                            { id: "In-Active", name: "In-Active" },
                          ]}
                          onChange={(e) => {
                            setTrainerCurrentStatus(e.target.value);
                          }}
                          value={trainerCurrentStatus}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={12} style={{ marginTop: "40px" }}>
                    <Col span={12}>
                      <p className="trainer_skillslabel">Salary Expectation</p>
                      <Input
                        className="salary_expectation_input"
                        prefix="₹"
                        addonAfter={
                          <Select
                            className="salary_type_select"
                            popupClassName="salary_type_select_dropdown"
                            value={salaryType}
                            onChange={(val) => setSalaryType(val)}
                            style={{ width: 110 }}
                            bordered={false}
                            dropdownStyle={{ minWidth: 120 }}
                          >
                            <Select.Option value="Per session">
                              Per Session
                            </Select.Option>
                            <Select.Option value="Per head">
                              Per Head
                            </Select.Option>
                            <Select.Option value="Batch">Batch</Select.Option>
                          </Select>
                        }
                        placeholder="Enter amount"
                        value={salaryExpectation}
                        onChange={(e) => setSalaryExpectation(e.target.value)}
                        style={{ height: "auto", minHeight: "36px" }}
                      />
                    </Col>
                    <Col span={12}>
                      <div style={{ position: "relative", height: "auto" }}>
                        <p className={"trainer_skillslabel"}>
                          Location<span style={{ color: "#d32f2f" }}> *</span>
                        </p>
                        <CommonInputField
                          errorLabel="Location"
                          required={true}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            if (validationTrigger) {
                              setLocationError(
                                addressValidator(e.target.value),
                              );
                            }
                          }}
                          value={location}
                          error={locationError}
                          errorFontSize={"9px"}
                        />
                      </div>
                    </Col>
                  </Row>
                </Col>

                <Col span={12} style={{ display: "flex", flexDirection: "column" }}>
                  <p className={"trainer_skillslabel"}>Additional Notes</p>
                  <CommonTextArea
                    placeholder="Enter any additional notes..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    maxLength={300}
                    style={{ flex: 1, display: "flex", flexDirection: "column" }}
                    textAreaStyle={{ flex: 1, resize: "none" }}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </div>

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
  },
);

export default AddTrainer;
