import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Drawer, Checkbox } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import CommonTable from "../Common/CommonTable";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  getCurrentandPreviousweekDate,
  formatToBackendIST,
} from "../Common/Validation";
import {
  getFeeHistory,
  getTableColumns,
  updateTableColumns,
  getAllDownlineUsers,
  getCustomerById,
} from "../ApiService/action";
import CommonDnd from "../Common/CommonDnd";
import { useSelector } from "react-redux";
import InsertPendingFees from "../Customers/Pending Fees/InsertPendingFees";
import DraggableStudentModal from "../Common/DraggableStudentModal";

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
  const [selectedDates, setSelectedDates] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  const [regionCounts, setRegionCounts] = useState(null);
  const [isOpenPaymentDrawer, setIsOpenPaymentDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [allDownliners, setAllDownliners] = useState([]);
  const [isOpenCustomerDetailsModal, setIsOpenCustomerDetailsModal] =
    useState(false);

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
      title: "Date of Joining",
      key: "date_of_joining",
      dataIndex: "date_of_joining",
      width: 135,
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
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <EllipsisTooltip text={user_id} />
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
          </div>
        );
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
      title: "Total Collection Days",
      key: "total_days_taken",
      dataIndex: "total_days_taken",
      width: 165,
      fixed: "right",
      sorter: (a, b) =>
        moment(a.total_days_taken).valueOf() -
        moment(b.total_days_taken).valueOf(),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: 140,
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
                size={16}
                style={{ marginTop: "1px" }}
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenPaymentDrawer(true);
                  setCustomerDetails(record);
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
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      const startDate = filterData?.startDate
        ? new Date(filterData.startDate)
        : PreviousAndCurrentDate[0];
      const endDate = filterData?.endDate
        ? new Date(filterData.endDate)
        : PreviousAndCurrentDate[1];
      fetchFeeHistoryData(startDate, endDate, null, downliners_ids, 1, 10);
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
        selectedDates[0],
        selectedDates[1],
        searchValue,
        downliners_ids,
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
          selectedDates[0],
          selectedDates[1],
          searchValue,
          allDownliners,
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
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    const startDate = filterData?.startDate
      ? new Date(filterData.startDate)
      : PreviousAndCurrentDate[0];
    const endDate = filterData?.endDate
      ? new Date(filterData.endDate)
      : PreviousAndCurrentDate[1];
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
      start_date: moment(from_date).format("YYYY-MM-DD"),
      end_date: moment(to_date).format("YYYY-MM-DD"),
      ...(searchvalue && { search_filter: searchvalue }),
      user_ids: downliners,
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
    fetchFeeHistoryData(
      selectedDates[0],
      selectedDates[1],
      e.target.value,
      allDownliners,
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
    setSearchValue("");
    setSelectedUserId([]);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    getAllDownlineUsersData(loginUserId);
  };

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
                          fetchFeeHistoryData(
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
                  fetchFeeHistoryData(
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
          columns={tableColumns}
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
    </div>
  );
}
