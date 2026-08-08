import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Tooltip,
  Flex,
  Radio,
  Button,
  Drawer,
  Checkbox,
  Skeleton,
  Upload,
  Divider,
  Modal,
} from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { FiFilter } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import { RedoOutlined } from "@ant-design/icons";
import { DownloadOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { LiaIdCardSolid } from "react-icons/lia";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegCircleUser } from "react-icons/fa6";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import {
  customersStatusDisplay,
  formatToBackendIST,
  getPreviousYearDec26ToCurrentYearDec25,
} from "../Common/Validation";
import {
  getAllDownlineUsers,
  getPendingFeesCustomers,
  getTableColumns,
  updateTableColumns,
  getPaymentRecievedList,
  getCustomerById,
  getBranches,
  getUsers,
} from "../ApiService/action";
import { useSelector } from "react-redux";
import CommonTable from "../Common/CommonTable";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";
import { FaRegCopy } from "react-icons/fa6";
import { CommonMessage } from "../Common/CommonMessage";
import CommonDnd from "../Common/CommonDnd";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { RiVerifiedBadgeLine } from "react-icons/ri";
import FinanceVerify from "../Customers/FinanceVerify";
import CommonSpinner from "../Common/CommonSpinner";
import DraggableStudentModal from "../Common/DraggableStudentModal";
import CommonSelectField from "../Common/CommonSelectField";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";

