import React, { useEffect, useState } from "react";
import Logo from "../../assets/acte-logo.png";
import { Col, Row } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonSpinner from "../Common/CommonSpinner";
import {
  addressValidator,
  emailValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import {
  checkTicketEmail,
  createTicket,
  getTicketCategories,
  getTicketSubCategories,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";

export default function Helpdesk() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryIdError, setCategoryIdError] = useState("");
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subCategoryIdError, setSubCategoryIdError] = useState("");
  const typeOptions = [
    { id: "Change", name: "Change" },
    { id: "Issue", name: "Issue" },
    { id: "Request", name: "Request" },
    { id: "Complaint", name: "Complaint" },
    { id: "Others", name: "Others" },
  ];
  const [typeId, setTypeId] = useState("");
  const [typeIdError, setTypeIdError] = useState("");
  const [description, setDescription] = useState("");
  const [fileAttachmentBase64, setFileAttachmentBase64] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);

  useEffect(() => {
    getCategoriesData();
  }, []);

  const getCategoriesData = async () => {
    try {
      const response = await getTicketCategories();
      setCategoryOptions(response?.data?.data || []);
    } catch (error) {
      setCategoryOptions([]);
      console.log("categories error", error);
    } finally {
      setTimeout(() => {
        getSubCategoriesData();
      }, 300);
    }
  };

  const getSubCategoriesData = async () => {
    try {
      const response = await getTicketSubCategories();
      setSubCategoryOptions(response?.data?.data || []);
    } catch (error) {
      setSubCategoryOptions([]);
      console.log("sub categories error", error);
    }
  };

  const handleEmail = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (validationTrigger) {
      let emailValidate = emailValidator(value);
      setEmailError(emailValidate);

      if (emailValidate == "") {
        const payload = {
          email: value,
        };
        setTimeout(async () => {
          try {
            const response = await checkTicketEmail(payload);
            console.log("email response", response);
            setEmailError(
              response?.data?.data?.status == false ? " is not valid" : "",
            );
            // setSubCategoryOptions(response?.data?.data || []);
          } catch (error) {
            // setSubCategoryOptions([]);
            console.log("email error", error);
          }
        }, 300);
      }
    }
  };

  const handleSubmit = async () => {
    setValidationTrigger(true);
    let emailValidate = emailValidator(email);
    const titleValidate = addressValidator(title);
    const categoryIdValidate = selectValidator(categoryId);
    const subCategoryIdValidate = selectValidator(subCategoryId);
    const typeIdValidate = selectValidator(typeId);

    let emailResponse = null;
    const emailPayload = {
      email: email,
    };

    try {
      const response = await checkTicketEmail(emailPayload);
      console.log("email response", response);
      emailResponse = response?.data?.data;
      emailValidate =
        response?.data?.data?.status == false ? " is not valid" : "";
      // setSubCategoryOptions(response?.data?.data || []);
    } catch (error) {
      emailResponse = null;
      console.log("email error", error);
    }

    setEmailError(emailValidate);
    setTitleError(titleValidate);
    setCategoryIdError(categoryIdValidate);
    setSubCategoryIdError(subCategoryIdValidate);
    setTypeIdError(typeIdValidate);

    if (
      emailValidate ||
      titleValidate ||
      categoryIdValidate ||
      subCategoryIdValidate ||
      typeIdValidate
    )
      return;

    setButtonLoading(true);
    const today = new Date();

    const payload = {
      title: title,
      description: description,
      category_id: categoryId,
      sub_category_id: subCategoryId,
      priority: null,
      type: typeId,
      attachments: fileAttachmentBase64,
      raised_by_id: emailResponse?.user_id ?? null,
      raised_by_role: emailResponse?.role ?? null,
      created_at: formatToBackendIST(today),
    };
    try {
      await createTicket(payload);
      setTimeout(() => {
        formReset();
        CommonMessage("success", "Created");
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      console.log("ticket create error", error);
    }
  };

  const formReset = () => {
    setButtonLoading(false);
    setValidationTrigger(false);
    setTitle("");
    setTitleError("");
    setEmail("");
    setEmailError("");
    setCategoryId(null);
    setCategoryIdError("");
    setSubCategoryId(null);
    setSubCategoryIdError("");
    setTypeId("");
    setTypeIdError("");
    setDescription("");
    setFileAttachmentBase64("");
  };

  return (
    <div className="customerregistration_mainContainer">
      <div className="customerregistration_card">
        <div className="customerregistration_innerContainer">
          <Row style={{ display: "flex" }}>
            <Col xs={24} sm={24} md={8} lg={8}>
              <img src={Logo} className="trainer_registration_logo" />
              <p
                className="trainer_registration_logotext"
                style={{ color: "#1b538c" }}
              >
                Technologies
              </p>
              <p
                style={{
                  color: "#1b538c",
                  fontWeight: "bold",
                  marginTop: "1px",
                  letterSpacing: "0.3px",
                }}
              >
                Private Limited
              </p>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              style={{
                display: "flex",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              <p className="trainer_registration_heading">Acte Helpdesk</p>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              className="customerregistration_profileimage_container"
            ></Col>
          </Row>
        </div>

        <div
          className="customerregistration_formcontainer"
          style={{ height: "300px" }}
        >
          <div className="logincard_innerContainer">
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "20px" }}>
                <CommonInputField
                  label="Email"
                  required={true}
                  onChange={handleEmail}
                  value={email}
                  error={emailError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "20px" }}>
                <CommonInputField
                  label="Title"
                  required={true}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationTrigger) {
                      setTitleError(addressValidator(e.target.value));
                    }
                  }}
                  value={title}
                  error={titleError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "20px" }}>
                <CommonSelectField
                  label="Category"
                  required={true}
                  options={categoryOptions}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    if (validationTrigger) {
                      setCategoryIdError(selectValidator(e.target.value));
                    }
                  }}
                  value={categoryId}
                  error={categoryIdError}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "30px" }}>
                <CommonSelectField
                  label="Sub Category"
                  required={true}
                  options={subCategoryOptions}
                  onChange={(e) => {
                    setSubCategoryId(e.target.value);
                    if (validationTrigger) {
                      setSubCategoryIdError(selectValidator(e.target.value));
                    }
                  }}
                  value={subCategoryId}
                  error={subCategoryIdError}
                />
              </Col>

              <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "30px" }}>
                <CommonSelectField
                  label="Type"
                  required={true}
                  options={typeOptions}
                  onChange={(e) => {
                    setTypeId(e.target.value);
                    if (validationTrigger) {
                      setTypeIdError(selectValidator(e.target.value));
                    }
                  }}
                  value={typeId}
                  error={typeIdError}
                />
              </Col>

              <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "30px" }}>
                <CommonInputField
                  label="Description"
                  required={false}
                  multiline={true}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  value={description}
                />
              </Col>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={8}
                style={{
                  marginTop: subCategoryIdError ? "40px" : "30px",
                  color: "rgba(0,0,0,0.88)",
                }}
              >
                <ImageUploadCrop
                  label="File Attachment"
                  aspect={1}
                  maxSizeMB={1}
                  required={false}
                  value={fileAttachmentBase64}
                  onChange={(base64) => setFileAttachmentBase64(base64)}
                  onErrorChange={""} // ✅ pass setter directly
                />
              </Col>
            </Row>
          </div>
        </div>

        <div className="customer_registration_submitbuttonContainer">
          {buttonLoading ? (
            <button className="trainer_registration_loadingsubmitbutton">
              <CommonSpinner />
            </button>
          ) : (
            <button
              className="trainer_registration_submitbutton"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
