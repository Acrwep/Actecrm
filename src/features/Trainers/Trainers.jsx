import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Drawer,
  Flex,
  Tooltip,
  Button,
  Radio,
  Tabs,
  Modal,
  Upload,
} from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import CommonTable from "../Common/CommonTable";
import { AiOutlineEdit } from "react-icons/ai";
import { RedoOutlined } from "@ant-design/icons";
import { PlusOutlined } from "@ant-design/icons";
import { MdAdd } from "react-icons/md";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMultiSelect from "../Common/CommonMultiSelect";
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
  createTechnology,
  createTrainer,
  createTrainerSkill,
  getBatches,
  getExperience,
  getTechnologies,
  getTrainers,
  getTrainerSkills,
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
import CommonMuiTimePicker from "../Common/CommonMuiTimePicker";
import { FiFilter } from "react-icons/fi";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import CommonDnd from "../Common/CommonDnd";
import { FaRegCopy } from "react-icons/fa6";
import { useSelector } from "react-redux";
import PhoneWithCountry from "../Common/PhoneWithCountry";
import CommonAntdMultiSelect from "../Common/CommonAntMultiSelect";

export default function Trainers() {
  const scrollRef = useRef();

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };

  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const downlineUsers = useSelector((state) => state.downlineusers);
  const childUsers = useSelector((state) => state.childusers);

  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [trainersData, setTrainersData] = useState([]);
  const [status, setStatus] = useState("");
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
  const [technologyOptions, setTechnologyOptions] = useState("");
  const [technology, setTechnology] = useState("");
  const [technologyError, setTechnologyError] = useState("");
  const [isTechnologyFocused, setIsTechnologyFocused] = useState(false);
  const [experienceOptions, setExperienceOptions] = useState("");
  const [experience, setExperience] = useState("");
  const [experienceError, setExperienceError] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [relevantExperienceError, setRelevantExperienceError] = useState("");
  const [batchOptions, setBatchOptions] = useState("");
  const [batch, setBatch] = useState("");
  const [batchError, setBatchError] = useState("");
  const [avaibilityTime, setAvaibilityTime] = useState(null);
  const [secondaryTime, setSecondaryTime] = useState("");
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillsError, setSkillsError] = useState("");
  const [isSkillFocused, setIsSkillFocused] = useState(false);
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editTrainerId, setEditTrainerId] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [trainerCurrentStatus, setTrainerCurrentStatus] =
    useState("Verify Pending");
  //bank details usestates
  const [isShowBankTab, setIsShowBankTab] = useState(false);
  const [trainerBankId, setTrainerBankId] = useState(null);
  const [profilePictureArray, setProfilePictureArray] = useState([]);
  const [profilePictureBase64, setProfilePictureBase64] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  //status count usestates
  const [allTrainersCount, setAllTrainersCount] = useState(0);
  const [formPendingCount, setFormPendingCount] = useState(0);
  const [verifyPendingCount, setVerifyPendingCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [onBoardingCount, setOnboardingCount] = useState("");
  const [onGoingCount, setOnGoingCount] = useState("");
  //add course usestates
  const [isOpenAddCourseModal, setIsOpenAddCourseModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseNameError, setCourseNameError] = useState("");
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  //add skill usestates
  const [isOpenAddSkillModal, setIsOpenAddSkillModal] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillNameError, setSkillNameError] = useState("");
  //hr filter
  const [hrId, setHrId] = useState(null);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [defaultColumns, setDefaultColumns] = useState(() => {
    const dnd_columns = [
      { title: "Trainer Name", isChecked: true },
      { title: "Email", isChecked: true },
      { title: "Technology", isChecked: true },
      { title: "Overall Experience", isChecked: true },
      { title: "Relevent Experience", isChecked: true },
      { title: "Batch", isChecked: true },
      { title: "Avaibility Time", isChecked: true },
      { title: "Secondary Time", isChecked: true },
      { title: "Skills", isChecked: true },
      { title: "Location", isChecked: true },
      { title: "Form Status", isChecked: true },
      { title: "Status", isChecked: true },
      { title: "Action", isChecked: true },
    ];

    return !permissions.includes("Update Trainer")
      ? dnd_columns.filter((col) => col.title !== "Action")
      : dnd_columns;
  });

  const nonChangeColumns = [
    {
      title: "HR",
      key: "hr_head",
      dataIndex: "hr_head",
      width: 160,
      fixed: "left",
      render: (text, record) => {
        return (
          <div>
            <p>{text ? `${record.created_by} - ${text}` : "-"}</p>
          </div>
        );
      },
    },
    {
      title: "Trainer Id",
      key: "trainer_code",
      dataIndex: "trainer_code",
      width: 140,
      fixed: "left",
    },
    {
      title: "Trainer Name",
      key: "name",
      dataIndex: "name",
      width: 190,
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
        return <p>{text ? moment(text, "HH:mm:ss").format("hh:mm A") : "-"}</p>;
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
    {
      title: "Skills",
      key: "skills",
      dataIndex: "skills",
      width: 200,
      render: (text) => {
        const skillNames = text.map((item) => item.name).join(", ");
        return (
          <div style={{ display: "flex" }}>
            <p>{skillNames}</p>
          </div>
        );
      },
    },
    { title: "Location", key: "location", dataIndex: "location", width: 120 },
    {
      title: "Form Status",
      key: "form_status",
      dataIndex: "form_status",
      width: 120,
      fixed: "right",
      render: (text, record) => {
        return (
          <>
            {record.is_bank_updated === 1 ? (
              <p>Completed</p>
            ) : (
              <div style={{ display: "flex", gap: "6px" }}>
                <p>Pending</p>
                <Tooltip
                  placement="top"
                  title="Copy form link"
                  trigger={["hover", "click"]}
                >
                  <FaRegCopy
                    size={14}
                    className="customers_formlink_copybutton"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${
                          import.meta.env.VITE_EMAIL_URL
                        }/trainer-registration/${record.id}`
                      );
                      CommonMessage("success", "Link Copied");
                      console.log("Copied: eeee");
                    }}
                  />
                </Tooltip>
              </div>
            )}
          </>
        );
      },
    },
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
                    if (!permissions.includes("Update Trainer")) {
                      CommonMessage("error", "Access Denied");
                      return;
                    }
                    handleStatusChange(record.id, e.target.value);
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Radio
                      value="Verify Pending"
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
              {text === "Pending" ||
              text === "PENDING" ||
              text === "Verify Pending" ? (
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
      hidden: !permissions.includes("Update Trainer") ? true : false,
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => {
                handleEdit(record);
              }}
            />
          </div>
        );
      },
    },
  ];

  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  useEffect(() => {
    setTableColumns(nonChangeColumns);
  }, [permissions]);

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
        getSkillsData(true);
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
        if (call_api == true) {
          getTrainersData(null, null, null, 1, 10);
        }
      }, 300);
    }
  };

  const getTrainersData = async (
    searchvalue,
    trainerStatus,
    hr_id,
    pageNumber,
    limit
  ) => {
    setLoading(true);
    const payload = {
      ...(searchvalue && filterType == 1
        ? { name: searchvalue }
        : searchvalue && filterType == 2
        ? { email: searchvalue }
        : searchvalue && filterType == 3
        ? { mobile: searchvalue }
        : {}),
      ...(trainerStatus && trainerStatus == "Form Pending"
        ? { is_form_sent: 1 }
        : trainerStatus == "Onboarded"
        ? { is_onboarding: 1 }
        : trainerStatus == "Ongoing"
        ? { ongoing: "Ongoing" }
        : trainerStatus && { status: trainerStatus }),
      ...(hr_id && { created_by: hr_id }),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getTrainers(payload);
      console.log("trainers response", response);
      setTrainersData(response?.data?.data?.trainers || []);
      setOnboardingCount(response?.data?.data?.on_boarding ?? "-");
      setOnGoingCount(response?.data?.data?.on_going ?? "-");

      const statusCountList = response?.data?.data?.trainer_status_count || [];
      const pagination = response?.data?.data?.pagination;

      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });

      if (statusCountList.length >= 1) {
        setAllTrainersCount(statusCountList[0].total_count);
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

  const handlePaginationChange = ({ page, limit }) => {
    getTrainersData(searchValue, status, hrId, page, limit);
  };

  const getCourseData = async () => {
    try {
      const response = await getTechnologies();
      setTechnologyOptions(response?.data?.data || []);
    } catch (error) {
      setTechnologyOptions([]);
      console.log("response status error", error);
    }
  };

  const handleEdit = (item) => {
    setIsShowBankTab(true);
    console.log("clicked item", item);
    // const skillsAsJson = JSON.parse(item.skills);
    // const skillsOutput = skillsAsJson[0].split(",").map((item) => item.trim());

    setIsOpenAddDrawer(true);
    setEditTrainerId(item.id);
    if (item.profile_image) {
      setProfilePictureArray([
        {
          uid: "-1",
          name: "profile.jpg",
          status: "done",
          url: item.profile_image, // Base64 string directly usable
        },
      ]);
    } else {
      setProfilePictureArray([]);
    }
    setProfilePictureBase64(item.profile_image);
    setName(item.name);
    setEmail(item.email);
    //mobile fetch
    setMobileCountryCode(item.mobile_phone_code ? item.mobile_phone_code : "");
    const selected_mobile_country = getCountryFromDialCode(
      `+${item.mobile_phone_code ? item.mobile_phone_code : ""}`
    );
    setSelectedCountry(selected_mobile_country);
    setMobile(item.mobile);
    //whatsapp fetch
    setWhatsAppCountryCode(
      item.whatsapp_phone_code ? item.whatsapp_phone_code : ""
    );
    const selected_whatsapp_country = getCountryFromDialCode(
      `+${item.whatsapp_phone_code ? item.whatsapp_phone_code : ""}`
    );
    setWhatsAppCountry(selected_whatsapp_country);
    setWhatsApp(item.whatsapp);
    //-----------
    setTrainerCurrentStatus(item.status);
    setTechnology(item.technology_id);
    setExperience(parseInt(item.overall_exp_year));
    setRelevantExperience(parseInt(item.relavant_exp_year));
    setBatch(item.batch_id);
    setLocation(item.location);
    setAvaibilityTime(
      item.availability_time ? dayjs(item.availability_time, "HH:mm:ss") : ""
    );
    setSecondaryTime(
      item.secondary_time ? dayjs(item.secondary_time, "HH:mm:ss") : ""
    );
    setSkills(item.skills);
    //fetch bank details
    setTrainerBankId(item.trainer_bank_id);
    setAccountHolderName(item.account_holder_name);
    setAccountNumber(item.account_number);
    setBankName(item.bank_name);
    setBranchName(item.branch_name);
    setIfscCode(item.ifsc_code);
    setSignatureImage(item.signature_image);
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getTrainersData(e.target.value, status, hrId, 1, pagination.limit);
    }, 300);
  };

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
      (file) => file.uid !== fileToRemove.uid
    );
    setProfilePictureArray(newFileList);
    // CommonToaster("Profile removed");
  };

  const handleCreateCourse = async () => {
    const courseValidate = addressValidator(courseName);

    setCourseNameError(courseValidate);

    if (courseValidate) return;

    const payload = {
      course_name: courseName,
    };
    setAddCourseLoading(true);

    try {
      await createTechnology(payload);
      CommonMessage("success", "Course Created");
      setTimeout(() => {
        setAddCourseLoading(false);
        setIsOpenAddCourseModal(false);
        setCourseName("");
        setCourseNameError("");
        getCourseData();
      }, 300);
    } catch (error) {
      setAddCourseLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCreateSkill = async () => {
    const skillNameValidate = addressValidator(skillName);

    setSkillNameError(skillNameValidate);

    if (skillNameValidate) return;

    const payload = {
      skill_name: skillName,
    };
    setAddCourseLoading(true);

    try {
      await createTrainerSkill(payload);
      CommonMessage("success", "Skill Created");
      setTimeout(() => {
        setAddCourseLoading(false);
        setIsOpenAddSkillModal(false);
        setSkillName("");
        setSkillNameError("");
        getSkillsData(false);
      }, 300);
    } catch (error) {
      setAddCourseLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const formReset = () => {
    setButtonLoading(false);
    setEditTrainerId(null);
    setIsShowBankTab(false);
    setName("");
    setNameError("");
    setEmail("");
    setEmailError("");
    setSelectedCountry("in");
    setMobileCountryCode("");
    setWhatsAppCountry("in");
    setWhatsAppCountryCode("");
    setMobile("");
    setMobileError("");
    setWhatsApp("");
    setWhatsAppError("");
    setTrainerCurrentStatus("Verify Pending");
    setTechnology("");
    setTechnologyError("");
    setExperience("");
    setExperienceError("");
    setRelevantExperience("");
    setRelevantExperienceError("");
    setBatch("");
    setBatchError("");
    setAvaibilityTime("");
    setSecondaryTime("");
    setSkills([]);
    setSkillsError("");
    setLocation("");
    setLocationError("");
    setTrainerBankId(null);
    setAccountHolderName("");
    setAccountNumber("");
    setBankName("");
    setBranchName("");
    setIfscCode("");
    setProfilePictureArray([]);
    setProfilePictureBase64("");
    setSignatureImage("");
    setIsOpenAddDrawer(false);
    setValidationTrigger(false);
    setIsOpenFilterDrawer(false);
  };

  const handleSubmit = async () => {
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log(converAsJson);

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
      skillsValidate ||
      locationValidate
    )
      return;

    setButtonLoading(true);
    const getSkillsIds = skills.map((s) => {
      return s.id;
    });

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
      skills: getSkillsIds,
      location: location,
      status: trainerCurrentStatus,
      profile_image: profilePictureBase64,
      trainer_bank_id: trainerBankId,
      account_holder_name: accountHolderName,
      account_number: accountNumber,
      bank_name: bankName,
      branch_name: branchName,
      ifsc_code: ifscCode,
      signature_image: signatureImage,
      ...(!editTrainerId
        ? {
            created_by:
              converAsJson && converAsJson.user_id ? converAsJson.user_id : "",
          }
        : {}),
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
          setPagination({
            page: 1,
          });
          getTrainersData(
            searchValue,
            status,
            hrId,
            pagination.page,
            pagination.limit
          );
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    } else {
      try {
        const response = await createTrainer(payload);
        const createdTrainerDetails = response?.data?.data;
        CommonMessage("success", "Trainer Created");
        setTimeout(() => {
          setButtonLoading(false);
          formReset();
          setPagination({
            page: 1,
          });
          getTrainersData(
            searchValue,
            status,
            hrId,
            pagination.page,
            pagination.limit
          );
          handleSendFormLink(
            createdTrainerDetails.email,
            createdTrainerDetails.insertId
          );
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
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
        setPagination({
          page: 1,
        });
        getTrainersData(
          searchValue,
          status,
          hrId,
          pagination.page,
          pagination.limit
        );
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
    setSearchValue("");
    setHrId(null);
    setPagination({
      page: 1,
    });
    getTrainersData(null, null, null, 1, pagination.limit);
  };

  const handleSendFormLink = async (trainerEmail, trainerId) => {
    const payload = {
      email: trainerEmail,
      link: `${
        import.meta.env.VITE_EMAIL_URL
      }/trainer-registration/${trainerId}`,
      trainer_id: trainerId,
    };

    try {
      await sendTrainerFormEmail(payload);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const renderPersonalDetails = () => {
    return (
      <div style={{ marginBottom: "60px" }}>
        {editTrainerId && (
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
        )}
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
            <PhoneWithCountry
              label="Mobile Number"
              onChange={(value) => {
                console.log("mobbbb", value);
                setMobile(value);
                if (validationTrigger) {
                  setMobileError(mobileValidator(value));
                }
              }}
              selectedCountry={selectedCountry}
              countryCode={(code) => {
                setMobileCountryCode(code);
              }}
              error={mobileError}
              onCountryChange={(iso2) => {
                setSelectedCountry(iso2);
                setWhatsAppCountry(iso2);
              }}
              value={mobile}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <PhoneWithCountry
              label="WhatsApp Number"
              onChange={(value) => {
                setWhatsApp(value);
                if (validationTrigger) {
                  setWhatsAppError(mobileValidator(value));
                }
              }}
              countryCode={(code) => {
                setWhatsAppCountryCode(code);
              }}
              selectedCountry={whatsAppCountry}
              value={whatsApp}
              error={whatsAppError}
              errorFontSize="10px"
              onCountryChange={(iso2) => {
                setWhatsAppCountry(iso2);
              }}
            />
          </Col>

          <Col span={8}>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div style={{ flex: 1 }}>
                <CommonSelectField
                  label="Course"
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
                    : "leads_course_addcontainer"
                }
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
              errorFontSize="10px"
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
              required={false}
              onChange={(value) => {
                setAvaibilityTime(value);
                console.log("timeeeeeeee", value);
              }}
              value={avaibilityTime}
              allowClear={true}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonMuiTimePicker
              label="Secondary Time"
              required={false}
              onChange={(value) => {
                setSecondaryTime(value);
              }}
              value={secondaryTime}
              allowClear={true}
            />
          </Col>

          <Col span={8}>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div style={{ flex: 1 }}>
                <CommonMultiSelect
                  label="Skills"
                  required={true}
                  height="46px"
                  onChange={(e, selectedValues) => {
                    setSkills(selectedValues);
                    if (validationTrigger) {
                      setSkillsError(selectValidator(selectedValues));
                    }
                  }}
                  options={skillsOptions}
                  value={skills}
                  error={skillsError}
                  dontallowFreeSolo={true}
                  onFocus={() => setIsSkillFocused(true)}
                  onBlur={() => setIsSkillFocused(false)}
                  borderRightNone={skills.length >= 1 ? false : true}
                />
              </div>

              <div
                className={
                  skillsError
                    ? "leads_errorcourse_addcontainer"
                    : isSkillFocused
                    ? "leads_focusedcourse_addcontainer"
                    : "leads_course_addcontainer"
                }
                style={{ height: "41px", marginTop: "-5px" }}
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
          <Col span={8}>
            <CommonInputField
              label="Account Holder Name"
              required={true}
              onChange={(e) => {
                setAccountHolderName(e.target.value);
              }}
              value={accountHolderName}
              errorFontSize="9px"
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Account Number"
              required={true}
              onChange={(e) => {
                setAccountNumber(e.target.value);
              }}
              value={accountNumber}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Bank Name"
              required={true}
              onChange={(e) => {
                setBankName(e.target.value);
              }}
              value={bankName}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "20px" }}>
          <Col span={8}>
            <CommonInputField
              label="Branch Name"
              required={true}
              onChange={(e) => {
                setBranchName(e.target.value);
              }}
              value={branchName}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="IFSC Code"
              required={true}
              onChange={(e) => {
                setIfscCode(e.target.value.toUpperCase());
              }}
              value={ifscCode}
            />
          </Col>
          <Col
            span={8}
            style={{ display: "flex", gap: "4px", alignItems: "center" }}
          >
            <p className="leadmanager_paymentdrawer_userheadings">
              Signature:{" "}
            </p>

            {signatureImage ? (
              <img
                src={`${signatureImage}`}
                alt="Trainer Signature"
                className="trainer_signature_image"
              />
            ) : (
              "-"
            )}
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "20px" }}></Row>
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
          <Row gutter={16}>
            <Col span={10}>
              <div className="overallduecustomers_filterContainer">
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
                  width="100%"
                  height="33px"
                  labelFontSize="12px"
                  icon={
                    searchValue ? (
                      <div
                        className="users_filter_closeIconContainer"
                        onClick={() => {
                          setSearchValue("");
                          setPagination({
                            page: 1,
                          });
                          getTrainersData(
                            null,
                            status,
                            hrId,
                            1,
                            pagination.limit
                          );
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
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                  onChange={handleSearch}
                  value={searchValue}
                />
                {/* Filter Button */}
                <div>
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
                              setPagination({
                                page: 1,
                              });
                              getTrainersData(
                                null,
                                status,
                                hrId,
                                1,
                                pagination.limit
                              );
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
            <Col span={9}>
              <div className="overallduecustomers_filterContainer">
                <CommonSelectField
                  label="HR"
                  options={downlineUsers}
                  width="100%"
                  height="35px"
                  labelMarginTop="-2px"
                  style={{ width: "100%" }}
                  value={hrId}
                  onChange={(e) => {
                    setHrId(e.target.value);
                    getTrainersData(
                      searchValue,
                      status,
                      e.target.value,
                      1,
                      pagination.limit
                    );
                  }}
                  disableClearable={false}
                />
              </div>
            </Col>
          </Row>
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
          {permissions.includes("Add Trainer") && (
            <button
              className="leadmanager_addleadbutton"
              onClick={() => {
                setIsOpenAddDrawer(true);
              }}
            >
              Add Trainer
            </button>
          )}

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

      <Row style={{ marginTop: "16px" }}>
        <Col span={22}>
          <div className="customers_scroll_wrapper">
            <button
              onClick={() => scroll(-600)}
              className="customer_statusscroll_button"
            >
              <IoMdArrowDropleft size={25} />
            </button>
            <div className="customers_status_mainContainer" ref={scrollRef}>
              {" "}
              <div
                className={
                  status === ""
                    ? "trainers_active_all_container"
                    : "trainers_all_container"
                }
                onClick={() => {
                  if (status === "") {
                    return;
                  }
                  setStatus("");
                  setPagination({
                    page: 1,
                  });
                  getTrainersData(searchValue, null, hrId, 1, pagination.limit);
                }}
              >
                <p>All {`( ${allTrainersCount} )`}</p>
              </div>
              <div
                className={
                  status === "Form Pending"
                    ? "trainers_active_formpending_container"
                    : "customers_feedback_container"
                }
                onClick={() => {
                  if (status === "Form Pending") {
                    return;
                  }
                  setStatus("Form Pending");
                  setPagination({
                    page: 1,
                  });
                  getTrainersData(
                    searchValue,
                    "Form Pending",
                    hrId,
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>Form Pending {`( ${formPendingCount} )`}</p>
              </div>
              <div
                className={
                  status === "Verify Pending"
                    ? "trainers_active_verifypending_container"
                    : "customers_studentvefity_container"
                }
                onClick={() => {
                  if (status === "Verify Pending") {
                    return;
                  }
                  setStatus("Verify Pending");
                  setPagination({
                    page: 1,
                  });
                  getTrainersData(
                    searchValue,
                    "Verify Pending",
                    hrId,
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>Verify Pending {`( ${verifyPendingCount} )`}</p>
              </div>
              <div
                className={
                  status === "Verified"
                    ? "trainers_active_verifiedtrainers_container"
                    : "customers_completed_container"
                }
                onClick={() => {
                  if (status === "Verified") {
                    return;
                  }
                  setStatus("Verified");
                  setPagination({
                    page: 1,
                  });
                  getTrainersData(
                    searchValue,
                    "Verified",
                    hrId,
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>Verified Trainers {`( ${verifiedCount} )`}</p>
              </div>
              <div
                className={
                  status === "Onboarded"
                    ? "customers_active_classschedule_container"
                    : "customers_classschedule_container"
                }
                onClick={() => {
                  if (status === "Onboarded") {
                    return;
                  }
                  setStatus("Onboarded");
                  setPagination({
                    page: 1,
                  });
                  getTrainersData(
                    searchValue,
                    "Onboarded",
                    hrId,
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>Onboarded Trainers {`( ${onBoardingCount} )`}</p>
              </div>
              <div
                className={
                  status === "OnGoing"
                    ? "customers_active_classgoing_container"
                    : "customers_classgoing_container"
                }
                onClick={() => {
                  if (status === "OnGoing") {
                    return;
                  }
                  setStatus("OnGoing");
                  setPagination({
                    page: 1,
                  });
                  getTrainersData(
                    searchValue,
                    "Ongoing",
                    hrId,
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>On-Going Trainers {`( ${onGoingCount} )`}</p>
              </div>
              <div
                className={
                  status === "Rejected"
                    ? "trainers_active_rejectedtrainers_container"
                    : "trainers_rejected_container"
                }
                onClick={() => {
                  if (status === "Rejected") {
                    return;
                  }
                  setStatus("Rejected");
                  setPagination({
                    page: 1,
                  });
                  getTrainersData(
                    searchValue,
                    "Rejected",
                    hrId,
                    1,
                    pagination.limit
                  );
                }}
              >
                <p>Rejected Trainers {`( ${rejectedCount} )`}</p>
              </div>
            </div>
            <button
              onClick={() => scroll(600)}
              className="customer_statusscroll_button"
            >
              <IoMdArrowDropright size={25} />
            </button>
          </div>
        </Col>
        <Col
          span={2}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: "-8px",
          }}
        >
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ marginLeft: "12px", cursor: "pointer" }}
            onClick={() => setIsOpenFilterDrawer(true)}
          />
        </Col>
      </Row>

      <div style={{ marginTop: "22px" }}>
        <CommonTable
          scroll={{ x: 2700 }}
          columns={tableColumns}
          dataSource={trainersData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>

      <Drawer
        title="Add Trainer"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="50%"
        style={{ position: "relative", paddingBottom: 65 }}
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

      {/* table filter drawer */}

      <Drawer
        title="Manage Table"
        open={isOpenFilterDrawer}
        onClose={formReset}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative", paddingBottom: "60px" }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd
                data={defaultColumns}
                setDefaultColumns={setDefaultColumns}
              />
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={() => {
                // We already sync via the effect above, but if you prefer an explicit apply you can:
                const reorderedColumns = defaultColumns
                  .filter((item) => item.isChecked)
                  .map((item) =>
                    nonChangeColumns.find(
                      (col) =>
                        col.key === item.key ||
                        col.title.trim() === item.title.trim()
                    )
                  )
                  .filter(Boolean)
                  .filter(
                    (col) =>
                      !(
                        col.key === "action" &&
                        !permissions.includes("Update Trainer")
                      )
                  );

                setTableColumns(reorderedColumns);
                setIsOpenFilterDrawer(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Drawer>

      {/* add course modal */}
      <Modal
        title="Add Course"
        open={isOpenAddCourseModal}
        onCancel={() => {
          setIsOpenAddCourseModal(false);
          setCourseName("");
          setCourseNameError("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenAddCourseModal(false);
              setCourseName("");
              setCourseNameError("");
            }}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          addCourseLoading ? (
            <Button
              key="create"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleCreateCourse}
              className="leads_coursemodal_createbutton"
            >
              Create
            </Button>
          ),
        ]}
        width="35%"
      >
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <CommonInputField
            label="Course Name"
            required={true}
            onChange={(e) => {
              setCourseName(e.target.value);
              setCourseNameError(addressValidator(e.target.value));
            }}
            value={courseName}
            error={courseNameError}
          />
        </div>

        <div className="lead_course_instruction_container">
          <p style={{ fontSize: "12px", fontWeight: 500 }}>Note:</p>
          <p style={{ fontSize: "13px", marginTop: "2px" }}>
            Make sure the course name remains exactly as{" "}
            <span style={{ fontWeight: 600 }}>‘Google’</span>
          </p>
          <p style={{ fontSize: "12px", fontWeight: 500, marginTop: "6px" }}>
            Example:
          </p>
          <ul>
            <li>Full Stack Development</li>
            <li>Core Java</li>
          </ul>
        </div>
      </Modal>

      {/* add skill modal */}
      <Modal
        title="Add Skill"
        open={isOpenAddSkillModal}
        onCancel={() => {
          setIsOpenAddSkillModal(false);
          setSkillName("");
          setSkillNameError("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenAddSkillModal(false);
              setSkillName("");
              setSkillNameError("");
            }}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          addCourseLoading ? (
            <Button
              key="create"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleCreateSkill}
              className="leads_coursemodal_createbutton"
            >
              Create
            </Button>
          ),
        ]}
        width="35%"
      >
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <CommonInputField
            label="Skill Name"
            required={true}
            onChange={(e) => {
              setSkillName(e.target.value);
              setSkillNameError(addressValidator(e.target.value));
            }}
            value={skillName}
            error={skillNameError}
          />
        </div>

        <div className="lead_course_instruction_container">
          <p style={{ fontSize: "12px", fontWeight: 500 }}>Note:</p>
          <p style={{ fontSize: "13px", marginTop: "2px" }}>
            Make sure the skill name remains exactly as{" "}
            <span style={{ fontWeight: 600 }}>‘Google’</span>
          </p>
          <p style={{ fontSize: "12px", fontWeight: 500, marginTop: "6px" }}>
            Example:
          </p>
          <ul>
            <li>Core Java</li>
            <li>Python</li>
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