export default function Received({
  filterData,
  setReceivedCount,
  allTableColumns,
  refreshTableColumns,
}) {
  const mounted = useRef(false);
  const financeVerifyRef = useRef();
  const [paymentType, setPaymentType] = useState("NEW");
  const [statusCount, setStatusCount] = useState({});

  useEffect(() => {
    if (filterData && mounted.current && allDownliners.length > 0) {
      const startDate = new Date(filterData.startDate);
      const endDate = new Date(filterData.endDate);
      setSelectedDates([startDate, endDate]);
      getPaymentRecievedData(
        startDate,
        endDate,
        searchValue,
        allDownliners,
        selectedRegionId,
        selectedBranchId,
        1,
        pagination.limit,
        paymentType,
      );
    }
  }, [filterData, paymentType]);

  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [searchValue, setSearchValue] = useState("");
  const [receivedPaymentsData, setReceivedPaymentsData] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [totalAmountOfReceived, setTotalAmountOfReceived] = useState(null);
  //verify payment
  const [isStatusUpdateDrawer, setIsStatusUpdateDrawer] = useState(false);
  const [drawerContentStatus, setDrawerContentStatus] = useState("");
  const [isStatusUpdateDrawerLoading, setIsStatusUpdateDrawerLoading] =
    useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isOpenCustomerDetailsModal, setIsOpenCustomerDetailsModal] =
    useState(false);
  const [loginUserId, setLoginUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  //lead executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const prevSelectedUserIdRef = useRef("[]");
  const [allDownliners, setAllDownliners] = useState([]);
  const [defaultAllDownliners, setDefaultAllDownliners] = useState([]);
  //filter usestates
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const nonChangeColumns = [
    {
      title: "Entry Date",
      key: "entry_date",
      dataIndex: "entry_date",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Paid Date",
      key: "paid_date",
      dataIndex: "paid_date",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    ...(paymentType === "REPAYMENT"
      ? [
          {
            title: "Total Collection Days",
            key: "total_days_taken",
            dataIndex: "total_days_taken",
            width: 165,
            sorter: (a, b) =>
              moment(a.total_days_taken).valueOf() -
              moment(b.total_days_taken).valueOf(),
            sortDirections: ["ascend", "descend"],
          },
        ]
      : []),
    {
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    {
      title: "Place Of Sale",
      key: "branch_name",
      dataIndex: "branch_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    {
      title: "Place Of Service",
      key: "place_of_service",
      dataIndex: "place_of_service",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    ...(permissions.includes("Show Lead Executive Id")
      ? [
          {
            title: "Sale Executive",
            key: "collected_by",
            dataIndex: "collected_by",
            width: 130,
            render: (text, record) => {
              const user = `${record.collected_user_id} - ${text}`;
              return <EllipsisTooltip text={user} />;
            },
          },
        ]
      : []),
    // {
    //   title: "Collection Type",
    //   key: "collection_type",
    //   dataIndex: "collection_type",
    //   width: 120,
    //   render: (text) => {
    //     if (text) {
    //       const type = text.toLowerCase();
    //       if (type.includes("new")) {
    //         return <div className="transactionreport_new_type">{text}</div>;
    //       } else if (type.includes("lmj")) {
    //         return <div className="transactionreport_lmj_type">{text}</div>;
    //       } else if (type.includes("cmj")) {
    //         return <div className="transactionreport_cmj_type">{text}</div>;
    //       } else if (type.includes("pmj")) {
    //         return <div className="transactionreport_pmj_type">{text}</div>;
    //       } else {
    //         <p>{text}</p>;
    //       }
    //     } else {
    //       return <p>-</p>;
    //     }
    //   },
    // },
    // {
    //   title: "Student Id",
    //   key: "student_id",
    //   dataIndex: "student_id",
    //   width: 120,
    //   render: (text, record) => {
    //     const user_id = text ? text : record?.cus_name ? record?.cus_name : "-";
    //     return (
    //       <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    //         <EllipsisTooltip text={user_id} />
    //         {user_id && (
    //           <FaRegEye
    //             size={13}
    //             className="trainers_action_icons"
    //             style={{ cursor: "pointer" }}
    //             onClick={() => {
    //               getParticularCustomerDetails(record?.customer_id, true);
    //             }}
    //           />
    //         )}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Student Name",
      key: "cus_name",
      dataIndex: "cus_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Student Mobile",
      key: "cus_phone",
      dataIndex: "cus_phone",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Course",
      key: "course_name",
      dataIndex: "course_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Total Fees (With GST)",
      key: "total_course_fees",
      dataIndex: "total_course_fees",
      width: 155,
      render: (text) => {
        return <p>{text ? `₹${Number(text).toLocaleString("en-IN")}` : "-"}</p>;
      },
    },
    {
      title: "Paid Amount",
      key: "paid_amount",
      dataIndex: "paid_amount",
      width: 120,
      render: (text) => {
        return <p>{text ? `₹${Number(text).toLocaleString("en-IN")}` : "-"}</p>;
      },
    },
    {
      title: "Balance Amount",
      key: "balance_due",
      dataIndex: "balance_due",
      width: 130,
      render: (text) => {
        const amount = Number(text);

        return (
          <p
            style={{
              color: amount === 0 ? "green" : "#D32F2F",
              margin: 0,
              fontWeight: 700,
            }}
          >
            {text !== null && text !== undefined
              ? `₹${amount.toLocaleString("en-IN")}`
              : "-"}
          </p>
        );
      },
    },
    {
      title: "Transaction Mode",
      key: "transacted_to",
      dataIndex: "transacted_to",
      width: 135,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    {
      title: "Transaction To",
      key: "bank_name",
      dataIndex: "bank_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    {
      title: "Payment Status",
      key: "payment_status",
      dataIndex: "payment_status",
      width: 140,
      fixed: "right",
      render: (text, record) => {
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {text === "Verify Pending" ? (
              <div>
                <Tooltip
                  placement="top"
                  title="Verify the Payment"
                  trigger={["hover", "click"]}
                >
                  <Button
                    className="customers_status_awaitfinance_button"
                    onClick={() => {
                      if (!permissions.includes("Finance Verify")) {
                        console.log("eeeeeeeeeeeeeeeee");
                        CommonMessage("error", "Access Denied");
                        return;
                      }
                      getParticularCustomerDetails(record?.customer_id);
                      setDrawerContentStatus("Finance Verify");
                      setIsStatusUpdateDrawer(true);
                    }}
                  >
                    Payment Verify
                  </Button>
                </Tooltip>
              </div>
            ) : (
              <Tooltip
                placement="top"
                title="Update Payment"
                trigger={["hover", "click"]}
              >
                <Button
                  className="trainers_rejected_button"
                  onClick={() => {
                    getParticularCustomerDetails(record?.customer_id);
                    setDrawerContentStatus("Update Payment");
                    setIsStatusUpdateDrawer(true);
                  }}
                >
                  {text}
                </Button>
              </Tooltip>
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
  const [updateTableId, setUpdateTableId] = useState(null);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [checkAll, setCheckAll] = useState(true);

  useEffect(() => {
    if (columns.length > 0) {
      const allChecked = columns.every((col) => col.isChecked);
      setCheckAll(allChecked);
    }
  }, [columns]);

  const updateTableColumnsData = async (defaultColumns) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Received",
      column_names: defaultColumns || columns,
    };
    try {
      await updateTableColumns(payload);
    } catch (error) {
      console.log("update table columns error", error);
    }
  };

  useEffect(() => {
    if (allTableColumns !== null) {
      processTableColumnsData(allTableColumns);
    }
  }, [allTableColumns, paymentType]);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    if (convertAsJson?.user_id) {
      setLoginUserId(convertAsJson.user_id);
    }
  }, []);

  const processTableColumnsData = (data) => {
    try {
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

      const filterPage = data.find((f) => f.page_name === "Received");

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

      let filteredBackendColumns = [...(filterPage.column_names || [])];

      const attachRenderFunctions = (cols) => {
        return cols
          .filter((col) => nonChangeColumns.some((c) => c.key === col.key))
          .map((col) => {
            const original = nonChangeColumns.find((c) => c.key === col.key);
            return {
              ...col,
              width: original.width,
              fixed: original.fixed,
              hidden: original.hidden,
              render: original.render,
              sorter: original.sorter,
              sortDirections: original.sortDirections,
            };
          });
      };

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
      console.log("process table columns error", error);
    }
  };

  useEffect(() => {
    const PreviousYearDec26ToCurrentDate =
      getPreviousYearDec26ToCurrentYearDec25();
    const startDate = filterData?.startDate
      ? new Date(filterData.startDate)
      : PreviousYearDec26ToCurrentDate[0];
    const endDate = filterData?.endDate
      ? new Date(filterData.endDate)
      : PreviousYearDec26ToCurrentDate[1];
    setSelectedDates([startDate, endDate]);
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setSubUsers(downlineUsers);
      getAllDownlineUsersData(convertAsJson?.user_id);
    }
  }, [childUsers]);

  useEffect(() => {
    const handleRefreshReceived = () => {
      if (allDownliners.length > 0) {
        getPaymentRecievedData(
          selectedDates[0],
          selectedDates[1],
          searchValue,
          allDownliners,
          selectedRegionId,
          selectedBranchId,
          pagination.page,
          pagination.limit,
          paymentType,
        );
      }
    };
    window.addEventListener("refreshReceived", handleRefreshReceived);
    return () => {
      window.removeEventListener("refreshReceived", handleRefreshReceived);
    };
  }, [
    selectedDates,
    searchValue,
    allDownliners,
    pagination.page,
    pagination.limit,
    paymentType,
  ]);

  const getAllDownlineUsersData = async (user_id) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      setAllDownliners(downliners_ids);
      setDefaultAllDownliners(downliners_ids);
      const PreviousYearDec26ToCurrentDate =
        getPreviousYearDec26ToCurrentYearDec25();
      const startDate = filterData?.startDate
        ? new Date(filterData.startDate)
        : PreviousYearDec26ToCurrentDate[0];
      const endDate = filterData?.endDate
        ? new Date(filterData.endDate)
        : PreviousYearDec26ToCurrentDate[1];
      getPaymentRecievedData(
        startDate,
        endDate,
        null,
        downliners_ids,
        null,
        null,
        1,
        10,
        paymentType,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getPaymentRecievedData = async (
    startDate,
    endDate,
    searchvalue,
    downliners,
    regionId,
    branchId,
    pageNumber,
    limit,
    payment_type,
  ) => {
    setLoading(true);

    const from_date = formatToBackendIST(startDate);
    const to_date = formatToBackendIST(endDate);

    const payload = {
      start_date: moment(from_date).format("YYYY-MM-DD"),
      end_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchvalue && { search_filter: searchvalue }),
      user_ids: downliners,
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      page: pageNumber,
      limit: limit,
      ...(payment_type && { payment_type }),
    };
    try {
      const response = await getPaymentRecievedList(payload);
      console.log("received payments response", response);
      setReceivedPaymentsData(response?.data?.result?.data || []);
      const status_count = response?.data?.result?.status_count || {};
      setStatusCount(status_count);
      setTotalAmountOfReceived(
        response?.data?.result?.page_total_paid_amount || null,
      );
      const paginations = response?.data?.result?.pagination;
      setReceivedCount(
        Number(status_count?.new_payment) + Number(status_count?.re_payment),
      );
      setPagination({
        page: paginations.page,
        limit: paginations.limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
      });
      setLoading(false);
    } catch (error) {
      setReceivedPaymentsData([]);
      setTotalAmountOfReceived(null);
      setLoading(false);
      console.log("received payments error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getPaymentRecievedData(
      selectedDates[0],
      selectedDates[1],
      searchValue,
      allDownliners,
      selectedRegionId,
      selectedBranchId,
      page,
      limit,
      paymentType,
    );
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setPagination({
      page: 1,
    });
    getPaymentRecievedData(
      selectedDates[0],
      selectedDates[1],
      e.target.value,
      allDownliners,
      selectedRegionId,
      selectedBranchId,
      1,
      pagination.limit,
      paymentType,
    );
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
      getPaymentRecievedData(
        selectedDates[0],
        selectedDates[1],
        searchValue,
        downliners_ids,
        selectedRegionId,
        selectedBranchId,
        1,
        pagination.limit,
        paymentType,
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const drawerColumns = columns.filter((col) =>
    nonChangeColumns.some((c) => c.key === col.key),
  );

  const handleSetDrawerColumns = (updatedDrawerColumnsOrUpdater) => {
    setColumns((prevColumns) => {
      const updatedDrawerColumns =
        typeof updatedDrawerColumnsOrUpdater === "function"
          ? updatedDrawerColumnsOrUpdater(drawerColumns)
          : updatedDrawerColumnsOrUpdater;

      const hiddenColumns = prevColumns.filter(
        (col) => !nonChangeColumns.some((c) => c.key === col.key),
      );

      return [...updatedDrawerColumns, ...hiddenColumns];
    });
  };

  //get particular customer full details
  const getParticularCustomerDetails = async (
    customer_Id,
    isOpenModal = false,
  ) => {
    setIsStatusUpdateDrawerLoading(true);
    try {
      const response = await getCustomerById(customer_Id);
      console.log("particular customer response", response);
      const customer_details = response?.data?.data;
      setCustomerDetails(customer_details);
      if (isOpenModal) {
        setIsOpenCustomerDetailsModal(true);
      }
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    } finally {
      setIsStatusUpdateDrawerLoading(false);
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

  const handleDownload = async () => {
    setDownloadLoading(true);
    const from_date = formatToBackendIST(selectedDates[0]);
    const to_date = formatToBackendIST(selectedDates[1]);

    const payload = {
      start_date: moment(from_date).format("YYYY-MM-DD"),
      end_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchValue && { search_filter: searchValue }),
      user_ids:
        selectedRegionId || selectedBranchId
          ? defaultAllDownliners
          : allDownliners,
      ...(selectedRegionId && { region_id: selectedRegionId }),
      ...(selectedBranchId && { branch_id: selectedBranchId }),
      ...(paymentType && { payment_type: paymentType }),
    };
    try {
      const response = await getPaymentRecievedList(payload);
      console.log("received payments response", response);
      const download_data = response?.data?.result?.data || [];
      if (download_data.length >= 1) {
        DownloadTableAsCSV(
          download_data,
          nonChangeColumns,
          `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
            selectedDates[1],
          ).format("DD-MM-YYYY")} Received Payments.csv`,
        );
      } else {
        CommonMessage("error", "No Data Found");
      }
      setDownloadLoading(false);
    } catch (error) {
      setDownloadLoading(false);
      console.log("received payments error", error);
    }
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setCustomerDetails(null);
    setDrawerContentStatus("");
    setIsStatusUpdateDrawer(false);
  };

  const handleRefresh = () => {
    setSearchValue("");
    setSelectedUserId([]);
    prevSelectedUserIdRef.current = "[]";
    setSelectedRegionId(null);
    setBranchOptions([]);
    setSelectedBranchId(null);
    setSubUsers(downlineUsers);
    const PreviousYearDec26ToCurrentDate =
      getPreviousYearDec26ToCurrentYearDec25();
    setSelectedDates(PreviousYearDec26ToCurrentDate);
    getAllDownlineUsersData(loginUserId);
  };

  useEffect(() => {
    const triggerRefresh = () => handleRefresh();
    window.addEventListener("refreshReceivedTab", triggerRefresh);
    return () =>
      window.removeEventListener("refreshReceivedTab", triggerRefresh);
  });

  return (
    <div>
      <Row
        style={{
          alignItems: "center",
          marginTop: permissions.includes("Lead Executive Filter")
            ? "22px"
            : "30px",
        }}
      >
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={permissions.includes("Lead Executive Filter") ? 22 : 12}
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
                  height="33px"
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
                          getPaymentRecievedData(
                            selectedDates[0],
                            selectedDates[1],
                            null,
                            allDownliners,
                            selectedRegionId,
                            selectedBranchId,
                            1,
                            pagination.limit,
                            paymentType,
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
                    options={[
                      {
                        id: 1,
                        name: "Chennai",
                      },
                      {
                        id: 2,
                        name: "Bangalore",
                      },
                      {
                        id: 3,
                        name: "Hub",
                      },
                    ]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedRegionId(value);
                      setSelectedBranchId(null);
                      setSelectedUserId([]);
                      setPagination({
                        page: 1,
                        limit: pagination.limit,
                      });
                      getPaymentRecievedData(
                        selectedDates[0],
                        selectedDates[1],
                        searchValue,
                        defaultAllDownliners,
                        value,
                        null,
                        1,
                        pagination.limit,
                        paymentType,
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
                      getPaymentRecievedData(
                        selectedDates[0],
                        selectedDates[1],
                        searchValue,
                        defaultAllDownliners,
                        selectedRegionId,
                        value,
                        1,
                        pagination.limit,
                        paymentType,
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
                    width={"100%"}
                    options={subUsers}
                    onChange={handleSelectUser}
                    onBlur={handleSelectUserBlur}
                    value={selectedUserId}
                  />
                </Col>
              </>
            )}
            <Col flex="1.5 1 0%">
              <div style={{ position: "relative" }}>
                <p className="accounts_datepicket_label">Entry Date</p>
                <CommonMuiCustomDatePicker
                  width="100%"
                  value={selectedDates}
                  onDateChange={(dates) => {
                    setSelectedDates(dates);
                    setPagination({
                      page: 1,
                    });
                    getPaymentRecievedData(
                      dates[0],
                      dates[1],
                      searchValue,
                      allDownliners,
                      selectedRegionId,
                      selectedBranchId,
                      1,
                      pagination.limit,
                      paymentType,
                    );
                  }}
                />
              </div>
            </Col>
          </Row>
        </Col>
        <Col
          span={permissions.includes("Lead Executive Filter") ? 2 : 12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {permissions.includes("Download Customers Data") && (
            <Tooltip placement="top" title="Download">
              <Button
                className="dashboard_download_button"
                onClick={handleDownload}
                disabled={downloadLoading}
              >
                <DownloadOutlined className="download_icon" />
              </Button>
            </Tooltip>
          )}
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setIsOpenFilterDrawer(true);
              //   getTableColumnsData(loginUserId);
            }}
          />
        </Col>
      </Row>
      <Row style={{ marginBottom: "16px" }}>
        <Col
          span={24}
          style={{ display: "flex", gap: "16px", alignItems: "center" }}
        >
          <Flex
            gap="middle"
            wrap="wrap"
            align="center"
            style={{ marginTop: "18px" }}
          >
            {[
              {
                label: "New",
                value: "NEW",
                baseColor: "#0f8753",
                count: statusCount?.new_payment || 0,
              },
              {
                label: "Repayment",
                value: "REPAYMENT",
                baseColor: "#ffa502",
                count: statusCount?.re_payment || 0,
              },
            ].map((bucket) => {
              const isActive = paymentType === bucket.value;
              const baseColor = bucket.baseColor;
              return (
                <div
                  key={bucket.label}
                  onClick={() => {
                    if (paymentType == bucket?.value) {
                      return;
                    }
                    setPaymentType(bucket.value);
                    setPagination({ ...pagination, page: 1 });
                    getPaymentRecievedData(
                      selectedDates[0],
                      selectedDates[1],
                      searchValue,
                      allDownliners,
                      selectedRegionId,
                      selectedBranchId,
                      1,
                      pagination.limit,
                      bucket.value,
                    );
                  }}
                  className={`leadmanager_bucket ${isActive ? "active" : ""}`}
                  style={{
                    border: `1px solid ${isActive ? baseColor : baseColor + "66"}`,
                    backgroundColor: isActive ? baseColor : baseColor + "15",
                    color: isActive ? "#fff" : baseColor,
                    minWidth: "max-content",
                  }}
                >
                  {bucket.label}{" "}
                  {bucket.count !== null && `( ${bucket.count} )`}
                </div>
              );
            })}
          </Flex>
        </Col>
      </Row>

      <Row style={{ marginTop: "16px" }}>
        <Col span={12}>
          {permissions.includes("Show Region Summary") && (
            <div
              className="livelead_today_summary_container"
              style={{ marginTop: "0px" }}
            >
              <p className="livelead_today_label">Region Summary</p>

              <div className="livelead_badge_item online">
                <div
                  className="livelead_badge_dot"
                  style={{ backgroundColor: "#3c9111" }}
                />
                <p className="livelead_badge_text">
                  Hub{" "}
                  <span className="livelead_badge_count">
                    {statusCount?.hub ?? "-"}
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
                    {statusCount?.chennai ?? "-"}
                  </span>
                </p>
              </div>

              <div className="livelead_badge_item corporate">
                <div
                  className="livelead_badge_dot"
                  style={{ backgroundColor: "#607d8b" }}
                />
                <p className="livelead_badge_text">
                  Bangalore{" "}
                  <span className="livelead_badge_count">
                    {statusCount?.bangalore ?? "-"}
                  </span>
                </p>
              </div>
              {/* <div className="livelead_badge_item total">
            <div
              className="livelead_badge_dot"
              style={{ backgroundColor: "#5b69ca" }}
            />
            <p className="livelead_badge_text">
              Total{" "}
              <span className="livelead_badge_count">
                {allLeadsRegionCounts?.total || 0}
              </span>
            </p>
          </div> */}
            </div>
          )}
        </Col>
        <Col
          span={12}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <div
            className="overall_pending_amount_card"
            style={{ padding: "8px 16px" }}
          >
            <span className="overall_pending_amount_label">
              Total Amount to Be Verified:
            </span>
            <span className="overall_pending_amount_value">
              ₹{Number(totalAmountOfReceived)?.toLocaleString("en-IN") || 0}
            </span>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: "16px" }}>
        <CommonTable
          // scroll={{ x: 2350 }}
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={tableColumns}
          dataSource={receivedPaymentsData}
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
        onClose={() => setIsOpenFilterDrawer(false)}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative", paddingBottom: 50 }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd
                data={drawerColumns}
                setColumns={handleSetDrawerColumns}
              />
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={async () => {
                const visibleColumns = columns
                  .filter((col) => col.isChecked)
                  .map((col) => {
                    const original = nonChangeColumns.find(
                      (c) => c.key === col.key,
                    );
                    if (original) {
                      return {
                        ...col,
                        width: original.width,
                        fixed: original.fixed,
                        hidden: original.hidden,
                        render: original.render,
                      };
                    }
                    return null;
                  })
                  .filter(Boolean);

                setTableColumns(visibleColumns);
                setIsOpenFilterDrawer(false);

                const getLoginUserDetails =
                  localStorage.getItem("loginUserDetails");
                const convertAsJson = JSON.parse(getLoginUserDetails);

                const payload = {
                  user_id: convertAsJson?.user_id,
                  id: updateTableId,
                  page_name: "Received",
                  column_names: columns,
                };

                try {
                  await updateTableColumns(payload);
                  setTimeout(() => {
                    if (refreshTableColumns) refreshTableColumns();
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
        title="Customer Details"
        open={isOpenDetailsDrawer}
        onClose={formReset}
        width="45%"
        style={{ position: "relative" }}
      >
        {isOpenDetailsDrawer ? (
          <ParticularCustomerDetails customerId={customerDetails?.id} />
        ) : (
          ""
        )}
      </Drawer>
      <Drawer
        title={"Update Status"}
        open={isStatusUpdateDrawer}
        onClose={formReset}
        width="50%"
        style={{
          position: "relative",
          paddingBottom:
            drawerContentStatus === "Finance Verify" ||
            drawerContentStatus === "Update Payment"
              ? "0px"
              : "65px",
        }}
        className="customer_statusupdate_drawer"
      >
        {isStatusUpdateDrawerLoading ? (
          <div style={{ padding: "24px" }}>
            <div className="customer_profileContainer">
              <Skeleton.Avatar active size={90} shape="circle" />
              <div style={{ marginLeft: "20px", flex: 1 }}>
                <Skeleton
                  active
                  paragraph={{ rows: 2 }}
                  title={{ width: 150 }}
                />
              </div>
            </div>

            <Row gutter={16} style={{ marginTop: "30px" }}>
              <Col span={12}>
                {[1, 2, 3, 4].map((i) => (
                  <Row key={i} style={{ marginTop: i === 1 ? "0" : "12px" }}>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>
              <Col span={12}>
                {[1, 2, 3, 4].map((i) => (
                  <Row key={i} style={{ marginTop: i === 1 ? "0" : "12px" }}>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>

            <div
              className="customerdetails_coursecard"
              style={{ marginTop: "30px" }}
            >
              <div className="customerdetails_coursecard_headercontainer">
                <Skeleton.Input active size="small" style={{ width: 150 }} />
              </div>
              <div
                className="customerdetails_coursecard_contentcontainer"
                style={{ padding: "20px" }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Row
                        key={i}
                        style={{ marginTop: i === 1 ? "0" : "12px" }}
                      >
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "80%" }}
                          />
                        </Col>
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "100%" }}
                          />
                        </Col>
                      </Row>
                    ))}
                  </Col>
                  <Col span={12}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Row
                        key={i}
                        style={{ marginTop: i === 1 ? "0" : "12px" }}
                      >
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "80%" }}
                          />
                        </Col>
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "100%" }}
                          />
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="customer_statusupdate_drawer_profileContainer">
              {customerDetails && customerDetails.profile_image ? (
                <Upload
                  listType="picture-circle"
                  fileList={[
                    {
                      uid: "-1",
                      name: "profile.jpg",
                      status: "done",
                      url: customerDetails.profile_image, // Base64 string directly usable
                    },
                  ]}
                  onPreview={handlePreview}
                  onRemove={false}
                  showUploadList={{
                    showRemoveIcon: false,
                  }}
                  beforeUpload={() => false} // prevent auto upload
                  style={{ width: 90, height: 90 }} // reduce size
                  accept=".png,.jpg,.jpeg"
                ></Upload>
              ) : (
                <FaRegUser size={50} color="#333" />
              )}

              <div>
                <p className="customer_nametext">
                  {" "}
                  {customerDetails && customerDetails.name
                    ? customerDetails.name
                    : "-"}
                </p>
                <p className="customer_coursenametext">
                  {" "}
                  {customerDetails && customerDetails.course_name
                    ? customerDetails.course_name
                    : "-"}
                </p>
              </div>
            </div>

            <Row
              gutter={16}
              style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
            >
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <LiaIdCardSolid
                        size={19}
                        color="gray"
                        style={{
                          flexShrink: 0,
                          marginLeft: "-2.3px",
                          marginRight: "-2px",
                        }}
                      />
                      <p className="customerdetails_rowheading">Student Id</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.student_id
                          ? customerDetails.student_id
                          : "-"
                      }
                      smallText={true}
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegCircleUser size={15} color="gray" />
                      <p className="customerdetails_rowheading">Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.name
                          ? customerDetails.name
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
                        customerDetails && customerDetails.email
                          ? customerDetails.email
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
                      {customerDetails && customerDetails.phone
                        ? customerDetails.phone
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
                      {customerDetails && customerDetails.whatsapp
                        ? customerDetails.whatsapp
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      {customerDetails && customerDetails.gender === "Male" ? (
                        <BsGenderMale size={15} color="gray" />
                      ) : (
                        <BsGenderFemale size={15} color="gray" />
                      )}
                      <p className="customerdetails_rowheading">Gender</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.gender
                        ? customerDetails.gender
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <IoLocationOutline size={15} color="gray" />
                      <p className="customerdetails_rowheading">Location</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.current_location
                        ? customerDetails.current_location
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegUser size={15} color="gray" />
                      <p className="customerdetails_rowheading">
                        Lead Executive
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={`${
                        customerDetails && customerDetails.lead_assigned_to_id
                          ? customerDetails.lead_assigned_to_id
                          : "-"
                      } (${
                        customerDetails && customerDetails.lead_assigned_to_name
                          ? customerDetails.lead_assigned_to_name
                          : "-"
                      })`}
                      smallText={true}
                    />
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
                        customerDetails && customerDetails.course_name
                          ? customerDetails.course_name
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
                      style={{ fontWeight: 700 }}
                    >
                      {customerDetails && customerDetails.primary_fees
                        ? "₹" + customerDetails.primary_fees
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Course Fees
                        <span className="customerdetails_coursegst">{` (+Gst)`}</span>
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ fontWeight: 700 }}
                    >
                      {customerDetails && customerDetails.total_amount
                        ? "₹" + customerDetails.total_amount
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Balance Amount
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ color: "#d32f2f", fontWeight: 700 }}
                    >
                      {customerDetails &&
                      customerDetails.balance_amount !== undefined &&
                      customerDetails.balance_amount !== null
                        ? "₹" + customerDetails.balance_amount
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
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.branch_name
                          ? customerDetails.branch_name
                          : "-"
                      }
                      smallText={true}
                    />
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
                      {customerDetails && customerDetails.batch_tracking
                        ? customerDetails.batch_tracking
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Batch Type</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.batch_timing
                        ? customerDetails.batch_timing
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Server</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails &&
                      customerDetails.is_server_required !== undefined
                        ? customerDetails.is_server_required === 1
                          ? "Required"
                          : "Not Required"
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Divider className="customer_statusupdate_divider" />

            {drawerContentStatus === "Finance Verify" ||
            drawerContentStatus === "Update Payment" ? (
              <FinanceVerify
                ref={financeVerifyRef}
                customerDetails={customerDetails}
                drawerContentStatus={drawerContentStatus}
                callgetCustomersApi={() => {
                  formReset();
                  setPagination({
                    page: 1,
                  });
                  getPaymentRecievedData(
                    selectedDates[0],
                    selectedDates[1],
                    searchValue,
                    allDownliners,
                    selectedRegionId,
                    selectedBranchId,
                    1,
                    pagination.limit,
                    paymentType,
                  );
                  window.dispatchEvent(new CustomEvent("refreshReceivables"));
                  window.dispatchEvent(new CustomEvent("refreshFeesHistory"));
                }}
              />
            ) : (
              ""
            )}
          </>
        )}
      </Drawer>
      {/* profile image modal */}
      <Modal
        open={previewOpen}
        title="Preview Profile"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* customer details modal */}
      <DraggableStudentModal
        open={isOpenCustomerDetailsModal}
        onClose={() => setIsOpenCustomerDetailsModal(false)}
        customerDetails={customerDetails}
      />
    </div>
  );
}
