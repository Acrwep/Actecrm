import React, { useState } from "react";
import { Button, Modal } from "antd";
import CommonSpinner from "../Common/CommonSpinner";
import { inserCustomerTrack, updateCustomerStatus } from "../ApiService/action";
import { formatToBackendIST } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";

export default function RevertTrainerApproval({
  open,
  onCancel,
  customerDetails,
  callgetCustomersApi,
}) {
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleCustomerStatus = async () => {
    setButtonLoading(true);
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const payload = {
      customer_ids: [
        {
          customer_id: customerDetails.id,
          status: "Trainer Approval",
          updated_at: formatToBackendIST(new Date()),
          updated_by: converAsJson?.user_id || "",
        },
      ],
    };
    try {
      await updateCustomerStatus(payload);
      handleCustomerTrack();
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleCustomerTrack = async () => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const payload = {
      customers: [
        {
          customer_id: customerDetails.id,
          status: "Reverted from Awaiting Class to Trainer Approval",
          updated_by:
            converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
          status_date: formatToBackendIST(today),
        },
      ],
    };

    try {
      await inserCustomerTrack(payload);
      setTimeout(() => {
        setButtonLoading(false);
        callgetCustomersApi();
        handleSecondCustomerTrack();
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      console.log("customer track error", error);
    }
  };

  const handleSecondCustomerTrack = async () => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const payload = {
      customers: [
        {
          customer_id: customerDetails.id,
          status: "Awaiting Trainer Approval",
          updated_by:
            converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
          status_date: formatToBackendIST(today),
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
    <Modal
      open={open}
      onCancel={onCancel}
      footer={false}
      width="30%"
      zIndex={1100}
    >
      <p className="customer_classcompletemodal_heading">Are you sure?</p>

      <p className="customer_classcompletemodal_text">
        You want to move the status for{" "}
        <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
          {customerDetails?.name}
        </span>{" "}
        from{" "}
        <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
          Awaiting Class
        </span>{" "}
        back to{" "}
        <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
          Trainer Approval?
        </span>{" "}
      </p>
      <div className="customer_classcompletemodal_button_container">
        <Button
          className="customer_classcompletemodal_cancelbutton"
          onClick={() => {
            setIsOpenApproveModal(false);
            setSelectedPaymentDetails(null);
          }}
        >
          No
        </Button>
        {buttonLoading ? (
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
              handleCustomerStatus();
            }}
          >
            Yes
          </Button>
        )}
      </div>
    </Modal>
  );
}
