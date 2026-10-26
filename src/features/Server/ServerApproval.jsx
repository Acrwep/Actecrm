import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Modal, Button } from "antd";
import CommonTextArea from "../Common/CommonTextArea";
import CommonSpinner from "../Common/CommonSpinner";
import { inserCustomerTrack, updateServerStatus } from "../ApiService/action";
import { addressValidator, formatToBackendIST } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import "./styles.css";
import PrismaZoom from "react-prismazoom";
import ServerTransCollapse from "./ServerTransCollapse";

const ServerApproval = forwardRef(
  ({ serverDetails, callgetServerApi }, ref) => {
    const [isOpenVerifyScreenshotModal, setIsOpenVerifyScreenshotModal] =
      useState(false);
    const [verificationScreenshot, setVerificationScreenshot] = useState("");

    const [isOpenApproveModal, setIsOpenApproveModal] = useState(false);
    const [verifyButtonLoading, setVerifyButtonLoading] = useState(false);
    const [isOpenRejectBox, setIsOpenRejectBox] = useState(false);
    const [rejectComment, setRejectComment] = useState("");
    const [rejectCommentError, setRejectCommentError] = useState("");
    const [serverTransId, setServerTransId] = useState(null);

    const handleApprovalReject = async () => {
      if (isOpenRejectBox == false) {
        setIsOpenRejectBox(true);
        setRejectCommentError(addressValidator(rejectComment));
        setTimeout(() => {
          const container = document.getElementById(
            "server_commentreject_container",
          );
          container.scrollIntoView({ behavior: "smooth" });
        }, 200);
        return;
      }

      const commentValidate = addressValidator(rejectComment);

      setRejectCommentError(commentValidate);

      if (commentValidate) return;

      setVerifyButtonLoading(true);

      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        server_raise_date:
          serverDetails && serverDetails.server_raise_date
            ? serverDetails.server_raise_date
            : null,
        status: "Approval Rejected",
        comments: rejectComment,
        rejected_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : "",
        rejected_date: formatToBackendIST(new Date()),
        server_trans_id: serverTransId,
      };
      try {
        await updateServerStatus(payload);
        setTimeout(() => {
          CommonMessage("success", "Approval Rejected");
          setVerifyButtonLoading(false);
          setServerTransId(null);
          handleCustomerTrack("Server Approval Rejected");
          callgetServerApi();
        }, 300);
      } catch (error) {
        setVerifyButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleServerStatus = async () => {
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      setVerifyButtonLoading(true);
      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        server_trans_id: serverTransId,
        server_raise_date:
          serverDetails && serverDetails.server_raise_date
            ? serverDetails.server_raise_date
            : null,
        status: "Approved",
        verified_date: formatToBackendIST(new Date()),
        verified_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : "",
      };
      try {
        await updateServerStatus(payload);
        setTimeout(() => {
          CommonMessage("success", "Server Approved Successfully");
          setVerifyButtonLoading(false);
          handleCustomerTrack("Server Approved");
          setIsOpenApproveModal(false);
          setServerTransId(null);
          callgetServerApi();
        }, 300);
      } catch (error) {
        setVerifyButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const payload = {
        customers: [
          {
            customer_id: serverDetails.customer_id,
            status: updatestatus,
            updated_by:
              converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
            status_date: formatToBackendIST(today),
            details:
              updatestatus === "Server Approval Rejected"
                ? {
                    comments: rejectComment,
                  }
                : {},
          },
        ],
      };
      try {
        await inserCustomerTrack(payload);
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    return (
      <div>
        <>
          <ServerTransCollapse
            serverDetails={serverDetails}
            handleApprovalReject={handleApprovalReject}
            setIsOpenApproveModal={setIsOpenApproveModal}
            setServerTransId={setServerTransId}
            isApprove={true}
            isAccounts={true}
          />

          {isOpenRejectBox && (
            <div
              className="customer_financereject_comment_container"
              id="server_commentreject_container"
            >
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

              <div className="customer_financereject_submitbutton_container">
                {verifyButtonLoading ? (
                  <Button
                    type="primary"
                    className="customer_financereject_loadingsubmitbutton"
                  >
                    <CommonSpinner />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    className="customer_financereject_submitbutton"
                    onClick={handleApprovalReject}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          )}
        </>

        <Modal
          open={isOpenApproveModal}
          onCancel={() => {
            setIsOpenApproveModal(false);
            setServerTransId(null);
          }}
          footer={false}
          width="30%"
          zIndex={1100}
        >
          <p className="customer_classcompletemodal_heading">Are you sure?</p>

          <p className="customer_classcompletemodal_text">
            You Want To Approve The Server{" "}
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
              {serverDetails?.trans_details?.[0]?.server_cost != null
                ? `₹${serverDetails.trans_details[0].server_cost}`
                : ""}
            </span>
          </p>
          <div className="customer_classcompletemodal_button_container">
            <Button
              className="customer_classcompletemodal_cancelbutton"
              onClick={() => {
                setIsOpenApproveModal(false);
                setServerTransId(null);
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
                onClick={() => {
                  handleServerStatus("Approved");
                }}
              >
                Yes
              </Button>
            )}
          </div>
        </Modal>

        {/* payment screenshot modal */}
        <Modal
          title="Verification Screenshot"
          open={isOpenVerifyScreenshotModal}
          onCancel={() => {
            setIsOpenVerifyScreenshotModal(false);
            setVerificationScreenshot("");
          }}
          footer={false}
          width="32%"
          className="customer_paymentscreenshot_modal"
        >
          <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
            <PrismaZoom>
              {verificationScreenshot ? (
                <img
                  src={`data:image/png;base64,${verificationScreenshot}`}
                  alt="payment screenshot"
                  className="customer_paymentscreenshot_image"
                />
              ) : (
                "-"
              )}
            </PrismaZoom>
          </div>
        </Modal>
      </div>
    );
  },
);

export default ServerApproval;
