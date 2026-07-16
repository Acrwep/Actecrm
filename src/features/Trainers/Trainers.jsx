import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Select,
  Checkbox,
  Popover,
  Avatar,
  Collapse,
} from "antd";
import { LuSend } from "react-icons/lu";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import CommonTable from "../Common/CommonTable";
import { FaRegEye } from "react-icons/fa";
import { AiOutlineEdit, AiOutlineInfoCircle } from "react-icons/ai";
import {
  RedoOutlined,
  PlusOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { MdAdd } from "react-icons/md";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import ScrollableTabContainer from "../Common/ScrollableTabContainer";
import { IoCaretDownSharp } from "react-icons/io5";
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
  getTableColumns,
  getTechnologies,
  getTrainers,
  getTrainerSkills,
  getUsersByRole,
  getCustomerByTrainerId,
  sendTrainerFormEmail,
  trainerStatusUpdate,
  updateTableColumns,
  updateTrainer,
  getTrainerBanks,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
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
import EllipsisTooltip from "../Common/EllipsisTooltip";
import TrainerPaymentRequestForm from "./TrainerPaymentRequestForm";
import ViewTrainerDetails from "./ViewTrainerDetails";

const CustomerList = ({ trainerId, isClassTaken }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payload = {
          trainer_id: trainerId,
          is_class_taken: isClassTaken,
        };
        const response = await getCustomerByTrainerId(payload);
        setData(response?.data?.data?.students || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [trainerId, isClassTaken]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (index) => {
    const colors = ["#1890ff", "#52c41a", "#722ed1", "#fa8c16", "#eb2f96"];
    return colors[index % colors.length];
  };

  return (
    <div
      className="customer-popover-container"
      style={{
        minWidth: "280px",
        maxWidth: "350px",
        maxHeight: "240px",
        overflowY: "auto",
        padding: "12px 14px",
      }}
    >
      <div className="customer-popover-header">
        <span>Customers List</span>
        {data.length > 0 && (
          <span style={{ fontSize: "12px", color: "#8c8c8c", fontWeight: 400 }}>
            {data.length} Total
          </span>
        )}
      </div>
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <CommonSpinner />
        </div>
      ) : data.length > 0 ? (
        data.map((item, index) => (
          <div key={index} className="customer-item-wrapper">
            <div className="customer-info-content">
              <span className="customer-info-name">{item.cus_name || "-"}</span>
              <div className="customer-info-detail">
                <MailOutlined style={{ fontSize: "11px", color: "#1890ff" }} />
                <span>{item.cus_email || "-"}</span>
              </div>
              <div className="customer-info-detail">
                <PhoneOutlined style={{ fontSize: "11px", color: "#52c41a" }} />
                <span>
                  {item.cus_phonecode} {item.cus_phone}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: "0px", textAlign: "center" }}>
          <p style={{ color: "#bfbfbf", margin: 0, fontSize: "14px" }}>
            No records found
          </p>
        </div>
      )}
    </div>
  );
};

