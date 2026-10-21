import React, { useState } from "react";
import { Row, Col, Divider } from "antd";
import ServerTransCollapse from "./ServerTransCollapse";
import CommonSpinner from "../Common/CommonSpinner";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonSelectField from "../Common/CommonSelectField";
import { formatToBackendIST, selectValidator } from "../Common/Validation";
import CommonInputField from "../Common/CommonInputField";
import { inserCustomerTrack, serverPurchased } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";

export default function ServerPurchase({
  serverDetails,
  customerDetails,
  callgetServerApi,
}) {
  //details states
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentDateError, setPaymentDateError] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentModeError, setPaymentModeError] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [transactionIdError, setTransactionIdError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState("");
  //loading usestates
  const [buttonLoading, setButtonLoading] = useState(false);

  const handlePurchase = async () => {
    setValidationTrigger(true);
    // setCurrentIndex(0);
    // setIsModalOpen(true);

    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const paymentDateValidate = selectValidator(paymentDate);
    const paymentModeValidate = selectValidator(paymentMode);
    const transactionIdValidate = selectValidator(transactionId);

    setPaymentDateError(paymentDateValidate);
    setPaymentModeError(paymentModeValidate);
    setTransactionIdError(transactionIdValidate);

    if (paymentDateValidate || paymentModeValidate || transactionIdValidate)
      return;

    setButtonLoading(true);

    const payload = {
      server_id: serverDetails && serverDetails.id ? serverDetails.id : null,
      paid_date: formatToBackendIST(paymentDate),
      paid_by: convertAsJson?.user_id,
      transaction_id: transactionId,
      payment_mode: paymentMode,
    };
    try {
      await serverPurchased(payload);
      CommonMessage("success", "Server Purchased Successfully");

      setButtonLoading(false);
      handleCustomerTrack("Server Purchased");
      callgetServerApi();
    } catch (error) {
      setButtonLoading(false);
      console.log("move to paid error", error);
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

    const payload = {
      customers: [
        {
          customer_id: serverDetails.customer_id,
          status: updatestatus,
          updated_by:
            converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
          status_date: formatToBackendIST(new Date()),
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
      <div style={{ padding: "1px 24px 0px 24px" }}>
        <ServerTransCollapse serverDetails={serverDetails} />
      </div>
      <Divider className="customer_statusupdate_divider" />

      <div style={{ padding: "1px 24px" }}>
        <p
          style={{
            fontWeight: 600,
            color: "#333",
            fontSize: "14px",
          }}
        >
          Add Payment Details
        </p>

        <Row gutter={12} style={{ marginTop: "12px", marginBottom: "40px" }}>
          <Col span={8}>
            <CommonMuiDatePicker
              label={"Payment Date"}
              required={true}
              onChange={(value) => {
                setPaymentDate(value);
                if (validationTrigger) {
                  setPaymentDateError(selectValidator(value));
                }
              }}
              value={paymentDate}
              error={paymentDateError}
              height={"34px"}
              labelFontSize={"11px"}
              labelMarginTop={"0px"}
              errorFontSize={"9px"}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label={"Payment Mode"}
              required={true}
              options={[
                { id: "Bank - NEFT/IMPS", name: "Bank - NEFT/IMPS" },
                { id: "UPI", name: "UPI" },
              ]}
              onChange={(e) => {
                setPaymentMode(e.target.value);
                if (validationTrigger) {
                  setPaymentModeError(selectValidator(e.target.value));
                }
              }}
              value={paymentMode}
              error={paymentModeError}
              height={"34px"}
              labelFontSize={"11px"}
              labelMarginTop={"0px"}
              errorFontSize={"9px"}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label={"Reference Id"}
              required={true}
              onChange={(e) => {
                setTransactionId(e.target.value);
                if (validationTrigger) {
                  setTransactionIdError(selectValidator(e.target.value));
                }
              }}
              value={transactionId}
              error={transactionIdError}
              height={"34px"}
              labelFontSize={"11px"}
              labelMarginTop={"0px"}
              errorFontSize={"9px"}
              disableAutoCapitalize={true}
            />
          </Col>
        </Row>
      </div>

      <div className="leadmanager_tablefiler_footer">
        <div
          className="leadmanager_submitlead_buttoncontainer"
          style={{ gap: "12px" }}
        >
          <>
            {buttonLoading ? (
              <button className={"users_adddrawer_loadingcreatebutton"}>
                <CommonSpinner />
              </button>
            ) : (
              <button
                className={"users_adddrawer_createbutton"}
                onClick={handlePurchase}
              >
                Purchase
              </button>
            )}
          </>
        </div>
      </div>
    </div>
  );
}
