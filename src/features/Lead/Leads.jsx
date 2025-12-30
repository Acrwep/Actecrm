import React, { useState, useEffect, useRef } from "react";
import {
  Col,
  Row,
  Drawer,
  Tooltip,
  Divider,
  Flex,
  Radio,
  Button,
  Checkbox,
  Modal,
  Switch,
  Spin,
} from "antd";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import {
  addressValidator,
  calculateAmount,
  formatAddress,
  formatToBackendIST,
  getBalanceAmount,
  getConvenienceFees,
  getCurrentandPreviousweekDate,
  isWithin30Days,
  priceValidator,
  selectValidator,
} from "../Common/Validation";
import CommonSelectField from "../Common/CommonSelectField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { LoadingOutlined } from "@ant-design/icons";
import { DownloadOutlined } from "@ant-design/icons";
import { MdFormatListNumbered } from "react-icons/md";
import CommonTextArea from "../Common/CommonTextArea";
import CommonTable from "../Common/CommonTable";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";
import CommonDnd from "../Common/CommonDnd";
import { Country, State } from "country-state-city";
import { IoFilter } from "react-icons/io5";
import {
  assignLead,
  downloadLeads,
  getAllDownlineUsers,
  getLeads,
  getLeadsCountByUserIds,
  getTableColumns,
  getUsers,
  leadPayment,
  sendCustomerFormEmail,
  sendCustomerPaymentVerificationEmail,
  sendCustomerWelcomeEmail,
  addQualityComments,
  updateTableColumns,
  updateQualityComments,
} from "../ApiService/action";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { FaRegAddressCard } from "react-icons/fa";
import { SlGlobe } from "react-icons/sl";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { useDispatch, useSelector } from "react-redux";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import QualityIcon from "../../assets/q.png";
import AddLead from "./AddLead";
import { FormControl, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CommonGroupedSelectField from "../Common/CommonGroupedSelectField";
import { storeLeadFilterValues } from "../Redux/Slice";
import EllipsisTooltip from "../Common/EllipsisTooltip";

export default function Leads({
  refreshLeadFollowUp,
  setLeadCount,
  leadTypeOptions,
  regionOptions,
  setLeadCountLoading,
  refreshToggle,
  setRefreshToggle,
}) {
  const dispatch = useDispatch();
  const mounted = useRef(false);
  const addLeaduseRef = useRef();
  const courseOptions = useSelector((state) => state.courselist);

  const [leadData, setLeadData] = useState([]);

  const filterValuesFromRedux = useSelector((state) => state.leadfiltervalues);
  const [searchValue, setSearchValue] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isShowEdit, setIsShowEdit] = useState(true);

  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [updateLeadItem, setUpdateLeadItem] = useState(null);
  const batchTrackOptions = [
    {
      id: 1,
      name: "Normal",
    },
    {
      id: 2,
      name: "Fastrack",
    },
    {
      id: 3,
      name: "Custom",
    },
  ];
  const [loading, setLoading] = useState(true);
  const [invoiceButtonLoading, setInvoiceButtonLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [saveOnlyLoading, setSaveOnlyLoading] = useState(false);
  const [filterType, setFilterType] = useState(1);
  const [downloadButtonLoader, setDownloadButtonLoader] = useState(false);

  //payment usestates
  const [isQualityCommentSection, setIsQualityCommentSection] = useState(false);
  const [isOpenPaymentDrawer, setIsOpenPaymentDrawer] = useState(false);
  const [clickedLeadItem, setClickedLeadItem] = useState(null);
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentDateError, setPaymentDateError] = useState("");
  const [placeOfPayment, setPlaceOfPayment] = useState(null);
  const [placeOfPaymentError, setPlaceOfPaymentError] = useState("");
  const [paymentMode, setPaymentMode] = useState(null);
  const [paymentModeError, setPaymentModeError] = useState(null);
  const [subTotal, setSubTotal] = useState();
  const [convenienceFees, setConvenienceFees] = useState("");
  const [taxType, setTaxType] = useState("");
  const [taxTypeError, setTaxTypeError] = useState("");
  const [amount, setAmount] = useState();
  const [paidNow, setPaidNow] = useState("");
  const [paidNowError, setPaidNowError] = useState("");
  const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
  const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
  const [paymentValidationTrigger, setPaymentValidationTrigger] =
    useState(false);
  const [balanceAmount, setBalanceAmount] = useState();
  const [isShowDueDate, setIsShowDueDate] = useState(true);
  const [dueDate, setDueDate] = useState(null);
  const [dueDateError, setDueDateError] = useState("");
  const [customerCourseId, setCustomerCourseId] = useState(null);
  const [customerBatchTrackId, setCustomerBatchTrackId] = useState(null);
  const batchTimingOptions = [
    {
      id: 1,
      name: "Week Day",
    },
    {
      id: 2,
      name: "Week End",
    },
    {
      id: 3,
      name: "Fast Track",
    },
  ];
  const [customerBatchTimingId, setCustomerBatchTimingId] = useState(null);
  const [customerBatchTimingIdError, setCustomerBatchTimingIdError] =
    useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentLocationError, setCurrentLocationError] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerAddressError, setCustomerAddressError] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateCodeError, setStateCodeError] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [placementSupport, setPlacementSupport] = useState(null);
  const [placementSupportError, setPlacementSupportError] = useState("");
  const [serverRequired, setServerRequired] = useState(false);
  //assign lead usestates
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  //assign lead
  const [isOpenAssignModal, setIsOpenAssignModal] = useState(false);
  const [allUsersList, setAllUsersList] = useState([]);
  const [assignId, setAssignId] = useState(null);
  const [assignIdError, setAssignIdError] = useState("");
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);
  //lead executive
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [leadCountByExecutives, setLeadCountByExecutives] = useState([]);
  const [leadExeCountLoading, setLeadExeCountLoading] = useState(false);
  const [executiveCountTooltip, setExecutiveCountTooltip] = useState(false);
  const [allDownliners, setAllDownliners] = useState([]);
  //lead source filter
  const [leadSourceFilterId, setLeadSourceFilterId] = useState(null);
  //quality comment usestates
  const [qualityComments, setQualityComments] = useState("");
  const [qualityCommentsError, setQualityCommentsError] = useState("");
  const [qualityStatus, setQualityStatus] = useState(null);
  const [qualityStatusError, setQualityStatusError] = useState(null);
  const [cnaDate, setCnaDate] = useState(null);
  const [cnaDateError, setCnaDateError] = useState("");
  const [isQualityCommentUpdate, setIsQualityCommentUpdate] = useState(false);
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
    { title: "Sl. No", key: "row_num", dataIndex: "row_num", width: 60 },
    {
      title: "Lead Executive",
      key: "lead_assigned_to_name",
      dataIndex: "lead_assigned_to_name",
      width: 160,
      render: (text, record) => {
        const lead_executive = `${record.lead_assigned_to_id} - ${text}`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: "Created At",
      key: "created_date",
      dataIndex: "created_date",
      width: 120,
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      width: 170,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    {
      title: "Country",
      key: "country",
      dataIndex: "country",
      width: 120,
      render: (text) => {
        return (
          <div>
            <p> {getCountryName(text)}</p>
          </div>
        );
      },
    },
    {
      title: "State",
      key: "state",
      dataIndex: "state",
      width: 150,
      render: (text, record) => {
        return (
          <div>
            <p> {getStateName(record.country, text)}</p>
          </div>
        );
      },
    },
    { title: "City ", key: "area_id", dataIndex: "area_id", width: 120 },
    {
      title: "Lead Source",
      key: "lead_type",
      dataIndex: "lead_type",
      width: 140,
    },
    {
      title: "Primary Course",
      key: "primary_course",
      dataIndex: "primary_course",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Primary Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      width: 160,
      render: (text, record) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Secondary Course ",
      key: "secondary_course",
      dataIndex: "secondary_course",
      width: 180,
    },
    {
      title: "Secondary Course Fees",
      key: "secondary_fees",
      dataIndex: "secondary_fees",
      width: 180,
    },
    {
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 140,
    },
    {
      title: "Branch",
      key: "branch_name",
      dataIndex: "branch_name",
      width: 160,
    },
    {
      title: "Batch Track",
      key: "batch_track",
      dataIndex: "batch_track",
      width: 120,
    },
    {
      title: "Next Followup Date",
      key: "next_follow_up_date",
      dataIndex: "next_follow_up_date",
      width: 160,
      render: (text, record) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Expected Join Date",
      key: "expected_join_date",
      dataIndex: "expected_join_date",
      width: 160,
      render: (text, record) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Lead Priority",
      key: "lead_status",
      dataIndex: "lead_status",
      fixed: "right",
      width: 130,
      render: (text) => {
        return (
          <div
            className={
              text == "High"
                ? "leadmanager_leadstatus_high_container"
                : text == "Medium"
                ? "leadmanager_leadstatus_medium_container"
                : text == "Low"
                ? "leadmanager_leadstatus_low_container"
                : "leadmanager_leadstatus_junk_container"
            }
          >
            <p>{text}</p>
          </div>
        );
      },
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
      width: 120,
      render: (text, record) => (
        <div className="trainers_actionbuttonContainer">
          {/* {permissions.includes("Add Quality Comment") && (
            <Tooltip placement="bottom" title="Add Comments">
              <img
                src={QualityIcon}
                className="leadmanager_qualityicon"
                onClick={() => {
                  setIsQualityCommentSection(true);
                  setIsOpenPaymentDrawer(true);
                  setClickedLeadItem(record);
                }}
              />
            </Tooltip>
          )} */}
          {permissions.includes("Edit Lead Button") &&
          isShowEdit &&
          record.is_customer_reg === 0 ? (
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              // onClick={() => handleEdit(record)}
              onClick={() => {
                setUpdateLeadItem(record);
                setLeadId(record.id);
                setIsOpenAddDrawer(true);
              }}
            />
          ) : (
            ""
          )}

          {record.is_customer_reg === 1 ? (
            <Tooltip placement="bottom" title="Already a Customer">
              <FaRegAddressCard
                size={19}
                color="#2ed573"
                className="trainers_action_icons"
              />
            </Tooltip>
          ) : (
            <Tooltip placement="bottom" title="Make as customer">
              <FaRegAddressCard
                size={19}
                color="#d32f2f"
                className="trainers_action_icons"
                onClick={() => {
                  if (permissions.includes("Edit Lead Button")) {
                    setIsOpenPaymentDrawer(true);
                    setSubTotal(parseFloat(record.primary_fees));
                    setAmount(parseFloat(record.primary_fees));
                    setBalanceAmount(parseFloat(record.primary_fees));
                    setCustomerCourseId(record.primary_course_id);
                    setCustomerBatchTrackId(record.batch_track_id);
                    setClickedLeadItem(record);
                    setTimeout(() => {
                      const drawerBody = document.querySelector(
                        "#leadmanager_paymentdetails_drawer .ant-drawer-body"
                      );
                      if (drawerBody) {
                        drawerBody.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }
                    }, 300);
                  } else {
                    CommonMessage("error", "Access Denied");
                  }
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const [columns, setColumns] = useState(
    nonChangeColumns.map((col) => ({ ...col, isChecked: true }))
  );

  const [tableColumns, setTableColumns] = useState(nonChangeColumns);

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  useEffect(() => {
    setTableColumns(nonChangeColumns);
  }, [permissions, isShowEdit]);

  useEffect(() => {
    getUsersData();
  }, []);

  const getUsersData = async () => {
    const payload = {
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setAllUsersList(response?.data?.data?.data || []);
    } catch (error) {
      setAllUsersList([]);
      console.log("get all users error", error);
    }
  };

  useEffect(() => {
    if (permissions.length >= 1) {
      if (!permissions.includes("Lead Manager Page")) {
        return;
      }
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setSelectedDates([
        filterValuesFromRedux.start_date,
        filterValuesFromRedux.end_date,
      ]);
      setFilterType(filterValuesFromRedux.filterType);
      setSearchValue(filterValuesFromRedux.searchValue);
      setLeadSourceFilterId(filterValuesFromRedux.lead_source);
      setSelectedUserId(filterValuesFromRedux.user_id);
      setPagination({
        page: filterValuesFromRedux.pageNumber,
        limit: filterValuesFromRedux.pageLimit,
      });

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setTimeout(() => {
        getTableColumnsData(convertAsJson?.user_id);
      }, 300);

      if (childUsers.length > 0 && !mounted.current) {
        setSubUsers(downlineUsers);
        mounted.current = true;
        setLoginUserId(convertAsJson?.user_id);
        getAllDownlineUsersData(
          filterValuesFromRedux.user_id
            ? filterValuesFromRedux.user_id
            : convertAsJson?.user_id
        );
        // getAllLeadData(
        //   null,
        //   PreviousAndCurrentDate[0],
        //   PreviousAndCurrentDate[1],
        //   null,
        //   1,
        //   10
        // );
      }
    }
  }, [childUsers, permissions]);

  const getTableColumnsData = async (user_id) => {
    try {
      const response = await getTableColumns(user_id);
      console.log("get table columns response", response);

      const data = response?.data?.data || [];
      if (data.length === 0) {
        return updateTableColumnsData();
      }

      const filterPage = data.find((f) => f.page_name === "Leads");
      if (!filterPage) {
        setUpdateTableId(null);
        return updateTableColumnsData();
      }

      // --- ✅ Helper function to reattach render logic ---
      const attachRenderFunctions = (cols) =>
        cols.map((col) => {
          switch (col.key) {
            case "row_num":
              return {
                ...col,
                width: 60,
              };
            case "lead_assigned_to_name":
              return {
                ...col,
                render: (text, record) => {
                  const lead_executive = `${record.lead_assigned_to_id} - ${text}`;
                  return <EllipsisTooltip text={lead_executive} />;
                },
              };
            case "name":
              return {
                ...col,
                width: 170,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "email":
              return {
                ...col,
                width: 200,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "created_date":
              return {
                ...col,
                render: (text) => <p>{moment(text).format("DD/MM/YYYY")}</p>,
              };
            case "country":
              return {
                ...col,
                render: (text) => {
                  return (
                    <div>
                      <p> {getCountryName(text)}</p>
                    </div>
                  );
                },
              };
            case "state":
              return {
                ...col,
                render: (text, record) => {
                  return (
                    <div>
                      <p> {getStateName(record.country, text)}</p>
                    </div>
                  );
                },
              };
            case "primary_course":
              return {
                ...col,
                width: 200,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "primary_fees":
              return {
                ...col,
                width: 160,
                render: (text, record) => {
                  return <p>{"₹" + text}</p>;
                },
              };
            case "secondary_course":
              return {
                ...col,
                width: 160,
              };
            case "secondary_fees":
              return {
                ...col,
                width: 180,
              };
            case "lead_status":
              return {
                ...col,
                title: "Lead Priority",
                width: 130,
                render: (text) => {
                  return (
                    <div
                      className={
                        text == "High"
                          ? "leadmanager_leadstatus_high_container"
                          : text == "Medium"
                          ? "leadmanager_leadstatus_medium_container"
                          : text == "Low"
                          ? "leadmanager_leadstatus_low_container"
                          : "leadmanager_leadstatus_junk_container"
                      }
                    >
                      <p>{text}</p>
                    </div>
                  );
                },
              };
            case "comments":
              return {
                ...col,
                width: 200,
                render: (text) => {
                  return <EllipsisTooltip text={text} />;
                },
              };
            case "action":
              return {
                ...col,
                render: (text, record) => (
                  <div className="trainers_actionbuttonContainer">
                    {/* {permissions.includes("Add Quality Comment") && (
                      <Tooltip placement="bottom" title="Add Comments">
                        <img
                          src={QualityIcon}
                          className="leadmanager_qualityicon"
                          onClick={() => {
                            setIsQualityCommentSection(true);
                            setIsOpenPaymentDrawer(true);
                            setClickedLeadItem(record);
                            if (record.quality_history.length >= 1) {
                              const item =
                                record.quality_history[
                                  record.quality_history.length - 1
                                ];
                              if (item.comments) {
                                setIsQualityCommentUpdate(true);
                              } else {
                                setIsQualityCommentUpdate(false);
                              }
                              setQualityComments(item.comments);
                              setQualityStatus(item.status);
                              setCnaDate(item.cna_date);
                            } else {
                              setIsQualityCommentUpdate(false);
                            }
                          }}
                        />
                      </Tooltip>
                    )} */}

                    {permissions.includes("Edit Lead Button") &&
                    isShowEdit &&
                    record.is_customer_reg === 0 ? (
                      <AiOutlineEdit
                        size={20}
                        className="trainers_action_icons"
                        // onClick={() => handleEdit(record)}
                        onClick={() => {
                          setUpdateLeadItem(record);
                          setLeadId(record.id);
                          setIsOpenAddDrawer(true);
                        }}
                      />
                    ) : (
                      ""
                    )}

                    {record.is_customer_reg === 1 ? (
                      <Tooltip placement="bottom" title="Already a Customer">
                        <FaRegAddressCard
                          size={19}
                          color="#2ed573"
                          className="trainers_action_icons"
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip placement="bottom" title="Make as customer">
                        <FaRegAddressCard
                          size={19}
                          color="#d32f2f"
                          className="trainers_action_icons"
                          onClick={() => {
                            if (permissions.includes("Edit Lead Button")) {
                              setIsOpenPaymentDrawer(true);
                              setSubTotal(parseFloat(record.primary_fees));
                              setAmount(parseFloat(record.primary_fees));
                              setBalanceAmount(parseFloat(record.primary_fees));
                              setCustomerCourseId(record.primary_course_id);
                              setCustomerBatchTrackId(record.batch_track_id);
                              setClickedLeadItem(record);
                              setTimeout(() => {
                                const drawerBody = document.querySelector(
                                  "#leadmanager_paymentdetails_drawer .ant-drawer-body"
                                );
                                if (drawerBody) {
                                  drawerBody.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }
                              }, 300);
                            } else {
                              CommonMessage("error", "Access Denied");
                            }
                          }}
                        />
                      </Tooltip>
                    )}
                  </div>
                ),
              };
            case "next_follow_up_date":
            case "expected_join_date":
              return {
                ...col,
                render: (text) => (
                  <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>
                ),
              };
            default:
              return col;
          }
        });

      // --- ✅ Process columns ---
      setUpdateTableId(filterPage.id);

      const allColumns = attachRenderFunctions(filterPage.column_names);
      const visibleColumns = attachRenderFunctions(
        filterPage.column_names.filter((col) => col.isChecked)
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
      page_name: "Leads",
      column_names: columns,
    };
    console.log("updateTableColumnsData", payload);
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  const getAllDownlineUsersData = async (user_id) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getAllLeadData(
        filterValuesFromRedux.searchValue,
        filterValuesFromRedux.start_date
          ? filterValuesFromRedux.start_date
          : PreviousAndCurrentDate[0],
        filterValuesFromRedux.end_date
          ? filterValuesFromRedux.end_date
          : PreviousAndCurrentDate[1],
        downliners_ids,
        filterValuesFromRedux.lead_source,
        filterValuesFromRedux.pageNumber,
        filterValuesFromRedux.pageLimit
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getAllLeadData = async (
    searchvalue,
    startDate,
    endDate,
    downliners,
    leadsource,
    pageNumber,
    limit
  ) => {
    setLoading(true);
    const payload = {
      ...(searchvalue && filterType == 1
        ? { phone: searchvalue }
        : searchvalue && filterType == 2
        ? { name: searchvalue }
        : searchvalue && filterType == 3
        ? { email: searchvalue }
        : searchvalue && filterType == 4
        ? { course: searchvalue }
        : {}),
      start_date: startDate,
      end_date: endDate,
      user_ids: downliners,
      ...(leadsource && { lead_type: leadsource }),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getLeads(payload);
      console.log("lead response", response);
      const pagination = response?.data?.data?.pagination;

      setLeadData(response?.data?.data?.data || []);
      setLeadCount(pagination.total || 0);

      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
      setLeadCountLoading(false);
    } catch (error) {
      setLeadData([]);
      setLeadCount(0);
      console.log("get leads error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  //onchange functions
  const handlePaidNow = (e) => {
    const input = e.target.value;

    // Allow numbers, decimal point, or empty string
    if (!/^\d*\.?\d*$/.test(input)) return;

    setPaidNow(input); // store as string for user input

    const value = parseFloat(input); // parse for calculations
    const amt = parseFloat(amount);

    if (value < amt || isNaN(value) || input == "" || input == null) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }

    setBalanceAmount(
      getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(value) ? 0 : value)
    );

    if (paymentMode == 2 || paymentMode == 5 || paymentMode == 10) {
      const conve_fees = getConvenienceFees(isNaN(value) ? 0 : value);
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }

    if (paymentValidationTrigger) {
      setPaidNowError(
        priceValidator(isNaN(value) ? 0 : value, parseFloat(amt))
      );
    }
  };

  const handleTaxType = (e) => {
    setTaxType(e.target.value);
    if (paymentValidationTrigger) {
      setTaxTypeError(selectValidator(e.target.value));
    }
    const amnt = calculateAmount(
      parseFloat(subTotal),
      e.target.value == 5 ? 0 : 18
    );
    if (isNaN(amnt)) {
      setAmount("");
    } else {
      setAmount(parseFloat(amnt));
    }

    //handle balance amount
    if (paidNow < amnt || isNaN(paidNow) || paidNow == "" || paidNow == null) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }
    setBalanceAmount(
      getBalanceAmount(isNaN(amnt) ? 0 : amnt, isNaN(paidNow) ? 0 : paidNow)
    );
  };

  const handlePaymentMode = (value) => {
    setPaymentMode(value);
    console.log("taxType", taxType);
    const amnt = calculateAmount(
      parseFloat(subTotal),
      taxType == 5 || taxType == "" || taxType == null ? 0 : 18
    );
    setAmount(amnt);

    if (paymentValidationTrigger) {
      setPaymentModeError(selectValidator(value));
    }

    //handle balance amount
    if (
      paidNow < amnt ||
      isNaN(paidNow) ||
      paidNow === "" ||
      paidNow === null
    ) {
      setIsShowDueDate(true);
    } else {
      setIsShowDueDate(false);
      setDueDate(null);
      setDueDateError("");
    }
    setBalanceAmount(
      getBalanceAmount(isNaN(amnt) ? 0 : amnt, isNaN(paidNow) ? 0 : paidNow)
    );

    //handle convenience fees
    if (value == 2 || value == 5 || value == 10) {
      const conve_fees = getConvenienceFees(paidNow ? paidNow : 0);
      setConvenienceFees(conve_fees);
    } else {
      setConvenienceFees(0);
    }
  };

  //onclick functions
  const handlePaymentSubmit = async () => {
    setPaymentValidationTrigger(true);
    const taxTypeValidate = selectValidator(taxType);
    const paymentTypeValidate = selectValidator(paymentMode);
    const paymentDateValidate = selectValidator(paymentDate);
    const placeOfPaymentValidate = selectValidator(placeOfPayment);
    const batchTimingValidate = selectValidator(customerBatchTimingId);
    const currentLocationValidate = addressValidator(currentLocation);
    const stateCodeValidate = selectValidator(stateCode);
    const customerAddressValidate = addressValidator(customerAddress);
    const placementSupportValidate = selectValidator(placementSupport);

    console.log("eeeee", paidNow, amount);
    const paidNowValidate = priceValidator(parseInt(paidNow), parseInt(amount));

    const screenshotValidate = selectValidator(paymentScreenShotBase64);
    let dueDateValidate;

    if (isShowDueDate) {
      dueDateValidate = selectValidator(dueDate);
    } else {
      dueDateValidate = "";
    }

    setTaxTypeError(taxTypeValidate);
    setPaymentModeError(paymentTypeValidate);
    setPaidNowError(paidNowValidate);
    setPaymentDateError(paymentDateValidate);
    setPlaceOfPaymentError(placeOfPaymentValidate);
    setPaymentScreenShotError(screenshotValidate);
    setDueDateError(dueDateValidate);
    setCustomerBatchTimingIdError(batchTimingValidate);
    setCurrentLocationError(currentLocationValidate);
    setStateCodeError(stateCodeValidate);
    setCustomerAddressError(customerAddressValidate);
    setPlacementSupportError(placementSupportValidate);

    if (
      paymentTypeValidate ||
      paidNowValidate ||
      paymentDateValidate ||
      placeOfPaymentValidate ||
      screenshotValidate
    ) {
      setTimeout(() => {
        const container = document.getElementById(
          "leadmanager_paymentdetails_paymentinfo_heading"
        );
        container.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }

    if (taxTypeValidate) {
      setTimeout(() => {
        const container = document.getElementById(
          "leadmanager_paymentdetails_heading"
        );
        container.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }

    if (
      paymentTypeValidate ||
      paidNowValidate ||
      taxTypeValidate ||
      paymentDateValidate ||
      placeOfPaymentValidate ||
      screenshotValidate ||
      dueDateValidate ||
      batchTimingValidate ||
      currentLocationValidate ||
      stateCodeValidate ||
      customerAddressValidate ||
      placementSupportValidate
    )
      return;

    setButtonLoading(true);

    const today = new Date();

    // Step 2: Calculate GST on discounted amount
    const gstAmount = amount - subTotal;

    console.log("GST Amount:", gstAmount);

    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      lead_id: clickedLeadItem.id,
      invoice_date: formatToBackendIST(paymentDate),
      tax_type:
        taxType == 1
          ? "GST (18%)"
          : taxType == 2
          ? "SGST (18%)"
          : taxType == 3
          ? "IGST (18%)"
          : taxType == 4
          ? "VAT (18%)"
          : "No Tax",
      gst_percentage: taxType == 5 ? "0%" : "18%",
      gst_amount: parseFloat(gstAmount).toFixed(2),
      total_amount: amount,
      convenience_fees: convenienceFees,
      paymode_id: paymentMode,
      paid_amount: paidNow,
      payment_screenshot: paymentScreenShotBase64,
      payment_status: "Verify Pending",
      next_due_date: dueDate ? formatToBackendIST(dueDate) : null,
      created_date: formatToBackendIST(today),
      paid_date: formatToBackendIST(paymentDate),
      place_of_payment: placeOfPayment,
      enrolled_course: customerCourseId,
      batch_track_id: customerBatchTrackId,
      batch_timing_id: customerBatchTimingId,
      place_of_supply: currentLocation,
      address: customerAddress,
      state_code: stateCode,
      gst_number: gstNumber,
      placement_support: placementSupport,
      is_server_required: serverRequired,
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
    };

    console.log("payment payload", payload);

    try {
      const response = await leadPayment(payload);
      console.log("lead payment response", response);
      const createdCustomerDetails = response?.data?.data;
      CommonMessage("success", "Created as a Customer");
      setTimeout(() => {
        setButtonLoading(false);
        setInvoiceButtonLoading(false);
        formReset();
        getAllLeadData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          allDownliners,
          leadSourceFilterId,
          pagination.page,
          pagination.limit
        );
        refreshLeadFollowUp();
        if (import.meta.env.PROD) {
          handleSendCustomerFormLink(createdCustomerDetails);
        }
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      setInvoiceButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleSendCustomerFormLink = async (customerDetails) => {
    const payload = {
      email: customerDetails.email,
      link: `${import.meta.env.VITE_EMAIL_URL}/customer-registration/${
        customerDetails.insertId
      }`,
      customer_id: customerDetails.insertId,
    };

    try {
      await sendCustomerFormEmail(payload);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    } finally {
      setTimeout(() => {
        handleSendWelcomeEmail(customerDetails);
      }, 300);
    }
  };

  const handleSendWelcomeEmail = async (customerDetails) => {
    const payload = {
      email: customerDetails.email,
      name: customerDetails.name,
    };

    try {
      await sendCustomerWelcomeEmail(payload);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    } finally {
      setTimeout(() => {
        handleSendPaymentVerificationEmail(customerDetails);
      }, 300);
    }
  };

  const handleSendPaymentVerificationEmail = async (customerDetails) => {
    const payload = {
      email: customerDetails.email,
      name: customerDetails.name,
    };

    try {
      await sendCustomerPaymentVerificationEmail(payload);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const qualityFormReset = () => {
    setIsOpenPaymentDrawer(false);
    setIsQualityCommentSection(false);
    setQualityComments("");
    setQualityCommentsError("");
    setQualityStatus(null);
    setQualityStatusError("");
    setCnaDate(null);
    setCnaDateError("");
    setIsQualityCommentUpdate(false);
  };

  const formReset = () => {
    setIsQualityCommentSection(false);
    setIsOpenFilterDrawer(false);
    setIsOpenAssignModal(false);
    setAssignId(null);
    setAssignIdError("");
    //add lead drawer usestaes
    setLeadId(null);
    //payment drawer usestates
    setIsOpenPaymentDrawer(false);
    setPaymentValidationTrigger(false);
    setClickedLeadItem(null);
    setPaymentMode(null);
    setPaymentModeError("");
    setSubTotal();
    setConvenienceFees("");
    setTaxType(null);
    setTaxTypeError("");
    setAmount();
    setPaidNow("");
    setPaidNowError("");
    setPaymentDate(null);
    setPaymentDateError("");
    setPlaceOfPayment(null);
    setPlaceOfPaymentError("");
    setPaymentScreenShotBase64("");
    setPaymentScreenShotError("");
    setIsShowDueDate(true);
    setBalanceAmount();
    setDueDate(null);
    setDueDateError("");
    setCustomerCourseId(null);
    setCustomerBatchTrackId(null);
    setCustomerBatchTimingId(null);
    setCustomerBatchTimingIdError("");
    setCurrentLocation("");
    setCurrentLocationError("");
    setStateCode("");
    setStateCodeError("");
    setCustomerAddress("");
    setCustomerAddressError("");
    setGstNumber("");
    setPlacementSupport("");
    setPlacementSupportError("");
    setServerRequired(false);
    //quality
    qualityFormReset();
  };

  const getCountryName = (countryCode) => {
    let countryName = "";
    const countries = Country.getAllCountries();

    const findCountry = countries.find((f) => f.isoCode == countryCode);

    if (findCountry) {
      countryName = findCountry.name;
    } else {
      countryName = "";
    }
    return countryName;
  };

  const getStateName = (countryCode, stateCode) => {
    const stateList = State.getStatesOfCountry(countryCode);
    const updateSates = stateList.map((s) => {
      return { ...s, id: s.isoCode };
    });

    let stateName = "";

    const findState = updateSates.find((f) => f.id == stateCode);
    if (findState) {
      stateName = findState.name;
    } else {
      stateName = "";
    }
    return stateName;
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    dispatch(
      storeLeadFilterValues({
        searchValue: e.target.value,
        pageNumber: 1,
        pageLimit: pagination.limit,
      })
    );
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getAllLeadData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        allDownliners,
        leadSourceFilterId,
        1,
        pagination.limit
      );
    }, 300);
  };

  const handleSelectedRow = (row) => {
    console.log("selected rowwww", row);
    setSelectedRows(row);
    const keys = row.map((item) => item.id); // or your unique row key
    setSelectedRowKeys(keys);
    if (row.length >= 1) {
      setIsShowEdit(false);
    } else {
      setIsShowEdit(true);
    }
  };

  const handleAssignLead = async () => {
    console.log(selectedRows);
    const assignIdValidate = selectValidator(assignId);

    setAssignIdError(assignIdValidate);

    if (assignIdValidate) return;

    if (selectedRows.length >= 1) {
      //multi assign
      const updateLeadItems = selectedRows.map((item) => {
        return { assigned_to: assignId, id: item?.id };
      });
      setAddCourseLoading(true);
      const payload = {
        leads: updateLeadItems,
      };
      try {
        await assignLead(payload);
        setTimeout(() => {
          getAllLeadData(
            searchValue,
            selectedDates[0],
            selectedDates[1],
            allDownliners,
            leadSourceFilterId,
            pagination.page,
            pagination.limit
          );
          formReset();
          setAddCourseLoading(false);
          setIsShowEdit(true);
          setSelectedRowKeys([]);
          setSelectedRows([]);
        }, 300);
      } catch (error) {
        setAddCourseLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    dispatch(
      storeLeadFilterValues({
        pageNumber: page,
        pageLimit: limit,
      })
    );
    getAllLeadData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      allDownliners,
      leadSourceFilterId,
      page,
      limit
    );
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    dispatch(
      storeLeadFilterValues({
        user_id: value,
      })
    );
    setSelectedUserId(value);

    try {
      const response = await getAllDownlineUsers(value ? value : loginUserId);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setPagination({
        page: 1,
      });
      dispatch(
        storeLeadFilterValues({
          pageNumber: 1,
          pageLimit: pagination.limit,
        })
      );
      getAllLeadData(
        searchValue,
        selectedDates[0],
        selectedDates[1],
        downliners_ids,
        leadSourceFilterId,
        1,
        pagination.limit
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const handleLeadCountByExecutive = async () => {
    setLeadExeCountLoading(true);
    const payload = {
      start_date: selectedDates[0],
      end_date: selectedDates[1],
      user_ids: allDownliners,
    };
    try {
      const response = await getLeadsCountByUserIds(payload);
      console.log("leads count response", response);
      setLeadCountByExecutives(response?.data?.data || []);
      setTimeout(() => {
        setLeadExeCountLoading(false);
      }, 200);
    } catch (error) {
      setLeadExeCountLoading(false);
      setLeadCountByExecutives([]);
      console.log("error", error);
    }
  };

  const handleDownload = async () => {
    const isWithIn30days = isWithin30Days(selectedDates[0], selectedDates[1]);
    console.log("isWithIn30days", isWithIn30days);
    if (isWithIn30days == false) {
      CommonMessage("error", "Please choose a date range within 30 days.");
      return;
    }
    setDownloadButtonLoader(true);
    const payload = {
      user_ids: allDownliners,
      start_date: selectedDates[0],
      end_date: selectedDates[1],
      ...(searchValue && filterType == 1
        ? { phone: searchValue }
        : searchValue && filterType == 2
        ? { name: searchValue }
        : searchValue && filterType == 3
        ? { email: searchValue }
        : searchValue && filterType == 4
        ? { course: searchValue }
        : {}),
    };
    try {
      const response = await downloadLeads(payload);
      console.log("leads download response", response);
      const data = response?.data?.data || [];
      const alterColumns = columns.filter((f) => f.title != "Action");
      DownloadTableAsCSV(
        data,
        alterColumns,
        `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
          selectedDates[1]
        ).format("DD-MM-YYYY")} Leads.csv`
      );
      setTimeout(() => {
        setDownloadButtonLoader(false);
      }, 300);
    } catch (error) {
      setDownloadButtonLoader(false);
      console.log("lead download error", error);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={20}>
          <Row gutter={10}>
            <Col flex="22%">
              <div className="overallduecustomers_filterContainer">
                <CommonOutlinedInput
                  label={
                    filterType == 1
                      ? "Search By Mobile"
                      : filterType == 2
                      ? "Search By Name"
                      : filterType == 3
                      ? "Search by Email"
                      : filterType == 4
                      ? "Search by Course"
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
                          dispatch(
                            storeLeadFilterValues({
                              searchValue: null,
                              pageNumber: 1,
                              pageLimit: pagination.limit,
                            })
                          );
                          getAllLeadData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
                            allDownliners,
                            leadSourceFilterId,
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
                  value={searchValue}
                  onChange={handleSearch}
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
                            setFilterType(e.target.value);
                            dispatch(
                              storeLeadFilterValues({
                                filterType: e.target.value,
                              })
                            );
                            if (searchValue == "") {
                              return;
                            } else {
                              setSearchValue("");
                              dispatch(
                                storeLeadFilterValues({
                                  searchValue: "",
                                  pageNumber: 1,
                                  pageLimit: pagination.limit,
                                })
                              );
                              setPagination({
                                page: 1,
                              });
                              getAllLeadData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
                                allDownliners,
                                leadSourceFilterId,
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
                            Search by Mobile
                          </Radio>
                          <Radio value={2} style={{ marginBottom: "12px" }}>
                            Search by Name
                          </Radio>
                          <Radio value={3} style={{ marginBottom: "12px" }}>
                            Search by Email
                          </Radio>
                          <Radio value={4} style={{ marginBottom: "6px" }}>
                            Search by Course
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
            {permissions.includes("Lead Executive Filter") && (
              <Col flex="22%">
                <div className="overallduecustomers_filterContainer">
                  <div style={{ flex: 1 }}>
                    <CommonSelectField
                      width="100%"
                      height="35px"
                      label="Select User"
                      labelMarginTop="0px"
                      labelFontSize="12px"
                      options={subUsers}
                      onChange={handleSelectUser}
                      value={selectedUserId}
                      disableClearable={false}
                      borderRightNone={true}
                    />
                  </div>
                  <div
                    onClick={() => {
                      if (executiveCountTooltip) {
                        return;
                      }
                      handleLeadCountByExecutive();
                    }}
                  >
                    <Flex
                      justify="center"
                      align="center"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <Tooltip
                        placement="bottomLeft"
                        color="#fff"
                        title={
                          <>
                            {leadExeCountLoading ? (
                              <div className="leadsmanager_executivecount_loader_container">
                                <Spin size="small" />
                              </div>
                            ) : (
                              <div
                                style={{
                                  maxHeight: "140px",
                                  overflowY: "auto",
                                  whiteSpace: "pre-line",
                                  lineHeight: "24px",
                                }}
                              >
                                {leadCountByExecutives.map((item, index) => {
                                  return (
                                    <p className="leadsmanager_executivecount_text">
                                      {`${index + 1}. ${item.user_name} - ${
                                        item.lead_count
                                      }`}
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        }
                        trigger={["click"]}
                        onOpenChange={(value) => {
                          setExecutiveCountTooltip(value);
                          if (value === false) {
                            setLeadCountByExecutives([]);
                          }
                        }}
                      >
                        <Button className="leadsmanager_executivecount_iconcontainer">
                          <MdFormatListNumbered size={16} />
                        </Button>
                      </Tooltip>
                    </Flex>
                  </div>
                </div>
              </Col>
            )}
            <Col flex="20%">
              <CommonSelectField
                width="100%"
                height="35px"
                label="Select Lead Source"
                labelMarginTop="0px"
                labelFontSize="12px"
                options={leadTypeOptions}
                onChange={(e) => {
                  setLeadSourceFilterId(e.target.value);
                  dispatch(
                    storeLeadFilterValues({
                      lead_source: e.target.value,
                      pageNumber: 1,
                      pageLimit: pagination.limit,
                    })
                  );
                  getAllLeadData(
                    null,
                    selectedDates[0],
                    selectedDates[1],
                    allDownliners,
                    e.target.value,
                    1,
                    pagination.limit
                  );
                }}
                value={leadSourceFilterId}
                disableClearable={false}
              />{" "}
            </Col>
            <Col flex="30%">
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  dispatch(
                    storeLeadFilterValues({
                      start_date: dates[0],
                      end_date: dates[1],
                      pageNumber: 1,
                      pageLimit: pagination.limit,
                    })
                  );
                  setPagination({
                    page: 1,
                  });
                  getAllLeadData(
                    searchValue,
                    dates[0],
                    dates[1],
                    allDownliners,
                    leadSourceFilterId,
                    1,
                    pagination.limit
                  );
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={4}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {permissions.includes("Add Lead Button") && isShowEdit === true ? (
              <button
                className="leadmanager_addleadbutton"
                onClick={() => {
                  setIsOpenAddDrawer(true);
                  setTimeout(() => {
                    const drawerBody = document.querySelector(
                      "#leadform_addlead_drawer .ant-drawer-body"
                    );
                    if (drawerBody) {
                      drawerBody.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }
                  }, 300);
                }}
              >
                Add Lead
              </button>
            ) : (
              ""
            )}

            {permissions.includes("Download Leads") && (
              <Tooltip placement="top" title="Download">
                <Button
                  className={
                    downloadButtonLoader
                      ? "customer_loading_download_button"
                      : "customer_download_button"
                  }
                  onClick={handleDownload}
                  disabled={downloadButtonLoader}
                >
                  {downloadButtonLoader ? (
                    <Spin
                      indicator={<LoadingOutlined spin />}
                      style={{ color: "#333" }}
                      size="small"
                    />
                  ) : (
                    <DownloadOutlined className="download_icon" />
                  )}
                </Button>
              </Tooltip>
            )}

            {permissions.includes("Assign Lead") && isShowEdit === false && (
              <button
                className="leadmanager_addleadbutton"
                onClick={() => {
                  setIsOpenAssignModal(true);
                }}
              >
                Assign Lead
              </button>
            )}

            <FiFilter
              size={20}
              color="#5b69ca"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setIsOpenFilterDrawer(true);
                getTableColumnsData(loginUserId);
              }}
            />
          </div>
        </Col>
      </Row>
      <div style={{ marginTop: "20px" }}>
        <CommonTable
          // scroll={{ x: 3350 }}
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0
            ),
          }}
          columns={tableColumns}
          dataSource={leadData}
          dataPerPage={10}
          loading={loading}
          checkBox={permissions.includes("Assign Lead") ? "true" : "false"}
          size="small"
          className="questionupload_table"
          selectedDatas={handleSelectedRow}
          selectedRowKeys={selectedRowKeys}
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>
      <Drawer
        title="Add Lead"
        open={isOpenAddDrawer}
        onClose={() => {
          setIsOpenAddDrawer(false);
          setUpdateLeadItem(null);
          setLeadId(null);
        }}
        width="52%"
        style={{ position: "relative" }}
        id="leadform_addlead_drawer"
      >
        <AddLead
          ref={addLeaduseRef}
          key={updateLeadItem}
          leadTypeOptions={leadTypeOptions}
          regionOptions={regionOptions}
          leadId={leadId}
          updateLeadItem={updateLeadItem}
          setButtonLoading={setButtonLoading}
          setSaveOnlyLoading={setSaveOnlyLoading}
          setIsOpenAddDrawer={setIsOpenAddDrawer}
          callgetLeadsApi={() => {
            setUpdateLeadItem(null);
            getAllLeadData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              allDownliners,
              leadSourceFilterId,
              pagination.page,
              pagination.limit
            );
            refreshLeadFollowUp();
          }}
        />

        <div className="leadmanager_submitlead_buttoncontainer">
          <div style={{ display: "flex", gap: "12px" }}>
            {leadId ? (
              ""
            ) : (
              <>
                {saveOnlyLoading ? (
                  <button className={"leadmanager_loadingupdateleadbutton"}>
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className={"leadmanager_updateleadbutton"}
                    onClick={() =>
                      addLeaduseRef.current.handleSubmit("Save Only")
                    }
                  >
                    Save
                  </button>
                )}
              </>
            )}

            {buttonLoading ? (
              <button
                className={
                  leadId
                    ? "leadmanager_loadingupdateleadbutton"
                    : "leadmanager_loadingsaveleadbutton"
                }
              >
                <CommonSpinner />
              </button>
            ) : (
              <button
                className={
                  leadId
                    ? "leadmanager_updateleadbutton"
                    : "leadmanager_saveleadbutton"
                }
                onClick={() =>
                  addLeaduseRef.current.handleSubmit("Save And Add New")
                }
              >
                {leadId ? "Update" : "Save And Add New"}
              </button>
            )}
          </div>
        </div>
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
                  page_name: "Leads",
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

      <Drawer
        title={isQualityCommentSection ? "Add Comment" : "Make as Customer"}
        open={isOpenPaymentDrawer}
        onClose={formReset}
        width="54%"
        style={{ position: "relative", padding: "0px", paddingBottom: 50 }}
        className="leadmanager_paymentdetails_drawer"
        id="leadmanager_paymentdetails_drawer"
      >
        <p className="leadfollowup_leaddetails_heading">Lead Details</p>
        <Row gutter={16} style={{ padding: "0px 0px 0px 24px" }}>
          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaRegCircleUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Name</p>
                </div>
              </Col>
              <Col span={12}>
                <EllipsisTooltip
                  text={
                    clickedLeadItem && clickedLeadItem.name
                      ? clickedLeadItem.name
                      : "-"
                  }
                  smallText={true}
                />
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <MdOutlineEmail size={15} color="gray" />
                  <p className="customerdetails_rowheading">Email</p>
                </div>
              </Col>
              <Col span={12}>
                <EllipsisTooltip
                  text={
                    clickedLeadItem && clickedLeadItem.email
                      ? clickedLeadItem.email
                      : "-"
                  }
                  smallText={true}
                />
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <IoCallOutline size={15} color="gray" />
                  <p className="customerdetails_rowheading">Mobile</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.phone
                    ? clickedLeadItem.phone
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaWhatsapp size={15} color="gray" />
                  <p className="customerdetails_rowheading">Whatsapp</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.whatsapp
                    ? clickedLeadItem.whatsapp
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <SlGlobe size={15} color="gray" />
                  <p className="customerdetails_rowheading">Country</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.country
                    ? getCountryName(clickedLeadItem.country)
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <IoLocationOutline size={15} color="gray" />
                  <p className="customerdetails_rowheading">Area</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.area_id
                    ? clickedLeadItem.area_id
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Course</p>
                </div>
              </Col>
              <Col span={12}>
                <EllipsisTooltip
                  text={
                    clickedLeadItem && clickedLeadItem.primary_course
                      ? clickedLeadItem.primary_course
                      : "-"
                  }
                  smallText={true}
                />
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Course Fees</p>
                </div>
              </Col>
              <Col span={12}>
                <p
                  className="customerdetails_text"
                  style={{ color: "#333", fontWeight: 700 }}
                >
                  {clickedLeadItem && clickedLeadItem.primary_fees
                    ? "₹" + clickedLeadItem.primary_fees
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Branch</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.branch_name
                    ? clickedLeadItem.branch_name
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Batch Track</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.batch_track
                    ? clickedLeadItem.batch_track
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Lead Status</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.lead_status
                    ? clickedLeadItem.lead_status
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Lead Executive</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {`${
                    clickedLeadItem && clickedLeadItem.lead_assigned_to_id
                      ? clickedLeadItem.lead_assigned_to_id
                      : "-"
                  } (${
                    clickedLeadItem && clickedLeadItem.lead_assigned_to_name
                      ? clickedLeadItem.lead_assigned_to_name
                      : "-"
                  })`}
                </p>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider className="leadmanger_paymentdrawer_divider" />

        {isQualityCommentSection ? (
          <>
            <Row
              gutter={16}
              className="leadmanager_paymentdetails_drawer_rowdiv"
              style={{ marginTop: "20px", marginBottom: "30px" }}
            >
              <Col span={24}>
                <CommonTextArea
                  label="Comments"
                  required={true}
                  onChange={(e) => {
                    setQualityComments(e.target.value);
                    setQualityCommentsError(addressValidator(e.target.value));
                  }}
                  value={qualityComments}
                  error={qualityCommentsError}
                />
              </Col>
            </Row>

            <Row
              gutter={16}
              className="leadmanager_paymentdetails_drawer_rowdiv"
              style={{ marginTop: "20px", marginBottom: "30px" }}
            >
              <Col span={8}>
                <CommonSelectField
                  label="Status"
                  required={true}
                  options={[
                    { id: 1, name: "Details Shared" },
                    { id: 2, name: "Details Not Shared" },
                    { id: 3, name: "CNA" },
                  ]}
                  onChange={(e) => {
                    setQualityStatus(e.target.value);
                    setCnaDate(null);
                    setCnaDateError("");
                    setQualityStatusError(selectValidator(e.target.value));
                  }}
                  value={qualityStatus}
                  error={qualityStatusError}
                />
              </Col>

              {qualityStatus == 3 ? (
                <Col span={8}>
                  <CommonMuiDatePicker
                    label="Date"
                    required={true}
                    onChange={(value) => {
                      setCnaDate(value);
                      setCnaDateError(selectValidator(value));
                    }}
                    value={cnaDate}
                    error={cnaDateError}
                    disablePreviousDates={true}
                  />
                </Col>
              ) : (
                ""
              )}
            </Row>
          </>
        ) : (
          <>
            <p
              className="leadmanager_paymentdetails_drawer_heading"
              id="leadmanager_paymentdetails_heading"
            >
              Payment Details
            </p>
            <Row
              gutter={16}
              className="leadmanager_paymentdetails_drawer_rowdiv"
              style={{ marginTop: "20px", marginBottom: "30px" }}
            >
              <Col span={8}>
                <CommonInputField
                  label="Fees"
                  required={true}
                  type="number"
                  value={subTotal}
                  disabled={true}
                />
              </Col>
              <Col span={8}>
                <CommonSelectField
                  label="Tax Type"
                  required={true}
                  options={[
                    { id: 1, name: "GST (18%)" },
                    { id: 2, name: "SGST (18%)" },
                    { id: 3, name: "IGST (18%)" },
                    { id: 4, name: "VAT (18%)" },
                    { id: 5, name: "No Tax" },
                  ]}
                  onChange={handleTaxType}
                  value={taxType}
                  error={taxTypeError}
                  height="41px"
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="Total Amount"
                  required={true}
                  disabled
                  value={amount}
                />
              </Col>
            </Row>

            <Divider className="leadmanger_paymentdrawer_divider" />

            <p
              className="leadmanager_paymentdetails_drawer_heading"
              id="leadmanager_paymentdetails_paymentinfo_heading"
            >
              Payment Info
            </p>

            <Row
              gutter={16}
              className="leadmanager_paymentdetails_drawer_rowdiv"
              style={{ marginTop: "20px" }}
            >
              <Col span={8}>
                <CommonInputField
                  label="Pay Amount"
                  required={true}
                  onChange={handlePaidNow}
                  value={paidNow}
                  error={paidNowError}
                  errorFontSize="10px"
                />
              </Col>
              <Col span={8}>
                <CommonGroupedSelectField
                  label="Payment Mode"
                  onChange={handlePaymentMode}
                  value={paymentMode}
                  error={paymentModeError}
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="Convenience fees"
                  required={true}
                  value={convenienceFees}
                  disabled={true}
                  type="number"
                />
              </Col>
            </Row>

            <Row
              gutter={16}
              className="leadmanager_paymentdetails_drawer_rowdiv"
              style={{ marginTop: "40px" }}
            >
              <Col span={8}>
                <CommonMuiDatePicker
                  label="Payment Date"
                  required={true}
                  onChange={(value) => {
                    setPaymentDate(value);
                    if (paymentValidationTrigger) {
                      setPaymentDateError(selectValidator(value));
                    }
                  }}
                  value={paymentDate}
                  error={paymentDateError}
                />
              </Col>
              <Col span={8}>
                <CommonSelectField
                  label="Place of Payment"
                  required={true}
                  options={[
                    { id: "Tamil Nadu", name: "Tamil Nadu" },
                    { id: "Out of TN", name: "Out of TN" },
                    { id: "Out of IND", name: "Out of IND" },
                  ]}
                  onChange={(e) => {
                    setPlaceOfPayment(e.target.value);
                    if (paymentValidationTrigger) {
                      setPlaceOfPaymentError(selectValidator(e.target.value));
                    }
                  }}
                  value={placeOfPayment}
                  error={placeOfPaymentError}
                />
              </Col>
              <Col span={8}>
                <ImageUploadCrop
                  label="Payment Screenshot"
                  aspect={1}
                  maxSizeMB={1}
                  required={true}
                  value={paymentScreenShotBase64}
                  onChange={(base64) => setPaymentScreenShotBase64(base64)}
                  onErrorChange={setPaymentScreenShotError} // ✅ pass setter directly
                />
                {paymentScreenShotError && (
                  <p
                    style={{ fontSize: "12px", color: "#d32f2f", marginTop: 4 }}
                  >
                    {`Payment Screenshot ${paymentScreenShotError}`}
                  </p>
                )}
              </Col>
            </Row>

            <Divider className="leadmanger_paymentdrawer_divider" />

            <p className="leadmanager_paymentdetails_drawer_heading">
              Balance Amount Details
            </p>

            <Row
              gutter={16}
              style={{ marginTop: "20px", marginBottom: "30px" }}
              className="leadmanager_paymentdetails_drawer_rowdiv"
            >
              <Col span={8}>
                <CommonInputField
                  label="Balance Amount"
                  required={true}
                  value={balanceAmount}
                  disabled={true}
                  type="number"
                />
              </Col>
              {isShowDueDate ? (
                <Col span={8}>
                  <CommonMuiDatePicker
                    label="Next Due Date"
                    required={true}
                    onChange={(value) => {
                      setDueDate(value);
                      setDueDateError(selectValidator(value));
                    }}
                    value={dueDate}
                    error={dueDateError}
                    disablePreviousDates={true}
                  />
                </Col>
              ) : (
                ""
              )}
            </Row>

            <Divider className="leadmanger_paymentdrawer_divider" />

            <p className="leadmanager_paymentdetails_drawer_heading">
              Add Customer Details
            </p>

            <Row
              gutter={16}
              style={{ marginTop: "20px", marginBottom: "30px" }}
              className="leadmanager_paymentdetails_drawer_rowdiv"
            >
              <Col span={8}>
                <CommonSelectField
                  label="Course"
                  required={true}
                  options={courseOptions}
                  value={customerCourseId}
                  disabled={true}
                />
              </Col>
              <Col span={8}>
                <CommonSelectField
                  label="Batch Track"
                  required={true}
                  options={batchTrackOptions}
                  value={customerBatchTrackId}
                  disabled={true}
                />
              </Col>
              <Col span={8}>
                <CommonSelectField
                  label="Batch Type"
                  required={true}
                  options={batchTimingOptions}
                  onChange={(e) => {
                    setCustomerBatchTimingId(e.target.value);
                    if (paymentValidationTrigger) {
                      setCustomerBatchTimingIdError(
                        selectValidator(e.target.value)
                      );
                    }
                  }}
                  value={customerBatchTimingId}
                  error={customerBatchTimingIdError}
                />
              </Col>
            </Row>

            <Row
              gutter={16}
              style={{ marginTop: "20px", marginBottom: "30px" }}
              className="leadmanager_paymentdetails_drawer_rowdiv"
            >
              <Col span={8}>
                <CommonInputField
                  label="Customer Current State"
                  required={true}
                  onChange={(e) => {
                    setCurrentLocation(e.target.value);
                    if (paymentValidationTrigger) {
                      setCurrentLocationError(addressValidator(e.target.value));
                    }
                  }}
                  value={currentLocation}
                  error={currentLocationError}
                  errorFontSize="9px"
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="State Code"
                  required={true}
                  onChange={(e) => {
                    const input = e.target.value;

                    // Allow numbers, decimal point, or empty string
                    if (!/^\d*\.?\d*$/.test(input)) return;

                    setStateCode(input); // store as string for user input
                    if (paymentValidationTrigger) {
                      setStateCodeError(selectValidator(input));
                    }
                  }}
                  value={stateCode}
                  error={stateCodeError}
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="Address"
                  required={true}
                  multiline={true}
                  // rows={1}
                  onChange={(e) => {
                    const formatted = e.target.value;
                    setCustomerAddress(formatted);

                    if (paymentValidationTrigger) {
                      setCustomerAddressError(addressValidator(formatted));
                    }
                  }}
                  value={customerAddress}
                  error={customerAddressError}
                />
              </Col>
            </Row>

            <Row
              gutter={16}
              style={{ marginTop: "20px", marginBottom: "50px" }}
              className="leadmanager_paymentdetails_drawer_rowdiv"
            >
              <Col span={8}>
                <CommonInputField
                  label="GST No"
                  required={false}
                  onChange={(e) => {
                    setGstNumber(e.target.value);
                  }}
                  value={gstNumber}
                />{" "}
              </Col>
              <Col span={8}>
                <CommonSelectField
                  label="Placement Support"
                  required={true}
                  options={[
                    { id: "Need", name: "Need" },
                    { id: "Not Need", name: "Not Need" },
                  ]}
                  onChange={(e) => {
                    setPlacementSupport(e.target.value);
                    if (paymentValidationTrigger) {
                      setPlacementSupportError(selectValidator(e.target.value));
                    }
                  }}
                  value={placementSupport}
                  error={placementSupportError}
                />
              </Col>
              <Col span={8}>
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  <p className="leads_serverrequired_label">Server Required</p>
                  <Switch
                    style={{ color: "#333" }}
                    checked={serverRequired}
                    onChange={(checked) => {
                      setServerRequired(checked);
                    }}
                    className="leads_serverrequired_switch"
                  />
                </div>
              </Col>
            </Row>
          </>
        )}

        <div className="leadmanager_tablefiler_footer">
          <div
            className="leadmanager_submitlead_buttoncontainer"
            style={{ gap: "12px" }}
          >
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={handlePaymentSubmit}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {/* assign lead modal */}
      <Modal
        title="Assign Leads"
        open={isOpenAssignModal}
        onCancel={() => {
          setIsOpenAssignModal(false);
          setAssignId(null);
          setAssignIdError("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOpenAssignModal(false);
              setAssignId(null);
              setAssignIdError("");
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
              onClick={handleAssignLead}
              className="leads_coursemodal_createbutton"
            >
              Assign
            </Button>
          ),
        ]}
        width="35%"
      >
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <CommonSelectField
            label="Lead Executive"
            options={allUsersList}
            onChange={(e) => {
              setAssignId(e.target.value);
              setAssignIdError(selectValidator(e.target.value));
            }}
            value={assignId}
            error={assignIdError}
          />
        </div>
      </Modal>
    </div>
  );
}
