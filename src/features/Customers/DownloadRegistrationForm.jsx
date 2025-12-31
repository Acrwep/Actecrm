import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "antd";
import { LuDownload } from "react-icons/lu";
import CommonSpinner from "../Common/CommonSpinner";
import Logo from "../../assets/acte-logo.png";
import DefaultProfileImage from "../../assets/customer_default_icon.png";
import "./styles.css";
import moment from "moment";

export default function DownloadRegistrationForm({ customerDetails }) {
  const certificateRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
      }.pdf`
    );

    setLoading(false);
  };

  //   const htmlTemplate = `
  //   <div>
  //     <div style="padding: 34px 35px 0px 35px !important;">
  //       <div class="trainer_registration_logoContainer">
  //         <div style="height:100%;">
  //           <img src="${Logo}" class="login_logo" />
  //           <p class="trainer_registration_logotext" style="color:#1b538c;">
  //             Technologies
  //           </p>
  //         </div>
  //         <div>
  //           <p class="trainer_registration_heading">
  //             Customer Registration Form
  //           </p>
  //         </div>
  //         ${
  //           customerDetails && customerDetails.profile_image
  //             ? `<img src="${customerDetails.profile_image}" class="customer_downloadform_profile_image" />`
  //             : ` <img src="${DefaultProfileImage}" style="border-radius: 50%; width: 80px; height: 80px;" />`
  //         }
  //       </div>

  //       <div class="customer_downloadform_basicdetails_main_container">
  //         <p class="customer_downloadform_basicdetails_heading">Basic Details</p>

  //         <div class="customer_downloadform_basicdetails_field_container">
  //                 <!--------------- Basic Details First row -------------->
  //           <div>
  //             <p class="customer_downloadform_field_labels">Name</p>
  //             <div class="customer_downloadform_input_field">
  //             <p class="customer_downloadform_field_values">${
  //               customerDetails && customerDetails.name
  //                 ? customerDetails.name
  //                 : "-"
  //             }</p>
  //             </div>
  //           </div>

  //           <div>
  //             <p class="customer_downloadform_field_labels">Email</p>
  //             <div class="customer_downloadform_input_field">
  //             <p class="customer_downloadform_field_values">${
  //               customerDetails && customerDetails.email
  //                 ? customerDetails.email
  //                 : "-"
  //             }</p>
  //             </div>
  //           </div>

  //           <div>
  //             <p class="customer_downloadform_field_labels">Mobile</p>
  //           <div class="customer_downloadform_input_field">
  //           <p class="customer_downloadform_field_values">
  //     ${
  //       customerDetails?.phonecode && customerDetails?.phone
  //         ? `${
  //             customerDetails.phonecode.startsWith("+")
  //               ? customerDetails.phonecode
  //               : "+" + customerDetails.phonecode
  //           } ${customerDetails.phone}`
  //         : customerDetails?.phonecode
  //         ? customerDetails.phonecode
  //         : customerDetails?.phone ?? "-"
  //     }

  //         </p>
  // </div>
  //           </div>
  //         </div>

  //                 <!---------------- Basic Details Second row ---------------->
  //              <div class="customer_downloadform_basicdetails_field_container">
  //           <div>
  //             <p class="customer_downloadform_field_labels">WhatsApp</p>
  //             <div class="customer_downloadform_input_field">
  //             <p class="customer_downloadform_field_values">
  //             ${
  //               customerDetails?.whatsapp_phone_code && customerDetails?.whatsapp
  //                 ? `${
  //                     customerDetails.whatsapp_phone_code.startsWith("+")
  //                       ? customerDetails.whatsapp_phone_code
  //                       : "+" + customerDetails.whatsapp_phone_code
  //                   } ${customerDetails.whatsapp}`
  //                 : customerDetails?.whatsapp_phone_code
  //                 ? customerDetails.whatsapp_phone_code
  //                 : customerDetails?.whatsapp ?? "-"
  //             }
  //             </p>
  //             </div>
  //           </div>

  //           <div>
  //             <p class="customer_downloadform_field_labels">Date Of Birth</p>
  //             <div class="customer_downloadform_input_field">
  //             <p class="customer_downloadform_field_values">${
  //               customerDetails && customerDetails.date_of_birth
  //                 ? moment(customerDetails.date_of_birth).format("DD/MM/YYYY")
  //                 : "-"
  //             }</p>
  //             </div>
  //           </div>

  //           <div>
  //             <p class="customer_downloadform_field_labels">Gender</p>
  //             <div class="customer_downloadform_input_field">
  //              <p class="customer_downloadform_field_values">${
  //                customerDetails && customerDetails.gender
  //                  ? customerDetails.gender
  //                  : "-"
  //              }</p></div>
  //           </div>
  //       </div>

  //         <!-------------- Basic Details Thired row -------------->
  //              <div class="customer_downloadform_basicdetails_field_container">
  //           <div>
  //             <p class="customer_downloadform_field_labels">Date Of Joining</p>
  //             <div class="customer_downloadform_input_field">
  //             <p class="customer_downloadform_field_values">${
  //               customerDetails && customerDetails.date_of_joining
  //                 ? moment(customerDetails.date_of_joining).format("DD/MM/YYYY")
  //                 : "-"
  //             }</p>
  //             </div>
  //           </div>

  //           <div>
  //             <p class="customer_downloadform_field_labels">Area</p>
  //             <div class="customer_downloadform_input_field">
  //             <p class="customer_downloadform_field_values">${
  //               customerDetails && customerDetails.current_location
  //                 ? customerDetails.current_location
  //                 : "-"
  //             }</p>
  //             </div>
  //           </div>

  //           <div />
  //       </div>
  //         </div>

  //         <!--------------------- Course Details ------------------------>
  //          <div class="customer_downloadform_basicdetails_main_container">
  //         <p class="customer_downloadform_basicdetails_heading">Course Details</p>

  //         <div class="customer_downloadform_basicdetails_field_container">
  //                 <!-------------- Course Details First row ------------->
  //           <div>
  //             <p class="customer_downloadform_field_labels">Enrolled Course</p>
  //             <div class="customer_downloadform_input_field">
  //             <p class="customer_downloadform_field_values">${
  //               customerDetails && customerDetails.course_name
  //                 ? customerDetails.course_name
  //                 : "-"
  //             }</p>
  //             </div>
  //           </div>

  //           <div>
  //             <p class="customer_downloadform_field_labels">Batch Track</p>
  //             <div class="customer_downloadform_input_field">
  //             <p class="customer_downloadform_field_values">${
  //               customerDetails && customerDetails.batch_tracking
  //                 ? customerDetails.batch_tracking
  //                 : "-"
  //             }</p>
  //             </div>
  //           </div>

  //           <div>
  //             <p class="customer_downloadform_field_labels">Batch Type</p>
  //           <div class="customer_downloadform_input_field">
  //           <p class="customer_downloadform_field_values">
  //         ${
  //           customerDetails && customerDetails.batch_timing
  //             ? customerDetails.batch_timing
  //             : "-"
  //         }
  //         </p>
  //         </div>
  //         </div>
  //         </div>
  //         </div>

  //         <!--------------------- Terms And Conditions ------------------------>
  //           <div class="customer_downloadform_basicdetails_main_container">
  //         <p class="customer_downloadform_basicdetails_heading">Terms and Conditions</p>
  //         <ol>
  //          <li>Acte Technologies has rights to postpone/cancel courses due to instructor illness or natural
  //          calamities. No refund in this case.</li>
  //          <li>The refund requisition will not be accepted</li>
  //         </ol>
  //         </div>

  //         <!--------------------- Signature ------------------------>
  //          <div class="customer_downloadform_signature_container">
  //            <p style="margin-right:40px;">Signature</p>
  //            <img
  //               src="${customerDetails.signature_image}"
  //               alt="Customer Signature"
  //               class="customer_signature_image"
  //             />
  //             <p class="customer_downloadform_signature_name">
  //            ${customerDetails.name}
  //             </p>
  //          </div>

  //     </div>
  //   </div>
  // `;

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
                : customerDetails?.phonecode ?? customerDetails?.phone ?? "-"
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
                : customerDetails?.whatsapp_phone_code ??
                  customerDetails?.whatsapp ??
                  "-"
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
        <img src="${customerDetails.signature_image}" class="signature-img" />
        <p class="signature-name">${customerDetails.name}</p>
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

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "16px",
          marginRight: "20px",
        }}
      >
        {loading ? (
          <Button type="primary" style={{ width: 160, cursor: "default" }}>
            <CommonSpinner />
          </Button>
        ) : (
          <Button type="primary" style={{ width: 160 }} onClick={generatePDF}>
            <LuDownload size={16} /> Download PDF
          </Button>
        )}
      </div>
    </div>
  );
}
