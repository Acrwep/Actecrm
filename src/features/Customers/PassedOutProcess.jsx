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
  updateCertForCustomer,
  updateCustomerStatus,
  updatefeedbackForCustomer,
  viewCertForCustomer,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";
import { useSelector } from "react-redux";

const { Step } = Steps;

const PassesOutProcess = forwardRef(
  (
    {
      customerDetails,
      customerIdsFromBatch = [],
      stepIndex,
      setStepIndex,
      isCertGenerated,
      generateCertLoading,
      setGenerateCertLoading,
      setLinkedinLoading,
      setUpdateButtonLoading,
      callgetCustomersApi,
    },
    ref,
  ) => {
    const permissions = useSelector((state) => state.userpermissions);

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
    const [updateCertLoading, setUpdateCertLoading] = useState(false);
    const [lastUpdatedCertDetails, setLastUpdatedCertDetails] = useState(null);

    useEffect(() => {
      setCourseDuration(customerDetails?.cer_course_duration);
      setCertMonth(customerDetails?.cer_course_completion_month);
      if (customerDetails.google_review) {
        setGoogleFeedbackBase64(customerDetails.google_review);
      }
      if (customerDetails.linkedin_review) {
        setLinkedinFeedbackBase64(customerDetails.linkedin_review);
      }
      setCertName(
        customerDetails.cer_customer_name
          ? customerDetails.cer_customer_name
          : customerDetails.name,
      );
      setCertCourseName(
        customerDetails.cer_course_name
          ? customerDetails.cer_course_name
          : customerDetails.course_name,
      );
      setCertLocation(customerDetails.cer_location);
    }, []);

    useImperativeHandle(ref, () => ({
      handleGoogleReview,
      handleCertificateDetails,
      handleLinkedinReview,
      handleCompleteProcess,
    }));

    const handleGoogleReview = async (isFromUpdateBtn = false) => {
      const baseDetails = lastUpdatedCertDetails || customerDetails;
      const initialGoogleReview = baseDetails?.google_review || "";
      const currentGoogleReview = googleFeedbackBase64 || "";

      if (isFromUpdateBtn && initialGoogleReview === currentGoogleReview) {
        CommonMessage("info", "No changes made");
        return;
      }

      if (isGoogleReviewChange && initialGoogleReview !== currentGoogleReview) {
        setLinkedinLoading(true);
        const today = new Date();
        const customers =
          customerIdsFromBatch && customerIdsFromBatch.length > 0
            ? customerIdsFromBatch.map((item) => ({
                customer_id: item.customer_id,
                linkedin_review:
                  baseDetails?.linkedin_review || linkedinFeedbackBase64,
                google_review: currentGoogleReview,
                course_duration: baseDetails?.course_duration,
                course_completed_date: baseDetails?.course_completion_date,
                review_updated_date: formatToBackendIST(today),
              }))
            : [
                {
                  customer_id: baseDetails?.id,
                  linkedin_review:
                    baseDetails?.linkedin_review || linkedinFeedbackBase64,
                  google_review: currentGoogleReview,
                  course_duration: baseDetails?.course_duration,
                  course_completed_date: baseDetails?.course_completion_date,
                  review_updated_date: formatToBackendIST(today),
                },
              ];

        const payload = { customers };
        try {
          await updatefeedbackForCustomer(payload);
          setIsGoogleReviewChange(false);
          setLinkedinLoading(false);
          setLastUpdatedCertDetails({
            ...baseDetails,
            google_review: currentGoogleReview,
          });
          handleCustomerTrack("Google Review Added");
          if (isFromUpdateBtn) {
            CommonMessage("success", "Google Review Updated Successfully");
          } else {
            setStepIndex(1);
          }
        } catch (error) {
          setLinkedinLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      } else {
        if (!isFromUpdateBtn) {
          setStepIndex(1);
        }
      }
    };

    const handleCertificateDetails = async () => {
      if (customerDetails.is_certificate_generated === 0) {
        CommonMessage(
          "error",
          "Please Generate Certificate. Before Go To Next Step",
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

      const baseDetails = lastUpdatedCertDetails || customerDetails;
      const isUpdate = baseDetails?.is_certificate_generated === 1;

      if (isUpdate) {
        const initialCourseDuration = baseDetails?.cer_course_duration || "";
        const initialCertMonth =
          baseDetails?.cer_course_completion_month || null;
        const initialCertName =
          baseDetails?.cer_customer_name || baseDetails?.name || "";
        const initialCertCourseName =
          baseDetails?.cer_course_name || baseDetails?.course_name || "";
        const initialCertLocation = baseDetails?.cer_location || "";

        const currentCourseDuration = courseDuration || "";
        const currentCertMonth = certMonth || null;
        const currentCertName = certName || "";
        const currentCertCourseName = certCourseName || "";
        const currentCertLocation = certLocation || "";

        if (
          initialCourseDuration == currentCourseDuration &&
          initialCertMonth == currentCertMonth &&
          initialCertName == currentCertName &&
          initialCertCourseName == currentCertCourseName &&
          initialCertLocation == currentCertLocation
        ) {
          CommonMessage("info", "No changes made");
          return;
        }
      }

      const today = new Date();
      const payload = {
        ...(customerDetails && customerDetails.is_certificate_generated == 1
          ? { id: customerDetails?.certificate_id }
          : {}),
        ...(customerDetails && customerDetails.is_certificate_generated == 1
          ? { certificate_number: customerDetails?.certificate_number }
          : {}),
        customer_id: customerDetails.id,
        customer_name: certName,
        course_name: certCourseName,
        course_duration: courseDuration,
        course_completion_month: certMonth,
        current_location: certLocation,
        updated_date: formatToBackendIST(today),
      };

      if (customerDetails.is_certificate_generated == 1) {
        setUpdateCertLoading(true);
      } else {
        setGenerateCertLoading(true);
      }
      try {
        isUpdate
          ? await updateCertForCustomer(payload)
          : await generateCertForCustomer(payload);

        CommonMessage(
          "success",
          isUpdate
            ? "Certificate Updated Successfully"
            : "Certificate Generated Successfully",
        );

        setTimeout(() => {
          handleCustomerTrack(
            isUpdate ? "Certificate Updated" : "Certificate Generated",
          );

          setLastUpdatedCertDetails({
            ...(lastUpdatedCertDetails || customerDetails),
            cer_course_duration: courseDuration,
            cer_course_completion_month: certMonth,
            cer_customer_name: certName,
            cer_course_name: certCourseName,
            cer_location: certLocation,
            is_certificate_generated: 1,
          });

          if (!isUpdate) {
            callgetCustomersApi(false, true);
          }
        }, 300);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      } finally {
        setGenerateCertLoading(false);
        setUpdateCertLoading(false);
      }
    };

    const handleViewCert = async () => {
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
            "Something went wrong. Try again later",
        );
      }
    };

    const handleLinkedinReview = async (isFromUpdateBtn = false) => {
      const baseDetails = lastUpdatedCertDetails || customerDetails;
      const initialLinkedinReview = baseDetails?.linkedin_review || "";
      const currentLinkedinReview = linkedinFeedbackBase64 || "";

      if (initialLinkedinReview === currentLinkedinReview) {
        CommonMessage("info", "No changes made");
        return;
      }

      if (baseDetails?.is_certificate_generated === 0) {
        CommonMessage("error", "Please Generate Certificate");
        return;
      }
      setLinkedinLoading(true);

      const today = new Date();

      const customers =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              linkedin_review: currentLinkedinReview,
              google_review: baseDetails?.google_review || googleFeedbackBase64,
              course_duration: null,
              course_completed_date: null,
              review_updated_date: formatToBackendIST(today),
            }))
          : [
              {
                customer_id: baseDetails?.id,
                linkedin_review: currentLinkedinReview,
                google_review:
                  baseDetails?.google_review || googleFeedbackBase64,
                course_duration: null,
                course_completed_date: null,
                review_updated_date: formatToBackendIST(today),
              },
            ];

      const payload = { customers };

      try {
        await updatefeedbackForCustomer(payload);
        setLastUpdatedCertDetails({
          ...baseDetails,
          linkedin_review: currentLinkedinReview,
        });
        if (isFromUpdateBtn) {
          CommonMessage("success", "Linkedin Review Updated Successfully");
        } else {
          CommonMessage("success", "Updated Successfully");
        }
        setTimeout(async () => {
          setLinkedinLoading(false);
          handleCustomerTrack("Linkedin Review Added");
        }, 300);
      } catch (error) {
        setLinkedinLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCompleteProcess = async () => {
      if (customerDetails.is_certificate_generated === 0) {
        CommonMessage("error", "Please Generate Certificate");
        return;
      }
      setUpdateButtonLoading(true);
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const customer_ids =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              status: "Completed",
              updated_at: formatToBackendIST(new Date()),
              updated_by: converAsJson?.user_id || "",
            }))
          : [
              {
                customer_id: customerDetails.id,
                status: "Completed",
                updated_at: formatToBackendIST(new Date()),
                updated_by: converAsJson?.user_id || "",
              },
            ];

      const statusPayload = { customer_ids };
      try {
        await updateCustomerStatus(statusPayload);
        handleCustomerTrack("Completed");
        setTimeout(() => {
          handleSendCertByEmail();
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
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const baseDetails = lastUpdatedCertDetails || customerDetails;

      const googleReviewDetails = {
        google_review: {
          previous_value: baseDetails?.google_review || "",
          new_value: googleFeedbackBase64 || "",
        },
      };

      const linkedinReviewDetails = {
        linkedin_review: {
          previous_value: baseDetails?.linkedin_review || "",
          new_value: linkedinFeedbackBase64 || "",
        },
      };

      let certificateDetails = {};
      if (
        updatestatus === "Certificate Updated" ||
        updatestatus === "Certificate Generated"
      ) {
        if (updatestatus === "Certificate Generated") {
          certificateDetails = {
            cer_course_duration: {
              previous_value: "",
              new_value: courseDuration || "",
            },
            cer_course_completion_month: {
              previous_value: "",
              new_value: certMonth || "",
            },
            cer_customer_name: {
              previous_value: "",
              new_value: certName || "",
            },
            cer_course_name: {
              previous_value: "",
              new_value: certCourseName || "",
            },
            cer_location: { previous_value: "", new_value: certLocation || "" },
          };
        } else {
          const initialCourseDuration = baseDetails?.cer_course_duration || "";
          const currentCourseDuration = courseDuration || "";
          if (initialCourseDuration != currentCourseDuration) {
            certificateDetails["cer_course_duration"] = {
              previous_value: initialCourseDuration,
              new_value: currentCourseDuration,
            };
          }

          const initialCertMonth =
            baseDetails?.cer_course_completion_month || null;
          const currentCertMonth = certMonth || null;
          if (initialCertMonth != currentCertMonth) {
            certificateDetails["cer_course_completion_month"] = {
              previous_value: initialCertMonth || "",
              new_value: currentCertMonth || "",
            };
          }

          const initialCertName =
            baseDetails?.cer_customer_name || baseDetails?.name || "";
          const currentCertName = certName || "";
          if (initialCertName != currentCertName) {
            certificateDetails["cer_customer_name"] = {
              previous_value: initialCertName,
              new_value: currentCertName,
            };
          }

          const initialCertCourseName =
            baseDetails?.cer_course_name || baseDetails?.course_name || "";
          const currentCertCourseName = certCourseName || "";
          if (initialCertCourseName != currentCertCourseName) {
            certificateDetails["cer_course_name"] = {
              previous_value: initialCertCourseName,
              new_value: currentCertCourseName,
            };
          }

          const initialCertLocation = baseDetails?.cer_location || "";
          const currentCertLocation = certLocation || "";
          if (initialCertLocation != currentCertLocation) {
            certificateDetails["cer_location"] = {
              previous_value: initialCertLocation,
              new_value: currentCertLocation,
            };
          }
        }
      }

      const getDetailsObj = (status) => {
        if (status === "Google Review Added")
          return { details: googleReviewDetails };
        if (status === "Linkedin Review Added")
          return { details: linkedinReviewDetails };
        if (
          status === "Certificate Updated" ||
          status === "Certificate Generated"
        ) {
          return Object.keys(certificateDetails).length > 0
            ? { details: certificateDetails }
            : {};
        }
        return {};
      };

      const customers =
        customerIdsFromBatch && customerIdsFromBatch.length > 0
          ? customerIdsFromBatch.map((item) => ({
              customer_id: item.customer_id,
              status: updatestatus,
              updated_by:
                converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
              status_date: formatToBackendIST(today),
              ...getDetailsObj(updatestatus),
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
                ...getDetailsObj(updatestatus),
              },
            ];

      const payload = { customers };

      try {
        await inserCustomerTrack(payload);
        setTimeout(() => {
          if (
            updatestatus === "Google Review Added" ||
            updatestatus === "Linkedin Review Added" ||
            updatestatus === "Certificate Generated" ||
            updatestatus === "Certificate Updated"
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

        {stepIndex == 1 ? (
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
                  disabled={
                    customerDetails?.is_certificate_generated === 1 &&
                    !permissions.includes("Update Certificate Details")
                  }
                  height={"36px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"1.5px"}
                  errorFontSize={"9px"}
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
                  errorFontSize={"11px"}
                  disabled={
                    customerDetails?.is_certificate_generated === 1 &&
                    !permissions.includes("Update Certificate Details")
                  }
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
                  disabled={
                    customerDetails?.is_certificate_generated === 1 &&
                    !permissions.includes("Update Certificate Details")
                  }
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
                  disabled={
                    customerDetails?.is_certificate_generated === 1 &&
                    !permissions.includes("Update Certificate Details")
                  }
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
                  disabled={
                    customerDetails?.is_certificate_generated === 1 &&
                    !permissions.includes("Update Certificate Details")
                  }
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
                  <div style={{ display: "flex", gap: "12px" }}>
                    {updateCertLoading ? (
                      <Button className="customer_viewcert_loadingbutton">
                        <CommonSpinner />
                      </Button>
                    ) : (
                      <>
                        {permissions.includes("Update Certificate Details") && (
                          <Button
                            className="customer_viewcert_button"
                            onClick={handleGenerateCert}
                          >
                            Update Certificate
                          </Button>
                        )}
                      </>
                    )}

                    {generateCertLoading ? (
                      <Button className="customer_viewcert_loadingbutton">
                        <CommonSpinner />
                      </Button>
                    ) : (
                      <Button
                        className="customer_viewcert_button"
                        onClick={handleViewCert}
                      >
                        View Certificate
                      </Button>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </>
        ) : (
          ""
        )}

        {stepIndex == 2 ? (
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
  },
);
export default PassesOutProcess;
