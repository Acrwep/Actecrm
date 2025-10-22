import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col } from "antd";
import CommonTextArea from "../Common/CommonTextArea";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import {
  inserCustomerTrack,
  updateCustomerStatus,
  verifyCustomer,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";

const StudentVerify = forwardRef(
  ({ customerDetails, setUpdateButtonLoading, callgetCustomersApi }, ref) => {
    const [studentVerifyProofBase64, setStudentVerifyProofBase64] =
      useState("");
    const [studentVerifyProofError, setStudentVerifyProofError] = useState("");
    const [studentVerifyComments, setStudentVerifyComments] = useState("");
    const [studentVerifyCommentsError, setStudentVerifyCommentsError] =
      useState("");

    useImperativeHandle(ref, () => ({
      handleStudentVerify,
    }));

    const handleStudentVerify = async () => {
      const commentValidate = addressValidator(studentVerifyComments);
      const studentVerifyProofValidate = selectValidator(
        studentVerifyProofBase64
      );

      setStudentVerifyProofError(studentVerifyProofValidate);
      setStudentVerifyCommentsError(commentValidate);

      if (studentVerifyProofValidate || commentValidate) return;
      setUpdateButtonLoading(true);

      const payload = {
        customer_id: customerDetails.id,
        proof_communication: studentVerifyProofBase64,
        comments: studentVerifyComments,
        is_satisfied: 1,
      };

      try {
        await verifyCustomer(payload);
        CommonMessage("success", "Updated Successfully");
        setTimeout(async () => {
          const payload = {
            customer_id: customerDetails.id,
            status: "Awaiting Trainer",
          };
          try {
            await updateCustomerStatus(payload);
            handleCustomerTrack("Student Verified");
            setTimeout(() => {
              handleSecondCustomerTrack("Awaiting Trainer");
            }, 300);
          } catch (error) {
            CommonMessage(
              "error",
              error?.response?.data?.message ||
                "Something went wrong. Try again later"
            );
          }
        }, 300);
      } catch (error) {
        setUpdateButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    };

    const handleCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const studentVerifiedDetails = {
        comments: studentVerifyComments,
        proof_communication: studentVerifyProofBase64,
      };

      const payload = {
        customer_id: customerDetails.id,
        status: updatestatus,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(today),
        details: studentVerifiedDetails,
      };

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

      const payload = {
        customer_id: customerDetails.id,
        status: updatestatus,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(today),
      };
      try {
        await inserCustomerTrack(payload);
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    return (
      <div className="customer_statusupdate_adddetailsContainer">
        <p className="customer_statusupdate_adddetails_heading">Add Details</p>

        <Row style={{ marginTop: "6px" }}>
          <Col span={24}>
            <CommonTextArea
              label="Comments"
              required={true}
              onChange={(e) => {
                setStudentVerifyComments(e.target.value);
                setStudentVerifyCommentsError(addressValidator(e.target.value));
              }}
              value={studentVerifyComments}
              error={studentVerifyCommentsError}
            />

            <div style={{ marginTop: "40px", marginBottom: "20px" }}>
              <ImageUploadCrop
                label="Proof Communication"
                aspect={1}
                maxSizeMB={1}
                required={true}
                value={studentVerifyProofBase64}
                onChange={(base64) => setStudentVerifyProofBase64(base64)}
                onErrorChange={setStudentVerifyProofError}
              />
              {studentVerifyProofError && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#d32f2f",
                    marginTop: 4,
                  }}
                >
                  {`Proof Screenshot ${studentVerifyProofError}`}
                </p>
              )}
            </div>
          </Col>
        </Row>
      </div>
    );
  }
);
export default StudentVerify;
