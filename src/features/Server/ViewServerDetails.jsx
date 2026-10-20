import React, { useState } from "react";
import { Row, Col, Typography, Collapse } from "antd";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { VscLayersActive } from "react-icons/vsc";
import { RiPassExpiredLine } from "react-icons/ri";
import moment from "moment";
import ServerTransCollapse from "./ServerTransCollapse";

const { Text } = Typography;

export default function ViewServerDetails({ serverDetails }) {
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);

  const cardStyle = {
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    background: "#fff",
    padding: "12px",
  };

  const HeaderTitle = ({ icon, title }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
        borderBottom: "1px solid #f1f5f9",
        paddingBottom: "6px",
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          color: "#1e3a8a",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {title}
      </span>
    </div>
  );

  const formatDateTime = (date, format = "DD/MM/YYYY") => {
    return date ? moment(date).format(format) : "-";
  };

  const renderField = (label, value) => (
    <div style={{ marginBottom: "8px" }}>
      <Text
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "12px",
          display: "block",
          marginBottom: "2px",
          color: "#64748b",
          fontWeight: 500,
        }}
      >
        {label}
      </Text>
      <EllipsisTooltip
        isViewLeadDetailsText={true}
        text={value}
        showRed={label == "Balance Amount" ? true : false}
      />
    </div>
  );

  return (
    <div style={{ padding: "1px 24px 20px 24px" }}>
      <ServerTransCollapse
        serverDetails={serverDetails}
        isShowStartAndEndDate={true}
      />
    </div>
  );
}
