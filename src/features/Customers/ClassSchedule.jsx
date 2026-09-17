import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Row, Col, Button, Modal, Steps } from "antd";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTextArea from "../Common/CommonTextArea";
import CommonInputField from "../Common/CommonInputField";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonSpinner from "../Common/CommonSpinner";
import {
  addressValidator,
  formatToBackendIST,
  googleSheetValidator,
  percentageValidator,
  selectValidator,
  whatsappInviteLinkValidator,
} from "../Common/Validation";
import {
  classScheduleForCustomer,
  getCustomerById,
  inserCustomerTrack,
  updateClassGoingForCustomer,
  updateCustomerStatus,
  updateTrainerCoordination,
} from "../ApiService/action";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { MdOutlineAssignmentInd } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { CommonMessage } from "../Common/CommonMessage";

const { Step } = Steps;

const ClassSchedule = forwardRef(
  (
    {
      customerDetails,
      drawerContentStatus,
      setUpdateButtonLoading,
      callgetCustomersApi,
      customerIdsFromBatch = [],
    },
    ref,
  ) => {
    //class schedule usestates
    const [stepIndex, setStepIndex] = useState(0);
    const scheduleOptions = [
      { id: 1, name: "On Going" },
      { id: 3, name: "Hold" },
      { id: 6, name: "CGS" },
      { id: 10, name: "Demo Completed" },
    ];
    const scheduleOptions2 = [
      { id: 1, name: "On Going" },
      { id: 3, name: "Hold" },
      { id: 5, name: "Escalated" },
      { id: 7, name: "Partially Closed" },
      { id: 8, name: "Discontinued" },
      { id: 9, name: "Refund" },
    ];
    const [scheduleId, setScheduleId] = useState(null);
    const [scheduleIdError, setScheduleIdError] = useState("");
    const [classStartDate, setClassStartDate] = useState(null);
    const [classStartDateError, setClassStartDateError] = useState("");
    const [classHoldComments, setClassHoldComments] = useState("");
    const [classHoldCommentsError, setClassHoldCommentsError] = useState("");
    //trainer coordination usestates
    const [cus_details, setCus_Details] = useState(null);
    const [whatsappGroupStatus, setWhatsappGroupStatus] = useState(null);
    const [whatsappInviteLink, setWhatsappInviteLink] = useState("");
    const [whatsappInviteLinkError, setWhatsappInviteLinkError] = useState("");
    const [welcomeMessageStatus, setWelcomeMessageStatus] = useState(null);
    const [linkStatus, setLinkStatus] = useState(null);
    const [attendanceSheetLink, setAttendanceSheetLink] = useState("");
    const [attendanceSheetLinkError, setAttendanceSheetLinkError] =
      useState("");
    const [classMonitorStatus, setClassMonitorStatus] = useState(null);
    const [trainerConfirmation, setTrainerConfirmation] = useState(null);
    const [buttonLoading, setButtonLoading] = useState(false);
    //class going usestates
    const [classGoingPercentage, setClassGoingPercentage] = useState(0);
    const [classGoingPercentageError, setClassGoingPercentageError] =
      useState(0);
    const [classGoingComments, setClassGoingComments] = useState("");
    const [classGoingCommentsError, setClassGoingCommentsError] = useState("");
    const [addattachmentBase64, setAddattachmentBase64] = useState("");
    const [addattachmentError, setAddattachmentError] = useState("");
    const [isOpenClassCompleteModal, setIsOpenClassCompleteModal] =
      useState(false);
    const [classCompleteLoading, setClassCompleteLoading] = useState(false);
    const [isShowAddAttachment, setIsShowAddAttachment] = useState(false);

    const prev = () => setStepIndex(stepIndex - 1);

    useEffect(() => {
      console.log("customer_details", customerDetails);
      //trainer coordination
      setWhatsappGroupStatus(
        customerDetails?.whatsapp_group_creation === 1 ? 1 : 2,
      );
      setWhatsappInviteLink(customerDetails?.whatsapp_invite_link);
      setAttendanceSheetLink(customerDetails?.attendance_sheet_link);
      setWelcomeMessageStatus(
        customerDetails?.hr_welcome_message === 1 ? 1 : 2,
      );
      setLinkStatus(customerDetails?.shared_attendance_link === 1 ? 1 : 2);
      setClassMonitorStatus(
        customerDetails?.first_class_monitoring === 1 ? 1 : 2,
      );
      setTrainerConfirmation(
        customerDetails?.trainer_confirmation === 1 ? 1 : 2,
      );
      setCus_Details(customerDetails);
    }, []);

    useEffect(() => {
      console.log("customerIdsFromBatch", customerIdsFromBatch);
      setScheduleId(
        customerDetails && customerDetails.class_schedule_id
          ? customerDetails.class_schedule_id
          : null,
      );
      setClassStartDate(
        customerDetails && customerDetails.class_start_date
          ? customerDetails.class_start_date
          : null,
      );
      setClassGoingPercentage(
        customerDetails && customerDetails.class_percentage
          ? parseFloat(customerDetails.class_percentage)
          : null,
      );
    }, []);

    const getParticularCustomerDetails = async () => {
      // setIsStatusUpdateDrawerLoading(true);
      try {
        const response = await getCustomerById(customerDetails?.id);
        console.log("particular customer response", response);
        const particular_customer_details = response?.data?.data;
        setCus_Details(particular_customer_details);
      } catch (error) {
        console.log("getcustomer by id error", error);
        setCus_Details(null);
      } finally {
        setButtonLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      handleClassSchedule,
      handleUpdateClassGoing,
    }));

    const handleTrainerCoordination = async () => {
      const whatsappInviteLinkValidate =
        whatsappGroupStatus == 1
          ? whatsappInviteLinkValidator(whatsappInviteLink)
          : "";
      const attendanceSheetLinkValidate =
        whatsappGroupStatus == 1
          ? googleSheetValidator(attendanceSheetLink)
          : "";

      setWhatsappInviteLinkError(whatsappInviteLinkValidate);
      setAttendanceSheetLinkError(attendanceSheetLinkValidate);

      if (whatsappInviteLinkValidate || attendanceSheetLinkValidate) return;

      const initialWhatsappGroupStatus =
        cus_details?.whatsapp_group_creation === 1 ? 1 : 2;
      const initialWhatsappInviteLink = cus_details?.whatsapp_invite_link;
      const initialWelcomeMessageStatus =
        cus_details?.hr_welcome_message === 1 ? 1 : 2;
      const initialLinkStatus =
        cus_details?.shared_attendance_link === 1 ? 1 : 2;
      const initialAttendanceSheetLink = cus_details?.attendance_sheet_link;
      const initialsMonitorStatus =
        cus_details?.first_class_monitoring === 1 ? 1 : 2;
      const initialsTrainerConfirmation =
        cus_details?.trainer_confirmation === 1 ? 1 : 2;

      if (
        whatsappGroupStatus == initialWhatsappGroupStatus &&
        whatsappInviteLink === initialWhatsappInviteLink &&
        welcomeMessageStatus == initialWelcomeMessageStatus &&
        linkStatus == initialLinkStatus &&
        attendanceSheetLink === initialAttendanceSheetLink &&
        classMonitorStatus == initialsMonitorStatus &&
        trainerConfirmation == initialsTrainerConfirmation
      ) {
        CommonMessage("warning", "No changes made to update");
        return;
      }

      setButtonLoading(true);
      const payload = {
        whatsapp_group_creation: whatsappGroupStatus == 1 ? 1 : 0,
        whatsapp_invite_link:
          whatsappGroupStatus == 1 ? whatsappInviteLink : "",
        hr_welcome_message: welcomeMessageStatus == 1 ? 1 : 0,
        shared_attendance_link: linkStatus == 1 ? 1 : 0,
        attendance_sheet_link: linkStatus == 1 ? attendanceSheetLink : "",
        first_class_monitoring: classMonitorStatus == 1 ? 1 : 0,
        trainer_confirmation: trainerConfirmation == 1 ? 1 : 0,
        trainer_mapping_id: customerDetails?.training_map_id,
      };

      const changedFields = {};
      const whatsappOptions = [
        { id: 1, name: "Created" },
        { id: 2, name: "Not Yet" },
      ];
      const welcomeMessageOptions = [
        { id: 1, name: "Completed" },
        { id: 2, name: "Pending" },
      ];
      const linkOptions = [
        { id: 1, name: "Shared" },
        { id: 2, name: "Not Yet" },
      ];
      const classMonitorOptions = [
        { id: 1, name: "Monitored" },
        { id: 2, name: "Not Yet" },
      ];
      const trainerConfirmOptions = [
        { id: 1, name: "Completed" },
        { id: 2, name: "Pending" },
      ];

      const getName = (options, val) => {
        const found = options.find((o) => String(o.id) === String(val));
        return found ? found.name : val;
      };

      if (whatsappGroupStatus != initialWhatsappGroupStatus) {
        changedFields["whatsapp_group_creation"] = {
          previous_value: getName(whatsappOptions, initialWhatsappGroupStatus),
          new_value: getName(whatsappOptions, whatsappGroupStatus),
        };
      }
      if (whatsappInviteLink != initialWhatsappInviteLink) {
        changedFields["whatsapp_invite_link"] = {
          previous_value: initialWhatsappInviteLink,
          new_value: whatsappInviteLink,
        };
      }
      if (welcomeMessageStatus != initialWelcomeMessageStatus) {
        changedFields["hr_welcome_message"] = {
          previous_value: getName(
            welcomeMessageOptions,
            initialWelcomeMessageStatus,
          ),
          new_value: getName(welcomeMessageOptions, welcomeMessageStatus),
        };
      }
      if (linkStatus != initialLinkStatus) {
        changedFields["shared_attendance_link"] = {
          previous_value: getName(linkOptions, initialLinkStatus),
          new_value: getName(linkOptions, linkStatus),
        };
      }
      if (attendanceSheetLink != initialAttendanceSheetLink) {
        changedFields["attendance_sheet_link"] = {
          previous_value: initialAttendanceSheetLink,
          new_value: attendanceSheetLink,
        };
      }
      if (classMonitorStatus != initialsMonitorStatus) {
        changedFields["first_class_monitoring"] = {
          previous_value: getName(classMonitorOptions, initialsMonitorStatus),
          new_value: getName(classMonitorOptions, classMonitorStatus),
        };
      }
      if (trainerConfirmation != initialsTrainerConfirmation) {
        changedFields["trainer_confirmation"] = {
          previous_value: getName(
            trainerConfirmOptions,
            initialsTrainerConfirmation,
          ),
          new_value: getName(trainerConfirmOptions, trainerConfirmation),
        };
      }

      try {
        await updateTrainerCoordination(payload);

        const getloginUserDetails = localStorage.getItem("loginUserDetails");
        const converAsJson = getloginUserDetails
          ? JSON.parse(getloginUserDetails)
          : null;

        const trackPayload = {
          customers: [
            {
              customer_id: customerDetails?.id,
              status: "Trainer Coordination Details Updated",
              details: changedFields,
              status_date: formatToBackendIST(new Date()),
              updated_by: converAsJson?.user_id || "",
            },
          ],
        };
        await inserCustomerTrack(trackPayload);

        CommonMessage(
          "success",
          "Trainer Coordination Details Updated Successfully",
        );
        getParticularCustomerDetails();
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleClassSchedule = async () => {
      const scheduleIdValidate = selectValidator(scheduleId);
      let classStartDateValidate;
      let classHoldCommentValidate;

      if (scheduleId == 6) {
        classStartDateValidate = selectValidator(classStartDate);
      } else {
        classStartDateValidate = "";
      }

      if (scheduleId == 3 || scheduleId == 10) {
        classHoldCommentValidate = addressValidator(classHoldComments);
      } else {
        classStartDateValidate = "";
      }

      setScheduleIdError(scheduleIdValidate);
      setClassStartDateError(classStartDateValidate);
      setClassHoldCommentsError(classHoldCommentValidate);

      if (
        scheduleIdValidate ||
        classStartDateValidate ||
        classHoldCommentValidate
      )
        return;
      setUpdateButtonLoading(true);
      setButtonLoading(true);

      const today = new Date();

      const customers =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              schedule_id: scheduleId,
              ...(classStartDate
                ? { class_start_date: formatToBackendIST(classStartDate) }
                : { class_start_date: null }),
              schedule_at: formatToBackendIST(today),
              ...(classHoldComments && { comments: classHoldComments }),
            }))
          : [
              {
                customer_id: customerDetails.id,
                schedule_id: scheduleId,
                ...(classStartDate
                  ? { class_start_date: formatToBackendIST(classStartDate) }
                  : { class_start_date: null }),
                schedule_at: formatToBackendIST(today),
                ...(classHoldComments && { comments: classHoldComments }),
              },
            ];

      const payload = { customers };

      console.log("class schedule payload", payload);
      try {
        await classScheduleForCustomer(payload);
        CommonMessage("success", "Updated Successfully");
        setTimeout(() => {
          handleCustomerStatus(
            scheduleId == 1
              ? "Class Going"
              : scheduleId == 3
                ? "Hold"
                : scheduleId == 10
                  ? "Demo Completed"
                  : scheduleId == 5
                    ? "Escalated"
                    : "Class Scheduled",
          );
        }, 300);
      } catch (error) {
        setUpdateButtonLoading(false);
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleUpdateClassGoing = async () => {
      const classGoingPercentageValidate =
        percentageValidator(classGoingPercentage);
      let commentValidate;
      let attachmentValidate;

      if (scheduleId != 1) {
        commentValidate = addressValidator(classGoingComments);
        attachmentValidate = selectValidator(addattachmentBase64);
      } else {
        commentValidate = "";
        attachmentValidate = "";
      }

      setClassGoingPercentageError(classGoingPercentageValidate);
      setClassGoingCommentsError(commentValidate);
      setAddattachmentError(attachmentValidate);

      if (classGoingPercentageValidate || commentValidate || attachmentValidate)
        return;

      setUpdateButtonLoading(true);

      const customers =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              schedule_id: scheduleId,
              class_percentage: classGoingPercentage,
              class_comments: classGoingComments,
              class_attachment: addattachmentBase64,
            }))
          : [
              {
                customer_id: customerDetails.id,
                schedule_id: scheduleId,
                class_percentage: classGoingPercentage,
                class_comments: classGoingComments,
                class_attachment: addattachmentBase64,
              },
            ];

      const payload = { customers };

      if (classGoingPercentage >= 100) {
        setIsOpenClassCompleteModal(true);
        setUpdateButtonLoading(false);
        return;
      }

      try {
        await updateClassGoingForCustomer(payload);
        CommonMessage("success", "Updated Successfully");
        if (classGoingPercentage < 100) {
          setTimeout(() => {
            handleCustomerStatus(
              scheduleId == 1
                ? "Class Going"
                : scheduleId == 3
                  ? "Hold"
                  : scheduleId == 5
                    ? "Escalated"
                    : scheduleId == 7
                      ? "Partially Closed"
                      : scheduleId == 8
                        ? "Discontinued"
                        : scheduleId == 9
                          ? "Refund"
                          : "",
            );
            setUpdateButtonLoading(false);
            // updateStatusDrawerReset();
          }, 300);
        }
      } catch (error) {
        setUpdateButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCompleteClass = async () => {
      setClassCompleteLoading(true);
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const customers =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              schedule_id: scheduleId,
              class_percentage: classGoingPercentage,
              class_comments: classGoingComments,
              class_attachment: addattachmentBase64,
            }))
          : [
              {
                customer_id: customerDetails.id,
                schedule_id: scheduleId,
                class_percentage: classGoingPercentage,
                class_comments: classGoingComments,
                class_attachment: addattachmentBase64,
              },
            ];

      const payload = { customers };

      try {
        await updateClassGoingForCustomer(payload);
        CommonMessage("success", "Updated Successfully");
        setTimeout(async () => {
          setIsOpenClassCompleteModal(false);
          const customer_ids =
            customerIdsFromBatch && customerIdsFromBatch.length > 0
              ? customerIdsFromBatch.map((item) => ({
                  customer_id: item.customer_id,
                  status: "Passedout process",
                  updated_at: formatToBackendIST(new Date()),
                  updated_by: converAsJson?.user_id || "",
                }))
              : [
                  {
                    customer_id: customerDetails.id,
                    status: "Passedout process",
                    updated_at: formatToBackendIST(new Date()),
                    updated_by: converAsJson?.user_id || "",
                  },
                ];

          const statusPayload = { customer_ids };

          try {
            await updateCustomerStatus(statusPayload);
            handleCustomerTrack("Class Completed");
            setTimeout(() => {
              handleSecondCustomerTrack("Passedout Process");
              setClassCompleteLoading(false);
            }, 300);
          } catch (error) {
            CommonMessage(
              "error",
              error?.response?.data?.message ||
                "Something went wrong. Try again later",
            );
          }
        }, 300);
      } catch (error) {
        setClassCompleteLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCustomerStatus = async (updatestatus) => {
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const customer_ids =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              status: updatestatus,
              updated_at: formatToBackendIST(new Date()),
              updated_by: converAsJson?.user_id || "",
            }))
          : [
              {
                customer_id: customerDetails.id,
                status: updatestatus,
                updated_at: formatToBackendIST(new Date()),
                updated_by: converAsJson?.user_id || "",
              },
            ];

      const payload = { customer_ids };
      try {
        await updateCustomerStatus(payload);
        handleCustomerTrack(updatestatus);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const classScheduledDetails = {
        schedule_status: "Class Scheduled",
        ...(classStartDate
          ? {
              class_start_date: formatToBackendIST(classStartDate),
            }
          : { class_start_date: null }),
      };

      const classGoingDetails = {
        schedule_status: "Class Going",
        class_going_percentage: classGoingPercentage,
      };

      const holdDetails = {
        comments: classHoldComments,
      };

      const escalatedDetails = {
        comments: classGoingComments,
        attachment: addattachmentBase64,
      };

      const classCompletedDetails = {
        schedule_status: "Class Completed",
        class_going_percentage: 100,
      };

      const customers =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              status: updatestatus,
              updated_by:
                converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
              status_date: formatToBackendIST(today),
              ...(updatestatus === "Class Scheduled"
                ? { details: classScheduledDetails }
                : updatestatus === "Class Going"
                  ? { details: classGoingDetails }
                  : updatestatus === "Hold" || updatestatus === "Demo Completed"
                    ? { details: holdDetails }
                    : updatestatus == "Escalated" ||
                        updatestatus == "Partially Closed" ||
                        updatestatus == "Discontinued" ||
                        updatestatus == "Refund"
                      ? { details: escalatedDetails }
                      : updatestatus == "Class Completed"
                        ? { details: classCompletedDetails }
                        : {}),
            }))
          : [
              {
                customer_id: customerDetails.id,
                status: updatestatus,
                updated_by:
                  converAsJson && converAsJson.user_id
                    ? converAsJson.user_id
                    : 0,
                status_date: formatToBackendIST(today),
                ...(updatestatus === "Class Scheduled"
                  ? { details: classScheduledDetails }
                  : updatestatus === "Class Going"
                    ? { details: classGoingDetails }
                    : updatestatus === "Hold" ||
                        updatestatus === "Demo Completed"
                      ? { details: holdDetails }
                      : updatestatus == "Escalated" ||
                          updatestatus == "Partially Closed" ||
                          updatestatus == "Discontinued" ||
                          updatestatus == "Refund"
                        ? { details: escalatedDetails }
                        : updatestatus == "Class Completed"
                          ? { details: classCompletedDetails }
                          : {}),
              },
            ];

      const payload = { customers };

      try {
        await inserCustomerTrack(payload);
        setTimeout(() => {
          callgetCustomersApi();
        }, 300);
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    const handleSecondCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const customers =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              status: updatestatus,
              updated_by:
                converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
              status_date: formatToBackendIST(today),
            }))
          : [
              {
                customer_id: customerDetails.id,
                status: updatestatus,
                updated_by:
                  converAsJson && converAsJson.user_id
                    ? converAsJson.user_id
                    : 0,
                status_date: formatToBackendIST(today),
              },
            ];

      const payload = { customers };

      try {
        await inserCustomerTrack(payload);
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    return (
      <>
        {drawerContentStatus == "Class Schedule" ? (
          <div className="customer_statusupdate_adddetailsContainer">
            <Steps current={stepIndex} size="small">
              <Step
                title={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "13px",
                    }}
                  >
                    Trainer Coordination
                    <FaPhoneAlt
                      color="#2d4191"
                      size={16}
                      style={{ marginLeft: 6 }}
                    />
                  </span>
                }
              />

              <Step
                title={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "13px",
                    }}
                  >
                    Class Schedule
                    <RiCalendarScheduleLine
                      size={18}
                      style={{ marginLeft: 6 }}
                      color="#2d4191"
                    />
                  </span>
                }
              />
            </Steps>

            {stepIndex == 0 && (
              <Row
                gutter={[12, 30]}
                style={{ marginTop: "20px", marginBottom: "30px" }}
              >
                <Col span={8}>
                  <CommonSelectField
                    label={"Whatsapp Group Status"}
                    required={true}
                    options={[
                      { id: 1, name: "Created" },
                      { id: 2, name: "Not Yet" },
                    ]}
                    onChange={(e) => {
                      setWhatsappGroupStatus(e.target.value);
                      setWhatsappInviteLink("");
                      setWhatsappInviteLinkError("");
                    }}
                    value={whatsappGroupStatus}
                    error={""}
                    height={"33px"}
                    labelFontSize={"11px"}
                    labelMarginTop={"0px"}
                    errorFontSize="9px"
                  />
                </Col>
                {whatsappGroupStatus == 1 && (
                  <Col span={8}>
                    <CommonInputField
                      label={"Whatsapp Invite Link"}
                      required={true}
                      onChange={(e) => {
                        setWhatsappInviteLink(e.target.value);
                        setWhatsappInviteLinkError(
                          whatsappInviteLinkValidator(e.target.value),
                        );
                      }}
                      value={whatsappInviteLink}
                      error={whatsappInviteLinkError}
                      height={"33px"}
                      labelFontSize={"11px"}
                      labelMarginTop={"0px"}
                      errorFontSize="9px"
                    />
                  </Col>
                )}

                <Col span={8}>
                  <CommonSelectField
                    label={"Welcome Message Status"}
                    required={true}
                    options={[
                      { id: 1, name: "Completed" },
                      { id: 2, name: "Pending" },
                    ]}
                    onChange={(e) => {
                      setWelcomeMessageStatus(e.target.value);
                    }}
                    value={welcomeMessageStatus}
                    error={""}
                    height={"33px"}
                    labelFontSize={"11px"}
                    labelMarginTop={"0px"}
                    errorFontSize="9px"
                  />
                </Col>
                <Col span={8}>
                  <CommonSelectField
                    label={"Shared Teams & Attendance Link"}
                    required={true}
                    options={[
                      { id: 1, name: "Shared" },
                      { id: 2, name: "Not Yet" },
                    ]}
                    onChange={(e) => {
                      setLinkStatus(e.target.value);
                      setAttendanceSheetLink("");
                      setAttendanceSheetLinkError("");
                    }}
                    value={linkStatus}
                    error={""}
                    height={"33px"}
                    labelFontSize={"11px"}
                    labelMarginTop={"0px"}
                    errorFontSize="9px"
                  />
                </Col>
                {linkStatus == 1 && (
                  <Col span={8}>
                    <CommonInputField
                      label={"Attendance Sheet Link"}
                      required={true}
                      onChange={(e) => {
                        setAttendanceSheetLink(e.target.value);
                        setAttendanceSheetLinkError(
                          googleSheetValidator(e.target.value),
                        );
                      }}
                      value={attendanceSheetLink}
                      error={attendanceSheetLinkError}
                      height={"33px"}
                      labelFontSize={"11px"}
                      labelMarginTop={"0px"}
                      errorFontSize="9px"
                    />
                  </Col>
                )}
                <Col span={8}>
                  <CommonSelectField
                    label={"First Class Monitoring"}
                    required={true}
                    options={[
                      { id: 1, name: "Monitored" },
                      { id: 2, name: "Not Yet" },
                    ]}
                    onChange={(e) => {
                      setClassMonitorStatus(e.target.value);
                    }}
                    value={classMonitorStatus}
                    error={""}
                    height={"33px"}
                    labelFontSize={"11px"}
                    labelMarginTop={"0px"}
                    errorFontSize="9px"
                  />
                </Col>
                <Col span={8}>
                  <CommonSelectField
                    label={"Trainer Confirmation"}
                    required={true}
                    options={[
                      { id: 1, name: "Completed" },
                      { id: 2, name: "Pending" },
                    ]}
                    onChange={(e) => {
                      setTrainerConfirmation(e.target.value);
                    }}
                    value={trainerConfirmation}
                    error={""}
                    height={"33px"}
                    labelFontSize={"11px"}
                    labelMarginTop={"0px"}
                    errorFontSize="9px"
                  />
                </Col>
              </Row>
            )}

            {stepIndex == 1 && (
              <>
                <p
                  className="customer_statusupdate_adddetails_heading"
                  style={{ marginTop: "20px" }}
                >
                  Add Details
                </p>

                <div
                  style={{
                    marginTop: "12px",
                    marginBottom:
                      scheduleId == null || scheduleId == "" || scheduleId == 1
                        ? "40px"
                        : "0px",
                  }}
                >
                  <CommonSelectField
                    label="Schedule Status"
                    options={scheduleOptions}
                    required={true}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log("valllllllllll", value);
                      setScheduleId(value);
                      setScheduleIdError(selectValidator(value));
                      if (value == 6) {
                        setTimeout(() => {
                          const container = document.getElementById(
                            "customer_scheduledatefield_container",
                          );
                          container.scrollIntoView({ behavior: "smooth" });
                        }, 200);
                        setClassStartDateError(selectValidator(classStartDate));
                      } else {
                        setClassStartDate(null);
                        setClassStartDateError("");
                      }

                      if (value == 3 || value == 10) {
                        setTimeout(() => {
                          const container = document.getElementById(
                            "customer_scheduledatefield_container",
                          );
                          container.scrollIntoView({ behavior: "smooth" });
                        }, 200);
                        setClassHoldCommentsError(
                          addressValidator(classHoldComments),
                        );
                      } else {
                        setClassHoldCommentsError("");
                      }
                    }}
                    value={scheduleId}
                    error={scheduleIdError}
                    disabled={
                      stepIndex == 1 &&
                      (customerDetails?.status === "Class Going" ||
                        customerDetails?.status === "Passedout process" ||
                        customerDetails?.status === "Completed")
                    }
                  />
                </div>
                {scheduleId == 6 ? (
                  <div
                    id="customer_scheduledatefield_container"
                    style={{ marginTop: "30px", marginBottom: "40px" }}
                  >
                    <CommonMuiDatePicker
                      label="Schedule Date"
                      required={true}
                      onChange={(value) => {
                        setClassStartDate(value);
                        setClassStartDateError(selectValidator(value));
                      }}
                      value={classStartDate}
                      error={classStartDateError}
                      disablePreviousDates={true}
                    />
                  </div>
                ) : (
                  ""
                )}

                {scheduleId == 3 || scheduleId == 10 ? (
                  <Row
                    id="customer_scheduledatefield_container"
                    style={{ marginTop: "20px", marginBottom: 40 }}
                  >
                    <Col span={24}>
                      <CommonTextArea
                        label="Comments"
                        required={false}
                        onChange={(e) => {
                          setClassHoldComments(e.target.value);
                          setClassHoldCommentsError(
                            addressValidator(e.target.value),
                          );
                        }}
                        value={classHoldComments}
                        error={classHoldCommentsError}
                      />
                    </Col>
                  </Row>
                ) : (
                  ""
                )}
              </>
            )}
          </div>
        ) : (
          <div className="customer_statusupdate_adddetailsContainer">
            <p className="customer_statusupdate_adddetails_heading">
              Update Class-Going Process
            </p>

            <Row gutter={16} style={{ marginTop: "20px" }}>
              <Col span={12}>
                <CommonSelectField
                  label="Schedule Status"
                  options={scheduleOptions2}
                  required={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    setScheduleId(value);
                    setScheduleIdError(selectValidator(value));
                    if (value != 1) {
                      setTimeout(() => {
                        const container = document.getElementById(
                          "customer_scheduledatefield_container",
                        );
                        container.scrollIntoView({ behavior: "smooth" });
                      }, 200);
                      setClassGoingCommentsError(
                        addressValidator(classGoingComments),
                      );
                      setAddattachmentError(
                        selectValidator(addattachmentBase64),
                      );
                    } else {
                      setClassGoingCommentsError("");
                      setAddattachmentError("");
                    }
                  }}
                  value={scheduleId}
                  error={scheduleIdError}
                />
              </Col>
              <Col span={12}>
                <CommonInputField
                  label="Class Going Percentage"
                  required={true}
                  type="number"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value < 0) {
                      setClassGoingPercentage(0);
                      return;
                    }
                    console.log("going perrrr", value);
                    setClassGoingPercentage(value);
                    setClassGoingPercentageError(percentageValidator(value));
                  }}
                  value={classGoingPercentage}
                  error={classGoingPercentageError}
                  onInput={(e) => {
                    if (e.target.value.length > 3) {
                      e.target.value = e.target.value.slice(0, 3);
                    }
                  }}
                  errorFontSize="9px"
                />
              </Col>
            </Row>

            {scheduleId == 1 || scheduleId == "" || scheduleId == null ? (
              ""
            ) : (
              <Row
                id="customer_scheduledatefield_container"
                gutter={16}
                style={{ marginTop: "40px" }}
              >
                <Col span={12}>
                  <div style={{ marginTop: "-25px" }}>
                    <CommonTextArea
                      label="Comments"
                      required={false}
                      onChange={(e) => {
                        setClassGoingComments(e.target.value);
                        setClassGoingCommentsError(
                          addressValidator(e.target.value),
                        );
                      }}
                      value={classGoingComments}
                      error={classGoingCommentsError}
                    />
                  </div>
                </Col>

                <Col span={12}>
                  <div style={{ marginTop: "16px" }}>
                    <ImageUploadCrop
                      label="Add Attachment"
                      aspect={1}
                      maxSizeMB={1}
                      required={true}
                      value={addattachmentBase64}
                      onChange={(base64) => setAddattachmentBase64(base64)}
                      onErrorChange={setAddattachmentError}
                    />
                    {addattachmentError && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#d32f2f",
                          marginTop: 4,
                        }}
                      >
                        {`Attachment ${addattachmentError}`}
                      </p>
                    )}
                  </div>
                </Col>
              </Row>
            )}
          </div>
        )}

        {drawerContentStatus === "Class Schedule" && (
          <div className="leadmanager_tablefiler_footer">
            <div
              className="leadmanager_submitlead_buttoncontainer"
              style={{ gap: "12px" }}
            >
              {stepIndex > 0 && (
                <Button onClick={prev} className="customer_stepperbuttons">
                  Previous
                </Button>
              )}

              {stepIndex == 1 &&
              (customerDetails?.status === "Class Going" ||
                customerDetails?.status === "Passedout process" ||
                customerDetails?.status === "Completed") ? (
                ""
              ) : (
                <>
                  {buttonLoading ? (
                    <button
                      className={"users_adddrawer_loadingcreatebutton"}
                      // style={{
                      //   ...(stepIndex === 0 ? { width: "120px" } : {}),
                      // }}
                      // style={{ width: "120px" }}
                    >
                      <CommonSpinner />
                    </button>
                  ) : (
                    <button
                      className={"users_adddrawer_createbutton"}
                      onClick={
                        stepIndex === 0
                          ? handleTrainerCoordination
                          : handleClassSchedule
                      }
                      // onClick={handleAssignTrainer}
                      // style={{ width: "120px" }}
                      // style={{
                      //   ...(stepIndex === 0 ? { width: "120px" } : {}),
                      // }}
                    >
                      Update
                    </button>
                  )}
                </>
              )}

              {stepIndex < 1 && (
                <Button
                  onClick={() => {
                    setStepIndex(stepIndex + 1);
                  }}
                  className={"customer_stepperbuttons"}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}

        <Modal
          open={isOpenClassCompleteModal}
          onCancel={() => setIsOpenClassCompleteModal(false)}
          footer={false}
          width="30%"
          zIndex={1100}
        >
          <p className="customer_classcompletemodal_heading">Are you sure?</p>
          <p className="customer_classcompletemodal_text">
            The Candidate{" "}
            <span style={{ color: "#333", fontWeight: 700, fontSize: "13px" }}>
              {customerDetails && customerDetails.name
                ? customerDetails.name
                : ""}
            </span>{" "}
            Has Completed The Class{" "}
            <span style={{ color: "#333", fontWeight: 700, fontSize: "13px" }}>
              100%
            </span>{" "}
            And Will Be Moved To The Passed Out Process.
          </p>
          <div className="customer_classcompletemodal_button_container">
            <Button
              className="customer_classcompletemodal_cancelbutton"
              onClick={() => setIsOpenClassCompleteModal(false)}
            >
              No
            </Button>
            {classCompleteLoading ? (
              <Button
                type="primary"
                className="customer_classcompletemodal_loading_okbutton"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                type="primary"
                className="customer_classcompletemodal_okbutton"
                onClick={handleCompleteClass}
              >
                Yes
              </Button>
            )}
          </div>
        </Modal>
      </>
    );
  },
);
export default ClassSchedule;
