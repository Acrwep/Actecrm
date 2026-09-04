import React, { useState, useRef, useEffect } from "react";
import {
  Row,
  Col,
  Tooltip,
  Drawer,
  Flex,
  Button,
  Radio,
  Divider,
  Checkbox,
  Progress,
} from "antd";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import {
  getAllDownlineUsers,
  getCustomerById,
  getAdmissions,
  getTableColumns,
  updateTableColumns,
  getBranches,
  getUsers,
} from "../ApiService/action";
import {
  getCurrentandPreviousweekDate,
  regionOptions,
} from "../Common/Validation";
import { FaRegEye } from "react-icons/fa";
import { RedoOutlined } from "@ant-design/icons";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import { FiFilter } from "react-icons/fi";
import { GiCheckMark } from "react-icons/gi";
import { FaXmark } from "react-icons/fa6";
import { FaRegCopy } from "react-icons/fa6";
import { PiPhoneCallFill } from "react-icons/pi";
import { LuNotepadText } from "react-icons/lu";
import {
  FaUser,
  FaPhoneAlt,
  FaWhatsapp,
  FaRegEnvelope,
  FaLink,
  FaDesktop,
  FaUserCheck,
  FaChartLine,
  FaHeadset,
  FaRegCommentDots,
  FaCheckDouble,
  FaRegFileAlt,
  FaFileSignature,
  FaStar,
  FaLinkedin,
  FaCertificate,
  FaGraduationCap,
  FaPhoneSlash,
  FaHandshake,
} from "react-icons/fa";
import { LuFileClock } from "react-icons/lu";
import CommonDnd from "../Common/CommonDnd";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { useSelector } from "react-redux";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import DraggableStudentModal from "../Common/DraggableStudentModal";
import CommonSelectField from "../Common/CommonSelectField";
import CustomerHistory from "../Customers/CustomerHistory";

