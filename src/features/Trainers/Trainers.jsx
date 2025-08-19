import React, { useState, useEffect } from "react";
import { Row, Col, Drawer, Flex, Tooltip, Button, Radio, Tabs } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import CommonTable from "../Common/CommonTable";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { RedoOutlined } from "@ant-design/icons";
import { SiWhatsapp } from "react-icons/si";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMultiSelect from "../Common/CommonMultiSelect";
import CommonTimePicker from "../Common/CommonTimePicker";
import {
  addressValidator,
  emailValidator,
  formatToBackendIST,
  mobileValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import {
  createTrainer,
  getBatches,
  getExperience,
  getTechnologies,
  getTrainers,
  sendTrainerFormEmail,
  trainerStatusUpdate,
  updateTrainer,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import dayjs from "dayjs";
import moment from "moment/moment";
import { IoFilter } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { LuSend } from "react-icons/lu";
import CommonMuiTimePicker from "../Common/CommonMuiTimePicker";
import Logo from "../../assets/acte-logo.png";
import Signature from "../../assets/signature.png";

export default function Trainers() {
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [trainersData, setTrainersData] = useState([]);
  const [status, setStatus] = useState("");
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
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editTrainerId, setEditTrainerId] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [emailLoader, setEmailLoader] = useState(false);
  //bank details usestates
  const [isShowBankTab, setIsShowBankTab] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  //status count usestates
  const [formPendingCount, setFormPendingCount] = useState(0);
  const [verifyPendingCount, setVerifyPendingCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const columns = [
    {
      title: "Trainer Name",
      key: "name",
      dataIndex: "name",
      width: 190,
      fixed: "left",
    },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    {
      title: "Technology",
      key: "technology",
      dataIndex: "technology",
      width: 220,
    },
    {
      title: "Overall Experience",
      key: "overall_exp_year",
      dataIndex: "overall_exp_year",
      render: (text, record) => {
        return <p>{text + " Years"}</p>;
      },
    },
    {
      title: "Relevent Experience",
      key: "relavant_exp_year",
      dataIndex: "relavant_exp_year",
      render: (text, record) => {
        return <p>{text + " Years"}</p>;
      },
    },
    { title: "Batch", key: "batch", dataIndex: "batch" },
    {
      title: "Avaibility Time",
      key: "availability_time",
      dataIndex: "availability_time",
      render: (text, record) => {
        return <p>{moment(text, "HH:mm:ss").format("hh:mm A")}</p>;
      },
    },
    {
      title: "Secondary Time",
      key: "secondary_time",
      dataIndex: "secondary_time",
      render: (text, record) => {
        return <p>{text ? moment(text, "HH:mm:ss").format("hh:mm A") : "-"}</p>;
      },
    },
    { title: "Batch", key: "batch", dataIndex: "batch" },
    {
      title: "Skills",
      key: "skills",
      dataIndex: "skills",
      width: 200,
      render: (text) => {
        // const convertAsJson = JSON.parse(text);
        return (
          <div style={{ display: "flex" }}>
            <p>{text.join(", ")}</p>
          </div>
        );
      },
    },
    { title: "Location", key: "location", dataIndex: "location", width: 120 },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      fixed: "right",
      width: 120,
      render: (text, record) => {
        return (
          <Flex style={{ whiteSpace: "nowrap" }}>
            <Tooltip
              placement="bottomLeft"
              color="#fff"
              title={
                <Radio.Group
                  value={text}
                  onChange={(e) => {
                    console.log(e.target.value);
                    handleStatusChange(record.id, e.target.value);
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Radio
                      value="Pending"
                      style={{ marginTop: "6px", marginBottom: "12px" }}
                    >
                      Pending
                    </Radio>
                    <Radio value="Verified" style={{ marginBottom: "12px" }}>
                      Verified
                    </Radio>
                    <Radio value="Rejected" style={{ marginBottom: "6px" }}>
                      Rejected
                    </Radio>
                  </div>
                </Radio.Group>
              }
            >
              {text === "Pending" || text === "PENDING" ? (
                <Button className="trainers_pending_button">Pending</Button>
              ) : text === "Verified" || text === "VERIFIED" ? (
                <div className="trainers_verifieddiv">
                  <Button className="trainers_verified_button">Verified</Button>
                </div>
              ) : text === "Rejected" || text === "REJECTED" ? (
                <Button className="trainers_rejected_button">Rejected</Button>
              ) : (
                <p style={{ marginLeft: "6px" }}>-</p>
              )}
            </Tooltip>
          </Flex>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
      width: 120,
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <Tooltip placement="top" title="Send Form Link">
              {emailLoader ? (
                <CommonSpinner color="#333" />
              ) : (
                <LuSend
                  size={17}
                  className="trainers_action_icons"
                  onClick={() => handleSendFormLink(record.email, record.id)}
                />
              )}
            </Tooltip>

            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
            />
            <RiDeleteBinLine
              size={19}
              color="#d32f2f"
              className="trainers_action_icons"
            />
          </div>
        );
      },
    },
  ];

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
        getTrainersData();
      }, 300);
    }
  };

  const getTrainersData = async (searchvalue) => {
    setLoading(true);
    const payload = {
      ...(searchvalue && filterType === 1
        ? { name: searchvalue }
        : searchvalue && filterType === 2
        ? { email: searchvalue }
        : searchvalue && filterType === 3
        ? { mobile: searchvalue }
        : {}),
    };
    try {
      const response = await getTrainers(payload);
      console.log("trainers response", response);
      setTrainersData(response?.data?.data?.trainers || []);
      const statusCountList = response?.data?.data?.trainer_status_count || [];

      if (statusCountList.length >= 1) {
        setFormPendingCount(statusCountList[0].form_pending);
        setVerifyPendingCount(statusCountList[0].verify_pending);
        setVerifiedCount(statusCountList[0].verified);
        setRejectedCount(statusCountList[0].rejected);
      }
    } catch (error) {
      setTrainersData([]);
      console.log("trainers error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleEdit = (item) => {
    setIsShowBankTab(true);
    console.log("clicked item", item);
    // const skillsAsJson = JSON.parse(item.skills);
    // const skillsOutput = skillsAsJson[0].split(",").map((item) => item.trim());

    setIsOpenAddDrawer(true);
    setEditTrainerId(item.id);
    setName(item.name);
    setEmail(item.email);
    setMobile(item.mobile);
    setWhatsApp(item.whatsapp);
    setTechnology(item.technology_id);
    setExperience(parseInt(item.overall_exp_year));
    setRelevantExperience(parseInt(item.relavant_exp_year));
    setBatch(item.batch_id);
    setLocation(item.location);
    setAvaibilityTime(dayjs(item.availability_time, "HH:mm:ss"));
    setSecondaryTime(
      item.secondary_time ? dayjs(item.secondary_time, "HH:mm:ss") : null
    );
    setSkills(item.skills);
    setAccountHolderName(item.account_holder_name);
    setAccountNumber(item.account_number);
    setBankName(item.bank_name);
    setBranchName(item.branch_name);
    setIfscCode(item.ifsc_code);
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      getTrainersData(e.target.value);
    }, 300);
  };

  const formReset = () => {
    setButtonLoading(false);
    setEditTrainerId(null);
    setIsShowBankTab(false);
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
    setAvaibilityTime("");
    setAvaibilityError("");
    setSecondaryTime("");
    setSkills([]);
    setSkillsError("");
    setLocation("");
    setLocationError("");
    setAccountHolderName("");
    setAccountNumber("");
    setBankName("");
    setBranchName("");
    setIfscCode("");
    setIsOpenAddDrawer(false);
    setValidationTrigger(false);
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

    // const formatAvaibilityTime = formatToBackendIST(avaibilityTime);
    // let formatSecondaryTime;
    // if (secondaryTime) {
    //   formatSecondaryTime = formatToBackendIST(secondaryTime);
    // } else {
    //   formatSecondaryTime = null;
    // }
    // console.log(formatAvaibilityTime, "sendFormatrr");

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

    setButtonLoading(true);
    const today = new Date();
    const payload = {
      ...(editTrainerId && { id: editTrainerId }),
      trainer_name: name,
      email: email,
      mobile: mobile,
      whatsapp: whatsApp,
      technology_id: technology,
      overall_exp_year: experience,
      relevant_exp_year: relevantExperience,
      batch_id: batch,
      availability_time: avaibilityTime,
      secondary_time: secondaryTime,
      skills: skills,
      location: location,
      status: "Pending",
      profile_image: "",
      account_holder_name: "",
      account_number: "",
      bank_name: "",
      branche_name: "",
      ifsc_code: "",
      signature_image: "",
      created_date: formatToBackendIST(today),
    };

    console.log("payload", payload);

    if (editTrainerId) {
      try {
        await updateTrainer(payload);
        CommonMessage("success", "Trainer Updated");
        setTimeout(() => {
          setButtonLoading(false);
          formReset();
          getTrainersData(searchValue);
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later"
        );
      }
    } else {
      try {
        await createTrainer(payload);
        CommonMessage("success", "Trainer Created");
        setTimeout(() => {
          setButtonLoading(false);
          formReset();
          getTrainersData(searchValue);
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later"
        );
      }
    }
  };

  const handleStatusChange = async (trainerId, trainerStatus) => {
    const payload = {
      trainer_id: trainerId,
      status: trainerStatus,
    };
    try {
      await trainerStatusUpdate(payload);
      CommonMessage("success", "Status Updated");
      setTimeout(() => {
        getTrainersData(searchValue);
      });
    } catch (error) {
      console.log("trainer status change error", error);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleRefresh = () => {
    setStatus("");
  };

  const handleSendFormLink = async (trainerEmail) => {
    const payload = {
      email: trainerEmail,
    };

    setEmailLoader(true);
    try {
      await sendTrainerFormEmail(payload);
      CommonMessage("success", "Form Link Send To Trainer");
      setEmailLoader(false);
    } catch (error) {
      setEmailLoader(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const renderPersonalDetails = () => {
    return (
      <div style={{ marginBottom: "60px" }}>
        <div className="trainer_profilephoto_container">
          <p style={{ fontWeight: 500 }}>Profile Photo</p>
          <img src={Logo} className="trainer_profilephoto" />
        </div>
        <Row gutter={16}>
          <Col span={8}>
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
          <Col span={8}>
            <CommonInputField
              label="Trainer Email"
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
          <Col span={8}>
            <CommonInputField
              label="Trainer Mobile"
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
                if (e.target.value.length > 10) {
                  e.target.value = e.target.value.slice(0, 10);
                }
              }}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
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
              onInput={(e) => {
                if (e.target.value.length > 10) {
                  e.target.value = e.target.value.slice(0, 10);
                }
              }}
            />
          </Col>

          <Col span={8}>
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

          <Col span={8}>
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
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonSelectField
              label="Relevant Experience"
              options={experienceOptions}
              required={true}
              onChange={(e) => {
                setRelevantExperience(e.target.value);
                if (validationTrigger) {
                  setRelevantExperienceError(selectValidator(e.target.value));
                }
              }}
              value={relevantExperience}
              error={relevantExperienceError}
              valueMarginTop="-4px"
            />
          </Col>
          <Col span={8}>
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

          <Col span={8}>
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
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonMuiTimePicker
              label="Secondary Time"
              required={true}
              onChange={(value) => {
                setSecondaryTime(value);
              }}
              value={secondaryTime}
              allowClear={true}
            />
          </Col>

          <Col span={8}>
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

          <Col span={8}>
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
    );
  };

  const renderBankDetails = () => {
    return (
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Account Holder Name:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                Balaji
              </span>
            </p>
          </Col>
          <Col span={12}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Account Number:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                2672742847238
              </span>
            </p>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "20px" }}>
          <Col span={12}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Bank Name:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                State Bank Of India
              </span>
            </p>
          </Col>
          <Col span={12}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Branch Name:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                Velachery
              </span>
            </p>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "20px" }}>
          <Col span={12}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Ifsc Code:{" "}
              <span className="leadmanager_paymentdrawer_userdetails">
                SBIN0006767
              </span>
            </p>
          </Col>
          <Col span={12} style={{ display: "flex", gap: "4px" }}>
            <p className="leadmanager_paymentdrawer_userheadings">
              Signature:{" "}
            </p>

            <img src={Signature} className="trainer_signature_image" />
          </Col>
        </Row>
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

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div
            className="leadmanager_filterContainer"
            style={{ position: "relative" }}
          >
            <CommonOutlinedInput
              label={
                filterType === 1
                  ? "Search By Name"
                  : filterType === 2
                  ? "Search By Email"
                  : filterType === 3
                  ? "Search by Mobile"
                  : ""
              }
              width="40%"
              height="33px"
              labelFontSize="12px"
              icon={
                searchValue ? (
                  <div
                    className="users_filter_closeIconContainer"
                    onClick={() => {
                      setSearchValue("");
                      getTrainersData(null);
                    }}
                  >
                    <IoIosClose size={11} />
                  </div>
                ) : (
                  <CiSearch size={16} />
                )
              }
              labelMarginTop="-1px"
              style={{
                borderTopRightRadius: "0px",
                borderBottomRightRadius: "0px",
              }}
              onChange={handleSearch}
              value={searchValue}
            />
            <div className="users_filterContainer">
              <Flex
                justify="center"
                align="center"
                style={{ whiteSpace: "nowrap" }}
              >
                <Tooltip
                  placement="bottomLeft"
                  color="#fff"
                  title={
                    <Radio.Group
                      value={filterType}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setFilterType(e.target.value);
                        if (searchValue === "") {
                          return;
                        } else {
                          setSearchValue("");
                          getTrainersData(null);
                        }
                      }}
                    >
                      <Radio
                        value={1}
                        style={{ marginTop: "6px", marginBottom: "12px" }}
                      >
                        Search by Name
                      </Radio>
                      <Radio value={2} style={{ marginBottom: "12px" }}>
                        Search by Email
                      </Radio>
                      <Radio value={3} style={{ marginBottom: "6px" }}>
                        Search by Mobile
                      </Radio>
                    </Radio.Group>
                  }
                >
                  <Button className="users_filterbutton">
                    <IoFilter size={18} />
                  </Button>
                </Tooltip>
              </Flex>
            </div>
          </div>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddDrawer(true);
            }}
          >
            Add Trainer
          </button>

          <Tooltip placement="top" title="Refresh">
            <Button
              className="leadmanager_refresh_button"
              onClick={handleRefresh}
            >
              <RedoOutlined className="refresh_icon" />
            </Button>
          </Tooltip>
        </Col>
      </Row>

      <div className="trainer_status_mainContainer">
        <div
          className={
            status === "Form Pending"
              ? "trainers_active_formpending_container"
              : "customers_feedback_container"
          }
          onClick={() => setStatus("Form Pending")}
        >
          <p>Form Pending {`( ${formPendingCount} )`}</p>
        </div>
        <div
          className={
            status === "Verify Pending"
              ? "trainers_active_verifypending_container"
              : "customers_studentvefity_container"
          }
          onClick={() => setStatus("Verify Pending")}
        >
          <p>Verify Pending {`( ${verifyPendingCount} )`}</p>
        </div>
        <div
          className={
            status === "Verified"
              ? "trainers_active_verifiedtrainers_container"
              : "customers_completed_container"
          }
          onClick={() => setStatus("Verified")}
        >
          <p>Verified Trainers {`( ${verifiedCount} )`}</p>
        </div>
        <div
          className={
            status === "Rejected"
              ? "trainers_active_rejectedtrainers_container"
              : "trainers_rejected_container"
          }
          onClick={() => setStatus("Rejected")}
        >
          <p>Rejected Trainers {`( ${rejectedCount} )`}</p>
        </div>
      </div>

      <div style={{ marginTop: "22px" }}>
        <CommonTable
          scroll={{ x: 2400 }}
          columns={columns}
          dataSource={trainersData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>

      <Drawer
        title="Add Trainer"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="50%"
        style={{ position: "relative" }}
        className={isShowBankTab ? "trainers_addtrainerdrawer" : ""}
      >
        {isShowBankTab ? (
          <Tabs
            // activeKey={activeKey}
            // onTabClick={handleTabClick}
            items={tabItems}
            // className="trainer_registration_tabs"
          />
        ) : (
          renderPersonalDetails()
        )}
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {/* <button
              className="leadmanager_tablefilter_applybutton"
              onClick={handleSubmit}
            >
              Save
            </button> */}

            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={handleSubmit}
              >
                {editTrainerId ? "Update" : "Create"}
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
