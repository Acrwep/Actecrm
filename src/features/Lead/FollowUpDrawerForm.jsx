import React, { useState } from "react";
import { Drawer, Row, Col, Rate, Divider, Checkbox, Button } from "antd";
import moment from "moment";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail, MdOutlineDateRange } from "react-icons/md";
import { IoCallOutline, IoLocationOutline } from "react-icons/io5";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonAvatar from "../Common/CommonAvatar";
import CommonSelectField from "../Common/CommonSelectField";
import CommonNxtFollowupDatePicker from "../Common/CommonNxtFollowupDatePicker";
import CommonMuiDateTimePicker from "../Common/CommonMuiDateTimePicker";
import CommonTextArea from "../Common/CommonTextArea";
import CommonSpinner from "../Common/CommonSpinner";
import {
  selectValidator,
  addressValidator,
  formatToBackendIST,
} from "../Common/Validation";
import { updateFollowUp } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";

export default function FollowUpDrawerForm({
  isOpen,
  onClose,
  leadDetails,
  commentsHistory = [],
  leadId,
  leadHistoryId,
  onUpdateSuccess,
  handlePrevious,
  handleNext,
  currentIndex,
  totalItems,
}) {
  const [communicationStatus, setCommunicationStatus] = useState(null);
  const [communicationStatusError, setCommunicationStatusError] = useState("");
  const [contactMode, setContactMode] = useState(null);
  const [contactModeError, setContactModeError] = useState("");
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseStatusError, setResponseStatusError] = useState(null);
  const [followupType, setFollowupType] = useState(null);
  const [followupTypeError, setFollowupTypeError] = useState("");
  const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
  const [nxtFollowupDateError, setNxtFollowupDateError] = useState("");
  const [nextFollowupTime, setNextFollowupTime] = useState(null);
  const [interestRate, setInterestRate] = useState(1);
  const [addTodayFollowup, setAddTodayFollowup] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newCommentError, setNewCommentError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const communicationStatusOptions = [
    { id: 1, name: "Communicated" },
    { id: 2, name: "Not-Communicated" },
  ];

  const formReset = () => {
    setCommunicationStatus(null);
    setCommunicationStatusError("");
    setContactMode(null);
    setContactModeError("");
    setResponseStatus(null);
    setResponseStatusError("");
    setFollowupType(null);
    setFollowupTypeError("");
    setNxtFollowupDate(null);
    setNxtFollowupDateError("");
    setNextFollowupTime(null);
    setInterestRate(1);
    setAddTodayFollowup(false);
    setNewComment("");
    setNewCommentError("");
    setValidationTrigger(false);
    setButtonLoading(false);
    onClose();
  };

  const handleUpdateFollowUp = async () => {
    setValidationTrigger(true);
    const communicationStatusValidate = selectValidator(communicationStatus);
    const contactModeValidate = selectValidator(contactMode);
    const responseStatusValidate = selectValidator(responseStatus);
    const followupTypeValidate = selectValidator(followupType);
    const nxtFollowdateValidate =
      followupType == 2 || followupType == null || followupType === ""
        ? ""
        : selectValidator(nxtFollowupDate);
    const commentValidate = addressValidator(newComment);

    setCommunicationStatusError(communicationStatusValidate);
    setContactModeError(contactModeValidate);
    setResponseStatusError(responseStatusValidate);
    setFollowupTypeError(followupTypeValidate);
    setNxtFollowupDateError(nxtFollowdateValidate);
    setNewCommentError(commentValidate);

    if (
      communicationStatusValidate ||
      contactModeValidate ||
      responseStatusValidate ||
      followupTypeValidate ||
      nxtFollowdateValidate ||
      commentValidate
    )
      return;

    setButtonLoading(true);
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = getloginUserDetails
      ? JSON.parse(getloginUserDetails)
      : null;

    const payload = {
      lead_history_id: leadHistoryId,
      today_followup_date: addTodayFollowup
        ? formatToBackendIST(new Date())
        : null,
      next_follow_up_date: nxtFollowupDate
        ? formatToBackendIST(nxtFollowupDate)
        : null,
      lead_status_id: followupType,
      lead_id: leadId,
      communication_status: communicationStatus,
      contact_mode: contactMode,
      response_status: responseStatus,
      next_follow_up_time: nextFollowupTime
        ? formatToBackendIST(nextFollowupTime)
        : null,
      interest_rate: interestRate,
      comments: newComment,
      updated_by:
        converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      updated_date: formatToBackendIST(new Date()),
    };

    try {
      await updateFollowUp(payload);
      CommonMessage("success", "Updated");
      setTimeout(() => {
        if (onUpdateSuccess) onUpdateSuccess();
        formReset();
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      console.log("update follow up error", error);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later",
      );
    }
  };

  return (
    <Drawer
      title="Lead Follow-Up"
      open={isOpen}
      onClose={formReset}
      width="52%"
      style={{ position: "relative", paddingBottom: "65px" }}
      className="customer_statusupdate_drawer"
      destroyOnClose={true}
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
              <EllipsisTooltip
                text={leadDetails && leadDetails.name ? leadDetails.name : "-"}
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
                  leadDetails && leadDetails.email ? leadDetails.email : "-"
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
                {leadDetails && leadDetails.area_id ? leadDetails.area_id : "-"}
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
                  ? moment(leadDetails.next_follow_up_date).format("DD/MM/YYYY")
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
                  leadDetails && leadDetails.primary_course
                    ? leadDetails.primary_course
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
              <EllipsisTooltip
                text={
                  leadDetails && leadDetails.branch_name
                    ? leadDetails.branch_name
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
              <EllipsisTooltip
                text={`${
                  leadDetails && leadDetails.lead_assigned_to_id
                    ? leadDetails.lead_assigned_to_id
                    : "-"
                } (${
                  leadDetails && leadDetails.lead_assigned_to_name
                    ? leadDetails.lead_assigned_to_name
                    : "-"
                })`}
                smallText={true}
              />
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
          <div
            className="leadmanager_comments_maincontainer"
            style={{
              position: "relative",
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* The vertical timeline track */}
            <div
              style={{
                position: "absolute",
                top: "32px",
                bottom: "32px",
                left: "27px",
                width: "2px",
                backgroundColor: "#e2e8f0",
                zIndex: 0,
              }}
            ></div>

            {[...commentsHistory]
              .sort(
                (a, b) =>
                  new Date(b.updated_date || b.created_date) -
                  new Date(a.updated_date || a.created_date),
              )
              .map((item, index) => {
                const statusColors = {
                  "Sales Ready": "#dc2626",
                  "Highly Interested": "#f97316",
                  Interested: "#eab308",
                  Exploring: "#3b82f6",
                  "Not Responding": "#4b5563",
                  "Not Interested": "#111827",
                };
                const baseColor =
                  statusColors[item.lead_action_name] || "#4338ca";

                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "16px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        border: "1px solid #f1f5f9",
                        borderRadius: "12px",
                        padding: "16px",
                        background: "#fff",
                        boxShadow:
                          "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              flexShrink: 0,
                              background: "#fff",
                              borderRadius: "50%",
                              boxShadow: "0 0 0 4px #fff",
                            }}
                          >
                            <CommonAvatar
                              itemName={item.user_name || "Unknown"}
                              avatarSize={32}
                            />
                          </div>
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                fontSize: "13px",
                                color: "#1e293b",
                              }}
                            >
                              {item.user_name
                                ? `${item.updated_by} - ${item.user_name}`
                                : "-"}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "11px",
                                color: "#64748b",
                                fontWeight: 500,
                              }}
                            >
                              {item.updated_date
                                ? moment(item.updated_date).format(
                                    "MMM DD, YYYY hh:mm A",
                                  )
                                : item.created_date
                                  ? moment(item.created_date).format(
                                      "MMM DD, YYYY hh:mm A",
                                    )
                                  : "-"}
                            </p>
                          </div>
                        </div>
                        {item.lead_action_name && (
                          <div
                            style={{
                              background: `${baseColor}1A`,
                              color: baseColor,
                              border: `1px solid ${baseColor}`,
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {item.lead_action_name}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "gray" }}>
                            Communication:
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              background: item.communication_status_name
                                ? "#dcfce7"
                                : "#f1f5f9",
                              color: item.communication_status_name
                                ? "#166534"
                                : "#334155",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {item.communication_status_name || "-"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "gray" }}>
                            Mode:
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              background: item.contact_mode_name
                                ? "#fef3c7"
                                : "#f1f5f9",
                              color: item.contact_mode_name
                                ? "#92400e"
                                : "#334155",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {item.contact_mode_name || "-"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "gray" }}>
                            Interest Rate:
                          </span>
                          <Rate
                            disabled
                            value={item.interest_rate || 0}
                            style={{ fontSize: "12px", color: "#f59e0b" }}
                          />
                        </div>
                      </div>

                      {item.comments && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#334155",
                            background: "#fff",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {item.comments}
                        </div>
                      )}

                      {item.status && (
                        <div style={{ marginTop: "10px" }}>
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
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="leadfollowup_comment_nodatafound">No comments found</p>
        )}
      </div>{" "}
      <Divider className="customer_statusupdate_divider" />
      <div
        className="customer_statusupdate_adddetailsContainer"
        style={{ position: "relative" }}
      >
        <p className="customer_statusupdate_adddetails_heading">
          Update Follow-Up
        </p>
        <Row gutter={12} style={{ marginTop: "10px", marginBottom: "16px" }}>
          <Col span={8}>
            <CommonSelectField
              label="Communication"
              required={true}
              value={communicationStatus}
              onChange={(e) => {
                const value = e.target.value;
                setCommunicationStatus(value);
                setContactMode(null);
                setResponseStatus(null);
                setResponseStatusError("");
                setFollowupType(null);
                setNxtFollowupDate(null);
                setNextFollowupTime(null);
                setAddTodayFollowup(false);
                if (validationTrigger) {
                  setCommunicationStatusError(selectValidator(value));
                  setContactModeError(selectValidator(null));
                  setFollowupTypeError(selectValidator(null));
                }
              }}
              options={communicationStatusOptions}
              error={communicationStatusError}
              height={"36px"}
              fontSize={"13px"}
              labelFontSize={"13px"}
              errorFontSize={"10px"}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label={communicationStatus == 2 ? "Reason" : "Mode"}
              required={true}
              options={
                communicationStatus == 2
                  ? [{ id: 5, name: "No Response" }]
                  : [
                      { id: 1, name: "Phone Call" },
                      { id: 2, name: "WhatsApp" },
                      { id: 3, name: "SMS" },
                      { id: 4, name: "Email" },
                    ]
              }
              onChange={(e) => {
                const value = e.target.value;
                setContactMode(value);
                if (value == 5) {
                  setResponseStatus("Not-Received");
                  setResponseStatusError("");
                  setFollowupType(10);
                  setFollowupTypeError("");
                }
                if (validationTrigger) {
                  setContactModeError(selectValidator(value));
                }
              }}
              value={contactMode}
              error={contactModeError}
              height={"36px"}
              fontSize={"13px"}
              labelFontSize={"13px"}
              errorFontSize={"10px"}
              disabled={!communicationStatus}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Response Status"
              required={true}
              value={responseStatus}
              onChange={(e) => {
                setResponseStatus(e.target.value);
                setResponseStatusError(selectValidator(e.target.value));
              }}
              options={[
                { id: "Received", name: "Received" },
                { id: "Not-Received", name: "Not-Received" },
              ]}
              error={responseStatusError}
              height={"35px"}
              fontSize={"13px"}
              labelFontSize={"12px"}
              errorFontSize={"9px"}
              labelMarginTop={"0px"}
              disabled={contactMode == 5 || contactMode == 6}
            />
          </Col>
          <Col span={8} style={{ marginTop: "24px" }}>
            <CommonSelectField
              label="Follow-up Type"
              required={true}
              value={followupType}
              onChange={(e) => {
                const value = e.target.value;
                setFollowupType(value);
                setFollowupTypeError(selectValidator(value));
                if (value == 2) {
                  setNxtFollowupDate(null);
                  setNxtFollowupDateError("");
                  setNextFollowupTime(null);
                  setInterestRate(1);
                }
              }}
              options={[
                { id: 5, name: "Sales Ready", color: "#dc2626" },
                { id: 1, name: "Highly Interested", color: "#f97316" },
                { id: 8, name: "Interested", color: "#eab308" },
                { id: 9, name: "Exploring", color: "#3b82f6" },
                { id: 10, name: "Not Responding", color: "#4b5563" },
                { id: 2, name: "Not Interested", color: "#111827" },
              ]}
              renderOption={(props, option) => (
                <li {...props}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: option.color || "gray",
                      }}
                    ></span>
                    <span>{option.name}</span>
                  </div>
                </li>
              )}
              height={"36px"}
              fontSize={"13px"}
              labelFontSize={"13px"}
              error={followupTypeError}
              disabled={contactMode == 5 || contactMode == 6}
            />
          </Col>
          <Col span={8} style={{ marginTop: "24px" }}>
            <CommonNxtFollowupDatePicker
              label="Next Follow-up Date"
              required={true}
              value={nxtFollowupDate}
              onChange={(val) => {
                setNxtFollowupDate(val);
                setNxtFollowupDateError(selectValidator(val));
              }}
              leadTemperature={parseInt(leadDetails?.lead_status_id)}
              error={nxtFollowupDateError}
              height={"36px"}
              labelMarginTop={"1px"}
              disabled={
                followupType == null || followupType === "" || followupType == 2
              }
            />
          </Col>

          <Col span={8} style={{ marginTop: "24px" }}>
            <CommonMuiDateTimePicker
              label="Next Follow-up Time"
              required={false}
              value={nextFollowupTime}
              onChange={(val) => setNextFollowupTime(val)}
              error={""}
              onlyTime={true}
              height={"36px"}
              labelMarginTop={"1px"}
              disabled={
                contactMode == 6 ||
                followupType == null ||
                followupType === "" ||
                followupType == 2
              }
            />
          </Col>
          <Col span={8} style={{ marginTop: "24px" }}>
            <p style={{ fontWeight: "500", fontSize: "13px", color: "gray" }}>
              Interest Rating
            </p>
            <Rate
              style={{ marginTop: "6px", fontSize: "20px" }}
              value={interestRate}
              onChange={setInterestRate}
              disabled={contactMode == 6 || followupType == 2}
            />
          </Col>
          <Col span={9} style={{ marginTop: "40px" }}>
            <Checkbox
              checked={addTodayFollowup}
              onChange={(e) => setAddTodayFollowup(e.target.checked)}
              disabled={contactMode == 6}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  fontWeight: 500,
                }}
              >
                Add to today's follow-up list
              </span>
            </Checkbox>
          </Col>
        </Row>

        {/* <div style={{ marginBottom: "16px" }}>
          <Checkbox
            checked={addTodayFollowup}
            onChange={(e) => setAddTodayFollowup(e.target.checked)}
            disabled={contactMode == 6}
          >
            <span
              style={{
                fontSize: "13px",
                color: "#475569",
                fontWeight: 500,
              }}
            >
              Add to today's follow-up list
            </span>
          </Checkbox>
        </div> */}

        <div style={{ marginBottom: "12px" }}>
          <CommonTextArea
            label={"Remarks"}
            placeholder="Enter remarks..."
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              if (validationTrigger) {
                setNewCommentError(addressValidator(e.target.value));
              }
            }}
            error={newCommentError}
            disabled={contactMode == 6}
          />
        </div>
      </div>
      <div
        className="leadmanager_tablefiler_footer"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className="leadfollowup_prev_next_container">
          {handlePrevious && handleNext && (
            <>
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
                disabled={currentIndex === totalItems - 1}
              >
                Next
              </Button>
            </>
          )}
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
  );
}
