import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Collapse, Modal, Button } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTextArea from "../Common/CommonTextArea";
import { LuIndianRupee } from "react-icons/lu";
import CommonSpinner from "../Common/CommonSpinner";
import {
  insertServerTrack,
  updateServerDetails,
  updateServerStatus,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import "./styles.css";

const ServerVerify = forwardRef(
  ({ serverDetails, setRejectButtonLoading, callgetServerApi }, ref) => {
    const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [verifyButtonLoading, setVerifyButtonLoading] = useState(false);
    const [isOpenRejectBox, setIsOpenRejectBox] = useState(false);
    const [rejectComment, setRejectComment] = useState("");
    const [rejectCommentError, setRejectCommentError] = useState("");

    useImperativeHandle(ref, () => ({
      handleServerVerify,
      handleVerificationReject,
    }));

    const handleServerVerify = () => {
      setIsOpenConfirmModal(true);
    };

    const handleVerificationReject = async () => {
      if (isOpenRejectBox == false) {
        setIsOpenRejectBox(true);
        setRejectCommentError(addressValidator(rejectComment));
        setTimeout(() => {
          const container = document.getElementById(
            "server_commentreject_container"
          );
          container.scrollIntoView({ behavior: "smooth" });
        }, 200);
        return;
      }

      const commentValidate = addressValidator(rejectComment);

      setRejectCommentError(commentValidate);

      if (commentValidate) return;

      setRejectButtonLoading(true);

      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        status: "Verification Rejected",
        comments: rejectComment,
        rejected_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : "",
      };
      try {
        await updateServerStatus(payload);
        setTimeout(() => {
          setRejectButtonLoading(false);
          handleServerTrack("Verification Rejected");
          callgetServerApi();
        }, 300);
      } catch (error) {
        setRejectButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    };

    const handleServerStatus = async () => {
      setVerifyButtonLoading(true);
      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        status: "Awaiting Approval",
      };
      try {
        await updateServerStatus(payload);
        setTimeout(() => {
          setVerifyButtonLoading(false);
          setIsOpenConfirmModal(false);
          handleServerTrack("Verified");
          callgetServerApi();
        }, 300);
      } catch (error) {
        setVerifyButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    };

    const handleServerTrack = async (trackStatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const rejectDetails = {
        reject_comment: rejectComment,
      };

      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        status: trackStatus,
        status_date: formatToBackendIST(today),
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        ...(trackStatus && trackStatus == "Verification Rejected"
          ? { details: rejectDetails }
          : {}),
      };

      try {
        await insertServerTrack(payload);
        if (trackStatus == "Verified") {
          handleSecondServerTrack();
        }
      } catch (error) {
        console.log("server track error", error);
      }
    };

    const handleSecondServerTrack = async () => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        status: "Awaiting Approval",
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(today),
      };
      try {
        await insertServerTrack(payload);
      } catch (error) {
        console.log("server track error", error);
      }
    };

    return (
      <div>
        <>
          <p className="customer_statusupdate_adddetails_heading">
            Add Details
          </p>
          <Row
            gutter={16}
            style={{
              marginTop: "14px",
            }}
          >
            <Col span={8}>
              <CommonInputField
                label="Server Name"
                required={true}
                disabled={true}
                value={
                  serverDetails && serverDetails.server_name
                    ? serverDetails.server_name
                    : "-"
                }
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Vendor Name"
                required={true}
                value={
                  serverDetails && serverDetails.vendor_id
                    ? serverDetails.vendor_id
                    : ""
                }
                disabled={true}
              />
            </Col>
            <Col span={8}>
              <CommonOutlinedInput
                label="Server Cost"
                type="number"
                required={true}
                value={
                  serverDetails && serverDetails.server_cost
                    ? serverDetails.server_cost
                    : ""
                }
                onInput={(e) => {
                  if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                  }
                }}
                icon={<LuIndianRupee size={16} />}
                disabled={true}
              />{" "}
            </Col>
          </Row>

          <Row
            gutter={16}
            style={{
              marginTop: "22px",
              marginBottom: isOpenRejectBox ? "0px" : "40px",
            }}
          >
            <Col span={8}>
              <CommonSelectField
                required={true}
                label="Duration"
                options={[
                  { id: 30, name: "30 Days" },
                  { id: 60, name: "60 Days" },
                  { id: 90, name: "90 Days" },
                ]}
                value={
                  serverDetails && serverDetails.duration
                    ? serverDetails.duration
                    : null
                }
                disabled={true}
              />
            </Col>
          </Row>

          {isOpenRejectBox && (
            <div id="server_commentreject_container">
              <Row
                gutter={16}
                style={{ marginTop: "20px", marginBottom: "30px" }}
              >
                <Col span={16}>
                  <CommonTextArea
                    label="Comments"
                    required={true}
                    onChange={(e) => {
                      setRejectComment(e.target.value);
                      setRejectCommentError(addressValidator(e.target.value));
                    }}
                    value={rejectComment}
                    error={rejectCommentError}
                  />
                </Col>
              </Row>
            </div>
          )}
        </>

        <Modal
          open={isOpenConfirmModal}
          onCancel={() => {
            setIsOpenConfirmModal(false);
          }}
          footer={false}
          width="30%"
          zIndex={1100}
        >
          <p className="customer_classcompletemodal_heading">Are you sure?</p>

          <p className="customer_classcompletemodal_text">
            You Want To Verify The Server{" "}
            <span style={{ fontWeight: 700, color: "#333", fontSize: "14px" }}>
              {serverDetails && serverDetails.server_name
                ? `${serverDetails.server_name}`
                : "-"}
            </span>{" "}
            for{" "}
            <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
              {serverDetails && serverDetails.name ? serverDetails.name : ""}
            </span>{" "}
            at a cost of{" "}
            <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
              {serverDetails && serverDetails.server_cost
                ? "₹" + serverDetails.server_cost
                : ""}
            </span>
          </p>
          <div className="customer_classcompletemodal_button_container">
            <Button
              className="customer_classcompletemodal_cancelbutton"
              onClick={() => {
                setIsOpenConfirmModal(false);
              }}
            >
              No
            </Button>
            {verifyButtonLoading ? (
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
                onClick={handleServerStatus}
              >
                Yes
              </Button>
            )}
          </div>
        </Modal>
      </div>
    );
  }
);

export default ServerVerify;
