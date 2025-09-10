import React, { useState, useRef, useEffect } from "react";
import CommonTable from "../Common/CommonTable";
import { Row, Col, Drawer, Rate, Input, Modal } from "antd";
import { FiFilter } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import CommonDnd from "../Common/CommonDnd";
import { IoIosClose } from "react-icons/io";
import { getLeadFollowUps, updateFollowUp } from "../ApiService/action";
import { IoMdSend } from "react-icons/io";
import moment from "moment";
import CommonDatePicker from "../Common/CommonDatePicker";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
  shortRelativeTime,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";

const { TextArea } = Input;

export default function LeadFollowUp({ setFollowupCount }) {
  const chatBoxRef = useRef();
  const dateFilterOptions = [
    { id: "Today", name: "Today" },
    { id: "Carry Over", name: "Carry Over" },
  ];
  const [dateFilter, setDateFilter] = useState("Today");
  const [followUpData, setFollowUpData] = useState([]);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [isOpenCommentModal, setIsOpenCommentModal] = useState(false);
  const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
  const [nxtFollowupDateError, setNxtFollowupDateError] = useState(null);
  const actionOptions = [
    { id: 1, name: "Followup" },
    { id: 2, name: "Junk" },
  ];
  const [actionId, setActionId] = useState(null);
  const [actionIdError, setActionIdError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newCommentError, setNewCommentError] = useState("");
  const [commentsHistory, setCommentsHistory] = useState([]);
  const [leadHistoryId, setLeadHistoryId] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [defaultColumns, setDefaultColumns] = useState([
    { title: "Lead Owner", isChecked: true },
    { title: "Next Follow Up", isChecked: true },
    { title: "Candidate Name", isChecked: true },
    { title: "Mobile", isChecked: true },
    { title: "Course ", isChecked: true },
    { title: "Course Fees ", isChecked: true },
    { title: "Last Update ", isChecked: true },
    { title: "Recent Comments", isChecked: true },
  ]);

  const [columns, setColumns] = useState([
    { title: "Lead Owner", key: "user_name", dataIndex: "user_name" },
    {
      title: "Next Follow Up",
      key: "next_follow_up_date",
      dataIndex: "next_follow_up_date",
      render: (text, record) => {
        return (
          <div
            className="leadfollowup_tabledateContainer"
            onClick={() => {
              setIsOpenCommentModal(true);
              setCommentsHistory(record.histories);
              setLeadId(record.id);
              setLeadHistoryId(record.lead_history_id);
            }}
          >
            <p>{moment(text).format("DD/MM/YYYY")}</p>
            <div className="leadfollowup_tablecommentContainer">
              <p>{record.histories.length}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Candidate Name",
      key: "candidate_name",
      dataIndex: "candidate_name",
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 120 },
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
    },
    {
      title: "Recent Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 200,
    },
  ]);

  const nonChangeColumns = [
    { title: "Lead Owner", key: "user_name", dataIndex: "user_name" },
    {
      title: "Next Follow Up",
      key: "next_follow_up_date",
      dataIndex: "next_follow_up_date",
      render: (text, record) => {
        return (
          <div
            className="leadfollowup_tabledateContainer"
            onClick={() => {
              setIsOpenCommentModal(true);
              setCommentsHistory(record.histories);
              setLeadId(record.id);
              setLeadHistoryId(record.lead_history_id);
            }}
          >
            <p>{moment(text).format("DD/MM/YYYY")}</p>
            <div className="leadfollowup_tablecommentContainer">
              <p>{record.histories.length}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Candidate Name",
      key: "candidate_name",
      dataIndex: "candidate_name",
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 120 },
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
    },
    {
      title: "Recent Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 200,
    },
  ];

  const messages = [
    { id: 1, text: "Hey there!", type: "receiver" },
    { id: 2, text: "Hello! How are you?", type: "sender" },
    { id: 3, text: "I’m doing well, thanks!", type: "receiver" },
    { id: 4, text: "Glad to hear!", type: "sender" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target)) {
        setIsOpenChat(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    getLeadFollowUpsData("Today");
  }, []);

  const getLeadFollowUpsData = async (dateType) => {
    setLoading(true);
    const payload = {
      date_type: dateType,
    };
    try {
      const response = await getLeadFollowUps(payload);
      console.log("follow up response", response);
      setFollowUpData(response?.data?.data || []);
      setFollowupCount(response?.data?.data.length || 0);
    } catch (error) {
      setFollowUpData([]);
      setFollowupCount(0);
      console.log("get followup error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const formReset = () => {
    setIsOpenFilterDrawer(false);
    setIsOpenCommentModal(false);
    setButtonLoading(false);
    setActionId(null);
    setActionIdError("");
    setNxtFollowupDate(null);
    setNxtFollowupDateError("");
    setNewComment("");
    setNewCommentError("");
    setCommentsHistory([]);
    setLeadHistoryId(null);
    setLeadId(null);
  };

  const handleUpdateFollowUp = async () => {
    const actionValidate = selectValidator(actionId);
    const nxtFollowdateValidate = selectValidator(nxtFollowupDate);
    const commentValidate = addressValidator(newComment);

    setActionIdError(actionValidate);
    setNxtFollowupDateError(nxtFollowdateValidate);
    setNewCommentError(commentValidate);

    if (actionValidate || nxtFollowdateValidate || commentValidate) return;

    setButtonLoading(true);
    const today = new Date();

    const payload = {
      lead_history_id: leadHistoryId,
      comments: newComment,
      next_follow_up_date: formatToBackendIST(nxtFollowupDate),
      lead_status_id: actionId,
      lead_id: leadId,
      updated_date: formatToBackendIST(today),
    };

    try {
      await updateFollowUp(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        getLeadFollowUpsData(dateFilter);
        formReset();
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

  return (
    <div style={{ position: "relative" }}>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="leadmanager_filterContainer">
            <CommonOutlinedInput
              label="Search"
              width="36%"
              height="33px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
            />
            <CommonSelectField
              label="Select"
              height="35px"
              style={{ width: "36%" }}
              labelFontSize="12px"
              options={dateFilterOptions}
              value={dateFilter}
              labelMarginTop="-1px"
              valueMarginTop="-6px"
              downArrowIconTop="43%"
              fontSize="13px"
              onChange={(e) => {
                console.log(e.target.value);
                setDateFilter(e.target.value);
                getLeadFollowUpsData(e.target.value);
              }}
            />
          </div>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ marginLeft: "12px", cursor: "pointer" }}
            onClick={() => setIsOpenFilterDrawer(true)}
          />
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1100 }}
          columns={columns}
          dataSource={followUpData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>

      {/* table filter drawer */}

      <Drawer
        title="Manage Table"
        open={isOpenFilterDrawer}
        onClose={formReset}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative" }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd
                data={defaultColumns}
                setDefaultColumns={setDefaultColumns}
              />
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={() => {
                const reorderedColumns = defaultColumns
                  .filter((item) => item.isChecked) // only include checked items
                  .map((defaultItem) =>
                    nonChangeColumns.find(
                      (col) => col.title.trim() === defaultItem.title.trim()
                    )
                  )
                  .filter(Boolean); // remove unmatched/null entries

                console.log("Reordered Columns:", reorderedColumns);

                setColumns(reorderedColumns);
                setIsOpenFilterDrawer(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Drawer>

      <Modal
        title="Update Followup"
        open={isOpenCommentModal}
        onCancel={formReset}
        footer={false}
        width="35%"
        className="leadfollowup_actionmodal"
      >
        <div className="leadfollowup_actionfield_mainContainer">
          <Row gutter={12} className="leadfollowup_actionfield_rowdiv">
            <Col span={12}>
              <CommonSelectField
                label="Action"
                options={actionOptions}
                height="34px"
                labelMarginTop="-2px"
                value={actionId}
                onChange={(e) => {
                  setActionId(e.target.value);
                  setActionIdError(selectValidator(e.target.value));
                }}
                error={actionIdError}
              />
            </Col>
            <Col span={12}>
              <CommonDatePicker
                placeholder="Next Followup Date"
                height="35px"
                onChange={(value) => {
                  setNxtFollowupDate(value);
                  setNxtFollowupDateError(selectValidator(value));
                }}
                value={nxtFollowupDate}
                error={nxtFollowupDateError}
                disablePreviousDates={true}
              />
            </Col>
          </Row>

          <p className="leadmanager_commentbox_heading">Comments</p>
          {commentsHistory.length >= 1 ? (
            <>
              {commentsHistory.map((item) => {
                return (
                  <>
                    <div className="leadmanager_comments_namecontainer">
                      <div className="leadfollowup_chatbox_initialContainer">
                        <p>BA</p>
                      </div>
                      <p className="leadfollowup_comment_username">
                        Balaji{" "}
                        <span className="leadfollowup_comment_time">
                          {shortRelativeTime(item.updated_date)}
                        </span>
                      </p>
                    </div>
                    <p className="leadfollowup_comments_text">
                      {item.comments}
                    </p>
                  </>
                );
              })}
            </>
          ) : (
            <p className="leadfollowup_comment_nodatafound">
              No comments found
            </p>
          )}

          <div style={{ position: "relative" }}>
            <TextArea
              placeholder="Add Comment..."
              className="leadmanager_commentbox_input"
              onChange={(e) => {
                setNewComment(e.target.value);
                setNewCommentError(addressValidator(e.target.value));
              }}
              value={newComment}
            />
            {buttonLoading ? (
              <div
                className="leadmanager_comment_senddiv"
                style={{ opacity: 0.7 }}
              >
                <IoMdSend size={18} />
              </div>
            ) : (
              <div
                className="leadmanager_comment_senddiv"
                onClick={handleUpdateFollowUp}
              >
                <IoMdSend size={18} />
              </div>
            )}
          </div>

          {newCommentError && (
            <p className="leadfollowup_newcommenterror">
              {"Comments" + newCommentError}
            </p>
          )}
        </div>
      </Modal>

      <div
        className="leadfollowup_chatbox_container"
        style={{ display: isOpenChat ? "block" : "none" }}
        ref={chatBoxRef}
      >
        <div className="leadfollowup_chatbox_headercontainer">
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className="leadfollowup_chatbox_initialContainer">
              <p>BA</p>
            </div>
            <p className="leadfollowup_chatbox_username">Balaji</p>
          </div>

          <div
            className="leadfollowup_chatbox_header_closediv"
            onClick={() => setIsOpenChat(false)}
          >
            <IoIosClose size={16} />{" "}
          </div>
        </div>

        <div className="chat-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${
                msg.type === "sender" ? "sender-row" : "receiver-row"
              }`}
            >
              {msg.type === "receiver" ? (
                <div className={"chat_receiver_usernamediv"}>
                  <p className="username">BA</p>
                </div>
              ) : (
                ""
              )}
              <div
                className={`message ${
                  msg.type === "sender" ? "sender" : "receiver"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
