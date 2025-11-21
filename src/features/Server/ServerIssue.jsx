import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Input } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import { LuIndianRupee } from "react-icons/lu";
import { insertServerTrack, serverIssue } from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import "./styles.css";

const ServerIssue = forwardRef(
  ({ serverDetails, setButtonLoading, callgetServerApi }, ref) => {
    const [subject, setSubject] = useState("");
    const [emailContent, setEmailContent] = useState("");

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
      const subjectValidate = addressValidator(subject);
      const contentValidate = selectValidator(emailContent);

      if (subjectValidate) {
        CommonMessage("error", "Subject is required");
        return;
      } else if (contentValidate) {
        CommonMessage("error", "Email Content is required");
        return;
      }

      setButtonLoading(true);

      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        email_subject: subject,
        email_content: emailContent,
      };
      try {
        await serverIssue(payload);
        setTimeout(() => {
          CommonMessage("success", "Server Issued");
          callgetServerApi();
          handleServerTrack();
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    };

    const handleServerTrack = async (trackStatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        status: "Server Issued",
        status_date: formatToBackendIST(today),
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      };
      try {
        await insertServerTrack(payload);
      } catch (error) {
        console.log("server track error", error);
      }
    };

    return (
      <div>
        <>
          <p className="customer_statusupdate_adddetails_heading">
            Add Details
          </p>
          <Row
            gutter={16}
            style={{
              marginTop: "14px",
            }}
          >
            <Col span={8}>
              <CommonInputField
                label="Server Name"
                required={true}
                disabled={true}
                value={
                  serverDetails && serverDetails.server_name
                    ? serverDetails.server_name
                    : "-"
                }
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Vendor Name"
                required={true}
                value={
                  serverDetails && serverDetails.vendor_id
                    ? serverDetails.vendor_id
                    : ""
                }
                disabled={true}
              />
            </Col>
            <Col span={8}>
              <CommonOutlinedInput
                label="Server Cost"
                type="number"
                required={true}
                value={
                  serverDetails && serverDetails.server_cost
                    ? serverDetails.server_cost
                    : ""
                }
                onInput={(e) => {
                  if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                  }
                }}
                icon={<LuIndianRupee size={16} />}
                disabled={true}
              />{" "}
            </Col>
          </Row>

          <Row
            gutter={16}
            style={{
              marginTop: "22px",
              marginBottom: "20px",
            }}
          >
            <Col span={8}>
              <CommonSelectField
                required={true}
                label="Duration"
                options={[
                  { id: 30, name: "30 Days" },
                  { id: 60, name: "60 Days" },
                  { id: 90, name: "90 Days" },
                ]}
                value={
                  serverDetails && serverDetails.duration
                    ? serverDetails.duration
                    : null
                }
                disabled={true}
              />
            </Col>
          </Row>

          <div className="server_email_conatiner">
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
        </>
      </div>
    );
  }
);

export default ServerIssue;
