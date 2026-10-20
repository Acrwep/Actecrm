import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Row, Col } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import { LuIndianRupee } from "react-icons/lu";
import {
  inserCustomerTrack,
  serverRePurchase,
  updateServerDetails,
  updateServerStatus,
} from "../ApiService/action";
import { formatToBackendIST, selectValidator } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import ServerTransCollapse from "./ServerTransCollapse";

const ServerUpdateDetails = forwardRef(
  (
    { serverDetails, drawerStatus, setButtonLoading, callgetServerApi },
    ref,
  ) => {
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
        created_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
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

          <ServerTransCollapse serverDetails={serverDetails} />

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
