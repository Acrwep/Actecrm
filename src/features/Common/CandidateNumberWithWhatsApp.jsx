import React from "react";
import { Tooltip } from "antd";
import { FaWhatsapp } from "react-icons/fa";
import EllipsisTooltip from "./EllipsisTooltip";
import "./commonstyles.css";

const CandidateNumberWithWhatsApp = ({
  text,
  phoneCode,
  whatsapp,
  whatsappPhoneCode,
}) => {
  const formatPhoneCode = (code) => {
    if (!code) return "";
    return code.startsWith("+") ? code : `+${code}`;
  };

  const whatsappNumber = `${formatPhoneCode(
    whatsappPhoneCode,
  )}${whatsapp || ""}`.replace(/\D/g, "");

  return (
    <div className="customers_candidatename_container">
      <EllipsisTooltip
        text={text ? `${formatPhoneCode(phoneCode)} ${text}` : "-"}
      />

      {whatsapp && (
        <Tooltip
          title={
            <div className="whatsapp-tooltip-container">
              <div className="whatsapp-tooltip-icon-bg">
                <FaWhatsapp color="#fff" size={15} />
              </div>

              <div className="whatsapp-tooltip-text-wrapper">
                <span className="whatsapp-tooltip-label">Chat on WhatsApp</span>

                <span className="whatsapp-tooltip-number">
                  {`${formatPhoneCode(whatsappPhoneCode)} ${whatsapp}`}
                </span>
              </div>
            </div>
          }
          color="#ffffff"
          styles={{
            body: {
              padding: "8px 14px",
              borderRadius: "10px",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f3f4f6",
            },
          }}
        >
          <FaWhatsapp
            color="#3c9111"
            size={15}
            style={{ cursor: "pointer", marginTop: "-3px" }}
            onClick={() => {
              if (whatsappNumber) {
                window.open(
                  `https://wa.me/${whatsappNumber}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }
            }}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default CandidateNumberWithWhatsApp;
