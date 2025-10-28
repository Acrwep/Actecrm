import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Button, Steps, Modal } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiMonthPicker from "../Common/CommonMuiMonthPicker";
import CommonSpinner from "../Common/CommonSpinner";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { CloseOutlined } from "@ant-design/icons";
import {
  addressValidator,
  formatToBackendIST,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import {
  generateCertForCustomer,
  inserCustomerTrack,
  sendCustomerCertificate,
  updateCustomerStatus,
  updatefeedbackForCustomer,
  viewCertForCustomer,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";

const { Step } = Steps;

const PassesOutProcess = forwardRef(
  (
    {
      customerDetails,
      stepIndex,
      setStepIndex,
      isCertGenerated,
      generateCertLoading,
      setGenerateCertLoading,
      setUpdateButtonLoading,
      callgetCustomersApi,
    },
    ref
  ) => {
    const [callCusTrack, setCallCusTrack] = useState(false);
    const [googleFeedbackBase64, setGoogleFeedbackBase64] = useState("");
    const [linkedinFeedbackBase64, setLinkedinFeedbackBase64] = useState("");

    const [courseDuration, setCourseDuration] = useState("");
    const [courseDurationError, setCourseDurationError] = useState("");
    const [isGoogleReviewChange, setIsGoogleReviewChange] = useState(false);
    const [certName, setCertName] = useState("");
    const [certNameError, setCertNameError] = useState("");
    const [certCourseName, setCertCourseName] = useState("");
    const [certCourseNameError, setCertCourseNameError] = useState("");
    const [certMonth, setCertMonth] = useState(null);
    const [certMonthError, setCertMonthError] = useState("");
    const certLocationOptions = [
      { id: "Chennai", name: "Chennai" },
      { id: "Bengaluru", name: "Bengaluru" },
    ];
    const [certLocation, setCertLocation] = useState("");
    const [certLocationError, setCertLocationError] = useState("");
    const [certHtmlContent, setCertHtmlContent] = useState("");
    const [isOpenViewCertModal, setIsOpenViewCertModal] = useState(false);
    const [certificateName, setCertificateName] = useState("");

    useEffect(() => {
      setCourseDuration(customerDetails.cer_course_duration);
      setCertMonth(customerDetails.cer_course_completion_month);
      if (customerDetails.google_review) {
        setGoogleFeedbackBase64(customerDetails.google_review);
      }
      setCertName(customerDetails.name);
      setCertCourseName(customerDetails.course_name);
      setCertLocation(customerDetails.cer_location);
    }, []);

    useImperativeHandle(ref, () => ({
      handleGoogleReview,
      handleCertificateDetails,
      handleCompleteProcess,
    }));

    const handleGoogleReview = async () => {
      if (isGoogleReviewChange) {
        const today = new Date();
        const payload = {
          customer_id: customerDetails.id,
          linkedin_review: customerDetails.linkedin_review
            ? customerDetails.linkedin_review
            : linkedinFeedbackBase64,
          google_review: googleFeedbackBase64,
          course_duration: customerDetails.course_duration,
          course_completed_date: customerDetails.course_completion_date,
          review_updated_date: formatToBackendIST(today),
        };
        try {
          await updatefeedbackForCustomer(payload);
          callgetCustomersApi(false, false);
          if (callCusTrack) {
            handleCustomerTrack("Google Review Added");
            setCallCusTrack(false);
          }
          // CommonMessage("success", "Updated Successfully");
          setStepIndex(1);
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later"
          );
        }
      } else {
        setStepIndex(1);
      }
    };

    const handleCertificateDetails = async () => {
      if (customerDetails.is_certificate_generated === 0) {
        CommonMessage(
          "error",
          "Please Generate Certificate. Before Go To Next Step"
        );
        return;
      } else {
        setStepIndex(2);
      }
    };

    const handleGenerateCert = async () => {
      const courseDurationValidate = selectValidator(courseDuration);
      const certMonthValidate = selectValidator(certMonth);
      const certNameValidate = nameValidator(certName);
      const certCourseValidate = addressValidator(certCourseName);
      const certLocationValidate = selectValidator(certLocation);

      setCourseDurationError(courseDurationValidate);
      setCertMonthError(certMonthValidate);
      setCertNameError(certNameValidate);
      setCertCourseNameError(certCourseValidate);
      setCertLocationError(certLocationValidate);

      if (
        courseDurationValidate ||
        certMonthValidate ||
        certNameValidate ||
        certCourseValidate ||
        certLocationValidate
      )
        return;

      const payload = {
        customer_id: customerDetails.id,
        customer_name: certName,
        course_name: certCourseName,
        course_duration: courseDuration,
        course_completion_month: certMonth,
        current_location: certLocation,
      };

      setGenerateCertLoading(true);
      try {
        const response = await generateCertForCustomer(payload);
        console.log("cert response", response);
        CommonMessage("success", "Certificate Generated Successfully");
        setTimeout(() => {
          handleCustomerTrack("Certificate Generated");
          callgetCustomersApi(false, true);
        }, 300);
      } catch (error) {
        setGenerateCertLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    };

    const handleViewCert = async (customer_id) => {
      setGenerateCertLoading(true);
      const payload = {
        customer_id: customerDetails.id,
      };
      try {
        const response = await viewCertForCustomer(payload);
        console.log("cert response", response);
        const htmlTemplate = response?.data?.data?.html_template;
        setCertHtmlContent(htmlTemplate);
        setTimeout(() => {
          setGenerateCertLoading(false);
          setIsOpenViewCertModal(true);
        }, 300);
      } catch (error) {
        setGenerateCertLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    };

    const handleCompleteProcess = async () => {
      if (customerDetails.is_certificate_generated === 0) {
        CommonMessage("error", "Please Generate Certificate");
        return;
      }
      setUpdateButtonLoading(true);

      const today = new Date();
      const payload = {
        customer_id: customerDetails.id,
        linkedin_review: linkedinFeedbackBase64,
        google_review: customerDetails.google_review
          ? customerDetails.google_review
          : googleFeedbackBase64,
        course_duration: null,
        course_completed_date: null,
        review_updated_date: formatToBackendIST(today),
      };
      try {
        await updatefeedbackForCustomer(payload);
        CommonMessage("success", "Updated Successfully");
        setTimeout(async () => {
          const payload = {
            customer_id: customerDetails.id,
            status: "Completed",
          };
          try {
            await updateCustomerStatus(payload);
            handleCustomerTrack("Linkedin Review Added");
            setTimeout(() => {
              handleSecondCustomerTrack("Completed");
              handleSendCertByEmail();
            }, 300);
          } catch (error) {
            CommonMessage(
              "error",
              error?.response?.data?.details ||
                "Something went wrong. Try again later"
            );
          }
        }, 300);
      } catch (error) {
        setUpdateButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later"
        );
      }
    };

    const handleSendCertByEmail = async () => {
      const payload = {
        email: customerDetails.email,
        customer_id: customerDetails.id,
      };
      try {
        await sendCustomerCertificate(payload);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later"
        );
      }
    };

    const handleCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const googleReviewDetails = {
        google_review: googleFeedbackBase64,
      };

      const linkedinReviewDetails = {
        linkedin_review: linkedinFeedbackBase64,
      };

      const payload = {
        customer_id: customerDetails.id,
        status: updatestatus,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(today),
        ...(updatestatus === "Google Review Added"
          ? { details: googleReviewDetails }
          : updatestatus === "Linkedin Review Added"
          ? { details: linkedinReviewDetails }
          : {}),
      };

      try {
        await inserCustomerTrack(payload);
        setTimeout(() => {
          if (
            updatestatus === "Google Review Added" ||
            updatestatus === "Certificate Generated"
          ) {
            return;
          }
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
        <Steps current={stepIndex} size="small">
          <Step
            title={
              <span style={{ display: "flex", alignItems: "center" }}>
                Add G-Review
                <FcGoogle size={18} style={{ marginLeft: 6 }} />
              </span>
            }
          />
          <Step title="Certificate Details" />
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

        {stepIndex === 0 ? (
          <div style={{ marginTop: "30px", marginBottom: "20px" }}>
            <ImageUploadCrop
              label="Google Review Screenshot"
              aspect={1}
              maxSizeMB={1}
              required={false}
              value={googleFeedbackBase64}
              onChange={(base64) => {
                setIsGoogleReviewChange(true);
                setGoogleFeedbackBase64(base64);
              }}
            />
          </div>
        ) : (
          ""
        )}

        {stepIndex === 1 ? (
          <>
            <Row gutter={16} style={{ marginTop: "16px" }}>
              <Col span={12}>
                <CommonOutlinedInput
                  label="Course Duration"
                  type="number"
                  required={true}
                  onChange={(e) => {
                    setCourseDuration(e.target.value);
                    setCourseDurationError(selectValidator(e.target.value));
                  }}
                  value={courseDuration}
                  error={courseDurationError}
                  onInput={(e) => {
                    if (e.target.value.length > 3) {
                      e.target.value = e.target.value.slice(0, 3);
                    }
                  }}
                  icon={<p style={{ fontSize: "11px" }}>Months</p>}
                  disabled={customerDetails?.is_certificate_generated === 1}
                />
              </Col>
              <Col span={12}>
                <CommonMuiMonthPicker
                  label="Course Completion Month"
                  required={true}
                  onChange={(value) => {
                    console.log(value, "monthhh");
                    setCertMonth(value);
                    setCertMonthError(selectValidator(value));
                  }}
                  value={certMonth}
                  error={certMonthError}
                  disabled={customerDetails?.is_certificate_generated === 1}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "30px" }}>
              <Col span={12}>
                <CommonInputField
                  label="Candidate Name"
                  required={true}
                  onChange={(e) => {
                    setCertName(e.target.value);
                    setCertNameError(nameValidator(e.target.value));
                  }}
                  value={certName}
                  error={certNameError}
                  disabled={customerDetails?.is_certificate_generated === 1}
                />
              </Col>
              <Col span={12}>
                <CommonInputField
                  label="Course Name"
                  required={true}
                  onChange={(e) => {
                    setCertCourseName(e.target.value);
                    setCertCourseNameError(addressValidator(e.target.value));
                  }}
                  value={certCourseName}
                  error={certCourseNameError}
                  disabled={customerDetails?.is_certificate_generated === 1}
                />
              </Col>
            </Row>

            <Row
              gutter={16}
              style={{ marginTop: "30px", marginBottom: "30px" }}
            >
              <Col span={12}>
                <CommonSelectField
                  label="Location"
                  required={true}
                  onChange={(e) => {
                    setCertLocation(e.target.value);
                    setCertLocationError(selectValidator(e.target.value));
                  }}
                  options={certLocationOptions}
                  value={certLocation}
                  error={certLocationError}
                  disabled={customerDetails?.is_certificate_generated === 1}
                />
              </Col>
              <Col
                span={12}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                {isCertGenerated === false ? (
                  <>
                    {generateCertLoading ? (
                      <Button className="customer_generatecert_loading_button">
                        <CommonSpinner />
                      </Button>
                    ) : (
                      <Button
                        className="customer_generatecert_button"
                        onClick={handleGenerateCert}
                      >
                        Generate Certificate
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {generateCertLoading ? (
                      <Button className="customer_viewcert_loadingbutton">
                        <CommonSpinner />
                      </Button>
                    ) : (
                      <Button
                        className="customer_viewcert_button"
                        onClick={() => handleViewCert(null)}
                      >
                        View Certificate
                      </Button>
                    )}
                  </>
                )}
              </Col>
            </Row>
          </>
        ) : (
          ""
        )}

        {stepIndex === 2 ? (
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
        ) : (
          ""
        )}

        <Modal
          open={isOpenViewCertModal}
          onCancel={() => {
            setIsOpenViewCertModal(false);
            setCertificateName("");
          }}
          footer={false}
          width="64%"
          style={{ marginBottom: "20px", top: 10 }}
          className="customer_certificate_viewmodal"
          zIndex={1100}
          // centered={true}
          closeIcon={
            <span
              style={{
                color: "#ffffff", // white color
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              <CloseOutlined />
            </span>
          }
        >
          <CommonCertificateViewer
            htmlTemplate={certHtmlContent}
            candidateName={
              certificateName
                ? certificateName
                : customerDetails && customerDetails.name
                ? customerDetails.name
                : "-"
            }
          />
        </Modal>
      </div>
    );
  }
);
export default PassesOutProcess;
