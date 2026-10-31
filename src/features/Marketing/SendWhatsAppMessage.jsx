import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  notification,
  Row,
  Col,
  Spin,
  Drawer,
  Tag,
  Tooltip,
} from "antd";
import { MdSend, MdOutlineDescription } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  getWhatsAppTemplates,
  sendWhatsAppTemplate,
  sendBulkWhatsAppTemplate,
  deleteWhatsAppTemplate,
  getBranches,
} from "../ApiService/action";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import WhatsappTemplate from "./WhatsappTemplate";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import "./styles.css";
import {
  nameValidator,
  selectValidator,
  mobileValidator,
  urlValidator,
  formatToBackendIST,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { useSelector } from "react-redux";

export default function SendWhatsAppMessage({
  isOpen,
  onClose,
  customer,
  courseOptions,
  leadId,
  leads = [],
  isBulk = false,
  onSuccess,
}) {
  //regions
  const regionOptions = useSelector((state) => state.globalregionslist);

  const [templateLoading, setTemplateLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Form states
  const [regionId, setRegionId] = useState(null);
  const [regionIdError, setRegionIdError] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [branchIdError, setBranchIdError] = useState("");
  const [courseId, setCourseId] = useState(null);
  const [courseIdError, setCourseIdError] = useState("");

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

  const isNameParam = (key) =>
    ["name", "customer_name", "student_name", "candidate_name"].includes(
      String(key || "").toLowerCase(),
    );

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      if (!isBulk) {
        setCustomerName(customer?.name || customer?.customer_name || "");
        setMobile(
          customer?.whatsapp || customer?.phone || customer?.mobile || "",
        );
      } else {
        setCustomerName("");
        setMobile("");
      }
    } else {
      resetForm();
    }
  }, [isOpen, customer, isBulk]);

  const resetForm = () => {
    setRegionId(null);
    setRegionIdError("");
    setBranchOptions([]);
    setBranchId(null);
    setBranchIdError("");
    setCourseId(null);
    setCourseIdError("");
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
        const list = response.data.data || [];
        setTemplates(list);
        if (selectedTemplateId) {
          const updatedTemplate = list.find(
            (t) => String(t.id) === String(selectedTemplateId),
          );
          if (updatedTemplate) {
            setSelectedTemplate(updatedTemplate);
          }
        }
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

  const getBranchesData = async (regionid) => {
    const payload = {
      region_id: regionid,
    };
    try {
      const response = await getBranches(payload);
      const branch_data = response?.data?.result || [];

      if (branch_data.length >= 1) {
        if (regionid == 1 || regionid == 2) {
          const reordered = [
            ...branch_data.filter((item) => item.name !== "Online"),
            ...branch_data.filter((item) => item.name === "Online"),
          ];
          setBranchOptions(reordered);
        } else {
          setBranchOptions(branch_data);
          setBranchId(branch_data[0]?.id);
        }
      } else {
        setBranchOptions([]);
      }
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
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

    if (template && customer && !isBulk) {
      const prepopulate = {};
      template.parameters?.forEach((param) => {
        if (
          [
            "whatsapp",
            "whatsapp_number",
            "phone",
            "mobile",
            "contact_number",
          ].includes(String(param.key || "").toLowerCase())
        ) {
          prepopulate[param.key] =
            customer.whatsapp || customer.phone || customer.mobile || "";
        } else if (customer[param.key]) {
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

    const regionIdValidate = selectValidator(regionId);
    const branchIdValidate = selectValidator(branchId);
    const courseIdValidate = selectValidator(courseId);
    const templateValidate = selectValidator(selectedTemplateId);

    setRegionIdError(regionIdValidate);
    setBranchIdError(branchIdValidate);
    setCourseIdError(courseIdValidate);
    setSelectedTemplateIdError(templateValidate);

    if (
      regionIdValidate ||
      branchIdValidate ||
      courseIdValidate ||
      templateValidate
    ) {
      isValid = false;
    }

    if (!isBulk) {
      const customerNameValidate = nameValidator(customerName);
      const mobileValidate = mobileValidator(mobile);

      setCustomerNameError(customerNameValidate);
      setMobileError(mobileValidate);

      if (customerNameValidate || mobileValidate) {
        isValid = false;
      }
    } else {
      if (!leads || leads.length === 0) {
        CommonMessage("error", "No leads selected for bulk WhatsApp sending.");
        return false;
      }
    }

    if (selectedTemplate) {
      const newParamErrors = {};
      selectedTemplate.parameters?.forEach((param) => {
        if (param.required) {
          // If in bulk mode and it's a candidate name param, each lead's name will automatically populate
          if (isBulk && isNameParam(param.key)) {
            // Validated automatically
          } else {
            const err = selectValidator(parameterValues[param.key]);
            if (err) {
              newParamErrors[param.key] = err;
              isValid = false;
            }
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

    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    setButtonLoading(true);
    try {
      if (isBulk) {
        const formattedLeads = leads
          .filter((lead) => lead.whatsapp || lead.phone || lead.mobile)
          .map((lead) => {
            const destMobile = String(
              lead.whatsapp || lead.phone || lead.mobile || "",
            ).trim();
            const custName = lead.name || lead.customer_name || "Customer";
            const leadValues = {};

            selectedTemplate.parameters?.forEach((param) => {
              if (
                parameterValues[param.key] !== undefined &&
                parameterValues[param.key] !== ""
              ) {
                leadValues[param.key] = parameterValues[param.key];
              } else if (isNameParam(param.key)) {
                leadValues[param.key] = custName;
              } else if (
                [
                  "course",
                  "course_name",
                  "technology",
                  "technology_name",
                ].includes(String(param.key).toLowerCase())
              ) {
                leadValues[param.key] =
                  lead.course_name || lead.course || lead.technology_name || "";
              } else if (
                [
                  "whatsapp",
                  "whatsapp_number",
                  "phone",
                  "mobile",
                  "contact_number",
                ].includes(String(param.key).toLowerCase())
              ) {
                leadValues[param.key] =
                  lead.whatsapp || lead.phone || lead.mobile || "";
              } else if (lead[param.key] !== undefined) {
                leadValues[param.key] = String(lead[param.key]);
              } else {
                leadValues[param.key] = "";
              }
            });

            const leadObj = {
              mobile: destMobile,
              customer_name: custName,
              lead_id: lead.id || lead.lead_id || null,
              values: leadValues,
              sent_by: convertAsJson?.user_id,
              created_at: formatToBackendIST(new Date()),
            };

            if (selectedTemplate.media_required && mediaUrl) {
              leadObj.media_url = mediaUrl;
              leadObj.media_filename = mediaFilename || "attachment.pdf";
            }

            return leadObj;
          });

        if (formattedLeads.length === 0) {
          CommonMessage(
            "error",
            "None of the selected leads have a valid WhatsApp or mobile number.",
          );
          setButtonLoading(false);
          return;
        }

        const bulkPayload = {
          region_id: regionId,
          branch_id: branchId,
          course_id: courseId,
          template_id: selectedTemplate.id,
          leads: formattedLeads,
        };

        const res = await sendBulkWhatsAppTemplate(bulkPayload);
        CommonMessage(
          "success",
          res?.data?.message ||
            `Initiated bulk sending for ${formattedLeads.length} contacts.`,
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const payload = {
          region_id: regionId,
          branch_id: branchId,
          course_id: courseId,
          template_id: selectedTemplate.id,
          mobile: mobile,
          customer_name: customerName,
          lead_id: leadId,
          values: parameterValues,
          sent_by: convertAsJson?.user_id,
          created_at: formatToBackendIST(new Date()),
        };

        if (selectedTemplate.media_required) {
          payload.media_url = mediaUrl;
          payload.media_filename = mediaFilename;
        }

        await sendWhatsAppTemplate(payload);

        CommonMessage(
          "success",
          "WhatsApp message has been sent successfully!",
        );
        if (onSuccess) onSuccess();
        onClose();
      }
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
        CommonMessage(
          "error",
          errorMessage || "Failed to Send. Please try again later.",
        );
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

    const previewCustomerName = isBulk
      ? leads?.[0]?.name || leads?.[0]?.customer_name || "Customer"
      : customerName || "Customer";

    selectedTemplate.parameters?.forEach((param, index) => {
      let val = parameterValues[param.key];
      if (!val) {
        if (isBulk && isNameParam(param.key)) {
          val = previewCustomerName;
        } else {
          val = `[${param.label}]`;
        }
      }
      // Replace AiSensy format {{1}}
      text = text.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, "g"), val);
      // Replace custom format {{key}}
      text = text.replace(new RegExp(`\\{\\{${param.key}\\}\\}`, "g"), val);
    });

    return text;
  };

  const handleEditTemplate = (option, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const fullTemplate =
      templates.find((t) => String(t.id) === String(option.id)) || option;
    setEditingTemplate(fullTemplate);
    setIsEditTemplateModalOpen(true);
  };

  const handleOpenDeleteModal = (option, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const fullTemplate =
      templates.find((t) => String(t.id) === String(option.id)) || option;
    setTemplateToDelete(fullTemplate);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete || !templateToDelete.id) return;

    setDeleteLoading(true);
    try {
      const payload = {
        updated_at: formatToBackendIST(new Date()),
      };
      await deleteWhatsAppTemplate(templateToDelete.id, payload);
      CommonMessage("success", "Template deleted successfully");

      // If deleted template was currently selected, reset selected template fields
      if (String(selectedTemplateId) === String(templateToDelete.id)) {
        setSelectedTemplateId("");
        setSelectedTemplate(null);
        setParameterValues({});
        setParameterErrors({});
        setMediaUrl("");
        setMediaFilename("");
      }

      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
      await fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error?.errorMessage ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to delete template";
      CommonMessage("error", errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderTemplateOption = (props, option) => {
    return (
      <li {...props} key={props.key || option.id}>
        <div className="whatsapp_template_option_row">
          <span className="whatsapp_template_option_label">
            {option.template_label || option.name}
          </span>
          <div className="whatsapp_template_option_actions">
            <Tooltip title="Edit Template" placement="top" zIndex={999999999}>
              <span
                className="whatsapp_template_option_action_wrapper edit"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEditTemplate(option, e);
                }}
              >
                <AiOutlineEdit className="whatsapp_template_option_edit_icon" />
              </span>
            </Tooltip>

            <Tooltip title="Delete Template" placement="top" zIndex={999999999}>
              <span
                className="whatsapp_template_option_action_wrapper delete"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenDeleteModal(option, e);
                }}
              >
                <RiDeleteBinLine className="whatsapp_template_option_delete_icon" />
              </span>
            </Tooltip>
          </div>
        </div>
      </li>
    );
  };

  const templateOptions = templates.map((t) => ({
    ...t,
    id: String(t.id),
    name: t.template_label,
  }));

  return (
    <Drawer
      title={
        <div
          className="whatsapp-modal-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingRight: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <FaWhatsapp size={20} className="whatsapp-modal-icon" />
            <span className="whatsapp-modal-title">
              {isBulk
                ? "Send Bulk WhatsApp Template"
                : "Send WhatsApp Template"}
            </span>
          </div>
          {isBulk && (
            <div className="bulk-contacts-selected-tag">
              {leads.length} Contacts Selected
            </div>
          )}
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
        <Row gutter={[12, 24]} style={{ marginBottom: "26px" }}>
          <Col xs={24} sm={24} md={24} lg={12}>
            <CommonSelectField
              label="Region"
              required={true}
              options={regionOptions}
              onChange={(e) => {
                setRegionId(e.target.value);
                setBranchId("");
                getBranchesData(parseInt(e.target.value), false);
                if (validationTrigger) {
                  setRegionIdError(selectValidator(e.target.value));
                }
              }}
              value={regionId}
              error={regionIdError}
              height={"33px"}
              labelFontSize={"11px"}
              labelMarginTop={"0px"}
              errorFontSize={"9px"}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={12}>
            <CommonSelectField
              label="Branch"
              required={true}
              options={branchOptions}
              onChange={(e) => {
                setBranchId(e.target.value);
                if (validationTrigger) {
                  setBranchIdError(selectValidator(e.target.value));
                }
              }}
              value={branchId}
              error={branchIdError}
              disabled={regionId == 3}
              height={"33px"}
              labelFontSize={"11px"}
              labelMarginTop={"0px"}
              errorFontSize={"9px"}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={12}>
            <CommonSelectField
              label="Course"
              required={true}
              options={courseOptions}
              onChange={(e) => {
                setCourseId(e.target.value);
                if (validationTrigger) {
                  setCourseIdError(selectValidator(e.target.value));
                }
              }}
              value={courseId}
              error={courseIdError}
              height={"33px"}
              labelFontSize={"11px"}
              labelMarginTop={"0px"}
              errorFontSize={"9px"}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={12}>
            <CommonSelectField
              label="Select Template"
              placeholder="Choose a Template"
              options={templateOptions}
              showLabelStatus="Name"
              value={selectedTemplateId}
              required={true}
              onChange={handleTemplateChange}
              error={selectedTemplateIdError}
              loading={templateLoading}
              renderOption={renderTemplateOption}
              height={"33px"}
              labelFontSize={"11px"}
              labelMarginTop={"0px"}
              errorFontSize={"9px"}
            />
          </Col>
        </Row>

        {isBulk ? (
          <div className="bulk-whatsapp-recipients-card">
            <div className="bulk-whatsapp-recipients-header">
              <span className="bulk-whatsapp-recipients-title">
                Recipients {`( ${leads.length} Selected Leads  )`}
              </span>
              <span className="bulk-whatsapp-recipients-hint">
                Candidate names and details will be populated individually for
                each contact
              </span>
            </div>
            <div className="bulk-whatsapp-recipients-list">
              {leads.slice(0, 10).map((l, idx) => (
                <span key={l.id || idx} className="bulk-recipient-pill">
                  {l.name || "Customer"}{" "}
                  {`( ${l.whatsapp || l.phone || l.mobile || "No Number"} )`}
                </span>
              ))}
              {leads.length > 10 && (
                <span className="bulk-recipient-pill more">
                  +{leads.length - 10} more
                </span>
              )}
            </div>
          </div>
        ) : (
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
                height="33px"
                labelFontSize="11px"
                errorFontSize="9px"
                labelMarginTop={"0px"}
              />
            </Col>
            <Col span={12}>
              <CommonInputField
                label="WhatsApp Number"
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
                height="33px"
                labelFontSize="11px"
                errorFontSize="9px"
                labelMarginTop={"0px"}
              />
            </Col>
          </Row>
        )}

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
                    placeholder={
                      isBulk && isNameParam(param.key)
                        ? "Auto from candidate name (or override)"
                        : `Enter ${param.label.toLowerCase()}`
                    }
                    required={
                      isBulk && isNameParam(param.key) ? false : param.required
                    }
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

      <WhatsappTemplate
        isOpen={isEditTemplateModalOpen}
        onClose={() => {
          setIsEditTemplateModalOpen(false);
          setEditingTemplate(null);
        }}
        editData={editingTemplate}
        onSuccess={async () => {
          await fetchTemplates();
        }}
      />

      <CommonDeleteModal
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTemplateToDelete(null);
        }}
        content={`Are you sure you want to delete "${templateToDelete?.template_label || templateToDelete?.name || "this template"}" template?`}
        loading={deleteLoading}
        onClick={handleConfirmDelete}
      />
    </Drawer>
  );
}
