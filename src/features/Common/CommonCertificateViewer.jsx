import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "antd";
import { LuDownload } from "react-icons/lu";
import CommonSpinner from "./CommonSpinner";

export default function CommonCertificateViewer({
  htmlTemplate,
  candidateName,
}) {
  const certificateRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    setLoading(true);
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("portrait", "px", "a4"); // Use A4 size or custom

    // Get page width/height
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Scale down proportionally
    const imgWidth = pageWidth * 0.9; // 90% of page width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    pdf.save(`${candidateName}_Acte_Certificate.pdf`);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  return (
    <div
      style={{
        maxWidth: "100%", // keeps it inside modal width
        overflowX: "auto", // adds horizontal scroll if certificate is wider
      }}
    >
      {/* Render HTML in a hidden div or styled div */}
      <div
        ref={certificateRef}
        dangerouslySetInnerHTML={{ __html: htmlTemplate }}
        style={{
          width: "100%", // smaller width
          margin: "0 auto",
          transformOrigin: "top left",
          marginTop: "20px",
        }}
      ></div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {loading ? (
          <Button type="primary" style={{ marginTop: "10px", width: "160px" }}>
            <CommonSpinner />
          </Button>
        ) : (
          <Button
            type="primary"
            style={{ marginTop: "10px", width: "160px" }}
            onClick={generatePDF}
          >
            <LuDownload size={16} />
            Download Pdf
          </Button>
        )}
      </div>
    </div>
  );
}
