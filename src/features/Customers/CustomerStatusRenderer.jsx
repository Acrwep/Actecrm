import React from "react";
import { Button, Tooltip } from "antd";
import { FaRegCopy } from "react-icons/fa6";
import "./styles.css";

const CustomerStatusRenderer = ({ text, record = {}, classPercent }) => {
  if (text === "Form Pending") {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <Button className="customers_status_formpending_button">{text}</Button>

        <Tooltip
          placement="top"
          title="Copy form link"
          trigger={["hover", "click"]}
        >
          <FaRegCopy
            size={14}
            className="customers_formlink_copybutton"
            style={{ cursor: "pointer" }}
            onClick={() => {
              navigator.clipboard.writeText(
                `${import.meta.env.VITE_EMAIL_URL}/customer-registration/${record.id}`,
              );
              CommonMessage("success", "Link Copied");
            }}
          />
        </Tooltip>
      </div>
    );
  }

  if (text === "Refunded") {
    return (
      <Button className="customers_status_formpending_button">{text}</Button>
    );
  }

  if (text === "Payment Rejected") {
    return (
      <Button className="trainers_rejected_button">Payment Rejected</Button>
    );
  }

  if (text === "Awaiting Finance") {
    return (
      <Button className="customers_status_awaitfinance_button">
        Payment Verify
      </Button>
    );
  }

  if (
    text === "Awaiting Verify" ||
    text === "Hold" ||
    text === "Refund Ready to Pay"
  ) {
    return (
      <Button className="customers_status_awaitverify_button">
        {text === "Refund Ready to Pay" ? "Ready for Refund" : text}
      </Button>
    );
  }

  if (text === "Awaiting Trainer") {
    return (
      <Button className="customers_status_awaittrainer_button">{text}</Button>
    );
  }

  if (text === "Awaiting Trainer Verify") {
    return (
      <Button className="customers_status_awaittrainerverify_button">
        {text}
      </Button>
    );
  }

  if (text === "Trainer Approval") {
    return (
      <Button className="customers_status_trainerapproval_button">
        {text}
      </Button>
    );
  }

  if (text === "Awaiting Class" || text === "Refund Request") {
    return (
      <Button className="customers_status_awaitingclass_button">
        {text === "Refund Request" ? "Refund Requested" : text}
      </Button>
    );
  }

  if (text === "Class Scheduled") {
    return (
      <Button className="customers_status_classscheduled_button">{text}</Button>
    );
  }

  if (text === "Passedout process") {
    return (
      <Button className="customers_status_awaitfeedback_button">{text}</Button>
    );
  }

  if (text === "Completed" || text === "Videos Given") {
    return (
      <Button className="customers_status_completed_button">
        {text === "Completed" ? "Course Completed" : "Videos Sent"}
      </Button>
    );
  }

  if (
    [
      "Rejected",
      "REJECTED",
      "Payment Rejected",
      "Trainer Rejected",
      "Approval Rejected",
      "Escalated",
      "Partially Closed",
      "Discontinued",
      "Refund",
    ].includes(text)
  ) {
    return <Button className="trainers_rejected_button">{text}</Button>;
  }

  if (text === "Demo Completed") {
    return (
      <Button className="customers_status_classgoing_button">Only Demo</Button>
    );
  }

  if (text === "Class Going") {
    return (
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Button className="customers_status_classgoing_button">{text}</Button>

        <p className="customer_classgoing_percentage" style={{ flexShrink: 0 }}>
          {`${parseFloat(classPercent)}%`}
        </p>
      </div>
    );
  }

  return <p style={{ marginLeft: "6px" }}>-</p>;
};

export default CustomerStatusRenderer;
