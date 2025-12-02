import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Flex, Radio, Button, Drawer, Divider } from "antd";
import { useSelector } from "react-redux";
import {
  getAllDownlineUsers,
  getCNAFolloups,
  addQualityComments,
  updateQualityComments,
} from "../ApiService/action";
import {
  getCurrentandPreviousweekDate,
  selectValidator,
  addressValidator,
  formatToBackendIST,
} from "../Common/Validation";
import { IoIosClose } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonTable from "../Common/CommonTable";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTextArea from "../Common/CommonTextArea";
import CommonSpinner from "../Common/CommonSpinner";
import CommonAvatar from "../Common/CommonAvatar";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import { CommonMessage } from "../Common/CommonMessage";

export default function CNAFollowup({ refreshLeadFollowUp, refreshLeads }) {
  const mounted = useRef(false);

  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [filterType, setFilterType] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [followUpData, setFollowUpData] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  const [loading, setLoading] = useState(true);
  //drawer usestates
  const [isOpenFollowUpDrawer, setIsOpenFollowUpDrawer] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);
  const [commentsHistory, setCommentsHistory] = useState([]);
  const [qualityHistoryId, setQualityHistoryId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newCommentError, setNewCommentError] = useState("");
  const [qualityStatus, setQualityStatus] = useState(null);
  const [qualityStatusError, setQualityStatusError] = useState(null);
  const [cnaDate, setCnaDate] = useState(null);
  const [cnaDateError, setCnaDateError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  //lead executive usestates
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allDownliners, setAllDownliners] = useState([]);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const nonChangeColumns = [
    {
      title: "Lead Executive",
      key: "lead_assigned_to_name",
      dataIndex: "lead_assigned_to_name",
      width: 160,
      render: (text, record) => {
        return (
          <div>
            <p> {`${record.lead_assigned_to_id} - ${text}`}</p>
          </div>
        );
      },
    },
    {
      title: "CNA Date",
      key: "cna_date",
      dataIndex: "cna_date",
      width: 160,
      render: (text, record, index) => {
        return (
          <div
            className="leadfollowup_tabledateContainer"
            onClick={() => {
              console.log("recordddd", record);
              setIsOpenFollowUpDrawer(true);
              setLeadId(record.id);
              setQualityHistoryId(record.quality_id);
              setLeadDetails(record);
              setCurrentIndex(index);
              const merged = [
                ...record.histories.map((item) => ({
                  ...item,
                  date: item.updated_date,
                })),
                ...record.quality_history.map((item) => ({
                  ...item,
                  date: item.created_date,
                })),
              ];

              // Sort latest first
              merged.sort((a, b) => new Date(b.date) - new Date(a.date));

              console.log(merged);
              setCommentsHistory(merged);
            }}
          >
            <p>{moment(text).format("DD/MM/YYYY")}</p>
            <div className="leadfollowup_tablecommentContainer">
              <p>{record.histories.length + record.quality_history.length}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Candidate Name",
      key: "candidate_name",
      dataIndex: "candidate_name",
      width: 180,
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 200,
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 130 },
    {
      title: "Course",
      key: "primary_course",
      dataIndex: "primary_course",
      width: 180,
    },
    {
      title: "Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      width: 120,
      render: (text, record) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Lead Priority",
      key: "lead_status",
      dataIndex: "lead_status",
      fixed: "right",
      width: 140,
      render: (text) => {
        return (
          <div
            className={
              text == "High"
                ? "leadmanager_leadstatus_high_container"
                : text == "Medium"
                ? "leadmanager_leadstatus_medium_container"
                : "leadmanager_leadstatus_low_container"
            }
          >
            <p>{text}</p>
          </div>
        );
      },
    },
    {
      title: "Recent Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 200,
      render: (text) => {
        if (text) {
          return (
            <>
              {text.length > 25 ? (
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
                    {text.slice(0, 24) + "..."}
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
  ];

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    if (childUsers.length > 0 && !mounted.current) {
      setSubUsers(downlineUsers);
      mounted.current = true;
      setLoginUserId(convertAsJson?.user_id);
      getAllDownlineUsersData(convertAsJson?.user_id);
    }
  }, [childUsers, permissions]);

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
      getFollowupData(
        null,
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        false,
        downliners_ids,
        1,
        10
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getFollowupData = async (
    searchvalue,
    startDate,
    endDate,
    updateStatus,
    downliners,
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
      from_date: startDate,
      to_date: endDate,
      user_ids: downliners,
      page: pageNumber,
      limit: limit,
    };

    try {
      const response = await getCNAFolloups(payload);
      console.log("cna response", response);
      const followup_data = response?.data?.data?.data || [];
      const pagination = response?.data?.data?.pagination;

      setFollowUpData(followup_data);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
      if (updateStatus === true) {
        const record = followup_data[currentIndex];
        if (!record) {
          setIsOpenFollowUpDrawer(false);
          return;
        }

        setCurrentIndex(currentIndex);
        setLeadDetails(record);
        const merged = [
          ...record.histories.map((item) => ({
            ...item,
            date: item.updated_date,
          })),
          ...record.quality_history.map((item) => ({
            ...item,
            date: item.created_date,
          })),
        ];

        // Sort latest first
        merged.sort((a, b) => new Date(b.date) - new Date(a.date));

        setCommentsHistory(merged);
        setLeadId(record.id);
        setQualityHistoryId(record.quality_id);
      }
    } catch (error) {
      setFollowUpData([]);
      setLoading(false);
      console.log("cna followup error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    getFollowupData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      false,
      allDownliners,
      page,
      limit
    );
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setPagination({
      page: 1,
    });
    setTimeout(() => {
      getFollowupData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        false,
        allDownliners,
        1,
        pagination.limit
      );
    }, 300);
  };

  const handleSelectUser = async (e) => {
    const value = e.target.value;
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
      getFollowupData(
        null,
        selectedDates[0],
        selectedDates[1],
        false,
        downliners_ids,
        1,
        10
      );
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const updateDetailsByIndex = (index) => {
    const record = followUpData[index];
    if (!record) return;

    setCurrentIndex(index);
    setLeadDetails(record);
    setCommentsHistory(record.histories);
    setLeadId(record.id);
    setQualityHistoryId(record.quality_id);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      updateDetailsByIndex(currentIndex - 1);
      setTimeout(() => {
        const container = document.getElementById(
          "leadfollowup_leaddetails_heading"
        );
        container.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleNext = () => {
    if (currentIndex < followUpData.length - 1) {
      updateDetailsByIndex(currentIndex + 1);
      setTimeout(() => {
        const container = document.getElementById(
          "leadfollowup_leaddetails_heading"
        );
        container.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleUpdateFollowUp = async () => {
    const commentValidate = addressValidator(newComment);
    const statusValidate = selectValidator(qualityStatus);
    let dateValidate;

    if (qualityStatus == 3) {
      dateValidate = selectValidator(cnaDate);
    }

    setNewCommentError(commentValidate);
    setQualityStatusError(statusValidate);
    setCnaDateError(dateValidate);

    if (commentValidate || statusValidate || dateValidate) return;

    setButtonLoading(true);

    const today = new Date();
    const payload = {
      id: qualityHistoryId,
      lead_id: leadId,
      comments: newComment,
      status: qualityStatus,
      cna_date: cnaDate ? formatToBackendIST(cnaDate) : null,
      updated_by: loginUserId,
      updated_date: formatToBackendIST(today),
    };

    try {
      await addQualityComments(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        setPagination({
          page: 1,
        });
        setButtonLoading(false);
        getFollowupData(
          searchValue,
          selectedDates[0],
          selectedDates[1],
          true,
          allDownliners,
          1,
          pagination.limit
        );
        refreshLeadFollowUp();
        refreshLeads();
        setNewComment("");
        setNewCommentError("");
        setQualityStatus(null);
        setQualityStatusError("");
        setCnaDate(null);
        setCnaDateError("");
        setButtonLoading(false);
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      console.log("update follow up error");
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const formReset = () => {
    setButtonLoading(false);
    setIsOpenFollowUpDrawer(false);
    setNewComment("");
    setNewCommentError("");
    setQualityStatus(null);
    setQualityStatusError("");
    setCnaDate(null);
    setCnaDateError("");
    setCommentsHistory([]);
    setQualityHistoryId(null);
    setLeadId(null);
    setLeadDetails(null);
    setCurrentIndex(null);
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
                          getFollowupData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
                            false,
                            allDownliners,
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
                              getFollowupData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
                                false,
                                allDownliners,
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
              <Col span={7}>
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
                    />
                  </div>
                </div>
              </Col>
            )}
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getFollowupData(
                    searchValue,
                    dates[0],
                    dates[1],
                    false,
                    allDownliners,
                    1,
                    pagination.limit
                  );
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <div style={{ marginTop: "20px" }}>
        <CommonTable
          // scroll={{ x: 1250 }}
          scroll={{
            x: nonChangeColumns.reduce(
              (total, col) => total + (col.width || 150),
              0
            ),
          }}
          columns={nonChangeColumns}
          dataSource={followUpData}
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
        title="CNA Follow-Up"
        open={isOpenFollowUpDrawer}
        onClose={formReset}
        width="52%"
        style={{ position: "relative", paddingBottom: "65px" }}
        className="customer_statusupdate_drawer"
      >
        <p
          className="leadfollowup_leaddetails_heading"
          id="leadfollowup_leaddetails_heading"
        >
          Lead Details
        </p>
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
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.candidate_name
                    ? leadDetails.candidate_name
                    : "-"}
                </p>
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
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.email ? leadDetails.email : "-"}
                </p>
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
                  {leadDetails && leadDetails.phone ? leadDetails.phone : "-"}
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
                  {leadDetails && leadDetails.whatsapp
                    ? leadDetails.whatsapp
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
                  {leadDetails && leadDetails.area_id
                    ? leadDetails.area_id
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <MdOutlineDateRange size={15} color="gray" />
                  <p className="customerdetails_rowheading">Next Followup</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.next_follow_up_date
                    ? moment(leadDetails.next_follow_up_date).format(
                        "DD/MM/YYYY"
                      )
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
                <p className="customerdetails_text">
                  {leadDetails && leadDetails.primary_course
                    ? leadDetails.primary_course
                    : "-"}
                </p>
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
                  {leadDetails && leadDetails.primary_fees
                    ? "₹" + leadDetails.primary_fees
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
                  {leadDetails && leadDetails.branche_name
                    ? leadDetails.branche_name
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
                  {leadDetails && leadDetails.batch_track
                    ? leadDetails.batch_track
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
                  {leadDetails && leadDetails.lead_status
                    ? leadDetails.lead_status
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
                    leadDetails && leadDetails.lead_assigned_to_id
                      ? leadDetails.lead_assigned_to_id
                      : "-"
                  } (${
                    leadDetails && leadDetails.lead_assigned_to_name
                      ? leadDetails.lead_assigned_to_name
                      : "-"
                  })`}
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider className="customer_statusupdate_divider" />
        <div className="customer_statusupdate_adddetailsContainer">
          <p className="customer_statusupdate_adddetails_heading">
            Follow-Up History
          </p>

          {commentsHistory.length >= 1 ? (
            <div className="leadmanager_comments_maincontainer">
              {commentsHistory.map((item) => {
                return (
                  <>
                    <div className="leadmanager_comments_namecontainer">
                      <CommonAvatar itemName={item.user_name} avatarSize={32} />
                      <p className="leadfollowup_comment_username">
                        {item.user_name
                          ? `${item.updated_by} - ${item.user_name}`
                          : "-"}
                        <span className="leadfollowup_comment_time">
                          {item.updated_date
                            ? moment(item.updated_date).format(
                                "YYYY-MM-DD hh:mm:ss A"
                              )
                            : item.created_date
                            ? moment(item.created_date).format(
                                "YYYY-MM-DD hh:mm:ss A"
                              )
                            : "-"}
                        </span>
                      </p>
                    </div>
                    <p className="leadfollowup_comments_text">
                      {item.comments}
                    </p>

                    {item.status && (
                      <p className="leadfollowup_qualitystatus_text">
                        <span style={{ fontWeight: 600, color: "gray" }}>
                          Status:
                        </span>{" "}
                        {item.status == 1
                          ? "Details Shared"
                          : item.status == 2
                          ? "Details Not Shared"
                          : "CNA"}
                      </p>
                    )}
                  </>
                );
              })}
            </div>
          ) : (
            <p className="leadfollowup_comment_nodatafound">
              No comments found
            </p>
          )}
        </div>{" "}
        <Divider className="customer_statusupdate_divider" />
        <div className="customer_statusupdate_adddetailsContainer">
          <p className="customer_statusupdate_adddetails_heading">
            Update Follow-Up
          </p>
          <Row style={{ marginTop: "10px" }}>
            <Col span={24}>
              <CommonTextArea
                label="Comments"
                required={true}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  setNewCommentError(addressValidator(e.target.value));
                }}
                value={newComment}
                error={newCommentError}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
            <Col span={9}>
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
        </div>
        <div
          className="leadmanager_tablefiler_footer"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div className="leadfollowup_prev_next_container">
            <Button
              className="leadfollowup_prev_next_button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              className="leadfollowup_prev_next_button"
              onClick={handleNext}
              disabled={currentIndex === followUpData.length - 1}
            >
              Next
            </Button>
          </div>
          <div className="leadmanager_submitlead_buttoncontainer">
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={handleUpdateFollowUp}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
