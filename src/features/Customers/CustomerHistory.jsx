import React, { useState, useEffect } from "react";
import {
  Col,
  Modal,
  Row,
  Timeline,
  Divider,
  Drawer,
  Upload,
  Skeleton,
} from "antd";
import moment from "moment";
import { FaRegEye, FaRegUser } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline, IoLocationOutline } from "react-icons/io5";
import PrismaZoom from "react-prismazoom";
import { LuCircleCheck } from "react-icons/lu";
import { FaRegCircleXmark } from "react-icons/fa6";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { CloseOutlined } from "@ant-design/icons";
import { GrUpdate } from "react-icons/gr";
import { BsStopCircle } from "react-icons/bs";
import { IoBan } from "react-icons/io5";
import { RiRefund2Fill } from "react-icons/ri";
import { LuSend } from "react-icons/lu";
import { SlActionUndo } from "react-icons/sl";
import { PiSealCheckFill } from "react-icons/pi";
import "./styles.css";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";
import {
  getCustomersPaymentHistory,
  viewCertForCustomer,
  viewPaymentInvoice,
  getCustomerById,
  getCustomerFullHistory,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonInvoiceViewer from "../Common/CommonInvoiceViewer";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonSpinner from "../Common/CommonSpinner";

export default function CustomerHistory({ customerId, isOpen, onClose }) {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false);
  const [viewCustomerLoading, setViewCustomerLoading] = useState(false);

  const [isOpenProofViewModal, setIsOpenProofViewModal] = useState(false);
  const [proofScreenshotBase64, setProofScreenshotBase64] = useState("");
  const [imgType, setImgType] = useState("");
  const [invoiceHtmlContent, setInvoiceHtmlContent] = useState("");
  const [isOpenViewInvoiceModal, setIsOpenViewInvoiceModal] = useState(false);
  const [isOpenViewCertModal, setIsOpenViewCertModal] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [certHtmlContent, setCertHtmlContent] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  //payment usestates
  const [paymentFullDetails, setPaymentFullDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    if (isOpen && customerId) {
      getCustomerData(customerId);
    } else {
      setCustomerDetails(null);
      setCustomerHistory([]);
      setPaymentFullDetails(null);
      setPaymentHistory([]);
    }
  }, [isOpen, customerId]);

  const getCustomerData = async (id) => {
    setViewCustomerLoading(true);
    setCustomerHistoryLoading(true);
    try {
      const response = await getCustomerById(id);
      const details = response?.data?.data || null;
      setCustomerDetails(details);

      const historyResponse = await getCustomerFullHistory(id);
      const history = historyResponse?.data?.data || [];
      setCustomerHistory(history.reverse());

      if (details?.lead_id) {
        getPaymentHistoryData(details.lead_id);
      }
    } catch (error) {
      console.log("Error fetching customer history:", error);
      setCustomerDetails(null);
      setCustomerHistory([]);
    } finally {
      setViewCustomerLoading(false);
      setCustomerHistoryLoading(false);
    }
  };

  const getPaymentHistoryData = async (leadId) => {
    if (!leadId) return;
    try {
      const response = await getCustomersPaymentHistory(leadId);
      const payment_full_details = response?.data?.data || null;
      const payment_history = response?.data?.data?.payment_trans || [];

      setPaymentFullDetails(payment_full_details);
      setPaymentHistory(payment_history);
    } catch (error) {
      setPaymentFullDetails(null);
      setPaymentHistory([]);
      console.log("particular customer payment history error", error);
    }
  };

  const handlePreview = async (file) => {
    if (file.url) {
      setPreviewImage(file.url);
      setPreviewOpen(true);
      return;
    }
    setPreviewOpen(true);
    const rawFile = file.originFileObj || file;
    const reader = new FileReader();
    reader.readAsDataURL(rawFile);
    reader.onload = () => {
      const dataUrl = reader.result; // Full base64 data URL like "data:image/jpeg;base64,..."
      console.log("urlllll", dataUrl);
      setPreviewImage(dataUrl); // Show in Modal
      setPreviewOpen(true);
    };
  };

  const getHistoryStatusColor = (status) => {
    if (
      [
        "Verified",
        "Assigned",
        "Completed",
        "Going",
        "Added",
        "created",
        "Generated",
        "Scheduled",
      ].some((s) => status.includes(s))
    ) {
      return "green";
    }
    if (status.includes("Awaiting")) return "gray";
    if (
      ["Escalated", "Rejected", "Partially", "Discontinued"].some((s) =>
        status.includes(s),
      )
    ) {
      return "#d32f2f";
    }
    return "#000"; // default black
  };

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
    console.log(paymentFullDetails, transactionId);

    const findTrans =
      paymentHistory?.find((f) => f.id === transactionId) ?? null;

    console.log("findTrans", findTrans);

    const payload = {
      email:
        customerDetails && customerDetails.email ? customerDetails.email : "",
      name: customerDetails && customerDetails.name ? customerDetails.name : "",
      mobile:
        customerDetails && customerDetails.phone ? customerDetails.phone : "",
      convenience_fees: findTrans?.convenience_fees || "",
      gst_amount: paymentFullDetails?.gst_amount
        ? paymentFullDetails.gst_amount
        : "",
      gst_percentage: paymentFullDetails?.gst_percentage
        ? parseFloat(paymentFullDetails.gst_percentage)
        : "",
      invoice_date: findTrans?.invoice_date
        ? moment(findTrans.invoice_date).format("DD-MM-YYYY")
        : "",
      invoice_number: findTrans?.invoice_number || "",
      paid_amount: findTrans?.amount || "",
      payment_mode: findTrans?.payment_mode || "",
      total_amount: paymentFullDetails?.total_amount
        ? paymentFullDetails.total_amount
        : "",
      balance_amount:
        findTrans.balance_amount != undefined ||
        findTrans.balance_amount != null
          ? parseFloat(findTrans?.balance_amount).toFixed(2)
          : "",
      course_name:
        customerDetails && customerDetails.course_name
          ? customerDetails.course_name
          : "",
      sub_total:
        customerDetails && customerDetails.primary_fees
          ? customerDetails.primary_fees
          : "",
      place_of_supply:
        customerDetails && customerDetails.place_of_supply
          ? customerDetails.place_of_supply
          : "",
      address:
        customerDetails && customerDetails.address
          ? customerDetails.address
          : "",
      state_code:
        customerDetails && customerDetails.state_code
          ? customerDetails.state_code
          : "",
      gst_number:
        customerDetails && customerDetails.gst_number
          ? customerDetails.gst_number
          : "",
      invoice_type:
        customerDetails && customerDetails.invoice_type
          ? customerDetails.invoice_type
          : "",
    };
    console.log("payload", payload);
    // return;
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
          "Something went wrong. Try again later",
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
          "Something went wrong. Try again later",
      );
    }
  };

  const items = customerHistory.map((item) => ({
    key: item.id,
    dot:
      item.status.includes("Google verified") ||
      item.status.includes("Google Review Verified") ||
      item.status.includes("Linkedin verified") ||
      item.status.includes("Linkedin verified") ? (
        <PiSealCheckFill size={17} />
      ) : item.status.includes("Reverted") ? (
        <SlActionUndo size={16} style={{ color: "gray" }} />
      ) : item.status.includes("Verified") ||
        item.status.includes("Form Submitted") ||
        item.status.includes("Class Completion Acknowledged") ||
        item.status.includes("Down") ||
        item.status.includes("Paid") ||
        item.status.includes("Assigned") ||
        item.status.includes("Claim") ||
        item.status.includes("Added") ||
        item.status.includes("Completed") ||
        item.status.includes("Approved") ||
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
      ) : item.status.includes("Class Completion Acknowledgement Sent") ||
        item.status.includes("Class Completion Acknowledgeme") ||
        item.status.includes("Trainer Payment Claim Form Sent") ? (
        <LuSend size={16} style={{ color: "gray" }} />
      ) : undefined,
    label: (
      <span
        style={{
          whiteSpace: "nowrap",
          textWrap: "auto",
          fontSize: "12.5px",
          textTransform: "capitalize",
        }}
      >
        {item.status}
      </span>
    ),
    children: (
      <>
        {item.status == "Form Submitted" ||
        item.status == "Class Completion Acknowledged" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{"  "}
              <span style={{ color: "gray" }}>Customer</span>
            </p>
          </div>
        ) : item.status == "Trainer Payment Claim Submitted" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{"  "}
              <span style={{ color: "gray" }}>Trainer</span>
            </p>
          </div>
        ) : item.status === "Payment Verified" ||
          item.status === "Part Payment Verified" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
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
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
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
        ) : item.status === "Trainer Assigned" ||
          item.status === "Trainer Updated" ||
          item.status === "Trainer Re-Assigned" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
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
                      {item.details.trainer_name
                        ? item.details.trainer_name
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Mode Of Training
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
                      {"₹" + item.details.commercial}
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
                          item.details.proof_communication,
                        );
                        setProofScreenshotBase64(
                          item.details.proof_communication,
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
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
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
                                  item.details.trainer_commercial_percentage <=
                                    22
                                ? "#ffa502" // orange
                                : item.details.trainer_commercial_percentage >
                                    22
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
                      {"₹" + item.details.trainer_commercial}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Mode Of Training
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
                      Rejection Reason
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
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
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
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <p className="customer_history_comments">Class Going:</p>
              <p style={{ color: "gray", fontWeight: 400, fontSize: "13px" }}>
                {item.details
                  ? item.details.class_going_percentage
                    ? item.details.class_going_percentage + "%"
                    : "0%"
                  : "0%"}
              </p>
            </div>
          </div>
        ) : item.status === "Hold" ||
          item.status === "Trainer Approval Rejected" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
              :
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <p className="customer_history_comments">
                {item.status === "Hold" ? "Comments:" : "Rejected Reason:"}
              </p>
              <p style={{ color: "gray", fontWeight: 400, fontSize: "13px" }}>
                {item.details && item.details.comments
                  ? item.details.comments
                  : item.details.rejected_reason
                    ? item.details.rejected_reason
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
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <p className="customer_history_comments">100% Class Completed</p>
            </div>
          </div>
        ) : item.status === "Escalated" ||
          item.status === "Partially Closed" ||
          item.status === "Discontinued" ||
          item.status === "Refund" ||
          item.status === "Videos Given" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
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
                getImageTypeFromBase64(item.details.attachment);
                setProofScreenshotBase64(item.details.attachment);
                setIsOpenProofViewModal(true);
              }}
            >
              <FaRegEye size={16} /> View Attachment
            </button>
          </div>
        ) : (item.status === "Customer Details Updated" ||
            item.status === "Certificate Updated" ||
            item.status === "Certificate Generated" ||
            item.status === "Google Review Added" ||
            item.status === "Linkedin Review Added") &&
          item.details ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
            </p>
            {(() => {
              const isLegacy = Object.values(item.details).every(
                (val) => typeof val === "string",
              );
              if (isLegacy) {
                return Object.keys(item.details).map((key) => {
                  const detail = item.details[key];
                  if (
                    key === "google_review" ||
                    key === "linkedin_review" ||
                    key === "attachment"
                  ) {
                    return (
                      <button
                        key={key}
                        className="customer_history_viewproofbutton"
                        style={{ marginTop: "12px" }}
                        onClick={() => {
                          getImageTypeFromBase64(detail);
                          setProofScreenshotBase64(detail);
                          setIsOpenProofViewModal(true);
                        }}
                      >
                        <FaRegEye size={16} /> View{" "}
                        {key
                          .split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </button>
                    );
                  }
                  return null;
                });
              }

              return (
                <div
                  style={{
                    marginTop: "12px",
                    border: "1px solid #f0f0f0",
                    padding: "8px 10px 10px 10px",
                    borderRadius: "6px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "12px",
                      marginBottom: "8px",
                      borderBottom: "1px solid #e0e0e0",
                      paddingBottom: "4px",
                    }}
                  >
                    Changes Made:
                  </p>
                  {Object.keys(item.details).map((key) => {
                    const detail = item.details[key];
                    return (
                      <div
                        key={key}
                        style={{
                          marginTop: "6px",
                          fontSize: "12px",
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            textTransform: "capitalize",
                            minWidth: "120px",
                          }}
                        >
                          {key.replace(/_/g, " ")}:
                        </span>
                        {key === "profile_image" ||
                        key === "signature_image" ||
                        key === "google_review" ||
                        key === "linkedin_review" ? (
                          <>
                            {detail.previous_value ? (
                              <img
                                src={
                                  detail.previous_value.startsWith("data:") ||
                                  detail.previous_value.startsWith("http")
                                    ? detail.previous_value
                                    : `data:image/png;base64,${detail.previous_value}`
                                }
                                alt="Previous"
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius:
                                    key === "profile_image" ? "50%" : "4px",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setPreviewImage(
                                    detail.previous_value.startsWith("data:") ||
                                      detail.previous_value.startsWith("http")
                                      ? detail.previous_value
                                      : `data:image/png;base64,${detail.previous_value}`,
                                  );
                                  setPreviewOpen(true);
                                }}
                              />
                            ) : (
                              <span style={{ color: "#d9363e" }}>Empty</span>
                            )}
                            <span style={{ color: "gray", fontSize: "10px" }}>
                              ➔
                            </span>
                            {detail.new_value ? (
                              <img
                                src={
                                  detail.new_value.startsWith("data:") ||
                                  detail.new_value.startsWith("http")
                                    ? detail.new_value
                                    : `data:image/png;base64,${detail.new_value}`
                                }
                                alt="New"
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius:
                                    key === "profile_image" ? "50%" : "4px",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setPreviewImage(
                                    detail.new_value.startsWith("data:") ||
                                      detail.new_value.startsWith("http")
                                      ? detail.new_value
                                      : `data:image/png;base64,${detail.new_value}`,
                                  );
                                  setPreviewOpen(true);
                                }}
                              />
                            ) : (
                              <span
                                style={{ color: "#52c41a", fontWeight: 500 }}
                              >
                                Empty
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span style={{ color: "#d9363e" }}>
                              {detail.previous_value || "Empty"}
                            </span>
                            <span style={{ color: "gray", fontSize: "10px" }}>
                              ➔
                            </span>
                            <span style={{ color: "#52c41a", fontWeight: 500 }}>
                              {detail.new_value || "Empty"}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        ) : (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{"  "}
              <span style={{ color: "gray" }}>
                {item?.updated_by_id
                  ? `${item.updated_by_id} - ${item.updated_by}`
                  : ""}
              </span>
            </p>
            {(item.status === "Certificate Generated" ||
              item.status === "Certificate Updated") && (
              <button
                className="customer_history_viewproofbutton"
                style={{ marginTop: "12px" }}
                onClick={() => {
                  handleViewCert();
                }}
              >
                <FaRegEye size={16} /> View Certificate
              </button>
            )}
          </div>
        )}
      </>
    ),
  }));

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Customer History</span>
          <div className="customer_history_drawer_totalcount_container">
            <span style={{ fontWeight: 600 }}>
              Total Activity: {customerHistory?.length || 0}
            </span>
            <span style={{ fontWeight: 600 }}>
              Current Status:{" "}
              <span
                style={{
                  color: getHistoryStatusColor(
                    customerHistory?.[0]?.status || "N/A",
                  ),
                }}
              >
                {" "}
                {customerHistory && customerHistory.length > 0
                  ? customerHistory[0].status
                  : "N/A"}
              </span>
            </span>
          </div>
        </div>
      }
      open={isOpen}
      onClose={onClose}
      width="50%"
      style={{ position: "relative" }}
      className="customer_history_drawer"
    >
      <div style={{ padding: viewCustomerLoading ? "24px" : "0" }}>
        {viewCustomerLoading ? (
          <>
            <div className="customer_profileContainer">
              <Skeleton.Avatar active size={90} shape="circle" />
              <div style={{ marginLeft: "20px", flex: 1 }}>
                <Skeleton
                  active
                  paragraph={{ rows: 2 }}
                  title={{ width: 150 }}
                />
              </div>
            </div>

            <Row
              gutter={16}
              style={{ marginTop: "30px", padding: "0px 0px 0px 24px" }}
            >
              <Col span={12}>
                {[1, 2, 3].map((i) => (
                  <Row key={i} style={{ marginTop: i === 1 ? "0" : "12px" }}>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>
              <Col span={12}>
                {[1, 2, 3].map((i) => (
                  <Row key={i} style={{ marginTop: i === 1 ? "0" : "12px" }}>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>
          </>
        ) : (
          <>
            <div
              className="customer_statusupdate_drawer_profileContainer"
              id="customer_history_profilecontainer"
            >
              {customerDetails && customerDetails.profile_image ? (
                <Upload
                  listType="picture-circle"
                  fileList={[
                    {
                      uid: "-1",
                      name: "profile.jpg",
                      status: "done",
                      url: customerDetails && customerDetails.profile_image,
                    },
                  ]}
                  onPreview={handlePreview}
                  onRemove={false}
                  showUploadList={{
                    showRemoveIcon: false,
                  }}
                  beforeUpload={() => false}
                  style={{ width: 90, height: 90 }}
                  accept=".png,.jpg,.jpeg"
                ></Upload>
              ) : (
                <FaRegUser size={50} color="#333" />
              )}

              <div>
                <p className="customer_nametext">
                  {" "}
                  {customerDetails && customerDetails.name
                    ? customerDetails.name
                    : "-"}
                </p>
                {customerDetails?.student_id && (
                  <p className="customer_coursenametext">
                    {customerDetails && customerDetails.student_id
                      ? customerDetails.student_id
                      : "-"}
                  </p>
                )}
                <p className="customer_coursenametext">
                  {" "}
                  Created At:{" "}
                  {customerDetails && customerDetails.created_date
                    ? moment(customerDetails.created_date).format("DD/MM/YYYY")
                    : "-"}
                </p>
              </div>
            </div>

            <Row
              gutter={16}
              style={{
                marginTop: "20px",
                padding: "0px 0px 0px 24px",
              }}
            >
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegCircleUser size={15} color="gray" />
                      <p className="customerdetails_rowheading">Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.name
                          ? customerDetails.name
                          : "-"
                      }
                      smallText={true}
                    />
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <MdOutlineEmail size={15} color="gray" />
                      <p className="customerdetails_rowheading">Email</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.email
                          ? customerDetails.email
                          : "-"
                      }
                      smallText={true}
                    />
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <IoCallOutline size={15} color="gray" />
                      <p className="customerdetails_rowheading">Mobile</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.phone
                        ? customerDetails.phone
                        : "-"}
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <IoLocationOutline size={15} color="gray" />
                      <p className="customerdetails_rowheading">Area</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {" "}
                      {customerDetails && customerDetails.current_location
                        ? customerDetails.current_location
                        : "-"}
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegUser size={15} color="gray" />
                      <p className="customerdetails_rowheading">
                        Lead Executive
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={`${
                        customerDetails && customerDetails.lead_assigned_to_id
                          ? customerDetails.lead_assigned_to_id
                          : "-"
                      } (${
                        customerDetails && customerDetails.lead_assigned_to_name
                          ? customerDetails.lead_assigned_to_name
                          : "-"
                      })`}
                      smallText={true}
                    />
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Course</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.course_name
                          ? customerDetails.course_name
                          : "-"
                      }
                      smallText={true}
                    />
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Course Fees</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ fontWeight: 700 }}
                    >
                      {customerDetails && customerDetails.primary_fees
                        ? "₹" + customerDetails.primary_fees
                        : "-"}
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Course Fees
                        <span className="customerdetails_coursegst">{` (+Gst)`}</span>
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ fontWeight: 700 }}
                    >
                      {customerDetails && customerDetails.total_amount
                        ? "₹" + customerDetails.total_amount
                        : "-"}
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Balance Amount
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ color: "#d32f2f", fontWeight: 700 }}
                    >
                      {customerDetails &&
                      customerDetails.balance_amount !== undefined &&
                      customerDetails.balance_amount !== null
                        ? "₹" + customerDetails.balance_amount
                        : "-"}
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Branch</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.branch_name
                        ? customerDetails.branch_name
                        : "-"}
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Batch Track</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.batch_tracking
                        ? customerDetails.batch_tracking
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        )}
      </div>

      <Divider className="customer_statusupdate_divider" />

      <div style={{ marginTop: "30px", padding: "0 24px" }}>
        <Skeleton
          loading={customerHistoryLoading || viewCustomerLoading}
          active
          paragraph={{ rows: 4 }}
        >
          <Timeline mode="left" items={items} />
        </Skeleton>
      </div>

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

      <Modal
        open={previewOpen}
        title="Preview Profile"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </Drawer>
  );
}
