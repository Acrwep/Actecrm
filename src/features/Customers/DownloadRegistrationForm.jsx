import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button, Modal, Row, Col } from "antd";
import { LuDownload } from "react-icons/lu";
import CommonSpinner from "../Common/CommonSpinner";
import Logo from "../../assets/acte-logo.png";
import DefaultProfileImage from "../../assets/customer_default_icon.png";
import "./styles.css";
import moment from "moment";
import {
  getCustomersPaymentHistory,
  viewPaymentInvoice,
} from "../ApiService/action";
import CommonInvoiceViewer from "../Common/CommonInvoiceViewer";
import { CommonMessage } from "../Common/CommonMessage";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { IoReceiptOutline } from "react-icons/io5";
import { Tooltip } from "antd";
import { FaFileDownload } from "react-icons/fa";

export default function DownloadRegistrationForm({ customerDetails }) {
  const certificateRef = useRef(null);
  //patment usestates
  const [paymentFullDetails, setPaymentFullDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  //loading usestate
  const [loading, setLoading] = useState(false);
  const [invoiceHtmlContent, setInvoiceHtmlContent] = useState("");
  const [isOpenViewInvoiceModal, setIsOpenViewInvoiceModal] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [currentInvoiceName, setCurrentInvoiceName] = useState("");

  useEffect(() => {
    if (customerDetails?.lead_id) {
      getPaymentHistoryData();
    }
  }, [customerDetails]);

  const getPaymentHistoryData = async () => {
    try {
      const response = await getCustomersPaymentHistory(
        customerDetails?.lead_id,
      );
      console.log("particular customer payment history", response);
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

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    setLoading(true);

    const canvas = await html2canvas(certificateRef.current, {
      scale: 3, // you can lower to 1.5 if still big
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    // Convert canvas to JPEG with compression
    const imgData = canvas.toDataURL("image/jpeg", 0.9); // ✅ 0.6 compression reduces size massively

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [780, 1500],
      compress: true, // ✅ Enable PDF compression
      hotfixes: ["px_scaling"],
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    // Insert JPEG instead of PNG
    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pdfHeight);

    pdf.save(
      `${
        customerDetails && customerDetails.name ? customerDetails.name : "xyz"
      }.pdf`,
    );

    setLoading(false);
  };

  const handleViewInvoice = async (transactionId) => {
    const findTrans =
      paymentHistory?.find((f) => f.id === transactionId) ?? null;

    if (!findTrans) return;

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

    setInvoiceLoading(true);
    try {
      const response = await viewPaymentInvoice(payload);
      const htmlTemplate = response?.data?.data;
      setInvoiceHtmlContent(htmlTemplate);
      setCurrentInvoiceName(findTrans?.invoice_number || "Invoice");
      setIsOpenViewInvoiceModal(true);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later",
      );
    } finally {
      setInvoiceLoading(false);
    }
  };

  const htmlTemplate = `
  <style>
    .form-container {
      width: 100%;
      padding: 35px;
      font-family: "Arial", sans-serif;
      color: #212121;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #1b538c;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .header-logo {
      width: 110px;
    }

    .form-title {
      font-size: 22px;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1b538c;
      margin-bottom: 5px;
    }

    .profile-image {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      object-fit: cover;
    }

    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0 10px;
      color: #1b538c;
      border-left: 5px solid #1b538c;
      padding-left: 10px;
    }

    .field-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      margin-bottom: 15px;
    }

    .field-box p.label {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 13px;
    }

    .field-value-box {
      border: 1px solid #bdbdbd;
      padding: 8px 10px;
      background: #fafafa;
      min-height: 32px;
      border-radius: 6px;
    }

    .field-value {
      font-size: 14px;
    }

    .terms-list li {
      margin-bottom: 8px;
      font-size: 14px;
    }

    .signature-area {
      margin-top: 40px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 25px;
    }

    .signature-img {
      width: 140px;
      height: 50px;
      object-fit: contain;
      border-bottom: 1px solid #555;
    }

    .signature-name {
      font-size: 15px;
      font-weight: bold;
      margin-top: 5px;
      text-align: center;
    }

    @media print {
      .form-container {
        padding: 20px;
      }
    }
  </style>

  <div class="form-container">

    <!-- Header -->
    <div class="form-header">
      <div class="header-left">
        <img src="${Logo}" class="header-logo" />
        <p style="color:#1b538c; font-weight:bold; margin-top:5px;letter-spacing:1px;">Technologies</p>
        <p style="color:#1b538c; font-weight:bold; margin-top:0px;">Private Limited</p>
      </div>

      <p class="form-title">Customer Registration Form</p>

      <div>
        ${
          customerDetails?.profile_image
            ? `<img src="${customerDetails.profile_image}" class="profile-image" />`
            : ""
        }
      </div>
    </div>

    <!-- BASIC DETAILS -->
    <p class="section-title">Basic Details</p>
    <div class="field-grid">

      <div class="field-box">
        <p class="label">Name</p>
        <div class="field-value-box">
          <p class="field-value">${customerDetails?.name ?? "-"}</p>
        </div>
      </div>

      <div class="field-box">
        <p class="label">Email</p>
        <div class="field-value-box">
          <p class="field-value">${customerDetails?.email ?? "-"}</p>
        </div>
      </div>

      <div class="field-box">
        <p class="label">Mobile</p>
        <div class="field-value-box">
          <p class="field-value">
            ${
              customerDetails?.phonecode && customerDetails?.phone
                ? `${
                    customerDetails.phonecode.startsWith("+")
                      ? customerDetails.phonecode
                      : "+" + customerDetails.phonecode
                  } ${customerDetails.phone}`
                : (customerDetails?.phonecode ?? customerDetails?.phone ?? "-")
            }
          </p>
        </div>
      </div>

    </div>

    <!-- SECOND ROW -->
    <div class="field-grid">

      <div class="field-box">
        <p class="label">WhatsApp</p>
        <div class="field-value-box">
          <p class="field-value">
            ${
              customerDetails?.whatsapp_phone_code && customerDetails?.whatsapp
                ? `${
                    customerDetails.whatsapp_phone_code.startsWith("+")
                      ? customerDetails.whatsapp_phone_code
                      : "+" + customerDetails.whatsapp_phone_code
                  } ${customerDetails.whatsapp}`
                : (customerDetails?.whatsapp_phone_code ??
                  customerDetails?.whatsapp ??
                  "-")
            }
          </p>
        </div>
      </div>

      <div class="field-box">
        <p class="label">Date Of Birth</p>
        <div class="field-value-box">
          <p class="field-value">${
            customerDetails?.date_of_birth
              ? moment(customerDetails.date_of_birth).format("DD/MM/YYYY")
              : "-"
          }</p>
        </div>
      </div>

      <div class="field-box">
        <p class="label">Gender</p>
        <div class="field-value-box">
          <p class="field-value">${customerDetails?.gender ?? "-"}</p>
        </div>
      </div>

    </div>

    <!-- THIRD ROW -->
    <div class="field-grid">

      <div class="field-box">
        <p class="label">Date Of Joining</p>
        <div class="field-value-box">
          <p class="field-value">${
            customerDetails?.date_of_joining
              ? moment(customerDetails.date_of_joining).format("DD/MM/YYYY")
              : "-"
          }</p>
        </div>
      </div>

      <div class="field-box">
        <p class="label">Area</p>
        <div class="field-value-box">
          <p class="field-value">${customerDetails?.current_location ?? "-"}</p>
        </div>
      </div>

    </div>

    <!-- COURSE DETAILS -->
    <p class="section-title">Course Details</p>
    <div class="field-grid">

      <div class="field-box">
        <p class="label">Enrolled Course</p>
        <div class="field-value-box">
          <p class="field-value">${customerDetails?.course_name ?? "-"}</p>
        </div>
      </div>

      <div class="field-box">
        <p class="label">Batch Track</p>
        <div class="field-value-box">
          <p class="field-value">${customerDetails?.batch_tracking ?? "-"}</p>
        </div>
      </div>

      <div class="field-box">
        <p class="label">Batch Timing</p>
        <div class="field-value-box">
          <p class="field-value">${customerDetails?.batch_timing ?? "-"}</p>
        </div>
      </div>

    </div>

    <!-- TERMS -->
    <p class="section-title">Terms & Conditions</p>
    <ol class="terms-list">
      <li>Acte Technologies has the right to postpone/cancel classes due to instructor illness or natural calamities. No refund in such cases.</li>

      <li>The registration fee is ₹2,000 and it is non-refundable.</li>

      <li><span style="font-weight: bold;">Attendance & Discipline:</span> Candidates must attend classes regularly, be punctual, follow dress guidelines, and maintain discipline inside the ACTE campus.</li>

    <li><span style="font-weight: bold;">Classroom Rules:</span> Only training-related activities are allowed during class hours. No unrelated visitors are permitted on campus.</li>

    <li><span style="font-weight: bold;">Quality Concerns:</span> Any subject or trainer quality issues must be reported immediately. Management will take corrective action, including trainer change if required.</li>

    <li><span style="font-weight: bold;">Assessments & Certification:</span> Good attendance and successful completion of internal assessments are mandatory. Certificates will be issued within 15 days after registering for certification.</li>

     <li><span style="font-weight: bold;">Communication:</span> All support queries must be raised to <a href="mailto:support@acte.in">support@acte.in</a> or the concerned team. Any non-training discussions in official WhatsApp groups may result in removal.</li>

    <li><span style="font-weight: bold;">Training Resources:</span> Trainers will be allocated and classes scheduled after enrolment. Candidates must bring laptops for practical sessions; systems will be provided based on availability.</li>

    <li><span style="font-weight: bold;">Placement Support:</span> ACTE will provide maximum placement assistance. However, student performance, attendance, and active participation are mandatory for eligibility.</li>

     <li><span style="font-weight: bold;">Payments & Initiation:</span> Once payment is made, the training process begins within 24–48 hours. Part-payment candidates must clear pending fees within 15 days of course start.</li>

     <li><span style="font-weight: bold;">Refund Policy:</span>
     <ul style="list-style-type: disc;">
  <li style="margin-top: 6px;">Refund requests must be raised within 7 days of purchase/start of batch.</li>
  <li>Refund is not applicable once trainer allocation or classes have started.</li>
  <li>
    Accessing more than 30% of content/material or attending more than one class
    voids refund eligibility.
  </li>
  <li>Cancellations by the candidate are non-refundable.</li>
  <li>
    Quality concerns must first be given for management correction; refunds will
    not be issued before rectification attempts.
  </li>
  <li>Approved refunds will be processed within 7–10 working days.</li>
</ul>
     </li>

       <li><span style="font-weight: bold;">Acceptance:</span> By enrolling with ACTE, the candidate confirms that they have fully read, understood, and agreed to these Terms & Conditions without dispute.</li>
    </ol>

    <!-- SIGNATURE -->
    <div class="signature-area">
      <div>
        <img src="${customerDetails?.signature_image}" class="signature-img" />
        <p class="signature-name">${customerDetails?.name}</p>
      </div>
    </div>

  </div>
  `;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      {/* Render the certificate HTML */}
      <div
        ref={certificateRef}
        dangerouslySetInnerHTML={{ __html: htmlTemplate }}
        style={{
          width: "100%",
          height: "auto", // ✅ allow auto height
          minHeight: "820px", // ✅ A4 height (px)
          backgroundColor: "white",
        }}
      ></div>

      <div className="customer_registrationform_footer_container">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="customer_registrationform_invoice_icon_container">
            <FaFileInvoiceDollar size={24} />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <p className="customer_registrationform_invoice_heading">
                Available Invoices
              </p>
              {paymentHistory && paymentHistory.length > 0 && (
                <span className="customer_registrationform_invoice_count_batch">
                  {paymentHistory.length}{" "}
                  {paymentHistory.length === 1 ? "Invoice" : "Invoices"}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {paymentHistory && paymentHistory.length > 0 ? (
                paymentHistory.map((item, index) => (
                  <Tooltip
                    key={index}
                    title={
                      <div style={{ padding: "4px" }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>
                          Invoice: {item.invoice_number}
                        </p>
                        <p
                          style={{ margin: 0, opacity: 0.8, fontSize: "12px" }}
                        >
                          Amount: ₹{item.amount}
                        </p>
                      </div>
                    }
                  >
                    <Button
                      onClick={() => handleViewInvoice(item.id)}
                      loading={
                        invoiceLoading &&
                        currentInvoiceName === item.invoice_number
                      }
                      className="customer_registrationform_invoice_view_button"
                    >
                      <IoReceiptOutline
                        size={18}
                        style={{ color: "#5b69ca" }}
                      />
                      ₹{item.amount}
                    </Button>
                  </Tooltip>
                ))
              ) : (
                <span
                  style={{
                    fontSize: "13px",
                    color: "#d1d5db",
                    fontStyle: "italic",
                  }}
                >
                  No verified invoices found.
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {loading ? (
            <Button
              type="primary"
              style={{
                width: 250,
                height: "50px",
                borderRadius: "14px",
                cursor: "default",
                background: "#1b538c",
              }}
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              type="primary"
              className="customer_registrationform_download_form_button"
              onClick={generatePDF}
            >
              <FaFileDownload size={16} /> Download Registration Form
            </Button>
          )}
        </div>
      </div>

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
