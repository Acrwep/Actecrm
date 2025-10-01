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

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    setLoading(true);

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("portrait", "px", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Since container is already A4 ratio, scale directly
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    pdf.save(`${candidateName}_Acte_Certificate.pdf`);
    setLoading(false);
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
