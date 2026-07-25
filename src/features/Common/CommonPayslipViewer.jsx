import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "antd";
import { LuDownload } from "react-icons/lu";
import CommonSpinner from "./CommonSpinner";
import "./commonstyles.css";

export default function CommonPayslipViewer({ htmlTemplate, trainerName }) {
  const certificateRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // const generatePDF = async () => {
  //   if (!certificateRef.current) return;
  //   setLoading(true);

  //   const canvas = await html2canvas(certificateRef.current, {
  //     scale: 3,
  //     useCORS: true,
  //     backgroundColor: "#ffffff",
  //   });

  //   const imgData = canvas.toDataURL("image/jpeg", 0.9);

  //   const pdf = new jsPDF({
  //     orientation: "portrait",
  //     unit: "px",
  //     format: [780, 1000],
  //     compress: true,
  //     hotfixes: ["px_scaling"],
  //   });

  //   const pageWidth = pdf.internal.pageSize.getWidth();
  //   const imgProps = pdf.getImageProperties(imgData);
  //   const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

  //   pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pdfHeight);

  //   pdf.save(`${trainerName}_Acte_Payslip.pdf`);

  //   setLoading(false);
  // };

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    try {
      setLoading(true);

      // Wait for all fonts to load
      await document.fonts.ready;

      const target = certificateRef.current;
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: target.scrollWidth,
        width: target.scrollWidth,
        height: target.scrollHeight,
      });

      // Use JPEG for better performance and file size
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // A4 width is 210mm. Calculate proportional height.
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Create PDF exactly the size of the content to eliminate white space
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
        compress: true,
      });

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );

      pdf.save(`${trainerName}_Acte_Payslip.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const scopedHtmlTemplate = htmlTemplate
    ? htmlTemplate
        .replace(
          /body\s*\{/gi,
          ".payslip-wrapper { box-sizing: border-box; margin: 0 !important; padding: 20px; ",
        )
        .replace(/table\s*\{/gi, ".payslip-wrapper table {")
    : "";

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      {/* Render the payslip HTML */}
      <div
        ref={certificateRef}
        className="payslip-wrapper"
        dangerouslySetInnerHTML={{ __html: scopedHtmlTemplate }}
        style={{
          width: "794px",
          margin: "0 auto",
          padding: 0,
          position: "relative",
          backgroundColor: "#ffffff",
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
          <Button type="primary" style={{ width: 160, cursor: "not-allowed" }}>
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
