import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import FormControl from "@mui/material/FormControl";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Row, Col, Divider, Input, Modal, Button, Drawer } from "antd";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import CommonInputField from "../Common/CommonInputField";
import { addressValidator, selectValidator } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import {
  createEmailTemplate,
  deleteEmailTemplates,
  getEmailTemplates,
  sendEmailToCustomer,
  updateEmailTemplate,
} from "../ApiService/action";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import { useSelector } from "react-redux";

const CustomerEmailTemplate = forwardRef(
  (
    {
      drawerContentStatus,
      setDrawerContentStatus,
      setIsOpenEmailTemplateDrawer,
      customerDetails,
      setUpdateButtonLoading,
      isTrainerPaymentPage = false,
      paymentScreenShotBase64 = "",
      trainerEmail = "",
    },
    ref,
  ) => {
    const permissions = useSelector((state) => state.userpermissions);

    const [loginUserId, setLoginUserId] = useState("");
    const [subject, setSubject] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const [templateOptions, setTemplateOptions] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    //add template usestates
    const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [templateNameError, setTemplateNameError] = useState("");
    const [newEmailContent, setNewEmailContent] = useState("");
    //update and delete usestates
    const [updateTemplateId, setUpdateTemplateId] = useState("");
    const [updateTemplateName, setUpdateTemplateName] = useState("");
    const [updateTemplateNameError, setUpdateTemplateNameError] = useState("");
    const [updateEmailContent, setUpdateEmailContent] = useState("");
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [isOpenReactQuill, setisOpenReactQuill] = useState(false);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);

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

    useEffect(() => {
      getTemplateData();
    }, []);

    const getTemplateData = async () => {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      const userId =
        convertAsJson && convertAsJson.user_id ? convertAsJson.user_id : "";
      setLoginUserId(userId);

      try {
        const response = await getEmailTemplates(userId);
        console.log("get email template response", response);
        setTemplateOptions(response?.data?.data || []);
      } catch (error) {
        setTemplateOptions([]);
        console.log("get email template error", error);
      }
    };

    useImperativeHandle(ref, () => ({
      handleSendEmail,
    }));

    const handleTemplateCreate = async () => {
      const nameValidate = addressValidator(templateName);
      const contentValidate = addressValidator(newEmailContent);

      setTemplateNameError(nameValidate);

      if (contentValidate && nameValidate == "") {
        CommonMessage("error", "Content is required");
      }

      if (nameValidate || contentValidate) return;

      setButtonLoading(true);

      const payload = {
        user_id: loginUserId,
        name: templateName,
        content: newEmailContent,
      };

      try {
        await createEmailTemplate(payload);
        CommonMessage("success", "Template Created");
        setTimeout(() => {
          getTemplateData();
          formReset();
          setButtonLoading(false);
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        console.log("create email template error", error);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleUpdateTemplate = async () => {
      const nameValidate = addressValidator(updateTemplateName);
      const contentValidate = addressValidator(updateEmailContent);

      setUpdateTemplateNameError(nameValidate);

      if (contentValidate && nameValidate == "") {
        CommonMessage("error", "Content is required");
      }

      if (nameValidate || contentValidate) return;

      setButtonLoading(true);

      const payload = {
        template_id: updateTemplateId,
        user_id: loginUserId,
        name: updateTemplateName,
        content: updateEmailContent,
      };

      try {
        await updateEmailTemplate(payload);
        CommonMessage("success", "Template Updated");
        setTimeout(() => {
          setIsOpenEditModal(false);
          setUpdateTemplateId("");
          setUpdateTemplateName("");
          setUpdateTemplateNameError("");
          setUpdateEmailContent("");
          setisOpenReactQuill(false);
          setButtonLoading(false);
          getTemplateData();

          if (updateTemplateId == selectedTemplateId) {
            setSelectedTemplateId(null);
            formReset();
          }
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        console.log("update email template error", error);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleDeleteTemplate = async () => {
      setButtonLoading(true);
      const payload = {
        template_id: updateTemplateId,
      };
      try {
        await deleteEmailTemplates(payload);
        setTimeout(() => {
          setButtonLoading(false);
          setIsOpenDeleteModal(false);
          setUpdateTemplateId("");
          getTemplateData();
          if (updateTemplateId == selectedTemplateId) {
            setSelectedTemplateId(null);
            formReset();
          }
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        console.log("delete email template error", error);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleSendEmail = async () => {
      const subjectValidate = addressValidator(subject);
      const contentValidate = selectValidator(emailContent);
      console.log(emailContent);

      if (subjectValidate) {
        CommonMessage("error", "Subject is required");
        return;
      } else if (contentValidate) {
        CommonMessage("error", "Email Content is required");
        return;
      }
      if (isTrainerPaymentPage == false) {
        setUpdateButtonLoading(true);
      }

      const payload = {
        from_email: isTrainerPaymentPage ? "billing@acte.in" : "",
        email: isTrainerPaymentPage ? trainerEmail : customerDetails.email,
        subject: subject,
        content: emailContent,
        base64Image: paymentScreenShotBase64,
      };

      try {
        await sendEmailToCustomer(payload);
        CommonMessage("success", "Email has been sent successfully");
        setTimeout(() => {
          if (isTrainerPaymentPage == false) {
            setUpdateButtonLoading(false);
          }
          setDrawerContentStatus("");
          setIsOpenEmailTemplateDrawer(false);
        }, 300);
      } catch (error) {
        if (isTrainerPaymentPage == false) {
          setUpdateButtonLoading(false);
        }
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const formReset = () => {
      setIsOpenAddDrawer(false);
      setTemplateName("");
      setTemplateNameError("");
      setEmailContent("");
      setNewEmailContent("");
    };

    return (
      <div>
        <div>
          {isTrainerPaymentPage ? (
            ""
          ) : (
            <>
              <div className="customer_statusupdate_drawer_profileContainer">
                {customerDetails && customerDetails.profile_image ? (
                  <img
                    src={customerDetails.profile_image}
                    className="cutomer_profileimage"
                  />
                ) : (
                  <FaRegUser size={50} color="#333" />
                )}

                <div>
                  <p className="customer_nametext">
                    {" "}
                    {customerDetails && customerDetails.name
                      ? customerDetails.name
                      : "-"}
                  </p>
                  <p className="customer_coursenametext">
                    {" "}
                    {customerDetails && customerDetails.course_name
                      ? customerDetails.course_name
                      : "-"}
                  </p>
                </div>
              </div>

              <Row
                gutter={16}
                style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
              >
                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <FaRegCircleUser size={15} color="gray" />
                        <p className="customerdetails_rowheading">Name</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.name
                          ? customerDetails.name
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <MdOutlineEmail size={15} color="gray" />
                        <p className="customerdetails_rowheading">Email</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.email
                          ? customerDetails.email
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <IoCallOutline size={15} color="gray" />
                        <p className="customerdetails_rowheading">Mobile</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.phone
                          ? customerDetails.phone
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <FaWhatsapp size={15} color="gray" />
                        <p className="customerdetails_rowheading">Whatsapp</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.whatsapp
                          ? customerDetails.whatsapp
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        {customerDetails &&
                        customerDetails.gender === "Male" ? (
                          <BsGenderMale size={15} color="gray" />
                        ) : (
                          <BsGenderFemale size={15} color="gray" />
                        )}
                        <p className="customerdetails_rowheading">Gender</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.gender
                          ? customerDetails.gender
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <IoLocationOutline size={15} color="gray" />
                        <p className="customerdetails_rowheading">Location</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.current_location
                          ? customerDetails.current_location
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <FaRegUser size={15} color="gray" />
                        <p className="customerdetails_rowheading">
                          Lead Executive
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {`${
                          customerDetails && customerDetails.lead_assigned_to_id
                            ? customerDetails.lead_assigned_to_id
                            : "-"
                        } (${
                          customerDetails &&
                          customerDetails.lead_assigned_to_name
                            ? customerDetails.lead_assigned_to_name
                            : "-"
                        })`}
                      </p>
                    </Col>
                  </Row>
                </Col>

                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Course</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.course_name
                          ? customerDetails.course_name
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Course Fees
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p
                        className="customerdetails_text"
                        style={{ fontWeight: 700 }}
                      >
                        {customerDetails && customerDetails.primary_fees
                          ? "₹" + customerDetails.primary_fees
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Course Fees
                          <span className="customerdetails_coursegst">{` (+Gst)`}</span>
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p
                        className="customerdetails_text"
                        style={{ fontWeight: 700 }}
                      >
                        {customerDetails &&
                        customerDetails.payments.total_amount
                          ? "₹" + customerDetails.payments.total_amount
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Balance Amount
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p
                        className="customerdetails_text"
                        style={{ color: "#d32f2f", fontWeight: 700 }}
                      >
                        {customerDetails &&
                        customerDetails.balance_amount !== undefined &&
                        customerDetails.balance_amount !== null
                          ? "₹" + customerDetails.balance_amount
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Branch</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.branch_name
                          ? customerDetails.branch_name
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Batch Track
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.batch_tracking
                          ? customerDetails.batch_tracking
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Batch Type</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails && customerDetails.batch_timing
                          ? customerDetails.batch_timing
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Server</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails &&
                        customerDetails.is_server_required !== undefined
                          ? customerDetails.is_server_required === 1
                            ? "Required"
                            : "Not Required"
                          : "-"}
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Divider className="customer_statusupdate_divider" />
            </>
          )}

          <div
            className={
              isTrainerPaymentPage
                ? ""
                : "customer_statusupdate_adddetailsContainer"
            }
          >
            <p className="customer_statusupdate_adddetails_heading">
              Send Email
            </p>

            {/* <div style={{ marginTop: "16px" }}>              
              </div> */}

            <Row gutter={16} style={{ marginTop: "16px" }}>
              <Col span={20}>
                <FormControl
                  fullWidth
                  className="common_selectfield"
                  size="small"
                  sx={{
                    flex: 1,
                    width: "100%",
                    "& .MuiInputLabel-root": {
                      fontSize: "14px",
                      padding: "0px 0px",
                      marginTop: "1px",
                      fontFamily: "Poppins,  sans-serif",
                    },
                    "& .MuiOutlinedInput-root": {
                      height: "42px",
                    },
                    "& .MuiAutocomplete-input": {
                      fontSize: "14px",
                      marginTop: "0px",
                    },
                    "& .Mui-disabled": {
                      backgroundColor: "#f5f5f5", // change background
                      color: "#888", // change text color
                      WebkitTextFillColor: "#888", // needed for iOS/Chrome to change disabled text color
                    },
                  }}
                >
                  <Autocomplete
                    options={templateOptions}
                    value={
                      templateOptions.find(
                        (o) => o.id === selectedTemplateId,
                      ) ?? null
                    }
                    getOptionLabel={(option) => option?.name}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    onChange={(event, newValue) => {
                      setSelectedTemplateId(newValue?.id ?? null);
                      setEmailContent(newValue?.content ?? "");
                    }}
                    disableClearable={false}
                    noOptionsText={
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#888",
                          fontStyle: "Poppins, sans-serif",
                        }}
                      >
                        No data found
                      </span>
                    }
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <p>{option.name}</p>
                          <div style={{ display: "flex", gap: "16px" }}>
                            <AiOutlineEdit
                              size={16}
                              className="trainers_action_icons"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpenEditModal(true);
                                setUpdateTemplateId(option.id);
                                setUpdateTemplateName(option.name);
                                setUpdateEmailContent(option.content);
                                setTimeout(() => {
                                  setisOpenReactQuill(true);
                                }, 100);
                              }}
                            />

                            <RiDeleteBinLine
                              size={16}
                              color="#d32f2f"
                              className="trainers_action_icons"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpenDeleteModal(true);
                                setUpdateTemplateId(option.id);
                              }}
                            />
                          </div>
                        </div>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Select Template"
                        required={false}
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: "14px",
                          },
                        }}
                        className="common_inputfield"
                      />
                    )}
                    slotProps={{
                      listbox: {
                        sx: {
                          "& .MuiAutocomplete-option": {
                            fontSize: "13px",
                          },
                          "& .MuiAutocomplete-option[aria-selected='true']": {
                            backgroundColor: "#5b69ca26",
                          },
                          "& .MuiAutocomplete-option[aria-selected='true']:hover":
                            {
                              backgroundColor: "#5b69ca26",
                            },
                        },
                      },
                    }}
                  />
                </FormControl>
              </Col>
              <Col span={4}>
                <Button
                  className="emailtemplate_createbutton"
                  onClick={() => {
                    if (permissions.includes("Create Email Template")) {
                      setIsOpenAddDrawer(true);
                    } else {
                      CommonMessage("error", "Access Denied");
                    }
                  }}
                >
                  Add
                </Button>
              </Col>
            </Row>
            <div style={{ marginTop: "22px", marginBottom: "40px" }}>
              <div className="server_email_conatiner">
                <p className="server_email_heading">Content</p>
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
                    onChange={(content, delta, source, editor) => {
                      const plainText = editor.getText().trim();

                      if (!plainText) {
                        setEmailContent(""); // fully empty
                      } else {
                        setEmailContent(content);
                      }
                    }}
                    className="reactquillnotebook"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Drawer
          title={"Create Email Template"}
          open={isOpenAddDrawer}
          onClose={() => {
            setIsOpenAddDrawer(false);
          }}
          width={"40%"}
          style={{ position: "relative", paddingBottom: "60px" }}
          className="customer_statusupdate_drawer"
        >
          <div className="customer_statusupdate_adddetailsContainer">
            <div style={{ marginTop: "20px" }}>
              <CommonInputField
                label="Template Name"
                required={true}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  setTemplateNameError(addressValidator(e.target.value));
                }}
                value={templateName}
                error={templateNameError}
              />
            </div>

            <div
              className="server_email_conatiner"
              style={{ marginTop: "22px" }}
            >
              <p className="server_email_heading">Content</p>
              <div>
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  value={newEmailContent}
                  placeholder="write your content ...."
                  onChange={(content, delta, source, editor) => {
                    const plainText = editor.getText().trim();

                    if (!plainText) {
                      setNewEmailContent(""); // fully empty
                    } else {
                      setNewEmailContent(content);
                    }
                  }}
                  className="reactquillnotebook"
                />
              </div>
            </div>
          </div>

          <div className="leadmanager_tablefiler_footer">
            <div className="leadmanager_submitlead_buttoncontainer">
              {buttonLoading ? (
                <button className="users_adddrawer_loadingcreatebutton">
                  <CommonSpinner />
                </button>
              ) : (
                <button
                  className="users_adddrawer_createbutton"
                  onClick={handleTemplateCreate}
                >
                  Create
                </button>
              )}
            </div>
          </div>
        </Drawer>

        {/* update modal */}
        <Modal
          title="Update Template"
          open={isOpenEditModal}
          onCancel={() => {
            setIsOpenEditModal(false);
            setUpdateTemplateId("");
            setUpdateTemplateName("");
            setUpdateTemplateNameError("");
            setUpdateEmailContent("");
            setisOpenReactQuill(false);
          }}
          footer={false}
          width="45%"
        >
          <div style={{ marginTop: "16px" }}>
            <CommonInputField
              label="Template Name"
              required={true}
              onChange={(e) => {
                setUpdateTemplateName(e.target.value);
                setUpdateTemplateNameError(addressValidator(e.target.value));
              }}
              value={updateTemplateName}
              error={updateTemplateNameError}
            />
          </div>

          <div className="server_email_conatiner" style={{ marginTop: "22px" }}>
            <p className="server_email_heading">Content</p>
            <div>
              {isOpenReactQuill ? (
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  value={updateEmailContent}
                  placeholder="write your content ...."
                  onChange={(content, delta, source, editor) => {
                    const plainText = editor.getText().trim();

                    if (!plainText) {
                      setUpdateEmailContent(""); // fully empty
                    } else {
                      setUpdateEmailContent(content);
                    }
                  }}
                  className="reactquillnotebook"
                />
              ) : (
                ""
              )}
            </div>
          </div>

          <div className="settings_group_createbutton_container">
            {buttonLoading ? (
              <Button
                type="primary"
                className="settings_group_loading_createbutton"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                type="primary"
                className="settings_group_createbutton"
                onClick={handleUpdateTemplate}
              >
                Update
              </Button>
            )}
          </div>
        </Modal>

        {/* delete modal */}
        <CommonDeleteModal
          open={isOpenDeleteModal}
          onCancel={() => {
            setIsOpenDeleteModal(false);
            setUpdateTemplateId("");
          }}
          content="Are you sure want to delete the Email Template?"
          loading={buttonLoading}
          onClick={handleDeleteTemplate}
        />
      </div>
    );
  },
);

export default CustomerEmailTemplate;
