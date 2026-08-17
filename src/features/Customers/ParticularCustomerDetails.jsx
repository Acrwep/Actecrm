import React, { useState, useEffect } from "react";
import { Row, Col, Upload, Modal, Skeleton, Typography, Spin } from "antd";
import { FaRegUser } from "react-icons/fa";
import {
  MdPerson,
  MdBook,
  MdAssignment,
  MdAssignmentInd,
} from "react-icons/md";
import moment from "moment";
import { getCustomerById } from "../ApiService/action";
import EllipsisTooltip from "../Common/EllipsisTooltip";

const { Text } = Typography;

export default function ParticularCustomerDetails({ customerId }) {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [profilePictureArray, setProfilePictureArray] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticularCustomerDetails();
  }, [customerId]);

  const getParticularCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await getCustomerById(customerId);
      const customer_details = response?.data?.data;
      console.log("particular customer details", customer_details);
      setCustomerDetails(customer_details);
      if (customer_details?.profile_image) {
        setProfilePictureArray([
          {
            uid: "-1",
            name: "profile.jpg",
            status: "done",
            url: customer_details.profile_image,
          },
        ]);
      } else {
        setProfilePictureArray([]);
      }
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (file) => {
    if (file.url) {
      setPreviewImage(file.url);
      setPreviewOpen(true);
      return;
    }
    setPreviewOpen(true);
    const rawFile = file.originFileObj || file;
    const reader = new FileReader();
    reader.readAsDataURL(rawFile);
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreviewImage(dataUrl);
      setPreviewOpen(true);
    };
  };

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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={cardStyle}>
          <Skeleton avatar active paragraph={{ rows: 2 }} />
        </div>
        <div style={cardStyle}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      </div>
    );
  }

  if (!customerDetails) return null;

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "0px",
      }}
    >
      {/* 1. Profile Header */}
      <div
        style={{
          ...cardStyle,
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#f1f5f9",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {customerDetails?.profile_image ? (
            <Upload
              listType="picture-circle"
              fileList={profilePictureArray}
              onPreview={handlePreview}
              onRemove={false}
              showUploadList={{ showRemoveIcon: false }}
              beforeUpload={() => false}
              style={{ width: 90, height: 90 }}
              accept=".png,.jpg,.jpeg"
            />
          ) : (
            <FaRegUser size={40} color="#94a3b8" />
          )}
        </div>
        <div>
          <h2
            style={{
              margin: 0,
              color: "#1e293b",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            {customerDetails?.name || "-"}
          </h2>
          {customerDetails?.student_id && (
            <Text
              style={{
                color: "#64748b",
                fontSize: "13px",
                display: "block",
                fontWeight: 500,
              }}
            >
              ID: {customerDetails.student_id}
            </Text>
          )}
          <Text
            style={{
              color: "#64748b",
              fontSize: "13px",
              display: "block",
              fontWeight: 500,
              marginTop: "0.5px",
            }}
          >
            Date Of Joining:{" "}
            {customerDetails?.date_of_joining
              ? formatDateTime(customerDetails?.date_of_joining)
              : "-"}
          </Text>
        </div>
      </div>

      {/* 2. Basic Information */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdPerson size={18} color="#2563eb" />}
          title="Basic Information"
        />
        <Row gutter={24}>
          <Col span={6}>
            {renderField(
              "Created At",
              formatDateTime(customerDetails?.created_date),
            )}
          </Col>
          <Col span={6}>{renderField("Email", customerDetails?.email)}</Col>
          <Col span={6}>
            {renderField("Mobile Number", customerDetails?.phone)}
          </Col>
          <Col span={6}>
            {renderField("WhatsApp Number", customerDetails?.whatsapp)}
          </Col>
          <Col span={6}>
            {renderField(
              "Date Of Birth",
              formatDateTime(customerDetails?.date_of_birth),
            )}
          </Col>
          <Col span={6}>{renderField("Gender", customerDetails?.gender)}</Col>
          <Col span={6}>
            {renderField("Area", customerDetails?.current_location)}
          </Col>
        </Row>
      </div>

      {/* 3. Course Details */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdBook size={18} color="#2563eb" />}
          title="Course Details"
        />
        <Row gutter={24}>
          <Col span={6}>
            {renderField("Course", customerDetails?.course_name)}
          </Col>
          <Col span={6}>
            {renderField(
              "Course Fees",
              customerDetails?.primary_fees
                ? `₹${customerDetails.primary_fees}`
                : "-",
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Course Fees (+GST)",
              customerDetails?.total_amount
                ? `₹${customerDetails.total_amount}`
                : "-",
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Discount Amount",
              customerDetails?.discount_amount != null
                ? `₹${customerDetails.discount_amount}`
                : "₹0.00",
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Balance Amount",
              customerDetails?.balance_amount != null
                ? `₹${customerDetails.balance_amount}`
                : "-",
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Next Due Date",
              formatDateTime(customerDetails?.next_due_date),
            )}
          </Col>
          <Col span={6}>
            {renderField("Batch Type", customerDetails?.batch_timing)}
          </Col>
          <Col span={6}>
            {renderField("Batch Track", customerDetails?.batch_tracking)}
          </Col>
          <Col span={6}>
            {renderField(
              "Server",
              customerDetails?.is_server_required !== undefined
                ? customerDetails.is_server_required === 1
                  ? "Required"
                  : "Not Required"
                : "-",
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Placement Support",
              customerDetails?.placement_support,
            )}
          </Col>
        </Row>
      </div>

      {/* 4. Assignment Details */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdAssignment size={18} color="#2563eb" />}
          title="Assignment Details"
        />
        <Row gutter={24}>
          <Col span={6}>
            {renderField(
              "Lead Executive",
              customerDetails?.lead_assigned_to_id
                ? `${customerDetails.lead_assigned_to_id} (${customerDetails.lead_assigned_to_name || "-"})`
                : "-",
            )}
          </Col>
          <Col span={6}>
            {renderField("Region", customerDetails?.region_name)}
          </Col>
          <Col span={6}>
            {renderField("Branch", customerDetails?.branch_name)}
          </Col>
          <Col span={6}>
            {renderField(
              "Mode of Training",
              customerDetails?.mode_of_class_name,
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Place of Service",
              customerDetails?.place_of_service_name,
            )}
          </Col>
        </Row>
      </div>

      {/* 5. Signature */}
      {customerDetails?.signature_image && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            marginTop: "8px",
            paddingRight: "12px",
          }}
        >
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#000",
              marginBottom: "4px",
            }}
          >
            Signature
          </span>
          <img
            src={`${customerDetails.signature_image}`}
            alt="Customer Signature"
            style={{ maxWidth: "160px" }}
          />
        </div>
      )}

      <Modal
        open={previewOpen}
        title="Preview Profile"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}