export default function Trainers() {
  const paymentRequestFormRef = useRef();

  const navigate = useNavigate();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const downlineUsers = useSelector((state) => state.downlineusers);
  const childUsers = useSelector((state) => state.childusers);

  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenViewDrawer, setIsOpenViewDrawer] = useState(false);
  const [viewTrainerData, setViewTrainerData] = useState(null);
  const [trainersData, setTrainersData] = useState([]);
  const [status, setStatus] = useState("AddTrainer");
  const [previousStatus, setPreviousStatus] = useState(null);
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
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
  const [technologyOptions, setTechnologyOptions] = useState([]);
  const [technology, setTechnology] = useState("");
  const [technologyError, setTechnologyError] = useState("");
  const [isTechnologyFocused, setIsTechnologyFocused] = useState(false);
  const [experienceOptions, setExperienceOptions] = useState([]);
  const [experience, setExperience] = useState("");
  const [experienceError, setExperienceError] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [relevantExperienceError, setRelevantExperienceError] = useState("");
  const [batchOptions, setBatchOptions] = useState([]);
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
  const [trainerBanksList, setTrainerBanksList] = useState([]);
  //status count usestates
  const [allTrainersCount, setAllTrainersCount] = useState(0);
  const [formPendingCount, setFormPendingCount] = useState(0);
  const [verifyPendingCount, setVerifyPendingCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [onBoardingCount, setOnboardingCount] = useState("");
  const [onGoingCount, setOnGoingCount] = useState("");
  const [newOngoingCount, setNewOngoingCount] = useState("");
  const [existingOngoingCount, setExistingOngoingCount] = useState("");
  const [firstStageCount, setFirstStageCount] = useState("");
  const [secondStageCount, setSecondStageCount] = useState("");
  const [thirdStageCount, setThirdStageCount] = useState("");
  const [fourthStageCount, setFourthStageCount] = useState("");
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
  const [hrUsers, setHrUsers] = useState([]);
  const [hrId, setHrId] = useState(null);
  // payment request form
  const [isOpenRequestFormDrawer, setIsOpenRequestFormDrawer] = useState(false);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  //table dnd
  const [loginUserId, setLoginUserId] = useState("");
  const [updateTableId, setUpdateTableId] = useState(null);
  const [checkAll, setCheckAll] = useState(false);

  const nonChangeColumns = [
    {
      title: "HR",
      key: "hr_head",
      dataIndex: "hr_head",
      width: 150,
      fixed: "left",
      render: (text, record) => {
        const lead_executive = `${
          text ? `${record.created_by} - ${text}` : "-"
        }`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: "Created At",
      key: "created_date",
      dataIndex: "created_date",
      width: 100,
      fixed: "left",
      render: (text) => {
        return (
          <EllipsisTooltip
            text={text ? moment(text).format("DD/MM/YYYY") : ""}
          />
        );
      },
    },
    {
      title: "Trainer Id",
      key: "trainer_code",
      dataIndex: "trainer_code",
      width: 90,
      fixed: "left",
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Class Taken",
      key: "on_boarding_count",
      dataIndex: "on_boarding_count",
      width: 150,
      render: (text, record) => {
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <p style={{ margin: 0 }}>{text + " Customers"}</p>
            <Popover
              placement="right"
              content={<CustomerList trainerId={record.id} isClassTaken={1} />}
              trigger="click"
            >
              <AiOutlineInfoCircle
                size={14}
                style={{ color: "#1890ff", cursor: "pointer" }}
              />
            </Popover>
          </div>
        );
      },
    },
    {
      title: "Class Going",
      key: "on_going_count",
      dataIndex: "on_going_count",
      width: 150,
      render: (text, record) => {
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <p style={{ margin: 0 }}>{text + " Customers"}</p>
            <Popover
              placement="bottom"
              content={<CustomerList trainerId={record.id} isClassTaken={0} />}
              trigger="click"
            >
              <AiOutlineInfoCircle
                size={14}
                style={{ color: "#5b69ca", cursor: "pointer" }}
              />
            </Popover>
          </div>
        );
      },
    },
    {
      title: "Trainer Name",
      key: "name",
      dataIndex: "name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 190,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    { title: "Mobile", key: "mobile", dataIndex: "mobile", width: 120 },
    {
      title: "Technology",
      key: "technology",
      dataIndex: "technology",
      width: 170,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Overall Experience",
      key: "overall_exp_year",
      dataIndex: "overall_exp_year",
      width: 160,
      render: (text, record) => {
        return <p>{text + " Years"}</p>;
      },
    },
    {
      title: "Relevent Experience",
      key: "relavant_exp_year",
      dataIndex: "relavant_exp_year",
      width: 160,
      render: (text, record) => {
        return <p>{text + " Years"}</p>;
      },
    },
    { title: "Batch", key: "batch", dataIndex: "batch", width: 130 },
    {
      title: "Avaibility Time",
      key: "availability_time",
      dataIndex: "availability_time",
      width: 140,
      render: (text, record) => {
        return <p>{text ? moment(text, "HH:mm:ss").format("hh:mm A") : "-"}</p>;
      },
    },
    {
      title: "Secondary Time",
      key: "secondary_time",
      dataIndex: "secondary_time",
      width: 140,
      render: (text, record) => {
        return <p>{text ? moment(text, "HH:mm:ss").format("hh:mm A") : "-"}</p>;
      },
    },
    {
      title: "Skills",
      key: "skills",
      dataIndex: "skills",
      width: 180,
      render: (text) => {
        const skillNames = text.map((item) => item.name).join(", ");
        return (
          <div style={{ display: "flex" }}>
            <EllipsisTooltip text={skillNames} />
          </div>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      dataIndex: "location",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
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
                        }/trainer-registration/${record.id}`,
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
      render: (text, record) => {
        return (
          <div
            className="trainers_actionbuttonContainer"
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <FaRegEye
              size={15}
              className="trainers_action_icons"
              onClick={() => {
                setViewTrainerData(record);
                setIsOpenViewDrawer(true);
              }}
              title="View Details"
            />
            {permissions.includes("Update Trainer") && (
              <AiOutlineEdit
                size={15}
                className="trainers_action_icons"
                onClick={() => {
                  handleEdit(record);
                }}
                title="Edit"
              />
            )}
          </div>
        );
      },
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  useEffect(() => {
    if (permissions.length >= 1) {
      if (!permissions.includes("Trainers Page")) {
        navigate("/dashboard");
        return;
      }
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      setLoginUserId(convertAsJson?.user_id);
      setTimeout(() => {
        getTableColumnsData(convertAsJson?.user_id);
      }, 300);
      setTableColumns(nonChangeColumns);
      getHrUsers();
    }
  }, [permissions]);

  // useEffect(() => {
  //   getTechnologiesData();
  // }, []);

  const getHrUsers = async () => {
    const payload = {
      role: "HR",
    };
    try {
      const response = await getUsersByRole(payload);
      console.log("get hr users response", response);
      setHrUsers(response?.data?.data?.data || []);
    } catch (error) {
      setHrUsers([]);
      console.log("get hr users error", error);
    } finally {
      setStatus("AddTrainer");
      getTrainersData(null, null, null, 1, 10, true);
    }
  };

  const getTrainersData = async (
    searchvalue,
    trainerStatus,
    hr_id,
    pageNumber,
    limit,
    callTechnologiesApi,
  ) => {
    setLoading(true);
    let bucket = "";
    let statusPayload = "";
    let is_form_sent = null;

    if (!trainerStatus || trainerStatus === "") {
      bucket = "All";
    } else if (trainerStatus === "Form Pending") {
      bucket = "All";
      is_form_sent = 1;
    } else if (trainerStatus === "Verify Pending") {
      bucket = "All";
      statusPayload = "Verify Pending";
    } else if (trainerStatus === "Verified") {
      bucket = "Verified";
      statusPayload = "Verified";
    } else if (trainerStatus === "Onboarded") {
      bucket = "onboarding";
    } else if (
      trainerStatus === "1" ||
      trainerStatus === "5" ||
      trainerStatus === "10" ||
      trainerStatus === "10+"
    ) {
      bucket = "onboarding";
      statusPayload = trainerStatus;
    } else if (trainerStatus === "OnGoing" || trainerStatus === "Ongoing") {
      bucket = "ongoing";
    } else if (trainerStatus === "New" || trainerStatus === "Existing") {
      bucket = "ongoing";
      statusPayload = trainerStatus;
    } else if (trainerStatus === "Rejected") {
      bucket = "All";
      statusPayload = "Rejected";
    }

    const payload = {
      ...(searchvalue && filterType == 1
        ? { mobile: searchvalue }
        : searchvalue && filterType == 2
          ? { name: searchvalue }
          : searchvalue && filterType == 3
            ? { email: searchvalue }
            : {}),
      ...(bucket && { bucket: bucket }),
      ...(statusPayload && { status: statusPayload }),
      ...(is_form_sent && { is_form_sent }),
      ...(hr_id && { created_by: hr_id }),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getTrainers(payload);
      console.log("trainers response", response);
      const data = response?.data?.data || {};
      setTrainersData(data.trainers || []);
      setOnboardingCount(data.on_boarding ?? "-");
      setOnGoingCount(data.on_going ?? "-");
      setNewOngoingCount(data.new_ongoing ?? "-");
      setExistingOngoingCount(data.existing_ongoing ?? "-");
      setFirstStageCount(data.first_stage ?? "-");
      setSecondStageCount(data.second_stage ?? "-");
      setThirdStageCount(data.third_stage ?? "-");
      setFourthStageCount(data.fourth_stage ?? "-");

      const statusCountList = data.trainer_status_count || [];
      const pagination = data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

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
      setLoading(false);
      if (callTechnologiesApi) {
        getTechnologiesData();
      }
    }
  };

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

  const getSkillsData = async () => {
    try {
      const response = await getTrainerSkills();
      console.log("skills response", response);
      setSkillsOptions(response?.data?.data || []);
    } catch (error) {
      setSkillsOptions([]);
      console.log("skills error", error);
    }
  };

  const getTableColumnsData = async (user_id) => {
    try {
      const response = await getTableColumns(user_id);
      console.log("get table columns response", response);

      const data = response?.data?.data || [];
      if (data.length === 0) {
        return updateTableColumnsData();
      }

      const filterPage = data.find((f) => f.page_name === "Trainers");
      if (!filterPage) {
        setUpdateTableId(null);
        return updateTableColumnsData();
      }

      // --- ✅ Helper function to reattach render logic ---
      const attachRenderFunctions = (cols) =>
        cols.map((col) => {
          switch (col.key) {
            case "hr_head":
              return {
                ...col,
                width: 150,
                fixed: "left",
                render: (text, record) => {
                  const lead_executive = `${
                    text ? `${record.created_by} - ${text}` : "-"
                  }`;
                  return <EllipsisTooltip text={lead_executive} />;
                },
              };
            case "created_date": {
              return {
                ...col,
                width: 100,
                fixed: "left",
                render: (text) => {
                  return (
                    <EllipsisTooltip
                      text={text ? moment(text).format("DD/MM/YYYY") : ""}
                    />
                  );
                },
              };
            }
            case "trainer_code": {
              return {
                ...col,
                width: 90,
                fixed: "left",
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            }
            case "on_boarding_count": {
              return {
                ...col,
                width: 150,
                render: (text, record) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <p style={{ margin: 0 }}>{text + " Customers"}</p>
                      <Popover
                        placement="bottom"
                        content={
                          <CustomerList
                            trainerId={record.id}
                            isClassTaken={1}
                          />
                        }
                        trigger="click"
                      >
                        <AiOutlineInfoCircle
                          size={14}
                          style={{ color: "#5b69ca", cursor: "pointer" }}
                        />
                      </Popover>
                    </div>
                  );
                },
              };
            }
            case "on_going_count": {
              return {
                ...col,
                width: 150,
                render: (text, record) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <p style={{ margin: 0 }}>{text + " Customers"}</p>
                      <Popover
                        placement="bottom"
                        content={
                          <CustomerList
                            trainerId={record.id}
                            isClassTaken={0}
                          />
                        }
                        trigger="click"
                      >
                        <AiOutlineInfoCircle
                          size={14}
                          style={{ color: "#5b69ca", cursor: "pointer" }}
                        />
                      </Popover>
                    </div>
                  );
                },
              };
            }
            case "name": {
              return {
                ...col,
                width: 150,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            }
            case "email": {
              return {
                ...col,
                width: 190,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            }
            case "mobile": {
              return {
                ...col,
                width: 120,
              };
            }
            case "technology": {
              return {
                ...col,
                width: 170,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            }
            case "overall_exp_year":
              return {
                ...col,
                width: 160,
                render: (text, record) => {
                  return <p>{text + " Years"}</p>;
                },
              };
            case "relavant_exp_year":
              return {
                ...col,
                width: 160,
                render: (text, record) => {
                  return <p>{text + " Years"}</p>;
                },
              };
            case "availability_time":
              return {
                ...col,
                width: 140,
                render: (text, record) => {
                  return (
                    <p>
                      {text ? moment(text, "HH:mm:ss").format("hh:mm A") : "-"}
                    </p>
                  );
                },
              };
            case "secondary_time":
              return {
                ...col,
                width: 140,
                render: (text, record) => {
                  return (
                    <p>
                      {text ? moment(text, "HH:mm:ss").format("hh:mm A") : "-"}
                    </p>
                  );
                },
              };
            case "skills":
              return {
                ...col,
                width: 180,
                render: (text) => {
                  const skillNames = text.map((item) => item.name).join(", ");
                  return (
                    <div style={{ display: "flex" }}>
                      <EllipsisTooltip text={skillNames} />
                    </div>
                  );
                },
              };
            case "location":
              return {
                ...col,
                width: 120,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "form_status":
              return {
                ...col,
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
                                  }/trainer-registration/${record.id}`,
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
              };
            case "status":
              return {
                ...col,
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
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Radio
                                value="Verify Pending"
                                style={{
                                  marginTop: "6px",
                                  marginBottom: "12px",
                                }}
                              >
                                Pending
                              </Radio>
                              <Radio
                                value="Verified"
                                style={{ marginBottom: "12px" }}
                              >
                                Verified
                              </Radio>
                              <Radio
                                value="Rejected"
                                style={{ marginBottom: "6px" }}
                              >
                                Rejected
                              </Radio>
                            </div>
                          </Radio.Group>
                        }
                      >
                        {text === "Pending" ||
                        text === "PENDING" ||
                        text === "Verify Pending" ? (
                          <Button className="trainers_pending_button">
                            Pending
                          </Button>
                        ) : text === "Verified" || text === "VERIFIED" ? (
                          <div className="trainers_verifieddiv">
                            <Button className="trainers_verified_button">
                              Verified
                            </Button>
                          </div>
                        ) : text === "Rejected" || text === "REJECTED" ? (
                          <Button className="trainers_rejected_button">
                            Rejected
                          </Button>
                        ) : (
                          <p style={{ marginLeft: "6px" }}>-</p>
                        )}
                      </Tooltip>
                    </Flex>
                  );
                },
              };
            case "action":
              return {
                ...col,
                hidden: false,
                render: (text, record) => {
                  return (
                    <div
                      className="trainers_actionbuttonContainer"
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <FaRegEye
                        size={15}
                        className="trainers_action_icons"
                        onClick={() => {
                          setViewTrainerData(record);
                          setIsOpenViewDrawer(true);
                        }}
                        title="View Details"
                      />
                      {permissions.includes("Update Trainer") && (
                        <AiOutlineEdit
                          size={16}
                          className="trainers_action_icons"
                          onClick={() => {
                            handleEdit(record);
                          }}
                          title="Edit"
                        />
                      )}
                      {(statusRef.current === "OnGoing" ||
                        statusRef.current === "Onboarded") &&
                      permissions.includes("Update Trainer") ? (
                        <Tooltip
                          placement="top"
                          title="Send Payment Claim Form"
                          trigger={["hover", "click"]}
                        >
                          <LuSend
                            size={15}
                            className="trainers_action_icons"
                            onClick={() => {
                              setEditTrainerId(record?.id || null);
                              setIsOpenRequestFormDrawer(true);
                            }}
                          />
                        </Tooltip>
                      ) : null}
                    </div>
                  );
                },
              };
            default:
              return col;
          }
        });

      // --- ✅ Process columns ---
      setUpdateTableId(filterPage.id);

      const allColumns = attachRenderFunctions(filterPage.column_names);
      const visibleColumns = attachRenderFunctions(
        filterPage.column_names.filter((col) => col.isChecked),
      );

      setColumns(allColumns);
      setTableColumns(visibleColumns);

      console.log("Visible columns:", visibleColumns);
    } catch (error) {
      console.error("get table columns error", error);
    }
  };

  const updateTableColumnsData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Trainers",
      column_names: columns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
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

  const handleEdit = async (item) => {
    console.log("clicked item", item);
    // const skillsAsJson = JSON.parse(item.skills);
    // const skillsOutput = skillsAsJson[0].split(",").map((item) => item.trim());
    console.log("prevvv storeee", statusRef.current);
    setPreviousStatus(statusRef.current);
    setStatus("AddTrainer");
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
      `+${item.mobile_phone_code ? item.mobile_phone_code : ""}`,
    );
    setSelectedCountry(selected_mobile_country);
    setMobile(item.mobile);
    //whatsapp fetch
    setWhatsAppCountryCode(
      item.whatsapp_phone_code ? item.whatsapp_phone_code : "",
    );
    const selected_whatsapp_country = getCountryFromDialCode(
      `+${item.whatsapp_phone_code ? item.whatsapp_phone_code : ""}`,
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
    setAvaibilityTime(item.availability_time ? item.availability_time : "");
    setSecondaryTime(item.secondary_time ? item.secondary_time : "");
    const getSkillsIds = item.skills.map((s) => {
      return s.id;
    });
    setSkills(getSkillsIds);
    //fetch bank details
    setTrainerBankId(item.trainer_bank_id);
    setAccountHolderName(item.account_holder_name);
    setAccountNumber(item.account_number);
    setBankName(item.bank_name);
    setBranchName(item.branch_name);
    setIfscCode(item.ifsc_code);
    setSignatureImage(item.signature_image);

    try {
      const response = await getTrainerBanks(item?.id);
      console.log("trainer banks", response);
      const bank_details = response.data?.data || [];
      if (bank_details.length >= 1) {
        const updateData = bank_details.filter((f) => f.account_number != "");
        setTrainerBanksList(updateData);
      } else {
        setTrainerBanksList([]);
      }
    } catch (error) {
      console.log("trainer bank error", error);
      setTrainerBanksList([]);
    }
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
      (file) => file.uid !== fileToRemove.uid,
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
      price: 0,
      offer_price: 0,
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
          "Something went wrong. Try again later",
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
        getSkillsData();
      }, 300);
    } catch (error) {
      setAddCourseLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const formReset = () => {
    setButtonLoading(false);
    setEditTrainerId(null);
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

  const paymentRequestFormReset = () => {
    setEditTrainerId(null);
    setIsOpenRequestFormDrawer(false);
  };

  const handleSubmit = async () => {
    console.log("avaibilityTime", skills);
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log(converAsJson);

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
          if (previousStatus !== null) {
            setStatus(previousStatus);
            getTrainersData(
              searchValue,
              previousStatus,
              hrId,
              pagination.page,
              pagination.limit,
            );
            setPreviousStatus(null);
          } else {
            getTrainersData(
              searchValue,
              status,
              hrId,
              pagination.page,
              pagination.limit,
            );
          }
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
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
          getTrainersData(
            searchValue,
            status,
            hrId,
            pagination.page,
            pagination.limit,
          );
          handleSendFormLink(
            createdTrainerDetails.email,
            createdTrainerDetails.insertId,
          );
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
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
        getTrainersData(
          searchValue,
          status,
          hrId,
          pagination.page,
          pagination.limit,
        );
      });
    } catch (error) {
      console.log("trainer status change error", error);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleRefresh = () => {
    // setStatus("");
    setSearchValue("");
    setHrId(null);
    setPagination({
      page: 1,
    });
    getTrainersData(null, status, null, 1, pagination.limit);
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
          "Something went wrong. Try again later",
      );
    }
  };

  const renderPersonalDetails = () => {
    return (
      <div style={{ marginBottom: "60px" }}>
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
        <Row gutter={16} style={{ marginTop: editTrainerId ? "0px" : "20px" }}>
          <Col span={6}>
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
              errorFontSize={"9px"}
            />
          </Col>
          <Col span={6}>
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
              errorFontSize={"9px"}
            />
          </Col>
          <Col span={6}>
            <PhoneWithCountry
              label="Mobile Number"
              onChange={(value, countryIso2) => {
                console.log("mobbbb", value);
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
          </Col>
          <Col span={6}>
            <PhoneWithCountry
              label="WhatsApp Number"
              onChange={(value, countryIso2) => {
                setWhatsApp(value);
                const activeCountry = countryIso2 || whatsAppCountry;
                if (validationTrigger) {
                  setWhatsAppError(mobileValidator(value, activeCountry));
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
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "35px" }}>
          <Col span={6}>
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
                      : "leads_course_addcontainer"
                }
                style={{ height: "36px" }}
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
              errorFontSize={"9px"}
              valueMarginTop="-4px"
            />
          </Col>
          <Col span={6}>
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
              errorFontSize="9px"
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

        <Row
          gutter={16}
          style={{ marginTop: relevantExperienceError ? "40px" : "35px" }}
        >
          <Col span={6}>
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
          <Col span={6}>
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

          <Col span={6}>
            <div style={{ position: "relative", height: "auto" }}>
              <p className={"trainer_skillslabel"}>Skills</p>
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
                    mode="multiple"
                    allowClear
                    showSearch
                    value={skills} // Only real selected values
                    onChange={(value) => {
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

                <div
                  className={
                    skillsError
                      ? "leads_errorcourse_addcontainer"
                      : isSkillFocused
                        ? "leads_focusedcourse_addcontainer"
                        : "leads_course_addcontainer"
                  }
                  style={{ height: "36px" }}
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
                <p className="trainer_skills_error">Skills {skillsError}</p>
              )}
            </div>
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
              errorFontSize={"9px"}
            />
          </Col>
        </Row>

        {/* <Row
          gutter={16}
          style={{ marginTop: batchError ? "45px" : "35px" }}
        ></Row> */}
      </div>
    );
  };

  return (
    <div>
      <Row gutter={16} style={{ marginTop: "8px" }}>
        <Col span={23}>
          <ScrollableTabContainer>
            {permissions.includes("Add Trainer") && (
              <div
                className={
                  status === "AddTrainer"
                    ? "addlead_tab_activebutton"
                    : "addlead_tab_inactivebutton"
                }
                onClick={() => {
                  if (status === "AddTrainer") return;
                  setStatus("AddTrainer");
                  setEditTrainerId(null);
                  formReset();
                }}
              >
                <p>Add Trainer</p>
              </div>
            )}
            <div
              className={
                status === "" ||
                status === "Form Pending" ||
                status === "Verify Pending"
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
                  pagination.limit,
                );
              }}
            >
              <p>Eligible Trainers {`( ${verifiedCount} )`}</p>
            </div>
            <div
              className={
                status === "Onboarded" ||
                status === "1" ||
                status === "5" ||
                status === "10" ||
                status === "10+"
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
                  pagination.limit,
                );
              }}
            >
              <p>Onboarded Trainers {`( ${onBoardingCount} )`}</p>
            </div>
            <div
              className={
                status === "OnGoing" ||
                status === "New" ||
                status === "Existing"
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
                  pagination.limit,
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
                  pagination.limit,
                );
              }}
            >
              <p>Rejected Trainers {`( ${rejectedCount} )`}</p>
            </div>
          </ScrollableTabContainer>
        </Col>

        <Col
          span={1}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
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

      {status == "AddTrainer" ? (
        ""
      ) : (
        <>
          <Row>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Row gutter={16}>
                <Col span={10}>
                  <div className="overallduecustomers_filterContainer">
                    <CommonOutlinedInput
                      label={
                        filterType == 1
                          ? "Search By Mobile"
                          : filterType == 2
                            ? "Search By Name"
                            : filterType == 3
                              ? "Search by Email"
                              : ""
                      }
                      width="100%"
                      height="32px"
                      labelFontSize="11px"
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
                                pagination.limit,
                              );
                            }}
                          >
                            <IoIosClose size={11} />
                          </div>
                        ) : (
                          <CiSearch size={16} />
                        )
                      }
                      labelMarginTop="0px"
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
                                    pagination.limit,
                                  );
                                }
                              }}
                            >
                              <Radio
                                value={1}
                                style={{
                                  marginTop: "6px",
                                  marginBottom: "12px",
                                }}
                              >
                                Search by Mobile
                              </Radio>
                              <Radio value={2} style={{ marginBottom: "12px" }}>
                                Search by Name
                              </Radio>
                              <Radio value={3} style={{ marginBottom: "6px" }}>
                                Search by Email
                              </Radio>
                            </Radio.Group>
                          }
                        >
                          <Button className="users_filterbutton">
                            <IoFilter size={16} />
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
                      options={hrUsers}
                      width="100%"
                      height="34px"
                      labelFontSize={"12px"}
                      labelMarginTop="-1px"
                      style={{ width: "100%" }}
                      value={hrId}
                      onChange={(e) => {
                        setHrId(e.target.value);
                        getTrainersData(
                          searchValue,
                          status,
                          e.target.value,
                          1,
                          pagination.limit,
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
              <FiFilter
                size={20}
                color="#5b69ca"
                style={{ marginLeft: "12px", cursor: "pointer" }}
                onClick={() => {
                  setIsOpenFilterDrawer(true);
                  getTableColumnsData(loginUserId);
                }}
              />
            </Col>
          </Row>
          {(status === "" ||
            status === "Form Pending" ||
            status === "Verify Pending") && (
            <Row
              style={{
                marginTop: "16px",
                marginBottom: "24px",
                gap: "12px",
                paddingLeft: "12px",
              }}
            >
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
                    pagination.limit,
                  );
                }}
                style={{ cursor: "pointer" }}
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
                    pagination.limit,
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                <p>Verify Pending {`( ${verifyPendingCount} )`}</p>
              </div>
            </Row>
          )}

          {(status === "Onboarded" ||
            status === "1" ||
            status === "5" ||
            status === "10" ||
            status === "10+") && (
            <Row
              style={{
                marginTop: "16px",
                marginBottom: "24px",
                gap: "12px",
                paddingLeft: "12px",
              }}
            >
              <div
                className={
                  status === "1"
                    ? "trainers_active_stage1_container"
                    : "trainers_stage1_container"
                }
                onClick={() => {
                  if (status === "1") return;
                  setStatus("1");
                  setPagination({ page: 1 });
                  getTrainersData(searchValue, "1", hrId, 1, pagination.limit);
                }}
                style={{ cursor: "pointer" }}
              >
                <p>1 {`( ${firstStageCount} )`}</p>
              </div>
              <div
                className={
                  status === "5"
                    ? "trainers_active_stage2_container"
                    : "trainers_stage2_container"
                }
                onClick={() => {
                  if (status === "5") return;
                  setStatus("5");
                  setPagination({ page: 1 });
                  getTrainersData(searchValue, "5", hrId, 1, pagination.limit);
                }}
                style={{ cursor: "pointer" }}
              >
                <p>2 to 5 {`( ${secondStageCount} )`}</p>
              </div>
              <div
                className={
                  status === "10"
                    ? "trainers_active_stage3_container"
                    : "trainers_stage3_container"
                }
                onClick={() => {
                  if (status === "10") return;
                  setStatus("10");
                  setPagination({ page: 1 });
                  getTrainersData(searchValue, "10", hrId, 1, pagination.limit);
                }}
                style={{ cursor: "pointer" }}
              >
                <p>6 to 10 {`( ${thirdStageCount} )`}</p>
              </div>
              <div
                className={
                  status === "10+"
                    ? "trainers_active_stage4_container"
                    : "trainers_stage4_container"
                }
                onClick={() => {
                  if (status === "10+") return;
                  setStatus("10+");
                  setPagination({ page: 1 });
                  getTrainersData(
                    searchValue,
                    "10+",
                    hrId,
                    1,
                    pagination.limit,
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                <p>10+ {`( ${fourthStageCount} )`}</p>
              </div>
            </Row>
          )}

          {(status === "OnGoing" ||
            status === "New" ||
            status === "Existing") && (
            <Row
              style={{
                marginTop: "16px",
                marginBottom: "24px",
                gap: "12px",
                paddingLeft: "12px",
              }}
            >
              <div
                className={
                  status === "Existing"
                    ? "trainers_active_ongoing_existing_container"
                    : "trainers_ongoing_existing_container"
                }
                onClick={() => {
                  if (status === "Existing") return;
                  setStatus("Existing");
                  setPagination({ page: 1 });
                  getTrainersData(
                    searchValue,
                    "Existing",
                    hrId,
                    1,
                    pagination.limit,
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                <p>Existing {`( ${existingOngoingCount} )`}</p>
              </div>
              <div
                className={
                  status === "New"
                    ? "trainers_active_ongoing_new_container"
                    : "trainers_ongoing_new_container"
                }
                onClick={() => {
                  if (status === "New") return;
                  setStatus("New");
                  setPagination({ page: 1 });
                  getTrainersData(
                    searchValue,
                    "New",
                    hrId,
                    1,
                    pagination.limit,
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                <p>New {`( ${newOngoingCount} )`}</p>
              </div>
            </Row>
          )}
        </>
      )}

      {status === "AddTrainer" ? (
        <div
          style={{
            marginTop: "12px",
            minHeight: "calc(100vh - 180px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, paddingBottom: "40px" }}>
            {renderPersonalDetails()}
          </div>
          {/* <div
            className="leadmanager_tablefiler_footer"
            style={{ marginTop: "20px", position: "relative" }}
          >
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
          </div> */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
              padding: "16px 24px",
              borderTop: "1px solid rgba(226, 232, 240, 0.6)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              position: "sticky",
              bottom: 0,
              zIndex: 1000,
              boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.05)",
              margin: "0 -24px",
              borderRadius: "16px 16px 0 0",
            }}
          >
            <Button
              className="animated-cancel-btn"
              onClick={() => {
                formReset();
                if (previousStatus !== null) {
                  setStatus(previousStatus);
                  getTrainersData(
                    searchValue,
                    previousStatus,
                    hrId,
                    pagination.page,
                    pagination.limit,
                  );
                  setPreviousStatus(null);
                }
              }}
              style={{
                borderRadius: "6px",
                fontWeight: 500,
                borderColor: "#cbd5e1",
                color: "#334155",
                fontSize: "13px",
              }}
            >
              Cancel
            </Button>
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
      ) : (
        <div style={{ marginTop: "20px" }}>
          <CommonTable
            // scroll={{ x: 2700 }}
            scroll={{
              x: tableColumns.reduce(
                (total, col) => total + (col.width || 150),
                0,
              ),
            }}
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
      )}

      {/* table filter drawer */}

      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Manage Table</span>
            <div className="managetable_checkbox_container">
              <p style={{ fontWeight: 400, fontSize: "13px" }}> Check All</p>
              <Checkbox
                className="settings_pageaccess_checkbox"
                onChange={(e) => {
                  const checked = e.target.checked;
                  setCheckAll(checked);
                  // Update all checkboxes
                  const updated = columns.map((col) => ({
                    ...col,
                    isChecked: checked,
                  }));
                  setColumns(updated);
                }}
                checked={checkAll}
              />
            </div>
          </div>
        }
        open={isOpenFilterDrawer}
        onClose={formReset}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative", paddingBottom: 50 }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd data={columns} setColumns={setColumns} />
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={async () => {
                const visibleColumns = columns.filter((col) => col.isChecked);
                console.log("visibleColumns", visibleColumns);
                setTableColumns(visibleColumns);
                setIsOpenFilterDrawer(false);

                const payload = {
                  user_id: loginUserId,
                  id: updateTableId,
                  page_name: "Trainers",
                  column_names: columns,
                };
                try {
                  await updateTableColumns(payload);
                  setTimeout(() => {
                    getTableColumnsData(loginUserId);
                  }, 300);
                } catch (error) {
                  console.log("update table columns error", error);
                }
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

      {/* trainer payment request form drawer */}
      <Drawer
        title={
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Payment Claim Form
          </div>
        }
        open={isOpenRequestFormDrawer}
        onClose={paymentRequestFormReset}
        width="85.5%"
        style={{ position: "relative", paddingBottom: 65 }}
      >
        {editTrainerId && isOpenRequestFormDrawer ? (
          <TrainerPaymentRequestForm
            ref={paymentRequestFormRef}
            trainer_id={editTrainerId}
            isTrainer={false}
            setButtonLoading={setButtonLoading}
            onFormRefresh={() => {
              setIsOpenRequestFormDrawer(false);
              setEditTrainerId(null);
              getTrainersData(
                searchValue,
                status,
                hrId,
                pagination.page,
                pagination.limit,
              );
            }}
          />
        ) : (
          ""
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
                onClick={() =>
                  paymentRequestFormRef.current?.handlePaymentRequestFormSubmit()
                }
              >
                Send
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* View Trainer Drawer */}
      <Drawer
        title={
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            Trainer Details
          </div>
        }
        open={isOpenViewDrawer}
        onClose={() => {
          setIsOpenViewDrawer(false);
          setViewTrainerData(null);
        }}
        width={"50%"}
        styles={{ body: { padding: 0 } }}
      >
        <ViewTrainerDetails trainerData={viewTrainerData} />
      </Drawer>
    </div>
  );
}
