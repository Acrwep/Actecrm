import React, { useRef, useState } from "react";
import { Col, Divider, Row, Upload, Button, Modal, Tabs } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { SiWhatsapp } from "react-icons/si";
import Logo from "../../assets/acte-logo.png";
import "./styles.css";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonMuiTimePicker from "../Common/CommonMuiTimePicker";
import CommonMultiSelect from "../Common/CommonMultiSelect";
import SignatureCanvas from "react-signature-canvas";
import { UploadOutlined } from "@ant-design/icons";
import { CommonMessage } from "../Common/CommonMessage";
import { IoIosAdd } from "react-icons/io";
import { PlusOutlined } from "@ant-design/icons";

export default function TrainerRegistration() {
  const sigCanvasRef = useRef(null);
  const [signatureArray, setSignatureArray] = useState([]);
  const [signatureError, setSignatureError] = useState([]);
  const [isOpenSignatureModal, setIsOpenSignatureModal] = useState(false);
  const [profilePictureArray, setProfilePictureArray] = useState([]);

  const handleSignature = ({ file }) => {
    // allowed MIME types
    const isValidType =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg";

    if (file.status === "uploading" || file.status === "removed") {
      setSignatureArray([]);
      return;
    }
    if (isValidType) {
      console.log("fileeeee", file);
      setSignatureArray([file]);
      CommonMessage("success", "Signature uploaded");
      //   const reader = new FileReader();
      //   reader.readAsDataURL(file);
      //   reader.onload = () => {
      //     const base64String = reader.result.split(",")[1]; // Extract Base64 content
      //     setProfilePicture(base64String); // Store in state
      //   };
    } else {
      CommonMessage("error", "Accept only .png, .jpg and .jpeg");
      setSignatureArray([]);
    }
  };

  const renderPersonalDetails = () => {
    return (
      <>
        <div className="logincard_innerContainer">
          <p className="trainer_registration_headings">Primary Details</p>
          <Row gutter={12}>
            <Col xs={24} sm={24} md={24} lg={6}>
              <CommonInputField label="Name" required={true} />
            </Col>
            <Col xs={24} sm={24} md={24} lg={6}>
              <CommonInputField label="Email" required={true} />
            </Col>
            <Col xs={24} sm={24} md={24} lg={6}>
              <CommonInputField label="Mobile" required={true} />
            </Col>
            <Col xs={24} sm={24} md={24} lg={6}>
              <CommonOutlinedInput
                label="Whatsapp Number"
                icon={<SiWhatsapp color="#39AE41" />}
                required={true}
                maxLength={10}
              />{" "}
            </Col>
          </Row>
        </div>

        <Divider className="trainer_registration_dividers" />

        <div className="logincard_innerContainer">
          <p className="trainer_registration_headings">Secondary Details</p>
          <Row gutter={12}>
            <Col span={6}>
              <CommonSelectField
                label="Technology"
                required={true}
                options={[]}
                //   onChange={(e) => {
                //     setTechnology(e.target.value);
                //     if (validationTrigger) {
                //       setTechnologyError(selectValidator(e.target.value));
                //     }
                //   }}
                //   value={technology}
                //   error={technologyError}
                valueMarginTop="-4px"
              />
            </Col>

            <Col span={6}>
              <CommonSelectField
                label="Experience"
                required={true}
                options={[]}
                //   onChange={(e) => {
                //     setTechnology(e.target.value);
                //     if (validationTrigger) {
                //       setTechnologyError(selectValidator(e.target.value));
                //     }
                //   }}
                //   value={technology}
                //   error={technologyError}
                valueMarginTop="-4px"
              />
            </Col>

            <Col span={6}>
              <CommonSelectField
                label="Relevant Experience"
                required={true}
                options={[]}
                //   onChange={(e) => {
                //     setTechnology(e.target.value);
                //     if (validationTrigger) {
                //       setTechnologyError(selectValidator(e.target.value));
                //     }
                //   }}
                //   value={technology}
                //   error={technologyError}
                valueMarginTop="-4px"
              />
            </Col>

            <Col span={6}>
              <CommonSelectField
                label="Batch"
                required={true}
                options={[]}
                //   onChange={(e) => {
                //     setTechnology(e.target.value);
                //     if (validationTrigger) {
                //       setTechnologyError(selectValidator(e.target.value));
                //     }
                //   }}
                //   value={technology}
                //   error={technologyError}
                valueMarginTop="-4px"
              />
            </Col>
          </Row>

          <Row gutter={12} style={{ marginTop: "25px", marginBottom: "25px" }}>
            <Col span={6}>
              <CommonMuiTimePicker label="Avaibility Time" required={true} />
            </Col>
            <Col span={6}>
              <CommonMuiTimePicker label="Secondary Time" required={true} />
            </Col>
            <Col span={6}>
              <CommonMultiSelect label="Skills" required={true} />
            </Col>
            <Col span={6}>
              <CommonInputField label="Location" />
            </Col>
          </Row>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <button className="trainer_registration_submitbutton">Next</button>
          </div>
        </div>
      </>
    );
  };

  const renderBankDetails = () => {
    return (
      <div className="logincard_innerContainer">
        <p className="trainer_registration_headings">Bank Details</p>
        <Row gutter={12}>
          <Col span={6}>
            <CommonInputField label="Account Holder Name" required={true} />
          </Col>
          <Col span={6}>
            <CommonInputField label="Account Number" required={true} />
          </Col>
          <Col span={6}>
            <CommonInputField label="Bank Name" required={true} />
          </Col>
          <Col span={6}>
            <CommonInputField label="Branch Name" required={true} />
          </Col>
        </Row>

        <Row gutter={12} style={{ marginTop: "34px", marginBottom: "140px" }}>
          <Col span={6}>
            <CommonInputField label="IFSC Code" required={true} />
          </Col>
          <Col span={6} style={{ position: "relative", display: "flex" }}>
            <p className="trainer_registration_signaturelabel">
              Signature <span style={{ color: "#d32f2f" }}>*</span>
            </p>
            <Upload
              style={{ width: "100%", marginTop: "6px" }}
              beforeUpload={(file) => {
                return false; // Prevent auto-upload
              }}
              accept=".png,.jpg,.jpeg"
              onChange={handleSignature}
              fileList={signatureArray}
              multiple={false}
            >
              <Button
                icon={<UploadOutlined />}
                className="leadmanager_payment_screenshotbutton"
                style={{ borderRadius: "4px" }}
              >
                Choose file
                <span style={{ fontSize: "10px" }}>(PNG, JPEG, & PNG)</span>
              </Button>
            </Upload>{" "}
            <button
              className="trainer_registration_signature_createbutton"
              onClick={() => setIsOpenSignatureModal(true)}
            >
              <IoIosAdd size={18} /> Create
            </button>
          </Col>
        </Row>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button className="trainer_registration_submitbutton">Submit</button>
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: "1",
      label: "Personal Details",
      children: renderPersonalDetails(),
    },
    {
      key: "2",
      label: "Bank Details",
      children: renderBankDetails(),
    },
  ];

  const clearSignature = () => {
    sigCanvasRef.current.clear();
  };

  const saveSignature = () => {
    if (sigCanvasRef.current.isEmpty()) {
      CommonMessage("error", "Please provide a signature first.");
      return;
    }
    const dataURL = sigCanvasRef.current.toDataURL("image/png");

    // Create a temporary link to download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "signature.png";
    link.click();
    CommonMessage("success", "Downloaded");
  };

  const handleProfileAttachment = ({ fileList: newFileList }) => {
    console.log("newww", newFileList);
    if (newFileList.length <= 0) {
      setProfilePictureArray([]);
      return;
    }
    const isValidType =
      newFileList[0].type === "image/png" ||
      newFileList[0].type === "image/jpeg" ||
      newFileList[0].type === "image/jpg";

    if (isValidType) {
      console.log("fileeeee", newFileList);
      setProfilePictureArray(newFileList);
      CommonToaster("Profile uploaded");
    } else {
      CommonToaster("Accept only .png, .jpg and .jpeg");
      setProfilePictureArray([]);
    }
  };

  const handlePreview = async (file) => {
    // if (file.url) {
    //   setPreviewImage(file.url);
    //   setPreviewOpen(true);
    //   return;
    // }
    // const rawFile = file.originFileObj || file;
    // const reader = new FileReader();
    // reader.readAsDataURL(rawFile);
    // reader.onload = () => {
    //   const dataUrl = reader.result; // Full base64 data URL like "data:image/jpeg;base64,..."
    //   console.log("urlllll", dataUrl);
    //   setPreviewImage(dataUrl); // Show in Modal
    //   setProfilePicture(dataUrl.split(",")[1]); // Store Base64 content only
    //   setPreviewOpen(true);
    // };
  };

  const handleRemoveProfile = (fileToRemove) => {
    const newFileList = profilePictureArray.filter(
      (file) => file.uid !== fileToRemove.uid
    );
    setProfilePictureArray(newFileList);
    // CommonToaster("Profile removed");
  };

  return (
    <div className="login_mainContainer">
      <div className="login_card">
        <div className="logincard_innerContainer" style={{ marginTop: "40px" }}>
          <div className="trainer_registration_logoContainer">
            <div style={{ height: "100%" }}>
              <img src={Logo} className="login_logo" />
              <p
                className="trainer_registration_logotext"
                style={{ color: "#1b538c" }}
              >
                Technologies
              </p>

              {/* <p className="trainer_registration_heading">
                Trainer Registration Form
              </p> */}
            </div>
            <div>
              <p className="trainer_registration_heading">
                Trainer Registration Form
              </p>
            </div>
            <Upload
              listType="picture-circle"
              fileList={profilePictureArray}
              onPreview={handlePreview}
              onChange={handleProfileAttachment}
              onRemove={(file) => handleRemoveProfile(file)}
              beforeUpload={() => false} // prevent auto upload
              style={{ width: 90, height: 90 }} // reduce size
            >
              {profilePictureArray.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8, fontSize: "12px" }}>
                    Upload <br /> Profile
                  </div>
                </div>
              )}
            </Upload>
          </div>
        </div>

        <Tabs
          defaultActiveKey="1"
          items={tabItems}
          className="trainer_registration_tabs"
        />

        {/* <Divider className="trainer_registration_dividers" /> */}
      </div>

      <Modal
        title="Create Signature"
        open={isOpenSignatureModal}
        onCancel={() => setIsOpenSignatureModal(false)}
        footer={false}
        width="40%"
      >
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 120,
            className: "sigCanvas",
            // style: { border: "1px solid gray" },
          }}
        />
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            className="trainer_signature_clearbutton"
            onClick={clearSignature}
            style={{ marginRight: "10px" }}
          >
            Clear
          </Button>
          <Button
            className="trainer_signature_downloadbutton"
            onClick={saveSignature}
          >
            Download PNG
          </Button>
        </div>
      </Modal>
    </div>
  );
}
