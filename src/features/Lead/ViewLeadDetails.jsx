import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Spin, Rate, Empty } from "antd";
import { Country, State } from "country-state-city";
import moment from "moment";
import {
  MdPerson,
  MdPhone,
  MdAssignment,
  MdBook,
  MdEventNote,
  MdSearch,
} from "react-icons/md";
import { getLeadById } from "../ApiService/action";
import CommonAvatar from "../Common/CommonAvatar";

const { Text } = Typography;

export default function ViewLeadDetails({ leadData: initialData }) {
  const [leadData, setLeadData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData?.id) {
      fetchLeadDetails();
    }
  }, [initialData]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const res = await getLeadById(initialData.id);
      if (res?.data?.data) {
        setLeadData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!leadData) return null;

  const renderField = (label, value) => (
    <div style={{ marginBottom: "14px" }}>
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
      <Text
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "13px",
          color: "#0f172a",
          fontWeight: 600,
          display: "block",
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Text>
    </div>
  );

  const cardStyle = {
    marginBottom: "12px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    background: "#fff",
    padding: "16px",
  };

  const HeaderTitle = ({ icon, title }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "16px",
        borderBottom: "1px solid #f1f5f9",
        paddingBottom: "8px",
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

  const getCommunicationStatusName = (id) => {
    switch (id) {
      case 1:
        return "Contactable";
      case 2:
        return "Not Contactable";
      default:
        return "-";
    }
  };

  const getContactModeName = (id) => {
    switch (id) {
      case 1:
        return "Phone Call";
      case 2:
        return "WhatsApp";
      case 3:
        return "SMS";
      case 4:
        return "Email";
      case 5:
        return "Data Correct But No Response";
      case 6:
        return "Data Incorrect";
      default:
        return "-";
    }
  };

  const getCountryName = (countryCode) => {
    let countryName = "";
    const countries = Country.getAllCountries();

    const findCountry = countries.find((f) => f.isoCode == countryCode);

    if (findCountry) {
      countryName = findCountry.name;
    } else {
      countryName = "";
    }
    return countryName;
  };

  const getStateName = (countryCode, stateCode) => {
    const stateList = State.getStatesOfCountry(countryCode);
    const updateSates = stateList.map((s) => {
      return { ...s, id: s.isoCode };
    });

    let stateName = "";

    const findState = updateSates.find((f) => f.id == stateCode);
    if (findState) {
      stateName = findState.name;
    } else {
      stateName = "";
    }
    return stateName;
  };

  const formatDateTime = (date, format = "DD MMM YYYY hh:mm A") => {
    return date ? moment(date).format(format) : "-";
  };

  return (
    <div
      style={{
        padding: "12px",
        background: "#f8fafc",
        minHeight: "100%",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* 1. Basic Information */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdPerson size={18} color="#2563eb" />}
          title="Basic Information"
        />
        <Row gutter={24}>
          <Col span={8}>
            {renderField(
              "Lead Date & Time",
              formatDateTime(leadData.created_date),
            )}
          </Col>
          <Col span={8}>{renderField("Candidate Name", leadData.name)}</Col>
          <Col span={8}>
            {renderField(
              "Mobile Number",
              leadData.phone
                ? `+${leadData.phone_code || "91"} ${leadData.phone}`
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "WhatsApp Number",
              leadData.whatsapp
                ? `+${leadData.whatsapp_phone_code || "91"} ${leadData.whatsapp}`
                : "-",
            )}
          </Col>
          <Col span={8}>{renderField("Email", leadData.email)}</Col>
          <Col span={8}>
            {renderField("Country", getCountryName(leadData.country))}
          </Col>
          <Col span={8}>
            {renderField(
              "State",
              getStateName(leadData.country, leadData.state),
            )}
          </Col>
          <Col span={8}>{renderField("Area", leadData.area_id)}</Col>
        </Row>
      </div>

      {/* 2. Lead Source */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdSearch size={18} color="#2563eb" />}
          title="Lead Source"
        />
        <Row gutter={24}>
          <Col span={8}>{renderField("Lead Source", leadData.lead_type)}</Col>
          <Col span={8}>
            {renderField("Lead Sub Source", leadData.lead_sub_source_name)}
          </Col>
          <Col span={8}>
            {renderField("Referral Name", leadData.referral_name)}
          </Col>
        </Row>
      </div>

      {/* 3. Course Requirement */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdBook size={18} color="#2563eb" />}
          title="Course Requirement"
        />
        <Row gutter={24}>
          <Col span={8}>
            {renderField("Primary Course", leadData.primary_course)}
          </Col>
          <Col span={8}>
            {renderField(
              "Fees",
              leadData.primary_fees ? `₹${leadData.primary_fees}` : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Preferred Mode",
              leadData?.preferred_mode_name || "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Preferred Batch",
              leadData?.preferred_batch_name || "-",
            )}
          </Col>
        </Row>
      </div>

      {/* 4. Screening */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdPhone size={18} color="#2563eb" />}
          title="Screening"
        />
        <Row gutter={24}>
          <Col span={8}>{renderField("Lead Temp.", leadData.lead_status)}</Col>
          <Col span={8}>
            {renderField("Counsel Given", leadData?.counsel || "Not Given")}
          </Col>
          <Col span={8}>
            {renderField(
              "Expected Join Date",
              formatDateTime(leadData.expected_join_date, "DD MMM YYYY"),
            )}
          </Col>
          <Col span={8}>{renderField("Lead Score", leadData.lead_score)}</Col>
        </Row>
      </div>

      {/* 5. Assignment */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdAssignment size={18} color="#2563eb" />}
          title="Assignment"
        />
        <Row gutter={24}>
          <Col span={8}>
            {renderField("Assigned Region", leadData.region_name)}
          </Col>
          <Col span={8}>
            {renderField("Assigned Branch", leadData.branch_name)}
          </Col>
          {leadData?.re_assigned_date && (
            <Col span={8}>
              {renderField(
                "Re-Assign Date",
                formatDateTime(leadData.re_assigned_date),
              )}
            </Col>
          )}
          <Col span={8}>
            {renderField(
              "Assigned Executive",
              `${leadData.lead_assigned_to_id} - ${leadData.lead_assigned_to_name}`,
            )}
          </Col>
          <Col span={8}>
            {renderField("Assigned Manager", leadData.assigned_manager_name)}
          </Col>
          <Col span={8}>
            {renderField(
              "Lead Owner",
              `${leadData?.user_id} - ${leadData.user_name}`,
            )}
          </Col>
        </Row>
      </div>

      {/* 6. Follow-Up History */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdEventNote size={18} color="#2563eb" />}
          title="Followup History"
        />
        {loading && !leadData?.history ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        ) : leadData?.history?.length > 0 ? (
          <div
            className="leadmanager_comments_maincontainer"
            style={{
              position: "relative",
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* The vertical timeline track */}
            <div
              style={{
                position: "absolute",
                top: "32px",
                bottom: "32px",
                left: "27px",
                width: "2px",
                backgroundColor: "#e2e8f0",
                zIndex: 0,
              }}
            ></div>
            {[...leadData.history]
              .sort(
                (a, b) =>
                  new Date(b.updated_date || b.created_date) -
                  new Date(a.updated_date || a.created_date),
              )
              .map((item, index) => {
                const statusColors = {
                  "Sales Ready": "#dc2626",
                  "Highly Interested": "#f97316",
                  Interested: "#eab308",
                  Exploring: "#3b82f6",
                  "Not Responding": "#4b5563",
                  "Not Interested": "#111827",
                };

                const baseColor =
                  statusColors[item.lead_action_name] || "#4338ca";

                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "16px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        border: "1px solid #f1f5f9",
                        borderRadius: "12px",
                        padding: "16px",
                        background: "#fff",
                        boxShadow:
                          "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              flexShrink: 0,
                              background: "#fff",
                              borderRadius: "50%",
                              boxShadow: "0 0 0 4px #fff",
                            }}
                          >
                            <CommonAvatar
                              itemName={item.user_name || "Unknown"}
                              avatarSize={32}
                            />
                          </div>

                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                fontSize: "13px",
                                color: "#1e293b",
                              }}
                            >
                              {item.user_name
                                ? `${item.updated_by} - ${item.user_name}`
                                : "-"}
                            </p>

                            <p
                              style={{
                                margin: 0,
                                fontSize: "11px",
                                color: "#64748b",
                                fontWeight: 500,
                              }}
                            >
                              {item.updated_date
                                ? moment(item.updated_date).format(
                                    "MMM DD, YYYY hh:mm A",
                                  )
                                : item.created_date
                                  ? moment(item.created_date).format(
                                      "MMM DD, YYYY hh:mm A",
                                    )
                                  : "-"}
                            </p>
                          </div>
                        </div>

                        {item.lead_action_name && (
                          <div
                            style={{
                              background: `${baseColor}1A`,
                              color: baseColor,
                              border: `1px solid ${baseColor}`,
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {item.lead_action_name}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "gray" }}>
                            Communication:
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              background: item.communication_status_name
                                ? "#dcfce7"
                                : "#f1f5f9",
                              color: item.communication_status_name
                                ? "#166534"
                                : "#334155",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {item.communication_status_name || "-"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "gray" }}>
                            Mode:
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              background: item.contact_mode_name
                                ? "#fef3c7"
                                : "#f1f5f9",
                              color: item.contact_mode_name
                                ? "#92400e"
                                : "#334155",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {item.contact_mode_name || "-"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "gray" }}>
                            Interest Rate:
                          </span>

                          <Rate
                            disabled
                            value={item.interest_rate || 0}
                            style={{
                              fontSize: "12px",
                              color: "#f59e0b",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "gray" }}>
                            Response Status:
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              background:
                                item.response_status === "Received"
                                  ? "#dcfce7"
                                  : item.response_status === "Not-Received"
                                    ? "#fee2e2"
                                    : "#f1f5f9",
                              color:
                                item.response_status === "Received"
                                  ? "#166534"
                                  : item.response_status === "Not-Received"
                                    ? "#991b1b"
                                    : "#334155",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {item.response_status || "-"}
                          </span>
                        </div>
                      </div>

                      {item.comments && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#334155",
                            background: "#fff",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {item.comments}
                        </div>
                      )}

                      {item.status && (
                        <div style={{ marginTop: "10px" }}>
                          <p className="leadfollowup_qualitystatus_text">
                            <span
                              style={{
                                fontWeight: 600,
                                color: "gray",
                              }}
                            >
                              Status:
                            </span>{" "}
                            {item.status === 1
                              ? "Details Shared"
                              : item.status === 2
                                ? "Details Not Shared"
                                : "CNA"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <Empty description="No follow-up history found" />
        )}
      </div>
    </div>
  );
}
