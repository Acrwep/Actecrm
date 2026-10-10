import React, { useState, useEffect } from "react";
import { Modal, Button, notification, Row, Col, Spin, Drawer } from "antd";
import { MdSend, MdOutlineDescription } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import {
  getWhatsAppTemplates,
  sendWhatsAppTemplate,
} from "../ApiService/action";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import "./styles.css";
import {
  nameValidator,
  selectValidator,
  mobileValidator,
  urlValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";

export default function SendWhatsAppMessage({
  isOpen,
  onClose,
  customer,
  leadId,
}) {
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  // Form states
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplateIdError, setSelectedTemplateIdError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerNameError, setCustomerNameError] = useState("");

  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");

  const [parameterValues, setParameterValues] = useState({});
  const [parameterErrors, setParameterErrors] = useState({});

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaUrlError, setMediaUrlError] = useState("");

  const [mediaFilename, setMediaFilename] = useState("");
  const [mediaFilenameError, setMediaFilenameError] = useState("");

  const [validationTrigger, setValidationTrigger] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setCustomerName(customer?.name || customer?.customer_name || "");
      setMobile(customer?.mobile || customer?.phone || "");
    } else {
      resetForm();
    }
  }, [isOpen, customer]);

  const resetForm = () => {
    setSelectedTemplate(null);
    setSelectedTemplateId("");
    setSelectedTemplateIdError("");
    setCustomerName("");
    setCustomerNameError("");
    setMobile("");
    setMobileError("");
    setParameterValues({});
    setParameterErrors({});
    setMediaUrl("");
    setMediaUrlError("");
    setMediaFilename("");
    setMediaFilenameError("");
    setValidationTrigger(false);
  };

  const fetchTemplates = async () => {
    setTemplateLoading(true);
    try {
      const response = await getWhatsAppTemplates();
      if (response?.data?.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      notification.error({
        message: "Failed to Fetch Templates",
        description:
          "Could not load WhatsApp templates. Please check your backend connection.",
      });
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

    const template = templates.find((t) => String(t.id) === String(templateId));
    setSelectedTemplate(template || null);

    if (template && customer) {
      const prepopulate = {};
      template.parameters?.forEach((param) => {
        if (customer[param.key]) {
          prepopulate[param.key] = customer[param.key];
        }
      });
      setParameterValues(prepopulate);
      setParameterErrors({});
    } else {
      setParameterValues({});
      setParameterErrors({});
    }

    setMediaUrl("");
    setMediaUrlError("");
    setMediaFilename("");
    setMediaFilenameError("");
  };

  const validateForm = () => {
    setValidationTrigger(true);
    let isValid = true;

    const templateValidate = selectValidator(selectedTemplateId);
    const customerNameValidate = nameValidator(customerName);
    const mobileValidate = mobileValidator(mobile);

    setSelectedTemplateIdError(templateValidate);
    setCustomerNameError(customerNameValidate);
    setMobileError(mobileValidate);

    if (templateValidate || customerNameValidate || mobileValidate) {
      isValid = false;
    }

    if (selectedTemplate) {
      const newParamErrors = {};
      selectedTemplate.parameters?.forEach((param) => {
        if (param.required) {
          const err = selectValidator(parameterValues[param.key]);
          if (err) {
            newParamErrors[param.key] = err;
            isValid = false;
          }
        }
      });
      setParameterErrors(newParamErrors);

      if (selectedTemplate.media_required) {
        const urlErr = urlValidator(mediaUrl);
        const fileErr = selectValidator(mediaFilename);

        setMediaUrlError(urlErr);
        setMediaFilenameError(fileErr);

        if (urlErr || fileErr) {
          isValid = false;
        }
      }
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedTemplate) return;

    setButtonLoading(true);
    try {
      const payload = {
        template_id: selectedTemplate.id,
        mobile: mobile,
        customer_name: customerName,
        lead_id: leadId,
        values: parameterValues,
      };

      if (selectedTemplate.media_required) {
        payload.media_url = mediaUrl;
        payload.media_filename = mediaFilename;
      }

      await sendWhatsAppTemplate(payload);

      CommonMessage("success", "WhatsApp message has been sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error sending WhatsApp template message:", error);

      const errorMessage =
        error?.response?.data?.error?.errorMessage ||
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.error?.errorMessage ||
        error?.error?.message;

      if (errorMessage === "Campaign does not exist.") {
        CommonMessage(
          "error",
          "Template does not exist. Please add it to AiSensy.",
        );
      } else {
        CommonMessage("error", "Failed to Send. Please try again later.");
      }
    } finally {
      setButtonLoading(false);
    }
  };

  const getPreviewText = () => {
    if (!selectedTemplate) return "";

    // Check multiple possible keys where the backend might send the full text
    let text =
      selectedTemplate.body ||
      selectedTemplate.template_body ||
      selectedTemplate.template_text ||
      selectedTemplate.message_body ||
      selectedTemplate.message_text ||
      selectedTemplate.description ||
      "";

    selectedTemplate.parameters?.forEach((param, index) => {
      const val = parameterValues[param.key] || `[${param.label}]`;
      // Replace AiSensy format {{1}}
      text = text.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, "g"), val);
      // Replace custom format {{key}}
      text = text.replace(new RegExp(`\\{\\{${param.key}\\}\\}`, "g"), val);
    });

    return text;
  };

  const templateOptions = templates.map((t) => ({
    id: String(t.id),
    name: t.template_label,
  }));

  return (
    <Drawer
      title={
        <div className="whatsapp-modal-header">
          <FaWhatsapp size={20} className="whatsapp-modal-icon" />
          <span className="whatsapp-modal-title">Send WhatsApp Template</span>
        </div>
      }
      open={isOpen}
      onClose={onClose}
      footer={null}
      width={"42%"}
      className="customer_statusupdate_drawer"
      style={{ position: "relative", paddingBottom: 65 }}
    >
      <div style={{ padding: "24px" }}>
        <div className="whatsapp-modal-field-group">
          <CommonSelectField
            label="Select Template"
            placeholder="Choose a Template"
            options={templateOptions}
            showLabelStatus="Name"
            value={selectedTemplateId}
            required={true}
            onChange={handleTemplateChange}
            error={selectedTemplateIdError}
            height="34px"
            labelFontSize="11px"
            errorFontSize="9px"
            labelMarginTop={"0px"}
            loading={templateLoading}
          />
        </div>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <CommonInputField
              label="Candidate Name"
              placeholder="e.g. John Doe"
              required={true}
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (validationTrigger) {
                  setCustomerNameError(nameValidator(e.target.value));
                }
              }}
              error={customerNameError}
              height="34px"
              labelFontSize="11px"
              errorFontSize="9px"
              labelMarginTop={"0px"}
            />
          </Col>
          <Col span={12}>
            <CommonInputField
              label="Mobile Number"
              placeholder="e.g. 1234567890"
              required={true}
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                if (validationTrigger) {
                  setMobileError(mobileValidator(e.target.value));
                }
              }}
              error={mobileError}
              height="35px"
              labelFontSize="11px"
              errorFontSize="9px"
              labelMarginTop={"0px"}
            />
          </Col>
        </Row>

        {selectedTemplate && (
          <div className="dynamic-parameters-container">
            <div className="dynamic-parameters-title">
              <MdOutlineDescription
                size={18}
                className="dynamic-parameters-icon"
              />
              Dynamic Parameters
            </div>

            <Row gutter={[16, 24]}>
              {selectedTemplate.parameters?.map((param) => (
                <Col span={12} key={param.key}>
                  <CommonInputField
                    label={param.label}
                    placeholder={`Enter ${param.label.toLowerCase()}`}
                    required={param.required}
                    value={parameterValues[param.key] || ""}
                    onChange={(e) => {
                      setParameterValues((prev) => ({
                        ...prev,
                        [param.key]: e.target.value,
                      }));
                      if (validationTrigger && param.required) {
                        setParameterErrors((prev) => ({
                          ...prev,
                          [param.key]: selectValidator(e.target.value),
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
              ))}
            </Row>

            {selectedTemplate.media_required && (
              <div className="media-inputs-container">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <CommonInputField
                      label="Document/Media URL"
                      placeholder="https://example.com/file.pdf"
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
                  <Col span={12}>
                    <CommonInputField
                      label="Filename"
                      placeholder="e.g. Invoice.pdf"
                      required={true}
                      value={mediaFilename}
                      onChange={(e) => {
                        setMediaFilename(e.target.value);
                        if (validationTrigger) {
                          setMediaFilenameError(
                            selectValidator(e.target.value),
                          );
                        }
                      }}
                      error={mediaFilenameError}
                      height="35px"
                      labelFontSize="11.5px"
                      errorFontSize="9px"
                    />
                  </Col>
                </Row>
              </div>
            )}
          </div>
        )}

        {selectedTemplate && getPreviewText() && (
          <div className="whatsapp-preview-wrapper">
            <div className="whatsapp-preview-title">Message Preview</div>
            <div className="whatsapp-preview-bubble">{getPreviewText()}</div>
          </div>
        )}
      </div>

      <div className="leadmanager_tablefiler_footer">
        <div className="leadmanager_submitlead_buttoncontainer">
          <>
            {buttonLoading ? (
              <button className={"whatsapp-submit-loading-btn"}>
                <CommonSpinner />
              </button>
            ) : (
              <Button
                type="primary"
                onClick={handleSubmit}
                icon={<MdSend />}
                className="whatsapp-submit-btn"
              >
                Send Message
              </Button>
            )}
          </>
        </div>
      </div>
    </Drawer>
  );
}
