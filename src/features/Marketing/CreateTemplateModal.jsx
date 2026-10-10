import React, { useState, useEffect } from "react";
import { Modal, Button, Switch, Space, Row, Col, Drawer } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { createWhatsAppTemplate } from "../ApiService/action";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTextArea from "../Common/CommonTextArea";
import { CommonMessage } from "../Common/CommonMessage";
import { selectValidator } from "../Common/Validation";
import CommonSpinner from "../Common/CommonSpinner";

export default function CreateTemplateModal({ isOpen, onClose }) {
  const [validationTrigger, setValidationTrigger] = useState(false);

  // Form Fields
  const [templateLabel, setTemplateLabel] = useState("");
  const [templateLabelError, setTemplateLabelError] = useState("");

  const [templateKey, setTemplateKey] = useState("");
  const [templateKeyError, setTemplateKeyError] = useState("");

  const [campaignName, setCampaignName] = useState("");
  const [campaignNameError, setCampaignNameError] = useState("");

  const [category, setCategory] = useState("UTILITY");
  const [categoryError, setCategoryError] = useState("");

  const [language, setLanguage] = useState("en");
  const [languageError, setLanguageError] = useState("");

  const [description, setDescription] = useState("");

  const [mediaRequired, setMediaRequired] = useState(false);
  const [mediaType, setMediaType] = useState(null);
  const [mediaTypeError, setMediaTypeError] = useState("");

  const [parameters, setParameters] = useState([
    { key: "", label: "", required: true },
  ]);
  const [parameterErrors, setParameterErrors] = useState([
    { key: "", label: "" },
  ]);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTemplateLabel("");
    setTemplateLabelError("");
    setTemplateKey("");
    setTemplateKeyError("");
    setCampaignName("");
    setCampaignNameError("");
    setCategory("UTILITY");
    setCategoryError("");
    setLanguage("en");
    setLanguageError("");
    setDescription("");
    setMediaRequired(false);
    setMediaType(null);
    setMediaTypeError("");
    setParameters([{ key: "", label: "", required: true }]);
    setParameterErrors([{ key: "", label: "" }]);
    setValidationTrigger(false);
  };

  const categoryOptions = [
    { id: "UTILITY", name: "Utility" },
    { id: "MARKETING", name: "Marketing" },
    { id: "AUTHENTICATION", name: "Authentication" },
  ];

  const languageOptions = [
    { id: "en", name: "English (en)" },
    { id: "en_US", name: "English (US)" },
    { id: "en_GB", name: "English (UK)" },
  ];

  const mediaTypeOptions = [
    { id: "document", name: "Document (PDF)" },
    { id: "image", name: "Image" },
    { id: "video", name: "Video" },
  ];

  const validateForm = () => {
    setValidationTrigger(true);
    let isValid = true;

    const labelErr = selectValidator(templateLabel);
    const keyErr = selectValidator(templateKey);
    const campaignErr = selectValidator(campaignName);
    const catErr = selectValidator(category);
    const langErr = selectValidator(language);

    setTemplateLabelError(labelErr);
    setTemplateKeyError(keyErr);
    setCampaignNameError(campaignErr);
    setCategoryError(catErr);
    setLanguageError(langErr);

    if (labelErr || keyErr || campaignErr || catErr || langErr) {
      isValid = false;
    }

    if (mediaRequired) {
      const mediaErr = selectValidator(mediaType);
      setMediaTypeError(mediaErr);
      if (mediaErr) isValid = false;
    }

    const newParamErrors = parameters.map((p) => {
      const pKeyErr = selectValidator(p.key);
      const pLabelErr = selectValidator(p.label);
      if (pKeyErr || pLabelErr) isValid = false;
      return { key: pKeyErr, label: pLabelErr };
    });
    setParameterErrors(newParamErrors);

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setButtonLoading(true);
    try {
      const payload = {
        template_key: templateKey,
        template_label: templateLabel,
        campaign_name: campaignName,
        description: description || "",
        category: category,
        language: language,
        parameters: parameters,
        media_required: mediaRequired,
        media_type: mediaRequired ? mediaType : null,
      };

      await createWhatsAppTemplate(payload);

      CommonMessage(
        "success",
        "The new WhatsApp template has been created successfully.",
      );
      setButtonLoading(false);
      onClose();
    } catch (error) {
      console.error("Error creating template:", error);
      const errorMessage =
        error?.response?.data?.error?.errorMessage ||
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.error?.errorMessage ||
        error?.error?.message ||
        "An unexpected error occurred.";
      setButtonLoading(false);
      CommonMessage("error", errorMessage);
    }
  };

  const handleAddParameter = () => {
    setParameters([...parameters, { key: "", label: "", required: true }]);
    setParameterErrors([...parameterErrors, { key: "", label: "" }]);
  };

  const handleRemoveParameter = (index) => {
    const newParams = [...parameters];
    newParams.splice(index, 1);
    setParameters(newParams);

    const newErrors = [...parameterErrors];
    newErrors.splice(index, 1);
    setParameterErrors(newErrors);
  };

  const updateParameter = (index, field, value) => {
    const newParams = [...parameters];
    newParams[index][field] = value;
    setParameters(newParams);

    if (validationTrigger) {
      const newErrors = [...parameterErrors];
      if (field === "key" || field === "label") {
        newErrors[index][field] = selectValidator(value);
      }
      setParameterErrors(newErrors);
    }
  };

  return (
    <Drawer
      title={"Create New WhatsApp Template"}
      open={isOpen}
      onClose={onClose}
      width={"50%"}
      className="customer_statusupdate_drawer"
      style={{ position: "relative", paddingBottom: 65 }}
    >
      <div style={{ padding: "24px" }}>
        <Row gutter={[16, 24]}>
          <Col span={8}>
            <CommonInputField
              label="Template Label"
              placeholder="e.g. Standard Invoice"
              required={true}
              value={templateLabel}
              onChange={(e) => {
                setTemplateLabel(e.target.value);
                if (validationTrigger)
                  setTemplateLabelError(selectValidator(e.target.value));
              }}
              error={templateLabelError}
              height="34px"
              labelFontSize="11px"
              errorFontSize="9px"
              labelMarginTop="0px"
              disableAutoCapitalize={true}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Template Key"
              placeholder="e.g. standard_invoice"
              required={true}
              value={templateKey}
              onChange={(e) => {
                setTemplateKey(e.target.value);
                if (validationTrigger)
                  setTemplateKeyError(selectValidator(e.target.value));
              }}
              error={templateKeyError}
              height="34px"
              labelFontSize="11px"
              errorFontSize="9px"
              labelMarginTop="0px"
              disableAutoCapitalize={true}
            />
          </Col>

          <Col span={8}>
            <CommonInputField
              label="AiSensy Campaign Name"
              placeholder="e.g. acte_payment_invoice"
              required={true}
              value={campaignName}
              onChange={(e) => {
                setCampaignName(e.target.value);
                if (validationTrigger)
                  setCampaignNameError(selectValidator(e.target.value));
              }}
              error={campaignNameError}
              height="34px"
              labelFontSize="11px"
              errorFontSize="9px"
              labelMarginTop="0px"
              disableAutoCapitalize={true}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Category"
              options={categoryOptions}
              showLabelStatus="Name"
              required={true}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (validationTrigger)
                  setCategoryError(selectValidator(e.target.value));
              }}
              error={categoryError}
              height="34px"
              labelFontSize="11px"
              errorFontSize="9px"
              labelMarginTop="0px"
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Language"
              options={languageOptions}
              showLabelStatus="Name"
              required={true}
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                if (validationTrigger)
                  setLanguageError(selectValidator(e.target.value));
              }}
              error={languageError}
              height="34px"
              labelFontSize="11px"
              errorFontSize="9px"
              labelMarginTop="0px"
            />
          </Col>
        </Row>

        <div style={{ marginTop: "16px" }}>
          <CommonTextArea
            label="Template Body / Message Text"
            placeholder="Paste the exact WhatsApp message from AiSensy here. e.g. Hello {{1}}..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            labelFontSize="11px"
            labelMarginTop="0px"
            disableAutoCapitalize={true}
          />
        </div>

        <div className="dynamic-parameters-container">
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              marginBottom: "12px",
              color: "#374151",
            }}
          >
            Media Attachment
          </div>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    marginBottom: "4px",
                  }}
                >
                  Is Media Required?
                </span>
                <Switch
                  size="small"
                  style={{ width: "35px" }}
                  checked={mediaRequired}
                  onChange={(checked) => {
                    setMediaRequired(checked);
                    if (!checked) {
                      setMediaType(null);
                      setMediaTypeError("");
                    }
                  }}
                />
              </div>
            </Col>
            {mediaRequired && (
              <Col span={16}>
                <CommonSelectField
                  label="Media Type"
                  options={mediaTypeOptions}
                  showLabelStatus="Name"
                  required={true}
                  value={mediaType}
                  onChange={(e) => {
                    setMediaType(e.target.value);
                    if (validationTrigger)
                      setMediaTypeError(selectValidator(e.target.value));
                  }}
                  error={mediaTypeError}
                  height="34px"
                  labelFontSize="11px"
                  errorFontSize="9px"
                  labelMarginTop="0px"
                />
              </Col>
            )}
          </Row>
        </div>

        <div className="dynamic-parameters-container">
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              marginBottom: "4px",
              color: "#334155",
            }}
          >
            Dynamic Parameters
          </div>
          <p className="create_whatsapp_template_section_description">
            Define the variables that this template requires (e.g.
            customer_name, invoice_url).
          </p>

          {parameters.map((param, index) => (
            <Space
              key={index}
              style={{
                display: "flex",
                marginBottom: 24,
                alignItems: "flex-start",
              }}
              align="baseline"
            >
              <div>
                <CommonInputField
                  label="Parameter Key"
                  placeholder="e.g. course_name"
                  required={true}
                  value={param.key}
                  onChange={(e) =>
                    updateParameter(index, "key", e.target.value)
                  }
                  error={parameterErrors[index]?.key}
                  height="34px"
                  labelFontSize="11px"
                  errorFontSize="9px"
                  labelMarginTop="0px"
                  width="200px"
                  disableAutoCapitalize={true}
                />
              </div>
              <div>
                <CommonInputField
                  label="UI Label"
                  placeholder="e.g. Course Name"
                  required={true}
                  value={param.label}
                  onChange={(e) =>
                    updateParameter(index, "label", e.target.value)
                  }
                  error={parameterErrors[index]?.label}
                  height="34px"
                  labelFontSize="11px"
                  errorFontSize="9px"
                  labelMarginTop="0px"
                  width="200px"
                  disableAutoCapitalize={true}
                />
              </div>
              <div className="whatsapp_template_parameter_switch">
                <Switch
                  size="small"
                  checked={param.required}
                  onChange={(checked) =>
                    updateParameter(index, "required", checked)
                  }
                />
              </div>

              {parameters.length > 1 && (
                <MinusCircleOutlined
                  className="whatsapp_template_parameter_remove"
                  onClick={() => handleRemoveParameter(index)}
                />
              )}
            </Space>
          ))}

          <Button
            type="dashed"
            onClick={handleAddParameter}
            block
            icon={<PlusOutlined />}
            className="create_whatsapp_template_add_parameter_button"
          >
            Add Parameter
          </Button>
        </div>
      </div>

      <div className="leadmanager_tablefiler_footer">
        <div className="leadmanager_submitlead_buttoncontainer">
          <>
            {buttonLoading ? (
              <button className={"create_whatsapp_template_button_loading"}>
                <CommonSpinner />
              </button>
            ) : (
              <button
                className={"create_whatsapp_template_button"}
                onClick={handleSubmit}
              >
                Create Template
              </button>
            )}
          </>
        </div>
      </div>
    </Drawer>
  );
}
