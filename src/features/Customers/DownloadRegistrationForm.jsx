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
      format: [780, 780],
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

  const htmlTemplate = `
  <div>
    <div style="padding: 34px 35px 0px 35px !important;">
      <div class="trainer_registration_logoContainer">
        <div style="height:100%;">
          <img src="${Logo}" class="login_logo" />
          <p class="trainer_registration_logotext" style="color:#1b538c;">
            Technologies
          </p>
        </div>
        <div>
          <p class="trainer_registration_heading">
            Customer Registration Form
          </p>
        </div>
        ${
          customerDetails && customerDetails.profile_image
            ? `<img src="${customerDetails.profile_image}" class="customer_downloadform_profile_image" />`
            : ` <img src="${DefaultProfileImage}" style="border-radius: 50%; width: 80px; height: 80px;" />`
        }
      </div>

      <div class="customer_downloadform_basicdetails_main_container">
        <p class="customer_downloadform_basicdetails_heading">Basic Details</p>

        <div class="customer_downloadform_basicdetails_field_container">
                <!--------------- Basic Details First row -------------->
          <div>
            <p class="customer_downloadform_field_labels">Name</p>
            <div class="customer_downloadform_input_field">
            <p class="customer_downloadform_field_values">${
              customerDetails && customerDetails.name
                ? customerDetails.name
                : "-"
            }</p>
            </div>
          </div>

          <div>
            <p class="customer_downloadform_field_labels">Email</p>
            <div class="customer_downloadform_input_field">
            <p class="customer_downloadform_field_values">${
              customerDetails && customerDetails.email
                ? customerDetails.email
                : "-"
            }</p>
            </div>
          </div>

          <div>
            <p class="customer_downloadform_field_labels">Mobile</p>
          <div class="customer_downloadform_input_field">
          <p class="customer_downloadform_field_values">
    ${
      customerDetails?.phonecode && customerDetails?.phone
        ? `${
            customerDetails.phonecode.startsWith("+")
              ? customerDetails.phonecode
              : "+" + customerDetails.phonecode
          } ${customerDetails.phone}`
        : customerDetails?.phonecode
        ? customerDetails.phonecode
        : customerDetails?.phone ?? "-"
    }

        </p>
</div>
          </div>
        </div>

                <!---------------- Basic Details Second row ---------------->
             <div class="customer_downloadform_basicdetails_field_container">
          <div>
            <p class="customer_downloadform_field_labels">WhatsApp</p>
            <div class="customer_downloadform_input_field">
            <p class="customer_downloadform_field_values">
            ${
              customerDetails?.whatsapp_phone_code && customerDetails?.whatsapp
                ? `${
                    customerDetails.whatsapp_phone_code.startsWith("+")
                      ? customerDetails.whatsapp_phone_code
                      : "+" + customerDetails.whatsapp_phone_code
                  } ${customerDetails.whatsapp}`
                : customerDetails?.whatsapp_phone_code
                ? customerDetails.whatsapp_phone_code
                : customerDetails?.whatsapp ?? "-"
            }
            </p>
            </div>
          </div>

          <div>
            <p class="customer_downloadform_field_labels">Date Of Birth</p>
            <div class="customer_downloadform_input_field">
            <p class="customer_downloadform_field_values">${
              customerDetails && customerDetails.date_of_birth
                ? moment(customerDetails.date_of_birth).format("DD/MM/YYYY")
                : "-"
            }</p>
            </div>
          </div>

          <div>
            <p class="customer_downloadform_field_labels">Gender</p>
            <div class="customer_downloadform_input_field">
             <p class="customer_downloadform_field_values">${
               customerDetails && customerDetails.gender
                 ? customerDetails.gender
                 : "-"
             }</p></div>
          </div>
      </div>

        <!-------------- Basic Details Thired row -------------->
             <div class="customer_downloadform_basicdetails_field_container">
          <div>
            <p class="customer_downloadform_field_labels">Date Of Joining</p>
            <div class="customer_downloadform_input_field">
            <p class="customer_downloadform_field_values">${
              customerDetails && customerDetails.date_of_joining
                ? moment(customerDetails.date_of_joining).format("DD/MM/YYYY")
                : "-"
            }</p>
            </div>
          </div>

          <div>
            <p class="customer_downloadform_field_labels">Area</p>
            <div class="customer_downloadform_input_field">
            <p class="customer_downloadform_field_values">${
              customerDetails && customerDetails.current_location
                ? customerDetails.current_location
                : "-"
            }</p>
            </div>
          </div>

          <div />
      </div>
        </div>

        <!--------------------- Course Details ------------------------>
         <div class="customer_downloadform_basicdetails_main_container">
        <p class="customer_downloadform_basicdetails_heading">Course Details</p>

        <div class="customer_downloadform_basicdetails_field_container">
                <!-------------- Course Details First row ------------->
          <div>
            <p class="customer_downloadform_field_labels">Enrolled Course</p>
            <div class="customer_downloadform_input_field">
            <p class="customer_downloadform_field_values">${
              customerDetails && customerDetails.course_name
                ? customerDetails.course_name
                : "-"
            }</p>
            </div>
          </div>

          <div>
            <p class="customer_downloadform_field_labels">Batch Track</p>
            <div class="customer_downloadform_input_field">
            <p class="customer_downloadform_field_values">${
              customerDetails && customerDetails.batch_tracking
                ? customerDetails.batch_tracking
                : "-"
            }</p>
            </div>
          </div>

          <div>
            <p class="customer_downloadform_field_labels">Batch Type</p>
          <div class="customer_downloadform_input_field">
          <p class="customer_downloadform_field_values">
        ${
          customerDetails && customerDetails.batch_timing
            ? customerDetails.batch_timing
            : "-"
        }
        </p>
        </div>
        </div>
        </div>
        </div>

        <!--------------------- Terms And Conditions ------------------------>
          <div class="customer_downloadform_basicdetails_main_container">
        <p class="customer_downloadform_basicdetails_heading">Terms and Conditions</p>
        <ol>
         <li>Acte Technologies has rights to postpone/cancel courses due to instructor illness or natural 
         calamities. No refund in this case.</li>
         <li>The refund requisition will not be accepted</li>
        </ol>
        </div>

        <!--------------------- Signature ------------------------>
         <div class="customer_downloadform_signature_container">
           <p style="margin-right:40px;">Signature</p>
           <img
              src="${customerDetails.signature_image}"
              alt="Customer Signature"
              class="customer_signature_image"
            />
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
