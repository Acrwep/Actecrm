import React, { useState } from "react";
import { Col, Modal, Row, Timeline, Divider } from "antd";
import moment from "moment";
import { FaRegEye } from "react-icons/fa";
import PrismaZoom from "react-prismazoom";
import { BsPatchCheckFill } from "react-icons/bs";
import { LuCircleCheck } from "react-icons/lu";
import { FaRegCircleXmark } from "react-icons/fa6";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { CloseOutlined } from "@ant-design/icons";
import { GrUpdate } from "react-icons/gr";
import { BsStopCircle } from "react-icons/bs";
import { IoBan } from "react-icons/io5";
import { RiRefund2Fill } from "react-icons/ri";
import "./styles.css";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";
import { viewCertForCustomer, viewPaymentInvoice } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonInvoiceViewer from "../Common/CommonInvoiceViewer";

export default function CustomerHistory({ data = [], customerDetails }) {
  const [isOpenProofViewModal, setIsOpenProofViewModal] = useState(false);
  const [proofScreenshotBase64, setProofScreenshotBase64] = useState("");
  const [imgType, setImgType] = useState("");
  const [invoiceHtmlContent, setInvoiceHtmlContent] = useState("");
  const [isOpenViewInvoiceModal, setIsOpenViewInvoiceModal] = useState(false);
  const [isOpenViewCertModal, setIsOpenViewCertModal] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [certHtmlContent, setCertHtmlContent] = useState("");

  const getImageTypeFromBase64 = (base64) => {
    // remove data:image/...;base64, if exists
    const clean = base64.replace(/^data:image\/[a-z]+;base64,/, "");
    if (clean.startsWith("/9j/")) {
      setImgType("jpeg");
      return;
    }
    if (clean.startsWith("iVBORw0")) {
      setImgType("png");
      return "png";
    }
    return "unknown";
  };

  const handleViewIncoice = async (transactionId) => {
    console.log(customerDetails?.payments?.payment_trans);

    const findTrans =
      customerDetails?.payments?.payment_trans?.find(
        (f) => f.id === transactionId
      ) ?? null;

    console.log("findTrans", findTrans);

    const payload = {
      email:
        customerDetails && customerDetails.email ? customerDetails.email : "",
      name: customerDetails && customerDetails.name ? customerDetails.name : "",
      mobile:
        customerDetails && customerDetails.phone ? customerDetails.phone : "",
      convenience_fees: findTrans?.convenience_fees || "",
      gst_amount: customerDetails?.payments?.gst_amount
        ? customerDetails.payments.gst_amount
        : "",
      gst_percentage: customerDetails?.payments?.gst_percentage
        ? parseFloat(customerDetails.payments.gst_percentage)
        : "",
      invoice_date: findTrans?.invoice_date
        ? moment(findTrans.invoice_date).format("DD-MM-YYYY")
        : "",
      invoice_number: findTrans?.invoice_number || "",
      paid_amount: findTrans?.amount || "",
      payment_mode: findTrans?.payment_mode || "",
      total_amount: customerDetails?.payments?.total_amount
        ? customerDetails.payments.total_amount
        : "",
      balance_amount: findTrans?.balance_amount || "",
      course_name:
        customerDetails && customerDetails.course_name
          ? customerDetails.course_name
          : "",
      sub_total:
        customerDetails && customerDetails.primary_fees
          ? customerDetails.primary_fees
          : "",
    };

    try {
      const response = await viewPaymentInvoice(payload);
      console.log("view invoice response", response);
      const htmlTemplate = response?.data?.data;
      setInvoiceHtmlContent(htmlTemplate);
      setIsOpenViewInvoiceModal(true);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleViewCert = async () => {
    const payload = {
      customer_id: customerDetails.id,
    };
    try {
      const response = await viewCertForCustomer(payload);
      console.log("cert response", response);
      const htmlTemplate = response?.data?.data?.html_template;
      setCertHtmlContent(htmlTemplate);
      setTimeout(() => {
        setIsOpenViewCertModal(true);
      }, 300);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const items = data.map((item) => ({
    key: item.id,
    dot:
      item.status.includes("Verified") ||
      item.status.includes("Down") ||
      item.status.includes("Assigned") ||
      item.status.includes("Added") ||
      item.status.includes("Completed") ||
      item.status.includes("created") ||
      item.status.includes("Generated") ||
      item.status.includes("Scheduled") ? (
        <LuCircleCheck size={16} style={{ color: "green" }} />
      ) : item.status.includes("Going") || item.status.includes("Updated") ? (
        <GrUpdate size={14} style={{ color: "gray" }} />
      ) : item.status.includes("Hold") ? (
        <BsStopCircle size={16} style={{ color: "#ffa502" }} />
      ) : item.status.includes("Escalated") ||
        item.status.includes("Partially") ||
        item.status.includes("Demo") ||
        item.status.includes("Discontinued") ? (
        <IoBan size={16} style={{ color: "#d32f2f" }} />
      ) : item.status.includes("Refund") ? (
        <RiRefund2Fill style={{ color: "#d32f2f" }} />
      ) : item.status.includes("Rejected") ? (
        <FaRegCircleXmark style={{ color: "#d32f2f" }} />
      ) : item.status.includes("Awaiting") ||
        item.status.includes("Passedout") ? (
        <PiClockCounterClockwiseBold size={18} style={{ color: "gray" }} />
      ) : undefined,
    label: <span style={{ whiteSpace: "nowrap" }}>{item.status}</span>,
    children: (
      <>
        {item.status === "Payment Verified" ||
        item.status === "Part Payment Verified" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <button
              className="customer_history_viewproofbutton"
              style={{ marginTop: "12px" }}
              onClick={() => {
                handleViewIncoice(item?.details?.transaction_id ?? "0");
              }}
            >
              <FaRegEye size={16} /> View Payment Invoice
            </button>
          </div>
        ) : item.status === "Student Verified" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>

            <Row style={{ marginTop: "12px" }}>
              <Col span={5}>
                <p className="customer_history_comments">Comments: </p>
              </Col>
              <Col span={18}>
                <p style={{ color: "gray", fontWeight: 400, fontSize: "13px" }}>
                  {item.details.comments}
                </p>
              </Col>
            </Row>
            <button
              className="customer_history_viewproofbutton"
              style={{ marginTop: "12px" }}
              onClick={() => {
                getImageTypeFromBase64(item.details.proof_communication);
                setProofScreenshotBase64(item.details.proof_communication);
                setIsOpenProofViewModal(true);
              }}
            >
              <FaRegEye size={16} /> View Proof Screenshot
            </button>
          </div>
        ) : item.status === "Trainer Assigned" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Trainer Name
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.trainer_name}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Mode Of Class
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.mode_of_class}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">Comments</p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.comments}
                    </p>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <p className="customer_history_details_label">Commercial</p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.commercial}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Trainer Type
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.trainer_type}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={24}>
                    <button
                      className="customer_history_viewproofbutton"
                      onClick={() => {
                        getImageTypeFromBase64(
                          item.details.proof_communication
                        );
                        setProofScreenshotBase64(
                          item.details.proof_communication
                        );
                        setIsOpenProofViewModal(true);
                      }}
                    >
                      <FaRegEye size={16} /> View Proof Screenshot
                    </button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        ) : item.status === "Trainer Rejected" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Trainer Name
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details?.trainer_name || "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Commercial%
                    </p>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customer_history_details_text"
                      style={{
                        color:
                          item.details &&
                          item.details.trainer_commercial_percentage !== null
                            ? item.details.trainer_commercial_percentage < 18
                              ? "#3c9111" // green
                              : item.details.trainer_commercial_percentage >
                                  19 &&
                                item.details.trainer_commercial_percentage <= 22
                              ? "#ffa502" // orange
                              : item.details.trainer_commercial_percentage > 22
                              ? "#d32f2f" // red
                              : "inherit"
                            : "inherit", // fallback color if null
                        fontWeight: 500,
                      }}
                    >
                      {item.details.trainer_commercial_percentage + "%"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Trainer Type
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.trainer_type}
                    </p>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <p className="customer_history_details_label">Commercial</p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.trainer_commercial}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Mode Of Class
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.mode_of_class}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Rejected Reason
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.rejected_reason}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        ) : item.status === "Class Scheduled" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <p className="customer_history_comments">Schedule Date:</p>
              <p style={{ color: "gray", fontWeight: 400, fontSize: "13px" }}>
                {moment(item.details.class_start_date).format("DD/MM/YYYY")}
              </p>
            </div>
          </div>
        ) : item.status === "Class Going" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <p className="customer_history_comments">Class Going:</p>
              <p style={{ color: "gray", fontWeight: 400, fontSize: "13px" }}>
                {item.details
                  ? item.details.class_going_percentage + "%"
                  : "0%"}
              </p>
            </div>
          </div>
        ) : item.status === "Hold" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <p className="customer_history_comments">Comments:</p>
              <p style={{ color: "gray", fontWeight: 400, fontSize: "13px" }}>
                {item.details && item.details.comments
                  ? item.details.comments
                  : "-"}
              </p>
            </div>
          </div>
        ) : item.status === "Class Completed" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <p className="customer_history_comments">100% Class Completed</p>
            </div>
          </div>
        ) : item.status === "Google Review Added" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <button
              className="customer_history_viewproofbutton"
              onClick={() => {
                getImageTypeFromBase64(item.details.google_review);
                setProofScreenshotBase64(item.details.google_review);
                setIsOpenProofViewModal(true);
              }}
            >
              <FaRegEye size={16} /> View Google Review
            </button>
          </div>
        ) : item.status === "Certificate Generated" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <button
              className="customer_history_viewproofbutton"
              onClick={() => {
                handleViewCert();
              }}
            >
              <FaRegEye size={16} /> View Certificate
            </button>
          </div>
        ) : item.status === "Linkedin Review Added" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>

            <button
              className="customer_history_viewproofbutton"
              onClick={() => {
                getImageTypeFromBase64(item.details.linkedin_review);
                setProofScreenshotBase64(item.details.linkedin_review);
                setIsOpenProofViewModal(true);
              }}
            >
              <FaRegEye size={16} /> View Linkedin Review
            </button>
          </div>
        ) : (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
          </div>
        )}
      </>
    ),
  }));

  return (
    <div>
      <Timeline mode="left" items={items} />

      <Modal
        title="Preview"
        open={isOpenProofViewModal}
        onCancel={() => {
          setIsOpenProofViewModal(false);
          setImgType("");
          setProofScreenshotBase64("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {proofScreenshotBase64 ? (
              <img
                src={`data:image/${imgType};base64,${proofScreenshotBase64}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>

      {/* certificate view modal */}
      <Modal
        open={isOpenViewCertModal}
        onCancel={() => {
          setIsOpenViewCertModal(false);
          setCertificateName("");
        }}
        footer={false}
        width="64%"
        style={{ marginBottom: "20px" }}
        className="customer_certificate_viewmodal"
        zIndex={1100}
        centered
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

      {/* invoice view modal */}
      <Modal
        open={isOpenViewInvoiceModal}
        onCancel={() => {
          setIsOpenViewInvoiceModal(false);
        }}
        footer={false}
        width="64%"
        style={{ marginBottom: "20px" }}
        zIndex={1100}
        centered
      >
        <CommonInvoiceViewer
          htmlTemplate={invoiceHtmlContent}
          candidateName={
            customerDetails && customerDetails.name ? customerDetails.name : "-"
          }
        />
      </Modal>
    </div>
  );
}
