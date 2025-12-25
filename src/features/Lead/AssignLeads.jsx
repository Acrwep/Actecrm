import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Flex,
  Tooltip,
  Radio,
  Button,
  Badge,
  Drawer,
  Modal,
} from "antd";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { GiCardPickup } from "react-icons/gi";
import { MdOutlinePlaylistRemove } from "react-icons/md";
import { MdOutlineRefresh } from "react-icons/md";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import {
  assignLiveLead,
  getAllDownlineUsers,
  getLeadAndFollowupCount,
  getManualAssignLeads,
  liveLeadManualAssign,
  moveLiveLeadToJunk,
} from "../ApiService/action";
import {
  addressValidator,
  getCurrentandPreviousweekDate,
} from "../Common/Validation";
import CommonTable from "../Common/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import AddLead from "./AddLead";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import CommonTextArea from "../Common/CommonTextArea";
import moment from "moment";

export default function AssignLeads({
  leadTypeOptions,
  regionOptions,
  refreshLeadFollowUp,
  refreshLeads,
  refreshJunkLeads,
  setAssignLeadCount,
}) {
  const dispatch = useDispatch();
  //useref
  const addLeaduseRef = useRef();

  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  //usestates
  const [filterType, setFilterType] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [leadData, setLeadData] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  //pick lead drawer
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [pickLeadItem, setPickLeadItem] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [allDownliners, setAllDownliners] = useState([]);
  //junk usestates
  const [isOpenJunkModal, setIsOpenJunkModal] = useState(false);
  const [junkComments, setJunkComments] = useState("");
  const [junkCommentsError, setJunkCommentsError] = useState("");
  const [liveLeadId, setLiveLeadId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  //move modal
  const [leadId, setLeadId] = useState(null);
  const [isOpenMoveModal, setIsOpenMoveModal] = useState(false);
  //loading
  const [loading, setLoading] = useState(true);
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
      title: "Assined At",
      key: "assigned_date_ist",
      dataIndex: "assigned_date_ist",
      width: 100,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Assin By",
      key: "assigned_by_user",
      dataIndex: "assigned_by_user",
      width: 130,
      render: (text, record) => {
        return (
          <div>
            <p> {`${record.assigned_by} - ${text}`}</p>
          </div>
        );
      },
    },
    {
      title: "Assin To",
      key: "assigned_to_user",
      dataIndex: "assigned_to_user",
      width: 130,
      render: (text, record) => {
        return (
          <div>
            <p> {`${record.assigned_to} - ${text}`}</p>
          </div>
        );
      },
    },
    {
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      width: 200,
      render: (text, record) => {
        return (
          <Badge
            size="small"
            count={
              record.lead_type == "New" || record.lead_type == null
                ? "New"
                : "Existing"
            }
            offset={
              record.lead_type == "New" || record.lead_type == null
                ? [22, 0]
                : [30, 0]
            }
            color={
              record.lead_type == "New" || record.lead_type == null
                ? "#1e90ff"
                : "#d32f2f"
            }
            style={{ fontSize: "10px" }}
          >
            {text.length > 16 ? (
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
                  {text.slice(0, 15) + "..."}
                </p>
              </Tooltip>
            ) : (
              <p style={{ fontSize: "13px" }}>{text}</p>
            )}
          </Badge>
        );
      },
    },
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
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
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
      title: "Origin",
      key: "domain_origin",
      dataIndex: "domain_origin",
      width: 90,
      hidden: permissions.includes("Show Origin in Live Leads") ? false : true,
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
      width: 220,
      render: (text) => {
        return (
          <>
            {text && text.length > 26 ? (
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
              <p>{text ? text : "-"}</p>
            )}
          </>
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
            <Tooltip placement="bottom" title="Pick">
              <GiCardPickup
                size={22}
                color="#5b69ca"
                className="trainers_action_icons"
                onClick={() => {
                  handlePick(record);
                }}
              />
            </Tooltip>
            <Tooltip placement="bottom" title="Move to Junk">
              <MdOutlinePlaylistRemove
                color="#d32f2f"
                size={20}
                className="trainers_action_icons"
                onClick={() => {
                  setLiveLeadId(record.id);
                  setIsOpenJunkModal(true);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (permissions.length >= 1) {
      getAllDownlineUsersData();
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setSelectedDates(PreviousAndCurrentDate);
    }
  }, [permissions]);

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
      getManualAssignLeadsData(
        null,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        1,
        10
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getManualAssignLeadsData = async (
    searchvalue,
    startDate,
    endDate,
    pageNumber,
    limit
  ) => {
    setLoading(true);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

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
      user_id: convertAsJson?.user_id,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getManualAssignLeads(payload);
      console.log("get manual assign leads response", response);
      const data = response?.data?.data?.data || [];
      const pagination = response?.data?.data?.pagination;
      setLeadData(data);
      setAssignLeadCount(pagination.total);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
    } catch (error) {
      setLeadData([]);
      console.log("get manual assign leads error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handlePick = async (item) => {
    console.log("itemmmm", item);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    setPickLeadItem({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      location: item.location ? item.location : "",
      course: item.course ? item.course : "",
      training: item.training ? item.training : "",
      comments: item.comments ? item.comments : "",
      is_assign_lead: true,
    });
    setIsOpenAddDrawer(true);
  };

  const handleMoveToJunk = async () => {
    console.log("selectedRowKeys", selectedRowKeys);
    const commentsValidate = addressValidator(junkComments);

    setJunkCommentsError(commentsValidate);

    if (commentsValidate) return;

    setButtonLoading(true);
    const payload = {
      lead_ids: selectedRows.length >= 1 ? selectedRowKeys : [liveLeadId],
      is_junk: true,
      reason: junkComments,
    };
    try {
      await moveLiveLeadToJunk(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        setButtonLoading(false);
        setIsOpenJunkModal(false);
        setLiveLeadId(null);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        setJunkComments("");
        getLiveLeadsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          pagination.page,
          pagination.limit
        );
        refreshJunkLeads();
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

  const handleMoveToLiveLead = async () => {
    console.log("selectedRowKeys", selectedRowKeys);
    setButtonLoading(true);
    const payload = {
      lead_ids: selectedRows.length >= 1 ? selectedRowKeys : [leadId],
      is_assigned: false,
    };
    try {
      await liveLeadManualAssign(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        setButtonLoading(false);
        setIsOpenMoveModal(false);
        setLeadId(null);
        setSelectedRows([]);
        setSelectedRowKeys([]);
        getManualAssignLeadsData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
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
  };

  const handlePaginationChange = ({ page, limit }) => {
    getManualAssignLeadsData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      page,
      limit
    );
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getManualAssignLeadsData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        1,
        pagination.limit
      );
    }, 300);
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
                          setPagination({
                            page: 1,
                          });
                          getManualAssignLeadsData(
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
                              getManualAssignLeadsData(
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
                  setPagination({
                    page: 1,
                  });
                  getManualAssignLeadsData(
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
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
            }}
          ></div>
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1300 }}
          columns={columns}
          dataSource={leadData}
          dataPerPage={10}
          checkBox="true"
          loading={loading}
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>

      {/* add lead drawer */}
      <Drawer
        title="Add Lead"
        open={isOpenAddDrawer}
        onClose={async () => {
          setIsOpenAddDrawer(false);
          setPickLeadItem(null);
        }}
        width="52%"
        style={{ position: "relative" }}
        id="leadform_addlead_drawer"
      >
        <AddLead
          ref={addLeaduseRef}
          key={pickLeadItem}
          leadTypeOptions={leadTypeOptions}
          regionOptions={regionOptions}
          updateLeadItem={null}
          setSaveOnlyLoading={setButtonLoading}
          setButtonLoading={setButtonLoading}
          setIsOpenAddDrawer={setIsOpenAddDrawer}
          liveLeadItem={pickLeadItem}
          callgetLeadsApi={(is_refreshjunk) => {
            console.log("is_refreshjunk", is_refreshjunk);
            if (is_refreshjunk == true) {
              setPickLeadItem(null);
              refreshJunkLeads();
              return;
            }
            setPickLeadItem(null);
            getManualAssignLeadsData(
              searchValue,
              selectedDates[0],
              selectedDates[1],
              pagination.page,
              pagination.limit
            );
            refreshLeadFollowUp();
            refreshLeads();
          }}
        />

        <div className="leadmanager_submitlead_buttoncontainer">
          <div style={{ display: "flex", gap: "12px" }}>
            <>
              {buttonLoading ? (
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
                  Submit
                </button>
              )}
            </>
          </div>
        </div>
      </Drawer>

      <Modal
        title="Move to Junk"
        open={isOpenJunkModal}
        onCancel={() => {
          setIsOpenJunkModal(false);
          setLiveLeadId(null);
          setJunkComments("");
          setJunkCommentsError("");
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

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              style={{ width: "120px", opacity: 0.7 }}
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleMoveToJunk}
              style={{ width: "120px" }}
            >
              Move to Junk
            </Button>
          ),
        ]}
      >
        <div style={{ marginBottom: "20px" }}>
          <CommonTextArea
            label="Comments"
            required={false}
            onChange={(e) => {
              setJunkComments(e.target.value);
              setJunkCommentsError(addressValidator(e.target.value));
            }}
            value={junkComments}
            error={junkCommentsError}
          />
        </div>
      </Modal>

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
    </div>
  );
}
