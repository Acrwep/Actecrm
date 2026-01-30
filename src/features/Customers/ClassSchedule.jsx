import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Row, Col, Button, Modal } from "antd";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTextArea from "../Common/CommonTextArea";
import CommonInputField from "../Common/CommonInputField";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonSpinner from "../Common/CommonSpinner";
import {
  addressValidator,
  formatToBackendIST,
  percentageValidator,
  selectValidator,
} from "../Common/Validation";
import {
  classScheduleForCustomer,
  inserCustomerTrack,
  updateClassGoingForCustomer,
  updateCustomerStatus,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";

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

    useImperativeHandle(ref, () => ({
      handleClassSchedule,
      handleUpdateClassGoing,
    }));

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
                }))
              : [
                  {
                    customer_id: customerDetails.id,
                    status: "Passedout process",
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
      const customer_ids =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              status: updatestatus,
            }))
          : [
              {
                customer_id: customerDetails.id,
                status: updatestatus,
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
            <p className="customer_statusupdate_adddetails_heading">
              Add Details
            </p>

            <div
              style={{
                marginTop: "16px",
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
