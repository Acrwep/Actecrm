import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import { Modal, Row, Col, Avatar, Typography } from "antd";
import moment from "moment";
import {
  MdEmail,
  MdPhone,
  MdPerson,
  MdMenuBook,
  MdLocationOn,
  MdWork,
  MdOutlineWorkOutline,
  MdAccessTime,
  MdOutlineAccessTime,
  MdOutlineFactCheck,
  MdLanguage,
} from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io5";
import { BiRupee } from "react-icons/bi";
import EllipsisTooltip from "../Common/EllipsisTooltip";

const TrainerFullDetailsModal = ({
  open,
  onClose,
  trainerDetails = [],
  width = 600,
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

  return (
    <Modal
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
          Trainer Full Details
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={false}
      width={width === "50%" ? 600 : width}
      mask={false}
      maskClosable={false}
      zIndex={zIndex}
      styles={{
        wrapper: { pointerEvents: "none", overflow: "hidden" },
        content: {
          padding: "20px 20px",
          pointerEvents: "auto",
          border: "1px solid #5b6aca3f",
          borderRadius: "8px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
      }}
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
      {trainerDetails.map((item, index) => (
        <div
          style={{ padding: "0", marginTop: index > 0 ? "24px" : "0px" }}
          key={index}
        >
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
                flexShrink: 0,
              }}
            >
              {item.name ? item.name.charAt(0).toUpperCase() : "T"}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
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
                  {item.name || "-"}
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
                  Code: {item.trainer_code || "N/A"}
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
                    {item.email || "-"}
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
                    HR Head: {item.hr_head || "-"}
                  </Typography.Text>
                </div>
              </div>
            </div>
          </div>

          <Row gutter={[16, 16]}>
            {/* Left Column: Contact Details */}
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
                  Personal Details
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
                      {item?.mobile
                        ? `${
                            item?.mobile_phone_code
                              ? item.mobile_phone_code.startsWith("+")
                                ? item.mobile_phone_code
                                : `+${item.mobile_phone_code}`
                              : ""
                          } ${item.mobile}`
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
                      {item?.whatsapp
                        ? `${
                            item?.whatsapp_phone_code
                              ? item.whatsapp_phone_code.startsWith("+")
                                ? item.whatsapp_phone_code
                                : `+${item.whatsapp_phone_code}`
                              : ""
                          } ${item.whatsapp}`
                        : "-"}
                    </span>
                  </div>

                  {/* Location */}
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
                      <MdLocationOn size={16} /> Location
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: "13px",
                        textAlign: "right",
                      }}
                    >
                      {item.location || "-"}
                    </span>
                  </div>

                  {/* Languages */}
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
                      <MdLanguage size={16} /> Lang.
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
                        isViewLeadDetailsText={true}
                        text={
                          Array.isArray(item.language_known)
                            ? item.language_known.join(", ")
                            : item.language_known || "-"
                        }
                      />
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Column: Professional Details */}
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
                  Professional Details
                </Typography.Title>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {/* Technology */}
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
                      <MdMenuBook size={16} /> Tech
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
                        text={item.technology || "-"}
                        isViewLeadDetailsText={true}
                      />
                    </span>
                  </div>

                  {/* Skills */}
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
                      <MdOutlineFactCheck size={16} /> Skills
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
                        text={
                          item?.skills?.map((skill) => skill.name).join(", ") ||
                          "-"
                        }
                        isViewLeadDetailsText={true}
                      />
                    </span>
                  </div>

                  {/* Overall Experience */}
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
                      <MdOutlineWorkOutline size={16} /> Total Exp.
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: "13px",
                        textAlign: "right",
                      }}
                    >
                      {item.overall_exp_year !== undefined &&
                      item.overall_exp_year !== null
                        ? `${item.overall_exp_year} Years`
                        : "-"}
                    </span>
                  </div>

                  {/* Relevant Experience */}
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
                      <MdWork size={16} /> Relevant Exp.
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: "13px",
                        textAlign: "right",
                      }}
                    >
                      {item.relavant_exp_year !== undefined &&
                      item.relavant_exp_year !== null
                        ? `${item.relavant_exp_year} Years`
                        : "-"}
                    </span>
                  </div>

                  {/* Availability */}
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
                      <MdAccessTime size={16} /> Availability
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: "13px",
                        textAlign: "right",
                      }}
                    >
                      {item.availability_time
                        ? moment(item.availability_time, "HH:mm:ss").format(
                            "hh:mm A",
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      ))}
    </Modal>
  );
};

export default TrainerFullDetailsModal;
