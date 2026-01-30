import React, {
  useState,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { Row, Col, Button, Modal } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonMuiMonthPicker from "../Common/CommonMuiMonthPicker";
import CommonSpinner from "../Common/CommonSpinner";
import { CloseOutlined } from "@ant-design/icons";
import {
  addressValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import { viewPreCertForCustomer } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";

const PreCertificate = forwardRef(
  ({ customerDetails, setUpdateButtonLoading, callgetCustomersApi }, ref) => {
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

    useEffect(() => {
      setCertName(customerDetails?.name ?? "");
      setCertCourseName(customerDetails?.course_name ?? "");
    }, []);

    useImperativeHandle(ref, () => ({
      handleGeneratePreCert,
    }));

    const handleGeneratePreCert = async () => {
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
        location: certLocation,
        certificate_number: "000PRECERT2601",
      };

      setUpdateButtonLoading(true);
      try {
        const response = await viewPreCertForCustomer(payload);
        console.log("cert response", response);
        setCertHtmlContent(response?.data?.data?.html_template);
        CommonMessage("success", "Certificate Generated Successfully");
        setTimeout(() => {
          setUpdateButtonLoading(false);
          setIsOpenViewCertModal(true);
          //   callgetCustomersApi();
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

    return (
      <div className="customer_statusupdate_adddetailsContainer">
        <p className="customer_statusupdate_adddetails_heading">Add Details</p>

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
              />
            </Col>
            <Col
              span={12}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            ></Col>
          </Row>
        </>

        {/* view cert modal */}
        <Modal
          open={isOpenViewCertModal}
          onCancel={() => {
            setIsOpenViewCertModal(false);
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
            candidateName={certName}
          />
        </Modal>
      </div>
    );
  },
);

export default PreCertificate;
