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
  Popconfirm,
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
import AddTrainer from "./AddTrainer";
import OverflowTooltip from "../Common/OverflowTooltip";

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

const StatusSelectionDropdown = ({
  text,
  record,
  permissions,
  handleStatusChange,
}) => {
  const [confirmStatus, setConfirmStatus] = useState(null);

  if (confirmStatus) {
    return (
      <div style={{ padding: "4px" }}>
        <div
          style={{
            marginBottom: "12px",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#333",
          }}
        >
          <AiOutlineInfoCircle style={{ color: "#faad14" }} size={16} />
          Confirm Status Change
        </div>
        <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#555" }}>
          Are you sure you want to change the status to <b>{confirmStatus}</b>?
        </p>
        <Flex
          justify="flex-end"
          style={{ marginTop: "9px", marginBottom: "6px", gap: "10px" }}
        >
          <Button size="small" onClick={() => setConfirmStatus(null)}>
            Cancel
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              handleStatusChange(record.id, confirmStatus);
              setConfirmStatus(null);
            }}
          >
            OK
          </Button>
        </Flex>
      </div>
    );
  }

  return (
    <Radio.Group value={text}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Radio
          value="Verify Pending"
          style={{ marginTop: "6px", marginBottom: "12px" }}
          onClick={(e) => {
            if (!permissions.includes("Update Trainer")) {
              CommonMessage("error", "Access Denied");
              return;
            }
            e.preventDefault();
            setConfirmStatus("Verify Pending");
          }}
        >
          Pending
        </Radio>
        <Radio
          value="Verified"
          disabled={record?.is_bank_updated == 0}
          style={{ marginBottom: "12px" }}
          onClick={(e) => {
            if (!permissions.includes("Update Trainer")) {
              CommonMessage("error", "Access Denied");
              return;
            }
            if (record?.is_bank_updated == 0) return;
            e.preventDefault();
            setConfirmStatus("Verified");
          }}
        >
          Verified
        </Radio>
        <Radio
          value="Rejected"
          style={{ marginBottom: "6px" }}
          onClick={(e) => {
            if (!permissions.includes("Update Trainer")) {
              CommonMessage("error", "Access Denied");
              return;
            }
            e.preventDefault();
            setConfirmStatus("Rejected");
          }}
        >
          Rejected
        </Radio>
      </div>
    </Radio.Group>
  );
};

