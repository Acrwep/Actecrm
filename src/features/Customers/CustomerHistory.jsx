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
import { FaWhatsapp } from "react-icons/fa";
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
import DownloadRegistrationForm from "./DownloadRegistrationForm";

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
  // form usestates
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);

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

  const getWhatsAppLink = (value) => {
    if (!value) return null;

    return value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`;
  };

  const firstHistoryItemDate =
    customerHistory.length > 0
      ? moment(customerHistory[customerHistory.length - 1].status_date)
      : null;

  const items = customerHistory.map((item, index) => {
    let daysTaken = "-";
    if (firstHistoryItemDate) {
      if (customerHistory.length === 1) {
        daysTaken = "0 Days";
      } else {
        const diff = Math.max(
          0,
          moment(item.status_date).diff(firstHistoryItemDate, "days"),
        );
        daysTaken = diff === 1 ? "1 Day" : `${diff} Days`;
      }
    }

    return {
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
          item.status.includes("Marked") ||
          item.status.includes("Resent") ||
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
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
          <span
            style={{
              fontSize: "10px",
              color: "#5b69ca",
              backgroundColor: "#5b69ca1a",
              padding: "2px 6px",
              borderRadius: "10px",
              border: "1px solid #5b69ca1a",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {daysTaken}
          </span>
        </div>
      ),
      children: (
        <>
          {item.status == "Class Completion Acknowledged" ? (
            <div>
              <p className="customer_history_updateddate">
                {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
              </p>
              <p className="customer_history_updateddate">
                Updated By:{"  "}
                <span style={{ color: "gray" }}>Customer</span>
              </p>
            </div>
          ) : item.status === "Form Submitted" ? (
            <div>
              <p className="customer_history_updateddate">
                {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
              </p>
              <p className="customer_history_updateddate">
                Updated By:{"  "}
                <span style={{ color: "gray" }}>Customer</span>
              </p>

              <button
                className="customer_history_viewproofbutton"
                style={{ marginTop: "12px" }}
                onClick={() => {
                  setIsOpenFormModal(true);
                }}
              >
                <FaRegEye size={16} /> View Registration Form
              </button>
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
          ) : item.status === "Student Verified" &&
            (!item.details || typeof item.details?.comments === "string") ? (
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

              <div className="customer_history_changes_box">
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
                {item.details.comments && (
                  <div
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
                      Comments:
                    </span>
                    <span style={{ color: "#52c41a", fontWeight: 500 }}>
                      {item.details.comments}
                    </span>
                  </div>
                )}
                {item.details.proof_communication && (
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
                )}
              </div>
            </div>
          ) : (item.status === "Trainer Assigned" ||
              item.status === "Trainer Updated" ||
              item.status === "Trainer Re-Assigned") &&
            (!item.details || typeof item.details?.comments === "string") ? (
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
              <div className="customer_history_changes_box">
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
                {Object.entries({
                  trainer_name: item.details.trainer_name || "-",
                  commercial:
                    item.details.commercial != null
                      ? `₹${item.details.commercial}`
                      : "-",
                  mode_of_training: item.details.mode_of_class || "-",
                  trainer_type: item.details.trainer_type || "-",
                  comments: item.details.comments || "-",
                }).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
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
                    <span
                      style={{ color: "#52c41a", fontWeight: 500, flex: 1 }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
                {item.details.proof_communication && (
                  <div style={{ marginTop: "12px" }}>
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
                  </div>
                )}
              </div>
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
              <div className="customer_history_changes_box">
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: "12px",
                    marginBottom: "8px",
                    borderBottom: "1px solid #e0e0e0",
                    paddingBottom: "4px",
                  }}
                >
                  Rejected Trainer Details:
                </p>
                {Object.entries({
                  trainer_name: item.details?.trainer_name || "-",
                  "commercial_%":
                    item.details?.trainer_commercial_percentage != null
                      ? `${item.details.trainer_commercial_percentage}%`
                      : "-",
                  trainer_type: item.details?.trainer_type || "-",
                  commercial:
                    item.details?.trainer_commercial != null
                      ? `₹${item.details.trainer_commercial}`
                      : "-",
                  mode_of_training: item.details?.mode_of_class || "-",
                  rejection_reason: item.details?.rejected_reason || "-",
                }).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
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
                    <span
                      style={{
                        color: "#d32f2f",
                        fontWeight: 500,
                        flex: 1,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
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
              <div className="customer_history_changes_box customer_history_changes_box_flex">
                <span style={{ fontWeight: 600, fontSize: "12px" }}>
                  Schedule Date:
                </span>
                <span
                  style={{
                    color: "#52c41a",
                    fontWeight: 500,
                    fontSize: "12px",
                  }}
                >
                  {moment(item.details.class_start_date).format("DD/MM/YYYY")}
                </span>
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
              <div className="customer_history_changes_box customer_history_changes_box_flex">
                <span style={{ fontWeight: 600, fontSize: "12px" }}>
                  Class Going:
                </span>
                <span
                  style={{
                    color: "#52c41a",
                    fontWeight: 500,
                    fontSize: "12px",
                  }}
                >
                  {item.details
                    ? item.details.class_going_percentage
                      ? item.details.class_going_percentage + "%"
                      : "0%"
                    : "0%"}
                </span>
              </div>
            </div>
          ) : item.status === "Hold" ||
            item.status === "Demo Completed" ||
            item.status === "Videos Given" ||
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
              <div className="customer_history_changes_box customer_history_changes_box_flex_start">
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "12px",
                    minWidth: "120px",
                  }}
                >
                  {item.status === "Trainer Approval Rejected"
                    ? "Rejected Reason:"
                    : "Comments:"}
                </span>
                <span
                  style={{
                    color: "#52c41a",
                    fontWeight: 500,
                    fontSize: "12px",
                    flex: 1,
                  }}
                >
                  {item.details && item.details.comments
                    ? item.details.comments
                    : item.details.rejected_reason
                      ? item.details.rejected_reason
                      : "-"}
                </span>
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
              <div className="customer_history_class_completed_badge">
                <LuCircleCheck size={14} />
                <span style={{ fontWeight: 600, fontSize: "11px" }}>
                  100% Class Completed
                </span>
              </div>
            </div>
          ) : item.status === "Escalated" ||
            item.status === "Partially Closed" ||
            item.status === "Discontinued" ||
            item.status === "Refund" ? (
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
              <div className="customer_history_changes_box">
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "12px",
                      minWidth: "120px",
                    }}
                  >
                    Comments:
                  </span>
                  <span
                    style={{
                      color:
                        item.status === "Escalated" ? "#d32f2f" : "#52c41a",
                      fontWeight: 500,
                      fontSize: "12px",
                      flex: 1,
                    }}
                  >
                    {item.details.comments}
                  </span>
                </div>
                {item.details.attachment && (
                  <div style={{ marginTop: "12px" }}>
                    <button
                      className="customer_history_viewproofbutton"
                      onClick={() => {
                        getImageTypeFromBase64(item.details.attachment);
                        setProofScreenshotBase64(item.details.attachment);
                        setIsOpenProofViewModal(true);
                      }}
                    >
                      <FaRegEye size={16} /> View Attachment
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (item.status === "Customer Details Updated" ||
              item.status === "Candidate Details Updated" ||
              item.status === "Welcome Call Details Updated" ||
              item.status === "Requirement Verification Details Updated" ||
              item.status === "Trainer Fixation Details Updated" ||
              item.status === "Trainer Coordination Details Updated" ||
              item.status === "Certificate Updated" ||
              item.status === "Certificate Generated" ||
              item.status === "Google Review Added" ||
              item.status === "Linkedin Review Added" ||
              item.status === "Student Verified" ||
              item.status === "Trainer Assigned" ||
              item.status === "Trainer Updated" ||
              item.status === "Trainer Re-Assigned" ||
              item.status ===
                "Marked as Trainer Confirmation Mail Already Sent Outside CRM") &&
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
                return (
                  <div className="customer_history_changes_box">
                    <p
                      style={{
                        fontWeight: 500,
                        fontSize: "12px",
                        marginBottom: "8px",
                        borderBottom: "1px solid #e0e0e0",
                        paddingBottom: "4px",
                      }}
                    >
                      {item.status === "Trainer Approval Rejected" || item.status === "Trainer Rejected"
                        ? "Rejected Trainer Details:"
                        : "Changes Made:"}
                    </p>
                    {Object.keys(item.details).map((key) => {
                      const detail = item.details[key];

                      // Legacy button handling
                      if (
                        typeof detail === "string" &&
                        (key === "google_review" ||
                          key === "linkedin_review" ||
                          key === "attachment")
                      ) {
                        return (
                          <button
                            key={key}
                            className="customer_history_viewproofbutton"
                            style={{ marginTop: "12px", marginRight: "12px" }}
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

                      // Determine values
                      const isFlat = typeof detail !== "object" || detail === null;
                      const prevVal = isFlat ? null : detail.previous_value;
                      const newVal = isFlat ? detail : detail.new_value;

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
                          key === "linkedin_review" ||
                          key === "proof_communication" ||
                          key === "attendance_screenshot" ? (
                            <>
                              {prevVal ? (
                                <>
                                  <img
                                    src={
                                      prevVal.startsWith("data:") || prevVal.startsWith("http")
                                        ? prevVal
                                        : `data:image/png;base64,${prevVal}`
                                    }
                                    alt="Previous"
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: key === "profile_image" ? "50%" : "4px",
                                      objectFit: "cover",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      setPreviewImage(
                                        prevVal.startsWith("data:") || prevVal.startsWith("http")
                                          ? prevVal
                                          : `data:image/png;base64,${prevVal}`
                                      );
                                      setPreviewOpen(true);
                                    }}
                                  />
                                  <span style={{ color: "gray", fontSize: "10px" }}>➔</span>
                                </>
                              ) : null}
                              {newVal ? (
                                <img
                                  src={
                                    newVal.startsWith("data:") || newVal.startsWith("http")
                                      ? newVal
                                      : `data:image/png;base64,${newVal}`
                                  }
                                  alt="New"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: key === "profile_image" ? "50%" : "4px",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setPreviewImage(
                                      newVal.startsWith("data:") || newVal.startsWith("http")
                                        ? newVal
                                        : `data:image/png;base64,${newVal}`
                                    );
                                    setPreviewOpen(true);
                                  }}
                                />
                              ) : (
                                <span style={{ color: "#52c41a", fontWeight: 500 }}>Empty</span>
                              )}
                            </>
                          ) : key === "whatsapp_invite_link" || key === "attendance_sheet_link" ? (
                            <>
                              {prevVal ? (
                                <>
                                  <span style={{ color: "#d9363e" }}>
                                    <a
                                      href={getWhatsAppLink(prevVal)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#d9363e", textDecoration: "underline" }}
                                    >
                                      {prevVal}
                                    </a>
                                  </span>
                                  <span style={{ color: "gray", fontSize: "10px" }}>➔</span>
                                </>
                              ) : null}
                              <span style={{ color: "#52c41a", fontWeight: 500 }}>
                                {newVal ? (
                                  <a
                                    href={getWhatsAppLink(newVal)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#52c41a", textDecoration: "underline" }}
                                  >
                                    {newVal}
                                  </a>
                                ) : (
                                  "Empty"
                                )}
                              </span>
                            </>
                          ) : (
                            <>
                              {prevVal ? (
                                <>
                                  <span style={{ color: "#d9363e" }}>
                                    {prevVal}
                                  </span>
                                  <span style={{ color: "gray", fontSize: "10px" }}>➔</span>
                                </>
                              ) : null}
                              <span style={{ color: item.status === "Trainer Rejected" ? "#d32f2f" : "#52c41a", fontWeight: 500 }}>
                                {newVal || "Empty"}
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
    };
  });

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
                  Date Of Joining:{" "}
                  {customerDetails && customerDetails.date_of_joining
                    ? moment(customerDetails.date_of_joining).format(
                        "DD/MM/YYYY",
                      )
                    : "-"}
                </p>

                <p className="customer_coursenametext">
                  Sale Executive:{" "}
                  {`${
                    customerDetails && customerDetails.lead_assigned_to_id
                      ? customerDetails.lead_assigned_to_id
                      : "-"
                  } (${
                    customerDetails && customerDetails.lead_assigned_to_name
                      ? customerDetails.lead_assigned_to_name
                      : "-"
                  })`}
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
                      {customerDetails?.phone
                        ? `${
                            customerDetails?.phonecode
                              ? customerDetails.phonecode.startsWith("+")
                                ? customerDetails.phonecode
                                : `+${customerDetails.phonecode}`
                              : ""
                          } ${customerDetails.phone}`
                        : "-"}
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaWhatsapp size={15} color="gray" />
                      <p className="customerdetails_rowheading">Whatsapp</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails?.whatsapp
                        ? `${
                            customerDetails?.whatsapp_phone_code
                              ? customerDetails.whatsapp_phone_code.startsWith(
                                  "+",
                                )
                                ? customerDetails.whatsapp_phone_code
                                : `+${customerDetails.whatsapp_phone_code}`
                              : ""
                          } ${customerDetails.whatsapp}`
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <IoLocationOutline size={15} color="gray" />
                      <p className="customerdetails_rowheading">Address</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.address
                          ? customerDetails.address
                          : "-"
                      }
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
                      <p className="customerdetails_rowheading">
                        Mode Of Class
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails?.mode_of_class_name
                          ? `${customerDetails.mode_of_class_name}${
                              customerDetails?.place_of_service_name
                                ? ` (${customerDetails.place_of_service_name})`
                                : ""
                            }`
                          : "-"
                      }
                      smallText={true}
                    />
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

      {/* form modal */}
      <Modal
        open={isOpenFormModal}
        onCancel={() => {
          setIsOpenFormModal(false);
        }}
        footer={false}
        width="64%"
        style={{ marginBottom: "20px", top: 10 }}
        className="customer_downloadform_modal"
        zIndex={1100}
        // centered={true}
        closeIcon={
          <span
            style={{
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            <CloseOutlined />
          </span>
        }
      >
        <DownloadRegistrationForm customerDetails={customerDetails} />
      </Modal>

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
