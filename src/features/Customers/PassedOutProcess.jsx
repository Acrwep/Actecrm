import React, { useState, useEffect } from "react";
import { Row, Col, Button, Modal } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiMonthPicker from "../Common/CommonMuiMonthPicker";
import CommonSpinner from "../Common/CommonSpinner";
import { CloseOutlined } from "@ant-design/icons";
import {
  addressValidator,
  formatToBackendIST,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import {
  generateCertForCustomer,
  getCustomerById,
  inserCustomerTrack,
  sendCustomerCertificate,
  updateCertForCustomer,
  updateCustomerStatus,
  viewCertForCustomer,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";
import { useSelector } from "react-redux";

export default function PassesOutProcess({
  customer_details,
  customerIdsFromBatch = [],
  callgetCustomersApi,
}) {
  const permissions = useSelector((state) => state.userpermissions);

  const [customerDetails, setCustomerDetails] = useState(null);
  const [courseDuration, setCourseDuration] = useState("");
  const [courseDurationError, setCourseDurationError] = useState("");
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
  const [buttonLoading, setButtonLoading] = useState({
    generate_or_update: false,
    view_certificate: false,
    move_to_completed: false,
  });

  useEffect(() => {
    setCourseDuration(customer_details?.cer_course_duration);
    setCertMonth(customer_details?.cer_course_completion_month);
    setCertName(
      customer_details.cer_customer_name
        ? customer_details.cer_customer_name
        : customer_details.name,
    );
    setCertCourseName(
      customer_details.cer_course_name
        ? customer_details.cer_course_name
        : customer_details.course_name,
    );
    setCertLocation(customer_details.cer_location);
    setCustomerDetails(customer_details);
  }, [customer_details]);

  const getParticularCustomerDetails = async () => {
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

    const isUpdate = customerDetails?.is_certificate_generated === 1;

    if (isUpdate) {
      const initialCourseDuration = customerDetails?.cer_course_duration || "";
      const initialCertMonth =
        customerDetails?.cer_course_completion_month || null;
      const initialCertName =
        customerDetails?.cer_customer_name || customerDetails?.name || "";
      const initialCertCourseName =
        customerDetails?.cer_course_name || customerDetails?.course_name || "";
      const initialCertLocation = customerDetails?.cer_location || "";

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
      ...(customer_details && customer_details.is_certificate_generated == 1
        ? { id: customer_details?.certificate_id }
        : {}),
      ...(customer_details && customer_details.is_certificate_generated == 1
        ? { certificate_number: customer_details?.certificate_number }
        : {}),
      customer_id: customer_details.id,
      customer_name: certName,
      course_name: certCourseName,
      course_duration: courseDuration,
      course_completion_month: certMonth,
      current_location: certLocation,
      updated_date: formatToBackendIST(today),
    };

    setButtonLoading({
      generate_or_update: true,
    });
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
      }, 300);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    } finally {
      setButtonLoading({
        generate_or_update: true,
      });
    }
  };

  const handleViewCert = async () => {
    setButtonLoading({
      view_certificate: true,
    });
    const payload = {
      customer_id: customer_details.id,
    };
    try {
      const response = await viewCertForCustomer(payload);
      console.log("cert response", response);
      const htmlTemplate = response?.data?.data?.html_template;
      setCertHtmlContent(htmlTemplate);
      setTimeout(() => {
        setButtonLoading({
          view_certificate: false,
        });
        setIsOpenViewCertModal(true);
      }, 300);
    } catch (error) {
      setButtonLoading({
        view_certificate: false,
      });
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleCompleteProcess = async () => {
    if (customerDetails.is_certificate_generated === 0) {
      CommonMessage("error", "Please Generate Certificate");
      return;
    }
    setButtonLoading({
      move_to_completed: true,
    });
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    const customer_ids = [
      {
        customer_id: customer_details.id,
        status: "Completed",
        updated_at: formatToBackendIST(new Date()),
        updated_by: converAsJson?.user_id || "",
      },
    ];

    const statusPayload = { customer_ids };
    try {
      await updateCustomerStatus(statusPayload);
      CommonMessage("success", "Candidate Moved to Completed Successfully");
      handleCustomerTrack("Completed");
      setTimeout(() => {
        handleSendCertByEmail();
      }, 300);
    } catch (error) {
      setButtonLoading({
        move_to_completed: false,
      });
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleSendCertByEmail = async () => {
    const payload = {
      email: customer_details.email,
      customer_id: customer_details.id,
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

    let certificateDetails = {};

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
      const initialCourseDuration = customerDetails?.cer_course_duration || "";
      const currentCourseDuration = courseDuration || "";
      if (initialCourseDuration != currentCourseDuration) {
        certificateDetails["cer_course_duration"] = {
          previous_value: initialCourseDuration,
          new_value: currentCourseDuration,
        };
      }

      const initialCertMonth =
        customerDetails?.cer_course_completion_month || null;
      const currentCertMonth = certMonth || null;
      if (initialCertMonth != currentCertMonth) {
        certificateDetails["cer_course_completion_month"] = {
          previous_value: initialCertMonth || "",
          new_value: currentCertMonth || "",
        };
      }

      const initialCertName =
        customerDetails?.cer_customer_name || customerDetails?.name || "";
      const currentCertName = certName || "";
      if (initialCertName != currentCertName) {
        certificateDetails["cer_customer_name"] = {
          previous_value: initialCertName,
          new_value: currentCertName,
        };
      }

      const initialCertCourseName = customerDetails?.cer_course_name || "";
      const currentCertCourseName = certCourseName || "";
      if (initialCertCourseName != currentCertCourseName) {
        certificateDetails["cer_course_name"] = {
          previous_value: initialCertCourseName,
          new_value: currentCertCourseName,
        };
      }

      const initialCertLocation = customerDetails?.cer_location || "";
      const currentCertLocation = certLocation || "";
      if (initialCertLocation != currentCertLocation) {
        certificateDetails["cer_location"] = {
          previous_value: initialCertLocation,
          new_value: currentCertLocation,
        };
      }
    }

    const getDetailsObj = (status) => {
      return Object.keys(certificateDetails).length > 0
        ? { details: certificateDetails }
        : {};
    };

    const customers = [
      {
        customer_id: customer_details.id,
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
      if (updatestatus === "Completed") {
        setButtonLoading({
          move_to_completed: false,
        });
        callgetCustomersApi();
      } else {
        getParticularCustomerDetails();
      }
    } catch (error) {
      console.log("customer track error", error);
    }
  };

  return (
    <>
      <div className="customer_statusupdate_adddetailsContainer">
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
                customer_details?.is_certificate_generated === 1 &&
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
                customer_details?.is_certificate_generated === 1 &&
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
                customer_details?.is_certificate_generated === 1 &&
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
                customer_details?.is_certificate_generated === 1 &&
                !permissions.includes("Update Certificate Details")
              }
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
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
                customer_details?.is_certificate_generated === 1 &&
                !permissions.includes("Update Certificate Details")
              }
            />
          </Col>
        </Row>
      </div>

      <div className="leadmanager_tablefiler_footer">
        <div
          className="leadmanager_submitlead_buttoncontainer"
          style={{ gap: "12px" }}
        >
          {customerDetails?.is_certificate_generated === 0 ? (
            <>
              {buttonLoading.generate_or_update ? (
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
              {buttonLoading.generate_or_update ? (
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

              {buttonLoading.view_certificate ? (
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

              {/* Move to Completed */}
              {customer_details?.status !== "Completed" &&
                (buttonLoading.move_to_completed ? (
                  <Button className="customer_complete_loadingpassedoutbutton">
                    <CommonSpinner />
                  </Button>
                ) : (
                  <Button
                    className="customer_complete_passedoutbutton"
                    onClick={handleCompleteProcess}
                  >
                    Move to Completed
                  </Button>
                ))}
            </div>
          )}
        </div>
      </div>

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
              : customer_details && customer_details.name
                ? customer_details.name
                : "-"
          }
        />
      </Modal>
    </>
  );
}
