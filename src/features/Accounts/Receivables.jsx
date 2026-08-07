import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Flex, Radio, Button, Drawer, Checkbox } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { FiFilter } from "react-icons/fi";
import { FaRegEye } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import { RedoOutlined } from "@ant-design/icons";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import {
  customersStatusDisplay,
  formatToBackendIST,
  getPreviousYearDec26ToCurrentYearDec25,
} from "../Common/Validation";
import {
  getAllDownlineUsers,
  getCustomerById,
  getPendingFeesCustomers,
  getTableColumns,
  updateTableColumns,
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
import CommonSpinner from "../Common/CommonSpinner";
import InsertPendingFees from "../Customers/Pending Fees/InsertPendingFees";
import DraggableStudentModal from "../Common/DraggableStudentModal";

export default function Receivables({
  setReceivableCount,
  filterData,
  allTableColumns,
  refreshTableColumns,
}) {
  const mounted = useRef(false);
  const insertPendingFeesRef = useRef();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [searchValue, setSearchValue] = useState("");
  const [customersData, setCustomersData] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isOpenPaymentDrawer, setIsOpenPaymentDrawer] = useState(false);
  const [overAllPendingAmount, setOverAllPendingAmount] = useState(null);
  const [regionCounts, setRegionCounts] = useState(null);
  const [isOpenCustomerDetailsModal, setIsOpenCustomerDetailsModal] =
    useState(false);
  const [loading, setLoading] = useState(true);

  //lead executive filter
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [allDownliners, setAllDownliners] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");

  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const nonChangeColumns = [
    ...(permissions.includes("Show Lead Executive Id")
      ? [
          {
            title: "Lead Executive",
            key: "lead_assigned_to_name",
            dataIndex: "lead_assigned_to_name",
            width: 150,
            render: (text, record) => {
              const lead_executive = `${record.lead_assigned_to_id} - ${text}`;
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
        const user_id = text ? text : record?.name ? record?.name : "-";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <EllipsisTooltip text={user_id} />
            {user_id && (
              <FaRegEye
                size={14}
                className="trainers_action_icons"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  getParticularCustomerDetails(record?.id, true);
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Date Of Joining",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 140,
      sorter: (a, b) =>
        moment(a.date_of_joining).valueOf() -
        moment(b.date_of_joining).valueOf(),
      sortDirections: ["ascend"],
      defaultSortOrder: "descend", // Optional
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Fees",
      key: "course_fees",
      dataIndex: "course_fees",
      width: 140,
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Balance",
      key: "balance_amount",
      dataIndex: "balance_amount",
      width: 140,
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Nxt Due Date",
      key: "next_due_date",
      dataIndex: "next_due_date",
      width: 120,
      fixed: "right",
      render: (text, record) => {
        return (
          <>
            <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>
          </>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      fixed: "right",
      width: 190,
      sorter: (a, b) =>
        customersStatusDisplay(a).localeCompare(customersStatusDisplay(b)),
      sortDirections: ["ascend", "descend"],
      render: (text, record) => {
        let classPercent = 0;

        if (
          record.class_percentage !== null &&
          record.class_percentage !== undefined
        ) {
          const parsed = parseFloat(record.class_percentage);
          classPercent = isNaN(parsed) ? 0 : parsed;
        }
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {record.is_second_due === 1 ? (
              <div>
                <Button className="customers_status_awaitfinance_button">
                  Payment Verify
                </Button>
              </div>
            ) : text === "Form Pending" ? (
              <div>
                <Button className="customers_status_formpending_button">
                  {text}
                </Button>
              </div>
            ) : record.is_last_pay_rejected === 1 ? (
              <div>
                <Button className="trainers_rejected_button">
                  Payment Rejected
                </Button>
              </div>
            ) : text === "Awaiting Finance" ? (
              <div>
                <Button className="customers_status_awaitfinance_button">
                  Payment Verify
                </Button>
              </div>
            ) : text === "Awaiting Verify" ? (
              <div>
                <Button className="customers_status_awaitverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer" ? (
              <div>
                <Button className="customers_status_awaittrainer_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer Verify" ? (
              <div>
                <Button className="customers_status_awaittrainerverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Trainer Approval" ? (
              <div>
                <Button className="customers_status_trainerapproval_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Class" ? (
              <div>
                <Button className="customers_status_awaitingclass_button">
                  {text}
                </Button>
              </div>
            ) : text === "Class Scheduled" ? (
              <div>
                <Button className="customers_status_classscheduled_button">
                  {text}
                </Button>
              </div>
            ) : text === "Passedout process" ? (
              <div>
                <Button className="customers_status_awaitfeedback_button">
                  {text}
                </Button>
              </div>
            ) : text === "Completed" ? (
              <div>
                <Button className="customers_status_completed_button">
                  {text}
                </Button>
              </div>
            ) : text === "Rejected" ||
              text === "REJECTED" ||
              text === "Trainer Rejected" ||
              text === "Payment Rejected" ||
              text === "Escalated" ||
              text === "Hold" ||
              text === "Partially Closed" ||
              text === "Discontinued" ||
              text === "Videos Given" ||
              text === "Refund" ? (
              <Button className="trainers_rejected_button">{text}</Button>
            ) : text === "Class Going" ? (
              <div style={{ display: "flex", gap: "12px" }}>
                <Button className="customers_status_classgoing_button">
                  {text}
                </Button>

                <p className="customer_classgoing_percentage">{`${parseFloat(
                  classPercent,
                )}%`}</p>
              </div>
            ) : (
              <p style={{ marginLeft: "6px" }}>-</p>
            )}
            {record.status === "Form Pending" && (
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
                      }/customer-registration/${record.id}`,
                    );
                    CommonMessage("success", "Link Copied");
                    console.log("Copied: eeee");
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: 100,
      fixed: "right",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            {/* <Tooltip
              placement="top"
              title="View Details"
              trigger={["hover", "click"]}
            >
              <FaRegEye
                size={16}
                style={{ marginTop: "1px" }}
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenDetailsDrawer(true);
                  setCustomerDetails(record);
                }}
              />
            </Tooltip> */}

            {permissions?.includes("Add Part Payment") && (
              <Tooltip
                placement="top"
                title="Add Payment"
                trigger={["hover", "click"]}
              >
                <GiReceiveMoney
                  size={18}
                  className="trainers_action_icons"
                  onClick={() => {
                    setIsOpenPaymentDrawer(true);
                    setCustomerDetails(record);
                  }}
                />
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
      page_name: "Receivable",
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
  }, [allTableColumns]);

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

      const filterPage = data.find((f) => f.page_name === "Receivable");

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
              width: original.width,
              fixed: original.fixed,
              hidden: original.hidden,
              render: original.render,
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
      console.log("process table columns error", error);
    }
  };

  useEffect(() => {
    const PreviousYearDec26ToCurrentDate =
      getPreviousYearDec26ToCurrentYearDec25();
    setSelectedDates(PreviousYearDec26ToCurrentDate);
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setSubUsers(downlineUsers);
      getAllDownlineUsersData(convertAsJson?.user_id);
    }
  }, [childUsers]);

  useEffect(() => {
    const handleRefreshReceivables = () => {
      if (allDownliners.length > 0) {
        getPendingFeesCustomersData(
          selectedDates[0],
          selectedDates[1],
          searchValue,
          allDownliners,
          pagination.page,
          pagination.limit,
        );
      }
    };
    window.addEventListener("refreshReceivables", handleRefreshReceivables);
    return () => {
      window.removeEventListener(
        "refreshReceivables",
        handleRefreshReceivables,
      );
    };
  }, [
    selectedDates,
    searchValue,
    allDownliners,
    pagination.page,
    pagination.limit,
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
      const PreviousYearDec26ToCurrentDate =
        getPreviousYearDec26ToCurrentYearDec25();
      getPendingFeesCustomersData(
        PreviousYearDec26ToCurrentDate[0],
        PreviousYearDec26ToCurrentDate[1],
        null,
        downliners_ids,
        1,
        10,
      );
    } catch (error) {
      console.log("all downlines error", error);
    } finally {
      setLoading(false);
    }
  };

  const getPendingFeesCustomersData = async (
    startDate,
    endDate,
    searchvalue,
    downliners,
    pageNumber,
    limit,
  ) => {
    setLoading(true);

    const from_date = formatToBackendIST(startDate);
    const to_date = formatToBackendIST(endDate);

    const payload = {
      from_date: moment(from_date).format("YYYY-MM-DD"),
      to_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchvalue && { search_filter: searchvalue }),
      user_ids: downliners,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getPendingFeesCustomers(payload);
      console.log("pending fee customer response", response);
      setCustomersData(response?.data?.data?.data || []);
      setRegionCounts(response?.data?.data?.bucketData || null);
      const paginations = response?.data?.data?.pagination;
      setOverAllPendingAmount(paginations?.overall_balance || 0);
      setReceivableCount(paginations?.total || 0);
      setPagination({
        page: paginations.page,
        limit: paginations.limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
      });

      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      setCustomersData([]);
      setRegionCounts(null);
      setOverAllPendingAmount(0);
      setLoading(false);
      console.log("pending fee customer error", error);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getPendingFeesCustomersData(
      selectedDates[0],
      selectedDates[1],
      searchValue,
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
    getPendingFeesCustomersData(
      selectedDates[0],
      selectedDates[1],
      e.target.value,
      allDownliners,
      1,
      pagination.limit,
    );
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
    setSelectedUserId(value);

    console.log(value, "loginUserId", loginUserId);

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
      getPendingFeesCustomersData(
        selectedDates[0],
        selectedDates[1],
        searchValue,
        downliners_ids,
        1,
        pagination.limit,
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
    }
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setCustomerDetails(null);
    setIsOpenPaymentDrawer(false);
  };

  const handleRefresh = () => {
    setSearchValue("");
    setSelectedUserId([]);
    const PreviousYearDec26ToCurrentDate =
      getPreviousYearDec26ToCurrentYearDec25();
    setSelectedDates(PreviousYearDec26ToCurrentDate);
    getAllDownlineUsersData(loginUserId);
  };

  useEffect(() => {
    const triggerRefresh = () => handleRefresh();
    window.addEventListener("refreshReceivablesTab", triggerRefresh);
    return () =>
      window.removeEventListener("refreshReceivablesTab", triggerRefresh);
  });

  return (
    <div>
      <Row style={{ alignItems: "center", marginTop: "22px" }}>
        <Col xs={24} sm={24} md={24} lg={16}>
          <Row gutter={12} align="middle" wrap={false}>
            <Col flex="28%">
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
                          getPendingFeesCustomersData(
                            selectedDates[0],
                            selectedDates[1],
                            null,
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
              <Col flex="28%">
                <CommonMultiSelectField
                  height="34px"
                  label="Select User"
                  labelMarginTop="1px"
                  labelFontSize="11px"
                  width={"100%"}
                  options={subUsers}
                  onChange={handleSelectUser}
                  value={selectedUserId}
                />
              </Col>
            )}

            <Col flex="none">
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getPendingFeesCustomersData(
                    dates[0],
                    dates[1],
                    searchValue,
                    allDownliners,
                    1,
                    pagination.limit,
                  );
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col
          span={8}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            className="overall_pending_amount_card"
            style={{ padding: "8px 16px" }}
          >
            <span className="overall_pending_amount_label">
              Pending Amount:
            </span>
            <span className="overall_pending_amount_value">
              ₹{Number(overAllPendingAmount)?.toLocaleString("en-IN") || 0}
            </span>
          </div>

          {/* <Tooltip placement="top" title="Download"></Tooltip> */}
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
      </Row>{" "}
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
      <div style={{ marginTop: "20px" }}>
        <CommonTable
          // scroll={{ x: 2350 }}
          scroll={{
            x: tableColumns.reduce(
              (total, col) => total + (col.width || 150),
              0,
            ),
          }}
          columns={tableColumns}
          dataSource={customersData}
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
        title="Pay Due Amount"
        open={isOpenPaymentDrawer}
        onClose={formReset}
        width="50%"
        style={{ position: "relative", paddingBottom: "65px" }}
        className="customer_statusupdate_drawer"
      >
        {isOpenPaymentDrawer ? (
          <InsertPendingFees
            ref={insertPendingFeesRef}
            selectedCustomerDetails={customerDetails}
            setButtonLoading={setButtonLoading}
            callgetCustomersApi={() => {
              formReset();
              setPagination({
                page: 1,
              });
              getPendingFeesCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                allDownliners,
                pagination.page,
                pagination.limit,
              );
              window.dispatchEvent(new CustomEvent("refreshReceived"));
            }}
          />
        ) : (
          ""
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
                onClick={() =>
                  insertPendingFeesRef.current?.handlePaymentSubmit()
                }
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>
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
                  page_name: "Receivable",
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
      {/* customer details modal */}
      <DraggableStudentModal
        open={isOpenCustomerDetailsModal}
        onClose={() => setIsOpenCustomerDetailsModal(false)}
        customerDetails={customerDetails}
      />
    </div>
  );
}
