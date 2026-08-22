import React, { useState, useRef } from "react";
import { Modal, Button, Row, Col, Avatar, Typography } from "antd";
import Draggable from "react-draggable";
import EllipsisTooltip from "./EllipsisTooltip";
import {
  MdEmail,
  MdPhone,
  MdPerson,
  MdMenuBook,
  MdLocationOn,
  MdBusiness,
  MdDateRange,
} from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io5";
import { BiRupee } from "react-icons/bi";
import moment from "moment";

const DraggableStudentModal = ({
  open,
  onClose,
  customerDetails,
  title = "Candidate Details",
}) => {
  const [disabled, setDisabled] = useState(true);
  const [zIndex, setZIndex] = useState(1000);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);

  const bringToFront = () => {
    window.highestModalZIndex = (window.highestModalZIndex || 1000) + 1;
    setZIndex(window.highestModalZIndex);
  };

  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  if (!customerDetails) return null;

  return (
    <Modal
      width={600}
      mask={false}
      maskClosable={false}
      zIndex={zIndex}
      styles={{
        wrapper: { pointerEvents: "none", overflow: "hidden" },
        content: {
          pointerEvents: "auto",
          border: "1px solid #5b6aca3f",
          borderRadius: "8px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
      }}
      title={
        <div
          style={{
            width: "100%",
            cursor: "move",
            fontSize: "18px",
            fontWeight: 600,
            color: "#1e293b",
          }}
          onMouseOver={() => {
            if (disabled) {
              setDisabled(false);
            }
          }}
          onMouseOut={() => {
            setDisabled(true);
          }}
          onFocus={() => {}}
          onBlur={() => {}}
          onMouseDownCapture={bringToFront}
        >
          {title}
        </div>
      }
      open={open}
      onCancel={onClose}
      // footer={[
      //   <Button key="close" type="primary" onClick={onClose}>
      //     Close
      //   </Button>,
      // ]}
      footer={false}
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event, uiData) => {
            bringToFront();
            onStart(event, uiData);
          }}
        >
          <div ref={draggleRef} onMouseDownCapture={bringToFront}>
            {modal}
          </div>
        </Draggable>
      )}
    >
      <div style={{ padding: "0" }}>
        {/* Header Profile Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            padding: "0 4px",
          }}
        >
          <Avatar
            size={48}
            style={{
              backgroundColor: "#5b69ca",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.1)",
            }}
          >
            {customerDetails?.name
              ? customerDetails.name.charAt(0).toUpperCase()
              : "U"}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Typography.Title
                level={5}
                style={{
                  margin: 0,
                  color: "#1e293b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 700,
                }}
              >
                {customerDetails?.name || "-"}
              </Typography.Title>
              <span
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                ID: {customerDetails?.student_id || "N/A"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#64748b",
                }}
              >
                <MdEmail size={14} />
                <Typography.Text
                  type="secondary"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                  }}
                >
                  {customerDetails?.email || "-"}
                </Typography.Text>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#64748b",
                }}
              >
                <MdPerson size={14} />
                <Typography.Text
                  type="secondary"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                  }}
                >
                  Lead Executive:{" "}
                  {`${customerDetails?.lead_assigned_to_name || "-"} (${customerDetails?.lead_assigned_to_id || "-"})`}
                </Typography.Text>
              </div>
            </div>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          {/* Left Column: Contact & Lead Details */}
          <Col span={12}>
            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "12px",
                height: "100%",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              }}
            >
              <Typography.Title
                level={5}
                style={{
                  marginTop: 0,
                  marginBottom: "16px",
                  color: "#334155",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Contact Details
              </Typography.Title>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Mobile */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    <MdPhone size={16} /> Mobile
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: "13px",
                      textAlign: "right",
                    }}
                  >
                    {customerDetails?.phone
                      ? `${
                          customerDetails?.phonecode
                            ? customerDetails.phonecode.startsWith("+")
                              ? customerDetails.phonecode
                              : `+${customerDetails.phonecode}`
                            : ""
                        } ${customerDetails.phone}`
                      : "-"}
                  </span>
                </div>

                {/* Whatsapp */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    <IoLogoWhatsapp size={16} style={{ color: "#25D366" }} />{" "}
                    WhatsApp
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: "13px",
                      textAlign: "right",
                    }}
                  >
                    {customerDetails?.whatsapp
                      ? `${
                          customerDetails?.whatsapp_phone_code
                            ? customerDetails.whatsapp_phone_code.startsWith(
                                "+",
                              )
                              ? customerDetails.whatsapp_phone_code
                              : `+${customerDetails.whatsapp_phone_code}`
                            : ""
                        } ${customerDetails.whatsapp}`
                      : "-"}
                  </span>
                </div>

                {/* Mode Of Training */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    <MdLocationOn size={16} /> Mode of Training
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: "13px",
                      textAlign: "right",
                    }}
                  >
                    {customerDetails?.mode_of_class_name || "-"}
                  </span>
                </div>

                {/* Place of Sale */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    <MdBusiness size={16} /> Place of Sale
                  </span>

                  <EllipsisTooltip
                    text={customerDetails?.place_of_sale_name || "-"}
                    isViewLeadDetailsText={true}
                  />
                </div>

                {/* Place of Service */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    <MdBusiness size={16} /> Place of Service
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: "13px",
                      textAlign: "right",
                    }}
                  >
                    {customerDetails?.place_of_service_name || "-"}
                  </span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Column: Course & Fees */}
          <Col span={12}>
            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "12px",
                height: "100%",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              }}
            >
              <Typography.Title
                level={5}
                style={{
                  marginTop: 0,
                  marginBottom: "16px",
                  color: "#334155",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Course & Financials
              </Typography.Title>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Joining Date */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    <MdDateRange size={16} /> Joining Date
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: "13px",
                      textAlign: "right",
                      maxWidth: "150px",
                    }}
                  >
                    {customerDetails?.date_of_joining
                      ? moment(customerDetails.date_of_joining).format(
                          "DD/MM/YYYY",
                        )
                      : "-"}
                  </span>
                </div>

                {/* Course */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    <MdMenuBook size={16} /> Course
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: "13px",
                      textAlign: "right",
                      maxWidth: "150px",
                    }}
                  >
                    <EllipsisTooltip
                      text={customerDetails?.course_name || "-"}
                      isViewLeadDetailsText={true}
                    />
                  </span>
                </div>

                {/* Fees */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    <BiRupee size={16} /> Course Fees
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: "13px",
                      textAlign: "right",
                    }}
                  >
                    {customerDetails?.primary_fees
                      ? `₹${customerDetails.primary_fees}`
                      : "-"}
                  </span>
                </div>

                {/* Fees + GST */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    <BiRupee size={16} /> Fees{" "}
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>
                      (+GST)
                    </span>
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      fontSize: "13px",
                      textAlign: "right",
                    }}
                  >
                    {customerDetails?.total_amount
                      ? `₹${customerDetails.total_amount}`
                      : "-"}
                  </span>
                </div>

                {/* Balance Amount */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fef2f2",
                    padding: "6px 8px",
                    borderRadius: "8px",
                    margin: "-6px -8px",
                  }}
                >
                  <span
                    style={{
                      color: "#991b1b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    <BiRupee size={16} /> Balance
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: "#dc2626",
                      fontSize: "14px",
                      textAlign: "right",
                    }}
                  >
                    {customerDetails?.balance_amount !== undefined &&
                    customerDetails.balance_amount !== null
                      ? `₹${customerDetails.balance_amount}`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default DraggableStudentModal;
