import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "antd";
import { LuDownload } from "react-icons/lu";
import CommonSpinner from "./CommonSpinner";
import "./commonstyles.css";

export default function CommonCertificateViewer({
  htmlTemplate,
  candidateName,
}) {
  const certificateRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // const generatePDF = async () => {
  //   if (!certificateRef.current) return;
  //   setLoading(true);

  //   const canvas = await html2canvas(certificateRef.current, {
  //     scale: 2,
  //     useCORS: true,
  //     backgroundColor: null,
  //   });

  //   const imgData = canvas.toDataURL("image/png");

  //   const pdf = new jsPDF("portrait", "px", "a4");
  //   const pageWidth = pdf.internal.pageSize.getWidth();
  //   const pageHeight = pdf.internal.pageSize.getHeight();

  //   // Since container is already A4 ratio, scale directly
  //   pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

  //   pdf.save(`${candidateName}_Acte_Certificate.pdf`);
  //   setLoading(false);
  // };

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    try {
      setLoading(true);

      // Wait for all fonts to load
      await document.fonts.ready;

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Use PNG for sharper text
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST",
      );

      pdf.save(`${candidateName}_Acte_Certificate.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      {/* Render the certificate HTML */}
      <div
        ref={certificateRef}
        dangerouslySetInnerHTML={{ __html: htmlTemplate }}
        className="common_certviewer_certificate"
      ></div>

      <div className="common_certviewer_downloadbutton_container">
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
