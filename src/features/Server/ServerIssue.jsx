import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Input, Collapse } from "antd";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
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
    const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
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
            "Something went wrong. Try again later",
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
          {serverDetails && serverDetails.trans_details.length >= 1 ? (
            <div style={{ marginTop: "12px", marginBottom: "20px" }}>
              <Collapse
                activeKey={collapseDefaultKey}
                onChange={(keys) => setCollapseDefaultKey(keys)}
                className="assesmntresult_collapse"
              >
                {serverDetails.trans_details.map((item, index) => (
                  <Collapse.Panel
                    key={index + 1} // unique key
                    header={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          fontSize: "13px",
                          alignItems: "center",
                        }}
                      >
                        <span>
                          Server Details
                          {/* <span style={{ fontWeight: "500" }}>
                                {moment(item.invoice_date).format("DD/MM/YYYY")}
                              </span> */}
                        </span>

                        {item.approval_status === "Pending" ? (
                          <div className="customer_trans_statustext_container">
                            <PiClockCounterClockwiseBold
                              size={14}
                              color="gray"
                            />
                            <p
                              style={{
                                color: "gray",
                                fontWeight: 500,
                                fontSize: "12px",
                              }}
                            >
                              Waiting for Approval
                            </p>
                          </div>
                        ) : item.approval_status === "Rejected" ? (
                          <div className="customer_trans_statustext_container">
                            <FaRegCircleXmark color="#d32f2f" size={12} />
                            <p
                              style={{
                                color: "#d32f2f",
                                fontWeight: 500,
                                fontSize: "12px",
                              }}
                            >
                              Rejected
                            </p>
                          </div>
                        ) : (
                          <div className="customer_trans_statustext_container">
                            <BsPatchCheckFill color="#3c9111" size={12} />
                            <p
                              style={{
                                color: "#3c9111",
                                fontWeight: 500,
                                fontSize: "12px",
                              }}
                            >
                              Approved
                            </p>
                          </div>
                        )}
                      </div>
                    }
                  >
                    <div>
                      <div style={{ padding: "0px 12px" }}>
                        <table className="transaction-details-table">
                          <tbody>
                            <tr>
                              <td>Course Fees</td>
                              <td className="text-right">
                                {serverDetails.primary_fees}
                              </td>
                            </tr>

                            <tr>
                              <td>Course Fees + GST(18%)</td>
                              <td className="text-right">
                                {serverDetails.total_course_amount}
                              </td>
                            </tr>

                            <tr>
                              <td>Server Cost</td>
                              <td className="text-right">{item.server_cost}</td>
                            </tr>

                            <tr>
                              <td>Duration</td>
                              <td className="text-right">
                                {item?.server_trans_duration
                                  ? `${item.server_trans_duration} Days`
                                  : "-"}
                              </td>
                            </tr>

                            <tr>
                              <td>Vendor</td>
                              <td className="text-right">{item.vendor_id}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Collapse.Panel>
                ))}
              </Collapse>
            </div>
          ) : (
            <p className="customer_trainerhistory_nodatatext">No Data found</p>
          )}

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
  },
);

export default ServerIssue;
