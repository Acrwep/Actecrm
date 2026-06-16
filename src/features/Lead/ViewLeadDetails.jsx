import React from "react";
import { Row, Col, Typography } from "antd";
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

const { Text } = Typography;

export default function ViewLeadDetails({ leadData }) {
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

  const getFollowUpStatusName = (id) => {
    switch (id) {
      case 1:
        return "Highly Interested";
      case 8:
        return "Interested";
      case 7:
        return "Need Follow-up";
      case 10:
        return "Call Back Later";
      case 9:
        return "Only Enquiry";
      case 11:
        return "No Response";
      case 3:
        return "Service Not Availabe";
      case 5:
        return "Not Interested";
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
          <Col span={8}>
            {renderField(
              "Communication",
              getCommunicationStatusName(leadData.communication_status),
            )}
          </Col>
          <Col span={8}>
            {renderField("Mode", getContactModeName(leadData.contact_mode))}
          </Col>
          <Col span={8}>
            {renderField("Counsel Given", leadData?.counsel || "Not Given")}
          </Col>
          <Col span={8}>
            {renderField("Lead Priority", leadData.lead_status)}
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
          <Col span={8}>
            {renderField("Assigned Executive", leadData.lead_assigned_to_name)}
          </Col>
          <Col span={8}>
            {renderField("Assigned Manager", leadData.assigned_manager_name)}
          </Col>
          <Col span={8}>{renderField("Lead Owner", leadData.user_id)}</Col>
        </Row>
      </div>

      {/* 6. Follow-Up Planning */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdEventNote size={18} color="#2563eb" />}
          title="Follow-up Planning"
        />
        <Row gutter={24}>
          <Col span={8}>
            {renderField(
              "Follow-up Type",
              getFollowUpStatusName(leadData.lead_action_id),
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Next Follow-up Date",
              formatDateTime(leadData.next_follow_up_date, "DD MMM YYYY"),
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Next Follow-up Time",
              leadData.next_follow_up_time
                ? moment(leadData.next_follow_up_time, "HH:mm:ss").format(
                    "hh:mm A",
                  )
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Interest Rating",
              leadData.interest_rate ? `${leadData.interest_rate} / 5` : "-",
            )}
          </Col>
          <Col span={24}>{renderField("Remarks", leadData.comments)}</Col>
        </Row>
      </div>
    </div>
  );
}
