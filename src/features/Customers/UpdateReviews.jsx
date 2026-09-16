import React, { useState, useEffect } from "react";
import { Row, Col, Button, Modal, Steps } from "antd";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonSpinner from "../Common/CommonSpinner";
import { formatToBackendIST } from "../Common/Validation";
import {
  getCustomerById,
  inserCustomerTrack,
  updatefeedbackForCustomer,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";

const { Step } = Steps;

export default function UpdateReviews({ customer_details }) {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [googleFeedbackBase64, setGoogleFeedbackBase64] = useState("");
  const [linkedinFeedbackBase64, setLinkedinFeedbackBase64] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);

  const prev = () => setStepIndex(stepIndex - 1);

  useEffect(() => {
    console.log("customer detailsss", customer_details);
    setCustomerDetails(customer_details);
    setGoogleFeedbackBase64(customer_details?.google_review);
    setLinkedinFeedbackBase64(customer_details?.linkedin_review);
  }, [customer_details]);

  const getParticularCustomerDetails = async () => {
    // setIsStatusUpdateDrawerLoading(true);
    try {
      const response = await getCustomerById(customerDetails?.id);
      console.log("particular customer response", response);
      const particular_customer_details = response?.data?.data;
      setCustomerDetails(particular_customer_details);
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleGoogleReview = async () => {
    const initialGoogleReview = customerDetails?.google_review || "";
    const currentGoogleReview = googleFeedbackBase64 || "";

    if (initialGoogleReview === currentGoogleReview) {
      CommonMessage("info", "No changes made");
      return;
    }

    setButtonLoading(true);
    const today = new Date();
    const customers = [
      {
        customer_id: customerDetails?.id,
        linkedin_review: customerDetails?.linkedin_review,
        google_review: currentGoogleReview,
        course_duration: customerDetails?.course_duration,
        course_completed_date: customerDetails?.course_completion_date,
        review_updated_date: formatToBackendIST(today),
      },
    ];

    const payload = { customers };
    try {
      await updatefeedbackForCustomer(payload);
      CommonMessage("success", "Google Review Updated Successfully");
      handleCustomerTrack("Google Review Added");
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleLinkedinReview = async () => {
    const initialLinkedinReview = customerDetails?.linkedin_review || "";
    const currentLinkedinReview = linkedinFeedbackBase64 || "";

    if (initialLinkedinReview === currentLinkedinReview) {
      CommonMessage("info", "No changes made");
      return;
    }

    setButtonLoading(true);
    const today = new Date();
    const customers = [
      {
        customer_id: customerDetails?.id,
        linkedin_review: currentLinkedinReview,
        google_review: customerDetails?.google_review,
        course_duration: customerDetails?.course_duration,
        course_completed_date: customerDetails?.course_completion_date,
        review_updated_date: formatToBackendIST(today),
      },
    ];

    const payload = { customers };
    try {
      await updatefeedbackForCustomer(payload);
      CommonMessage("success", "Linkedin Review Updated Successfully");
      handleCustomerTrack("Linkedin Review Added");
    } catch (error) {
      setButtonLoading(false);
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

    const googleReviewDetails = {
      google_review: {
        previous_value: customerDetails?.google_review || "",
        new_value: googleFeedbackBase64 || "",
      },
    };

    const linkedinReviewDetails = {
      linkedin_review: {
        previous_value: customerDetails?.linkedin_review || "",
        new_value: linkedinFeedbackBase64 || "",
      },
    };

    const getDetailsObj = (status) => {
      if (status === "Google Review Added")
        return { details: googleReviewDetails };
      if (status === "Linkedin Review Added")
        return { details: linkedinReviewDetails };
      return {};
    };

    const customers = [
      {
        customer_id: customerDetails.id,
        status: updatestatus,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(today),
        ...getDetailsObj(updatestatus),
      },
    ];

    const payload = { customers };

    try {
      await inserCustomerTrack(payload);
      getParticularCustomerDetails();
    } catch (error) {
      console.log("customer track error", error);
    }
  };

  return (
    <>
      <div className="customer_statusupdate_adddetailsContainer">
        <Steps current={stepIndex} size="small">
          <Step
            title={
              <span style={{ display: "flex", alignItems: "center" }}>
                Add G-Review
                <FcGoogle size={18} style={{ marginLeft: 6 }} />
              </span>
            }
          />
          <Step
            title={
              <span style={{ display: "flex", alignItems: "center" }}>
                Add L-Review
                <FaLinkedin
                  color="#0a66c2"
                  size={18}
                  style={{ marginLeft: 6 }}
                />
              </span>
            }
          />
        </Steps>
        {stepIndex === 0 && (
          <div style={{ marginTop: "30px", marginBottom: "20px" }}>
            <ImageUploadCrop
              label="Google Review Screenshot"
              aspect={1}
              maxSizeMB={1}
              required={false}
              value={googleFeedbackBase64}
              onChange={(base64) => {
                setGoogleFeedbackBase64(base64);
              }}
            />
          </div>
        )}

        {stepIndex == 1 && (
          <div style={{ marginTop: "30px", marginBottom: "20px" }}>
            <ImageUploadCrop
              label="Linkedin Review Screenshot"
              aspect={1}
              maxSizeMB={1}
              required={false}
              value={linkedinFeedbackBase64}
              onChange={(base64) => {
                setLinkedinFeedbackBase64(base64);
              }}
            />
          </div>
        )}
      </div>

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

          <>
            {buttonLoading ? (
              <button
                className={"customer_loading_linkedin_update_button"}
                style={{
                  ...(stepIndex === 0 ? { width: "150px" } : {}),
                }}
              >
                <CommonSpinner />
              </button>
            ) : (
              <button
                className={"customer_linkedin_update_button"}
                style={{
                  ...(stepIndex === 0 ? { width: "150px" } : {}),
                }}
                onClick={
                  stepIndex === 0 ? handleGoogleReview : handleLinkedinReview
                }
              >
                {stepIndex == 0 ? "Update G-Review" : "Update Linkedin"}
              </button>
            )}
          </>

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
    </>
  );
}
