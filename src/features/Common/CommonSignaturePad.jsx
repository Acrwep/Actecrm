import React from "react";
import { Button } from "antd";
import SignatureCanvas from "react-signature-canvas";
import { CommonMessage } from "./CommonMessage";
import "./commonstyles.css";

export default function CommonSignaturePad() {
  const signatureRef = React.useRef(null);

  const clearSignature = () => {
    signatureRef.current.clear();
  };

  const saveSignature = () => {
    if (signatureRef.current.isEmpty()) {
      CommonMessage("error", "Please provide a signature first.");
      return;
    }
    const dataURL = signatureRef.current.toDataURL("image/png");

    // Create a temporary link to download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "signature.png";
    link.click();
    CommonMessage("success", "Downloaded");
  };

  return (
    <div>
      <SignatureCanvas
        ref={signatureRef}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 120,
          className: "sigCanvas",
        }}
      />
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          className="signaturepad_clearbutton"
          onClick={clearSignature}
          style={{ marginRight: "10px" }}
        >
          Clear
        </Button>
        <Button className="signaturepad_downloadbutton" onClick={saveSignature}>
          Download PNG
        </Button>
      </div>
    </div>
  );
}
