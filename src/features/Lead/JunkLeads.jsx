import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Flex,
  Tooltip,
  Radio,
  Button,
  Drawer,
  Badge,
  Modal,
} from "antd";
import { IoFilter } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import {
  deleteJunkLeads,
  getAllDownlineUsers,
  getJunkLeads,
  getLeadAndFollowupCount,
  getLiveLeads,
  moveLiveLeadToJunk,
} from "../ApiService/action";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTable from "../Common/CommonTable";
import { MdOutlineRefresh } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import CommonSpinner from "../Common/CommonSpinner";
import { useSelector } from "react-redux";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import { CommonMessage } from "../Common/CommonMessage";
import moment from "moment";
import CourseCard from "./CourseCard";

export default function JunkLeads({
  setLiveLeadCount,
  setJunkLeadCount,
  setIsJunkPageVisited,
}) {
  //useref
  //useselector
  const tabName = useSelector((state) => state.leadmanageractivepage);
  //usestates
  const [selectedDates, setSelectedDates] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [leadData, setLeadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [callCountApi, setCallCountApi] = useState(true);
  const [allDownliners, setAllDownliners] = useState([]);
  //modal usestates
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  //move modal
  const [isOpenMoveModal, setIsOpenMoveModal] = useState(false);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    { title: "Sl. No", key: "row_num", dataIndex: "row_num", width: 60 },
    {
      title: "Created At",
      key: "created_date",
      dataIndex: "created_date",
      width: 130,
      render: (text) => {
        return <p>{moment(text).format("MM/DD/YYYY")}</p>;
      },
    },
    {
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      width: 200,
      render: (text, record) => {
        return (
          <>
            {text.length > 22 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer", fontSize: "13px" }}>
                  {text.slice(0, 21) + "..."}
                </p>
              </Tooltip>
            ) : (
              <p style={{ fontSize: "13px" }}>{text}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 240,
      render: (text) => {
        return (
          <>
            {text.length > 26 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 25) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    {
      title: "Course",
      key: "course",
      dataIndex: "course",
      width: 200,
      render: (text) => {
        return (
          <>
            {text.length > 22 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 21) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      dataIndex: "location",
      width: 160,
      render: (text) => {
        return (
          <>
            {text && text.length > 20 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 19) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text ? text : "-"}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Training Mode",
      key: "training",
      dataIndex: "training",
      fixed: "right",
      width: 140,
      render: (text) => {
        if (text.includes("Online")) {
          return (
            <div className="livelead_onlinetraining_container">
              <p>Online</p>
            </div>
          );
        } else if (text.includes("Classroom")) {
          return (
            <div className="livelead_classroomtraining_container">
              <p>Classroom</p>
            </div>
          );
        } else {
          return (
            <div className="livelead_corporatetraining_container">
              <p>Corporate</p>
            </div>
          );
        }
      },
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 200,
      render: (text) => {
        return (
          <>
            {text && text.length > 24 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 23) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text ? text : "-"}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Junk Reason",
      key: "junk_reason",
      dataIndex: "junk_reason",
      fixed: "right",
      width: 160,
      render: (text) => {
        if (text) {
          return (
            <>
              {text.length > 20 ? (
                <Tooltip
                  color="#fff"
                  placement="bottom"
                  title={text}
                  className="leadtable_comments_tooltip"
                  styles={{
                    body: {
                      backgroundColor: "#fff", // Tooltip background
                      color: "#333", // Tooltip text color
                      fontWeight: 500,
                      fontSize: "13px",
                    },
                  }}
                >
                  <p style={{ cursor: "pointer" }}>
                    {text.slice(0, 19) + "..."}
                  </p>
                </Tooltip>
              ) : (
                <p>{text}</p>
              )}
            </>
          );
        } else {
          <p>-</p>;
        }
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
            <Tooltip placement="bottom" title="Move to Live Leads">
              <MdOutlineRefresh
                size={20}
                color="#5b69ca"
                className="trainers_action_icons"
                onClick={() => {
                  setLeadId(record.id);
                  setIsOpenMoveModal(true);
                }}
              />
            </Tooltip>
            <Tooltip placement="bottom" title="Delete">
              <RiDeleteBinLine
                color="#d32f2f"
                size={18}
                className="trainers_action_icons"
                onClick={() => {
                  setLeadId(record.id);
                  setIsOpenDeleteModal(true);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setIsJunkPageVisited(true);

    // Initial Call
    getJunkLeadsData(
      null,
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      1,
      10
    );

    setTimeout(() => {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      getAllDownlineUsersData(convertAsJson?.user_id);
    }, 300);
  }, []);

  const getAllDownlineUsersData = async (user_id) => {
    try {
      const response = await getAllDownlineUsers(user_id);
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

  const getJunkLeadsData = async (
    searchvalue,
    startDate,
    endDate,
    pageNumber,
    limit
  ) => {
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
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getJunkLeads(payload);
      console.log("junk lead response", response);
      const paginations = response?.data?.data?.pagination;

      setLeadData(response?.data?.data?.data || []);

      setJunkLeadCount(paginations.total);
      setPagination({
        page: paginations.page,
        limit: paginations.limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
      });
    } catch (error) {
      setLeadData([]);
      console.log("get live lead error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getJunkLeadsData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        1,
        pagination.limit
      );
    }, 300);
  };

  const handlePaginationChange = ({ page, limit }) => {
    getJunkLeadsData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      page,
      limit
    );
  };

  const getLeadAndFollowupCountData = async () => {
    if (callCountApi == false) return;
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    const payload = {
      user_ids: allDownliners,
      start_date: PreviousAndCurrentDate[0],
      end_date: PreviousAndCurrentDate[1],
    };
    try {
      const response = await getLeadAndFollowupCount(payload);
      console.log("lead count response", response);
      const countDetails = response?.data?.data;
      setLiveLeadCount(countDetails.web_lead_count);
    } catch (error) {
      console.log("lead count error", error);
      // dispatch(storeUsersList([]));
    }
  };

  const handleSelectedRow = (row) => {
    console.log("selected rowwww", row);
    setSelectedRows(row);
    const keys = row.map((item) => item.id); // or your unique row key
    setSelectedRowKeys(keys);
  };

  const handleMoveToLiveLead = async () => {
    console.log("selectedRowKeys", selectedRowKeys);
    setButtonLoading(true);
    const payload = {
      lead_ids: selectedRows.length >= 1 ? selectedRowKeys : [leadId],
      is_junk: false,
    };
    try {
      await moveLiveLeadToJunk(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        setButtonLoading(false);
        setIsOpenMoveModal(false);
        setLeadId(null);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        setPagination({
          page: 1,
        });
        getJunkLeadsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          1,
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
    } finally {
      setTimeout(() => {
        getLeadAndFollowupCountData();
      });
    }
  };

  const handleDelete = async () => {
    console.log("selectedRowKeys", selectedRowKeys);
    setButtonLoading(true);
    const payload = {
      lead_ids: selectedRows.length >= 1 ? selectedRowKeys : [leadId],
    };
    try {
      await deleteJunkLeads(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        setButtonLoading(false);
        setIsOpenDeleteModal(false);
        setLeadId(null);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        setPagination({
          page: 1,
        });
        getJunkLeadsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          1,
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
  };
  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={7}>
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
                          setLoading(true);
                          setPagination({
                            page: 1,
                          });
                          getJunkLeadsData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
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
                            if (searchValue == "") {
                              return;
                            } else {
                              setSearchValue("");
                              setPagination({
                                page: 1,
                              });
                              getJunkLeadsData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
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
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setLoading(true);
                  setPagination({
                    page: 1,
                  });
                  getJunkLeadsData(
                    searchValue,
                    dates[0],
                    dates[1],
                    1,
                    pagination.limit
                  );
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={7}>
          {selectedRows.length >= 1 && (
            <div className="livelead_junkbutton_container">
              <Button
                className="junklead_movetolivebutton"
                onClick={() => {
                  setIsOpenMoveModal(true);
                }}
              >
                Move to Live Lead
              </Button>
              <Button
                className="livelead_junkbutton"
                onClick={() => {
                  setIsOpenDeleteModal(true);
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1200 }}
          columns={columns}
          dataSource={leadData}
          dataPerPage={10}
          loading={loading}
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

      {/* move to live lead modal */}
      <Modal
        open={isOpenMoveModal}
        onCancel={() => {
          setIsOpenMoveModal(false);
        }}
        footer={false}
        closable={false}
        width={420}
      >
        <div className="junklead_movemodalContainer">
          <div className="junklead_movemodal_iconContainer">
            <MdOutlineRefresh size={21} color="#5b69ca" />
          </div>

          <p className="common_deletemodal_confirmdeletetext">
            Move to Live Lead
          </p>

          <p className="common_deletemodal_text">
            Are you sure want to move the Leads to Live Leads?
          </p>

          <div className="common_deletemodal_footerContainer">
            <Button
              className="common_deletemodal_cancelbutton"
              onClick={() => {
                setIsOpenMoveModal(false);
              }}
            >
              No
            </Button>
            {buttonLoading ? (
              <Button
                className="common_deletemodal_loading_deletebutton"
                type="primary"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                className="common_deletemodal_deletebutton"
                onClick={handleMoveToLiveLead}
                type="primary"
              >
                Yes
              </Button>
            )}
          </div>
        </div>
      </Modal>
      {/* delete modal */}
      <CommonDeleteModal
        open={isOpenDeleteModal}
        onCancel={() => {
          setIsOpenDeleteModal(false);
          setLeadId(null);
        }}
        content="Are you sure want to delete the Lead?"
        loading={buttonLoading}
        onClick={handleDelete}
      />
    </div>
  );
}
