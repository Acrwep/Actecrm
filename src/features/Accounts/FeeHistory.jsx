import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Drawer, Checkbox, Button, Flex, Radio } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import { LuFileClock } from "react-icons/lu";
import { IoFilter } from "react-icons/io5";
import { DownloadOutlined } from "@ant-design/icons";
import CommonTable from "../Common/CommonTable";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  formatToBackendIST,
  getPreviousYearDec26ToCurrentYearDec25,
} from "../Common/Validation";
import {
  getFeeHistory,
  getTableColumns,
  updateTableColumns,
  getAllDownlineUsers,
  getCustomerById,
  getBranches,
  getUsers,
} from "../ApiService/action";
import CommonDnd from "../Common/CommonDnd";
import { useSelector } from "react-redux";
import InsertPendingFees from "../Customers/Pending Fees/InsertPendingFees";
import DraggableStudentModal from "../Common/DraggableStudentModal";
import CommonSpinner from "../Common/CommonSpinner";
import CommonSelectField from "../Common/CommonSelectField";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import CustomerHistory from "../Customers/CustomerHistory";

export default function FeeHistory({
  filterData,
  setFeeHistoryCount,
  allTableColumns,
  refreshTableColumns,
}) {
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const mounted = useRef(false);
  const [searchValue, setSearchValue] = useState("");
  const [feeHistoryData, setFeeHistoryData] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("joining_date");
  const [selectedDates, setSelectedDates] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  const [regionCounts, setRegionCounts] = useState(null);
  const [isOpenPaymentDrawer, setIsOpenPaymentDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const prevSelectedUserIdRef = useRef("[]");
  const [allDownliners, setAllDownliners] = useState([]);
  const [defaultAllDownliners, setDefaultAllDownliners] = useState([]);
  const [isOpenCustomerDetailsModal, setIsOpenCustomerDetailsModal] =
    useState(false);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState("");
  const [isOpenCustomerHistoryDrawer, setIsOpenCustomerHistoryDrawer] =
    useState(false);
  const [selectedHistoryCustomerId, setSelectedHistoryCustomerId] =
    useState(null);
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
    ...(dateFilterType === "last_payment_verified_date"
      ? [
          {
            title: (
              <Tooltip title="Last Payment Verified Date" placement="top">
                <div
                  style={{
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Last PV Date
                </div>
              </Tooltip>
            ),
            key: "last_payment_verified_date",
            dataIndex: "last_payment_verified_date",
            width: 135,
            render: (text) => {
              return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
            },
          },
        ]
      : []),
    {
      title: "Date of Joining",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 135,
      sorter: (a, b) =>
        moment(a.date_of_joining).valueOf() -
        moment(b.date_of_joining).valueOf(),
      sortDirections: ["ascend", "descend"],
      defaultSortOrder: "descend", // Optional
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "T.Days Count",
      key: "total_days_taken",
      dataIndex: "total_days_taken",
      width: 120,
      sorter: (a, b) =>
        moment(a.total_days_taken).valueOf() -
        moment(b.total_days_taken).valueOf(),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Installments Count",
      key: "installment_count",
      dataIndex: "installment_count",
      width: 140,
      render: (text) => {
        return <p>{text ? text : "-"}</p>;
      },
    },
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
      title: "Mode Of Training",
      key: "mode_of_class",
      dataIndex: "mode_of_class",
      width: 125,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    {
      title: "Place Of Service",
      key: "place_of_service_name",
      dataIndex: "place_of_service_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text ? text : "-"} />;
      },
    },
    ...(permissions.includes("Show Lead Executive Id")
      ? [
          {
            title: "Lead Executive",
            key: "assigned_to_name",
            dataIndex: "assigned_to_name",
            width: 150,
            render: (text, record) => {
              const lead_executive = `${record.assigned_to} - ${text}`;
              return <EllipsisTooltip text={lead_executive} />;
            },
          },
        ]
      : []),
    {
      title: "Student Id",
      key: "student_id",
      dataIndex: "student_id",
      width: 100,
      render: (text, record) => {
        const user_id = text
          ? text
          : record?.customer_name
            ? record?.customer_name
            : "-";
        const isLoading = customerDetailsLoading == record.customer_id;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <EllipsisTooltip text={user_id} />
            {isLoading ? (
              <CommonSpinner color="#333" size={14} />
            ) : (
              <>
                {user_id && (
                  <FaRegEye
                    size={13}
                    className="trainers_action_icons"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      getParticularCustomerDetails(record?.customer_id, true);
                    }}
                  />
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      title: "Total Fees (With GST)",
      key: "total_amount",
      dataIndex: "total_amount",
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
        return <p>{text ? Number(text).toLocaleString("en-IN") : "-"}</p>;
      },
    },
    {
      title: "Balance Amount",
      key: "balance_amount",
      dataIndex: "balance_amount",
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
              ? amount.toLocaleString("en-IN")
              : "-"}
          </p>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: 80,
      fixed: "right",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <Tooltip
              placement="top"
              title="View Payment History"
              trigger={["hover", "click"]}
            >
              <FaRegEye
                size={15}
                style={{ marginTop: "1px" }}
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenPaymentDrawer(true);
                  setCustomerDetails(record);
                }}
              />
            </Tooltip>

            <Tooltip
              placement="left"
              title="View Customer Track"
              trigger={["hover", "click"]}
            >
              <LuFileClock
                size={15}
                className="trainers_action_icons"
                style={{ cursor: "pointer", marginLeft: "4px" }}
                onClick={() => {
                  setSelectedHistoryCustomerId(record.customer_id);
                  setIsOpenCustomerHistoryDrawer(true);
                }}
              />
            </Tooltip>
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

  useEffect(() => {
    if (allTableColumns !== null) {
      processTableColumnsData(allTableColumns);
    }
  }, [allTableColumns, dateFilterType, permissions]);

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

      const filterPage = data.find((f) => f.page_name === "Fees History");

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

      const filteredBackendColumns = filterPage.column_names
        ? [...filterPage.column_names]
        : [];

      const attachRenderFunctions = (cols) =>
        cols.map((col) => {
          const original = nonChangeColumns.find((c) => c.key === col.key);
          if (original) {
            return {
              ...original,
              ...col,
              render: original.render,
            };
          }
          return col;
        });

      nonChangeColumns.forEach((c) => {
        if (!filteredBackendColumns.some((b) => b.key === c.key)) {
          if (c.key === "last_payment_verified_date") {
            filteredBackendColumns.unshift({ ...c, isChecked: true });
          } else {
            filteredBackendColumns.push({ ...c, isChecked: true });
          }
        }
      });

      const validColumns = filteredBackendColumns.filter((b) =>
        nonChangeColumns.some((c) => c.key === b.key),
      );

      const allColumns = attachRenderFunctions(validColumns);
      const visibleColumns = attachRenderFunctions(
        validColumns.filter((col) => col.isChecked),
      );

      setColumns(allColumns);
      setTableColumns(visibleColumns);
    } catch (error) {
      console.log("process table columns error", error);
    }
  };

  const updateTableColumnsData = async (defaultColumns) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_id: convertAsJson?.user_id,
      page_name: "Fees History",
      column_names: defaultColumns || columns,
    };
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
      setDefaultAllDownliners(downliners_ids);
      const PreviousYearDec26ToCurrentDate =
        getPreviousYearDec26ToCurrentYearDec25();
      const startDate = filterData?.startDate
        ? new Date(filterData.startDate)
        : PreviousYearDec26ToCurrentDate[0];
      const endDate = filterData?.endDate
        ? new Date(filterData.endDate)
        : PreviousYearDec26ToCurrentDate[1];
      fetchFeeHistoryData(
        "joining_date",
        startDate,
        endDate,
        null,
        downliners_ids,
        null,
        null,
        1,
        10,
      );
    } catch (error) {
      console.log("all downlines error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setLoading(true);
    setSelectedUserId(value);
  };

  const handleSelectUserBlur = async () => {
    const value = selectedUserId;

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

      fetchFeeHistoryData(
        dateFilterType,
        selectedDates[0],
        selectedDates[1],
        searchValue,
        downliners_ids,
        selectedRegionId,
        selectedBranchId,
        1,
        pagination.limit,
      );
      setPagination({ ...pagination, page: 1 });
    } catch (error) {
      console.log("all downlines error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleRefreshFeesHistory = () => {
      if (allDownliners.length > 0) {
        fetchFeeHistoryData(
          dateFilterType,
          selectedDates[0],
          selectedDates[1],
          searchValue,
          allDownliners,
          selectedRegionId,
          selectedBranchId,
          pagination.page,
          pagination.limit,
        );
      }
    };
    window.addEventListener("refreshFeesHistory", handleRefreshFeesHistory);
    return () => {
      window.removeEventListener(
        "refreshFeesHistory",
        handleRefreshFeesHistory,
      );
    };
  }, [
    selectedDates,
    searchValue,
    allDownliners,
    pagination.page,
    pagination.limit,
  ]);

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

  const fetchFeeHistoryData = async (
    dateType,
    startDate,
    endDate,
    searchvalue,
    downliners,
    regionId,
    branchId,
    pageNumber,
    limit,
  ) => {
    setLoading(true);

    const from_date = formatToBackendIST(startDate);
    const to_date = formatToBackendIST(endDate);

    const payload = {
      date_type: dateType,
      start_date: moment(from_date).format("YYYY-MM-DD"),
      end_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchvalue && { search_filter: searchvalue }),
      user_ids: downliners,
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      page: pageNumber,
      limit: limit,
      // bucket: "FeeHistory",
    };

    try {
      const response = await getFeeHistory(payload);
      console.log("fee history response", response);
      const resultData =
        response?.data?.result?.data || response?.data?.data || [];
      setFeeHistoryData(resultData);
      setRegionCounts(response?.data?.bucketData || null);

      const paginations =
        response?.data?.result?.pagination || response?.data?.pagination || {};

      const totalElements = paginations?.total || resultData.length;
      if (setFeeHistoryCount) {
        setFeeHistoryCount(totalElements);
      }

      setPagination({
        page: paginations?.page || pageNumber,
        limit: paginations?.limit || limit,
        total: totalElements,
        totalPages: paginations?.totalPages || 0,
      });
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      setFeeHistoryData([]);
      setRegionCounts(null);
      setLoading(false);
      console.log("fee history error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    fetchFeeHistoryData(
      dateFilterType,
      selectedDates[0],
      selectedDates[1],
      searchValue,
      allDownliners,
      selectedRegionId,
      selectedBranchId,
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
    fetchFeeHistoryData(
      dateFilterType,
      selectedDates[0],
      selectedDates[1],
      e.target.value,
      allDownliners,
      selectedRegionId,
      selectedBranchId,
      1,
      pagination.limit,
    );
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
    setCustomerDetailsLoading(customer_Id);
    try {
      const response = await getCustomerById(customer_Id);
      console.log("particular customer response", response);
      const customer_details = response?.data?.data;
      setCustomerDetails(customer_details);
      setCustomerDetailsLoading("");
      if (isOpenModal) {
        setIsOpenCustomerDetailsModal(true);
      }
    } catch (error) {
      setCustomerDetailsLoading("");
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
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
      // bucket: "FeeHistory",
    };

    try {
      const response = await getFeeHistory(payload);
      console.log("fee history response", response);
      const download_data =
        response?.data?.result?.data || response?.data?.data || [];
      if (download_data.length >= 1) {
        DownloadTableAsCSV(
          download_data,
          nonChangeColumns,
          `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
            selectedDates[1],
          ).format("DD-MM-YYYY")} Fees History.csv`,
        );
      } else {
        CommonMessage("error", "No Data Found");
      }
      setDownloadLoading(false);
    } catch (error) {
      setDownloadLoading(false);
      console.log("fee history error", error);
    }
  };

  const formReset = () => {
    setIsOpenPaymentDrawer(false);
    setCustomerDetails(null);
  };

  useEffect(() => {
    const triggerRefresh = () => handleRefresh();
    window.addEventListener("refreshFeeHistoryTab", triggerRefresh);
    return () =>
      window.removeEventListener("refreshFeeHistoryTab", triggerRefresh);
  });

  const handleRefresh = () => {
    setDateFilterType("joining_date");
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
                          fetchFeeHistoryData(
                            dateFilterType,
                            selectedDates[0],
                            selectedDates[1],
                            null,
                            allDownliners,
                            selectedRegionId,
                            selectedBranchId,
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
                      fetchFeeHistoryData(
                        dateFilterType,
                        selectedDates[0],
                        selectedDates[1],
                        searchValue,
                        defaultAllDownliners,
                        value,
                        null,
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
                      fetchFeeHistoryData(
                        dateFilterType,
                        selectedDates[0],
                        selectedDates[1],
                        searchValue,
                        defaultAllDownliners,
                        selectedRegionId,
                        value,
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
                <p
                  className="accounts_datepicket_label"
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "2px",
                    fontSize: "11px",
                    color: "#8c8c8c",
                    marginBottom: 0,
                  }}
                >
                  {dateFilterType === "joining_date"
                    ? "Joining Date"
                    : "Last Payment Verified Date"}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "nowrap",
                    width: "100%",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <CommonMuiCustomDatePicker
                      width={"100%"}
                      value={selectedDates}
                      onDateChange={(dates) => {
                        setSelectedDates(dates);
                        setPagination({
                          page: 1,
                        });
                        fetchFeeHistoryData(
                          dateFilterType,
                          dates[0],
                          dates[1],
                          searchValue,
                          allDownliners,
                          selectedRegionId,
                          selectedBranchId,
                          1,
                          pagination.limit,
                        );
                      }}
                    />
                  </div>

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
                            value={dateFilterType}
                            onChange={(e) => {
                              console.log(e.target.value);
                              setDateFilterType(e.target.value);
                              setPagination({
                                page: 1,
                              });
                              fetchFeeHistoryData(
                                e.target.value,
                                selectedDates[0],
                                selectedDates[1],
                                searchValue,
                                allDownliners,
                                selectedRegionId,
                                selectedBranchId,
                                1,
                                pagination.limit,
                              );
                            }}
                          >
                            <Radio
                              value="joining_date"
                              className="customers_datetypefilter_radio"
                              style={{
                                marginTop: "6px",
                                marginBottom: "12px",
                                fontSize: "12px",
                              }}
                            >
                              Search by Joining Date
                            </Radio>
                            <Radio
                              value="last_payment_verified_date"
                              style={{ marginBottom: "12px", fontSize: "12px" }}
                            >
                              Search by Last Payment Verified Date
                            </Radio>
                          </Radio.Group>
                        }
                      >
                        <Button
                          className="customer_trainermappingfilter_container"
                          style={{
                            // borderLeftColor: isTrainerSelectFocused && "#5b69ca",
                            height: "35px",
                          }}
                        >
                          <IoFilter size={16} />
                        </Button>
                      </Tooltip>
                    </Flex>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
        <Col
          lg={permissions.includes("Lead Executive Filter") ? 2 : 12}
          xxl={permissions.includes("Lead Executive Filter") ? 6 : 12}
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

      {permissions.includes("Show Region Summary") && (
        <div className="livelead_today_summary_container">
          <p className="livelead_today_label">Region Summary</p>

          <div className="livelead_badge_item online">
            <div
              className="livelead_badge_dot"
              style={{ backgroundColor: "#3c9111" }}
            />
            <p className="livelead_badge_text">
              Hub{" "}
              <span className="livelead_badge_count">
                {regionCounts?.hub ?? "-"}
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
                {regionCounts?.chennai ?? "-"}
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
                {regionCounts?.bangalore ?? "-"}
              </span>
            </p>
          </div>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={tableColumns.map((col) => {
            const original = nonChangeColumns.find((c) => c.key === col.key);
            return original
              ? {
                  ...original,
                  ...col,
                  render: original.render,
                }
              : col;
          })}
          dataSource={feeHistoryData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
        />
      </div>

      <Drawer
        title="Payment History"
        open={isOpenPaymentDrawer}
        onClose={formReset}
        width="50%"
        style={{ position: "relative", paddingBottom: "65px" }}
        className="customer_statusupdate_drawer"
      >
        {isOpenPaymentDrawer ? (
          <InsertPendingFees
            selectedCustomerDetails={customerDetails}
            isViewOnly={true}
          />
        ) : (
          ""
        )}
      </Drawer>

      {/* table filter */}
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
                        ...original,
                        ...col,
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
                  page_name: "Fees History",
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

      {/* customer details modal */}
      <DraggableStudentModal
        open={isOpenCustomerDetailsModal}
        onClose={() => setIsOpenCustomerDetailsModal(false)}
        customerDetails={customerDetails}
      />

      {/* Customer History Drawer */}
      <CustomerHistory
        customerId={selectedHistoryCustomerId}
        isOpen={isOpenCustomerHistoryDrawer}
        onClose={() => {
          setIsOpenCustomerHistoryDrawer(false);
          setSelectedHistoryCustomerId(null);
        }}
      />
    </div>
  );
}
