import React, { useState, useEffect } from "react";
import { Drawer, Button, Row, Col, Tag, Radio, Alert } from "antd";
import { FaWhatsapp } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import { RiAttachment2 } from "react-icons/ri";
import { BsCheckCircleFill, BsInfoCircle } from "react-icons/bs";
import {
  getWhatsAppTemplates,
  sendPlacementFollowupTemplate,
} from "../ApiService/action";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import { CommonMessage } from "../Common/CommonMessage";
import { selectValidator, urlValidator } from "../Common/Validation";
import "../Marketing/styles.css";
import "./styles.css";

const AUDIENCE_PRESETS = [
  {
    key: "active",
    label: "Sent, Delivered & Read",
    subtitle: "Default - Reaches all active recipients",
    statuses: ["Sent", "Delivered", "Read"],
  },
  {
    key: "read",
    label: "Read Only",
    subtitle: "High intent leads who opened previous message",
    statuses: ["Read"],
  },
  {
    key: "delivered",
    label: "Delivered Only",
    subtitle: "Delivered but not yet marked read",
    statuses: ["Delivered"],
  },
  {
    key: "failed",
    label: "Failed Only",
    subtitle: "Retry sending to failed recipients",
    statuses: ["Failed"],
  },
  {
    key: "all",
    label: "All Members",
    subtitle: "All contacts in this campaign",
    statuses: ["Sent", "Delivered", "Read", "Failed", "Pending"],
  },
];

const EMPTY_MOBILES_ARRAY = [];

