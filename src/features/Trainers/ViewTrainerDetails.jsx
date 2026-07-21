import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Avatar,
  Collapse,
  Spin,
  Badge,
  Upload,
  Modal,
} from "antd";
import { UserOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { MdPerson, MdBook, MdAssignment } from "react-icons/md";
import { getTrainerById, getTrainerBanks } from "../ApiService/action";

const { Text } = Typography;

export default function ViewTrainerDetails({ trainerData: initialData }) {
  const [trainerData, setTrainerData] = useState(initialData);
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = () => {
    setPreviewImage(trainerData?.profile_image || "");
    setPreviewOpen(true);
  };

  const fileList = trainerData?.profile_image
    ? [
        {
          uid: "-1",
          name: "profile.png",
          status: "done",
          url: trainerData.profile_image,
        },
      ]
    : [];

  useEffect(() => {
    if (initialData?.id) {
      fetchTrainerDetails();
    } else {
      setTrainerData(initialData);
    }
  }, [initialData]);

  const fetchTrainerDetails = async () => {
    try {
      setLoading(true);
      const [trainerRes, banksRes] = await Promise.all([
        getTrainerById(initialData.id).catch(() => null),
        getTrainerBanks(initialData.id).catch(() => null),
      ]);

      if (trainerRes?.data?.data) {
        console.log("particular trainer details", trainerRes);
        setTrainerData(trainerRes.data.data);
      }
      if (banksRes?.data?.data) {
        setBankDetails(
          banksRes.data.data.filter((f) => f.account_number != ""),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!trainerData) return null;

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

  return (
    <div
      style={{
        padding: "12px",
        background: "#f8fafc",
        minHeight: "100%",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Basic Information */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdPerson size={18} color="#2563eb" />}
          title="Basic Information"
        />
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <div className="customerupdate_profilepicture_container">
            <Upload
              listType="picture-circle"
              fileList={fileList}
              showUploadList={{ showRemoveIcon: false, showPreviewIcon: true }}
              onPreview={handlePreview}
            />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              {trainerData.name}
            </h3>
            <p
              style={{
                margin: "2px 0 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              {trainerData.trainer_code}
            </p>
            <div style={{ marginTop: "4px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color:
                    trainerData.status === "Verified"
                      ? "#166534"
                      : trainerData.status === "Rejected"
                        ? "#991b1b"
                        : "#92400e",
                  background:
                    trainerData.status === "Verified"
                      ? "#dcfce7"
                      : trainerData.status === "Rejected"
                        ? "#fee2e2"
                        : "#fef3c7",
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {trainerData.status || "Pending"}
              </span>
            </div>
          </div>
        </div>
        <Row gutter={24}>
          <Col span={8}>{renderField("Email", trainerData.email)}</Col>
          <Col span={8}>
            {renderField(
              "Mobile Number",
              trainerData.mobile
                ? `+${trainerData.mobile_phone_code || ""} ${trainerData.mobile}`
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "WhatsApp Number",
              trainerData.whatsapp
                ? `+${trainerData.whatsapp_phone_code || ""} ${trainerData.whatsapp}`
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Location",
              trainerData.location ? trainerData.location : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Created At",
              trainerData.created_date
                ? moment(trainerData.created_date).format("DD MMM YYYY hh:mm A")
                : "-",
            )}
          </Col>
        </Row>
      </div>

      {/* Professional Details */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdBook size={18} color="#2563eb" />}
          title="Professional Details"
        />
        <Row gutter={24}>
          <Col span={8}>
            {renderField("Technology", trainerData.technology)}
          </Col>
          <Col span={8}>{renderField("Batch", trainerData.batch)}</Col>
          <Col span={8}>
            {renderField(
              "Overall Experience",
              trainerData.overall_exp_year
                ? `${trainerData.overall_exp_year} Years`
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Relevant Experience",
              trainerData.relavant_exp_year
                ? `${trainerData.relavant_exp_year} Years`
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Skills",
              trainerData.skills && trainerData.skills.length > 0
                ? trainerData.skills.map((s) => s.name).join(", ")
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Certifications",
              trainerData.certifications &&
                trainerData.certifications.length > 0
                ? trainerData.certifications.join(", ")
                : "-",
            )}
          </Col>
        </Row>
      </div>

      {/* Availability Details */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdBook size={18} color="#2563eb" />}
          title="Availability Details"
        />
        <Row gutter={24}>
          <Col span={8}>
            {renderField(
              "Availability Time",
              trainerData.availability_time
                ? moment(trainerData.availability_time, "HH:mm:ss").format(
                    "hh:mm A",
                  )
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Secondary Time",
              trainerData.secondary_time
                ? moment(trainerData.secondary_time, "HH:mm:ss").format(
                    "hh:mm A",
                  )
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Preferred Days",
              trainerData.preferred_days &&
                trainerData.preferred_days.length > 0
                ? trainerData.preferred_days.join(", ")
                : "-",
            )}
          </Col>
        </Row>
      </div>

      {/* Additional Information */}
      <div style={cardStyle}>
        <HeaderTitle
          icon={<MdBook size={18} color="#2563eb" />}
          title="Additional Information"
        />
        <Row gutter={24}>
          <Col span={8}>
            {renderField("Trainer Type", trainerData.trainer_type || "-")}
          </Col>
          <Col span={8}>
            {renderField(
              "Preferred Mode",
              trainerData.preferred_mode &&
                trainerData.preferred_mode.length > 0
                ? trainerData.preferred_mode.join(", ")
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Salary Expectation",
              trainerData.salary_expectation
                ? `${trainerData.salary_expectation} (${trainerData.salary_type || "Per session"})`
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Languages Known",
              (trainerData.language_known || trainerData.languages_known) &&
                (trainerData.language_known?.length > 0 ||
                  trainerData.languages_known?.length > 0)
                ? (
                    trainerData.language_known || trainerData.languages_known
                  ).join(", ")
                : "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Current Trainer Status",
              trainerData.trainer_status || "-",
            )}
          </Col>
          <Col span={8}>
            {renderField(
              "Additional Notes",
              trainerData.additional_notes || "-",
            )}
          </Col>
        </Row>
      </div>

      {/* Bank Details */}
      {(bankDetails.length > 0 || trainerData.is_bank_updated === 1) && (
        <div style={cardStyle}>
          <HeaderTitle
            icon={<MdAssignment size={18} color="#2563eb" />}
            title="Bank Details"
          />
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
            </div>
          ) : bankDetails.length > 0 ? (
            <Collapse accordion defaultActiveKey={["0"]}>
              {bankDetails.map((bank, index) => (
                <Collapse.Panel
                  key={index.toString()}
                  header={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#1f2937" }}>
                        {bank.bank_name || "Bank Account"}
                      </span>
                      {bank.account_number && (
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          - ending in {String(bank.account_number).slice(-4)}
                        </span>
                      )}
                      {index === 0 && (
                        <Badge
                          count="Recently Used"
                          style={{
                            backgroundColor: "#10b981",
                            color: "#fff",
                            marginLeft: "8px",
                            boxShadow: "none",
                          }}
                        />
                      )}
                    </div>
                  }
                >
                  <Row gutter={24}>
                    <Col span={8}>
                      {renderField("Bank Name", bank.bank_name)}
                    </Col>
                    <Col span={8}>
                      {renderField("Branch", bank.branch_name)}
                    </Col>
                    <Col span={8}>
                      {renderField("Account Holder", bank.account_holder_name)}
                    </Col>
                    <Col span={8}>
                      {renderField("Account Number", bank.account_number)}
                    </Col>
                    <Col span={8}>
                      {renderField("IFSC Code", bank.ifsc_code)}
                    </Col>
                  </Row>
                </Collapse.Panel>
              ))}
            </Collapse>
          ) : (
            <Row gutter={24}>
              <Col span={8}>
                {renderField("Bank Name", trainerData.bank_name)}
              </Col>
              <Col span={8}>
                {renderField("Branch", trainerData.branch_name)}
              </Col>
              <Col span={8}>
                {renderField("Account Holder", trainerData.account_holder_name)}
              </Col>
              <Col span={8}>
                {renderField("Account Number", trainerData.account_number)}
              </Col>
              <Col span={8}>
                {renderField("IFSC Code", trainerData.ifsc_code)}
              </Col>
            </Row>
          )}
        </div>
      )}

      {/* Profile Image Preview Modal */}
      <Modal
        open={previewOpen}
        title="Profile Image"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="Profile" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}
