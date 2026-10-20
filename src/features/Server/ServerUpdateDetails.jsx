import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Row, Col, Collapse, Button, Divider } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { LuIndianRupee } from "react-icons/lu";
import {
  inserCustomerTrack,
  insertServerTrack,
  serverRePurchase,
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
    { serverDetails, drawerStatus, setButtonLoading, callgetServerApi },
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

    // useEffect(() => {
    //   setServerDuration(serverDetails?.requested_duration || null);
    // }, []);

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

      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const payload = {
        vendor_id: vendorName,
        server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
        ...(serverDetails.status === "Approval Rejected" && {
          server_trans_id:
            serverDetails?.trans_details?.[0]?.server_trans_id || null,
        }),
        server_cost: serverCost,
        duration: serverDuration,
        email: serverDetails.email,
        email_link: `${
          import.meta.env.VITE_EMAIL_URL
        }/acknowledge-server-request`,
        status_date: formatToBackendIST(new Date()),
        ...(drawerStatus === "Re-Purchase"
          ? {
              created_by:
                converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
            }
          : {
              updated_by:
                converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
            }),
      };

      try {
        if (drawerStatus === "Re-Purchase") {
          await serverRePurchase(payload);
        } else {
          await updateServerDetails(payload);
        }
        setTimeout(() => {
          CommonMessage("success", "Server Details Updated");
          if (drawerStatus === "Re-Purchase") {
            handleCustomerTrack("Server Re-Purchased");
            callgetServerApi();
            return;
          }

          if (serverDetails.status === "Approval Rejected") {
            handleCustomerTrack("Server Details Updated");
            callgetServerApi();
          } else {
            handleServerStatus();
          }
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

    const handleCustomerTrack = async (updatestatus) => {
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const changedFields = {};

      changedFields["vendor"] = {
        previous_value: serverDetails.trans_details?.[0]?.vendor_id ?? null,
        new_value: vendorName,
      };

      changedFields["server_cost"] = {
        previous_value: serverDetails.trans_details?.[0]?.server_cost ?? null,
        new_value: serverCost,
      };

      changedFields["server_duration"] = {
        previous_value:
          serverDetails.trans_details?.[0]?.server_trans_duration ?? null,
        new_value: serverDuration,
      };

      const payload = {
        customers: [
          {
            customer_id: serverDetails.customer_id,
            status: updatestatus,
            updated_by:
              converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
            status_date: formatToBackendIST(new Date()),
            details: changedFields,
          },
        ],
      };
      try {
        await inserCustomerTrack(payload);
      } catch (error) {
        console.log("server track error", error);
      } finally {
      }
    };

    return (
      <div>
        <>
          <p className="customer_statusupdate_adddetails_heading">
            Previous History
          </p>

          <>
            {serverDetails.trans_details.length >= 1 ? (
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
                                <td className="text-right">
                                  {item.server_cost}
                                </td>
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

                        {item.approval_status === "Rejected" &&
                        item.comments ? (
                          <>
                            <Divider className="customer_statusupdate_divider" />
                            <div style={{ padding: "0px 52px" }}>
                              <Row>
                                <Col span={24}>
                                  <Row>
                                    <Col span={9}>
                                      <div className="customerdetails_rowheadingContainer">
                                        <p
                                          className="customerdetails_rowheading"
                                          style={{ color: "#d32f2f" }}
                                        >
                                          Rejection Reason:
                                        </p>
                                      </div>
                                    </Col>
                                    <Col span={15}>
                                      <p className="customerdetails_text">
                                        {item.comments}
                                      </p>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </div>
                          </>
                        ) : (
                          ""
                        )}

                        {item.approval_status === "Pending" && (
                          <div className="customer_finance_verify_buttons_container">
                            <Button
                              className="customer_finance_rejectbutton"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprovalReject();
                              }}
                            >
                              Reject
                            </Button>

                            <Button
                              className="customer_finance_verifybutton"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpenApproveModal(true);
                              }}
                            >
                              Approve
                            </Button>
                          </div>
                        )}
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
                label="Request Duration"
                required={true}
                disabled={true}
                value={
                  serverDetails && serverDetails.requested_duration
                    ? serverDetails.requested_duration + " Days"
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
          </Row>

          <Row
            gutter={16}
            style={{
              marginTop: "22px",
              marginBottom: "40px",
            }}
          >
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
                // disabled={true}
              />
            </Col>
          </Row>
        </>
      </div>
    );
  },
);

export default ServerUpdateDetails;
