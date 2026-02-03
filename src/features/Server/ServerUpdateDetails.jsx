import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Collapse } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { LuIndianRupee } from "react-icons/lu";
import {
  insertServerTrack,
  updateServerDetails,
  updateServerStatus,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import moment from "moment";

const ServerUpdateDetails = forwardRef(
  (
    { serverDetails, setButtonLoading, verifyHistory, callgetServerApi },
    ref,
  ) => {
    const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
    const [vendorName, setVendorName] = useState("");
    const [vendorNameError, setVendorNameError] = useState("");
    const [serverCost, setServerCost] = useState();
    const [serverCostError, setServerCostError] = useState("");
    const [serverDuration, setServerDuration] = useState(null);
    const [serverDurationError, setServerDurationError] = useState("");
    const [validationTrigger, setValidationTrigger] = useState(false);

    useImperativeHandle(ref, () => ({
      handleUpdateDetails,
    }));

    const handleUpdateDetails = async () => {
      setValidationTrigger(true);
      const vendorNameValidate = selectValidator(vendorName);
      const costValidate = selectValidator(serverCost);
      const durationValidate = selectValidator(serverDuration);

      setVendorNameError(vendorNameValidate);
      setServerCostError(costValidate);
      setServerDurationError(durationValidate);

      if (vendorNameValidate || costValidate || durationValidate) return;

      setButtonLoading(true);

      const payload = {
        vendor_id: vendorName,
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        server_cost: serverCost,
        duration: serverDuration,
      };

      try {
        await updateServerDetails(payload);
        setTimeout(() => {
          CommonMessage("success", "Updated");
          handleServerStatus();
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

    const handleServerStatus = async () => {
      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        server_raise_date:
          serverDetails && serverDetails.server_raise_date
            ? serverDetails.server_raise_date
            : null,
        status: "Awaiting Verify",
      };
      try {
        await updateServerStatus(payload);
        setTimeout(() => {
          handleServerTrack();
          callgetServerApi();
        }, 300);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleServerTrack = async () => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const updateDetailsPayload = {
        vendor_name: vendorName,
        server_name:
          serverDetails && serverDetails.server_name
            ? serverDetails.server_name
            : null,
        server_cost: serverCost,
        server_duration: serverDuration,
      };

      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        status: "Details Updated",
        status_date: formatToBackendIST(today),
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        details: updateDetailsPayload,
      };
      try {
        await insertServerTrack(payload);
        handleSecondServerTrack("Awaiting Verify");
      } catch (error) {
        console.log("server track error", error);
      }
    };

    const handleSecondServerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const payload = {
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        status: updatestatus,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(today),
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
            Previous History
          </p>

          <>
            {verifyHistory.length >= 1 ? (
              <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                <Collapse
                  className="assesmntresult_collapse"
                  activeKey={collapseDefaultKey}
                  onChange={(keys) => {
                    setCollapseDefaultKey(keys);
                  }}
                >
                  {verifyHistory.map((item, index) => (
                    <Collapse.Panel
                      key={index + 1}
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
                            Date -{" "}
                            <span style={{ fontWeight: "500" }}>
                              {item.rejected_date
                                ? moment(item.rejected_date).format(
                                    "DD/MM/YYYY",
                                  )
                                : "-"}
                            </span>
                          </span>
                          {item.status.includes("Rejected") ? (
                            <div className="customer_trans_statustext_container">
                              <FaRegCircleXmark color="#d32f2f" />
                              <p
                                style={{
                                  color: "#d32f2f",
                                  fontWeight: 500,
                                }}
                              >
                                {item.status}
                              </p>
                            </div>
                          ) : (
                            <div className="customer_trans_statustext_container">
                              <BsPatchCheckFill color="#3c9111" />
                              <p
                                style={{
                                  color: "#3c9111",
                                  fontWeight: 500,
                                }}
                              >
                                {item.status}
                              </p>
                            </div>
                          )}
                        </div>
                      }
                    >
                      <div>
                        <Row
                          gutter={16}
                          style={{
                            marginTop: "6px",
                            marginBottom: "8px",
                          }}
                        >
                          <Col span={12}>
                            <Row>
                              <Col span={12}>
                                <div className="customerdetails_rowheadingContainer">
                                  <p className="customerdetails_rowheading">
                                    Rejected By
                                  </p>
                                </div>
                              </Col>
                              <Col span={12}>
                                <p className="customerdetails_text">
                                  {item.rejected_by ? item.rejected_by : "-"}
                                </p>
                              </Col>
                            </Row>
                          </Col>
                          <Col span={12}>
                            <Row>
                              <Col span={12}>
                                <div className="customerdetails_rowheadingContainer">
                                  <p className="customerdetails_rowheading">
                                    Reason for Rejection
                                  </p>
                                </div>
                              </Col>
                              <Col span={12}>
                                <p className="customerdetails_text">
                                  {item.comments}
                                </p>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </div>
                    </Collapse.Panel>
                  ))}
                </Collapse>
              </div>
            ) : (
              <p className="customer_trainerhistory_nodatatext">
                No Data found
              </p>
            )}
          </>

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
                label="Vendor"
                required={true}
                onChange={(e) => {
                  setVendorName(e.target.value);
                  if (validationTrigger) {
                    setVendorNameError(selectValidator(e.target.value));
                  }
                }}
                value={vendorName}
                error={vendorNameError}
              />
            </Col>
            <Col span={8}>
              <CommonOutlinedInput
                label="Server Cost"
                type="number"
                required={true}
                onChange={(e) => {
                  setServerCost(e.target.value);
                  if (validationTrigger) {
                    setServerCostError(selectValidator(e.target.value));
                  }
                }}
                value={serverCost}
                error={serverCostError}
                onInput={(e) => {
                  if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                  }
                }}
                icon={<LuIndianRupee size={16} />}
              />{" "}
            </Col>
          </Row>

          <Row
            gutter={16}
            style={{
              marginTop: "22px",
              marginBottom: "40px",
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
                onChange={(e) => {
                  setServerDuration(e.target.value);
                  if (validationTrigger) {
                    setServerDurationError(selectValidator(e.target.value));
                  }
                }}
                value={serverDuration}
                error={serverDurationError}
              />
            </Col>
          </Row>
        </>
      </div>
    );
  },
);

export default ServerUpdateDetails;
