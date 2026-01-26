import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Row, Col, Button, Modal } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import CommonTextArea from "../Common/CommonTextArea";
import { inserCustomerTrack, updateCustomerStatus } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";

const OthersHandling = forwardRef(
  (
    {
      customerDetails,
      customerIdsFromBatch = [],
      callgetCustomersApi,
      setUpdateButtonLoading,
    },
    ref,
  ) => {
    const othersOptions = [
      { id: "Videos Given", name: "Videos Given" },
      { id: "Demo Completed", name: "Demo Completed" },
      { id: "Hold", name: "Hold" },
    ];
    const [othersId, setOthersId] = useState(null);
    const [othersIdError, setOthersIdError] = useState("");
    const [comments, setComments] = useState("");
    const [commentsError, setCommentsError] = useState("");

    useImperativeHandle(ref, () => ({
      handleSubmit,
    }));

    const handleSubmit = async () => {
      const othersIdValidate = selectValidator(othersId);
      const commentValidate = addressValidator(comments);

      setOthersIdError(othersIdValidate);
      setCommentsError(commentValidate);

      if (othersIdValidate || commentValidate) return;

      setUpdateButtonLoading(true);
      handleCustomerStatus(othersId);
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
                customer_ids: customerDetails.id,
                status: updatestatus,
              },
            ];

      const payload = { customer_ids };
      try {
        await updateCustomerStatus(payload);
        CommonMessage("success", "Updated");
        handleCustomerTrack(updatestatus);
      } catch (error) {
        setUpdateButtonLoading(false);
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

      const deetails = {
        comments: comments,
      };

      const customers =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              status: updatestatus,
              updated_by:
                converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
              status_date: formatToBackendIST(today),
              details: deetails,
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
                details: deetails,
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
      } finally {
        setUpdateButtonLoading(false);
      }
    };

    return (
      <div className="customer_statusupdate_adddetailsContainer">
        <p className="customer_statusupdate_adddetails_heading">Add Details</p>

        <div style={{ marginTop: "16px" }}>
          <CommonSelectField
            label="Select Option"
            options={othersOptions}
            required={true}
            onChange={(e) => {
              const value = e.target.value;
              setOthersId(value);
              setOthersIdError(selectValidator(value));
            }}
            value={othersId}
            error={othersIdError}
          />
        </div>

        <div
          style={{
            marginTop: "22px",
            marginBottom: "30px",
            position: "relative",
          }}
        >
          <CommonTextArea
            label="Comments"
            required={false}
            onChange={(e) => {
              setComments(e.target.value);
              setCommentsError(addressValidator(e.target.value));
            }}
            value={comments}
            error={commentsError}
          />
        </div>
      </div>
    );
  },
);

export default OthersHandling;