export default function Trainers() {
  const addTrainerRef = useRef();
  const paymentRequestFormRef = useRef();

  const navigate = useNavigate();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const downlineUsers = useSelector((state) => state.downlineusers);
  const childUsers = useSelector((state) => state.childusers);

  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);

  const mainBuckets = [
    {
      value: "",
      label: "All",
      countKey: "allTrainersCount",
      activeClass: "customers_active_student_onboarding_container",
      inactiveClass: "customers_student_onboarding_container",
    },
    {
      value: "Pending",
      label: "Pending",
      countKey: "pendingCount",
      activeClass: "customers_active_progress_monitoring_container",
      inactiveClass: "customers_progress_monitoring_container",
    },
    {
      value: "Verified",
      label: "Eligible Trainers",
      countKey: "verifiedCount",
      activeClass: "trainers_active_verifiedtrainers_container",
      inactiveClass: "customers_completed_container",
    },
    {
      value: "Onboarded",
      label: "Onboarded Trainers",
      countKey: "onBoardingCount",
      activeClass: "customers_active_classschedule_container",
      inactiveClass: "customers_classschedule_container",
    },
    {
      value: "OnGoing",
      label: "On-Going Trainers",
      countKey: "onGoingCount",
      activeClass: "customers_active_classgoing_container",
      inactiveClass: "customers_classgoing_container",
    },
    {
      value: "Rejected",
      label: "Rejected Trainers",
      countKey: "rejectedCount",
      activeClass: "trainers_active_rejectedtrainers_container",
      inactiveClass: "trainers_rejected_container",
    },
  ];

  const bucketConfigs = {
    Pending: [
      {
        label: "Form Pending",
        value: "Form Pending",
        countKey: "formPendingCount",
        activeClass: "trainers_active_formpending_container",
        inactiveClass: "customers_feedback_container",
      },
      {
        label: "Verify Pending",
        value: "Verify Pending",
        countKey: "verifyPendingCount",
        activeClass: "trainers_active_verifypending_container",
        inactiveClass: "customers_studentvefity_container",
      },
    ],
    Onboarded: [
      {
        label: "1",
        value: "1",
        countKey: "firstStageCount",
        activeClass: "trainers_active_stage1_container",
        inactiveClass: "trainers_stage1_container",
      },
      {
        label: "2 to 5",
        value: "5",
        countKey: "secondStageCount",
        activeClass: "trainers_active_stage2_container",
        inactiveClass: "trainers_stage2_container",
      },
      {
        label: "6 to 10",
        value: "10",
        countKey: "thirdStageCount",
        activeClass: "trainers_active_stage3_container",
        inactiveClass: "trainers_stage3_container",
      },
      {
        label: "10+",
        value: "10+",
        countKey: "fourthStageCount",
        activeClass: "trainers_active_stage4_container",
        inactiveClass: "trainers_stage4_container",
      },
    ],
    OnGoing: [
      {
        label: "Existing",
        value: "Existing",
        countKey: "existingOngoingCount",
        activeClass: "trainers_active_ongoing_existing_container",
        inactiveClass: "trainers_ongoing_existing_container",
      },
      {
        label: "New",
        value: "New",
        countKey: "newOngoingCount",
        activeClass: "trainers_active_ongoing_new_container",
        inactiveClass: "trainers_ongoing_new_container",
      },
    ],
  };
  const [isOpenViewDrawer, setIsOpenViewDrawer] = useState(false);
  const [viewTrainerData, setViewTrainerData] = useState(null);
  const [trainersData, setTrainersData] = useState([]);
  const [bucketStatus, setBucketStatus] = useState("AddTrainer");
  const [status, setStatus] = useState("AddTrainer");
  const [previousStatus, setPreviousStatus] = useState(null);
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  const [editTrainerData, setEditTrainerData] = useState(null);
  const [technologyOptions, setTechnologyOptions] = useState([]);
  const [experienceOptions, setExperienceOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTrainerId, setEditTrainerId] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchExperience, setSearchExperience] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [trainerCurrentStatus, setTrainerCurrentStatus] =
    useState("Verify Pending");
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

  const paginationRef = useRef(pagination);
  const searchValueRef = useRef(searchValue);
  const hrIdRef = useRef(hrId);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    searchValueRef.current = searchValue;
  }, [searchValue]);

  useEffect(() => {
    hrIdRef.current = hrId;
  }, [hrId]);

  //table dnd
  const [loginUserId, setLoginUserId] = useState("");
  const [updateTableId, setUpdateTableId] = useState(null);
  const [checkAll, setCheckAll] = useState(false);

  const nonChangeColumns = [
    {
      title: "HR",
      key: "hr_head",
      dataIndex: "hr_head",
      width: 90,
      fixed: "left",
      render: (text, record) => {
        const lead_executive = `${
          text ? `${record.created_by_view_user_id} - ${text}` : "-"
        }`;
        return (
          <div style={{ textAlign: "center", width: "100%" }}>
            <OverflowTooltip
              title={lead_executive}
              children={record.created_by_view_user_id}
            />
          </div>
        );
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
            {text >= 1 && (
              <Popover
                placement="right"
                content={
                  <CustomerList trainerId={record.id} isClassTaken={1} />
                }
                trigger="click"
              >
                <AiOutlineInfoCircle
                  size={14}
                  style={{ color: "#1890ff", cursor: "pointer" }}
                />
              </Popover>
            )}
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
            {text >= 1 && (
              <Popover
                placement="bottom"
                content={
                  <CustomerList trainerId={record.id} isClassTaken={0} />
                }
                trigger="click"
              >
                <AiOutlineInfoCircle
                  size={14}
                  style={{ color: "#5b69ca", cursor: "pointer" }}
                />
              </Popover>
            )}
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
    {
      title: "Batch",
      key: "batch",
      dataIndex: "batch",
      width: 100,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
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
              placement="bottomRight"
              color="#fff"
              title={
                <StatusSelectionDropdown
                  text={text}
                  record={record}
                  permissions={permissions}
                  handleStatusChange={handleStatusChange}
                />
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
      fetchTrainersData({
        searchValue: null,
        status: null,
        hrId: null,
        keyword: null,
        experience: null,
        location: null,
        pageNumber: 1,
        limit: 10,
        callTechnologiesApi: true,
      });
    }
  };

  const handleMainBucketChange = (bucketValue) => {
    console.log("bucketValue", bucketValue);
    if (bucketStatus === bucketValue) return;
    setBucketStatus(bucketValue);

    let subStatus = "";
    if (bucketValue === "Pending") subStatus = "Form Pending";
    else if (bucketValue === "Onboarded") subStatus = "1";
    else if (bucketValue === "OnGoing") subStatus = "Existing";
    else subStatus = bucketValue; // For All, Verified, Rejected

    setStatus(subStatus);
    setPagination({ ...pagination, page: 1 });
    fetchTrainersData({ status: subStatus, pageNumber: 1 });
  };

  const handleSubBucketClick = (config) => {
    if (status === config.value) return;
    setStatus(config.value);
    setPagination({ ...pagination, page: 1 });
    fetchTrainersData({ status: config.value, pageNumber: 1 });
  };

  const fetchTrainersData = (overrides = {}) => {
    getTrainersData(
      overrides.searchValue !== undefined ? overrides.searchValue : searchValue,
      overrides.status !== undefined ? overrides.status : status,
      overrides.hrId !== undefined ? overrides.hrId : hrId,
      overrides.pageNumber !== undefined
        ? overrides.pageNumber
        : pagination.page,
      overrides.limit !== undefined ? overrides.limit : pagination.limit,
      overrides.callTechnologiesApi !== undefined
        ? overrides.callTechnologiesApi
        : false,
      overrides.keyword !== undefined ? overrides.keyword : searchKeyword,
      overrides.experience !== undefined
        ? overrides.experience
        : searchExperience,
      overrides.location !== undefined ? overrides.location : searchLocation,
    );
  };

  const getTrainersData = async (
    searchvalue,
    trainerStatus,
    hr_id,
    pageNumber,
    limit,
    callTechnologiesApi,
    keyword_val = searchKeyword,
    experience_val = searchExperience,
    location_val = searchLocation,
  ) => {
    setLoading(true);
    let bucket = "";
    let statusPayload = "";
    let is_form_sent = null;

    if (!trainerStatus || trainerStatus === "") {
      bucket = "";
    } else if (trainerStatus === "Pending") {
      bucket = "total_pending";
    } else if (trainerStatus === "Form Pending") {
      bucket = "total_pending";
      is_form_sent = 1;
    } else if (trainerStatus === "Verify Pending") {
      bucket = "total_pending";
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
      bucket = "total_pending";
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
      ...(keyword_val && { keyword: keyword_val }),
      ...(experience_val && { experience: experience_val }),
      ...(location_val && { location: location_val }),
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
      const paginations = data?.pagination;

      setPagination({
        page: paginations.page,
        limit: paginations.limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
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
                width: 90,
                fixed: "left",
                align: "center",
                render: (text, record) => {
                  const lead_executive = `${
                    text ? `${record.created_by_view_user_id} - ${text}` : "-"
                  }`;
                  return (
                    <div style={{ textAlign: "center", width: "100%" }}>
                      <OverflowTooltip
                        title={lead_executive}
                        children={record.created_by_view_user_id}
                      />
                    </div>
                  );
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
                      {text >= 1 && (
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
                      )}
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
                      {text >= 1 && (
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
                      )}
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
            case "batch": {
              return {
                ...col,
                width: 100,
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
                        placement="bottomRight"
                        color="#fff"
                        title={
                          <StatusSelectionDropdown
                            text={text}
                            record={record}
                            permissions={permissions}
                            handleStatusChange={handleStatusChange}
                          />
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
                      {[
                        "OnGoing",
                        "Ongoing",
                        "Onboarded",
                        "New",
                        "Existing",
                        "1",
                        "5",
                        "10",
                        "10+",
                      ].includes(statusRef.current) &&
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
    fetchTrainersData({ pageNumber: page, limit: limit });
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
    console.log("prevvv storeee", statusRef.current);
    setPreviousStatus(statusRef.current);
    setStatus("AddTrainer");
    setEditTrainerId(item.id);
    setEditTrainerData(item);
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      fetchTrainersData({ searchValue: e.target.value, pageNumber: 1 });
    }, 300);
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
    setEditTrainerData(null);
    setIsOpenFilterDrawer(false);
  };

  const paymentRequestFormReset = () => {
    setEditTrainerId(null);
    setIsOpenRequestFormDrawer(false);
  };

  const handleStatusChange = async (trainerId, trainerStatus) => {
    console.log(paginationRef.current, "paggggg");
    const payload = {
      trainer_id: trainerId,
      status: trainerStatus,
    };
    try {
      await trainerStatusUpdate(payload);
      CommonMessage("success", "Status Updated");
      setTimeout(() => {
        fetchTrainersData({
          searchValue: searchValueRef.current,
          status: statusRef.current,
          hrId: hrIdRef.current,
          pageNumber: paginationRef.current.page,
          limit: paginationRef.current.limit,
        });
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
    setSearchKeyword("");
    setSearchExperience("");
    setSearchLocation("");
    setStatus("");
    setBucketStatus("");
    setPagination({
      page: 1,
    });
    fetchTrainersData({
      searchValue: null,
      status: "",
      hrId: null,
      keyword: null,
      experience: null,
      location: null,
      pageNumber: 1,
      limit: 10,
      callTechnologiesApi: false,
    });
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
                  setBucketStatus("AddTrainer");
                  setEditTrainerId(null);
                  formReset();
                }}
              >
                <p>Add Trainer</p>
              </div>
            )}
            {mainBuckets.map((bucket, index) => {
              const isActive =
                bucketStatus === bucket.value && status !== "AddTrainer";
              const counts = {
                allTrainersCount,
                pendingCount: formPendingCount + verifyPendingCount,
                verifiedCount,
                onBoardingCount,
                onGoingCount,
                rejectedCount,
              };
              const count = counts[bucket.countKey] ?? "-";
              return (
                <div
                  key={index}
                  className={
                    isActive ? bucket.activeClass : bucket.inactiveClass
                  }
                  onClick={() => handleMainBucketChange(bucket.value)}
                >
                  <p>
                    {bucket.label} {`( ${count} )`}
                  </p>
                </div>
              );
            })}
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
            <Col xs={24} sm={24} md={24} lg={19}>
              <Row gutter={12} align="middle">
                <Col xs={24} md={16} lg={18} xl={18}>
                  <div className="trainers-search-pill-container">
                    <input
                      placeholder="Enter keyword / skills / course"
                      className="trainers-search-input trainers-search-input-keyword"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />

                    <div className="trainers-search-divider"></div>

                    <Select
                      bordered={false}
                      placeholder={
                        <span style={{ fontSize: "13px", color: "#8c94a3" }}>
                          Select experience
                        </span>
                      }
                      className="trainers-search-select"
                      suffixIcon={
                        <IoCaretDownSharp size={12} color="#8c94a3" />
                      }
                      popupMatchSelectWidth={false}
                      dropdownStyle={{ minWidth: "200px" }}
                      value={searchExperience || undefined}
                      onChange={(val) => setSearchExperience(val)}
                      options={experienceOptions?.map((opt) => ({
                        value: opt.id,
                        label: (
                          <span style={{ fontSize: "13px", color: "#333" }}>
                            {opt.exp_range}
                          </span>
                        ),
                      }))}
                    />

                    <div className="trainers-search-divider"></div>

                    <input
                      placeholder="Enter location"
                      className="trainers-search-input trainers-search-input-location"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />

                    {(searchKeyword || searchExperience || searchLocation) && (
                      <div
                        className="trainers-search-clear"
                        title="Clear search"
                        onClick={() => {
                          setSearchKeyword("");
                          setSearchExperience("");
                          setSearchLocation("");
                          setPagination({ ...pagination, page: 1 });
                          fetchTrainersData({
                            pageNumber: 1,
                            callTechnologiesApi: false,
                            keyword: "",
                            experience: "",
                            location: "",
                          });
                        }}
                      >
                        <IoIosClose size={20} />
                      </div>
                    )}

                    <Button
                      type="primary"
                      className="trainers-search-button"
                      onClick={() => {
                        setPagination({ ...pagination, page: 1 });
                        fetchTrainersData({
                          pageNumber: 1,
                          callTechnologiesApi: false,
                          keyword: searchKeyword,
                          experience: searchExperience,
                          location: searchLocation,
                        });
                      }}
                    >
                      <CiSearch size={14} strokeWidth={1} /> Search
                    </Button>
                  </div>
                </Col>

                {/* 
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
                              fetchTrainersData({ pageNumber: 1 });
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
                                  fetchTrainersData({ pageNumber: 1 });
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
                */}
                <Col xs={24} md={8} lg={6} xl={6}>
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
                        fetchTrainersData({
                          hrId: e.target.value,
                          pageNumber: 1,
                        });
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
              lg={5}
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
          {/* Sub Buckets */}
          {status !== "AddTrainer" && bucketConfigs[bucketStatus] && (
            <Row
              style={{
                marginTop: "16px",
                marginBottom: "24px",
                gap: "12px",
                paddingLeft: "12px",
              }}
            >
              {bucketConfigs[bucketStatus].map((config, index) => {
                const isActive = status === config.value;
                const counts = {
                  formPendingCount,
                  verifyPendingCount,
                  firstStageCount,
                  secondStageCount,
                  thirdStageCount,
                  fourthStageCount,
                  existingOngoingCount,
                  newOngoingCount,
                };
                const count = counts[config.countKey] ?? "-";
                return (
                  <div
                    key={index}
                    className={
                      isActive ? config.activeClass : config.inactiveClass
                    }
                    onClick={() => handleSubBucketClick(config)}
                    style={{ cursor: "pointer" }}
                  >
                    <p>
                      {config.label} ( {count} )
                    </p>
                  </div>
                );
              })}
            </Row>
          )}
        </>
      )}

      {status === "AddTrainer" ? (
        <div
          style={{
            minHeight: "calc(100vh - 180px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AddTrainer
            ref={addTrainerRef}
            editTrainerId={editTrainerId}
            editTrainerData={editTrainerData}
            technologyOptions={technologyOptions}
            experienceOptions={experienceOptions}
            batchOptions={batchOptions}
            skillsOptions={skillsOptions}
            setIsOpenAddCourseModal={setIsOpenAddCourseModal}
            setIsOpenAddSkillModal={setIsOpenAddSkillModal}
            callgetTrainersApi={() => {
              fetchTrainersData({});
            }}
            setButtonLoading={setButtonLoading}
            previousStatus={previousStatus}
            setStatus={setStatus}
            setPreviousStatus={setPreviousStatus}
          />
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
                addTrainerRef.current.resetForm();
                if (previousStatus !== null) {
                  setStatus(previousStatus);
                  fetchTrainersData({ status: previousStatus });
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
                onClick={() => addTrainerRef.current.handleSubmit()}
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
              fetchTrainersData({});
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
