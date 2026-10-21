import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Row,
  Col,
  Input,
  Checkbox,
  Tooltip,
  notification,
  Divider,
} from "antd";
import { FaWhatsapp } from "react-icons/fa";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineDescription, MdOutlineMail } from "react-icons/md";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import {
  serverIssue,
  getWhatsAppTemplates,
  sendWhatsAppTemplate,
  deleteWhatsAppTemplate,
  inserCustomerTrack,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
  mobileValidator,
  urlValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import WhatsappTemplate from "../Marketing/WhatsappTemplate";
import "../Marketing/styles.css";
import "./styles.css";
import ServerTransCollapse from "./ServerTransCollapse";

const ServerIssue = forwardRef(
  (
    { serverDetails, customerDetails, setButtonLoading, callgetServerApi },
    ref,
  ) => {
    const [isEmailEnabled, setIsEmailEnabled] = useState(true);
    const [subject, setSubject] = useState("");
    const [emailContent, setEmailContent] = useState("");

    // WhatsApp integration states
    const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [selectedTemplateIdError, setSelectedTemplateIdError] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [mobile, setMobile] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [parameterValues, setParameterValues] = useState({});
    const [parameterErrors, setParameterErrors] = useState({});
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaUrlError, setMediaUrlError] = useState("");
    const [mediaFilename, setMediaFilename] = useState("");
    const [mediaFilenameError, setMediaFilenameError] = useState("");
    const [validationTrigger, setValidationTrigger] = useState(false);

    // Edit & delete template modal states
    const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] =
      useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const getCandidateMobile = () => {
      return serverDetails?.whatsapp || "";
    };

    const isNameParam = (key) =>
      ["name", "customer_name", "student_name", "candidate_name"].includes(
        String(key || "").toLowerCase(),
      );

    useEffect(() => {
      setIsEmailEnabled(true);
      setIsWhatsAppEnabled(true);
      setSelectedTemplateId("");
      setSelectedTemplateIdError("");
      setSelectedTemplate(null);
      setMobile(getCandidateMobile());
      setMobileError("");
      setParameterValues({});
      setParameterErrors({});
      setMediaUrl("");
      setMediaUrlError("");
      setMediaFilename("");
      setMediaFilenameError("");
      setValidationTrigger(false);
      fetchTemplates();
    }, [serverDetails, customerDetails]);

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
        console.error("Error fetching WhatsApp templates:", error);
        notification.error({
          message: "Failed to Fetch Templates",
          description:
            "Could not load WhatsApp templates. Please check your backend connection.",
        });
      } finally {
        setTemplateLoading(false);
      }
    };

    const handleWhatsAppToggle = (e) => {
      const checked = e.target.checked;
      setIsWhatsAppEnabled(checked);
      if (checked) {
        if (templates.length === 0) {
          fetchTemplates();
        }
        if (!mobile) {
          setMobile(getCandidateMobile());
        }
      } else {
        setSelectedTemplateId("");
        setSelectedTemplate(null);
        setSelectedTemplateIdError("");
        setMobileError("");
        setParameterValues({});
        setParameterErrors({});
        setMediaUrl("");
        setMediaUrlError("");
        setMediaFilename("");
        setMediaFilenameError("");
        setValidationTrigger(false);
      }
    };

    const handleTemplateChange = (e) => {
      const templateId = e.target?.value;
      setSelectedTemplateId(templateId);

      if (validationTrigger) {
        setSelectedTemplateIdError(selectValidator(templateId));
      } else {
        setSelectedTemplateIdError("");
      }

      const template = templates.find(
        (t) => String(t.id) === String(templateId),
      );
      setSelectedTemplate(template || null);

      if (template) {
        const prepopulate = {};
        const candidateName =
          serverDetails?.name ||
          customerDetails?.name ||
          customerDetails?.customer_name ||
          "";
        const candidateCourse =
          serverDetails?.course_name ||
          customerDetails?.course_name ||
          serverDetails?.server_name ||
          "";
        const targetPhone = mobile || getCandidateMobile();

        template.parameters?.forEach((param) => {
          const pKey = String(param.key || "").toLowerCase();
          if (isNameParam(pKey)) {
            prepopulate[param.key] = candidateName;
          } else if (
            ["course", "course_name", "technology", "technology_name"].includes(
              pKey,
            )
          ) {
            prepopulate[param.key] = candidateCourse;
          } else if (
            [
              "whatsapp",
              "whatsapp_number",
              "phone",
              "mobile",
              "contact_number",
            ].includes(pKey)
          ) {
            prepopulate[param.key] = targetPhone;
          } else if (["server_name", "server"].includes(pKey)) {
            prepopulate[param.key] = serverDetails?.server_name || "";
          } else if (["vendor", "vendor_id"].includes(pKey)) {
            prepopulate[param.key] = String(
              serverDetails?.trans_details?.[0]?.vendor_id || "",
            );
          } else if (serverDetails && serverDetails[param.key] !== undefined) {
            prepopulate[param.key] = String(serverDetails[param.key]);
          } else if (
            customerDetails &&
            customerDetails[param.key] !== undefined
          ) {
            prepopulate[param.key] = String(customerDetails[param.key]);
          } else {
            prepopulate[param.key] = "";
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

    const getPreviewText = () => {
      if (!selectedTemplate) return "";

      let text =
        selectedTemplate.body ||
        selectedTemplate.template_body ||
        selectedTemplate.template_text ||
        selectedTemplate.message_body ||
        selectedTemplate.message_text ||
        selectedTemplate.description ||
        "";

      const previewCustomerName =
        serverDetails?.name ||
        customerDetails?.name ||
        customerDetails?.customer_name ||
        "Customer";

      selectedTemplate.parameters?.forEach((param, index) => {
        let val = parameterValues[param.key];
        if (!val) {
          if (isNameParam(param.key)) {
            val = previewCustomerName;
          } else {
            val = `[${param.label || param.key}]`;
          }
        }
        text = text.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, "g"), val);
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

              <Tooltip
                title="Delete Template"
                placement="top"
                zIndex={999999999}
              >
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

    var modules = {
      toolbar: [
        [{ header: [1, 2, 4, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
          { align: [] },
        ],
        [
          {
            color: [
              "#000000",
              "#e60000",
              "#ff9900",
              "#ffff00",
              "#008a00",
              "#0066cc",
              "#9933ff",
              "#ffffff",
              "#facccc",
              "#ffebcc",
              "#ffffcc",
              "#cce8cc",
              "#cce0f5",
              "#ebd6ff",
              "#bbbbbb",
              "#f06666",
              "#ffc266",
              "#ffff66",
              "#66b966",
              "#66a3e0",
              "#c285ff",
              "#888888",
              "#a10000",
              "#b26b00",
              "#b2b200",
              "#006100",
              "#0047b2",
              "#6b24b2",
              "#444444",
              "#5c0000",
              "#663d00",
              "#666600",
              "#003700",
              "#002966",
              "#3d1466",
              "custom-color",
            ],
          },
        ],
      ],
    };
    var formats = [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "color",
      "bullet",
      "indent",
      "link",
      "image",
      "align",
      "size",
    ];

    useImperativeHandle(ref, () => ({
      handleServerIssue,
    }));

    const handleServerIssue = async () => {
      if (!isEmailEnabled && !isWhatsAppEnabled) {
        CommonMessage("error", "Choose alteast one template");
        return;
      }
      if (isEmailEnabled) {
        const subjectValidate = addressValidator(subject);
        const contentValidate = selectValidator(emailContent);

        if (subjectValidate) {
          CommonMessage("error", "Subject is required");
          return;
        } else if (contentValidate) {
          CommonMessage("error", "Email Content is required");
          return;
        }
      }

      if (isWhatsAppEnabled) {
        setValidationTrigger(true);

        if (!selectedTemplateId || !selectedTemplate) {
          setSelectedTemplateIdError(" is required");
          CommonMessage(
            "error",
            "Please select a WhatsApp message template before submitting",
          );
          return;
        }

        const targetMobile = (mobile || "").trim();
        const mobileValidate = mobileValidator(targetMobile);
        setMobileError(mobileValidate);
        if (mobileValidate) {
          CommonMessage("error", mobileValidate);
          return;
        }

        let hasParamError = false;
        const newParamErrors = {};
        selectedTemplate.parameters?.forEach((param) => {
          if (param.required) {
            const err = selectValidator(parameterValues[param.key]);
            if (err) {
              newParamErrors[param.key] = err;
              hasParamError = true;
            }
          }
        });
        setParameterErrors(newParamErrors);
        if (hasParamError) {
          CommonMessage(
            "error",
            "Please fill all required template parameters",
          );
          return;
        }

        if (selectedTemplate.media_required) {
          const urlErr = urlValidator(mediaUrl);
          const fileErr = selectValidator(mediaFilename);
          setMediaUrlError(urlErr);
          setMediaFilenameError(fileErr);
          if (urlErr || fileErr) {
            CommonMessage("error", "Document URL and Filename are required");
            return;
          }
        }
      }

      setButtonLoading(true);

      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        email_subject: isEmailEnabled ? subject : "",
        email_content: isEmailEnabled ? emailContent : "",
        send_email: isEmailEnabled ? 1 : 0,
      };

      try {
        await serverIssue(payload);

        if (isWhatsAppEnabled && selectedTemplate) {
          const getLoginUserDetails = localStorage.getItem("loginUserDetails");
          const convertAsJson = getLoginUserDetails
            ? JSON.parse(getLoginUserDetails)
            : null;

          const whatsappPayload = {
            region_id:
              serverDetails?.region_id || customerDetails?.region_id || null,
            branch_id:
              serverDetails?.branch_id || customerDetails?.branch_id || null,
            course_id:
              serverDetails?.course_id || customerDetails?.course_id || null,
            template_id: selectedTemplate.id,
            mobile: (mobile || "").trim(),
            customer_name:
              serverDetails?.name ||
              customerDetails?.name ||
              customerDetails?.customer_name ||
              "Customer",
            lead_id:
              serverDetails?.lead_id ||
              serverDetails?.customer_id ||
              customerDetails?.id ||
              null,
            values: parameterValues,
            sent_by: convertAsJson?.user_id,
            created_at: formatToBackendIST(new Date()),
          };

          if (selectedTemplate.media_required) {
            whatsappPayload.media_url = mediaUrl;
            whatsappPayload.media_filename = mediaFilename || "attachment.pdf";
          }

          try {
            await sendWhatsAppTemplate(whatsappPayload);
            CommonMessage(
              "success",
              "Server Issued and WhatsApp message sent successfully!",
            );
          } catch (waError) {
            console.error("Error sending WhatsApp template message:", waError);
            const waErrorMessage =
              waError?.response?.data?.error?.errorMessage ||
              waError?.response?.data?.error?.message ||
              waError?.response?.data?.message ||
              waError?.message ||
              "Failed to send WhatsApp message";
            CommonMessage(
              "warning",
              `Server Issued, but WhatsApp message failed: ${waErrorMessage}`,
            );
          }
        } else {
          CommonMessage("success", "Server Issued");
        }

        setTimeout(() => {
          callgetServerApi();
          handleCustomerTrack("Server Issued");
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const payload = {
        customers: [
          {
            customer_id: serverDetails.customer_id,
            status: updatestatus,
            updated_by:
              converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
            status_date: formatToBackendIST(today),
          },
        ],
      };
      try {
        await inserCustomerTrack(payload);
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    return (
      <div>
        <>
          <div style={{ padding: "0px 24px" }}>
            <ServerTransCollapse serverDetails={serverDetails} />
          </div>

          <Divider className="customer_statusupdate_divider" />
          {/* Email Notification Section */}
          <div
            className="server_email_section"
            style={{
              padding: "0px 24px",
              marginTop: "20px",
              marginBottom: isEmailEnabled ? "24px" : "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: isEmailEnabled ? "12px" : "0px",
              }}
            >
              <Checkbox
                checked={isEmailEnabled}
                onChange={(e) => setIsEmailEnabled(e.target.checked)}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    marginTop: "2px",
                  }}
                >
                  <MdOutlineMail size={17} color="#1890ff" />
                  Email
                </span>
              </Checkbox>
            </div>

            {isEmailEnabled && (
              <div
                className="server_email_conatiner"
                style={{ marginTop: "8px" }}
              >
                <p className="server_email_heading">Email Template</p>
                <Input
                  className="server_email_subjectinput"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <div>
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    value={emailContent}
                    placeholder="write your content ...."
                    onChange={(content) => {
                      setEmailContent(content);
                    }}
                    className="reactquillnotebook"
                  />
                </div>
              </div>
            )}
          </div>

          <Divider className="customer_statusupdate_divider" />

          {/* WhatsApp Notification Section */}
          <div
            className="server_whatsapp_section"
            style={{
              padding: "0px 24px",
              marginTop: "24px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "-6px",
                marginBottom: "12px",
              }}
            >
              <Checkbox
                checked={isWhatsAppEnabled}
                onChange={handleWhatsAppToggle}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    marginTop: "2px",
                  }}
                >
                  <FaWhatsapp size={17} color="#25D366" />
                  WhatsApp
                </span>
              </Checkbox>
            </div>

            {isWhatsAppEnabled && (
              <div
                style={{
                  padding: "16px 16px 24px 16px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  marginTop: "8px",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={24} md={12}>
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
                      height={"35px"}
                      labelFontSize={"11px"}
                      labelMarginTop={"0px"}
                      errorFontSize={"9px"}
                    />
                  </Col>
                  <Col xs={24} sm={24} md={12}>
                    <CommonInputField
                      label="Recipient WhatsApp Number"
                      placeholder="e.g. 9876543210"
                      required={true}
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        if (validationTrigger) {
                          setMobileError(mobileValidator(e.target.value));
                        } else {
                          setMobileError("");
                        }
                      }}
                      error={mobileError}
                      height="35px"
                      labelFontSize="11.5px"
                      errorFontSize="9px"
                      labelMarginTop={"0px"}
                      disableAutoCapitalize={true}
                    />
                  </Col>
                </Row>

                {selectedTemplate && (
                  <div
                    className="dynamic-parameters-container"
                    style={{ marginTop: "16px" }}
                  >
                    {selectedTemplate.parameters &&
                      selectedTemplate.parameters.length > 0 && (
                        <>
                          <div className="dynamic-parameters-title">
                            <MdOutlineDescription
                              size={18}
                              className="dynamic-parameters-icon"
                            />
                            Dynamic Parameters
                          </div>

                          <Row gutter={[16, 16]}>
                            {selectedTemplate.parameters?.map((param) => (
                              <Col xs={24} sm={12} key={param.key}>
                                <CommonInputField
                                  label={param.label || param.key}
                                  placeholder={`Enter ${param.label || param.key}`}
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
                                        [param.key]: selectValidator(
                                          e.target.value,
                                        ),
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
                        </>
                      )}

                    {selectedTemplate.media_required && (
                      <div
                        className="media-inputs-container"
                        style={{ marginTop: "16px" }}
                      >
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12}>
                            <CommonInputField
                              label="Document/Media URL"
                              placeholder="https://example.com/file.pdf"
                              required={true}
                              value={mediaUrl}
                              onChange={(e) => {
                                setMediaUrl(e.target.value);
                                if (validationTrigger) {
                                  setMediaUrlError(
                                    urlValidator(e.target.value),
                                  );
                                }
                              }}
                              error={mediaUrlError}
                              height="35px"
                              labelFontSize="11.5px"
                              errorFontSize="9px"
                              disableAutoCapitalize={true}
                            />
                          </Col>
                          <Col xs={24} sm={12}>
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
                  <div
                    className="whatsapp-preview-wrapper"
                    style={{ marginTop: "16px" }}
                  >
                    <div className="whatsapp-preview-title">
                      Message Preview
                    </div>
                    <div className="whatsapp-preview-bubble">
                      {getPreviewText()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit Template Modal */}
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

          {/* Delete Template Confirmation Modal */}
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
        </>
      </div>
    );
  },
);

export default ServerIssue;