export default function Admissions() {
  const mounted = useRef(false);

  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [allAdmissionsRegionCounts, setAllAdmissionsRegionCounts] =
    useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [modeStatus, setModeStatus] = useState("");
  const [isStatusUpdateDrawerLoading, setIsStatusUpdateDrawerLoading] =
    useState(false);
  const [isOpenCustomerDetailsModal, setIsOpenCustomerDetailsModal] =
    useState(false);
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  //feedback usestates
  const [loading, setLoading] = useState(true);
  //filter usestates
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const prevSelectedUserIdRef = useRef("[]");
  const [allDownliners, setAllDownliners] = useState([]);
  const [defaultAllDownliners, setDefaultAllDownliners] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
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

  const renderCellWithBackground = (
    status,
    extraProps = {},
    { showCopy = false, onCopy } = {},
  ) => {
    return {
      children: (
        <div
          style={{
            color: status ? "#2e7d32" : "#c62828",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {status ? (
            <GiCheckMark size={14} />
          ) : (
            <>
              <FaXmark size={14} />
              {showCopy && (
                <Tooltip
                  placement="top"
                  title="Copy Acknowledgement Link"
                  trigger={["hover", "click"]}
                >
                  <FaRegCopy
                    size={13}
                    color="#33333398"
                    style={{ cursor: "pointer", marginLeft: "6px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy?.();
                    }}
                  />
                </Tooltip>
              )}
            </>
          )}
        </div>
      ),
      props: {
        ...extraProps,
        style: {
          backgroundColor: status ? "#e8f5e9" : "#ffebee",
          ...(extraProps.style || {}),
        },
      },
    };
  };

  const nonChangeColumns = [
    {
      title: "Sl. No",
      key: "row_num",
      dataIndex: "row_num",
      width: 80,
      group: "General Info",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Joined Date",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 100,
      group: "General Info",
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Student Id",
      key: "student_id",
      dataIndex: "student_id",
      width: 100,
      group: "General Info",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <EllipsisTooltip text={text || "-"} />
          {text && (
            <FaRegEye
              size={14}
              className="trainers_action_icons"
              style={{ cursor: "pointer" }}
              onClick={() => {
                getParticularCustomerDetails(record?.customer_id);
              }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Course ",
      key: "course_name",
      dataIndex: "course_name",
      width: 140,
      group: "General Info",
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Sale Executive",
      key: "sale_executive",
      dataIndex: "sale_executive",
      width: 140,
      group: "General Info",
      render: (text, record) => {
        const lead_executive = `${record.assigned_to} - ${text}`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: "RA",
      key: "ra_user_name",
      dataIndex: "ra_user_name",
      width: 140,
      group: "General Info",
      render: (text, record) => {
        if (text) {
          const ra = `${record.ra_user_id} - ${text}`;
          return <EllipsisTooltip text={ra} />;
        } else {
          return "-";
        }
      },
    },
    {
      title: "HR",
      key: "hr_user_name",
      dataIndex: "hr_user_name",
      width: 140,
      group: "General Info",
      render: (text, record) => {
        if (text) {
          const hr = `${record.hr_user_id} - ${text}`;
          return <EllipsisTooltip text={hr} />;
        } else {
          return "-";
        }
      },
    },
    {
      title: (
        <Tooltip title="Welcome Call" placement="top">
          <div className="admissions_table_icons_container">
            <PiPhoneCallFill size={16} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "welcome_call_status",
      dataIndex: "welcome_call_status",
      width: 80,
      group: "Student Onboarding",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Requirement Verification" placement="top">
          <div className="admissions_table_icons_container">
            <LuNotepadText size={16} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "technology_verified",
      dataIndex: "technology_verified",
      width: 80,
      group: "Student Onboarding",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Trainer Assignment Request" placement="top">
          <div className="admissions_table_icons_container">
            <FaUser size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "trainer_assignment_request",
      dataIndex: "trainer_assignment_request",
      width: 80,
      group: "Student Onboarding",
      render: (text, record) => {
        let trainer_assigned = false;
        if (record?.trainer_mapping_id) {
          trainer_assigned = true;
        }
        return renderCellWithBackground(trainer_assigned);
      },
    },
    {
      title: (
        <Tooltip title="Trainer Fixation Call" placement="top">
          <div className="admissions_table_icons_container">
            <FaPhoneAlt size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "trainer_fixation_call",
      dataIndex: "trainer_fixation_call",
      width: 80,
      group: "Student Onboarding",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="WhatsApp Group Creation" placement="top">
          <div className="admissions_table_icons_container">
            <FaWhatsapp size={16} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "whatsapp_group_creation",
      dataIndex: "whatsapp_group_creation",
      width: 80,
      group: "Trainer Coordination",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Welcome Message" placement="top">
          <div className="admissions_table_icons_container">
            <FaRegEnvelope size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "hr_welcome_message",
      dataIndex: "hr_welcome_message",
      width: 80,
      group: "Trainer Coordination",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="ShareTeams Link & Attendance Link" placement="top">
          <div className="admissions_table_icons_container">
            <FaLink size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "shared_attendance_link",
      dataIndex: "shared_attendance_link",
      width: 80,
      group: "Trainer Coordination",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="First class Monitoring" placement="top">
          <div className="admissions_table_icons_container">
            <FaDesktop size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "first_class_monitoring",
      dataIndex: "first_class_monitoring",
      width: 80,
      group: "Trainer Coordination",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Trainer Confirmation" placement="top">
          <div className="admissions_table_icons_container">
            <FaUserCheck size={16} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "trainer_confirmation",
      dataIndex: "trainer_confirmation",
      width: 80,
      group: "Trainer Coordination",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Class Progress Monitoring" placement="top">
          <div className="admissions_table_icons_container">
            <FaChartLine size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "class_progress_monitoring",
      dataIndex: "class_progress_monitoring",
      width: 80,
      group: "Progress Monitoring",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Student Support" placement="top">
          <div className="admissions_table_icons_container">
            <FaHeadset size={16} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "student_support",
      dataIndex: "student_support",
      width: 80,
      group: "Progress Monitoring",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Mid Course Feedback" placement="top">
          <div className="admissions_table_icons_container">
            <FaRegCommentDots size={16} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "mid_course_feedback",
      dataIndex: "mid_course_feedback",
      width: 80,
      group: "Progress Monitoring",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Class completion Confirmation" placement="top">
          <div className="admissions_table_icons_container">
            <FaCheckDouble size={16} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "class_completion_confirmation",
      dataIndex: "class_completion_confirmation",
      width: 80,
      group: "Course Completion",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Trainer Completion report" placement="top">
          <div className="admissions_table_icons_container">
            <FaRegFileAlt size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "trainer_completion_report",
      dataIndex: "trainer_completion_report",
      width: 80,
      group: "Course Completion",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Student Completion Report" placement="top">
          <div className="admissions_table_icons_container">
            <FaFileSignature size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "student_completion_report",
      dataIndex: "student_completion_report",
      width: 80,
      group: "Course Completion",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Google review Collection" placement="top">
          <div className="admissions_table_icons_container">
            <FaStar size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "google_review_collection",
      dataIndex: "google_review_collection",
      width: 80,
      group: "Review & Certifications",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="LinkedIn Recommendation" placement="top">
          <div className="admissions_table_icons_container">
            <FaLinkedin size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "linkedin_recommendation",
      dataIndex: "linkedin_recommendation",
      width: 80,
      group: "Review & Certifications",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Cerificate Verification" placement="top">
          <div className="admissions_table_icons_container">
            <FaCertificate size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "certificate_verification",
      dataIndex: "certificate_verification",
      width: 80,
      group: "Review & Certifications",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Course Completion Certificate" placement="top">
          <div className="admissions_table_icons_container">
            <FaGraduationCap size={16} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "course_completion_certificate",
      dataIndex: "course_completion_certificate",
      width: 80,
      group: "Review & Certifications",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Course Closure Call" placement="top">
          <div className="admissions_table_icons_container">
            <FaPhoneSlash size={15} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "course_closure_call",
      dataIndex: "course_closure_call",
      width: 80,
      group: "Review & Certifications",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: (
        <Tooltip title="Placement Handover" placement="top">
          <div className="admissions_table_icons_container">
            <FaHandshake size={16} style={{ flexShrink: 0 }} />
          </div>
        </Tooltip>
      ),
      key: "placement_handover",
      dataIndex: "placement_handover",
      width: 80,
      group: "Review & Certifications",
      render: (text) => renderCellWithBackground(text),
    },
    {
      title: "View",
      key: "action",
      dataIndex: "action",
      width: 75,
      fixed: "right",
      group: "Action",
      render: (text, record) => {
        return (
          <Tooltip
            placement="top"
            title="View Customer Full Details"
            trigger={["hover", "click"]}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
              onClick={() => {
                setIsOpenDetailsDrawer(true);
                setCustomerId(record?.customer_id);
              }}
            >
              <FaRegEye
                size={15}
                className="trainers_action_icons"
                style={{ flexShrink: 0 }}
              />
            </div>
          </Tooltip>
        );
      },
    },

    {
      title: "History",
      key: "history",
      dataIndex: "history",
      width: 75,
      fixed: "right",
      group: "Action",
      render: (text, record) => {
        return (
          <Tooltip
            placement="top"
            title="View Customer History"
            trigger={["hover", "click"]}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
              onClick={() => {
                setCustomerId(record?.customer_id);
                setIsOpenCustomerHistoryDrawer(true);
              }}
            >
              <LuFileClock
                size={15}
                className="trainers_action_icons"
                style={{ flexShrink: 0 }}
              />
            </div>
          </Tooltip>
        );
      },
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true })),
  );
  const [tableColumns, setTableColumns] = useState(nonChangeColumns);
  const [customersData, setCustomersData] = useState([]);

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    setLoginUserId(convertAsJson?.user_id);
    setTimeout(() => {
      getTableColumnsData(convertAsJson?.user_id);
    }, 300);

    setTableColumns(nonChangeColumns);
  }, [permissions]);

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      getAllDownlineUsersData(null);
    }
  }, [childUsers]);

  useEffect(() => {
    const handler = async (e) => {
      const data = e.detail;
      console.log("Received via event:", data, allDownliners);
      setSearchValue("");
      setSelectedUserId(null);

      // Re-run your existing logic
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      try {
        const response = await getAllDownlineUsers(convertAsJson.user_id);
        console.log("all downlines response", response);
        const downliners = response?.data?.data || [];
        const downliners_ids = downliners.map((u) => {
          return u.user_id;
        });
        setAllDownliners(downliners_ids);
      } catch (error) {
        console.log("all downlines error", error);
      }
    };

    window.addEventListener("notificationFilter", handler);
    return () => window.removeEventListener("notificationFilter", handler);
  }, []);

  const getAllDownlineUsersData = async (user_id, isRefresh = false) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);

    try {
      const response = await getAllDownlineUsers(
        user_id ? user_id : convertAsJson.user_id,
      );
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setDefaultAllDownliners(downliners_ids);
      getAdmissionsData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        null,
        null,
        null,
        null,
        downliners_ids,
        1,
        10,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getAdmissionsData = async (
    startDate,
    endDate,
    searchvalue,
    bucket,
    regionId,
    branchId,
    downliners,
    pageNumber,
    limit,
  ) => {
    setLoading(true);
    console.log(
      startDate,
      endDate,
      searchvalue,
      bucket,
      regionId,
      branchId,
      downliners,
      pageNumber,
      limit,
    );

    const payload = {
      ...(searchvalue && { search_filter: searchvalue }),
      from_date: startDate,
      to_date: endDate,
      bucket: bucket,
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      user_ids: downliners,
      page: pageNumber,
      limit: limit,
    };

    try {
      const response = await getAdmissions(payload);
      console.log("admissions response", response);
      const customers = response?.data?.data?.customers || [];
      const pagination = response?.data?.data?.pagination;

      setCustomersData(customers);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
      setAllAdmissionsRegionCounts({
        chennai_region: response?.data?.data?.chennai_region || 0,
        bangalore_region: response?.data?.data?.bangalore_region || 0,
        hub_region: response?.data?.data?.hub_region || 0,
        online_mode: response?.data?.data?.online_mode || 0,
        classroom_mode: response?.data?.data?.classroom_mode || 0,
      });
    } catch (error) {
      setCustomersData([]);
      console.log("get customers error", error);
    } finally {
      setLoading(false);
    }
  };

  const getTableColumnsData = async (user_id) => {
    try {
      const response = await getTableColumns(user_id);
      const data = response?.data?.data || [];
      if (data.length === 0) {
        setUpdateTableId(null);
        const newCols = nonChangeColumns.map((c) => ({
          ...c,
          isChecked: true,
        }));
        setColumns(newCols);
        setTableColumns(nonChangeColumns);
        return updateTableColumnsData(newCols);
      }

      const filterPage = data.find((f) => f.page_name === "Admissions");

      if (!filterPage) {
        setUpdateTableId(null);
        const newCols = nonChangeColumns.map((c) => ({
          ...c,
          isChecked: true,
        }));
        setColumns(newCols);
        setTableColumns(nonChangeColumns);
        return updateTableColumnsData(newCols);
      }

      setUpdateTableId(filterPage.id);

      const filteredBackendColumns = filterPage.column_names || [];

      const attachRenderFunctions = (cols) =>
        cols.map((col) => {
          const original = nonChangeColumns.find((c) => c.key === col.key);
          if (original) {
            return {
              ...col,
              title: original.title,
              width: original.width,
              fixed: original.fixed,
              hidden: original.hidden,
              render: original.render,
              group: original.group,
            };
          }
          return col;
        });

      nonChangeColumns.forEach((c) => {
        if (!filteredBackendColumns.some((b) => b.key === c.key)) {
          filteredBackendColumns.push({ ...c, isChecked: true });
        }
      });

      const allColumns = attachRenderFunctions(filteredBackendColumns);
      const visibleColumns = attachRenderFunctions(
        filteredBackendColumns.filter((col) => col.isChecked),
      );

      setColumns(allColumns);
      setTableColumns(visibleColumns);
    } catch (error) {
      console.log("get table columns error", error);
    }
  };

  const updateTableColumnsData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Admissions",
      column_names: columns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  //get particular customer full details
  const getParticularCustomerDetails = async (customer_Id) => {
    setIsStatusUpdateDrawerLoading(true);
    try {
      const response = await getCustomerById(customer_Id);
      console.log("particular customer response", response);
      const customer_details = response?.data?.data;
      setCustomerDetails(customer_details);
      setIsOpenCustomerDetailsModal(true);
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    } finally {
      setIsStatusUpdateDrawerLoading(false);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getAdmissionsData(
      selectedDates[0],
      selectedDates[1],
      searchValue,
      modeStatus,
      selectedRegionId,
      selectedBranchId,
      allDownliners,
      page,
      limit,
    );
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setPagination({
      page: 1,
    });
    setTimeout(() => {
      getAdmissionsData(
        selectedDates[0],
        selectedDates[1],
        e.target.value,
        modeStatus,
        selectedRegionId,
        selectedBranchId,
        allDownliners,
        1,
        pagination.limit,
      );
    }, 300);
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
  };

  const handleSelectUserBlur = async () => {
    const value = selectedUserId;

    // if (!value || value.length <= 0) return;

    const stringifiedValue = JSON.stringify(value || []);
    if (prevSelectedUserIdRef.current === stringifiedValue) {
      return;
    }
    prevSelectedUserIdRef.current = stringifiedValue;

    try {
      const response = await getAllDownlineUsers(
        Array.isArray(value) && value.length > 0 ? value : loginUserId,
      );
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setPagination({
        page: 1,
      });
      getAdmissionsData(
        selectedDates[0],
        selectedDates[1],
        searchValue,
        modeStatus,
        selectedRegionId,
        selectedBranchId,
        downliners_ids,
        1,
        pagination.limit,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getBranchesData = async (regionid) => {
    const payload = {
      region_id: regionid,
    };
    try {
      const response = await getBranches(payload);
      const branch_data = response?.data?.result || [];

      if (branch_data.length >= 1) {
        if (regionid == 1 || regionid == 2) {
          const reordered = [
            ...branch_data.filter((item) => item.name !== "Online"),
            ...branch_data.filter((item) => item.name === "Online"),
          ];
          setBranchOptions(reordered);
        } else {
          setBranchOptions(branch_data);
          setSelectedBranchId(branch_data[0]?.id);
        }
      } else {
        setBranchOptions([]);
      }
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
    }
  };

  const getUsersData = async (regionId, branchId) => {
    const payload = {
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setSubUsers(response?.data?.data?.data || []);
    } catch (error) {
      setSubUsers([]);
      console.log("get all users error", error);
    }
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setIsOpenFilterDrawer(false);
    setCustomerDetails(null);
  };

  const handleRefresh = () => {
    setSearchValue("");
    setSelectedUserId([]);
    prevSelectedUserIdRef.current = "[]";
    setModeStatus("");
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setSubUsers(downlineUsers);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
    });
    getAllDownlineUsersData(null, true);
  };

  return (
    <div>
      <Row align="middle">
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={permissions.includes("Lead Executive Filter") ? 22 : 12}
          xxl={permissions.includes("Lead Executive Filter") ? 18 : 12}
        >
          <Row gutter={12} align="middle" wrap={false}>
            <Col flex="1 1 0%">
              <div
                className="overallduecustomers_filterContainer"
                style={{ marginBottom: "0px" }}
              >
                {/* Search Input */}
                <CommonOutlinedInput
                  label={"Search..."}
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
                          getAdmissionsData(
                            selectedDates[0],
                            selectedDates[1],
                            null,
                            modeStatus,
                            selectedRegionId,
                            selectedBranchId,
                            allDownliners,
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
                  onChange={handleSearch}
                  value={searchValue}
                  style={{
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                />
              </div>
            </Col>
            {permissions.includes("Lead Executive Filter") && (
              <>
                <Col flex="0.8 1 0%">
                  <CommonSelectField
                    height="33px"
                    label="Select Region"
                    labelMarginTop="0px"
                    labelFontSize="11px"
                    options={regionOptions}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedRegionId(value);
                      setSelectedBranchId(null);
                      setSelectedUserId([]);
                      setPagination({
                        page: 1,
                        limit: pagination.limit,
                      });
                      getAdmissionsData(
                        selectedDates[0],
                        selectedDates[1],
                        searchValue,
                        modeStatus,
                        value,
                        null,
                        defaultAllDownliners,
                        1,
                        pagination.limit,
                      );
                      if (value) {
                        getUsersData(value, null);
                        getBranchesData(value);
                      } else {
                        setBranchOptions([]);
                        setSubUsers(downlineUsers);
                      }
                    }}
                    value={selectedRegionId}
                    disableClearable={false}
                  />
                </Col>

                <Col flex="0.8 1 0%">
                  <CommonSelectField
                    height="33px"
                    label="Select Branch"
                    labelMarginTop="0px"
                    labelFontSize="11px"
                    options={branchOptions}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedBranchId(value);
                      setSelectedUserId([]);
                      getUsersData(selectedRegionId, value);
                      setPagination({
                        page: 1,
                        limit: pagination.limit,
                      });
                      getAdmissionsData(
                        selectedDates[0],
                        selectedDates[1],
                        searchValue,
                        modeStatus,
                        selectedRegionId,
                        value,
                        defaultAllDownliners,
                        1,
                        pagination.limit,
                      );
                    }}
                    value={selectedBranchId}
                    disableClearable={false}
                    disabled={selectedRegionId == 3 ? true : false}
                  />
                </Col>
                <Col flex="1 1 0%">
                  <CommonMultiSelectField
                    height="34px"
                    label="Select User"
                    labelMarginTop="1px"
                    labelFontSize="11px"
                    options={subUsers}
                    onChange={handleSelectUser}
                    onBlur={handleSelectUserBlur}
                    value={selectedUserId}
                  />
                </Col>
              </>
            )}
            <Col flex="1.5 1 0%">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "nowrap",
                  }}
                >
                  <div style={{ flex: "0 0 120px" }}>
                    <CommonMuiCustomDatePicker
                      width="280px"
                      dateFontSize="12.5px"
                      value={selectedDates}
                      onDateChange={(dates) => {
                        setSelectedDates(dates);
                        setPagination({
                          page: 1,
                        });
                        getAdmissionsData(
                          dates[0],
                          dates[1],
                          searchValue,
                          modeStatus,
                          selectedRegionId,
                          selectedBranchId,
                          allDownliners,
                          1,
                          pagination.limit,
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={permissions.includes("Lead Executive Filter") ? 2 : 12}
          xxl={permissions.includes("Lead Executive Filter") ? 6 : 12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setIsOpenFilterDrawer(true);
              getTableColumnsData(loginUserId);
            }}
          />

          {/* {permissions.includes("Download Customers Data") && (
            <Tooltip placement="top" title="Download">
              <Button
                className="reports_download_button"
                // onClick={() => {
                //   const isWithIn30days = isWithin30Days(
                //     selectedDates[0],
                //     selectedDates[1],
                //   );
                //   console.log("isWithIn30days", isWithIn30days);
                //   const googleReview = {
                //     title: "Google Review",
                //     key: "google_review",
                //     dataIndex: "google_review",
                //   };

                //   const linkedinReview = {
                //     title: "Linkedin Review",
                //     key: "linkedin_review",
                //     dataIndex: "linkedin_review",
                //   };

                //   const alterColumns = columns
                //     // Remove Action and Review Status columns
                //     .filter(
                //       (f) =>
                //         f.title !== "Action" && f.title !== "Review Status",
                //     )
                //     // Insert Google Review & Linkedin Review after TR Number
                //     .flatMap((col) => {
                //       if (col.title === "TR Number") {
                //         return [col, googleReview, linkedinReview];
                //       }

                //       return [col];
                //     });
                //   console.log("alterColumns", alterColumns);
                //   DownloadTableAsCSV(
                //     customersData,
                //     alterColumns,
                //     `${moment(selectedDates[0]).format(
                //       "DD-MM-YYYY",
                //     )} to ${moment(selectedDates[1]).format("DD-MM-YYYY")} ${
                //       status == "" ? "All" : status
                //     } Customers.csv`,
                //   );
                // }}
              >
                <DownloadOutlined size={10} className="download_icon" />
              </Button>
            </Tooltip>
          )} */}

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

      {permissions.includes("Show Region Summary") ? (
        <>
          <div
            className="customers_scroll_wrapper"
            style={{ marginTop: "12px", marginBottom: "0px" }}
          >
            <div
              className="customers_status_mainContainer"
              style={{
                marginTop: "0px",
                marginBottom: "0px",
                display: "flex",
                gap: "12px",
              }}
            >
              <div
                className={
                  modeStatus === "Online"
                    ? "customers_active_completed_container"
                    : "customers_completed_container"
                }
                onClick={() => {
                  if (modeStatus == "Online") {
                    return;
                  }
                  setModeStatus("Online");
                  getAdmissionsData(
                    selectedDates[0],
                    selectedDates[1],
                    searchValue,
                    "Online",
                    selectedRegionId,
                    selectedBranchId,
                    allDownliners,
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Online {`( ${allAdmissionsRegionCounts?.online_mode ?? 0} )`}
                </p>
              </div>

              <div
                className={
                  modeStatus === "Classroom"
                    ? "customers_active_verifytrainers_container"
                    : "customers_verifytrainers_container"
                }
                onClick={() => {
                  if (modeStatus == "Classroom") {
                    return;
                  }
                  setModeStatus("Classroom");
                  getAdmissionsData(
                    selectedDates[0],
                    selectedDates[1],
                    searchValue,
                    "Classroom",
                    selectedRegionId,
                    selectedBranchId,
                    allDownliners,
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Classroom{" "}
                  {`( ${allAdmissionsRegionCounts?.classroom_mode ?? 0} )`}
                </p>
              </div>
            </div>
          </div>

          <Row>
            <Col span={12}>
              <div
                className="livelead_today_summary_container"
                style={{ marginTop: "12px" }}
              >
                <p className="livelead_today_label">REGION SUMMARY</p>

                <div className="livelead_badge_item online">
                  <div
                    className="livelead_badge_dot"
                    style={{ backgroundColor: "#3c9111" }}
                  />
                  <p className="livelead_badge_text">
                    Hub{" "}
                    <span className="livelead_badge_count">
                      {allAdmissionsRegionCounts?.hub_region ?? 0}
                    </span>
                  </p>
                </div>

                <div className="livelead_badge_item classroom">
                  <div
                    className="livelead_badge_dot"
                    style={{ backgroundColor: "#1e90ff" }}
                  />
                  <p className="livelead_badge_text">
                    Chennai{" "}
                    <span className="livelead_badge_count">
                      {allAdmissionsRegionCounts?.chennai_region ?? 0}
                    </span>
                  </p>
                </div>

                <div className="livelead_badge_item classroom">
                  <div
                    className="livelead_badge_dot"
                    style={{ backgroundColor: "#5b69ca" }}
                  />
                  <p className="livelead_badge_text">
                    Bangalore{" "}
                    <span className="livelead_badge_count">
                      {allAdmissionsRegionCounts?.bangalore_region ?? 0}
                    </span>
                  </p>
                </div>

                <div className="livelead_badge_item total">
                  <div
                    className="livelead_badge_dot"
                    style={{ backgroundColor: "#5b69ca" }}
                  />
                  <p className="livelead_badge_text">
                    Total{" "}
                    <span className="livelead_badge_count">
                      {(allAdmissionsRegionCounts?.hub_region ?? 0) +
                        (allAdmissionsRegionCounts?.chennai_region ?? 0) +
                        (allAdmissionsRegionCounts?.bangalore_region ?? 0)}
                    </span>
                  </p>
                </div>
              </div>
            </Col>
            <Col
              span={12}
              style={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div className="admissions_progress_container">
                <span className="admissions_progress_label">
                  Overall Progress:
                </span>
                <Progress
                  percent={65}
                  showInfo={false}
                  strokeWidth={6}
                  strokeColor={{
                    "0%": "#8a9bf8",
                    "100%": "#5b69ca",
                  }}
                  trailColor="#f1f5f9"
                  className="admissions_progress_bar"
                />
                <span className="admissions_progress_text">65%</span>
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <Row style={{ marginTop: "12px" }}>
          <Col span={12}>
            <div
              className="customers_scroll_wrapper"
              style={{ marginTop: "12px", marginBottom: "0px" }}
            >
              <div
                className="customers_status_mainContainer"
                style={{
                  marginTop: "0px",
                  marginBottom: "0px",
                  display: "flex",
                  gap: "12px",
                }}
              >
                <div
                  className={
                    modeStatus === "Online"
                      ? "customers_active_completed_container"
                      : "customers_completed_container"
                  }
                  onClick={() => {
                    if (modeStatus == "Online") {
                      return;
                    }
                    setModeStatus("Online");
                    getAdmissionsData(
                      selectedDates[0],
                      selectedDates[1],
                      searchValue,
                      "Online",
                      selectedRegionId,
                      selectedBranchId,
                      allDownliners,
                      1,
                      pagination.limit,
                    );
                  }}
                >
                  <p>
                    Online{" "}
                    {`( ${allAdmissionsRegionCounts?.online_mode ?? 0} )`}
                  </p>
                </div>

                <div
                  className={
                    modeStatus === "Classroom"
                      ? "customers_active_verifytrainers_container"
                      : "customers_verifytrainers_container"
                  }
                  onClick={() => {
                    if (modeStatus == "Classroom") {
                      return;
                    }
                    setModeStatus("Classroom");
                    getAdmissionsData(
                      selectedDates[0],
                      selectedDates[1],
                      searchValue,
                      "Classroom",
                      selectedRegionId,
                      selectedBranchId,
                      allDownliners,
                      1,
                      pagination.limit,
                    );
                  }}
                >
                  <p>
                    Classroom{" "}
                    {`( ${allAdmissionsRegionCounts?.classroom_mode ?? 0} )`}
                  </p>
                </div>
              </div>
            </div>
          </Col>

          <Col
            span={12}
            style={{
              marginTop: "12px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <div className="admissions_progress_container">
              <span className="admissions_progress_label">
                Overall Progress:
              </span>
              <Progress
                percent={65}
                showInfo={false}
                strokeWidth={6}
                strokeColor={{
                  "0%": "#8a9bf8",
                  "100%": "#5b69ca",
                }}
                trailColor="#f1f5f9"
                className="admissions_progress_bar"
              />
              <span className="admissions_progress_text">65%</span>
            </div>
          </Col>
        </Row>
      )}

      <div style={{ marginTop: "22px" }}>
        {(() => {
          const colorPalette = {
            "General Info": {
              groupHeaderClass: "group-header-violet",
              headerClass: "header-violet",
            },
            "Student Onboarding": {
              groupHeaderClass: "group-header-blue",
              headerClass: "header-blue",
            },
            "Trainer Coordination": {
              groupHeaderClass: "group-header-green",
              headerClass: "header-green",
            },
            "Progress Monitoring": {
              groupHeaderClass: "group-header-yellow",
              headerClass: "header-yellow",
            },
            "Course Completion": {
              groupHeaderClass: "group-header-orange",
              headerClass: "header-orange",
            },
            "Review & Certifications": {
              groupHeaderClass: "group-header-purple",
              headerClass: "header-purple",
            },
            Action: {
              groupHeaderClass: "group-header-violet",
              headerClass: "header-violet",
            },
          };

          const groupedTableColumns = [];
          tableColumns.forEach((col) => {
            if (col.group) {
              const palette = colorPalette[col.group];
              let group = groupedTableColumns.find((g) => g.key === col.group);
              if (!group) {
                group = {
                  title: (
                    <div
                      style={{
                        minHeight: "24px",
                        lineHeight: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {col.group}
                    </div>
                  ),
                  key: col.group,
                  children: [],
                  className: palette?.groupHeaderClass,
                  onHeaderCell: () => ({
                    className: palette?.groupHeaderClass,
                  }),
                };
                groupedTableColumns.push(group);
              }
              group.children.push({
                ...col,
                onHeaderCell: () => ({
                  className: palette?.headerClass,
                }),
                onCell: () => ({
                  className: palette?.cellClass,
                }),
              });
            } else {
              groupedTableColumns.push(col);
            }
          });

          return (
            <CommonTable
              // scroll={{ x: 2350 }}
              scroll={{
                x: tableColumns.reduce(
                  (total, col) => total + (col.width || 150),
                  0,
                ),
              }}
              columns={groupedTableColumns}
              dataSource={customersData}
              dataPerPage={10}
              loading={loading}
              checkBox="false"
              size="small"
              className="admissions_table"
              onPaginationChange={handlePaginationChange} // callback to fetch new data
              limit={pagination.limit} // page size
              page_number={pagination.page} // current page
              totalPageNumber={pagination.total} // total rows
            />
          );
        })()}
      </div>

      <Drawer
        title="Customer Details"
        open={isOpenDetailsDrawer}
        onClose={() => {
          setIsOpenDetailsDrawer(false);
          setCustomerId(null);
        }}
        width="50%"
        style={{ position: "relative" }}
      >
        {isOpenDetailsDrawer ? (
          <ParticularCustomerDetails customerId={customerId} />
        ) : (
          ""
        )}
      </Drawer>

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
              <p style={{ fontWeight: 400, fontSize: "13px" }}>Check All</p>
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
                  page_name: "Admissions",
                  column_names: columns,
                };
                getAdmissionsData(
                  selectedDates[0],
                  selectedDates[1],
                  searchValue,
                  modeStatus,
                  selectedRegionId,
                  selectedBranchId,
                  allDownliners,
                  pagination.page,
                  pagination.limit,
                );
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

      <DraggableStudentModal
        open={isOpenCustomerDetailsModal}
        onClose={() => setIsOpenCustomerDetailsModal(false)}
        customerDetails={customerDetails}
      />

      {/* customer history drawer */}
      <CustomerHistory
        customerId={customerId}
        isOpen={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setCustomerId(null);
        }}
      />
    </div>
  );
}