export default function PlacementSendFollowupModal({
  isOpen,
  onClose,
  campaign,
  selectedMobiles = EMPTY_MOBILES_ARRAY,
  onSuccess,
}) {
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplateIdError, setSelectedTemplateIdError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Form states
  const [campaignName, setCampaignName] = useState("");
  const [campaignNameError, setCampaignNameError] = useState("");

  // Target audience states
  const [targetMode, setTargetMode] = useState("preset"); // "preset" | "custom" | "selected"
  const [selectedPreset, setSelectedPreset] = useState("active");
  const [customStatuses, setCustomStatuses] = useState([
    "Sent",
    "Delivered",
    "Read",
  ]);

  // Parameters & Media
  const [parameterValues, setParameterValues] = useState({});
  const [parameterErrors, setParameterErrors] = useState({});
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaUrlError, setMediaUrlError] = useState("");
  const [mediaFilename, setMediaFilename] = useState("");
  const [mediaFilenameError, setMediaFilenameError] = useState("");

  const [buttonLoading, setButtonLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);

  const campaignId = campaign?.campaign_id;
  const campaignNameProp = campaign?.campaign_name;
  const selectedMobilesCount = selectedMobiles?.length || 0;

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      const defaultName = campaignNameProp
        ? `Follow-up: ${campaignNameProp}`
        : campaignId
          ? `Follow-up ${campaignId}`
          : "Follow-up Campaign";
      setCampaignName(defaultName);
      setCampaignNameError("");

      if (selectedMobilesCount > 0) {
        setTargetMode("selected");
      } else {
        setTargetMode("preset");
        setSelectedPreset("active");
        setCustomStatuses(["Sent", "Delivered", "Read"]);
      }
    } else {
      resetForm();
    }
  }, [isOpen, campaignId, campaignNameProp, selectedMobilesCount]);

  const resetForm = () => {
    setSelectedTemplateId("");
    setSelectedTemplateIdError("");
    setSelectedTemplate(null);
    setCampaignName("");
    setCampaignNameError("");
    setTargetMode("preset");
    setSelectedPreset("active");
    setCustomStatuses(["Sent", "Delivered", "Read"]);
    setParameterValues({});
    setParameterErrors({});
    setMediaUrl("");
    setMediaUrlError("");
    setMediaFilename("");
    setMediaFilenameError("");
    setValidationTrigger(false);
  };

  const fetchTemplates = async () => {
    if (templates.length > 0 || templateLoading) return;
    setTemplateLoading(true);
    try {
      const response = await getWhatsAppTemplates();
      if (response?.data?.success) {
        const list = response.data.data || [];
        setTemplates(list);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      CommonMessage("error", "Could not load WhatsApp templates.");
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target?.value;
    setSelectedTemplateId(templateId);

    if (validationTrigger) {
      setSelectedTemplateIdError(selectValidator(templateId));
    }

    const found = templates.find((t) => String(t.id) === String(templateId));
    setSelectedTemplate(found || null);
    setParameterValues({});
    setParameterErrors({});
    setMediaUrl("");
    setMediaUrlError("");
    setMediaFilename("");
    setMediaFilenameError("");
  };

  const getEffectiveStatusFilter = () => {
    if (targetMode === "selected") {
      return ["Sent", "Delivered", "Read"];
    }
    if (targetMode === "custom") {
      return customStatuses.length > 0
        ? customStatuses
        : ["Sent", "Delivered", "Read"];
    }
    const preset = AUDIENCE_PRESETS.find((p) => p.key === selectedPreset);
    return preset ? preset.statuses : ["Sent", "Delivered", "Read"];
  };

  const validateForm = () => {
    setValidationTrigger(true);
    let isValid = true;

    if (!campaignName?.trim()) {
      setCampaignNameError(selectValidator(campaignName));
      isValid = false;
    } else {
      setCampaignNameError("");
    }

    const templateValidate = selectValidator(selectedTemplateId);
    setSelectedTemplateIdError(templateValidate);
    if (templateValidate) {
      isValid = false;
    }

    if (selectedTemplate?.parameters) {
      const newParamErrors = {};
      selectedTemplate.parameters.forEach((param) => {
        if (param.required) {
          const val = parameterValues[param.key];
          const err = selectValidator(val);
          if (err) {
            newParamErrors[param.key] = err;
            isValid = false;
          }
        }
      });
      setParameterErrors(newParamErrors);
    }

    if (selectedTemplate?.media_required) {
      const mediaUrlVal = urlValidator(mediaUrl);
      setMediaUrlError(mediaUrlVal);
      if (mediaUrlVal) {
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      CommonMessage("error", "Please fill all mandatory fields.");
      return;
    }

    if (!campaign?.campaign_id) {
      CommonMessage("error", "Invalid campaign selected.");
      return;
    }

    const effectiveStatusFilter = getEffectiveStatusFilter();
    const effectiveSelectedMobiles =
      targetMode === "selected" && selectedMobiles?.length > 0
        ? selectedMobiles
        : undefined;

    const payload = {
      campaign_id: campaign.campaign_id,
      campaignId: campaign.campaign_id,
      template_id: Number(selectedTemplateId) || selectedTemplateId,
      templateId: Number(selectedTemplateId) || selectedTemplateId,
      status_filter: effectiveStatusFilter,
      statusFilter: effectiveStatusFilter,
      campaign_name: campaignName.trim(),
      campaignName: campaignName.trim(),
      values: parameterValues,
      media_url: mediaUrl ? mediaUrl.trim() : undefined,
      mediaUrl: mediaUrl ? mediaUrl.trim() : undefined,
      media_filename: mediaFilename ? mediaFilename.trim() : undefined,
      mediaFilename: mediaFilename ? mediaFilename.trim() : undefined,
      selected_mobile_numbers: effectiveSelectedMobiles,
      selectedMobiles: effectiveSelectedMobiles,
    };

    setButtonLoading(true);
    try {
      const response = await sendPlacementFollowupTemplate(payload);

      if (response?.data?.success) {
        const newCampaignId =
          response.data.campaign_id ||
          response.data.data?.campaign_id ||
          response.data.new_campaign_id;

        CommonMessage(
          "success",
          newCampaignId
            ? `${response.data.message || "Follow-up placement campaign dispatched successfully!"} (ID: ${newCampaignId})`
            : response.data.message ||
                "Follow-up placement campaign dispatched successfully!",
        );

        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      } else {
        CommonMessage(
          "error",
          response?.data?.message || "Failed to dispatch follow-up campaign",
        );
      }
    } catch (error) {
      console.error("Error sending placement follow-up template:", error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while sending follow-up campaign.";
      CommonMessage("error", serverMsg);
    } finally {
      setButtonLoading(false);
    }
  };

  const templateOptions = templates.map((t) => ({
    ...t,
    id: String(t.id),
    name: t.template_label || t.template_name || t.name,
  }));

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width={window.innerWidth > 1400 ? "46%" : "55%"}
      className="whatsapp-followup-drawer"
      title={
        <div className="wcf-modal-header">
          <div className="wcf-modal-header-icon-wrap">
            <FaWhatsapp size={20} color="#25D366" />
          </div>
          <div>
            <h3 className="wcf-modal-title">Send Follow-up Template</h3>
            <p className="wcf-modal-subtitle">
              Original Campaign:{" "}
              <span style={{ fontWeight: 700 }}>
                {campaign?.campaign_name || "—"}
              </span>{" "}
              <span className="wcf-campaign-id-badge">
                ({campaign?.campaign_id})
              </span>
            </p>
          </div>
        </div>
      }
      footer={
        <div className="wcf-modal-footer">
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={buttonLoading}
            icon={<MdSend />}
            className="wcf-btn-submit"
          >
            Send Follow-up Template
          </Button>
        </div>
      }
    >
      <div className="wcf-modal-body">
        {/* Step 1: Choose Template & Follow-up Campaign Name */}
        <div className="wcf-step-card">
          <div className="wcf-step-header">
            <span className="wcf-step-number">1</span>
            <div className="wcf-step-info">
              <span className="wcf-step-title">
                Choose Template & Campaign Name
              </span>
              <span className="wcf-step-desc">
                Select an approved WhatsApp template to send to this campaign's
                audience.
              </span>
            </div>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <CommonInputField
                label="Follow-up Campaign Name"
                placeholder="e.g. Follow-up Special Offer"
                required={true}
                value={campaignName}
                onChange={(e) => {
                  setCampaignName(e.target.value);
                  if (validationTrigger) {
                    setCampaignNameError(selectValidator(e.target.value));
                  }
                }}
                error={campaignNameError}
                height="35px"
                labelFontSize="11.5px"
                errorFontSize="9px"
              />
            </Col>
            <Col xs={24} md={12}>
              <CommonSelectField
                label="Select WhatsApp Template"
                placeholder="Choose a Template"
                options={templateOptions}
                showLabelStatus="Name"
                value={selectedTemplateId}
                required={true}
                onChange={handleTemplateChange}
                error={selectedTemplateIdError}
                loading={templateLoading}
                height="35px"
                labelFontSize="11.5px"
                labelMarginTop="0px"
                errorFontSize="9px"
              />
            </Col>
          </Row>

          {selectedTemplate && (
            <div className="wcf-template-preview-badge-row">
              <span className="wcf-badge-label">Category:</span>
              <Tag color="blue">{selectedTemplate.category || "UTILITY"}</Tag>
              <span className="wcf-badge-label">Language:</span>
              <Tag color="geekblue">{selectedTemplate.language || "en"}</Tag>
              {selectedTemplate.media_required && (
                <Tag color="orange" icon={<RiAttachment2 />}>
                  Media Attachment Required
                </Tag>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Target Audience Filter */}
        <div className="wcf-step-card">
          <div className="wcf-step-header">
            <span className="wcf-step-number">2</span>
            <div className="wcf-step-info">
              <span className="wcf-step-title">Target Audience Filter</span>
              <span className="wcf-step-desc">
                Filter which members of this campaign receive the follow-up
                message.
              </span>
            </div>
          </div>

          {selectedMobiles && selectedMobiles.length > 0 && (
            <Alert
              message={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    <strong>
                      {selectedMobiles.length} recipients selected
                    </strong>{" "}
                    from campaign member table.
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      size="small"
                      type={targetMode === "selected" ? "primary" : "default"}
                      onClick={() => setTargetMode("selected")}
                      style={{ fontSize: "11px" }}
                    >
                      Use Selected ({selectedMobiles.length})
                    </Button>
                    <Button
                      size="small"
                      type={targetMode !== "selected" ? "primary" : "default"}
                      onClick={() => setTargetMode("preset")}
                      style={{ fontSize: "11px" }}
                    >
                      Switch to Status Filter
                    </Button>
                  </div>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: "14px", borderRadius: "8px" }}
            />
          )}

          {targetMode === "selected" && selectedMobiles?.length > 0 ? (
            <div className="wcf-selected-mobiles-info">
              <BsCheckCircleFill color="#10b981" size={16} />
              <span>
                Sending follow-up exclusively to the{" "}
                <strong>{selectedMobiles.length}</strong> manually selected
                recipients.
              </span>
            </div>
          ) : (
            <div>
              <div className="wcf-audience-presets-grid">
                {AUDIENCE_PRESETS.map((preset) => (
                  <div
                    key={preset.key}
                    onClick={() => {
                      setTargetMode("preset");
                      setSelectedPreset(preset.key);
                    }}
                    className={`wcf-audience-card ${
                      targetMode === "preset" && selectedPreset === preset.key
                        ? "selected"
                        : ""
                    }`}
                  >
                    <div className="wcf-audience-card-top">
                      <Radio
                        checked={
                          targetMode === "preset" &&
                          selectedPreset === preset.key
                        }
                        onChange={() => {
                          setTargetMode("preset");
                          setSelectedPreset(preset.key);
                        }}
                      />
                      <span className="wcf-audience-card-label">
                        {preset.label}
                      </span>
                    </div>
                    <p className="wcf-audience-card-desc">{preset.subtitle}</p>
                    <div className="wcf-audience-card-tags">
                      {preset.statuses.map((s) => (
                        <span
                          key={s}
                          className={`wcf-status-pill ${s.toLowerCase()}`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Template Dynamic Parameters */}
        {selectedTemplate && (
          <div className="wcf-step-card">
            <div className="wcf-step-header">
              <span className="wcf-step-number">3</span>
              <div className="wcf-step-info">
                <span className="wcf-step-title">
                  Template Dynamic Parameters
                </span>
                <span className="wcf-step-desc">
                  Provide parameter values configured for this template.
                </span>
              </div>
            </div>

            <div className="wcf-auto-name-note">
              <BsInfoCircle size={14} color="#2563eb" />
              <span>
                <strong>Note:</strong> Name parameters (e.g. Customer Name) are
                auto-populated from recipient records.
              </span>
            </div>

            {selectedTemplate.parameters &&
            selectedTemplate.parameters.length > 0 ? (
              <Row gutter={[16, 16]}>
                {selectedTemplate.parameters.map((param) => {
                  return (
                    <Col xs={24} md={12} key={param.key}>
                      <CommonInputField
                        label={param.label || param.key}
                        placeholder={`Enter ${String(param.label || param.key).toLowerCase()}`}
                        required={param.required}
                        value={parameterValues[param.key] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParameterValues((prev) => ({
                            ...prev,
                            [param.key]: val,
                          }));
                          if (validationTrigger && param.required) {
                            setParameterErrors((prev) => ({
                              ...prev,
                              [param.key]: selectValidator(val),
                            }));
                          }
                        }}
                        error={parameterErrors[param.key]}
                        height="35px"
                        labelFontSize="11.5px"
                        errorFontSize="9px"
                        disableAutoCapitalize={true}
                      />
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                This template has no dynamic parameters required.
              </p>
            )}
          </div>
        )}

        {/* Step 4: Media (if template.media_required is true) */}
        {selectedTemplate?.media_required && (
          <div className="wcf-step-card">
            <div className="wcf-step-header">
              <span className="wcf-step-number">4</span>
              <div className="wcf-step-info">
                <span className="wcf-step-title">Media Attachment</span>
                <span className="wcf-step-desc">
                  This template requires a document, image, or media attachment.
                </span>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={14}>
                <CommonInputField
                  label="Document / Media URL"
                  placeholder="https://actecrm.com/uploads/offer.pdf"
                  required={true}
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    if (validationTrigger) {
                      setMediaUrlError(urlValidator(e.target.value));
                    }
                  }}
                  error={mediaUrlError}
                  height="35px"
                  labelFontSize="11.5px"
                  errorFontSize="9px"
                  disableAutoCapitalize={true}
                />
              </Col>
              <Col xs={24} md={10}>
                <CommonInputField
                  label="Media Filename (Optional)"
                  placeholder="e.g. offer.pdf"
                  required={false}
                  value={mediaFilename}
                  onChange={(e) => setMediaFilename(e.target.value)}
                  error={mediaFilenameError}
                  height="35px"
                  labelFontSize="11.5px"
                  errorFontSize="9px"
                  disableAutoCapitalize={true}
                />
              </Col>
            </Row>
          </div>
        )}
      </div>
    </Drawer>
  );
}
